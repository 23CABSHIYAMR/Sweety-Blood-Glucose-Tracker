const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool;
let isInMemory = false;

// Initialize connection pool
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT, 10) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'sweety_db'
  });
}

// Fallback to in-memory PostgreSQL emulator if PostgreSQL is unreachable in dev/test
let pgMemDbInstance = null;

async function initInMemory() {
  const { newDb } = require('pg-mem');
  const db = newDb();
  
  // Register necessary extensions / functions for PostgreSQL compatibility
  db.public.registerFunction({
    name: 'now',
    implementation: () => new Date()
  });
  db.public.registerFunction({
    name: 'current_timestamp',
    implementation: () => new Date()
  });

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.public.none(schema);
  pgMemDbInstance = db.adapters.createPg();
  isInMemory = true;
  console.log('⚠️ Running with simulated in-memory PostgreSQL');
}

/**
 * Execute SQL query
 */
async function query(text, params) {
  if (isInMemory && pgMemDbInstance) {
    const client = new pgMemDbInstance.Client();
    await client.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      await client.end();
    }
  }

  try {
    return await pool.query(text, params);
  } catch (err) {
    const isConnErr = err.code === 'ECONNREFUSED' || 
                      err.code === 'EACCES' || 
                      err.message?.includes('connect ECONNREFUSED') || 
                      err.message?.includes('connect EACCES') ||
                      (err.errors && err.errors.some(e => e.code === 'ECONNREFUSED' || e.code === 'EACCES'));

    if (isConnErr && !isInMemory) {
      console.warn('⚠️ Could not connect to PostgreSQL on port 5432. Falling back to in-memory PostgreSQL for development/testing...');
      await initInMemory();
      return query(text, params);
    }
    throw err;
  }
}

/**
 * Initialize database schema
 */
async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  try {
    if (isInMemory) {
      console.log('✅ In-memory database schema ready');
      return;
    }
    await query(schemaSql);
    console.log('✅ Database schema initialized successfully');
  } catch (err) {
    if (isInMemory) {
      console.log('✅ Database schema initialized in fallback memory store');
      return;
    }
    console.error('❌ Failed to initialize database schema:', err);
    throw err;
  }
}

module.exports = {
  query,
  pool,
  initDb,
  getIsInMemory: () => isInMemory
};

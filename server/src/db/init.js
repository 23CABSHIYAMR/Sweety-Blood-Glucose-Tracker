const { initDb, pool } = require('./index');

async function run() {
  try {
    console.log('🔄 Initializing Sweety database...');
    await initDb();
    console.log('🎉 Database initialization complete!');
    if (pool) {
      await pool.end();
    }
    process.exit(0);
  } catch (err) {
    console.error('Initialization failed:', err);
    process.exit(1);
  }
}

run();

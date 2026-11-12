const express = require('express');
const router = express.Router();
const reportController = require('./reportController');
const { authenticateToken } = require('../../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/', reportController.getReports);

module.exports = router;


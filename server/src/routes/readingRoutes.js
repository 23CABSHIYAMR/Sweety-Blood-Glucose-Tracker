const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All reading routes require authentication
router.use(authenticateToken);

router.get('/', readingController.getReadings);
router.get('/:id', readingController.getReadingById);
router.post('/', readingController.createReading);
router.put('/:id', readingController.updateReading);
router.delete('/:id', readingController.deleteReading);

module.exports = router;

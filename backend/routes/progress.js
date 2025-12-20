const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProgress,
  getCertificate,
  getStudentStats
} = require('../controllers/progressController');

// Progress routes
router.get('/enrollments/:id/progress', protect, getProgress);
router.get('/enrollments/:id/certificate', protect, getCertificate);
router.get('/stats', protect, authorize('student'), getStudentStats);

module.exports = router;

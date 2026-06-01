const express = require('express');
const { protect } = require('../middleware/auth');
const { downloadCertificate } = require('../controllers/certificateController');

const router = express.Router();

// GET /api/certificates/:courseId
// Auth-protected. Streams a PDF certificate for the authenticated student
// if they have completed the given course.
router.get('/:courseId', protect, downloadCertificate);

module.exports = router;

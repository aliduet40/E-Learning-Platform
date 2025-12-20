const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getStudentDashboard,
    getInstructorDashboard,
    getAdminDashboard
} = require('../controllers/dashboardController');

router.get('/student', protect, authorize('student'), getStudentDashboard);
router.get('/instructor', protect, authorize('instructor'), getInstructorDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getStudentDashboard,
    getInstructorDashboard,
    getInstructorStudents,
    streamInstructorStudents,
    getAdminDashboard
} = require('../controllers/dashboardController');

router.get('/student', protect, authorize('student'), getStudentDashboard);
router.get('/instructor', protect, authorize('instructor'), getInstructorDashboard);
router.get('/instructor/students', protect, authorize('instructor'), getInstructorStudents);
router.get('/instructor/students/stream', protect, authorize('instructor'), streamInstructorStudents);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;

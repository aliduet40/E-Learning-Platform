const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/error');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
  completeLesson,
  addResource
} = require('../controllers/curriculumController');

// Validation rules
const lessonValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content_type').isIn(['video', 'text', 'quiz', 'assignment']).withMessage('Invalid content type'),
  body('order_index').isInt().withMessage('Order index must be an integer')
];

// Lesson routes
router.post('/sections/:id/lessons', protect, authorize('instructor', 'admin'), lessonValidation, validate, createLesson);
router.get('/:id', protect, getLesson);
router.put('/:id', protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteLesson);
router.post('/:id/complete', protect, authorize('student'), completeLesson);
router.post('/:id/resources', protect, authorize('instructor', 'admin'), upload.single('resource'), addResource);

module.exports = router;

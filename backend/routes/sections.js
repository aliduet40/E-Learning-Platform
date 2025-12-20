const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/error');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/curriculumController');

// Validation rules
const sectionValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('order_index').isInt().withMessage('Order index must be an integer')
];

// Section routes
router.post('/courses/:id/sections', protect, authorize('instructor', 'admin'), sectionValidation, validate, createSection);
router.put('/:id', protect, authorize('instructor', 'admin'), updateSection);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteSection);

module.exports = router;

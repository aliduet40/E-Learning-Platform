const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/error');
const { protect, authorize } = require('../middleware/auth');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Validation rules
const categoryValidation = [
  body('name').notEmpty().withMessage('Name is required')
];

// Category routes
router.get('/', getCategories);
router.post('/', protect, authorize('admin'), categoryValidation, validate, createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;

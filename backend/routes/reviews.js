const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/error');
const { protect, authorize } = require('../middleware/auth');
const {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  markHelpful
} = require('../controllers/reviewController');

// Validation rules
const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString()
];

// Review routes
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id', protect, createReview);

module.exports = router;

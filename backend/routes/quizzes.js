const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/error');
const { protect, authorize } = require('../middleware/auth');
const {
  createQuiz,
  getQuiz,
  startQuizAttempt,
  submitQuiz,
  getQuizResults,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');

// Validation rules
const quizValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('passing_score').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0-100'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
];

const submitValidation = [
  body('attempt_id').isInt().withMessage('Valid attempt ID is required'),
  body('answers').isArray({ min: 1 }).withMessage('Answers are required')
];

// Quiz routes
router.post('/lessons/:id/quiz', protect, authorize('instructor', 'admin'), quizValidation, validate, createQuiz);
router.get('/:id', protect, getQuiz);
router.post('/:id/attempt', protect, authorize('student'), startQuizAttempt);
router.post('/:id/submit', protect, authorize('student'), submitValidation, validate, submitQuiz);
router.get('/:id/results', protect, getQuizResults);
router.put('/:id', protect, authorize('instructor', 'admin'), updateQuiz);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteQuiz);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/error');
const { protect, authorize, isCourseInstructor } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getCourseCurriculum,
  getMyCourses,
  getMyTeaching
} = require('../controllers/courseController');
const { getCourseReviews, createReview } = require('../controllers/reviewController');

// Validation rules
const courseValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category_id').isInt().withMessage('Valid category is required'),
  body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

// Routes
router.get('/', getCourses);
router.get('/my-courses', protect, authorize('student'), getMyCourses);
router.get('/my-teaching', protect, authorize('instructor', 'admin'), getMyTeaching);
router.get('/:id', getCourse);
router.post('/', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), courseValidation, validate, createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), isCourseInstructor, upload.single('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), isCourseInstructor, deleteCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.get('/:id/curriculum', getCourseCurriculum);
router.get('/:id/lessons', getCourseCurriculum);
router.get('/:id/reviews', getCourseReviews);
router.post('/:id/reviews', protect, authorize('student'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString()
], validate, createReview);

module.exports = router;

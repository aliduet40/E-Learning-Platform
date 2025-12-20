const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const result = await pool.query(
        'SELECT id, email, full_name, role, bio, avatar, is_verified FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = result.rows[0];
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is instructor of the course
exports.isCourseInstructor = async (req, res, next) => {
  try {
    const courseId = req.params.id || req.params.courseId;
    
    const result = await pool.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (result.rows[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this course'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check if user is enrolled in course
exports.isEnrolled = async (req, res, next) => {
  try {
    const courseId = req.params.id || req.params.courseId;
    
    const result = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course'
      });
    }

    req.enrollmentId = result.rows[0].id;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

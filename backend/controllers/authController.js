const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role, bio } = req.body;
    const emailLower = email.toLowerCase();

    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [emailLower]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, role, bio) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name, role, bio, created_at`,
      [emailLower, hashedPassword, full_name, role || 'student', bio || null]
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        user,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();

    // Check for user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [emailLower]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      data: {
        user,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, bio, avatar, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, bio } = req.body;
    let avatar = req.user.avatar;

    // Handle avatar upload
    if (req.file) {
      avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE users 
       SET full_name = $1, bio = $2, avatar = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, full_name, role, bio, avatar, is_verified`,
      [full_name, bio, avatar, req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user dashboard data
// @route   GET /api/auth/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      // Student dashboard
      const enrollments = await pool.query(
        `SELECT 
          e.id, e.progress, e.enrolled_at,
          c.id as course_id, c.title, c.thumbnail, c.instructor_id,
          u.full_name as instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.instructor_id = u.id
        WHERE e.student_id = $1
        ORDER BY e.enrolled_at DESC`,
        [req.user.id]
      );

      const stats = await pool.query(
        `SELECT 
          COUNT(*) as total_courses,
          COALESCE(AVG(progress), 0) as avg_progress,
          COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_courses
        FROM enrollments
        WHERE student_id = $1`,
        [req.user.id]
      );

      res.json({
        success: true,
        data: {
          enrollments: enrollments.rows,
          stats: stats.rows[0]
        }
      });
    } else if (req.user.role === 'instructor') {
      // Instructor dashboard
      const courses = await pool.query(
        `SELECT 
          c.*,
          cat.name as category_name,
          COUNT(DISTINCT e.id) as enrollment_count
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE c.instructor_id = $1
        GROUP BY c.id, cat.name
        ORDER BY c.created_at DESC`,
        [req.user.id]
      );

      const stats = await pool.query(
        `SELECT 
          COUNT(DISTINCT c.id) as total_courses,
          COUNT(DISTINCT e.id) as total_students,
          COALESCE(AVG(c.average_rating), 0) as avg_rating
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE c.instructor_id = $1`,
        [req.user.id]
      );

      res.json({
        success: true,
        data: {
          courses: courses.rows,
          stats: stats.rows[0]
        }
      });
    } else {
      res.json({
        success: true,
        data: { message: 'Admin dashboard' }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

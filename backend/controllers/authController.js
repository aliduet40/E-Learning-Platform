const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const nodemailer = require('nodemailer');
const tokenBlacklist = require('../utils/tokenBlacklist');
const { uploadAvatarToCloudinary } = require('../utils/cloudinary');

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

    // If an avatar file was uploaded by multer, push it to Cloudinary and
    // record the URL. The local temp file is deleted inside the helper.
    let cloudinaryAvatarUrl = null;
    if (req.file) {
      try {
        const uploaded = await uploadAvatarToCloudinary(req.file.path);
        cloudinaryAvatarUrl = uploaded.url;
      } catch (err) {
        console.error('Avatar upload during signup failed:', err);
        // Don't block signup if the optional avatar fails to upload.
      }
    }

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, role, bio, avatar, cloudinary_avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, full_name, role, bio, avatar, cloudinary_avatar_url, created_at`,
      [emailLower, hashedPassword, full_name, role || 'student', bio || null, cloudinaryAvatarUrl, cloudinaryAvatarUrl]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    // Save token to user
    await pool.query(
      'UPDATE users SET token = $1 WHERE id = $2',
      [token, user.id]
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    })


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

// @desc    Logout user — revoke the JWT so it can't be replayed.
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const token = req.token;
    if (token) {
      // jwt.decode is safe here — protect() already verified the signature.
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        tokenBlacklist.add(token, decoded.exp);
      }
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, bio, avatar, cloudinary_avatar_url, is_verified, created_at FROM users WHERE id = $1',
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
    let cloudinaryAvatarUrl = req.user.cloudinary_avatar_url || null;

    if (req.file) {
      try {
        const uploaded = await uploadAvatarToCloudinary(req.file.path);
        cloudinaryAvatarUrl = uploaded.url;
        avatar = uploaded.url;
      } catch (err) {
        console.error('Avatar upload failed:', err);
        return res.status(500).json({ success: false, message: 'Avatar upload failed. Please try again.' });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           bio = $2,
           avatar = $3,
           cloudinary_avatar_url = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, full_name, role, bio, avatar, cloudinary_avatar_url, is_verified, created_at`,
      [full_name || null, bio || null, avatar, cloudinaryAvatarUrl, req.user.id]
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

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    if (current_password === new_password) {
      return res.status(400).json({ success: false, message: 'New password must be different from the current password.' });
    }

    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(current_password, result.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(new_password, salt);

    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashed, req.user.id]
    );

    // Revoke the current token so the password change forces a fresh login on
    // other devices. The current session will get 401 on its next call and the
    // frontend will redirect to /login — that's intentional.
    if (req.token) {
      const decoded = jwt.decode(req.token);
      if (decoded && decoded.exp) tokenBlacklist.add(req.token, decoded.exp);
    }

    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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


// Forgot Password 
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email' });
  }

  try {
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userCheck.rows[0];

    // Generate Reset Token
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Create Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
                <h3>Password Reset Request</h3>
                <p>You requested to reset your password. Please click the link below to verify your identity and reset your password:</p>
                <a href="${resetLink}" target="_blank">${resetLink}</a>
                <p>This link will expire in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Password reset link sent to your email' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // 400 status code for bad request

  if (!password) {
    return res.status(400).json({ success: false, message: 'Please provide a new password' });
  }

  try {
    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update User Password
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, decoded.id]);

    res.status(200).json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Token expired' });
    }
    res.status(500).json({ success: false, message: 'Invalid token or Server error' });
  }
};
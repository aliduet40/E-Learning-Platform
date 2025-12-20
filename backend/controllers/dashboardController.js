const pool = require('../config/database');

// @desc    Get student dashboard stats
// @route   GET /api/dashboard/student
// @access  Private (Student)
exports.getStudentDashboard = async (req, res) => {
    try {
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
                stats: {
                    total_courses: parseInt(stats.rows[0].total_courses) || 0,
                    avg_progress: parseFloat(stats.rows[0].avg_progress) || 0,
                    completed_courses: parseInt(stats.rows[0].completed_courses) || 0
                }
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

// @desc    Get instructor dashboard stats
// @route   GET /api/dashboard/instructor
// @access  Private (Instructor)
exports.getInstructorDashboard = async (req, res) => {
    try {
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
                stats: {
                    total_courses: parseInt(stats.rows[0].total_courses) || 0,
                    total_students: parseInt(stats.rows[0].total_students) || 0,
                    avg_rating: parseFloat(stats.rows[0].avg_rating) || 0,
                    total_revenue: 0 // Placeholder for now
                }
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

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
    try {
        const statsQuery = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'instructor') as total_instructors,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM enrollments) as total_enrollments,
        (SELECT COALESCE(SUM(c.price), 0) FROM enrollments e JOIN courses c ON e.course_id = c.id) as total_revenue
    `);

        const recentUsers = await pool.query(`
      SELECT full_name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

        const recentCourses = await pool.query(`
      SELECT c.title, c.price, c.created_at, u.full_name as instructor_name
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

        const revenueHistory = await pool.query(`
      SELECT 
        DATE(e.enrolled_at) as date,
        SUM(c.price) as amount
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.enrolled_at > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(e.enrolled_at)
      ORDER BY DATE(e.enrolled_at) ASC
    `);

        res.json({
            success: true,
            data: {
                stats: {
                    total_students: parseInt(statsQuery.rows[0].total_students) || 0,
                    total_instructors: parseInt(statsQuery.rows[0].total_instructors) || 0,
                    total_courses: parseInt(statsQuery.rows[0].total_courses) || 0,
                    total_enrollments: parseInt(statsQuery.rows[0].total_enrollments) || 0,
                    total_revenue: parseFloat(statsQuery.rows[0].total_revenue) || 0
                },
                recent_users: recentUsers.rows,
                recent_courses: recentCourses.rows,
                revenue_history: revenueHistory.rows
            }
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

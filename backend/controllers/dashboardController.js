const pool = require('../config/database');
const sseHub = require('../utils/sseHub');

// Shared query so the GET endpoint, SSE snapshot, and broadcasts return the same shape.
async function fetchInstructorStudents(instructorId) {
    const result = await pool.query(
        `SELECT
            e.id AS enrollment_id,
            e.progress,
            e.enrolled_at,
            e.completed_at,
            u.id AS student_id,
            u.full_name AS student_name,
            u.email AS student_email,
            u.avatar AS student_avatar,
            c.id AS course_id,
            c.title AS course_title,
            c.thumbnail AS course_thumbnail,
            (
                SELECT COUNT(*)
                FROM lessons l
                JOIN sections s ON l.section_id = s.id
                WHERE s.course_id = c.id
            ) AS total_lessons,
            (
                SELECT COUNT(*)
                FROM lesson_progress lp
                WHERE lp.enrollment_id = e.id AND lp.completed = true
            ) AS completed_lessons
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON e.student_id = u.id
        WHERE c.instructor_id = $1
        ORDER BY e.enrolled_at DESC`,
        [instructorId]
    );

    return result.rows.map(row => ({
        ...row,
        total_lessons: parseInt(row.total_lessons) || 0,
        completed_lessons: parseInt(row.completed_lessons) || 0,
        progress: parseInt(row.progress) || 0
    }));
}

// Push fresh snapshot to all active SSE clients for this instructor.
async function broadcastInstructorStudents(instructorId) {
    if (!instructorId) return;
    if (sseHub.clientCount(instructorId) === 0) return;
    try {
        const data = await fetchInstructorStudents(instructorId);
        sseHub.broadcast(instructorId, 'students', data);
    } catch (err) {
        console.error('SSE broadcast error:', err);
    }
}

exports.broadcastInstructorStudents = broadcastInstructorStudents;

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

// @desc    Get students enrolled in the logged-in instructor's courses
// @route   GET /api/dashboard/instructor/students
// @access  Private (Instructor)
exports.getInstructorStudents = async (req, res) => {
    try {
        const data = await fetchInstructorStudents(req.user.id);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Instructor Students Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Stream students for the logged-in instructor via Server-Sent Events
// @route   GET /api/dashboard/instructor/students/stream
// @access  Private (Instructor)
exports.streamInstructorStudents = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Tell the client to wait 3s before retrying if connection drops.
    res.write('retry: 3000\n\n');

    // Initial snapshot — always emit so the client exits its loading state.
    try {
        const data = await fetchInstructorStudents(req.user.id);
        sseHub.send(res, 'students', data);
    } catch (err) {
        console.error('SSE initial snapshot error:', err);
        sseHub.send(res, 'students', []);
    }

    sseHub.subscribe(req.user.id, res);

    // Heartbeat every 25s so proxies don't time out the idle connection.
    const heartbeat = setInterval(() => {
        try { res.write(': ping\n\n'); } catch (e) { /* ignore */ }
    }, 25000);

    const cleanup = () => {
        clearInterval(heartbeat);
        sseHub.unsubscribe(req.user.id, res);
    };
    req.on('close', cleanup);
    req.on('aborted', cleanup);
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

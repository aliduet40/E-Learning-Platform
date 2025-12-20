const pool = require('../config/database');

// @desc    Get enrollment progress
// @route   GET /api/enrollments/:id/progress
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    const enrollmentId = req.params.id;

    // Get enrollment details
    const enrollment = await pool.query(
      `SELECT 
        e.*,
        c.title as course_title,
        c.total_lessons
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.id = $1 AND e.student_id = $2`,
      [enrollmentId, req.user.id]
    );

    if (enrollment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Get completed lessons
    const completedLessons = await pool.query(
      `SELECT 
        lp.*,
        l.title as lesson_title,
        s.title as section_title
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN sections s ON l.section_id = s.id
       WHERE lp.enrollment_id = $1 AND lp.completed = true
       ORDER BY lp.completed_at DESC`,
      [enrollmentId]
    );

    // Get quiz attempts
    const quizAttempts = await pool.query(
      `SELECT 
        qa.*,
        q.title as quiz_title
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.enrollment_id = $1
       ORDER BY qa.started_at DESC`,
      [enrollmentId]
    );

    // Get assignment submissions
    const assignments = await pool.query(
      `SELECT 
        asub.*,
        a.title as assignment_title,
        a.max_score
       FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       JOIN lessons l ON a.lesson_id = l.id
       JOIN sections s ON l.section_id = s.id
       WHERE asub.student_id = $1 AND s.course_id = (SELECT course_id FROM enrollments WHERE id = $2)
       ORDER BY asub.submitted_at DESC`,
      [req.user.id, enrollmentId]
    );

    res.json({
      success: true,
      data: {
        enrollment: enrollment.rows[0],
        completed_lessons: completedLessons.rows,
        quiz_attempts: quizAttempts.rows,
        assignments: assignments.rows
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

// @desc    Get certificate
// @route   GET /api/enrollments/:id/certificate
// @access  Private
exports.getCertificate = async (req, res) => {
  try {
    const enrollmentId = req.params.id;

    const enrollment = await pool.query(
      `SELECT 
        e.*,
        c.title as course_title,
        c.instructor_id,
        u.full_name as student_name,
        i.full_name as instructor_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON e.student_id = u.id
       JOIN users i ON c.instructor_id = i.id
       WHERE e.id = $1 AND e.student_id = $2`,
      [enrollmentId, req.user.id]
    );

    if (enrollment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.rows[0].progress < 100) {
      return res.status(400).json({
        success: false,
        message: 'Course not completed yet'
      });
    }

    // Generate certificate URL (in a real app, you'd generate a PDF)
    const certificateUrl = `/certificates/${enrollmentId}-${Date.now()}.pdf`;

    // Update enrollment with certificate URL if not already set
    if (!enrollment.rows[0].certificate_url) {
      await pool.query(
        'UPDATE enrollments SET certificate_url = $1 WHERE id = $2',
        [certificateUrl, enrollmentId]
      );
    }

    res.json({
      success: true,
      data: {
        certificate_url: enrollment.rows[0].certificate_url || certificateUrl,
        student_name: enrollment.rows[0].student_name,
        course_title: enrollment.rows[0].course_title,
        instructor_name: enrollment.rows[0].instructor_name,
        completed_at: enrollment.rows[0].completed_at,
        enrollment_id: enrollmentId
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

// @desc    Get student statistics
// @route   GET /api/progress/stats
// @access  Private (Student)
exports.getStudentStats = async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
        COUNT(DISTINCT e.id) as total_enrollments,
        COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.id END) as completed_courses,
        COALESCE(AVG(e.progress), 0)::INTEGER as avg_progress,
        COUNT(DISTINCT lp.id) as total_lessons_completed,
        COUNT(DISTINCT qa.id) as total_quizzes_taken,
        COALESCE(AVG(qa.percentage), 0)::DECIMAL(5,2) as avg_quiz_score
       FROM enrollments e
       LEFT JOIN lesson_progress lp ON e.id = lp.enrollment_id AND lp.completed = true
       LEFT JOIN quiz_attempts qa ON e.id = qa.enrollment_id AND qa.completed_at IS NOT NULL
       WHERE e.student_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

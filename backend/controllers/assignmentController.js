const pool = require('../config/database');

// @desc    Create assignment for lesson
// @route   POST /api/lessons/:id/assignment
// @access  Private (Instructor)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, due_date, max_score } = req.body;
    const lessonId = req.params.id;

    const result = await pool.query(
      `INSERT INTO assignments (lesson_id, title, description, due_date, max_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lessonId, title, description, due_date, max_score || 100]
    );

    res.status(201).json({
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

// @desc    Get assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, l.title as lesson_title, s.course_id
       FROM assignments a
       JOIN lessons l ON a.lesson_id = l.id
       JOIN sections s ON l.section_id = s.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const assignment = result.rows[0];

    // Get user's submission if exists
    const submission = await pool.query(
      'SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({
      success: true,
      data: {
        ...assignment,
        submission: submission.rows[0] || null
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

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
exports.submitAssignment = async (req, res) => {
  try {
    const { content } = req.body;
    const assignmentId = req.params.id;

    let file_url = null;
    if (req.file) {
      file_url = `/uploads/assignments/${req.file.filename}`;
    }

    const result = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, content, file_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET content = $3, file_url = $4, submitted_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [assignmentId, req.user.id, content, file_url]
    );

    res.status(201).json({
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

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Instructor)
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submissionId = req.params.id;

    const result = await pool.query(
      `UPDATE assignment_submissions 
       SET grade = $1, feedback = $2, graded_by = $3, graded_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [grade, feedback, req.user.id, submissionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

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

// @desc    Get all submissions for assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (Instructor)
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.*,
        u.full_name as student_name,
        u.email as student_email
       FROM assignment_submissions s
       JOIN users u ON s.student_id = u.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Instructor)
exports.updateAssignment = async (req, res) => {
  try {
    const { title, description, due_date, max_score } = req.body;

    const result = await pool.query(
      `UPDATE assignments 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           max_score = COALESCE($4, max_score)
       WHERE id = $5
       RETURNING *`,
      [title, description, due_date, max_score, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

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

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Instructor)
exports.deleteAssignment = async (req, res) => {
  try {
    await pool.query('DELETE FROM assignments WHERE id = $1', [req.params.id]);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const pool = require('../config/database');

// @desc    Create quiz for lesson
// @route   POST /api/lessons/:id/quiz
// @access  Private (Instructor)
exports.createQuiz = async (req, res) => {
  try {
    const { title, passing_score, time_limit, questions } = req.body;
    const lessonId = req.params.id;

    // Create quiz
    const quizResult = await pool.query(
      `INSERT INTO quizzes (lesson_id, title, passing_score, time_limit)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [lessonId, title, passing_score || 70, time_limit]
    );

    const quiz = quizResult.rows[0];

    // Add questions
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await pool.query(
          `INSERT INTO quiz_questions 
           (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, points, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [quiz.id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.points || 1, i]
        );
      }
    }

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res) => {
  try {
    const quizResult = await pool.query(
      `SELECT q.*, l.title as lesson_title, s.course_id
       FROM quizzes q
       JOIN lessons l ON q.lesson_id = l.id
       JOIN sections s ON l.section_id = s.id
       WHERE q.id = $1`,
      [req.params.id]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quiz = quizResult.rows[0];

    // Get questions (without correct answers for students)
    let questionsQuery = `
      SELECT id, question, option_a, option_b, option_c, option_d, points, order_index
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY order_index
    `;

    // If instructor or admin, show correct answers
    const course = await pool.query('SELECT instructor_id FROM courses WHERE id = $1', [quiz.course_id]);
    if (req.user.role === 'admin' || course.rows[0].instructor_id === req.user.id) {
      questionsQuery = `
        SELECT *
        FROM quiz_questions
        WHERE quiz_id = $1
        ORDER BY order_index
      `;
    }

    const questionsResult = await pool.query(questionsQuery, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...quiz,
        questions: questionsResult.rows
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

// @desc    Start quiz attempt
// @route   POST /api/quizzes/:id/attempt
// @access  Private (Student)
exports.startQuizAttempt = async (req, res) => {
  try {
    const quizId = req.params.id;

    // Get enrollment
    const quiz = await pool.query(
      `SELECT l.id, s.course_id
       FROM quizzes q
       JOIN lessons l ON q.lesson_id = l.id
       JOIN sections s ON l.section_id = s.id
       WHERE q.id = $1`,
      [quizId]
    );

    if (quiz.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const enrollment = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [req.user.id, quiz.rows[0].course_id]
    );

    if (enrollment.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Create attempt
    const result = await pool.query(
      `INSERT INTO quiz_attempts (enrollment_id, quiz_id)
       VALUES ($1, $2)
       RETURNING *`,
      [enrollment.rows[0].id, quizId]
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

// @desc    Submit quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res) => {
  try {
    const { attempt_id, answers } = req.body; // answers: [{ question_id, answer: 'A' }]
    const quizId = req.params.id;

    // Get quiz and questions
    const quiz = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    const questions = await pool.query(
      'SELECT id, correct_answer, points FROM quiz_questions WHERE quiz_id = $1',
      [quizId]
    );

    if (quiz.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;

    questions.rows.forEach(question => {
      totalPoints += question.points;
      const studentAnswer = answers.find(a => a.question_id === question.id);
      if (studentAnswer && studentAnswer.answer === question.correct_answer) {
        score += question.points;
      }
    });

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.rows[0].passing_score;

    // Update attempt
    const result = await pool.query(
      `UPDATE quiz_attempts 
       SET score = $1, total_points = $2, percentage = $3, passed = $4, completed_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [score, totalPoints, percentage, passed, attempt_id]
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

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
exports.getQuizResults = async (req, res) => {
  try {
    const quizId = req.params.id;

    // Get user's attempts for this quiz
    const attempts = await pool.query(
      `SELECT qa.*
       FROM quiz_attempts qa
       JOIN enrollments e ON qa.enrollment_id = e.id
       WHERE qa.quiz_id = $1 AND e.student_id = $2
       ORDER BY qa.started_at DESC`,
      [quizId, req.user.id]
    );

    res.json({
      success: true,
      data: attempts.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor)
exports.updateQuiz = async (req, res) => {
  try {
    const { title, passing_score, time_limit } = req.body;

    const result = await pool.query(
      `UPDATE quizzes 
       SET title = COALESCE($1, title),
           passing_score = COALESCE($2, passing_score),
           time_limit = COALESCE($3, time_limit)
       WHERE id = $4
       RETURNING *`,
      [title, passing_score, time_limit, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
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

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor)
exports.deleteQuiz = async (req, res) => {
  try {
    await pool.query('DELETE FROM quizzes WHERE id = $1', [req.params.id]);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const pool = require('../config/database');

// @desc    Add section to course
// @route   POST /api/courses/:id/sections
// @access  Private (Instructor)
exports.createSection = async (req, res) => {
  try {
    const { title, description, order_index } = req.body;
    const courseId = req.params.id;

    const result = await pool.query(
      `INSERT INTO sections (course_id, title, description, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [courseId, title, description, order_index]
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

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private (Instructor)
exports.updateSection = async (req, res) => {
  try {
    const { title, description, order_index } = req.body;

    const result = await pool.query(
      `UPDATE sections 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           order_index = COALESCE($3, order_index)
       WHERE id = $4
       RETURNING *`,
      [title, description, order_index, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
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

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private (Instructor)
exports.deleteSection = async (req, res) => {
  try {
    await pool.query('DELETE FROM sections WHERE id = $1', [req.params.id]);

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add lesson to section
// @route   POST /api/sections/:id/lessons
// @access  Private (Instructor)
exports.createLesson = async (req, res) => {
  try {
    const { title, content_type, video_url, text_content, duration, order_index, is_preview } = req.body;
    const sectionId = req.params.id;

    const result = await pool.query(
      `INSERT INTO lessons (section_id, title, content_type, video_url, text_content, duration, order_index, is_preview)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [sectionId, title, content_type, video_url, text_content, duration, order_index, is_preview || false]
    );

    // Update course total lessons
    await pool.query(
      `UPDATE courses 
       SET total_lessons = total_lessons + 1,
           total_duration = total_duration + $1
       WHERE id = (SELECT course_id FROM sections WHERE id = $2)`,
      [duration || 0, sectionId]
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

// @desc    Get lesson
// @route   GET /api/lessons/:id
// @access  Private
exports.getLesson = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, s.course_id
       FROM lessons l
       JOIN sections s ON l.section_id = s.id
       WHERE l.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const lesson = result.rows[0];

    // Check if user has access (enrolled or instructor or preview)
    if (!lesson.is_preview) {
      const access = await pool.query(
        `SELECT e.id FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.student_id = $1 AND c.id = $2
         UNION
         SELECT c.id FROM courses c
         WHERE c.instructor_id = $1 AND c.id = $2`,
        [req.user.id, lesson.course_id]
      );

      if (access.rows.length === 0 && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course'
        });
      }
    }

    // Get resources for this lesson
    const resources = await pool.query(
      'SELECT * FROM resources WHERE lesson_id = $1',
      [req.params.id]
    );

    // Get quiz for this lesson
    const quiz = await pool.query(
      'SELECT id, title, passing_score FROM quizzes WHERE lesson_id = $1',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...lesson,
        resources: resources.rows,
        quiz: quiz.rows[0] || null
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

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Instructor)
exports.updateLesson = async (req, res) => {
  try {
    const { title, content_type, video_url, text_content, duration, order_index, is_preview } = req.body;

    const result = await pool.query(
      `UPDATE lessons 
       SET title = COALESCE($1, title),
           content_type = COALESCE($2, content_type),
           video_url = COALESCE($3, video_url),
           text_content = COALESCE($4, text_content),
           duration = COALESCE($5, duration),
           order_index = COALESCE($6, order_index),
           is_preview = COALESCE($7, is_preview)
       WHERE id = $8
       RETURNING *`,
      [title, content_type, video_url, text_content, duration, order_index, is_preview, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
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

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Instructor)
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await pool.query('SELECT section_id, duration FROM lessons WHERE id = $1', [req.params.id]);

    if (lesson.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    await pool.query('DELETE FROM lessons WHERE id = $1', [req.params.id]);

    // Update course totals
    await pool.query(
      `UPDATE courses 
       SET total_lessons = total_lessons - 1,
           total_duration = total_duration - $1
       WHERE id = (SELECT course_id FROM sections WHERE id = $2)`,
      [lesson.rows[0].duration || 0, lesson.rows[0].section_id]
    );

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark lesson as complete
// @route   POST /api/lessons/:id/complete
// @access  Private (Student)
exports.completeLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;

    // Get enrollment ID
    const lesson = await pool.query(
      `SELECT s.course_id FROM lessons l
       JOIN sections s ON l.section_id = s.id
       WHERE l.id = $1`,
      [lessonId]
    );

    if (lesson.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const enrollment = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [req.user.id, lesson.rows[0].course_id]
    );

    if (enrollment.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Mark as complete
    await pool.query(
      `INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, true, CURRENT_TIMESTAMP)
       ON CONFLICT (enrollment_id, lesson_id) 
       DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP`,
      [enrollment.rows[0].id, lessonId]
    );

    // Update enrollment progress
    const progressResult = await pool.query(
      `SELECT 
        COUNT(*) as total_lessons,
        COUNT(CASE WHEN lp.completed THEN 1 END) as completed_lessons
       FROM lessons l
       JOIN sections s ON l.section_id = s.id
       LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.enrollment_id = $1
       WHERE s.course_id = $2`,
      [enrollment.rows[0].id, lesson.rows[0].course_id]
    );

    const total = parseInt(progressResult.rows[0].total_lessons);
    const completed = parseInt(progressResult.rows[0].completed_lessons);
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    await pool.query(
      `UPDATE enrollments 
       SET progress = $1,
           completed_at = CASE WHEN $1 = 100 THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = $2`,
      [progress, enrollment.rows[0].id]
    );

    res.json({
      success: true,
      data: {
        progress,
        completed_lessons: completed,
        total_lessons: total
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

// @desc    Add resource to lesson
// @route   POST /api/lessons/:id/resources
// @access  Private (Instructor)
exports.addResource = async (req, res) => {
  try {
    const { title } = req.body;
    const lessonId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const file_url = `/uploads/resources/${req.file.filename}`;
    const file_size = req.file.size;
    const file_type = req.file.mimetype;

    const result = await pool.query(
      `INSERT INTO resources (lesson_id, title, file_url, file_size, file_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lessonId, title, file_url, file_size, file_type]
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

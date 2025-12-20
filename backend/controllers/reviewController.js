const pool = require('../config/database');

// @desc    Write/Update review
// @route   POST /api/courses/:id/reviews
// @access  Private (Student)
exports.createReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const courseId = req.params.id;

    // Check if enrolled
    const enrollment = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [req.user.id, courseId]
    );

    if (enrollment.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to review this course'
      });
    }

    // Insert or update review
    const result = await pool.query(
      `INSERT INTO reviews (course_id, student_id, rating, review)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (course_id, student_id)
       DO UPDATE SET rating = $3, review = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [courseId, req.user.id, rating, review]
    );

    // Update course average rating
    await updateCourseRating(courseId);

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

// @desc    Get course reviews
// @route   GET /api/courses/:id/reviews
// @access  Public
exports.getCourseReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const courseId = req.params.id;

    let orderBy = 'r.created_at DESC';
    if (sort === 'helpful') {
      orderBy = 'r.helpful_count DESC';
    } else if (sort === 'rating_high') {
      orderBy = 'r.rating DESC';
    } else if (sort === 'rating_low') {
      orderBy = 'r.rating ASC';
    }

    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        r.*,
        u.full_name as student_name,
        u.avatar as student_avatar
       FROM reviews r
       JOIN users u ON r.student_id = u.id
       WHERE r.course_id = $1
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
      [courseId, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE course_id = $1',
      [courseId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get rating distribution
    const distribution = await pool.query(
      `SELECT 
        rating,
        COUNT(*) as count
       FROM reviews
       WHERE course_id = $1
       GROUP BY rating
       ORDER BY rating DESC`,
      [courseId]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      rating_distribution: distribution.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const result = await pool.query(
      `UPDATE reviews 
       SET rating = COALESCE($1, rating), 
           review = COALESCE($2, review),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND student_id = $4
       RETURNING *`,
      [rating, review, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    // Update course average rating
    await updateCourseRating(result.rows[0].course_id);

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

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await pool.query(
      'SELECT course_id FROM reviews WHERE id = $1 AND student_id = $2',
      [req.params.id, req.user.id]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);

    // Update course average rating
    await updateCourseRating(review.rows[0].course_id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE reviews 
       SET helpful_count = helpful_count + 1
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
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

// Helper function to update course rating
async function updateCourseRating(courseId) {
  const result = await pool.query(
    `SELECT AVG(rating)::DECIMAL(3,2) as avg_rating
     FROM reviews
     WHERE course_id = $1`,
    [courseId]
  );

  const avgRating = result.rows[0].avg_rating || 0;

  await pool.query(
    'UPDATE courses SET average_rating = $1 WHERE id = $2',
    [avgRating, courseId]
  );
}

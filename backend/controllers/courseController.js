const pool = require("../config/database");
const slugify = require("slugify"); // it makes used use to clean readable url format
const { broadcastInstructorStudents } = require("./dashboardController");

// @desc    Get all courses with filters
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  // fetch all course with filters
  try {
    const {
      search,
      category,
      level,
      price_min,
      price_max,
      rating_min,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    let query = `
      SELECT 
        c.*,
        cat.name as category_name,
        u.full_name as instructor_name,
        u.avatar as instructor_avatar
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.status = 'published'
    `;

    const params = []; // SQL injections se bachne k lea attackers login ko bypass na krlen
    let paramCount = 0; // ye parametrized query hoti h means database kdud value handle krta h

    // Search filter
    if (search) {
      paramCount++;
      query += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Category filter
    if (category) {
      const categoryIds = category
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
      if (categoryIds.length > 0) {
        paramCount++;
        query += ` AND c.category_id = ANY($${paramCount}::int[])`;
        params.push(categoryIds);
      }
    }

    // Level filter
    if (level) {
      paramCount++;
      query += ` AND c.level = $${paramCount}`;
      params.push(level);
    }

    // Price range filter
    if (price_min) {
      paramCount++;
      query += ` AND c.price >= $${paramCount}`;
      params.push(price_min);
    }
    if (price_max) {
      paramCount++;
      query += ` AND c.price <= $${paramCount}`;
      params.push(price_max);
    }

    // Rating filter
    if (rating_min) {
      paramCount++;
      query += ` AND c.average_rating >= $${paramCount}`;
      params.push(rating_min);
    }

    // Sorting
    switch (sort) {
      case "popular":
        query += " ORDER BY c.total_enrollments DESC";
        break;
      case "rating":
        query += " ORDER BY c.average_rating DESC";
        break;
      case "price_low":
        query += " ORDER BY c.price ASC";
        break;
      case "price_high":
        query += " ORDER BY c.price DESC";
        break;
      default: // newest
        query += " ORDER BY c.created_at DESC";
    }

    // Get total count BEFORE adding limit and offset
    // We recreate the same filters for a clean count query
    const countParams = params.slice();
    let countQuery = `
      SELECT COUNT(*) as total FROM courses c
      WHERE c.status = 'published'
    `;

    // Re-apply filters for count query (manually, to match query structure)
    // Actually, it's easier to just use the params we already have except limit/offset
    // But PostgreSQL doesn't allow subqueries for counts after sort/limit easily without wrapping.
    // Let's just wrap the current query except for LIMIT/OFFSET for count if we wanted,
    // but the manual way is safer for performance.

    // Simpler way: Use the same WHERE clause from 'query' prefix but for COUNT
    const whereMatch = query.match(/WHERE [\s\S]*?(?=ORDER BY|LIMIT|$)/);
    if (whereMatch) {
      countQuery = `SELECT COUNT(*) as total FROM courses c ${whereMatch[0]}`;
    }

    // Pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.*,
        cat.name as category_name,
        u.full_name as instructor_name,
        u.bio as instructor_bio,
        u.avatar as instructor_avatar,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.id) as review_count
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor only)
exports.createCourse = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      title,
      description,
      category_id,
      level,
      price,
      original_price,
      total_duration,
      status,
      slug: customSlug,
      sections,
    } = req.body;

    // Use provided slug or generate one
    const slug =
      (customSlug || slugify(title, { lower: true, strict: true })) +
      "-" +
      Date.now();

    let thumbnail = req.body.thumbnail || null;
    if (req.file) {
      thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    const salePrice = Number(price) || 0;
    const originalPrice =
      original_price !== undefined &&
      original_price !== null &&
      original_price !== "" &&
      Number(original_price) > salePrice
        ? Number(original_price)
        : null;

    const courseResult = await client.query(
      `INSERT INTO courses (instructor_id, title, slug, description, category_id, level, price, original_price, thumbnail, total_duration, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.user.id,
        title,
        slug,
        description,
        category_id,
        level,
        salePrice,
        originalPrice,
        thumbnail,
        total_duration || 0,
        status || "draft",
      ],
    );

    const course = courseResult.rows[0];

    // Handle nested sections/lessons if provided
    if (sections && Array.isArray(sections)) {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionResult = await client.query(
          `INSERT INTO sections (course_id, title, order_index)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [course.id, section.title, i],
        );

        const sectionId = sectionResult.rows[0].id;

        if (section.lessons && Array.isArray(section.lessons)) {
          for (let j = 0; j < section.lessons.length; j++) {
            const lesson = section.lessons[j];
            const lessonResult = await client.query(
              `INSERT INTO lessons (section_id, title, content_type, order_index)
               VALUES ($1, $2, $3, $4)
               RETURNING id`,
              [sectionId, lesson.title, lesson.type, j],
            );

            const lessonId = lessonResult.rows[0].id;

            // Handle Quiz creation if type is 'quiz'
            if (
              lesson.type === "quiz" &&
              lesson.questions &&
              Array.isArray(lesson.questions)
            ) {
              const quizResult = await client.query(
                `INSERT INTO quizzes (lesson_id, title, passing_score)
                 VALUES ($1, $2, $3)
                 RETURNING id`,
                [lessonId, lesson.title, 70],
              );

              const quizId = quizResult.rows[0].id;

              for (let k = 0; k < lesson.questions.length; k++) {
                const q = lesson.questions[k];
                await client.query(
                  `INSERT INTO quiz_questions 
                   (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, points, order_index)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                  [
                    quizId,
                    q.question,
                    q.option_a,
                    q.option_b,
                    q.option_c,
                    q.option_d,
                    q.correct_answer.toUpperCase(),
                    q.points || 1,
                    k,
                  ],
                );
              }
            }
          }
        }
      }
    }

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  } finally {
    client.release();
  }
};

exports.updateCourse = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { title, description, category_id, level, price, original_price, status, sections } =
      req.body;

    // Get current course
    const current = await client.query("SELECT * FROM courses WHERE id = $1", [
      req.params.id,
    ]);
    if (current.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let thumbnail = current.rows[0].thumbnail;
    if (req.file) {
      thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    } else if (req.body.thumbnail) {
      thumbnail = req.body.thumbnail;
    }

    const slug =
      title && title !== current.rows[0].title
        ? slugify(title, { lower: true, strict: true }) + "-" + Date.now()
        : current.rows[0].slug;

    const nextPrice =
      price !== undefined
        ? price === ""
          ? 0
          : Number(price)
        : Number(current.rows[0].price);

    let nextOriginalPrice;
    if (original_price === undefined) {
      nextOriginalPrice = current.rows[0].original_price;
    } else if (
      original_price === null ||
      original_price === "" ||
      Number(original_price) <= nextPrice
    ) {
      nextOriginalPrice = null;
    } else {
      nextOriginalPrice = Number(original_price);
    }

    const result = await client.query(
      `UPDATE courses
       SET title = $1, slug = $2, description = $3, category_id = $4,
           level = $5, price = $6, original_price = $7, status = $8, thumbnail = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        title || current.rows[0].title,
        slug,
        description || current.rows[0].description,
        category_id || current.rows[0].category_id,
        level || current.rows[0].level,
        nextPrice,
        nextOriginalPrice,
        status || current.rows[0].status,
        thumbnail,
        req.params.id,
      ],
    );

    // Handle nested sections/lessons if provided
    if (sections && Array.isArray(sections)) {
      // For simplicity in this implementation, we'll replace the curriculum
      // WARNING: This will reset student progress for this course in a real app
      await client.query("DELETE FROM sections WHERE course_id = $1", [
        req.params.id,
      ]);

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionResult = await client.query(
          `INSERT INTO sections (course_id, title, order_index)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [req.params.id, section.title, i],
        );

        const sectionId = sectionResult.rows[0].id;

        if (section.lessons && Array.isArray(section.lessons)) {
          for (let j = 0; j < section.lessons.length; j++) {
            const lesson = section.lessons[j];
            const lessonResult = await client.query(
              `INSERT INTO lessons (section_id, title, content_type, order_index)
               VALUES ($1, $2, $3, $4)
               RETURNING id`,
              [sectionId, lesson.title, lesson.type || lesson.content_type, j],
            );

            const lessonId = lessonResult.rows[0].id;

            // Handle Quiz
            if (lesson.type === "quiz" || lesson.content_type === "quiz") {
              if (lesson.questions && Array.isArray(lesson.questions)) {
                const quizResult = await client.query(
                  `INSERT INTO quizzes (lesson_id, title, passing_score)
                   VALUES ($1, $2, $3)
                   RETURNING id`,
                  [lessonId, lesson.title, 70],
                );

                const quizId = quizResult.rows[0].id;

                for (let k = 0; k < lesson.questions.length; k++) {
                  const q = lesson.questions[k];
                  await client.query(
                    `INSERT INTO quiz_questions 
                     (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, points, order_index)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                      quizId,
                      q.question,
                      q.option_a,
                      q.option_b,
                      q.option_c,
                      q.option_d,
                      q.correct_answer,
                      q.points || 1,
                      k,
                    ],
                  );
                }
              }
            }
          }
        }
      }
    }

    await client.query("COMMIT");
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    client.release();
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
exports.deleteCourse = async (req, res) => {
  try {
    await pool.query("DELETE FROM courses WHERE id = $1", [req.params.id]);

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollCourse = async (req, res) => {
  try {
    // Check if already enrolled
    const existing = await pool.query(
      "SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2",
      [req.user.id, req.params.id],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    // Create enrollment
    const result = await pool.query(
      "INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *",
      [req.user.id, req.params.id],
    );

    // Update course enrollment count
    await pool.query(
      "UPDATE courses SET total_enrollments = total_enrollments + 1 WHERE id = $1",
      [req.params.id],
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });

    // Push real-time update to the course's instructor (after response — no need to block).
    pool
      .query("SELECT instructor_id FROM courses WHERE id = $1", [req.params.id])
      .then((r) => {
        const instructorId = r.rows[0]?.instructor_id;
        if (instructorId) broadcastInstructorStudents(instructorId);
      })
      .catch((err) => console.error("SSE enrollment broadcast lookup:", err));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get course curriculum
// @route   GET /api/courses/:id/curriculum
// @access  Public
exports.getCourseCurriculum = async (req, res) => {
  try {
    const sections = await pool.query(
      `SELECT * FROM sections WHERE course_id = $1 ORDER BY order_index`,
      [req.params.id],
    );

    const curriculum = await Promise.all(
      sections.rows.map(async (section) => {
        const lessonsRecords = await pool.query(
          `SELECT id, title, content_type as type, duration, order_index, is_preview 
           FROM lessons 
           WHERE section_id = $1 
           ORDER BY order_index`,
          [section.id],
        );

        const lessons = await Promise.all(
          lessonsRecords.rows.map(async (lesson) => {
            if (lesson.type === "quiz") {
              const quizResult = await pool.query(
                "SELECT id FROM quizzes WHERE lesson_id = $1",
                [lesson.id],
              );
              if (quizResult.rows.length > 0) {
                const questionsResult = await pool.query(
                  "SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index",
                  [quizResult.rows[0].id],
                );
                return { ...lesson, questions: questionsResult.rows };
              }
            }
            return lesson;
          }),
        );

        return {
          ...section,
          lessons,
        };
      }),
    );

    res.json({
      success: true,
      data: curriculum,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get student's enrolled courses
// @route   GET /api/courses/my-courses
// @access  Private (Student)
exports.getMyCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        e.id as enrollment_id, e.progress, e.enrolled_at, e.completed_at,
        c.*,
        cat.name as category_name,
        u.full_name as instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC`,
      [req.user.id],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get instructor's courses
// @route   GET /api/courses/my-teaching
// @access  Private (Instructor)
exports.getMyTeaching = async (req, res) => {
  try {
    const result = await pool.query(
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
      [req.user.id],
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

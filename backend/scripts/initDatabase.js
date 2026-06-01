const pool = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('Initializing database schema...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
        bio TEXT,
        avatar TEXT,
        cloudinary_avatar_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Categories table created');

    // Courses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id),
        level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
        price DECIMAL(10,2) DEFAULT 0,
        original_price DECIMAL(10,2),
        thumbnail TEXT,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        total_duration INTEGER,
        total_lessons INTEGER DEFAULT 0,
        total_enrollments INTEGER DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Courses table created');

    // Sections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Sections table created');

    // Lessons table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content_type VARCHAR(20) CHECK (content_type IN ('video', 'text', 'quiz', 'assignment')),
        video_url TEXT,
        text_content TEXT,
        duration INTEGER,
        order_index INTEGER NOT NULL,
        is_preview BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Lessons table created');

    // Enrollments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        progress INTEGER DEFAULT 0,
        completed_at TIMESTAMPTZ,
        certificate_url TEXT,
        UNIQUE(student_id, course_id)
      );
    `);
    console.log('✓ Enrollments table created');

    // Lesson Progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMPTZ,
        UNIQUE(enrollment_id, lesson_id)
      );
    `);
    console.log('✓ Lesson Progress table created');

    // Quizzes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        passing_score INTEGER DEFAULT 70,
        time_limit INTEGER,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Quizzes table created');

    // Quiz Questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
        points INTEGER DEFAULT 1,
        order_index INTEGER
      );
    `);
    console.log('✓ Quiz Questions table created');

    // Quiz Attempts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        score INTEGER,
        total_points INTEGER,
        percentage DECIMAL(5,2),
        passed BOOLEAN,
        started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMPTZ
      );
    `);
    console.log('✓ Quiz Attempts table created');

    // Assignments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMPTZ,
        max_score INTEGER DEFAULT 100,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Assignments table created');

    // Assignment Submissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        file_url TEXT,
        submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        grade INTEGER,
        feedback TEXT,
        graded_by INTEGER REFERENCES users(id),
        graded_at TIMESTAMPTZ,
        UNIQUE(assignment_id, student_id)
      );
    `);
    console.log('✓ Assignment Submissions table created');

    // Reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, student_id)
      );
    `);
    console.log('✓ Reviews table created');

    // Resources table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER,
        file_type VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Resources table created');

    // Certificates table — stores metadata for every generated certificate.
    // certificate_uuid is the public-facing unique ID printed on the PDF.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        certificate_uuid UUID UNIQUE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        completion_date TIMESTAMPTZ NOT NULL,
        generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        file_path TEXT,
        UNIQUE(user_id, course_id)
      );
    `);
    console.log('✓ Certificates table created');

    // === Migrations for curriculum metadata enhancements ===
    await pool.query(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;`);
    await pool.query(`ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS attempts_allowed INTEGER DEFAULT 0;`);
    await pool.query(`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS instructions TEXT;`);
    await pool.query(`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS submission_type VARCHAR(20) DEFAULT 'file';`);
    await pool.query(`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';`);
    console.log('✓ Curriculum metadata columns ensured');

    // Insert sample categories
    await pool.query(`
      INSERT INTO categories (name, description, icon) VALUES
      ('Web Development', 'Learn web technologies', 'code'),
      ('Data Science', 'Data analysis and ML', 'chart-bar'),
      ('Business', 'Business and entrepreneurship', 'briefcase'),
      ('Design', 'Graphic and UI/UX design', 'paint-brush'),
      ('Marketing', 'Digital marketing strategies', 'bullhorn')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✓ Sample categories inserted');

    console.log('\n✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();

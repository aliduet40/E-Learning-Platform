# E-Learning Platform Backend

A comprehensive online learning platform API where instructors can create courses and students can enroll, watch videos, complete assignments, and track progress.

## Features

- User Management (Student, Instructor, Admin roles)
- Course Management (CRUD operations)
- Curriculum & Content (Sections, Lessons, Videos)
- Progress Tracking
- Quiz System
- Assignment Submission & Grading
- Reviews & Ratings
- Search & Discovery

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create PostgreSQL database:
```sql
CREATE DATABASE elearning_platform;
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Initialize database schema:
```bash
npm run db:init
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

Server runs on `http://localhost:5000`

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Courses
- GET /api/courses - Browse courses (with filters)
- GET /api/courses/:id - Get course details
- POST /api/courses - Create course (Instructor)
- PUT /api/courses/:id - Update course (Instructor)
- DELETE /api/courses/:id - Delete course (Instructor)
- POST /api/courses/:id/enroll - Enroll in course
- GET /api/courses/:id/curriculum - Get course structure
- GET /api/courses/my-courses - Student's enrolled courses
- GET /api/courses/my-teaching - Instructor's courses

### Sections
- POST /api/courses/:id/sections - Add section
- PUT /api/sections/:id - Update section
- DELETE /api/sections/:id - Delete section

### Lessons
- POST /api/sections/:id/lessons - Add lesson
- GET /api/lessons/:id - Get lesson content
- PUT /api/lessons/:id - Update lesson
- DELETE /api/lessons/:id - Delete lesson
- POST /api/lessons/:id/complete - Mark as complete

### Quizzes
- POST /api/lessons/:id/quiz - Create quiz
- GET /api/quizzes/:id - Get quiz
- POST /api/quizzes/:id/attempt - Start quiz attempt
- POST /api/quizzes/:id/submit - Submit quiz
- GET /api/quizzes/:id/results - Get quiz results

### Assignments
- POST /api/lessons/:id/assignment - Create assignment
- GET /api/assignments/:id - Get assignment
- POST /api/assignments/:id/submit - Submit assignment
- PUT /api/submissions/:id/grade - Grade submission

### Reviews
- POST /api/courses/:id/reviews - Write review
- PUT /api/reviews/:id - Update review
- DELETE /api/reviews/:id - Delete review
- POST /api/reviews/:id/helpful - Mark helpful

### Progress
- GET /api/enrollments/:id/progress - Get course progress
- GET /api/enrollments/:id/certificate - Get certificate

# E-Learning Platform

A full-featured e-learning platform where instructors can create and
manage courses, and students can enroll, learn, complete assignments,
and track their progress.

## Features

### User Management

-   User registration with role selection (Student, Instructor, Admin)
-   JWT-based authentication
-   Profile management with bio and avatar
-   Instructor verification system
-   Separate dashboards for Students and Instructors

### Course Management

-   Create, edit, and delete courses (Instructor only)
-   Course details: title, description, category, price, thumbnail
-   Course status: draft, published, archived
-   Course enrollment
-   Course ratings and reviews

### Curriculum & Content

-   Course sections and lessons hierarchy
-   Video lessons (YouTube/Vimeo embed or upload)
-   Rich text content editor
-   Downloadable resources (PDFs, files)
-   Quizzes with multiple-choice questions
-   Assignment submission system

### Progress Tracking

-   Mark lessons as complete
-   Course completion percentage tracking
-   Quiz scores and history
-   Assignment grading
-   Certificates on course completion

### Search & Discovery

-   Search courses by title and description
-   Filter by category, price, and rating
-   Sort by popularity, rating, and newest
-   Featured and recommended courses

### Reviews & Ratings

-   Rate courses (1--5 stars)
-   Write reviews
-   Helpful / not helpful voting
-   Instructor responses to reviews

## Tech Stack

### Backend

-   Node.js
-   Express.js
-   PostgreSQL
-   JWT Authentication
-   Multer / Cloudinary (for file uploads)
-  Bycrpt for password hashing



### API,S
// Courses
GET    /api/courses                // Browse courses with filters
GET    /api/courses/:id            // Course details
POST   /api/courses                // Create (Instructor only)
PUT    /api/courses/:id            // Update (Instructor only)
DELETE /api/courses/:id            // Delete (Instructor only)
POST   /api/courses/:id/enroll     // Enroll in course
GET    /api/courses/:id/curriculum // Course structure
GET    /api/courses/my-courses     // Student's enrolled courses
GET    /api/courses/my-teaching    // Instructor's courses

// Sections
POST   /api/courses/:id/sections   // Add section
PUT    /api/sections/:id           // Update section
DELETE /api/sections/:id           // Delete section

// Lessons
POST   /api/sections/:id/lessons   // Add lesson
GET    /api/lessons/:id            // Lesson content
PUT    /api/lessons/:id            // Update lesson
DELETE /api/lessons/:id            // Delete lesson
POST   /api/lessons/:id/complete   // Mark as complete

// Quizzes
POST   /api/lessons/:id/quiz       // Create quiz
GET    /api/quizzes/:id            // Get quiz
POST   /api/quizzes/:id/attempt    // Start quiz attempt
POST   /api/quizzes/:id/submit     // Submit quiz
GET    /api/quizzes/:id/results    // Quiz results

// Assignments
POST   /api/lessons/:id/assignment // Create assignment
GET    /api/assignments/:id        // Get assignment
POST   /api/assignments/:id/submit // Submit assignment
PUT    /api/submissions/:id/grade  // Grade submission

// Reviews
POST   /api/courses/:id/reviews    // Write review
PUT    /api/reviews/:id            // Update review
DELETE /api/reviews/:id            // Delete review
POST   /api/reviews/:id/helpful    // Mark helpful

// Progress
GET    /api/enrollments/:id/progress   // Course progress
GET    /api/enrollments/:id/certificate // Get certificate

// Dashboard
GET    /api/dashboard/student      // Student statistics
GET    /api/dashboard/instructor   // Instructor statistics



### Frontend

-   React
-   React Router
-   Axios
-   Context API / Redux
-   Tailwind CSS 

## Installation

### Backend Setup

``` bash
cd backend
npm install
```

Create database and tables:

``` bash
createdb e_learning_platform
psql -d e_learning_platform -f database/schema.sql
```

Configure environment variables:

``` bash
cp .env.example .env
```

Run backend server:

``` bash
npm run dev
```

### Frontend Setup

``` bash
cd frontend
npm install
```

Run frontend server:

``` bash
npm run dev
```

## Environment Variables

### Backend (.env)




### Frontend (.env)

    VITE_API_BASE_URL=http://localhost:5000/api

## Project Structure

    backend/
     ├── controllers/
     ├── routes/
     ├── middleware/
     ├── database/
     ├── models/
     ├── utils/
     └── server.js

    frontend/
     ├── src/
     │   ├── components/
     │   ├── pages/
     │   ├── context/
     │   ├── services/
     │   └── App.jsx

## Future Enhancements

-   Live classes and webinars
-   Payment gateway integration
-   Admin analytics dashboard
-   Mobile application

## Author

**Hammad Ali** Backend & Full Stack Developer

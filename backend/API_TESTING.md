# E-Learning Platform API - Testing Guide

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elearning_platform
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

3. **Database Setup**
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE elearning_platform;
\q

# Initialize database schema
npm run db:init
```

4. **Start Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "student",
  "bio": "Passionate learner"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data

full_name: Updated Name
bio: Updated bio
avatar: [file]
```

#### Get Dashboard
```http
GET /auth/dashboard
Authorization: Bearer {token}
```

### Courses

#### Browse Courses
```http
GET /courses?search=web&category=1&level=beginner&sort=popular&page=1&limit=10
```

Query Parameters:
- `search`: Search in title/description
- `category`: Category ID
- `level`: beginner, intermediate, advanced
- `price_min`, `price_max`: Price range
- `rating_min`: Minimum rating
- `sort`: newest, popular, rating, price_low, price_high
- `page`, `limit`: Pagination

#### Get Course Details
```http
GET /courses/:id
```

#### Create Course (Instructor Only)
```http
POST /courses
Authorization: Bearer {token}
Content-Type: multipart/form-data

title: Complete Web Development
description: Learn full stack web development
category_id: 1
level: beginner
price: 49.99
thumbnail: [file]
```

#### Update Course
```http
PUT /courses/:id
Authorization: Bearer {token}
Content-Type: multipart/form-data

title: Updated Title
status: published
```

#### Delete Course
```http
DELETE /courses/:id
Authorization: Bearer {token}
```

#### Enroll in Course
```http
POST /courses/:id/enroll
Authorization: Bearer {token}
```

#### Get Course Curriculum
```http
GET /courses/:id/curriculum
```

#### Get My Enrolled Courses (Student)
```http
GET /courses/my-courses
Authorization: Bearer {token}
```

#### Get My Teaching Courses (Instructor)
```http
GET /courses/my-teaching
Authorization: Bearer {token}
```

### Sections

#### Add Section to Course
```http
POST /courses/:id/sections
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Introduction",
  "description": "Getting started",
  "order_index": 1
}
```

#### Update Section
```http
PUT /sections/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Section Title"
}
```

#### Delete Section
```http
DELETE /sections/:id
Authorization: Bearer {token}
```

### Lessons

#### Add Lesson to Section
```http
POST /sections/:id/lessons
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Welcome to the Course",
  "content_type": "video",
  "video_url": "https://www.youtube.com/watch?v=xxxxx",
  "duration": 10,
  "order_index": 1,
  "is_preview": true
}
```

#### Get Lesson
```http
GET /lessons/:id
Authorization: Bearer {token}
```

#### Update Lesson
```http
PUT /lessons/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Lesson Title",
  "video_url": "new_url"
}
```

#### Delete Lesson
```http
DELETE /lessons/:id
Authorization: Bearer {token}
```

#### Mark Lesson as Complete
```http
POST /lessons/:id/complete
Authorization: Bearer {token}
```

#### Add Resource to Lesson
```http
POST /lessons/:id/resources
Authorization: Bearer {token}
Content-Type: multipart/form-data

title: Course Materials PDF
resource: [file]
```

### Quizzes

#### Create Quiz
```http
POST /lessons/:id/quiz
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "JavaScript Basics Quiz",
  "passing_score": 70,
  "time_limit": 30,
  "questions": [
    {
      "question": "What is JavaScript?",
      "option_a": "Programming language",
      "option_b": "Coffee brand",
      "option_c": "Framework",
      "option_d": "Database",
      "correct_answer": "A",
      "points": 10
    }
  ]
}
```

#### Get Quiz
```http
GET /quizzes/:id
Authorization: Bearer {token}
```

#### Start Quiz Attempt
```http
POST /quizzes/:id/attempt
Authorization: Bearer {token}
```

#### Submit Quiz
```http
POST /quizzes/:id/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "attempt_id": 1,
  "answers": [
    {
      "question_id": 1,
      "answer": "A"
    }
  ]
}
```

#### Get Quiz Results
```http
GET /quizzes/:id/results
Authorization: Bearer {token}
```

### Assignments

#### Create Assignment
```http
POST /lessons/:id/assignment
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Build a Todo App",
  "description": "Create a todo application using React",
  "due_date": "2024-12-31T23:59:59Z",
  "max_score": 100
}
```

#### Get Assignment
```http
GET /assignments/:id
Authorization: Bearer {token}
```

#### Submit Assignment
```http
POST /assignments/:id/submit
Authorization: Bearer {token}
Content-Type: multipart/form-data

content: Here is my submission description
assignment: [file]
```

#### Grade Submission
```http
PUT /submissions/:id/grade
Authorization: Bearer {token}
Content-Type: application/json

{
  "grade": 85,
  "feedback": "Great work! Consider improving error handling."
}
```

#### Get Assignment Submissions
```http
GET /assignments/:id/submissions
Authorization: Bearer {token}
```

### Reviews

#### Write/Update Review
```http
POST /courses/:id/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent course! Learned a lot."
}
```

#### Get Course Reviews
```http
GET /courses/:id/reviews?page=1&limit=10&sort=newest
```

#### Update Review
```http
PUT /reviews/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 4,
  "review": "Updated review text"
}
```

#### Delete Review
```http
DELETE /reviews/:id
Authorization: Bearer {token}
```

#### Mark Review as Helpful
```http
POST /reviews/:id/helpful
Authorization: Bearer {token}
```

### Progress & Certificates

#### Get Enrollment Progress
```http
GET /enrollments/:id/progress
Authorization: Bearer {token}
```

#### Get Certificate
```http
GET /enrollments/:id/certificate
Authorization: Bearer {token}
```

#### Get Student Statistics
```http
GET /progress/stats
Authorization: Bearer {token}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Testing Flow

1. **Register as Instructor**
2. **Login and get token**
3. **Create a course**
4. **Add sections to course**
5. **Add lessons to sections**
6. **Create quizzes and assignments**
7. **Publish course**
8. **Register as Student**
9. **Browse and enroll in course**
10. **Complete lessons**
11. **Take quizzes**
12. **Submit assignments**
13. **Write review**
14. **Get certificate**

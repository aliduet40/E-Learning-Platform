# Quick Start Guide - E-Learning Platform Backend

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# Update: DB_USER, DB_PASSWORD, JWT_SECRET
```

### Step 3: Setup Database
```bash
# Make sure PostgreSQL is running
# Create database
psql -U postgres -c "CREATE DATABASE elearning_platform;"

# Initialize schema
npm run db:init
```

### Step 4: Start Server
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Server will run on: `http://localhost:5000`

---

## 📝 Test the API

### 1. Register an Instructor
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123",
    "full_name": "John Instructor",
    "role": "instructor"
  }'
```

**Save the token from response!**

### 2. Create a Course
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development Bootcamp",
    "description": "Learn full stack development",
    "category_id": 1,
    "level": "beginner",
    "price": 49.99
  }'
```

### 3. Add a Section
```bash
curl -X POST http://localhost:5000/api/courses/1/sections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction",
    "description": "Getting started",
    "order_index": 1
  }'
```

### 4. Add a Lesson
```bash
curl -X POST http://localhost:5000/api/sections/1/lessons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome Video",
    "content_type": "video",
    "video_url": "https://youtube.com/watch?v=xxxxx",
    "duration": 10,
    "order_index": 1,
    "is_preview": true
  }'
```

### 5. Register a Student
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "full_name": "Jane Student",
    "role": "student"
  }'
```

### 6. Enroll in Course
```bash
curl -X POST http://localhost:5000/api/courses/1/enroll \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

### 7. Browse Courses
```bash
curl http://localhost:5000/api/courses
```

---

## 🎯 Common Use Cases

### Search Courses
```
GET /api/courses?search=web&level=beginner&sort=popular
```

### Get Student Dashboard
```
GET /api/auth/dashboard
Authorization: Bearer STUDENT_TOKEN
```

### Get Instructor Dashboard
```
GET /api/auth/dashboard
Authorization: Bearer INSTRUCTOR_TOKEN
```

### Complete a Lesson
```
POST /api/lessons/1/complete
Authorization: Bearer STUDENT_TOKEN
```

### Write a Review
```
POST /api/courses/1/reviews
Authorization: Bearer STUDENT_TOKEN
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent course!"
}
```

---

## 🗂️ Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── courseController.js  # Course CRUD
│   ├── curriculumController.js
│   ├── quizController.js
│   ├── assignmentController.js
│   ├── reviewController.js
│   └── progressController.js
├── middleware/
│   ├── auth.js              # JWT & authorization
│   ├── error.js             # Error handling
│   └── upload.js            # File uploads
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── courses.js           # Course endpoints
│   ├── sections.js
│   ├── lessons.js
│   ├── quizzes.js
│   ├── assignments.js
│   ├── reviews.js
│   └── progress.js
├── scripts/
│   └── initDatabase.js      # DB initialization
├── uploads/                 # Uploaded files
├── .env.example
├── .gitignore
├── package.json
├── server.js                # Main server file
├── README.md
├── API_TESTING.md
└── DEPLOYMENT.md
```

---

## 🔐 User Roles

### Student
- Browse and search courses
- Enroll in courses
- Watch lessons and mark complete
- Take quizzes
- Submit assignments
- Write reviews
- Track progress
- Get certificates

### Instructor
- Create and manage courses
- Create sections and lessons
- Create quizzes and assignments
- Grade student submissions
- View course analytics
- Respond to reviews

### Admin
- All instructor permissions
- Manage categories
- Manage all courses
- Manage users

---

## 📊 Database Schema

**Main Tables:**
- `users` - User accounts
- `categories` - Course categories
- `courses` - Courses
- `sections` - Course sections
- `lessons` - Lessons (video, text, quiz, assignment)
- `enrollments` - Student enrollments
- `lesson_progress` - Completed lessons
- `quizzes` & `quiz_questions` - Quiz system
- `quiz_attempts` - Quiz submissions
- `assignments` - Assignments
- `assignment_submissions` - Student submissions
- `reviews` - Course reviews
- `resources` - Downloadable files

---

## 🛠️ Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run db:init    # Initialize database schema
```

---

## 📚 API Documentation

Full API documentation available in:
- `API_TESTING.md` - Complete endpoint reference
- `DEPLOYMENT.md` - Production deployment guide
- `postman_collection.json` - Import into Postman

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials in .env
# Check DB_HOST, DB_USER, DB_PASSWORD
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

### JWT Token Invalid
- Make sure JWT_SECRET is set in .env
- Token expires after JWT_EXPIRE period (default 7 days)
- Get new token by logging in again

### File Upload Fails
```bash
# Check upload directories exist and have write permissions
chmod -R 755 uploads/
```

---

## 🎓 Learning Resources

### PostgreSQL
- Official Docs: https://www.postgresql.org/docs/
- Tutorial: https://www.postgresqltutorial.com/

### Express.js
- Official Docs: https://expressjs.com/
- Guide: https://expressjs.com/en/guide/routing.html

### JWT Authentication
- JWT.io: https://jwt.io/
- Best Practices: https://auth0.com/blog/jwt-best-practices/

---

## 📞 Support

If you encounter issues:
1. Check error logs in terminal
2. Review API_TESTING.md for correct request format
3. Verify environment variables are set correctly
4. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/*.log`

---

## ✅ Features Implemented

- ✅ User authentication & authorization (JWT)
- ✅ Role-based access control (Student, Instructor, Admin)
- ✅ Course CRUD operations
- ✅ Course enrollment system
- ✅ Curriculum management (sections & lessons)
- ✅ Video lessons (YouTube/Vimeo embed)
- ✅ Quiz system with scoring
- ✅ Assignment submission & grading
- ✅ Progress tracking
- ✅ Course reviews & ratings
- ✅ File uploads (thumbnails, resources, assignments)
- ✅ Search & filtering
- ✅ Student dashboard
- ✅ Instructor dashboard
- ✅ Certificate generation
- ✅ Input validation
- ✅ Error handling

---

## 🚀 Next Steps

1. **Test All Endpoints**: Use Postman collection
2. **Add Sample Data**: Create courses, lessons, quizzes
3. **Setup Frontend**: Connect with React/Vue/Angular
4. **Deploy**: Follow DEPLOYMENT.md guide
5. **Add Features**: Email notifications, payment integration, etc.

---

Happy coding! 🎉

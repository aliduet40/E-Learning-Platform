const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const { errorHandler, notFound } = require('./middleware/error'); // Import error handling middleware

// Import all appliaction routes
const authRoutes = require('./routes/auth'); // Import authentication routes
const courseRoutes = require('./routes/courses'); // Import course routes
const categoryRoutes = require('./routes/categories'); // Import category routes
const sectionRoutes = require('./routes/sections'); // Import section routes
const lessonRoutes = require('./routes/lessons'); // Import lesson routes
const quizRoutes = require('./routes/quizzes'); // Import quiz routes
const assignmentRoutes = require('./routes/assignments'); // Import assignment routes
const reviewRoutes = require('./routes/reviews'); // Import review routes
const progressRoutes = require('./routes/progress'); // Import progress routes
const dashboardRoutes = require('./routes/dashboard'); // Import dashboard routes
const userRoutes = require('./routes/users'); // Import user management routes
const certificateRoutes = require('./routes/certificates'); // Import certificate generation routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the 'uploads' directory

// Routes
app.get('/', (req, res) => {  // Root route
  res.json({
    success: true,
    message: 'E-Learning Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      categories: '/api/categories',
      sections: '/api/sections',
      lessons: '/api/lessons',
      quizzes: '/api/quizzes',
      assignments: '/api/assignments',
      reviews: '/api/reviews',
      progress: '/api/progress',
      dashboard: '/api/dashboard',
      users: '/api/users',
      certificates: '/api/certificates'
    }
  });
});

app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/courses', courseRoutes); // Course routes
app.use('/api/categories', categoryRoutes); // Category routes
app.use('/api/sections', sectionRoutes); // Section routes
app.use('/api/lessons', lessonRoutes); // Lesson routes
app.use('/api/quizzes', quizRoutes); // Quiz routes
app.use('/api/assignments', assignmentRoutes); // Assignment routes
app.use('/api/reviews', reviewRoutes); // Review routes
app.use('/api/progress', progressRoutes); // Progress routes
app.use('/api/dashboard', dashboardRoutes); // Dashboard routes
app.use('/api/users', userRoutes); // User management routes
app.use('/api/certificates', certificateRoutes); // Certificate generation routes

// Error handling
app.use(notFound); // Not found middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

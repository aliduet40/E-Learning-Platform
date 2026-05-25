const { validationResult } = require('express-validator'); 
// express validator API ke input data check krta h aur wrong data database me jane se phle ruk leta h 
// used as a m middlwware in routes

// Validation error handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Global error handler
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry. Resource already exists.'
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Related resource not found.'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
};

// Not found handler
exports.notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};

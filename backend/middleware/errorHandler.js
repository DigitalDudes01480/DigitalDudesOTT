import multer from 'multer';

const errorHandler = (err, req, res, next) => {
  // Prevent crashes by ensuring we always have an error object
  if (!err) {
    return res.status(500).json({
      success: false,
      message: 'Unknown error occurred'
    });
  }

  let error = { ...err };
  error.message = err.message || 'Server Error';

  // Log error with more context
  console.error('Error Handler:', {
    message: err.message,
    name: err.name,
    code: err.code,
    path: req.path,
    method: req.method
  });

  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  if (err instanceof multer.MulterError) {
    error = { message: err.message, statusCode: 400 };
  }

  if (typeof err.message === 'string' && err.message.includes('Only image files')) {
    error = { message: err.message, statusCode: 400 };
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // Handle MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    error = { message: 'Database connection error', statusCode: 503 };
  }

  const responseMessage = Array.isArray(error.message) ? error.message.join(', ') : error.message;

  // Ensure response hasn't been sent already
  if (!res.headersSent) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: responseMessage || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

export default errorHandler;

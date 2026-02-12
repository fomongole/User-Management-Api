// Handle 404 - Not Found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General Error Handler
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // 1. Handles Mongoose "CastError" (Invalid ObjectId, e.g. wrong ID format in URL)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // 2. Handles Mongoose "ValidationError" (e.g., empty fields, invalid email regex)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Extract just the clean messages from the error object
    message = Object.values(err.errors)
        .map((val) => val.message)
        .join(', ');
  }

  // 3. Handle Mongoose Duplicate Key Error (e.g., registering with same email)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  res.status(statusCode);

  res.json({
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };
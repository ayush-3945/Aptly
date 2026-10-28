const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  const isProduction = process.env.NODE_ENV === 'production';

  const message =
    statusCode === 413
      ? 'Payload too large. Please shorten your text (limit ~20KB).'
      : isProduction && statusCode === 500
      ? 'An unexpected internal server error occurred. Please try again later.'
      : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    error: message,
    message,
    ...(!isProduction && { stack: err.stack }),
  });
};

module.exports = errorHandler;

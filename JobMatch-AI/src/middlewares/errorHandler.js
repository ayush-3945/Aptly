const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: isProduction && statusCode === 500
      ? 'An unexpected internal server error occurred. Please try again later.'
      : (err.message || 'Internal Server Error'),
    ...(!isProduction && { stack: err.stack }),
  });
};

module.exports = errorHandler;

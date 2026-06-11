const notFoundHandler = (req, res, next) => {
  const error = new Error(`Không tìm thấy đường dẫn: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Lỗi máy chủ nội bộ",
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

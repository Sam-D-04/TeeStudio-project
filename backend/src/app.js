const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require('morgan'); // Thêm dòng 1: Nhúng thư viện vào theo dõi log

const apiRoutes = require("./routes");
const {
  notFoundHandler,
  errorHandler,
} = require("./common/middlewares/error.middleware");

const app = express();

// Chỉ cho phép origin của frontend gọi API (nhiều origin thì phân tách bằng dấu phẩy trong .env).
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan('dev')); // Thêm dòng 2: Bật chế độ log dành cho Developer

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to TeeStudio API",
  });
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

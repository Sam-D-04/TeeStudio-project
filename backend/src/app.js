const express = require("express");
const cors = require("cors");

const apiRoutes = require("./routes");
const {
  notFoundHandler,
  errorHandler,
} = require("./common/middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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

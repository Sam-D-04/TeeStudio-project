/**
 * auth.middleware.js
 *
 * Middleware xác thực JWT và kiểm tra quyền Admin.
 *
 * TRẠNG THÁI HIỆN TẠI: Bypass tạm thời (luôn gọi next()).
 * Logic verify token thật sẽ được đắp vào sau khi module Auth hoàn thành.
 *
 * Cách dùng trong route:
 *   router.get("/", verifyToken, requireAdmin, controller.handler);
 */

/**
 * verifyToken – kiểm tra JWT trong header Authorization.
 *
 * Thật ra sẽ:
 * 1. Đọc token từ header: Authorization: Bearer <token>
 * 2. Xác minh token bằng jwt.verify(token, process.env.JWT_SECRET)
 * 3. Lưu thông tin user vào req.user = { id, email, role }
 * 4. Gọi next() nếu hợp lệ, trả 401 nếu không hợp lệ
 *
 * TẠM THỜI: Luôn cho qua để không chặn luồng test chức năng.
 */
const verifyToken = (req, res, next) => {
  // TODO: Đắp logic verify JWT thật vào đây
  // Ví dụ:
  // const authHeader = req.headers["authorization"];
  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
  // }
  // const token = authHeader.split(" ")[1];
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   req.user = decoded;
  //   next();
  // } catch {
  //   return res.status(401).json({ success: false, message: "Token không hợp lệ" });
  // }

  // Tạm thời bypass: gán user giả để code sau này không bị lỗi khi đọc req.user
  req.user = { id: 1, email: "admin@teestudio.vn", role: "ADMIN" };
  next();
};

/**
 * requireAdmin – kiểm tra người dùng phải có role ADMIN.
 *
 * Chạy SAU verifyToken. Đọc req.user.role và từ chối nếu không phải ADMIN.
 *
 * TẠM THỜI: Vì verifyToken đã gán role ADMIN, middleware này luôn cho qua.
 * Sau khi logic thật được đắp vào verifyToken, middleware này sẽ tự động hoạt động đúng.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện thao tác này",
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
};

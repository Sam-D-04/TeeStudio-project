const jwt = require("jsonwebtoken");
const db = require("../../database/mysql");
const { ROLES } = require("../constants/roles");

const getAccessTokenSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_ACCESS_SECRET must be configured in production");
  }
  return secret || "teestudio-development-access-secret";
};

const unauthorized = (res, message = "Vui lòng đăng nhập để tiếp tục") => {
  return res.status(401).json({ success: false, message });
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized(res);
  }

  const token = authHeader.slice(7).trim();

  try {
    const payload = jwt.verify(token, getAccessTokenSecret(), {
      algorithms: ["HS256"],
    });

    if (payload.type !== "access" || !payload.sub) {
      return unauthorized(res, "Access token không hợp lệ");
    }

    const [accounts] = await db.pool.query(
      `SELECT id, email, fullName, phone, role, status
       FROM Account
       WHERE id = ?
       LIMIT 1`,
      [Number(payload.sub)]
    );
    const account = accounts[0];

    if (!account || account.status !== "ACTIVE") {
      return unauthorized(res, "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa");
    }

    req.user = {
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      phone: account.phone,
      role: account.role,
      status: account.status,
    };
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return unauthorized(res, "Access token đã hết hạn");
    }

    if (error.name === "JsonWebTokenError") {
      return unauthorized(res, "Access token không hợp lệ");
    }

    return next(error);
  }
};

const requireRoles = (...roles) => {
  const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;

  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập chức năng này",
      });
    }

    return next();
  };
};

const verifyRole = (roles) => requireRoles(roles);
const requireAdmin = requireRoles(ROLES.ADMIN);

module.exports = {
  verifyToken,
  verifyRole,
  requireRoles,
  requireAdmin,
};

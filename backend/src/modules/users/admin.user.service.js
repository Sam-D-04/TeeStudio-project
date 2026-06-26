const bcrypt = require("bcryptjs");
const db = require("../../database/mysql");
const { INTERNAL_ROLES } = require("../../common/constants/roles");

const CUSTOMER_ROLE = "CUSTOMER";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeText = (value) => value.trim().replace(/\s+/g, " ");

const getProfile = async (userId) => {
  const [rows] = await db.pool.query(
    `SELECT id, email, fullName, phone, role, status, createdAt, updatedAt
     FROM Account
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows[0]) {
    throw createError("Không tìm thấy tài khoản", 404);
  }

  return rows[0];
};

const updateProfile = async (userId, data) => {
  const fields = [];
  const params = [];

  if (data.fullName !== undefined) {
    fields.push("fullName = ?");
    params.push(normalizeText(data.fullName));
  }
  if (data.phone !== undefined) {
    fields.push("phone = ?");
    params.push(normalizeText(data.phone));
  }

  if (fields.length === 0) {
    throw createError("Không có thông tin nào để cập nhật", 400);
  }

  params.push(userId);
  await db.execute(`UPDATE Account SET ${fields.join(", ")} WHERE id = ?`, params);
  return getProfile(userId);
};

const listStaff = async ({ page = 1, limit = 20, search = "", status = "" } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = ["role IN (?, ?, ?)"];
  const params = [...INTERNAL_ROLES];

  if (search) {
    conditions.push("(fullName LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const keyword = `%${search}%`;
    params.push(keyword, keyword, keyword);
  }

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  const where = conditions.join(" AND ");

  const [[{ total }]] = await db.pool.query(
    `SELECT COUNT(*) AS total FROM Account WHERE ${where}`,
    params
  );

  const [items] = await db.pool.query(
    `SELECT id, email, fullName, phone, role, status, createdAt, updatedAt
     FROM Account
     WHERE ${where}
     ORDER BY createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
};

const createStaff = async (data) => {
  const email = normalizeEmail(data.email);
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  try {
    const result = await db.execute(
      `INSERT INTO Account (email, passwordHash, fullName, phone, role, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        email,
        passwordHash,
        normalizeText(data.fullName),
        normalizeText(data.phone),
        data.role,
      ]
    );

    return getProfile(result.insertId);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw createError("Email đã được sử dụng", 409);
    }
    throw error;
  }
};

const updateStaff = async (staffId, data, actorId) => {
  if (Number(staffId) === Number(actorId)) {
    throw createError("Không thể tự thay đổi vai trò hoặc vô hiệu hóa tài khoản", 400);
  }

  const [accounts] = await db.pool.query(
    "SELECT id, role FROM Account WHERE id = ? LIMIT 1",
    [staffId]
  );
  const account = accounts[0];

  if (!account || !INTERNAL_ROLES.includes(account.role)) {
    throw createError("Không tìm thấy tài khoản nội bộ", 404);
  }

  const fields = [];
  const params = [];
  if (data.role !== undefined) {
    fields.push("role = ?");
    params.push(data.role);
  }
  if (data.status !== undefined) {
    fields.push("status = ?");
    params.push(data.status);
  }

  if (fields.length === 0) {
    throw createError("Không có thông tin nào để cập nhật", 400);
  }

  params.push(staffId);
  await db.transaction(async (connection) => {
    await connection.query(
      `UPDATE Account SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    await connection.query("DELETE FROM UserToken WHERE userId = ?", [staffId]);
  });

  return getProfile(staffId);
};

// =========================================================================
// QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG (CUSTOMER)
// =========================================================================

/**
 * Lấy danh sách tài khoản khách hàng, có hỗ trợ phân trang và tìm kiếm.
 */
const listCustomers = async ({ page = 1, limit = 20, search = "", status = "" } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = ["role = ?"];
  const params = [CUSTOMER_ROLE];

  if (search) {
    conditions.push("(fullName LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const keyword = `%${search}%`;
    params.push(keyword, keyword, keyword);
  }

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  const where = conditions.join(" AND ");

  const [[{ total }]] = await db.pool.query(
    `SELECT COUNT(*) AS total FROM Account WHERE ${where}`,
    params
  );

  const [items] = await db.pool.query(
    `SELECT id, email, fullName, phone, role, status, createdAt, updatedAt
     FROM Account
     WHERE ${where}
     ORDER BY createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  // Tính thống kê tổng quát (bỏ qua lọc status, chỉ giữ lọc search)
  const statsConditions = ["role = ?"];
  const statsParams = [CUSTOMER_ROLE];

  if (search) {
    statsConditions.push("(fullName LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const keyword = `%${search}%`;
    statsParams.push(keyword, keyword, keyword);
  }

  const statsWhere = statsConditions.join(" AND ");

  const [stats] = await db.pool.query(
    `SELECT 
      COUNT(*) as totalCount,
      SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as activeCount,
      SUM(CASE WHEN status != 'ACTIVE' THEN 1 ELSE 0 END) as inactiveCount
     FROM Account WHERE ${statsWhere}`,
    statsParams
  );

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    statTotal: Number(stats[0].totalCount || 0),
    statActive: Number(stats[0].activeCount || 0),
    statInactive: Number(stats[0].inactiveCount || 0),
  };
};

/**
 * Tạo tài khoản khách hàng mới.
 */
const createCustomer = async (data) => {
  const email = normalizeEmail(data.email);
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  try {
    const result = await db.execute(
      `INSERT INTO Account (email, passwordHash, fullName, phone, role, status)
       VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')`,
      [
        email,
        passwordHash,
        normalizeText(data.fullName),
        normalizeText(data.phone),
      ]
    );

    return getProfile(result.insertId);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw createError("Email đã được sử dụng", 409);
    }
    throw error;
  }
};

/**
 * Cập nhật thông tin cá nhân hoặc trạng thái của khách hàng.
 * Không cho phép cập nhật password, role.
 */
const updateCustomer = async (customerId, data) => {
  const [accounts] = await db.pool.query(
    "SELECT id, role FROM Account WHERE id = ? LIMIT 1",
    [customerId]
  );
  const account = accounts[0];

  if (!account || account.role !== CUSTOMER_ROLE) {
    throw createError("Không tìm thấy tài khoản khách hàng", 404);
  }

  const fields = [];
  const params = [];

  if (data.fullName !== undefined) {
    fields.push("fullName = ?");
    params.push(normalizeText(data.fullName));
  }
  if (data.phone !== undefined) {
    fields.push("phone = ?");
    params.push(normalizeText(data.phone));
  }
  if (data.status !== undefined) {
    fields.push("status = ?");
    params.push(data.status);
  }

  if (fields.length === 0) {
    throw createError("Không có thông tin nào để cập nhật", 400);
  }

  params.push(customerId);
  await db.execute(
    `UPDATE Account SET ${fields.join(", ")} WHERE id = ?`,
    params
  );

  return getProfile(customerId);
};

/**
 * Soft-delete: đổi status sang INACTIVE hoặc SUSPENDED.
 * Không xóa bản ghi khỏi database.
 */
const softDeleteCustomer = async (customerId, targetStatus = "INACTIVE") => {
  const [accounts] = await db.pool.query(
    "SELECT id, role, status FROM Account WHERE id = ? LIMIT 1",
    [customerId]
  );
  const account = accounts[0];

  if (!account || account.role !== CUSTOMER_ROLE) {
    throw createError("Không tìm thấy tài khoản khách hàng", 404);
  }

  if (account.status === targetStatus) {
    throw createError(`Tài khoản đã ở trạng thái ${targetStatus}`, 400);
  }

  await db.execute(
    "UPDATE Account SET status = ? WHERE id = ?",
    [targetStatus, customerId]
  );

  return getProfile(customerId);
};

module.exports = {
  getProfile,
  updateProfile,
  listStaff,
  createStaff,
  updateStaff,
  listCustomers,
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
};

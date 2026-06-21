const bcrypt = require("bcryptjs");
const db = require("../../database/mysql");
const { INTERNAL_ROLES } = require("../../common/constants/roles");

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

const listStaff = async () => {
  const [items] = await db.pool.query(
    `SELECT id, email, fullName, phone, role, status, createdAt, updatedAt
     FROM Account
     WHERE role IN (?, ?, ?)
     ORDER BY createdAt DESC`,
    INTERNAL_ROLES
  );

  return { items, total: items.length };
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

module.exports = {
  getProfile,
  updateProfile,
  listStaff,
  createStaff,
  updateStaff,
};

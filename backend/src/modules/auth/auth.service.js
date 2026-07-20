const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../../database/mysql");
const { ROLES } = require("../../common/constants/roles");
const emailService = require("../../common/services/emailService");

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);
const EMAIL_VERIFICATION_TOKEN_TTL_MS =
  Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS || 24) * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL_MS =
  Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 60) * 60 * 1000;

const TOKEN_PURPOSE = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
};

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getJwtSecret = (primaryName, developmentFallback) => {
  const secret = process.env[primaryName] || process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(`${primaryName} must be configured in production`);
  }
  return secret || developmentFallback;
};

const getAccessTokenSecret = () =>
  getJwtSecret("JWT_ACCESS_SECRET", "teestudio-development-access-secret");

const getRefreshTokenSecret = () =>
  getJwtSecret("JWT_REFRESH_SECRET", "teestudio-development-refresh-secret");

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizeText = (value) => value.trim().replace(/\s+/g, " ");
const sha256Hex = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
const hashRefreshToken = sha256Hex;

const serializeUser = (account) => ({
  id: account.id,
  email: account.email,
  fullName: account.fullName,
  phone: account.phone,
  role: account.role,
  status: account.status,
  emailVerified: Boolean(account.emailVerified),
});

const findAccountByEmail = async (email) => {
  const [rows] = await db.pool.query(
    `SELECT id, email, passwordHash, fullName, phone, role, status, emailVerified
     FROM Account
     WHERE email = ?
     LIMIT 1`,
    [normalizeEmail(email)]
  );

  return rows[0] || null;
};

const findAccountById = async (id) => {
  const [rows] = await db.pool.query(
    `SELECT id, email, passwordHash, fullName, phone, role, status, emailVerified
     FROM Account
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

// Sinh token ngẫu nhiên (dùng cho xác minh email / đặt lại mật khẩu), chỉ lưu
// hash SHA-256 trong DB — giống cách refresh token đang được lưu.
const createActionToken = async (accountId, purpose, ttlMs, ip) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMs);

  await db.execute(
    `DELETE FROM AccountActionToken
     WHERE accountId = ? AND purpose = ? AND consumedAt IS NULL`,
    [accountId, purpose]
  );
  await db.execute(
    `INSERT INTO AccountActionToken (accountId, tokenHash, purpose, expiresAt, requestIp)
     VALUES (?, ?, ?, ?, ?)`,
    [accountId, sha256Hex(rawToken), purpose, expiresAt, ip || null]
  );

  return rawToken;
};

const consumeActionToken = async (rawToken, purpose) => {
  const [rows] = await db.pool.query(
    `SELECT id, accountId FROM AccountActionToken
     WHERE tokenHash = ? AND purpose = ? AND consumedAt IS NULL AND expiresAt > NOW()
     LIMIT 1`,
    [sha256Hex(rawToken), purpose]
  );
  const tokenRow = rows[0];

  if (!tokenRow) {
    return null;
  }

  await db.execute(
    `UPDATE AccountActionToken SET consumedAt = NOW() WHERE id = ?`,
    [tokenRow.id]
  );

  return tokenRow;
};

const buildTokens = (account) => {
  const sessionId = crypto.randomUUID();
  const accessToken = jwt.sign(
    {
      sub: String(account.id),
      email: account.email,
      role: account.role,
      type: "access",
    },
    getAccessTokenSecret(),
    { algorithm: "HS256", expiresIn: ACCESS_TOKEN_TTL }
  );
  const refreshToken = jwt.sign(
    {
      sub: String(account.id),
      sid: sessionId,
      type: "refresh",
    },
    getRefreshTokenSecret(),
    { algorithm: "HS256", expiresIn: REFRESH_TOKEN_TTL }
  );
  const accessPayload = jwt.decode(accessToken);
  const refreshPayload = jwt.decode(refreshToken);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(accessPayload.exp * 1000).toISOString(),
    refreshTokenExpiresAt: new Date(refreshPayload.exp * 1000),
  };
};

const saveSession = async (account, tokens, metadata = {}, connection = db.pool) => {
  await connection.query(
    `INSERT INTO UserToken
       (userId, refreshToken, expiresAt, userAgent, ipAddress)
     VALUES (?, ?, ?, ?, ?)`,
    [
      account.id,
      hashRefreshToken(tokens.refreshToken),
      tokens.refreshTokenExpiresAt,
      metadata.userAgent || null,
      metadata.ipAddress || null,
    ]
  );
};

const createSession = async (account, metadata) => {
  const tokens = buildTokens(account);
  await db.pool.query("DELETE FROM UserToken WHERE expiresAt <= NOW()");
  await saveSession(account, tokens, metadata);

  return {
    user: serializeUser(account),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString(),
  };
};

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:3000").split(",")[0].trim();

// Gửi email xác minh là "best-effort": lỗi gửi mail chỉ được log lại, không
// được throw tiếp, vì tài khoản lúc gọi hàm này đã tạo thành công trong DB rồi
// (giống nguyên tắc đang áp dụng cho sendOrderConfirmationEmail).
const dispatchVerificationEmail = async (account, ip) => {
  try {
    const rawToken = await createActionToken(
      account.id,
      TOKEN_PURPOSE.EMAIL_VERIFICATION,
      EMAIL_VERIFICATION_TOKEN_TTL_MS,
      ip
    );
    await emailService.sendVerificationEmail({
      to: account.email,
      fullName: account.fullName,
      verifyUrl: `${getFrontendUrl()}/xac-minh-email?token=${rawToken}`,
    });
  } catch (error) {
    console.error("Không thể gửi email xác minh:", error.message);
  }
};

const register = async (data, metadata) => {
  const email = normalizeEmail(data.email);
  const existingAccount = await findAccountByEmail(email);

  if (existingAccount) {
    throw createError("Email đã được sử dụng", 409);
  }

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
        ROLES.CUSTOMER,
      ]
    );
    const account = await findAccountById(result.insertId);
    const session = await createSession(account, metadata);
    await dispatchVerificationEmail(account, metadata?.ipAddress);
    return session;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw createError("Email đã được sử dụng", 409);
    }
    throw error;
  }
};

const login = async (data, metadata) => {
  const account = await findAccountByEmail(data.email);
  const passwordMatches = account
    ? await bcrypt.compare(data.password, account.passwordHash)
    : false;

  if (!account || !passwordMatches) {
    throw createError("Email hoặc mật khẩu không đúng", 401);
  }

  if (account.status !== "ACTIVE") {
    throw createError("Tài khoản đã bị vô hiệu hóa", 403);
  }

  return createSession(account, metadata);
};

const refresh = async (refreshToken, metadata) => {
  let payload;

  try {
    payload = jwt.verify(refreshToken, getRefreshTokenSecret(), {
      algorithms: ["HS256"],
    });
  } catch {
    throw createError("Refresh token không hợp lệ hoặc đã hết hạn", 401);
  }

  if (payload.type !== "refresh" || !payload.sub) {
    throw createError("Refresh token không hợp lệ", 401);
  }

  const account = await findAccountById(Number(payload.sub));
  if (!account || account.status !== "ACTIVE") {
    throw createError("Tài khoản không tồn tại hoặc đã bị vô hiệu hóa", 401);
  }

  const nextTokens = buildTokens(account);
  const oldTokenHash = hashRefreshToken(refreshToken);

  await db.transaction(async (connection) => {
    const [deleteResult] = await connection.query(
      `DELETE FROM UserToken
       WHERE userId = ? AND refreshToken = ? AND expiresAt > NOW()`,
      [account.id, oldTokenHash]
    );

    if (deleteResult.affectedRows !== 1) {
      throw createError("Phiên đăng nhập không còn hợp lệ", 401);
    }

    await saveSession(account, nextTokens, metadata, connection);
  });

  return {
    user: serializeUser(account),
    accessToken: nextTokens.accessToken,
    refreshToken: nextTokens.refreshToken,
    accessTokenExpiresAt: nextTokens.accessTokenExpiresAt,
    refreshTokenExpiresAt: nextTokens.refreshTokenExpiresAt.toISOString(),
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  await db.execute("DELETE FROM UserToken WHERE refreshToken = ?", [
    hashRefreshToken(refreshToken),
  ]);
};

const logoutAll = async (userId) => {
  await db.execute("DELETE FROM UserToken WHERE userId = ?", [userId]);
};

const getProfile = async (userId) => {
  const account = await findAccountById(userId);
  if (!account) {
    throw createError("Không tìm thấy tài khoản", 404);
  }

  return serializeUser(account);
};

const verifyEmailToken = async (rawToken) => {
  const tokenRow = await consumeActionToken(
    rawToken,
    TOKEN_PURPOSE.EMAIL_VERIFICATION
  );

  if (!tokenRow) {
    // Có thể tài khoản đã xác minh từ trước (bấm lại link cũ) — coi là thành
    // công để tránh báo lỗi khó hiểu cho người dùng.
    throw createError("Liên kết xác minh không hợp lệ hoặc đã hết hạn", 400);
  }

  await db.execute(
    `UPDATE Account SET emailVerified = 1, emailVerifiedAt = NOW() WHERE id = ?`,
    [tokenRow.accountId]
  );
};

const resendVerification = async (userId, ip) => {
  const account = await findAccountById(userId);
  if (!account) {
    throw createError("Không tìm thấy tài khoản", 404);
  }

  if (account.emailVerified) {
    return { alreadyVerified: true };
  }

  await dispatchVerificationEmail(account, ip);
  return { alreadyVerified: false };
};

const forgotPassword = async (email, ip) => {
  const account = await findAccountByEmail(email);

  // Luôn "thành công" về mặt phản hồi bất kể email có tồn tại hay không, để
  // không lộ thông tin tài khoản nào đã đăng ký (chống email enumeration).
  if (!account) {
    return;
  }

  try {
    const rawToken = await createActionToken(
      account.id,
      TOKEN_PURPOSE.PASSWORD_RESET,
      PASSWORD_RESET_TOKEN_TTL_MS,
      ip
    );
    await emailService.sendPasswordResetEmail({
      to: account.email,
      fullName: account.fullName,
      resetUrl: `${getFrontendUrl()}/dat-lai-mat-khau?token=${rawToken}`,
    });
  } catch (error) {
    console.error("Không thể gửi email đặt lại mật khẩu:", error.message);
  }
};

const resetPassword = async (rawToken, newPassword) => {
  const tokenRow = await consumeActionToken(
    rawToken,
    TOKEN_PURPOSE.PASSWORD_RESET
  );

  if (!tokenRow) {
    throw createError("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await db.transaction(async (connection) => {
    await connection.query(
      `UPDATE Account SET passwordHash = ? WHERE id = ?`,
      [passwordHash, tokenRow.accountId]
    );
    // Đổi mật khẩu xong thì ép đăng xuất khỏi mọi thiết bị/phiên đang mở.
    await connection.query(`DELETE FROM UserToken WHERE userId = ?`, [
      tokenRow.accountId,
    ]);
  });
};

module.exports = {
  register,
  login,
  refresh,
  verifyEmailToken,
  resendVerification,
  forgotPassword,
  resetPassword,
  logout,
  logoutAll,
  getProfile,
  serializeUser,
};

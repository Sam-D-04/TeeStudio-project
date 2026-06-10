const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../../database/mysql");
const { ROLES } = require("../../common/constants/roles");

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

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
const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const serializeUser = (account) => ({
  id: account.id,
  email: account.email,
  fullName: account.fullName,
  phone: account.phone,
  role: account.role,
  status: account.status,
});

const findAccountByEmail = async (email) => {
  const [rows] = await db.pool.query(
    `SELECT id, email, passwordHash, fullName, phone, role, status
     FROM Account
     WHERE email = ?
     LIMIT 1`,
    [normalizeEmail(email)]
  );

  return rows[0] || null;
};

const findAccountById = async (id) => {
  const [rows] = await db.pool.query(
    `SELECT id, email, passwordHash, fullName, phone, role, status
     FROM Account
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
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
    return createSession(account, metadata);
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

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getProfile,
  serializeUser,
};

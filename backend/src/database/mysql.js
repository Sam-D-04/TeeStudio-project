const mysql = require("mysql2/promise");

const parseDatabaseUrl = () => {
  if (!process.env.DATABASE_URL) {
    return {};
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);

  return {
    host: databaseUrl.hostname,
    port: databaseUrl.port ? Number(databaseUrl.port) : undefined,
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.replace(/^\//, "") || undefined,
  };
};

const getDatabaseConfig = () => {
  const urlConfig = parseDatabaseUrl();

  return {
    host: process.env.DB_HOST || urlConfig.host || "localhost",
    port: Number(process.env.DB_PORT || urlConfig.port || 3306),
    user: process.env.DB_USER || urlConfig.user || "root",
    password: process.env.DB_PASSWORD || urlConfig.password || "",
    database: process.env.DB_NAME || urlConfig.database,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: Number(process.env.DB_QUEUE_LIMIT || 0),
    namedPlaceholders: true,
  };
};

const pool = mysql.createPool(getDatabaseConfig());

const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result;
};

const transaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const closePool = async () => {
  await pool.end();
};

module.exports = {
  pool,
  query,
  execute,
  transaction,
  closePool,
};

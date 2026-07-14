/**
 * run-migration.js — Chạy một file .sql migration bằng mysql2 (bật multipleStatements
 * để hỗ trợ SET/PREPARE/EXECUTE). Dùng lại cấu hình DB từ biến môi trường (.env).
 *
 * Cách dùng (từ thư mục backend):
 *   node src/database/run-migration.js src/database/migrations/<ten_file>.sql
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("❌ Thiếu đường dẫn file migration.\n   Ví dụ: node src/database/run-migration.js src/database/migrations/xxx.sql");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Không tìm thấy file: ${filePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, "utf8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    multipleStatements: true, // cần cho SET/PREPARE/EXECUTE nhiều câu lệnh
  });

  try {
    console.log(`▶  Đang chạy: ${path.basename(filePath)} trên DB "${process.env.DB_NAME}"...`);
    await connection.query(sql);
    console.log("✅ Migration chạy xong.");
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("❌ Lỗi khi chạy migration:", err.message);
  process.exit(1);
});

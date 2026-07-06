require('dotenv').config();
const db = require('./src/database/mysql');

async function alterTable() {
  try {
    await db.pool.query("ALTER TABLE customdesign ADD COLUMN name VARCHAR(255) DEFAULT 'Thiết kế chưa đặt tên' AFTER variantId;");
    console.log("Thêm cột name thành công!");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Cột name đã tồn tại.");
    } else {
      console.error("Lỗi:", error);
    }
  } finally {
    process.exit();
  }
}

alterTable();

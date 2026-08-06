require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./src/database/mysql");

// Đổi mật khẩu 1 tài khoản trong bảng Account (mật khẩu lưu dạng bcrypt hash, cột passwordHash).
// Dùng: node reset-admin-password.js [email] [mật khẩu mới]
async function resetPassword() {
  const email = process.argv[2] || "admin@teestudio.vn";
  const newPassword = process.argv[3] || "admin123";
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);

  try {
    const [account] = await db.query(
      "SELECT id FROM Account WHERE email = ? LIMIT 1",
      [email]
    );

    if (!account) {
      console.error(`❌ Không tìm thấy tài khoản với email: ${email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, rounds);
    await db.execute("UPDATE Account SET passwordHash = ? WHERE id = ?", [
      passwordHash,
      account.id,
    ]);

    console.log(`✅ Đã đổi mật khẩu cho: ${email}`);
    console.log(`   Mật khẩu mới: ${newPassword}`);
  } catch (err) {
    console.error("❌ Lỗi đổi mật khẩu:", err.message);
  } finally {
    await db.closePool();
  }
}

resetPassword();



//node reset-admin-password.js admin@teestudio.vn admin123

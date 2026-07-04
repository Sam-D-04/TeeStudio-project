require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  // Lấy thông tin kết nối từ file .env, hoặc dùng giá trị mặc định
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'teestudio'
  });

  // Có thể truyền tham số từ command line: node create_admin.js <email> <password> <name> <phone>
  const email = process.argv[2] || 'superadmin@teestudio.vn';
  const plainPassword = process.argv[3] || 'admin123';
  const fullName = process.argv[4] || 'Super Admin';
  const phone = process.argv[5] || '0988888888';

  console.log(`Đang tạo tài khoản ADMIN: ${email}...`);

  try {
    // Mã hoá mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    // Chèn vào CSDL
    const [result] = await connection.execute(
      `INSERT INTO account (email, passwordHash, fullName, phone, role, status)
       VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE')`,
      [email, passwordHash, fullName, phone]
    );

    console.log(`✅ Tạo tài khoản thành công! (ID: ${result.insertId})`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${plainPassword}`);
    console.log(`   Tên: ${fullName}`);
    console.log(`   Role: ADMIN`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error(`❌ Lỗi: Email '${email}' đã tồn tại trong hệ thống!`);
    } else {
      console.error('❌ Lỗi tạo tài khoản:', err.message);
    }
  } finally {
    await connection.end();
  }
}

createAdmin();

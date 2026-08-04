const mysql = require('mysql2/promise');
(async () => {
  try {
    const db = await mysql.createConnection({ user: 'root', password: '', database: 'teestudio' });
    await db.query("ALTER TABLE `ProductImage` MODIFY COLUMN `view` ENUM('front','back','model') NOT NULL;");
    console.log('Database ENUM updated successfully.');
    db.end();
  } catch (err) {
    console.error(err);
  }
})();

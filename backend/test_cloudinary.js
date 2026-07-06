const db = require('./src/database/mysql');
async function check() {
  const [rows] = await db.pool.query('SELECT DISTINCT color FROM ProductVariant');
  console.log(rows);
  process.exit(0);
}
check();

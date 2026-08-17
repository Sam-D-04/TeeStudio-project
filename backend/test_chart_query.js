const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'teestudio'
  });

  const tuNgay = '2026-01-01';
  const ketThuc = '2026-12-31';

  const JOIN_PAYMENT_HOAN_THANH = `
    LEFT JOIN (
      SELECT orderId, MAX(paidAt) AS fullyPaidAt
      FROM Payment
      WHERE status = 'COMPLETED'
        AND paymentType <> 'DEPOSIT'
      GROUP BY orderId
    ) pRevenue ON pRevenue.orderId = co.id
  `;

  const [rows] = await pool.query(
    `SELECT
       DATE_FORMAT(
         GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt)),
         '%Y-%m'
       )                              AS moc_raw,
       COALESCE(SUM(co.totalAmount), 0) AS doanhThu,
       COUNT(*)                         AS soDon
     FROM CustomerOrder co
     ${JOIN_PAYMENT_HOAN_THANH}
     WHERE co.status = 'COMPLETED'
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) >= ?
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) <= ?
     GROUP BY moc_raw
     ORDER BY moc_raw ASC`,
    [tuNgay, ketThuc]
  );
  
  console.log('Chart Data:', rows);
  console.log('Total Orders in Chart:', rows.reduce((sum, r) => sum + Number(r.soDon), 0));

  process.exit(0);
}

test().catch(console.error);

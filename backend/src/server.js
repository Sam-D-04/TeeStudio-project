require("dotenv").config();

// Render (và nhiều PaaS khác) quảng cáo route IPv6 qua getaddrinfo nhưng KHÔNG có
// đường mạng outbound IPv6 thật - nên khi 1 host có cả bản ghi AAAA lẫn A (vd
// smtp.gmail.com), Node mặc định vẫn thử IPv6 trước và bị "connect ENETUNREACH".
// Ép thứ tự phân giải DNS ưu tiên IPv4 cho toàn bộ tiến trình để tránh lỗi này.
// (Thử family:4 riêng ở nodemailer trước đó không ăn thua vì nodemailer không
// chuyển tiếp option đó xuống socket - phải chặn ở tầng dns của Node.)
require("dns").setDefaultResultOrder("ipv4first");

const app = require("./app");
const db = require("./database/mysql");
const {
  startPaymentReconciliationJob,
} = require("./modules/payments/payment-reconciliation.job");
const {
  startCancelUnpaidOrdersJob,
} = require("./modules/orders/cancel-unpaid-orders.job");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await db.testConnection();
  startPaymentReconciliationJob();
  startCancelUnpaidOrdersJob();
});

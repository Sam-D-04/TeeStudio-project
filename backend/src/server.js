require("dotenv").config();

const app = require("./app");
const {
  startPaymentReconciliationJob,
} = require("./modules/payments/payment-reconciliation.job");
const {
  startCancelUnpaidOrdersJob,
} = require("./modules/orders/cancel-unpaid-orders.job");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startPaymentReconciliationJob();
  startCancelUnpaidOrdersJob();
});

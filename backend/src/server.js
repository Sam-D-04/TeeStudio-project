require("dotenv").config();

const app = require("./app");
const {
  startVnpayReconciliationJob,
} = require("./modules/payments/vnpay-reconciliation.job");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startVnpayReconciliationJob();
});

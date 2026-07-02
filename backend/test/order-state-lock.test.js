const { after, test } = require("node:test");
const assert = require("node:assert/strict");

const db = require("../src/database/mysql");
const orderService = require("../src/modules/orders/admin.order.service");

const originalGetConnection = db.pool.getConnection;

after(async () => {
  db.pool.getConnection = originalGetConnection;
  await db.closePool();
});

function createConnection(payment) {
  const calls = [];
  const connection = {
    beginTransaction: async () => calls.push("begin"),
    commit: async () => calls.push("commit"),
    rollback: async () => calls.push("rollback"),
    release: () => calls.push("release"),
    query: async (sql) => {
      calls.push(sql);

      if (sql.includes("FROM CustomerOrder")) {
        return [[{ id: 1, status: "PENDING", codAmount: 0 }]];
      }
      if (sql.includes("FROM Payment")) {
        return [[payment]];
      }

      return [{ affectedRows: 1 }];
    },
  };

  return { calls, connection };
}

async function updateStatusWithPayment(payment) {
  const { calls, connection } = createConnection(payment);
  db.pool.getConnection = async () => connection;

  const update = orderService.capNhatTrangThai(1, "da_xac_nhan", { id: 9 });
  return { calls, update };
}

test("khóa trạng thái khi VNPAY toàn phần vẫn đang chờ thanh toán", async () => {
  const { calls, update } = await updateStatusWithPayment({
    paymentMethod: "VNPAY",
    paymentType: "FULL_PAYMENT",
    status: "PENDING",
  });

  await assert.rejects(update, { statusCode: 400 });
  assert.ok(calls.includes("rollback"));
  assert.ok(!calls.some((call) => String(call).includes("UPDATE CustomerOrder")));
});

test("khóa trạng thái khi tiền cọc MoMo vẫn đang chờ thanh toán", async () => {
  const { calls, update } = await updateStatusWithPayment({
    paymentMethod: "MOMO",
    paymentType: "DEPOSIT",
    status: "PENDING",
  });

  await assert.rejects(update, { statusCode: 400 });
  assert.ok(calls.includes("rollback"));
  assert.ok(!calls.some((call) => String(call).includes("UPDATE CustomerOrder")));
});

test("không áp dụng State Lock thanh toán trước cho đơn COD", async () => {
  const { calls, update } = await updateStatusWithPayment({
    paymentMethod: "COD",
    paymentType: "COD_FINAL",
    status: "PENDING",
  });

  await update;
  assert.ok(calls.includes("commit"));
  assert.ok(calls.some((call) => String(call).includes("UPDATE CustomerOrder")));
});

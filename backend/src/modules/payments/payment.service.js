const db = require("../../database/mysql");
const { xacThucPhanHoiVnpay } = require("./vnpay.service");

function parseVnpayAmount(query) {
  const amount = Number(query.vnp_Amount);
  return Number.isFinite(amount) ? amount / 100 : 0;
}

function isVnpayTransactionSuccessful(query) {
  return (
    query.vnp_ResponseCode === "00" &&
    (!query.vnp_TransactionStatus || query.vnp_TransactionStatus === "00")
  );
}

async function findVnpayPayment(executor, transactionRef, lockForUpdate = false) {
  const [rows] = await executor.query(
    `SELECT
       p.id,
       p.orderId,
       p.amount,
       p.status,
       p.paymentMethod,
       p.paymentType,
       p.paidAt,
       co.orderCode,
       co.status AS orderStatus
     FROM Payment p
     JOIN CustomerOrder co ON co.id = p.orderId
     WHERE p.transactionId = ?
       AND p.paymentMethod = 'VNPAY'
     LIMIT 1${lockForUpdate ? " FOR UPDATE" : ""}`,
    [transactionRef]
  );

  return rows[0] || null;
}

function buildPublicResult(query, payment, isValidChecksum) {
  const amount = isValidChecksum ? parseVnpayAmount(query) : 0;
  const amountMatches = Boolean(payment) && Number(payment.amount) === amount;
  const isSuccessful =
    isValidChecksum && amountMatches && isVnpayTransactionSuccessful(query);

  return {
    isValidChecksum,
    isSuccessful,
    responseCode: isValidChecksum ? String(query.vnp_ResponseCode || "") : "",
    transactionStatus: isValidChecksum
      ? String(query.vnp_TransactionStatus || "")
      : "",
    transactionRef: isValidChecksum ? String(query.vnp_TxnRef || "") : "",
    transactionNo: isValidChecksum ? String(query.vnp_TransactionNo || "") : "",
    bankCode: isValidChecksum ? String(query.vnp_BankCode || "") : "",
    orderCode: payment?.orderCode || null,
    amount,
    paymentType: payment?.paymentType || null,
    databaseStatus: payment?.status || null,
    paidAt: payment?.paidAt || null,
  };
}

async function xacThucKetQuaTraVeVnpay(query) {
  const isValidChecksum = xacThucPhanHoiVnpay(query);
  const transactionRef = String(query.vnp_TxnRef || "");

  // VNPAY không thể gọi IPN vào localhost. Vì vậy Return hợp lệ cũng đồng bộ
  // trạng thái như một fallback an toàn; khi deploy public, IPN vẫn là luồng chính.
  if (isValidChecksum && transactionRef) {
    await dongBoTrangThaiVnpay(query);
  }

  const payment = isValidChecksum && transactionRef
    ? await findVnpayPayment(db.pool, transactionRef)
    : null;

  return buildPublicResult(query, payment, isValidChecksum);
}

async function dongBoTrangThaiVnpay(query) {
  const transactionRef = String(query.vnp_TxnRef || "");
  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();
    const payment = await findVnpayPayment(conn, transactionRef, true);

    if (!payment) {
      await conn.rollback();
      return { RspCode: "01", Message: "Order not found" };
    }

    if (payment.status === "COMPLETED") {
      await conn.rollback();
      return { RspCode: "02", Message: "Order already confirmed" };
    }

    if (payment.status !== "PENDING" || payment.orderStatus === "CANCELLED") {
      await conn.rollback();
      return { RspCode: "02", Message: "Payment is no longer available" };
    }

    if (Number(payment.amount) !== parseVnpayAmount(query)) {
      await conn.rollback();
      return { RspCode: "04", Message: "Invalid Amount" };
    }

    const isSuccessful = isVnpayTransactionSuccessful(query);
    const [updateResult] = await conn.query(
      `UPDATE Payment
       SET status = ?,
           paidAt = ?,
           gatewayResponse = ?
       WHERE id = ?
         AND status = 'PENDING'`,
      [
        isSuccessful ? "COMPLETED" : "FAILED",
        isSuccessful ? new Date() : null,
        JSON.stringify(query),
        payment.id,
      ]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return { RspCode: "02", Message: "Order already confirmed" };
    }

    await conn.commit();

    return { RspCode: "00", Message: "Confirm Success" };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function xuLyIpnVnpay(query) {
  if (!xacThucPhanHoiVnpay(query)) {
    return { RspCode: "97", Message: "Invalid Checksum" };
  }

  return dongBoTrangThaiVnpay(query);
}

module.exports = {
  xacThucKetQuaTraVeVnpay,
  xuLyIpnVnpay,
};

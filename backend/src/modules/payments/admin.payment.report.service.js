"use strict";

const db = require("../../database/mysql");
const { taoBaoCaoExcel } = require("../../common/utils/excel-report");
const { taoBoLocThanhToan } = require("./payment-filter.util");

async function taoBaoCaoThanhToan(queryParams) {
  const { whereClause, params } = taoBoLocThanhToan(queryParams);
  const [rows] = await db.pool.query(
    `SELECT p.id, co.orderCode, a.fullName, a.phone, p.amount,
            p.paymentType, p.paymentMethod, p.status, p.transactionId,
            p.note,
            DATE_FORMAT(p.paidAt, '%Y-%m-%d %H:%i:%s') AS paidAt,
            DATE_FORMAT(p.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt
     FROM Payment p
     JOIN CustomerOrder co ON co.id = p.orderId
     JOIN Account a ON a.id = co.userId
     ${whereClause}
     ORDER BY p.createdAt DESC`,
    params
  );

  const ngayXuat = new Date().toISOString().slice(0, 10);
  return taoBaoCaoExcel(`bao-cao-thanh-toan-${ngayXuat}.xlsx`, [
    {
      name: "Giao dịch thanh toán",
      headers: [
        "Mã giao dịch", "Mã đơn", "Khách hàng", "Điện thoại", "Số tiền",
        "Loại thanh toán", "Phương thức", "Trạng thái", "Mã cổng thanh toán",
        "Ghi chú", "Thời gian thanh toán", "Ngày tạo",
      ],
      rows: rows.map((row) => [
        `PAY-${String(row.id).padStart(6, "0")}`, row.orderCode, row.fullName,
        row.phone, Number(row.amount), row.paymentType, row.paymentMethod,
        row.status, row.transactionId || "", row.note || "", row.paidAt || "",
        row.createdAt,
      ]),
    },
  ]);
}

module.exports = { taoBaoCaoThanhToan };

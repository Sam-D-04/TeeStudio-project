"use strict";

const ExcelJS = require("exceljs");
const db = require("../../database/mysql");
const XLSX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function chuanHoaKhoangNgay(tuNgay, denNgay) {
  const ngayHopLe = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const homNay = new Date();
  const nam = homNay.getFullYear();
  const thang = String(homNay.getMonth() + 1).padStart(2, "0");
  const ngay = String(homNay.getDate()).padStart(2, "0");
  const batDau = ngayHopLe(tuNgay) ? tuNgay : `${nam}-${thang}-01`;
  const ketThuc = ngayHopLe(denNgay) ? denNgay : `${nam}-${thang}-${ngay}`;
  return batDau <= ketThuc ? [batDau, ketThuc] : [ketThuc, batDau];
}

function themSheet(workbook, tenSheet, headers, rows) {
  const worksheet = workbook.addWorksheet(tenSheet);
  worksheet.addRow(headers);
  worksheet.addRows(rows);
}

async function taoBaoCaoDashboard(tuNgay, denNgay) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);
  const [donHangResult, chiTietResult, tonKhoResult, thietKeResult] = await Promise.all([
    db.pool.query(
      `SELECT co.id, co.orderCode, a.fullName, a.email,
              COALESCE(NULLIF(ua.recipientName, ''), a.fullName) AS recipientName,
              COALESCE(NULLIF(ua.phone, ''), a.phone) AS phone,
              co.status, co.subtotal, co.discountAmount, co.shippingFee, co.totalAmount,
              co.depositAmount, co.codAmount, co.cancelReason,
              (SELECT COUNT(*) FROM OrderItem oi WHERE oi.orderId = co.id) AS itemLines,
              (SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.orderId = co.id) AS totalQty,
              (SELECT p.paymentMethod FROM Payment p WHERE p.orderId = co.id
               ORDER BY p.createdAt DESC, p.id DESC LIMIT 1) AS paymentMethod,
              (SELECT p.status FROM Payment p WHERE p.orderId = co.id
               ORDER BY p.createdAt DESC, p.id DESC LIMIT 1) AS paymentStatus,
              DATE_FORMAT(co.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM CustomerOrder co
       JOIN Account a ON a.id = co.userId
       LEFT JOIN UserAddress ua ON ua.id = co.addressId
       WHERE co.createdAt >= ? AND co.createdAt < DATE_ADD(?, INTERVAL 1 DAY)
       ORDER BY co.createdAt DESC`,
      [batDau, ketThuc]
    ),
    db.pool.query(
      `SELECT oi.id, co.orderCode, p.id AS productId, p.name AS productName,
              pv.sku, pv.color, pv.size, oi.quantity, oi.unitPrice,
              oi.designFee, oi.lineTotal, oi.productionStatus,
              cd.id AS designId, co.status AS orderStatus,
              DATE_FORMAT(co.createdAt, '%Y-%m-%d %H:%i:%s') AS orderCreatedAt
       FROM OrderItem oi
       JOIN CustomerOrder co ON co.id = oi.orderId
       JOIN ProductVariant pv ON pv.id = oi.variantId
       JOIN Product p ON p.id = pv.productId
       LEFT JOIN CustomDesign cd ON cd.id = oi.designId
       WHERE co.createdAt >= ? AND co.createdAt < DATE_ADD(?, INTERVAL 1 DAY)
       ORDER BY co.createdAt DESC, oi.id`,
      [batDau, ketThuc]
    ),
    db.pool.query(
      `SELECT pv.id, pv.sku, p.name AS productName, c.name AS categoryName,
              pv.color, pv.size, pv.stockQty, p.status,
              DATE_FORMAT(pv.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM ProductVariant pv
       JOIN Product p ON p.id = pv.productId
       JOIN Category c ON c.id = p.categoryId
       ORDER BY p.name, pv.color, pv.size`
    ),
    db.pool.query(
      `SELECT cd.id, cd.status, cd.designFee, cd.adminNote, cd.previewUrl,
              (SELECT co.orderCode
               FROM OrderItem oi
               JOIN CustomerOrder co ON co.id = oi.orderId
               WHERE oi.designId = cd.id
               ORDER BY co.createdAt DESC, co.id DESC
               LIMIT 1) AS orderCode,
              DATE_FORMAT(cd.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt,
              DATE_FORMAT(cd.updatedAt, '%Y-%m-%d %H:%i:%s') AS updatedAt
       FROM CustomDesign cd
       WHERE cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION', 'APPROVED')
         AND cd.createdAt >= ? AND cd.createdAt < DATE_ADD(?, INTERVAL 1 DAY)
       ORDER BY cd.updatedAt DESC`,
      [batDau, ketThuc]
    ),
  ]);

  const workbook = new ExcelJS.Workbook();
  themSheet(
    workbook,
    "Đơn hàng",
    ["ID", "Mã đơn", "Khách hàng", "Email", "Người nhận", "Điện thoại", "Trạng thái",
      "Số dòng SP", "Tổng số lượng", "Tạm tính", "Giảm giá", "Phí vận chuyển",
      "Tổng tiền", "Tiền đặt cọc", "Tiền COD", "Lý do hủy", "Phương thức TT",
      "Trạng thái TT", "Ngày tạo"],
    donHangResult[0].map((row) => [
      row.id, row.orderCode, row.fullName, row.email, row.recipientName, row.phone,
      row.status, Number(row.itemLines), Number(row.totalQty), Number(row.subtotal),
      Number(row.discountAmount), Number(row.shippingFee), Number(row.totalAmount),
      Number(row.depositAmount), Number(row.codAmount), row.cancelReason || "",
      row.paymentMethod || "", row.paymentStatus || "", row.createdAt,
    ])
  );
  themSheet(
    workbook,
    "Chi tiết sản phẩm",
    ["ID dòng", "Mã đơn", "ID sản phẩm", "Sản phẩm", "SKU", "Màu", "Kích cỡ",
      "Số lượng", "Đơn giá", "Phí thiết kế", "Thành tiền", "Trạng thái sản xuất",
      "Mã thiết kế", "Trạng thái đơn", "Ngày tạo đơn"],
    chiTietResult[0].map((row) => [
      row.id, row.orderCode, row.productId, row.productName, row.sku, row.color,
      row.size, Number(row.quantity), Number(row.unitPrice), Number(row.designFee),
      Number(row.lineTotal), row.productionStatus,
      row.designId ? `DESIGN-${row.designId}` : "", row.orderStatus, row.orderCreatedAt,
    ])
  );
  themSheet(
    workbook,
    "Tồn kho",
    ["ID biến thể", "SKU", "Sản phẩm", "Danh mục", "Màu", "Kích cỡ", "Số lượng tồn",
      "Trạng thái sản phẩm", "Ngày tạo"],
    tonKhoResult[0].map((row) => [
      row.id, row.sku, row.productName, row.categoryName, row.color, row.size,
      Number(row.stockQty), row.status, row.createdAt,
    ])
  );
  themSheet(
    workbook,
    "Quản lý thiết kế",
    ["Mã thiết kế", "Mã đơn hàng", "Trạng thái thiết kế", "Phí thiết kế",
      "Ghi chú admin", "Link file thiết kế", "Ngày tạo", "Ngày cập nhật"],
    thietKeResult[0].map((row) => [
      `DESIGN-${row.id}`, row.orderCode || "", row.status, Number(row.designFee),
      row.adminNote || "", row.previewUrl || "", row.createdAt, row.updatedAt,
    ])
  );

  const rawBuffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.isBuffer(rawBuffer) ? rawBuffer : Buffer.from(rawBuffer),
    fileName: `bao-cao-dashboard-${batDau}-den-${ketThuc}.xlsx`,
    contentType: XLSX_MIME_TYPE,
  };
}

module.exports = { taoBaoCaoDashboard };

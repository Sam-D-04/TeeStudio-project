"use strict";

const ExcelJS = require("exceljs");
const db = require("../../database/mysql");
const { dongGoiWorkbookExcel } = require("../../common/utils/excel-report");

const COLORS = {
  brand: "FF1F4E78",
  brandDark: "FF17365D",
  headerText: "FFFFFFFF",
  lightBlue: "FFD9EAF7",
  lightGreen: "FFE2F0D9",
  lightYellow: "FFFFF2CC",
  lightRed: "FFFCE4D6",
  lightGray: "FFF3F6FA",
  border: "FFB7C9D6",
  text: "FF1F2937",
};

const BORDER_THIN = {
  top: { style: "thin", color: { argb: COLORS.border } },
  left: { style: "thin", color: { argb: COLORS.border } },
  bottom: { style: "thin", color: { argb: COLORS.border } },
  right: { style: "thin", color: { argb: COLORS.border } },
};

function laNgayHopLe(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function chuanHoaKhoangNgay(tuNgay, denNgay) {
  const homNay = new Date();
  const nam = homNay.getFullYear();
  const thang = String(homNay.getMonth() + 1).padStart(2, "0");
  const ngay = String(homNay.getDate()).padStart(2, "0");
  const batDau = laNgayHopLe(tuNgay) ? tuNgay : `${nam}-${thang}-01`;
  const ketThuc = laNgayHopLe(denNgay) ? denNgay : `${nam}-${thang}-${ngay}`;
  return batDau <= ketThuc ? [batDau, ketThuc] : [ketThuc, batDau];
}

function dinhDangNgay(yyyyMmDd) {
  const [year, month, day] = String(yyyyMmDd).split("-");
  return `${day}/${month}/${year}`;
}

function dinhDangThoiDiem(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function taoTieuDeBaoCao(batDau, ketThuc) {
  const [startYear, startMonth] = batDau.split("-").map(Number);
  const [endYear, endMonth] = ketThuc.split("-").map(Number);
  if (startYear === endYear && startMonth === endMonth) {
    return `BÁO CÁO DOANH THU & ĐỐI SOÁT THÁNG ${startMonth}/${startYear}`;
  }
  return `BÁO CÁO DOANH THU & ĐỐI SOÁT TỪ ${dinhDangNgay(batDau)} ĐẾN ${dinhDangNgay(ketThuc)}`;
}

function layTenNguoiXuat(nguoiXuat) {
  return nguoiXuat?.fullName || nguoiXuat?.email || "Admin";
}

function parseDateTime(value) {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? value : date;
}

function asNumber(value) {
  return Number(value) || 0;
}

function getFormulaCell(formula, result = 0) {
  return { formula, result };
}

function setTitleRow(worksheet, title, fromCol, toCol) {
  worksheet.mergeCells(1, fromCol, 1, toCol);
  const cell = worksheet.getCell(1, fromCol);
  cell.value = title;
  cell.font = { bold: true, size: 16, color: { argb: COLORS.headerText } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.brand } };
  worksheet.getRow(1).height = 28;
}

function styleMetaLabel(cell) {
  cell.font = { bold: true, color: { argb: COLORS.text } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.lightGray } };
  cell.border = BORDER_THIN;
}

function styleMetaValue(cell) {
  cell.font = { color: { argb: COLORS.text } };
  cell.border = BORDER_THIN;
}

function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COLORS.headerText } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.brandDark } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = BORDER_THIN;
  });
  row.height = 26;
}

function applyNumberFormat(cell, column) {
  if (column.format === "money") {
    cell.numFmt = '#,##0" đ"';
    cell.alignment = { horizontal: "right", vertical: "middle" };
  } else if (column.format === "dateTime") {
    cell.numFmt = "dd/mm/yyyy hh:mm";
    cell.alignment = { horizontal: "center", vertical: "middle" };
  } else if (column.format === "percent") {
    cell.numFmt = "0.00%";
    cell.alignment = { horizontal: "right", vertical: "middle" };
  } else {
    cell.alignment = {
      horizontal: column.align || "left",
      vertical: "middle",
      wrapText: true,
    };
  }
}

function applyDataRowStyle(row, columns) {
  columns.forEach((column, index) => {
    const cell = row.getCell(index + 1);
    applyNumberFormat(cell, column);
    cell.border = BORDER_THIN;
  });
}

function fillRow(row, color) {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
  });
}

function getCellText(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return "dd/mm/yyyy hh:mm";
  if (typeof value === "number") return new Intl.NumberFormat("vi-VN").format(value);
  if (typeof value === "object" && value.formula) {
    return String(value.result ?? value.formula);
  }
  return String(value);
}

function autoFitColumns(worksheet, columns, options = {}) {
  const startRow = options.startRow || 1;
  const endRow = options.endRow || worksheet.rowCount;

  columns.forEach((column, index) => {
    const excelColumn = worksheet.getColumn(index + 1);
    let width = column.width || String(column.header).length + 2;

    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
      const cell = worksheet.getRow(rowNumber).getCell(index + 1);
      width = Math.max(width, getCellText(cell.value).length + 2);
    }

    excelColumn.width = Math.min(
      Math.max(width, column.minWidth || 6),
      column.maxWidth || column.width || 32
    );
  });
}

function addSimpleSheet(workbook, { name, title, columns, rows, periodText, exportedAtText, exportedBy }) {
  const worksheet = workbook.addWorksheet(name);
  setTitleRow(worksheet, title, 1, columns.length);

  worksheet.getCell("A2").value = "Khoảng thời gian";
  worksheet.getCell("B2").value = periodText;
  worksheet.getCell("D2").value = "Ngày xuất";
  worksheet.getCell("E2").value = exportedAtText;
  worksheet.getCell("G2").value = "Người xuất";
  worksheet.getCell("H2").value = exportedBy;
  ["A2", "D2", "G2"].forEach((addr) => styleMetaLabel(worksheet.getCell(addr)));
  ["B2", "E2", "H2"].forEach((addr) => styleMetaValue(worksheet.getCell(addr)));

  const headerRowNumber = 4;
  worksheet.getRow(headerRowNumber).values = columns.map((column) => column.header);
  styleHeaderRow(worksheet.getRow(headerRowNumber));

  rows.forEach((rowData) => {
    const row = worksheet.addRow(columns.map((column) => rowData[column.key]));
    applyDataRowStyle(row, columns);
  });

  worksheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: headerRowNumber, column: columns.length },
  };
  autoFitColumns(worksheet, columns, { startRow: headerRowNumber, endRow: worksheet.rowCount });
  return worksheet;
}

function addSummarySheet(workbook, { title, periodText, exportedAtText, exportedBy, dataStartRow, dataEndRow }) {
  const worksheet = workbook.addWorksheet("Tong quan");
  setTitleRow(worksheet, title, 1, 5);

  worksheet.getCell("A3").value = "Khoảng thời gian";
  worksheet.getCell("B3").value = periodText;
  worksheet.getCell("A4").value = "Ngày xuất";
  worksheet.getCell("B4").value = exportedAtText;
  worksheet.getCell("A5").value = "Người xuất";
  worksheet.getCell("B5").value = exportedBy;
  ["A3", "A4", "A5"].forEach((addr) => styleMetaLabel(worksheet.getCell(addr)));
  ["B3", "B4", "B5"].forEach((addr) => styleMetaValue(worksheet.getCell(addr)));

  worksheet.mergeCells("A7:B7");
  worksheet.getCell("A7").value = "KPI quản trị";
  worksheet.getCell("A7").font = { bold: true, color: { argb: COLORS.headerText } };
  worksheet.getCell("A7").alignment = { horizontal: "center" };
  worksheet.getCell("A7").fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.brand } };

  const sheetName = "'Doi soat tai chinh'";
  const rows = [
    ["Tổng số đơn phát sinh", getFormulaCell(`COUNTA(${sheetName}!B${dataStartRow}:B${dataEndRow})`)],
    ["Doanh thu ghi nhận", getFormulaCell(`SUMIFS(${sheetName}!I${dataStartRow}:I${dataEndRow},${sheetName}!F${dataStartRow}:F${dataEndRow},"COMPLETED",${sheetName}!N${dataStartRow}:N${dataEndRow},"PAID")`)],
    ["Tiền đã thu trong kỳ", getFormulaCell(`SUM(${sheetName}!L${dataStartRow}:L${dataEndRow})`)],
    ["Dòng tiền COD đang treo", getFormulaCell(`SUM(${sheetName}!M${dataStartRow}:M${dataEndRow})`)],
    ["Tỷ lệ hủy đơn", getFormulaCell(`IFERROR(COUNTIF(${sheetName}!F${dataStartRow}:F${dataEndRow},"CANCELLED")/COUNTA(${sheetName}!B${dataStartRow}:B${dataEndRow}),0)`)],
    ["Đơn hoàn tất", getFormulaCell(`COUNTIF(${sheetName}!F${dataStartRow}:F${dataEndRow},"COMPLETED")`)],
    ["Đơn đã thanh toán đủ", getFormulaCell(`COUNTIF(${sheetName}!N${dataStartRow}:N${dataEndRow},"PAID")`)],
    ["Đơn chờ đối soát COD", getFormulaCell(`COUNTIF(${sheetName}!N${dataStartRow}:N${dataEndRow},"PENDING_RECONCILIATION")`)],
    ["Tổng giá trị đơn hàng", getFormulaCell(`SUM(${sheetName}!I${dataStartRow}:I${dataEndRow})`)],
  ];

  rows.forEach(([label, value], index) => {
    const rowNumber = 8 + index;
    worksheet.getCell(rowNumber, 1).value = label;
    worksheet.getCell(rowNumber, 2).value = value;
    worksheet.getCell(rowNumber, 1).font = { bold: true, color: { argb: COLORS.text } };
    worksheet.getCell(rowNumber, 2).font = { bold: true, color: { argb: COLORS.text } };
    worksheet.getCell(rowNumber, 1).border = BORDER_THIN;
    worksheet.getCell(rowNumber, 2).border = BORDER_THIN;
    worksheet.getCell(rowNumber, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: index < 4 ? COLORS.lightBlue : COLORS.lightGreen } };
    worksheet.getCell(rowNumber, 2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.lightGray } };
    worksheet.getCell(rowNumber, 2).alignment = { horizontal: "right" };
  });

  ["B9", "B10", "B11", "B16"].forEach((addr) => {
    worksheet.getCell(addr).numFmt = '#,##0" đ"';
  });
  worksheet.getCell("B12").numFmt = "0.00%";

  worksheet.columns = [
    { width: 30 },
    { width: 22 },
    { width: 4 },
    { width: 18 },
    { width: 18 },
  ];
  worksheet.views = [{ showGridLines: false }];
  return worksheet;
}

function addReconciliationSheet(workbook, { orders }) {
  const columns = [
    { key: "stt", header: "STT", width: 5, maxWidth: 5, align: "center" },
    { key: "orderCode", header: "Mã đơn", width: 13, maxWidth: 14, align: "center" },
    { key: "createdAt", header: "Ngày tạo", width: 16, maxWidth: 16, format: "dateTime" },
    { key: "customerName", header: "Khách hàng", width: 20, maxWidth: 24 },
    { key: "phone", header: "Điện thoại", width: 12, maxWidth: 13, align: "center" },
    { key: "orderStatus", header: "Trạng thái đơn", width: 13, maxWidth: 15, align: "center" },
    { key: "itemLines", header: "Dòng SP", width: 8, maxWidth: 8, align: "center" },
    { key: "totalQty", header: "SL", width: 6, maxWidth: 6, align: "center" },
    { key: "totalAmount", header: "Tổng đơn", width: 14, maxWidth: 15, format: "money" },
    { key: "depositPaidAmount", header: "Đã cọc", width: 13, maxWidth: 14, format: "money" },
    { key: "codAmount", header: "COD cần thu", width: 14, maxWidth: 15, format: "money" },
    { key: "cashRecoveredAmount", header: "Đã thu", width: 13, maxWidth: 14, format: "money" },
    { key: "pendingCodAmount", header: "COD treo", width: 13, maxWidth: 14, format: "money" },
    { key: "reconciliationStatus", header: "Đối soát", width: 18, maxWidth: 21, align: "center" },
    { key: "paymentPolicy", header: "TT", width: 9, maxWidth: 10, align: "center" },
    { key: "paymentChannel", header: "Kênh TT", width: 16, maxWidth: 20, align: "center" },
    { key: "cancelReason", header: "Lý do hủy", width: 22, maxWidth: 28 },
  ];

  const worksheet = workbook.addWorksheet("Doi soat tai chinh");

  const headerRowNumber = 1;
  const dataStartRow = headerRowNumber + 1;
  const hasOrders = orders.length > 0;
  const dataEndRow = dataStartRow + Math.max(orders.length, 1) - 1;

  worksheet.getRow(headerRowNumber).values = columns.map((column) => column.header);
  styleHeaderRow(worksheet.getRow(headerRowNumber));

  if (hasOrders) {
    orders.forEach((order, index) => {
      const row = worksheet.addRow(columns.map((column) => order[column.key]));
      row.getCell(1).value = index + 1;
      applyDataRowStyle(row, columns);

      const reconciliationStatus = order.reconciliationStatus;
      if (reconciliationStatus === "PENDING_RECONCILIATION") {
        fillRow(row, COLORS.lightYellow);
      } else if (reconciliationStatus === "PAID") {
        fillRow(row, COLORS.lightGreen);
      } else if (reconciliationStatus === "CANCELLED") {
        fillRow(row, COLORS.lightRed);
      }
      applyDataRowStyle(row, columns);
    });
  } else {
    const row = worksheet.addRow(columns.map(() => ""));
    applyDataRowStyle(row, columns);
  }

  const totalRowNumber = dataEndRow + 1;
  const totalRow = worksheet.getRow(totalRowNumber);
  totalRow.getCell(1).value = "TỔNG / KIỂM TRA";
  worksheet.mergeCells(totalRowNumber, 1, totalRowNumber, 8);
  [
    [9, `SUM(I${dataStartRow}:I${dataEndRow})`],
    [10, `SUM(J${dataStartRow}:J${dataEndRow})`],
    [11, `SUM(K${dataStartRow}:K${dataEndRow})`],
    [12, `SUM(L${dataStartRow}:L${dataEndRow})`],
    [13, `SUM(M${dataStartRow}:M${dataEndRow})`],
  ].forEach(([columnIndex, formula]) => {
    totalRow.getCell(columnIndex).value = getFormulaCell(formula);
    totalRow.getCell(columnIndex).numFmt = '#,##0" đ"';
  });
  totalRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true, color: { argb: COLORS.text } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.lightBlue } };
    cell.border = BORDER_THIN;
    cell.alignment = { horizontal: "right", vertical: "middle" };
  });
  totalRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

  worksheet.views = [{ state: "frozen", xSplit: 2, ySplit: 1, activeCell: "C2" }];
  worksheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: headerRowNumber, column: columns.length },
  };
  autoFitColumns(worksheet, columns, { startRow: headerRowNumber, endRow: totalRowNumber });
  return { worksheet, dataStartRow, dataEndRow };
}

async function layDuLieuBaoCao(batDau, ketThuc) {
  const [donHangResult, chiTietResult, tonKhoResult, thietKeResult] = await Promise.all([
    db.pool.query(
      `SELECT co.id, co.orderCode, a.fullName, a.email,
              COALESCE(NULLIF(ua.recipientName, ''), a.fullName) AS recipientName,
              COALESCE(NULLIF(ua.phone, ''), a.phone) AS phone,
              co.status, co.paymentType, co.paymentStatus,
              co.subtotal, co.discountAmount, co.shippingFee, co.totalAmount,
              co.depositAmount, co.codAmount, co.cancelReason,
              (SELECT COUNT(*) FROM OrderItem oi WHERE oi.orderId = co.id) AS itemLines,
              (SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.orderId = co.id) AS totalQty,
              latestPayment.paymentMethod AS latestPaymentMethod,
              latestPayment.status AS latestPaymentStatus,
              latestPayment.paymentType AS latestPaymentType,
              COALESCE(paymentSummary.depositPaidAmount, 0) AS depositPaidAmount,
              COALESCE(paymentSummary.onlinePaidAmount, 0) AS onlinePaidAmount,
              COALESCE(paymentSummary.codPaidAmount, 0) AS codPaidAmount,
              COALESCE(paymentSummary.totalPaidAmount, 0) AS totalPaidAmount,
              COALESCE(paymentSummary.pendingCodAmount, 0) AS pendingCodAmount,
              DATE_FORMAT(co.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM CustomerOrder co
       JOIN Account a ON a.id = co.userId
       LEFT JOIN UserAddress ua ON ua.id = co.addressId
       LEFT JOIN (
         SELECT p1.*
         FROM Payment p1
         JOIN (
           SELECT orderId, MAX(id) AS latestPaymentId
           FROM Payment
           GROUP BY orderId
         ) latest ON latest.latestPaymentId = p1.id
       ) latestPayment ON latestPayment.orderId = co.id
       LEFT JOIN (
         SELECT orderId,
                SUM(CASE WHEN status = 'COMPLETED' AND paymentType = 'DEPOSIT' THEN amount ELSE 0 END) AS depositPaidAmount,
                SUM(CASE WHEN status = 'COMPLETED' AND paymentMethod IN ('VNPAY', 'MOMO') THEN amount ELSE 0 END) AS onlinePaidAmount,
                SUM(CASE WHEN status = 'COMPLETED' AND paymentMethod = 'COD' THEN amount ELSE 0 END) AS codPaidAmount,
                SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) AS totalPaidAmount,
                SUM(CASE WHEN status = 'PENDING_RECONCILIATION' AND paymentMethod = 'COD' THEN amount ELSE 0 END) AS pendingCodAmount
         FROM Payment
         GROUP BY orderId
       ) paymentSummary ON paymentSummary.orderId = co.id
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

  return {
    donHangRows: donHangResult[0],
    chiTietRows: chiTietResult[0],
    tonKhoRows: tonKhoResult[0],
    thietKeRows: thietKeResult[0],
  };
}

function mapReconciliationRows(rows) {
  return rows.map((row) => {
    const totalPaidAmount = asNumber(row.totalPaidAmount);
    const pendingCodAmount = asNumber(row.pendingCodAmount);
    const totalAmount = asNumber(row.totalAmount);
    const reconciliationStatus =
      row.status === "CANCELLED"
        ? "CANCELLED"
        : pendingCodAmount > 0
          ? "PENDING_RECONCILIATION"
          : row.paymentStatus === "PAID" || totalPaidAmount >= totalAmount
            ? "PAID"
            : totalPaidAmount > 0
              ? "PARTIALLY_PAID"
              : "PENDING";

    const paymentChannel = [
      row.latestPaymentMethod || "",
      row.latestPaymentType || "",
      row.latestPaymentStatus || "",
    ]
      .filter(Boolean)
      .join(" / ");

    return {
      stt: "",
      orderCode: row.orderCode,
      createdAt: parseDateTime(row.createdAt),
      customerName: row.fullName,
      phone: row.phone || "",
      orderStatus: row.status,
      itemLines: asNumber(row.itemLines),
      totalQty: asNumber(row.totalQty),
      totalAmount,
      depositPaidAmount: asNumber(row.depositPaidAmount),
      codAmount: asNumber(row.codAmount),
      cashRecoveredAmount: totalPaidAmount,
      pendingCodAmount,
      reconciliationStatus,
      paymentPolicy: row.paymentType || "",
      paymentChannel,
      cancelReason: row.cancelReason ? row.cancelReason.replace("[TECH_ADJUST]", "").trim() : "",
    };
  });
}

function mapProductRows(rows) {
  return rows.map((row) => ({
    lineId: row.id,
    orderCode: row.orderCode,
    productId: row.productId,
    productName: row.productName,
    sku: row.sku,
    color: row.color,
    size: row.size,
    quantity: asNumber(row.quantity),
    unitPrice: asNumber(row.unitPrice),
    designFee: asNumber(row.designFee),
    lineTotal: asNumber(row.lineTotal),
    productionStatus: row.productionStatus,
    designCode: row.designId ? `DESIGN-${row.designId}` : "",
    orderStatus: row.orderStatus,
    orderCreatedAt: parseDateTime(row.orderCreatedAt),
  }));
}

function mapInventoryRows(rows) {
  return rows.map((row) => ({
    variantId: row.id,
    sku: row.sku,
    productName: row.productName,
    categoryName: row.categoryName,
    color: row.color,
    size: row.size,
    stockQty: asNumber(row.stockQty),
    productStatus: row.status,
    createdAt: parseDateTime(row.createdAt),
  }));
}

function mapDesignRows(rows) {
  return rows.map((row) => ({
    designCode: `DESIGN-${row.id}`,
    orderCode: row.orderCode || "",
    designStatus: row.status,
    designFee: asNumber(row.designFee),
    adminNote: row.adminNote || "",
    previewUrl: row.previewUrl || "",
    createdAt: parseDateTime(row.createdAt),
    updatedAt: parseDateTime(row.updatedAt),
  }));
}

async function taoBaoCaoThongKe(tuNgay, denNgay, nguoiXuat) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);
  const { donHangRows, chiTietRows, tonKhoRows, thietKeRows } =
    await layDuLieuBaoCao(batDau, ketThuc);

  const workbook = new ExcelJS.Workbook();
  const exportedAt = new Date();
  const exportedBy = layTenNguoiXuat(nguoiXuat);
  const periodText = `${dinhDangNgay(batDau)} - ${dinhDangNgay(ketThuc)}`;
  const exportedAtText = dinhDangThoiDiem(exportedAt);
  const reportTitle = taoTieuDeBaoCao(batDau, ketThuc);

  workbook.creator = exportedBy;
  workbook.created = exportedAt;
  workbook.modified = exportedAt;
  workbook.calcProperties.fullCalcOnLoad = true;

  const reconciliationRows = mapReconciliationRows(donHangRows);
  const reconciliationDataStartRow = 2;
  const reconciliationDataEndRow =
    reconciliationDataStartRow + Math.max(reconciliationRows.length, 1) - 1;

  addSummarySheet(workbook, {
    title: reportTitle,
    periodText,
    exportedAtText,
    exportedBy,
    dataStartRow: reconciliationDataStartRow,
    dataEndRow: reconciliationDataEndRow,
  });

  addReconciliationSheet(workbook, {
    orders: reconciliationRows,
  });

  addSimpleSheet(workbook, {
    name: "Chi tiet san pham",
    title: "CHI TIẾT SẢN PHẨM THEO ĐƠN",
    periodText,
    exportedAtText,
    exportedBy,
    columns: [
      { key: "lineId", header: "ID dòng", width: 10, align: "center" },
      { key: "orderCode", header: "Mã đơn", width: 16, align: "center" },
      { key: "productId", header: "ID sản phẩm", width: 12, align: "center" },
      { key: "productName", header: "Sản phẩm", width: 28 },
      { key: "sku", header: "SKU", width: 18, align: "center" },
      { key: "color", header: "Màu", width: 14 },
      { key: "size", header: "Kích cỡ", width: 10, align: "center" },
      { key: "quantity", header: "Số lượng", width: 10, align: "center" },
      { key: "unitPrice", header: "Đơn giá", width: 16, format: "money" },
      { key: "designFee", header: "Phí thiết kế", width: 16, format: "money" },
      { key: "lineTotal", header: "Thành tiền", width: 16, format: "money" },
      { key: "productionStatus", header: "Trạng thái sản xuất", width: 22, align: "center" },
      { key: "designCode", header: "Mã thiết kế", width: 16, align: "center" },
      { key: "orderStatus", header: "Trạng thái đơn", width: 16, align: "center" },
      { key: "orderCreatedAt", header: "Ngày tạo đơn", width: 18, format: "dateTime" },
    ],
    rows: mapProductRows(chiTietRows),
  });

  addSimpleSheet(workbook, {
    name: "Ton kho",
    title: "TỒN KHO HIỆN TẠI",
    periodText,
    exportedAtText,
    exportedBy,
    columns: [
      { key: "variantId", header: "ID biến thể", width: 12, align: "center" },
      { key: "sku", header: "SKU", width: 18, align: "center" },
      { key: "productName", header: "Sản phẩm", width: 28 },
      { key: "categoryName", header: "Danh mục", width: 18 },
      { key: "color", header: "Màu", width: 14 },
      { key: "size", header: "Kích cỡ", width: 10, align: "center" },
      { key: "stockQty", header: "Số lượng tồn", width: 14, align: "right" },
      { key: "productStatus", header: "Trạng thái sản phẩm", width: 20, align: "center" },
      { key: "createdAt", header: "Ngày tạo", width: 18, format: "dateTime" },
    ],
    rows: mapInventoryRows(tonKhoRows),
  });

  addSimpleSheet(workbook, {
    name: "Quan ly thiet ke",
    title: "QUẢN LÝ THIẾT KẾ",
    periodText,
    exportedAtText,
    exportedBy,
    columns: [
      { key: "designCode", header: "Mã thiết kế", width: 16, align: "center" },
      { key: "orderCode", header: "Mã đơn hàng", width: 16, align: "center" },
      { key: "designStatus", header: "Trạng thái thiết kế", width: 20, align: "center" },
      { key: "designFee", header: "Phí thiết kế", width: 16, format: "money" },
      { key: "adminNote", header: "Ghi chú admin", width: 32 },
      { key: "previewUrl", header: "Link file thiết kế", width: 42 },
      { key: "createdAt", header: "Ngày tạo", width: 18, format: "dateTime" },
      { key: "updatedAt", header: "Ngày cập nhật", width: 18, format: "dateTime" },
    ],
    rows: mapDesignRows(thietKeRows),
  });

  return dongGoiWorkbookExcel(`bao-cao-doanh-thu-doi-soat-${batDau}-den-${ketThuc}.xlsx`, workbook);
}

module.exports = { taoBaoCaoThongKe };

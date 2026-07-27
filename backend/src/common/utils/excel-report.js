"use strict";

const ExcelJS = require("exceljs");

const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// ── Màu sắc & style ──────────────────────────────────────────────────
const COLOR_HEADER_BG   = "FF1E3A5F"; // xanh đậm navy
const COLOR_HEADER_FG   = "FFFFFFFF"; // chữ trắng
const COLOR_ROW_EVEN    = "FFF0F4FA"; // xanh rất nhạt - hàng chẵn
const COLOR_BORDER      = "FFB0BEC5"; // xám nhạt cho border

const HEADER_FONT   = { bold: true, color: { argb: COLOR_HEADER_FG }, size: 11, name: "Arial" };
const DATA_FONT     = { size: 10, name: "Arial" };
const HEADER_FILL  = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_HEADER_BG } };
const EVEN_FILL    = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ROW_EVEN } };
const THIN_BORDER  = { style: "thin", color: { argb: COLOR_BORDER } };
const CELL_BORDER  = { top: THIN_BORDER, left: THIN_BORDER, bottom: THIN_BORDER, right: THIN_BORDER };

async function dongGoiWorkbookExcel(fileName, workbook) {
  const rawBuffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.isBuffer(rawBuffer) ? rawBuffer : Buffer.from(rawBuffer),
    fileName,
    contentType: XLSX_MIME_TYPE,
  };
}

/**
 * Tạo file Excel có định dạng đẹp.
 *
 * @param {string} fileName   - Tên file xuất ra
 * @param {Array}  sheets     - Mảng sheet, mỗi phần tử:
 *   {
 *     name:         string,        // tên sheet tab
 *     headers:      string[],      // tiêu đề các cột
 *     rows:         any[][],       // dữ liệu
 *     columnWidths: number[],      // (tuỳ chọn) độ rộng từng cột (ký tự)
 *     wrapCols:     number[],      // (tuỳ chọn) index cột (0-based) cần wrap text
 *   }
 */
async function taoBaoCaoExcel(fileName, sheets) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TeeStudio";
  workbook.created = new Date();

  sheets.forEach(({ name, headers, rows, columnWidths = [], wrapCols = [] }) => {
    const ws = workbook.addWorksheet(name, {
      views: [{ state: "frozen", ySplit: 1 }], // đóng băng hàng tiêu đề
    });

    // ── 1. Gán độ rộng cột ──────────────────────────────────────────
    headers.forEach((_, colIdx) => {
      ws.getColumn(colIdx + 1).width = columnWidths[colIdx] ?? 18;
    });

    // ── 2. Hàng tiêu đề ─────────────────────────────────────────────
    const headerRow = ws.addRow(headers);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font       = HEADER_FONT;
      cell.fill       = HEADER_FILL;
      cell.border     = CELL_BORDER;
      cell.alignment  = { vertical: "middle", horizontal: "center", wrapText: false };
    });

    // ── 3. Hàng dữ liệu ─────────────────────────────────────────────
    const wrapSet = new Set(wrapCols);
    rows.forEach((rowData, rowIdx) => {
      const row = ws.addRow(rowData);
      const isEven = rowIdx % 2 === 1;
      row.height = 18;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font   = DATA_FONT;
        cell.border = CELL_BORDER;
        if (isEven) cell.fill = EVEN_FILL;

        const colIdx0 = colNumber - 1;
        if (wrapSet.has(colIdx0)) {
          cell.alignment = { vertical: "top", wrapText: true };
          row.height = 54; // cao hơn cho ô wrap
        } else {
          cell.alignment = { vertical: "middle" };
        }
      });
    });
  });

  return dongGoiWorkbookExcel(fileName, workbook);
}

function guiBaoCaoExcel(res, report) {
  const encodedFileName = encodeURIComponent(report.fileName);
  res.set({
    "Content-Type": report.contentType,
    "Content-Disposition":
      `attachment; filename="${report.fileName}"; ` +
      `filename*=UTF-8''${encodedFileName}`,
    "Content-Length": report.buffer.length,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Expose-Headers": "Content-Disposition",
  });

  return res.status(200).send(report.buffer);
}

module.exports = { dongGoiWorkbookExcel, taoBaoCaoExcel, guiBaoCaoExcel };

"use strict";

const ExcelJS = require("exceljs");

const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

async function taoBaoCaoExcel(fileName, sheets) {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach(({ name, headers, rows }) => {
    const worksheet = workbook.addWorksheet(name);
    worksheet.addRow(headers);
    worksheet.addRows(rows);
  });

  const rawBuffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.isBuffer(rawBuffer) ? rawBuffer : Buffer.from(rawBuffer),
    fileName,
    contentType: XLSX_MIME_TYPE,
  };
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

module.exports = { taoBaoCaoExcel, guiBaoCaoExcel };

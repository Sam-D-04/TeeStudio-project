"use strict";

function taoBoLocThanhToan(queryParams = {}) {
  const trangThai = queryParams.trangThai || "tat_ca";
  const phuongThuc = queryParams.phuongThuc || "tat_ca";
  const tuKhoa = String(queryParams.tuKhoa || "").trim();
  const thoiGian = queryParams.thoiGian || "";
  const tuNgay = String(queryParams.tuNgay || "");
  const denNgay = String(queryParams.denNgay || "");
  const cotNgay =
    queryParams.kieuNgay === "ngay_thanh_toan" ? "p.paidAt" : "p.createdAt";
  const conditions = [];
  const params = [];

  if (trangThai === "can_doi_soat") {
    conditions.push("p.status = 'PENDING' AND p.paymentMethod = 'COD'");
  } else if (trangThai === "cho_thanh_toan") {
    conditions.push("p.status = 'PENDING' AND p.paymentMethod IN ('VNPAY', 'MOMO')");
  } else if (trangThai === "da_thanh_toan") {
    conditions.push("p.status = 'COMPLETED'");
  } else if (trangThai === "that_bai") {
    conditions.push("p.status IN ('FAILED', 'CANCELLED')");
  }

  if (phuongThuc !== "tat_ca") {
    conditions.push("p.paymentMethod = ?");
    params.push(String(phuongThuc).toUpperCase());
  }

  if (tuKhoa) {
    conditions.push(
      "(co.orderCode LIKE ? OR p.transactionId LIKE ? OR a.fullName LIKE ?)"
    );
    const like = `%${tuKhoa}%`;
    params.push(like, like, like);
  }

  if (thoiGian === "hom_nay") {
    conditions.push(`DATE(${cotNgay}) = CURDATE()`);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(tuNgay)) {
    conditions.push(`DATE(${cotNgay}) >= ?`);
    params.push(tuNgay);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(denNgay)) {
    conditions.push(`DATE(${cotNgay}) <= ?`);
    params.push(denNgay);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

module.exports = { taoBoLocThanhToan };

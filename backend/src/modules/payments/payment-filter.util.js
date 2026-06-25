"use strict";

function taoBoLocThanhToan(queryParams = {}) {
  const trangThai = queryParams.trangThai || "tat_ca";
  const phuongThuc = queryParams.phuongThuc || "tat_ca";
  const tuKhoa = String(queryParams.tuKhoa || "").trim();
  const tab = queryParams.tab || "tat_ca";
  const thoiGian = queryParams.thoiGian || "";
  const tuNgay = String(queryParams.tuNgay || "");
  const denNgay = String(queryParams.denNgay || "");
  const conditions = [];
  const params = [];
  const filterKey = tab !== "tat_ca" ? tab : trangThai;

  if (filterKey === "can_doi_soat") {
    conditions.push("p.status = 'PENDING' AND p.paymentMethod = 'COD'");
  } else if (filterKey === "cho_thanh_toan") {
    conditions.push("p.status = 'PENDING' AND p.paymentMethod = 'VNPAY'");
  } else if (filterKey === "da_thanh_toan") {
    conditions.push("p.status = 'COMPLETED'");
  } else if (filterKey === "that_bai") {
    conditions.push("p.status IN ('FAILED', 'CANCELLED')");
  } else if (filterKey === "hoan_tien") {
    conditions.push("p.status = 'REFUNDED'");
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
    conditions.push("DATE(p.createdAt) = CURDATE()");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(tuNgay)) {
    conditions.push("DATE(p.createdAt) >= ?");
    params.push(tuNgay);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(denNgay)) {
    conditions.push("DATE(p.createdAt) <= ?");
    params.push(denNgay);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

module.exports = { taoBoLocThanhToan };

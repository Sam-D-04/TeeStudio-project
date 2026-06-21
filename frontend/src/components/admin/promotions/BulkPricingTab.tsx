"use client";

import { useState } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";

/**
 * BulkPricingTab – Tab "Giá số lượng lớn".
 *
 * Quản trị viên thiết lập bảng giá theo số lượng áo đặt hàng.
 * Ví dụ: Đặt 10-29 áo → giảm 5%, đặt từ 30 áo trở lên → giảm 10%.
 *
 * Bảng dữ liệu gồm:
 *  - Số lượng từ (tuSoLuong)
 *  - Số lượng đến (denSoLuong) – null = không giới hạn
 *  - Phần trăm giảm (phanTramGiam)
 *  - Nút sửa / xóa
 */

// Kiểu dữ liệu cho một dải giá số lượng lớn
// Phải khớp với structure JSON từ Backend
type DaiGia = {
  id: number;
  tuSoLuong: number;        // Từ x cái
  denSoLuong: number | null; // Đến y cái (null = từ x trở lên)
  phanTramGiam: number;     // % giảm, ví dụ 5 = 5%
};

// Dữ liệu mẫu tĩnh để hiển thị demo giao diện
// Trong thực tế: thay bằng dữ liệu từ API GET /api/admin/pricing/bulk
const DU_LIEU_MAU: DaiGia[] = [
  { id: 1, tuSoLuong: 10, denSoLuong: 29, phanTramGiam: 5 },
  { id: 2, tuSoLuong: 30, denSoLuong: 49, phanTramGiam: 8 },
  { id: 3, tuSoLuong: 50, denSoLuong: null, phanTramGiam: 12 },
];

export default function BulkPricingTab() {
  // State danh sách bảng giá
  const [danhSach, setDanhSach] = useState<DaiGia[]>(DU_LIEU_MAU);

  // State form thêm mới
  const [dangThem, setDangThem] = useState(false);
  const [formMoi, setFormMoi] = useState({
    tuSoLuong: "",
    denSoLuong: "",
    phanTramGiam: "",
  });

  // Hàm xóa một dải giá
  function xoaDaiGia(id: number) {
    if (window.confirm("Bạn có chắc muốn xóa dải giá này?")) {
      setDanhSach((ds) => ds.filter((d) => d.id !== id));
    }
  }

  // Hàm lưu dải giá mới (demo: chỉ thêm vào state)
  // Thực tế: gọi API POST /api/admin/pricing/bulk
  function luuDaiGiaMoi() {
    const tuSo = parseInt(formMoi.tuSoLuong);
    const denSo = formMoi.denSoLuong === "" ? null : parseInt(formMoi.denSoLuong);
    const giamPT = parseFloat(formMoi.phanTramGiam);

    if (isNaN(tuSo) || isNaN(giamPT)) {
      alert("Vui lòng điền đầy đủ thông tin hợp lệ.");
      return;
    }

    const bangGiaMoi: DaiGia = {
      id: Date.now(),
      tuSoLuong: tuSo,
      denSoLuong: denSo,
      phanTramGiam: giamPT,
    };

    setDanhSach((ds) => [...ds, bangGiaMoi]);
    setFormMoi({ tuSoLuong: "", denSoLuong: "", phanTramGiam: "" });
    setDangThem(false);
  }

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
      }}
    >
      {/* Tiêu đề + nút thêm */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f8fafc",
        }}
      >
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Bảng giá theo số lượng
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
            Thiết lập mức giảm giá tự động khi khách đặt số lượng lớn
          </p>
        </div>

        {/* Nút Thêm dải giá */}
        <button
          onClick={() => setDangThem(true)}
          style={{
            height: 36,
            padding: "0 14px",
            background: "#0ea5e9",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0284c7";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0ea5e9";
          }}
        >
          <PlusOutlined />
          Thêm dải giá
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Số lượng từ (cái)", "Số lượng đến (cái)", "Giảm (%)", "Thao tác"].map(
                (tieu, idx) => (
                  <th
                    key={idx}
                    style={{
                      padding: "10px 16px",
                      textAlign: idx === 3 ? "right" : "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {tieu}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {danhSach.map((dai) => (
              <tr
                key={dai.id}
                style={{ borderBottom: "1px solid #e2e8f0" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent";
                }}
              >
                <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>
                  {dai.tuSoLuong.toLocaleString("vi-VN")}
                </td>
                <td style={{ padding: "12px 16px", color: "#475569" }}>
                  {dai.denSoLuong === null
                    ? "Không giới hạn"
                    : dai.denSoLuong.toLocaleString("vi-VN")}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {/* Badge % giảm – màu xanh */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderRadius: 9999,
                      backgroundColor: "#e0f2fe",
                      color: "#0284c7",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    -{dai.phanTramGiam}%
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                    <button
                      title="Chỉnh sửa"
                      style={{
                        padding: 6,
                        border: "none",
                        background: "transparent",
                        color: "#94a3b8",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = "#eaeef2";
                        el.style.color = "#0f172a";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = "transparent";
                        el.style.color = "#94a3b8";
                      }}
                    >
                      <EditOutlined />
                    </button>
                    <button
                      title="Xóa"
                      onClick={() => xoaDaiGia(dai.id)}
                      style={{
                        padding: 6,
                        border: "none",
                        background: "transparent",
                        color: "#94a3b8",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = "#ffdad6";
                        el.style.color = "#ea580c";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = "transparent";
                        el.style.color = "#94a3b8";
                      }}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Form thêm mới – hiện khi dangThem=true */}
            {dangThem && (
              <tr style={{ backgroundColor: "#f0f9ff", borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 16px" }}>
                  <input
                    type="number"
                    placeholder="10"
                    value={formMoi.tuSoLuong}
                    onChange={(e) =>
                      setFormMoi((f) => ({ ...f, tuSoLuong: e.target.value }))
                    }
                    style={{
                      width: 90,
                      height: 34,
                      padding: "0 8px",
                      border: "1px solid #0ea5e9",
                      borderRadius: 6,
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <input
                    type="number"
                    placeholder="Để trống = không giới hạn"
                    value={formMoi.denSoLuong}
                    onChange={(e) =>
                      setFormMoi((f) => ({ ...f, denSoLuong: e.target.value }))
                    }
                    style={{
                      width: 140,
                      height: 34,
                      padding: "0 8px",
                      border: "1px solid #0ea5e9",
                      borderRadius: 6,
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <input
                    type="number"
                    placeholder="5"
                    value={formMoi.phanTramGiam}
                    onChange={(e) =>
                      setFormMoi((f) => ({ ...f, phanTramGiam: e.target.value }))
                    }
                    style={{
                      width: 70,
                      height: 34,
                      padding: "0 8px",
                      border: "1px solid #0ea5e9",
                      borderRadius: 6,
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <button
                      onClick={luuDaiGiaMoi}
                      title="Lưu"
                      style={{
                        padding: "6px 12px",
                        background: "#0ea5e9",
                        border: "none",
                        borderRadius: 6,
                        color: "#fff",
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <SaveOutlined /> Lưu
                    </button>
                    <button
                      onClick={() => setDangThem(false)}
                      title="Hủy"
                      style={{
                        padding: "6px 10px",
                        background: "transparent",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        color: "#475569",
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ghi chú hướng dẫn */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
        }}
      >
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
          💡 Mức giảm sẽ được áp dụng tự động khi khách đặt số lượng đủ điều kiện. Các dải giá không được chồng chéo nhau.
        </p>
      </div>
    </div>
  );
}

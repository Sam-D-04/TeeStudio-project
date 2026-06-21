"use client";

import { useState } from "react";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";

/**
 * PrintSurchargeTab – Tab "Phụ phí in & thiết kế".
 *
 * Quản trị viên thiết lập các khoản phụ phí bổ sung khi in ấn.
 * Ví dụ:
 *  - Phí hình in lớn (>A4): +30.000đ/áo
 *  - Phí thêu tay: +50.000đ/áo
 *  - Phí in 2 mặt: +20.000đ/áo
 *  - Phí in màu đặc biệt (spot color): +15.000đ/màu
 *
 * Khi Admin thay đổi giá trị và nhấn "Lưu thay đổi",
 * Frontend gọi API PUT /api/admin/pricing/surcharges để cập nhật.
 */

// Kiểu dữ liệu cho một khoản phụ phí
type PhuPhi = {
  id: number;
  tenPhuPhi: string;     // Tên phụ phí hiển thị
  moTa: string;          // Mô tả ngắn
  giaTri: number;        // Giá trị (VNĐ)
  donVi: string;         // Đơn vị: "/áo", "/màu", v.v.
  dangBat: boolean;      // true = đang áp dụng
};

// Dữ liệu mẫu tĩnh – thực tế lấy từ API
const DU_LIEU_MAU: PhuPhi[] = [
  {
    id: 1,
    tenPhuPhi: "In hình lớn (>A4)",
    moTa: "Áp dụng khi khách chọn vùng in vượt kích thước A4",
    giaTri: 30000,
    donVi: "/áo",
    dangBat: true,
  },
  {
    id: 2,
    tenPhuPhi: "Thêu tay",
    moTa: "Phụ phí cho kỹ thuật thêu logo hoặc chữ",
    giaTri: 50000,
    donVi: "/áo",
    dangBat: true,
  },
  {
    id: 3,
    tenPhuPhi: "In 2 mặt",
    moTa: "Khi khách đặt thiết kế cả mặt trước và mặt sau",
    giaTri: 20000,
    donVi: "/áo",
    dangBat: true,
  },
  {
    id: 4,
    tenPhuPhi: "In màu đặc biệt (spot color)",
    moTa: "Mỗi màu Pantone thêm vào bản in",
    giaTri: 15000,
    donVi: "/màu",
    dangBat: false,
  },
];

export default function PrintSurchargeTab() {
  const [danhSach, setDanhSach] = useState<PhuPhi[]>(DU_LIEU_MAU);
  // ID của phụ phí đang được sửa (null = không sửa)
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  // Giá trị tạm thời khi đang sửa
  const [giaTamThoi, setGiaTamThoi] = useState<string>("");

  // Bắt đầu chỉnh sửa: lưu giá trị hiện tại vào state tạm
  function batDauSua(phuPhi: PhuPhi) {
    setDangSuaId(phuPhi.id);
    setGiaTamThoi(String(phuPhi.giaTri));
  }

  // Lưu thay đổi sau khi sửa
  // Thực tế: gọi API PUT /api/admin/pricing/surcharges/:id
  function luuThayDoi(id: number) {
    const giaTriMoi = parseInt(giaTamThoi);
    if (isNaN(giaTriMoi) || giaTriMoi < 0) {
      alert("Giá trị không hợp lệ. Vui lòng nhập số nguyên dương.");
      return;
    }
    setDanhSach((ds) =>
      ds.map((pp) => (pp.id === id ? { ...pp, giaTri: giaTriMoi } : pp)),
    );
    setDangSuaId(null);
  }

  // Bật/tắt phụ phí
  // Thực tế: gọi API PATCH /api/admin/pricing/surcharges/:id
  function batTatPhuPhi(id: number) {
    setDanhSach((ds) =>
      ds.map((pp) => (pp.id === id ? { ...pp, dangBat: !pp.dangBat } : pp)),
    );
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
      {/* Tiêu đề */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
        }}
      >
        <h3
          style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}
        >
          Phụ phí in ấn & Thiết kế
        </h3>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
          Các khoản phí bổ sung được tính tự động vào báo giá cho khách hàng
        </p>
      </div>

      {/* Danh sách phụ phí dạng card */}
      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {danhSach.map((pp) => {
          const dangSua = dangSuaId === pp.id;

          return (
            <div
              key={pp.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                backgroundColor: pp.dangBat ? "#ffffff" : "#f8fafc",
                opacity: pp.dangBat ? 1 : 0.65,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                transition: "all 0.2s ease",
              }}
            >
              {/* Phần thông tin bên trái */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  {/* Tên phụ phí */}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {pp.tenPhuPhi}
                  </span>

                  {/* Badge trạng thái bật/tắt */}
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      backgroundColor: pp.dangBat ? "#dcfce7" : "#e4e9ed",
                      color: pp.dangBat ? "#10b981" : "#6e7881",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {pp.dangBat ? "Đang bật" : "Đã tắt"}
                  </span>
                </div>

                {/* Mô tả */}
                <p
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    margin: 0,
                  }}
                >
                  {pp.moTa}
                </p>
              </div>

              {/* Phần giá trị bên phải */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                {/* Ô nhập giá hoặc hiển thị giá */}
                {dangSua ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <input
                      type="number"
                      value={giaTamThoi}
                      onChange={(e) => setGiaTamThoi(e.target.value)}
                      style={{
                        width: 100,
                        height: 34,
                        padding: "0 8px",
                        border: "1px solid #0ea5e9",
                        borderRadius: 6,
                        fontSize: 13,
                        textAlign: "right",
                        outline: "none",
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      VNĐ{pp.donVi}
                    </span>

                    {/* Nút lưu */}
                    <button
                      onClick={() => luuThayDoi(pp.id)}
                      title="Lưu"
                      style={{
                        width: 30,
                        height: 30,
                        border: "none",
                        background: "#0ea5e9",
                        color: "#fff",
                        borderRadius: 6,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                      }}
                    >
                      <SaveOutlined />
                    </button>
                    {/* Nút hủy */}
                    <button
                      onClick={() => setDangSuaId(null)}
                      title="Hủy"
                      style={{
                        width: 30,
                        height: 30,
                        border: "1px solid #e2e8f0",
                        background: "transparent",
                        color: "#94a3b8",
                        borderRadius: 6,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                      }}
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Hiển thị giá */}
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#0ea5e9",
                      }}
                    >
                      +{pp.giaTri.toLocaleString("vi-VN")}đ
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {pp.donVi}
                    </span>

                    {/* Nút sửa */}
                    <button
                      onClick={() => batDauSua(pp)}
                      title="Chỉnh sửa giá"
                      style={{
                        width: 30,
                        height: 30,
                        border: "1px solid #e2e8f0",
                        background: "transparent",
                        color: "#94a3b8",
                        borderRadius: 6,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        transition: "all 0.15s ease",
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
                  </>
                )}

                {/* Toggle bật/tắt phụ phí */}
                <button
                  onClick={() => batTatPhuPhi(pp.id)}
                  title={pp.dangBat ? "Tắt phụ phí này" : "Bật phụ phí này"}
                  style={{
                    position: "relative",
                    width: 44,
                    height: 24,
                    border: "none",
                    borderRadius: 12,
                    backgroundColor: pp.dangBat ? "#0ea5e9" : "#e2e8f0",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {/* Nút tròn của toggle */}
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: pp.dangBat ? 22 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      transition: "left 0.2s ease",
                      display: "block",
                    }}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ghi chú */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
        }}
      >
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
          💡 Phụ phí được tắt sẽ không hiển thị trong bảng báo giá cho khách hàng. Thay đổi có hiệu lực ngay sau khi lưu.
        </p>
      </div>
    </div>
  );
}

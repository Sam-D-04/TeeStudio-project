"use client";

import { useState } from "react";
import { SaveOutlined, InfoCircleOutlined } from "@ant-design/icons";

/**
 * PriceFormulaTab – Tab "Công thức báo giá".
 *
 * Quản trị viên thiết lập công thức tính giá tự động.
 * Công thức cơ bản:
 *   Giá bán = (Giá vốn áo * Hệ số lãi) + Phí in + Phụ phí
 *
 * Các tham số có thể cấu hình:
 *  - Hệ số lãi cơ bản (markup)
 *  - Làm tròn giá (đến bao nhiêu đồng)
 *  - Phí vận chuyển mặc định
 *  - Ngưỡng miễn phí ship
 *
 * Thực tế: gọi API PUT /api/admin/pricing/formula để lưu
 */

// Kiểu dữ liệu cho công thức báo giá
type CongThucBaoGia = {
  heSoLaiCoban: string;         // Hệ số nhân trên giá vốn (ví dụ: 1.5 = lãi 50%)
  lamTronDen: string;           // Làm tròn đến x đồng (ví dụ: 1000 = làm tròn đến 1.000đ)
  phiVanChuyenMacDinh: string;  // Phí ship mặc định (VNĐ)
  nguongMienPhiShip: string;    // Đơn từ bao nhiêu được miễn phí ship
  chiSoVATPhaTram: string;      // % VAT (0 = không tính VAT)
};

// Giá trị mặc định
const CAU_HINH_MAC_DINH: CongThucBaoGia = {
  heSoLaiCoban: "1.5",
  lamTronDen: "1000",
  phiVanChuyenMacDinh: "30000",
  nguongMienPhiShip: "500000",
  chiSoVATPhaTram: "0",
};

export default function PriceFormulaTab() {
  const [caiDat, setCaiDat] = useState<CongThucBaoGia>(CAU_HINH_MAC_DINH);
  const [daDangLuu, setDaDangLuu] = useState(false);

  // Hàm cập nhật một trường
  function capNhat<K extends keyof CongThucBaoGia>(
    truong: K,
    giaTri: CongThucBaoGia[K],
  ) {
    setCaiDat((truocDo) => ({ ...truocDo, [truong]: giaTri }));
    setDaDangLuu(false); // Reset trạng thái "đã lưu" khi có thay đổi mới
  }

  // Hàm lưu công thức
  // Thực tế: gọi API PUT /api/admin/pricing/formula
  function luuCongThuc() {
    console.log("Dữ liệu gửi lên Backend:", caiDat);
    // TODO: gọi API thực tế
    setDaDangLuu(true);
    setTimeout(() => setDaDangLuu(false), 3000);
  }

  // Tính giá ví dụ dựa theo cấu hình hiện tại
  // Giả sử: áo trắng tay ngắn giá vốn 80.000đ, phí in 30.000đ
  const heSo = parseFloat(caiDat.heSoLaiCoban) || 1;
  const giaVon = 80000;
  const phiIn = 30000;
  const lamTron = parseInt(caiDat.lamTronDen) || 1000;
  const giaThucTe = Math.ceil((giaVon * heSo + phiIn) / lamTron) * lamTron;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Card công thức chính */}
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
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Cấu hình công thức tính giá
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
            Hệ thống sẽ tự động áp dụng công thức này khi tính giá báo giá cho khách hàng
          </p>
        </div>

        {/* Form các tham số */}
        <div
          style={{
            padding: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {/* Hệ số lãi */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Hệ số lãi cơ bản
              <span
                title="Giá bán = Giá vốn × Hệ số lãi + Phí in"
                style={{ marginLeft: 4, color: "#94a3b8", cursor: "help" }}
              >
                <InfoCircleOutlined />
              </span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                step="0.1"
                min="1"
                value={caiDat.heSoLaiCoban}
                onChange={(e) => capNhat("heSoLaiCoban", e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 50px 0 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0ea5e9";
                  e.target.style.boxShadow = "0 0 0 2px rgba(14,165,233,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 11,
                  color: "#94a3b8",
                }}
              >
                × giá vốn
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
              1.5 = lãi 50% trên giá vốn
            </p>
          </div>

          {/* Làm tròn giá */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Làm tròn giá đến
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                step="500"
                min="0"
                value={caiDat.lamTronDen}
                onChange={(e) => capNhat("lamTronDen", e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 40px 0 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0ea5e9";
                  e.target.style.boxShadow = "0 0 0 2px rgba(14,165,233,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 11,
                  color: "#94a3b8",
                }}
              >
                đ
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
              1000 = làm tròn lên đến hàng nghìn đồng
            </p>
          </div>

          {/* Phí vận chuyển mặc định */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Phí vận chuyển mặc định
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                min="0"
                value={caiDat.phiVanChuyenMacDinh}
                onChange={(e) => capNhat("phiVanChuyenMacDinh", e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 40px 0 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0ea5e9";
                  e.target.style.boxShadow = "0 0 0 2px rgba(14,165,233,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 11,
                  color: "#94a3b8",
                }}
              >
                VNĐ
              </span>
            </div>
          </div>

          {/* Ngưỡng miễn phí ship */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Ngưỡng miễn phí vận chuyển
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                min="0"
                value={caiDat.nguongMienPhiShip}
                onChange={(e) => capNhat("nguongMienPhiShip", e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 40px 0 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0ea5e9";
                  e.target.style.boxShadow = "0 0 0 2px rgba(14,165,233,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 11,
                  color: "#94a3b8",
                }}
              >
                VNĐ
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
              Đơn hàng từ ngưỡng này trở lên được miễn phí vận chuyển
            </p>
          </div>

          {/* % VAT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Thuế VAT (%)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                min="0"
                max="30"
                value={caiDat.chiSoVATPhaTram}
                onChange={(e) => capNhat("chiSoVATPhaTram", e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 30px 0 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0ea5e9";
                  e.target.style.boxShadow = "0 0 0 2px rgba(14,165,233,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 12,
                  color: "#94a3b8",
                }}
              >
                %
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
              0 = không tính VAT
            </p>
          </div>
        </div>

        {/* Nút lưu */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          {/* Thông báo đã lưu */}
          {daDangLuu && (
            <span
              style={{
                fontSize: 13,
                color: "#10b981",
                fontWeight: 600,
                animation: "fadeIn 0.3s ease",
              }}
            >
              ✓ Đã lưu thành công
            </span>
          )}

          <button
            onClick={luuCongThuc}
            style={{
              height: 40,
              padding: "0 20px",
              background: "#0ea5e9",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#0284c7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#0ea5e9";
            }}
          >
            <SaveOutlined />
            Lưu công thức
          </button>
        </div>
      </div>

      {/* Card xem trước kết quả */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Xem trước: Ví dụ tính giá
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
            Áo thun cổ tròn trắng – giá vốn 80.000đ + phí in cơ bản 30.000đ
          </p>
        </div>

        <div style={{ padding: 20 }}>
          {/* Công thức hiển thị bước bước */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: 10,
              padding: 16,
              fontFamily: "monospace",
              fontSize: 13,
              color: "#0f172a",
              lineHeight: 2,
            }}
          >
            <div>
              Giá vốn áo:{" "}
              <span style={{ fontWeight: 700, color: "#0ea5e9" }}>80.000đ</span>
            </div>
            <div>
              × Hệ số lãi:{" "}
              <span style={{ fontWeight: 700, color: "#0ea5e9" }}>
                {caiDat.heSoLaiCoban}
              </span>{" "}
              = {(giaVon * heSo).toLocaleString("vi-VN")}đ
            </div>
            <div>
              + Phí in cơ bản:{" "}
              <span style={{ fontWeight: 700, color: "#0ea5e9" }}>30.000đ</span>
            </div>
            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: 8,
                marginTop: 8,
              }}
            >
              = {(giaVon * heSo + phiIn).toLocaleString("vi-VN")}đ
            </div>
            <div>
              → Làm tròn đến {parseInt(caiDat.lamTronDen).toLocaleString("vi-VN")}đ:{" "}
              <span
                style={{ fontWeight: 800, color: "#0ea5e9", fontSize: 16 }}
              >
                {giaThucTe.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

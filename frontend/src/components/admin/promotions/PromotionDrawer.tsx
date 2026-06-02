"use client";

import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Drawer } from "antd";
import type { MaKhuyenMai } from "./PromotionTable";

/**
 * PromotionDrawer – Panel tạo/sửa mã khuyến mãi dạng ngăn kéo (Drawer).
 *
 * Sử dụng Ant Design <Drawer> – giống với OrderDetailDrawer ở module đơn hàng.
 * Khi mở: panel trượt vào từ bên phải, phần nền phía sau tối lại tự động.
 * Khi đóng: panel trượt ra, nền trở lại bình thường.
 * Không đẩy hay thu hẹp nội dung phía sau – đè lên hoàn toàn.
 *
 * Form gồm các trường:
 *  1. Mã khuyến mãi (text, tự động viết hoa) + nút tạo ngẫu nhiên
 *  2. Loại giảm giá (radio buttons: %, số tiền, miễn phí ship)
 *  3. Giá trị giảm (hiển thị khi không phải miễn phí ship)
 *  4. Giá trị đơn hàng tối thiểu
 *  5. Ngày bắt đầu + ngày kết thúc
 *  6. Giới hạn tổng lượt dùng
 *  7. Checkbox: Chỉ dành cho khách hàng mới
 */

// Kiểu dữ liệu cho form – dùng string để các ô input hoạt động đúng
export type FormMaKhuyenMai = {
  ma: string;                                               // Mã code
  loaiGiam: "phan_tram" | "so_tien" | "mien_phi_ship";    // Loại giảm
  giaTriGiam: string;                                       // Giá trị (string vì là input)
  donToiThieu: string;                                      // Đơn tối thiểu (VNĐ)
  ngayBatDau: string;                                       // ISO date cho input[type=date]
  ngayKetThuc: string;                                      // ISO date hoặc ""
  gioiHanLuot: string;                                      // "" = không giới hạn
  chiDanhChoKhachMoi: boolean;                              // Checkbox
};

// Giá trị mặc định khi mở form tạo mới
const FORM_MAC_DINH: FormMaKhuyenMai = {
  ma: "",
  loaiGiam: "phan_tram",
  giaTriGiam: "",
  donToiThieu: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  gioiHanLuot: "",
  chiDanhChoKhachMoi: false,
};

type PromotionDrawerProps = {
  moDrawer: boolean;                         // true = drawer đang mở
  dangSua: boolean;                          // true = đang ở chế độ sửa
  duLieuDangSua?: MaKhuyenMai | null;        // Dữ liệu mã đang được sửa
  onDong: () => void;                        // Callback khi đóng drawer
  onLuu: (duLieu: FormMaKhuyenMai) => void; // Callback khi submit form
};

// Hàm tạo mã ngẫu nhiên gồm 6-8 ký tự chữ hoa và số
function taoMaNgauNhien(): string {
  const kyTu = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const doDai = Math.floor(Math.random() * 3) + 6; // 6 đến 8 ký tự
  let ket = "";
  for (let i = 0; i < doDai; i++) {
    ket += kyTu[Math.floor(Math.random() * kyTu.length)];
  }
  return ket;
}

// Tạo giá trị ban đầu cho form khi drawer được mở.
function taoFormBanDau(
  dangSua: boolean,
  duLieuDangSua?: MaKhuyenMai | null,
): FormMaKhuyenMai {
  if (!dangSua || !duLieuDangSua) {
    return FORM_MAC_DINH;
  }

  return {
    ma: duLieuDangSua.ma,
    loaiGiam: duLieuDangSua.loaiGiam,
    giaTriGiam: String(duLieuDangSua.giaTriGiam),
    donToiThieu: String(duLieuDangSua.donToiThieu),
    ngayBatDau: duLieuDangSua.ngayBatDau,
    ngayKetThuc: duLieuDangSua.ngayKetThuc ?? "",
    gioiHanLuot:
      duLieuDangSua.gioiHanLuot !== null
        ? String(duLieuDangSua.gioiHanLuot)
        : "",
    chiDanhChoKhachMoi: false,
  };
}

// Style chung cho các ô input – tránh lặp code
const styleInput: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  color: "#0f172a",
  fontFamily: "Inter, sans-serif",
};

// Hàm xử lý focus/blur cho ô input – thêm viền xanh khi focus
function focusInput(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "#0ea5e9";
  e.target.style.boxShadow = "0 0 0 2px rgba(14,165,233,0.15)";
}
function blurInput(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "#e2e8f0";
  e.target.style.boxShadow = "none";
}

export default function PromotionDrawer({
  moDrawer,
  dangSua,
  duLieuDangSua,
  onDong,
  onLuu,
}: PromotionDrawerProps) {
  // State lưu giá trị form. Component được remount mỗi lần mở drawer,
  // nên giá trị ban đầu luôn khớp chế độ tạo mới hoặc chỉnh sửa.
  const [form, setForm] = useState<FormMaKhuyenMai>(() =>
    taoFormBanDau(dangSua, duLieuDangSua),
  );

  // Hàm cập nhật một trường trong form
  function capNhatTruong<K extends keyof FormMaKhuyenMai>(
    truong: K,
    giaTri: FormMaKhuyenMai[K],
  ) {
    setForm((truocDo) => ({ ...truocDo, [truong]: giaTri }));
  }

  return (
    // Ant Design Drawer – giống OrderDetailDrawer
    // - open: điều khiển hiển thị/ẩn
    // - onClose: gọi khi bấm overlay hoặc nút đóng
    // - size: chiều rộng panel (480px để form thoải mái)
    // - closable={false}: tắt nút X mặc định của antd, dùng nút tự tạo
    // - title={null}: tắt tiêu đề mặc định của antd
    <Drawer
      open={moDrawer}
      onClose={onDong}
      placement="right"
      size={480}
      mask={{ enabled: true, closable: true }}
      closable={false}
      title={null}
      styles={{
        body: { padding: 0 },         // Xóa padding mặc định của antd
        mask: { backgroundColor: "rgba(15, 23, 42, 0.35)" },
        wrapper: { boxShadow: "none" }, // Tắt shadow mặc định
      }}
      style={{ borderLeft: "1px solid #e2e8f0" }}
    >
      {/* Panel nội dung – flex column để header/footer cố định, giữa cuộn */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#ffffff" }}>

        {/* ── Phần đầu Drawer ── */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                lineHeight: "24px",
              }}
            >
              {dangSua ? "Chỉnh sửa mã khuyến mãi" : "Tạo mã khuyến mãi"}
            </h3>
            {/* Hiển thị mã đang sửa dưới tiêu đề */}
            {dangSua && duLieuDangSua && (
              <p style={{ fontSize: 13, color: "#006591", margin: "4px 0 0", fontWeight: 500 }}>
                {duLieuDangSua.ma}
              </p>
            )}
          </div>

          {/* Nút đóng (X) – giống OrderDetailDrawer */}
          <button
            type="button"
            aria-label="Đóng ngăn kéo"
            onClick={onDong}
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e2e8f0",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 16,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = "#e4e9ed";
              el.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = "#ffffff";
              el.style.color = "#94a3b8";
            }}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* ── Nội dung form (có thể cuộn) ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* ═══ TRƯỜNG 1: Mã khuyến mãi ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Mã khuyến mãi <span style={{ color: "#ea580c" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {/* Ô nhập mã – tự động chuyển sang in hoa */}
              <input
                type="text"
                placeholder="VD: TEE10, SUMMER..."
                value={form.ma}
                onChange={(e) =>
                  capNhatTruong("ma", e.target.value.toUpperCase())
                }
                style={{
                  ...styleInput,
                  flex: 1,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
                onFocus={focusInput}
                onBlur={blurInput}
              />
              {/* Nút tạo mã ngẫu nhiên */}
              <button
                type="button"
                onClick={() => capNhatTruong("ma", taoMaNgauNhien())}
                style={{
                  height: 40,
                  padding: "0 12px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#475569",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ffffff";
                }}
              >
                Tạo ngẫu nhiên
              </button>
            </div>
          </div>

          {/* ═══ TRƯỜNG 2: Loại giảm giá ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Loại giảm giá
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(
                [
                  { giaTri: "phan_tram", nhan: "Phần trăm (%)" },
                  { giaTri: "so_tien", nhan: "Số tiền trực tiếp" },
                  { giaTri: "mien_phi_ship", nhan: "Miễn phí vận chuyển" },
                ] as const
              ).map((lua_chon) => (
                <label
                  key={lua_chon.giaTri}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#0f172a",
                  }}
                >
                  <input
                    type="radio"
                    name="loaiGiam"
                    value={lua_chon.giaTri}
                    checked={form.loaiGiam === lua_chon.giaTri}
                    onChange={() => capNhatTruong("loaiGiam", lua_chon.giaTri)}
                    style={{ accentColor: "#0ea5e9", width: 16, height: 16 }}
                  />
                  {lua_chon.nhan}
                </label>
              ))}
            </div>
          </div>

          {/* ═══ TRƯỜNG 3: Giá trị giảm (ẩn khi chọn miễn phí ship) ═══ */}
          {form.loaiGiam !== "mien_phi_ship" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                Giá trị giảm <span style={{ color: "#ea580c" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="0"
                  value={form.giaTriGiam}
                  onChange={(e) => capNhatTruong("giaTriGiam", e.target.value)}
                  style={{ ...styleInput, paddingRight: 40, textAlign: "right" }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                >
                  {form.loaiGiam === "phan_tram" ? "%" : "VNĐ"}
                </span>
              </div>
            </div>
          )}

          {/* ═══ TRƯỜNG 4: Giá trị đơn hàng tối thiểu ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Giá trị đơn hàng tối thiểu
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                placeholder="0"
                value={form.donToiThieu}
                onChange={(e) => capNhatTruong("donToiThieu", e.target.value)}
                style={{ ...styleInput, paddingRight: 46, textAlign: "right" }}
                onFocus={focusInput}
                onBlur={blurInput}
              />
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 12,
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              >
                VNĐ
              </span>
            </div>
          </div>

          {/* ═══ TRƯỜNG 5: Ngày bắt đầu + Ngày kết thúc (2 cột) ═══ */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={form.ngayBatDau}
                onChange={(e) => capNhatTruong("ngayBatDau", e.target.value)}
                style={{ ...styleInput, padding: "0 10px", fontSize: 12 }}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={form.ngayKetThuc}
                onChange={(e) => capNhatTruong("ngayKetThuc", e.target.value)}
                style={{ ...styleInput, padding: "0 10px", fontSize: 12 }}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>
          </div>

          {/* ═══ TRƯỜNG 6: Giới hạn tổng lượt dùng ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Giới hạn tổng lượt dùng
            </label>
            <input
              type="number"
              placeholder="Không giới hạn"
              value={form.gioiHanLuot}
              onChange={(e) => capNhatTruong("gioiHanLuot", e.target.value)}
              style={{ ...styleInput, textAlign: "right" }}
              onFocus={focusInput}
              onBlur={blurInput}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
              Để trống nếu không muốn giới hạn số lần sử dụng.
            </p>
          </div>

          {/* ═══ TRƯỜNG 7: Chỉ dành cho khách hàng mới ═══ */}
          <div style={{ paddingTop: 4 }}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.chiDanhChoKhachMoi}
                onChange={(e) =>
                  capNhatTruong("chiDanhChoKhachMoi", e.target.checked)
                }
                style={{
                  accentColor: "#0ea5e9",
                  width: 16,
                  height: 16,
                  marginTop: 2,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "#0f172a", lineHeight: "20px" }}>
                Chỉ áp dụng cho khách hàng mới
              </span>
            </label>
          </div>
        </div>

        {/* ── Phần chân Drawer: Nút Hủy + Lưu ── */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            display: "flex",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {/* Nút Hủy */}
          <button
            type="button"
            onClick={onDong}
            style={{
              flex: 1,
              height: 40,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ffffff";
            }}
          >
            Hủy
          </button>

          {/* Nút Lưu – màu xanh primary */}
          <button
            type="button"
            onClick={() => onLuu(form)}
            style={{
              flex: 1,
              height: 40,
              background: "#0ea5e9",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(14,165,233,0.3)",
              transition: "background-color 0.15s ease",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0284c7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0ea5e9";
            }}
          >
            {dangSua ? "Lưu thay đổi" : "Lưu mã"}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

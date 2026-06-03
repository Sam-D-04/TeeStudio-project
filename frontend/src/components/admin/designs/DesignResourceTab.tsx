"use client";

/**
 * DesignResourceTab – Tab "Tài nguyên thiết kế / Vị trí in"
 *
 * Tab này chia làm 2 khu vực:
 *  1. Danh sách sticker có sẵn – admin có thể thêm/xóa sticker
 *  2. Danh sách vị trí in – admin có thể thêm/xóa/đổi tên vị trí in
 *
 * Dữ liệu thực tế sẽ được lấy qua API:
 *  - GET /api/admin/designs/stickers
 *  - GET /api/admin/designs/print-positions
 */

import { useState } from "react";
import {
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

// ── Kiểu dữ liệu cho 1 sticker ──
type Sticker = {
  id: number;
  ten: string;          // Tên sticker, ví dụ "Logo TeeStudio"
  urlAnh: string;       // URL ảnh sticker trên Cloudinary
  loai: string;         // Loại: "logo" | "hinh_ve" | "chu_viet"
};

// ── Kiểu dữ liệu cho 1 vị trí in ──
type ViTriIn = {
  id: number;
  ten: string;          // Tên vị trí, ví dụ "Ngực trái"
  moTa: string;         // Mô tả giới hạn kích thước
  dangHoatDong: boolean;
};

// Dữ liệu mẫu sticker – thay bằng API trong thực tế
const STICKER_MAU: Sticker[] = [
  { id: 1, ten: "Logo TeeStudio", urlAnh: "", loai: "logo" },
  { id: 2, ten: "Ngôi sao", urlAnh: "", loai: "hinh_ve" },
  { id: 3, ten: "Trái tim", urlAnh: "", loai: "hinh_ve" },
  { id: 4, ten: "Chữ thư pháp", urlAnh: "", loai: "chu_viet" },
  { id: 5, ten: "Hoa sen", urlAnh: "", loai: "hinh_ve" },
  { id: 6, ten: "Cờ Việt Nam", urlAnh: "", loai: "logo" },
];

// Dữ liệu mẫu vị trí in – thay bằng API trong thực tế
const VI_TRI_IN_MAU: ViTriIn[] = [
  { id: 1, ten: "Ngực trái", moTa: "Tối đa 10x10 cm", dangHoatDong: true },
  { id: 2, ten: "Ngực phải", moTa: "Tối đa 10x10 cm", dangHoatDong: true },
  { id: 3, ten: "Sau lưng to", moTa: "Tối đa 30x40 cm", dangHoatDong: true },
  { id: 4, ten: "Sau lưng nhỏ", moTa: "Tối đa 15x15 cm", dangHoatDong: true },
  { id: 5, ten: "Tay trái", moTa: "Tối đa 8x8 cm", dangHoatDong: true },
  { id: 6, ten: "Tay phải", moTa: "Tối đa 8x8 cm", dangHoatDong: false },
];

// Bảng màu nền cho từng loại sticker (chỉ dùng khi chưa có ảnh thật)
const MAU_NEN_LOAI: Record<string, string> = {
  logo: "#e0f2fe",
  hinh_ve: "#f3e8ff",
  chu_viet: "#fef9c3",
};

export default function DesignResourceTab() {
  const [danhSachSticker, setDanhSachSticker] = useState<Sticker[]>(STICKER_MAU);
  const [danhSachViTriIn, setDanhSachViTriIn] = useState<ViTriIn[]>(VI_TRI_IN_MAU);

  // Xóa sticker
  function xuLyXoaSticker(id: number) {
    if (window.confirm("Bạn có chắc muốn xóa sticker này?")) {
      // Thực tế: gọi API DELETE /api/admin/designs/stickers/:id
      setDanhSachSticker((ds) => ds.filter((s) => s.id !== id));
    }
  }

  // Xóa vị trí in
  function xuLyXoaViTriIn(id: number) {
    if (window.confirm("Bạn có chắc muốn xóa vị trí in này?")) {
      // Thực tế: gọi API DELETE /api/admin/designs/print-positions/:id
      setDanhSachViTriIn((ds) => ds.filter((v) => v.id !== id));
    }
  }

  // Bật/tắt vị trí in
  function xuLyBatTatViTriIn(id: number) {
    // Thực tế: gọi API PATCH /api/admin/designs/print-positions/:id
    setDanhSachViTriIn((ds) =>
      ds.map((v) => (v.id === id ? { ...v, dangHoatDong: !v.dangHoatDong } : v))
    );
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* KHU VỰC 1: Sticker có sẵn                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div>
        {/* Tiêu đề khu vực */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PictureOutlined style={{ color: "#0ea5e9", fontSize: 18 }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Sticker có sẵn
            </h3>
            <span
              style={{
                padding: "1px 8px",
                borderRadius: 20,
                background: "#e0f2fe",
                color: "#0284c7",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {danhSachSticker.length}
            </span>
          </div>

          {/* Nút thêm sticker mới */}
          <button
            onClick={() => alert("Chức năng upload sticker sẽ mở hộp thoại chọn file")}
            style={{
              height: 36,
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#0ea5e9",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0284c7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0ea5e9";
            }}
          >
            <PlusOutlined style={{ fontSize: 13 }} />
            Thêm sticker
          </button>
        </div>

        {/* Lưới hiển thị sticker (4 cột trên desktop) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {danhSachSticker.map((sticker) => (
            <div
              key={sticker.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                position: "relative",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const div = e.currentTarget as HTMLDivElement;
                div.style.borderColor = "#bae6fd";
                div.style.boxShadow = "0 4px 12px rgba(14,165,233,0.1)";
              }}
              onMouseLeave={(e) => {
                const div = e.currentTarget as HTMLDivElement;
                div.style.borderColor = "#e2e8f0";
                div.style.boxShadow = "none";
              }}
            >
              {/* Nút xóa – góc phải trên */}
              <button
                title="Xóa sticker"
                onClick={() => xuLyXoaSticker(sticker.id)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: 12,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.color = "#ea580c";
                  btn.style.background = "#ffedd5";
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.color = "#94a3b8";
                  btn.style.background = "transparent";
                }}
              >
                <DeleteOutlined />
              </button>

              {/* Ô ảnh sticker (hoặc placeholder màu sắc) */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  backgroundColor: MAU_NEN_LOAI[sticker.loai] || "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                }}
              >
                {sticker.urlAnh ? (
                  <img
                    src={sticker.urlAnh}
                    alt={sticker.ten}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <PictureOutlined style={{ fontSize: 28, color: "#94a3b8" }} />
                )}
              </div>

              {/* Tên sticker */}
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0f172a",
                  textAlign: "center",
                  wordBreak: "break-word",
                }}
              >
                {sticker.ten}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* KHU VỰC 2: Vị trí in                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div>
        {/* Tiêu đề khu vực */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EnvironmentOutlined style={{ color: "#0ea5e9", fontSize: 18 }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Vị trí in
            </h3>
            <span
              style={{
                padding: "1px 8px",
                borderRadius: 20,
                background: "#e0f2fe",
                color: "#0284c7",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {danhSachViTriIn.length}
            </span>
          </div>

          {/* Nút thêm vị trí in mới */}
          <button
            onClick={() => alert("Chức năng thêm vị trí in sẽ mở hộp thoại nhập thông tin")}
            style={{
              height: 36,
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.borderColor = "#0ea5e9";
              btn.style.color = "#0ea5e9";
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.borderColor = "#e2e8f0";
              btn.style.color = "#475569";
            }}
          >
            <PlusOutlined style={{ fontSize: 13 }} />
            Thêm vị trí in
          </button>
        </div>

        {/* Bảng danh sách vị trí in */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["VỊ TRÍ IN", "MÔ TẢ KÍCH THƯỚC", "TRẠNG THÁI", "THAO TÁC"].map(
                  (tieuDe, viTri) => (
                    <th
                      key={tieuDe}
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#475569",
                        letterSpacing: "0.05em",
                        textAlign: viTri === 3 ? "right" : "left",
                      }}
                    >
                      {tieuDe}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {danhSachViTriIn.map((viTri) => (
                <tr
                  key={viTri.id}
                  style={{ borderBottom: "1px solid #e2e8f0", transition: "background-color 0.15s ease" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent";
                  }}
                >
                  {/* Tên vị trí */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                      {viTri.ten}
                    </span>
                  </td>

                  {/* Mô tả */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 13, color: "#475569" }}>{viTri.moTa}</span>
                  </td>

                  {/* Toggle bật/tắt */}
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => xuLyBatTatViTriIn(viTri.id)}
                      title={viTri.dangHoatDong ? "Nhấn để tắt vị trí in này" : "Nhấn để bật vị trí in này"}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "3px 12px",
                        borderRadius: 20,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        backgroundColor: viTri.dangHoatDong ? "#dcfce7" : "#e4e9ed",
                        color: viTri.dangHoatDong ? "#10b981" : "#6e7881",
                      }}
                    >
                      {/* Chấm tròn báo trạng thái */}
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: viTri.dangHoatDong ? "#10b981" : "#94a3b8",
                          flexShrink: 0,
                        }}
                      />
                      {viTri.dangHoatDong ? "Đang bật" : "Đã tắt"}
                    </button>
                  </td>

                  {/* Thao tác: xóa */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <button
                      title="Xóa vị trí in"
                      onClick={() => xuLyXoaViTriIn(viTri.id)}
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6,
                        border: "1px solid transparent",
                        background: "#f8fafc",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontSize: 14,
                        transition: "all 0.15s ease",
                        marginLeft: "auto",
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.color = "#ea580c";
                        btn.style.borderColor = "#ffedd5";
                        btn.style.background = "#fff7ed";
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.color = "#94a3b8";
                        btn.style.borderColor = "transparent";
                        btn.style.background = "#f8fafc";
                      }}
                    >
                      <DeleteOutlined />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

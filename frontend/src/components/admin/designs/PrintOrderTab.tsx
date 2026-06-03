"use client";

/**
 * PrintOrderTab – Tab "Đơn cần in" trong trang Thiết kế & In ấn.
 *
 * Hiển thị danh sách các đơn hàng đã được duyệt thiết kế,
 * đang chờ được gửi đến xưởng in hoặc đang trong quá trình in.
 *
 * Cột bảng:
 *  1. Mã đơn hàng
 *  2. Thiết kế (preview mini + mã TK)
 *  3. Khách hàng
 *  4. Số lượng
 *  5. Vị trí in
 *  6. Trạng thái
 *  7. Ngày tạo đơn
 *  8. Thao tác (nút "Gửi xưởng" hoặc "Xem tiến độ")
 */

import { useState } from "react";
import {
  SendOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import DesignPreview from "./DesignPreview";

// ── Kiểu dữ liệu cho 1 đơn cần in ──
// Khớp với response API GET /api/admin/designs/print-orders
type DonCanIn = {
  id: number;
  maDon: string;          // Ví dụ: "DH-1045"
  maThietKe: string;      // Ví dụ: "TK-2023"
  urlPreview?: string;    // URL ảnh preview trên Cloudinary
  mauAo: string;          // Mã hex màu áo
  tenKhachHang: string;
  soLuong: number;
  viTriIn: string;        // Ví dụ: "Sau lưng to"
  trangThai: "cho_gui_xuong" | "dang_in" | "da_in_xong";
  ngayTao: string;        // Ví dụ: "03/06/2026"
};

// Dữ liệu mẫu – sẽ thay bằng gọi API GET /api/admin/designs/print-orders
const DU_LIEU_MAU_DON: DonCanIn[] = [
  {
    id: 1,
    maDon: "DH-1045",
    maThietKe: "TK-2023",
    mauAo: "#ffffff",
    tenKhachHang: "Trần Thị B",
    soLuong: 50,
    viTriIn: "Sau lưng to",
    trangThai: "cho_gui_xuong",
    ngayTao: "01/06/2026",
  },
  {
    id: 2,
    maDon: "DH-1043",
    maThietKe: "TK-2021",
    mauAo: "#1e293b",
    tenKhachHang: "Công ty ABC",
    soLuong: 120,
    viTriIn: "Ngực trái",
    trangThai: "cho_gui_xuong",
    ngayTao: "31/05/2026",
  },
  {
    id: 3,
    maDon: "DH-1038",
    maThietKe: "TK-2018",
    mauAo: "#dc2626",
    tenKhachHang: "Lê Hoàng Nam",
    soLuong: 30,
    viTriIn: "Ngực trái",
    trangThai: "dang_in",
    ngayTao: "29/05/2026",
  },
  {
    id: 4,
    maDon: "DH-1035",
    maThietKe: "TK-2015",
    mauAo: "#0ea5e9",
    tenKhachHang: "Phạm Minh Tuấn",
    soLuong: 20,
    viTriIn: "Sau lưng",
    trangThai: "dang_in",
    ngayTao: "28/05/2026",
  },
  {
    id: 5,
    maDon: "DH-1030",
    maThietKe: "TK-2010",
    mauAo: "#16a34a",
    tenKhachHang: "Nguyễn Thị Lan",
    soLuong: 10,
    viTriIn: "Ngực phải",
    trangThai: "da_in_xong",
    ngayTao: "25/05/2026",
  },
];

// Cấu hình badge trạng thái đơn in
const CAU_HINH_TRANG_THAI: Record<
  DonCanIn["trangThai"],
  { nhan: string; mauNen: string; mauChu: string; icon: React.ReactNode }
> = {
  cho_gui_xuong: {
    nhan: "Chờ gửi xưởng",
    mauNen: "#e0f2fe",
    mauChu: "#0ea5e9",
    icon: <ClockCircleOutlined style={{ fontSize: 11 }} />,
  },
  dang_in: {
    nhan: "Đang in",
    mauNen: "#dcfce7",
    mauChu: "#10b981",
    icon: <CheckCircleOutlined style={{ fontSize: 11 }} />,
  },
  da_in_xong: {
    nhan: "Đã in xong",
    mauNen: "#e4e9ed",
    mauChu: "#6e7881",
    icon: <CheckCircleOutlined style={{ fontSize: 11 }} />,
  },
};

export default function PrintOrderTab() {
  // State danh sách đơn – sẽ thay bằng gọi API trong thực tế
  const [danhSach, setDanhSach] = useState<DonCanIn[]>(DU_LIEU_MAU_DON);

  // Xử lý gửi đơn đến xưởng
  function xuLyGuiXuong(id: number) {
    if (window.confirm("Xác nhận gửi đơn này đến xưởng in?")) {
      // Trong thực tế: gọi API PATCH /api/admin/designs/print-orders/:id
      // với body { trangThai: "dang_in" }
      setDanhSach((ds) =>
        ds.map((don) =>
          don.id === id ? { ...don, trangThai: "dang_in" as const } : don
        )
      );
    }
  }

  // Thống kê nhanh
  const soChoGuiXuong = danhSach.filter((d) => d.trangThai === "cho_gui_xuong").length;
  const soDangIn = danhSach.filter((d) => d.trangThai === "dang_in").length;

  return (
    <div style={{ padding: 24 }}>
      {/* ── Thanh thống kê nhanh ── */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "#e0f2fe",
            borderRadius: 8,
            fontSize: 13,
            color: "#0284c7",
            fontWeight: 600,
          }}
        >
          <ClockCircleOutlined />
          {soChoGuiXuong} đơn chờ gửi xưởng
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "#dcfce7",
            borderRadius: 8,
            fontSize: 13,
            color: "#10b981",
            fontWeight: 600,
          }}
        >
          <CheckCircleOutlined />
          {soDangIn} đơn đang in tại xưởng
        </div>
      </div>

      {/* ── Bảng danh sách đơn cần in ── */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["MÃ ĐƠN", "THIẾT KẾ", "KHÁCH HÀNG", "SỐ LƯỢNG", "VỊ TRÍ IN", "TRẠNG THÁI", "NGÀY TẠO", "THAO TÁC"].map(
                  (tieuDe, viTri) => (
                    <th
                      key={tieuDe}
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#475569",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                        textAlign: viTri === 7 ? "right" : "left",
                      }}
                    >
                      {tieuDe}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {danhSach.map((don) => {
                const cauHinh = CAU_HINH_TRANG_THAI[don.trangThai];
                return (
                  <tr
                    key={don.id}
                    style={{ borderBottom: "1px solid #e2e8f0", transition: "background-color 0.15s ease" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent";
                    }}
                  >
                    {/* Mã đơn */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                        {don.maDon}
                      </span>
                    </td>

                    {/* Thiết kế: thumbnail + mã TK */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <DesignPreview
                          urlAnh={don.urlPreview}
                          mauAo={don.mauAo}
                          maThietKe={don.maThietKe}
                        />
                        <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                          {don.maThietKe}
                        </span>
                      </div>
                    </td>

                    {/* Khách hàng */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 14, color: "#0f172a" }}>
                        {don.tenKhachHang}
                      </span>
                    </td>

                    {/* Số lượng */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                        {don.soLuong}
                      </span>
                      <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>áo</span>
                    </td>

                    {/* Vị trí in */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 13, color: "#475569" }}>{don.viTriIn}</span>
                    </td>

                    {/* Trạng thái */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: cauHinh.mauNen,
                          color: cauHinh.mauChu,
                        }}
                      >
                        {cauHinh.icon}
                        {cauHinh.nhan}
                      </span>
                    </td>

                    {/* Ngày tạo */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 13, color: "#475569" }}>{don.ngayTao}</span>
                    </td>

                    {/* Thao tác */}
                    <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        {/* Nút Xem luôn hiện */}
                        <button
                          title="Xem chi tiết đơn"
                          onClick={() => alert(`Xem chi tiết đơn ${don.maDon}`)}
                          style={{
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            color: "#475569",
                            cursor: "pointer",
                            fontSize: 14,
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#0ea5e9";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#475569";
                          }}
                        >
                          <EyeOutlined />
                        </button>

                        {/* Nút Gửi xưởng – chỉ hiện khi trạng thái "Chờ gửi xưởng" */}
                        {don.trangThai === "cho_gui_xuong" && (
                          <button
                            title="Gửi đến xưởng in"
                            onClick={() => xuLyGuiXuong(don.id)}
                            style={{
                              height: 32,
                              padding: "0 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              borderRadius: 6,
                              border: "none",
                              background: "#0ea5e9",
                              color: "#ffffff",
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 600,
                              transition: "background-color 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0284c7";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0ea5e9";
                            }}
                          >
                            <SendOutlined style={{ fontSize: 13 }} />
                            Gửi xưởng
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

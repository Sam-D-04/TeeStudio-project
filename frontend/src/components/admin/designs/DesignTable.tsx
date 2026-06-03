"use client";

/**
 * DesignTable – Bảng danh sách thiết kế khách hàng.
 *
 * Các cột:
 *  1. Mã thiết kế    – in đậm, dạng "TK-XXXX"
 *  2. Bản preview    – thumbnail mini 48x48 (component DesignPreview)
 *  3. Khách hàng     – tên + số điện thoại
 *  4. Sản phẩm/Màu  – tên áo + chấm màu + nhãn màu
 *  5. Vị trí in      – ví dụ "Ngực trái"
 *  6. Trạng thái     – badge màu (component DesignStatusBadge)
 *  7. Thao tác       – nút Xem / Yêu cầu chỉnh sửa / Duyệt (hiện khi hover)
 *
 * Props:
 *  - danhSach: danh sách thiết kế cần hiển thị
 *  - onXem: hàm gọi khi click "Xem"
 *  - onYeuCauChinhSua: hàm gọi khi click "Yêu cầu chỉnh sửa"
 *  - onDuyet: hàm gọi khi click "Duyệt"
 */

import {
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import DesignStatusBadge, { type TrangThaiThietKe } from "./DesignStatusBadge";
import DesignPreview from "./DesignPreview";

// ── Kiểu dữ liệu cho 1 thiết kế trong bảng ──
// Khớp với response API GET /api/admin/designs
export type ThietKe = {
  id: number;
  maThietKe: string;        // Mã dạng "TK-2024"
  urlPreview?: string;      // URL ảnh preview trên Cloudinary (có thể null khi chưa có)
  mauAo: string;            // Mã hex màu áo, ví dụ "#000000"
  tenKhachHang: string;     // Tên khách đặt thiết kế
  soDienThoai?: string;     // Số điện thoại khách (tùy chọn)
  tenSanPham: string;       // Ví dụ "Áo thun Basic"
  tenMauAo: string;         // Ví dụ "Đen"
  viTriIn: string;          // Ví dụ "Ngực trái"
  trangThai: TrangThaiThietKe;
  ngayGui: string;          // Ngày gửi thiết kế, ví dụ "03/06/2026"
};

type DesignTableProps = {
  danhSach: ThietKe[];
  onXem: (id: number) => void;
  onYeuCauChinhSua: (id: number) => void;
  onDuyet: (id: number) => void;
};

export default function DesignTable({
  danhSach,
  onXem,
  onYeuCauChinhSua,
  onDuyet,
}: DesignTableProps) {
  // Trường hợp không có dữ liệu
  if (danhSach.length === 0) {
    return (
      <div
        style={{
          padding: "48px 0",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 14,
        }}
      >
        Không tìm thấy thiết kế nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    // Container bảng có thể cuộn ngang khi màn hình nhỏ
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        {/* ── Tiêu đề bảng ── */}
        <thead>
          <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            {/* Dùng mảng để dễ thêm/xóa cột sau này */}
            {[
              "MÃ THIẾT KẾ",
              "BẢN PREVIEW",
              "KHÁCH HÀNG",
              "SẢN PHẨM / MÀU",
              "VỊ TRÍ IN",
              "TRẠNG THÁI",
              "THAO TÁC",
            ].map((tieuDe, viTri) => (
              <th
                key={tieuDe}
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#475569",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  // Căn phải cột "Thao tác"
                  textAlign: viTri === 6 ? "right" : "left",
                }}
              >
                {tieuDe}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Nội dung bảng ── */}
        <tbody>
          {danhSach.map((tk) => (
            <HangThietKe
              key={tk.id}
              thietKe={tk}
              onXem={onXem}
              onYeuCauChinhSua={onYeuCauChinhSua}
              onDuyet={onDuyet}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component phụ: 1 hàng trong bảng
// Tách ra để logic hover/state không ảnh hưởng toàn bảng
// ─────────────────────────────────────────────────────────────────────────────
function HangThietKe({
  thietKe,
  onXem,
  onYeuCauChinhSua,
  onDuyet,
}: {
  thietKe: ThietKe;
  onXem: (id: number) => void;
  onYeuCauChinhSua: (id: number) => void;
  onDuyet: (id: number) => void;
}) {
  // Xác định có nên hiển thị nút "Duyệt" không
  // Chỉ hiện khi thiết kế đang ở trạng thái "Chờ kiểm tra"
  const coTheXetDuyet = thietKe.trangThai === "cho_kiem_tra";

  return (
    <tr
      style={{
        borderBottom: "1px solid #e2e8f0",
        transition: "background-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f8fafc";
        // Hiện nhóm nút thao tác khi hover
        const nhomNut = e.currentTarget.querySelector(".nhom-nut-thao-tac") as HTMLElement;
        if (nhomNut) nhomNut.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent";
        // Ẩn nhóm nút thao tác khi không hover
        const nhomNut = e.currentTarget.querySelector(".nhom-nut-thao-tac") as HTMLElement;
        if (nhomNut) nhomNut.style.opacity = "0";
      }}
    >
      {/* Cột 1: Mã thiết kế */}
      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
          {thietKe.maThietKe}
        </span>
      </td>

      {/* Cột 2: Bản preview */}
      <td style={{ padding: "14px 16px" }}>
        <DesignPreview
          urlAnh={thietKe.urlPreview}
          mauAo={thietKe.mauAo}
          maThietKe={thietKe.maThietKe}
        />
      </td>

      {/* Cột 3: Khách hàng */}
      <td style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 500 }}>
          {thietKe.tenKhachHang}
        </div>
        {thietKe.soDienThoai && (
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {thietKe.soDienThoai}
          </div>
        )}
      </td>

      {/* Cột 4: Sản phẩm / Màu */}
      <td style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 14, color: "#0f172a" }}>
          {thietKe.tenSanPham}
        </div>
        {/* Chấm màu + nhãn màu */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: thietKe.mauAo,
              border: "1px solid #e2e8f0",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: "#475569" }}>
            {thietKe.tenMauAo}
          </span>
        </div>
      </td>

      {/* Cột 5: Vị trí in */}
      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 13, color: "#475569" }}>
          {thietKe.viTriIn}
        </span>
      </td>

      {/* Cột 6: Trạng thái */}
      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
        <DesignStatusBadge trangThai={thietKe.trangThai} />
      </td>

      {/* Cột 7: Thao tác – ẩn mặc định, hiện khi hover hàng */}
      <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
        <div
          className="nhom-nut-thao-tac"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 6,
            opacity: 0,                         // Ẩn mặc định
            transition: "opacity 0.15s ease",   // Hiện mượt mà khi hover hàng
          }}
        >
          {/* Nút Xem */}
          <NutThaoTac
            icon={<EyeOutlined />}
            title="Xem chi tiết thiết kế"
            onClick={() => onXem(thietKe.id)}
          />

          {/* Nút Yêu cầu chỉnh sửa – chỉ hiện khi đang "Chờ kiểm tra" */}
          {coTheXetDuyet && (
            <NutThaoTac
              icon={<EditOutlined />}
              title="Yêu cầu khách chỉnh sửa"
              onClick={() => onYeuCauChinhSua(thietKe.id)}
              mauHover="#ea580c"
            />
          )}

          {/* Nút Duyệt – chỉ hiện khi đang "Chờ kiểm tra" */}
          {coTheXetDuyet && (
            <NutThaoTac
              icon={<CheckOutlined />}
              title="Duyệt thiết kế"
              onClick={() => onDuyet(thietKe.id)}
              laNutChinh   // Nút chính: nền xanh
            />
          )}
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component phụ: Nút thao tác nhỏ trong bảng
// ─────────────────────────────────────────────────────────────────────────────
function NutThaoTac({
  icon,
  title,
  onClick,
  laNutChinh = false,
  mauHover,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  laNutChinh?: boolean;   // true → nền xanh primary
  mauHover?: string;      // Màu icon khi hover (nút phụ)
}) {
  // Kiểu dáng nút chính (nền xanh) và nút phụ (nền xám nhạt)
  const styleCoban: React.CSSProperties = laNutChinh
    ? {
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        border: "none",
        background: "#0ea5e9",    // Nền xanh primary
        color: "#ffffff",
        cursor: "pointer",
        fontSize: 14,
        transition: "background-color 0.15s ease",
      }
    : {
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        border: "1px solid transparent",
        background: "#f8fafc",    // Nền xám nhạt
        color: "#475569",
        cursor: "pointer",
        fontSize: 14,
        transition: "all 0.15s ease",
      };

  return (
    <button
      title={title}
      onClick={onClick}
      style={styleCoban}
      onMouseEnter={(e) => {
        if (laNutChinh) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0284c7";
        } else {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
          if (mauHover) {
            (e.currentTarget as HTMLButtonElement).style.color = mauHover;
          } else {
            (e.currentTarget as HTMLButtonElement).style.color = "#0ea5e9";
          }
        }
      }}
      onMouseLeave={(e) => {
        if (laNutChinh) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0ea5e9";
        } else {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#475569";
        }
      }}
    >
      {icon}
    </button>
  );
}

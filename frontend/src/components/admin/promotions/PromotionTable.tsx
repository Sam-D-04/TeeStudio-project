/**
 * PromotionTable – Bảng danh sách mã khuyến mãi.
 *
 * Mỗi hàng hiển thị:
 *  - Checkbox chọn
 *  - Mã khuyến mãi (in đậm)
 *  - Loại giảm
 *  - Giá trị giảm
 *  - Đơn hàng tối thiểu
 *  - Thời gian áp dụng
 *  - Số lượt dùng
 *  - Badge trạng thái
 *  - Nút thao tác: xem, sửa, xóa
 */

import PromotionStatusBadge, {
  type PromotionStatus,
} from "./PromotionStatusBadge";
import PromotionUsageBar from "./PromotionUsageBar";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

// Kiểu dữ liệu cho một mã khuyến mãi
// Phải khớp chính xác với structure JSON từ Backend trả về
export type MaKhuyenMai = {
  id: number;               // ID duy nhất trong DB
  ma: string;               // Mã code, ví dụ "TEE10", "SUMMER50K"
  loaiGiam:
    | "phan_tram"           // Giảm theo %
    | "so_tien"             // Giảm số tiền cố định
    | "mien_phi_van_chuyen"; // Miễn phí vận chuyển
  giaTriGiam: number;       // Giá trị: 10 (cho phan_tram) hoặc 50000 (cho so_tien)
  donToiThieu: number;      // Giá trị đơn hàng tối thiểu để áp dụng (đơn vị: VNĐ)
  ngayBatDau: string;       // Format "DD/MM/YYYY" hoặc ISO date
  ngayKetThuc: string | null; // null = vô thời hạn
  daSuDung: number;         // Số lượt đã dùng
  gioiHanLuot: number | null; // null = không giới hạn
  chiDanhChoKhachMoi: boolean;
  trangThai: PromotionStatus;
};

type PromotionTableProps = {
  danhSach: MaKhuyenMai[];              // Danh sách mã khuyến mãi để hiển thị
  dsIDDaChon: number[];                  // Danh sách ID đang được chọn (checkbox)
  onChonTatCa: (chonHet: boolean) => void; // Callback khi click checkbox "chọn tất cả"
  onChonMot: (id: number) => void;       // Callback khi click checkbox từng hàng
  onXem: (id: number) => void;           // Callback nút xem chi tiết
  onSua: (id: number) => void;           // Callback nút sửa (mở drawer)
  onXoa: (id: number) => void;           // Callback nút xóa
};

// Hàm chuyển đổi loại giảm từ giá trị DB sang tiếng Việt hiển thị
function hienThiLoaiGiam(loaiGiam: MaKhuyenMai["loaiGiam"]): string {
  switch (loaiGiam) {
    case "phan_tram":
      return "Phần trăm";
    case "so_tien":
      return "Số tiền";
    case "mien_phi_van_chuyen":
      return "Miễn phí vận chuyển";
    default:
      return "Không rõ";
  }
}

// Hàm chuyển đổi giá trị giảm sang chuỗi hiển thị đẹp
function hienThiGiaTriGiam(
  loaiGiam: MaKhuyenMai["loaiGiam"],
  giaTriGiam: number,
): string {
  switch (loaiGiam) {
    case "phan_tram":
      return `${giaTriGiam}%`;
    case "so_tien":
      return giaTriGiam.toLocaleString("vi-VN") + "đ";
    case "mien_phi_van_chuyen":
      return "Toàn quốc";
    default:
      return String(giaTriGiam);
  }
}

// Hàm format thời gian áp dụng
function hienThiThoiGian(
  ngayBatDau: string,
  ngayKetThuc: string | null,
): string {
  const dinhDangNgay = (value: string) => {
    const [nam, thang, ngay] = value.split("-");
    return ngay && thang && nam ? `${ngay}/${thang}/${nam}` : value;
  };
  if (!ngayKetThuc) {
    return `${dinhDangNgay(ngayBatDau)} - Vô thời hạn`;
  }
  return `${dinhDangNgay(ngayBatDau)} - ${dinhDangNgay(ngayKetThuc)}`;
}

export default function PromotionTable({
  danhSach,
  dsIDDaChon,
  onChonTatCa,
  onChonMot,
  onXem,
  onSua,
  onXoa,
}: PromotionTableProps) {
  // Kiểm tra trạng thái "chọn tất cả": true khi tất cả hàng đều được chọn
  const tatCaDaChon =
    danhSach.length > 0 && dsIDDaChon.length === danhSach.length;

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 900,
          fontSize: 13,
        }}
      >
        {/* Phần đầu bảng */}
        <thead>
          <tr
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {/* Cột checkbox "chọn tất cả" */}
            <th style={{ padding: "12px 16px", width: 40 }}>
              <input
                type="checkbox"
                checked={tatCaDaChon}
                onChange={(e) => onChonTatCa(e.target.checked)}
                style={{ cursor: "pointer", accentColor: "#0ea5e9" }}
              />
            </th>

            {/* Các cột tiêu đề – chữ nhỏ, đậm, in hoa */}
            {[
              "Mã",
              "Loại giảm",
              "Giá trị",
              "Đơn tối thiểu",
              "Thời gian",
              "Lượt dùng",
              "Trạng thái",
              "Thao tác",
            ].map((tieuDe, idx) => (
              <th
                key={idx}
                style={{
                  padding: "12px 16px",
                  textAlign: idx === 7 ? "right" : "left",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  minWidth: idx === 5 ? 100 : undefined,
                }}
              >
                {tieuDe}
              </th>
            ))}
          </tr>
        </thead>

        {/* Phần thân bảng */}
        <tbody>
          {danhSach.length === 0 ? (
            // Hiển thị khi không có dữ liệu
            <tr>
              <td
                colSpan={9}
                style={{
                  padding: "48px 16px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: 14,
                }}
              >
                Không tìm thấy mã khuyến mãi nào
              </td>
            </tr>
          ) : (
            danhSach.map((ma) => {
              const dangDuocChon = dsIDDaChon.includes(ma.id);

              return (
                <tr
                  key={ma.id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: dangDuocChon ? "#f0f9ff" : "transparent",
                    transition: "background-color 0.15s ease",
                  }}
                  // Hover: nền xanh rất nhạt
                  onMouseEnter={(e) => {
                    if (!dangDuocChon) {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      dangDuocChon ? "#f0f9ff" : "transparent";
                  }}
                >
                  {/* Checkbox chọn hàng */}
                  <td style={{ padding: "12px 16px" }}>
                    <input
                      type="checkbox"
                      checked={dangDuocChon}
                      onChange={() => onChonMot(ma.id)}
                      style={{ cursor: "pointer", accentColor: "#0ea5e9" }}
                    />
                  </td>

                  {/* Mã code – in đậm */}
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#0f172a",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {ma.ma}
                    </span>
                  </td>

                  {/* Loại giảm */}
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#475569",
                    }}
                  >
                    {hienThiLoaiGiam(ma.loaiGiam)}
                  </td>

                  {/* Giá trị giảm */}
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#0f172a",
                      fontWeight: 500,
                    }}
                  >
                    {hienThiGiaTriGiam(ma.loaiGiam, ma.giaTriGiam)}
                  </td>

                  {/* Đơn tối thiểu */}
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {ma.donToiThieu === 0
                      ? "0đ"
                      : ma.donToiThieu.toLocaleString("vi-VN") + "đ"}
                  </td>

                  {/* Thời gian áp dụng */}
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {hienThiThoiGian(ma.ngayBatDau, ma.ngayKetThuc)}
                  </td>

                  {/* Số lượt dùng */}
                  <td style={{ padding: "12px 16px" }}>
                    <PromotionUsageBar
                      daSuDung={ma.daSuDung}
                      gioiHan={ma.gioiHanLuot}
                    />
                  </td>

                  {/* Badge trạng thái */}
                  <td style={{ padding: "12px 16px" }}>
                    <PromotionStatusBadge trangThai={ma.trangThai} />
                  </td>

                  {/* Nhóm nút thao tác */}
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 4,
                      }}
                    >
                      {/* Nút xem chi tiết */}
                      <button
                        title="Xem chi tiết"
                        onClick={() => onXem(ma.id)}
                        style={{
                          padding: "6px",
                          border: "none",
                          background: "transparent",
                          color: "#94a3b8",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 15,
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
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
                        <EyeOutlined />
                      </button>

                      {/* Nút sửa – mở drawer */}
                      <button
                        title="Chỉnh sửa"
                        onClick={() => onSua(ma.id)}
                        style={{
                          padding: "6px",
                          border: "none",
                          background: "transparent",
                          color: "#94a3b8",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 15,
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
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

                      {/* Nút xóa – màu đỏ khi hover */}
                      <button
                        title="Xóa"
                        onClick={() => onXoa(ma.id)}
                        style={{
                          padding: "6px",
                          border: "none",
                          background: "transparent",
                          color: "#94a3b8",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 15,
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

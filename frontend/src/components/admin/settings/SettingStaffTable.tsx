import SettingRoleBadge, { type StaffRole } from "./SettingRoleBadge";
import SettingStatusBadge, { type StaffStatus } from "./SettingStatusBadge";
import { EditOutlined } from "@ant-design/icons";

/**
 * SettingStaffTable – Bảng danh sách nhân viên nội bộ.
 *
 * Hiển thị trong tab "Tài khoản & Phân quyền".
 * Gồm các cột:
 *   - Họ tên: avatar chữ cái viết tắt + tên đầy đủ
 *   - Email: địa chỉ email nội bộ
 *   - Vai trò: badge màu theo vai trò
 *   - Trạng thái: badge hoạt động/vô hiệu
 *   - Ngày tạo: ngày thêm tài khoản
 *   - Thao tác: nút chỉnh sửa
 *
 * Dữ liệu mock tĩnh để demo giao diện.
 * Backend cần cung cấp API GET /api/admin/staff (xem Huongdan_BE.md để biết chi tiết).
 */

// Kiểu dữ liệu một nhân viên
type StaffMember = {
  id: number;           // ID duy nhất
  hoTen: string;        // Họ và tên đầy đủ
  email: string;        // Email nội bộ
  vaiTro: StaffRole;    // Vai trò trong hệ thống
  trangThai: StaffStatus; // Trạng thái hoạt động
  ngayTao: string;      // Ngày tạo tài khoản (định dạng DD/MM/YYYY)
  mauAvatar: string;    // Màu nền avatar (để phân biệt trực quan)
};

// Dữ liệu mẫu – sẽ được thay bằng dữ liệu thật từ API
const STAFF_MOCK_DATA: StaffMember[] = [
  {
    id: 1,
    hoTen: "Nguyễn Tuấn",
    email: "tuan.nguyen@teestudio.vn",
    vaiTro: "admin",
    trangThai: "hoat_dong",
    ngayTao: "12/10/2023",
    mauAvatar: "bg-[#c9e6ff] text-[#0284c7]",
  },
  {
    id: 2,
    hoTen: "Lê Hoàng",
    email: "hoang.le@teestudio.vn",
    vaiTro: "kho",
    trangThai: "hoat_dong",
    ngayTao: "15/10/2023",
    mauAvatar: "bg-[#cce5ff] text-[#006398]",
  },
  {
    id: 3,
    hoTen: "Mai Anh",
    email: "anh.mai@teestudio.vn",
    vaiTro: "san_xuat",
    trangThai: "hoat_dong",
    ngayTao: "20/10/2023",
    mauAvatar: "bg-[#bee9ff] text-[#396477]",
  },
  {
    id: 4,
    hoTen: "Trần Dũng",
    email: "dung.tran@teestudio.vn",
    vaiTro: "ke_toan",
    trangThai: "vo_hieu",
    ngayTao: "05/11/2023",
    mauAvatar: "bg-[#e4e9ed] text-[#475569]",
  },
];

// Hàm tạo chữ viết tắt từ họ tên (lấy 2 chữ cái đầu của từng từ cuối)
// Ví dụ: "Nguyễn Tuấn" → "NT"
function layChuVietTat(hoTen: string): string {
  const cacTu = hoTen.trim().split(" ");
  if (cacTu.length === 1) {
    // Chỉ có 1 từ: lấy 2 ký tự đầu
    return cacTu[0].slice(0, 2).toUpperCase();
  }
  // Lấy ký tự đầu của từ đầu tiên và từ cuối cùng
  const kyTuDau = cacTu[0][0] ?? "";
  const kyTuCuoi = cacTu[cacTu.length - 1][0] ?? "";
  return (kyTuDau + kyTuCuoi).toUpperCase();
}

// Kiểu dữ liệu props của component bảng
type SettingStaffTableProps = {
  // Số lượng nhân viên mỗi trang (dùng cho phân trang)
  soNhanVienMoiTrang?: number;
  // Callback khi ấn nút "Chỉnh sửa" một nhân viên
  onChinhSua?: (id: number) => void;
};

export default function SettingStaffTable({
  soNhanVienMoiTrang = 4,
  onChinhSua,
}: SettingStaffTableProps) {
  // Trạng thái trang hiện tại (bắt đầu từ trang 1)
  // Dùng React useState để quản lý
  const [trangHienTai, setTrangHienTai] = React.useState(1);

  // Tính tổng số trang dựa trên dữ liệu
  const tongSoTrang = Math.ceil(STAFF_MOCK_DATA.length / soNhanVienMoiTrang);

  // Cắt danh sách nhân viên theo trang hiện tại
  const vitriDau = (trangHienTai - 1) * soNhanVienMoiTrang;
  const vitriCuoi = vitriDau + soNhanVienMoiTrang;
  const danhSachHienThi = STAFF_MOCK_DATA.slice(vitriDau, vitriCuoi);

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

      {/* ---- Tiêu đề bảng + nút Thêm nhân viên ---- */}
      <div className="flex items-center justify-between border-b border-border bg-surface p-6">
        <div>
          <h3 className="text-[17px] font-bold leading-6 text-on-surface">
            Danh sách nhân viên
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Quản lý quyền truy cập và thông tin liên hệ của đội ngũ.
          </p>
        </div>

        {/* Nút Thêm nhân viên – màu xanh chính */}
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-lg bg-[#0ea5e9] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0284c7]"
        >
          {/* Icon dấu + */}
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Thêm nhân viên
        </button>
      </div>

      {/* ---- Bảng dữ liệu ---- */}
      {/* overflow-x-auto để cuộn ngang trên màn hình nhỏ */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse text-left">

          {/* Tiêu đề cột – nền xám nhạt */}
          <thead className="border-b border-border bg-[#f8fafc] text-xs font-semibold uppercase text-text-secondary">
            <tr>
              <th className="px-6 py-4">Họ tên</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>

          {/* Thân bảng – mỗi hàng là một nhân viên */}
          <tbody className="divide-y divide-border bg-surface text-sm">
            {danhSachHienThi.map((nhanVien) => (
              <tr
                key={nhanVien.id}
                className="transition-colors hover:bg-[#f8fafc]/50"
              >
                {/* Cột Họ tên: avatar chữ cái viết tắt + tên */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar: vòng tròn với chữ viết tắt */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${nhanVien.mauAvatar}`}
                    >
                      {layChuVietTat(nhanVien.hoTen)}
                    </div>
                    {/* Tên đầy đủ */}
                    <span className="font-semibold text-on-surface">
                      {nhanVien.hoTen}
                    </span>
                  </div>
                </td>

                {/* Cột Email */}
                <td className="px-6 py-4 text-text-secondary">
                  {nhanVien.email}
                </td>

                {/* Cột Vai trò – dùng SettingRoleBadge */}
                <td className="px-6 py-4">
                  <SettingRoleBadge role={nhanVien.vaiTro} />
                </td>

                {/* Cột Trạng thái – dùng SettingStatusBadge */}
                <td className="px-6 py-4">
                  <SettingStatusBadge status={nhanVien.trangThai} />
                </td>

                {/* Cột Ngày tạo */}
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {nhanVien.ngayTao}
                </td>

                {/* Cột Thao tác: nút Chỉnh sửa */}
                <td className="px-6 py-4 text-center">
                  <button
                    type="button"
                    title="Chỉnh sửa thông tin nhân viên"
                    onClick={() => onChinhSua?.(nhanVien.id)}
                    className="p-1 text-text-muted transition-colors hover:text-[#0ea5e9]"
                  >
                    <EditOutlined className="text-[20px]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Thanh phân trang ---- */}
      <div className="flex items-center justify-between border-t border-border bg-surface p-4 text-sm text-text-secondary">
        {/* Thông tin số lượng đang hiển thị */}
        <span>
          Hiển thị {vitriDau + 1} -{" "}
          {Math.min(vitriCuoi, STAFF_MOCK_DATA.length)} của{" "}
          {STAFF_MOCK_DATA.length} nhân viên
        </span>

        {/* Các nút phân trang */}
        <div className="flex gap-1">
          {/* Nút về trang trước */}
          <button
            type="button"
            disabled={trangHienTai === 1}
            onClick={() => setTrangHienTai((t) => t - 1)}
            className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Icon mũi tên trái */}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Các số trang */}
          {Array.from({ length: tongSoTrang }, (_, i) => i + 1).map((soTrang) => (
            <button
              key={soTrang}
              type="button"
              onClick={() => setTrangHienTai(soTrang)}
              className={`flex h-8 w-8 items-center justify-center rounded text-sm font-semibold transition-colors ${
                trangHienTai === soTrang
                  ? "bg-[#c9e6ff] text-[#0ea5e9]"     // Trang đang chọn: xanh nhạt
                  : "hover:bg-surface-alt"              // Trang khác: hover xám
              }`}
            >
              {soTrang}
            </button>
          ))}

          {/* Nút sang trang sau */}
          <button
            type="button"
            disabled={trangHienTai === tongSoTrang}
            onClick={() => setTrangHienTai((t) => t + 1)}
            className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Icon mũi tên phải */}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Import React cần thiết cho useState (Next.js App Router tự động import React,
// nhưng khai báo rõ để code dễ hiểu hơn khi bảo vệ khóa luận)
import React from "react";

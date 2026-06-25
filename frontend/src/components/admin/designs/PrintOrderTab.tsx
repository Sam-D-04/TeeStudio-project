"use client";

/**
 * PrintOrderTab – Tab "Đơn cần in" trong trang Thiết kế & In ấn.
 *
 * Hiển thị danh sách các đơn hàng đã được duyệt thiết kế,
 * đang chờ được gửi đến xưởng in hoặc đang trong quá trình in.
 *
 * Dữ liệu lấy từ API GET /api/admin/designs/don-can-in.
 * Hành động "Gửi xưởng" gọi PATCH /api/admin/designs/don-can-in/:id/gui-xuong.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SendOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import DesignPreview from "./DesignPreview";

import * as designService from "@/services/admin/designService";
import type { DonCanIn } from "@/services/admin/designService";

// ─────────────────────────────────────────────────────────────────────────────
// Cấu hình badge trạng thái đơn in
// ─────────────────────────────────────────────────────────────────────────────
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

type PrintOrderTabProps = {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
};

export default function PrintOrderTab({
  statusFilter,
  onStatusFilterChange,
}: PrintOrderTabProps) {
  const queryClient = useQueryClient();

  // ── State phân trang ──
  const [trang, setTrang] = useState(1);

  // ─── Fetch danh sách đơn cần in ─────────────────────────────────────────
  const {
    data: ketQua,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["don-can-in", trang, statusFilter],
    queryFn: () =>
      designService.layDanhSachDonCanIn({
        page: trang,
        limit: 10,
        trang_thai: statusFilter || undefined,
      }),
    staleTime: 15_000,
  });

  // ─── Mutation: Gửi xưởng ─────────────────────────────────────────────────
  const mutationGuiXuong = useMutation({
    mutationFn: (id: number) => designService.guiDonXuongIn(id),
    onSuccess: () => {
      // Reload danh sách và KPI
      queryClient.invalidateQueries({ queryKey: ["don-can-in"] });
      queryClient.invalidateQueries({ queryKey: ["thiet-ke-thong-ke"] });
    },
    onError: (err: Error) => {
      alert(`Lỗi khi gửi xưởng: ${err.message}`);
    },
  });

  function xuLyGuiXuong(id: number) {
    if (window.confirm("Xác nhận gửi đơn này đến xưởng in?")) {
      mutationGuiXuong.mutate(id);
    }
  }

  const danhSach = ketQua?.danhSach ?? [];
  const tongSo = ketQua?.tongSo ?? 0;
  const tongSoTrang = ketQua?.tongSoTrang ?? 1;

  // Thống kê nhanh từ dữ liệu đang hiển thị
  const soChoGuiXuong = danhSach.filter((d) => d.trangThai === "cho_gui_xuong").length;
  const soDangIn = danhSach.filter((d) => d.trangThai === "dang_in").length;

  return (
    <div style={{ padding: 24 }}>
      {/* ── Thanh lọc + Thống kê nhanh ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Thống kê nhanh */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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

        {/* Dropdown lọc trạng thái */}
        <select
          value={statusFilter}
          onChange={(e) => {
            onStatusFilterChange(e.target.value);
            setTrang(1);
          }}
          style={{
            height: 36,
            padding: "0 12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 13,
            color: statusFilter ? "#0f172a" : "#94a3b8",
            outline: "none",
            cursor: "pointer",
            minWidth: 160,
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="cho_gui_xuong">Chờ gửi xưởng</option>
          <option value="dang_in">Đang in</option>
          <option value="da_in_xong">Đã in xong</option>
        </select>
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
        {/* Trạng thái đang tải */}
        {isLoading && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            <LoadingOutlined style={{ fontSize: 24, marginBottom: 8, display: "block" }} />
            Đang tải danh sách đơn in...
          </div>
        )}

        {/* Trạng thái lỗi */}
        {isError && !isLoading && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#ef4444", fontSize: 14 }}>
            <WarningOutlined style={{ fontSize: 24, marginBottom: 8, display: "block" }} />
            Không thể tải dữ liệu. Vui lòng thử lại sau.
          </div>
        )}

        {/* Trống */}
        {!isLoading && !isError && danhSach.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            Không có đơn cần in nào phù hợp.
          </div>
        )}

        {/* Bảng */}
        {!isLoading && !isError && danhSach.length > 0 && (
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
                  const cauHinh = CAU_HINH_TRANG_THAI[don.trangThai] ?? CAU_HINH_TRANG_THAI.cho_gui_xuong;
                  const dangGuiXuong =
                    mutationGuiXuong.isPending && mutationGuiXuong.variables === don.id;
                  return (
                    <tr
                      key={don.id}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        transition: "background-color 0.15s ease",
                      }}
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
                            urlAnh={don.urlPreview ?? undefined}
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
                        <span style={{ fontSize: 14, color: "#0f172a" }}>{don.tenKhachHang}</span>
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
                          {/* Nút Xem */}
                          <button
                            title="Xem chi tiết đơn"
                            onClick={() =>
                              alert(`Xem chi tiết đơn ${don.maDon} – Sẽ mở drawer trong phiên bản tiếp theo`)
                            }
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

                          {/* Nút Gửi xưởng – chỉ hiện khi "Chờ gửi xưởng" */}
                          {don.trangThai === "cho_gui_xuong" && (
                            <button
                              title="Gửi đến xưởng in"
                              onClick={() => xuLyGuiXuong(don.id)}
                              disabled={mutationGuiXuong.isPending}
                              style={{
                                height: 32,
                                padding: "0 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                borderRadius: 6,
                                border: "none",
                                background: dangGuiXuong ? "#7dd3fc" : "#0ea5e9",
                                color: "#ffffff",
                                cursor: mutationGuiXuong.isPending ? "not-allowed" : "pointer",
                                fontSize: 13,
                                fontWeight: 600,
                                transition: "background-color 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!mutationGuiXuong.isPending) {
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0284c7";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!mutationGuiXuong.isPending) {
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0ea5e9";
                                }
                              }}
                            >
                              {dangGuiXuong ? (
                                <LoadingOutlined style={{ fontSize: 13 }} />
                              ) : (
                                <SendOutlined style={{ fontSize: 13 }} />
                              )}
                              {dangGuiXuong ? "Đang gửi..." : "Gửi xưởng"}
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
        )}

        {/* Phân trang */}
        {!isLoading && !isError && danhSach.length > 0 && (
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, color: "#475569" }}>Tổng cộng {tongSo} đơn</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                disabled={trang <= 1}
                onClick={() => setTrang((t) => Math.max(1, t - 1))}
                style={{
                  width: 32, height: 32, display: "flex", alignItems: "center",
                  justifyContent: "center", border: "1px solid #e2e8f0", borderRadius: 6,
                  background: "#ffffff", color: trang <= 1 ? "#94a3b8" : "#0f172a",
                  cursor: trang <= 1 ? "not-allowed" : "pointer", fontSize: 16,
                }}
              >
                ‹
              </button>
              {Array.from({ length: tongSoTrang }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setTrang(p)}
                  style={{
                    width: 32, height: 32, display: "flex", alignItems: "center",
                    justifyContent: "center",
                    border: p === trang ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                    borderRadius: 6,
                    background: p === trang ? "#0ea5e9" : "#ffffff",
                    color: p === trang ? "#ffffff" : "#0f172a",
                    cursor: "pointer", fontSize: 14, fontWeight: p === trang ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={trang >= tongSoTrang}
                onClick={() => setTrang((t) => Math.min(tongSoTrang, t + 1))}
                style={{
                  width: 32, height: 32, display: "flex", alignItems: "center",
                  justifyContent: "center", border: "1px solid #e2e8f0", borderRadius: 6,
                  background: "#ffffff", color: trang >= tongSoTrang ? "#94a3b8" : "#0f172a",
                  cursor: trang >= tongSoTrang ? "not-allowed" : "pointer", fontSize: 16,
                }}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

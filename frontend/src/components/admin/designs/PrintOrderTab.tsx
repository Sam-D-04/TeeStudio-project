"use client";

/**
 * PrintOrderTab – Tab "Đơn cần in" trong trang Thiết kế & In ấn.
 *
 * Hiển thị danh sách các đơn hàng đã được duyệt thiết kế,
 * đang chờ được gửi đến xưởng in hoặc đang trong quá trình in.
 *
 * Dữ liệu lấy từ API GET /api/admin/designs/don-can-in.
 * Nhân viên xưởng cập nhật tuần tự: Chờ gửi xưởng → Đang in → Đã in xong.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, Select, message } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
  SyncOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import DesignPreview from "./DesignPreview";
import DateRangeFilter from "@/components/admin/common/DateRangeFilter";

import * as designService from "@/services/admin/designService";
import type { DonCanIn } from "@/services/admin/designService";
import { tinhThongSoInCm } from "./printTechpackUtils";

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

function taoUrlTaiCloudinary(url: string, tenFile: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("cloudinary.com")) return null;

    const uploadMarker = "/upload/";
    const uploadIndex = parsed.pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) return null;

    const tenFileKhongDuoi = tenFile
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .slice(0, 80);
    const downloadFlag = tenFileKhongDuoi
      ? `fl_attachment:${tenFileKhongDuoi}`
      : "fl_attachment";

    parsed.pathname = [
      parsed.pathname.slice(0, uploadIndex + uploadMarker.length),
      downloadFlag,
      parsed.pathname.slice(uploadIndex + uploadMarker.length),
    ].join("");

    return parsed.toString();
  } catch {
    return null;
  }
}

type PrintOrderTabProps = {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  dateRange: { tuNgay: string; denNgay: string };
  onDateRangeChange: (dateRange: { tuNgay: string; denNgay: string }) => void;
  onResetFilters: () => void;
};

export default function PrintOrderTab({
  statusFilter,
  onStatusFilterChange,
  dateRange,
  onDateRangeChange,
  onResetFilters,
}: PrintOrderTabProps) {
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [confirmModal, confirmModalContextHolder] = Modal.useModal();

  // ── State phân trang ──
  const [trang, setTrang] = useState(1);
  const [tuKhoa, setTuKhoa] = useState("");
  const [donDangChinhSua, setDonDangChinhSua] = useState<DonCanIn | null>(null);
  const [trangThaiMoi, setTrangThaiMoi] = useState<"dang_in" | "da_in_xong" | "">("");
  const [donDangXemPhieuIn, setDonDangXemPhieuIn] = useState<DonCanIn | null>(null);
  const [matDangXem, setMatDangXem] = useState<"front" | "back">("front");
  const [dangTaiFileIn, setDangTaiFileIn] = useState(false);

  // ─── Fetch danh sách đơn cần in ─────────────────────────────────────────
  const {
    data: ketQua,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["don-can-in", trang, tuKhoa, statusFilter, dateRange],
    queryFn: () =>
      designService.layDanhSachDonCanIn({
        page: trang,
        limit: 10,
        tu_khoa: tuKhoa || undefined,
        trang_thai: statusFilter || undefined,
        tu_ngay: dateRange.tuNgay || undefined,
        den_ngay: dateRange.denNgay || undefined,
      }),
    staleTime: 15_000,
  });

  const {
    data: techpack,
    isLoading: dangTaiTechpack,
    isError: loiTechpack,
  } = useQuery({
    queryKey: ["don-can-in-techpack", donDangXemPhieuIn?.id],
    queryFn: () => designService.layTechpackDonCanIn(donDangXemPhieuIn!.id),
    enabled: Boolean(donDangXemPhieuIn),
    staleTime: 30_000,
  });

  // ─── Mutation: Cập nhật một bước tiến độ in ──────────────────────────────
  const mutationTrangThai = useMutation({
    mutationFn: ({ id, trangThai }: {
      id: number;
      trangThai: "dang_in" | "da_in_xong";
    }) => designService.capNhatTrangThaiDonIn(id, trangThai),
    onSuccess: (_data, variables) => {
      messageApi.success(
        variables.trangThai === "dang_in"
          ? "Đã chuyển sản phẩm sang trạng thái Đang in"
          : "Đã xác nhận in xong, sản phẩm sẵn sàng giao"
      );
      queryClient.invalidateQueries({ queryKey: ["don-can-in"] });
      queryClient.invalidateQueries({ queryKey: ["thiet-ke-thong-ke"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-detail"] });
      setDonDangChinhSua(null);
      setTrangThaiMoi("");
    },
    onError: (err: Error) => {
      messageApi.error(`Không thể cập nhật tiến độ in: ${err.message}`);
    },
  });

  function moModalCapNhatTrangThai(don: DonCanIn) {
    if (don.trangThai === "da_in_xong") return;
    setDonDangChinhSua(don);
    setTrangThaiMoi("");
  }

  // Mở file in chuẩn (độ phân giải cao, đã cắt đúng vùng in) ở tab mới cho xưởng in tải về.
  // Đơn cũ (đặt trước khi có tính năng lưu printFileUrl) sẽ chưa có file mặt trước
  // này → tạm mở ảnh xem trước. Mặt sau chỉ tồn tại nếu thiết kế có in cả 2 mặt.
  function xemFileIn(don: DonCanIn, mat: "truoc" | "sau") {
    const urlFile = mat === "truoc" ? don.urlFileIn : don.urlFileInBack;
    if (urlFile) {
      window.open(urlFile, "_blank", "noopener,noreferrer");
      return;
    }
    if (mat === "truoc" && don.urlPreview) {
      messageApi.warning("Đơn này chưa có file in chuẩn, đang mở tạm ảnh xem trước.");
      window.open(don.urlPreview, "_blank", "noopener,noreferrer");
      return;
    }
    messageApi.warning("Đơn này chưa có ảnh thiết kế để xem.");
  }

  function moPhieuIn(don: DonCanIn) {
    setMatDangXem(don.urlFileIn ? "front" : don.urlFileInBack ? "back" : "front");
    setDonDangXemPhieuIn(don);
  }

  function dongPhieuIn() {
    setDonDangXemPhieuIn(null);
    setMatDangXem("front");
  }

  async function taiFileIn(url: string | null | undefined, tenFile: string) {
    if (!url) {
      messageApi.warning("Chưa có file in chuẩn để tải.");
      return;
    }

    setDangTaiFileIn(true);

    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = tenFile;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      messageApi.success("Đã bắt đầu tải ảnh in.");
    } catch (error) {
      const cloudinaryDownloadUrl = taoUrlTaiCloudinary(url, tenFile);
      if (cloudinaryDownloadUrl) {
        const link = document.createElement("a");

        link.href = cloudinaryDownloadUrl;
        link.download = tenFile;
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
        messageApi.success("Đã gửi yêu cầu tải ảnh in.");
      } else {
        messageApi.error("Không thể tải ảnh in. Vui lòng thử mở ảnh rồi lưu thủ công.");
      }
      console.error("Không thể tải file in:", error);
    } finally {
      setDangTaiFileIn(false);
    }
  }

  const tuyChonTrangThai = donDangChinhSua?.trangThai === "cho_gui_xuong"
    ? [{ value: "dang_in", label: "Đang in" }]
    : donDangChinhSua?.trangThai === "dang_in"
      ? [{ value: "da_in_xong", label: "Đã in xong (Sẵn sàng giao)" }]
      : [];

  const danhSach = ketQua?.danhSach ?? [];
  const tongSo = ketQua?.tongSo ?? 0;
  const tongSoTrang = ketQua?.tongSoTrang ?? 1;


  const fileMatTruoc = techpack?.fileIn?.front ?? null;
  const fileMatSau = techpack?.fileIn?.back ?? null;
  const thongSoMatTruoc = techpack
    ? tinhThongSoInCm(
      techpack.thietKe.canvasData,
      "front",
      fileMatTruoc,
      techpack.sanPham.shirtType
    )
    : null;
  const thongSoMatSau = techpack
    ? tinhThongSoInCm(
      techpack.thietKe.canvasData,
      "back",
      fileMatSau,
      techpack.sanPham.shirtType
    )
    : null;
  const fileDangXem = matDangXem === "front" ? fileMatTruoc : fileMatSau;
  const thongSoDangXem = matDangXem === "front" ? thongSoMatTruoc : thongSoMatSau;
  const coMatTruoc = Boolean(fileMatTruoc?.url || thongSoMatTruoc);
  const coMatSau = Boolean(fileMatSau?.url || thongSoMatSau);

  return (
    <>
      {messageContextHolder}
      {confirmModalContextHolder}
      <Modal
        open={Boolean(donDangXemPhieuIn)}
        title={`Phiếu thông số in${donDangXemPhieuIn ? ` - ${donDangXemPhieuIn.maDon}` : ""}`}
        footer={null}
        width={980}
        centered
        onCancel={dongPhieuIn}
      >
        {dangTaiTechpack && (
          <div style={{ padding: "44px 0", textAlign: "center", color: "#64748b" }}>
            <LoadingOutlined style={{ fontSize: 24, marginBottom: 10, display: "block" }} />
            Đang tải phiếu thông số...
          </div>
        )}

        {loiTechpack && !dangTaiTechpack && (
          <div style={{ padding: "44px 0", textAlign: "center", color: "#ef4444" }}>
            <WarningOutlined style={{ fontSize: 24, marginBottom: 10, display: "block" }} />
            Không thể tải phiếu thông số in.
          </div>
        )}

        {techpack && !dangTaiTechpack && !loiTechpack && (
          <div style={{ display: "grid", gap: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 10,
                padding: 14,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                background: "#f8fafc",
              }}
            >
              {[
                ["Mã đơn", techpack.maDon],
                ["Mã thiết kế", techpack.thietKe.maThietKe],
                ["Khách hàng", techpack.khachHang.ten],
                ["Sản phẩm", techpack.sanPham.ten],
                ["Size / màu", `${techpack.sanPham.size || "-"} / ${techpack.sanPham.tenMau || techpack.sanPham.mauAo}`],
                ["Số lượng", `${techpack.soLuong} áo`],
                ["SKU", techpack.sanPham.sku || "-"],
                ["Vị trí in", techpack.thietKe.viTriIn],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setMatDangXem("front")}
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 6,
                  border: matDangXem === "front" ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                  background: matDangXem === "front" ? "#e0f2fe" : "#ffffff",
                  color: matDangXem === "front" ? "#0369a1" : "#475569",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Mặt trước{coMatTruoc ? "" : " (trống)"}
              </button>
              <button
                type="button"
                onClick={() => setMatDangXem("back")}
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 6,
                  border: matDangXem === "back" ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                  background: matDangXem === "back" ? "#e0f2fe" : "#ffffff",
                  color: matDangXem === "back" ? "#0369a1" : "#475569",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Mặt sau{coMatSau ? "" : " (trống)"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              <div
                style={{
                  minHeight: 360,
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: 16,
                }}
              >
                {fileDangXem?.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={fileDangXem.url}
                    alt={`File in ${matDangXem === "front" ? "mặt trước" : "mặt sau"}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 420,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#64748b", fontSize: 14 }}>
                    <WarningOutlined style={{ fontSize: 24, marginBottom: 8, display: "block" }} />
                    Chưa có file in chuẩn cho mặt này.
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 14,
                    background: "#ffffff",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Thông số in</div>
                  {thongSoDangXem ? (
                    <>
                      <div style={{ fontSize: 18, lineHeight: 1.35, color: "#0f172a", fontWeight: 800 }}>
                        {thongSoDangXem.summary}
                      </div>
                      <div style={{ marginTop: 8, color: "#475569", fontSize: 13 }}>
                        {thongSoDangXem.detail}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      Không có phần tử thiết kế trên mặt này để tính thông số.
                    </div>
                  )}
                </div>

                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 14,
                    background: "#ffffff",
                    display: "grid",
                    gap: 8,
                    fontSize: 13,
                    color: "#334155",
                  }}
                >
                  <div><strong>Mặt in:</strong> {matDangXem === "front" ? "Mặt trước" : "Mặt sau"}</div>
                  <div><strong>Kích thước vùng in:</strong> {fileDangXem?.viTriIn?.maxWidthCm || "-"}cm x {fileDangXem?.viTriIn?.maxHeightCm || "-"}cm</div>
                  <div><strong>Số layer:</strong> {thongSoDangXem?.elementCount ?? 0}</div>
                  <div><strong>Link ảnh:</strong> {fileDangXem?.url ? "Đã sẵn sàng" : "Chưa có"}</div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => fileDangXem?.url && window.open(fileDangXem.url, "_blank", "noopener,noreferrer")}
                    disabled={!fileDangXem?.url}
                    style={{
                      height: 36,
                      padding: "0 12px",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      background: fileDangXem?.url ? "#ffffff" : "#f1f5f9",
                      color: fileDangXem?.url ? "#0f172a" : "#94a3b8",
                      cursor: fileDangXem?.url ? "pointer" : "not-allowed",
                      fontWeight: 700,
                    }}
                  >
                    <EyeOutlined /> Mở ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => taiFileIn(
                      fileDangXem?.url,
                      `${techpack.maDon}-${matDangXem === "front" ? "mat-truoc" : "mat-sau"}.png`
                    )}
                    disabled={!fileDangXem?.url || dangTaiFileIn}
                    style={{
                      height: 36,
                      padding: "0 12px",
                      borderRadius: 6,
                      border: "1px solid #0ea5e9",
                      background: fileDangXem?.url && !dangTaiFileIn ? "#0ea5e9" : "#e2e8f0",
                      color: "#ffffff",
                      cursor: fileDangXem?.url && !dangTaiFileIn ? "pointer" : "not-allowed",
                      fontWeight: 700,
                    }}
                  >
                    {dangTaiFileIn ? <LoadingOutlined /> : <DownloadOutlined />} Tải ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={Boolean(donDangChinhSua)}
        title="Cập nhật trạng thái đơn cần in"
        okText="Cập nhật"
        cancelText="Hủy"
        centered
        confirmLoading={mutationTrangThai.isPending}
        okButtonProps={{ disabled: !trangThaiMoi || mutationTrangThai.isPending }}
        onCancel={() => {
          if (mutationTrangThai.isPending) return;
          setDonDangChinhSua(null);
          setTrangThaiMoi("");
        }}
        onOk={() => {
          if (!donDangChinhSua || !trangThaiMoi) return;
          const nhanTrangThaiMoi = trangThaiMoi === "dang_in"
            ? "Đang in"
            : "Đã in xong (Sẵn sàng giao)";

          confirmModal.confirm({
            title: "Xác nhận chuyển trạng thái",
            content: (
              <span>
                Bạn có chắc muốn chuyển đơn <strong>{donDangChinhSua.maDon}</strong> sang trạng thái{" "}
                <strong>{nhanTrangThaiMoi}</strong>? Thao tác này không thể hoàn tác.
              </span>
            ),
            okText: "Xác nhận",
            cancelText: "Quay lại",
            centered: true,
            okButtonProps: {
              type: "primary",
              danger: trangThaiMoi === "da_in_xong",
            },
            onOk: () => mutationTrangThai.mutateAsync({
              id: donDangChinhSua.id,
              trangThai: trangThaiMoi,
            }),
          });
        }}
      >
        <div style={{ display: "grid", gap: 16, paddingTop: 8 }}>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: "#f8fafc",
              color: "#475569",
              fontSize: 13,
            }}
          >
            Đơn hàng: <strong style={{ color: "#0f172a" }}>{donDangChinhSua?.maDon}</strong>
            <br />
            Trạng thái hiện tại:{" "}
            <strong style={{ color: "#0f172a" }}>
              {donDangChinhSua
                ? CAU_HINH_TRANG_THAI[donDangChinhSua.trangThai].nhan
                : ""}
            </strong>
          </div>
          <div>
            <label
              htmlFor="trang-thai-don-in"
              style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}
            >
              Chuyển sang trạng thái
            </label>
            <Select
              id="trang-thai-don-in"
              value={trangThaiMoi || undefined}
              placeholder="Chọn trạng thái được phép chuyển"
              options={tuyChonTrangThai}
              disabled={mutationTrangThai.isPending}
              style={{ width: "100%" }}
              onChange={setTrangThaiMoi}
            />
          </div>
        </div>
      </Modal>
      <div style={{ padding: 24 }}>
      {/* ── Thanh lọc ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Bộ lọc ngày và trạng thái */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: 220, width: 260 }}>
            <SearchOutlined
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: 14,
                pointerEvents: "none",
              }}
            />
            <input
              type="search"
              placeholder="Tìm mã TK, mã đơn, tên khách..."
              value={tuKhoa}
              onChange={(e) => {
                const giaTriMoi = e.target.value;
                setTuKhoa(giaTriMoi);
                if (giaTriMoi.trim()) {
                  onStatusFilterChange("");
                }
                setTrang(1);
              }}
              style={{
                width: "100%",
                height: 36,
                padding: "0 12px 0 34px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <DateRangeFilter
            key={`${dateRange.tuNgay}-${dateRange.denNgay}`}
            initialPreset={dateRange.tuNgay && dateRange.denNgay ? "custom" : "all"}
            initialStartDate={dateRange.tuNgay}
            initialEndDate={dateRange.denNgay}
            allowClear
            onChange={(tuNgay, denNgay) => {
              onDateRangeChange({ tuNgay, denNgay });
              setTrang(1);
            }}
            onClear={() => {
              onDateRangeChange({ tuNgay: "", denNgay: "" });
              setTrang(1);
            }}
            className="w-full sm:w-auto"
            selectClassName="h-9"
            rangePickerClassName="h-9 min-w-[240px] sm:w-[280px]"
          />
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
          <button
            type="button"
            onClick={() => {
              setTrang(1);
              setTuKhoa("");
              onResetFilters();
            }}
            className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
          >
            <SyncOutlined /> Đặt lại
          </button>
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
                  {["MÃ ĐƠN", "THIẾT KẾ", "KHÁCH HÀNG", "SỐ LƯỢNG", "VỊ TRÍ IN", "TRẠNG THÁI", "NGÀY ĐẶT ĐƠN", "THAO TÁC"].map(
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
                            urlAnhMatSau={don.urlFileInBack ?? undefined}
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

                      {/* Ngày khách đặt đơn (CustomerOrder.createdAt) */}
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13, color: "#475569" }}>{don.ngayDatDon}</span>
                      </td>

                      {/* Thao tác */}
                      <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                          <button
                            title="Phiếu thông số in"
                            aria-label={`Phiếu thông số in ${don.maDon}`}
                            onClick={() => moPhieuIn(don)}
                            style={{
                              width: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 6,
                              border: "1px solid #bae6fd",
                              background: "#e0f2fe",
                              color: "#0284c7",
                              cursor: "pointer",
                              fontSize: 14,
                              transition: "all 0.15s ease",
                            }}
                          >
                            <FileTextOutlined />
                          </button>
                          {/* Nút Xem file in chuẩn - mặt trước (luôn có, kể cả đơn cũ chỉ 1 mặt) */}
                          <button
                            title={don.urlFileInBack ? "Xem file in mặt trước" : "Xem file in chuẩn"}
                            onClick={() => xemFileIn(don, "truoc")}
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

                          {/* Nút Xem file in mặt sau - chỉ hiện khi thiết kế có in mặt sau */}
                          {don.urlFileInBack && (
                            <button
                              title="Xem file in mặt sau"
                              onClick={() => xemFileIn(don, "sau")}
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
                              <EyeOutlined rotate={180} />
                            </button>
                          )}

                          <button
                            title={don.trangThai === "da_in_xong"
                              ? "Đơn in đã hoàn tất"
                              : "Cập nhật trạng thái"}
                            aria-label={`Cập nhật trạng thái ${don.maDon}`}
                            onClick={() => moModalCapNhatTrangThai(don)}
                            disabled={don.trangThai === "da_in_xong" || mutationTrangThai.isPending}
                            style={{
                              width: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 6,
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              color: don.trangThai === "da_in_xong" ? "#cbd5e1" : "#0ea5e9",
                              cursor: don.trangThai === "da_in_xong" ? "not-allowed" : "pointer",
                              fontSize: 14,
                              transition: "all 0.15s ease",
                            }}
                          >
                            <EditOutlined />
                          </button>
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
    </>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, message } from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  LoadingOutlined,
  ShopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import * as inventoryService from "@/services/admin/inventoryService";
import type { BienTheNhapKho } from "@/services/admin/inventoryService";

// ──────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────

/** Một dòng trong bảng nhập kho */
type DongNhapKho = {
  /** ID duy nhất của dòng (dùng để xóa) */
  uid: number;
  /** ID sản phẩm đang chọn */
  sanPhamId: number | null;
  /** ID biến thể đang chọn */
  bienTheId: number | null;
  /** Số lượng nhập */
  soLuong: string;
  /** Lỗi từng trường */
  loi: { soLuong?: string; bienThe?: string; sanPham?: string };
};

let _uid = 0;
function nextUid() {
  return ++_uid;
}

function dongNhapKhoMoi(): DongNhapKho {
  return {
    uid: nextUid(),
    sanPhamId: null,
    bienTheId: null,
    soLuong: "",
    loi: {},
  };
}

// ──────────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────────

/**
 * NhapKhoPage – Trang nhập kho phôi áo (điều hướng URL).
 *
 * Cho phép admin nhập nhiều dòng cùng lúc (multi-row):
 *  1. Chọn sản phẩm → tự lọc danh sách biến thể
 *  2. Chọn biến thể (màu/size)
 *  3. Nhập số lượng
 *  4. (Tuỳ chọn) Chọn nhà cung cấp và nhập ghi chú chung
 *  5. Nhấn "Xác nhận nhập kho" → gọi API tuần tự
 */
export default function NhapKhoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Trạng thái form ──
  const [danhSachDong, setDanhSachDong] = useState<DongNhapKho[]>([
    dongNhapKhoMoi(),
  ]);
  const [nhaCungCapId, setNhaCungCapId] = useState<number | null>(null);
  const [ghiChuChung, setGhiChuChung] = useState("");
  const [loiGhiChu, setLoiGhiChu] = useState("");
  const [dangGui, setDangGui] = useState(false);

  // ── API: Danh sách sản phẩm + biến thể ──
  const {
    data: danhSachSanPham = [],
    isLoading: dangTaiSanPham,
  } = useQuery({
    queryKey: ["inventory", "products-with-variants"],
    queryFn: inventoryService.layDanhSachSanPhamVaBienThe,
    staleTime: 60_000,
  });

  // ── API: Danh sách nhà cung cấp ──
  const {
    data: danhSachNhaCungCap = [],
    isLoading: dangTaiNCC,
  } = useQuery({
    queryKey: ["inventory", "suppliers"],
    queryFn: inventoryService.layDanhSachNhaCungCap,
    staleTime: 120_000,
  });

  // ── Options Select cho sản phẩm ──
  const optionsSanPham = useMemo(
    () =>
      danhSachSanPham.map((sp) => ({
        value: sp.id,
        label: sp.ten,
      })),
    [danhSachSanPham]
  );

  // ── Lấy biến thể của một sản phẩm ──
  function layBienTheCuaSanPham(sanPhamId: number | null): BienTheNhapKho[] {
    if (!sanPhamId) return [];
    return danhSachSanPham.find((sp) => sp.id === sanPhamId)?.danhSachBienThe ?? [];
  }

  // ── Xử lý thêm dòng ──
  function themDong() {
    setDanhSachDong((prev) => [...prev, dongNhapKhoMoi()]);
  }

  // ── Xử lý xóa dòng ──
  function xoaDong(uid: number) {
    setDanhSachDong((prev) => {
      if (prev.length === 1) return prev; // Giữ ít nhất 1 dòng
      return prev.filter((d) => d.uid !== uid);
    });
  }

  // ── Cập nhật một trường trong dòng ──
  function capNhatDong(uid: number, field: keyof DongNhapKho, value: unknown) {
    setDanhSachDong((prev) =>
      prev.map((d) => {
        if (d.uid !== uid) return d;
        const updated = { ...d, [field]: value, loi: { ...d.loi } };
        // Nếu đổi sản phẩm → reset biến thể
        if (field === "sanPhamId") {
          updated.bienTheId = null;
          delete updated.loi.bienThe;
          delete updated.loi.sanPham;
        }
        if (field === "soLuong") delete updated.loi.soLuong;
        if (field === "bienTheId") delete updated.loi.bienThe;
        return updated;
      })
    );
  }

  // ── Validate toàn bộ form ──
  function kiemTraForm(): boolean {
    let hopLe = true;
    setDanhSachDong((prev) =>
      prev.map((d) => {
        const loi: DongNhapKho["loi"] = {};
        if (!d.sanPhamId) {
          loi.sanPham = "Vui lòng chọn sản phẩm";
          hopLe = false;
        }
        if (!d.bienTheId) {
          loi.bienThe = "Vui lòng chọn biến thể";
          hopLe = false;
        }
        const soLuongInt = parseInt(d.soLuong);
        if (!d.soLuong || isNaN(soLuongInt) || soLuongInt <= 0) {
          loi.soLuong = "Số lượng phải là số nguyên dương";
          hopLe = false;
        }
        return { ...d, loi };
      })
    );

    // Kiểm tra trùng biến thể
    const bienTheIds = danhSachDong
      .filter((d) => d.bienTheId !== null)
      .map((d) => d.bienTheId);
    const bienTheTrung = bienTheIds.length !== new Set(bienTheIds).size;
    if (bienTheTrung) {
      message.error("Có biến thể bị trùng lặp. Vui lòng kiểm tra lại.");
      hopLe = false;
    }

    // Kiểm tra ghi chú chung (bắt buộc)
    if (!ghiChuChung.trim() || ghiChuChung.trim().length < 3) {
      setLoiGhiChu("Ghi chú nhập kho phải có ít nhất 3 ký tự");
      hopLe = false;
    } else if (ghiChuChung.trim().length > 300) {
      setLoiGhiChu("Ghi chú không được vượt quá 300 ký tự");
      hopLe = false;
    } else {
      setLoiGhiChu("");
    }

    return hopLe;
  }

  // ── Xử lý submit ──
  async function xuLyXacNhan() {
    if (!kiemTraForm()) return;
    setDangGui(true);

    let soThanhCong = 0;
    let soThatBai = 0;

    try {
      for (const dong of danhSachDong) {
        try {
          await inventoryService.ghiGiaoDichKho({
            variantId: dong.bienTheId!,
            quantityChanged: parseInt(dong.soLuong),
            transactionType: "IMPORT",
            reason: ghiChuChung.trim(),
            supplierId: nhaCungCapId ?? undefined,
          });
          soThanhCong++;
        } catch (err: unknown) {
          soThatBai++;
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Lỗi không xác định";
          const bienThe = danhSachSanPham
            .flatMap((sp) => sp.danhSachBienThe)
            .find((bt) => bt.id === dong.bienTheId);
          message.error(
            `Lỗi biến thể ${bienThe?.sku ?? dong.bienTheId}: ${msg}`
          );
        }
      }

      if (soThanhCong > 0) {
        // Làm mới dữ liệu kho
        queryClient.invalidateQueries({ queryKey: ["inventory"] });

        if (soThatBai === 0) {
          message.success(`Đã nhập kho thành công ${soThanhCong} biến thể!`);
          router.push("/admin/kho-hang");
        } else {
          message.warning(
            `Nhập kho xong: ${soThanhCong} thành công, ${soThatBai} thất bại.`
          );
        }
      }
    } finally {
      setDangGui(false);
    }
  }

  // ── Tính tổng số lượng sẽ nhập ──
  const tongSoLuong = danhSachDong.reduce((sum, d) => {
    const n = parseInt(d.soLuong);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ===== BREADCRUMB + TIÊU ĐỀ ===== */}
      <div>
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-2 text-sm text-text-secondary">
          <Link
            href="/admin/kho-hang"
            className="flex items-center gap-1 transition-colors hover:text-primary-container"
          >
            <ArrowLeftOutlined />
            <span>Quay lại Quản lý kho</span>
          </Link>
          <span className="text-border">/</span>
          <span className="font-medium text-text-main">Nhập kho phôi áo</span>
        </div>

        {/* Tiêu đề */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[28px] font-black leading-[36px] tracking-tight text-text-main">
              Nhập kho phôi áo
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Ghi nhận lô hàng nhập kho mới. Bạn có thể nhập nhiều biến thể cùng lúc.
            </p>
          </div>

          {/* Badge tổng số lượng */}
          {tongSoLuong > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-[#059669]/30 bg-[#059669]/10 px-4 py-2">
              <InboxOutlined className="text-[#059669]" />
              <span className="text-sm font-semibold text-[#059669]">
                Tổng: {tongSoLuong.toLocaleString("vi-VN")} áo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== THÔNG TIN CHUNG (Nhà cung cấp + Ghi chú) ===== */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="border-b border-border bg-surface-alt px-6 py-4">
          <div className="flex items-center gap-2">
            <ShopOutlined className="text-primary-container" />
            <h3 className="text-[15px] font-bold text-text-main">
              Thông tin chung
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          {/* Nhà cung cấp (tuỳ chọn) */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-main">
              Nhà cung cấp{" "}
              <span className="font-normal text-text-muted">(tuỳ chọn)</span>
            </label>
            {dangTaiNCC ? (
              <div className="flex h-10 items-center gap-2 text-xs text-text-secondary">
                <LoadingOutlined spin />
                <span>Đang tải danh sách nhà cung cấp...</span>
              </div>
            ) : (
              <Select
                placeholder="Chọn nhà cung cấp..."
                allowClear
                showSearch
                optionFilterProp="label"
                className="w-full"
                size="large"
                value={nhaCungCapId}
                onChange={(val) => setNhaCungCapId(val ?? null)}
                options={danhSachNhaCungCap.map((ncc) => ({
                  value: ncc.id,
                  label: ncc.soDienThoai
                    ? `${ncc.ten} – ${ncc.soDienThoai}`
                    : ncc.ten,
                }))}
                notFoundContent={
                  <span className="text-xs text-text-muted">
                    Không tìm thấy nhà cung cấp nào.
                  </span>
                }
              />
            )}
          </div>

          {/* Ghi chú nhập kho (bắt buộc) */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-main">
              Ghi chú nhập kho{" "}
              <span className="text-[#b91c1c]">*</span>
            </label>
            <input
              type="text"
              value={ghiChuChung}
              onChange={(e) => {
                setGhiChuChung(e.target.value);
                setLoiGhiChu("");
              }}
              placeholder="Ví dụ: Nhập từ NCC Vải Xanh – Đơn PO-2025-06-001..."
              className={`h-10 w-full rounded-lg border px-3 text-sm text-text-main outline-none transition-all focus:ring-1 ${
                loiGhiChu
                  ? "border-[#b91c1c] focus:border-[#b91c1c] focus:ring-[#b91c1c]"
                  : "border-border focus:border-primary-container focus:ring-primary-container"
              }`}
            />
            {loiGhiChu && (
              <p className="mt-1 text-xs text-[#b91c1c]">{loiGhiChu}</p>
            )}
            <p className="mt-1 text-xs text-text-muted">
              {ghiChuChung.length}/300 ký tự – Ghi chú này áp dụng cho tất cả biến thể bên dưới
            </p>
          </div>
        </div>
      </div>

      {/* ===== BẢNG NHẬP KHO MULTI-ROW ===== */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* Header bảng */}
        <div className="flex items-center justify-between border-b border-border bg-surface-alt px-6 py-4">
          <div className="flex items-center gap-2">
            <InboxOutlined className="text-primary-container" />
            <h3 className="text-[15px] font-bold text-text-main">
              Danh sách biến thể cần nhập
            </h3>
            <span className="rounded-full bg-primary-container/10 px-2 py-0.5 text-xs font-semibold text-primary-container">
              {danhSachDong.length} dòng
            </span>
          </div>
          <button
            type="button"
            onClick={themDong}
            disabled={dangGui}
            className="flex items-center gap-1.5 rounded-lg border border-primary-container/40 bg-primary-container/10 px-3 py-1.5 text-sm font-semibold text-primary-container transition-colors hover:bg-primary-container/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusOutlined />
            Thêm dòng
          </button>
        </div>

        {/* Trạng thái đang tải sản phẩm */}
        {dangTaiSanPham && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-secondary">
            <LoadingOutlined style={{ fontSize: 20 }} className="animate-spin" />
            <span>Đang tải danh sách sản phẩm...</span>
          </div>
        )}

        {/* Bảng dữ liệu */}
        {!dangTaiSanPham && (
          <div className="overflow-x-auto">
            {/* Header cột */}
            <div className="grid grid-cols-[1fr_1fr_140px_44px] gap-3 border-b border-border bg-surface-container-low px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <span>Sản phẩm <span className="text-[#b91c1c]">*</span></span>
              <span>Biến thể (màu / size) <span className="text-[#b91c1c]">*</span></span>
              <span>Số lượng nhập <span className="text-[#b91c1c]">*</span></span>
              <span />
            </div>

            {/* Các dòng nhập */}
            <div className="divide-y divide-border">
              {danhSachDong.map((dong, idx) => {
                const bienThes = layBienTheCuaSanPham(dong.sanPhamId);
                const bienTheHienTai = bienThes.find(
                  (bt) => bt.id === dong.bienTheId
                );

                return (
                  <div
                    key={dong.uid}
                    className="grid grid-cols-[1fr_1fr_140px_44px] items-start gap-3 px-6 py-4 transition-colors hover:bg-surface-alt/50"
                  >
                    {/* Cột 1: Chọn sản phẩm */}
                    <div className="space-y-1">
                      <Select
                        placeholder="Chọn sản phẩm..."
                        showSearch
                        optionFilterProp="label"
                        className="w-full"
                        size="middle"
                        value={dong.sanPhamId}
                        onChange={(val) =>
                          capNhatDong(dong.uid, "sanPhamId", val ?? null)
                        }
                        options={optionsSanPham}
                        status={dong.loi.sanPham ? "error" : undefined}
                        notFoundContent={
                          <span className="text-xs text-text-muted">
                            Không tìm thấy sản phẩm.
                          </span>
                        }
                      />
                      {dong.loi.sanPham && (
                        <p className="text-xs text-[#b91c1c]">
                          {dong.loi.sanPham}
                        </p>
                      )}
                    </div>

                    {/* Cột 2: Chọn biến thể */}
                    <div className="space-y-1">
                      <Select
                        placeholder={
                          dong.sanPhamId
                            ? "Chọn màu / size..."
                            : "Chọn sản phẩm trước"
                        }
                        disabled={!dong.sanPhamId}
                        className="w-full"
                        size="middle"
                        value={dong.bienTheId}
                        onChange={(val) =>
                          capNhatDong(dong.uid, "bienTheId", val ?? null)
                        }
                        status={dong.loi.bienThe ? "error" : undefined}
                        options={bienThes.map((bt) => ({
                          value: bt.id,
                          label: `${bt.mau} / ${bt.size} – Tồn: ${bt.tonHienTai}`,
                          disabled: false,
                        }))}
                        notFoundContent={
                          <span className="text-xs text-text-muted">
                            Sản phẩm này chưa có biến thể nào.
                          </span>
                        }
                      />
                      {dong.loi.bienThe && (
                        <p className="text-xs text-[#b91c1c]">
                          {dong.loi.bienThe}
                        </p>
                      )}
                      {/* Hiển thị SKU + tồn hiện tại */}
                      {bienTheHienTai && (
                        <p className="font-mono text-[11px] text-text-muted">
                          SKU: {bienTheHienTai.sku} · Tồn:{" "}
                          <span className="font-semibold text-text-secondary">
                            {bienTheHienTai.tonHienTai}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Cột 3: Số lượng */}
                    <div className="space-y-1">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#059669]">
                          +
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={dong.soLuong}
                          onChange={(e) =>
                            capNhatDong(dong.uid, "soLuong", e.target.value)
                          }
                          placeholder="0"
                          className={`h-9 w-full rounded-lg border pl-7 pr-3 text-sm text-text-main outline-none transition-all focus:ring-1 ${
                            dong.loi.soLuong
                              ? "border-[#b91c1c] focus:border-[#b91c1c] focus:ring-[#b91c1c]"
                              : "border-border focus:border-primary-container focus:ring-primary-container"
                          }`}
                        />
                      </div>
                      {dong.loi.soLuong && (
                        <p className="text-xs text-[#b91c1c]">
                          {dong.loi.soLuong}
                        </p>
                      )}
                    </div>

                    {/* Cột 4: Nút xóa dòng */}
                    <div className="flex items-start pt-1">
                      <button
                        type="button"
                        onClick={() => xoaDong(dong.uid)}
                        disabled={danhSachDong.length === 1 || dangGui}
                        title="Xóa dòng này"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-[#b91c1c]/10 hover:text-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nút thêm dòng (footer) */}
        {!dangTaiSanPham && (
          <div className="border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={themDong}
              disabled={dangGui}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-text-secondary transition-colors hover:border-primary-container hover:text-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlusOutlined />
              Thêm biến thể khác
            </button>
          </div>
        )}
      </div>

      {/* ===== TỔNG KẾT + NÚT HÀNH ĐỘNG ===== */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">

          {/* Tổng kết */}
          <div className="space-y-1">
            <p className="text-sm text-text-secondary">
              Sẽ tạo{" "}
              <strong className="text-text-main">{danhSachDong.length} giao dịch nhập kho</strong>
              {tongSoLuong > 0 && (
                <>
                  {" "}với tổng cộng{" "}
                  <strong className="text-[#059669]">
                    +{tongSoLuong.toLocaleString("vi-VN")} áo
                  </strong>
                </>
              )}.
            </p>
            {nhaCungCapId && (
              <p className="text-xs text-text-muted">
                Nhà cung cấp:{" "}
                <span className="font-semibold text-text-secondary">
                  {danhSachNhaCungCap.find((ncc) => ncc.id === nhaCungCapId)?.ten}
                </span>
              </p>
            )}
          </div>

          {/* Nhóm nút */}
          <div className="flex items-center gap-3">
            {/* Nút Hủy */}
            <Link
              href="/admin/kho-hang"
              className="flex h-10 items-center rounded-lg border border-border px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
            >
              Hủy
            </Link>

            {/* Nút Xác nhận */}
            <button
              type="button"
              onClick={xuLyXacNhan}
              disabled={dangGui || dangTaiSanPham}
              className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-6 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {dangGui ? (
                <>
                  <LoadingOutlined />
                  Đang nhập kho...
                </>
              ) : (
                <>
                  <CheckCircleOutlined />
                  Xác nhận nhập kho
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

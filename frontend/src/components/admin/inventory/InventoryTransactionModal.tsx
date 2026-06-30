"use client";

import { useState } from "react";
import { Modal, Select, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InventoryItem } from "./InventoryTable";
import * as inventoryService from "@/services/admin/inventoryService";
import type { LoaiGiaoDich } from "@/services/admin/inventoryService";

/**
 * InventoryTransactionModal – modal ghi nhận giao dịch kho.
 *
 * Cho phép nhân viên kho:
 * 1. Chọn loại giao dịch (Nhập / Xuất / Điều chỉnh / ...)
 * 2. Nhập số lượng thay đổi
 * 3. Nhập lý do / ghi chú
 * 4. Xác nhận → gọi API ghiGiaoDichKho → cập nhật UI
 */

// Danh sách loại giao dịch để hiển thị trong dropdown
const LOAI_GIAO_DICH_OPTIONS: {
  value: LoaiGiaoDich;
  label: string;
  dauHieu: "+" | "-";
}[] = [
  { value: "IMPORT",     label: "Nhập kho từ nhà cung cấp", dauHieu: "+" },
  { value: "RETURN",     label: "Hoàn trả từ đơn hàng",     dauHieu: "+" },
  { value: "EXPORT",     label: "Xuất kho (lý do khác)",    dauHieu: "-" },
  { value: "ADJUSTMENT", label: "Điều chỉnh tồn kho",       dauHieu: "+" },
];

type InventoryTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
};

export default function InventoryTransactionModal({
  isOpen,
  onClose,
  item,
}: InventoryTransactionModalProps) {
  const [messageApi, messageContextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // ===== TRẠNG THÁI FORM =====
  // Khai báo tất cả hook VÔ ĐIỀU KIỆN – không đặt return trước hook
  const [loaiGiaoDich, setLoaiGiaoDich] = useState<LoaiGiaoDich>("IMPORT");
  const [nhaCungCapId, setNhaCungCapId] = useState<number | null>(null);
  const [soLuong, setSoLuong] = useState<string>("");
  const [lyDo, setLyDo] = useState<string>("");
  const [loiForm, setLoiForm] = useState<Record<string, string>>({});

  function resetForm() {
    setLoaiGiaoDich("IMPORT");
    setNhaCungCapId(null);
    setSoLuong("");
    setLyDo("");
    setLoiForm({});
  }

  // Xác định dấu hiệu dương/âm theo loại giao dịch
  const infoLoai = LOAI_GIAO_DICH_OPTIONS.find((o) => o.value === loaiGiaoDich);
  const isNhap = infoLoai?.dauHieu === "+";

  // Chỉ tải danh sách nhà cung cấp khi modal đang ghi nhận một giao dịch nhập kho.
  const {
    data: danhSachNhaCungCap = [],
    isLoading: dangTaiNhaCungCap,
  } = useQuery({
    queryKey: ["inventory", "suppliers"],
    queryFn: inventoryService.layDanhSachNhaCungCap,
    enabled: isOpen && loaiGiaoDich === "IMPORT",
    staleTime: 120_000,
  });

  // ===== MUTATION GỌI API =====
  const mutation = useMutation<
    inventoryService.KetQuaGhiGiaoDich,
    Error,
    inventoryService.GhiGiaoDichInput
  >({
    mutationFn: inventoryService.ghiGiaoDichKho,
    onSuccess: () => {
      messageApi.success("Ghi nhận giao dịch kho thành công!");
      // Invalidate cache để làm mới danh sách và thống kê
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onClose();
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Ghi nhận thất bại. Vui lòng thử lại.";
      messageApi.error(msg);
    },
  });

  // ===== VALIDATE FORM =====
  function kiemTraForm(): boolean {
    const loi: Record<string, string> = {};

    const soLuongInt = parseInt(soLuong);
    if (!soLuong || isNaN(soLuongInt) || soLuongInt <= 0) {
      loi.soLuong = "Số lượng phải là số nguyên dương";
    }

    if (loaiGiaoDich === "IMPORT" && !nhaCungCapId) {
      loi.nhaCungCap = "Vui lòng chọn nhà cung cấp";
    }

    if (!lyDo.trim() || lyDo.trim().length < 3) {
      loi.lyDo = "Lý do phải có ít nhất 3 ký tự";
    } else if (lyDo.trim().length > 300) {
      loi.lyDo = "Lý do không được vượt quá 300 ký tự";
    }

    setLoiForm(loi);
    return Object.keys(loi).length === 0;
  }

  // ===== XỬ LÝ GỬI FORM =====
  function xuLyXacNhan() {
    if (!item?.id) return;
    if (!kiemTraForm()) return;

    const soLuongInt = parseInt(soLuong);
    // Xuất kho → số lượng âm; Nhập kho → dương
    const quantityChanged = isNhap ? soLuongInt : -soLuongInt;

    mutation.mutate({
      variantId: item.id,
      quantityChanged,
      transactionType: loaiGiaoDich,
      reason: lyDo.trim(),
      supplierId:
        loaiGiaoDich === "IMPORT" ? nhaCungCapId ?? undefined : undefined,
    });
  }

  // Render modal ở chế độ đóng khi không có item (không return null trước hook)
  const tenBienThe = item
    ? `${item.ten} – ${item.mau} / Size ${item.size}`
    : "";
  const coItem = !!item && item.id > 0;

  return (
    <>
      {messageContextHolder}
      <Modal
      open={isOpen}
      onCancel={onClose}
      afterOpenChange={(open) => {
        if (!open) resetForm();
      }}
      footer={null}
      title={null}
      width={480}
      destroyOnHidden={false}
      styles={{ body: { padding: 0, borderRadius: 16, overflow: "hidden" } }}
    >
      {/* ===== HEADER MODAL ===== */}
      <div className="flex h-14 items-center border-b border-border bg-surface-alt px-6">
        <h3 className="text-[16px] font-bold text-text-main">
          Ghi nhận giao dịch kho
        </h3>
      </div>

      {/* ===== NỘI DUNG MODAL ===== */}
      <div className="p-6">

        {/* Thông tin biến thể đang chọn */}
        {coItem && (
          <div className="mb-5 rounded-lg border border-border bg-surface-alt px-4 py-3">
            <p className="text-sm font-semibold text-text-main">{tenBienThe}</p>
            <p className="mt-0.5 font-mono text-xs text-text-secondary">
              {item!.sku} · Tồn hiện tại:{" "}
              <strong className="text-text-main">{item!.tonHienTai}</strong>
            </p>
          </div>
        )}

        {/* Trường: Loại giao dịch */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-main">
            Loại giao dịch <span className="text-[#b91c1c]">*</span>
          </label>
          <Select
            value={loaiGiaoDich}
            onChange={(val) => {
              const loaiMoi = val as LoaiGiaoDich;
              setLoaiGiaoDich(loaiMoi);
              if (loaiMoi !== "IMPORT") setNhaCungCapId(null);
            }}
            className="w-full"
            size="large"
            options={LOAI_GIAO_DICH_OPTIONS.map((o) => ({
              value: o.value,
              label: `${o.dauHieu === "+" ? "📦" : "📤"} ${o.label}`,
            }))}
          />
        </div>

        {/* Trường: Nhà cung cấp – chỉ áp dụng cho giao dịch nhập kho */}
        {loaiGiaoDich === "IMPORT" && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-text-main">
              Nhà cung cấp <span className="text-[#b91c1c]">*</span>
            </label>
            <Select
              value={nhaCungCapId ?? undefined}
              onChange={(value) => {
                setNhaCungCapId(value ?? null);
                setLoiForm((prev) => ({ ...prev, nhaCungCap: "" }));
              }}
              placeholder="Chọn nhà cung cấp..."
              allowClear
              showSearch
              optionFilterProp="label"
              loading={dangTaiNhaCungCap}
              disabled={dangTaiNhaCungCap}
              status={loiForm.nhaCungCap ? "error" : undefined}
              className="w-full"
              size="large"
              options={danhSachNhaCungCap.map((nhaCungCap) => ({
                value: nhaCungCap.id,
                label: nhaCungCap.ten,
              }))}
              notFoundContent={
                dangTaiNhaCungCap ? null : "Không tìm thấy nhà cung cấp nào."
              }
            />
            {loiForm.nhaCungCap && (
              <p className="mt-1 text-xs text-[#b91c1c]">
                {loiForm.nhaCungCap}
              </p>
            )}
          </div>
        )}

        {/* Trường: Số lượng */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-text-main">
            Số lượng {isNhap ? "nhập" : "xuất"} (áo){" "}
            <span className="text-[#b91c1c]">*</span>
          </label>
          <div className="relative">
            {/* Dấu hiệu dương/âm */}
            <span
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold ${
                isNhap ? "text-[#059669]" : "text-[#b91c1c]"
              }`}
            >
              {isNhap ? "+" : "-"}
            </span>
            <input
              type="number"
              min={1}
              value={soLuong}
              onChange={(e) => {
                setSoLuong(e.target.value);
                setLoiForm((prev) => ({ ...prev, soLuong: "" }));
              }}
              placeholder="Nhập số lượng..."
              className={`h-10 w-full rounded-lg border pl-8 pr-3 text-sm text-text-main outline-none transition-all focus:ring-1 ${
                loiForm.soLuong
                  ? "border-[#b91c1c] focus:border-[#b91c1c] focus:ring-[#b91c1c]"
                  : "border-border focus:border-primary-container focus:ring-primary-container"
              }`}
            />
          </div>
          {loiForm.soLuong && (
            <p className="mt-1 text-xs text-[#b91c1c]">{loiForm.soLuong}</p>
          )}
        </div>

        {/* Trường: Lý do / Ghi chú */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-semibold text-text-main">
            Lý do / Ghi chú <span className="text-[#b91c1c]">*</span>
          </label>
          <textarea
            rows={3}
            value={lyDo}
            onChange={(e) => {
              setLyDo(e.target.value);
              setLoiForm((prev) => ({ ...prev, lyDo: "" }));
            }}
            placeholder="Ví dụ: Nhập từ nhà cung cấp Vải Xanh – Đơn PO-2025-01..."
            className={`w-full resize-none rounded-lg border px-3 py-2 text-sm text-text-main outline-none transition-all focus:ring-1 ${
              loiForm.lyDo
                ? "border-[#b91c1c] focus:border-[#b91c1c] focus:ring-[#b91c1c]"
                : "border-border focus:border-primary-container focus:ring-primary-container"
            }`}
          />
          {loiForm.lyDo && (
            <p className="mt-1 text-xs text-[#b91c1c]">{loiForm.lyDo}</p>
          )}
          <p className="mt-1 text-xs text-text-muted">{lyDo.length}/300 ký tự</p>
        </div>

        {/* Nhóm nút hành động */}
        <div className="flex gap-3">
          {/* Nút Hủy */}
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="h-10 flex-1 rounded-lg border border-border text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy
          </button>

          {/* Nút Xác nhận */}
          <button
            type="button"
            onClick={xuLyXacNhan}
            disabled={mutation.isPending}
            className="h-10 flex-1 rounded-lg bg-primary-container text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {mutation.isPending ? "Đang lưu..." : "Xác nhận giao dịch"}
          </button>
        </div>
      </div>
      </Modal>
    </>
  );
}

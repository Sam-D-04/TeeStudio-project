"use client";

/**
 * CategoryPage – Trang quản lý danh mục phôi áo.
 *
 * Chức năng:
 *   - Xem danh sách danh mục (kèm số lượng sản phẩm)
 *   - Tìm kiếm nhanh theo tên
 *   - Thêm danh mục mới (inline)
 *   - Sửa tên danh mục (inline)
 *   - Xóa danh mục (chỉ được xóa khi không có sản phẩm nào)
 */

import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import * as productService from "@/services/admin/productService";

export default function CategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [tuKhoa, setTuKhoa] = useState("");
  const [tenMoi, setTenMoi] = useState("");
  const [dangThemMoi, setDangThemMoi] = useState(false);
  const [idDangSua, setIdDangSua] = useState<number | null>(null);
  const [tenDangSua, setTenDangSua] = useState("");
  const [thongBao, setThongBao] = useState<{ loai: "success" | "error"; noi: string } | null>(null);

  const inputThemRef = useRef<HTMLInputElement>(null);
  const inputSuaRef = useRef<HTMLInputElement>(null);

  // Tự động focus khi mở form thêm
  useEffect(() => {
    if (dangThemMoi) inputThemRef.current?.focus();
  }, [dangThemMoi]);

  useEffect(() => {
    if (idDangSua !== null) inputSuaRef.current?.focus();
  }, [idDangSua]);

  // Tự ẩn thông báo sau 3 giây
  useEffect(() => {
    if (!thongBao) return;
    const timer = setTimeout(() => setThongBao(null), 3000);
    return () => clearTimeout(timer);
  }, [thongBao]);

  // ===== QUERY: Danh sách danh mục =====
  const { data: danhSach = [], isLoading, isError } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: productService.layDanhSachDanhMuc,
    staleTime: 30_000,
  });

  const lamMoiDuLieu = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["products", "categories"] });
  };

  // ===== MUTATION: Thêm =====
  const { mutate: themDanhMuc, isPending: dangThem } = useMutation({
    mutationFn: () => productService.taoDanhMuc(tenMoi.trim()),
    onSuccess: (data) => {
      setThongBao({ loai: "success", noi: `Đã thêm danh mục "${data.ten}"` });
      setTenMoi("");
      setDangThemMoi(false);
      lamMoiDuLieu();
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Không thể thêm danh mục";
      setThongBao({ loai: "error", noi: msg });
    },
  });

  // ===== MUTATION: Sửa =====
  const { mutate: suaDanhMuc, isPending: dangSua } = useMutation({
    mutationFn: ({ id, ten }: { id: number; ten: string }) =>
      productService.capNhatDanhMuc(id, ten),
    onSuccess: (data) => {
      setThongBao({ loai: "success", noi: `Đã cập nhật thành "${data.ten}"` });
      setIdDangSua(null);
      setTenDangSua("");
      lamMoiDuLieu();
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Không thể cập nhật danh mục";
      setThongBao({ loai: "error", noi: msg });
    },
  });

  // ===== MUTATION: Xóa =====
  const { mutate: xoaDanhMuc, isPending: dangXoa } = useMutation({
    mutationFn: (id: number) => productService.xoaDanhMucService(id),
    onSuccess: () => {
      setThongBao({ loai: "success", noi: "Đã xóa danh mục" });
      lamMoiDuLieu();
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Không thể xóa danh mục";
      setThongBao({ loai: "error", noi: msg });
    },
  });

  // ===== Lọc theo từ khóa =====
  const danhSachLoc = danhSach.filter((dm) =>
    dm.ten.toLowerCase().includes(tuKhoa.toLowerCase().trim())
  );

  // ===== Xử lý sự kiện =====
  function batDauSua(dm: productService.DanhMucChiTiet) {
    setIdDangSua(dm.id);
    setTenDangSua(dm.ten);
    setDangThemMoi(false);
  }

  function huyThemMoi() {
    setDangThemMoi(false);
    setTenMoi("");
  }

  function huySua() {
    setIdDangSua(null);
    setTenDangSua("");
  }

  function xuLyXoa(dm: productService.DanhMucChiTiet) {
    if (dm.soSanPham > 0) {
      setThongBao({
        loai: "error",
        noi: `Không thể xóa "${dm.ten}" vì đang có ${dm.soSanPham} sản phẩm thuộc danh mục này`,
      });
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${dm.ten}"?`)) return;
    xoaDanhMuc(dm.id);
  }

  // ===== STYLES =====
  const inputClass =
    "h-9 w-full rounded-[8px] border border-border bg-surface-alt px-3 text-body-md text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary-container focus:ring-1 focus:ring-primary-container";

  return (
    <div className="pb-12">
      {/* Header */}
      <section className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-text-secondary transition-colors hover:text-primary-container"
        >
          <ArrowLeftOutlined />
          Quay lại
        </button>
        <h2 className="font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
          Quản lý danh mục
        </h2>
        <p className="mt-1 text-body-sm text-text-secondary">
          Thêm, sửa, xóa danh mục sản phẩm phôi áo.
        </p>
      </section>

      {/* Thông báo */}
      {thongBao && (
        <div
          className={`mb-4 rounded-[10px] px-4 py-3 text-[13px] font-medium ${
            thongBao.loai === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {thongBao.noi}
        </div>
      )}

      {/* Card chính */}
      <section className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Tìm kiếm */}
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm kiếm theo tên danh mục..."
            className="h-9 w-full max-w-sm rounded-[8px] border border-border bg-surface-alt px-3 text-[13px] text-text-main outline-none placeholder:text-text-muted focus:border-primary-container focus:ring-1 focus:ring-primary-container sm:w-72"
          />
          {/* Nút thêm mới */}
          <button
            type="button"
            onClick={() => {
              setDangThemMoi(true);
              setIdDangSua(null);
            }}
            className="flex h-9 items-center gap-2 rounded-[8px] bg-primary-container px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <PlusOutlined />
            Thêm danh mục
          </button>
        </div>

        {/* Form thêm mới (inline) */}
        {dangThemMoi && (
          <div className="flex items-center gap-3 border-b border-dashed border-border bg-surface-alt px-5 py-3">
            <input
              ref={inputThemRef}
              type="text"
              value={tenMoi}
              onChange={(e) => setTenMoi(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tenMoi.trim()) themDanhMuc();
                if (e.key === "Escape") huyThemMoi();
              }}
              placeholder="Nhập tên danh mục mới..."
              maxLength={200}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => tenMoi.trim() && themDanhMuc()}
              disabled={dangThem || !tenMoi.trim()}
              className="flex h-9 items-center gap-1.5 rounded-[8px] bg-primary-container px-3 text-[12px] font-semibold text-white disabled:opacity-50"
            >
              <CheckOutlined />
              Lưu
            </button>
            <button
              type="button"
              onClick={huyThemMoi}
              className="flex h-9 items-center gap-1.5 rounded-[8px] border border-border px-3 text-[12px] font-semibold text-text-secondary hover:bg-surface-alt"
            >
              <CloseOutlined />
              Hủy
            </button>
          </div>
        )}

        {/* Nội dung */}
        {isLoading ? (
          <div className="py-12 text-center text-[14px] text-text-secondary">
            Đang tải danh sách danh mục...
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-[14px] text-red-600">
            Không thể tải danh mục. Vui lòng thử lại.
          </div>
        ) : danhSachLoc.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-text-secondary">
            {tuKhoa ? `Không tìm thấy danh mục nào khớp với "${tuKhoa}"` : "Chưa có danh mục nào"}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {danhSachLoc.map((dm) => (
              <li key={dm.id} className="flex items-center gap-4 px-5 py-4">
                {idDangSua === dm.id ? (
                  // Chế độ chỉnh sửa inline
                  <>
                    <input
                      ref={inputSuaRef}
                      type="text"
                      value={tenDangSua}
                      onChange={(e) => setTenDangSua(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tenDangSua.trim())
                          suaDanhMuc({ id: dm.id, ten: tenDangSua.trim() });
                        if (e.key === "Escape") huySua();
                      }}
                      maxLength={200}
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        tenDangSua.trim() &&
                        suaDanhMuc({ id: dm.id, ten: tenDangSua.trim() })
                      }
                      disabled={dangSua || !tenDangSua.trim()}
                      className="flex h-8 items-center gap-1 rounded-[6px] bg-primary-container px-3 text-[12px] font-semibold text-white disabled:opacity-50"
                    >
                      <CheckOutlined />
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={huySua}
                      className="flex h-8 items-center gap-1 rounded-[6px] border border-border px-3 text-[12px] font-semibold text-text-secondary hover:bg-surface-alt"
                    >
                      <CloseOutlined />
                      Hủy
                    </button>
                  </>
                ) : (
                  // Chế độ xem
                  <>
                    <div className="flex-1">
                      <span className="text-[14px] font-semibold text-text-main">
                        {dm.ten}
                      </span>
                      <span className="ml-3 rounded-full bg-surface-alt px-2 py-0.5 text-[11px] text-text-secondary">
                        {dm.soSanPham} sản phẩm
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => batDauSua(dm)}
                        title="Sửa tên danh mục"
                        className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-border text-text-secondary transition-colors hover:border-primary-container hover:text-primary-container"
                      >
                        <EditOutlined className="text-[13px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => xuLyXoa(dm)}
                        disabled={dangXoa}
                        title={
                          dm.soSanPham > 0
                            ? `Không thể xóa vì có ${dm.soSanPham} sản phẩm`
                            : "Xóa danh mục"
                        }
                        className={`flex h-8 w-8 items-center justify-center rounded-[6px] border transition-colors ${
                          dm.soSanPham > 0
                            ? "cursor-not-allowed border-border text-text-muted"
                            : "border-border text-text-secondary hover:border-error hover:text-error"
                        }`}
                      >
                        <DeleteOutlined className="text-[13px]" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Footer tổng số */}
        {!isLoading && !isError && (
          <div className="border-t border-border bg-surface-alt px-5 py-3">
            <span className="text-[12px] text-text-secondary">
              Tổng cộng {danhSach.length} danh mục
              {tuKhoa && ` • Đang lọc: ${danhSachLoc.length} kết quả`}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

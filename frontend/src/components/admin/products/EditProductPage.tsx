"use client";

/**
 * EditProductPage – Trang xem và chỉnh sửa phôi áo.
 *
 * Giao diện một biểu mẫu:
 *   - Sửa thông tin chung và trạng thái hiển thị.
 *   - Xem, sửa và thêm biến thể trong các bảng ngang nhỏ gọn.
 *
 * Luồng API:
 *   - Mở trang → GET /api/admin/products/:id  (layChiTietSanPham)
 *   - Lưu thông tin → PUT /api/admin/products/:id  (capNhatSanPham)
 *   - Bật/tắt   → PATCH /api/admin/products/:id/status
 *   - Sửa biến thể → PUT /api/admin/products/:id/variants/:variantId
 *   - Thêm biến thể mới → POST /api/admin/products/:id/variants
 */

import {
  ArrowLeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { message } from "antd";
import * as productService from "@/services/admin/productService";
import type {
  BienTheSanPham,
  TrangThaiHienThi,
} from "@/services/admin/productService";

// =====================================================================
// KIỂU DỮ LIỆU NỘI BỘ
// =====================================================================

/** Trạng thái biểu mẫu thông tin cơ bản */
type FormThongTin = {
  tenSanPham: string;
  danhMucId: string;
  giaNen: string;
  chatLieu: string;
  formDang: string;
  xuatXu: string;
  moTa: string;
};

/** Trạng thái chỉnh sửa của một biến thể hiện có */
type BienTheEdit = BienTheSanPham & {
  /** Có đang trong chế độ chỉnh sửa không */
  dangSua: boolean;
  /** Giá trị đang nhập (dạng string để bind với input) */
  editMau: string;
  editSize: string;
  editSKU: string;
  editStock: string;
};

/** Một hàng biến thể mới sẽ thêm */
type HangBienTheMoi = {
  key: string;
  mauSac: string;
  kichThuoc: string;
  maSKU: string;
  tonKho: string;
};

type EditProductPageProps = {
  /** Mã phôi áo lấy từ URL */
  productId: number;
};

// =====================================================================
// HẰNG SỐ
// =====================================================================

const DS_SIZE_GOI_Y = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const DS_MAU_PHO_BIEN: { ten: string; hex: string }[] = [
  { ten: "Đen", hex: "#1a1a1a" },
  { ten: "Trắng", hex: "#ffffff" },
  { ten: "Trắng sữa", hex: "#f8f5f0" },
  { ten: "Xám", hex: "#6b7280" },
  { ten: "Xám nhạt", hex: "#d1d5db" },
  { ten: "Xanh hải quân", hex: "#1e3a8a" },
  { ten: "Xanh dương", hex: "#2563eb" },
  { ten: "Xanh lá", hex: "#16a34a" },
  { ten: "Đỏ", hex: "#dc2626" },
  { ten: "Cam", hex: "#ea580c" },
  { ten: "Vàng", hex: "#ca8a04" },
  { ten: "Hồng", hex: "#ec4899" },
  { ten: "Tím", hex: "#7c3aed" },
  { ten: "Nâu", hex: "#92400e" },
  { ten: "Be", hex: "#d4b896" },
];

// =====================================================================
// HÀM TIỆN ÍCH
// =====================================================================

function taoKey() {
  return Math.random().toString(36).slice(2, 9);
}

function timMauHex(tenMau: string): string {
  return DS_MAU_PHO_BIEN.find((m) => m.ten === tenMau)?.hex ?? "#94a3b8";
}

function goiYSKU(ten: string, mau: string, size: string): string {
  const slug = (s: string) =>
    s
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/Đ/g, "D")
      .replace(/[^A-Z0-9]/g, "");
  const t = slug(ten).slice(0, 6);
  const m = slug(mau).slice(0, 3);
  const sz = size.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 4);
  if (!t && !m && !sz) return "";
  return `${t}-${m}-${sz}`;
}

function validateThongTin(f: FormThongTin): Partial<Record<keyof FormThongTin, string>> {
  const e: Partial<Record<keyof FormThongTin, string>> = {};
  if (!f.tenSanPham.trim()) e.tenSanPham = "Vui lòng nhập tên phôi áo";
  else if (f.tenSanPham.trim().length < 2) e.tenSanPham = "Tên phải có ít nhất 2 ký tự";
  if (!f.danhMucId) e.danhMucId = "Vui lòng chọn danh mục";
  if (!f.giaNen.trim()) e.giaNen = "Vui lòng nhập giá nền";
  else if (isNaN(Number(f.giaNen)) || Number(f.giaNen) < 0)
    e.giaNen = "Giá nền phải là số không âm";
  if (!f.chatLieu.trim()) e.chatLieu = "Vui lòng nhập chất liệu";
  if (!f.formDang.trim()) e.formDang = "Vui lòng nhập kiểu dáng";
  if (!f.xuatXu.trim()) e.xuatXu = "Vui lòng nhập xuất xứ";
  return e;
}

// =====================================================================
// SUB-COMPONENT: FormField
// =====================================================================
function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] font-semibold text-text-secondary">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {children}
      {error && <span className="text-[12px] text-error">{error}</span>}
    </div>
  );
}

// =====================================================================
// SUB-COMPONENT: Badge tồn kho
// =====================================================================
function BadgeTonKho({ status }: { status: string }) {
  if (status === "het_hang")
    return (
      <span className="inline-flex items-center rounded-full bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-error">
        Hết hàng
      </span>
    );
  if (status === "sap_het")
    return (
      <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
        Sắp hết
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
      Còn hàng
    </span>
  );
}

// =====================================================================
// COMPONENT CHÍNH
// =====================================================================
export default function EditProductPage({ productId }: EditProductPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isViewMode = searchParams.get("mode") === "view";
  const queryClient = useQueryClient();
  const productIdHopLe = Number.isFinite(productId) && productId > 0;

  // ===== THÔNG BÁO =====
  const [messageApi, contextHolder] = message.useMessage();

  function hienThiThongBao(loai: "thanh_cong" | "loi", noi_dung: string) {
    if (loai === "thanh_cong") {
      messageApi.success(noi_dung);
    } else {
      messageApi.error(noi_dung);
    }
  }

  // ===== BIỂU MẪU THÔNG TIN CƠ BẢN =====
  const [formThongTin, setFormThongTin] = useState<FormThongTin>({
    tenSanPham: "",
    danhMucId: "",
    giaNen: "",
    chatLieu: "",
    formDang: "",
    xuatXu: "",
    moTa: "",
  });
  const [loiThongTin, setLoiThongTin] = useState<
    Partial<Record<keyof FormThongTin, string>>
  >({});
  const [trangThaiHienThi, setTrangThaiHienThi] = useState<TrangThaiHienThi>("dang_hien_thi");

  // ===== BIẾN THỂ HIỆN CÓ + BIẾN THỂ MỚI =====
  const [dsBienTheEdit, setDsBienTheEdit] = useState<BienTheEdit[]>([]);
  const [dsBienTheMoi, setDsBienTheMoi] = useState<HangBienTheMoi[]>([]);
  const [loiBienThe, setLoiBienThe] = useState<string>("");

  // ===== LẤY DANH MỤC =====
  const { data: danhSachDanhMuc = [] } = useQuery({
    queryKey: ["products", "categories"],
    queryFn: productService.layDanhMucSanPham,
    staleTime: 5 * 60_000,
  });

  // ===== LẤY CHI TIẾT SẢN PHẨM =====
  const {
    data: chiTiet,
    isLoading: dangTaiChiTiet,
    isError: loiTaiChiTiet,
  } = useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: () => productService.layChiTietSanPham(productId),
    enabled: productIdHopLe,
    staleTime: 0,
  });

  // ===== ĐIỀN FORM KHI CÓ DỮ LIỆU =====
  useEffect(() => {
    if (!chiTiet) return;

    // Tìm categoryId từ tên danh mục (dùng categoryId từ API nếu có)
    const catId = chiTiet.categoryId
      ? String(chiTiet.categoryId)
      : String(danhSachDanhMuc.find((dm) => dm.ten === chiTiet.category)?.id ?? "");

    // Dữ liệu truy vấn là nguồn khởi tạo cho toàn bộ biểu mẫu chỉnh sửa.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormThongTin({
      tenSanPham: chiTiet.name,
      danhMucId: catId,
      giaNen: String(chiTiet.basePrice),
      chatLieu: chiTiet.material,
      formDang: chiTiet.fit,
      xuatXu: chiTiet.madeIn ?? "",
      moTa: chiTiet.description ?? "",
    });
    setTrangThaiHienThi(chiTiet.displayStatus);
    setLoiThongTin({});

    // Khởi tạo danh sách biến thể có thể chỉnh sửa
    setDsBienTheEdit(
      chiTiet.variants.map((v) => ({
        ...v,
        dangSua: false,
        editMau: v.colorName,
        editSize: v.size,
        editSKU: v.sku,
        editStock: String(v.stock),
      }))
    );
    setDsBienTheMoi([]);
    setLoiBienThe("");
  }, [chiTiet, danhSachDanhMuc]);

  // =====================================================================
  // THAO TÁC CẬP NHẬT THÔNG TIN
  // =====================================================================

  /** Cập nhật thông tin cơ bản */
  const { mutate: luuThongTin, isPending: dangLuuThongTin } = useMutation({
    mutationFn: () =>
      productService.capNhatSanPham(productId, {
        categoryId: Number(formThongTin.danhMucId),
        name: formThongTin.tenSanPham.trim(),
        basePrice: Number(formThongTin.giaNen),
        material: formThongTin.chatLieu.trim(),
        form: formThongTin.formDang.trim(),
        madeIn: formThongTin.xuatXu.trim(),
        description: formThongTin.moTa.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      hienThiThongBao("thanh_cong", "Đã cập nhật thông tin phôi áo thành công!");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      hienThiThongBao("loi", `Lỗi: ${msg}`);
    },
  });

  /** Bật / tắt hiển thị */
  const { mutate: doiTrangThai, isPending: dangDoiTrangThai } = useMutation({
    mutationFn: (trangThai: TrangThaiHienThi) =>
      productService.capNhatTrangThaiSanPham(productId, trangThai),
    onSuccess: (data) => {
      setTrangThaiHienThi(data.trangThai);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      hienThiThongBao(
        "thanh_cong",
        data.trangThai === "dang_hien_thi"
          ? "Phôi áo đã được bật hiển thị trên cửa hàng."
          : "Phôi áo đã được ẩn khỏi cửa hàng."
      );
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Lỗi thay đổi trạng thái";
      hienThiThongBao("loi", `Lỗi: ${msg}`);
    },
  });

  function xuLyLuuThongTin() {
    const loi = validateThongTin(formThongTin);
    if (Object.keys(loi).length > 0) {
      setLoiThongTin(loi);
      return;
    }
    luuThongTin();
  }

  function capNhatThongTin(field: keyof FormThongTin, value: string) {
    setFormThongTin((prev) => ({ ...prev, [field]: value }));
    if (loiThongTin[field]) {
      setLoiThongTin((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  // =====================================================================
  // THAO TÁC CẬP NHẬT BIẾN THỂ HIỆN CÓ
  // =====================================================================

  const { mutate: luuBienTheHienCo, isPending: dangLuuBienThe } = useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: number;
      payload: productService.CapNhatBienTheInput;
    }) => productService.capNhatBienThe(productId, variantId, payload),
    onSuccess: (data, { variantId }) => {
      // Cập nhật lại state local ngay lập tức
      setDsBienTheEdit((prev) =>
        prev.map((bt) =>
          bt.id === variantId
            ? {
              ...bt,
              ...data,
              dangSua: false,
              editMau: data.colorName,
              editSize: data.size,
              editSKU: data.sku,
              editStock: String(data.stock),
            }
            : bt
        )
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      hienThiThongBao("thanh_cong", "Đã cập nhật biến thể thành công!");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      hienThiThongBao("loi", `Lỗi: ${msg}`);
    },
  });

  // =====================================================================
  // THAO TÁC THÊM BIẾN THỂ MỚI
  // =====================================================================

  const { mutate: themBienTheMoi, isPending: dangThemBienThe } = useMutation({
    mutationFn: async (danhSach: HangBienTheMoi[]) => {
      for (const bt of danhSach) {
        await productService.themBienThe(productId, {
          color: bt.mauSac.trim(),
          size: bt.kichThuoc.trim(),
          sku: bt.maSKU.trim(),
          stockQty: 0,
        });
      }
    },
    onSuccess: () => {
      setDsBienTheMoi([]);
      // Reload chi tiết để lấy danh sách biến thể mới nhất
      queryClient.invalidateQueries({ queryKey: ["products", "detail", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      hienThiThongBao("thanh_cong", "Đã thêm biến thể mới thành công!");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setLoiBienThe(`Lỗi: ${msg}`);
      hienThiThongBao("loi", `Lỗi thêm biến thể: ${msg}`);
    },
  });

  // =====================================================================
  // XỬ LÝ BIẾN THỂ HIỆN CÓ
  // =====================================================================

  function batDauSuaBienThe(id: number) {
    setDsBienTheEdit((prev) =>
      prev.map((bt) =>
        bt.id === id
          ? { ...bt, dangSua: true, editMau: bt.colorName, editSize: bt.size, editSKU: bt.sku, editStock: String(bt.stock) }
          : { ...bt, dangSua: false }
      )
    );
  }

  function huyBienThe(id: number) {
    setDsBienTheEdit((prev) =>
      prev.map((bt) =>
        bt.id === id
          ? { ...bt, dangSua: false, editMau: bt.colorName, editSize: bt.size, editSKU: bt.sku, editStock: String(bt.stock) }
          : bt
      )
    );
  }

  function capNhatEditBienThe(id: number, field: "editMau" | "editSize" | "editSKU" | "editStock", value: string) {
    setDsBienTheEdit((prev) =>
      prev.map((bt) => (bt.id === id ? { ...bt, [field]: value } : bt))
    );
  }

  function luuBienTheDaChon(bt: BienTheEdit) {
    if (!bt.editMau.trim() || !bt.editSize.trim() || !bt.editSKU.trim()) {
      hienThiThongBao("loi", "Vui lòng điền đầy đủ màu sắc, kích thước và mã SKU");
      return;
    }
    luuBienTheHienCo({
      variantId: bt.id,
      payload: {
        color: bt.editMau.trim(),
        size: bt.editSize.trim(),
        sku: bt.editSKU.trim(),
        stockQty: bt.stock,
      },
    });
  }

  // =====================================================================
  // XỬ LÝ BIẾN THỂ MỚI
  // =====================================================================

  function themHangMoi() {
    setDsBienTheMoi((prev) => [
      ...prev,
      { key: taoKey(), mauSac: "", kichThuoc: "", maSKU: "", tonKho: "0" },
    ]);
  }

  function xoaHangMoi(key: string) {
    setDsBienTheMoi((prev) => prev.filter((h) => h.key !== key));
  }

  function capNhatHangMoi(key: string, field: keyof HangBienTheMoi, value: string) {
    setDsBienTheMoi((prev) =>
      prev.map((h) => {
        if (h.key !== key) return h;
        const next = { ...h, [field]: value };
        if (field === "mauSac" || field === "kichThuoc") {
          const tenSP = chiTiet?.name ?? "";
          const skuGoiY = goiYSKU(
            tenSP,
            field === "mauSac" ? value : h.mauSac,
            field === "kichThuoc" ? value : h.kichThuoc
          );
          if (!h.maSKU || h.maSKU === goiYSKU(tenSP, h.mauSac, h.kichThuoc)) {
            next.maSKU = skuGoiY;
          }
        }
        return next;
      })
    );
    setLoiBienThe("");
  }

  function xuLyThemBienTheMoi() {
    if (dsBienTheMoi.length === 0) return;

    // Validate
    for (const h of dsBienTheMoi) {
      if (!h.mauSac.trim() || !h.kichThuoc.trim() || !h.maSKU.trim()) {
        setLoiBienThe("Vui lòng điền đầy đủ Màu sắc, Kích thước và Mã SKU cho tất cả biến thể mới");
        return;
      }
    }

    // Kiểm tra SKU trùng trong danh sách mới
    const dsSKU = dsBienTheMoi.map((h) => h.maSKU.trim());
    const trung = dsSKU.filter((s, i) => dsSKU.indexOf(s) !== i);
    if (trung.length > 0) {
      setLoiBienThe(`Mã SKU "${trung[0]}" bị trùng lặp trong danh sách mới`);
      return;
    }

    themBienTheMoi(dsBienTheMoi);
  }

  // =====================================================================
  // HỖ TRỢ HIỂN THỊ
  // =====================================================================
  const inputClass =
    "h-9 w-full rounded-[7px] border border-border bg-surface-alt px-3 text-body-md text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary-container focus:ring-1 focus:ring-primary-container";

  const textareaClass =
    "w-full resize-none rounded-[7px] border border-border bg-surface-alt px-3 py-2 text-body-md text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary-container focus:ring-1 focus:ring-primary-container";

  // =====================================================================
  // HIỂN THỊ
  // =====================================================================
  return (
    <div className="pb-12">
      {contextHolder}
      <section className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin/san-pham-phoi-ao")}
            className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-text-secondary transition-colors hover:text-primary-container"
          >
            <ArrowLeftOutlined />
            Danh sách phôi áo
          </button>
          <div className="flex items-center gap-2">
            <EditOutlined className="text-[20px] text-primary-container" />
            <h2 className="font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
              {isViewMode ? "Chi tiết phôi áo" : "Xem và sửa phôi áo"}
            </h2>
          </div>
          <p className="mt-1 max-w-2xl text-body-sm text-text-secondary">
            {chiTiet?.name ?? "Đang tải thông tin phôi áo..."}
          </p>
        </div>

        {chiTiet && !dangTaiChiTiet && !isViewMode && (
          <button
            type="button"
            onClick={xuLyLuuThongTin}
            disabled={dangLuuThongTin}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-[#0ea5e9] px-6 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dangLuuThongTin ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang lưu...
              </>
            ) : (
              <>
                <SaveOutlined />
                Lưu thông tin chung
              </>
            )}
          </button>
        )}
      </section>

      <section className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-[18px] font-extrabold text-text-main">
              Thông tin phôi áo
            </h3>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              Chỉnh sửa thông tin chung và quản lý toàn bộ biến thể trong cùng một biểu mẫu.
            </p>
          </div>
          {chiTiet && !dangTaiChiTiet && (
            <div className="flex items-center gap-2 text-[12px]">
              <span className="rounded-full bg-surface-alt px-3 py-1 font-semibold text-text-secondary">
                {dsBienTheEdit.length} biến thể
              </span>
              <span
                className={`rounded-full px-3 py-1 font-semibold ${
                  trangThaiHienThi === "dang_hien_thi"
                    ? "bg-success/10 text-success"
                    : "bg-surface-container text-text-muted"
                }`}
              >
                {trangThaiHienThi === "dang_hien_thi" ? "Đang hiển thị" : "Đang ẩn"}
              </span>
            </div>
          )}
        </div>

        {!productIdHopLe && (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-[14px] font-semibold text-error">Mã phôi áo không hợp lệ.</p>
            <button
              type="button"
              onClick={() => router.push("/admin/san-pham-phoi-ao")}
              className="rounded-[8px] border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-secondary hover:bg-surface-alt"
            >
              Về danh sách phôi áo
            </button>
          </div>
        )}

        {productIdHopLe && dangTaiChiTiet && (
          <div className="flex h-48 items-center justify-center text-text-muted">
            <span className="animate-pulse text-[14px]">Đang tải dữ liệu...</span>
          </div>
        )}

        {productIdHopLe && loiTaiChiTiet && !dangTaiChiTiet && (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-error">
            <span className="text-[14px]">Không thể tải dữ liệu phôi áo.</span>
            <button
              type="button"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["products", "detail", productId],
                })
              }
              className="rounded-lg border border-error/30 px-4 py-1.5 text-[13px] hover:bg-error/5"
            >
              Thử lại
            </button>
          </div>
        )}

        {!dangTaiChiTiet && !loiTaiChiTiet && chiTiet && (
          <>
            <div className="space-y-6 p-4 sm:p-6">
              <datalist id="edit-product-colors">
                {DS_MAU_PHO_BIEN.map((mau) => (
                  <option key={mau.ten} value={mau.ten} />
                ))}
              </datalist>
              <datalist id="edit-product-sizes">
                {DS_SIZE_GOI_Y.map((size) => (
                  <option key={size} value={size} />
                ))}
              </datalist>

              <section aria-labelledby="tieu-de-thong-tin-chung">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h4 id="tieu-de-thong-tin-chung" className="text-[15px] font-extrabold text-text-main">
                      Thông tin chung
                    </h4>
                    <p className="mt-0.5 text-[12px] text-text-muted">
                      Các trường được bố trí theo cột để xem và chỉnh sửa nhanh hơn.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2 xl:grid-cols-12">
                  <div className="xl:col-span-5">
                    <FormField label="Tên phôi áo" required error={loiThongTin.tenSanPham}>
                      <input
                        id="edit-ten"
                        type="text"
                        value={formThongTin.tenSanPham}
                        onChange={(e) => capNhatThongTin("tenSanPham", e.target.value)}
                        maxLength={300}
                        disabled={isViewMode}
                        className={`${inputClass} ${loiThongTin.tenSanPham ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="xl:col-span-3">
                    <FormField label="Danh mục" required error={loiThongTin.danhMucId}>
                      <select
                        id="edit-danh-muc"
                        value={formThongTin.danhMucId}
                        onChange={(e) => capNhatThongTin("danhMucId", e.target.value)}
                        disabled={isViewMode}
                        className={`${inputClass} cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${loiThongTin.danhMucId ? "border-error" : ""}`}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {danhSachDanhMuc.map((dm) => (
                          <option key={dm.id} value={dm.id}>
                            {dm.ten}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <div className="xl:col-span-2">
                    <FormField label="Giá nền (VNĐ)" required error={loiThongTin.giaNen}>
                      <input
                        id="edit-gia"
                        type="number"
                        value={formThongTin.giaNen}
                        onChange={(e) => capNhatThongTin("giaNen", e.target.value)}
                        min={0}
                        step={1000}
                        disabled={isViewMode}
                        className={`${inputClass} ${loiThongTin.giaNen ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="xl:col-span-2">
                    <FormField label="Trạng thái hiển thị">
                      <select
                        value={trangThaiHienThi}
                        onChange={(e) =>
                          doiTrangThai(e.target.value as TrangThaiHienThi)
                        }
                        disabled={dangDoiTrangThai || isViewMode}
                        className={`${inputClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <option value="dang_hien_thi">Đang hiển thị</option>
                        <option value="dang_an">Đang ẩn</option>
                      </select>
                    </FormField>
                  </div>

                  <div className="xl:col-span-4">
                    <FormField label="Chất liệu" required error={loiThongTin.chatLieu}>
                      <input
                        id="edit-chat-lieu"
                        type="text"
                        value={formThongTin.chatLieu}
                        onChange={(e) => capNhatThongTin("chatLieu", e.target.value)}
                        maxLength={200}
                        disabled={isViewMode}
                        className={`${inputClass} ${loiThongTin.chatLieu ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="xl:col-span-3">
                    <FormField label="Kiểu dáng" required error={loiThongTin.formDang}>
                      <input
                        id="edit-form-dang"
                        type="text"
                        value={formThongTin.formDang}
                        onChange={(e) => capNhatThongTin("formDang", e.target.value)}
                        maxLength={100}
                        disabled={isViewMode}
                        className={`${inputClass} ${loiThongTin.formDang ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="xl:col-span-2">
                    <FormField label="Xuất xứ" required error={loiThongTin.xuatXu}>
                      <input
                        id="edit-xuat-xu"
                        type="text"
                        value={formThongTin.xuatXu}
                        onChange={(e) => capNhatThongTin("xuatXu", e.target.value)}
                        maxLength={100}
                        disabled={isViewMode}
                        className={`${inputClass} ${loiThongTin.xuatXu ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="xl:col-span-3">
                    <FormField label="Đường dẫn tĩnh (chỉ đọc)">
                      <div
                        title={chiTiet.slug}
                        className="flex h-9 items-center truncate rounded-[7px] border border-border/50 bg-surface-container px-3 font-mono text-[12px] text-text-muted"
                      >
                        {chiTiet.slug}
                      </div>
                    </FormField>
                  </div>

                  <div className="md:col-span-2 xl:col-span-12">
                    <FormField label="Mô tả sản phẩm" error={loiThongTin.moTa}>
                      <textarea
                        id="edit-mo-ta"
                        value={formThongTin.moTa}
                        onChange={(e) => capNhatThongTin("moTa", e.target.value)}
                        rows={3}
                        disabled={isViewMode}
                        className={`${textareaClass} ${loiThongTin.moTa ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>
                </div>
              </section>

              <section aria-labelledby="tieu-de-bien-the-hien-co" className="border-t border-border pt-5">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h4 id="tieu-de-bien-the-hien-co" className="text-[15px] font-extrabold text-text-main">
                      Biến thể hiện có
                    </h4>
                    <p className="mt-0.5 text-[12px] text-text-muted">
                      Mỗi biến thể nằm trên một dòng; chọn “Sửa” để cập nhật trực tiếp.
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-text-secondary">
                    {dsBienTheEdit.length} biến thể
                  </span>
                </div>

                {dsBienTheEdit.length === 0 ? (
                  <div className="rounded-[10px] border border-dashed border-border py-5 text-center text-[13px] italic text-text-muted">
                    Chưa có biến thể nào.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-[12px] border border-border">
                    <table className="w-full min-w-[900px] table-fixed text-left">
                      <thead>
                        <tr className="border-b border-border bg-surface-alt text-[11px] font-bold uppercase tracking-wide text-text-secondary">
                          <th className="w-[22%] px-3 py-2">Màu sắc</th>
                          <th className="w-[12%] px-3 py-2">Kích thước</th>
                          <th className="w-[26%] px-3 py-2">Mã SKU</th>
                          <th className="w-[12%] px-3 py-2 text-right">Tồn kho</th>
                          <th className="w-[13%] px-3 py-2">Trạng thái</th>
                          {!isViewMode && <th className="w-[15%] px-3 py-2 text-right">Thao tác</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {dsBienTheEdit.map((bt) => (
                          <tr
                            key={bt.id}
                            className={`border-b border-border/70 last:border-b-0 ${
                              bt.dangSua ? "bg-primary-container/5" : "bg-surface"
                            }`}
                          >
                            <td className="px-3 py-2">
                              {bt.dangSua ? (
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-5 w-5 shrink-0 rounded-full border border-border shadow-sm"
                                    style={{ backgroundColor: timMauHex(bt.editMau) }}
                                  />
                                  <input
                                    type="text"
                                    list="edit-product-colors"
                                    value={bt.editMau}
                                    onChange={(e) =>
                                      capNhatEditBienThe(bt.id, "editMau", e.target.value)
                                    }
                                    maxLength={100}
                                    className="h-8 min-w-0 flex-1 rounded-[6px] border border-primary-container/40 bg-surface px-2 text-[12px] outline-none focus:border-primary-container"
                                  />
                                </div>
                              ) : (
                                <div className="flex min-w-0 items-center gap-2">
                                  <span
                                    className="h-5 w-5 shrink-0 rounded-full border border-border shadow-sm"
                                    style={{ backgroundColor: timMauHex(bt.colorName) }}
                                  />
                                  <span className="truncate text-[13px] font-semibold text-text-main" title={bt.colorName}>
                                    {bt.colorName}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {bt.dangSua ? (
                                <input
                                  type="text"
                                  list="edit-product-sizes"
                                  value={bt.editSize}
                                  onChange={(e) =>
                                    capNhatEditBienThe(bt.id, "editSize", e.target.value)
                                  }
                                  maxLength={50}
                                  className="h-8 w-full rounded-[6px] border border-primary-container/40 bg-surface px-2 text-[12px] outline-none focus:border-primary-container"
                                />
                              ) : (
                                <span className="inline-flex rounded bg-surface-container px-2 py-0.5 text-[12px] font-semibold text-text-secondary">
                                  {bt.size}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {bt.dangSua ? (
                                <input
                                  type="text"
                                  value={bt.editSKU}
                                  onChange={(e) =>
                                    capNhatEditBienThe(bt.id, "editSKU", e.target.value)
                                  }
                                  maxLength={100}
                                  className="h-8 w-full rounded-[6px] border border-primary-container/40 bg-surface px-2 font-mono text-[12px] outline-none focus:border-primary-container"
                                />
                              ) : (
                                <span className="block truncate font-mono text-[12px] text-text-secondary" title={bt.sku}>
                                  {bt.sku}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="text-[13px] font-semibold text-text-main">
                                {bt.stock.toLocaleString("vi-VN")}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <BadgeTonKho status={bt.inventoryStatus} />
                            </td>
                            {!isViewMode && (
                              <td className="px-3 py-2">
                                <div className="flex items-center justify-end gap-1.5">
                                  {bt.dangSua ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => luuBienTheDaChon(bt)}
                                        disabled={dangLuuBienThe}
                                        className="flex h-8 items-center gap-1 rounded-[6px] bg-primary-container px-3 text-[12px] font-semibold text-white hover:bg-primary-container/80 disabled:opacity-50"
                                      >
                                        {dangLuuBienThe ? (
                                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        ) : (
                                          <SaveOutlined />
                                        )}
                                        Lưu
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => huyBienThe(bt.id)}
                                        disabled={dangLuuBienThe}
                                        className="h-8 rounded-[6px] border border-border bg-surface px-3 text-[12px] font-semibold text-text-secondary hover:bg-surface-alt disabled:opacity-50"
                                      >
                                        Hủy
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => batDauSuaBienThe(bt.id)}
                                      className="flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-surface px-3 text-[12px] font-semibold text-text-secondary transition-colors hover:border-primary-container/30 hover:bg-primary-container/5 hover:text-primary-container"
                                    >
                                      <EditOutlined />
                                      Sửa
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section aria-labelledby="tieu-de-them-bien-the" className="border-t border-border pt-5">
                {!isViewMode && (
                  <>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 id="tieu-de-them-bien-the" className="text-[15px] font-extrabold text-text-main">
                          Thêm biến thể mới
                        </h4>
                        <p className="mt-0.5 text-[12px] text-text-muted">
                          Thêm nhiều dòng rồi lưu cùng lúc.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={themHangMoi}
                        className="flex h-8 shrink-0 items-center gap-1.5 rounded-[7px] border border-dashed border-border px-3 text-[12px] font-semibold text-text-secondary transition-colors hover:border-primary-container/50 hover:bg-primary-container/5 hover:text-primary-container"
                      >
                        <PlusOutlined />
                        Thêm dòng
                      </button>
                    </div>

                    {loiBienThe && (
                      <div className="mb-3 flex items-center gap-2 rounded-[8px] border border-error/30 bg-error/5 px-4 py-2.5 text-[13px] text-error">
                        <span>⚠️</span>
                        {loiBienThe}
                      </div>
                    )}

                    {dsBienTheMoi.length === 0 ? (
                      <button
                        type="button"
                        onClick={themHangMoi}
                        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-border py-3 text-[13px] font-semibold text-text-muted transition-colors hover:border-primary-container/40 hover:bg-primary-container/5 hover:text-primary-container"
                      >
                        <PlusOutlined />
                        Thêm biến thể màu × kích thước
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="overflow-x-auto rounded-[12px] border border-primary-container/30">
                          <table className="w-full min-w-[760px] table-fixed text-left">
                            <thead>
                              <tr className="border-b border-primary-container/20 bg-primary-container/5 text-[11px] font-bold uppercase tracking-wide text-text-secondary">
                                <th className="w-[30%] px-3 py-2">Màu sắc <span className="text-error">*</span></th>
                                <th className="w-[20%] px-3 py-2">Kích thước <span className="text-error">*</span></th>
                                <th className="w-[40%] px-3 py-2">Mã SKU <span className="text-error">*</span></th>
                                <th className="w-[10%] px-3 py-2 text-center">Xóa</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dsBienTheMoi.map((h) => (
                                <tr key={h.key} className="border-b border-border/70 bg-primary-container/[0.02] last:border-b-0">
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="h-5 w-5 shrink-0 rounded-full border border-border shadow-sm"
                                        style={{ backgroundColor: timMauHex(h.mauSac) }}
                                      />
                                      <input
                                        type="text"
                                        list="edit-product-colors"
                                        value={h.mauSac}
                                        onChange={(e) => capNhatHangMoi(h.key, "mauSac", e.target.value)}
                                        placeholder="Tên màu"
                                        maxLength={100}
                                        className="h-8 min-w-0 flex-1 rounded-[6px] border border-primary-container/30 bg-surface px-2 text-[12px] outline-none focus:border-primary-container"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      list="edit-product-sizes"
                                      value={h.kichThuoc}
                                      onChange={(e) => capNhatHangMoi(h.key, "kichThuoc", e.target.value)}
                                      placeholder="VD: M"
                                      maxLength={50}
                                      className="h-8 w-full rounded-[6px] border border-primary-container/30 bg-surface px-2 text-[12px] outline-none focus:border-primary-container"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="text"
                                      value={h.maSKU}
                                      onChange={(e) => capNhatHangMoi(h.key, "maSKU", e.target.value)}
                                      placeholder="Mã SKU"
                                      maxLength={100}
                                      className="h-8 w-full rounded-[6px] border border-primary-container/30 bg-surface px-2 font-mono text-[12px] outline-none focus:border-primary-container"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => xoaHangMoi(h.key)}
                                      title="Xóa dòng này"
                                      aria-label="Xóa biến thể mới"
                                      className="mx-auto flex h-8 w-8 items-center justify-center rounded-[6px] text-text-muted transition-colors hover:bg-error-container hover:text-error"
                                    >
                                      <DeleteOutlined />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={xuLyThemBienTheMoi}
                            disabled={dangThemBienThe}
                            className="flex h-9 items-center justify-center gap-2 rounded-[8px] bg-[#0ea5e9] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {dangThemBienThe ? (
                              <>
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Đang lưu...
                              </>
                            ) : (
                              <>
                                <CheckOutlined />
                                Lưu {dsBienTheMoi.length} biến thể mới
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-surface/95 px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => router.push("/admin/san-pham-phoi-ao")}
                disabled={dangLuuThongTin}
                className="flex h-10 items-center justify-center rounded-[10px] border border-border bg-surface px-5 text-[14px] font-semibold text-text-secondary transition-colors hover:bg-surface-alt disabled:opacity-40"
              >
                Về danh sách
              </button>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={xuLyLuuThongTin}
                  disabled={dangLuuThongTin}
                  className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#0ea5e9] px-6 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {dangLuuThongTin ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <SaveOutlined />
                      Lưu thông tin chung
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

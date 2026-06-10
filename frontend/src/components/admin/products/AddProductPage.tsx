"use client";

/**
 * AddProductPage – Trang thêm phôi áo mới trên một biểu mẫu duy nhất.
 *
 * Thông tin cơ bản:
 *   Tên phôi áo, Danh mục, Giá nền, Chất liệu, Kiểu dáng, Xuất xứ, Mô tả.
 *
 * Biến thể:
 *   Thêm ít nhất 1 biến thể (Màu, Kích thước, SKU, Tồn kho ban đầu).
 *   Hỗ trợ thêm nhiều biến thể trước khi lưu.
 *
 * Luồng gọi API:
 *   1. POST /api/admin/products  → nhận productId
 *   2. POST /api/admin/products/:id/variants (gọi cho từng biến thể)
 *   3. invalidateQueries(["products"]) → làm mới toàn bộ trang
 */

import {
  ArrowLeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as productService from "@/services/admin/productService";
import type { ThemBienTheInput } from "@/services/admin/productService";

// ===== KIỂU DỮ LIỆU NỘI BỘ =====

/** Dữ liệu thông tin cơ bản */
type FormBuoc1 = {
  tenSanPham: string;
  danhMucId: string;
  giaNen: string;
  chatLieu: string;
  formDang: string;
  xuatXu: string;
  moTa: string;
};

/** Một hàng biến thể trong bảng */
type HangBienThe = {
  /** ID tạm thời (dùng để xác định hàng trong UI) */
  key: string;
  mauSac: string;
  kichThuoc: string;
  maSKU: string;
  tonKhoBanDau: string;
};

// ===== HẰNG SỐ =====

/** Danh sách kích thước phổ biến để gợi ý nhanh */
const DS_SIZE_GOI_Y = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** Danh sách màu phổ biến để chọn nhanh */
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

// ===== COMPONENT HÀM TIỆN ÍCH =====

/** Tạo key ngẫu nhiên cho hàng biến thể */
function taoKey() {
  return Math.random().toString(36).slice(2, 9);
}

/** Tạo gợi ý SKU tự động từ tên, màu, kích thước */
function goiYSKU(ten: string, mau: string, kichThuoc: string): string {
  const tenSlug = ten
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  const mauSlug = mau
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 3);
  const kichThuocSlug = kichThuoc.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 4);
  if (!tenSlug && !mauSlug && !kichThuocSlug) return "";
  return `${tenSlug}-${mauSlug}-${kichThuocSlug}`;
}

/** Kiểm tra phần thông tin cơ bản, trả về danh sách lỗi */
function validateBuoc1(form: FormBuoc1): Partial<Record<keyof FormBuoc1, string>> {
  const loi: Partial<Record<keyof FormBuoc1, string>> = {};
  if (!form.tenSanPham.trim()) loi.tenSanPham = "Vui lòng nhập tên phôi áo";
  else if (form.tenSanPham.trim().length < 2) loi.tenSanPham = "Tên phải có ít nhất 2 ký tự";
  if (!form.danhMucId) loi.danhMucId = "Vui lòng chọn danh mục";
  if (!form.giaNen.trim()) loi.giaNen = "Vui lòng nhập giá nền";
  else if (isNaN(Number(form.giaNen)) || Number(form.giaNen) < 0) loi.giaNen = "Giá nền phải là số không âm";
  if (!form.chatLieu.trim()) loi.chatLieu = "Vui lòng nhập chất liệu";
  if (!form.formDang.trim()) loi.formDang = "Vui lòng nhập kiểu dáng";
  if (!form.xuatXu.trim()) loi.xuatXu = "Vui lòng nhập xuất xứ";
  if (!form.moTa.trim()) loi.moTa = "Vui lòng nhập mô tả";
  else if (form.moTa.trim().length < 10) loi.moTa = "Mô tả phải có ít nhất 10 ký tự";
  return loi;
}

/** Validate một hàng biến thể */
function validateHangBienThe(hang: HangBienThe): string[] {
  const loi: string[] = [];
  if (!hang.mauSac.trim()) loi.push("Chưa nhập màu sắc");
  if (!hang.kichThuoc.trim()) loi.push("Chưa chọn kích thước");
  if (!hang.maSKU.trim()) loi.push("Chưa nhập mã SKU");
  if (hang.tonKhoBanDau.trim() && (isNaN(Number(hang.tonKhoBanDau)) || Number(hang.tonKhoBanDau) < 0)) {
    loi.push("Tồn kho phải là số không âm");
  }
  return loi;
}

// ===== COMPONENT FIELD NHẬP LIỆU =====
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
      {error && (
        <span className="text-[12px] text-error">{error}</span>
      )}
    </div>
  );
}

// ===== COMPONENT CHÍNH =====
export default function AddProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ===== STATE =====
  const [idSanPhamMoi, setIdSanPhamMoi] = useState<number | null>(null);

  // Thông tin cơ bản
  const [formBuoc1, setFormBuoc1] = useState<FormBuoc1>({
    tenSanPham: "",
    danhMucId: "",
    giaNen: "",
    chatLieu: "",
    formDang: "",
    xuatXu: "Việt Nam",
    moTa: "",
  });
  const [loiBuoc1, setLoiBuoc1] = useState<Partial<Record<keyof FormBuoc1, string>>>({});

  // Danh sách biến thể
  const [danhSachBienThe, setDanhSachBienThe] = useState<HangBienThe[]>([
    { key: taoKey(), mauSac: "", kichThuoc: "", maSKU: "", tonKhoBanDau: "0" },
  ]);
  const [loiBuoc2Chung, setLoiBuoc2Chung] = useState<string>("");

  // Hàng đang chọn màu nhanh
  const [keyDangChonMau, setKeyDangChonMau] = useState<string | null>(null);

  // ===== LẤY DANH MỤC =====
  const { data: danhSachDanhMuc = [] } = useQuery({
    queryKey: ["products", "categories"],
    queryFn: productService.layDanhMucSanPham,
    staleTime: 5 * 60_000,
  });

  // ===== MUTATION THÊM BIẾN THỂ =====
  const { mutate: luuBienThe, isPending: dangLuuBienThe } = useMutation({
    mutationFn: async ({
      productId,
      danhSach,
    }: {
      productId: number;
      danhSach: ThemBienTheInput[];
    }) => {
      // Gọi tuần tự, không song song để tránh lỗi unique constraint
      for (const bt of danhSach) {
        await productService.themBienThe(productId, bt);
      }
    },
    onSuccess: () => {
      // Làm mới toàn bộ dữ liệu phôi áo (danh sách, stats, alerts)
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.replace("/admin/san-pham-phoi-ao");
      router.refresh();
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Đã xảy ra lỗi khi thêm biến thể";
      setLoiBuoc2Chung(`Lỗi: ${msg}`);
    },
  });

  // ===== MUTATION TẠO PHÔI ÁO =====
  const { mutate: taoPhoi, isPending: dangTaoPhoi } = useMutation({
    mutationFn: (payload: productService.TaoSanPhamInput) =>
      productService.taoSanPham(payload),
    onSuccess: (data) => {
      setIdSanPhamMoi(data.id);
      luuBienThe({
        productId: data.id,
        danhSach: taoDanhSachBienTheInput(),
      });
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Đã xảy ra lỗi khi tạo phôi áo";
      setLoiBuoc1({ tenSanPham: msg });
    },
  });

  function quayVeDanhSach() {
    if (
      idSanPhamMoi &&
      !window.confirm(
        "Phôi áo đã được tạo nhưng chưa có biến thể. Bạn có chắc muốn về danh sách?"
      )
    ) {
      return;
    }
    router.replace("/admin/san-pham-phoi-ao");
  }

  // ===== XỬ LÝ THÔNG TIN CƠ BẢN =====
  function capNhatBuoc1(field: keyof FormBuoc1, value: string) {
    setFormBuoc1((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (loiBuoc1[field]) {
      setLoiBuoc1((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  // ===== XỬ LÝ BẢNG BIẾN THỂ =====
  function capNhatBienThe(key: string, field: keyof HangBienThe, value: string) {
    setDanhSachBienThe((prev) =>
      prev.map((hang) => {
        if (hang.key !== key) return hang;
        const hangMoi = { ...hang, [field]: value };
        // Tự động gợi ý SKU nếu SKU chưa có hoặc vẫn là gợi ý tự động
        if (field === "mauSac" || field === "kichThuoc") {
          const tenHienTai = formBuoc1.tenSanPham.trim();
          const skuGoiY = goiYSKU(
            tenHienTai,
            field === "mauSac" ? value : hang.mauSac,
            field === "kichThuoc" ? value : hang.kichThuoc
          );
          // Chỉ tự điền SKU nếu SKU đang trống hoặc là gợi ý cũ
          if (!hang.maSKU || hang.maSKU === goiYSKU(tenHienTai, hang.mauSac, hang.kichThuoc)) {
            hangMoi.maSKU = skuGoiY;
          }
        }
        return hangMoi;
      })
    );
    setLoiBuoc2Chung("");
  }

  function themHangBienThe() {
    setDanhSachBienThe((prev) => [
      ...prev,
      { key: taoKey(), mauSac: "", kichThuoc: "", maSKU: "", tonKhoBanDau: "0" },
    ]);
  }

  function xoaHangBienThe(key: string) {
    if (danhSachBienThe.length <= 1) return; // Phải có ít nhất 1 biến thể
    setDanhSachBienThe((prev) => prev.filter((h) => h.key !== key));
  }

  function chonMauNhanh(key: string, tenMau: string) {
    capNhatBienThe(key, "mauSac", tenMau);
    setKeyDangChonMau(null);
  }

  function taoDanhSachBienTheInput(): ThemBienTheInput[] {
    return danhSachBienThe.map((hang) => ({
      color: hang.mauSac.trim(),
      size: hang.kichThuoc.trim(),
      sku: hang.maSKU.trim(),
      stockQty: Number(hang.tonKhoBanDau) || 0,
    }));
  }

  function xuLyLuu() {
    const loiThongTin = validateBuoc1(formBuoc1);
    setLoiBuoc1(loiThongTin);

    // Kiểm tra tất cả biến thể
    const tatCaLoi: string[] = [];
    for (const hang of danhSachBienThe) {
      const loi = validateHangBienThe(hang);
      tatCaLoi.push(...loi);
    }

    // Kiểm tra SKU trùng nhau trong danh sách
    const dsSKU = danhSachBienThe.map((h) => h.maSKU.trim()).filter(Boolean);
    const skuTrung = dsSKU.filter((sku, i) => dsSKU.indexOf(sku) !== i);
    if (skuTrung.length > 0) {
      tatCaLoi.push(`Mã SKU "${skuTrung[0]}" bị trùng lặp trong danh sách`);
    }

    // Kiểm tra tổ hợp màu và kích thước trùng nhau
    const dsMauSize = danhSachBienThe.map((h) => `${h.mauSac.trim()}|${h.kichThuoc.trim()}`);
    const mauSizeTrung = dsMauSize.filter((ms, i) => dsMauSize.indexOf(ms) !== i && ms !== "|");
    if (mauSizeTrung.length > 0) {
      const [mau, kichThuoc] = mauSizeTrung[0].split("|");
      tatCaLoi.push(
        `Biến thể màu "${mau}" – kích thước "${kichThuoc}" bị trùng lặp`
      );
    }

    setLoiBuoc2Chung(tatCaLoi[0] ?? "");

    if (Object.keys(loiThongTin).length > 0 || tatCaLoi.length > 0) {
      return;
    }

    if (idSanPhamMoi) {
      luuBienThe({
        productId: idSanPhamMoi,
        danhSach: taoDanhSachBienTheInput(),
      });
      return;
    }

    taoPhoi({
      categoryId: Number(formBuoc1.danhMucId),
      name: formBuoc1.tenSanPham.trim(),
      basePrice: Number(formBuoc1.giaNen),
      material: formBuoc1.chatLieu.trim(),
      form: formBuoc1.formDang.trim(),
      madeIn: formBuoc1.xuatXu.trim(),
      description: formBuoc1.moTa.trim(),
    });
  }

  // ===== HIỂN THỊ =====
  const inputClass =
    "h-10 w-full rounded-[8px] border border-border bg-surface-alt px-3 text-body-md text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary-container focus:ring-1 focus:ring-primary-container";

  const textareaClass =
    "w-full resize-none rounded-[8px] border border-border bg-surface-alt px-3 py-2.5 text-body-md text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary-container focus:ring-1 focus:ring-primary-container";

  return (
    <div className="pb-12">
      <section className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <button
            type="button"
            onClick={quayVeDanhSach}
            className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-text-secondary transition-colors hover:text-primary-container"
          >
            <ArrowLeftOutlined />
            Danh sách phôi áo
          </button>
          <h2 className="font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
            Thêm phôi áo mới
          </h2>
          <p className="mt-1 max-w-2xl text-body-sm text-text-secondary">
            Khai báo thông tin cơ bản, biến thể màu sắc, kích thước và tồn kho
            ban đầu của phôi áo.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-[18px] font-extrabold text-text-main">
            Thông tin phôi áo
          </h3>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            Hoàn thiện thông tin cơ bản và biến thể, sau đó lưu phôi áo trong một lần.
          </p>
        </div>

        {/* ===== NỘI DUNG ===== */}
        <div className="space-y-8 p-6 lg:p-8">
          {/* Thông tin cơ bản */}
          <section
            aria-labelledby="tieu-de-thong-tin-co-ban"
            className="rounded-[14px] border border-border p-5"
          >
            <div className="mb-5">
              <h3
                id="tieu-de-thong-tin-co-ban"
                className="text-[16px] font-extrabold text-text-main"
              >
                Thông tin cơ bản
              </h3>
              <p className="mt-1 text-[13px] text-text-secondary">
                Nhập thông tin dùng chung của phôi áo.
              </p>
            </div>

            {idSanPhamMoi && (
              <div className="mb-5 rounded-[10px] border border-primary-container/30 bg-primary-container/5 px-4 py-3 text-[13px] text-text-secondary">
                Thông tin cơ bản đã được tạo. Hãy kiểm tra và lưu lại phần biến thể.
              </div>
            )}

            <fieldset
              disabled={Boolean(idSanPhamMoi)}
              className={idSanPhamMoi ? "pointer-events-none opacity-60" : ""}
            >
              <div className="flex flex-col gap-5">
                {/* Tên phôi áo */}
                <FormField
                  label="Tên phôi áo"
                  required
                  error={loiBuoc1.tenSanPham}
                >
                  <input
                    id="add-product-ten"
                    type="text"
                    value={formBuoc1.tenSanPham}
                    onChange={(e) => capNhatBuoc1("tenSanPham", e.target.value)}
                    placeholder="Ví dụ: Áo thun phom rộng bằng vải bông dày"
                    maxLength={300}
                    className={`${inputClass} ${loiBuoc1.tenSanPham ? "border-error focus:border-error focus:ring-error/30" : ""}`}
                    autoFocus
                  />
                </FormField>

              {/* Hàng 2: Danh mục + Giá nền */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Danh mục"
                  required
                  error={loiBuoc1.danhMucId}
                >
                  <select
                    id="add-product-danh-muc"
                    value={formBuoc1.danhMucId}
                    onChange={(e) => capNhatBuoc1("danhMucId", e.target.value)}
                    className={`${inputClass} cursor-pointer ${loiBuoc1.danhMucId ? "border-error" : ""}`}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {danhSachDanhMuc.map((dm) => (
                      <option key={dm.id} value={dm.id}>
                        {dm.ten}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Giá nền (VNĐ)"
                  required
                  error={loiBuoc1.giaNen}
                >
                  <input
                    id="add-product-gia"
                    type="number"
                    value={formBuoc1.giaNen}
                    onChange={(e) => capNhatBuoc1("giaNen", e.target.value)}
                    placeholder="Ví dụ: 185000"
                    min={0}
                    step={1000}
                    className={`${inputClass} ${loiBuoc1.giaNen ? "border-error" : ""}`}
                  />
                </FormField>
              </div>

              {/* Hàng 3: Chất liệu + Kiểu dáng */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Chất liệu"
                  required
                  error={loiBuoc1.chatLieu}
                >
                  <input
                    id="add-product-chat-lieu"
                    type="text"
                    value={formBuoc1.chatLieu}
                    onChange={(e) => capNhatBuoc1("chatLieu", e.target.value)}
                    placeholder="Ví dụ: Vải bông 100%, định lượng 250 g/m²"
                    maxLength={200}
                    className={`${inputClass} ${loiBuoc1.chatLieu ? "border-error" : ""}`}
                  />
                </FormField>

                <FormField
                  label="Kiểu dáng"
                  required
                  error={loiBuoc1.formDang}
                >
                  <input
                    id="add-product-form-dang"
                    type="text"
                    value={formBuoc1.formDang}
                    onChange={(e) => capNhatBuoc1("formDang", e.target.value)}
                    placeholder="Ví dụ: Phom rộng"
                    maxLength={100}
                    className={`${inputClass} ${loiBuoc1.formDang ? "border-error" : ""}`}
                  />
                </FormField>
              </div>

              {/* Xuất xứ */}
              <FormField label="Xuất xứ" required error={loiBuoc1.xuatXu}>
                <input
                  id="add-product-xuat-xu"
                  type="text"
                  value={formBuoc1.xuatXu}
                  onChange={(e) => capNhatBuoc1("xuatXu", e.target.value)}
                  placeholder="Ví dụ: Việt Nam"
                  maxLength={100}
                  className={`${inputClass} ${loiBuoc1.xuatXu ? "border-error" : ""}`}
                />
              </FormField>

              {/* Mô tả */}
              <FormField label="Mô tả sản phẩm" required error={loiBuoc1.moTa}>
                <textarea
                  id="add-product-mo-ta"
                  value={formBuoc1.moTa}
                  onChange={(e) => capNhatBuoc1("moTa", e.target.value)}
                  placeholder="Mô tả chi tiết về phôi áo (chất lượng, đặc điểm, phù hợp cho ai...)"
                  rows={4}
                  className={`${textareaClass} ${loiBuoc1.moTa ? "border-error" : ""}`}
                />
              </FormField>
              </div>
            </fieldset>
          </section>

          {/* Biến thể */}
          <section
            aria-labelledby="tieu-de-bien-the"
            className="rounded-[14px] border border-border p-5"
          >
            <div className="mb-5">
              <h3
                id="tieu-de-bien-the"
                className="text-[16px] font-extrabold text-text-main"
              >
                Biến thể phôi áo
              </h3>
              <p className="mt-1 text-[13px] text-text-secondary">
                Thêm các tổ hợp màu sắc, kích thước, mã SKU và tồn kho ban đầu.
              </p>
            </div>

            <div className="flex flex-col gap-4">
                {/* Banner hướng dẫn */}
                <div className="flex items-start gap-3 rounded-[10px] border border-primary-container/30 bg-primary-container/5 px-4 py-3">
                  <span className="mt-0.5 text-[18px] text-primary-container">ℹ️</span>
                  <div className="text-[13px] text-text-secondary">
                    <span className="font-semibold text-text-main">Thêm biến thể màu × kích thước</span>
                    <br />
                    Mỗi biến thể là một tổ hợp <strong>Màu sắc + Kích thước</strong> duy nhất.
                    SKU được gợi ý tự động, bạn có thể chỉnh sửa trực tiếp.
                  </div>
                </div>

                {/* Thông báo lỗi chung của phần biến thể */}
                {loiBuoc2Chung && (
                  <div className="flex items-center gap-2 rounded-[8px] border border-error/30 bg-error/5 px-4 py-2.5 text-[13px] text-error">
                    <span>⚠️</span>
                    {loiBuoc2Chung}
                  </div>
                )}

              {/* Bảng biến thể */}
              <div className="overflow-x-auto rounded-[12px] border border-border">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-border bg-surface-alt text-[12px] font-bold uppercase text-text-secondary">
                      <th className="px-4 py-2.5 w-[190px]">Màu sắc <span className="text-error">*</span></th>
                      <th className="px-4 py-2.5 w-[140px]">Kích thước <span className="text-error">*</span></th>
                      <th className="px-4 py-2.5">Mã SKU <span className="text-error">*</span></th>
                      <th className="px-4 py-2.5 w-[110px]">Tồn kho</th>
                      <th className="px-4 py-2.5 w-[44px]" />
                    </tr>
                  </thead>
                  <tbody>
                    {danhSachBienThe.map((hang) => (
                      <tr
                        key={hang.key}
                        className="border-b border-border/50 last:border-b-0"
                      >
                        {/* Ô màu sắc và bảng chọn nhanh */}
                        <td className="px-3 py-2">
                          <div className="relative">
                            <div className="flex items-center gap-1.5">
                              {/* Chấm màu xem trước */}
                              <span
                                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border shadow-sm cursor-pointer"
                                style={{
                                  backgroundColor:
                                    DS_MAU_PHO_BIEN.find(
                                      (m) => m.ten === hang.mauSac
                                    )?.hex || "#94a3b8",
                                }}
                                onClick={() =>
                                  setKeyDangChonMau(
                                    keyDangChonMau === hang.key ? null : hang.key
                                  )
                                }
                                title="Chọn màu nhanh"
                              />
                              <input
                                type="text"
                                value={hang.mauSac}
                                onChange={(e) =>
                                  capNhatBienThe(hang.key, "mauSac", e.target.value)
                                }
                                placeholder="Tên màu..."
                                maxLength={100}
                                className="h-8 w-full rounded-[6px] border border-border bg-surface-alt px-2 text-[13px] text-text-main outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                              />
                            </div>

                            {/* Bảng chọn màu nhanh */}
                            {keyDangChonMau === hang.key && (
                              <div className="absolute left-0 top-full z-20 mt-1 w-[280px] rounded-[10px] border border-border bg-surface p-3 shadow-lg">
                                <p className="mb-2 text-[11px] font-semibold uppercase text-text-muted">
                                  Chọn màu nhanh
                                </p>
                                <div className="grid grid-cols-5 gap-2">
                                  {DS_MAU_PHO_BIEN.map((mau) => (
                                    <button
                                      key={mau.ten}
                                      type="button"
                                      title={mau.ten}
                                      onClick={() => chonMauNhanh(hang.key, mau.ten)}
                                      className="group flex flex-col items-center gap-1"
                                    >
                                      <span
                                        className={`h-7 w-7 rounded-full border-2 shadow-sm transition-transform group-hover:scale-110 ${
                                          hang.mauSac === mau.ten
                                            ? "border-primary-container"
                                            : "border-border"
                                        }`}
                                        style={{ backgroundColor: mau.hex }}
                                      />
                                      <span className="text-[10px] text-text-muted leading-tight text-center">
                                        {mau.ten}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Ô kích thước và các lựa chọn nhanh */}
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {DS_SIZE_GOI_Y.map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() =>
                                  capNhatBienThe(hang.key, "kichThuoc", sz)
                                }
                                className={`rounded-[4px] px-2 py-0.5 text-[12px] font-medium transition-colors ${
                                  hang.kichThuoc === sz
                                    ? "bg-primary-container text-white"
                                    : "border border-border bg-surface-alt text-text-secondary hover:bg-surface"
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={hang.maSKU}
                            onChange={(e) =>
                              capNhatBienThe(hang.key, "maSKU", e.target.value)
                            }
                            placeholder="SKU..."
                            maxLength={100}
                            className="h-8 w-full rounded-[6px] border border-border bg-surface-alt px-2 font-mono text-[13px] text-text-main outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                          />
                        </td>

                        {/* Tồn kho */}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={hang.tonKhoBanDau}
                            onChange={(e) =>
                              capNhatBienThe(hang.key, "tonKhoBanDau", e.target.value)
                            }
                            min={0}
                            placeholder="0"
                            className="h-8 w-full rounded-[6px] border border-border bg-surface-alt px-2 text-[13px] text-text-main outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                          />
                        </td>

                        {/* Xóa hàng */}
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => xoaHangBienThe(hang.key)}
                            disabled={danhSachBienThe.length <= 1}
                            title="Xóa biến thể này"
                            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-text-muted transition-colors hover:bg-error-container hover:text-error disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <DeleteOutlined className="text-[16px]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Nút thêm hàng biến thể */}
              <button
                type="button"
                onClick={themHangBienThe}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-border py-2.5 text-[13px] font-semibold text-text-secondary transition-colors hover:border-primary-container/50 hover:bg-primary-container/5 hover:text-primary-container"
              >
                <PlusOutlined />
                Thêm biến thể màu × kích thước
              </button>

              {/* Tóm tắt: số biến thể đã thêm */}
              <p className="text-[13px] text-text-muted">
                Đã thêm <span className="font-semibold text-text-main">{danhSachBienThe.length}</span> biến thể
              </p>
            </div>
          </section>
        </div>

        {/* ===== CHÂN BIỂU MẪU ===== */}
        <div className="flex flex-col-reverse gap-3 border-t border-border bg-surface-alt/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={quayVeDanhSach}
            disabled={dangTaoPhoi || dangLuuBienThe}
            className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-5 text-[14px] font-semibold text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
          >
            Về danh sách
          </button>

          <button
            type="button"
            onClick={xuLyLuu}
            disabled={dangTaoPhoi || dangLuuBienThe}
            className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#0ea5e9] px-6 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dangTaoPhoi || dangLuuBienThe ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang lưu...
              </>
            ) : (
              <>
                <CheckOutlined />
                Lưu phôi áo
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

"use client";

/**
 * EditProductPage – Trang xem và chỉnh sửa phôi áo.
 *
 * Giao diện một biểu mẫu duy nhất:
 *   - Quản lý toàn bộ state bằng react-hook-form.
 *   - Không gọi API khi sửa/đổi trạng thái biến thể, chỉ lưu cục bộ.
 *   - Bấm "Lưu thay đổi" sẽ đóng gói toàn bộ và gọi 1 API duy nhất.
 */

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { message } from "antd";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import CreatableColorSelect from "@/components/admin/products/CreatableColorSelect";
import {
  DEFAULT_PRODUCT_COLORS,
  mergeProductColors,
  type ProductColor,
} from "@/lib/productColors";
import * as productService from "@/services/admin/productService";
import type {
  BienTheSanPham,
  TrangThaiHienThi,
} from "@/services/admin/productService";

// =====================================================================
// KIỂU DỮ LIỆU NỘI BỘ (REACT-HOOK-FORM)
// =====================================================================

type NewVariantForm = {
  key: string;
  mauSac: string;
  maMau: string;
  kichThuoc: string;
  maSKU: string;
  tonKho: string;
};

type FormValues = {
  tenSanPham: string;
  danhMucId: string;
  giaNen: string;
  chatLieu: string;
  formDang: string;
  xuatXu: string;
  moTa: string;
  displayStatus: TrangThaiHienThi;
  existingVariants: BienTheSanPham[];
  newVariants: NewVariantForm[];
};

type EditProductPageProps = {
  productId: number;
};

// =====================================================================
// HẰNG SỐ
// =====================================================================

const DS_SIZE_GOI_Y = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

// =====================================================================
// HÀM TIỆN ÍCH
// =====================================================================

function taoKey() {
  return Math.random().toString(36).slice(2, 9);
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

  const [messageApi, contextHolder] = message.useMessage();

  function hienThiThongBao(loai: "thanh_cong" | "loi", noi_dung: string) {
    if (loai === "thanh_cong") messageApi.success(noi_dung);
    else messageApi.error(noi_dung);
  }

  // ===== LẤY DANH MỤC =====
  const { data: danhSachDanhMuc = [] } = useQuery({
    queryKey: ["products", "categories"],
    queryFn: productService.layDanhMucSanPham,
    staleTime: 5 * 60_000,
  });

  const { data: bangMauDaDung = [] } = useQuery({
    queryKey: ["products", "colors"],
    queryFn: productService.layBangMauSanPham,
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

  // ===== REACT HOOK FORM =====
  const { register, handleSubmit, control, getValues, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      tenSanPham: "",
      danhMucId: "",
      giaNen: "",
      chatLieu: "",
      formDang: "",
      xuatXu: "",
      moTa: "",
      displayStatus: "dang_hien_thi",
      existingVariants: [],
      newVariants: [],
    },
  });

  const { fields: existingFields } = useFieldArray({
    control,
    name: "existingVariants",
  });

  const { fields: newFields, append: appendNew, remove: removeNew } = useFieldArray({
    control,
    name: "newVariants",
  });

  // Theo dõi giá trị form để sử dụng hiển thị
  const dsBienTheMoi = useWatch({ control, name: "newVariants" });
  const dsBienTheEdit = useWatch({ control, name: "existingVariants" });
  const trangThaiHienThi = useWatch({ control, name: "displayStatus" });
  const tenSanPham = useWatch({ control, name: "tenSanPham" });

  const bangMau = mergeProductColors(
    dsBienTheEdit?.map((variant) => ({
      name: variant.colorName,
      hex: variant.colorHex,
    })),
    dsBienTheMoi?.map((variant) => ({
      name: variant.mauSac,
      hex: variant.maMau,
    })),
    bangMauDaDung,
    DEFAULT_PRODUCT_COLORS
  );

  // ĐIỀN FORM KHI CÓ DỮ LIỆU
  useEffect(() => {
    if (!chiTiet) return;

    const catId = chiTiet.categoryId
      ? String(chiTiet.categoryId)
      : String(danhSachDanhMuc.find((dm) => dm.ten === chiTiet.category)?.id ?? "");

    reset({
      tenSanPham: chiTiet.name,
      danhMucId: catId,
      giaNen: String(chiTiet.basePrice),
      chatLieu: chiTiet.material,
      formDang: chiTiet.fit,
      xuatXu: chiTiet.madeIn ?? "",
      moTa: chiTiet.description ?? "",
      displayStatus: chiTiet.displayStatus,
      existingVariants: chiTiet.variants,
      newVariants: [],
    });
  }, [chiTiet, danhSachDanhMuc, reset]);

  // ===== GỌI API LƯU TOÀN BỘ =====
  const { mutate: luuTatCa, isPending: dangLuuTatCa } = useMutation({
    mutationFn: (payload: productService.CapNhatSanPhamInput) =>
      productService.capNhatSanPham(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "detail", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      hienThiThongBao("thanh_cong", "Đã lưu toàn bộ thay đổi thành công!");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      hienThiThongBao("loi", `Lỗi: ${msg}`);
    },
  });

  const onSubmit = (data: FormValues) => {
    for (const variant of data.existingVariants) {
      if (!variant.colorName.trim() || !variant.size.trim() || !variant.sku.trim()) {
        hienThiThongBao("loi", "Vui lòng điền đầy đủ màu sắc, kích thước và mã SKU cho tất cả biến thể hiện có");
        return;
      }
    }

    // Validate new variants
    if (data.newVariants.length > 0) {
      for (const h of data.newVariants) {
        if (!h.mauSac.trim() || !h.maMau || !h.kichThuoc.trim() || !h.maSKU.trim()) {
          hienThiThongBao("loi", "Vui lòng điền đầy đủ Màu sắc, Kích thước và Mã SKU cho tất cả biến thể mới");
          return;
        }
      }
      const dsSKU = data.newVariants.map((h) => h.maSKU.trim());
      const trung = dsSKU.filter((s, i) => dsSKU.indexOf(s) !== i);
      if (trung.length > 0) {
        hienThiThongBao("loi", `Mã SKU "${trung[0]}" bị trùng lặp trong danh sách mới`);
        return;
      }
    }

    const payload: productService.CapNhatSanPhamInput = {
      categoryId: Number(data.danhMucId),
      name: data.tenSanPham.trim(),
      basePrice: Number(data.giaNen),
      material: data.chatLieu.trim(),
      form: data.formDang.trim(),
      madeIn: data.xuatXu.trim(),
      description: data.moTa.trim(),
      displayStatus: data.displayStatus,
      variants: [
        ...data.existingVariants.map((v) => ({
          id: v.id,
          color: v.colorName.trim(),
          colorHex: v.colorHex,
          size: v.size.trim(),
          sku: v.sku.trim(),
          status: v.status,
        })),
        ...data.newVariants.map((v) => ({
          color: v.mauSac.trim(),
          colorHex: v.maMau,
          size: v.kichThuoc.trim(),
          sku: v.maSKU.trim(),
        })),
      ],
    };

    luuTatCa(payload);
  };

  // ===== XỬ LÝ BIẾN THỂ MỚI =====
  function themHangMoi() {
    appendNew({
      key: taoKey(),
      mauSac: "",
      maMau: "",
      kichThuoc: "",
      maSKU: "",
      tonKho: "0",
    });
  }

  function capNhatMauMoi(index: number, color: ProductColor | null) {
    const current = getValues(`newVariants.${index}`);
    const mauSac = color?.name ?? "";
    const tenSP = tenSanPham ?? "";
    const skuGoiY = goiYSKU(tenSP, mauSac, current.kichThuoc);

    setValue(`newVariants.${index}.mauSac`, mauSac);
    setValue(`newVariants.${index}.maMau`, color?.hex ?? "");
    if (
      !current.maSKU ||
      current.maSKU === goiYSKU(tenSP, current.mauSac, current.kichThuoc)
    ) {
      setValue(`newVariants.${index}.maSKU`, skuGoiY);
    }
  }

  function capNhatHangMoi(index: number, field: keyof NewVariantForm, value: string) {
    setValue(`newVariants.${index}.${field}`, value);
    const h = getValues(`newVariants.${index}`);

    if (field === "mauSac" || field === "kichThuoc") {
      const tenSP = tenSanPham ?? "";
      const skuGoiY = goiYSKU(
        tenSP,
        field === "mauSac" ? value : h.mauSac,
        field === "kichThuoc" ? value : h.kichThuoc
      );
      if (!h.maSKU || h.maSKU === goiYSKU(tenSP, h.mauSac, h.kichThuoc)) {
        setValue(`newVariants.${index}.maSKU`, skuGoiY);
      }
    }
  }

  const inputClass =
    "h-9 w-full rounded-[7px] border border-border bg-surface-alt px-3 text-body-md text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary-container focus:ring-1 focus:ring-primary-container";

  const textareaClass =
    "w-full resize-none rounded-[7px] border border-border bg-surface-alt px-3 py-2 text-body-md text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary-container focus:ring-1 focus:ring-primary-container";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-12" noValidate>
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
            type="submit"
            disabled={dangLuuTatCa}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-[#0ea5e9] px-6 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dangLuuTatCa ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang lưu...
              </>
            ) : (
              <>
                <SaveOutlined />
                Lưu thay đổi
              </>
            )}
          </button>
        )}
      </section>

      <section className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-[18px] font-extrabold text-text-main">Thông tin phôi áo</h3>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              Chỉnh sửa thông tin chung và quản lý toàn bộ biến thể trong cùng một biểu mẫu.
            </p>
          </div>
          {chiTiet && !dangTaiChiTiet && (
            <div className="flex items-center gap-2 text-[12px]">
              <span className="rounded-full bg-surface-alt px-3 py-1 font-semibold text-text-secondary">
                {dsBienTheEdit?.length || 0} biến thể
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
              onClick={() => queryClient.invalidateQueries({ queryKey: ["products", "detail", productId] })}
              className="rounded-lg border border-error/30 px-4 py-1.5 text-[13px] hover:bg-error/5"
            >
              Thử lại
            </button>
          </div>
        )}

        {!dangTaiChiTiet && !loiTaiChiTiet && chiTiet && (
          <>
            <div className="space-y-6 p-4 sm:p-6">
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
                    <FormField label="Tên phôi áo" required error={errors.tenSanPham?.message}>
                      <input
                        type="text"
                        {...register("tenSanPham", {
                          required: "Vui lòng nhập tên phôi áo",
                          minLength: { value: 2, message: "Tên phải có ít nhất 2 ký tự" },
                        })}
                        maxLength={300}
                        disabled={isViewMode}
                        className={`${inputClass} ${errors.tenSanPham ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="xl:col-span-3">
                    <FormField label="Danh mục" required error={errors.danhMucId?.message}>
                      <select
                        {...register("danhMucId", { required: "Vui lòng chọn danh mục" })}
                        disabled={isViewMode}
                        className={`${inputClass} cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
                          errors.danhMucId ? "border-error" : ""
                        }`}
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
                    <FormField label="Giá nền (VNĐ)" required error={errors.giaNen?.message}>
                      <input
                        type="number"
                        {...register("giaNen", {
                          required: "Vui lòng nhập giá nền",
                          min: { value: 0, message: "Giá nền phải là số không âm" },
                          validate: (val) => Number(val) % 1000 === 0 || "Giá nền phải là bội số của 1.000",
                        })}
                        min={0}
                        step={1000}
                        disabled={isViewMode}
                        className={`${inputClass} ${errors.giaNen ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="xl:col-span-2">
                    <FormField label="Trạng thái hiển thị">
                      <select
                        {...register("displayStatus")}
                        disabled={isViewMode}
                        className={`${inputClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <option value="dang_hien_thi">Đang hiển thị</option>
                        <option value="dang_an">Đang ẩn</option>
                      </select>
                    </FormField>
                  </div>

                  <div className="xl:col-span-4">
                    <FormField label="Chất liệu" required error={errors.chatLieu?.message}>
                      <input
                        type="text"
                        {...register("chatLieu", { required: "Vui lòng nhập chất liệu" })}
                        maxLength={200}
                        disabled={isViewMode}
                        className={`${inputClass} ${errors.chatLieu ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="xl:col-span-3">
                    <FormField label="Kiểu dáng" required error={errors.formDang?.message}>
                      <input
                        type="text"
                        {...register("formDang", { required: "Vui lòng nhập kiểu dáng" })}
                        maxLength={100}
                        disabled={isViewMode}
                        className={`${inputClass} ${errors.formDang ? "border-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="xl:col-span-2">
                    <FormField label="Xuất xứ" required error={errors.xuatXu?.message}>
                      <input
                        type="text"
                        {...register("xuatXu", { required: "Vui lòng nhập xuất xứ" })}
                        maxLength={100}
                        disabled={isViewMode}
                        className={`${inputClass} ${errors.xuatXu ? "border-error" : ""}`}
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
                    <FormField label="Mô tả sản phẩm">
                      <textarea
                        {...register("moTa")}
                        rows={3}
                        disabled={isViewMode}
                        className={textareaClass}
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
                      {isViewMode
                        ? "Mỗi biến thể được hiển thị trên một dòng."
                        : "Chỉnh sửa trực tiếp các trường có thể thay đổi trên từng dòng."}
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-text-secondary">
                    {dsBienTheEdit?.length || 0} biến thể
                  </span>
                </div>

                {existingFields.length === 0 ? (
                  <div className="rounded-[10px] border border-dashed border-border py-5 text-center text-[13px] italic text-text-muted">
                    Chưa có biến thể nào.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-[12px] border border-border">
                    <table className="w-full min-w-[760px] table-fixed text-left">
                      <thead>
                        <tr className="border-b border-border bg-surface-alt text-[11px] font-bold uppercase tracking-wide text-text-secondary">
                          <th className="w-[24%] px-3 py-2">Màu sắc</th>
                          <th className="w-[14%] px-3 py-2">Kích thước</th>
                          <th className="w-[24%] px-3 py-2">Mã SKU</th>
                          <th className="w-[12%] px-3 py-2 text-right">Tồn kho</th>
                          <th className="w-[14%] px-3 py-2">Trạng thái tồn</th>
                          <th className="w-[12%] px-3 py-2">Hiển thị</th>
                        </tr>
                      </thead>
                      <tbody>
                        {existingFields.map((field, index) => {
                          const bt = dsBienTheEdit[index] ?? field;
                          return (
                            <tr key={field.id} className="border-b border-border/70 bg-surface last:border-b-0">
                              <td className="px-3 py-2">
                                <CreatableColorSelect
                                  value={{
                                    name: bt.colorName,
                                    hex: bt.colorHex,
                                  }}
                                  options={bangMau}
                                  onChange={(color) => {
                                    setValue(
                                      `existingVariants.${index}.colorName`,
                                      color?.name ?? ""
                                    );
                                    setValue(
                                      `existingVariants.${index}.colorHex`,
                                      color?.hex ?? ""
                                    );
                                  }}
                                  disabled={isViewMode || bt.hasTransactions}
                                  compact
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  list="edit-product-sizes"
                                  {...register(`existingVariants.${index}.size`)}
                                  maxLength={50}
                                  disabled={isViewMode || bt.hasTransactions}
                                  className={`h-8 w-full rounded-[6px] border border-primary-container/40 bg-surface px-2 text-[12px] outline-none ${
                                    isViewMode || bt.hasTransactions
                                      ? "cursor-not-allowed bg-surface-container opacity-60 text-text-muted"
                                      : "focus:border-primary-container"
                                  }`}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  {...register(`existingVariants.${index}.sku`)}
                                  maxLength={100}
                                  disabled={isViewMode || bt.hasTransactions}
                                  className={`h-8 w-full rounded-[6px] border border-primary-container/40 bg-surface px-2 font-mono text-[12px] outline-none ${
                                    isViewMode || bt.hasTransactions
                                      ? "cursor-not-allowed bg-surface-container opacity-60 text-text-muted"
                                      : "focus:border-primary-container"
                                  }`}
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="text-[13px] font-semibold text-text-main">
                                  {bt.stock.toLocaleString("vi-VN")}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <BadgeTonKho status={bt.inventoryStatus} />
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  {...register(`existingVariants.${index}.status`)}
                                  disabled={isViewMode}
                                  className="h-8 w-full rounded-[6px] border border-primary-container/40 bg-surface px-2 text-[12px] outline-none focus:border-primary-container disabled:cursor-not-allowed disabled:bg-surface-container disabled:opacity-60 disabled:text-text-muted"
                                >
                                  <option value="ACTIVE">Hiện</option>
                                  <option value="INACTIVE">Ẩn</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
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
                          Thêm nhiều dòng rồi lưu cùng lúc với thông tin chung.
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

                    {newFields.length === 0 ? (
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
                              {newFields.map((field, index) => {
                                const h = dsBienTheMoi[index];
                                return (
                                  <tr key={field.id} className="border-b border-border/70 bg-primary-container/[0.02] last:border-b-0">
                                    <td className="px-3 py-2">
                                      <CreatableColorSelect
                                        value={
                                          h?.mauSac
                                            ? {
                                                name: h.mauSac,
                                                hex: h.maMau,
                                              }
                                            : null
                                        }
                                        options={bangMau}
                                        onChange={(color) =>
                                          capNhatMauMoi(index, color)
                                        }
                                        compact
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="text"
                                        list="edit-product-sizes"
                                        value={h?.kichThuoc || ""}
                                        onChange={(e) => capNhatHangMoi(index, "kichThuoc", e.target.value)}
                                        placeholder="VD: M"
                                        maxLength={50}
                                        className="h-8 w-full rounded-[6px] border border-primary-container/30 bg-surface px-2 text-[12px] outline-none focus:border-primary-container"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="text"
                                        value={h?.maSKU || ""}
                                        onChange={(e) => capNhatHangMoi(index, "maSKU", e.target.value)}
                                        placeholder="Mã SKU"
                                        maxLength={100}
                                        className="h-8 w-full rounded-[6px] border border-primary-container/30 bg-surface px-2 font-mono text-[12px] outline-none focus:border-primary-container"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <button
                                        type="button"
                                        onClick={() => removeNew(index)}
                                        title="Xóa dòng này"
                                        aria-label="Xóa biến thể mới"
                                        className="mx-auto flex h-8 w-8 items-center justify-center rounded-[6px] text-text-muted transition-colors hover:bg-error-container hover:text-error"
                                      >
                                        <DeleteOutlined />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
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
                disabled={dangLuuTatCa}
                className="flex h-10 items-center justify-center rounded-[10px] border border-border bg-surface px-5 text-[14px] font-semibold text-text-secondary transition-colors hover:bg-surface-alt disabled:opacity-40"
              >
                Về danh sách
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  disabled={dangLuuTatCa}
                  className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#0ea5e9] px-6 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {dangLuuTatCa ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <SaveOutlined />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </form>
  );
}

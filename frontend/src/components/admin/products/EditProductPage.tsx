"use client";

/**
 * EditProductPage – Trang xem và chỉnh sửa phôi áo.
 *
 * Cấu trúc 2 mục:
 *   Mục "Thông tin cơ bản" – sửa tên, danh mục, giá, chất liệu, kiểu dáng, xuất xứ, mô tả,
 *                            bật/tắt hiển thị trên cửa hàng.
 *   Mục "Quản lý biến thể" – xem toàn bộ biến thể hiện có, sửa tồn kho / SKU / màu / kích thước
 *                            từng biến thể, thêm biến thể mới.
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
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as productService from "@/services/admin/productService";
import type {
  BienTheSanPham,
  TrangThaiHienThi,
} from "@/services/admin/productService";

// =====================================================================
// KIỂU DỮ LIỆU NỘI BỘ
// =====================================================================

type TabHienTai = "thong_tin" | "bien_the";

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
  if (!f.moTa.trim()) e.moTa = "Vui lòng nhập mô tả";
  else if (f.moTa.trim().length < 10) e.moTa = "Mô tả phải có ít nhất 10 ký tự";
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
  const queryClient = useQueryClient();
  const productIdHopLe = Number.isFinite(productId) && productId > 0;

  // ===== MỤC ĐANG HIỂN THỊ =====
  const [tabHienTai, setTabHienTai] = useState<TabHienTai>("thong_tin");

  // ===== THÔNG BÁO =====
  const [thongBao, setThongBao] = useState<{
    loai: "thanh_cong" | "loi";
    noi_dung: string;
  } | null>(null);

  function hienThiThongBao(loai: "thanh_cong" | "loi", noi_dung: string) {
    setThongBao({ loai, noi_dung });
    setTimeout(() => setThongBao(null), 3500);
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
  const [keyDangChonMau, setKeyDangChonMau] = useState<string | null>(null);
  const [keyMoiDangChonMau, setKeyMoiDangChonMau] = useState<string | null>(null);

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
          stockQty: Number(bt.tonKho) || 0,
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
    setKeyDangChonMau(null);
  }

  function huyBienThe(id: number) {
    setDsBienTheEdit((prev) =>
      prev.map((bt) =>
        bt.id === id
          ? { ...bt, dangSua: false, editMau: bt.colorName, editSize: bt.size, editSKU: bt.sku, editStock: String(bt.stock) }
          : bt
      )
    );
    setKeyDangChonMau(null);
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
    if (isNaN(Number(bt.editStock)) || Number(bt.editStock) < 0) {
      hienThiThongBao("loi", "Tồn kho phải là số không âm");
      return;
    }
    luuBienTheHienCo({
      variantId: bt.id,
      payload: {
        color: bt.editMau.trim(),
        size: bt.editSize.trim(),
        sku: bt.editSKU.trim(),
        stockQty: Number(bt.editStock),
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
      if (isNaN(Number(h.tonKho)) || Number(h.tonKho) < 0) {
        setLoiBienThe("Tồn kho phải là số không âm");
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
              Xem và sửa phôi áo
            </h2>
          </div>
          <p className="mt-1 max-w-2xl text-body-sm text-text-secondary">
            {chiTiet?.name ?? "Đang tải thông tin phôi áo..."}
          </p>
        </div>

        {tabHienTai === "thong_tin" && chiTiet && !dangTaiChiTiet && (
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
                Lưu thay đổi
              </>
            )}
          </button>
        )}
      </section>

      <section className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

        {/* ──────────────────────────────────────
            THÔNG BÁO
        ────────────────────────────────────── */}
        {thongBao && (
          <div
            className={`mx-6 mt-4 flex shrink-0 items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-medium transition-all ${
              thongBao.loai === "thanh_cong"
                ? "border border-success/30 bg-success/10 text-success"
                : "border border-error/30 bg-error/10 text-error"
            }`}
          >
            {thongBao.loai === "thanh_cong" ? (
              <CheckOutlined className="text-[15px]" />
            ) : (
              <span>⚠️</span>
            )}
            {thongBao.noi_dung}
          </div>
        )}

        {/* ──────────────────────────────────────
            THANH CHUYỂN MỤC
        ────────────────────────────────────── */}
        <div className="flex shrink-0 border-b border-border px-6">
          {(
            [
              { key: "thong_tin", label: "Thông tin cơ bản" },
              { key: "bien_the", label: `Biến thể${chiTiet ? ` (${chiTiet.variants.length})` : ""}` },
            ] as { key: TabHienTai; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTabHienTai(tab.key)}
              className={`relative mr-6 py-3 text-[14px] font-semibold transition-colors ${
                tabHienTai === tab.key
                  ? "text-primary-container"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label}
              {tabHienTai === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary-container" />
              )}
            </button>
          ))}
        </div>

        {/* ──────────────────────────────────────
            NỘI DUNG
        ────────────────────────────────────── */}
        <div>
          {!productIdHopLe && (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-[14px] font-semibold text-error">
                Mã phôi áo không hợp lệ.
              </p>
              <button
                type="button"
                onClick={() => router.push("/admin/san-pham-phoi-ao")}
                className="rounded-[8px] border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-secondary hover:bg-surface-alt"
              >
                Về danh sách phôi áo
              </button>
            </div>
          )}

          {/* --- Trạng thái loading --- */}
          {productIdHopLe && dangTaiChiTiet && (
            <div className="flex h-48 items-center justify-center text-text-muted">
              <span className="animate-pulse text-[14px]">Đang tải dữ liệu...</span>
            </div>
          )}

          {/* --- Trạng thái lỗi --- */}
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

          {/* ===== THÔNG TIN CƠ BẢN ===== */}
          {!dangTaiChiTiet && !loiTaiChiTiet && tabHienTai === "thong_tin" && chiTiet && (
            <div className="space-y-5 p-6">

              {/* ── Bật/tắt hiển thị ── */}
              <div className="flex items-center justify-between rounded-[12px] border border-border bg-surface-alt/40 px-4 py-3">
                <div>
                  <p className="text-[14px] font-semibold text-text-main">
                    Hiển thị trên cửa hàng
                  </p>
                  <p className="text-[12px] text-text-muted">
                    {trangThaiHienThi === "dang_hien_thi"
                      ? "Khách hàng có thể thấy và đặt thiết kế trên phôi này"
                      : "Phôi đang bị ẩn, khách hàng không thể chọn"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={dangDoiTrangThai}
                  onClick={() =>
                    doiTrangThai(
                      trangThaiHienThi === "dang_hien_thi" ? "dang_an" : "dang_hien_thi"
                    )
                  }
                  className={`flex items-center gap-2 rounded-[8px] px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    trangThaiHienThi === "dang_hien_thi"
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : "bg-surface border border-border text-text-muted hover:bg-surface-alt"
                  }`}
                >
                  {dangDoiTrangThai ? (
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  ) : trangThaiHienThi === "dang_hien_thi" ? (
                    <EyeOutlined className="text-[15px]" />
                  ) : (
                    <EyeInvisibleOutlined className="text-[15px]" />
                  )}
                  {trangThaiHienThi === "dang_hien_thi" ? "Đang hiển thị" : "Đang ẩn"}
                </button>
              </div>

              {/* ── Tên phôi áo ── */}
              <FormField label="Tên phôi áo" required error={loiThongTin.tenSanPham}>
                <input
                  id="edit-ten"
                  type="text"
                  value={formThongTin.tenSanPham}
                  onChange={(e) => capNhatThongTin("tenSanPham", e.target.value)}
                  maxLength={300}
                  className={`${inputClass} ${loiThongTin.tenSanPham ? "border-error" : ""}`}
                />
              </FormField>

              {/* ── Danh mục + Giá nền ── */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Danh mục" required error={loiThongTin.danhMucId}>
                  <select
                    id="edit-danh-muc"
                    value={formThongTin.danhMucId}
                    onChange={(e) => capNhatThongTin("danhMucId", e.target.value)}
                    className={`${inputClass} cursor-pointer ${loiThongTin.danhMucId ? "border-error" : ""}`}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {danhSachDanhMuc.map((dm) => (
                      <option key={dm.id} value={dm.id}>
                        {dm.ten}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Giá nền (VNĐ)" required error={loiThongTin.giaNen}>
                  <input
                    id="edit-gia"
                    type="number"
                    value={formThongTin.giaNen}
                    onChange={(e) => capNhatThongTin("giaNen", e.target.value)}
                    min={0}
                    step={1000}
                    className={`${inputClass} ${loiThongTin.giaNen ? "border-error" : ""}`}
                  />
                </FormField>
              </div>

              {/* ── Chất liệu + Kiểu dáng ── */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Chất liệu" required error={loiThongTin.chatLieu}>
                  <input
                    id="edit-chat-lieu"
                    type="text"
                    value={formThongTin.chatLieu}
                    onChange={(e) => capNhatThongTin("chatLieu", e.target.value)}
                    maxLength={200}
                    className={`${inputClass} ${loiThongTin.chatLieu ? "border-error" : ""}`}
                  />
                </FormField>

                <FormField label="Kiểu dáng" required error={loiThongTin.formDang}>
                  <input
                    id="edit-form-dang"
                    type="text"
                    value={formThongTin.formDang}
                    onChange={(e) => capNhatThongTin("formDang", e.target.value)}
                    maxLength={100}
                    className={`${inputClass} ${loiThongTin.formDang ? "border-error" : ""}`}
                  />
                </FormField>
              </div>

              {/* ── Xuất xứ ── */}
              <FormField label="Xuất xứ" required error={loiThongTin.xuatXu}>
                <input
                  id="edit-xuat-xu"
                  type="text"
                  value={formThongTin.xuatXu}
                  onChange={(e) => capNhatThongTin("xuatXu", e.target.value)}
                  maxLength={100}
                  className={`${inputClass} ${loiThongTin.xuatXu ? "border-error" : ""}`}
                />
              </FormField>

              {/* ── Mô tả ── */}
              <FormField label="Mô tả sản phẩm" required error={loiThongTin.moTa}>
                <textarea
                  id="edit-mo-ta"
                  value={formThongTin.moTa}
                  onChange={(e) => capNhatThongTin("moTa", e.target.value)}
                  rows={5}
                  className={`${textareaClass} ${loiThongTin.moTa ? "border-error" : ""}`}
                />
              </FormField>

              {/* ── Đường dẫn tĩnh (chỉ đọc) ── */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-secondary">
                  Đường dẫn tĩnh
                </label>
                <div className="flex h-9 items-center rounded-[7px] border border-border/50 bg-surface-container px-3 font-mono text-[12px] text-text-muted">
                  {chiTiet.slug}
                </div>
                <span className="text-[11px] text-text-muted">
                  Đường dẫn tĩnh được sinh tự động và không thể thay đổi sau khi tạo.
                </span>
              </div>
            </div>
          )}

          {/* ===== BIẾN THỂ ===== */}
          {!dangTaiChiTiet && !loiTaiChiTiet && tabHienTai === "bien_the" && chiTiet && (
            <div className="space-y-5 p-6">

              {/* ── Thông báo lỗi biến thể ── */}
              {loiBienThe && (
                <div className="flex items-center gap-2 rounded-[8px] border border-error/30 bg-error/5 px-4 py-2.5 text-[13px] text-error">
                  <span>⚠️</span>
                  {loiBienThe}
                </div>
              )}

              {/* ──────────────────────────
                  BIẾN THỂ HIỆN CÓ
              ────────────────────────── */}
              <div>
                <h3 className="mb-3 text-[14px] font-bold text-text-main">
                  Biến thể hiện có
                  <span className="ml-2 text-[12px] font-normal text-text-muted">
                    ({dsBienTheEdit.length} biến thể)
                  </span>
                </h3>

                {dsBienTheEdit.length === 0 ? (
                  <p className="text-[13px] italic text-text-muted">
                    Chưa có biến thể nào.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dsBienTheEdit.map((bt) => (
                      <div
                        key={bt.id}
                        className={`rounded-[12px] border transition-all ${
                          bt.dangSua
                            ? "border-primary-container/40 bg-primary-container/5 shadow-sm"
                            : "border-border bg-surface-alt/30"
                        }`}
                      >
                        {/* ── Hàng xem / sửa ── */}
                        {!bt.dangSua ? (
                          /* CHẾ ĐỘ XEM */
                          <div className="flex items-center gap-3 px-4 py-3">
                            {/* Chấm màu */}
                            <span
                              className="h-5 w-5 shrink-0 rounded-full border border-border shadow-sm"
                              style={{ backgroundColor: timMauHex(bt.colorName) }}
                            />
                            {/* Thông tin */}
                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="font-semibold text-text-main text-[13px]">
                                {bt.colorName}
                              </span>
                              <span className="rounded bg-surface-container px-1.5 py-0.5 text-[12px] font-medium text-text-secondary">
                                {bt.size}
                              </span>
                              <span className="font-mono text-[11px] text-text-muted">
                                {bt.sku}
                              </span>
                              <span className="text-[13px] font-semibold text-text-main">
                                {bt.stock.toLocaleString("vi-VN")} cái
                              </span>
                              <BadgeTonKho status={bt.inventoryStatus} />
                            </div>
                            {/* Nút sửa */}
                            <button
                              type="button"
                              onClick={() => batDauSuaBienThe(bt.id)}
                              className="flex shrink-0 items-center gap-1.5 rounded-[7px] border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-secondary transition-colors hover:border-primary-container/30 hover:bg-primary-container/5 hover:text-primary-container"
                            >
                              <EditOutlined className="text-[13px]" />
                              Sửa
                            </button>
                          </div>
                        ) : (
                          /* CHẾ ĐỘ SỬA */
                          <div className="p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <span className="text-[13px] font-bold text-primary-container">
                                ✏️ Đang chỉnh sửa biến thể
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {/* Màu sắc */}
                              <div className="relative sm:col-span-1">
                                <label className="mb-1 block text-[11px] font-semibold uppercase text-text-muted">
                                  Màu sắc
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="h-5 w-5 shrink-0 cursor-pointer rounded-full border border-border shadow-sm"
                                    style={{ backgroundColor: timMauHex(bt.editMau) }}
                                    onClick={() =>
                                      setKeyDangChonMau(
                                        keyDangChonMau === String(bt.id) ? null : String(bt.id)
                                      )
                                    }
                                    title="Chọn màu nhanh"
                                  />
                                  <input
                                    type="text"
                                    value={bt.editMau}
                                    onChange={(e) =>
                                      capNhatEditBienThe(bt.id, "editMau", e.target.value)
                                    }
                                    className="h-8 w-full rounded-[6px] border border-border bg-surface px-2 text-[12px] outline-none focus:border-primary-container"
                                  />
                                </div>
                                {/* Dropdown màu nhanh */}
                                {keyDangChonMau === String(bt.id) && (
                                  <div className="absolute left-0 top-full z-20 mt-1 w-[260px] rounded-[10px] border border-border bg-surface p-3 shadow-lg">
                                    <p className="mb-2 text-[11px] font-semibold uppercase text-text-muted">
                                      Chọn màu nhanh
                                    </p>
                                    <div className="grid grid-cols-5 gap-2">
                                      {DS_MAU_PHO_BIEN.map((mau) => (
                                        <button
                                          key={mau.ten}
                                          type="button"
                                          title={mau.ten}
                                          onClick={() => {
                                            capNhatEditBienThe(bt.id, "editMau", mau.ten);
                                            setKeyDangChonMau(null);
                                          }}
                                          className="group flex flex-col items-center gap-1"
                                        >
                                          <span
                                            className={`h-6 w-6 rounded-full border-2 shadow-sm transition-transform group-hover:scale-110 ${
                                              bt.editMau === mau.ten
                                                ? "border-primary-container"
                                                : "border-border"
                                            }`}
                                            style={{ backgroundColor: mau.hex }}
                                          />
                                          <span className="text-center text-[9px] leading-tight text-text-muted">
                                            {mau.ten}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Kích thước */}
                              <div className="sm:col-span-1">
                                <label className="mb-1 block text-[11px] font-semibold uppercase text-text-muted">
                                  Kích thước
                                </label>
                                <div className="flex flex-wrap gap-1">
                                  {DS_SIZE_GOI_Y.map((sz) => (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => capNhatEditBienThe(bt.id, "editSize", sz)}
                                      className={`rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                                        bt.editSize === sz
                                          ? "bg-primary-container text-white"
                                          : "border border-border bg-surface text-text-secondary hover:bg-surface-alt"
                                      }`}
                                    >
                                      {sz}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* SKU */}
                              <div className="sm:col-span-1">
                                <label className="mb-1 block text-[11px] font-semibold uppercase text-text-muted">
                                  Mã SKU
                                </label>
                                <input
                                  type="text"
                                  value={bt.editSKU}
                                  onChange={(e) =>
                                    capNhatEditBienThe(bt.id, "editSKU", e.target.value)
                                  }
                                  maxLength={100}
                                  className="h-8 w-full rounded-[6px] border border-border bg-surface px-2 font-mono text-[12px] outline-none focus:border-primary-container"
                                />
                              </div>

                              {/* Tồn kho */}
                              <div className="sm:col-span-1">
                                <label className="mb-1 block text-[11px] font-semibold uppercase text-text-muted">
                                  Tồn kho
                                </label>
                                <input
                                  type="number"
                                  value={bt.editStock}
                                  onChange={(e) =>
                                    capNhatEditBienThe(bt.id, "editStock", e.target.value)
                                  }
                                  min={0}
                                  className="h-8 w-full rounded-[6px] border border-border bg-surface px-2 text-[12px] outline-none focus:border-primary-container"
                                />
                              </div>
                            </div>

                            {/* Nút lưu / hủy */}
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => luuBienTheDaChon(bt)}
                                disabled={dangLuuBienThe}
                                className="flex items-center gap-1.5 rounded-[7px] bg-primary-container px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-primary-container/80 disabled:opacity-50"
                              >
                                {dangLuuBienThe ? (
                                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                  <SaveOutlined className="text-[13px]" />
                                )}
                                Lưu biến thể
                              </button>
                              <button
                                type="button"
                                onClick={() => huyBienThe(bt.id)}
                                disabled={dangLuuBienThe}
                                className="rounded-[7px] border border-border px-4 py-1.5 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Đường kẻ phân cách */}
              <div className="border-t border-border" />

              {/* ──────────────────────────
                  THÊM BIẾN THỂ MỚI
              ────────────────────────── */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-text-main">
                    Thêm biến thể mới
                  </h3>
                  <button
                    type="button"
                    onClick={themHangMoi}
                    className="flex items-center gap-1.5 rounded-[8px] border border-dashed border-border px-3 py-1.5 text-[12px] font-semibold text-text-secondary transition-colors hover:border-primary-container/50 hover:bg-primary-container/5 hover:text-primary-container"
                  >
                    <PlusOutlined className="text-[12px]" />
                    Thêm hàng
                  </button>
                </div>

                {dsBienTheMoi.length === 0 ? (
                  <button
                    type="button"
                    onClick={themHangMoi}
                    className="flex w-full items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-border py-4 text-[13px] font-semibold text-text-muted transition-colors hover:border-primary-container/40 hover:bg-primary-container/5 hover:text-primary-container"
                  >
                    <PlusOutlined />
                    Nhấn để thêm biến thể màu × kích thước mới
                  </button>
                ) : (
                  <div className="space-y-2">
                    {dsBienTheMoi.map((h) => (
                      <div
                        key={h.key}
                        className="rounded-[10px] border border-dashed border-primary-container/30 bg-primary-container/5 p-3"
                      >
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {/* Màu sắc mới */}
                          <div className="relative sm:col-span-1">
                            <label className="mb-1 block text-[11px] font-semibold uppercase text-text-muted">
                              Màu sắc <span className="text-error">*</span>
                            </label>
                            <div className="flex items-center gap-1">
                              <span
                                className="h-5 w-5 shrink-0 cursor-pointer rounded-full border border-border shadow-sm"
                                style={{ backgroundColor: timMauHex(h.mauSac) }}
                                onClick={() =>
                                  setKeyMoiDangChonMau(
                                    keyMoiDangChonMau === h.key ? null : h.key
                                  )
                                }
                                title="Chọn màu nhanh"
                              />
                              <input
                                type="text"
                                value={h.mauSac}
                                onChange={(e) => capNhatHangMoi(h.key, "mauSac", e.target.value)}
                                placeholder="Tên màu..."
                                maxLength={100}
                                className="h-8 w-full rounded-[6px] border border-primary-container/30 bg-surface px-2 text-[12px] outline-none focus:border-primary-container"
                              />
                            </div>
                            {keyMoiDangChonMau === h.key && (
                              <div className="absolute left-0 top-full z-20 mt-1 w-[260px] rounded-[10px] border border-border bg-surface p-3 shadow-lg">
                                <p className="mb-2 text-[11px] font-semibold uppercase text-text-muted">
                                  Chọn màu nhanh
                                </p>
                                <div className="grid grid-cols-5 gap-2">
                                  {DS_MAU_PHO_BIEN.map((mau) => (
                                    <button
                                      key={mau.ten}
                                      type="button"
                                      title={mau.ten}
                                      onClick={() => {
                                        capNhatHangMoi(h.key, "mauSac", mau.ten);
                                        setKeyMoiDangChonMau(null);
                                      }}
                                      className="group flex flex-col items-center gap-1"
                                    >
                                      <span
                                        className={`h-6 w-6 rounded-full border-2 shadow-sm transition-transform group-hover:scale-110 ${
                                          h.mauSac === mau.ten
                                            ? "border-primary-container"
                                            : "border-border"
                                        }`}
                                        style={{ backgroundColor: mau.hex }}
                                      />
                                      <span className="text-center text-[9px] leading-tight text-text-muted">
                                        {mau.ten}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Kích thước mới */}
                          <div className="sm:col-span-1">
                            <label className="mb-1 block text-[11px] font-semibold uppercase text-text-muted">
                              Kích thước <span className="text-error">*</span>
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {DS_SIZE_GOI_Y.map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => capNhatHangMoi(h.key, "kichThuoc", sz)}
                                  className={`rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                                    h.kichThuoc === sz
                                      ? "bg-primary-container text-white"
                                      : "border border-border bg-surface text-text-secondary hover:bg-surface-alt"
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* SKU mới */}
                          <div className="sm:col-span-1">
                            <label className="mb-1 block text-[11px] font-semibold uppercase text-text-muted">
                              Mã SKU <span className="text-error">*</span>
                            </label>
                            <input
                              type="text"
                              value={h.maSKU}
                              onChange={(e) => capNhatHangMoi(h.key, "maSKU", e.target.value)}
                              placeholder="SKU..."
                              maxLength={100}
                              className="h-8 w-full rounded-[6px] border border-primary-container/30 bg-surface px-2 font-mono text-[12px] outline-none focus:border-primary-container"
                            />
                          </div>

                          {/* Tồn kho mới */}
                          <div className="sm:col-span-1">
                            <label className="mb-1 block text-[11px] font-semibold uppercase text-text-muted">
                              Tồn kho
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={h.tonKho}
                                onChange={(e) => capNhatHangMoi(h.key, "tonKho", e.target.value)}
                                min={0}
                                placeholder="0"
                                className="h-8 w-full rounded-[6px] border border-primary-container/30 bg-surface px-2 text-[12px] outline-none focus:border-primary-container"
                              />
                              {/* Nút xóa hàng */}
                              <button
                                type="button"
                                onClick={() => xoaHangMoi(h.key)}
                                title="Xóa hàng này"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-text-muted transition-colors hover:bg-error-container hover:text-error"
                              >
                                <DeleteOutlined className="text-[14px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Nút lưu các biến thể mới */}
                    <button
                      type="button"
                      onClick={xuLyThemBienTheMoi}
                      disabled={dangThemBienThe}
                      className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#0ea5e9] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-60"
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
                )}
              </div>
            </div>
          )}
        </div>

        {/* Thanh hành động phần thông tin cơ bản */}
        {tabHienTai === "thong_tin" && chiTiet && !dangTaiChiTiet && (
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => router.push("/admin/san-pham-phoi-ao")}
              disabled={dangLuuThongTin}
              className="flex h-10 items-center gap-2 rounded-[10px] border border-border bg-surface px-5 text-[14px] font-semibold text-text-secondary transition-colors hover:bg-surface-alt disabled:opacity-40"
            >
              Về danh sách
            </button>
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
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        )}

        {/* Thanh hành động phần biến thể khi không có biến thể mới */}
        {tabHienTai === "bien_the" && chiTiet && !dangTaiChiTiet && dsBienTheMoi.length === 0 && (
          <div className="sticky bottom-0 flex items-center justify-end border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => router.push("/admin/san-pham-phoi-ao")}
              className="flex h-10 items-center gap-2 rounded-[10px] border border-border bg-surface px-5 text-[14px] font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
            >
              Về danh sách
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

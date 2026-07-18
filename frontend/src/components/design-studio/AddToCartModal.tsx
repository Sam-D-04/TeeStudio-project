"use client";

import { useEffect, useState } from "react";
import { Modal, message, Spin } from "antd";
import { useCartStore } from "@/store/useCartStore";
import { getProductById, type PublicProduct, type PublicVariant } from "@/services/productService";
import { userDesignService } from "@/services/userDesignService";

/* ── Các hàm hỗ trợ xử lý màu sắc (Việt hoá tên màu, quy đổi sang mã hex) ── */
const VI_TO_EN: Record<string, string> = {
  "Trắng": "White", "trắng": "White",
  "Đen": "Black", "đen": "Black",
  "Xám": "Gray", "xám": "Gray",
  "Xanh navy": "Navy", "xanh navy": "Navy",
  "Xanh dương": "Light Blue",
  "Xanh lá": "Green",
  "Vàng": "Yellow",
  "Hồng": "Pink",
  "Cam": "Orange",
  "Tím": "Purple",
  "Be": "Beige",
  "Nâu": "Brown",
  "Xám đậm": "Dark Gray",
  "Xanh nhạt": "Light Blue",
};

/* Studio biểu diễn màu bằng mã hex → quy về tên màu để so khớp với variant */
const HEX_TO_EN: Record<string, string> = {
  "#ffffff": "White", "#fff": "White",
  "#000000": "Black", "#000": "Black",
  "#1d4ed8": "Navy", "#1e3a8a": "Navy", "#1e40af": "Navy",
  "#9ca3af": "Gray", "#94a3b8": "Gray",
  "#374151": "Dark Gray",
  "#8b4513": "Brown",
  "#f5f5dc": "Beige", "#d6b89a": "Beige",
  "#c5b28a": "Khaki",
  "#eab308": "Yellow",
  "#f472b6": "Pink",
  "#7dd3fc": "Light Blue",
  "#dc2626": "Red",
  "#16a34a": "Green",
  "#9333ea": "Purple",
};

function normalizeColor(c: string): string {
  const trimmed = c.trim();
  // Nếu là mã hex (vd "#ffffff") thì quy về tên màu tương ứng trước
  const mapped = trimmed.startsWith("#")
    ? (HEX_TO_EN[trimmed.toLowerCase()] ?? trimmed)
    : (VI_TO_EN[trimmed] ?? trimmed);
  return mapped.toLowerCase().trim();
}

function variantMatchesColor(variant: PublicVariant, shirtColor: string): boolean {
  return normalizeColor(variant.color) === normalizeColor(shirtColor);
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const COLOR_HEX: Record<string, string> = {
  white: "#ffffff", black: "#1e293b", navy: "#1e3a8a", red: "#dc2626",
  "light blue": "#7dd3fc", gray: "#94a3b8", grey: "#9ca3af",
  "dark gray": "#374151", green: "#16a34a", yellow: "#eab308",
  pink: "#f472b6", orange: "#f97316", purple: "#9333ea",
  beige: "#d6b89a", brown: "#92400e", khaki: "#c5b28a",
};

function getColorHex(color: string): string {
  return COLOR_HEX[normalizeColor(color)] ?? "#94a3b8";
}

const EN_TO_VI: Record<string, string> = {
  white: "Trắng", black: "Đen", gray: "Xám", grey: "Xám", "dark gray": "Xám đậm",
  navy: "Xanh navy", "light blue": "Xanh dương", green: "Xanh lá",
  yellow: "Vàng", pink: "Hồng", orange: "Cam", purple: "Tím",
  beige: "Be", brown: "Nâu", khaki: "Kaki", red: "Đỏ",
};

/* Tên màu thân thiện (tiếng Việt) từ hex hoặc tên tiếng Anh */
function getColorLabel(color: string): string {
  return EN_TO_VI[normalizeColor(color)] ?? color;
}

/* ── Props của component ── */
interface Props {
  open: boolean;
  onClose: () => void;
  productId: number;
  shirtColor: string;
  designId?: number;
  /** Ảnh in print-ready (base64 PNG) chụp từ canvas — gửi kèm khi tạo đơn. Tối đa
   *  2 ảnh (mặt trước/sau), mặt nào khách không thiết kế thì undefined. */
  printImageFront?: string;
  printImageBack?: string;
  /** Ảnh đại diện thiết kế (base64 hoặc URL) — chỉ để hiển thị thumbnail trong giỏ hàng */
  designPreviewUrl?: string;
}

export default function AddToCartModal({ open, onClose, productId, shirtColor, designId, printImageFront, printImageBack, designPreviewUrl }: Props) {
  const addItem   = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const [product, setProduct]       = useState<PublicProduct | null>(null);
  const [loading, setLoading]       = useState(false);
  /** Số lượng đang chọn cho từng size, vd { S: 2, M: 1 } — size không có key nghĩa là qty 0 */
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [adding, setAdding]         = useState(false);

  /* Fetch khi modal mở */
  useEffect(() => {
    if (!open) return;
    setQuantities({});
    setProduct(null);
    setLoading(true);
    getProductById(productId)
      .then(setProduct)
      .catch((err) => {
        console.error("[AddToCartModal] getProductById failed:", err);
        message.error("Không tải được thông tin sản phẩm");
      })
      .finally(() => setLoading(false));
  }, [open, productId]);

  const sortBySize = (a: PublicVariant, b: PublicVariant) => {
    const ia = SIZE_ORDER.indexOf(a.size);
    const ib = SIZE_ORDER.indexOf(b.size);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  };

  /* Gộp các variant trùng size, giữ variant còn nhiều hàng nhất (tránh hiển thị S, S, M, M…) */
  const dedupeBySize = (variants: PublicVariant[]): PublicVariant[] => {
    const bySize = new Map<string, PublicVariant>();
    for (const v of variants) {
      const existing = bySize.get(v.size);
      if (!existing || v.stockQty > existing.stockQty) bySize.set(v.size, v);
    }
    return Array.from(bySize.values()).sort(sortBySize);
  };

  /* Sizes có sẵn theo màu đang chọn */
  const availableSizes: PublicVariant[] = product
    ? dedupeBySize(
        product.variants.filter((v) => variantMatchesColor(v, shirtColor) && v.stockQty > 0)
      )
    : [];

  /* Fallback: nếu không có variant khớp màu → show tất cả (đã gộp trùng size) */
  const displaySizes: PublicVariant[] =
    availableSizes.length > 0
      ? availableSizes
      : dedupeBySize(product?.variants.filter((v) => v.stockQty > 0) ?? []);

  /* Số lượng variant này đã có sẵn trong giỏ (cartItemId = variant_<id>) */
  const getInCartQty = (variantId: number) =>
    cartItems.find((i) => i.variantId === variantId)?.quantity ?? 0;
  /* Số lượng tối đa còn có thể thêm = tồn kho DB trừ đi phần đã có trong giỏ */
  const getMaxAddable = (v: PublicVariant) => Math.max(0, v.stockQty - getInCartQty(v.id));

  const setSizeQty = (size: string, qty: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, qty));
    setQuantities((q) => {
      const next = { ...q };
      if (clamped === 0) delete next[size];
      else next[size] = clamped;
      return next;
    });
  };

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleAddToCart = async () => {
    if (!product) return;
    const entries = displaySizes
      .map((v) => ({ v, qty: quantities[v.size] ?? 0 }))
      .filter((e) => e.qty > 0);
    if (entries.length === 0) {
      message.warning("Vui lòng chọn size và số lượng");
      return;
    }
    for (const { v, qty } of entries) {
      const max = getMaxAddable(v);
      if (qty > max) {
        message.warning(`Size ${v.size} chỉ còn ${max} sản phẩm có thể thêm.`);
        return;
      }
    }
    setAdding(true);

    // Gán variantId thật (color+size, có trong ProductVariant) cho thiết kế — bắt buộc để
    // lúc tạo đơn backend so khớp được màu, vì Design Studio chỉ lưu baseColor dạng hex tự
    // chọn, không tự gắn với biến thể thật nào cả.
    if (designId) {
      try {
        await userDesignService.attachVariant(designId, entries[0].v.id);
      } catch (err) {
        console.error("[AddToCartModal] attachVariant failed:", err);
      }
    }

    const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? "";
    entries.forEach(({ v, qty }) => {
      addItem({
        productId: product.id,
        variantId: v.id,
        name: product.name,
        image: designPreviewUrl || primaryImage,
        size: v.size,
        color: colorHex,
        colorLabel: getColorLabel(shirtColor),
        price: product.basePrice,
        quantity: qty,
        designId,
        printImageFront,
        printImageBack,
      });
    });
    const summary = entries.map(({ v, qty }) => `${v.size}×${qty}`).join(", ");
    message.success(`Đã thêm ${totalQty} sản phẩm (${summary}) vào giỏ hàng!`);
    setAdding(false);
    onClose();
  };

  const colorHex    = getColorHex(shirtColor);
  const isLightColor = ["#ffffff", "#d6b89a", "#c5b28a", "#eab308", "#f472b6", "#7dd3fc"].includes(colorHex);
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={440}
      styles={{ body: { padding: 0 } }}
      centered
      zIndex={10001}
    >
      {/* Phần đầu modal */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0ea5e9" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          Thêm vào giỏ hàng
        </h2>
      </div>

      {/* Nội dung chính */}
      <div style={{ padding: "20px 24px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : product ? (
          <>
            {/* Thông tin sản phẩm */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                {product.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: colorHex,
                  border: isLightColor ? "1.5px solid #e2e8f0" : "1.5px solid rgba(255,255,255,0.3)",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, color: "#64748b" }}>{getColorLabel(shirtColor)}</span>
                {designId && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "1px 8px",
                    background: "#ede9fe", color: "#7c3aed", borderRadius: 20,
                  }}>
                    Có thiết kế
                  </span>
                )}
              </div>
            </div>

            {/* Chọn size & số lượng (có thể chọn nhiều size cùng lúc) */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 10 }}>
                Chọn size & số lượng
                {availableSizes.length === 0 && product.variants.length > 0 && (
                  <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 8, fontSize: 12 }}>
                    (hiển thị tất cả màu)
                  </span>
                )}
              </label>
              {displaySizes.length === 0 ? (
                <p style={{ color: "#f87171", fontSize: 13 }}>Không còn hàng cho màu này.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {displaySizes.map((v) => {
                    const max = getMaxAddable(v);
                    const qty = quantities[v.size] ?? 0;
                    const inCart = getInCartQty(v.id);
                    const disabled = max <= 0;
                    const active = qty > 0;
                    return (
                      <div
                        key={v.id}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "8px 10px 8px 14px", borderRadius: 10,
                          border: active ? "2px solid #0ea5e9" : "1.5px solid #e2e8f0",
                          background: active ? "#e0f2fe" : disabled ? "#f8fafc" : "#ffffff",
                          opacity: disabled ? 0.6 : 1,
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: active ? "#0284c7" : "#334155" }}>
                            {v.size}
                          </span>
                          <span style={{ fontSize: 11, color: v.stockQty <= 5 && !disabled ? "#f97316" : "#94a3b8" }}>
                            {disabled
                              ? "Hết hàng"
                              : `còn ${max}${inCart > 0 ? `, đã có ${inCart} trong giỏ` : ""}`}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                          <button
                            disabled={disabled || qty <= 0}
                            onClick={() => setSizeQty(v.size, qty - 1, max)}
                            style={{
                              width: 32, height: 32, border: "1.5px solid #e2e8f0",
                              borderRadius: "8px 0 0 8px", background: "#f8fafc",
                              cursor: disabled || qty <= 0 ? "not-allowed" : "pointer",
                              fontSize: 16, color: disabled || qty <= 0 ? "#cbd5e1" : "#475569",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            −
                          </button>
                          <div style={{
                            width: 40, height: 32, border: "1.5px solid #e2e8f0",
                            borderLeft: "none", borderRight: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, color: "#0f172a",
                          }}>
                            {qty}
                          </div>
                          <button
                            disabled={disabled || qty >= max}
                            onClick={() => setSizeQty(v.size, qty + 1, max)}
                            style={{
                              width: 32, height: 32, border: "1.5px solid #e2e8f0",
                              borderRadius: "0 8px 8px 0", background: "#f8fafc",
                              cursor: disabled || qty >= max ? "not-allowed" : "pointer",
                              fontSize: 16, color: disabled || qty >= max ? "#cbd5e1" : "#475569",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tổng tiền + nút thêm vào giỏ hàng */}
            <div style={{
              background: "#f8fafc", borderRadius: 12,
              border: "1px solid #e2e8f0", padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, marginBottom: 16,
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Tổng cộng ({totalQty} sản phẩm)</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0ea5e9" }}>
                  {fmt(product.basePrice * totalQty)}
                </p>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "right" }}>
                {fmt(product.basePrice)} × {totalQty}
              </div>
            </div>

            {(() => {
              const canAdd = totalQty > 0;
              return (
                <button
                  onClick={handleAddToCart}
                  disabled={adding || !canAdd}
                  style={{
                    width: "100%", height: 48, borderRadius: 12,
                    background: canAdd
                      ? "linear-gradient(135deg, #0ea5e9, #0284c7)"
                      : "#e2e8f0",
                    border: "none",
                    color: canAdd ? "#fff" : "#94a3b8",
                    fontWeight: 700, fontSize: 15, cursor: canAdd ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                    boxShadow: canAdd ? "0 4px 16px rgba(14,165,233,0.3)" : "none",
                  }}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {canAdd ? "Thêm vào giỏ hàng" : "Chọn size để tiếp tục"}
                </button>
              );
            })()}
          </>
        ) : (
          <p style={{ textAlign: "center", color: "#f87171" }}>
            Không tải được thông tin sản phẩm.
          </p>
        )}
      </div>
    </Modal>
  );
}

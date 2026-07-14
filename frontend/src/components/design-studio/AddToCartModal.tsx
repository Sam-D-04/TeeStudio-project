"use client";

import { useEffect, useState } from "react";
import { Modal, message, Spin } from "antd";
import { useCartStore } from "@/store/useCartStore";
import { getProductById, type PublicProduct, type PublicVariant } from "@/services/productService";

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
  /** Ảnh in print-ready (base64 PNG) chụp từ canvas — gửi kèm khi tạo đơn */
  printImage?: string;
}

export default function AddToCartModal({ open, onClose, productId, shirtColor, designId, printImage }: Props) {
  const addItem   = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const [product, setProduct]       = useState<PublicProduct | null>(null);
  const [loading, setLoading]       = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity]     = useState(1);
  const [adding, setAdding]         = useState(false);

  /* Fetch khi modal mở */
  useEffect(() => {
    if (!open) return;
    setSelectedSize("");
    setQuantity(1);
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

  const selectedVariant = displaySizes.find((v) => v.size === selectedSize) ?? null;

  /* Số lượng variant này đã có sẵn trong giỏ (cartItemId = variant_<id>) */
  const inCartQty = selectedVariant
    ? cartItems.find((i) => i.variantId === selectedVariant.id)?.quantity ?? 0
    : 0;
  /* Số lượng tối đa còn có thể thêm = tồn kho DB trừ đi phần đã có trong giỏ */
  const maxAddable = selectedVariant ? Math.max(0, selectedVariant.stockQty - inCartQty) : 0;

  /* Nếu tồn kho ít hơn số lượng đang chọn thì tự kéo về mức hợp lệ */
  useEffect(() => {
    if (selectedVariant && quantity > maxAddable) {
      setQuantity(Math.max(1, maxAddable));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize, maxAddable]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      message.warning("Vui lòng chọn size");
      return;
    }
    if (maxAddable <= 0) {
      message.warning("Sản phẩm đã hết hàng hoặc bạn đã thêm hết số lượng còn lại vào giỏ.");
      return;
    }
    if (quantity > maxAddable) {
      message.warning(`Chỉ còn ${maxAddable} sản phẩm có thể thêm.`);
      setQuantity(maxAddable);
      return;
    }
    setAdding(true);
    const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? "";
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: primaryImage,
      size: selectedVariant.size,
      color: colorHex,
      colorLabel: getColorLabel(shirtColor),
      price: product.basePrice,
      quantity,
      designId,
      printImage,
    });
    message.success(`Đã thêm ${quantity} × ${product.name} (${selectedVariant.size}) vào giỏ hàng!`);
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

            {/* Chọn size */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 10 }}>
                Chọn size
                {availableSizes.length === 0 && product.variants.length > 0 && (
                  <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 8, fontSize: 12 }}>
                    (hiển thị tất cả màu)
                  </span>
                )}
              </label>
              {displaySizes.length === 0 ? (
                <p style={{ color: "#f87171", fontSize: 13 }}>Không còn hàng cho màu này.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {displaySizes.map((v) => {
                    const active = v.size === selectedSize;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedSize(v.size)}
                        style={{
                          minWidth: 52, height: 44, padding: "0 12px",
                          borderRadius: 10,
                          border: active ? "2px solid #0ea5e9" : "1.5px solid #e2e8f0",
                          background: active ? "#e0f2fe" : "#ffffff",
                          color: active ? "#0284c7" : "#334155",
                          fontWeight: active ? 700 : 500,
                          fontSize: 13, cursor: "pointer",
                          transition: "all 0.15s", fontFamily: "inherit",
                          boxShadow: active ? "0 0 0 1px #bae6fd" : "none",
                          position: "relative",
                        }}
                      >
                        {v.size}
                        {v.stockQty <= 5 && (
                          <span style={{
                            position: "absolute", top: -6, right: -6,
                            background: "#f97316", color: "#fff",
                            fontSize: 9, fontWeight: 800, borderRadius: 10,
                            padding: "1px 5px", lineHeight: 1.4,
                          }}>
                            {v.stockQty}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chọn số lượng */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 10 }}>
                Số lượng
                {selectedVariant && (
                  <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 8, fontSize: 12 }}>
                    (còn {selectedVariant.stockQty} trong kho
                    {inCartQty > 0 ? `, đã có ${inCartQty} trong giỏ` : ""})
                  </span>
                )}
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    width: 36, height: 36, border: "1.5px solid #e2e8f0",
                    borderRadius: "8px 0 0 8px", background: "#f8fafc",
                    cursor: quantity <= 1 ? "not-allowed" : "pointer",
                    fontSize: 18, color: quantity <= 1 ? "#cbd5e1" : "#475569",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  −
                </button>
                <div style={{
                  width: 52, height: 36, border: "1.5px solid #e2e8f0",
                  borderLeft: "none", borderRight: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#0f172a",
                }}>
                  {quantity}
                </div>
                <button
                  disabled={!selectedVariant || quantity >= maxAddable}
                  onClick={() => setQuantity((q) => Math.min(maxAddable, q + 1))}
                  style={{
                    width: 36, height: 36, border: "1.5px solid #e2e8f0",
                    borderRadius: "0 8px 8px 0", background: "#f8fafc",
                    cursor: (!selectedVariant || quantity >= maxAddable) ? "not-allowed" : "pointer",
                    fontSize: 18, color: (!selectedVariant || quantity >= maxAddable) ? "#cbd5e1" : "#475569",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  +
                </button>
              </div>
              {selectedVariant && maxAddable <= 0 && (
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "#f87171" }}>
                  Bạn đã thêm hết số lượng còn lại của size này vào giỏ.
                </p>
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
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Tổng cộng</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0ea5e9" }}>
                  {fmt(product.basePrice * quantity)}
                </p>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "right" }}>
                {fmt(product.basePrice)} × {quantity}
              </div>
            </div>

            {(() => {
              const canAdd = !!selectedSize && maxAddable > 0;
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
                  {!selectedSize
                    ? "Chọn size để tiếp tục"
                    : maxAddable <= 0
                    ? "Đã hết số lượng khả dụng"
                    : "Thêm vào giỏ hàng"}
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

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

function normalizeColor(c: string): string {
  const mapped = VI_TO_EN[c] || c;
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

/* ── Props của component ── */
interface Props {
  open: boolean;
  onClose: () => void;
  productId: number;
  shirtColor: string;
  designId?: number;
}

export default function AddToCartModal({ open, onClose, productId, shirtColor, designId }: Props) {
  const addItem = useCartStore((s) => s.addItem);

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

  /* Sizes có sẵn theo màu đang chọn */
  const availableSizes: PublicVariant[] = product
    ? product.variants
        .filter((v) => variantMatchesColor(v, shirtColor) && v.stockQty > 0)
        .sort((a, b) => {
          const ia = SIZE_ORDER.indexOf(a.size);
          const ib = SIZE_ORDER.indexOf(b.size);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        })
    : [];

  /* Fallback: nếu không có variant khớp màu → show tất cả */
  const displaySizes: PublicVariant[] =
    availableSizes.length > 0
      ? availableSizes
      : (product?.variants.filter((v) => v.stockQty > 0).sort((a, b) => {
          const ia = SIZE_ORDER.indexOf(a.size);
          const ib = SIZE_ORDER.indexOf(b.size);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        }) ?? []);

  const selectedVariant = displaySizes.find((v) => v.size === selectedSize) ?? null;

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      message.warning("Vui lòng chọn size");
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
      color: shirtColor,
      colorLabel: shirtColor,
      price: product.basePrice,
      quantity,
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
                <span style={{ fontSize: 13, color: "#64748b" }}>{shirtColor}</span>
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
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    width: 36, height: 36, border: "1.5px solid #e2e8f0",
                    borderRadius: "8px 0 0 8px", background: "#f8fafc",
                    cursor: "pointer", fontSize: 18, color: "#475569",
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
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  style={{
                    width: 36, height: 36, border: "1.5px solid #e2e8f0",
                    borderRadius: "0 8px 8px 0", background: "#f8fafc",
                    cursor: "pointer", fontSize: 18, color: "#475569",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  +
                </button>
              </div>
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

            <button
              onClick={handleAddToCart}
              disabled={adding || !selectedSize}
              style={{
                width: "100%", height: 48, borderRadius: 12,
                background: selectedSize
                  ? "linear-gradient(135deg, #0ea5e9, #0284c7)"
                  : "#e2e8f0",
                border: "none",
                color: selectedSize ? "#fff" : "#94a3b8",
                fontWeight: 700, fontSize: 15, cursor: selectedSize ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
                boxShadow: selectedSize ? "0 4px 16px rgba(14,165,233,0.3)" : "none",
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {selectedSize ? "Thêm vào giỏ hàng" : "Chọn size để tiếp tục"}
            </button>
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

"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Tag } from "antd";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  sku: string;
  stockQty: number;
}

export interface ProductImage {
  id: number;
  url: string;
  altText: string;
  isPrimary: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  category: string;
  material: string;
  form: "tshirt" | "polo" | "hoodie";
  madeIn: string;
  description: string;
  basePrice: number;
  variants: ProductVariant[];
  images: ProductImage[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
// Hỗ trợ cả tên tiếng Anh và tiếng Việt (theo dữ liệu thực tế trong DB)
const COLOR_HEX_MAP: Record<string, string> = {
  // Tiếng Anh
  White:           "#ffffff",
  Black:           "#1e293b",
  Navy:            "#1e3a8a",
  Red:             "#dc2626",
  "Light Blue":    "#7dd3fc",
  Gray:            "#94a3b8",
  "Dark Gray":     "#374151",
  Green:           "#16a34a",
  Yellow:          "#eab308",
  Pink:            "#f472b6",
  Orange:          "#f97316",
  Purple:          "#9333ea",
  Beige:           "#d6b89a",
  Khaki:           "#c5b28a",
  // Tiếng Việt (từ DB)
  "Trắng":         "#ffffff",
  "trắng":         "#ffffff",
  "Đen":           "#1e293b",
  "đen":           "#1e293b",
  "Đỏ":            "#dc2626",
  "Xám":           "#94a3b8",
  "Xanh navy":     "#1e3a8a",
  "Xanh dương":    "#3b82f6",
  "Xanh lá":       "#16a34a",
  "Xanh nhạt":     "#7dd3fc",
  "Vàng":          "#eab308",
  "Hồng":          "#f472b6",
  "Cam":           "#f97316",
  "Tím":           "#9333ea",
  "Be":            "#d6b89a",
  "Xám đậm":       "#374151",
  "Nâu":           "#92400e",
};

// Trả về tên hiển thị – nếu tên đã là tiếng Việt thì dùng luôn
const getColorLabel = (color: string): string => {
  const EN_TO_VI: Record<string, string> = {
    White: "Trắng", Black: "Đen", Navy: "Xanh Navy", Red: "Đỏ",
    "Light Blue": "Xanh nhạt", Gray: "Xám", "Dark Gray": "Xám đậm",
    Green: "Xanh lá", Yellow: "Vàng", Pink: "Hồng", Orange: "Cam",
    Purple: "Tím", Beige: "Be", Khaki: "Khaki",
  };
  return EN_TO_VI[color] ?? color; // nếu không có trong map thì dùng nguyên tên
};

/** @deprecated dùng getColorLabel() thay thế */
const COLOR_VI = { White: "Trắng", Black: "Đen", Navy: "Xanh Navy", Red: "Đỏ",
  "Light Blue": "Xanh nhạt", Gray: "Xám", "Dark Gray": "Xám đậm",
  Green: "Xanh lá", Yellow: "Vàng", Pink: "Hồng", Orange: "Cam",
  Purple: "Tím", Beige: "Be", Khaki: "Khaki" } as Record<string, string>;

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const FORM_LABEL: Record<string, string> = {
  tshirt: "Áo Thun", polo: "Áo Polo", hoodie: "Áo Hoodie",
};

const MOCKUP_MAP: Record<string, Record<string, { front?: string; back?: string }>> = {
  polo: {
    Navy:  { front: "/images/mockups/Polo-Navy-Front.png",  back: "/images/mockups/Polo-Navy-Backt.png" },
    Beige: { front: "/images/mockups/Polo-Beige-Front.png", back: "/images/mockups/Polo-Beige-Back.png" },
    White: { front: "/images/mockups/Polo-White-Front.png", back: "/images/mockups/Polo-White-Back.png" },
  },
  tshirt: {
    Black: { front: "/images/mockups/TShirt-Black-Front.png", back: "/images/mockups/TShirt-Black-Back.png" },
    Navy:  { front: "/images/mockups/TShirt-Navy-Front.png",  back: "/images/mockups/TShirt-Navy-Back.png" },
    White: { front: "/images/mockups/TShirt-White-Front.png", back: "/images/mockups/TShirt-White-Back.png" },
  },
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

// ─── SVG Silhouettes ──────────────────────────────────────────────────────────
function ShirtSVG({ form, fillColor }: { form: string; fillColor: string }) {
  const isLight = ["#ffffff", "#d6b89a", "#c5b28a", "#eab308", "#f472b6", "#7dd3fc"].includes(fillColor);
  const strokeColor = isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.4)";

  if (form === "hoodie") {
    return (
      <svg viewBox="0 0 200 220" width="100%" height="100%" fill="none">
        <path
          d="M36 40L8 88L48 100L48 196H152L152 100L192 88L164 40L132 58C120 84 80 84 68 58L36 40Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M68 58C68 58 72 28 100 24C128 28 132 58 132 58"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* pocket */}
        <path
          d="M70 148Q70 168 100 168Q130 168 130 148L130 132H70Z"
          fill={isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.15)"}
          stroke={strokeColor}
          strokeWidth="2"
        />
        {/* zipper */}
        <path d="M100 100v32" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" />
      </svg>
    );
  }

  if (form === "polo") {
    return (
      <svg viewBox="0 0 200 220" width="100%" height="100%" fill="none">
        <path
          d="M40 36L8 78L48 88L48 196H152L152 88L192 78L160 36L132 52L120 72H80L68 52L40 36Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* collar */}
        <path d="M80 72L100 92L120 72" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* button row */}
        <line x1="100" y1="92" x2="100" y2="140" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        {[106, 116, 126, 136].map(y => (
          <circle key={y} cx="100" cy={y} r="2.5" fill={strokeColor} />
        ))}
      </svg>
    );
  }

  // tshirt (default)
  return (
    <svg viewBox="0 0 200 220" width="100%" height="100%" fill="none">
      <path
        d="M40 36L8 80L48 90L48 196H152L152 90L192 80L160 36L124 52C116 64 84 64 76 52L40 36Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* collar */}
      <path d="M76 52C80 66 120 66 124 52" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      {/* print area dashed */}
      <rect x="76" y="104" width="48" height="52" rx="6"
        fill={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.18)"}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      <path d="M100 116v28M86 130h28" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────
interface Props {
  product: ProductDetail;
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive unique colors + sizes
  const uniqueColors = useMemo(
    () => Array.from(new Set(product.variants.map(v => v.color))),
    [product.variants]
  );

  // Pre-select color from URL query param (?color=Navy)
  const initialColor = useMemo(() => {
    const qColor = searchParams.get("color");
    if (qColor && uniqueColors.includes(qColor)) return qColor;
    return uniqueColors[0] ?? "";
  }, [searchParams, uniqueColors]);

  const [selectedColor, setSelectedColor] = useState(() => initialColor);
  const [selectedSize, setSelectedSize]   = useState("");
  const [previewTab, setPreviewTab]       = useState<"front" | "back">("front");
  const [activeTab, setActiveTab]         = useState<"detail" | "size">("detail");

  // Chỉ lấy size có trong màu đang chọn
  const sizesForColor = useMemo(() => {
    const available = product.variants
      .filter(v => v.color === selectedColor)
      .map(v => v.size);
    const unique = Array.from(new Set(available));
    return unique.sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a);
      const ib = SIZE_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [product.variants, selectedColor]);

  // Khi đổi màu → tự reset size về size đầu tiên có hàng của màu mới
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const firstAvailable = product.variants
      .filter(v => v.color === color && v.stockQty > 0)
      .sort((a, b) => {
        const ia = SIZE_ORDER.indexOf(a.size);
        const ib = SIZE_ORDER.indexOf(b.size);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })[0]?.size ?? "";
    setSelectedSize(firstAvailable);
  };

  const colorHex = COLOR_HEX_MAP[selectedColor] ?? "#94a3b8";
  const isLightColor = ["#ffffff", "#d6b89a", "#c5b28a", "#eab308", "#f472b6", "#7dd3fc"].includes(colorHex);

  // Stock of selected color+size combination
  const getStock = (color: string, size: string) =>
    product.variants.find(v => v.color === color && v.size === size)?.stockQty ?? 0;

  const totalStockForColor = product.variants
    .filter(v => v.color === selectedColor)
    .reduce((s, v) => s + v.stockQty, 0);

  const VI_TO_EN: Record<string, string> = {
    "Trắng": "White", "trắng": "White",
    "Đen": "Black", "đen": "Black",
    "Xám": "Gray", "xám": "Gray",
    "Xanh navy": "Navy",
    "Xanh dương": "Light Blue",
    "Xanh lá": "Green",
    "Vàng": "Yellow",
    "Hồng": "Pink",
    "Cam": "Orange",
    "Tím": "Purple",
    "Be": "Beige",
    "Khaki": "Khaki",
  };
  const englishColor = VI_TO_EN[selectedColor] || selectedColor;

  // Tìm ảnh từ DB theo altText (kiểm tra cả tiếng Anh và tiếng Việt)
  const expectedAltEn = `${englishColor}-${previewTab}`;
  const expectedAltVi = `${selectedColor}-${previewTab}`;
  let dbImage = product.images?.find((img) => img.altText === expectedAltEn || img.altText === expectedAltVi)?.url;

  // Mockup image: ưu tiên ảnh từ DB, nếu không có thì fallback về ảnh tĩnh
  const mockupUrl = dbImage || MOCKUP_MAP[product.form]?.[englishColor]?.[previewTab];
  const hasMockup = !!mockupUrl;

  // Check if Front/Back tabs are available
  const hasDbBack = !!product.images?.find((img) => img.altText === `${englishColor}-back` || img.altText === `${selectedColor}-back`);
  const hasBackView = hasDbBack || !!MOCKUP_MAP[product.form]?.[englishColor]?.back;

  const handleDesignNow = () => {
    const params = new URLSearchParams({
      shirt: product.form,
      color: selectedColor,
      view: previewTab,
    });
    router.push(`/design-studio?${params.toString()}`);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <div style={{ paddingTop: 64 }}>

        {/* ── Breadcrumb ── */}
        <div className="container-main" style={{ padding: "20px 24px 0" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8" }}>
            <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#0ea5e9")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
            >
              Trang chủ
            </Link>
            <span>›</span>
            <span style={{ color: "#475569" }}>Sản phẩm</span>
            <span>›</span>
            <span style={{ color: "#0f172a", fontWeight: 600 }}>{product.name}</span>
          </nav>
        </div>

        {/* ── Hero Section ── */}
        <div className="container-main" style={{ padding: "24px 24px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              alignItems: "start",
            }}
            className="product-detail-grid"
          >
            {/* ── LEFT: Preview ── */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: 24,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                overflow: "hidden",
                position: "sticky",
                top: 80,
              }}
            >
              {/* Tab Front/Back */}
              {(hasMockup || product.form !== "hoodie") && (
                <div
                  style={{
                    display: "flex",
                    borderBottom: "1px solid #f1f5f9",
                    background: "#f8fafc",
                  }}
                >
                  {(["front", "back"] as const).filter(tab => {
                    if (tab === "back") return hasBackView || !hasMockup;
                    return true;
                  }).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPreviewTab(tab)}
                      style={{
                        flex: 1,
                        padding: "12px 0",
                        background: "none",
                        border: "none",
                        borderBottom: previewTab === tab ? "2px solid #0ea5e9" : "2px solid transparent",
                        color: previewTab === tab ? "#0ea5e9" : "#94a3b8",
                        fontWeight: previewTab === tab ? 700 : 500,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {tab === "front" ? "Mặt trước" : "Mặt sau"}
                    </button>
                  ))}
                </div>
              )}

              {/* Preview area */}
              <div
                style={{
                  background: isLightColor
                    ? "linear-gradient(145deg, #f8fafc, #f1f5f9)"
                    : `linear-gradient(145deg, ${colorHex}22, ${colorHex}44)`,
                  minHeight: 420,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 56px",
                  position: "relative",
                  transition: "background 0.3s ease",
                }}
              >
                {/* Stock badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: totalStockForColor <= 10 ? "#fff7ed" : "#f0fdf4",
                    color: totalStockForColor <= 10 ? "#ea580c" : "#16a34a",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 20,
                    padding: "3px 10px",
                    border: `1px solid ${totalStockForColor <= 10 ? "#fed7aa" : "#bbf7d0"}`,
                  }}
                >
                  {totalStockForColor <= 0
                    ? "Hết hàng"
                    : totalStockForColor <= 10
                    ? `Còn ${totalStockForColor}`
                    : "Còn hàng"}
                </div>

                {/* Color name badge */}
                {selectedColor && (
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255,255,255,0.9)",
                      borderRadius: 20,
                      padding: "3px 10px 3px 6px",
                      border: "1px solid #e2e8f0",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: colorHex,
                        border: "1px solid rgba(0,0,0,0.12)",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>
                      {COLOR_VI[selectedColor] ?? selectedColor}
                    </span>
                  </div>
                )}

                {/* Actual image or SVG */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: 280,
                    filter: hasMockup
                      ? "drop-shadow(0 12px 32px rgba(0,0,0,0.18))"
                      : isLightColor
                      ? "drop-shadow(0 4px 12px rgba(0,0,0,0.12))"
                      : "drop-shadow(0 8px 24px rgba(0,0,0,0.22))",
                    transition: "all 0.3s ease",
                  }}
                >
                  {hasMockup ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mockupUrl}
                      alt={`${product.name} ${selectedColor} ${previewTab}`}
                      style={{ width: "100%", objectFit: "contain", display: "block", mixBlendMode: "multiply" }}
                      draggable={false}
                    />
                  ) : (
                    <ShirtSVG form={product.form} fillColor={colorHex} />
                  )}
                </div>
              </div>

              {/* Color quick-select at bottom of preview */}
              <div
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginRight: 4 }}>MÀU:</span>
                {uniqueColors.map(color => {
                  const hex = COLOR_HEX_MAP[color] ?? "#94a3b8";
                  const isSelected = color === selectedColor;
                  return (
                    <button
                      key={color}
                      title={COLOR_VI[color] ?? color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: hex,
                        border: isSelected ? `3px solid #0ea5e9` : "2px solid #e2e8f0",
                        cursor: "pointer",
                        transform: isSelected ? "scale(1.25)" : "scale(1)",
                        transition: "all 0.18s ease",
                        boxShadow: isSelected ? "0 0 0 2px white, 0 0 0 4px #0ea5e9" : "none",
                        padding: 0,
                        outline: "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT: Info + Controls ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Product header */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Tag
                    style={{
                      background: "#e0f2fe",
                      color: "#0284c7",
                      border: "none",
                      borderRadius: 20,
                      fontWeight: 700,
                      fontSize: 11,
                      padding: "2px 10px",
                    }}
                  >
                    {FORM_LABEL[product.form] ?? product.form}
                  </Tag>
                  {product.category && (
                    <Tag
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "none",
                        borderRadius: 20,
                        fontWeight: 500,
                        fontSize: 11,
                        padding: "2px 10px",
                      }}
                    >
                      {product.category}
                    </Tag>
                  )}
                </div>

                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: "0 0 8px",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.25,
                  }}
                >
                  {product.name}
                </h1>

                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: "#0ea5e9" }}>
                    {fmt(product.basePrice)}
                  </span>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>/ chiếc</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#f1f5f9" }} />

              {/* Color Selector */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Màu sắc</span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#0ea5e9",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: colorHex,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                    {COLOR_VI[selectedColor] ?? selectedColor}
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {uniqueColors.map(color => {
                    const hex = COLOR_HEX_MAP[color] ?? "#94a3b8";
                    const isSelected = color === selectedColor;
                    const totalStock = product.variants
                      .filter(v => v.color === color)
                      .reduce((s, v) => s + v.stockQty, 0);
                    const isOutOfStock = totalStock === 0;

                    return (
                      <button
                        key={color}
                        title={`${getColorLabel(color)}${isOutOfStock ? " – Hết hàng" : ""}`}
                        onClick={() => !isOutOfStock && handleColorChange(color)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: hex,
                          border: isSelected ? "3px solid #0ea5e9" : "2px solid #e2e8f0",
                          cursor: isOutOfStock ? "not-allowed" : "pointer",
                          transform: isSelected ? "scale(1.15)" : "scale(1)",
                          transition: "all 0.18s ease",
                          boxShadow: isSelected
                            ? "0 0 0 3px white, 0 0 0 5px #0ea5e9"
                            : "0 2px 4px rgba(0,0,0,0.1)",
                          opacity: isOutOfStock ? 0.35 : 1,
                          padding: 0,
                          outline: "none",
                          position: "relative",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Kích cỡ</span>
                  <button
                    onClick={() => setActiveTab("size")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#0ea5e9",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      padding: 0,
                    }}
                  >
                    Bảng size →
                  </button>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {sizesForColor.map(size => {
                    const stock = getStock(selectedColor, size);
                    const isOut = stock === 0;
                    const isActive = size === selectedSize;

                    return (
                      <button
                        key={size}
                        onClick={() => !isOut && setSelectedSize(size)}
                        title={isOut ? `${size} – Hết hàng` : undefined}
                        style={{
                          minWidth: 48,
                          height: 44,
                          padding: "0 12px",
                          borderRadius: 10,
                          border: isActive
                            ? "2px solid #0ea5e9"
                            : "1.5px solid #e2e8f0",
                          background: isActive
                            ? "#e0f2fe"
                            : isOut
                            ? "#f8fafc"
                            : "#ffffff",
                          color: isActive
                            ? "#0284c7"
                            : isOut
                            ? "#cbd5e1"
                            : "#334155",
                          fontWeight: isActive ? 700 : 500,
                          fontSize: 13,
                          cursor: isOut ? "not-allowed" : "pointer",
                          transition: "all 0.15s ease",
                          fontFamily: "inherit",
                          position: "relative",
                          textDecoration: isOut ? "line-through" : "none",
                          boxShadow: isActive ? "0 0 0 1px #bae6fd" : "none",
                        }}
                        onMouseEnter={e => {
                          if (!isOut && !isActive) {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "#bae6fd";
                            (e.currentTarget as HTMLButtonElement).style.background = "#f0f9ff";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isOut && !isActive) {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                            (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
                          }
                        }}
                      >
                        {size}
                        {stock > 0 && stock <= 5 && (
                          <span
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              background: "#f97316",
                              color: "white",
                              fontSize: 9,
                              fontWeight: 800,
                              borderRadius: 10,
                              padding: "1px 5px",
                              lineHeight: 1.4,
                            }}
                          >
                            {stock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedSize && (
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                    {(() => {
                      const stock = getStock(selectedColor, selectedSize);
                      if (stock === 0) return "Size này đã hết hàng";
                      if (stock <= 5) return `Chỉ còn ${stock} chiếc — đặt sớm!`;
                      return `Còn ${stock} chiếc trong kho`;
                    })()}
                  </p>
                )}
              </div>

              {/* Quick Info */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  { icon: "🧵", label: "Chất liệu", value: product.material || "Cotton 100%" },
                  { icon: "🌏", label: "Xuất xứ",   value: product.madeIn || "Việt Nam" },
                  { icon: "🎨", label: "In ấn",      value: "DTG / Silk Screen" },
                  { icon: "📦", label: "Giao hàng",  value: "5–7 ngày làm việc" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, margin: 0, marginTop: 2 }}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleDesignNow}
                  style={{
                    height: 52,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: "0 4px 16px rgba(14,165,233,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(14,165,233,0.45)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(14,165,233,0.35)";
                  }}
                >
                  Thiết kế ngay
                </Button>

                <Button
                  size="large"
                  style={{
                    height: 52,
                    borderRadius: 14,
                    border: "1.5px solid #e2e8f0",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#475569",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#bae6fd";
                    (e.currentTarget as HTMLButtonElement).style.color = "#0ea5e9";
                    (e.currentTarget as HTMLButtonElement).style.background = "#f0f9ff";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                    (e.currentTarget as HTMLButtonElement).style.color = "#475569";
                    (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
                  }}
                  onClick={() => router.push("/creator")}
                >
                  Đặt số lượng lớn
                </Button>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { icon: "🔄", text: "Đổi trả 7 ngày" },
                  { icon: "✅", text: "In đúng màu cam kết" },
                  { icon: "🚚", text: "Ship toàn quốc" },
                ].map(b => (
                  <div
                    key={b.text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    <span>{b.icon}</span>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Detail Tabs Section ── */}
        <div className="container-main" style={{ padding: "40px 24px 0" }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            {/* Tab headers */}
            <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9" }}>
              {(["detail", "size"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "16px 28px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === tab ? "2px solid #0ea5e9" : "2px solid transparent",
                    color: activeTab === tab ? "#0ea5e9" : "#64748b",
                    fontWeight: activeTab === tab ? 700 : 500,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {tab === "detail" ? "Thông tin chi tiết" : "Bảng size"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: "28px 32px" }}>
              {activeTab === "detail" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }} className="detail-tab-grid">
                  {/* Left: description */}
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                      Mô tả sản phẩm
                    </h3>
                    <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.75 }}>
                      {product.description ||
                        `${product.name} được làm từ ${product.material || "chất liệu cao cấp"}, thiết kế thoải mái phù hợp mọi vóc dáng. ` +
                        "Đây là sản phẩm lý tưởng để in ấn thiết kế cá nhân hoá hoặc đặt đồng phục số lượng lớn."}
                    </p>

                    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        "Chất liệu co giãn 4 chiều, thoáng khí",
                        "Không bong, không phai sau 50 lần giặt",
                        "Đường may chắc chắn, form dáng chuẩn",
                        "Phù hợp in DTG, Silk Screen, thêu",
                      ].map(f => (
                        <div key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: "#475569" }}>
                          <span style={{ color: "#10b981", fontWeight: 700, flexShrink: 0 }}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: specs */}
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                      Thông số kỹ thuật
                    </h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {[
                          ["Chất liệu",   product.material || "Cotton 100%"],
                          ["Loại áo",     FORM_LABEL[product.form] ?? product.form],
                          ["Xuất xứ",     product.madeIn || "Việt Nam"],
                          ["Số màu",      `${uniqueColors.length} màu`],
                          ["Số size",     `${sizesForColor.length} size`],
                          ["Phương pháp in", "DTG / Silk Screen / Thêu"],
                        ].map(([key, val], i) => (
                          <tr
                            key={key}
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              background: i % 2 === 0 ? "#f8fafc" : "#ffffff",
                            }}
                          >
                            <td style={{ padding: "10px 14px", fontSize: 13, color: "#94a3b8", fontWeight: 600, width: "45%" }}>
                              {key}
                            </td>
                            <td style={{ padding: "10px 14px", fontSize: 13, color: "#0f172a", fontWeight: 500 }}>
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Size guide table */
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    Bảng hướng dẫn chọn size
                  </h3>
                  <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
                    Đơn vị: cm. Đo ở trạng thái áo phẳng.
                  </p>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                      <thead>
                        <tr style={{ background: "#0ea5e9" }}>
                          {["Size", "Rộng ngực", "Dài áo", "Rộng vai", "Tay áo"].map(h => (
                            <th
                              key={h}
                              style={{
                                padding: "12px 16px",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: 13,
                                textAlign: "center",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["S",   "52", "70", "43", "20"],
                          ["M",   "55", "72", "45", "21"],
                          ["L",   "58", "74", "47", "22"],
                          ["XL",  "61", "76", "49", "23"],
                          ["XXL", "64", "78", "51", "24"],
                        ].map(([size, ...vals], i) => (
                          <tr
                            key={size}
                            style={{
                              background: size === selectedSize ? "#e0f2fe" : i % 2 === 0 ? "#f8fafc" : "#ffffff",
                              borderBottom: "1px solid #f1f5f9",
                              transition: "background 0.15s",
                            }}
                          >
                            <td
                              style={{
                                padding: "12px 16px",
                                textAlign: "center",
                                fontWeight: 700,
                                fontSize: 13,
                                color: size === selectedSize ? "#0ea5e9" : "#0f172a",
                              }}
                            >
                              {size}
                              {size === selectedSize && (
                                <span style={{ marginLeft: 4, fontSize: 10, color: "#0ea5e9" }}>◀ đang chọn</span>
                              )}
                            </td>
                            {vals.map((v, vi) => (
                              <td
                                key={vi}
                                style={{
                                  padding: "12px 16px",
                                  textAlign: "center",
                                  fontSize: 13,
                                  color: "#475569",
                                }}
                              >
                                {v}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>
                    💡 Gợi ý: Nếu số đo của bạn nằm giữa 2 size, hãy chọn size lớn hơn để thoải mái hơn.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom CTA Banner ── */}
        <div className="container-main" style={{ padding: "32px 24px 64px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              borderRadius: 20,
              padding: "36px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
            }}
            className="cta-banner"
          >
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
                Sẵn sàng bắt đầu thiết kế?
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>
                Công cụ thiết kế online – không cần cài phần mềm, có kết quả ngay.
              </p>
            </div>
            <Button
              size="large"
              onClick={handleDesignNow}
              style={{
                height: 48,
                padding: "0 28px",
                borderRadius: 12,
                background: "#ffffff",
                border: "none",
                color: "#0ea5e9",
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                flexShrink: 0,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
              }}
            >
              🎨 Thiết kế ngay
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .detail-tab-grid {
            grid-template-columns: 1fr !important;
          }
          .cta-banner {
            flex-direction: column !important;
            text-align: center !important;
            padding: 28px 24px !important;
          }
        }
      `}</style>
    </main>
  );
}

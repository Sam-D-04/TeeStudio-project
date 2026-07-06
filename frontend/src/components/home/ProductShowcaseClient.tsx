"use client";

import { useState } from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { ProductShowcaseItemFromDB } from "./ProductShowcase";

/* ─── Màu hex chuẩn map từ tên màu trong DB ─────────────────────────────── */
const COLOR_HEX_MAP: Record<string, string> = {
  // Áo thun
  White:        "#ffffff",
  Black:        "#1e293b",
  Navy:         "#1e3a8a",
  Red:          "#dc2626",
  "Light Blue": "#7dd3fc",
  Gray:         "#94a3b8",
  Green:        "#16a34a",
  Yellow:       "#eab308",
  Pink:         "#f472b6",
  Orange:       "#f97316",
  Purple:       "#9333ea",
  // Polo
  Beige:        "#d6b89a",
  // Hoodie
  "Dark Gray":  "#374151",
  Khaki:        "#c5b28a",
};

function getHex(colorName: string): string {
  return COLOR_HEX_MAP[colorName] ?? "#94a3b8";
}

/* ─── Mini SVG shirt silhouette ─────────────────────────────────────────── */
function ShirtSilhouette({
  form,
  fillColor,
}: {
  form: "tshirt" | "polo" | "hoodie";
  fillColor: string;
}) {
  const paths = {
    tshirt:  "M20 18L4 40L24 45L24 90H76L76 45L96 40L80 18L62 26C58 30 42 30 38 26L20 18Z",
    polo:    "M20 18L4 40L24 45L24 90H76L76 45L96 40L80 18L66 26L60 36H40L34 26L20 18Z",
    hoodie:  "M18 20L2 44L24 50L24 90H76L76 50L98 44L82 20L66 30C60 42 40 42 34 30L18 20Z",
  };
  const collars = {
    tshirt:  "M38 26C40 32 60 32 62 26",
    polo:    "M40 36L50 46L60 36",
    hoodie:  "M34 30C34 24 50 22 50 22C50 22 66 24 66 30",
  };

  // Contrast: nếu nền trắng/sáng thì dùng stroke tối
  const hex = fillColor.toLowerCase();
  const isLight = hex === "#ffffff" || hex === "#d6b89a" || hex === "#c5b28a" || hex === "#eab308";
  const strokeColor = isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)";
  const borderColor = isLight ? "#e2e8f0" : "transparent";

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      style={{
        display: "block",
        filter: isLight ? "none" : "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
        border: isLight ? `1px solid ${borderColor}` : "none",
        borderRadius: 4,
      }}
    >
      <path d={paths[form]} fill={fillColor} />
      <path
        d={collars[form]}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Filter tabs ────────────────────────────────────────────────────────── */
const FORM_LABEL: Record<string, string> = {
  all:    "Tất cả",
  tshirt: "Áo Thun",
  polo:   "Áo Polo",
  hoodie: "Áo Hoodie",
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

/* ─── Client Component ──────────────────────────────────────────────────── */
interface Props {
  products: ProductShowcaseItemFromDB[];
}

export default function ProductShowcaseClient({ products }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();

  const filters = [
    "all",
    ...Array.from(new Set(products.map((v) => v.form))),
  ];

  const filtered = products.filter(
    (v) => activeFilter === "all" || v.form === activeFilter
  );

  if (products.length === 0) return null;

  return (
    <section className="section-padding" style={{ background: "#f8fafc" }}>
      <div className="container-main">

        {/* ── Section Header ── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "baseline",
            justifyContent: "space-between",
            marginBottom:   24,
            flexWrap:       "wrap",
            gap:            12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize:      22,
                fontWeight:    800,
                color:         "#0f172a",
                margin:        0,
                letterSpacing: "-0.3px",
              }}
            >
              Sản phẩm nổi bật
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>
              Các sản phẩm được yêu thích nhất đang có sẵn trong kho — thiết kế và đặt hàng ngay.
            </p>
          </div>
          <Button
            type="text"
            style={{ color: "#0ea5e9", fontWeight: 600, fontSize: 13, padding: "0 4px", height: "auto" }}
          >
            Xem tất cả →
          </Button>
        </div>

        {/* ── Filter Tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding:      "6px 16px",
                borderRadius: 20,
                border:       activeFilter === f ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                background:   activeFilter === f ? "#e0f2fe" : "#ffffff",
                color:        activeFilter === f ? "#0284c7" : "#64748b",
                fontSize:     13,
                fontWeight:   activeFilter === f ? 700 : 500,
                cursor:       "pointer",
                transition:   "all 0.15s",
                fontFamily:   "inherit",
              }}
            >
              {FORM_LABEL[f] ?? f}
            </button>
          ))}
        </div>

        {/* ── Color Variant Grid ── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap:                 16,
          }}
          className="template-grid"
        >
          {filtered.map((v, idx) => {
            const colorList = v.colors ? v.colors.split(",") : [];
            const firstColor = colorList[0] || "White";
            const hex = getHex(firstColor);
            const isLight = ["#ffffff", "#d6b89a", "#c5b28a", "#eab308"].includes(hex);

            return (
              <div
                key={v.productId}
                onClick={() =>
                  router.push(`/product/${v.productId}`)
                }
                style={{
                  background:   "#ffffff",
                  borderRadius: 16,
                  border:       "1px solid #e2e8f0",
                  overflow:     "hidden",
                  transition:   "all 0.22s ease",
                  cursor:       "pointer",
                  boxShadow:    "0 1px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform   = "translateY(-4px)";
                  el.style.boxShadow   = "0 12px 32px rgba(0,0,0,0.09)";
                  el.style.borderColor = "#bae6fd";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform   = "translateY(0)";
                  el.style.boxShadow   = "0 1px 4px rgba(0,0,0,0.05)";
                  el.style.borderColor = "#e2e8f0";
                }}
              >
                {/* ─ Preview area ─ */}
                <div
                  style={{
                    background:     isLight
                      ? "linear-gradient(145deg, #f8fafc, #f1f5f9)"
                      : `linear-gradient(145deg, ${hex}33, ${hex}66)`,
                    height:         168,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    padding:        "20px 32px",
                    position:       "relative",
                  }}
                >
                  {/* Tồn kho badge */}
                  <span
                    style={{
                      position:     "absolute",
                      top:          10,
                      right:        10,
                      background:   v.totalStock <= 10 ? "#fff7ed" : "#f0fdf4",
                      color:        v.totalStock <= 10 ? "#ea580c" : "#16a34a",
                      fontSize:     10,
                      fontWeight:   700,
                      borderRadius: 20,
                      padding:      "2px 8px",
                    }}
                  >
                    {v.totalStock <= 10 ? `Còn ${v.totalStock}` : "Còn hàng"}
                  </span>

                  <div style={{ width: v.imageUrl ? "100%" : 90, height: v.imageUrl ? "100%" : "auto" }}>
                    {v.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={v.imageUrl}
                        alt={v.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          mixBlendMode: "multiply",
                          borderRadius: 8,
                        }}
                        draggable={false}
                      />
                    ) : v.form === "polo" ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={
                          firstColor === "Navy"
                            ? "/images/mockups/Polo-Navy-Front.png"
                            : firstColor === "Beige"
                            ? "/images/mockups/Polo-Beige-Front.png"
                            : "/images/mockups/Polo-White-Front.png"
                        }
                        alt={`${v.productName} ${firstColor}`}
                        style={{ width: "100%", objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}
                        draggable={false}
                      />
                    ) : (
                      <ShirtSilhouette form={v.form} fillColor={hex} />
                    )}
                  </div>
                </div>

                {/* ─ Info area ─ */}
                <div style={{ padding: "14px 16px" }}>
                  {/* Tên sản phẩm */}
                  <p
                    style={{
                      fontSize:     13,
                      fontWeight:   600,
                      color:        "#0f172a",
                      margin:       "0 0 6px",
                      whiteSpace:   "nowrap",
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {v.productName}
                  </p>

                  {/* Dot màu + tên màu tiếng Việt */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
                    {colorList.slice(0, 5).map((col) => (
                      <span
                        key={col}
                        title={col}
                        style={{
                          display:      "inline-block",
                          width:        12,
                          height:       12,
                          borderRadius: "50%",
                          background:   getHex(col),
                          border:       "1px solid #e2e8f0",
                          flexShrink:   0,
                        }}
                      />
                    ))}
                    {colorList.length > 5 && (
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginLeft: 2 }}>
                        +{colorList.length - 5}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      gap:            8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0ea5e9" }}>
                      {fmt(v.basePrice)}
                    </span>
                    <Button
                      size="small"
                      type="primary"
                      style={{
                        background:   "#0ea5e9",
                        border:       "none",
                        borderRadius: 6,
                        fontWeight:   600,
                        fontSize:     12,
                        height:       28,
                        padding:      "0 12px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/design-studio?shirt=${v.form}&color=${encodeURIComponent(firstColor)}&view=front`
                        );
                      }}
                    >
                      Thiết kế
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .template-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px)  { .template-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}

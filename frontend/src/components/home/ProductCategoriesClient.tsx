"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { ProductFromDB, SHIRT_UI_MAP } from "./ProductCategories";

type RouterInstance = ReturnType<typeof useRouter>;

/* ─────────────────────────────────────────
   SVG Vectors cho từng loại áo
───────────────────────────────────────── */

function TshirtVector({ color = "#bae6fd" }: { color?: string }) {
  return (
    <svg viewBox="0 0 160 170" fill="none" width="100%" style={{ maxHeight: 160 }}>
      {/* Body */}
      <path
        d="M32 34L8 70L38 77L38 148H122L122 77L152 70L128 34L102 46C95 53 65 53 58 46L32 34Z"
        fill={color}
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Collar */}
      <path
        d="M58 46C62 56 98 56 102 46"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Print area (dashed rect) */}
      <rect x="57" y="80" width="46" height="46" rx="5"
        fill="white" fillOpacity="0.4"
        stroke="white" strokeWidth="1.5" strokeDasharray="5 3"
      />
      {/* Plus icon in print area */}
      <path d="M80 94v18M71 103h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HoodieVector({ color = "#c7d2fe" }: { color?: string }) {
  return (
    <svg viewBox="0 0 160 175" fill="none" width="100%" style={{ maxHeight: 160 }}>
      {/* Body */}
      <path
        d="M28 38L4 74L36 82L36 154H124L124 82L156 74L132 38L108 48C102 66 58 66 52 48L28 38Z"
        fill={color}
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Hood */}
      <path
        d="M52 48C52 48 56 28 80 26C104 28 108 48 108 48"
        fill={color}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Front pocket */}
      <path
        d="M56 118Q56 130 80 130Q104 130 104 118L104 108H56Z"
        fill="white" fillOpacity="0.3"
        stroke="white" strokeWidth="1.5"
      />
      {/* Zipper line */}
      <path d="M80 82v26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
      {/* Print area */}
      <rect x="58" y="84" width="44" height="24" rx="4"
        fill="white" fillOpacity="0.35"
        stroke="white" strokeWidth="1.5" strokeDasharray="5 3"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Client Component
───────────────────────────────────────── */

const fmt = (n: any) =>
  "từ " + Number(n).toLocaleString("vi-VN") + "đ";

interface Props {
  products: ProductFromDB[];
}

export default function ProductCategoriesClient({ products }: Props) {
  const router = useRouter();

  return (
    <section style={{ background: "#ffffff", paddingTop: 80 }}>
      <div className="container-main" style={{ padding: "40px 24px 56px" }}>

        {/* ── Header Row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: 4,
                letterSpacing: "-0.5px",
              }}
            >
              Tạo thiết kế mới
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
              Chọn loại áo để bắt đầu — công cụ thiết kế trực tuyến, không cần phần mềm.
            </p>
          </div>
          <Button
            type="text"
            style={{
              color: "#0ea5e9",
              fontWeight: 600,
              fontSize: 14,
              padding: "0 4px",
              height: "auto",
            }}
          >
            Xem tất cả →
          </Button>
        </div>

        {/* ── Category Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
          className="category-grid"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} router={router} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .category-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 480px) and (max-width: 768px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   Product Card – ảnh to hơn + xoay vòng ảnh
   màu khác sau 3s hover (chỉ khi có >1 màu)
───────────────────────────────────────── */

const IMAGE_CYCLE_MS = 2000;

function ProductCard({ product, router }: { product: ProductFromDB; router: RouterInstance }) {
  const ui = SHIRT_UI_MAP[product.form];
  const images = product.images && product.images.length > 0
    ? product.images
    : product.imageUrl ? [product.imageUrl] : [];

  const [imgIndex, setImgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCycle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setImgIndex(0);
  };

  const startCycle = () => {
    if (images.length <= 1 || intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setImgIndex((i) => (i + 1) % images.length);
    }, IMAGE_CYCLE_MS);
  };

  // Dọn interval nếu component unmount trong lúc đang hover
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const currentImage = images[imgIndex] ?? product.imageUrl;

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      style={{
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-6px)";
        el.style.boxShadow = "var(--shadow-hover)";
        el.style.borderColor = ui.accentColor + "40";
        startCycle();
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "var(--shadow-sm)";
        el.style.borderColor = "#e2e8f0";
        stopCycle();
      }}
    >
      {/* ─ Visual area ─ */}
      <div
        style={{
          background: ui.accentBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px 24px 20px",
          minHeight: 240,
          position: "relative",
        }}
      >
        {/* Vector shirt or real mockup */}
        <div style={{ width: currentImage ? "100%" : (ui.mockupImg ? "70%" : "80%"), maxWidth: currentImage ? 210 : (ui.mockupImg ? 175 : 150), animation: "float 3.5s ease-in-out infinite" }}>
          {currentImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={currentImage}
              alt={product.name}
              style={{ width: "100%", height: 210, objectFit: "contain", display: "block", mixBlendMode: "multiply", filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.18))" }}
              draggable={false}
            />
          ) : ui.mockupImg ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={ui.mockupImg}
              alt={product.name}
              style={{ width: "100%", objectFit: "contain", display: "block", filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.18))" }}
              draggable={false}
            />
          ) : product.form === "hoodie" ? (
            <HoodieVector color={ui.svgColor} />
          ) : (
            <TshirtVector color={ui.svgColor} />
          )}
        </div>
      </div>

      {/* ─ Info area ─ */}
      <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
          }}
        >
          {product.name}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            margin: "4px 0 16px",
            lineHeight: 1.5,
          }}
        >
          {product.material}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: ui.accentColor,
            }}
          >
            {fmt(product.basePrice)}
          </span>

          <div style={{ display: "flex", gap: 6 }}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/product/${product.id}`);
              }}
              style={{
                border: `1px solid ${ui.accentColor}40`,
                borderRadius: 8,
                fontWeight: 600,
                height: 36,
                fontSize: 12,
                padding: "0 12px",
                color: ui.accentColor,
                background: "#ffffff",
              }}
            >
              Xem chi tiết
            </Button>
            <Button
              type="primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/design-studio?shirt=${product.form}`);
              }}
              style={{
                background: ui.accentColor,
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                height: 36,
                fontSize: 12,
                padding: "0 12px",
              }}
            >
              Thiết kế
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "antd";

/* ─── Filter tabs ─── */
const filters = [
  { key: "all",     label: "Tất cả" },
  { key: "tshirt",  label: "Áo Thun" },
  { key: "polo",    label: "Áo Polo" },
  { key: "hoodie",  label: "Áo Hoodie" },
  { key: "hot",     label: "🔥 Hot" },
];

/* ─── Mini SVG previews ─── */
function TemplatePreview({
  bg,
  textLine1,
  textLine2,
  shapeColor,
  type,
}: {
  bg: string;
  textLine1?: string;
  textLine2?: string;
  shapeColor: string;
  type: "tshirt" | "polo" | "hoodie";
}) {
  // Simple shirt silhouettes per type
  const paths: Record<string, string> = {
    tshirt:
      "M20 18L4 40L24 45L24 90H76L76 45L96 40L80 18L62 26C58 30 42 30 38 26L20 18Z",
    polo:
      "M20 18L4 40L24 45L24 90H76L76 45L96 40L80 18L66 26L60 36H40L34 26L20 18Z",
    hoodie:
      "M18 20L2 44L24 50L24 90H76L76 50L98 44L82 20L66 30C60 42 40 42 34 30L18 20Z",
  };
  const collar: Record<string, string> = {
    tshirt: "M38 26C40 32 60 32 62 26",
    polo:   "M40 36L50 46L60 36",
    hoodie: "M34 30C34 24 50 22 50 22C50 22 66 24 66 30",
  };

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block" }}>
      {/* Shirt body */}
      <path d={paths[type]} fill={shapeColor} />
      <path d={collar[type]} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Overlay print content */}
      {textLine1 && (
        <text
          x="50" y="62"
          textAnchor="middle"
          fill="white"
          fontSize="7"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
          style={{ userSelect: "none" }}
        >
          {textLine1}
        </text>
      )}
      {textLine2 && (
        <text
          x="50" y="72"
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="5"
          fontFamily="Inter, sans-serif"
          style={{ userSelect: "none" }}
        >
          {textLine2}
        </text>
      )}
    </svg>
  );
}

/* ─── Template data ─── */
const templates = [
  {
    id: 1, category: "tshirt", hot: true,
    name: "Team Minimal",
    price: 145000,
    bg: "linear-gradient(145deg, #dbeafe, #bfdbfe)",
    shapeColor: "#3b82f6",
    textLine1: "TEAM 2025", textLine2: "Est. since forever",
    type: "tshirt" as const,
  },
  {
    id: 2, category: "tshirt", hot: true,
    name: "Shark Tank Collab",
    price: 145000,
    bg: "linear-gradient(145deg, #fce7f3, #fbcfe8)",
    shapeColor: "#ec4899",
    textLine1: "SHARK TANK", textLine2: "Season 7",
    type: "tshirt" as const,
  },
  {
    id: 3, category: "polo", hot: false,
    name: "Corporate Classic",
    price: 225000,
    bg: "linear-gradient(145deg, #d1fae5, #a7f3d0)",
    shapeColor: "#059669",
    textLine1: "TeeStudio", textLine2: "Business",
    type: "polo" as const,
  },
  {
    id: 4, category: "hoodie", hot: true,
    name: "Street Drop",
    price: 385000,
    bg: "linear-gradient(145deg, #ede9fe, #ddd6fe)",
    shapeColor: "#7c3aed",
    textLine1: "STREET", textLine2: "CULTURE 24",
    type: "hoodie" as const,
  },
  {
    id: 5, category: "tshirt", hot: false,
    name: "Vintage Club",
    price: 145000,
    bg: "linear-gradient(145deg, #fef3c7, #fde68a)",
    shapeColor: "#d97706",
    textLine1: "VINTAGE", textLine2: "Club 1990",
    type: "tshirt" as const,
  },
  {
    id: 6, category: "polo", hot: true,
    name: "University Edition",
    price: 225000,
    bg: "linear-gradient(145deg, #e0f2fe, #bae6fd)",
    shapeColor: "#0284c7",
    textLine1: "UNIVERSITY", textLine2: "2025 Batch",
    type: "polo" as const,
  },
  {
    id: 7, category: "hoodie", hot: false,
    name: "Monochrome Lab",
    price: 385000,
    bg: "linear-gradient(145deg, #f1f5f9, #e2e8f0)",
    shapeColor: "#475569",
    textLine1: "MONOCHROME", textLine2: "Lab Series",
    type: "hoodie" as const,
  },
  {
    id: 8, category: "tshirt", hot: false,
    name: "Graphic Burst",
    price: 165000,
    bg: "linear-gradient(145deg, #ffedd5, #fed7aa)",
    shapeColor: "#ea580c",
    textLine1: "GRAPHIC", textLine2: "Burst™",
    type: "tshirt" as const,
  },
];

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function TemplateShowcase() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = templates.filter((t) => {
    if (activeFilter === "all")  return true;
    if (activeFilter === "hot")  return t.hot;
    return t.category === activeFilter;
  });

  return (
    <section
      className="section-padding"
      style={{ background: "#f8fafc" }}
    >
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
              Mẫu thiết kế
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>
              Chọn mẫu và tuỳ chỉnh theo ý bạn — hoàn toàn miễn phí.
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
        <div
          style={{
            display:      "flex",
            gap:          6,
            marginBottom: 28,
            flexWrap:     "wrap",
          }}
        >
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding:      "6px 16px",
                borderRadius: 20,
                border:       activeFilter === f.key ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                background:   activeFilter === f.key ? "#e0f2fe" : "#ffffff",
                color:        activeFilter === f.key ? "#0284c7" : "#64748b",
                fontSize:     13,
                fontWeight:   activeFilter === f.key ? 700 : 500,
                cursor:       "pointer",
                transition:   "all 0.15s",
                fontFamily:   "inherit",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Template Grid ── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap:                 16,
          }}
          className="template-grid"
        >
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
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
              {/* Preview area */}
              <div
                style={{
                  background: tpl.bg,
                  height:     168,
                  display:    "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding:    "20px 32px",
                  position:   "relative",
                }}
              >
                {tpl.hot && (
                  <span
                    style={{
                      position:     "absolute",
                      top:          10,
                      right:        10,
                      background:   "#fff7ed",
                      color:        "#ea580c",
                      fontSize:     10,
                      fontWeight:   700,
                      borderRadius: 20,
                      padding:      "2px 8px",
                    }}
                  >
                    HOT
                  </span>
                )}
                <div style={{ width: 90 }}>
                  <TemplatePreview
                    bg={tpl.bg}
                    textLine1={tpl.textLine1}
                    textLine2={tpl.textLine2}
                    shapeColor={tpl.shapeColor}
                    type={tpl.type}
                  />
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "14px 16px" }}>
                <p
                  style={{
                    fontSize:   13,
                    fontWeight: 600,
                    color:      "#0f172a",
                    margin:     "0 0 10px",
                    whiteSpace: "nowrap",
                    overflow:   "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {tpl.name}
                </p>

                <div
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    gap:            8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0ea5e9" }}>
                    {fmt(tpl.price)}
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
                  >
                    Thiết kế
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .template-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px)  { .template-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}

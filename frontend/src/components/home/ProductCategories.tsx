"use client";

import { Button } from "antd";

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

function PoloVector({ color = "#a5f3fc" }: { color?: string }) {
  return (
    <svg viewBox="0 0 160 170" fill="none" width="100%" style={{ maxHeight: 160 }}>
      {/* Body */}
      <path
        d="M32 34L8 70L38 77L38 148H122L122 77L152 70L128 34L106 44L98 60H62L54 44L32 34Z"
        fill={color}
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Collar V-shape */}
      <path d="M62 60L80 80L98 60" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Button strip */}
      <path d="M80 80v20" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="86" r="2" fill="white" />
      <circle cx="80" cy="93" r="2" fill="white" />
      <circle cx="80" cy="100" r="2" fill="white" />
      {/* Print area */}
      <rect x="57" y="106" width="46" height="30" rx="5"
        fill="white" fillOpacity="0.4"
        stroke="white" strokeWidth="1.5" strokeDasharray="5 3"
      />
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
   Danh sách danh mục
───────────────────────────────────────── */

const categories = [
  {
    id:          "tshirt",
    label:       "Áo Thun",
    sublabel:    "Cotton 100% • In offset & DTG",
    priceFrom:   "từ 145,000đ",
    accentBg:    "linear-gradient(140deg, #e0f2fe 0%, #bae6fd 100%)",
    accentColor: "#0ea5e9",
    svgColor:    "#7dd3fc",
    vector:      TshirtVector,
    badge:       "Bán chạy",
    badgeBg:     "#dcfce7",
    badgeColor:  "#16a34a",
  },
  {
    id:          "polo",
    label:       "Áo Polo",
    sublabel:    "Vải cá sấu • Phù hợp đồng phục",
    priceFrom:   "từ 225,000đ",
    accentBg:    "linear-gradient(140deg, #cffafe 0%, #a5f3fc 100%)",
    accentColor: "#0891b2",
    svgColor:    "#67e8f9",
    vector:      PoloVector,
    badge:       "Đồng phục",
    badgeBg:     "#e0f2fe",
    badgeColor:  "#0284c7",
  },
  {
    id:          "hoodie",
    label:       "Áo Hoodie",
    sublabel:    "Nỉ dày • Form oversize unisex",
    priceFrom:   "từ 385,000đ",
    accentBg:    "linear-gradient(140deg, #ede9fe 0%, #c7d2fe 100%)",
    accentColor: "#6366f1",
    svgColor:    "#a5b4fc",
    vector:      HoodieVector,
    badge:       "Mới về",
    badgeBg:     "#fef9c3",
    badgeColor:  "#ca8a04",
  },
];

export default function ProductCategories() {
  return (
    <section style={{ background: "#ffffff", paddingTop: 80 }}>
      <div className="container-main" style={{ padding: "40px 24px 56px" }}>

        {/* ── Header Row ── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "baseline",
            justifyContent: "space-between",
            marginBottom:   32,
            flexWrap:       "wrap",
            gap:            12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize:      28,
                fontWeight:    800,
                color:         "#0f172a",
                marginBottom:  4,
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
              color:       "#0ea5e9",
              fontWeight:  600,
              fontSize:    14,
              padding:     "0 4px",
              height:      "auto",
            }}
          >
            Xem tất cả →
          </Button>
        </div>

        {/* ── Category Cards ── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap:                 20,
          }}
          className="category-grid"
        >
          {categories.map((cat) => {
            const VectorComp = cat.vector;
            return (
              <div
                key={cat.id}
                style={{
                  background:   "#ffffff",
                  borderRadius: 20,
                  border:       "1px solid #e2e8f0",
                  overflow:     "hidden",
                  cursor:       "pointer",
                  transition:   "all 0.25s ease",
                  boxShadow:    "var(--shadow-sm)",
                  display:      "flex",
                  flexDirection:"column",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform   = "translateY(-6px)";
                  el.style.boxShadow   = "var(--shadow-hover)";
                  el.style.borderColor = cat.accentColor + "40";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform   = "translateY(0)";
                  el.style.boxShadow   = "var(--shadow-sm)";
                  el.style.borderColor = "#e2e8f0";
                }}
              >
                {/* ─ Visual area ─ */}
                <div
                  style={{
                    background:     cat.accentBg,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    padding:        "32px 24px 16px",
                    minHeight:      196,
                    position:       "relative",
                  }}
                >
                  {/* Badge */}
                  <span
                    style={{
                      position:     "absolute",
                      top:          14,
                      left:         14,
                      background:   cat.badgeBg,
                      color:        cat.badgeColor,
                      fontSize:     11,
                      fontWeight:   700,
                      borderRadius: 20,
                      padding:      "3px 10px",
                      letterSpacing:"0.3px",
                    }}
                  >
                    {cat.badge}
                  </span>

                  {/* Vector shirt */}
                  <div style={{ width: "80%", maxWidth: 130, animation: "float 3.5s ease-in-out infinite" }}>
                    <VectorComp color={cat.svgColor} />
                  </div>
                </div>

                {/* ─ Info area ─ */}
                <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3
                    style={{
                      fontSize:   18,
                      fontWeight: 700,
                      color:      "#0f172a",
                      margin:     0,
                    }}
                  >
                    {cat.label}
                  </h3>
                  <p
                    style={{
                      fontSize:    13,
                      color:       "#94a3b8",
                      margin:      "4px 0 16px",
                      lineHeight:  1.5,
                    }}
                  >
                    {cat.sublabel}
                  </p>

                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      marginTop:      "auto",
                    }}
                  >
                    <span
                      style={{
                        fontSize:   14,
                        fontWeight: 700,
                        color:      cat.accentColor,
                      }}
                    >
                      {cat.priceFrom}
                    </span>

                    <Button
                      type="primary"
                      style={{
                        background:   cat.accentColor,
                        border:       "none",
                        borderRadius: 8,
                        fontWeight:   600,
                        height:       36,
                        fontSize:     13,
                        padding:      "0 16px",
                      }}
                    >
                      Thiết kế ngay
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
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

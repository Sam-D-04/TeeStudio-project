"use client";

import React from "react";


const steps = [
  {
    step: 1,
    label: "Chọn sản phẩm",
    desc:  "Chọn loại áo và màu nền phù hợp với phong cách của bạn.",
    color: "#0ea5e9",
    lightBg: "#e0f2fe",
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72" fill="none">
        {/* Shop bag */}
        <rect x="16" y="30" width="48" height="36" rx="6" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="2" />
        <path d="M28 30V26a12 12 0 0124 0v4" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
        {/* Checkmark */}
        <circle cx="40" cy="50" r="10" fill="#0ea5e9" />
        <path d="M35 50l3.5 3.5L46 45" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: 2,
    label: "Tự do thiết kế",
    desc:  "Thêm hình, chữ, sticker — không cần phần mềm chuyên nghiệp.",
    color: "#6366f1",
    lightBg: "#ede9fe",
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72" fill="none">
        {/* Canvas */}
        <rect x="12" y="18" width="44" height="44" rx="6" fill="#ddd6fe" stroke="#6366f1" strokeWidth="2" />
        {/* Pencil */}
        <path d="M52 10l10 10-28 28H24V38L52 10z" fill="#6366f1" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 48l-4 4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
        <rect x="48" y="14" width="6" height="6" rx="1" transform="rotate(45 48 14)" fill="#c4b5fd" />
      </svg>
    ),
  },
  {
    step: 3,
    label: "Giao hàng tận nơi",
    desc:  "Đặt hàng và nhận áo tại địa chỉ của bạn trong 5–7 ngày.",
    color: "#10b981",
    lightBg: "#d1fae5",
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72" fill="none">
        {/* Box */}
        <rect x="20" y="32" width="34" height="30" rx="4" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
        <path d="M20 40h34M37 40v22" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 32l17-14 17 14" fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
        {/* Speed lines */}
        <path d="M10 36h8M8 42h6M10 48h8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      </svg>
    ),
  },
];

export default function SimpleWorkflow() {
  return (
    <section
      style={{ background: "#ffffff", padding: "48px 0" }}
    >
      <div className="container-main">

        {/* ── Strip container ── */}
        <div
          style={{
            background:   "#f8fafc",
            borderRadius: 20,
            border:       "1px solid #e2e8f0",
            padding:      "40px 48px",
            display:      "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr",
            alignItems:   "center",
            gap:          0,
          }}
          className="workflow-strip"
        >
          {steps.map((step, i) => (
            <React.Fragment key={step.step}>
              {/* ─ Step ─ */}
              <div
                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width:          88,
                    height:         88,
                    borderRadius:   "50%",
                    background:     step.lightBg,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    border:         `2px solid ${step.color}30`,
                    marginBottom:   4,
                  }}
                >
                  {step.svg}
                </div>

                {/* Step number badge */}
                <span
                  style={{
                    display:      "inline-flex",
                    alignItems:   "center",
                    justifyContent:"center",
                    width:         22,
                    height:        22,
                    borderRadius: "50%",
                    background:   step.color,
                    color:        "white",
                    fontSize:     11,
                    fontWeight:   800,
                  }}
                >
                  {step.step}
                </span>

                <h3
                  style={{
                    fontSize:   15,
                    fontWeight: 700,
                    color:      "#0f172a",
                    margin:     0,
                  }}
                >
                  {step.label}
                </h3>

                <p
                  style={{
                    fontSize:  13,
                    color:     "#64748b",
                    margin:    0,
                    maxWidth:  180,
                    lineHeight:1.6,
                  }}
                >
                  {step.desc}
                </p>
              </div>

              {/* ─ Arrow connector ─ */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    padding:        "0 16px",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M8 16h16M20 10l6 6-6 6"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .workflow-strip {
            grid-template-columns: 1fr !important;
            padding: 28px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}

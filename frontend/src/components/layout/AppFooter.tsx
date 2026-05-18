"use client";

import { Divider } from "antd";

const links = {
  product: [
    "Áo Thun In Theo Yêu Cầu",
    "Áo Polo Doanh Nghiệp",
    "Áo Hoodie",
    "Đặt Sỉ Đồng Phục",
    "Công cụ Thiết Kế",
  ],
  policy: [
    "Chính sách đổi trả",
    "Chính sách bảo mật",
    "Điều khoản dịch vụ",
    "Hướng dẫn đặt hàng",
    "FAQ",
  ],
  contact: [
    { icon: "📞", text: "0901 234 567" },
    { icon: "✉️", text: "hello@teestudio.vn" },
    { icon: "📍", text: "123 Nguyễn Văn Cừ, Q.5, TP.HCM" },
  ],
};

const socials = [
  {
    label: "Facebook",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="#64748b" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="#64748b" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.5" r="1" fill="#64748b" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M22.54 6.42A2.78 2.78 0 0020.59 4.5C18.88 4 12 4 12 4s-6.88 0-8.59.5A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.5C5.12 20 12 20 12 20s6.88 0 8.59-.5a2.78 2.78 0 001.95-1.92A29 29 0 0023 12a29 29 0 00-.46-5.58z" stroke="#64748b" strokeWidth="1.8" />
        <path d="M9.75 15.02l5.75-3.02-5.75-3.02v6.04z" stroke="#64748b" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function AppFooter() {
  return (
    <footer style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
      <div className="container-main" style={{ padding: "52px 24px 0" }}>

        {/* ── Main Grid ── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            gap:                 40,
            paddingBottom:       48,
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            {/* Logo */}
            <a
              href="#"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 14 }}
            >
              <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#0ea5e9" />
                <path d="M7 10h18M16 10v13" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", letterSpacing: "-0.4px" }}>
                TeeStudio
              </span>
            </a>

            <p
              style={{
                fontSize:  13,
                color:     "#64748b",
                lineHeight:1.75,
                maxWidth:  220,
                marginBottom: 20,
              }}
            >
              Nền tảng thiết kế áo cá nhân hoá & đặt đồng phục số lượng lớn chất lượng cao.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 8 }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  style={{
                    width:          34,
                    height:         34,
                    borderRadius:   8,
                    background:     "#f8fafc",
                    border:         "1px solid #e2e8f0",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition:     "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background   = "#e0f2fe";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor  = "#bae6fd";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background   = "#f8fafc";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor  = "#e2e8f0";
                  }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4
              style={{
                fontSize:      12,
                fontWeight:    700,
                color:         "#0f172a",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                marginBottom:  16,
              }}
            >
              Sản phẩm
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {links.product.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    style={{
                      fontSize:       13,
                      color:          "#64748b",
                      textDecoration: "none",
                      transition:     "color 0.15s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#0ea5e9")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4
              style={{
                fontSize:      12,
                fontWeight:    700,
                color:         "#0f172a",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                marginBottom:  16,
              }}
            >
              Chính sách
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {links.policy.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    style={{
                      fontSize:       13,
                      color:          "#64748b",
                      textDecoration: "none",
                      transition:     "color 0.15s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#0ea5e9")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontSize:      12,
                fontWeight:    700,
                color:         "#0f172a",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                marginBottom:  16,
              }}
            >
              Liên hệ
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {links.contact.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#64748b" }}>
                  <span>{c.icon}</span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider style={{ margin: 0, borderColor: "#f1f5f9" }} />

        {/* ── Bottom bar ── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "16px 0",
            flexWrap:       "wrap",
            gap:            8,
          }}
        >
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            © 2025 TeeStudio. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            Made with ❤️ in Việt Nam
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}

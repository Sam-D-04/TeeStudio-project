"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input, Badge, Drawer } from "antd";
import HeaderAuthActions from "@/components/auth/HeaderAuthActions";

const navItems = [
  { key: "/explore",      label: "Khám phá" },
  { key: "/design-studio",label: "Thiết kế áo" },
  { key: "/collections",  label: "Bộ sưu tập" },
  { key: "/creator",      label: "Bán hàng" },
];

export default function AppHeader() {
  const [scrolled,    setScrolled]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const pathname      = usePathname();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header
        style={{
          position:   "fixed",
          top: 0, left: 0, right: 0,
          zIndex:     1000,
          background: "#ffffff",
          borderBottom: scrolled
            ? "1px solid #e2e8f0"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
          transition: "all 0.25s ease",
        }}
      >
        <div
          className="container-main"
          style={{
            display:        "flex",
            alignItems:     "center",
            height:         64,
            gap:            24,
          }}
        >
          {/* ── Logo ── */}
          <Link
            href="/"
            style={{
              display:        "flex",
              alignItems:     "center",
              gap:            8,
              textDecoration: "none",
              flexShrink:     0,
            }}
          >
            {/* Vector T mark */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0ea5e9" />
              <path
                d="M7 10h18M16 10v13"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontWeight:    800,
                fontSize:      18,
                color:         "#0f172a",
                letterSpacing: "-0.5px",
              }}
            >
              TeeStudio
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav
            style={{ display: "flex", alignItems: "center", gap: 2 }}
            className="hidden md:flex"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.key || (pathname.startsWith(item.key) && item.key !== '/');
              return (
                <Link
                  key={item.key}
                  href={item.key}
                  style={{
                    background:  "none",
                    border:      "none",
                    cursor:      "pointer",
                    padding:     "6px 14px",
                    borderRadius: 8,
                    fontSize:    14,
                    fontWeight:  isActive ? 700 : 500,
                    color:       isActive ? "#0ea5e9" : "#475569",
                    transition:  "all 0.15s ease",
                    position:    "relative",
                    fontFamily:  "inherit",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color      = "#0f172a";
                      (e.currentTarget as HTMLAnchorElement).style.background = "#f1f5f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color      = "#475569";
                      (e.currentTarget as HTMLAnchorElement).style.background = "none";
                    }
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      style={{
                        position:  "absolute",
                        bottom:    0,
                        left:      "50%",
                        transform: "translateX(-50%)",
                        width:     16,
                        height:    2,
                        borderRadius: 2,
                        background:  "#0ea5e9",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Search ── */}
          <div style={{ flex: 1, maxWidth: 380 }} className="hidden md:block">
            <Input
              placeholder="Tìm kiếm mẫu thiết kế, loại áo..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              prefix={
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="#94a3b8" strokeWidth="1.5" />
                  <path d="M11 11l3 3" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
              style={{
                background:   "#f8fafc",
                border:       "1px solid #e2e8f0",
                borderRadius: 10,
                fontSize:     14,
                height:       40,
              }}
            />
          </div>

          {/* ── Right Actions ── */}
          <div
            style={{
              display:     "flex",
              alignItems:  "center",
              gap:         8,
              marginLeft:  "auto",
              flexShrink:  0,
            }}
          >
            <HeaderAuthActions />

            {/* Cart */}
            <Badge count={0} showZero={false}>
              <button
                style={{
                  width:        40,
                  height:       40,
                  borderRadius: 8,
                  background:   "#f1f5f9",
                  border:       "1px solid #e2e8f0",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent:"center",
                  cursor:       "pointer",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                    stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </Badge>

            {/* Mobile menu */}
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                width: 40, height: 40,
                borderRadius: 8,
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              className="flex md:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <Drawer
        title={
          <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
            TeeStudio
          </span>
        }
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {/* Mobile search */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            style={{ borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}
          />
        </div>

        <nav style={{ display: "flex", flexDirection: "column" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.key || (pathname.startsWith(item.key) && item.key !== '/');
            return (
              <Link
                key={item.key}
                href={item.key}
                onClick={() => setDrawerOpen(false)}
                style={{
                  display:     "flex",
                  alignItems:  "center",
                  padding:     "14px 20px",
                  background:  isActive ? "#e0f2fe" : "none",
                  border:      "none",
                  cursor:      "pointer",
                  fontSize:    15,
                  fontWeight:  isActive ? 700 : 500,
                  color:       isActive ? "#0ea5e9" : "#334155",
                  textAlign:   "left",
                  borderLeft:  isActive ? "3px solid #0ea5e9" : "3px solid transparent",
                  transition:  "all 0.15s",
                  fontFamily:  "inherit",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "20px" }}>
          <HeaderAuthActions mobile onNavigate={() => setDrawerOpen(false)} />
        </div>
      </Drawer>
    </>
  );
}

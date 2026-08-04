"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Input, Badge, Drawer } from "antd";
import HeaderAuthActions from "@/components/auth/HeaderAuthActions";
import CartDrawer from "@/components/design-studio/CartDrawer";
import { useCartStore } from "@/store/useCartStore";

const navItems = [
  { key: "/explore",      label: "Khám phá" },
  { key: "/design-studio",label: "Thiết kế áo" },
  { key: "/collections",  label: "Bộ sưu tập" },
];

export default function AppHeader() {
  const [scrolled,    setScrolled]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [cartOpen,    setCartOpen]    = useState(false);
  const pathname      = usePathname();
  const router        = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    const q = value.trim();
    if (q) router.push(`/explore?q=${encodeURIComponent(q)}`);
    else   router.push("/explore");
  };
  const totalItems    = useCartStore((s) => s.totalItems());

  /* Hydration guard: localStorage-persisted cart chỉ đọc được ở client,
     nên lần render đầu tiên phải khớp server (0) rồi mới cập nhật số thật. */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header
        className={pathname === "/" ? "floating-glass-header" : ""}
        style={{
          position: "fixed",
          top: pathname === "/" ? (scrolled ? 12 : 24) : 0,
          left: pathname === "/" ? "50%" : 0,
          right: pathname === "/" ? "auto" : 0,
          transform: pathname === "/" ? "translateX(-50%)" : "none",
          width: pathname === "/" ? "calc(100% - 32px)" : "100%",
          maxWidth: pathname === "/" ? 1200 : "100%",
          zIndex: 1000,
          background: pathname === "/" ? undefined : "#ffffff",
          borderBottom: pathname !== "/" && scrolled ? "1px solid #e2e8f0" : pathname !== "/" ? "1px solid transparent" : undefined,
          boxShadow: pathname !== "/" && scrolled ? "0 2px 12px rgba(0,0,0,0.06)" : undefined,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          padding: pathname === "/" ? "0 8px" : 0,
        }}
      >
        <div
          className={pathname === "/" ? "" : "container-main"}
          style={{
            display: "flex",
            alignItems: "center",
            height: pathname === "/" ? 60 : 64,
            padding: pathname === "/" ? "0 16px" : 0,
            gap: 24,
            width: "100%",
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
                    color:       isActive ? "#0f172a" : "#475569",
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
                        background:  "#0f172a",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>



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
            <Badge count={hydrated ? totalItems : 0} showZero={false} size="small" color="#0ea5e9">
              <button
                onClick={() => setCartOpen(true)}
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

            {/* Mobile menu - chỉ hiển thị khi màn hình nhỏ hơn md (768px) */}
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                width: 40, height: 40,
                borderRadius: 8,
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              className="hidden md:hidden max-[768px]:flex"
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
          <Input.Search
            placeholder="Tìm kiếm..."
            allowClear
            onSearch={(v) => { setDrawerOpen(false); handleSearch(v); }}
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
                  background:  isActive ? "#f1f5f9" : "none",
                  border:      "none",
                  cursor:      "pointer",
                  fontSize:    15,
                  fontWeight:  isActive ? 700 : 500,
                  color:       isActive ? "#0f172a" : "#334155",
                  textAlign:   "left",
                  borderLeft:  isActive ? "3px solid #0f172a" : "3px solid transparent",
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

      {/* ── Cart Drawer (trượt từ phải) ── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

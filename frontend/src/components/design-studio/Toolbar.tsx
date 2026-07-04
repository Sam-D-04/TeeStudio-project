"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDesignStore } from "@/store/useDesignStore";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";

/* ─── SVG Icons ─── */
const UndoIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);
const RedoIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
  </svg>
);
const SaveIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

interface ToolbarProps {
  onSave: () => void;
  onDownloadImage: () => void;
  onShowToast: (msg: string) => void;
  onOpenMyDesigns: () => void;
  onNewDesign: () => void;
  isSaving?: boolean;
}

const menuItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 9,
  width: "100%", padding: "8px 14px",
  background: "transparent", border: "none",
  color: "#cbd5e1", fontSize: 13, cursor: "pointer",
  textAlign: "left", transition: "background 0.1s",
};

export default function Toolbar({ onSave, onDownloadImage, onShowToast, onNewDesign, isSaving }: ToolbarProps) {
  const { undo, redo, undoStack, redoStack, clearDesign, shirtType } = useDesignStore();
  const { isAuthenticated, user, clearSession, hydrate } = useAuthStore();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: "login" | "register" }>({ open: false, tab: "login" });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const shirtLabel = shirtType === "tshirt" ? "Áo Thun" : shirtType === "polo" ? "Áo Polo" : "Hoodie";

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w: string) => w[0]).slice(-2).join("").toUpperCase()
    : "?";

  return (
    <>
    <header className="ds-toolbar">
      {/* LEFT: Logo */}
      <div className="ds-toolbar-left">
        <a href="/" className="ds-toolbar-logo" title="Về trang chủ">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="url(#tbg)" />
            <text x="50%" y="54%" textAnchor="middle" dominantBaseline="central"
              fill="#fff" fontSize="18" fontWeight="800" fontFamily="Inter, sans-serif">T</text>
            <defs>
              <linearGradient id="tbg" x1="0" y1="0" x2="36" y2="36">
                <stop stopColor="#0ea5e9" /><stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          TeeStudio
        </a>
        <div className="ds-toolbar-divider" />
        <span style={{ fontSize: 13, color: "#94a3b8" }}>Thiết kế {shirtLabel}</span>
      </div>

      {/* CENTER: Undo / Redo / New / Clear */}
      <div className="ds-toolbar-center">
        <button className="ds-toolbar-btn ds-toolbar-btn--icon" onClick={undo}
          disabled={undoStack.length === 0} title="Hoàn tác (Ctrl+Z)">
          <UndoIcon />
        </button>
        <button className="ds-toolbar-btn ds-toolbar-btn--icon" onClick={redo}
          disabled={redoStack.length === 0} title="Làm lại (Ctrl+Y)">
          <RedoIcon />
        </button>
        <div className="ds-toolbar-divider" />
        <button className="ds-toolbar-btn" onClick={onNewDesign} title="Tạo thiết kế mới">
          <PlusIcon /> Tạo mới
        </button>
        <button
          className="ds-toolbar-btn ds-toolbar-btn--icon"
          onClick={() => {
            if (confirm("Bạn có chắc muốn xóa toàn bộ nội dung?")) {
              clearDesign();
              onShowToast("Đã xóa thiết kế");
            }
          }}
          title="Xóa tất cả nội dung"
        >
          <TrashIcon />
        </button>
      </div>

      {/* RIGHT: Download + Save + Auth */}
      <div className="ds-toolbar-right">
        <button className="ds-toolbar-btn ds-toolbar-btn--outline" onClick={onDownloadImage} title="Tải xuống ảnh PNG">
          <DownloadIcon /> Tải ảnh
        </button>
        <button className="ds-toolbar-btn ds-toolbar-btn--primary" onClick={onSave}
          title="Lưu thiết kế (Ctrl+S)" disabled={isSaving}>
          {isSaving ? (
            <svg className="ds-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          ) : <SaveIcon />}
          {isSaving ? "Đang lưu..." : "Lưu thiết kế"}
        </button>

        <div className="ds-toolbar-divider" />

        {/* Auth area */}
        {!isAuthenticated ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="ds-toolbar-btn ds-toolbar-btn--outline"
              onClick={() => setAuthModal({ open: true, tab: "login" })}
              style={{ whiteSpace: "nowrap" }}
            >
              Đăng nhập
            </button>
            <button
              className="ds-toolbar-btn ds-toolbar-btn--primary"
              onClick={() => setAuthModal({ open: true, tab: "register" })}
              style={{ whiteSpace: "nowrap", background: "linear-gradient(135deg,#0ea5e9,#6366f1)", border: "none" }}
            >
              Đăng ký
            </button>
          </div>
        ) : (
          <div ref={menuRef} style={{ position: "relative" }}>
            {/* Avatar button */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: menuOpen ? "#334155" : "transparent",
                border: "1px solid #334155",
                borderRadius: 8, padding: "4px 10px 4px 4px",
                cursor: "pointer", color: "#e2e8f0",
                transition: "background 0.15s",
              }}
              title={user?.fullName || "Tài khoản"}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                {initials}
              </div>
              <span style={{ fontSize: 13, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.fullName || user?.email || "Tài khoản"}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 9999,
                width: 210, background: "#1e293b", border: "1px solid #334155",
                borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.5)", overflow: "hidden",
              }}>
                {/* User info header */}
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #334155" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>
                    {user?.fullName || "Người dùng"}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.email}
                  </div>
                </div>

                <div style={{ padding: "6px 0" }}>
                  <button
                    onClick={() => { setMenuOpen(false); router.push("/collections"); }}
                    style={menuItemStyle}
                    onMouseEnter={e => (e.currentTarget.style.background = "#334155")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                    </svg>
                    Bộ sưu tập của tôi
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); router.push("/tai-khoan"); }}
                    style={menuItemStyle}
                    onMouseEnter={e => (e.currentTarget.style.background = "#334155")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    Tài khoản
                  </button>

                  <div style={{ borderTop: "1px solid #334155", margin: "4px 0" }} />

                  <button
                    onClick={() => { setMenuOpen(false); clearSession(); onShowToast("Đã đăng xuất"); }}
                    style={{ ...menuItemStyle, color: "#f87171" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#334155")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>

      <AuthModal
        isOpen={authModal.open}
        defaultTab={authModal.tab}
        onClose={() => setAuthModal(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}

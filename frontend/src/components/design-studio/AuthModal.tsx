"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { authService } from "@/services/authService";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { syncCart } from "@/services/cartService";
import useAuthStore from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

type Tab = "login" | "register";
type Theme = "light" | "dark";

interface AuthModalProps {
  isOpen: boolean;
  defaultTab?: Tab;
  onClose: () => void;
  /** Tông màu modal: "dark" cho design studio, "light" cho các trang nền sáng */
  theme?: Theme;
  /** Gọi sau khi đăng nhập/đăng ký thành công (nhận session để điều hướng) */
  onSuccess?: (session: any) => void;
}

/* ── Bảng màu theo tông sáng/tối ── */
interface Palette {
  overlayBg: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  logoText: string;
  closeColor: string;
  tabDivider: string;
  tabActiveColor: string;
  tabInactiveColor: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputFocus: string;
  labelColor: string;
  hintColor: string;
  mutedText: string;
  linkColor: string;
  btnDisabledBg: string;
  errorBg: string;
  errorBorder: string;
  errorText: string;
}

const PALETTES: Record<Theme, Palette> = {
  dark: {
    overlayBg: "rgba(0,0,0,0.65)",
    panelBg: "#0f172a",
    panelBorder: "#1e293b",
    panelShadow: "0 25px 60px rgba(0,0,0,0.6)",
    logoText: "#e2e8f0",
    closeColor: "#64748b",
    tabDivider: "#1e293b",
    tabActiveColor: "#38bdf8",
    tabInactiveColor: "#64748b",
    inputBg: "#1e293b",
    inputBorder: "#334155",
    inputText: "#e2e8f0",
    inputFocus: "#38bdf8",
    labelColor: "#94a3b8",
    hintColor: "#64748b",
    mutedText: "#64748b",
    linkColor: "#38bdf8",
    btnDisabledBg: "#334155",
    errorBg: "rgba(239,68,68,0.1)",
    errorBorder: "rgba(239,68,68,0.3)",
    errorText: "#fca5a5",
  },
  light: {
    overlayBg: "rgba(15,23,42,0.45)",
    panelBg: "#ffffff",
    panelBorder: "#e2e8f0",
    panelShadow: "0 25px 60px rgba(15,23,42,0.25)",
    logoText: "#0f172a",
    closeColor: "#94a3b8",
    tabDivider: "#e2e8f0",
    tabActiveColor: "#0ea5e9",
    tabInactiveColor: "#94a3b8",
    inputBg: "#f8fafc",
    inputBorder: "#e2e8f0",
    inputText: "#0f172a",
    inputFocus: "#0ea5e9",
    labelColor: "#475569",
    hintColor: "#94a3b8",
    mutedText: "#64748b",
    linkColor: "#0ea5e9",
    btnDisabledBg: "#cbd5e1",
    errorBg: "#fef2f2",
    errorBorder: "#fecaca",
    errorText: "#dc2626",
  },
};

export default function AuthModal({ isOpen, defaultTab = "login", onClose, theme = "dark", onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const setSession = useAuthStore((s) => s.setSession);
  const backdropRef = useRef<HTMLDivElement>(null);
  const p = PALETTES[theme];

  // Đồng bộ tab đang chọn mỗi khi prop defaultTab thay đổi
  useEffect(() => {
    if (isOpen) setTab(defaultTab);
  }, [isOpen, defaultTab]);

  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Chặn cuộn trang nền khi modal đang mở
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = (session: any) => {
    onSuccess?.(session);
    onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: p.overlayBg,
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        animation: "ds-modal-bg-in 0.18s ease",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 440,
        background: p.panelBg,
        border: `1px solid ${p.panelBorder}`,
        borderRadius: 16,
        boxShadow: p.panelShadow,
        overflow: "hidden",
        animation: "ds-modal-in 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Phần đầu modal: logo + nút đóng */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 0",
        }}>
          {/* Logo TeeStudio */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="url(#amg)" />
              <text x="50%" y="54%" textAnchor="middle" dominantBaseline="central"
                fill="#fff" fontSize="18" fontWeight="800" fontFamily="Inter, sans-serif">T</text>
              <defs>
                <linearGradient id="amg" x1="0" y1="0" x2="36" y2="36">
                  <stop stopColor="#0ea5e9" /><stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 15, color: p.logoText }}>TeeStudio</span>
          </div>

          {/* Nút đóng modal */}
          <button onClick={onClose} style={{
            background: "none", border: "none", color: p.closeColor,
            cursor: "pointer", padding: 4, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Đăng nhập / Đăng ký */}
        <div style={{
          display: "flex", gap: 0, padding: "20px 24px 0",
          borderBottom: `1px solid ${p.tabDivider}`,
        }}>
          {(["login", "register"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px 0",
              background: "none", border: "none",
              borderBottom: tab === t ? `2px solid ${p.tabActiveColor}` : "2px solid transparent",
              color: tab === t ? p.tabActiveColor : p.tabInactiveColor,
              fontWeight: tab === t ? 600 : 400,
              fontSize: 14, cursor: "pointer",
              transition: "all 0.15s",
            }}>
              {t === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        {/* Nội dung form theo tab đang chọn */}
        <div style={{ padding: 24 }}>
          {tab === "login"
            ? <InlineLoginForm onDone={handleSuccess} onSwitchTab={() => setTab("register")} setSession={setSession} p={p} />
            : <InlineRegisterForm onDone={handleSuccess} onSwitchTab={() => setTab("login")} setSession={setSession} p={p} />
          }
        </div>
      </div>

      <style>{`
        @keyframes ds-modal-bg-in { from { opacity:0 } to { opacity:1 } }
        @keyframes ds-modal-in { from { opacity:0; transform:scale(0.92) translateY(16px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}

/* ── Form đăng nhập (nhúng trực tiếp trong modal) ── */
function InlineLoginForm({
  onDone, onSwitchTab, setSession, p,
}: {
  onDone: (session: any) => void;
  onSwitchTab: () => void;
  setSession: (s: any) => void;
  p: Palette;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await authService.login({ email, password });
      setSession(session);
      if (session.user.role === "CUSTOMER") {
        try {
          const cartState = useCartStore.getState();
          const synced = await syncCart(session.accessToken, cartState.toSyncPayload());
          cartState.loadFromBackend(synced);
        } catch { /* sync lỗi không block đăng nhập */ }
      }
      onDone(session);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Đăng nhập không thành công."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && (
        <div style={{ background: p.errorBg, border: `1px solid ${p.errorBorder}`, borderRadius: 8, padding: "10px 14px", color: p.errorText, fontSize: 13 }}>
          {error}
        </div>
      )}

      <ModalInput id="ml-email" label="Email" type="email" value={email}
        onChange={setEmail} placeholder="ban@example.com" autoComplete="email" p={p} />
      <div style={{ position: "relative" }}>
        <ModalInput id="ml-password" label="Mật khẩu" type="password" value={password}
          onChange={setPassword} autoComplete="current-password" p={p} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <Link href="/quen-mat-khau" style={{ fontSize: 13, color: p.linkColor, textDecoration: "none", fontWeight: 500 }}>
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <button type="submit" disabled={loading} style={{
        marginTop: 4, padding: "11px 0", borderRadius: 8, border: "none",
        background: loading ? p.btnDisabledBg : "linear-gradient(135deg,#0ea5e9,#6366f1)",
        color: "#fff", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
        transition: "opacity 0.15s",
      }}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: p.mutedText, margin: 0 }}>
        Chưa có tài khoản?{" "}
        <button type="button" onClick={onSwitchTab} style={{ background: "none", border: "none", color: p.linkColor, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          Đăng ký
        </button>
      </p>
    </form>
  );
}

/* ── Form đăng ký (nhúng trực tiếp trong modal) ── */
function InlineRegisterForm({
  onDone, onSwitchTab, setSession, p,
}: {
  onDone: (session: any) => void;
  onSwitchTab: () => void;
  setSession: (s: any) => void;
  p: Palette;
}) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return; }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) { setError("Mật khẩu phải có tối thiểu 8 ký tự, gồm chữ và số."); return; }
    setLoading(true);
    try {
      const session = await authService.register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password });
      setSession(session);
      if (session.user.role === "CUSTOMER") {
        try {
          const cartState = useCartStore.getState();
          const synced = await syncCart(session.accessToken, cartState.toSyncPayload());
          cartState.loadFromBackend(synced);
        } catch { /* sync lỗi không block đăng ký */ }
      }
      onDone(session);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Đăng ký không thành công."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {error && (
        <div style={{ background: p.errorBg, border: `1px solid ${p.errorBorder}`, borderRadius: 8, padding: "10px 14px", color: p.errorText, fontSize: 13 }}>
          {error}
        </div>
      )}

      <ModalInput id="mr-name" label="Họ và tên" value={form.fullName} onChange={v => update("fullName", v)} autoComplete="name" p={p} />
      <ModalInput id="mr-email" label="Email" type="email" value={form.email} onChange={v => update("email", v)} autoComplete="email" p={p} />
      <ModalInput id="mr-phone" label="Số điện thoại" type="tel" value={form.phone} onChange={v => update("phone", v)} autoComplete="tel" p={p} />
      <ModalInput id="mr-password" label="Mật khẩu" type="password" value={form.password} onChange={v => update("password", v)} hint="Tối thiểu 8 ký tự, gồm chữ và số." autoComplete="new-password" p={p} />
      <ModalInput id="mr-confirm" label="Xác nhận mật khẩu" type="password" value={form.confirmPassword} onChange={v => update("confirmPassword", v)} autoComplete="new-password" p={p} />

      <button type="submit" disabled={loading} style={{
        marginTop: 4, padding: "11px 0", borderRadius: 8, border: "none",
        background: loading ? p.btnDisabledBg : "linear-gradient(135deg,#0ea5e9,#6366f1)",
        color: "#fff", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: p.mutedText, margin: 0 }}>
        Đã có tài khoản?{" "}
        <button type="button" onClick={onSwitchTab} style={{ background: "none", border: "none", color: p.linkColor, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          Đăng nhập
        </button>
      </p>
    </form>
  );
}

/* ── Ô nhập liệu dùng chung cho cả 2 form ── */
function ModalInput({
  id, label, type = "text", value, onChange, placeholder, autoComplete, hint, p,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string; hint?: string;
  p: Palette;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: 12, fontWeight: 500, color: p.labelColor, marginBottom: 6 }}>
        {label}
      </label>
      <input
        id={id} type={type} value={value} required
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "9px 12px", boxSizing: "border-box",
          background: p.inputBg, border: `1px solid ${p.inputBorder}`, borderRadius: 8,
          color: p.inputText, fontSize: 14, outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={e => (e.target.style.borderColor = p.inputFocus)}
        onBlur={e => (e.target.style.borderColor = p.inputBorder)}
      />
      {hint && <p style={{ marginTop: 4, fontSize: 11, color: p.hintColor }}>{hint}</p>}
    </div>
  );
}

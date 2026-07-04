"use client";

import React, { useState, useEffect, useRef } from "react";
import { authService } from "@/services/authService";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import { syncCart } from "@/services/cartService";
import useAuthStore from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

type Tab = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  defaultTab?: Tab;
  onClose: () => void;
}

export default function AuthModal({ isOpen, defaultTab = "login", onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const setSession = useAuthStore((s) => s.setSession);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Sync tab when prop changes
  useEffect(() => {
    if (isOpen) setTab(defaultTab);
  }, [isOpen, defaultTab]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        animation: "ds-modal-bg-in 0.18s ease",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 440,
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 16,
        boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        overflow: "hidden",
        animation: "ds-modal-in 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 0",
        }}>
          {/* Logo */}
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
            <span style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>TeeStudio</span>
          </div>

          {/* Close button */}
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#64748b",
            cursor: "pointer", padding: 4, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 0, padding: "20px 24px 0",
          borderBottom: "1px solid #1e293b",
        }}>
          {(["login", "register"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px 0",
              background: "none", border: "none",
              borderBottom: tab === t ? "2px solid #38bdf8" : "2px solid transparent",
              color: tab === t ? "#38bdf8" : "#64748b",
              fontWeight: tab === t ? 600 : 400,
              fontSize: 14, cursor: "pointer",
              transition: "all 0.15s",
            }}>
              {t === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        {/* Form area */}
        <div style={{ padding: 24 }}>
          {tab === "login"
            ? <InlineLoginForm onSuccess={handleSuccess} onSwitchTab={() => setTab("register")} setSession={setSession} />
            : <InlineRegisterForm onSuccess={handleSuccess} onSwitchTab={() => setTab("login")} setSession={setSession} />
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

/* ── Inline Login Form ── */
function InlineLoginForm({
  onSuccess, onSwitchTab, setSession,
}: {
  onSuccess: () => void;
  onSwitchTab: () => void;
  setSession: (s: any) => void;
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
      onSuccess();
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Đăng nhập không thành công."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      <ModalInput id="ml-email" label="Email" type="email" value={email}
        onChange={setEmail} placeholder="ban@example.com" autoComplete="email" />
      <ModalInput id="ml-password" label="Mật khẩu" type="password" value={password}
        onChange={setPassword} autoComplete="current-password" />

      <button type="submit" disabled={loading} style={{
        marginTop: 4, padding: "11px 0", borderRadius: 8, border: "none",
        background: loading ? "#334155" : "linear-gradient(135deg,#0ea5e9,#6366f1)",
        color: "#fff", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
        transition: "opacity 0.15s",
      }}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", margin: 0 }}>
        Chưa có tài khoản?{" "}
        <button type="button" onClick={onSwitchTab} style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          Đăng ký
        </button>
      </p>
    </form>
  );
}

/* ── Inline Register Form ── */
function InlineRegisterForm({
  onSuccess, onSwitchTab, setSession,
}: {
  onSuccess: () => void;
  onSwitchTab: () => void;
  setSession: (s: any) => void;
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
      onSuccess();
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Đăng ký không thành công."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      <ModalInput id="mr-name" label="Họ và tên" value={form.fullName} onChange={v => update("fullName", v)} autoComplete="name" />
      <ModalInput id="mr-email" label="Email" type="email" value={form.email} onChange={v => update("email", v)} autoComplete="email" />
      <ModalInput id="mr-phone" label="Số điện thoại" type="tel" value={form.phone} onChange={v => update("phone", v)} autoComplete="tel" />
      <ModalInput id="mr-password" label="Mật khẩu" type="password" value={form.password} onChange={v => update("password", v)} hint="Tối thiểu 8 ký tự, gồm chữ và số." autoComplete="new-password" />
      <ModalInput id="mr-confirm" label="Xác nhận mật khẩu" type="password" value={form.confirmPassword} onChange={v => update("confirmPassword", v)} autoComplete="new-password" />

      <button type="submit" disabled={loading} style={{
        marginTop: 4, padding: "11px 0", borderRadius: 8, border: "none",
        background: loading ? "#334155" : "linear-gradient(135deg,#0ea5e9,#6366f1)",
        color: "#fff", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
      }}>
        {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
      </button>

      <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", margin: 0 }}>
        Đã có tài khoản?{" "}
        <button type="button" onClick={onSwitchTab} style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          Đăng nhập
        </button>
      </p>
    </form>
  );
}

/* ── Shared dark input ── */
function ModalInput({
  id, label, type = "text", value, onChange, placeholder, autoComplete, hint,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#94a3b8", marginBottom: 6 }}>
        {label}
      </label>
      <input
        id={id} type={type} value={value} required
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "9px 12px", boxSizing: "border-box",
          background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
          color: "#e2e8f0", fontSize: 14, outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={e => (e.target.style.borderColor = "#38bdf8")}
        onBlur={e => (e.target.style.borderColor = "#334155")}
      />
      {hint && <p style={{ marginTop: 4, fontSize: 11, color: "#64748b" }}>{hint}</p>}
    </div>
  );
}

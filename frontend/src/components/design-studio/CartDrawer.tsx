"use client";

import { useEffect, useState } from "react";
import { Drawer } from "antd";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

const SHIPPING_FEE = 35_000;
const fmt = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const items        = useCartStore((s) => s.items);
  const totalPrice   = useCartStore((s) => s.totalPrice);
  const removeItem   = useCartStore((s) => s.removeItem);
  const updateQty    = useCartStore((s) => s.updateQuantity);
  const clearCart    = useCartStore((s) => s.clearCart);

  /* Hydration guard */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const subtotal = hydrated ? totalPrice() : 0;
  const total    = subtotal + (subtotal > 0 ? SHIPPING_FEE : 0);

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
            Giỏ hàng của bạn
          </span>
          {items.length > 0 && (
            <button
              onClick={() => { clearCart(); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "#94a3b8", fontWeight: 500,
                padding: "2px 6px", borderRadius: 4,
              }}
            >
              Xóa tất cả
            </button>
          )}
        </div>
      }
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      zIndex={10002}
      styles={{
        header: { borderBottom: "1px solid #f1f5f9", padding: "16px 20px" },
        body: { padding: 0, display: "flex", flexDirection: "column", height: "100%" },
        footer: { borderTop: "1px solid #f1f5f9", padding: "16px 20px" },
      }}
      footer={
        items.length > 0 ? (
          <div>
            {/* Tổng kết đơn hàng: tạm tính, phí ship, tổng cộng */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                <span>Tạm tính</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 10 }}>
                <span>Phí vận chuyển</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{fmt(SHIPPING_FEE)}</span>
              </div>
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Tổng cộng</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#0ea5e9" }}>{fmt(total)}</span>
              </div>
            </div>
            {/* Nút chuyển sang trang thanh toán */}
            <Link href="/checkout" onClick={onClose}>
              <button style={{
                width: "100%", height: 46, borderRadius: 10,
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                border: "none", color: "#fff",
                fontWeight: 700, fontSize: 15, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
              }}>
                Tiến hành thanh toán →
              </button>
            </Link>
          </div>
        ) : null
      }
    >
      {!hydrated ? null : items.length === 0 ? (
        /* Trạng thái giỏ hàng trống */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 12 }}>
          <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
          </svg>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Giỏ hàng trống</p>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0, textAlign: "center" }}>
            Thêm sản phẩm vào giỏ bằng nút "Thêm vào giỏ" ở trên.
          </p>
        </div>
      ) : (
        /* Danh sách sản phẩm trong giỏ */
        <div style={{ flex: 1, overflowY: "auto" }}>
          {items.map((item, idx) => (
            <div
              key={item.cartItemId}
              style={{
                display: "flex", gap: 12,
                padding: "16px 20px",
                borderBottom: idx < items.length - 1 ? "1px solid #f8fafc" : "none",
              }}
            >
              {/* Ảnh thu nhỏ của sản phẩm */}
              <div style={{
                width: 72, height: 72, borderRadius: 8,
                border: "1px solid #e2e8f0", overflow: "hidden",
                flexShrink: 0, background: "#f8fafc",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Thông tin sản phẩm: tên, size, màu, số lượng, giá */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.name}
                </p>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "#475569", background: "#f1f5f9", borderRadius: 5, padding: "1px 7px" }}>
                    {item.size}
                  </span>
                  <span style={{ fontSize: 11, color: "#475569", background: "#f1f5f9", borderRadius: 5, padding: "1px 7px", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: item.color, border: "1px solid #e2e8f0" }} />
                    {item.colorLabel}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {/* Bộ tăng/giảm số lượng */}
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 7, overflow: "hidden" }}>
                    <button
                      onClick={() => updateQty(item.cartItemId, item.quantity - 1)}
                      style={{ width: 28, height: 28, background: "#f8fafc", border: "none", cursor: "pointer", fontSize: 15, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >−</button>
                    <span style={{ minWidth: 30, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#0f172a", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", height: 28, lineHeight: "28px" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.cartItemId, item.quantity + 1)}
                      style={{ width: 28, height: 28, background: "#f8fafc", border: "none", cursor: "pointer", fontSize: 15, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >+</button>
                  </div>

                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0ea5e9" }}>
                    {fmt(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.cartItemId)}
                    title="Xóa"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 5, display: "flex", alignItems: "center" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "#fff5f0"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

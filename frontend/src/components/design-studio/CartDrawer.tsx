"use client";

import { useEffect, useState } from "react";
import { Drawer } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import CheckoutPolicyModal from "@/components/cart/CheckoutPolicyModal";

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
  const router       = useRouter();
  const [policyOpen, setPolicyOpen] = useState(false);

  /* Hydration guard */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const subtotal = hydrated ? totalPrice() : 0;

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
      size="default"
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
            {/* Tạm tính — phí vận chuyển sẽ tính ở bước thanh toán */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Tạm tính</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#0ea5e9" }}>{fmt(subtotal)}</span>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "6px 0 0" }}>
                Phí vận chuyển sẽ được tính ở bước thanh toán.
              </p>
            </div>
            {/* Nút chuyển sang trang thanh toán */}
            <button
              onClick={() => setPolicyOpen(true)}
              style={{
                width: "100%", height: 46, borderRadius: 10,
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                border: "none", color: "#fff",
                fontWeight: 700, fontSize: 15, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
              }}
            >
              Tiến hành thanh toán →
            </button>
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
          {(() => {
            const qtyByProductId: Record<number, number> = {};
            items.forEach((i) => {
              qtyByProductId[i.productId] = (qtyByProductId[i.productId] || 0) + i.quantity;
            });

            return items.map((item, idx) => {
              const totalQty = qtyByProductId[item.productId] || item.quantity;
              const baseItemPrice = item.price + (item.designFee || 0);
              let unitPrice = baseItemPrice;
              
              if (item.bulkPricing && item.bulkPricing.length > 0) {
                const matched = [...item.bulkPricing]
                  .sort((a, b) => b.minQty - a.minQty)
                  .find((bp) => totalQty >= bp.minQty);
                  
                if (matched) {
                  unitPrice = Math.round(baseItemPrice * (1 - matched.discountPercent / 100));
                }
              }

              return (
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
                flexShrink: 0,
                // Sản phẩm có thiết kế riêng: dùng màu áo làm nền vì ảnh in
                // là PNG nền trong suốt, chỉ chứa nội dung đã in.
                background: item.designId ? item.color : "#f8fafc",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: item.designId ? "contain" : "cover" }} />
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
                  {(item.designFee ?? 0) > 0 && (
                    <span style={{ fontSize: 11, color: "#7c3aed", background: "#ede9fe", borderRadius: 5, padding: "1px 7px", fontWeight: 600 }}>
                      + In ấn
                    </span>
                  )}
                  {item.stockQty !== undefined && item.stockQty === 1 && (
                    <span style={{ fontSize: 10, color: "#d97706", background: "#fffbeb", borderRadius: 4, padding: "1px 6px", border: "1px solid #fef3c7", fontWeight: 600 }}>
                      Chỉ còn 1 sp
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {/* Bộ tăng/giảm số lượng */}
                  {(() => {
                    const isMaxReached = item.stockQty !== undefined ? item.quantity >= item.stockQty : false;
                    return (
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 7, overflow: "hidden" }}>
                        <button
                          onClick={() => updateQty(item.cartItemId, item.quantity - 1)}
                          style={{ width: 28, height: 28, background: "#f8fafc", border: "none", cursor: "pointer", fontSize: 15, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >−</button>
                        <span style={{ minWidth: 30, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#0f172a", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", height: 28, lineHeight: "28px" }}>
                          {item.quantity}
                        </span>
                        <button
                          disabled={isMaxReached}
                          onClick={() => {
                            if (isMaxReached) return;
                            updateQty(item.cartItemId, item.quantity + 1);
                          }}
                          title={isMaxReached ? (item.stockQty === 1 ? "Sản phẩm trong kho chỉ còn 1 sản phẩm, không thể tăng thêm" : "Đã đạt số lượng tồn kho tối đa") : "Tăng số lượng"}
                          style={{
                            width: 28, height: 28,
                            background: isMaxReached ? "#f1f5f9" : "#f8fafc",
                            border: "none",
                            cursor: isMaxReached ? "not-allowed" : "pointer",
                            fontSize: 15,
                            color: isMaxReached ? "#cbd5e1" : "#475569",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                        >+</button>
                      </div>
                    );
                  })()}

                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0ea5e9" }}>
                    {fmt(unitPrice * item.quantity)}
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
              );
            });
          })()}
        </div>
      )}

      <CheckoutPolicyModal
        open={policyOpen}
        onCancel={() => setPolicyOpen(false)}
        onConfirm={() => {
          setPolicyOpen(false);
          onClose();
          router.push("/checkout");
        }}
      />
    </Drawer>
  );
}

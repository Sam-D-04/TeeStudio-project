"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Empty, InputNumber, message } from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useCartStore } from "@/store/useCartStore";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import type { Metadata } from "next";
import { useRouter } from "next/navigation";
import CheckoutPolicyModal from "@/components/cart/CheckoutPolicyModal";

// Helper
function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}


export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const router = useRouter();
  const [policyOpen, setPolicyOpen] = useState(false);

  /* Hydration guard — Zustand persist only works client-side */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  const subtotal = totalPrice();
  // Phí vận chuyển được tính ở bước thanh toán, không cộng vào giỏ hàng
  const total = subtotal;

  return (
    <>
      <AppHeader />
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#f1f5f9",
          paddingTop: 80,
          paddingBottom: 64,
        }}
      >
        <div className="container-main">
          {/* ── Page title ── */}
          <div style={{ marginBottom: 28 }}>
            <Link
              href="/explore"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "#475569",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                marginBottom: 12,
              }}
            >
              <ArrowLeftOutlined style={{ fontSize: 12 }} />
              Tiếp tục mua sắm
            </Link>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              Giỏ hàng của bạn
              {totalItems() > 0 && (
                <span
                  style={{
                    marginLeft: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0ea5e9",
                    background: "#e0f2fe",
                    borderRadius: 20,
                    padding: "2px 10px",
                  }}
                >
                  {totalItems()} sản phẩm
                </span>
              )}
            </h1>
          </div>

          {items.length === 0 ? (
            /* ── Empty state ── */
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                padding: "64px 24px",
                textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <ShoppingCartOutlined
                style={{ fontSize: 64, color: "#bec8d2", marginBottom: 16 }}
              />
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 8px",
                }}
              >
                Giỏ hàng trống
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#475569",
                  margin: "0 0 24px",
                }}
              >
                Hãy khám phá các mẫu áo và thêm vào giỏ hàng nhé!
              </p>
              <Link href="/explore">
                <Button
                  type="primary"
                  size="large"
                  style={{ borderRadius: 10, fontWeight: 600, height: 44 }}
                >
                  Khám phá ngay
                </Button>
              </Link>
            </div>
          ) : (
            /* ── Main 2-column layout ── */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 24,
              }}
              className="lg:grid-cols-[1fr_360px]"
            >
              {/* ── Left: item list ── */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 24px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}
                  >
                    Sản phẩm
                  </span>
                  <button
                    onClick={() => {
                      clearCart();
                      message.success("Đã xóa toàn bộ giỏ hàng");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#94a3b8",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <DeleteOutlined />
                    Xóa tất cả
                  </button>
                </div>

                {/* Item rows */}
                {items.map((item, idx) => (
                  <div
                    key={item.cartItemId}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                      padding: "20px 24px",
                      borderBottom:
                        idx < items.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      "none")
                    }
                  >
                    {/* Product image */}
                    <div
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                        flexShrink: 0,
                        // Sản phẩm có thiết kế riêng: dùng màu áo làm nền vì ảnh in
                        // là PNG nền trong suốt, chỉ chứa nội dung đã in.
                        background: item.designId ? item.color : "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: item.designId ? "contain" : "cover" }}
                        />
                      ) : (
                        <ShoppingCartOutlined
                          style={{ fontSize: 28, color: "#bec8d2" }}
                        />
                      )}
                    </div>

                    {/* Product info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px 12px",
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "#475569",
                            background: "#f1f5f9",
                            borderRadius: 6,
                            padding: "2px 8px",
                          }}
                        >
                          Size: {item.size}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#475569",
                            background: "#f1f5f9",
                            borderRadius: 6,
                            padding: "2px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: item.color,
                              border: "1px solid #e2e8f0",
                            }}
                          />
                          {item.colorLabel}
                        </span>
                        {(item.designFee ?? 0) > 0 && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#7c3aed",
                              background: "#ede9fe",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontWeight: 600,
                            }}
                          >
                            + Phí in ấn: {formatVND(item.designFee ?? 0)}
                          </span>
                        )}
                        {item.stockQty !== undefined && item.stockQty === 1 && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#d97706",
                              background: "#fffbeb",
                              borderRadius: 6,
                              padding: "2px 8px",
                              border: "1px solid #fef3c7",
                              fontWeight: 600,
                            }}
                          >
                            Chỉ còn 1 sản phẩm
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {/* Qty adjuster */}
                        {(() => {
                          const isMaxReached =
                            item.stockQty !== undefined
                              ? item.quantity >= item.stockQty
                              : false;
                          return (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0,
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                overflow: "hidden",
                              }}
                            >
                              <button
                                onClick={() =>
                                  updateQty(item.cartItemId, item.quantity - 1)
                                }
                                style={{
                                  width: 32,
                                  height: 32,
                                  background: "#f8fafc",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 16,
                                  fontWeight: 600,
                                  color: "#475569",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                −
                              </button>
                              <span
                                style={{
                                  minWidth: 36,
                                  textAlign: "center",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  borderLeft: "1px solid #e2e8f0",
                                  borderRight: "1px solid #e2e8f0",
                                  height: 32,
                                  lineHeight: "32px",
                                }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                disabled={isMaxReached}
                                onClick={() => {
                                  if (isMaxReached) return;
                                  updateQty(item.cartItemId, item.quantity + 1);
                                }}
                                title={
                                  isMaxReached
                                    ? item.stockQty === 1
                                      ? "Sản phẩm trong kho chỉ còn 1 sản phẩm, không thể tăng thêm"
                                      : "Đã đạt số lượng tồn kho tối đa"
                                    : "Tăng số lượng"
                                }
                                style={{
                                  width: 32,
                                  height: 32,
                                  background: isMaxReached ? "#f1f5f9" : "#f8fafc",
                                  border: "none",
                                  cursor: isMaxReached ? "not-allowed" : "pointer",
                                  fontSize: 16,
                                  fontWeight: 600,
                                  color: isMaxReached ? "#cbd5e1" : "#475569",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                +
                              </button>
                            </div>
                          );
                        })()}

                        {/* Price */}
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#0ea5e9",
                          }}
                        >
                          {formatVND((item.price + (item.designFee || 0)) * item.quantity)}
                        </span>

                        {/* Remove */}
                        <button
                          onClick={() => {
                            removeItem(item.cartItemId);
                            message.success("Đã xóa sản phẩm khỏi giỏ hàng");
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 13,
                            fontWeight: 500,
                            padding: "4px 6px",
                            borderRadius: 6,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#ea580c";
                            (e.currentTarget as HTMLButtonElement).style.background = "#fff5f0";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                            (e.currentTarget as HTMLButtonElement).style.background = "none";
                          }}
                        >
                          <DeleteOutlined />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Right: order summary ── */}
              <div style={{ position: "sticky", top: 88, alignSelf: "start" }}>
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    padding: "24px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: "0 0 20px",
                    }}
                  >
                    Tóm tắt đơn hàng
                  </h2>

                  {/* Rows — phí vận chuyển tính khi thanh toán */}
                  {[
                    { label: "Tạm tính", value: formatVND(subtotal) },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 14,
                        color: "#475569",
                        marginBottom: 12,
                      }}
                    >
                      <span>{row.label}</span>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        {row.value}
                      </span>
                    </div>
                  ))}

                  <div
                    style={{
                      borderTop: "1px solid #e2e8f0",
                      margin: "16px 0",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 24,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      Tổng cộng
                    </span>
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#0ea5e9",
                      }}
                    >
                      {formatVND(total)}
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "-14px 0 20px" }}>
                    Phí vận chuyển sẽ được tính ở bước thanh toán.
                  </p>

                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => setPolicyOpen(true)}
                    style={{
                      height: 48,
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    Tiến hành thanh toán
                  </Button>

                  {/* Security note */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginTop: 16,
                      color: "#94a3b8",
                      fontSize: 12,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L4 6v6c0 5.25 3.5 10.14 8 11.5C16.5 22.14 20 17.25 20 12V6l-8-4z"
                        stroke="#94a3b8"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Thanh toán an toàn & được mã hóa
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <CheckoutPolicyModal
          open={policyOpen}
          onCancel={() => setPolicyOpen(false)}
          onConfirm={() => {
            setPolicyOpen(false);
            router.push("/checkout");
          }}
        />
      </main>
      <AppFooter />
    </>
  );
}

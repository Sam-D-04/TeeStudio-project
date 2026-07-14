"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Form,
  Input,
  Radio,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useCartStore } from "@/store/useCartStore";
import useAuthStore from "@/store/useAuthStore";
import {
  createOrder,
  cartItemsToOrderItems,
  type CreateOrderPayload,
} from "@/services/orderService";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

/* ── Helpers ── */
function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

const SHIPPING_FEE = 35_000;

type PaymentMethod = "VNPAY" | "MOMO" | "COD";
/** Các phương thức thanh toán online — chuyển hướng sang cổng thanh toán sau khi tạo đơn */
const ONLINE_PAYMENT_METHODS = new Set<PaymentMethod>(["VNPAY", "MOMO"]);

interface CheckoutFormValues {
  recipientName: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

/* ── Payment method options ── */
const paymentOptions: Array<{
  value: PaymentMethod;
  label: string;
  desc: string;
  icon: React.ReactNode;
}> = [
  {
    value: "VNPAY",
    label: "Thanh toán qua VNPAY",
    desc: "Internet Banking, ATM, QR Pay",
    icon: (
      <svg width="32" height="20" viewBox="0 0 80 24" fill="none">
        <rect width="80" height="24" rx="4" fill="#005BAA" />
        <text
          x="40"
          y="17"
          textAnchor="middle"
          fill="#fff"
          fontSize="12"
          fontWeight="bold"
          fontFamily="Arial"
        >
          VNPAY
        </text>
      </svg>
    ),
  },
  {
    value: "MOMO",
    label: "Thanh toán qua Ví MoMo",
    desc: "Quét mã QR hoặc ứng dụng MoMo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#A50064" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fill="#fff"
          fontSize="11"
          fontWeight="bold"
          fontFamily="Arial"
        >
          M
        </text>
      </svg>
    ),
  },
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng (COD)",
    desc: "Trả tiền mặt khi nhận được hàng",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="1.8" />
        <path
          d="M8 12l3 3 5-5"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function CheckoutPage() {
  const [form]       = Form.useForm<CheckoutFormValues>();
  const router       = useRouter();
  const items        = useCartStore((s) => s.items);
  const totalPrice   = useCartStore((s) => s.totalPrice);
  const clearCart    = useCartStore((s) => s.clearCart);
  const user         = useAuthStore((s) => s.user);
  const token        = useAuthStore((s) => s.accessToken);
  const [loading, setLoading]         = useState(false);
  const [hydrated, setHydrated]       = useState(false);

  /* Hydration guard */
  useEffect(() => setHydrated(true), []);

  /* Pre-fill user data */
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        recipientName: user.fullName ?? "",
        email: user.email ?? "",
      });
    }
  }, [user, form]);

  if (!hydrated) return null;

  const subtotal = totalPrice();
  const total    = subtotal + SHIPPING_FEE;

  /* Redirect if cart is empty */
  if (items.length === 0) {
    return (
      <>
        <AppHeader />
        <main
          style={{
            minHeight: "100vh",
            background: "#f1f5f9",
            paddingTop: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <ShoppingCartOutlined style={{ fontSize: 56, color: "#bec8d2" }} />
            <p style={{ margin: "16px 0 24px", fontSize: 16, color: "#475569", fontWeight: 600 }}>
              Giỏ hàng của bạn đang trống
            </p>
            <Link href="/explore">
              <Button type="primary" size="large" style={{ borderRadius: 10 }}>
                Khám phá sản phẩm
              </Button>
            </Link>
          </div>
        </main>
        <AppFooter />
      </>
    );
  }

  /* ── Submit handler ── */
  const onFinish = async (values: CheckoutFormValues) => {
    if (!token) {
      message.warning("Vui lòng đăng nhập để tiến hành thanh toán");
      router.push("/dang-nhap");
      return;
    }
    setLoading(true);
    try {
      const payload: CreateOrderPayload = {
        recipientName: values.recipientName,
        phone: values.phone,
        email: values.email,
        // Backend nhận field addressLine
        addressLine: values.address,
        note: values.note,
        paymentMethod: values.paymentMethod,
        items: cartItemsToOrderItems(items),
        shippingFee: SHIPPING_FEE,
      };
      const result = await createOrder(payload, token);
      if (ONLINE_PAYMENT_METHODS.has(values.paymentMethod) && result.paymentUrl) {
        clearCart();
        window.location.href = result.paymentUrl;
      } else {
        clearCart();
        router.push(`/thanh-toan-thanh-cong?orderCode=${result.orderCode}&method=COD`);
      }
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Đặt hàng thất bại, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ── */
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
          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <Link
              href="/cart"
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
              Quay lại giỏ hàng
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
              Thanh toán
            </h1>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => void onFinish(v)}
            initialValues={{ paymentMethod: "VNPAY" }}
            requiredMark={false}
          >
            {/* ── 2-column grid ── */}
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}
              className="lg:grid-cols-[1fr_360px]"
            >
              {/* ═══ Left column: delivery + payment ═══ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* ── Delivery info card ── */}
                <section
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
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: "0 0 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1116 0z"
                        stroke="#0ea5e9"
                        strokeWidth="1.8"
                      />
                      <circle cx="12" cy="10" r="2.5" stroke="#0ea5e9" strokeWidth="1.8" />
                    </svg>
                    Thông tin nhận hàng
                  </h2>

                  <div
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}
                    className="max-sm:grid-cols-1"
                  >
                    <Form.Item
                      name="recipientName"
                      label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Họ và tên *</span>}
                      rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                    >
                      <Input
                        placeholder="Nguyễn Văn A"
                        style={{ height: 40, borderRadius: 8 }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="phone"
                      label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Số điện thoại *</span>}
                      rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại" },
                        { pattern: /^(0|\+84)[0-9]{8,9}$/, message: "Số điện thoại không hợp lệ" },
                      ]}
                    >
                      <Input
                        placeholder="0901 234 567"
                        style={{ height: 40, borderRadius: 8 }}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="email"
                    label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Email *</span>}
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input
                      placeholder="email@example.com"
                      style={{ height: 40, borderRadius: 8 }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="address"
                    label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Địa chỉ giao hàng *</span>}
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}
                  >
                    <Input.TextArea
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      rows={3}
                      style={{ borderRadius: 8, resize: "none" }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="note"
                    label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Ghi chú</span>}
                  >
                    <Input.TextArea
                      placeholder="Ghi chú thêm cho đơn hàng (tuỳ chọn)..."
                      rows={2}
                      style={{ borderRadius: 8, resize: "none" }}
                    />
                  </Form.Item>
                </section>

                {/* ── Payment method card ── */}
                <section
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
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: "0 0 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <LockOutlined style={{ color: "#0ea5e9" }} />
                    Phương thức thanh toán
                  </h2>

                  <Form.Item name="paymentMethod" style={{ margin: 0 }}>
                    <Radio.Group style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                      {paymentOptions.map((opt) => (
                        <label
                          key={opt.value}
                          htmlFor={`payment_${opt.value}`}
                          style={{ cursor: "pointer" }}
                        >
                          <Radio
                            id={`payment_${opt.value}`}
                            value={opt.value}
                            style={{ display: "none" }}
                          />
                          <Form.Item noStyle shouldUpdate={(prev, next) => prev.paymentMethod !== next.paymentMethod}>
                            {({ getFieldValue }) => {
                              const selected = getFieldValue("paymentMethod") === opt.value;
                              return (
                                <div
                                  onClick={() => form.setFieldValue("paymentMethod", opt.value)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: "14px 16px",
                                    borderRadius: 10,
                                    border: selected ? "2px solid #0ea5e9" : "1.5px solid #e2e8f0",
                                    background: selected ? "#f0f9ff" : "#ffffff",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                  }}
                                >
                                  {opt.icon}
                                  <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                                      {opt.label}
                                    </p>
                                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                                      {opt.desc}
                                    </p>
                                  </div>
                                  {selected && (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                      <circle cx="12" cy="12" r="10" fill="#0ea5e9" />
                                      <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                              );
                            }}
                          </Form.Item>
                        </label>
                      ))}
                    </Radio.Group>
                  </Form.Item>

                  {/* Security badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 20,
                      padding: "12px 16px",
                      background: "#f0f9ff",
                      borderRadius: 10,
                      border: "1px solid #bae6fd",
                    }}
                  >
                    <SafetyCertificateOutlined style={{ color: "#0ea5e9", fontSize: 16 }} />
                    <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                      Thông tin thanh toán của bạn được mã hóa và bảo mật bởi hệ thống TeeStudio. Chúng tôi không lưu trữ thông tin thẻ.
                    </p>
                  </div>
                </section>
              </div>

              {/* ═══ Right column: order summary ═══ */}
              <div style={{ position: "sticky", top: 88, alignSelf: "start" }}>
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      Đơn hàng của bạn
                    </h2>
                  </div>

                  {/* Mini item list */}
                  <div style={{ maxHeight: 300, overflowY: "auto", padding: "12px 0" }}>
                    {items.map((item) => (
                      <div
                        key={item.cartItemId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "8px 24px",
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            flexShrink: 0,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        >
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <ShoppingCartOutlined style={{ fontSize: 18, color: "#bec8d2" }} />
                          )}
                          {/* Qty badge */}
                          <span
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              background: "#0ea5e9",
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                              borderRadius: "50%",
                              width: 18,
                              height: 18,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {item.quantity}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: "0 0 2px",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#0f172a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                            {item.size} / {item.colorLabel}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0f172a",
                            flexShrink: 0,
                          }}
                        >
                          {formatVND(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
                    {[
                      { label: "Tạm tính", value: formatVND(subtotal) },
                      { label: "Phí vận chuyển", value: formatVND(SHIPPING_FEE) },
                    ].map((r) => (
                      <div
                        key={r.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          color: "#475569",
                          marginBottom: 10,
                        }}
                      >
                        <span>{r.label}</span>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{r.value}</span>
                      </div>
                    ))}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: 12,
                        marginTop: 4,
                        marginBottom: 20,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Tổng cộng</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#0ea5e9" }}>
                        {formatVND(total)}
                      </span>
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      loading={loading}
                      onClick={() => form.submit()}
                      style={{
                        height: 48,
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {loading ? "Đang xử lý..." : "Đặt hàng"}
                    </Button>

                    <p
                      style={{
                        margin: "12px 0 0",
                        fontSize: 11,
                        color: "#94a3b8",
                        textAlign: "center",
                        lineHeight: 1.5,
                      }}
                    >
                      Bằng cách đặt hàng, bạn đồng ý với{" "}
                      <Link href="/about" style={{ color: "#0ea5e9", textDecoration: "none" }}>
                        Điều khoản sử dụng
                      </Link>{" "}
                      của TeeStudio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </main>
      <AppFooter />
    </>
  );
}

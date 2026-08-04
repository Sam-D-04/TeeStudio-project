"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Form,
  Input,
  Radio,
  Select,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useCartStore } from "@/store/useCartStore";
import useAuthStore from "@/store/useAuthStore";
import { authService } from "@/services/authService";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
  createOrder,
  cartItemsToOrderItems,
  type CreateOrderPayload,
} from "@/services/orderService";
import { validatePromotionCode, type PromotionPreview } from "@/services/promotionService";
import { pricingService, type PricingConfiguration } from "@/services/pricingService";
import { addressService, type UserAddress } from "@/services/addressService";
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

type PaymentMethod = "VNPAY" | "MOMO" | "COD";
/** Các phương thức thanh toán online — chuyển hướng sang cổng thanh toán sau khi tạo đơn */
const ONLINE_PAYMENT_METHODS = new Set<PaymentMethod>(["VNPAY", "MOMO"]);

type PaymentType = "FULL" | "DEPOSIT";
/** % cọc khi khách chọn đặt cọc — khớp DEPOSIT_PERCENT bên backend (customer.order.service.js) */
const DEPOSIT_PERCENT = 50;

interface CheckoutFormValues {
  recipientName: string;
  phone: string;
  email: string;
  provinceCode: string;
  wardCode: string;
  addressDetail: string;
  note?: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
}

/* ── Dữ liệu tỉnh/thành – phường/xã (VN, 2 cấp sau sáp nhập hành chính) ── */
interface WardData {
  Code: string;
  Name: string;
  ProvinceCode: string;
}
interface ProvinceData {
  Code: string;
  Name: string;
  Wards: WardData[];
}

/** Bỏ dấu tiếng Việt để so khớp tìm kiếm không phân biệt dấu (vd "ha noi" ra "Hà Nội") */
function stripDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
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
  const [resendingVerification, setResendingVerification] = useState(false);
  const [provinces, setProvinces]     = useState<ProvinceData[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [pricingConfig, setPricingConfig] = useState<PricingConfiguration | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "NEW">("NEW");

  const provinceCode = Form.useWatch("provinceCode", form);
  const watchedPaymentType = Form.useWatch("paymentType", form);

  /** Đơn có ít nhất 1 sản phẩm thiết kế riêng (POD) → áp dụng luật thanh toán
   *  hẳn/cọc 50% và không cho COD toàn phần, khớp guardrail backend
   *  (customer.order.service.js: hasCustomDesign). */
  const hasCustomDesign = items.some((item) => Boolean(item.designId));
  const paymentOptionsVisible = hasCustomDesign
    ? paymentOptions.filter((opt) => opt.value !== "COD")
    : paymentOptions;

  useEffect(() => {
    if (hasCustomDesign && form.getFieldValue("paymentMethod") === "COD") {
      form.setFieldValue("paymentMethod", "VNPAY");
    }
  }, [hasCustomDesign, form]);

  /* ── Mã khuyến mãi ── */
  const [promoInput, setPromoInput]     = useState("");
  const [promoApplying, setPromoApplying] = useState(false);
  const [promoError, setPromoError]     = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromotionPreview | null>(null);

  /* Hydration guard */
  useEffect(() => setHydrated(true), []);

  /* Tải danh sách tỉnh/thành – phường/xã (file tĩnh, chỉ tải 1 lần) */
  useEffect(() => {
    fetch("/data/vn-address.json")
      .then((res) => res.json())
      .then((data: ProvinceData[]) => setProvinces(data))
      .catch(() => message.error("Không tải được danh sách tỉnh/thành, phường/xã"))
      .finally(() => setAddressLoading(false));
  }, []);

  /* Tải cấu hình giá (phí vận chuyển mặc định) */
  useEffect(() => {
    pricingService.getConfig()
      .then(setPricingConfig)
      .catch((err) => console.error("Failed to load pricing config:", err))
      .finally(() => setConfigLoading(false));
  }, []);

  const selectedProvince = provinces.find((p) => p.Code === provinceCode);
  const wardsForProvince = selectedProvince?.Wards ?? [];

  const handleSelectAddress = (id: number | "NEW", addresses = userAddresses) => {
    setSelectedAddressId(id);
    if (id === "NEW") {
      form.resetFields(["recipientName", "phone", "provinceCode", "wardCode", "addressDetail"]);
      if (user) {
        form.setFieldValue("recipientName", user.fullName ?? "");
      }
    } else {
      const address = addresses.find(a => a.id === id);
      if (address) {
        const matchedProvince = provinces.find((p) => p.Name === address.city);
        const matchedWard = matchedProvince?.Wards.find((w) => w.Name === address.ward);
        form.setFieldsValue({
          recipientName: address.recipientName,
          phone: address.phone,
          provinceCode: matchedProvince?.Code,
          wardCode: matchedWard?.Code,
          addressDetail: address.addressLine,
        });
      }
    }
  };

  /* Pre-fill user data & Load saved addresses */
  useEffect(() => {
    if (user && token && provinces.length > 0) {
      // Fetch user addresses only when provinces are loaded so mapping works
      addressService.list().then(addresses => {
        setUserAddresses(addresses);
        const def = addresses.find(a => a.isDefault);
        if (def) {
          handleSelectAddress(def.id, addresses);
        } else if (addresses.length > 0) {
          handleSelectAddress(addresses[0].id, addresses);
        } else {
          // If no address, just fill name and email from user
          form.setFieldsValue({
            recipientName: user.fullName ?? "",
            email: user.email ?? "",
          });
        }
      }).catch(err => console.error("Không tải được sổ địa chỉ", err));
    } else if (user) {
      form.setFieldsValue({
        recipientName: user.fullName ?? "",
        email: user.email ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, provinces]);

  if (!hydrated) return null;

  const subtotal = totalPrice();
  
  let shippingFee = pricingConfig?.defaultShippingFee ?? 30_000;
  if (appliedPromo?.mienPhiVanChuyen) {
    shippingFee = 0;
  } else if (
    !appliedPromo && 
    pricingConfig && 
    pricingConfig.freeShippingThreshold > 0 && 
    subtotal >= pricingConfig.freeShippingThreshold
  ) {
    shippingFee = 0;
  }
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  // Preview số tiền cọc/COD còn lại khi khách chọn đặt cọc — chỉ để hiển thị
  // trước cho khách, số tiền thật do backend tính lại và trả về khi tạo đơn.
  const isDepositSelected = hasCustomDesign && watchedPaymentType === "DEPOSIT";
  const depositPreview = isDepositSelected ? Math.round(total * (DEPOSIT_PERCENT / 100)) : 0;
  const codPreview = isDepositSelected ? Math.max(0, total - depositPreview) : 0;

  /* ── Áp dụng mã khuyến mãi ── */
  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoApplying(true);
    setPromoError(null);
    try {
      const result = await validatePromotionCode(code, subtotal);
      setAppliedPromo(result);
      message.success(`Đã áp dụng mã "${result.code}"`);
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err instanceof Error ? err.message : "Không áp dụng được mã khuyến mãi");
    } finally {
      setPromoApplying(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
    setPromoInput("");
  };

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

  /* Chặn đặt hàng nếu tài khoản chưa xác minh email — mirror check 403 phía
     backend (requireEmailVerified) để khách không điền hết form rồi mới báo lỗi. */
  if (user && !user.emailVerified) {
    const handleResend = async () => {
      setResendingVerification(true);
      try {
        const responseMessage = await authService.resendVerification();
        message.success(responseMessage || "Đã gửi lại email xác minh");
      } catch (err) {
        message.error(getApiErrorMessage(err, "Không thể gửi lại email xác minh."));
      } finally {
        setResendingVerification(false);
      }
    };

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
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <MailOutlined style={{ fontSize: 56, color: "#bec8d2" }} />
            <p style={{ margin: "16px 0 8px", fontSize: 16, color: "#475569", fontWeight: 600 }}>
              Vui lòng xác minh email trước khi đặt hàng
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748b" }}>
              Chúng tôi đã gửi liên kết xác minh tới {user.email}. Kiểm tra hộp thư hoặc gửi lại
              nếu bạn chưa nhận được.
            </p>
            <Button
              type="primary"
              size="large"
              loading={resendingVerification}
              onClick={() => void handleResend()}
              style={{ borderRadius: 10 }}
            >
              Gửi lại email xác minh
            </Button>
          </div>
        </main>
        <AppFooter />
      </>
    );
  }

  /* ── Submit handler ── */
  const onFinish = async (values: CheckoutFormValues) => {
    // Chặn gọi lại khi đang xử lý (double-click, hoặc form bị submit 2 lần) — tránh
    // tạo 2 đơn hàng cho 1 lần đặt.
    if (loading) return;
    if (!token) {
      message.warning("Vui lòng đăng nhập để tiến hành thanh toán");
      router.push("/dang-nhap");
      return;
    }
    setLoading(true);
    try {
      const province = provinces.find((p) => p.Code === values.provinceCode);
      const ward = province?.Wards.find((w) => w.Code === values.wardCode);
      const addressLine = [values.addressDetail, ward?.Name, province?.Name]
        .filter(Boolean)
        .join(", ");

      const payload: CreateOrderPayload = {
        recipientName: values.recipientName,
        phone: values.phone,
        email: values.email,
        addressLine,
        city: province?.Name,
        ward: ward?.Name,
        note: values.note,
        paymentMethod: values.paymentMethod,
        paymentType: hasCustomDesign ? values.paymentType : "FULL",
        items: cartItemsToOrderItems(items),
        shippingFee: shippingFee,
        ...(appliedPromo ? { promotionId: appliedPromo.promotionId } : {}),
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
            initialValues={{ paymentMethod: "VNPAY", paymentType: "FULL" }}
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
                    Thông tin liên hệ & nhận hàng
                  </h2>

                  <Form.Item
                    name="email"
                    label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Email liên hệ *</span>}
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

                  {/* Phần chọn địa chỉ có sẵn nếu đã đăng nhập và có địa chỉ */}
                  {userAddresses.length > 0 && (
                    <div style={{ marginBottom: 24, marginTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Sổ địa chỉ của bạn</span>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {userAddresses.map(a => {
                          const isSelected = selectedAddressId === a.id;
                          return (
                            <div 
                              key={a.id}
                              onClick={() => handleSelectAddress(a.id)}
                              style={{ 
                                padding: 16, 
                                borderRadius: 12, 
                                border: isSelected ? "2px solid #0ea5e9" : "1px solid #e2e8f0",
                                background: isSelected ? "#f0f9ff" : "#fff",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                  <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                                    {a.recipientName}
                                    {a.isDefault && (
                                      <span style={{ fontSize: 10, padding: "2px 6px", background: "#0ea5e9", color: "#fff", borderRadius: 4, fontWeight: 700 }}>
                                        Mặc định
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>SĐT: {a.phone}</div>
                                  <div style={{ fontSize: 13, color: "#475569" }}>{a.addressLine}, {a.ward}, {a.city}</div>
                                </div>
                                {isSelected && (
                                  <div style={{ color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, background: "#fff", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* Nút thêm địa chỉ mới */}
                        <div 
                          onClick={() => handleSelectAddress("NEW")}
                          style={{ 
                            padding: 16, 
                            borderRadius: 12, 
                            border: selectedAddressId === "NEW" ? "2px solid #0ea5e9" : "1px dashed #cbd5e1",
                            background: selectedAddressId === "NEW" ? "#f0f9ff" : "transparent",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            color: selectedAddressId === "NEW" ? "#0ea5e9" : "#64748b",
                            fontWeight: 600,
                            fontSize: 14,
                            transition: "all 0.2s ease",
                            justifyContent: "center"
                          }}
                        >
                          <PlusOutlined /> Giao đến địa chỉ mới khác
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: selectedAddressId === "NEW" || userAddresses.length === 0 ? "block" : "none" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 12, marginTop: userAddresses.length > 0 ? 12 : 0 }}>
                      {userAddresses.length > 0 ? "Nhập địa chỉ nhận hàng mới:" : ""}
                    </div>
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
                    
                    <div
                      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}
                      className="max-sm:grid-cols-1"
                    >
                      <Form.Item
                        name="provinceCode"
                        label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Tỉnh/Thành phố *</span>}
                        rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
                      >
                        <Select
                          showSearch
                          loading={addressLoading}
                          placeholder="Tìm tỉnh/thành phố..."
                          style={{ height: 40 }}
                          options={provinces.map((p) => ({ value: p.Code, label: p.Name }))}
                          filterOption={(input, option) =>
                            stripDiacritics(option?.label ?? "").includes(stripDiacritics(input))
                          }
                          onChange={() => form.setFieldValue("wardCode", undefined)}
                        />
                      </Form.Item>

                      <Form.Item
                        name="wardCode"
                        label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Phường/Xã *</span>}
                        rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
                      >
                        <Select
                          showSearch
                          disabled={!provinceCode}
                          placeholder={provinceCode ? "Tìm phường/xã..." : "Chọn tỉnh/thành phố trước"}
                          style={{ height: 40 }}
                          options={wardsForProvince.map((w) => ({ value: w.Code, label: w.Name }))}
                          filterOption={(input, option) =>
                            stripDiacritics(option?.label ?? "").includes(stripDiacritics(input))
                          }
                        />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="addressDetail"
                      label={<span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>Số nhà, tên đường *</span>}
                      rules={[{ required: true, message: "Vui lòng nhập số nhà, tên đường" }]}
                    >
                      <Input
                        placeholder="Vd: 12 Nguyễn Trãi"
                        style={{ height: 40, borderRadius: 8 }}
                      />
                    </Form.Item>
                  </div>

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

                  {/* Loại thanh toán (toàn bộ / cọc 50%) — chỉ áp dụng đơn có
                      sản phẩm thiết kế riêng (POD), khớp guardrail backend */}
                  {hasCustomDesign && (
                    <div style={{ marginBottom: 20 }}>
                      <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                        Loại thanh toán
                      </p>
                      <Form.Item
                        name="paymentType"
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: "Chọn loại thanh toán" }]}
                      >
                        <Radio.Group style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                          {(
                            [
                              {
                                value: "FULL" as const,
                                label: "Thanh toán toàn bộ",
                                desc: "Thanh toán 100% giá trị đơn hàng ngay bây giờ",
                              },
                              {
                                value: "DEPOSIT" as const,
                                label: `Đặt cọc ${DEPOSIT_PERCENT}%`,
                                desc: "Trả trước 50% online, phần còn lại thanh toán khi nhận hàng (COD)",
                              },
                            ]
                          ).map((opt) => (
                            <label key={opt.value} htmlFor={`payment_type_${opt.value}`} style={{ cursor: "pointer" }}>
                              <Radio id={`payment_type_${opt.value}`} value={opt.value} style={{ display: "none" }} />
                              <Form.Item noStyle shouldUpdate={(prev, next) => prev.paymentType !== next.paymentType}>
                                {({ getFieldValue }) => {
                                  const selected = getFieldValue("paymentType") === opt.value;
                                  return (
                                    <div
                                      onClick={() => form.setFieldValue("paymentType", opt.value)}
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        padding: "10px 14px",
                                        borderRadius: 10,
                                        border: selected ? "2px solid #0ea5e9" : "1.5px solid #e2e8f0",
                                        background: selected ? "#f0f9ff" : "#ffffff",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                      }}
                                    >
                                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{opt.label}</span>
                                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{opt.desc}</span>
                                    </div>
                                  );
                                }}
                              </Form.Item>
                            </label>
                          ))}
                        </Radio.Group>
                      </Form.Item>
                      <p style={{ margin: "10px 0 0", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                        Đơn có sản phẩm thiết kế riêng cần thanh toán online trước — chọn thanh
                        toán toàn bộ hoặc đặt cọc {DEPOSIT_PERCENT}%, phần còn lại thu COD khi
                        giao hàng.
                      </p>
                    </div>
                  )}

                  <Form.Item name="paymentMethod" style={{ margin: 0 }}>
                    <Radio.Group style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                      {paymentOptionsVisible.map((opt) => (
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
                            // Sản phẩm có thiết kế riêng: dùng màu áo làm nền vì ảnh in
                            // là PNG nền trong suốt, chỉ chứa nội dung đã in.
                            background: item.designId ? item.color : "#f8fafc",
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
                              style={{ width: "100%", height: "100%", objectFit: item.designId ? "contain" : "cover" }}
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

                  {/* Mã khuyến mãi */}
                  <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
                    {appliedPromo ? (
                      <div
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 12px", background: "#f0fdf4",
                          border: "1px solid #bbf7d0", borderRadius: 8,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>
                          🎉 Mã &quot;{appliedPromo.code}&quot; đã áp dụng
                        </span>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          style={{ background: "none", border: "none", color: "#16a34a", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0 }}
                        >
                          Xoá
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Input
                            placeholder="Nhập mã khuyến mãi"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            onPressEnter={() => void handleApplyPromo()}
                            style={{ height: 40, borderRadius: 8 }}
                          />
                          <Button
                            onClick={() => void handleApplyPromo()}
                            loading={promoApplying}
                            disabled={!promoInput.trim()}
                            style={{ height: 40, borderRadius: 8, flexShrink: 0 }}
                          >
                            Áp dụng
                          </Button>
                        </div>
                        {promoError && (
                          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#dc2626" }}>{promoError}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Totals */}
                  <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
                    {[ 
                      { label: "Tạm tính", value: formatVND(subtotal) },
                      { label: "Phí vận chuyển", value: configLoading ? <Spin size="small" /> : formatVND(shippingFee) },
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

                    {discountAmount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          color: "#16a34a",
                          marginBottom: 10,
                        }}
                      >
                        <span>Giảm giá ({appliedPromo?.code})</span>
                        <span style={{ fontWeight: 600 }}>−{formatVND(discountAmount)}</span>
                      </div>
                    )}

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

                    {isDepositSelected && (
                      <div
                        style={{
                          marginBottom: 20,
                          padding: "12px 14px",
                          background: "#f0f9ff",
                          border: "1px solid #bae6fd",
                          borderRadius: 10,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                          <span style={{ color: "#475569" }}>Đặt cọc ({DEPOSIT_PERCENT}%) — thanh toán ngay</span>
                          <strong style={{ color: "#0ea5e9" }}>{formatVND(depositPreview)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#475569" }}>Còn lại — thanh toán khi nhận hàng (COD)</span>
                          <strong style={{ color: "#0f172a" }}>{formatVND(codPreview)}</strong>
                        </div>
                      </div>
                    )}

                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      size="large"
                      loading={loading}
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

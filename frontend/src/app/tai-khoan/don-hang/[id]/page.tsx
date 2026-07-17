"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Spin, message } from "antd";
import { ArrowLeftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import CustomerOrderStatusBadge from "@/components/orders/CustomerOrderStatusBadge";
import useAuthStore from "@/store/useAuthStore";
import { getOrderById, type OrderDetail } from "@/services/orderService";

/* ── Hàm hỗ trợ định dạng ── */
function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNgayGio(isoString: string) {
  const ngay = new Date(isoString);
  return ngay.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Nhãn tiếng Việt cho phương thức thanh toán (dữ liệu DB đang là tiếng Anh viết hoa)
const NHAN_PHUONG_THUC_THANH_TOAN: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VNPAY",
  MOMO: "Ví MoMo",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

export default function ChiTietDonHangPage() {
  const router = useRouter();
  const params = useParams();
  // params.id luôn là string (hoặc mảng nếu route có nhiều segment) - ép về số ở đây
  const orderId = Number(Array.isArray(params.id) ? params.id[0] : params.id);

  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  const [donHang, setDonHang] = useState<OrderDetail | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [loiKhongTimThay, setLoiKhongTimThay] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/dang-nhap");
    }
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!user) return;
    if (!Number.isInteger(orderId) || orderId < 1) {
      setLoiKhongTimThay(true);
      setDangTai(false);
      return;
    }

    setDangTai(true);
    setLoiKhongTimThay(false);
    getOrderById(orderId)
      .then((ketQua) => setDonHang(ketQua))
      .catch(() => {
        // Backend trả 404 cho cả 2 trường hợp: đơn không tồn tại HOẶC đơn của
        // người khác - không phân biệt để tránh lộ thông tin cho khách dò ID
        setLoiKhongTimThay(true);
      })
      .finally(() => setDangTai(false));
  }, [user, orderId]);

  if (!hydrated || !user) return null;

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
          {/* ── Đường dẫn quay lại ── */}
          <div style={{ marginBottom: 28 }}>
            <Link
              href="/tai-khoan/don-hang"
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
              Đơn hàng của tôi
            </Link>
          </div>

          {dangTai ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <Spin size="large" />
            </div>
          ) : loiKhongTimThay || !donHang ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                padding: "64px 24px",
                textAlign: "center",
              }}
            >
              <ShoppingCartOutlined style={{ fontSize: 48, color: "#bec8d2" }} />
              <p style={{ margin: "16px 0 24px", fontSize: 15, color: "#475569", fontWeight: 600 }}>
                Không tìm thấy đơn hàng này
              </p>
              <Link href="/tai-khoan/don-hang">
                <Button type="primary" size="large" style={{ borderRadius: 10 }}>
                  Về danh sách đơn hàng
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* ── Tiêu đề đơn hàng ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 28,
                }}
              >
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.5px",
                    margin: 0,
                  }}
                >
                  Đơn {donHang.orderCode}
                </h1>
                <CustomerOrderStatusBadge status={donHang.status} />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  Đặt lúc {formatNgayGio(donHang.createdAt)}
                </span>
              </div>

              {/* ── Lý do hủy (nếu đơn đã bị hủy) ── */}
              {donHang.status === "CANCELLED" && donHang.lyDoHuy && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 12,
                    padding: "14px 18px",
                    marginBottom: 20,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>
                    <strong>Lý do hủy đơn:</strong> {donHang.lyDoHuy}
                  </p>
                </div>
              )}

              {/* ── 2 cột: sản phẩm/lịch sử bên trái, tổng kết bên phải ── */}
              <div
                style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}
                className="lg:grid-cols-[1fr_360px]"
              >
                {/* ═══ Cột trái ═══ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Danh sách sản phẩm trong đơn */}
                  <section
                    style={{
                      background: "#ffffff",
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      padding: 24,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: "0 0 16px",
                      }}
                    >
                      Sản phẩm trong đơn
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {donHang.items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            paddingBottom: 16,
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              flexShrink: 0,
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {item.anhSanPham ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.anhSanPham}
                                alt={item.tenSanPham}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: item.coThietKeRieng ? "contain" : "cover",
                                }}
                              />
                            ) : (
                              <ShoppingCartOutlined style={{ fontSize: 18, color: "#bec8d2" }} />
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                              {item.tenSanPham}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                              {item.kichCo} / {item.mauSac} · SL: {item.soLuong}
                              {item.phiThietKeVnd > 0 && " · Có thiết kế riêng"}
                            </p>
                          </div>

                          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
                            {formatVND(item.thanhTienVnd)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Lịch sử thay đổi trạng thái - timeline dạng chấm tròn nối dây */}
                  <section
                    style={{
                      background: "#ffffff",
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      padding: 24,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: "0 0 16px",
                      }}
                    >
                      Lịch sử xử lý đơn hàng
                    </h2>

                    <div>
                      {donHang.lichSuTrangThai.map((moc, index) => {
                        const laMocCuoi = index === donHang.lichSuTrangThai.length - 1;
                        return (
                          <div key={index} style={{ display: "flex", gap: 12 }}>
                            {/* Chấm tròn + dây nối xuống mốc tiếp theo */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <span
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  flexShrink: 0,
                                  marginTop: 4,
                                  background: laMocCuoi ? "#0ea5e9" : "#cbd5e1",
                                }}
                              />
                              {!laMocCuoi && (
                                <span style={{ width: 2, flex: 1, background: "#e2e8f0", minHeight: 24 }} />
                              )}
                            </div>

                            {/* Nội dung mốc trạng thái */}
                            <div style={{ paddingBottom: 20 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                {moc.trangThaiLabel}
                              </p>
                              {moc.ghiChu && (
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#475569" }}>
                                  {moc.ghiChu}
                                </p>
                              )}
                              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
                                {formatNgayGio(moc.thoiGian)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* ═══ Cột phải: địa chỉ + tổng kết ═══ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Địa chỉ giao hàng */}
                  <section
                    style={{
                      background: "#ffffff",
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      padding: 24,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: "0 0 12px",
                      }}
                    >
                      Địa chỉ giao hàng
                    </h2>
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {donHang.diaChiGiaoHang.tenNguoiNhan}
                    </p>
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: "#475569" }}>
                      {donHang.diaChiGiaoHang.soDienThoai}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                      {donHang.diaChiGiaoHang.diaChiChiTiet}
                      {donHang.diaChiGiaoHang.phuongXa && `, ${donHang.diaChiGiaoHang.phuongXa}`}
                      {donHang.diaChiGiaoHang.tinhThanh && `, ${donHang.diaChiGiaoHang.tinhThanh}`}
                    </p>

                    {/* Thông tin vận chuyển - chỉ hiện khi đơn đã được bàn giao vận chuyển */}
                    {(donHang.donViVanChuyen || donHang.maVanDon) && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                        {donHang.donViVanChuyen && (
                          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#94a3b8" }}>
                            Đơn vị vận chuyển:{" "}
                            <span style={{ color: "#0f172a", fontWeight: 600 }}>
                              {donHang.donViVanChuyen}
                            </span>
                          </p>
                        )}
                        {donHang.maVanDon && (
                          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                            Mã vận đơn:{" "}
                            <span style={{ color: "#0f172a", fontWeight: 600 }}>{donHang.maVanDon}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Tổng kết đơn hàng */}
                  <section
                    style={{
                      background: "#ffffff",
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      padding: 24,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: "0 0 16px",
                      }}
                    >
                      Tổng kết đơn hàng
                    </h2>

                    {[
                      { label: "Tạm tính", value: donHang.subtotal },
                      { label: "Phí vận chuyển", value: donHang.shippingFee },
                      ...(donHang.discountAmount > 0
                        ? [{ label: "Giảm giá", value: -donHang.discountAmount }]
                        : []),
                    ].map((dong) => (
                      <div
                        key={dong.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          color: "#475569",
                          marginBottom: 10,
                        }}
                      >
                        <span>{dong.label}</span>
                        <span style={{ fontWeight: 600, color: dong.value < 0 ? "#16a34a" : "#0f172a" }}>
                          {dong.value < 0 ? "-" : ""}
                          {formatVND(Math.abs(dong.value))}
                        </span>
                      </div>
                    ))}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: 12,
                        marginTop: 4,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Tổng cộng</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#0ea5e9" }}>
                        {formatVND(donHang.totalAmount)}
                      </span>
                    </div>

                    {/* Đơn thanh toán cọc thì hiện thêm phần đã cọc / còn lại COD */}
                    {donHang.paymentType === "DEPOSIT" && (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop: "1px dashed #e2e8f0",
                          fontSize: 12,
                          color: "#475569",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span>Đã đặt cọc</span>
                          <span style={{ fontWeight: 600 }}>{formatVND(donHang.depositAmount)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Thanh toán khi nhận hàng (COD)</span>
                          <span style={{ fontWeight: 600 }}>{formatVND(donHang.codAmount)}</span>
                        </div>
                      </div>
                    )}

                    {/* Lịch sử các lượt thanh toán */}
                    {donHang.thanhToan.length > 0 && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed #e2e8f0" }}>
                        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                          Phương thức thanh toán
                        </p>
                        {donHang.thanhToan.map((lanThanhToan, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12,
                              color: "#475569",
                              marginBottom: 4,
                            }}
                          >
                            <span>
                              {NHAN_PHUONG_THUC_THANH_TOAN[lanThanhToan.phuongThuc] ||
                                lanThanhToan.phuongThuc}
                            </span>
                            <span style={{ fontWeight: 600 }}>
                              {lanThanhToan.trangThai === "COMPLETED" ? "Đã thanh toán" : "Chưa thanh toán"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </>
  );
}

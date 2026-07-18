"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Empty, Pagination, Spin, message } from "antd";
import { ArrowLeftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import CustomerOrderStatusBadge from "@/components/orders/CustomerOrderStatusBadge";
import useAuthStore from "@/store/useAuthStore";
import { getMyOrders, type OrderListItem } from "@/services/orderService";

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

// Số đơn hàng hiển thị trên mỗi trang
const SO_DON_MOI_TRANG = 10;

export default function DonHangCuaToiPage() {
  const router = useRouter();

  // Thông tin đăng nhập - trang này chỉ dành cho khách hàng đã đăng nhập
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  const [danhSachDon, setDanhSachDon] = useState<OrderListItem[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoDon, setTongSoDon] = useState(0);

  /* Đồng bộ lại trạng thái đăng nhập từ localStorage khi vào trang trực tiếp
     (vd. gõ URL, F5 lại trang) - giống cách HeaderAuthActions.tsx đang làm. */
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  /* Chưa đăng nhập thì không có gì để xem - đưa về trang đăng nhập.
     Chỉ redirect SAU KHI đã hydrate xong, tránh đá nhầm người dùng đã đăng
     nhập ra ngoài trong lúc localStorage chưa kịp đọc ở lần render đầu. */
  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/dang-nhap");
    }
  }, [hydrated, user, router]);

  /* Tải danh sách đơn hàng của trang hiện tại */
  useEffect(() => {
    if (!user) return;

    setDangTai(true);
    getMyOrders(trangHienTai, SO_DON_MOI_TRANG)
      .then((ketQua) => {
        setDanhSachDon(ketQua.items);
        setTongSoDon(ketQua.total);
      })
      .catch((err) => {
        message.error(
          err instanceof Error ? err.message : "Không tải được danh sách đơn hàng"
        );
      })
      .finally(() => setDangTai(false));
  }, [user, trangHienTai]);

  // Chưa hydrate xong hoặc chưa đăng nhập thì chưa render gì (tránh nháy giao diện)
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
          {/* ── Tiêu đề trang ── */}
          <div style={{ marginBottom: 28 }}>
            <Link
              href="/"
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
              Về trang chủ
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
              Đơn hàng của tôi
            </h1>
          </div>

          {/* ── Nội dung chính ── */}
          {dangTai ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
              <Spin size="large" />
            </div>
          ) : danhSachDon.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                padding: "64px 24px",
              }}
            >
              <Empty
                image={<ShoppingCartOutlined style={{ fontSize: 56, color: "#bec8d2" }} />}
                description={
                  <span style={{ color: "#475569", fontSize: 15, fontWeight: 600 }}>
                    Bạn chưa có đơn hàng nào
                  </span>
                }
              >
                <Link href="/explore">
                  <Button type="primary" size="large" style={{ borderRadius: 10 }}>
                    Khám phá sản phẩm
                  </Button>
                </Link>
              </Empty>
            </div>
          ) : (
            <>
              {/* ── Danh sách đơn hàng ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {danhSachDon.map((donHang) => (
                  <Link
                    key={donHang.id}
                    href={`/tai-khoan/don-hang/${donHang.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: 16,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        transition: "all 0.15s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#bae6fd";
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "0 4px 16px rgba(14,165,233,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
                        (e.currentTarget as HTMLDivElement).style.boxShadow =
                          "0 1px 4px rgba(0,0,0,0.05)";
                      }}
                    >
                      {/* Ảnh đại diện đơn hàng */}
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          background: "#f8fafc",
                          flexShrink: 0,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {donHang.anhDaiDien ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={donHang.anhDaiDien}
                            alt={donHang.tenSanPhamDauTien}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <ShoppingCartOutlined style={{ fontSize: 22, color: "#bec8d2" }} />
                        )}
                      </div>

                      {/* Thông tin chính của đơn */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 4,
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                            {donHang.orderCode}
                          </span>
                          <CustomerOrderStatusBadge status={donHang.status} />
                        </div>
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: 13,
                            color: "#475569",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {donHang.tenSanPhamDauTien}
                          {donHang.soLuongMatHang > 1 &&
                            ` và ${donHang.soLuongMatHang - 1} sản phẩm khác`}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                          Đặt lúc {formatNgayGio(donHang.createdAt)}
                        </p>
                      </div>

                      {/* Tổng tiền + mũi tên xem chi tiết */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Tổng tiền</p>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0ea5e9" }}>
                          {formatVND(donHang.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* ── Phân trang - chỉ hiện khi nhiều hơn 1 trang ── */}
              {tongSoDon > SO_DON_MOI_TRANG && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
                  <Pagination
                    current={trangHienTai}
                    pageSize={SO_DON_MOI_TRANG}
                    total={tongSoDon}
                    onChange={(trangMoi) => setTrangHienTai(trangMoi)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </>
  );
}

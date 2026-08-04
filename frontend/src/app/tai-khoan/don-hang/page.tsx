"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Empty, Pagination, Spin, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import CustomerOrderStatusBadge from "@/components/orders/CustomerOrderStatusBadge";
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
  const [danhSachDon, setDanhSachDon] = useState<OrderListItem[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoDon, setTongSoDon] = useState(0);

  /* Tải danh sách đơn hàng của trang hiện tại - trang này chỉ render bên
     trong /tai-khoan/layout.tsx, nơi đã đảm bảo khách đã đăng nhập. */
  useEffect(() => {
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
  }, [trangHienTai]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
          Đơn hàng của tôi
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
          Theo dõi trạng thái và lịch sử các đơn hàng đã đặt.
        </p>
      </div>

      {dangTai ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      ) : danhSachDon.length === 0 ? (
        <div style={{ padding: "48px 0" }}>
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
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "16px 20px",
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
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
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
  );
}

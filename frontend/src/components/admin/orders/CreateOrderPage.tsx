"use client";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Divider,
  Empty,
  Form,
  InputNumber,
  Radio,
  Select,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  message,
} from "antd";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as orderService from "@/services/admin/orderService";
import type {
  BienTheSanPham,
  DiaChiGiaoHang,
  KhachHang,
  KhuyenMai,
  SanPhamTimKiem,
  TaoMoiDonHangInput,
  ThietKe,
} from "@/services/admin/orderService";

type CreateOrderFormValues = {
  userId?: number;
  addressId?: number;
  items?: Array<{
    productId?: number;
    variantId?: number;
    quantity?: number;
    designId?: number;
  }>;
  paymentMethod?: TaoMoiDonHangInput["paymentMethod"];
  paymentType?: TaoMoiDonHangInput["paymentType"];
  shippingFee?: number;
  promotionId?: number;
};

type OrderPreviewLine = {
  product?: SanPhamTimKiem;
  variant?: BienTheSanPham;
  quantity: number;
  design?: ThietKe;
  unitPrice: number;
  lineProductTotal: number;
  designFee: number;
  lineTotal: number;
  discountPercent?: number;
  bulkMinQty?: number;
};

type OrderPreview = {
  lines: OrderPreviewLine[];
  subtotal: number;
  designFee: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  selectedPromotion?: KhuyenMai;
  promotionBaseAmount: number;
  promotionNotEligible: boolean;
};

const initialValues: CreateOrderFormValues = {
  items: [{ quantity: 1 }],
  paymentMethod: "COD",
  paymentType: "FULL",
  shippingFee: 0,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));
}

function getApiErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string; errors?: Array<{ message?: string }> }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message
    );
  }

  if (error instanceof Error) return error.message;
  return "Không thể tạo đơn hàng. Vui lòng thử lại.";
}

function useDebouncedValue(value: string, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}

function uniqueById<T extends { id: number }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function tinhDonGiaPreview(product: SanPhamTimKiem | undefined, quantity: number) {
  if (!product) {
    return { unitPrice: 0, discountPercent: undefined, bulkMinQty: undefined };
  }

  const matched = [...product.bangGiaSi]
    .filter((muc) => quantity >= muc.soLuongToiThieu)
    .sort((a, b) => b.soLuongToiThieu - a.soLuongToiThieu)[0];

  if (!matched) {
    return {
      unitPrice: product.giaGoc,
      discountPercent: undefined,
      bulkMinQty: undefined,
    };
  }

  return {
    unitPrice: Math.round(product.giaGoc * (1 - matched.phanTramGiam / 100)),
    discountPercent: matched.phanTramGiam,
    bulkMinQty: matched.soLuongToiThieu,
  };
}

function tinhGiamGiaPreview(
  promotion: KhuyenMai | undefined,
  promotionBaseAmount: number
) {
  if (!promotion || promotionBaseAmount < promotion.donHangToiThieu) return 0;

  const discount =
    promotion.loaiGiam === "PERCENT"
      ? promotionBaseAmount * (promotion.giaTriGiam / 100)
      : promotion.giaTriGiam;

  return Math.min(Math.round(discount), promotionBaseAmount);
}

function buildPreview(
  values: CreateOrderFormValues,
  productById: Record<number, SanPhamTimKiem>,
  designById: Record<number, ThietKe>,
  promotions: KhuyenMai[]
): OrderPreview {
  const lines =
    values.items?.map((item) => {
      const quantity = Math.max(1, Number(item?.quantity) || 1);
      const product = item?.productId ? productById[item.productId] : undefined;
      const variant = product?.bienThe.find((v) => v.id === item?.variantId);
      const design = item?.designId ? designById[item.designId] : undefined;
      const { unitPrice, discountPercent, bulkMinQty } = tinhDonGiaPreview(
        product,
        quantity
      );
      const lineProductTotal = unitPrice * quantity;
      const designFee = design?.phiThietKe ?? 0;

      return {
        product,
        variant,
        quantity,
        design,
        unitPrice,
        lineProductTotal,
        designFee,
        lineTotal: lineProductTotal + designFee,
        discountPercent,
        bulkMinQty,
      };
    }) ?? [];

  const subtotal = lines.reduce((sum, line) => sum + line.lineProductTotal, 0);
  const designFee = lines.reduce((sum, line) => sum + line.designFee, 0);
  const shippingFee = Math.max(0, Number(values.shippingFee) || 0);
  const selectedPromotion = values.promotionId
    ? promotions.find((promo) => promo.id === values.promotionId)
    : undefined;
  const promotionBaseAmount = subtotal + designFee;
  const discountAmount = tinhGiamGiaPreview(
    selectedPromotion,
    promotionBaseAmount
  );
  const totalAmount = Math.max(
    0,
    subtotal + designFee + shippingFee - discountAmount
  );

  return {
    lines,
    subtotal,
    designFee,
    discountAmount,
    shippingFee,
    totalAmount,
    selectedPromotion,
    promotionBaseAmount,
    promotionNotEligible:
      Boolean(selectedPromotion) &&
      promotionBaseAmount < (selectedPromotion?.donHangToiThieu ?? 0),
  };
}

function SectionPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-admin-card">
      <div className="mb-4">
        <h3 className="text-card-title text-text-main">{title}</h3>
        {description ? (
          <p className="mt-1 text-body-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function CustomerSection({
  customers,
  addresses,
  isSearchingCustomers,
  isLoadingAddresses,
  onCustomerSearch,
  onCustomerChange,
}: {
  customers: KhachHang[];
  addresses: DiaChiGiaoHang[];
  isSearchingCustomers: boolean;
  isLoadingAddresses: boolean;
  onCustomerSearch: (value: string) => void;
  onCustomerChange: (value?: number) => void;
}) {
  return (
    <SectionPanel
      title="1. Chọn khách hàng"
      description="Tìm theo số điện thoại, tên hoặc email rồi chọn địa chỉ giao hàng của khách."
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Form.Item
          label="Khách hàng"
          name="userId"
          rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
        >
          <Select
            allowClear
            showSearch
            filterOption={false}
            loading={isSearchingCustomers}
            onSearch={onCustomerSearch}
            onChange={onCustomerChange}
            placeholder="Nhập SĐT, tên hoặc email"
            suffixIcon={<SearchOutlined />}
            options={customers.map((customer) => ({
              value: customer.id,
              label: (
                <div className="flex flex-col py-1">
                  <span className="font-semibold text-text-main">
                    {customer.hoTen}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {customer.soDienThoai || "Chưa có SĐT"} · {customer.email}
                  </span>
                </div>
              ),
            }))}
            notFoundContent={
              isSearchingCustomers ? "Đang tìm..." : "Không có khách hàng phù hợp"
            }
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ giao hàng"
          name="addressId"
          rules={[{ required: true, message: "Vui lòng chọn địa chỉ giao hàng" }]}
        >
          <Select
            disabled={addresses.length === 0}
            loading={isLoadingAddresses}
            placeholder={
              addresses.length > 0
                ? "Chọn địa chỉ giao hàng"
                : "Chọn khách hàng trước"
            }
            options={addresses.map((address) => ({
              value: address.id,
              label: (
                <div className="flex flex-col py-1">
                  <span className="font-semibold text-text-main">
                    {address.tenNguoiNhan} · {address.soDienThoai}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {address.diaChiDayDu}
                  </span>
                </div>
              ),
            }))}
          />
        </Form.Item>
      </div>

      {!isLoadingAddresses && addresses.length === 0 ? (
        <Alert
          showIcon
          type="info"
          className="mt-1"
          title="Sau khi chọn khách hàng, hệ thống sẽ tải địa chỉ giao hàng từ backend."
        />
      ) : null}
    </SectionPanel>
  );
}

function DesignPicker({
  rowIndex,
  userId,
  productId,
  variantId,
  designs,
  isLoadingDesigns,
  onDesignSearch,
}: {
  rowIndex: number;
  userId?: number;
  productId?: number;
  variantId?: number;
  designs: ThietKe[];
  isLoadingDesigns: boolean;
  onDesignSearch: (value: string) => void;
}) {
  const compatibleDesigns = designs.filter((design) => {
    if (!productId) return true;
    if (design.productId !== productId) return false;
    if (!variantId || design.variantId === null) return true;
    return design.variantId === variantId;
  });

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
      <Form.Item
        label="Thiết kế POD"
        name={[rowIndex, "designId"]}
        className="mb-0"
      >
        <Select
          allowClear
          showSearch
          disabled={!userId}
          filterOption={false}
          loading={isLoadingDesigns}
          onSearch={onDesignSearch}
          placeholder={
            userId ? "Chọn thiết kế đã duyệt nếu là đơn POD" : "Chọn khách hàng trước"
          }
          options={compatibleDesigns.map((design) => ({
            value: design.id,
            label: (
              <div className="flex items-center gap-3 py-1">
                {design.anhXemTruoc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    src={design.anhXemTruoc}
                    className="h-9 w-9 rounded-md border border-border object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="truncate font-semibold text-text-main">
                    Thiết kế #{design.id} · {design.tenSanPham}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Phí thiết kế {formatCurrency(design.phiThietKe)}
                  </div>
                </div>
              </div>
            ),
          }))}
          notFoundContent={
            userId
              ? isLoadingDesigns
                ? "Đang tải thiết kế..."
                : "Không có thiết kế phù hợp"
              : "Chưa chọn khách hàng"
          }
        />
      </Form.Item>

      <Button
        type="default"
        href="/admin/thiet-ke"
        className="mt-[30px] h-10 rounded-[10px] font-semibold"
      >
        Thiết kế & In ấn
      </Button>
    </div>
  );
}

function ProductItemRow({
  fieldName,
  canRemove,
  productOptions,
  productById,
  userId,
  designs,
  isSearchingProducts,
  isLoadingDesigns,
  previewLine,
  onProductSearch,
  onProductChange,
  onVariantChange,
  onDesignSearch,
  onRemove,
}: {
  fieldName: number;
  canRemove: boolean;
  productOptions: SanPhamTimKiem[];
  productById: Record<number, SanPhamTimKiem>;
  userId?: number;
  designs: ThietKe[];
  isSearchingProducts: boolean;
  isLoadingDesigns: boolean;
  previewLine?: OrderPreviewLine;
  onProductSearch: (value: string) => void;
  onProductChange: (rowIndex: number, productId?: number) => void;
  onVariantChange: (rowIndex: number) => void;
  onDesignSearch: (value: string) => void;
  onRemove: () => void;
}) {
  const product = previewLine?.product;
  const variant = previewLine?.variant;
  const selectedProductId = product?.id;
  const availableVariants = selectedProductId
    ? productById[selectedProductId]?.bienThe ?? []
    : [];

  return (
    <div className="rounded-xl border border-border bg-surface-alt p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-text-main">
            Sản phẩm #{fieldName + 1}
          </h4>
          <p className="mt-1 text-xs text-text-secondary">
            Chọn phôi áo, biến thể màu/size và số lượng đặt.
          </p>
        </div>

        {canRemove ? (
          <Tooltip title="Xóa dòng sản phẩm">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={onRemove}
              aria-label="Xóa dòng sản phẩm"
            />
          </Tooltip>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr_150px]">
        <Form.Item
          label="Sản phẩm / phôi áo"
          name={[fieldName, "productId"]}
          rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
        >
          <Select
            showSearch
            filterOption={false}
            loading={isSearchingProducts}
            onSearch={onProductSearch}
            onChange={(value) => onProductChange(fieldName, value)}
            placeholder="Tìm sản phẩm theo tên"
            suffixIcon={<SearchOutlined />}
            options={productOptions.map((item) => ({
              value: item.id,
              label: (
                <div className="flex items-center gap-3 py-1">
                  {item.anhUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      src={item.anhUrl}
                      className="h-10 w-10 rounded-md border border-border object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-text-main">
                      {item.ten}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {formatCurrency(item.giaGoc)} · {item.chatLieu || "Chất liệu"} ·{" "}
                      {item.dang || "Dáng áo"}
                    </div>
                  </div>
                </div>
              ),
            }))}
            notFoundContent={
              isSearchingProducts ? "Đang tìm..." : "Không có sản phẩm phù hợp"
            }
          />
        </Form.Item>

        <Form.Item
          label="Màu / size"
          name={[fieldName, "variantId"]}
          rules={[{ required: true, message: "Vui lòng chọn biến thể" }]}
        >
          <Select
            disabled={!selectedProductId}
            placeholder={
              selectedProductId ? "Chọn màu và size" : "Chọn sản phẩm trước"
            }
            onChange={() => onVariantChange(fieldName)}
            options={availableVariants.map((item) => ({
              value: item.id,
              disabled: item.tonKho <= 0,
              label: `${item.mau} / ${item.kichCo} · SKU ${item.sku} · Tồn ${item.tonKho}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name={[fieldName, "quantity"]}
          rules={[
            { required: true, message: "Nhập số lượng" },
            {
              validator: async (_, value: number | null) => {
                const quantity = Number(value) || 0;
                if (quantity < 1) {
                  throw new Error("Số lượng phải lớn hơn 0");
                }
                if (variant && quantity > variant.tonKho) {
                  throw new Error(`Tồn kho chỉ còn ${variant.tonKho}`);
                }
              },
            },
          ]}
        >
          <InputNumber
            className="w-full"
            min={1}
            max={variant?.tonKho}
            precision={0}
            placeholder="SL"
          />
        </Form.Item>
      </div>

      <DesignPicker
        rowIndex={fieldName}
        userId={userId}
        productId={selectedProductId}
        variantId={variant?.id}
        designs={designs}
        isLoadingDesigns={isLoadingDesigns}
        onDesignSearch={onDesignSearch}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs text-text-secondary">
        {variant ? (
          <Tag color={variant.tonKho > 0 ? "blue" : "red"} className="m-0">
            Tồn kho hiện tại: {variant.tonKho}
          </Tag>
        ) : (
          <span>Chọn biến thể để xem tồn kho.</span>
        )}

        {previewLine?.discountPercent ? (
          <Tag color="green" className="m-0">
            Bulk từ {previewLine.bulkMinQty} áo: giảm {previewLine.discountPercent}%
          </Tag>
        ) : product ? (
          <Tag className="m-0">Chưa đạt mức giá sỉ</Tag>
        ) : null}

        <span className="ml-auto font-semibold text-text-main">
          Đơn giá preview: {formatCurrency(previewLine?.unitPrice ?? 0)}
        </span>
        <span className="font-semibold text-primary-container">
          Dòng: {formatCurrency(previewLine?.lineTotal ?? 0)}
        </span>
      </div>
    </div>
  );
}

function ProductsSection({
  userId,
  productOptions,
  productById,
  designs,
  isSearchingProducts,
  isLoadingDesigns,
  preview,
  onProductSearch,
  onProductChange,
  onVariantChange,
  onDesignSearch,
}: {
  userId?: number;
  productOptions: SanPhamTimKiem[];
  productById: Record<number, SanPhamTimKiem>;
  designs: ThietKe[];
  isSearchingProducts: boolean;
  isLoadingDesigns: boolean;
  preview: OrderPreview;
  onProductSearch: (value: string) => void;
  onProductChange: (rowIndex: number, productId?: number) => void;
  onVariantChange: (rowIndex: number) => void;
  onDesignSearch: (value: string) => void;
}) {
  return (
    <SectionPanel
      title="2. Chọn sản phẩm"
      description="Giá sỉ BulkPricing chỉ preview phần phôi áo, backend sẽ tính lại chính xác khi lưu."
    >
      <Form.List
        name="items"
        rules={[
          {
            validator: async (_, items: CreateOrderFormValues["items"]) => {
              if (!items || items.length < 1) {
                throw new Error("Đơn hàng phải có ít nhất 1 sản phẩm");
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, meta) => (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <Form.Item noStyle shouldUpdate>
                  {() => (
                    <div>
                      <ProductItemRow
                        fieldName={field.name}
                        canRemove={fields.length > 1}
                        productOptions={productOptions}
                        productById={productById}
                        userId={userId}
                        designs={designs}
                        isSearchingProducts={isSearchingProducts}
                        isLoadingDesigns={isLoadingDesigns}
                        previewLine={preview.lines[field.name]}
                        onProductSearch={onProductSearch}
                        onProductChange={onProductChange}
                        onVariantChange={onVariantChange}
                        onDesignSearch={onDesignSearch}
                        onRemove={() => remove(field.name)}
                      />
                    </div>
                  )}
                </Form.Item>
              </div>
            ))}

            <Form.ErrorList errors={meta.errors} />

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add({ quantity: 1 })}
              className="h-10 w-full rounded-[10px] font-semibold"
            >
              Thêm dòng sản phẩm
            </Button>
          </div>
        )}
      </Form.List>
    </SectionPanel>
  );
}

function PaymentSection() {
  return (
    <SectionPanel title="4. Thanh toán">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Form.Item
          label="Phương thức thanh toán"
          name="paymentMethod"
          rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
        >
          <Radio.Group>
            <Space wrap>
              <Radio.Button value="COD">COD</Radio.Button>
              <Radio.Button value="VNPAY">VNPAY</Radio.Button>
              <Radio.Button value="CASH">CASH</Radio.Button>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Loại thanh toán"
          name="paymentType"
          rules={[{ required: true, message: "Vui lòng chọn loại thanh toán" }]}
        >
          <Radio.Group>
            <Space wrap>
              <Radio.Button value="FULL">FULL</Radio.Button>
              <Radio.Button value="DEPOSIT">DEPOSIT</Radio.Button>
            </Space>
          </Radio.Group>
        </Form.Item>
      </div>
    </SectionPanel>
  );
}

function ShippingSection({
  promotions,
  isLoadingPromotions,
  preview,
}: {
  promotions: KhuyenMai[];
  isLoadingPromotions: boolean;
  preview: OrderPreview;
}) {
  return (
    <SectionPanel title="5. Vận chuyển & khuyến mãi">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Form.Item
          label="Phí giao hàng"
          name="shippingFee"
          rules={[
            {
              validator: async (_, value: number | null) => {
                if (Number(value) < 0) throw new Error("Phí ship không được âm");
              },
            },
          ]}
        >
          <InputNumber<number>
            className="w-full"
            min={0}
            step={1000}
            formatter={(value) =>
              `${value ?? 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) => Number((value ?? "").replace(/[^\d]/g, ""))}
            addonAfter="VND"
          />
        </Form.Item>

        <Form.Item label="Mã khuyến mãi" name="promotionId">
          <Select
            allowClear
            loading={isLoadingPromotions}
            placeholder="Chọn promotion nếu có"
            options={promotions.map((promo) => {
              const disabled = preview.promotionBaseAmount < promo.donHangToiThieu;
              const discountLabel =
                promo.loaiGiam === "PERCENT"
                  ? `Giảm ${promo.giaTriGiam}%`
                  : `Giảm ${formatCurrency(promo.giaTriGiam)}`;

              return {
                value: promo.id,
                disabled,
                label: `${promo.ma} · ${discountLabel} · tối thiểu ${formatCurrency(
                  promo.donHangToiThieu
                )}`,
              };
            })}
            notFoundContent={
              isLoadingPromotions ? "Đang tải mã..." : "Không có mã còn hiệu lực"
            }
          />
        </Form.Item>
      </div>

      {preview.promotionNotEligible && preview.selectedPromotion ? (
        <Alert
          showIcon
          type="warning"
          title={`Đơn cần đạt tối thiểu ${formatCurrency(
            preview.selectedPromotion.donHangToiThieu
          )} để dùng mã ${preview.selectedPromotion.ma}.`}
        />
      ) : null}
    </SectionPanel>
  );
}

function OrderSummary({ preview }: { preview: OrderPreview }) {
  const rows = [
    ["Tạm tính", preview.subtotal],
    ["Phí thiết kế", preview.designFee],
    ["Giảm giá", -preview.discountAmount],
    ["Phí ship", preview.shippingFee],
  ] as const;

  return (
    <aside className="sticky top-5 rounded-xl border border-border bg-surface p-5 shadow-admin-card">
      <div className="mb-4">
        <h3 className="text-card-title text-text-main">6. Tóm tắt giá</h3>
        <p className="mt-1 text-body-sm text-text-secondary">
          Số tiền này chỉ là preview, backend sẽ tự tính lại từ database.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map(([label, amount]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-secondary">{label}</span>
            <span
              className={`text-sm font-bold ${
                amount < 0 ? "text-success" : "text-text-main"
              }`}
            >
              {amount < 0 ? `-${formatCurrency(Math.abs(amount))}` : formatCurrency(amount)}
            </span>
          </div>
        ))}
      </div>

      <Divider className="my-4" />

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-text-muted">
            Tổng tiền
          </div>
          <div className="mt-1 text-xs text-text-secondary">
            Payment amount backend sẽ lưu
          </div>
        </div>
        <div className="text-right text-2xl font-extrabold text-primary-container">
          {formatCurrency(preview.totalAmount)}
        </div>
      </div>

      {preview.lines.length > 0 ? (
        <div className="mt-5 space-y-2 rounded-lg border border-border bg-surface-alt p-3">
          {preview.lines.map((line, index) => (
            <div
              key={`${line.product?.id ?? "empty"}-${index}`}
              className="flex items-start justify-between gap-3 text-xs"
            >
              <div className="min-w-0 text-text-secondary">
                <div className="truncate font-semibold text-text-main">
                  {line.product?.ten || `Dòng ${index + 1}`}
                </div>
                <div>
                  {line.variant
                    ? `${line.variant.mau}/${line.variant.kichCo}`
                    : "Chưa chọn biến thể"}{" "}
                  · SL {line.quantity}
                </div>
              </div>
              <span className="font-bold text-text-main">
                {formatCurrency(line.lineTotal)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

export default function CreateOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CreateOrderFormValues>();

  const [customerKeyword, setCustomerKeyword] = useState("");
  const [productKeyword, setProductKeyword] = useState("");
  const [designKeyword, setDesignKeyword] = useState("");
  const [selectedCustomerById, setSelectedCustomerById] = useState<
    Record<number, KhachHang>
  >({});
  const [selectedProductById, setSelectedProductById] = useState<
    Record<number, SanPhamTimKiem>
  >({});

  const debouncedCustomerKeyword = useDebouncedValue(customerKeyword);
  const debouncedProductKeyword = useDebouncedValue(productKeyword);
  const debouncedDesignKeyword = useDebouncedValue(designKeyword);

  const values = Form.useWatch([], form) ?? initialValues;
  const userId = values.userId;

  const {
    data: foundCustomers = [],
    isFetching: isSearchingCustomers,
  } = useQuery({
    queryKey: ["admin-order-customer-search", debouncedCustomerKeyword],
    queryFn: () => orderService.timKiemKhachHang(debouncedCustomerKeyword),
  });

  const customers = useMemo(
    () => uniqueById([...Object.values(selectedCustomerById), ...foundCustomers]),
    [foundCustomers, selectedCustomerById]
  );

  const {
    data: addresses = [],
    isFetching: isLoadingAddresses,
  } = useQuery({
    queryKey: ["admin-order-customer-addresses", userId],
    queryFn: () => orderService.layDiaChiKhachHang(userId!),
    enabled: Boolean(userId),
  });

  const {
    data: foundProducts = [],
    isFetching: isSearchingProducts,
  } = useQuery({
    queryKey: ["admin-order-product-search", debouncedProductKeyword],
    queryFn: () => orderService.timKiemSanPham(debouncedProductKeyword),
  });

  const productOptions = useMemo(
    () => uniqueById([...Object.values(selectedProductById), ...foundProducts]),
    [foundProducts, selectedProductById]
  );

  const productById = useMemo(
    () =>
      productOptions.reduce<Record<number, SanPhamTimKiem>>((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {}),
    [productOptions]
  );

  const {
    data: designs = [],
    isFetching: isLoadingDesigns,
  } = useQuery({
    queryKey: ["admin-order-design-search", userId, debouncedDesignKeyword],
    queryFn: () =>
      orderService.timKiemThietKe(userId!, debouncedDesignKeyword),
    enabled: Boolean(userId),
  });

  const designById = useMemo(
    () =>
      designs.reduce<Record<number, ThietKe>>((acc, design) => {
        acc[design.id] = design;
        return acc;
      }, {}),
    [designs]
  );

  const {
    data: promotions = [],
    isFetching: isLoadingPromotions,
  } = useQuery({
    queryKey: ["admin-order-promotions"],
    queryFn: orderService.layDanhSachKhuyenMai,
  });

  const preview = useMemo(
    () => buildPreview(values, productById, designById, promotions),
    [designById, productById, promotions, values]
  );

  useEffect(() => {
    if (!userId || addresses.length === 0) return;

    const currentAddressId = form.getFieldValue("addressId");
    if (currentAddressId) return;

    const defaultAddress = addresses.find((address) => address.laMacDinh);
    form.setFieldValue("addressId", defaultAddress?.id ?? addresses[0].id);
  }, [addresses, form, userId]);

  const createOrderMutation = useMutation({
    mutationFn: orderService.taoMoiDonHang,
    onSuccess: async (result) => {
      message.success("Tạo đơn hàng thành công");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] }),
      ]);
      router.push(`/admin/don-hang/${result.id}`);
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error));
    },
  });

  function handleCustomerChange(customerId?: number) {
    const selectedCustomer = foundCustomers.find(
      (customer) => customer.id === customerId
    );

    if (selectedCustomer) {
      setSelectedCustomerById((current) => ({
        ...current,
        [selectedCustomer.id]: selectedCustomer,
      }));
    }

    const currentItems = (form.getFieldValue("items") ??
      []) as NonNullable<CreateOrderFormValues["items"]>;
    form.setFieldsValue({
      addressId: undefined,
      items: currentItems.map((item) => ({ ...item, designId: undefined })),
    });
    setDesignKeyword("");
  }

  function handleProductChange(rowIndex: number, productId?: number) {
    const selectedProduct = foundProducts.find((product) => product.id === productId);

    if (selectedProduct) {
      setSelectedProductById((current) => ({
        ...current,
        [selectedProduct.id]: selectedProduct,
      }));
    }

    form.setFieldValue(["items", rowIndex, "variantId"], undefined);
    form.setFieldValue(["items", rowIndex, "designId"], undefined);
    form.setFieldValue(
      ["items", rowIndex, "quantity"],
      form.getFieldValue(["items", rowIndex, "quantity"]) ?? 1
    );
  }

  function handleVariantChange(rowIndex: number) {
    form.setFieldValue(["items", rowIndex, "designId"], undefined);
  }

  function buildPayload(valuesToSubmit: CreateOrderFormValues): TaoMoiDonHangInput {
    const payload: TaoMoiDonHangInput = {
      userId: Number(valuesToSubmit.userId),
      addressId: Number(valuesToSubmit.addressId),
      items: (valuesToSubmit.items ?? []).map((item) => ({
        variantId: Number(item.variantId),
        quantity: Number(item.quantity),
        designId: item.designId ? Number(item.designId) : null,
      })),
      paymentMethod: valuesToSubmit.paymentMethod ?? "COD",
      paymentType: valuesToSubmit.paymentType ?? "FULL",
      shippingFee: Math.max(0, Number(valuesToSubmit.shippingFee) || 0),
    };

    if (valuesToSubmit.promotionId) {
      payload.promotionId = Number(valuesToSubmit.promotionId);
    }

    return payload;
  }

  async function handleFinish(valuesToSubmit: CreateOrderFormValues) {
    if (preview.promotionNotEligible && preview.selectedPromotion) {
      message.error(
        `Đơn chưa đạt điều kiện tối thiểu của mã ${preview.selectedPromotion.ma}`
      );
      return;
    }

    createOrderMutation.mutate(buildPayload(valuesToSubmit));
  }

  return (
    <div>
      <section className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="mb-3 px-0 font-semibold text-text-secondary hover:text-primary-container"
            onClick={() => router.push("/admin/don-hang")}
          >
            Quay lại danh sách
          </Button>
          <h2 className="font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
            Tạo đơn mới
          </h2>
          <p className="mt-1 text-body-md text-text-secondary">
            Admin tạo đơn thay khách, kiểm tra tồn kho và preview giá trước khi gửi backend.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          className="h-10 rounded-[10px] font-semibold"
          onClick={() => {
            form.resetFields();
            setDesignKeyword("");
          }}
        >
          Làm mới form
        </Button>
      </section>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
        requiredMark={false}
      >
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <CustomerSection
              customers={customers}
              addresses={addresses}
              isSearchingCustomers={isSearchingCustomers}
              isLoadingAddresses={isLoadingAddresses}
              onCustomerSearch={setCustomerKeyword}
              onCustomerChange={handleCustomerChange}
            />

            <ProductsSection
              userId={userId}
              productOptions={productOptions}
              productById={productById}
              designs={designs}
              isSearchingProducts={isSearchingProducts}
              isLoadingDesigns={isLoadingDesigns}
              preview={preview}
              onProductSearch={setProductKeyword}
              onProductChange={handleProductChange}
              onVariantChange={handleVariantChange}
              onDesignSearch={setDesignKeyword}
            />

            <PaymentSection />

            <ShippingSection
              promotions={promotions}
              isLoadingPromotions={isLoadingPromotions}
              preview={preview}
            />

            {createOrderMutation.isError ? (
              <Alert
                showIcon
                type="error"
                title={getApiErrorMessage(createOrderMutation.error)}
              />
            ) : null}

            <div className="flex flex-col-reverse gap-3 rounded-xl border border-border bg-surface p-4 shadow-admin-card sm:flex-row sm:justify-end">
              <Button
                className="h-10 rounded-[10px] font-semibold"
                onClick={() => router.push("/admin/don-hang")}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={createOrderMutation.isPending}
                className="h-10 rounded-[10px] font-semibold"
              >
                Tạo đơn hàng
              </Button>
            </div>
          </div>

          <div>
            {productOptions.length === 0 && isSearchingProducts ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : preview.lines.length > 0 ? (
              <OrderSummary preview={preview} />
            ) : (
              <aside className="rounded-xl border border-border bg-surface p-5 shadow-admin-card">
                <Empty description="Chưa có sản phẩm trong đơn" />
              </aside>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}

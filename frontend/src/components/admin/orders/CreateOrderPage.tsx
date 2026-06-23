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
  Input,
} from "antd";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as orderService from "@/services/admin/orderService";
import type {
  BienTheSanPham,
  KhachHang,
  KhuyenMai,
  SanPhamTimKiem,
  TaoMoiDonHangInput,
  ThietKe,
} from "@/services/admin/orderService";

type CreateOrderFormValues = {
  userId?: number;
  recipientName?: string;
  phone?: string;
  addressLine?: string;
  items?: Array<{
    productType?: ProductLineType;
    productId?: number;
    variantId?: number;
    quantity?: number;
    designId?: number;
    color?: string;
  }>;
  paymentMethod?: TaoMoiDonHangInput["paymentMethod"];
  paymentType?: TaoMoiDonHangInput["paymentType"];
  shippingFee?: number;
  promotionId?: number;
};

type ProductLineType = "STANDARD" | "CUSTOM";

type OrderPreviewLine = {
  productType: ProductLineType;
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
  items: [{ productType: "STANDARD", quantity: 1 }],
  paymentMethod: "COD",
  paymentType: "FULL",
  shippingFee: 0,
};

const DEPOSIT_PERCENT = 50;

function getPaymentBreakdown(
  totalAmount: number,
  paymentMethod: TaoMoiDonHangInput["paymentMethod"] = "COD",
  paymentType: TaoMoiDonHangInput["paymentType"] = "FULL"
) {
  const depositAmount =
    paymentType === "DEPOSIT"
      ? Math.round(totalAmount * (DEPOSIT_PERCENT / 100))
      : 0;
  const codAmount =
    (paymentMethod === "COD" || paymentType === "DEPOSIT") 
      ? Math.max(0, totalAmount - depositAmount) 
      : 0;

  return { depositAmount, codAmount };
}

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

function normalizeComparableText(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function getItemProductType(
  item?: NonNullable<CreateOrderFormValues["items"]>[number] | null
): ProductLineType {
  return item?.productType === "CUSTOM" ? "CUSTOM" : "STANDARD";
}

function getDesignColor(design?: ThietKe, product?: SanPhamTimKiem) {
  if (!design) return "";

  const designVariant = product?.bienThe.find((item) => item.id === design.variantId);
  return designVariant?.mau || design.mauSanPham || design.mauNen || "";
}

function getDesignSizeOptions(
  product: SanPhamTimKiem | undefined,
  design: ThietKe | undefined
) {
  if (!product || !design) return [];

  const lockedColor = normalizeComparableText(getDesignColor(design, product));
  if (!lockedColor) return [];

  return product.bienThe.filter(
    (variant) => normalizeComparableText(variant.mau) === lockedColor
  );
}

function getProductColorOptions(product: SanPhamTimKiem | undefined) {
  if (!product) return [];

  return Array.from(
    new Set(product.bienThe.map((variant) => variant.mau).filter(Boolean))
  );
}

function getStandardSizeOptions(
  product: SanPhamTimKiem | undefined,
  color?: string
) {
  if (!product || !color) return [];

  const selectedColor = normalizeComparableText(color);
  return product.bienThe.filter(
    (variant) => normalizeComparableText(variant.mau) === selectedColor
  );
}

function deductStockFromProducts(
  products: SanPhamTimKiem[],
  items: TaoMoiDonHangInput["items"]
) {
  const quantityByVariantId = items.reduce<Record<number, number>>((acc, item) => {
    acc[item.variantId] = (acc[item.variantId] || 0) + item.quantity;
    return acc;
  }, {});

  let hasChanged = false;

  const updatedProducts = products.map((product) => {
    let productChanged = false;

    const bienThe = product.bienThe.map((variant) => {
      const deductedQuantity = quantityByVariantId[variant.id] || 0;
      if (deductedQuantity <= 0) return variant;

      productChanged = true;
      hasChanged = true;

      return {
        ...variant,
        tonKho: Math.max(0, variant.tonKho - deductedQuantity),
      };
    });

    return productChanged ? { ...product, bienThe } : product;
  });

  return hasChanged ? updatedProducts : products;
}

function deductStockFromDesigns(
  designs: ThietKe[],
  items: TaoMoiDonHangInput["items"]
) {
  const updatedProducts = deductStockFromProducts(
    designs.map((design) => design.sanPham),
    items
  );

  let hasChanged = false;

  const updatedDesigns = designs.map((design, index) => {
    const updatedProduct = updatedProducts[index];
    if (updatedProduct === design.sanPham) return design;

    hasChanged = true;
    return { ...design, sanPham: updatedProduct };
  });

  return hasChanged ? updatedDesigns : designs;
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
      : promotion.loaiGiam === "FIXED"
        ? promotion.giaTriGiam
        : 0;

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
      const productType = getItemProductType(item);
      const quantity = Math.max(1, Number(item?.quantity) || 1);
      const product = item?.productId ? productById[item.productId] : undefined;
      const variant = product?.bienThe.find((v) => v.id === item?.variantId);
      const design =
        productType === "CUSTOM" && item?.designId
          ? designById[item.designId]
          : undefined;
      const { unitPrice, discountPercent, bulkMinQty } = tinhDonGiaPreview(
        product,
        quantity
      );
      const lineProductTotal = unitPrice * quantity;
      const designFee = design?.phiThietKe ?? 0;

      return {
        productType,
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
  const shippingFeeInput = Math.max(0, Number(values.shippingFee) || 0);
  const selectedPromotion = values.promotionId
    ? promotions.find((promo) => promo.id === values.promotionId)
    : undefined;
  const promotionBaseAmount = subtotal + designFee;
  const discountAmount = tinhGiamGiaPreview(
    selectedPromotion,
    promotionBaseAmount
  );
  const shippingFee =
    selectedPromotion?.loaiGiam === "FREE_SHIPPING" ? 0 : shippingFeeInput;
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
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-text-main">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function CustomerSection({
  customers,
  isSearchingCustomers,
  onCustomerSearch,
  onCustomerChange,
}: {
  customers: KhachHang[];
  isSearchingCustomers: boolean;
  onCustomerSearch: (value: string) => void;
  onCustomerChange: (value?: number) => void;
}) {
  return (
    <SectionPanel
      title="1. Khách hàng & Địa chỉ giao hàng"
      description={
        <>
          Khách chưa có tài khoản?{" "}
          <Link
            href="/admin/tai-khoan"
            className="font-semibold text-primary-container hover:underline"
          >
            Tạo tài khoản khách hàng
          </Link>{" "}
          trước khi tạo đơn.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-3">
        <Form.Item
          label="Khách hàng"
          name="userId"
          className="mb-0"
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
                <div className="flex flex-col py-0.5">
                  <span className="font-semibold text-text-main">{customer.hoTen}</span>
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
          label="Tên người nhận"
          name="recipientName"
          className="mb-0"
          rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
        >
          <Input placeholder="Nhập tên người nhận..." disabled={!customers.length} />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          className="mb-0"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input placeholder="Nhập số điện thoại..." disabled={!customers.length} />
        </Form.Item>

        <Form.Item
          label="Địa chỉ giao hàng"
          name="addressLine"
          className="mb-0 md:col-span-3"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}
        >
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 2 }}
            placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP HCM..."
            disabled={!customers.length}
          />
        </Form.Item>
      </div>
    </SectionPanel>
  );
}

function DesignPicker({
  rowIndex,
  userId,
  designs,
  isLoadingDesigns,
  onDesignSearch,
  onDesignChange,
}: {
  rowIndex: number;
  userId?: number;
  designs: ThietKe[];
  isLoadingDesigns: boolean;
  onDesignSearch: (value: string) => void;
  onDesignChange: (rowIndex: number, designId?: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
      <Form.Item
        label="Thiết kế POD"
        name={[rowIndex, "designId"]}
        className="mb-0"
        rules={[{ required: true, message: "Vui lòng chọn thiết kế POD" }]}
      >
        <Select
          allowClear
          showSearch
          disabled={!userId}
          filterOption={false}
          loading={isLoadingDesigns}
          onSearch={onDesignSearch}
          onChange={(value) => onDesignChange(rowIndex, value)}
          placeholder={
            userId ? "Chọn bản thiết kế đã duyệt của khách" : "Chọn khách hàng trước"
          }
          options={designs.map((design) => ({
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
                    Màu {getDesignColor(design, design.sanPham) || "Không rõ"} · Phí thiết kế{" "}
                    {formatCurrency(design.phiThietKe)}
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
  userId,
  designs,
  isSearchingProducts,
  isLoadingDesigns,
  previewLine,
  onProductSearch,
  onProductTypeChange,
  onProductChange,
  onColorChange,
  onVariantChange,
  onDesignSearch,
  onDesignChange,
  onRemove,
}: {
  fieldName: number;
  canRemove: boolean;
  productOptions: SanPhamTimKiem[];
  userId?: number;
  designs: ThietKe[];
  isSearchingProducts: boolean;
  isLoadingDesigns: boolean;
  previewLine?: OrderPreviewLine;
  onProductSearch: (value: string) => void;
  onProductTypeChange: (rowIndex: number, productType: ProductLineType) => void;
  onProductChange: (rowIndex: number, productId?: number) => void;
  onColorChange: (rowIndex: number, color?: string) => void;
  onVariantChange: (rowIndex: number) => void;
  onDesignSearch: (value: string) => void;
  onDesignChange: (rowIndex: number, designId?: number) => void;
  onRemove: () => void;
}) {
  const currentItem = Form.useWatch(["items", fieldName]) as
    | NonNullable<CreateOrderFormValues["items"]>[number]
    | undefined;
  const productType = getItemProductType(currentItem);
  const isCustomProduct = productType === "CUSTOM";
  const product = previewLine?.product;
  const variant = previewLine?.variant;
  const selectedDesign = previewLine?.design;
  const selectedProductId = product?.id;
  const lockedColor = getDesignColor(selectedDesign, product);
  const selectedColor = isCustomProduct
    ? lockedColor
    : currentItem?.color || variant?.mau || "";
  const availableSizeVariants = isCustomProduct
    ? getDesignSizeOptions(product, selectedDesign)
    : getStandardSizeOptions(product, selectedColor);
  const colorOptions = getProductColorOptions(product);

  return (
    <div className="rounded-xl border border-border bg-surface-alt p-3">
      {/* Header inline: tiêu đề + loại SP + nút xóa */}
      <div className="mb-3 flex items-center gap-3">
        <span className="shrink-0 text-xs font-bold text-text-main">
          Sản phẩm #{fieldName + 1}
        </span>
        <Form.Item
          name={[fieldName, "productType"]}
          className="mb-0 flex-1"
          rules={[{ required: true, message: "Chọn loại" }]}
        >
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            size="small"
            onChange={(event) =>
              onProductTypeChange(fieldName, event.target.value as ProductLineType)
            }
          >
            <Radio.Button value="STANDARD">Áo mẫu / phôi trơn</Radio.Button>
            <Radio.Button value="CUSTOM">Áo in POD</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {canRemove ? (
          <Tooltip title="Xóa dòng sản phẩm">
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={onRemove}
              aria-label="Xóa dòng sản phẩm"
            />
          </Tooltip>
        ) : null}
      </div>

      {isCustomProduct ? (
        <div className="mb-2 rounded-lg border border-primary-container/25 bg-sky-50 p-2">
          <DesignPicker
            rowIndex={fieldName}
            userId={userId}
            designs={designs}
            isLoadingDesigns={isLoadingDesigns}
            onDesignSearch={onDesignSearch}
            onDesignChange={onDesignChange}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.6fr_0.7fr_0.7fr_120px]">
        <Form.Item
          label="Sản phẩm / phôi áo"
          name={[fieldName, "productId"]}
          rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
        >
          <Select
            allowClear={!isCustomProduct}
            showSearch
            disabled={isCustomProduct}
            filterOption={false}
            loading={isSearchingProducts}
            onSearch={onProductSearch}
            onChange={(value) => onProductChange(fieldName, value)}
            placeholder={
              isCustomProduct
                ? "Tự động điền sau khi chọn thiết kế"
                : "Tìm áo mẫu hoặc phôi trơn"
            }
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

        {isCustomProduct ? (
          <Form.Item label="Màu">
            <Input
              disabled
              value={lockedColor}
              placeholder="Tự điền theo thiết kế"
            />
          </Form.Item>
        ) : (
          <Form.Item
            label="Màu"
            name={[fieldName, "color"]}
            rules={[{ required: true, message: "Vui lòng chọn màu" }]}
          >
            <Select
              disabled={!selectedProductId}
              placeholder={
                selectedProductId ? "Chọn màu" : "Chọn sản phẩm trước"
              }
              onChange={(value) => onColorChange(fieldName, value)}
              options={colorOptions.map((color) => ({
                value: color,
                label: color,
              }))}
              notFoundContent="Sản phẩm chưa có màu"
            />
          </Form.Item>
        )}

        <Form.Item
          label="Size"
          name={[fieldName, "variantId"]}
          rules={[{ required: true, message: "Vui lòng chọn size" }]}
        >
          <Select
            disabled={
              isCustomProduct
                ? !selectedDesign || !selectedProductId
                : !selectedProductId || !selectedColor
            }
            placeholder={
              isCustomProduct
                ? selectedDesign
                  ? "Chọn size"
                  : "Chọn thiết kế trước"
                : selectedColor
                  ? "Chọn size"
                  : "Chọn màu trước"
            }
            onChange={() => onVariantChange(fieldName)}
            options={availableSizeVariants.map((item) => ({
              value: item.id,
              disabled: item.tonKho <= 0,
              label: item.kichCo,
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

      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-text-secondary">
        {variant ? (
          <Tag color={variant.tonKho > 0 ? "blue" : "red"} className="m-0">
            Tồn kho hiện tại: {variant.tonKho}
          </Tag>
        ) : (
          <span>Chọn size để xem tồn kho.</span>
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
  designs,
  isSearchingProducts,
  isLoadingDesigns,
  preview,
  onProductSearch,
  onProductTypeChange,
  onProductChange,
  onColorChange,
  onVariantChange,
  onDesignSearch,
  onDesignChange,
}: {
  userId?: number;
  productOptions: SanPhamTimKiem[];
  designs: ThietKe[];
  isSearchingProducts: boolean;
  isLoadingDesigns: boolean;
  preview: OrderPreview;
  onProductSearch: (value: string) => void;
  onProductTypeChange: (rowIndex: number, productType: ProductLineType) => void;
  onProductChange: (rowIndex: number, productId?: number) => void;
  onColorChange: (rowIndex: number, color?: string) => void;
  onVariantChange: (rowIndex: number) => void;
  onDesignSearch: (value: string) => void;
  onDesignChange: (rowIndex: number, designId?: number) => void;
}) {
  return (
    <SectionPanel
      title="2. Chọn sản phẩm & thiết kế POD"
      description="Mỗi dòng có loại mua riêng: áo mẫu tự chọn phôi, màu, size; áo POD chọn thiết kế rồi khóa phôi và màu theo bản đã duyệt."
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
                        userId={userId}
                        designs={designs}
                        isSearchingProducts={isSearchingProducts}
                        isLoadingDesigns={isLoadingDesigns}
                        previewLine={preview.lines[field.name]}
                        onProductSearch={onProductSearch}
                        onProductTypeChange={onProductTypeChange}
                        onProductChange={onProductChange}
                        onColorChange={onColorChange}
                        onVariantChange={onVariantChange}
                        onDesignSearch={onDesignSearch}
                        onDesignChange={onDesignChange}
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
              onClick={() => {
                add({ productType: "STANDARD", quantity: 1 });
              }}
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

function PaymentShippingSection({
  preview,
  paymentMethod,
  paymentType,
  hasCustomDesign,
  promotions,
  isLoadingPromotions,
}: {
  preview: OrderPreview;
  paymentMethod?: TaoMoiDonHangInput["paymentMethod"];
  paymentType?: TaoMoiDonHangInput["paymentType"];
  hasCustomDesign: boolean;
  promotions: KhuyenMai[];
  isLoadingPromotions: boolean;
}) {
  const { depositAmount, codAmount } = getPaymentBreakdown(
    preview.totalAmount,
    paymentMethod,
    paymentType
  );

  return (
    <SectionPanel title="3. Thanh toán, Vận chuyển & Khuyến mãi">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Form.Item
          label="Phương thức thanh toán"
          name="paymentMethod"
          className="mb-0"
          rules={[{ required: true, message: "Chọn phương thức" }]}
        >
          <Radio.Group>
            <Space wrap>
              <Tooltip title={hasCustomDesign ? "Áo POD bắt buộc VNPAY" : ""}>
                <Radio.Button value="COD" disabled={hasCustomDesign}>COD</Radio.Button>
              </Tooltip>
              <Radio.Button value="VNPAY">VNPAY</Radio.Button>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Loại thanh toán"
          name="paymentType"
          className="mb-0"
          rules={[{ required: true, message: "Chọn loại" }]}
        >
          <Radio.Group>
            <Space wrap>
              <Radio.Button value="FULL">FULL</Radio.Button>
              <Tooltip title={!hasCustomDesign ? "Chỉ áo POD mới được đặt cọc" : ""}>
                <Radio.Button value="DEPOSIT" disabled={!hasCustomDesign}>ĐẶT CỌC</Radio.Button>
              </Tooltip>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Phí giao hàng"
          name="shippingFee"
          className="mb-0"
          rules={[
            {
              validator: async (_, value: number | null) => {
                if (Number(value) < 0) throw new Error("Phí ship không được âm");
              },
            },
          ]}
        >
          <ShippingFeeInput />
        </Form.Item>

        <Form.Item label="Mã khuyến mãi" name="promotionId" className="mb-0">
          <Select
            allowClear
            loading={isLoadingPromotions}
            placeholder="Chọn mã KM nếu có"
            options={promotions.map((promo) => {
              const disabled = preview.promotionBaseAmount < promo.donHangToiThieu;
              const discountLabel =
                promo.loaiGiam === "PERCENT"
                  ? `Giảm ${promo.giaTriGiam}%`
                  : promo.loaiGiam === "FIXED"
                    ? `Giảm ${formatCurrency(promo.giaTriGiam)}`
                    : "Miễn phí VC";
              return {
                value: promo.id,
                disabled,
                label: `${promo.ma} · ${discountLabel}`,
              };
            })}
            notFoundContent={
              isLoadingPromotions ? "Đang tải..." : "Không có mã"
            }
          />
        </Form.Item>
      </div>

      {/* Cảnh báo khuyến mãi không đủ điều kiện */}
      {preview.promotionNotEligible && preview.selectedPromotion ? (
        <Alert
          className="mt-3"
          showIcon
          type="warning"
          title={`Đơn cần đạt tối thiểu ${formatCurrency(
            preview.selectedPromotion.donHangToiThieu
          )} để dùng mã ${preview.selectedPromotion.ma}.`}
        />
      ) : null}

      {/* Thông tin đặt cọc */}
      {paymentType === "DEPOSIT" ? (
        <div className="mt-3 rounded-lg border border-primary-container/25 bg-sky-50 p-3">
          <div className="mb-2 text-sm font-bold text-text-main">
            Thông tin đặt cọc ({DEPOSIT_PERCENT}% tổng đơn)
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-secondary">Tiền cọc (VNPAY)</span>
              <strong className="text-primary-container">{formatCurrency(depositAmount)}</strong>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-secondary">Thu hộ COD khi giao</span>
              <strong className="text-text-main">{formatCurrency(codAmount)}</strong>
            </div>
          </div>
          {paymentMethod === "VNPAY" ? (
            <Alert
              className="mt-2"
              showIcon
              type="info"
              title={`VNPAY yêu cầu khách cọc ${formatCurrency(depositAmount)}. Phần còn lại thu COD khi giao.`}
            />
          ) : null}
        </div>
      ) : null}
    </SectionPanel>
  );
}

function ShippingFeeInput({
  value,
  onChange,
  id,
}: {
  value?: number;
  onChange?: (value: number | null) => void;
  id?: string;
}) {
  return (
    <div className="inline-flex h-8 w-auto max-w-full items-stretch">
      <InputNumber<number>
        id={id}
        value={value}
        onChange={onChange}
        className="!h-8 !w-[150px] rounded-r-none [&_.ant-input-number-input]:!h-8 [&_.ant-input-number-input]:!py-0"
        min={0}
        step={1000}
        formatter={(inputValue) =>
          `${inputValue ?? 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        }
        parser={(inputValue) => Number((inputValue ?? "").replace(/[^\d]/g, ""))}
      />
      <span
        aria-hidden="true"
        className="inline-flex h-8 w-12 shrink-0 items-center justify-center rounded-r-[8px] border border-l-0 border-border bg-surface-alt text-xs font-semibold leading-none text-text-secondary"
      >
        VND
      </span>
    </div>
  );
}

function OrderSummary({
  preview,
  isSubmitting,
  onCancel,
}: {
  preview: OrderPreview;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  const rows = [
    ["Tạm tính", preview.subtotal],
    ["Phí thiết kế", preview.designFee],
    ["Giảm giá", -preview.discountAmount],
    ["Phí ship", preview.shippingFee],
  ] as const;

  return (
    <aside className="sticky top-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-text-main">Tóm tắt giá (preview)</h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          Backend sẽ tính lại chính xác từ database.
        </p>
      </div>

      {/* Chi tiết từng dòng sản phẩm */}
      {preview.lines.length > 0 ? (
        <div className="mb-3 grid grid-cols-1 gap-2 rounded-lg border border-border bg-surface-alt p-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {preview.lines.map((line, index) => (
            <div
              key={`${line.product?.id ?? "empty"}-${index}`}
              className="flex items-start justify-between gap-2 text-xs"
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
              <span className="shrink-0 font-bold text-text-main">
                {formatCurrency(line.lineTotal)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <Divider className="my-3" />

      {/* Bảng tổng */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {rows.map(([label, amount]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-xs text-text-secondary">{label}</span>
            <span
              className={`text-xs font-bold ${
                amount < 0 ? "text-success" : "text-text-main"
              }`}
            >
              {amount < 0 ? `-${formatCurrency(Math.abs(amount))}` : formatCurrency(amount)}
            </span>
          </div>
        ))}
      </div>

      <Divider className="my-3" />

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-text-muted">Tổng cộng</span>
        <span className="text-xl font-extrabold text-primary-container">
          {formatCurrency(preview.totalAmount)}
        </span>
      </div>

      <Divider className="my-3" />

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          className="h-9 w-auto rounded-[10px] px-4 font-semibold"
          onClick={onCancel}
        >
          Hủy
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          icon={<PlusOutlined />}
          loading={isSubmitting}
          className="h-9 w-auto rounded-[10px] px-4 font-semibold"
        >
          Tạo đơn hàng
        </Button>
      </div>
    </aside>
  );
}

export default function CreateOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CreateOrderFormValues>();
  const [messageApi, messageContextHolder] = message.useMessage();

  const [customerKeyword, setCustomerKeyword] = useState("");
  const [productKeyword, setProductKeyword] = useState("");
  const [designKeyword, setDesignKeyword] = useState("");
  const [selectedCustomerById, setSelectedCustomerById] = useState<
    Record<number, KhachHang>
  >({});
  const [selectedProductById, setSelectedProductById] = useState<
    Record<number, SanPhamTimKiem>
  >({});
  const [selectedDesignById, setSelectedDesignById] = useState<
    Record<number, ThietKe>
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

  const {
    data: foundDesigns = [],
    isFetching: isLoadingDesigns,
  } = useQuery({
    queryKey: ["admin-order-design-search", userId, debouncedDesignKeyword],
    queryFn: () =>
      orderService.timKiemThietKe(userId!, debouncedDesignKeyword),
    enabled: Boolean(userId),
  });

  const designs = useMemo(
    () => uniqueById([...Object.values(selectedDesignById), ...foundDesigns]),
    [foundDesigns, selectedDesignById]
  );

  const productOptions = useMemo(
    () =>
      uniqueById([
        ...foundProducts,
        ...designs.map((design) => design.sanPham).filter(Boolean),
        ...Object.values(selectedProductById),
      ]),
    [designs, foundProducts, selectedProductById]
  );

  const productById = useMemo(
    () =>
      productOptions.reduce<Record<number, SanPhamTimKiem>>((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {}),
    [productOptions]
  );

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

  const hasCustomDesign = preview.lines.some(
    (line) => line.productType === "CUSTOM"
  );

  useEffect(() => {
    const newValues: Partial<CreateOrderFormValues> = {};

    if (hasCustomDesign) {
      if (values.paymentMethod !== "VNPAY") {
        newValues.paymentMethod = "VNPAY";
      }
    } else {
      if (values.paymentType !== "FULL") {
        newValues.paymentType = "FULL";
      }
    }

    if (Object.keys(newValues).length > 0) {
      form.setFieldsValue(newValues);
    }
  }, [hasCustomDesign, values.paymentMethod, values.paymentType, form]);

  useEffect(() => {
    if (!userId || addresses.length === 0) return;

    const currentName = form.getFieldValue("recipientName");
    const currentPhone = form.getFieldValue("phone");
    const currentAddress = form.getFieldValue("addressLine");

    const defaultAddress = addresses.find((address) => address.laMacDinh) ?? addresses[0];
    const nextValues: Partial<CreateOrderFormValues> = {};

    if (!currentName) {
      nextValues.recipientName = defaultAddress.tenNguoiNhan;
    }

    if (!currentPhone) {
      nextValues.phone = defaultAddress.soDienThoai;
    }

    if (!currentAddress) {
      nextValues.addressLine = defaultAddress.diaChiDayDu;
    }

    if (Object.keys(nextValues).length > 0) {
      form.setFieldsValue(nextValues);
    }
  }, [addresses, form, userId]);

  function syncStockAfterCreateOrder(items: TaoMoiDonHangInput["items"]) {
    setSelectedProductById((current) => {
      const updatedProducts = deductStockFromProducts(Object.values(current), items);
      return updatedProducts.reduce<Record<number, SanPhamTimKiem>>((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {});
    });

    queryClient.setQueriesData<SanPhamTimKiem[]>(
      { queryKey: ["admin-order-product-search"] },
      (currentProducts) =>
        currentProducts ? deductStockFromProducts(currentProducts, items) : currentProducts
    );

    setSelectedDesignById((current) => {
      const updatedDesigns = deductStockFromDesigns(Object.values(current), items);
      return updatedDesigns.reduce<Record<number, ThietKe>>((acc, design) => {
        acc[design.id] = design;
        return acc;
      }, {});
    });

    queryClient.setQueriesData<ThietKe[]>(
      { queryKey: ["admin-order-design-search"] },
      (currentDesigns) =>
        currentDesigns ? deductStockFromDesigns(currentDesigns, items) : currentDesigns
    );
  }

  const createOrderMutation = useMutation({
    mutationFn: orderService.taoMoiDonHang,
    onSuccess: async (result, variables) => {
      syncStockAfterCreateOrder(variables.items);
      messageApi.success("Tạo đơn hàng thành công");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order-stats"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order-product-search"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-order-design-search"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
      ]);
      router.push(`/admin/don-hang/${result.id}`);
    },
    onError: (error) => {
      messageApi.error(getApiErrorMessage(error));
    },
  });

  function handleCustomerChange(userId?: number) {
    if (!userId) {
      form.setFieldsValue({
        userId: undefined,
        recipientName: "",
        phone: "",
        addressLine: "",
      });
      return;
    }
    const customer = customers.find((c) => c.id === userId);
    if (customer) {
      setSelectedCustomerById((prev) => ({ ...prev, [customer.id]: customer }));
      form.setFieldsValue({
        userId: customer.id,
        recipientName: customer.hoTen,
        phone: customer.soDienThoai ?? "",
        addressLine: "",
      });
    }
  }

  function handleProductTypeChange(rowIndex: number, productType: ProductLineType) {
    const items = form.getFieldValue("items") || [];
    items[rowIndex] = {
      ...items[rowIndex],
      productType,
      productId: undefined,
      color: undefined,
      variantId: undefined,
      designId: undefined,
    };
    form.setFieldsValue({ items });
  }

  function handleProductChange(rowIndex: number, productId?: number) {
    const items = form.getFieldValue("items") || [];
    const product = productOptions.find((p) => p.id === productId);

    if (product) {
      setSelectedProductById((prev) => ({ ...prev, [product.id]: product }));
    }

    items[rowIndex] = {
      ...items[rowIndex],
      productId,
      color: undefined,
      variantId: undefined,
    };
    form.setFieldsValue({ items });
  }

  function handleColorChange(rowIndex: number, color?: string) {
    const items = form.getFieldValue("items") || [];
    items[rowIndex] = {
      ...items[rowIndex],
      color,
      variantId: undefined,
    };
    form.setFieldsValue({ items });
  }

  function handleVariantChange(rowIndex: number) {
    // Form Item tự xử lý value update
  }

  function handleDesignChange(rowIndex: number, designId?: number) {
    const items = form.getFieldValue("items") || [];
    const design = designs.find((d) => d.id === designId);

    if (design) {
      setSelectedDesignById((prev) => ({ ...prev, [design.id]: design }));
      
      const productType = items[rowIndex]?.productType ?? "CUSTOM";
      
      items[rowIndex] = {
        ...items[rowIndex],
        productType,
        designId,
        productId: design.sanPham?.id,
        color: design.mauSanPham || design.mauNen,
        variantId: design.variantId ?? undefined,
      };
      
      if (design.sanPham) {
        setSelectedProductById((prev) => ({ ...prev, [design.sanPham.id]: design.sanPham }));
      }
    } else {
      items[rowIndex] = {
        ...items[rowIndex],
        designId,
      };
    }
    
    form.setFieldsValue({ items });
  }

  function handleFinish(formValues: CreateOrderFormValues) {
    if (!formValues.items || formValues.items.length === 0) {
      messageApi.error("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }

    const items = formValues.items.map((item) => ({
      variantId: item.variantId!,
      quantity: item.quantity!,
      designId: item.productType === "CUSTOM" ? item.designId : undefined,
    }));

    createOrderMutation.mutate({
      userId: formValues.userId!,
      recipientName: formValues.recipientName!,
      phone: formValues.phone!,
      addressLine: formValues.addressLine!,
      items,
      paymentMethod: formValues.paymentMethod!,
      paymentType: formValues.paymentType!,
      shippingFee: formValues.shippingFee ?? 0,
      promotionId: formValues.promotionId,
    });
  }

  function handleFinishFailed({ errorFields }: any) {
    if (errorFields.length > 0) {
      messageApi.error("Vui lòng kiểm tra lại thông tin biểu mẫu");
    }
  }

  return (
    <div>
      {messageContextHolder}

      <section className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="px-0 font-semibold text-text-secondary hover:text-primary-container"
            onClick={() => router.push("/admin/don-hang")}
          >
            Quay lại
          </Button>
          <h2 className="text-lg font-extrabold text-text-main">Tạo đơn mới</h2>
          <p className="hidden text-xs text-text-secondary md:block">
            Admin tạo đơn thay khách — kiểm tra tồn kho và preview giá.
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          size="small"
          className="h-8 rounded-[10px] font-semibold"
          onClick={() => {
            form.resetFields();
            setDesignKeyword("");
            setSelectedDesignById({});
            setSelectedProductById({});
          }}
        >
          Làm mới
        </Button>
      </section>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        requiredMark={false}
        className="rounded-2xl border border-border bg-surface shadow-admin-card"
      >
        <div className="grid grid-cols-1 gap-5 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="space-y-3">
            <CustomerSection
              customers={customers}
              isSearchingCustomers={isSearchingCustomers}
              onCustomerSearch={setCustomerKeyword}
              onCustomerChange={handleCustomerChange}
            />

            <ProductsSection
              userId={userId}
              productOptions={productOptions}
              designs={designs}
              isSearchingProducts={isSearchingProducts}
              isLoadingDesigns={isLoadingDesigns}
              preview={preview}
              onProductSearch={setProductKeyword}
              onProductTypeChange={handleProductTypeChange}
              onProductChange={handleProductChange}
              onColorChange={handleColorChange}
              onVariantChange={handleVariantChange}
              onDesignSearch={setDesignKeyword}
              onDesignChange={handleDesignChange}
            />

            <PaymentShippingSection
              preview={preview}
              paymentMethod={values.paymentMethod}
              paymentType={values.paymentType}
              hasCustomDesign={hasCustomDesign}
              promotions={promotions}
              isLoadingPromotions={isLoadingPromotions}
            />

            {createOrderMutation.isError ? (
              <Alert
                showIcon
                type="error"
                title={getApiErrorMessage(createOrderMutation.error)}
              />
            ) : null}
          </div>

          <div>
            {productOptions.length === 0 && isSearchingProducts ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : preview.lines.length > 0 ? (
              <OrderSummary
                preview={preview}
                isSubmitting={createOrderMutation.isPending}
                onCancel={() => router.push("/admin/don-hang")}
              />
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


import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined,
  TagOutlined,
  TruckOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import type {
  DistributionItem,
  MetricItem,
  StatisticsTableRow,
} from "./types";

/**
 * Dữ liệu minh họa được tính từ dữ liệu seed trong Database_main.sql.
 * Các đơn CANCELLED không được tính vào số tiền và sản lượng báo cáo.
 */
export const reportMetrics: MetricItem[] = [
  {
    label: "Tổng tiền giảm giá",
    value: "110.000đ",
    description: "Tổng CustomerOrder.discountAmount",
    icon: <PercentageOutlined />,
    tone: "warning",
  },
  {
    label: "Tổng phí vận chuyển",
    value: "390.000đ",
    description: "Tổng CustomerOrder.shippingFee",
    icon: <TruckOutlined />,
    tone: "primary",
  },
  {
    label: "Đơn dùng khuyến mãi",
    value: "2",
    description: "Đếm đơn có CustomerOrder.promotionId",
    icon: <TagOutlined />,
    tone: "accent",
  },
  {
    label: "Đơn thanh toán cọc",
    value: "3",
    description: "CustomerOrder.paymentType = DEPOSIT",
    icon: <WalletOutlined />,
    tone: "success",
  },
];

export const ratioMetrics: MetricItem[] = [
  {
    label: "Tỷ lệ đơn hoàn tất",
    value: "22,2%",
    description: "4 đơn hoàn tất / 18 đơn",
    icon: <CheckCircleOutlined />,
    tone: "success",
    direction: "up",
    directionLabel: "Nên tăng",
  },
  {
    label: "Tỷ lệ đơn bị hủy",
    value: "5,6%",
    description: "1 đơn bị hủy / 18 đơn",
    icon: <CloseCircleOutlined />,
    tone: "warning",
    direction: "down",
    directionLabel: "Nên giảm",
  },
  {
    label: "Tỷ lệ giao dịch thành công",
    value: "47,4%",
    description: "9 giao dịch thành công / 19 giao dịch",
    icon: <PercentageOutlined />,
    tone: "primary",
    direction: "up",
    directionLabel: "Nên tăng",
  },
  {
    label: "Tỷ lệ chờ thanh toán",
    value: "31,6%",
    description: "6 giao dịch đang chờ / 19 giao dịch",
    icon: <ClockCircleOutlined />,
    tone: "accent",
    direction: "down",
    directionLabel: "Nên giảm",
  },
];

export const orderStatusDistribution: DistributionItem[] = [
  { label: "Đang xử lý", value: 11, displayValue: "11 đơn", color: "#0ea5e9" },
  { label: "Hoàn tất", value: 4, displayValue: "4 đơn", color: "#10b981" },
  { label: "Đang giao / chờ giao", value: 2, displayValue: "2 đơn", color: "#6366f1" },
  { label: "Đã hủy", value: 1, displayValue: "1 đơn", color: "#f97316" },
];

export const paymentStatusDistribution: DistributionItem[] = [
  { label: "Thành công", value: 9, displayValue: "9 giao dịch", color: "#10b981" },
  { label: "Chờ thanh toán", value: 6, displayValue: "6 giao dịch", color: "#f59e0b" },
  { label: "Chờ đối soát COD", value: 2, displayValue: "2 giao dịch", color: "#0ea5e9" },
  { label: "Thất bại / đã hủy", value: 2, displayValue: "2 giao dịch", color: "#f97316" },
];

export const productReportRows: StatisticsTableRow[] = [
  { id: "1", product: "Áo Thun Wide Form", quantity: "16", orderLines: "5", lineValue: "2.020.000đ" },
  { id: "2", product: "Áo Thun", quantity: "6", orderLines: "2", lineValue: "1.170.000đ" },
  { id: "3", product: "Áo Hoodie", quantity: "7", orderLines: "5", lineValue: "2.290.000đ" },
  { id: "4", product: "Áo Polo", quantity: "19", orderLines: "5", lineValue: "3.840.000đ" },
];

export const paymentMethodRows: StatisticsTableRow[] = [
  { id: "VNPAY", method: "VNPay", transactions: "7", completed: "6", collected: "3.065.000đ" },
  { id: "MOMO", method: "MoMo", transactions: "4", completed: "2", collected: "1.060.000đ" },
  { id: "BANK_TRANSFER", method: "Chuyển khoản", transactions: "1", completed: "1", collected: "1.640.000đ" },
  { id: "COD", method: "COD", transactions: "7", completed: "0", collected: "0đ" },
];

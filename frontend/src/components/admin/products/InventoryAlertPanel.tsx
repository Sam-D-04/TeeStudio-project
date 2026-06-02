/**
 * InventoryAlertPanel – bảng cảnh báo tồn kho bên phải trang phôi áo.
 *
 * Hiển thị danh sách biến thể (màu + size) có tồn kho thấp.
 * Mỗi mục hiển thị:
 * - Tên phôi áo
 * - Màu sắc + kích thước
 * - Mã SKU
 * - Số lượng tồn kho
 * - Nút "Tạo phiếu nhập" để chuyển sang quản lý kho
 *
 * 2 mức cảnh báo:
 * - "sap_het" (viền cam vàng): tồn kho thấp nhưng còn hàng
 * - "het_hang" (viền đỏ cam): hết hàng hoàn toàn
 */

import { PlusCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { ArrowRightOutlined } from "@ant-design/icons";

// ===== KIỂU DỮ LIỆU =====
export type AlertSeverity = "sap_het" | "het_hang";

export type InventoryAlertItem = {
  id: number;
  /** Tên phôi áo */
  productName: string;
  /** Màu sắc biến thể */
  colorName: string;
  /** Mã màu hex để vẽ chấm màu */
  colorHex: string;
  /** Kích thước */
  size: string;
  /** Mã SKU */
  sku: string;
  /** Số lượng tồn kho hiện tại */
  stock: number;
  /** Mức độ cảnh báo */
  severity: AlertSeverity;
};

type InventoryAlertPanelProps = {
  /** Danh sách cảnh báo tồn kho */
  alerts: InventoryAlertItem[];
  /** Tổng số cảnh báo (để hiển thị "Xem tất cả (n)") */
  totalAlertCount: number;
};

// Cấu hình màu sắc theo mức độ cảnh báo
const severityConfig: Record<
  AlertSeverity,
  {
    /** Màu chữ số lượng */
    stockColor: string;
    /** Class cho card cảnh báo */
    cardClass: string;
    /** Class cho nút tạo phiếu nhập */
    buttonClass: string;
  }
> = {
  sap_het: {
    stockColor: "text-warning",
    cardClass: "border-warning/30 bg-warning/5 hover:bg-warning/10",
    buttonClass:
      "border-border text-text-secondary hover:border-tertiary-container hover:text-primary",
  },
  het_hang: {
    stockColor: "text-error",
    cardClass:
      "border-error/30 bg-error-container/20 hover:bg-error-container/30",
    buttonClass: "border-error/30 text-error hover:bg-error/10",
  },
};

export default function InventoryAlertPanel({
  alerts,
  totalAlertCount,
}: InventoryAlertPanelProps) {
  return (
    // Card panel cao toàn bộ, nền trắng, bo góc 20px
    <div className="flex h-full max-h-[800px] flex-col overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      
      {/* Tiêu đề panel (sticky để không bị scroll) */}
      <div className="sticky top-0 flex items-center gap-2 border-b border-border bg-surface p-5">
        <WarningOutlined className="text-[20px] text-warning" />
        <h3 className="text-card-title font-bold text-text-main">
          Cảnh báo tồn kho
        </h3>
      </div>

      {/* Danh sách cảnh báo (có thể scroll) */}
      <div className="flex-1 overflow-y-auto p-2">
        {alerts.length === 0 ? (
          // Trạng thái rỗng: không có cảnh báo
          <div className="py-8 text-center text-body-sm text-text-muted">
            Không có biến thể nào cần cảnh báo
          </div>
        ) : (
          alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            return (
              // Mỗi mục cảnh báo
              <div
                key={alert.id}
                className={`mb-2 flex flex-col gap-2 rounded-lg border p-3 transition-colors ${config.cardClass}`}
              >
                {/* Dòng trên: tên sản phẩm + số lượng */}
                <div className="flex items-start justify-between">
                  <div>
                    {/* Tên phôi áo */}
                    <div className="line-clamp-1 text-[13px] font-semibold text-text-main">
                      {alert.productName}
                    </div>
                    {/* Màu sắc + kích thước */}
                    <div className="mt-0.5 flex items-center gap-1 text-[12px] text-text-secondary">
                      {/* Chấm màu */}
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-border"
                        style={{ backgroundColor: alert.colorHex }}
                      />
                      {alert.colorName} – {alert.size}
                    </div>
                  </div>
                  {/* Số lượng tồn kho (màu theo severity) */}
                  <span className={`text-[14px] font-bold ${config.stockColor}`}>
                    {alert.stock}
                  </span>
                </div>

                {/* Mã SKU */}
                <div className="font-mono text-[11px] text-text-muted">
                  {alert.sku}
                </div>

                {/* Nút tạo phiếu nhập kho */}
                <button
                  type="button"
                  className={`mt-1 flex w-full items-center justify-center gap-1 rounded border py-1.5 text-[12px] font-medium shadow-sm transition-colors ${config.buttonClass}`}
                >
                  <PlusCircleOutlined className="text-[14px]" />
                  {alert.severity === "het_hang"
                    ? "Tạo phiếu nhập (Gấp)"
                    : "Tạo phiếu nhập"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer: nút xem tất cả */}
      {totalAlertCount > 0 && (
        <div className="border-t border-border bg-surface-alt/50 p-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1 py-2 text-[13px] font-medium text-primary hover:underline"
          >
            Xem tất cả cảnh báo ({totalAlertCount})
            <ArrowRightOutlined className="text-[14px]" />
          </button>
        </div>
      )}
    </div>
  );
}

import { EditOutlined, ThunderboltFilled } from "@ant-design/icons";
import StatusBadge, { type DesignStatus } from "../../common/StatusBadge";

export type DesignOrder = {
  designId?: number;
  code: string;
  customerName: string;
  technique: string;
  status: DesignStatus;
  isUrgent?: boolean;
};

type DesignReviewTableProps = {
  orders: DesignOrder[];
  /** Callback khi admin nhấn "Duyệt thiết kế" */
  onDuyetThietKe?: (order: DesignOrder) => void;
};

export default function DesignReviewTable({
  orders,
  onDuyetThietKe,
}: DesignReviewTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] border-collapse text-left leading-5">
        <thead>
          <tr className="border-b border-border bg-surface-alt text-label-bold uppercase text-text-secondary">
            <th className="p-3 pl-5 font-bold">Mã đơn / Thiết kế</th>
            <th className="p-3 font-bold">Khách hàng</th>
            <th className="p-3 font-bold">Trạng thái</th>
            <th className="p-3 pr-5 text-right font-bold">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="p-6 text-center text-sm text-text-secondary"
              >
                Không có thiết kế nào cần xử lý.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.code}
                className="transition-colors hover:bg-surface-alt/70"
              >
                <td className="p-3 pl-5 align-middle font-medium text-text-main">
                  <div className="flex items-center gap-1.5">
                    {order.isUrgent && (
                      <ThunderboltFilled
                        className="text-[13px] text-error"
                        title="Gấp"
                      />
                    )}
                    <span className="block max-w-36 break-words">{order.code}</span>
                  </div>
                </td>
                <td className="p-3 align-middle text-text-secondary">
                  {order.customerName}
                </td>
                <td className="p-3 align-middle">
                  <StatusBadge status={order.status} />
                </td>
                <td className="p-3 pr-5 align-middle text-right">
                  <button
                    type="button"
                    className="inline-flex items-center justify-end gap-1.5 text-sm font-medium text-primary-container transition-colors hover:text-[#0284c7]"
                    onClick={() => onDuyetThietKe?.(order)}
                  >
                    <EditOutlined className="text-[14px]" />
                    <span>Duyệt thiết kế</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

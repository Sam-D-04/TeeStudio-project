import { EditOutlined, SkinOutlined } from "@ant-design/icons";
import StatusBadge, { type DesignStatus } from "./StatusBadge";

export type DesignOrder = {
  code: string;
  customerName: string;
  technique: string;
  status: DesignStatus;
};

type DesignReviewTableProps = {
  orders: DesignOrder[];
};

export default function DesignReviewTable({ orders }: DesignReviewTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left leading-5">
        <thead>
          <tr className="border-b border-border bg-surface-alt text-label-bold uppercase text-text-secondary">
            <th className="p-4 pl-6 font-bold">Mã đơn</th>
            <th className="p-4 font-bold">Khách hàng</th>
            <th className="p-4 font-bold">Bản xem trước</th>
            <th className="p-4 font-bold">Gia công</th>
            <th className="p-4 font-bold">Trạng thái</th>
            <th className="p-4 pr-6 text-right font-bold">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => (
            <tr
              key={order.code}
              className="transition-colors hover:bg-surface-alt/70"
            >
              <td className="p-4 pl-6 align-middle font-medium text-text-main">
                <span className="block max-w-36 break-words">{order.code}</span>
              </td>
              <td className="p-4 align-middle text-text-secondary">{order.customerName}</td>
              <td className="p-4 align-middle">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-border bg-surface-variant text-text-muted">
                  <SkinOutlined className="text-[20px]" />
                </div>
              </td>
              <td className="p-4 align-middle text-text-secondary">{order.technique}</td>
              <td className="p-4 align-middle">
                <StatusBadge status={order.status} />
              </td>
              <td className="p-4 pr-6 align-middle text-right">
                <button
                  type="button"
                  className="inline-flex items-center justify-end gap-2 text-sm font-medium text-primary-container transition-colors hover:text-[#0284c7]"
                >
                  <EditOutlined className="text-[16px]" />
                  <span>Mở trình thiết kế</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

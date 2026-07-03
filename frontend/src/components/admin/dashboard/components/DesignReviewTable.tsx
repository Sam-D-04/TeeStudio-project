"use client";

import { ThunderboltFilled } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import StatusBadge, { type DesignStatus } from "../../common/StatusBadge";

export type DesignOrder = {
  designId: number;
  code: string;
  customerName: string;
  technique: string;
  status: DesignStatus;
  isUrgent?: boolean;
};

type DesignReviewTableProps = {
  orders: DesignOrder[];
};

export default function DesignReviewTable({ orders }: DesignReviewTableProps) {
  const router = useRouter();

  function moChiTiet(order: DesignOrder) {
    router.push(`/admin/thiet-ke/${order.designId}`);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] border-collapse text-left leading-5">
        <thead>
          <tr className="border-b border-border bg-surface-alt text-label-bold uppercase text-text-secondary">
            <th className="p-3 pl-5 font-bold">Mã đơn / Thiết kế</th>
            <th className="p-3 font-bold">Khách hàng</th>
            <th className="p-3 font-bold">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="p-6 text-center text-sm text-text-secondary"
              >
                Không có thiết kế nào cần xử lý.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.designId}
                role="link"
                tabIndex={0}
                aria-label={`Xem chi tiết thiết kế ${order.code}`}
                className="cursor-pointer transition-colors hover:bg-surface-alt/70 focus-visible:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-container"
                onClick={() => moChiTiet(order)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    moChiTiet(order);
                  }
                }}
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

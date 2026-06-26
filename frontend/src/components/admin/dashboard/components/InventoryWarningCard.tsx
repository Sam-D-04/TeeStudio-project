import { WarningOutlined } from "@ant-design/icons";
import Link from "next/link";

type InventoryItem = {
  variantId?: number;
  name: string;
  detail: string;
  stockQty: number;
  reservedQty: number;
};

type InventoryWarningCardProps = {
  items: InventoryItem[];
};

const WARNING_THRESHOLD = 15;

function getInventoryStatus(available: number) {
  if (available <= 0) return "het_hang";
  if (available <= WARNING_THRESHOLD) return "sap_het";
  return "con_hang";
}

export default function InventoryWarningCard({
  items,
}: InventoryWarningCardProps) {
  return (
    <section className="admin-card p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 text-card-title font-bold text-text-main">
          <WarningOutlined className="text-error" />
          <span>Tồn kho cần chú ý</span>
        </h3>
        <Link
          href="/admin/kho-hang"
          className="text-sm font-medium text-primary-container hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-secondary">
          Tất cả sản phẩm đang có tồn kho ổn định.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 3).map((item) => {
            const available = item.stockQty;
            const status = getInventoryStatus(available);

            return (
              <li
                key={`${item.variantId ?? item.name}-${item.detail}`}
                className="flex min-h-[72px] items-center justify-between gap-4 rounded-[10px] border border-border bg-surface-alt p-3"
              >
                <div className="min-w-0 leading-5">
                  <p className="text-sm font-medium leading-5 text-text-main">{item.name}</p>
                  <p className="text-xs leading-[18px] text-text-secondary">{item.detail}</p>
                </div>
                <span
                  className={`shrink-0 rounded-[6px] px-2 py-1 text-xs font-bold leading-4 ${
                    status === "het_hang"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  Còn {available}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

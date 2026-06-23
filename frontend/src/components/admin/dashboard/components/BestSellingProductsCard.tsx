import { SkinOutlined } from "@ant-design/icons";

export type BestSellingProduct = {
  productId?: number;
  name: string;
  variant: string;
  revenue: number;
  soldQty?: number;
  thumbnailClassName: string;
};

type BestSellingProductsCardProps = {
  products: BestSellingProduct[];
};

/** Định dạng số tiền VND có dấu chấm ngàn */
function formatTienVnd(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function BestSellingProductsCard({
  products,
}: BestSellingProductsCardProps) {
  return (
    <section className="admin-card p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-card-title font-bold text-text-main">
          {products.length > 0
            ? `${products.length} sản phẩm bán chạy nhất`
            : "Sản phẩm bán chạy nhất"}
        </h3>
        <a href="#" className="text-sm font-medium text-primary-container hover:underline">
          Xem tất cả
        </a>
      </div>

      {products.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-secondary">
          Chưa có dữ liệu sản phẩm bán chạy.
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((product, index) => (
            <li
              key={`${product.productId ?? product.name}-${product.variant}`}
              className="flex min-h-[72px] items-center gap-3 rounded-[10px] border border-border bg-surface-alt p-3"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] ${product.thumbnailClassName}`}
                aria-hidden="true"
              >
                <SkinOutlined className="text-[22px]" />
              </div>

              <div className="min-w-0 flex-1 leading-5">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs font-bold text-text-muted">
                    {index + 1}
                  </span>
                  <p className="truncate text-sm font-semibold text-text-main">
                    {product.name}
                  </p>
                </div>
                <p className="truncate text-xs leading-[18px] text-text-secondary">
                  {product.variant}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="block text-sm font-bold text-text-main">
                  {formatTienVnd(product.revenue)}
                </span>
                {product.soldQty !== undefined && (
                  <span className="text-[11px] text-text-secondary">
                    {product.soldQty.toLocaleString("vi-VN")} sản phẩm
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

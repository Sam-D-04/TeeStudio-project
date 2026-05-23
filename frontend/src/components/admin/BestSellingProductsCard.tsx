import { SkinOutlined } from "@ant-design/icons";

export type BestSellingProduct = {
  name: string;
  variant: string;
  revenue: string;
  thumbnailClassName: string;
};

type BestSellingProductsCardProps = {
  products: BestSellingProduct[];
};

export default function BestSellingProductsCard({
  products,
}: BestSellingProductsCardProps) {
  return (
    <section className="admin-card p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-card-title font-bold text-text-main">
          5 sản phẩm bán chạy nhất
        </h3>
        <a href="#" className="text-sm font-medium text-primary-container hover:underline">
          Xem tất cả
        </a>
      </div>

      <ul className="space-y-3">
        {products.map((product, index) => (
          <li
            key={`${product.name}-${product.variant}`}
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

            <span className="shrink-0 text-sm font-bold text-text-main">
              {product.revenue}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

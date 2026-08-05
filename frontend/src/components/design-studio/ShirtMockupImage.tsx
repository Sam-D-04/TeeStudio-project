"use client";

import { MockupImage, ShirtType, ShirtView } from "@/store/useDesignStore";

interface ShirtMockupImageProps {
  type: ShirtType;
  view: ShirtView;
  color: string; // Mã màu hex của áo đang chọn
  images: MockupImage[]; // Danh sách ảnh mockup của sản phẩm, tải từ DB (xem useDesignStore.mockupImages)
  width: number;
  height: number;
}

/**
 * Tìm URL ảnh mockup khớp đúng màu (colorHex) + mặt (view) đang chọn, trong danh sách
 * ảnh đã tải từ DB (ProductImage.colorHex/view — xem public.service.js). Nếu chưa có ảnh
 * khớp màu (vd. danh sách đang tải, hoặc màu chưa có ảnh) thì fallback về ảnh đầu tiên
 * cùng mặt để tránh vỡ layout; trả rỗng nếu sản phẩm chưa có ảnh nào.
 */
export function getMockupSrc(images: MockupImage[], view: ShirtView, color: string): string {
  const normalizedColor = color.trim().toLowerCase();
  const exact = images.find(
    (img) => img.colorHex.toLowerCase() === normalizedColor && img.view === view
  );
  if (exact) return exact.url;

  const sameView = images.find((img) => img.view === view);
  return sameView?.url ?? "";
}

/**
 * Trả về ranh giới vùng in (đơn vị px) tính theo kích thước container (width x height).
 * Với áo polo mặt trước, hàm này trả về HÌNH CHỮ NHẬT BAO (bounding box) của đa giác
 * vùng in — dùng để giới hạn khi kéo/di chuyển phần tử trên canvas.
 */
export function getPrintAreaBoundary(
  type: ShirtType,
  view: ShirtView,
  containerW: number,
  containerH: number
): { top: number; left: number; width: number; height: number } {
  const configs: Record<ShirtType, Record<ShirtView, { top: number; left: number; w: number; h: number }>> = {
    tshirt: {
      front: { top: 0.31, left: 0.30, w: 0.40, h: 0.4 },
      back: { top: 0.28, left: 0.28, w: 0.44, h: 0.46 },
    },
    polo: {
      // bounding box của polygon polo front
      front: { top: 0.45, left: 0.27, w: 0.46, h: 0.40 },
      back: { top: 0.27, left: 0.28, w: 0.44, h: 0.46 },
    },
    hoodie: {
      front: { top: 0.34, left: 0.30, w: 0.40, h: 0.26 },
      back: { top: 0.3, left: 0.26, w: 0.48, h: 0.46 },
    },
  };

  const cfg = configs[type][view];
  return {
    top: cfg.top * containerH,
    left: cfg.left * containerW,
    width: cfg.w * containerW,
    height: cfg.h * containerH,
  };
}

/**
 * Polygon points cho vùng in áo polo mặt trước (tránh cổ áo & hàng khuy).
 * Mỗi điểm là [xFraction, yFraction] — tỷ lệ phần trăm so với container.
 *
 *  Hình dạng (nhìn từ trước):
 *    Top-left → sang phải → khoét chữ U xuống → lên lại → Top-right
 *    → xuống Bottom-right → Bottom-left → lên Top-left
 *
 *  Điều chỉnh các con số để khớp mockup thực tế của bạn.
 */
export function getPoloFrontPolygon(
  containerW: number,
  containerH: number
): [number, number][] {
  const pts: [number, number][] = [
    // ── Góc trên trái
    [0.3, 0.3],
    // ── Đi sang phải dọc cạnh trên, tới trước khoét cổ áo trái
    [0.45, 0.3],
    // ── Đi xuống trái của khoét cổ (hàng khuy)
    [0.45, 0.35],
    // ── Đáy khoét hình U (bo cong nhẹ — dùng thêm điểm trung gian)
    [0.45, 0.43],
    [0.50, 0.43],
    [0.56, 0.43],
    // ── Lên lại phải của khoét
    [0.56, 0.35],
    [0.56, 0.3],
    // ── Góc trên phải
    [0.70, 0.3],
    // ── Xuống cạnh phải
    [0.70, 0.75],
    // ── Cạnh dưới → sang trái
    [0.3, 0.75],
    // ── Lên cạnh trái → quay về điểm đầu
  ];
  return pts.map(([fx, fy]) => [fx * containerW, fy * containerH]);
}

/** Trả về true nếu loại áo + view này dùng polygon thay vì rectangle */
export function hasPrintAreaPolygon(type: ShirtType, view: ShirtView): boolean {
  return type === "polo" && view === "front";
}

export default function ShirtMockupImage({
  type,
  view,
  color,
  images,
  width,
  height,
}: ShirtMockupImageProps) {
  const src = getMockupSrc(images, view, color);
  if (!src) return null;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${src})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
        userSelect: "none",
      }}
      title={`${type} ${view}`}
    />
  );
}

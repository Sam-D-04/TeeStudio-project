"use client";

import { ShirtType, ShirtView } from "@/store/useDesignStore";

interface ShirtMockupImageProps {
  type: ShirtType;
  view: ShirtView;
  color: string; // Mã màu hex, dùng để chọn ảnh mockup có màu gần đúng nhất
  width: number;
  height: number;
}

/**
 * Ánh xạ loại áo + mặt (trước/sau) + màu sang tên file ảnh PNG mockup tương ứng.
 * TShirt:  /images/mockups/TShirt-{Black|White|Navy}-{Front|Back}.png
 * Polo:    /images/mockups/Polo-{Beige|White|Navy}-{Front|Back}.png
 *          Lưu ý: file Polo-Navy-Back bị đặt tên sai chính tả thành "Polo-Navy-Backt.png" (giữ nguyên như vậy)
 */
function resolveHoodieColor(hexColor: string): "Brown" | "Grey" {
  const brown = ["#92400e", "#78350f", "#b45309", "#d97706", "#8b4513", "#a0522d", "#cd853f", "#d2691e", "#f4a460"];
  const hex = hexColor.toLowerCase();
  if (brown.includes(hex)) return "Brown";
  return "Grey";
}

function resolveTShirtColor(hexColor: string): "Black" | "White" | "Navy" {
  const dark = ["#000000", "#1e293b", "#374151", "#0f172a", "#111827", "#1f2937"];
  const navy = ["#4a90d9", "#0ea5e9", "#0284c7", "#1d4ed8", "#1e40af", "#2563eb", "#3b82f6", "#1a56db"];
  const hex = hexColor.toLowerCase();
  if (dark.includes(hex)) return "Black";
  if (navy.includes(hex)) return "Navy";
  return "White";
}

function resolvePoloColor(hexColor: string): "Beige" | "White" | "Navy" {
  const navy = ["#4a90d9", "#0ea5e9", "#0284c7", "#1d4ed8", "#1e40af", "#2563eb", "#3b82f6", "#1a56db"];
  const beige = ["#000000", "#1e293b", "#374151", "#0f172a", "#111827", "#1f2937",
    "#92400e", "#78350f", "#b45309", "#d97706", "#374151", "#4b5563",
    "#6b7280", "#9ca3af", "#d1d5db", "#f5f5dc"];
  const hex = hexColor.toLowerCase();
  if (navy.includes(hex)) return "Navy";
  if (beige.includes(hex)) return "Beige";
  // Light / white-ish colors → White mockup
  return "White";
}

function resolveView(view: ShirtView): "Front" | "Back" {
  return view === "front" ? "Front" : "Back";
}

export function getMockupSrc(type: ShirtType, view: ShirtView, color: string): string {
  const viewKey = resolveView(view);

  if (type === "polo") {
    const colorKey = resolvePoloColor(color);
    // Xử lý riêng: file Navy-Back được tải lên với tên bị gõ sai chính tả
    if (colorKey === "Navy" && viewKey === "Back") {
      return "/images/mockups/Polo-Navy-Backt.png";
    }
    return `/images/mockups/Polo-${colorKey}-${viewKey}.png`;
  }

  if (type === "hoodie") {
    const colorKey = resolveHoodieColor(color);
    const HOODIE_URLS: Record<string, Record<string, string>> = {
      Brown: {
        Front: "https://res.cloudinary.com/dwol6aarv/image/upload/v1782209409/Hoodie-Brown-Front_ab4bha.png",
        Back: "https://res.cloudinary.com/dwol6aarv/image/upload/v1782209411/Hoodie-Brown-Back_echgn5.png",
      },
      Grey: {
        Front: "https://res.cloudinary.com/dwol6aarv/image/upload/v1782209405/Hoodie-Grey-Front_boebdz.png",
        Back: "https://res.cloudinary.com/dwol6aarv/image/upload/v1782209405/Hoodie-Grey-Back_ntgcoc.png",
      }
    };
    return HOODIE_URLS[colorKey]?.[viewKey] || HOODIE_URLS.Grey.Front;
  }

  // Mặc định (áo thun / tshirt)
  const colorKey = resolveTShirtColor(color);
  return `/images/mockups/TShirt-${colorKey}-${viewKey}.png`;
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
  width,
  height,
}: ShirtMockupImageProps) {
  const src = getMockupSrc(type, view, color);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={`${type} ${view}`}
      width={width}
      height={height}
      style={{
        display: "block",
        width,
        height,
        objectFit: "contain",
        pointerEvents: "none",
        userSelect: "none",
      }}
      draggable={false}
    />
  );
}

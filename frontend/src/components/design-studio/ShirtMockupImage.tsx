"use client";

import React from "react";
import { ShirtType, ShirtView } from "@/store/useDesignStore";

interface ShirtMockupImageProps {
  type: ShirtType;
  view: ShirtView;
  color: string; // hex color, used to pick nearest available mockup
  width: number;
  height: number;
}

/**
 * Maps shirt type + view + color to the correct PNG mockup filename.
 * TShirt:  /images/mockups/TShirt-{Black|White|Navy}-{Front|Back}.png
 * Polo:    /images/mockups/Polo-{Beige|White|Navy}-{Front|Back}.png
 *          Note: Polo-Navy-Back file is named "Polo-Navy-Backt.png" (typo kept as-is)
 */
function resolveTShirtColor(hexColor: string): "Black" | "White" | "Navy" {
  const dark = ["#000000", "#1e293b", "#374151", "#0f172a", "#111827", "#1f2937"];
  const navy = ["#4a90d9", "#0ea5e9", "#0284c7", "#1d4ed8", "#1e40af", "#2563eb", "#3b82f6", "#1a56db"];
  const hex  = hexColor.toLowerCase();
  if (dark.includes(hex)) return "Black";
  if (navy.includes(hex)) return "Navy";
  return "White";
}

function resolvePoloColor(hexColor: string): "Beige" | "White" | "Navy" {
  const navy  = ["#4a90d9", "#0ea5e9", "#0284c7", "#1d4ed8", "#1e40af", "#2563eb", "#3b82f6", "#1a56db"];
  const beige = ["#000000", "#1e293b", "#374151", "#0f172a", "#111827", "#1f2937",
                 "#92400e", "#78350f", "#b45309", "#d97706", "#374151", "#4b5563",
                 "#6b7280", "#9ca3af", "#d1d5db", "#f5f5dc"];
  const hex   = hexColor.toLowerCase();
  if (navy.includes(hex))  return "Navy";
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
    // Workaround: the Navy-Back file was uploaded with a typo
    if (colorKey === "Navy" && viewKey === "Back") {
      return "/images/mockups/Polo-Navy-Backt.png";
    }
    return `/images/mockups/Polo-${colorKey}-${viewKey}.png`;
  }

  // TShirt & Hoodie fall back to TShirt mockup
  const colorKey = resolveTShirtColor(color);
  return `/images/mockups/TShirt-${colorKey}-${viewKey}.png`;
}

/**
 * Returns the print area boundary (in px) relative to the container (width x height).
 * For polo front, this returns the BOUNDING BOX of the polygon (used for element drag constraints).
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
      back:  { top: 0.28, left: 0.28, w: 0.44, h: 0.46 },
    },
    polo: {
      // bounding box của polygon polo front
      front: { top: 0.45, left: 0.27, w: 0.46, h: 0.40 },
      back:  { top: 0.27, left: 0.28, w: 0.44, h: 0.46 },
    },
    hoodie: {
      front: { top: 0.30, left: 0.30, w: 0.40, h: 0.32 },
      back:  { top: 0.22, left: 0.26, w: 0.48, h: 0.46 },
    },
  };

  const cfg = configs[type][view];
  return {
    top:    cfg.top  * containerH,
    left:   cfg.left * containerW,
    width:  cfg.w    * containerW,
    height: cfg.h    * containerH,
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
        // Use mix-blend-mode to colorize white shirt with the shirt color
        // This works best when the mockup is a white/light shirt
        // For black/dark shirts the color picker won't change much
      }}
      draggable={false}
    />
  );
}

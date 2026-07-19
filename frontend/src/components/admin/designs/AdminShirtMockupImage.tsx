"use client";

import type { ShirtType, ShirtView } from "@/store/useDesignStore";
import { getAdminMockupFilter, getAdminMockupSrc } from "./adminDesignColorUtils";

type AdminShirtMockupImageProps = {
  type: ShirtType;
  view: ShirtView;
  color: string;
  width: number;
  height: number;
};

export default function AdminShirtMockupImage({
  type,
  view,
  color,
  width,
  height,
}: AdminShirtMockupImageProps) {
  const filter = getAdminMockupFilter(type, color);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getAdminMockupSrc(type, view, color)}
      alt={`${type} ${view}`}
      width={width}
      height={height}
      style={{
        display: "block",
        width,
        height,
        objectFit: "contain",
        filter,
        pointerEvents: "none",
        userSelect: "none",
      }}
      draggable={false}
    />
  );
}

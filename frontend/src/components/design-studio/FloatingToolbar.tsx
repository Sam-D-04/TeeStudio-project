"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDesignStore } from "@/store/useDesignStore";

/* ─── Icons ─── */
const DuplicateIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const LockIcon = ({ locked }: { locked?: boolean }) =>
  locked ? (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path strokeLinecap="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ) : (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path strokeLinecap="round" d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );

const DeleteIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);

/* ─── Button style ─── */
function ToolBtn({
  title, onClick, danger, active, children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width:          28,
        height:         28,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        background:     hov
          ? danger ? "rgba(248,113,113,0.15)" : "#334155"
          : "transparent",
        border:         "none",
        borderRadius:   6,
        cursor:         "pointer",
        color:          active ? "#f59e0b" : danger ? "#f87171" : "#94a3b8",
        transition:     "background 0.15s, color 0.15s",
        padding:        0,
        flexShrink:     0,
      }}
    >
      {children}
    </button>
  );
}

const Divider = () => (
  <div style={{ width: 1, height: 18, background: "#334155", flexShrink: 0 }} />
);

/* ─── FloatingToolbar ─── */
interface Props {
  /** ref của div bao quanh ảnh áo (id="print_body-image") */
  shirtContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Hệ số zoom hiện tại */
  zoom: number;
}

interface ToolbarPos { x: number; y: number; }

const TOOLBAR_W = 112;
const TOOLBAR_H = 36;
const MARGIN    = 10;

export default function FloatingToolbar({ shirtContainerRef, zoom }: Props) {
  const { selectedId, elements, duplicateElement, removeElement, toggleLock } =
    useDesignStore();

  const el = elements.find((e) => e.id === selectedId) ?? null;
  const [pos, setPos] = useState<ToolbarPos | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!el) { setPos(null); return; }

    const compute = () => {
      const rect = shirtContainerRef.current?.getBoundingClientRect();
      if (!rect) { setPos(null); return; }

      /*
        Tọa độ element trong không gian logic (0..CONTAINER_W).
        Nhân zoom → vị trí tương đối trong ảnh áo hiển thị.
        Cộng rect.left/top → vị trí tuyệt đối trong viewport (fixed).
      */
      const itemDisplayX = el.x * zoom + rect.left;
      const itemDisplayY = el.y * zoom + rect.top;
      const itemDisplayW = (el.width ?? 100) * zoom;

      /* Canh giữa trên đỉnh item, không để tràn ra ngoài viewport */
      let x = itemDisplayX + itemDisplayW / 2 - TOOLBAR_W / 2;
      let y = itemDisplayY - TOOLBAR_H - MARGIN;

      // Giữ trong viewport
      x = Math.max(8, Math.min(x, window.innerWidth  - TOOLBAR_W - 8));
      y = Math.max(8, y);

      setPos({ x, y });
    };

    compute();

    // Cập nhật khi window resize hoặc scroll
    window.addEventListener("resize", compute, { passive: true });
    window.addEventListener("scroll", compute, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [el, zoom, shirtContainerRef]);

  if (!el || !pos) return null;

  return (
    <div
      style={{
        position:       "fixed",
        left:           pos.x,
        top:            pos.y,
        zIndex:         9999,
        display:        "flex",
        alignItems:     "center",
        gap:            4,
        background:     "#1e293b",
        border:         "1px solid #334155",
        borderRadius:   8,
        padding:        "4px 6px",
        boxShadow:      "0 4px 20px rgba(0,0,0,0.5)",
        pointerEvents:  "all",
        userSelect:     "none",
        width:          TOOLBAR_W,
        height:         TOOLBAR_H,
        boxSizing:      "border-box",
        /* Hiệu ứng hiện mượt */
        animation:      "ds-toolbar-pop 0.12s ease",
      }}
    >
      <ToolBtn title="Nhân bản (Ctrl+D)" onClick={() => duplicateElement(el.id)}>
        <DuplicateIcon />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title={el.locked ? "Mở khoá" : "Khoá vật thể"}
        onClick={() => toggleLock(el.id)}
        active={el.locked}
      >
        <LockIcon locked={el.locked} />
      </ToolBtn>

      <Divider />

      <ToolBtn title="Xoá (Del)" onClick={() => removeElement(el.id)} danger>
        <DeleteIcon />
      </ToolBtn>
    </div>
  );
}

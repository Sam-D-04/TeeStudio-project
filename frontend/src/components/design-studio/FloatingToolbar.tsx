"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDesignStore } from "@/store/useDesignStore";
import { removeImageBackground } from "@/lib/backgroundRemoval";

/* ─── Các icon dùng trong toolbar ─── */
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

/* ─── Nút bấm dùng chung trong toolbar ─── */
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
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: hov
          ? danger ? "rgba(248,113,113,0.15)" : "#334155"
          : "transparent",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        color: active ? "#f59e0b" : danger ? "#f87171" : "#94a3b8",
        transition: "background 0.15s, color 0.15s",
        padding: 0,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

const Divider = () => (
  <div style={{ width: 1, height: 18, background: "#334155", flexShrink: 0 }} />
);

/* ─── Component chính: FloatingToolbar ─── */
interface Props {
  /** ref của div bao quanh ảnh áo (id="print_body-image") */
  shirtContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Hệ số zoom hiện tại */
  zoom: number;
}

interface ToolbarPos { x: number; y: number; }

/* Bề rộng này chỉ dùng để ước lượng vị trí căn giữa (x) - kích thước hiển thị
   thực tế do flex tự co giãn theo nội dung (xem width: "max-content" bên dưới),
   nên không còn bị cắt/tràn icon nếu sau này thêm/bớt nút. */
const TOOLBAR_W_IMAGE = 291; // Nhân bản | Lật ngang · Lật dọc | Tách nền | Lớp (2) | Khóa | Xóa
const TOOLBAR_W_TEXT  = 254; // Nhân bản | Lật ngang · Lật dọc | Lớp (2) | Khóa | Xóa
const TOOLBAR_W_DEFAULT = 185; // Nhân bản | Lớp (2) | Khóa | Xóa
const TOOLBAR_H = 36;
const MARGIN = 10;

/* ─── Icon đưa lên trên cùng / xuống dưới cùng ─── */
const BringFrontIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
    <rect x="13" y="2" width="8" height="8" rx="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const SendBackIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
    <rect x="3" y="14" width="8" height="8" rx="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/* ─── Icon lật ngang / lật dọc (chỉ dùng cho ảnh) ─── */
const FlipHIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M7 7l-4 4 4 4M17 7l4 4-4 4" />
  </svg>
);
const FlipVIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M7 7l4-4 4 4M7 17l4 4 4-4" />
  </svg>
);
/* Icon tách nền (đũa thần) */
const MagicIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM4 20 14 10M18 14l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1Z" />
  </svg>
);

export default function FloatingToolbar({ shirtContainerRef, zoom }: Props) {
  const { selectedId, elements, duplicateElement, removeElement, toggleLock, updateElement, pushHistory, moveElementToTop, moveElementToBottom } =
    useDesignStore();

  const el = elements.find((e) => e.id === selectedId) ?? null;
  const [pos, setPos] = useState<ToolbarPos | null>(null);

  /* Trạng thái tách nền ảnh (chạy local trong trình duyệt) */
  const [bgProcessing, setBgProcessing] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);

  /* Bề rộng thực tế của toolbar theo loại object đang chọn */
  const toolbarW = el?.type === "image" ? TOOLBAR_W_IMAGE : el?.type === "text" ? TOOLBAR_W_TEXT : TOOLBAR_W_DEFAULT;

  const handleRemoveBg = async () => {
    if (!el || el.type !== "image" || !el.src || bgProcessing) return;
    setBgProcessing(true);
    setBgProgress(0);
    try {
      const dataUrl = await removeImageBackground(el.src, (p) => setBgProgress(p.fraction));
      pushHistory();
      updateElement(el.id, { src: dataUrl });
    } catch (e) {
      console.error("[Tách nền] thất bại:", e);
      alert("Tách nền thất bại. Ảnh có thể bị chặn CORS hoặc lỗi tải model. Hãy thử ảnh khác hoặc kiểm tra kết nối mạng (lần đầu cần tải model).");
    } finally {
      setBgProcessing(false);
    }
  };

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
      let x = itemDisplayX + itemDisplayW / 2 - toolbarW / 2;
      let y = itemDisplayY - TOOLBAR_H - MARGIN;

      // Giữ trong viewport
      x = Math.max(8, Math.min(x, window.innerWidth - toolbarW - 8));
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
    };
  }, [el, zoom, shirtContainerRef, toolbarW]);

  if (!el || !pos) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 8,
          padding: "4px 6px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          pointerEvents: "all",
          userSelect: "none",
          width: "max-content",
          height: TOOLBAR_H,
          boxSizing: "border-box",
          /* Hiệu ứng hiện mượt */
          animation: "ds-toolbar-pop 0.12s ease",
        }}
      >
        <ToolBtn title="Nhân bản (Ctrl+D)" onClick={() => duplicateElement(el.id)}>
          <DuplicateIcon />
        </ToolBtn>

        <Divider />

        {/* Flip — cho cả image lẫn text */}
        {(el.type === "image" || el.type === "text") && (
          <>
            <ToolBtn
              title="Lật ngang"
              active={el.flipH}
              onClick={() => { pushHistory(); updateElement(el.id, { flipH: !(el.flipH ?? false) }); }}
            >
              <FlipHIcon />
            </ToolBtn>
            <ToolBtn
              title="Lật dọc"
              active={el.flipV}
              onClick={() => { pushHistory(); updateElement(el.id, { flipV: !(el.flipV ?? false) }); }}
            >
              <FlipVIcon />
            </ToolBtn>
            <Divider />
          </>
        )}

        {/* Tách nền — chỉ cho image */}
        {el.type === "image" && (
          <>
            <ToolBtn title="Tách nền ảnh (AI, chạy trên máy)" onClick={handleRemoveBg}>
              <MagicIcon />
            </ToolBtn>
            <Divider />
          </>
        )}

        {/* Lớp: đưa lên trên cùng / xuống dưới cùng */}
        <ToolBtn title="Đưa lên trước" onClick={() => moveElementToTop(el.id)}>
          <BringFrontIcon />
        </ToolBtn>
        <ToolBtn title="Đưa ra sau" onClick={() => moveElementToBottom(el.id)}>
          <SendBackIcon />
        </ToolBtn>

        <Divider />

        <ToolBtn
          title={el.locked ? "Mở khóa" : "Khóa vật thể"}
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

      {/* Lớp phủ khi đang tách nền ảnh (chạy local, lần đầu tải model) */}
      {bgProcessing && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 10050,
            background: "rgba(2,6,23,0.72)", backdropFilter: "blur(3px)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 14,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid #334155", borderTopColor: "#38bdf8",
            animation: "ds-spin 0.8s linear infinite",
          }} />
          <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700 }}>Đang tách nền ảnh…</div>

          <div style={{ width: 220, height: 6, borderRadius: 4, background: "#1e293b", overflow: "hidden" }}>
            <div style={{
              width: `${Math.round(bgProgress * 100)}%`, height: "100%",
              background: "linear-gradient(90deg,#0ea5e9,#6366f1)", transition: "width 0.2s",
            }} />
          </div>
          <style>{`@keyframes ds-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </>
  );
}

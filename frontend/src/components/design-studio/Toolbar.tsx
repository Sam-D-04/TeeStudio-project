"use client";

import React from "react";
import { useDesignStore } from "@/store/useDesignStore";

/* ─── SVG Icons ─── */
const ArrowLeftIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);
const UndoIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
  </svg>
);
const RedoIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
  </svg>
);
const SaveIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

interface ToolbarProps {
  onSave: () => void;
  onDownloadImage: () => void;
  onShowToast: (msg: string) => void;
  isSaving?: boolean;
}

export default function Toolbar({ onSave, onDownloadImage, onShowToast, isSaving }: ToolbarProps) {
  const { undo, redo, undoStack, redoStack, clearDesign, shirtType } = useDesignStore();

  const shirtLabel =
    shirtType === "tshirt"
      ? "Áo Thun"
      : shirtType === "polo"
        ? "Áo Polo"
        : "Hoodie";

  return (
    <header className="ds-toolbar">
      {/* LEFT: Back + Logo */}
      <div className="ds-toolbar-left">
        <a href="/" className="ds-toolbar-logo" title="Về trang chủ">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="url(#tbg)" />
            <text
              x="50%"
              y="54%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#fff"
              fontSize="18"
              fontWeight="800"
              fontFamily="Inter, sans-serif"
            >
              T
            </text>
            <defs>
              <linearGradient id="tbg" x1="0" y1="0" x2="36" y2="36">
                <stop stopColor="#0ea5e9" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          TeeStudio
        </a>
        <div className="ds-toolbar-divider" />
        <span style={{ fontSize: 13, color: "#94a3b8" }}>
          Thiết kế {shirtLabel}
        </span>
      </div>

      {/* CENTER: Undo / Redo */}
      <div className="ds-toolbar-center">
        <button
          className="ds-toolbar-btn ds-toolbar-btn--icon"
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Hoàn tác (Ctrl+Z)"
        >
          <UndoIcon />
        </button>
        <button
          className="ds-toolbar-btn ds-toolbar-btn--icon"
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Làm lại (Ctrl+Y)"
        >
          <RedoIcon />
        </button>
        <div className="ds-toolbar-divider" />
        <button
          className="ds-toolbar-btn"
          onClick={() => {
            if (confirm("Bạn có chắc muốn xóa toàn bộ thiết kế?")) {
              clearDesign();
              onShowToast("Đã xóa thiết kế");
            }
          }}
          title="Xóa tất cả"
        >
          <TrashIcon /> Xóa tất cả
        </button>
      </div>

      {/* RIGHT: Save + Download */}
      <div className="ds-toolbar-right">
        <button
          className="ds-toolbar-btn ds-toolbar-btn--outline"
          onClick={onDownloadImage}
          title="Tải xuống ảnh PNG"
        >
          <DownloadIcon /> Tải ảnh
        </button>
        <button
          className="ds-toolbar-btn ds-toolbar-btn--primary"
          onClick={onSave}
          title="Lưu thiết kế (Ctrl+S)"
          disabled={isSaving}
        >
          {isSaving ? (
            <svg className="ds-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          ) : (
            <SaveIcon />
          )}
          {isSaving ? "Đang lưu..." : "Lưu thiết kế"}
        </button>
      </div>
    </header>
  );
}

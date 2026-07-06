"use client";

import React from "react";
import { useDesignStore } from "@/store/useDesignStore";

/* ─── SVG Icons ─── */
const CopyIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);
const UpIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);
const DownIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);
const UnlockIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 0 1 4.5-4.5 4.5 4.5 0 0 1 4.5 4.5v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const RotateIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const ImageIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
  </svg>
);
const TypeIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20h10M10 4v16m0-16h4a4 4 0 010 8h-4" />
  </svg>
);

export default function PropertiesPanel() {
  const {
    selectedId,
    elements,
    updateElement,
    removeElement,
    duplicateElement,
    moveElementUp,
    moveElementDown,
    toggleLock,
    pushHistory,
  } = useDesignStore();

  const el = elements.find((e) => e.id === selectedId);

  if (!el) {
    return (
      <aside className="ds-properties">
        <div className="ds-no-selection">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
          </svg>
          <p>Chọn một phần tử<br />để chỉnh sửa</p>
        </div>
      </aside>
    );
  }

  const handlePropChange = (key: string, value: number | string) => {
    updateElement(el.id, { [key]: value });
  };

  const isImage = el.type === "image";

  return (
    <aside className="ds-properties">

      {/* ── Type badge ── */}
      <div className="ds-prop-type-badge-row">
        <span className={`ds-prop-type-badge ${isImage ? "ds-prop-type-badge--image" : "ds-prop-type-badge--text"}`}>
          {isImage ? <ImageIcon /> : <TypeIcon />}
          {isImage ? "Hình ảnh" : "Văn bản"}
        </span>
        {el.locked && (
          <span className="ds-prop-locked-tag">
            <LockIcon /> Đã khoá
          </span>
        )}
      </div>

      <div className="ds-prop-divider" />

      {/* ── Position & Size compact grid ── */}
      <div className="ds-prop-grid">
        <div className="ds-prop-field">
          <label className="ds-prop-field-label">X</label>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.x)}
            onChange={(e) => handlePropChange("x", parseInt(e.target.value) || 0)}
            onBlur={() => pushHistory()}
            disabled={el.locked}
          />
        </div>
        <div className="ds-prop-field">
          <label className="ds-prop-field-label">Y</label>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.y)}
            onChange={(e) => handlePropChange("y", parseInt(e.target.value) || 0)}
            onBlur={() => pushHistory()}
            disabled={el.locked}
          />
        </div>
        <div className="ds-prop-field">
          <label className="ds-prop-field-label">W</label>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.width)}
            onChange={(e) => handlePropChange("width", parseInt(e.target.value) || 1)}
            onBlur={() => pushHistory()}
            disabled={el.locked}
          />
        </div>
        <div className="ds-prop-field">
          <label className="ds-prop-field-label">H</label>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.height)}
            onChange={(e) => handlePropChange("height", parseInt(e.target.value) || 1)}
            onBlur={() => pushHistory()}
            disabled={el.locked}
          />
        </div>
        <div className="ds-prop-field ds-prop-field--wide">
          <label className="ds-prop-field-label"><RotateIcon /> Xoay</label>
          <div className="ds-prop-field-with-suffix">
            <input
              className="ds-prop-input"
              type="number"
              value={Math.round(el.rotation)}
              onChange={(e) => handlePropChange("rotation", parseInt(e.target.value) || 0)}
              onBlur={() => pushHistory()}
              disabled={el.locked}
            />
            <span className="ds-prop-input-suffix">°</span>
          </div>
        </div>
      </div>

      <div className="ds-prop-divider" />

      {/* ── Quick actions row ── */}
      <div className="ds-prop-actions-row">
        <button
          className="ds-prop-icon-btn"
          onClick={() => duplicateElement(el.id)}
          title="Nhân đôi"
        >
          <CopyIcon />
          <span>Nhân đôi</span>
        </button>
        <button
          className={`ds-prop-icon-btn ${el.locked ? "ds-prop-icon-btn--active" : ""}`}
          onClick={() => toggleLock(el.id)}
          title={el.locked ? "Mở khoá" : "Khoá"}
        >
          {el.locked ? <LockIcon /> : <UnlockIcon />}
          <span>{el.locked ? "Mở khoá" : "Khoá"}</span>
        </button>
        <button
          className="ds-prop-icon-btn"
          onClick={() => moveElementUp(el.id)}
          title="Lên trên"
        >
          <UpIcon />
          <span>Lên trên</span>
        </button>
        <button
          className="ds-prop-icon-btn"
          onClick={() => moveElementDown(el.id)}
          title="Xuống dưới"
        >
          <DownIcon />
          <span>Xuống</span>
        </button>
      </div>

      <div className="ds-prop-divider" />

      {/* ── Delete ── */}
      <button
        className="ds-prop-delete-btn"
        onClick={() => removeElement(el.id)}
      >
        <TrashIcon /> Xoá phần tử
      </button>

    </aside>
  );
}

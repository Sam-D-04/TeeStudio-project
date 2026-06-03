"use client";

import React from "react";
import { useDesignStore } from "@/store/useDesignStore";

/* Icons */
const CopyIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
);
const UpIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);
const DownIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
    pushHistory,
  } = useDesignStore();

  const el = elements.find((e) => e.id === selectedId);

  if (!el) {
    return (
      <aside className="ds-properties">
        <div className="ds-no-selection">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
          </svg>
          <p>Chọn một phần tử<br />trên canvas để chỉnh sửa</p>
        </div>
      </aside>
    );
  }

  const handlePropChange = (key: string, value: number | string) => {
    updateElement(el.id, { [key]: value });
  };

  return (
    <aside className="ds-properties">
      {/* Element type badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            background: el.type === "image" ? "rgba(14,165,233,0.15)" : "rgba(99,102,241,0.15)",
            color: el.type === "image" ? "#0ea5e9" : "#6366f1",
            padding: "3px 8px",
            borderRadius: 4,
          }}
        >
          {el.type === "image" ? "Hình ảnh" : "Văn bản"}
        </span>
      </div>

      {/* Position */}
      <div className="ds-prop-group">
        <div className="ds-prop-label">Vị trí</div>
        <div className="ds-prop-row">
          <span className="ds-prop-input-label">X</span>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.x)}
            onChange={(e) => handlePropChange("x", parseInt(e.target.value) || 0)}
            onBlur={() => pushHistory()}
          />
          <span className="ds-prop-input-label">Y</span>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.y)}
            onChange={(e) => handlePropChange("y", parseInt(e.target.value) || 0)}
            onBlur={() => pushHistory()}
          />
        </div>
      </div>

      {/* Size */}
      <div className="ds-prop-group">
        <div className="ds-prop-label">Kích thước</div>
        <div className="ds-prop-row">
          <span className="ds-prop-input-label">W</span>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.width)}
            onChange={(e) => handlePropChange("width", parseInt(e.target.value) || 1)}
            onBlur={() => pushHistory()}
          />
          <span className="ds-prop-input-label">H</span>
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.height)}
            onChange={(e) => handlePropChange("height", parseInt(e.target.value) || 1)}
            onBlur={() => pushHistory()}
          />
        </div>
      </div>

      {/* Rotation */}
      <div className="ds-prop-group">
        <div className="ds-prop-label">Xoay</div>
        <div className="ds-prop-row">
          <input
            className="ds-prop-input"
            type="number"
            value={Math.round(el.rotation)}
            onChange={(e) => handlePropChange("rotation", parseInt(e.target.value) || 0)}
            onBlur={() => pushHistory()}
          />
          <span className="ds-prop-input-label">°</span>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #334155", margin: "4px 0" }} />

      {/* Layer actions */}
      <div className="ds-prop-group">
        <div className="ds-prop-label">Thao tác</div>
        <button className="ds-prop-action-btn" onClick={() => duplicateElement(el.id)}>
          <CopyIcon /> Nhân đôi
        </button>
        <div className="ds-prop-row">
          <button
            className="ds-prop-action-btn"
            style={{ flex: 1 }}
            onClick={() => moveElementUp(el.id)}
          >
            <UpIcon /> Lên trên
          </button>
          <button
            className="ds-prop-action-btn"
            style={{ flex: 1 }}
            onClick={() => moveElementDown(el.id)}
          >
            <DownIcon /> Xuống dưới
          </button>
        </div>
        <button
          className="ds-prop-action-btn ds-prop-action-btn--danger"
          onClick={() => removeElement(el.id)}
        >
          <TrashIcon /> Xóa phần tử
        </button>
      </div>
    </aside>
  );
}

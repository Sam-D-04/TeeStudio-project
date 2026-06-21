"use client";

import React from "react";
import { useDesignStore, DesignElement } from "@/store/useDesignStore";

/* ─── Mini Icons ─── */
const ImageIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
  </svg>
);
const TypeIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20h10M10 4v16m0-16h4a4 4 0 010 8h-4" />
  </svg>
);
const LockIcon = () => (
  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const LayersIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
  </svg>
);

/** Returns a display label for an element */
function getLabel(el: DesignElement): string {
  if (el.type === "text") {
    const t = el.text || "";
    return t.length > 16 ? t.slice(0, 16) + "…" : t || "Văn bản";
  }
  return "Hình ảnh";
}

/** Returns a mini preview node */
function Preview({ el }: { el: DesignElement }) {
  if (el.type === "image" && el.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={el.src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
    );
  }
  if (el.type === "text") {
    return (
      <span
        style={{
          fontSize: 10,
          fontFamily: el.fontFamily || "Arial",
          color: el.fill || "#f1f5f9",
          overflow: "hidden",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          textOverflow: "ellipsis",
          fontStyle: el.fontStyle?.includes("italic") ? "italic" : "normal",
          fontWeight: el.fontStyle?.includes("bold") ? "bold" : "normal",
        }}
      >
        {el.text || "Aa"}
      </span>
    );
  }
  return null;
}

export default function LayersPanel() {
  const { elements, selectedId, setSelectedId, removeElement } = useDesignStore();

  // Reversed: top layer first
  const layers = [...elements].reverse();

  return (
    <div className="ds-layers-panel">
      {/* Header */}
      <div className="ds-layers-header">
        <LayersIcon />
        <span>Lớp</span>
        <span className="ds-layers-count">{elements.length}</span>
      </div>

      {/* Layer list */}
      <div className="ds-layers-list">
        {layers.length === 0 ? (
          <div className="ds-layers-empty">Chưa có lớp nào</div>
        ) : (
          layers.map((el) => {
            const isSelected = el.id === selectedId;
            return (
              <div
                key={el.id}
                className={`ds-layer-item ${isSelected ? "ds-layer-item--selected" : ""}`}
                onClick={() => setSelectedId(el.id)}
              >
                {/* Thumbnail */}
                <div className="ds-layer-thumb">
                  <Preview el={el} />
                </div>

                {/* Info */}
                <div className="ds-layer-info">
                  <span className="ds-layer-type-icon">
                    {el.type === "image" ? <ImageIcon /> : <TypeIcon />}
                  </span>
                  <span className="ds-layer-name">{getLabel(el)}</span>
                  {el.locked && (
                    <span className="ds-layer-lock"><LockIcon /></span>
                  )}
                </div>

                {/* Delete button */}
                <button
                  className="ds-layer-delete"
                  title="Xoá lớp"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(el.id);
                  }}
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

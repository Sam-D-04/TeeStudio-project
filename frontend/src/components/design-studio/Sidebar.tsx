"use client";

import React, { useCallback, useRef } from "react";
import {
  ShirtType,
  ShirtView,
  useDesignStore,
} from "@/store/useDesignStore";

/* ─── SVG Icons (inline for zero-dep) ─── */
const UploadIcon = () => (
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);
const TypeIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20h10M10 4v16m0-16h4a4 4 0 010 8h-4" />
  </svg>
);
const ShirtIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
  </svg>
);
const ImageIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
  </svg>
);

const SHIRT_COLORS = [
  "#ffffff", "#000000", "#1e293b", "#374151",
  "#dc2626", "#ea580c", "#f59e0b", "#84cc16",
  "#10b981", "#0ea5e9", "#6366f1", "#ec4899",
  "#f5f5dc", "#d4a574", "#4a90d9", "#7c3aed",
];

const FONTS = [
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Impact",
  "Comic Sans MS",
];

type TabId = "images" | "text" | "shirt";

interface SidebarProps {
  uploadedImages: string[];
  onUploadImages: (files: FileList) => void;
  onRemoveUploadedImage: (idx: number) => void;
  onAddImageToCanvas: (src: string) => void;
}

export default function Sidebar({
  uploadedImages,
  onUploadImages,
  onRemoveUploadedImage,
  onAddImageToCanvas,
}: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>("images");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    shirtType, setShirtType,
    shirtColor, setShirtColor,
    shirtView, setShirtView,
    selectedId, elements,
    addElement, updateElement,
  } = useDesignStore();

  const selectedEl = elements.find((e) => e.id === selectedId);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        onUploadImages(e.dataTransfer.files);
      }
    },
    [onUploadImages]
  );

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "images", label: "Hình ảnh", icon: <ImageIcon /> },
    { id: "text", label: "Văn bản", icon: <TypeIcon /> },
    { id: "shirt", label: "Phôi áo", icon: <ShirtIcon /> },
  ];

  return (
    <aside className="ds-sidebar">
      {/* Tab bar */}
      <div className="ds-sidebar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`ds-sidebar-tab ${activeTab === tab.id ? "ds-sidebar-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="ds-sidebar-content">
        {/* ── Images Tab ── */}
        {activeTab === "images" && (
          <>
            <div className="ds-section-title">Tải lên hình ảnh</div>
            <div
              className="ds-upload-area"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <UploadIcon />
              <p>
                <span>Nhấn để tải lên</span> hoặc kéo thả
              </p>
              <p style={{ fontSize: 11, marginTop: 4, color: "#64748b" }}>
                PNG, JPG, SVG (tối đa 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files) onUploadImages(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {uploadedImages.length > 0 && (
              <>
                <div className="ds-section-title" style={{ marginTop: 8 }}>
                  Thư viện ({uploadedImages.length})
                </div>
                <div className="ds-image-gallery">
                  {uploadedImages.map((src, i) => (
                    <div
                      key={i}
                      className="ds-image-thumb"
                      onClick={() => onAddImageToCanvas(src)}
                      title="Nhấn để thêm vào thiết kế"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`upload-${i}`} />
                      <button
                        className="ds-image-thumb-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveUploadedImage(i);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Text Tab ── */}
        {activeTab === "text" && (
          <>
            <div className="ds-section-title">Thêm văn bản</div>
            <button
              className="ds-add-text-btn"
              onClick={() =>
                addElement({
                  type: "text",
                  x: 80,
                  y: 120,
                  width: 200,
                  height: 40,
                  rotation: 0,
                  text: "Văn bản mới",
                  fontSize: 28,
                  fontFamily: "Arial",
                  fill: "#000000",
                  fontStyle: "normal",
                })
              }
            >
              <TypeIcon /> Thêm văn bản
            </button>

            {selectedEl && selectedEl.type === "text" && (
              <div className="ds-text-editor">
                <div className="ds-section-title" style={{ marginTop: 8 }}>
                  Chỉnh sửa văn bản
                </div>
                <div>
                  <label>Nội dung</label>
                  <textarea
                    rows={2}
                    value={selectedEl.text || ""}
                    onChange={(e) =>
                      updateElement(selectedEl.id, { text: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Font chữ</label>
                  <select
                    value={selectedEl.fontFamily || "Arial"}
                    onChange={(e) =>
                      updateElement(selectedEl.id, {
                        fontFamily: e.target.value,
                      })
                    }
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Cỡ chữ & Kiểu</label>
                  <div className="ds-font-size-row">
                    <input
                      type="number"
                      min={8}
                      max={200}
                      value={selectedEl.fontSize || 28}
                      onChange={(e) =>
                        updateElement(selectedEl.id, {
                          fontSize: parseInt(e.target.value) || 28,
                        })
                      }
                    />
                    <div className="ds-font-style-btns">
                      <button
                        className={`ds-font-style-btn ${
                          selectedEl.fontStyle?.includes("bold")
                            ? "ds-font-style-btn--active"
                            : ""
                        }`}
                        onClick={() => {
                          const cur = selectedEl.fontStyle || "normal";
                          const isBold = cur.includes("bold");
                          const isItalic = cur.includes("italic");
                          let next: typeof selectedEl.fontStyle = "normal";
                          if (!isBold && isItalic) next = "bold italic";
                          else if (!isBold) next = "bold";
                          else if (isItalic) next = "italic";
                          updateElement(selectedEl.id, { fontStyle: next });
                        }}
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        className={`ds-font-style-btn ${
                          selectedEl.fontStyle?.includes("italic")
                            ? "ds-font-style-btn--active"
                            : ""
                        }`}
                        onClick={() => {
                          const cur = selectedEl.fontStyle || "normal";
                          const isBold = cur.includes("bold");
                          const isItalic = cur.includes("italic");
                          let next: typeof selectedEl.fontStyle = "normal";
                          if (isBold && !isItalic) next = "bold italic";
                          else if (!isItalic) next = "italic";
                          else if (isBold) next = "bold";
                          updateElement(selectedEl.id, { fontStyle: next });
                        }}
                      >
                        <em>I</em>
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label>Màu chữ</label>
                  <div className="ds-color-input-row">
                    <input
                      type="color"
                      value={selectedEl.fill || "#000000"}
                      onChange={(e) =>
                        updateElement(selectedEl.id, { fill: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      value={selectedEl.fill || "#000000"}
                      onChange={(e) =>
                        updateElement(selectedEl.id, { fill: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Shirt Tab ── */}
        {activeTab === "shirt" && (
          <>
            <div className="ds-section-title">Loại áo</div>
            <div className="ds-shirt-grid">
              {(["tshirt", "polo", "hoodie"] as ShirtType[]).map((type) => (
                <button
                  key={type}
                  className={`ds-shirt-option ${shirtType === type ? "ds-shirt-option--active" : ""}`}
                  onClick={() => setShirtType(type)}
                >
                  <ShirtMiniIcon type={type} />
                  {type === "tshirt" ? "Áo Thun" : type === "polo" ? "Áo Polo" : "Hoodie"}
                </button>
              ))}
            </div>

            <div className="ds-section-title">Mặt hiển thị</div>
            <div className="ds-view-toggle">
              <button
                className={shirtView === "front" ? "active" : ""}
                onClick={() => setShirtView("front")}
              >
                Mặt trước
              </button>
              <button
                className={shirtView === "back" ? "active" : ""}
                onClick={() => setShirtView("back")}
              >
                Mặt sau
              </button>
            </div>

            <div className="ds-section-title">Màu áo</div>
            <div className="ds-color-swatches">
              {SHIRT_COLORS.map((color) => (
                <button
                  key={color}
                  className={`ds-color-swatch ${shirtColor === color ? "ds-color-swatch--active" : ""}`}
                  style={{ background: color }}
                  onClick={() => setShirtColor(color)}
                  title={color}
                />
              ))}
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Màu tùy chọn
              </label>
              <div className="ds-color-input-row">
                <input
                  type="color"
                  value={shirtColor}
                  onChange={(e) => setShirtColor(e.target.value)}
                />
                <input
                  type="text"
                  value={shirtColor}
                  className="ds-prop-input"
                  onChange={(e) => setShirtColor(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/* Mini SVG icons for shirt type buttons */
function ShirtMiniIcon({ type }: { type: ShirtType }) {
  if (type === "tshirt")
    return (
      <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 12L12 20V24L18 22V52H46V22L52 24V20L44 12H40C40 16.4183 36.4183 20 32 20C27.5817 20 24 16.4183 24 12H20Z"
          stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
      </svg>
    );
  if (type === "polo")
    return (
      <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 12L12 20V24L18 22V52H46V22L52 24V20L44 12H40C40 16.4183 36.4183 20 32 20C27.5817 20 24 16.4183 24 12H20Z"
          stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M29 12V22M35 12V22" stroke="currentColor" strokeWidth="1.5" />
        <rect x="30" y="11" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
    );
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 14L10 22V26L16 24V52H48V24L54 26V22L48 14H42C42 18.4183 37.5228 22 32 22C26.4772 22 22 18.4183 22 14H16Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <path d="M22 14C22 14 24 10 32 10C40 10 42 14 42 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M26 52V42H38V52" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

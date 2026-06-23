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

const TSHIRT_COLORS = ["#ffffff", "#000000", "#1d4ed8"];
const POLO_COLORS   = ["#ffffff", "#f5f5dc", "#1d4ed8"];

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

const StickerIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.866 8.21 8.21 0 0 0 3 2.48Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
  </svg>
);

type TabId = "images" | "stickers" | "text" | "shirt" | "my-designs";

import FontSelectorPanel from "./FontSelectorPanel";
import MyDesignsTab from "./MyDesignsTab";

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
  const [stickers, setStickers] = React.useState<any[]>([]);
  const [hasFetchedStickers, setHasFetchedStickers] = React.useState<boolean>(false);
  const [activeCategorySticker, setActiveCategorySticker] = React.useState<string>("Tất cả");
  const [searchStickerQuery, setSearchStickerQuery] = React.useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (activeTab === "stickers" && !hasFetchedStickers) {
      fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/stickers")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setStickers(data.data);
          }
          setHasFetchedStickers(true);
        })
        .catch((err) => {
          console.error("Failed to fetch stickers:", err);
          setHasFetchedStickers(true);
        });
    }
  }, [activeTab, hasFetchedStickers]);

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
    { id: "stickers", label: "Họa tiết", icon: <StickerIcon /> },
    { id: "text", label: "Văn bản", icon: <TypeIcon /> },
    { id: "shirt", label: "Phôi áo", icon: <ShirtIcon /> },
    { 
      id: "my-designs", 
      label: "Của tôi", 
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
      )
    },
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

        {/* ── Stickers Tab ── */}
        {activeTab === "stickers" && (
          <div className="ds-stickers-container">

            {/* Search bar with icon */}
            <div className="ds-sticker-search-wrap">
              <svg className="ds-sticker-search-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
              </svg>
              <input
                type="text"
                className="ds-sticker-search"
                placeholder="Tìm họa tiết..."
                value={searchStickerQuery}
                onChange={(e) => {
                  setSearchStickerQuery(e.target.value);
                  setActiveCategorySticker("Tất cả");
                }}
              />
              {searchStickerQuery && (
                <button className="ds-sticker-search-clear" onClick={() => setSearchStickerQuery("")}>✕</button>
              )}
            </div>

            {/* Category pills — wrap, not scroll */}
            {!searchStickerQuery && (
              <div className="ds-sticker-categories">
                {["Tất cả", ...Array.from(new Set(stickers.map(s => s.loai || "Khác").filter(Boolean)))].map((cat) => (
                  <button
                    key={cat}
                    className={`ds-sticker-category-btn ${activeCategorySticker === cat ? "ds-sticker-category-btn--active" : ""}`}
                    onClick={() => setActiveCategorySticker(cat as string)}
                  >
                    {cat as string}
                  </button>
                ))}
              </div>
            )}

            {/* Loading skeleton */}
            {!hasFetchedStickers && (
              <div className="ds-sticker-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="ds-sticker-skeleton" />
                ))}
              </div>
            )}

            {/* Sticker grid */}
            {hasFetchedStickers && (() => {
              const filtered = stickers
                .filter(s => activeCategorySticker === "Tất cả" || (s.loai || "Khác") === activeCategorySticker)
                .filter(s => searchStickerQuery === "" || s.ten.toLowerCase().includes(searchStickerQuery.toLowerCase()));
              return filtered.length > 0 ? (
                <div className="ds-sticker-grid">
                  {filtered.map((sticker, i) => (
                    <div
                      key={sticker.id || i}
                      className="ds-sticker-item"
                      onClick={() => onAddImageToCanvas(sticker.urlAnh)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sticker.urlAnh} alt={sticker.ten} loading="lazy" />
                      <div className="ds-sticker-item-overlay">
                        <span>+</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ds-sticker-empty">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
                  </svg>
                  <p>{searchStickerQuery ? `Không tìm thấy "${searchStickerQuery}"` : "Chưa có họa tiết nào"}</p>
                </div>
              );
            })()}

          </div>
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
                  // Đặt text vào giữa vùng in mặc định của TShirt (30% từ trái, 28% từ trên)
                  x: 500 * 0.30 + 500 * 0.40 * 0.2,
                  y: 600 * 0.28 + 600 * 0.42 * 0.1,
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

            {/* Font selector always shown in text tab */}
            <div className="ds-text-editor-container" style={{ flex: 1, overflow: 'hidden', marginTop: 12 }}>
              <FontSelectorPanel />
            </div>
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
            <div className="ds-color-swatches" style={{ marginBottom: 16 }}>
              {(shirtType === "polo" ? POLO_COLORS : TSHIRT_COLORS).map((color) => (
                <button
                  key={color}
                  className={`ds-color-swatch ${shirtColor === color ? "ds-color-swatch--active" : ""}`}
                  style={{ background: color }}
                  onClick={() => setShirtColor(color)}
                  title={color}
                >
                  {shirtColor === color && (
                    <span style={{ color: color === "#ffffff" ? "#000" : "#fff" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
        {/* ── My Designs Tab ── */}
        {activeTab === "my-designs" && (
          <MyDesignsTab />
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

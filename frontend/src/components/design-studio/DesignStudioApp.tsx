"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type Konva from "konva";

import { useDesignStore } from "@/store/useDesignStore";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import CanvasEditor from "./CanvasEditor";
import PropertiesPanel from "./PropertiesPanel";
import ShirtMockupSVG, { getPrintArea } from "./ShirtMockupSVG";

import "../../app/design-studio/design-studio.css";

/* ─── Canvas / Mockup dimensions ─── */
const MOCKUP_W = 400;
const MOCKUP_H = 500;

export default function DesignStudioApp() {
  const stageRef = useRef<Konva.Stage | null>(null);

  const {
    shirtType, shirtColor, shirtView,
    addElement, removeElement, selectedId,
    undo, redo,
    saveToLocal, loadFromLocal,
    setSelectedId, setShirtType,
  } = useDesignStore();

  const searchParams = useSearchParams();

  /* ── Uploaded images (browser object URLs) ── */
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  /* ── Toast ── */
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── Zoom ── */
  const [zoom, setZoom] = useState(1);

  /* Kích thước hiển thị thực tế trên màn hình = kích thước logic * zoom */
  const displayW = Math.round(MOCKUP_W * zoom);
  const displayH = Math.round(MOCKUP_H * zoom);

  /* ── Load saved design on mount & áp shirt type từ URL query param ── */
  useEffect(() => {
    loadFromLocal();
    // Đọc ?shirt=tshirt|polo|hoodie từ URL và override shirtType
    const shirtParam = searchParams.get("shirt");
    if (shirtParam === "tshirt" || shirtParam === "polo" || shirtParam === "hoodie") {
      setShirtType(shirtParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;
      if (isInput) return;

      // Ctrl+Z / Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
      // Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveToLocal();
        showToast("Đã lưu thiết kế!");
      }
      // Delete / Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        const { selectedId } = useDesignStore.getState();
        if (selectedId) {
          removeElement(selectedId);
        }
      }
      // Escape
      if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, saveToLocal, removeElement, showToast, setSelectedId]);

  /* ── Upload handler ── */
  const handleUploadImages = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast("File quá lớn (>5MB)");
        return;
      }
      const url = URL.createObjectURL(file);
      setUploadedImages((prev) => [...prev, url]);
    });
  }, [showToast]);

  const handleRemoveUploadedImage = useCallback((idx: number) => {
    setUploadedImages((prev) => {
      const newArr = [...prev];
      URL.revokeObjectURL(newArr[idx]);
      newArr.splice(idx, 1);
      return newArr;
    });
  }, []);

  /* ── Add uploaded image to canvas ── */
  const handleAddImageToCanvas = useCallback(
    (src: string) => {
      const printArea = getPrintArea(shirtType, shirtView);
      // Load image to get natural dimensions
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight;
        let w = printArea.w * 0.7;
        let h = w / aspect;
        if (h > printArea.h * 0.7) {
          h = printArea.h * 0.7;
          w = h * aspect;
        }
        addElement({
          type: "image",
          src,
          x: printArea.x + (printArea.w - w) / 2,
          y: printArea.y + (printArea.h - h) / 2,
          width: w,
          height: h,
          rotation: 0,
        });
      };
    },
    [addElement, shirtType, shirtView]
  );

  /* ── Save handler ── */
  const handleSave = useCallback(() => {
    saveToLocal();
    showToast("Đã lưu thiết kế thành công!");
  }, [saveToLocal, showToast]);

  /* ── Download PNG handler ── */
  const handleDownloadImage = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // Deselect, reset scale về 1:1 để export full-res, rồi khôi phục
    setSelectedId(null);
    setTimeout(() => {
      const prevScaleX = stage.scaleX();
      const prevScaleY = stage.scaleY();
      const prevW = stage.width();
      const prevH = stage.height();
      stage.scaleX(1);
      stage.scaleY(1);
      stage.width(MOCKUP_W);
      stage.height(MOCKUP_H);
      stage.batchDraw();
      const dataURL = stage.toDataURL({ pixelRatio: 3 });
      // Khôi phục scale
      stage.scaleX(prevScaleX);
      stage.scaleY(prevScaleY);
      stage.width(prevW);
      stage.height(prevH);
      stage.batchDraw();
      const link = document.createElement("a");
      link.download = `teestudio-design-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      showToast("Đã tải xuống ảnh!");
    }, 100);
  }, [setSelectedId, showToast]);

  /* ── Print area for current shirt ── */
  const printArea = getPrintArea(shirtType, shirtView);

  /* ── Zoom controls ── */
  const zoomIn = () => setZoom((z) => Math.min(parseFloat((z + 0.25).toFixed(2)), 3));
  const zoomOut = () => setZoom((z) => Math.max(parseFloat((z - 0.25).toFixed(2)), 0.25));
  const zoomReset = () => setZoom(1);

  return (
    <div className="ds-root">
      {/* Toolbar */}
      <Toolbar
        onSave={handleSave}
        onDownloadImage={handleDownloadImage}
        onShowToast={showToast}
      />

      {/* Body: Sidebar + Workspace + Properties */}
      <div className="ds-body">
        {/* Sidebar */}
        <Sidebar
          uploadedImages={uploadedImages}
          onUploadImages={handleUploadImages}
          onRemoveUploadedImage={handleRemoveUploadedImage}
          onAddImageToCanvas={handleAddImageToCanvas}
        />

        {/* Workspace / Canvas */}
        <div className="ds-workspace">
          {/*
            Container được resize theo zoom thực tế.
            KHÔNG dùng CSS transform scale để tránh mờ ảnh.
            Thay vào đó Konva Stage tự scale nội bộ → render sắc nét.
          */}
          <div
            className="ds-canvas-container"
            style={{
              width: displayW,
              height: displayH,
              transition: "width 0.15s ease, height 0.15s ease",
            }}
          >
            {/* Shirt SVG resize theo zoom */}
            <div className="ds-shirt-preview">
              <ShirtMockupSVG
                type={shirtType}
                view={shirtView}
                color={shirtColor}
                width={displayW}
                height={displayH}
              />
            </div>

            {/* Konva Stage nhận zoom để scale nội bộ */}
            <CanvasEditor
              stageRef={stageRef}
              stageWidth={MOCKUP_W}
              stageHeight={MOCKUP_H}
              displayWidth={displayW}
              displayHeight={displayH}
              zoom={zoom}
              printArea={printArea}
            />
          </div>

          {/* Zoom controls */}
          <div className="ds-zoom-controls">
            <button className="ds-zoom-btn" onClick={zoomOut} title="Thu nhỏ">
              −
            </button>
            <button className="ds-zoom-label" onClick={zoomReset} title="Đặt lại zoom">
              {Math.round(zoom * 100)}%
            </button>
            <button className="ds-zoom-btn" onClick={zoomIn} title="Phóng to">
              +
            </button>
          </div>

          {/* Keyboard shortcut hints */}
          <div className="ds-shortcut-hint">
            <span><kbd>Ctrl</kbd>+<kbd>Z</kbd> Hoàn tác</span>
            <span><kbd>Ctrl</kbd>+<kbd>S</kbd> Lưu</span>
            <span><kbd>Del</kbd> Xóa</span>
          </div>
        </div>

        {/* Properties Panel */}
        <PropertiesPanel />
      </div>

      {/* Toast */}
      <div className={`ds-toast ${toast ? "ds-toast--visible" : ""}`}>
        {toast}
      </div>
    </div>
  );
}

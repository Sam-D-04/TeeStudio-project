"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type Konva from "konva";

import { useDesignStore } from "@/store/useDesignStore";
import useAuthStore from "@/store/useAuthStore";
import { userDesignService, SavedDesign } from "@/services/userDesignService";
import { calcDesignFee } from "@/utils/designFeeCalculator";
import { Modal } from "antd";
import html2canvas from "html2canvas";

import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import PropertiesPanel from "./PropertiesPanel";
import LayersPanel from "./LayersPanel";
import CanvasEditor from "./CanvasEditor";
import ShirtMockupImage, {
  getPrintAreaBoundary,
  getPoloFrontPolygon,
  hasPrintAreaPolygon,
} from "./ShirtMockupImage";
import FloatingToolbar from "./FloatingToolbar";
import StaticTextToolbar from "./StaticTextToolbar";
import SaveDesignModal from "./SaveDesignModal";
import MyDesignsModal from "./MyDesignsModal";

import "../../app/design-studio/design-studio.css";

/* ─── Kích thước logic của container áo (px, trước khi zoom) ─── */
const CONTAINER_W = 500;
const CONTAINER_H = 600;

export default function DesignStudioApp() {
  const stageRef         = useRef<Konva.Stage | null>(null);
  /* ref trỏ đến div bao quanh ảnh áo — dùng để tính vị trí FloatingToolbar */
  const shirtContainerRef = useRef<HTMLDivElement>(null);

  const {
    shirtType, shirtColor, shirtView,
    addElement, removeElement, selectedId,
    undo, redo,
    saveToLocal, loadFromLocal,
    setSelectedId, setShirtType, setShirtColor, setShirtView,
    currentDesignId, setCurrentDesignId,
  } = useDesignStore();

  const { isAuthenticated, accessToken } = useAuthStore();

  const searchParams = useSearchParams();

  /* ── Uploaded images (object URLs) ── */
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  /* ── Toast ── */
  const [toast, setToast]   = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── Phụ phí thiết kế (real-time) ── */
  const [designFeeInfo, setDesignFeeInfo] = useState({ fee: 0, label: "Miễn phí", areaCm2: 0 });

  // Cập nhật phí mỗi khi danh sách phần tử thay đổi
  const elements = useDesignStore((s) => s.elements);
  useEffect(() => {
    setDesignFeeInfo(calcDesignFee(elements));
  }, [elements]);

  /* ── Zoom ── */
  const [zoom, setZoom] = useState(1.75);
  const displayW = Math.round(CONTAINER_W * zoom);
  const displayH = Math.round(CONTAINER_H * zoom);

  /* ── Init: load design + parse URL params ── */
  useEffect(() => {
    loadFromLocal();
    const shirt = searchParams.get("shirt");
    const color = searchParams.get("color");
    const view  = searchParams.get("view");

    if (shirt === "tshirt" || shirt === "polo" || shirt === "hoodie") setShirtType(shirt);
    if (color) {
      const map: Record<string, string> = {
        Black: "#000000", White: "#ffffff", Navy: "#1d4ed8",
      };
      setShirtColor(map[color] ?? color);
    }
    if (view === "front" || view === "back") setShirtView(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput =
        e.target instanceof HTMLInputElement   ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;
      if (inInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
      if (e.key === "Delete" || e.key === "Backspace") {
        const { selectedId } = useDesignStore.getState();
        if (selectedId) removeElement(selectedId);
      }
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, saveToLocal, removeElement, showToast, setSelectedId]);

  /* ── Upload ── */
  const handleUploadImages = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) { showToast("File quá lớn (>5MB)"); return; }
      setUploadedImages((prev) => [...prev, URL.createObjectURL(file)]);
    });
  }, [showToast]);

  const handleRemoveUploadedImage = useCallback((idx: number) => {
    setUploadedImages((prev) => {
      const arr = [...prev];
      URL.revokeObjectURL(arr[idx]);
      arr.splice(idx, 1);
      return arr;
    });
  }, []);

  /* ── Thêm ảnh vào canvas ── */
  const handleAddImageToCanvas = useCallback((src: string) => {
    const pa = getPrintAreaBoundary(shirtType, shirtView, CONTAINER_W, CONTAINER_H);
    const img = new Image();
    img.src     = src;
    img.onload  = () => {
      const aspect = img.naturalWidth / img.naturalHeight;
      let w = pa.width  * 0.6;
      let h = w / aspect;
      if (h > pa.height * 0.6) { h = pa.height * 0.6; w = h * aspect; }
      addElement({
        type: "image", src,
        x: pa.left + (pa.width  - w) / 2,
        y: pa.top  + (pa.height - h) / 2,
        width: w, height: h, rotation: 0,
      });
    };
  }, [addElement, shirtType, shirtView]);

  /* ── Save / Download ── */
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isMyDesignsOpen, setIsMyDesignsOpen] = useState(false);

  const handleSaveClick = useCallback(() => {
    if (!isAuthenticated || !accessToken) {
      alert("Vui lòng đăng nhập tài khoản để lưu thiết kế của bạn");
      return;
    }
    setIsSaveModalOpen(true);
  }, [isAuthenticated, accessToken]);

  const handleConfirmSave = useCallback(async (name: string) => {
    if (!accessToken) return;
    try {
      setIsSaving(true);
      
      // Update store name
      useDesignStore.getState().setDesignName(name);

      // Capture canvas as base64
      let previewUrl = "";
      if (stageRef.current) {
        setSelectedId(null);
        await new Promise((r) => setTimeout(r, 50));
        previewUrl = stageRef.current.toDataURL({ pixelRatio: 1 });
      }

      const payload = {
        name,
        shirtType,
        shirtColor,
        canvasData: {
          elements: useDesignStore.getState().elements,
          shirtView: useDesignStore.getState().shirtView,
        },
        previewUrl
      };

      if (currentDesignId) {
        await userDesignService.updateDesign(accessToken, currentDesignId, payload);
        showToast("Đã cập nhật thiết kế thành công");
      } else {
        const res = await userDesignService.createDesign(accessToken, payload);
        setCurrentDesignId(res.id);
        showToast("Đã lưu thiết kế mới thành công");
      }
      setIsSaveModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Lỗi khi lưu thiết kế");
    } finally {
      setIsSaving(false);
    }
  }, [accessToken, currentDesignId, shirtType, shirtColor, setSelectedId, setCurrentDesignId, showToast]);

  const handleLoadDesign = useCallback((design: SavedDesign) => {
    const doLoad = () => {
      const state = useDesignStore.getState();
      state.clearDesign(); // Clear everything (and push to history)
      
      const elements = design.canvasData?.elements || [];
      const view = design.canvasData?.shirtView || "front";
      
      // Set the values individually without causing infinite renders
      useDesignStore.setState({
        elements,
        shirtView: view,
        shirtType: design.productId === 1 ? "tshirt" : (design.productId === 2 ? "polo" : "hoodie"), // Fallback if no exact product ID map
        shirtColor: design.baseColor,
        currentDesignId: design.id,
        designName: design.name,
      });

      setIsMyDesignsOpen(false);
      showToast("Đã nạp thiết kế: " + design.name);
    };

    const currentElements = useDesignStore.getState().elements;
    if (currentElements.length > 0) {
      Modal.confirm({
        title: "Bạn có chắc chắn muốn mở thiết kế này?",
        content: "Thiết kế hiện tại trên màn hình sẽ bị ghi đè. Bạn có muốn tiếp tục không?",
        okText: "Tiếp tục",
        cancelText: "Hủy",
        onOk: doLoad,
      });
    } else {
      doLoad();
    }
  }, [showToast]);

  const handleDownloadImage = useCallback(async () => {
    if (!shirtContainerRef.current) return;

    // Bỏ chọn element để ẩn khung transform
    setSelectedId(null);
    showToast("Đang chuẩn bị ảnh tải xuống...");

    try {
      // Ẩn khung đứt nét của vùng in
      const boundaries = shirtContainerRef.current.querySelectorAll('.ds-print-boundary');
      boundaries.forEach((el: any) => el.style.display = 'none');

      // Đợi 1 chút để React render lại DOM
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(shirtContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      // Hiển thị lại khung đứt nét
      boundaries.forEach((el: any) => el.style.display = '');

      // Tải về máy
      const link = document.createElement("a");
      const name = useDesignStore.getState().designName || "thiet-ke";
      const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `teestudio-${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Đã tải ảnh xuống máy!");
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi tải ảnh. Vui lòng thử lại.");
    }
  }, [showToast, setSelectedId]);

  /* ── Print area (logical coordinates) ── */
  const pa = getPrintAreaBoundary(shirtType, shirtView, CONTAINER_W, CONTAINER_H);
  const printAreaForCanvas = { x: pa.left, y: pa.top, w: pa.width, h: pa.height };

  /* ── Polygon clip points (polo front only) ── */
  const usePolygon   = hasPrintAreaPolygon(shirtType, shirtView);
  const polygonPoints = usePolygon
    ? getPoloFrontPolygon(CONTAINER_W, CONTAINER_H)
    : undefined;

  /* ── Print area border color — black on light shirts, yellow on dark ── */
  const LIGHT_COLORS = ["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#fafafa", "#fff"];
  const isLightShirt = LIGHT_COLORS.includes(shirtColor.toLowerCase())
    || (() => {
      const hex = shirtColor.replace("#", "");
      if (hex.length !== 6) return false;
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const b = parseInt(hex.slice(4,6),16);
      return (r * 0.299 + g * 0.587 + b * 0.114) > 180;
    })();
  const borderColor   = isLightShirt ? "rgba(0,0,0,0.55)"     : "rgba(234, 179, 8, 0.75)";
  const labelColor    = isLightShirt ? "rgba(0,0,0,0.6)"       : "rgba(234,179,8,0.8)";

  /* ── Zoom controls ── */
  const zoomIn    = () => setZoom((z) => Math.min(+(z + 0.25).toFixed(2), 3));
  const zoomOut   = () => setZoom((z) => Math.max(+(z - 0.25).toFixed(2), 0.25));
  const zoomReset = () => setZoom(1.75);

  return (
    <div className="ds-root">
      <Toolbar 
        onSave={handleSaveClick} 
        onDownloadImage={handleDownloadImage} 
        onShowToast={showToast} 
        onOpenMyDesigns={() => setIsMyDesignsOpen(true)}
        isSaving={isSaving}
      />

      <div className="ds-body">
        <Sidebar
          uploadedImages={uploadedImages}
          onUploadImages={handleUploadImages}
          onRemoveUploadedImage={handleRemoveUploadedImage}
          onAddImageToCanvas={handleAddImageToCanvas}
        />

        {/* ─── Workspace ─── */}
        <div className="ds-workspace-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <StaticTextToolbar />
          
          <div className="ds-workspace" style={{ flex: 1, position: 'relative' }}>
            {/*
              ──────────────────────────────────────────────────
              DOM LAYERING (từ dưới lên):
                L1: <img> ảnh áo (pointer-events: none)
                L2: Konva Stage (phủ toàn bộ L1, clip nội bộ)
                L3: Viền nét đứt vùng in (pointer-events: none)
              ──────────────────────────────────────────────────
            */}
            <div
              id="print_body-image"
            ref={shirtContainerRef}
            style={{
              position:   "relative",
              width:      displayW,
              height:     displayH,
              flexShrink: 0,
            }}
          >
            {/* L1: Ảnh áo thật */}
            <ShirtMockupImage
              type={shirtType} view={shirtView} color={shirtColor}
              width={displayW}  height={displayH}
            />

            {/*
              L2: Konva Stage – phủ toàn bộ kích thước áo.
              Stage dùng scaleX/Y = zoom để element vẫn dùng
              tọa độ logic (0..CONTAINER_W, 0..CONTAINER_H).
              Clip ảnh/chữ được xử lý BÊN TRONG bởi Group clipX/Y
              → Transformer KHÔNG bị cắt.
            */}
            <CanvasEditor
              stageRef={stageRef}
              printArea={printAreaForCanvas}
              containerW={CONTAINER_W}
              containerH={CONTAINER_H}
              zoom={zoom}
              clipPoints={polygonPoints}
            />

            {/* L3: Viền nét đứt vùng in */}
            {usePolygon && polygonPoints ? (
              /* SVG polygon — vẽ chính xác hình khoét cổ cho polo */
              <svg
                className="ds-print-boundary"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: displayW,
                  height: displayH,
                  pointerEvents: "none",
                  zIndex: 3,
                  overflow: "visible",
                }}
              >
                {/* Nhãn "VÙNG IN" */}
                <text
                  x={polygonPoints[0][0] * zoom}
                  y={polygonPoints[0][1] * zoom - 5}
                  fontSize="10"
                  fontWeight="600"
                  fill={labelColor}
                  letterSpacing="0.05em"
                  style={{ userSelect: "none" }}
                >
                  VÙNG IN
                </text>
                {/* Path polygon */}
                <polygon
                  points={polygonPoints
                    .map(([x, y]) => `${x * zoom},${y * zoom}`)
                    .join(" ")}
                  fill="none"
                  stroke={borderColor}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              /* Rectangle — tất cả loại áo khác */
              <div 
                className="ds-print-boundary"
                style={{
                  position:  "absolute",
                  top:       pa.top   * zoom,
                  left:      pa.left  * zoom,
                  width:     pa.width * zoom,
                  height:    pa.height * zoom,
                  border:    `1.5px dashed ${borderColor}`,
                  borderRadius: 4,
                  pointerEvents: "none",
                  zIndex:    3,
                  boxSizing: "border-box",
                }}
              >
                <span style={{
                  position: "absolute",
                  top: -18,
                  left: 0,
                  fontSize: 10,
                  color: labelColor,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  pointerEvents: "none",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}>VÙNG IN</span>
              </div>
            )}
            </div>
          </div>

          {/* Zoom controls */}
          <div className="ds-zoom-controls">
            <button className="ds-zoom-btn" onClick={zoomOut} title="Thu nhỏ">−</button>
            <button className="ds-zoom-label" onClick={zoomReset} title="Reset về 100%">
              {Math.round(zoom / 1.75 * 100)}%
            </button>
            <button className="ds-zoom-btn" onClick={zoomIn}  title="Phóng to">+</button>
          </div>

          {/* ── Phụ phí thiết kế real-time ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "6px 16px",
            background: "rgba(0,0,0,0.35)",
            borderRadius: 8,
            marginTop: 8,
            fontSize: 13,
            color: "#f1f5f9",
          }}>
            <span style={{ opacity: 0.65 }}>Phụ phí thiết kế:</span>
            <span style={{
              fontWeight: 700,
              color: designFeeInfo.fee === 0 ? "#4ade80" : designFeeInfo.fee === 30000 ? "#facc15" : "#f87171",
            }}>
              {designFeeInfo.fee === 0 ? "Miễn phí" : `+${designFeeInfo.fee.toLocaleString("vi-VN")}đ`}
            </span>
            <span style={{ opacity: 0.45, fontSize: 11 }}>
              (Diện tích bao phủ: {designFeeInfo.areaCm2.toFixed(0)} cm²)
            </span>
          </div>

            {/* Shortcut hints */}
            <div className="ds-shortcut-hint">
              <span><kbd>Ctrl+Z</kbd> Hoàn tác</span>
              <span><kbd>Ctrl+S</kbd> Lưu</span>
              <span><kbd>Del</kbd> Xóa</span>
            </div>
          </div>

          {/* Right rail: Layers + Properties stacked */}
          <div className="ds-right-rail">
            <LayersPanel />
            <PropertiesPanel />
          </div>
        </div>

      {/* Floating Toolbars for element properties */}
      <FloatingToolbar
        shirtContainerRef={shirtContainerRef}
        zoom={zoom}
      />
      <StaticTextToolbar />

      {/* Modals */}
      <SaveDesignModal
        open={isSaveModalOpen}
        initialName={useDesignStore.getState().designName}
        onCancel={() => setIsSaveModalOpen(false)}
        onConfirm={handleConfirmSave}
        isSaving={isSaving}
      />
      
      <MyDesignsModal
        open={isMyDesignsOpen}
        onCancel={() => setIsMyDesignsOpen(false)}
        onSelectDesign={handleLoadDesign}
      />

      <div className={`ds-toast ${toast ? "ds-toast--visible" : ""}`}>{toast}</div>
    </div>
  );
}

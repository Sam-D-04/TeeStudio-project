"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { App, Button, Input, Select, Spin, ConfigProvider, theme } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  RedoOutlined,
  SaveOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import type Konva from "konva";

import { useDesignStore } from "@/store/useDesignStore";
import * as accountService from "@/services/admin/accountService";
import * as designService from "@/services/admin/designService";
import CanvasEditor from "@/components/design-studio/CanvasEditor";
import FloatingToolbar from "@/components/design-studio/FloatingToolbar";
import LayersPanel from "@/components/design-studio/LayersPanel";
import PropertiesPanel from "@/components/design-studio/PropertiesPanel";
import ShirtMockupImage, {
  getPoloFrontPolygon,
  getPrintAreaBoundary,
  hasPrintAreaPolygon,
} from "@/components/design-studio/ShirtMockupImage";
import Sidebar from "@/components/design-studio/Sidebar";
import StaticTextToolbar from "@/components/design-studio/StaticTextToolbar";
import "@/app/design-studio/design-studio.css";

const CONTAINER_W = 500;
const CONTAINER_H = 600;

export default function AdminDesignStudio() {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const stageRef = useRef<Konva.Stage | null>(null);
  const shirtContainerRef = useRef<HTMLDivElement>(null);
  const [customers, setCustomers] = useState<accountService.TaiKhoanKhachHang[]>([]);
  const [customerId, setCustomerId] = useState<number>();
  const [designName, setDesignName] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1);

  const {
    elements,
    shirtType,
    shirtColor,
    shirtView,
    addElement,
    removeElement,
    setSelectedId,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useDesignStore();

  useEffect(() => {
    useDesignStore.setState({
      elements: [],
      selectedId: null,
      currentDesignId: null,
      designName: "Thiết kế chưa đặt tên",
      shirtType: "tshirt",
      shirtColor: "#ffffff",
      shirtView: "front",
      undoStack: [],
      redoStack: [],
    });

    accountService
      .layDanhSachTaiKhoan({ page: 1, limit: 100, status: "ACTIVE" })
      .then((result) => setCustomers(result.items))
      .catch(() => message.error("Không thể tải danh sách khách hàng"))
      .finally(() => setLoadingCustomers(false));

    return () => {
      useDesignStore.setState({
        elements: [],
        selectedId: null,
        currentDesignId: null,
        undoStack: [],
        redoStack: [],
      });
    };
  }, [message]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInput =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement;
      if (isInput) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        const id = useDesignStore.getState().selectedId;
        if (id) removeElement(id);
      }
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redo, removeElement, setSelectedId, undo]);

  const handleUploadImages = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > 5 * 1024 * 1024) {
        message.warning(`${file.name} vượt quá 5 MB`);
        return false;
      }
      return true;
    });
    if (!validFiles.length) return;

    try {
      setUploading(true);
      const urls = await Promise.all(validFiles.map(designService.taiAnhThietKe));
      setUploadedImages((current) => [...current, ...urls]);
      message.success(`Đã tải lên ${urls.length} ảnh`);
    } catch {
      message.error("Tải ảnh thiết kế thất bại");
    } finally {
      setUploading(false);
    }
  }, [message]);

  const handleAddImageToCanvas = useCallback((src: string) => {
    const area = getPrintAreaBoundary(shirtType, shirtView, CONTAINER_W, CONTAINER_H);
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = () => {
      const aspect = image.naturalWidth / image.naturalHeight || 1;
      let width = area.width * 0.6;
      let height = width / aspect;
      if (height > area.height * 0.6) {
        height = area.height * 0.6;
        width = height * aspect;
      }
      addElement({
        type: "image",
        src,
        x: area.left + (area.width - width) / 2,
        y: area.top + (area.height - height) / 2,
        width,
        height,
        rotation: 0,
      });
    };
  }, [addElement, shirtType, shirtView]);

  const resetDesign = useCallback(() => {
    modal.confirm({
      title: "Xóa nội dung thiết kế?",
      content: "Toàn bộ hình ảnh và văn bản trên canvas sẽ bị xóa.",
      okText: "Xóa tất cả",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: () => useDesignStore.setState({ elements: [], selectedId: null, undoStack: [], redoStack: [] }),
    });
  }, [modal]);

  const saveDesign = useCallback(async () => {
    if (!customerId) return message.warning("Vui lòng chọn khách hàng");
    if (!designName.trim()) return message.warning("Vui lòng nhập tên thiết kế");
    if (!elements.length) return message.warning("Thiết kế cần có ít nhất một hình ảnh hoặc văn bản");
    if (!shirtContainerRef.current) return;

    try {
      setSaving(true);
      setSelectedId(null);
      const boundaries = shirtContainerRef.current.querySelectorAll<HTMLElement>(".ds-print-boundary");
      boundaries.forEach((element) => { element.style.display = "none"; });
      await new Promise((resolve) => window.setTimeout(resolve, 100));

      let previewUrl = "";
      try {
        const preview = await html2canvas(shirtContainerRef.current, {
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
        });
        previewUrl = preview.toDataURL("image/png");
      } finally {
        boundaries.forEach((element) => { element.style.display = ""; });
      }

      const result = await designService.taoThietKeChoKhach({
        userId: customerId,
        name: designName.trim(),
        shirtType,
        shirtColor,
        canvasData: {
          version: 1,
          shirtType,
          shirtView,
          logicalCanvas: { width: CONTAINER_W, height: CONTAINER_H },
          elements: useDesignStore.getState().elements,
        },
        previewUrl,
      });

      modal.success({
        title: "Đã tạo thiết kế cho khách",
        content: `Thiết kế #${result.id} đã xuất hiện trong kho thiết kế của khách hàng.`,
        okText: "Về trang quản lý",
        onOk: () => router.push("/admin/thiet-ke"),
      });
    } catch (error: unknown) {
      const fallback = "Không thể lưu thiết kế";
      const apiMessage = typeof error === "object" && error && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      message.error(apiMessage || fallback);
    } finally {
      setSaving(false);
    }
  }, [customerId, designName, elements.length, message, modal, router, setSelectedId, shirtColor, shirtType, shirtView]);

  const area = getPrintAreaBoundary(shirtType, shirtView, CONTAINER_W, CONTAINER_H);
  const printArea = { x: area.left, y: area.top, w: area.width, h: area.height };
  const polygonPoints = hasPrintAreaPolygon(shirtType, shirtView)
    ? getPoloFrontPolygon(CONTAINER_W, CONTAINER_H)
    : undefined;
  const displayW = CONTAINER_W * zoom;
  const displayH = CONTAINER_H * zoom;
  const borderColor = shirtColor.toLowerCase() === "#ffffff"
    ? "rgba(15,23,42,.65)"
    : "rgba(250,204,21,.8)";

  return (
    <div className="ds-root" style={{ height: "100vh", minHeight: 700 }}>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorBgContainer: "#0f172a",
            colorBorder: "#334155",
            colorTextPlaceholder: "#64748b",
            colorText: "#f8fafc",
            colorPrimary: "#0ea5e9",
            colorBgElevated: "#1e293b",
          },
        }}
      >
        <header className="ds-toolbar" style={{ height: "auto", minHeight: 64, flexWrap: "wrap", gap: 10, paddingBlock: 8 }}>
          <div className="ds-toolbar-left">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/thiet-ke")}>Quay lại</Button>
            <strong style={{ color: "#f8fafc" }}>Tạo thiết kế cho khách</strong>
          </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
          <Select
              showSearch
              loading={loadingCustomers}
              value={customerId}
              onChange={setCustomerId}
              placeholder="Chọn khách hàng"
              optionFilterProp="label"
              style={{ width: 260 }}
              options={customers.map((customer) => ({
                value: customer.id,
                label: `${customer.fullName} — ${customer.phone || customer.email}`,
              }))}
              notFoundContent={loadingCustomers ? <Spin size="small" /> : "Không có khách hàng"}
            />
            <Input
              value={designName}
              onChange={(event) => setDesignName(event.target.value)}
              placeholder="Tên thiết kế"
              maxLength={100}
              style={{ width: 240 }}
            />
        </div>

        <div className="ds-toolbar-right">
          <Button icon={<UndoOutlined />} disabled={!undoStack.length} onClick={undo} />
          <Button icon={<RedoOutlined />} disabled={!redoStack.length} onClick={redo} />
          <Button danger icon={<DeleteOutlined />} onClick={resetDesign}>Xóa</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} disabled={uploading} onClick={saveDesign}>
            Lưu cho khách
          </Button>
        </div>
      </header>
    </ConfigProvider>

      <div className="ds-body">
        <Sidebar
          uploadedImages={uploadedImages}
          onUploadImages={handleUploadImages}
          onRemoveUploadedImage={(index) => setUploadedImages((current) => current.filter((_, i) => i !== index))}
          onAddImageToCanvas={handleAddImageToCanvas}
          showMyDesigns={false}
        />

        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>
          <StaticTextToolbar />
          <div className="ds-workspace">
            {uploading && (
              <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "grid", placeItems: "center", background: "rgba(15,23,42,.65)" }}>
                <Spin size="large" description="Đang tải ảnh lên..." />
              </div>
            )}
            <div ref={shirtContainerRef} style={{ position: "relative", width: displayW, height: displayH, flexShrink: 0 }}>
              <ShirtMockupImage type={shirtType} view={shirtView} color={shirtColor} width={displayW} height={displayH} />
              <CanvasEditor
                stageRef={stageRef}
                printArea={printArea}
                containerW={CONTAINER_W}
                containerH={CONTAINER_H}
                zoom={zoom}
                clipPoints={polygonPoints}
              />
              {polygonPoints ? (
                <svg className="ds-print-boundary" style={{ position: "absolute", inset: 0, width: displayW, height: displayH, pointerEvents: "none", zIndex: 3 }}>
                  <polygon
                    points={polygonPoints.map(([x, y]) => `${x * zoom},${y * zoom}`).join(" ")}
                    fill="none"
                    stroke={borderColor}
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                </svg>
              ) : (
                <div
                  className="ds-print-boundary"
                  style={{
                    position: "absolute",
                    top: area.top * zoom,
                    left: area.left * zoom,
                    width: area.width * zoom,
                    height: area.height * zoom,
                    border: `1.5px dashed ${borderColor}`,
                    borderRadius: 4,
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                />
              )}
            </div>
          </div>
          <div className="ds-zoom-controls">
            <button className="ds-zoom-btn" onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}>−</button>
            <button className="ds-zoom-label" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
            <button className="ds-zoom-btn" onClick={() => setZoom((value) => Math.min(2, value + 0.25))}>+</button>
          </div>
        </div>

        <div className="ds-right-rail">
          <LayersPanel />
          <PropertiesPanel />
        </div>
      </div>

      <FloatingToolbar shirtContainerRef={shirtContainerRef} zoom={zoom} />
    </div>
  );
}

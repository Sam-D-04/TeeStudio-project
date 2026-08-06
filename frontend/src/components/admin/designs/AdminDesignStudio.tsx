"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { App, Button, Input, InputNumber, Select, Spin, ConfigProvider, theme } from "antd";
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
import ShirtSelector from "@/components/design-studio/ShirtSelector";
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
import { normalizeAdminTextFill } from "./adminDesignColorUtils";
import { captureAdminPrintImages } from "./adminPrintCapture";
import { getProductById } from "@/services/productService";
import * as productService from "@/services/admin/productService";

const CONTAINER_W = 500;
const CONTAINER_H = 600;

export default function AdminDesignStudio() {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const stageRef = useRef<Konva.Stage | null>(null);
  const shirtContainerRef = useRef<HTMLDivElement>(null);
  const [customers, setCustomers] = useState<accountService.TaiKhoanKhachHang[]>([]);
  const [customerId, setCustomerId] = useState<number>();
  const [products, setProducts] = useState<productService.SanPham[]>([]);
  const [adminSelectedProductId, setAdminSelectedProductId] = useState<number>();
  const [variantSelection, setVariantSelection] = useState<{ id: number; key: string }>();
  const [sizeResult, setSizeResult] = useState<{
    key: string;
    variants: designService.BienTheTaoThietKe[];
  }>({ key: "", variants: [] });
  const [designName, setDesignName] = useState("");
  const [designFee, setDesignFee] = useState<number | null>(null);
  const [selectedPrintMethodId, setSelectedPrintMethodId] = useState<number | undefined>();
  const [printMethods, setPrintMethods] = useState<designService.PhuongPhapIn[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1);

  const {
    elements,
    selectedId,
    shirtType,
    shirtColor,
    shirtView,
    mockupImages,
    addElement,
    updateElement,
    removeElement,
    setSelectedId,
    setShirtView,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useDesignStore();

  const variantKey = `${shirtType}|${shirtColor.toLowerCase()}|${adminSelectedProductId}`;
  const variantId = variantSelection?.key === variantKey ? variantSelection.id : undefined;
  const sizeOptions = sizeResult.key === variantKey ? sizeResult.variants : [];
  const loadingSizes = sizeResult.key !== variantKey;

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

    productService
      .layDanhSachSanPham({ soMoiTrang: 100, trangThai: "dang_hien_thi" })
      .then((res) => {
        setProducts(res.danhSach);
        if (res.danhSach.length > 0) {
          setAdminSelectedProductId(res.danhSach[0].id);
          const st = res.danhSach[0].shirtType;
          if (st) {
            useDesignStore.getState().setShirtType(st as any);
          }
        }
      })
      .catch(() => message.error("Không thể tải danh sách phôi áo"));

    designService.layDanhSachPhuongPhapIn()
      .then(setPrintMethods)
      .catch(() => message.warning("Không thể tải danh sách phương pháp in"));

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
    let isMounted = true;
    if (!adminSelectedProductId) return;
    const fetchColors = async () => {
      try {
        const product = await getProductById(adminSelectedProductId);
        if (!isMounted) return;

        useDesignStore.getState().setMockupImages(product.images);

        const colorSet = new Set<string>();
        product.variants.forEach(v => {
          if (v.colorHex && v.stockQty > 0) colorSet.add(v.colorHex.toLowerCase());
        });

        const colors = Array.from(colorSet);
        if (colors.length > 0) {
          useDesignStore.getState().setAvailableColors(colors);

          const currentHex = useDesignStore.getState().shirtColor.toLowerCase();
          if (!colors.includes(currentHex)) {
            useDesignStore.getState().setShirtColor(colors[0]);
          }
        } else {
          useDesignStore.getState().setAvailableColors(["#ffffff", "#000000"]);
        }
      } catch (error) {
        console.error("Failed to load available colors:", error);
      }
    };
    fetchColors();
    return () => { isMounted = false; };
  }, [adminSelectedProductId]);

  useEffect(() => {
    let active = true;
    if (!adminSelectedProductId) return;
    const requestedKey = `${shirtType}|${shirtColor.toLowerCase()}|${adminSelectedProductId}`;

    designService
      .layBienTheTaoThietKe(shirtType, shirtColor, adminSelectedProductId)
      .then((result) => {
        if (active) setSizeResult({ key: requestedKey, variants: result.variants });
      })
      .catch(() => {
        if (active) {
          setSizeResult({ key: requestedKey, variants: [] });
          message.error("Không thể tải danh sách size phù hợp");
        }
      });

    return () => {
      active = false;
    };
  }, [message, shirtColor, shirtType, adminSelectedProductId]);

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

  useEffect(() => {
    if (!selectedId) return;
    const selectedElement = elements.find((element) => element.id === selectedId);
    if (!selectedElement || selectedElement.type !== "text") return;
    const normalizedFill = normalizeAdminTextFill(selectedElement.fill);
    if (selectedElement.fill !== normalizedFill) {
      updateElement(selectedElement.id, { fill: normalizedFill });
    }
  }, [elements, selectedId, updateElement]);

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
    if (!variantId) return message.warning("Vui lòng chọn size áo");
    if (!designName.trim()) return message.warning("Vui lòng nhập tên thiết kế");
    if (!elements.length) return message.warning("Thiết kế cần có ít nhất một hình ảnh hoặc văn bản");
    if (!selectedPrintMethodId) return message.warning("Vui lòng chọn phương pháp in");
    if (!shirtContainerRef.current) return;

    try {
      setSaving(true);
      setSelectedId(null);
      const boundaries = shirtContainerRef.current.querySelectorAll<HTMLElement>(".ds-print-boundary");
      boundaries.forEach((element) => { element.style.display = "none"; });

      const state = useDesignStore.getState();
      const hasFront = state.elements.some(e => (e.side ?? "front") === "front");
      const targetPreviewSide = hasFront ? "front" : "back";
      const originalView = state.shirtView;

      if (state.shirtView !== targetPreviewSide) {
        useDesignStore.setState({ shirtView: targetPreviewSide, selectedId: null });
        await new Promise((resolve) => window.setTimeout(resolve, 500));
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }

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
        if (originalView !== targetPreviewSide) {
          useDesignStore.setState({ shirtView: originalView, selectedId: null });
        }
      }

      const { printImageFront, printImageBack } = await captureAdminPrintImages({
        stage: stageRef.current,
        shirtType,
        zoom,
      });

      const result = await designService.taoThietKeChoKhach({
        userId: customerId ?? null,
        name: designName.trim(),
        shirtType,
        shirtColor,
        variantId,
        canvasData: {
          version: 1,
          shirtType,
          shirtColor,
          shirtView,
          logicalCanvas: { width: CONTAINER_W, height: CONTAINER_H },
          elements: useDesignStore.getState().elements,
        },
        previewUrl,
        printImageFront: printImageFront ?? null,
        printImageBack: printImageBack ?? null,
        designFeeOverride: designFee != null ? designFee : 0,
        printMethodId: selectedPrintMethodId,
      });

      modal.success({
        title: customerId ? "Đã tạo thiết kế cho khách" : "Đã tạo thiết kế",
        content: customerId
          ? `Thiết kế #${result.id} đã xuất hiện trong kho thiết kế của khách hàng.`
          : `Thiết kế #${result.id} đang chờ gán khách hàng.`,
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
  }, [customerId, designFee, designName, elements.length, message, modal, router, selectedPrintMethodId, setSelectedId, shirtColor, shirtType, shirtView, variantId, zoom]);

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
            <strong style={{ color: "#f8fafc" }}>Tạo thiết kế</strong>
          </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, paddingLeft: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Select
              showSearch
              allowClear
              loading={loadingCustomers}
              value={customerId}
              onChange={setCustomerId}
              placeholder="Chọn khách hàng (không bắt buộc)"
              optionFilterProp="label"
              style={{ width: 400 }}
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
            <Select
              loading={loadingSizes}
              value={variantId}
              onChange={(id) => setVariantSelection({ id, key: variantKey })}
              placeholder="Chọn size"
              style={{ width: 150 }}
              options={sizeOptions.map((variant) => ({
                value: variant.id,
                label: `${variant.size}${variant.stockQty <= 0 ? " — Hết hàng" : ""}`,
                disabled: variant.stockQty <= 0,
              }))}
              notFoundContent={loadingSizes ? <Spin size="small" /> : "Không có size phù hợp"}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <InputNumber
              value={designFee}
              onChange={(value) => setDesignFee(value)}
              placeholder="Phí thiết kế (để trống = 0đ)"
              min={0}
              step={10000}
              formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""}
              parser={(value) => Number((value ?? "").replace(/[^\d]/g, ""))}
              style={{ width: 220 }}
              suffix="₫"
            />
            <Select
              allowClear
              value={selectedPrintMethodId}
              onChange={setSelectedPrintMethodId}
              placeholder="Phương pháp in"
              style={{ width: 200 }}
              options={printMethods.map((pm) => ({
                value: pm.id,
                label: `${pm.ten}${pm.phiInThem > 0 ? ` (+${pm.phiInThem.toLocaleString("vi-VN")}₫)` : ""}`,
              }))}
              notFoundContent="Không có phương pháp in"
            />
          </div>
        </div>

        <div className="ds-toolbar-right">
          <Button icon={<UndoOutlined />} disabled={!undoStack.length} onClick={undo} />
          <Button icon={<RedoOutlined />} disabled={!redoStack.length} onClick={redo} />
          <Button danger icon={<DeleteOutlined />} onClick={resetDesign}>Xóa</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} disabled={uploading} onClick={saveDesign}>
            Lưu thiết kế
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
              <ShirtMockupImage type={shirtType} view={shirtView} color={shirtColor} images={mockupImages} width={displayW} height={displayH} />
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
          <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 12, zIndex: 10 }}>
            {/* Chuyển đổi Mặt trước / Mặt sau */}
            <div
              style={{
                display: "flex",
                background: "rgba(30, 41, 59, 0.7)",
                backdropFilter: "blur(12px)",
                padding: 4,
                borderRadius: 9999,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                onClick={() => setShirtView("front")}
                style={{
                  padding: "6px 16px",
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.2s",
                  cursor: "pointer",
                  border: "none",
                  ...(shirtView === "front"
                    ? { background: "#0ea5e9", color: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }
                    : { background: "transparent", color: "#cbd5e1" }),
                }}
              >
                Mặt trước
              </button>
              <button
                onClick={() => setShirtView("back")}
                style={{
                  padding: "6px 16px",
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.2s",
                  cursor: "pointer",
                  border: "none",
                  ...(shirtView === "back"
                    ? { background: "#0ea5e9", color: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }
                    : { background: "transparent", color: "#cbd5e1" }),
                }}
              >
                Mặt sau
              </button>
            </div>

            <div
              style={{
                display: "flex",
                background: "rgba(30, 41, 59, 0.7)",
                backdropFilter: "blur(12px)",
                padding: "4px 12px",
                borderRadius: 9999,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>Phôi áo:</span>
              <select
                value={adminSelectedProductId || ""}
                onChange={(e) => {
                  const pid = Number(e.target.value);
                  setAdminSelectedProductId(pid);
                  const p = products.find(x => x.id === pid);
                  if (p && p.shirtType) {
                    useDesignStore.getState().setShirtType(p.shirtType as any);
                  }
                }}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id} style={{ color: "#000" }}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Chỉ chọn màu áo qua ShirtSelector dùng chung */}
            <ShirtSelector showShirtType={false} ignoreRevisionMode={true} />


            <div className="ds-zoom-controls" style={{ position: "static" }}>
              <button className="ds-zoom-btn" onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}>−</button>
              <button className="ds-zoom-label" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
              <button className="ds-zoom-btn" onClick={() => setZoom((value) => Math.min(2, value + 0.25))}>+</button>
            </div>
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

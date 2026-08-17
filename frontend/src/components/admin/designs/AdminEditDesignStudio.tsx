"use client";

/**
 * AdminEditDesignStudio – Editor dành cho Admin SỬA thiết kế của khách hàng.
 *
 * Luồng 4 bước:
 *  1. Load: Gọi API GET /admin/designs/:id/canvas → lấy canvasData JSON
 *  2. Tái tạo canvas: Load elements, shirtType, shirtColor, shirtView vào Zustand store
 *  3. Sửa: Admin chỉnh sửa trực tiếp trên canvas
 *  4. Lưu: Chụp ảnh preview mới → gọi PUT /admin/designs/:id/sua → ghi đè DB, giữ nguyên trạng thái
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { App, Button, InputNumber, Modal, Select, Spin, ConfigProvider, theme } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  RedoOutlined,
  SaveOutlined,
  UndoOutlined,
  EditOutlined,
  LoadingOutlined,
  UserDeleteOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import { v4 as uuidv4 } from "uuid";
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
import {
  normalizeAdminDesignElements,
  normalizeAdminTextFill,
} from "./adminDesignColorUtils";
import { captureAdminPrintImages } from "./adminPrintCapture";
import { getProductById } from "@/services/productService";

const SHIRT_TO_PRODUCT_ID: Record<string, number> = { tshirt: 1, polo: 4, hoodie: 3, sweater: 5 };


const CONTAINER_W = 500;
const CONTAINER_H = 600;

type AdminEditDesignStudioProps = {
  designId: number;
};

function formatCustomerLabel(customer: {
  tenKhachHang?: string | null;
  fullName?: string | null;
  soDienThoai?: string | null;
  phone?: string | null;
  emailKhachHang?: string | null;
  email?: string | null;
}) {
  const name = customer.tenKhachHang || customer.fullName || "Khách hàng";
  const contact =
    customer.soDienThoai || customer.phone || customer.emailKhachHang || customer.email || "";
  return contact ? `${name} - ${contact}` : name;
}

export default function AdminEditDesignStudio({ designId }: AdminEditDesignStudioProps) {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const stageRef = useRef<Konva.Stage | null>(null);
  const shirtContainerRef = useRef<HTMLDivElement>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [maThietKe, setMaThietKe] = useState("");
  const [tenThietKe, setTenThietKe] = useState("");
  const [customers, setCustomers] = useState<accountService.TaiKhoanKhachHang[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerActionLoading, setCustomerActionLoading] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [targetCustomerId, setTargetCustomerId] = useState<number>();
  const [ownerCustomer, setOwnerCustomer] = useState<{
    id: number | null;
    label: string;
  }>({ id: null, label: "Chưa gán khách" });
  const [hasRelatedOrder, setHasRelatedOrder] = useState(false);
  const [variantSelection, setVariantSelection] = useState<{ id: number; key: string }>();
  const [preferredSize, setPreferredSize] = useState<string>();
  const [sizeResult, setSizeResult] = useState<{
    key: string;
    variants: designService.BienTheTaoThietKe[];
  }>({ key: "", variants: [] });

  const [selectedPrintMethodId, setSelectedPrintMethodId] = useState<number | undefined>();
  const [printMethods, setPrintMethods] = useState<designService.PhuongPhapIn[]>([]);

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

  const variantKey = `${shirtType}|${shirtColor.toLowerCase()}`;
  const variantId = variantSelection?.key === variantKey ? variantSelection.id : undefined;
  const sizeOptions = useMemo(
    () => (sizeResult.key === variantKey ? sizeResult.variants : []),
    [sizeResult.key, sizeResult.variants, variantKey]
  );
  const loadingSizes = !hasRelatedOrder && sizeResult.key !== variantKey;

  // ─── Bước 1 & 2: Load canvasData từ API → tái tạo canvas ──────────────
  useEffect(() => {
    // Reset store trước khi load
    useDesignStore.setState({
      elements: [],
      selectedId: null,
      currentDesignId: null,
      designName: "Đang tải...",
      shirtType: "tshirt",
      shirtColor: "#ffffff",
      shirtView: "front",
      undoStack: [],
      redoStack: [],
    });

    queueMicrotask(() => {
      setLoading(true);
      setLoadError(null);
      setHasRelatedOrder(false);
    });

    designService
      .layCanvasDataThietKe(designId)
      .then((data) => {
        setMaThietKe(data.maThietKe);
        setTenThietKe(data.tenThietKe);
        setOwnerCustomer({
          id: data.khachHangId,
          label: data.khachHangId ? formatCustomerLabel(data) : "Chưa gán khách",
        });

        setHasRelatedOrder(Boolean(data.coDonHang));

        // Load phương pháp in hiện tại
        if (data.printMethodId != null) setSelectedPrintMethodId(data.printMethodId);

        const cd = data.canvasData;
        if (!cd || !Array.isArray(cd.elements)) {
          setLoadError("Thiết kế này chưa có dữ liệu canvas để chỉnh sửa.");
          return;
        }

        // Normalize ID: đảm bảo mọi element đều có UUID duy nhất
        // (thiết kế cũ có thể được lưu mà không có id, hoặc id bị trùng)
        const seenIds = new Set<string>();
        const normalizedElements = normalizeAdminDesignElements(cd.elements.map((el) => {
          const side = el.side ?? cd.shirtView ?? "front";
          if (!el.id || seenIds.has(el.id)) {
            return { ...el, id: uuidv4(), side };
          }
          seenIds.add(el.id);
          return { ...el, side };
        }));

        // Tái tạo toàn bộ trạng thái canvas từ JSON đã lưu
        const loadedShirtType = cd.shirtType ?? "tshirt";
        const loadedShirtColor = cd.shirtColor ?? data.mauAo ?? "#ffffff";
        setPreferredSize(data.sizeAo ?? undefined);
        setVariantSelection(undefined);

        useDesignStore.setState({
          elements: normalizedElements,
          selectedId: null,
          currentDesignId: designId,
          designName: data.tenThietKe,
          shirtType: loadedShirtType,
          shirtColor: loadedShirtColor,
          shirtView: cd.shirtView ?? "front",
          undoStack: [],
          redoStack: [],
        });

      })
      .catch((err) => {
        const msg =
          typeof err === "object" && err && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        setLoadError(msg || "Không thể tải dữ liệu thiết kế. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));

    // Cleanup khi unmount
    return () => {
      useDesignStore.setState({
        elements: [],
        selectedId: null,
        currentDesignId: null,
        undoStack: [],
        redoStack: [],
      });
    };
  }, [designId]);

  useEffect(() => {
    let active = true;

    accountService
      .layDanhSachTaiKhoan({ page: 1, limit: 100, status: "ACTIVE" })
      .then((result) => {
        if (active) setCustomers(result.items);
      })
      .catch(() => {
        if (active) message.error("Không thể tải danh sách khách hàng");
      })
      .finally(() => {
        if (active) setLoadingCustomers(false);
      });

    designService.layDanhSachPhuongPhapIn()
      .then((data) => { if (active) setPrintMethods(data); })
      .catch(() => { if (active) message.warning("Không thể tải danh sách phương pháp in"); });

    return () => {
      active = false;
    };
  }, [message]);

  useEffect(() => {
    let isMounted = true;
    const fetchColors = async () => {
      try {
        const pid = SHIRT_TO_PRODUCT_ID[shirtType] ?? 1;
        const product = await getProductById(pid);
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
  }, [shirtType]);

  useEffect(() => {
    let active = true;
    const requestedKey = `${shirtType}|${shirtColor.toLowerCase()}`;

    if (hasRelatedOrder) {
      queueMicrotask(() => {
        if (active) setSizeResult({ key: requestedKey, variants: [] });
      });
      return () => {
        active = false;
      };
    }

    designService
      .layBienTheTaoThietKe(shirtType, shirtColor)
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
  }, [hasRelatedOrder, message, shirtColor, shirtType]);

  useEffect(() => {
    if (hasRelatedOrder) return;
    if (sizeResult.key !== variantKey || variantId || !preferredSize) return;
    const matchingVariant = sizeOptions.find((variant) => variant.size === preferredSize && variant.stockQty > 0);
    if (matchingVariant) {
      queueMicrotask(() => setVariantSelection({ id: matchingVariant.id, key: variantKey }));
    }
  }, [hasRelatedOrder, preferredSize, sizeOptions, sizeResult.key, variantId, variantKey]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────
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

  // ─── Upload ảnh từ Sidebar ─────────────────────────────────────────────
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

  // ─── Thêm ảnh vào canvas ───────────────────────────────────────────────
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

  // ─── Xóa toàn bộ canvas ───────────────────────────────────────────────
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

  // ─── Bước 3 & 4: Lưu thay đổi ────────────────────────────────────────
  const saveDesign = useCallback(async () => {
    if (!elements.length) return message.warning("Thiết kế cần có ít nhất một hình ảnh hoặc văn bản");
    if (!hasRelatedOrder && !variantId) return message.warning("Vui lòng chọn size áo");
    if (!selectedPrintMethodId) return message.warning("Vui lòng chọn phương pháp in");
    if (!shirtContainerRef.current) return;

    try {
      setSaving(true);
      setSelectedId(null);

      // Ẩn đường viền vùng in trước khi chụp
      const boundaries = shirtContainerRef.current.querySelectorAll<HTMLElement>(".ds-print-boundary");
      boundaries.forEach((element) => { element.style.display = "none"; });
      await new Promise((resolve) => window.setTimeout(resolve, 100));

      let previewUrl = "";
      try {
        // Chụp ảnh preview mới bằng html2canvas
        const preview = await html2canvas(shirtContainerRef.current, {
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
        });
        previewUrl = preview.toDataURL("image/png");
      } finally {
        boundaries.forEach((element) => { element.style.display = ""; });
      }

      const { printImageFront, printImageBack } = await captureAdminPrintImages({
        stage: stageRef.current,
        shirtType,
        zoom,
      });

      // Gọi API ghi đè (canvasData JSON mới + previewUrl Base64)
      await designService.suaThietKeChoKhach(designId, {
        shirtType,
        shirtColor,
        ...(hasRelatedOrder ? {} : { variantId }),
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
        designFeeOverride: 0,
        printMethodId: selectedPrintMethodId,
      });

      modal.success({
        title: `Đã lưu ${maThietKe}`,
        content: "Thiết kế đã được cập nhật. Trạng thái duyệt không thay đổi.",
        okText: "Về trang quản lý",
        onOk: () => router.push("/admin/thiet-ke"),
      });
    } catch (error: unknown) {
      const fallback = "Không thể lưu thiết kế";
      const apiMessage =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      message.error(apiMessage || fallback);
    } finally {
      setSaving(false);
    }
  }, [designId, elements.length, hasRelatedOrder, maThietKe, message, modal, router, selectedPrintMethodId, setSelectedId, shirtColor, shirtType, shirtView, variantId, zoom]);

  // ─── Hủy bỏ – quay về danh sách không lưu gì ─────────────────────────
  const handleCancel = useCallback(() => {
    modal.confirm({
      title: "Hủy bỏ chỉnh sửa?",
      content: "Mọi thay đổi chưa lưu sẽ bị mất. Dữ liệu gốc vẫn an toàn.",
      okText: "Hủy bỏ",
      okButtonProps: { danger: true },
      cancelText: "Tiếp tục sửa",
      onOk: () => router.push("/admin/thiet-ke"),
    });
  }, [modal, router]);

  // ─── Tính toán vùng in ────────────────────────────────────────────────
  const handleRemoveCustomer = useCallback(() => {
    modal.confirm({
      title: "Gỡ khách hàng khỏi thiết kế?",
      content:
        "Thiết kế sẽ biến mất khỏi tài khoản khách hiện tại ngay lập tức, nhưng vẫn còn trong trang quản trị để admin có thể gán lại.",
      okText: "Gỡ khách hàng",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setCustomerActionLoading(true);
          await designService.goKhachHangKhoiThietKe(designId);
          setOwnerCustomer({ id: null, label: "Chưa gán khách" });
          setTargetCustomerId(undefined);
          message.success("Đã gỡ khách hàng khỏi thiết kế");
        } catch (error: unknown) {
          const apiMessage = typeof error === "object" && error && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
          message.error(apiMessage || "Không thể gỡ khách hàng");
        } finally {
          setCustomerActionLoading(false);
        }
      },
    });
  }, [designId, message, modal]);

  const openCustomerModal = useCallback(() => {
    setTargetCustomerId(ownerCustomer.id || undefined);
    setCustomerModalOpen(true);
  }, [ownerCustomer.id]);

  const handleChangeCustomer = useCallback(async () => {
    if (!targetCustomerId) {
      message.warning("Vui lòng chọn khách hàng mới");
      return;
    }

    try {
      setCustomerActionLoading(true);
      const result = await designService.doiKhachHangThietKe(designId, targetCustomerId);
      setOwnerCustomer({
        id: result.khachHangId,
        label: formatCustomerLabel(result),
      });
      setCustomerModalOpen(false);
      message.success("Đã đổi khách hàng cho thiết kế");
    } catch (error: unknown) {
      const apiMessage = typeof error === "object" && error && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      message.error(apiMessage || "Không thể đổi khách hàng");
    } finally {
      setCustomerActionLoading(false);
    }
  }, [designId, message, targetCustomerId]);

  const area = getPrintAreaBoundary(shirtType, shirtView, CONTAINER_W, CONTAINER_H);
  const printArea = { x: area.left, y: area.top, w: area.width, h: area.height };
  const polygonPoints = hasPrintAreaPolygon(shirtType, shirtView)
    ? getPoloFrontPolygon(CONTAINER_W, CONTAINER_H)
    : undefined;
  const displayW = CONTAINER_W * zoom;
  const displayH = CONTAINER_H * zoom;
  const borderColor =
    shirtColor.toLowerCase() === "#ffffff"
      ? "rgba(15,23,42,.65)"
      : "rgba(250,204,21,.8)";

  // ─── Màn hình loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <LoadingOutlined style={{ fontSize: 40, color: "#0ea5e9" }} />
        <span style={{ fontSize: 16 }}>Đang tải thiết kế...</span>
      </div>
    );
  }

  // ─── Màn hình lỗi ─────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <span style={{ fontSize: 16, color: "#ef4444" }}>{loadError}</span>
        <Button onClick={() => router.push("/admin/thiet-ke")}>Quay lại danh sách</Button>
      </div>
    );
  }

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
        <header
          className="ds-toolbar"
          style={{ height: "auto", minHeight: 64, flexWrap: "wrap", gap: 10, paddingBlock: 8 }}
        >
          {/* Trái: Quay lại + Tiêu đề */}
          <div className="ds-toolbar-left">
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Hủy bỏ
            </Button>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <strong style={{ color: "#f8fafc", display: "flex", alignItems: "center", gap: 6 }}>
                <EditOutlined style={{ color: "#f59e0b" }} />
                Sửa thiết kế
              </strong>
              {maThietKe && (
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  {maThietKe} · {tenThietKe}
                </span>
              )}
            </div>
          </div>

          {/* Phải: Undo/Redo + Xóa + Lưu thay đổi */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, paddingLeft: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              title={ownerCustomer.label}
              style={{
                maxWidth: 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: ownerCustomer.id ? "#cbd5e1" : "#fbbf24",
                fontSize: 13,
                border: "1px solid #334155",
                borderRadius: 6,
                padding: "5px 10px",
                background: "rgba(15,23,42,.65)",
              }}
            >
              Khách: {ownerCustomer.label}
            </span>
            <Button
              icon={<UserSwitchOutlined />}
              onClick={openCustomerModal}
              disabled={customerActionLoading}
            >
              Đổi khách
            </Button>
            <Button
              danger
              icon={<UserDeleteOutlined />}
              onClick={handleRemoveCustomer}
              loading={customerActionLoading}
              disabled={!ownerCustomer.id}
            >
              Gỡ khách hàng
            </Button>
            {hasRelatedOrder ? (
              <span
                title="Size ao thuoc don hang, chinh sua trong muc Don hang"
                style={{
                  color: "#cbd5e1",
                  fontSize: 13,
                  border: "1px solid #334155",
                  borderRadius: 6,
                  padding: "5px 10px",
                  background: "rgba(15,23,42,.65)",
                }}
              >
                Size: {preferredSize || "Theo don hang"}
              </span>
            ) : (
              <Select
                loading={loadingSizes}
                value={variantId}
                onChange={(id) => {
                  const selectedVariant = sizeOptions.find((variant) => variant.id === id);
                  setPreferredSize(selectedVariant?.size);
                  setVariantSelection({ id, key: variantKey });
                }}
                placeholder="Chon size"
                style={{ width: 150 }}
                options={sizeOptions.map((variant) => ({
                  value: variant.id,
                  label: `${variant.size}${variant.stockQty <= 0 ? " - Het hang" : ""}`,
                  disabled: variant.stockQty <= 0,
                }))}
                notFoundContent={loadingSizes ? <Spin size="small" /> : "Khong co size phu hop"}
              />
            )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

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
            <Button danger icon={<DeleteOutlined />} onClick={resetDesign}>
              Xóa
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={uploading}
              onClick={saveDesign}
              style={{ background: "#f59e0b", borderColor: "#f59e0b" }}
            >
              Lưu thay đổi
            </Button>
          </div>
        </header>
      </ConfigProvider>

      <div className="ds-body">
        <Sidebar
          uploadedImages={uploadedImages}
          onUploadImages={handleUploadImages}
          onRemoveUploadedImage={(index) =>
            setUploadedImages((current) => current.filter((_, i) => i !== index))
          }
          onAddImageToCanvas={handleAddImageToCanvas}
          showMyDesigns={false}
          lockShirtOptions={hasRelatedOrder}
        />

        <div
          style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}
        >
          <StaticTextToolbar />
          <div className="ds-workspace">
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 20,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(15,23,42,.65)",
                }}
              >
                <Spin size="large" />
              </div>
            )}
            <div
              ref={shirtContainerRef}
              style={{ position: "relative", width: displayW, height: displayH, flexShrink: 0 }}
            >
              <ShirtMockupImage
                type={shirtType}
                view={shirtView}
                color={shirtColor}
                images={mockupImages}
                width={displayW}
                height={displayH}
              />
              <CanvasEditor
                stageRef={stageRef}
                printArea={printArea}
                containerW={CONTAINER_W}
                containerH={CONTAINER_H}
                zoom={zoom}
                clipPoints={polygonPoints}
              />
              {polygonPoints ? (
                <svg
                  className="ds-print-boundary"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: displayW,
                    height: displayH,
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                >
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

      <Modal
        title="Đổi khách hàng cho thiết kế"
        open={customerModalOpen}
        onCancel={() => setCustomerModalOpen(false)}
        onOk={handleChangeCustomer}
        okText="Gán cho khách này"
        cancelText="Hủy"
        confirmLoading={customerActionLoading}
      >
        <Select
          showSearch
          loading={loadingCustomers}
          value={targetCustomerId}
          onChange={setTargetCustomerId}
          placeholder="Chọn khách hàng mới"
          optionFilterProp="label"
          style={{ width: "100%" }}
          options={customers.map((customer) => ({
            value: customer.id,
            label: formatCustomerLabel(customer),
            disabled: customer.id === ownerCustomer.id,
          }))}
          notFoundContent={loadingCustomers ? <Spin size="small" /> : "Không có khách hàng"}
        />
      </Modal>

      <FloatingToolbar shirtContainerRef={shirtContainerRef} zoom={zoom} />
    </div>
  );
}

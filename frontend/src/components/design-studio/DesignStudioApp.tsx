"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayersIcon } from "lucide-react";
import type Konva from "konva";

import { useDesignStore, selectElementsBySide, type DesignElement } from "@/store/useDesignStore";
import useAuthStore from "@/store/useAuthStore";
import { userDesignService, SavedDesign } from "@/services/userDesignService";
import { getProductById } from "@/services/productService";
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
import AddToCartModal from "./AddToCartModal";
import CartDrawer from "./CartDrawer";

import "../../app/design-studio/design-studio.css";

/* ─── Kích thước logic của container áo (px, trước khi zoom) ─── */
const CONTAINER_W = 500;
const CONTAINER_H = 600;

const SHIRT_TO_PRODUCT_ID: Record<string, number> = { tshirt: 1, polo: 4, hoodie: 3 };

export default function DesignStudioApp() {
  const stageRef         = useRef<Konva.Stage | null>(null);
  /* ref trỏ đến div bao quanh ảnh áo — dùng để tính vị trí FloatingToolbar */
  const shirtContainerRef = useRef<HTMLDivElement>(null);

  const {
    shirtType, shirtColor, shirtView, mockupImages, availableColors,
    addElement, removeElement,
    undo, redo,
    setSelectedId, setShirtType, setShirtColor, setShirtView,
    currentDesignId, setCurrentDesignId,
    currentDesignStatus,
  } = useDesignStore();

  /** Thiết kế đã được admin duyệt → khóa toàn bộ chỉnh sửa phía khách */
  const isApproved = currentDesignStatus === "APPROVED";

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

  /* ── Cart modal — productId và tên màu từ URL ── */
  const [urlProductId, setUrlProductId] = useState<number | null>(null);
  const [colorName, setColorName] = useState<string>("");

  /* ── Zoom ── */
  const [zoom, setZoom] = useState(1.75);
  const displayW = Math.round(CONTAINER_W * zoom);
  const displayH = Math.round(CONTAINER_H * zoom);

  /* ── Init: parse URL params. Nếu có ?designId=xxx thì tự động load thiết kế đó
     (dùng cho luồng email yêu cầu chỉnh sửa: khách click link → mở đúng bản thiết kế) ── */
  useEffect(() => {
    const shirt    = searchParams.get("shirt");
    const color    = searchParams.get("color");
    const view     = searchParams.get("view");
    const pid      = searchParams.get("productId");
    const designId = searchParams.get("designId");

    if (shirt === "tshirt" || shirt === "polo" || shirt === "hoodie") setShirtType(shirt);
    if (color) {
      setColorName(color);
      // Hex phải khớp đúng ProductVariant.colorHex trong DB (xem migration
      // 20260804_add_productimage_colorhex_view.sql) — nếu không khớp, hiệu ứng
      // "chọn màu theo tên" ở đây sẽ tự bị fetchColors() ghi đè về màu đầu tiên.
      const map: Record<string, string> = {
        Black: "#000000", White: "#ffffff", Navy: "#1e3a8a",
        Grey: "#9ca3af", Brown: "#8b4513", Beige: "#d6b89a",
      };
      setShirtColor(map[color] ?? color);
    }
    if (view === "front" || view === "back") setShirtView(view);
    if (pid) setUrlProductId(parseInt(pid, 10));

    // Auto-load thiết kế từ URL param ?designId=xxx
    // Dùng cho luồng: Admin gửi email có link → khách click → mở đúng thiết kế cần sửa
    if (designId) {
      const id = parseInt(designId, 10);
      if (id > 0) {
        // Nếu đã đăng nhập: load ngay
        if (useAuthStore.getState().isAuthenticated && useAuthStore.getState().accessToken) {
          userDesignService.getMyDesigns().then((designs) => {
            const found = designs.find((d) => d.id === id);
            if (found) {
              handleLoadDesignById(found);
            } else {
              showToast("Không tìm thấy thiết kế hoặc bạn không có quyền truy cập");
            }
          }).catch(() => showToast("Lỗi khi tải thiết kế"));
        } else {
          // Chưa đăng nhập: lưu lại để load sau khi login
          sessionStorage.setItem("pendingDesignId", String(id));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Lấy danh sách màu áo + ảnh mockup động từ DB theo shirtType ── */
  const { setAvailableColors, setMockupImages } = useDesignStore.getState();
  useEffect(() => {
    let isMounted = true;
    const fetchColors = async () => {
      try {
        const pid = urlProductId ?? SHIRT_TO_PRODUCT_ID[shirtType] ?? 1;
        const product = await getProductById(pid);
        if (!isMounted) return;

        setMockupImages(product.images);

        // Trích xuất các màu duy nhất từ biến thể còn hoạt động và còn hàng
        const colorSet = new Set<string>();
        product.variants.forEach(v => {
          if (v.colorHex && v.stockQty > 0) colorSet.add(v.colorHex.toLowerCase());
        });

        const colors = Array.from(colorSet);
        if (colors.length > 0) {
          setAvailableColors(colors);

          // Nếu màu đang chọn không nằm trong danh sách mới, fallback về màu đầu tiên
          const currentHex = useDesignStore.getState().shirtColor.toLowerCase();
          if (!colors.includes(currentHex)) {
            setShirtColor(colors[0]);
          }
        } else {
          // Fallback an toàn nếu sản phẩm không có biến thể nào
          setAvailableColors(["#ffffff", "#000000"]);
        }
      } catch (error) {
        console.error("Failed to load available colors:", error);
      }
    };
    fetchColors();
    return () => { isMounted = false; };
  }, [shirtType, urlProductId, setAvailableColors, setMockupImages, setShirtColor]);

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
  }, [undo, redo, removeElement, showToast, setSelectedId]);

  /* ── Upload ──
     Dùng base64 (FileReader) thay vì URL.createObjectURL: blob URL chỉ sống trong
     phiên trình duyệt hiện tại, nên khi lưu thẳng vào canvasData rồi load lại thiết
     kế ở phiên khác thì ảnh sẽ không hiển thị được. Base64 portable trong cả phiên
     làm việc và được backend upload lên Cloudinary khi lưu thiết kế. */
  const handleUploadImages = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) { showToast("File quá lớn (>5MB)"); return; }
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [showToast]);

  const handleRemoveUploadedImage = useCallback((idx: number) => {
    setUploadedImages((prev) => {
      const arr = [...prev];
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
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  /*
    Ảnh in print-ready (base64) chụp từ canvas Konva khi mở modal thêm vào giỏ.
    Tối đa 2 ảnh - mặt nào không có phần tử nào thì để undefined (không tạo
    ảnh trắng vô nghĩa). Việc gửi cả 2 ảnh này lên backend khi tạo đơn là việc
    của Giai đoạn 3 (schema + lưu trữ) - AddToCartModal/giỏ hàng/checkout hiện
    tại vẫn chỉ nhận 1 ảnh nên bên dưới tạm ưu tiên ảnh mặt trước, dùng ảnh mặt
    sau nếu khách chỉ thiết kế mặt sau.
  */
  const [printImageFront, setPrintImageFront] = useState<string | undefined>(undefined);
  const [printImageBack, setPrintImageBack] = useState<string | undefined>(undefined);

  const handleSaveClick = useCallback(() => {
    if (!isAuthenticated || !accessToken) {
      alert("Vui lòng đăng nhập tài khoản để lưu thiết kế của bạn");
      return;
    }
    setIsSaveModalOpen(true);
  }, [isAuthenticated, accessToken]);

  /* Tạo thiết kế mới hoàn toàn – reset canvas và ID */
  const handleNewDesign = useCallback(() => {
    const currentElements = useDesignStore.getState().elements;
    const doNew = () => {
      useDesignStore.getState().clearDesign();
      showToast("Thiết kế mới đã được tạo");
    };
    if (currentElements.length > 0) {
      Modal.confirm({
        title: "Tạo thiết kế mới?",
        content: "Nội dung hiện tại sẽ bị xóa. Hãy lưu lại trước nếu bạn muốn giữ bản thiết kế này.",
        okText: "Tạo mới",
        cancelText: "Huỷ",
        onOk: doNew,
      });
    } else {
      doNew();
    }
  }, [showToast]);

  const handleConfirmSave = useCallback(async (name: string): Promise<boolean> => {
    if (!accessToken) return false;
    try {
      setIsSaving(true);

      // Cập nhật tên thiết kế trong store
      useDesignStore.getState().setDesignName(name);

      // Chụp lại canvas thành ảnh base64 để làm ảnh xem trước (preview)
      let previewUrl = "";
      if (shirtContainerRef.current) {
        setSelectedId(null);

        // Preview luôn ưu tiên chụp mặt trước (mặt "đại diện" thiết kế); nếu mặt
        // trước không có phần tử nào nhưng mặt sau có thì chụp mặt sau thay thế,
        // tránh trường hợp thiết kế chỉ ở mặt sau lại có ảnh preview là áo trắng trơn.
        const currentElements = useDesignStore.getState().elements;
        const originalView = useDesignStore.getState().shirtView;
        const frontHasContent = selectElementsBySide(currentElements, "front").length > 0;
        const backHasContent  = selectElementsBySide(currentElements, "back").length > 0;
        const previewView: "front" | "back" =
          !frontHasContent && backHasContent ? "back" : "front";

        if (previewView !== originalView) {
          setShirtView(previewView);
        }

        // Ẩn khung đứt nét của vùng in
        const boundaries = shirtContainerRef.current.querySelectorAll('.ds-print-boundary');
        boundaries.forEach((el: any) => el.style.display = 'none');

        // Đợi React render lại đúng mặt áo cần chụp trước khi html2canvas chụp DOM
        await new Promise((r) => setTimeout(r, 100));

        const canvas = await html2canvas(shirtContainerRef.current, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        });
        previewUrl = canvas.toDataURL("image/png");

        // Hiển thị lại khung đứt nét
        boundaries.forEach((el: any) => el.style.display = '');

        // Trả UI về đúng mặt khách đang xem trước khi lưu (preview chỉ mượn tạm)
        if (previewView !== originalView) {
          setShirtView(originalView);
        }
      }

      const payload = {
        name,
        shirtType,
        shirtColor,
        canvasData: {
          version: 1,
          elements: useDesignStore.getState().elements,
          shirtType: useDesignStore.getState().shirtType,
          shirtView: useDesignStore.getState().shirtView,
          logicalCanvas: { width: CONTAINER_W, height: CONTAINER_H },
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
      return true;
    } catch (err: any) {
      showToast(err.message || "Lỗi khi lưu thiết kế");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [accessToken, currentDesignId, shirtType, shirtColor, setSelectedId, setShirtView, setCurrentDesignId, showToast]);


  /** Hàm nội bộ: load một design object vào canvas (không hỏi confirm khi canvas trống) */
  const handleLoadDesignById = useCallback((design: SavedDesign) => {
    const state = useDesignStore.getState();
    state.clearDesign();
    const elements = (design.canvasData?.elements || []).map(
      (el: DesignElement) => ({ ...el, side: el.side ?? "front" })
    );
    // Tự động focus vào mặt áo có NHIỀU phần tử hơn (không dựa vào shirtView lúc lưu,
    // vì mặt đang xem lúc lưu có thể trống trong khi mặt còn lại mới là nơi chứa thiết kế
    // → tránh cảm giác "mở thiết kế nhưng thấy áo trống").
    const frontCount = selectElementsBySide(elements, "front").length;
    const backCount  = selectElementsBySide(elements, "back").length;
    const view: "front" | "back" = backCount > frontCount ? "back" : "front";
    useDesignStore.setState({
      elements,
      shirtView: view,
      shirtType: design.canvasData?.shirtType
        || (design.productId === 1 ? "tshirt" : design.productId === 2 ? "polo" : "hoodie"),
      shirtColor: design.baseColor,
      currentDesignId: design.id,
      currentDesignStatus: design.status,
      designName: design.name,
    });
  }, []);

  const handleLoadDesign = useCallback((design: SavedDesign) => {
    const doLoad = () => {
      handleLoadDesignById(design);
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
  }, [handleLoadDesignById, showToast]);

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

  /*
    Chụp ảnh in print-ready cho CẢ 2 MẶT (trước/sau) từ Konva stage.
    - Stage chỉ chứa layer thiết kế (mockup áo là <img> DOM riêng) → PNG nền trong suốt.
    - Trước đây hàm này chỉ chụp đúng mặt đang xem tại thời điểm bấm "Thêm vào
      giỏ hàng" - nếu khách thiết kế cả 2 mặt nhưng đang xem mặt trước lúc bấm,
      ảnh in mặt sau bị MẤT hoàn toàn. Giờ hàm tự chuyển qua từng mặt CÓ phần
      tử để chụp riêng (mặt trống thì bỏ qua, không tạo ảnh trắng vô nghĩa),
      rồi khôi phục lại đúng mặt khách đang xem ban đầu sau khi chụp xong.
    - Dùng useDesignStore.setState() trực tiếp (không qua action setShirtView)
      để không đẩy các lần chuyển mặt tạm thời này vào undoStack - đây là
      thao tác nội bộ phục vụ chụp ảnh, không phải thao tác của người dùng.
    - Vùng crop (print area) của từng mặt tính lại bằng getPrintAreaBoundary
      thay vì dùng biến printAreaForCanvas ở ngoài - biến đó thuộc closure của
      lần render ứng với mặt ban đầu, không tự cập nhật khi ta đổi mặt bên
      trong hàm này.
    - Có chờ ngắn (setTimeout) sau khi đổi mặt để Konva kịp vẽ lại đúng phần
      tử của mặt vừa chuyển sang trước khi chụp, tránh chụp nhầm frame cũ.
    - pixelRatio (multiplier) nâng độ phân giải lên ~2400px cạnh dài (đủ ~250-300 DPI).
  */
  const capturePrintImages = async (): Promise<{ printImageFront?: string; printImageBack?: string }> => {
    const stage = stageRef.current;
    if (!stage) return {};

    const originalView = useDesignStore.getState().shirtView;
    const elementsNow   = useDesignStore.getState().elements;
    const sidesToCapture = (["front", "back"] as const).filter((side) =>
      selectElementsBySide(elementsNow, side).length > 0
    );
    if (sidesToCapture.length === 0) return {};

    const TARGET_LONG_EDGE = 2400; // px
    const result: { printImageFront?: string; printImageBack?: string } = {};

    for (const side of sidesToCapture) {
      if (useDesignStore.getState().shirtView !== side) {
        useDesignStore.setState({ shirtView: side, selectedId: null });
        await new Promise((r) => setTimeout(r, 120));
      }

      const paSide = getPrintAreaBoundary(shirtType, side, CONTAINER_W, CONTAINER_H);
      // Ẩn khung chọn (Transformer) để không lọt vào ảnh in
      const transformers = stage.find("Transformer");
      transformers.forEach((t) => t.hide());
      try {
        const longEdgeScreen = Math.max(paSide.width, paSide.height) * zoom;
        const pixelRatio = longEdgeScreen > 0 ? TARGET_LONG_EDGE / longEdgeScreen : 3;
        const dataUrl = stage.toDataURL({
          mimeType: "image/png",
          x: paSide.left * zoom,
          y: paSide.top * zoom,
          width: paSide.width * zoom,
          height: paSide.height * zoom,
          pixelRatio,
        });
        if (side === "front") result.printImageFront = dataUrl;
        else result.printImageBack = dataUrl;
      } catch (e) {
        console.error(`[DesignStudio] Không export được ảnh in mặt ${side}:`, e);
      } finally {
        transformers.forEach((t) => t.show());
        stage.batchDraw();
      }
    }

    // Khôi phục lại đúng mặt khách đang xem trước khi bấm "Thêm vào giỏ hàng"
    if (useDesignStore.getState().shirtView !== originalView) {
      useDesignStore.setState({ shirtView: originalView, selectedId: null });
    }

    return result;
  };

  /* Mở modal thêm vào giỏ: chụp ảnh in (nếu có thiết kế) rồi mới mở */
  const handleOpenCart = async () => {
    setSelectedId(null);
    if (elements.length > 0) {
      showToast("Đang chuẩn bị ảnh in...");
      const { printImageFront: front, printImageBack: back } = await capturePrintImages();
      setPrintImageFront(front);
      setPrintImageBack(back);
    } else {
      setPrintImageFront(undefined);
      setPrintImageBack(undefined);
    }
    setIsCartModalOpen(true);
  };

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
  // Nếu áo màu sáng thì viền đậm (đen xám), màu tối thì viền sáng (vàng)
  let borderColor   = isLightShirt ? "rgba(0,0,0,0.55)"     : "rgba(234, 179, 8, 0.75)";
  let labelColor    = isLightShirt ? "rgba(0,0,0,0.6)"       : "rgba(234,179,8,0.8)";

  if (shirtType === "hoodie" && shirtColor.toLowerCase() === "#8b4513") {
    borderColor = "rgba(0,0,0,0.65)";
    labelColor = "rgba(0,0,0,0.8)";
  }

  /* ── Zoom controls ── */
  const zoomIn    = () => setZoom((z) => Math.min(+(z + 0.25).toFixed(2), 3));
  const zoomOut   = () => setZoom((z) => Math.max(+(z - 0.25).toFixed(2), 0.25));
  const zoomReset = () => setZoom(1.75);

  return (
    <div className="ds-root">
      {/* ── Banner: Thiết kế đã duyệt – khóa chỉnh sửa ── */}
      {isApproved && (
        <div style={{
          background: "linear-gradient(90deg, #065f46 0%, #047857 100%)",
          color: "#ecfdf5",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 14,
          fontWeight: 600,
          zIndex: 100,
          borderBottom: "2px solid #34d399",
        }}>
          <span style={{ fontSize: 18 }}>✅</span>
          Thiết kế này đã được Admin duyệt – không thể chỉnh sửa thêm.
          <span style={{ fontWeight: 400, opacity: 0.8, fontSize: 13 }}>
            Nếu cần thay đổi, vui lòng liên hệ TeeStudio.
          </span>
        </div>
      )}

      <Toolbar
        onSave={handleSaveClick}
        onDownloadImage={handleDownloadImage}
        onShowToast={showToast}
        onOpenMyDesigns={() => setIsMyDesignsOpen(true)}
        onNewDesign={handleNewDesign}
        onAddToCart={isApproved ? undefined : handleOpenCart}
        onViewCart={() => setIsCartDrawerOpen(true)}
        isSaving={isSaving}
        isReadOnly={isApproved}
      />

      <div className="ds-body">
        <Sidebar
          uploadedImages={uploadedImages}
          onUploadImages={handleUploadImages}
          onRemoveUploadedImage={handleRemoveUploadedImage}
          onAddImageToCanvas={handleAddImageToCanvas}
          lockShirtOptions={isApproved}
          isReadOnly={isApproved}
        />

        {/* ─── Khu vực làm việc chính (áo + canvas thiết kế) ─── */}
        <div
          className="ds-workspace-container"
          style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}
        >
          <StaticTextToolbar />

          <div className="ds-workspace" style={{ flex: 1, position: "relative" }}>
            {/*
              ─────────────────────────────────────────────
              Các lớp DOM chồng lên nhau (từ dưới lên trên):
                L1: <img> ảnh áo (pointer-events: none)
                L2: Konva Stage (phủ toàn bộ L1, tự clip nội dung bên trong)
                L3: Viền nét đứt đánh dấu vùng in (pointer-events: none)
              ─────────────────────────────────────────────
            */}
            <div
              id="print_body-image"
              ref={shirtContainerRef}
              style={{
                position: "relative",
                width: displayW,
                height: displayH,
                flexShrink: 0,
              }}
            >
              {/* L1: Ảnh áo thật (theo loại áo / mặt / màu đang chọn) */}
              <ShirtMockupImage
                type={shirtType}
                view={shirtView}
                color={shirtColor}
                images={mockupImages}
                width={displayW}
                height={displayH}
              />

              {/*
                L2: Konva Stage – phủ toàn bộ kích thước áo.
                Stage dùng scaleX/Y = zoom để các phần tử vẫn giữ nguyên
                tọa độ logic (0..CONTAINER_W, 0..CONTAINER_H) bất kể zoom.
                Việc clip ảnh/chữ theo vùng in được xử lý BÊN TRONG bởi
                Group clipX/Y để Transformer (khung xoay/resize) không bị cắt theo.
              */}
              <CanvasEditor
                stageRef={stageRef}
                printArea={printAreaForCanvas}
                containerW={CONTAINER_W}
                containerH={CONTAINER_H}
                zoom={zoom}
                clipPoints={polygonPoints}
                isReadOnly={isApproved}
              />

              {/* L3: Viền nét đứt đánh dấu vùng in được phép thiết kế */}
              {usePolygon && polygonPoints ? (
                /* Áo polo mặt trước có khoét cổ → vẽ viền bằng SVG polygon cho chính xác */
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
                  {/* Đường viền nét đứt theo hình khoét cổ */}
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
                /* Các loại áo/mặt còn lại → vùng in là hình chữ nhật đơn giản */
                <div
                  className="ds-print-boundary"
                  style={{
                    position: "absolute",
                    top: pa.top * zoom,
                    left: pa.left * zoom,
                    width: pa.width * zoom,
                    height: pa.height * zoom,
                    border: `1.5px dashed ${borderColor}`,
                    borderRadius: 4,
                    pointerEvents: "none",
                    zIndex: 3,
                    boxSizing: "border-box",
                  }}
                >
                  <span
                    style={{
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
                    }}
                  >
                    VÙNG IN
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Cụm điều khiển: View Toggle & Zoom */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 16 }}>
            {/* Chuyển đổi Mặt trước / Mặt sau */}
            <div
              style={{
                display: "flex",
                background: "rgba(30, 41, 59, 0.7)", // bg-slate-800/70
                backdropFilter: "blur(12px)",
                padding: 4,
                borderRadius: 9999,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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
                    ? { background: "#0ea5e9", color: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" } // sky-500
                    : { background: "transparent", color: "#cbd5e1" }), // slate-300
                }}
                title="Thiết kế mặt trước áo"
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
                title="Thiết kế mặt sau áo"
              >
                Mặt sau
              </button>
            </div>

            {/* Chọn Màu (Chỉ hiển thị khi có màu) */}
            {availableColors.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 8,
                  background: "rgba(30, 41, 59, 0.7)", // bg-slate-800/70
                  backdropFilter: "blur(12px)",
                  padding: "6px 12px",
                  borderRadius: 9999,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {availableColors.map((colorHex) => {
                  const isActive = shirtColor.toLowerCase() === colorHex.toLowerCase();
                  return (
                    <button
                      key={colorHex}
                      onClick={() => setShirtColor(colorHex)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: colorHex,
                        border: isActive ? "2px solid #0ea5e9" : "2px solid transparent",
                        boxShadow: isActive ? "0 0 0 2px rgba(14, 165, 233, 0.3)" : "inset 0 1px 3px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      title={`Đổi màu áo`}
                    />
                  );
                })}
              </div>
            )}

            {/* Nút điều khiển zoom */}
            <div className="ds-zoom-controls">
              <button className="ds-zoom-btn" onClick={zoomOut} title="Thu nhỏ">−</button>
              <button className="ds-zoom-label" onClick={zoomReset} title="Reset về 100%">
                {Math.round((zoom / 1.75) * 100)}%
              </button>
              <button className="ds-zoom-btn" onClick={zoomIn} title="Phóng to">+</button>
            </div>
          </div>

          {/* Hiển thị phụ phí thiết kế theo thời gian thực, cập nhật mỗi khi elements thay đổi */}
          <div
            style={{
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
            }}
          >
            <span style={{ opacity: 0.65 }}>Phụ phí thiết kế:</span>
            <span
              style={{
                fontWeight: 700,
                color:
                  designFeeInfo.fee === 0
                    ? "#4ade80"
                    : designFeeInfo.fee === 40000
                    ? "#facc15"
                    : "#f87171",
              }}
            >
              {designFeeInfo.fee === 0 ? "Miễn phí" : `+${designFeeInfo.fee.toLocaleString("vi-VN")}đ`}
            </span>
            <span style={{ opacity: 0.45, fontSize: 11 }}>
              (Diện tích bao phủ: {designFeeInfo.areaCm2.toFixed(0)} cm²)
            </span>
          </div>

          {/* Gợi ý phím tắt */}
          <div className="ds-shortcut-hint">
            <span><kbd>Ctrl+Z</kbd> Hoàn tác</span>
            <span><kbd>Ctrl+S</kbd> Lưu</span>
            <span><kbd>Del</kbd> Xóa</span>
          </div>
        </div>

        {/* Cột bên phải: bảng lớp (layers) và bảng thuộc tính (properties) */}
        <div className="ds-right-rail">
          <LayersPanel />
          <PropertiesPanel />
        </div>
      </div>

      {/* Thanh công cụ nổi hiện khi chọn phần tử (đổi màu, cỡ chữ, xoay...) */}
      <FloatingToolbar
        shirtContainerRef={shirtContainerRef}
        zoom={zoom}
      />

      {/* Các modal / drawer */}
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

      <AddToCartModal
        open={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        productId={urlProductId ?? SHIRT_TO_PRODUCT_ID[shirtType] ?? 1}
        shirtColor={colorName || shirtColor}
        designId={currentDesignId ?? undefined}
        printImageFront={printImageFront}
        printImageBack={printImageBack}
        designFee={designFeeInfo.fee}
        designPreviewUrl={printImageFront ?? printImageBack}
      />

      <CartDrawer
        open={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />

      <div className={`ds-toast ${toast ? "ds-toast--visible" : ""}`}>{toast}</div>
    </div>
  );
}

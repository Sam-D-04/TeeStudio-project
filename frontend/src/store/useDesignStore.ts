"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

/* ────────────────────────────────────────────────────────────
 * Kiểu dữ liệu cho một phần tử trên canvas thiết kế (ảnh hoặc chữ)
 * ──────────────────────────────────────────────────────────── */
export interface DesignElement {
  id: string;
  type: "image" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked?: boolean;
  /**
   * Phần tử này thuộc mặt trước hay mặt sau của áo. Trước đây tất cả phần tử
   * dùng chung 1 mảng không phân biệt mặt, khiến thiết kế mặt trước bị "lẫn"
   * sang mặt sau (2 vùng in gần trùng nhau trên màn hình). Field này cho phép
   * lọc phần tử theo đúng mặt đang xem khi hiển thị/chụp ảnh in.
   *
   * Thiết kế cũ đã lưu trước khi có field này sẽ không có "side" trong dữ
   * liệu — mọi nơi đọc field này phải tự coi giá trị rỗng là "front" (dùng
   * `el.side ?? "front"`) để không làm mất nội dung thiết kế cũ.
   */
  side: "front" | "back";

  // Các thuộc tính chỉ dùng khi type === "image"
  src?: string;
  flipH?: boolean;
  flipV?: boolean;

  // Các thuộc tính chỉ dùng khi type === "text"
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  fontStyle?: "normal" | "bold" | "italic" | "bold italic";
  textDecoration?: "underline" | "linethrough" | "none";
  align?: "left" | "center" | "right";
  textTransform?: "uppercase" | "none";
  letterSpacing?: number;
  lineHeight?: number;
}

export type ShirtType = "tshirt" | "polo" | "hoodie";
export type ShirtView = "front" | "back";

/** Ảnh mockup của phôi áo đang thiết kế, tải từ DB theo màu/mặt (xem ShirtMockupImage.tsx). */
export interface MockupImage {
  colorHex: string;
  view: ShirtView;
  url: string;
}

export interface DesignState {
  /* Nội dung canvas */
  elements: DesignElement[];
  selectedId: string | null;

  /* Cấu hình áo đang thiết kế */
  shirtType: ShirtType;
  shirtColor: string;
  shirtView: ShirtView;
  availableColors: string[];
  /** Ảnh mockup của sản phẩm đang chọn (tải từ DB theo productId), dùng để hiển thị áo trên canvas. */
  mockupImages: MockupImage[];

  /* Trạng thái liên quan tới thiết kế đã lưu trong DB */
  currentDesignId: number | null;
  designName: string;
  /** Status (DRAFT/PENDING_REVIEW/NEEDS_REVISION/APPROVED) của thiết kế đang tải, nếu có. */
  currentDesignStatus: string | null;
  /** Ghi chú yêu cầu chỉnh sửa từ admin (nếu status = NEEDS_REVISION). */
  adminNote: string | null;

  /* Ngăn xếp Undo / Redo — mỗi phần tử là một bản snapshot của elements[] */
  undoStack: DesignElement[][];
  redoStack: DesignElement[][];

  /* Hành động thao tác với phần tử trên canvas */
  /** "side" KHÔNG cần truyền vào - store tự gắn theo shirtView đang xem lúc thêm. */
  addElement: (el: Omit<DesignElement, "id" | "side">) => void;
  updateElement: (id: string, attrs: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  duplicateElement: (id: string) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  moveElementToTop: (id: string) => void;
  moveElementToBottom: (id: string) => void;
  toggleLock: (id: string) => void;
  flipElement: (id: string, axis: "H" | "V") => void;

  /* Hành động thay đổi cấu hình áo */
  setShirtType: (t: ShirtType) => void;
  setShirtColor: (c: string) => void;
  setShirtView: (v: ShirtView) => void;
  setAvailableColors: (colors: string[]) => void;
  setMockupImages: (images: MockupImage[]) => void;

  /* Hành động cập nhật trạng thái lưu trữ (id/tên thiết kế) */
  setCurrentDesignId: (id: number | null) => void;
  setDesignName: (name: string) => void;
  setCurrentDesignStatus: (status: string | null) => void;
  setAdminNote: (note: string | null) => void;

  /* Hành động Undo / Redo */
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  /* Xoá toàn bộ thiết kế hiện tại, quay về trạng thái trống */
  clearDesign: () => void;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  elements: [],
  selectedId: null,
  currentDesignId: null,
  designName: "Thiết kế chưa đặt tên",
  currentDesignStatus: null,
  adminNote: null,

  shirtType: "tshirt",
  shirtColor: "#ffffff",
  shirtView: "front",
  availableColors: [],
  mockupImages: [],

  undoStack: [],
  redoStack: [],

  /* Lưu lại trạng thái elements hiện tại vào undoStack trước khi thực hiện
   * một thay đổi có thể cần hoàn tác (undo). Đồng thời xoá redoStack vì
   * lịch sử "redo" cũ không còn hợp lệ sau khi có thay đổi mới. */
  pushHistory: () => {
    const { elements, undoStack } = get();
    set({
      undoStack: [...undoStack, JSON.parse(JSON.stringify(elements))],
      redoStack: [],
    });
  },

  /* ───────────── Thao tác thêm/sửa/xoá phần tử ───────────── */

  addElement: (el) => {
    const state = get();
    state.pushHistory();
    // Gắn "side" theo mặt áo đang xem tại thời điểm thêm - đây là nơi DUY NHẤT
    // quyết định 1 phần tử mới thuộc mặt trước hay mặt sau.
    const newEl: DesignElement = { ...el, id: uuidv4(), side: state.shirtView };
    set({ elements: [...state.elements, newEl], selectedId: newEl.id });
  },

  // Cập nhật thuộc tính của phần tử (kéo/thả, đổi màu chữ, đổi cỡ...).
  // Không pushHistory ở đây vì hàm này được gọi liên tục khi kéo/resize,
  // việc lưu lịch sử được xử lý riêng ở nơi bắt đầu thao tác kéo/resize.
  updateElement: (id, attrs) => {
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === id ? { ...el, ...attrs } : el
      ),
    }));
  },

  removeElement: (id) => {
    const state = get();
    state.pushHistory();
    set({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    });
  },

  setSelectedId: (id) => set({ selectedId: id }),

  // Nhân bản phần tử đang chọn, đặt bản sao lệch 20px để dễ nhìn thấy
  duplicateElement: (id) => {
    const state = get();
    const el = state.elements.find((e) => e.id === id);
    if (!el) return;
    state.pushHistory();
    const dup: DesignElement = {
      ...el,
      id: uuidv4(),
      x: el.x + 20,
      y: el.y + 20,
    };
    set({ elements: [...state.elements, dup], selectedId: dup.id });
  },

  // Đưa phần tử lên trên 1 lớp.
  // LƯU Ý: "lớp trên" phải là phần tử TIẾP THEO CÙNG MẶT (front/back), không
  // phải phần tử liền kề tuyệt đối trong mảng - vì mảng "elements" chứa chung
  // phần tử của cả 2 mặt, phần tử của mặt kia có thể nằm xen giữa. Nếu chỉ
  // đổi chỗ với phần tử liền kề tuyệt đối, thứ tự lớp có thể vô tình hoán đổi
  // với 1 phần tử của mặt KHÁC (mặt đó không hề hiển thị cùng lúc nên việc
  // đổi thứ tự đó vô nghĩa và gây rối dữ liệu).
  moveElementUp: (id) => {
    const state = get();
    const idx = state.elements.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const side = state.elements[idx].side ?? "front";

    // Tìm phần tử tiếp theo (index lớn hơn) cùng mặt với phần tử đang xét
    let idxTiepTheoCungMat = -1;
    for (let i = idx + 1; i < state.elements.length; i++) {
      if ((state.elements[i].side ?? "front") === side) {
        idxTiepTheoCungMat = i;
        break;
      }
    }
    if (idxTiepTheoCungMat === -1) return; // đã ở lớp trên cùng của mặt này

    state.pushHistory();
    const arr = [...state.elements];
    [arr[idx], arr[idxTiepTheoCungMat]] = [arr[idxTiepTheoCungMat], arr[idx]];
    set({ elements: arr });
  },

  // Đưa phần tử xuống dưới 1 lớp - cùng nguyên tắc "chỉ so với phần tử cùng mặt"
  // như moveElementUp ở trên.
  moveElementDown: (id) => {
    const state = get();
    const idx = state.elements.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const side = state.elements[idx].side ?? "front";

    // Tìm phần tử phía trước (index nhỏ hơn) cùng mặt với phần tử đang xét
    let idxTruocDoCungMat = -1;
    for (let i = idx - 1; i >= 0; i--) {
      if ((state.elements[i].side ?? "front") === side) {
        idxTruocDoCungMat = i;
        break;
      }
    }
    if (idxTruocDoCungMat === -1) return; // đã ở lớp dưới cùng của mặt này

    state.pushHistory();
    const arr = [...state.elements];
    [arr[idx], arr[idxTruocDoCungMat]] = [arr[idxTruocDoCungMat], arr[idx]];
    set({ elements: arr });
  },

  // Đưa phần tử lên lớp trên cùng của mặt đang xem
  moveElementToTop: (id) => {
    const state = get();
    const idx = state.elements.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const side = state.elements[idx].side ?? "front";
    const el = state.elements[idx];
    state.pushHistory();
    const arr = state.elements.filter((e) => e.id !== id);
    // Tìm index cao nhất của cùng mặt trong arr
    let insertAt = arr.length;
    for (let i = arr.length - 1; i >= 0; i--) {
      if ((arr[i].side ?? "front") === side) { insertAt = i + 1; break; }
    }
    arr.splice(insertAt, 0, el);
    set({ elements: arr });
  },

  // Đưa phần tử xuống lớp dưới cùng của mặt đang xem
  moveElementToBottom: (id) => {
    const state = get();
    const idx = state.elements.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const side = state.elements[idx].side ?? "front";
    const el = state.elements[idx];
    state.pushHistory();
    const arr = state.elements.filter((e) => e.id !== id);
    // Tìm index thấp nhất của cùng mặt trong arr
    let insertAt = 0;
    for (let i = 0; i < arr.length; i++) {
      if ((arr[i].side ?? "front") === side) { insertAt = i; break; }
    }
    arr.splice(insertAt, 0, el);
    set({ elements: arr });
  },

  toggleLock: (id) => {
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ),
    }));
  },

  // Lật ngang hoặc dọc phần tử (áp dụng cả cho image và text)
  flipElement: (id, axis) => {
    const state = get();
    const el = state.elements.find((e) => e.id === id);
    if (!el || el.locked) return;
    state.pushHistory();
    if (axis === "H") {
      state.updateElement(id, { flipH: !(el.flipH ?? false) });
    } else {
      state.updateElement(id, { flipV: !(el.flipV ?? false) });
    }
  },

  /* ───────────── Cấu hình áo (loại áo / màu áo / mặt trước-sau) ───────────── */

  setShirtType: (t) => set({ shirtType: t }),
  setShirtColor: (c) => set({ shirtColor: c }),
  setAvailableColors: (colors) => set({ availableColors: colors }),
  setMockupImages: (images) => set({ mockupImages: images }),

  // Đổi mặt áo (trước/sau) cũng cần lưu lịch sử vì layout các phần tử
  // in trên mỗi mặt là độc lập với nhau.
  // Đồng thời BỎ CHỌN phần tử đang chọn (selectedId: null) - vì phần tử đó
  // (nếu có) chỉ thuộc 1 trong 2 mặt, khi đổi sang mặt kia phần tử đó không
  // còn hiển thị nữa nên không thể giữ trạng thái "đang chọn" nó được.
  setShirtView: (v) => {
    get().pushHistory();
    set({ shirtView: v, selectedId: null });
  },

  setCurrentDesignId: (id) => set({ currentDesignId: id }),
  setDesignName: (name) => set({ designName: name }),
  setCurrentDesignStatus: (status) => set({ currentDesignStatus: status }),
  setAdminNote: (note) => set({ adminNote: note }),

  /* ──────────────────────────────────────────────────────────── */

  undo: () => {
    const { undoStack, elements } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, JSON.parse(JSON.stringify(elements))],
      elements: prev,
      selectedId: null,
    });
  },

  redo: () => {
    const { redoStack, elements } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, JSON.parse(JSON.stringify(elements))],
      elements: next,
      selectedId: null,
    });
  },

  /* ───────────── Xoá thiết kế hiện tại ───────────── */

  clearDesign: () => {
    const state = get();
    state.pushHistory();
    set({
      elements: [],
      selectedId: null,
      currentDesignId: null,
      designName: "Thiết kế chưa đặt tên",
      currentDesignStatus: null,
    });
  },
}));

/**
 * Selector lọc phần tử theo mặt áo.
 * Mặc định phần tử cũ (không có side) được coi là mặt trước ("front").
 */
export const selectElementsBySide = (elements: DesignElement[], side: ShirtView) => {
  return elements.filter((el) => (el.side ?? "front") === side);
};

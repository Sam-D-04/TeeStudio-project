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

export interface DesignState {
  /* Nội dung canvas */
  elements: DesignElement[];
  selectedId: string | null;

  /* Cấu hình áo đang thiết kế */
  shirtType: ShirtType;
  shirtColor: string;
  shirtView: ShirtView;

  /* Trạng thái liên quan tới thiết kế đã lưu trong DB */
  currentDesignId: number | null;
  designName: string;

  /* Ngăn xếp Undo / Redo — mỗi phần tử là một bản snapshot của elements[] */
  undoStack: DesignElement[][];
  redoStack: DesignElement[][];

  /* Hành động thao tác với phần tử trên canvas */
  addElement: (el: Omit<DesignElement, "id">) => void;
  updateElement: (id: string, attrs: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  duplicateElement: (id: string) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  toggleLock: (id: string) => void;

  /* Hành động thay đổi cấu hình áo */
  setShirtType: (t: ShirtType) => void;
  setShirtColor: (c: string) => void;
  setShirtView: (v: ShirtView) => void;

  /* Hành động cập nhật trạng thái lưu trữ (id/tên thiết kế) */
  setCurrentDesignId: (id: number | null) => void;
  setDesignName: (name: string) => void;

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

  shirtType: "tshirt",
  shirtColor: "#ffffff",
  shirtView: "front",

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
    const newEl: DesignElement = { ...el, id: uuidv4() };
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

  // Đưa phần tử lên trên 1 lớp (đổi vị trí với phần tử liền sau trong mảng)
  moveElementUp: (id) => {
    const state = get();
    const idx = state.elements.findIndex((e) => e.id === id);
    if (idx < 0 || idx >= state.elements.length - 1) return;
    state.pushHistory();
    const arr = [...state.elements];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    set({ elements: arr });
  },

  // Đưa phần tử xuống dưới 1 lớp (đổi vị trí với phần tử liền trước trong mảng)
  moveElementDown: (id) => {
    const state = get();
    const idx = state.elements.findIndex((e) => e.id === id);
    if (idx <= 0) return;
    state.pushHistory();
    const arr = [...state.elements];
    [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
    set({ elements: arr });
  },

  toggleLock: (id) => {
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ),
    }));
  },

  /* ───────────── Cấu hình áo (loại áo / màu áo / mặt trước-sau) ───────────── */

  setShirtType: (t) => set({ shirtType: t }),
  setShirtColor: (c) => set({ shirtColor: c }),

  // Đổi mặt áo (trước/sau) cũng cần lưu lịch sử vì layout các phần tử
  // in trên mỗi mặt là độc lập với nhau.
  setShirtView: (v) => {
    get().pushHistory();
    set({ shirtView: v });
  },

  setCurrentDesignId: (id) => set({ currentDesignId: id }),
  setDesignName: (name) => set({ designName: name }),

  /* ───────────── Undo / Redo ───────────── */

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
    });
  },
}));

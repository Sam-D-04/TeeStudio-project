"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

/* ── Element types ──────────────────────────────────── */
export interface DesignElement {
  id: string;
  type: "image" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked?: boolean;
  // image-specific
  src?: string;
  // text-specific
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
  /* Canvas content */
  elements: DesignElement[];
  selectedId: string | null;

  /* Shirt config */
  shirtType: ShirtType;
  shirtColor: string;
  shirtView: ShirtView;

  /* Current DB state */
  currentDesignId: number | null;

  /* Undo / Redo stacks (snapshot of elements[]) */
  undoStack: DesignElement[][];
  redoStack: DesignElement[][];

  /* Actions ─ elements */
  addElement: (el: Omit<DesignElement, "id">) => void;
  updateElement: (id: string, attrs: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  duplicateElement: (id: string) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  toggleLock: (id: string) => void;

  /* Actions ─ shirt */
  setShirtType: (t: ShirtType) => void;
  setShirtColor: (c: string) => void;
  setShirtView: (v: ShirtView) => void;
  
  /* Actions - persistence state */
  setCurrentDesignId: (id: number | null) => void;

  /* Actions ─ history */
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  /* Actions ─ persistence */
  saveToLocal: () => void;
  loadFromLocal: () => void;
  clearDesign: () => void;
  exportDesignJSON: () => string;
}

const STORAGE_KEY = "teestudio_design";

export const useDesignStore = create<DesignState>((set, get) => ({
  elements: [],
  selectedId: null,
  currentDesignId: null,

  shirtType: "tshirt",
  shirtColor: "#ffffff",
  shirtView: "front",

  undoStack: [],
  redoStack: [],

  /* ── Push current state to history (before any mutation) ── */
  pushHistory: () => {
    const { elements, undoStack } = get();
    set({
      undoStack: [...undoStack, JSON.parse(JSON.stringify(elements))],
      redoStack: [],
    });
  },

  /* ── Element CRUD ── */
  addElement: (el) => {
    const state = get();
    state.pushHistory();
    const newEl: DesignElement = { ...el, id: uuidv4() };
    set({ elements: [...state.elements, newEl], selectedId: newEl.id });
  },

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

  moveElementUp: (id) => {
    const state = get();
    const idx = state.elements.findIndex((e) => e.id === id);
    if (idx < 0 || idx >= state.elements.length - 1) return;
    state.pushHistory();
    const arr = [...state.elements];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    set({ elements: arr });
  },

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

  /* ── Shirt config ── */
  setShirtType: (t) => set({ shirtType: t }),
  setShirtColor: (c) => set({ shirtColor: c }),
  setShirtView: (v) => {
    get().pushHistory();
    set({ shirtView: v });
  },

  setCurrentDesignId: (id) => set({ currentDesignId: id }),

  /* ─── Undo / Redo ─── */
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

  /* ── Persistence ── */
  saveToLocal: () => {
    const { elements, shirtType, shirtColor, shirtView, currentDesignId } = get();
    const data = { elements, shirtType, shirtColor, shirtView, currentDesignId, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadFromLocal: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      set({
        elements: data.elements || [],
        shirtType: data.shirtType || "tshirt",
        shirtColor: data.shirtColor || "#ffffff",
        shirtView: data.shirtView || "front",
        currentDesignId: data.currentDesignId || null,
        selectedId: null,
        undoStack: [],
        redoStack: [],
      });
    } catch {
      /* ignore corrupt data */
    }
  },

  clearDesign: () => {
    const state = get();
    state.pushHistory();
    set({ elements: [], selectedId: null, currentDesignId: null });
  },

  exportDesignJSON: () => {
    const { elements, shirtType, shirtColor, shirtView } = get();
    return JSON.stringify({ elements, shirtType, shirtColor, shirtView }, null, 2);
  },
}));

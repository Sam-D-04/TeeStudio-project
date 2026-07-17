"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItemFromAPI } from "@/services/cartService";

/* ── Types ──────────────────────────────────── */
export interface CartItem {
  cartItemId: string;
  /** DB id của CartItem (null nếu chưa sync với backend) */
  dbId?: number;
  productId: number;
  /** DB ID của ProductVariant – required cho backend order API */
  variantId: number;
  name: string;
  image: string;
  size: string;
  color: string;
  colorLabel: string;
  price: number;
  quantity: number;
  /** ID của CustomDesign (nếu là sản phẩm có thiết kế riêng) */
  designId?: number;
  /**
   * Ảnh in print-ready (base64 PNG nền trong suốt) export từ canvas Design Studio.
   * KHÔNG được persist xuống localStorage (xem `partialize`) vì base64 rất nặng —
   * chỉ sống in-memory theo phiên để gửi kèm khi tạo đơn.
   */
  printImage?: string;
}

export interface CartState {
  items: CartItem[];

  totalItems: () => number;
  totalPrice: () => number;

  addItem: (item: Omit<CartItem, "cartItemId">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  /** Load items từ backend response (sau khi sync hoặc login) */
  loadFromBackend: (apiItems: CartItemFromAPI[]) => void;

  /** Chuyển items hiện tại sang format để gửi sync API */
  toSyncPayload: () => Array<{ variantId: number; quantity: number; designId?: number }>;
}

function buildCartItemId(variantId: number, designId?: number): string {
  // Có thiết kế riêng → tách thành dòng giỏ hàng riêng để không gộp nhầm
  // hai thiết kế khác nhau trên cùng một biến thể.
  return designId
    ? `variant_${variantId}_design_${designId}`
    : `variant_${variantId}`;
}

function apiItemToCartItem(item: CartItemFromAPI): CartItem {
  return {
    cartItemId: buildCartItemId(item.variantId, item.designId ?? undefined),
    dbId: item.id,
    productId: item.productId,
    variantId: item.variantId,
    name: item.productName,
    image: item.image ?? "",
    size: item.size,
    color: item.color,
    colorLabel: item.color,
    price: item.price,
    quantity: item.quantity,
    designId: item.designId ?? undefined,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),

      addItem: (item) => {
        const id = buildCartItemId(item.variantId, item.designId);
        set((s) => {
          const existing = s.items.find((i) => i.cartItemId === id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.cartItemId === id
                  ? {
                      ...i,
                      quantity: i.quantity + item.quantity,
                      // Giữ ảnh in mới nhất (nếu lần thêm này có kèm)
                      printImage: item.printImage ?? i.printImage,
                    }
                  : i
              ),
            };
          }
          return { items: [...s.items, { ...item, cartItemId: id }] };
        });
      },

      removeItem: (cartItemId) =>
        set((s) => ({
          items: s.items.filter((i) => i.cartItemId !== cartItemId),
        })),

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      loadFromBackend: (apiItems) => {
        set({ items: apiItems.map(apiItemToCartItem) });
      },

      toSyncPayload: () =>
        get().items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          designId: i.designId,
        })),
    }),
    {
      name: "teestudio_cart",
      // Không lưu `printImage` (base64 rất nặng, dễ vượt quota localStorage ~5MB).
      // Ảnh in chỉ cần sống in-memory theo phiên để gửi kèm lúc tạo đơn.
      // `image` cũng có thể tạm thời là base64 (khi vừa thêm 1 thiết kế chưa lưu từ
      // Design Studio) — không persist phần này, để tránh vượt quota tương tự;
      // ảnh sẽ được khôi phục về URL Cloudinary thật khi giỏ hàng đồng bộ với backend.
      partialize: (state) => ({
        ...state,
        items: state.items.map((i) => ({
          ...i,
          image: i.image?.startsWith("data:") ? "" : i.image,
          printImage: undefined,
        })),
      }),
    }
  )
);

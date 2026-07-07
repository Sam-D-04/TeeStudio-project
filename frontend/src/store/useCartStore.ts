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
  toSyncPayload: () => Array<{ variantId: number; quantity: number }>;
}

function buildCartItemId(variantId: number): string {
  return `variant_${variantId}`;
}

function apiItemToCartItem(item: CartItemFromAPI): CartItem {
  return {
    cartItemId: buildCartItemId(item.variantId),
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
        const id = buildCartItemId(item.variantId);
        set((s) => {
          const existing = s.items.find((i) => i.cartItemId === id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.cartItemId === id
                  ? { ...i, quantity: i.quantity + item.quantity }
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
        get().items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    }),
    {
      name: "teestudio_cart",
    }
  )
);

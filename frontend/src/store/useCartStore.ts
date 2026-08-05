"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { message } from "antd";
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
  /** Số lượng còn lại trong kho của biến thể sản phẩm */
  stockQty?: number;
  /** ID của CustomDesign (nếu là sản phẩm có thiết kế riêng) */
  designId?: number;
  /** Phụ phí thiết kế nếu có (ví dụ: in 1 mặt, 2 mặt) */
  designFee?: number;
  /**
   * Ảnh in print-ready (base64 PNG nền trong suốt) export từ canvas Design Studio -
   * tối đa 2 ảnh (mặt trước/sau), mặt nào khách không thiết kế thì undefined.
   * KHÔNG được persist xuống localStorage (xem `partialize`) vì base64 rất nặng —
   * chỉ sống in-memory theo phiên để gửi kèm khi tạo đơn.
   */
  printImageFront?: string;
  printImageBack?: string;
  bulkPricing?: { minQty: number; discountPercent: number }[];
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
    designFee: item.designFee ?? 0,
    quantity: item.quantity,
    stockQty: item.stockQty,
    designId: item.designId ?? undefined,
    bulkPricing: typeof item.bulkPricing === 'string' ? JSON.parse(item.bulkPricing) : item.bulkPricing,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      totalPrice: () => {
        const items = get().items;
        const qtyByProductId: Record<number, number> = {};
        items.forEach((i) => {
          qtyByProductId[i.productId] = (qtyByProductId[i.productId] || 0) + i.quantity;
        });

        return items.reduce((acc, i) => {
          const totalQty = qtyByProductId[i.productId] || i.quantity;
          const baseItemPrice = i.price + (i.designFee || 0);
          let unitPrice = baseItemPrice;
          
          if (i.bulkPricing && i.bulkPricing.length > 0) {
            // Sắp xếp các mốc giảm giá theo số lượng giảm dần
            const matched = [...i.bulkPricing]
              .sort((a, b) => b.minQty - a.minQty)
              .find((bp) => totalQty >= bp.minQty);
              
            if (matched) {
              unitPrice = Math.round(baseItemPrice * (1 - matched.discountPercent / 100));
            }
          }
          
          return acc + unitPrice * i.quantity;
        }, 0);
      },

      addItem: (item) => {
        const id = buildCartItemId(item.variantId, item.designId);
        set((s) => {
          const existing = s.items.find((i) => i.cartItemId === id);
          if (existing) {
            const maxStock = item.stockQty ?? existing.stockQty;
            let targetQty = existing.quantity + item.quantity;
            if (maxStock !== undefined && targetQty > maxStock) {
              targetQty = maxStock;
              if (typeof window !== "undefined") {
                message.warning(`Sản phẩm trong kho chỉ còn ${maxStock} sản phẩm, không thể thêm nữa`);
              }
            }
            return {
              items: s.items.map((i) =>
                i.cartItemId === id
                  ? {
                      ...i,
                      quantity: targetQty,
                      stockQty: maxStock,
                      // Giữ ảnh in mới nhất (nếu lần thêm này có kèm)
                      printImageFront: item.printImageFront ?? i.printImageFront,
                      printImageBack: item.printImageBack ?? i.printImageBack,
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
        const existing = get().items.find((i) => i.cartItemId === cartItemId);
        if (existing && existing.stockQty !== undefined && quantity > existing.stockQty) {
          if (typeof window !== "undefined") {
            message.warning(
              existing.stockQty === 1
                ? "Sản phẩm trong kho chỉ còn 1 sản phẩm, không thể tăng thêm"
                : `Sản phẩm trong kho chỉ còn ${existing.stockQty} sản phẩm, không thể tăng thêm`
            );
          }
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
        // Giữ lại printImageFront/Back đang có trong bộ nhớ (nếu khách vừa thêm từ
        // Design Studio) - apiItemToCartItem không có 2 field này vì Cart lưu trên
        // backend không có cột base64. Không merge thì mỗi lần đăng nhập/đăng ký
        // (LoginForm, AuthModal) gọi loadFromBackend sẽ xoá mất ảnh in vừa chụp,
        // trước khi kịp gửi kèm lúc tạo đơn.
        set((s) => ({
          items: apiItems.map((apiItem) => {
            const cartItem = apiItemToCartItem(apiItem);
            const existing = s.items.find((i) => i.cartItemId === cartItem.cartItemId);
            return {
              ...cartItem,
              printImageFront: existing?.printImageFront ?? cartItem.printImageFront,
              printImageBack: existing?.printImageBack ?? cartItem.printImageBack,
            };
          }),
        }));
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
      // Không lưu `printImageFront`/`printImageBack` (base64 rất nặng, dễ vượt quota
      // localStorage ~5MB). Ảnh in chỉ cần sống in-memory theo phiên để gửi kèm lúc
      // tạo đơn. `image` cũng có thể tạm thời là base64 (khi vừa thêm 1 thiết kế chưa
      // lưu từ Design Studio) — không persist phần này, để tránh vượt quota tương tự;
      // ảnh sẽ được khôi phục về URL Cloudinary thật khi giỏ hàng đồng bộ với backend.
      partialize: (state) => ({
        ...state,
        items: state.items.map((i) => ({
          ...i,
          image: i.image?.startsWith("data:") ? "" : i.image,
          printImageFront: undefined,
          printImageBack: undefined,
        })),
      }),
    }
  )
);

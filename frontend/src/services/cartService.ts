import apiClient from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

export interface CartItemFromAPI {
  id: number;
  variantId: number;
  designId: number | null;
  quantity: number;
  color: string;
  size: string;
  stockQty?: number;
  productId: number;
  productName: string;
  price: number;
  designFee?: number;
  image: string | null;
}

/*
 * Dùng apiClient (axios): tự gắn access token mới nhất + tự refresh khi 401.
 * Tham số `token` giữ lại cho tương thích chỗ gọi cũ, không cần dùng
 * (auth do interceptor xử lý).
 */

export async function getCart(_token?: string): Promise<CartItemFromAPI[]> {
  try {
    const res = await apiClient.get("/cart");
    return (res.data.data?.items ?? []) as CartItemFromAPI[];
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Lỗi giỏ hàng"));
  }
}

export async function addToCart(
  _token: string | undefined,
  variantId: number,
  quantity: number,
  designId?: number
): Promise<{ id: number; quantity: number }> {
  try {
    const res = await apiClient.post("/cart/items", { variantId, quantity, designId });
    return res.data.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Lỗi giỏ hàng"));
  }
}

export async function updateCartItem(
  _token: string | undefined,
  cartItemId: number,
  quantity: number
): Promise<void> {
  try {
    await apiClient.put(`/cart/items/${cartItemId}`, { quantity });
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Lỗi giỏ hàng"));
  }
}

export async function removeCartItem(_token: string | undefined, cartItemId: number): Promise<void> {
  try {
    await apiClient.delete(`/cart/items/${cartItemId}`);
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Lỗi giỏ hàng"));
  }
}

export async function clearCartAPI(_token?: string): Promise<void> {
  try {
    await apiClient.delete("/cart");
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Lỗi giỏ hàng"));
  }
}

export interface SyncItem {
  variantId: number;
  quantity: number;
  designId?: number;
}

export async function syncCart(_token: string | undefined, items: SyncItem[]): Promise<CartItemFromAPI[]> {
  try {
    const res = await apiClient.post("/cart/sync", { items });
    return (res.data.data?.items ?? []) as CartItemFromAPI[];
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Lỗi giỏ hàng"));
  }
}

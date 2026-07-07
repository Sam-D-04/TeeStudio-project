const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface CartItemFromAPI {
  id: number;
  variantId: number;
  designId: number | null;
  quantity: number;
  color: string;
  size: string;
  productId: number;
  productName: string;
  price: number;
  image: string | null;
}

async function authFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Lỗi giỏ hàng");
  }
  return res.json();
}

export async function getCart(token: string): Promise<CartItemFromAPI[]> {
  const json = await authFetch("/cart", token);
  return (json.data?.items ?? []) as CartItemFromAPI[];
}

export async function addToCart(
  token: string,
  variantId: number,
  quantity: number,
  designId?: number
): Promise<{ id: number; quantity: number }> {
  const json = await authFetch("/cart/items", token, {
    method: "POST",
    body: JSON.stringify({ variantId, quantity, designId }),
  });
  return json.data;
}

export async function updateCartItem(
  token: string,
  cartItemId: number,
  quantity: number
): Promise<void> {
  await authFetch(`/cart/items/${cartItemId}`, token, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(token: string, cartItemId: number): Promise<void> {
  await authFetch(`/cart/items/${cartItemId}`, token, { method: "DELETE" });
}

export async function clearCartAPI(token: string): Promise<void> {
  await authFetch("/cart", token, { method: "DELETE" });
}

export interface SyncItem {
  variantId: number;
  quantity: number;
  designId?: number;
}

export async function syncCart(token: string, items: SyncItem[]): Promise<CartItemFromAPI[]> {
  const json = await authFetch("/cart/sync", token, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
  return (json.data?.items ?? []) as CartItemFromAPI[];
}

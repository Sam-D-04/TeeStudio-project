const API_URL = process.env.NEXT_PUBLIC_API_URL + "/users/me/designs";

export interface SavedDesign {
  id: number;
  name: string;
  productId: number;
  baseColor: string;
  canvasData: any;
  previewUrl: string;
  status: string;
  updatedAt: string;
}

export const userDesignService = {
  getMyDesigns: async (token: string): Promise<SavedDesign[]> => {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Lỗi khi tải danh sách thiết kế");
    const json = await res.json();
    return json.data;
  },

  createDesign: async (token: string, payload: any): Promise<SavedDesign> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Lỗi khi lưu thiết kế");
    }
    const json = await res.json();
    return json.data;
  },

  updateDesign: async (token: string, id: number, payload: any): Promise<SavedDesign> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Lỗi khi cập nhật thiết kế");
    }
    const json = await res.json();
    return json.data;
  },

  deleteDesign: async (token: string, id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Lỗi khi xoá thiết kế");
  }
};

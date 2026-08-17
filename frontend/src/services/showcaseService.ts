import apiClient from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

export interface ShowcaseDesign {
  id: number;
  name: string;
  baseColor: string;
  previewUrl: string;
}

export interface ShowcaseDesignDetail extends ShowcaseDesign {
  canvasData: any;
}

const BASE = "/public/showcase-designs";

export const showcaseService = {
  /** Lấy danh sách thiết kế mẫu (gallery trang chủ). Không cần auth. */
  getShowcaseDesigns: async (): Promise<ShowcaseDesign[]> => {
    try {
      const res = await apiClient.get(BASE);
      return res.data.data ?? [];
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Lỗi khi tải thiết kế mẫu"));
    }
  },

  /** Lấy canvasData của 1 thiết kế mẫu để load vào Design Studio. Không cần auth. */
  getShowcaseDesignById: async (id: number): Promise<ShowcaseDesignDetail> => {
    try {
      const res = await apiClient.get(`${BASE}/${id}`);
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Lỗi khi tải thiết kế mẫu"));
    }
  },
};

import apiClient from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import type { DesignElement, ShirtType, ShirtView } from "@/store/useDesignStore";

const BASE = "/design-studio/ai-assist";

export interface PrintAreaInput {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Phần tử do AI trả về — thiếu `id` (client tự gán khi áp vào canvas). */
export type AiDesignElement = Omit<DesignElement, "id">;

interface GenerateParams {
  shirtType: ShirtType;
  shirtView: ShirtView;
  shirtColor: string;
  printArea: PrintAreaInput;
  /** Mô tả của khách hàng muốn thiết kế gì — có thể để trống để AI tự sáng tạo. */
  prompt?: string;
}

interface ArrangeParams {
  shirtType: ShirtType;
  shirtView: ShirtView;
  shirtColor: string;
  printArea: PrintAreaInput;
  elements: DesignElement[];
}

/*
 * Gọi AI thật (Gemini, qua backend) — timeout dài hơn mặc định vì LLM cần vài giây suy luận.
 * KHÔNG fallback khi lỗi: ném lỗi rõ ràng để UI hiển thị cho người dùng biết,
 * thay vì âm thầm trả về kết quả giả/hardcode.
 */
const AI_TIMEOUT_MS = 45000;

export const aiDesignService = {
  /** Sinh thiết kế mới (câu chữ/hình ảnh + bố cục) bằng AI thật. */
  generate: async (params: GenerateParams): Promise<AiDesignElement[]> => {
    try {
      const res = await apiClient.post(`${BASE}/generate`, params, { timeout: AI_TIMEOUT_MS });
      return res.data.data.elements as AiDesignElement[];
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "AI không sinh được thiết kế. Vui lòng thử lại."));
    }
  },

  /** Tự sắp xếp lại các phần tử chữ đang có bằng AI thật. */
  arrange: async (params: ArrangeParams): Promise<AiDesignElement[]> => {
    try {
      const res = await apiClient.post(`${BASE}/arrange`, params, { timeout: AI_TIMEOUT_MS });
      return res.data.data.elements as AiDesignElement[];
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "AI không sắp xếp được bố cục. Vui lòng thử lại."));
    }
  },
};

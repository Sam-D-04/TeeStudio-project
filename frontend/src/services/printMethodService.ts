import apiClient from "@/lib/apiClient";
import type { PrintMethodDef } from "@/utils/designFeeCalculator";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

export const printMethodService = {
  getPrintMethods: async (): Promise<PrintMethodDef[]> => {
    try {
      const res = await apiClient.get("/print-methods");
      // Mảng trả về từ API có dạng: { id, code, ten, phiInThem }
      return res.data.data.map((item: any) => ({
        id: item.id,
        code: item.code,
        name: item.ten,
        extraCost: item.phiInThem,
      }));
    } catch (err) {
      console.error(getApiErrorMessage(err, "Lỗi khi tải phương pháp in"));
      return [];
    }
  },
};

/**
 * apiClient.ts – Axios instance dùng chung cho toàn bộ Admin.
 *
 * Chức năng:
 * - Tự động thêm header: Authorization: Bearer <token>
 * - Đọc token từ localStorage (key: "access_token")
 * - Tự động xử lý lỗi 401 (chưa đăng nhập) và 403 (không đủ quyền)
 *
 * Cách dùng:
 *   import apiClient from "@/lib/apiClient";
 *   const res = await apiClient.get("/admin/orders");
 */

import axios from "axios";

// URL gốc của backend (đọc từ biến môi trường Next.js, fallback về localhost)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Timeout 15 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Interceptor gửi request: tự động thêm token vào header ----
apiClient.interceptors.request.use(
  (config) => {
    // Đọc access token từ localStorage
    // (Sau khi module Auth hoàn thành, token sẽ được lưu vào đây khi đăng nhập)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Interceptor nhận response: xử lý lỗi chung ----
apiClient.interceptors.response.use(
  // Trường hợp thành công: trả về nguyên response
  (response) => response,

  // Trường hợp lỗi
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token hết hạn hoặc không hợp lệ → xóa token, chuyển về trang đăng nhập
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        // TODO: Thêm redirect về /admin/dang-nhap khi Auth được triển khai
        // window.location.href = "/admin/dang-nhap";
      }
    }

    // Ném lỗi để caller tự xử lý (React Query sẽ bắt và đưa vào isError)
    return Promise.reject(error);
  }
);

export default apiClient;

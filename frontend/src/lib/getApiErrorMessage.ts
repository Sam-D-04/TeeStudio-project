import axios from "axios";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Đã có lỗi xảy ra. Vui lòng thử lại.",
) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};

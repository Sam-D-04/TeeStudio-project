import apiClient from "@/lib/apiClient";
import axios from "axios";

type ReportParams = Record<string, string | number | undefined>;

function layTenTep(contentDisposition: string | undefined, fallback: string) {
  const utf8Match = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return fallback;
    }
  }

  return contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] || fallback;
}

export async function downloadExcelReport(
  url: string,
  params: ReportParams,
  fallbackFileName: string
): Promise<string> {
  let response;
  try {
    response = await apiClient.get<Blob>(url, {
      params,
      responseType: "blob",
      timeout: 60_000,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      const payload = await error.response.data.text();
      try {
        const parsed = JSON.parse(payload) as { message?: string };
        throw new Error(parsed.message || "Không thể xuất báo cáo.");
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new Error("Không thể xuất báo cáo.");
        }
        throw parseError;
      }
    }
    throw error;
  }
  const fileName = layTenTep(
    response.headers["content-disposition"],
    fallbackFileName
  );
  const downloadUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);

  return fileName;
}

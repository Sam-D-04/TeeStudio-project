/**
 * backgroundRemoval.ts — Tách nền ảnh chạy 100% trong trình duyệt bằng
 * @imgly/background-removal (WASM/WebGPU). Không gọi API ngoài, không cần key.
 * Model (~vài chục MB) được tải & cache ở lần dùng đầu tiên.
 *
 * Import động để không nhét thư viện nặng vào bundle chính của trang.
 */

export interface BgRemovalProgress {
  /** Mô tả bước hiện tại (tải model / suy luận...) */
  stage: string;
  /** Tiến độ 0..1 */
  fraction: number;
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Không đọc được ảnh sau khi tách nền"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Tách nền một ảnh, trả về data URL PNG nền trong suốt (bền vững để lưu vào canvasData,
 * khác blob: URL sẽ mất khi tải lại trang).
 */
export async function removeImageBackground(
  src: string,
  onProgress?: (p: BgRemovalProgress) => void
): Promise<string> {
  const { removeBackground } = await import("@imgly/background-removal");
  const blob = await removeBackground(src, {
    model: "isnet_fp16", // cân bằng chất lượng / kích thước tải
    output: { format: "image/png" },
    progress: (key: string, current: number, total: number) => {
      onProgress?.({ stage: key, fraction: total > 0 ? current / total : 0 });
    },
  });
  return blobToDataURL(blob);
}

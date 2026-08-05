import { get, set } from 'idb-keyval';

const UPLOADED_IMAGES_KEY = 'teestudio_uploaded_images';
const MAX_IMAGES = 20; // Giữ tối đa 20 ảnh gần nhất để tránh đầy bộ nhớ

/**
 * Lưu danh sách ảnh đã upload (mảng base64 strings) vào IndexedDB
 */
export async function saveUploadedImages(images: string[]): Promise<void> {
  try {
    // Chỉ giữ lại tối đa MAX_IMAGES ảnh gần nhất (cắt bớt ảnh cũ ở đầu mảng nếu vượt quá)
    const imagesToSave = images.length > MAX_IMAGES 
      ? images.slice(images.length - MAX_IMAGES) 
      : images;
    await set(UPLOADED_IMAGES_KEY, imagesToSave);
  } catch (err) {
    console.error("Lỗi khi lưu ảnh vào IndexedDB:", err);
  }
}

/**
 * Lấy danh sách ảnh đã upload từ IndexedDB
 */
export async function getUploadedImages(): Promise<string[]> {
  try {
    const images = await get<string[]>(UPLOADED_IMAGES_KEY);
    return images || [];
  } catch (err) {
    console.error("Lỗi khi đọc ảnh từ IndexedDB:", err);
    return [];
  }
}

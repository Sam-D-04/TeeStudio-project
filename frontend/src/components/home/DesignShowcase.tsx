/**
 * DesignShowcase.tsx — Server Component
 * Fetch danh sách thiết kế mẫu từ account admin và truyền sang Client Component.
 * Nếu admin chưa có thiết kế nào → ẩn hoàn toàn section (return null).
 */

import DesignShowcaseClient from "./DesignShowcaseClient";

export interface ShowcaseDesignItem {
  id: number;
  name: string;
  baseColor: string;
  previewUrl: string;
}

async function getShowcaseDesigns(): Promise<ShowcaseDesignItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/public/showcase-designs`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function DesignShowcase() {
  const designs = await getShowcaseDesigns();
  if (designs.length === 0) return null;
  return <DesignShowcaseClient designs={designs} />;
}

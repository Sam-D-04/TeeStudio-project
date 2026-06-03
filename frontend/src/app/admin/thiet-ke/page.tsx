import type { Metadata } from "next";
import DesignClient from "@/components/admin/designs/DesignClient";

/**
 * Metadata SEO cho trang Thiết kế & In ấn.
 * Được Next.js tự động đặt vào thẻ <title> và <meta name="description">.
 */
export const metadata: Metadata = {
  title: "Thiết kế & In ấn - TeeStudio Quản trị",
  description:
    "Quản lý thiết kế khách hàng, xét duyệt bản in, gửi đơn đến xưởng và cấu hình tài nguyên thiết kế tại TeeStudio.",
};

/**
 * ThietKePage – Server Component (mặc định trong Next.js App Router).
 *
 * File này chỉ khai báo metadata và render DesignClient.
 * Toàn bộ logic tương tác (state, event) nằm trong DesignClient và DesignPage.
 */
export default function ThietKePage() {
  return <DesignClient />;
}

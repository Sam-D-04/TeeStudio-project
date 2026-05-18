import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "TeeStudio – Thiết kế áo & Đặt đồng phục số lượng lớn",
  description:
    "TeeStudio – Tự thiết kế áo in theo ý tưởng của bạn hoặc đặt đồng phục số lượng lớn. Giá sỉ bậc thang, giao hàng nhanh, chất lượng cao.",
};

const antdTheme = {
  token: {
    colorPrimary:    "#0ea5e9",
    colorLink:       "#0ea5e9",
    borderRadius:    8,
    fontFamily:      "var(--font-inter), sans-serif",
    colorBgContainer:"#ffffff",
    colorBorder:     "#e2e8f0",
    colorText:       "#0f172a",
    colorTextSecondary:"#475569",
    boxShadow:       "0 4px 12px rgba(0,0,0,0.08)",
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 16,
    },
    Input: {
      borderRadius: 8,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f1f5f9]">
        <AntdRegistry>
          <ConfigProvider theme={antdTheme} locale={viVN}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";

import { getGoogleFontsUrl } from "@/constants/fonts";

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
    colorPrimary: "#0ea5e9",
    colorLink: "#0ea5e9",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ea580c",
    borderRadius: 8,
    fontFamily: "var(--font-inter), sans-serif",
    colorBgBase: "#f6fafe",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f6fafe",
    colorBorder: "#e2e8f0",
    colorText: "#0f172a",
    colorTextSecondary: "#475569",
    colorTextTertiary: "#94a3b8",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
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
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href={getGoogleFontsUrl()} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#f1f5f9]"
      >
        <QueryProvider>
          <AntdRegistry>
            <ConfigProvider theme={antdTheme} locale={viVN}>
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}

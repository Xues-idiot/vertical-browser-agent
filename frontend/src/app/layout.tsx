import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/providers";

export const metadata: Metadata = {
  title: "Spider - 垂直浏览器Agent",
  description: "简历筛选自动化 - 垂直场景应用",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#111827] text-gray-100 antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
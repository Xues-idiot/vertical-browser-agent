import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/providers";

export const metadata: Metadata = {
  title: "Spider - 智能招聘筛选平台",
  description: "AI驱动的简历筛选系统 - 高效、精准、智能",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#0a0f1a] text-[#f8fafc] antialiased font-body min-h-screen">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

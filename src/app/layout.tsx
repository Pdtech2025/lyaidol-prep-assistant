import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "云平台开发前期准备助手",
  description: "智能文档分析与开发准备工作台 — Lyaidol B端云平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

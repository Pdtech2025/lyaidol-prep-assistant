import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lyaidol 云平台开发准备助手",
  description: "智能文档分析与开发前期准备工作台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

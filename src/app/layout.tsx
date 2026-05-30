import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lyaidol B端云平台',
  description: 'Lyaidol B端云平台管理系统',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

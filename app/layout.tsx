import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '习题本',
  description: '习题练习平台',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}

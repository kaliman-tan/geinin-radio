import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '芸ラジ - 芸人ラジオまとめ',
  description: '芸人のラジオ・Podcast番組リンクをまとめたサービス',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}

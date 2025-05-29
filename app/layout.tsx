import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'エキセントリック人生ゲーム',
  description: 'リアル人生ゲーム - 資産、信用、能力、年齢のステータスでサバイバル',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
} 
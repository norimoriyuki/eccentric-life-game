import type { Metadata, Viewport } from 'next'
import './globals.css'
import GoogleAnalytics from './components/GoogleAnalytics'

// Google Analytics測定ID（実際のIDに変更してください）
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

export const metadata: Metadata = {
  title: 'エキセントリック人生ゲーム',
  description: 'エキセントリック人生ゲーム - 資産、信用、能力、年齢のステータスでサバイバル',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'エキ人',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#DC2626',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#DC2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="人生ゲーム" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 開発環境ではService Workerを無効化
              if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
                console.log('Development mode: Service Worker disabled');
                // 既存のService Workerを削除
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                      console.log('ServiceWorker unregistered');
                    }
                  });
                }
              } else if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful');
                      
                      // 更新チェック
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // 新しいバージョンが利用可能
                            console.log('New version available! Reloading...');
                            // 3秒後に自動リロード
                            setTimeout(() => {
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              window.location.reload();
                            }, 3000);
                          }
                        });
                      });
                      
                      // Service Workerの制御が変わったときにリロード
                      navigator.serviceWorker.addEventListener('controllerchange', () => {
                        console.log('Controller changed, reloading...');
                        window.location.reload();
                      });
                      
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        {children}
      </body>
    </html>
  )
} 
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { VersionProvider } from '@/components/version/VersionProvider';
import { GlobalErrorTracker } from '@/components/error/GlobalErrorTracker';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LivePresenceTracker } from '@/components/presence/LivePresenceTracker';

export const metadata: Metadata = {
  title: 'DVT Tabu Game — Çok Oyunculu Yasaklı Kelime Arenası',
  description: 'AI destekli, ses ve titreşimli gerçek zamanlı çok oyunculu Tabu PWA oyunu.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DVT Tabu',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <LivePresenceTracker />
        <GlobalErrorTracker />
        <ErrorBoundary>
          <VersionProvider>
            <main className="flex-1 flex flex-col safe-top safe-bottom">
              {children}
            </main>
          </VersionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

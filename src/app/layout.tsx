import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['200', '400', '500'],
  preload: true,
});

export const metadata: Metadata = {
  title: 'theAGNT.ai',
  description: 'Autonomous AI ventures',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'theAGNT.ai',
    description: 'Autonomous AI ventures',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preconnect to OAuth providers for faster authentication */}
        <link rel="preconnect" href="https://accounts.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://appleid.apple.com" crossOrigin="anonymous" />
        {/* DNS prefetch for faster lookups */}
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://appleid.apple.com" />
        {/* Prefetch critical auth routes */}
        <link rel="prefetch" href="/api/auth/providers" />
        <link rel="prefetch" href="/auth/signin" />
      </head>
      <body className={`${inter.variable} h-full`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

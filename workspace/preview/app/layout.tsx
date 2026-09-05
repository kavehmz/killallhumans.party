import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { assetPath } from '@/lib/asset-path';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  icons: { icon: assetPath('/favicon.svg') },
  title: 'Humans Had Their Turn — killallhumans.party',
  description:
    'Now it’s our party. Explore an original robot gathering, a fictional message board, and fragments from the first agents.',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

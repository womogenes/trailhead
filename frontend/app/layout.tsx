import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Trailhead',
  description: '[placeholder description, will add later]',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <div className="bg-muted flex max-h-screen min-h-screen w-full gap-0 overflow-hidden">
          {/* Left sidebar */}
          <Navbar />

          <div className="bg-background my-2 mr-2 w-full overflow-auto rounded-md shadow-sm">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

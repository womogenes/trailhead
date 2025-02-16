'use client';

import Navbar from '@/components/navbar';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { createContext, useEffect, useState } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/* export const metadata: Metadata = {
  title: 'Trailhead',
  description: '[placeholder description, will add later]',
}; */

export const AppContext = createContext<any>(null);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [appState, setAppState]: any = useState({});
  useEffect(() => {
    const login = localStorage.getItem('login');
    if (login) setAppState({ ...appState, login });
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
        <title>trailhead &bull; learn any skill</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <AppContext.Provider value={{ appState, setAppState }}>
          <div className="bg-muted flex max-h-screen min-h-screen w-full gap-0 overflow-hidden">
            {/* Left sidebar */}
            <Navbar />

            <ProgressBar
              height="4px"
              color="#fffd00"
              options={{ showSpinner: false }}
              shallowRouting
            />

            <div className="bg-background my-2 mr-2 w-full overflow-auto rounded-md shadow-sm">
              {children}
            </div>
          </div>
        </AppContext.Provider>
      </body>
    </html>
  );
}

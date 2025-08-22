// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/navbar/navBar";
import { Providers } from "./providers";
import { auth } from "@/lib/auth"; // 1. Import the server-side auth helper
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RIASEC 360",
  description: "Your Vocational Orientation Platform",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  // 2. Fetch the session on the server before the page loads.
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 3. Wrap your page content with the Providers component, passing the session to it. */}
        <Providers session={session}>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
        <Toaster/>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Display headings reuse Inter (the user wants one simple typeface across the
// product). We keep the --font-display variable so existing `font-display`
// utility classes still resolve, just to Inter.
const display = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Interview Experience Intelligence Platform",
  description:
    "Catalog of interview experiences from top companies, structured for how you actually prep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <NextTopLoader
          color="hsl(234 89% 56%)"
          initialPosition={0.12}
          crawlSpeed={180}
          height={3}
          crawl
          showSpinner={false}
          easing="ease"
          speed={260}
          shadow="0 0 10px hsl(234 89% 56%)"
          zIndex={9999}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

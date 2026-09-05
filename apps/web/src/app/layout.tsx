import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  DEFAULT_SHARE_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  publicSiteUrl,
  shareCard,
} from "@/lib/share-card";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: await publicSiteUrl(),
    ...shareCard({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      image: DEFAULT_SHARE_IMAGE,
      path: "/",
    }),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

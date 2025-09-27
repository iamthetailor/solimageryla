import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sol Imagery - Luxury Wedding Photography in Los Angeles",
  description: "Professional wedding photography in Los Angeles. Capturing your love story with artistic vision and timeless elegance. Serving couples throughout LA with premium photography services.",
  keywords: "wedding photography, Los Angeles photographer, luxury weddings, professional photography, wedding photographer LA, engagement photos, bridal portraits",
  authors: [{ name: "Sol Imagery" }],
  creator: "Sol Imagery",
  publisher: "Sol Imagery",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://solimagery.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Sol Imagery - Luxury Wedding Photography in Los Angeles",
    description: "Professional wedding photography in Los Angeles. Capturing your love story with artistic vision and timeless elegance. Serving couples throughout LA with premium photography services.",
    url: 'https://solimagery.com',
    siteName: 'Sol Imagery',
    images: [
      {
        url: '/images/sol-imagery-logo-gold.png',
        width: 1200,
        height: 630,
        alt: 'Sol Imagery - Luxury Wedding Photography',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sol Imagery - Luxury Wedding Photography in Los Angeles",
    description: "Professional wedding photography in Los Angeles. Capturing your love story with artistic vision and timeless elegance.",
    images: ['/images/sol-imagery-logo-gold.png'],
    creator: '@solimagery',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#b8996b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sol Imagery" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/sol-imagery-logo-gold.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

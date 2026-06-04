import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const FB_PIXEL_ID = "1874801066532283";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sol Imagery — Luxury Photography in Los Angeles | Weddings, Quinceañeras, Family & Photobooth",
  description: "Luxury Los Angeles photography studio specializing in weddings, pre-wedding sessions, quinceañeras, family portraits, and luxury photobooth experiences. Book a free consultation today.",
  keywords: "los angeles photographer, luxury photography la, wedding photography los angeles, quinceañera photographer los angeles, 15 años photography, family photographer la, luxury photobooth, engagement photography, pre-wedding photos, professional headshots los angeles, linkedin headshot photographer, corporate headshots la",
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
    title: "Sol Imagery — Luxury Photography in Los Angeles",
    description: "Luxury Los Angeles photography: weddings, quinceañeras, family portraits, and luxury photobooth. Book a free consultation today.",
    url: 'https://solimagery.com',
    siteName: 'Sol Imagery',
    images: [
      {
        url: '/images/sol-imagery-logo-gold.png',
        width: 1200,
        height: 630,
        alt: 'Sol Imagery - Luxury Los Angeles Photography',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sol Imagery — Luxury Photography in Los Angeles",
    description: "Weddings, quinceañeras, family portraits & luxury photobooth. Book a free consultation.",
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
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
        {children}
      </body>
    </html>
  );
}

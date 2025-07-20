import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ErrorBoundary } from "@/components/common";
import WebVitals from "@/components/common/WebVitals";
import Script from "next/script";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Animator Blog",
    template: "%s | Animator Blog",
  },
  description: "A creative space for animation and digital art - exploring the intersection of technology and storytelling.",
  keywords: ["animation", "digital art", "3D modeling", "motion graphics", "creative coding"],
  authors: [{ name: "Animator" }],
  creator: "Animator",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: "Animator Blog",
    description: "A creative space for animation and digital art",
    siteName: "Animator Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Animator Blog",
    description: "A creative space for animation and digital art",
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <QueryProvider>
            {children}
          </QueryProvider>
          <WebVitals />
        </ErrorBoundary>
        
        {/* Core Web Vitals optimization script */}
        <Script
          id="core-web-vitals-optimization"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Initialize Core Web Vitals optimizations
                if (typeof window !== 'undefined') {
                  // Optimize CLS by reserving space for images
                  const style = document.createElement('style');
                  style.textContent = 'img:not([width]):not([height]) { aspect-ratio: 16/9; }';
                  document.head.appendChild(style);
                  
                  // Preload critical resources
                  const criticalResources = [
                    '${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api'}/blog-posts?pagination[page]=1&pagination[pageSize]=3',
                    '${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api'}/gallery-works?pagination[page]=1&pagination[pageSize]=6'
                  ];
                  
                  criticalResources.forEach(function(url) {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = url;
                    document.head.appendChild(link);
                  });
                }
              })();
            `
          }}
        />
      </body>
    </html>
  );
}

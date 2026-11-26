import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { UtmCapture } from "@/components/analytics/UtmCapture";
import { BlackFridayBanner } from "@/components/site/BlackFridayBanner";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { business } from "@/config/business";
import { SITE_URL } from "@/lib/env";
import { OG_IMAGE } from "@/lib/metadata";
import { buildStructuredData } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
  display: "swap",
});

const siteTitle = "Repton Digital: Websites, AI Automation and Software in Perth";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteTitle,
    template: "%s | Repton Digital",
  },
  description: business.description,
  applicationName: business.name,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: business.name,
    title: siteTitle,
    description: business.description,
    url: "/",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: business.description,
    images: [OG_IMAGE.url],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060b16",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = JSON.stringify(buildStructuredData()).replace(/</g, "\\u003c");

  return (
    <html lang="en-AU" className={`${inter.variable} ${syne.variable}`}>
      <body className="flex min-h-dvh flex-col bg-ink font-sans text-paper antialiased">
        <AnalyticsScripts />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Skip to content
        </a>
        <BlackFridayBanner />
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <UtmCapture />
        <PageViewTracker />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      </body>
    </html>
  );
}

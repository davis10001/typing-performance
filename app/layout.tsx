import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import WebVitals from "@/components/observability/WebVitals";
import AnalyticsGate from "@/components/observability/AnalyticsGate";
import JsonLd from "@/components/seo/JsonLd";
import { siteDescription, siteName, siteUrl, socialImage } from "@/lib/seo";
import "@fontsource-variable/inter-tight";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: { default: "Free Typing Test | TypingLevel", template: `%s | ${siteName}` },
  description: siteDescription,
  creator: siteName,
  publisher: siteName,
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: "Free Typing Test | TypingLevel",
    description: siteDescription,
    images: [{ url: socialImage, width: 1672, height: 941, alt: "TypingLevel typing test" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Typing Test | TypingLevel",
    description: siteDescription,
    images: [socialImage],
  },
  icons: {
    icon: "/images/typing-level-icon.png",
    shortcut: "/images/typing-level-icon.png",
    apple: "/images/typing-level-icon.png",
  },
};

function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="header-wordmark" href="/" aria-label="TypingLevel home">
        <Image
          className="header-logo"
          src="/images/typing-level-logo.png"
          alt=""
          width={2030}
          height={775}
          priority
        />
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/">Test</Link>
        <Link href="/learn">Learn</Link>
        <span>Race</span>
        <Link href="/faq">FAQ</Link>
      </nav>
    </header>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: siteName,
    description: siteDescription,
    inLanguage: "en",
  };

  return (
    <html lang="en">
      <body>
        <JsonLd data={websiteJsonLd} />
        <WebVitals />
        <div className="site-shell">
          <SiteHeader />
          {children}
          <footer className="site-footer">
            <span className="footer-brand">
              <Image className="footer-logo" src="/images/typing-level-logo.png" alt="TypingLevel" width={2030} height={775} />
            </span>
            <nav aria-label="Footer navigation">
              <Link href="/learn">LEARN</Link>
              <Link href="/average-typing-speed">TYPING SPEED</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/privacy">PRIVACY</Link>
              <Link className="footer-action" href="/">START A TEST <span aria-hidden="true">↗</span></Link>
            </nav>
            <AnalyticsGate
              mode={process.env.NEXT_PUBLIC_ANALYTICS_MODE}
              gaId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}
              privacyPolicyUrl={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
            />
          </footer>
        </div>
      </body>
    </html>
  );
}

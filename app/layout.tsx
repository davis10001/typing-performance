import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import WebVitals from "@/components/observability/WebVitals";
import AnalyticsGate from "@/components/observability/AnalyticsGate";
import "@fontsource-variable/inter-tight";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "TypingLevel", template: "%s | TypingLevel" },
  description: "Take a clear, no-account typing test and understand your speed and accuracy.",
  robots: { index: true, follow: true },
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
  return (
    <html lang="en">
      <body>
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

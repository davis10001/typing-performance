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
            <Link className="footer-brand" href="/">TYPINGLEVEL / TEST. UNDERSTAND. RETEST.</Link>
            <nav aria-label="Footer navigation">
              <Link href="/typing-test">THE TEST</Link>
              <Link href="/average-wpm">WPM EXPLAINED</Link>
              <Link href="/average-typing-speed">TYPING SPEED</Link>
              <Link href="/privacy">PRIVACY</Link>
              <Link className="footer-action" href="/1-minute-typing-test">START A TEST <span aria-hidden="true">↗</span></Link>
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

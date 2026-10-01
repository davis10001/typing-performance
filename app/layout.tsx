import type { Metadata } from "next";
import Link from "next/link";
import WebVitals from "@/components/observability/WebVitals";
import "@fontsource-variable/inter-tight";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Typing Performance", template: "%s | Typing Performance" },
  description: "Take a clear, no-account typing test and understand your speed and accuracy.",
  robots: { index: true, follow: true },
};

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="nav-pill">
        <Link className="wordmark" href="/" aria-label="Typing Performance home"><span className="wordmark-mark" aria-hidden="true">✳</span> TYPING<br />PERFORMANCE</Link>
        <nav aria-label="Main navigation" className="nav-links">
          <Link href="/typing-test">THE TEST</Link>
          <Link href="/average-wpm">WPM EXPLAINED</Link>
          <Link href="/average-typing-speed">TYPING SPEED</Link>
        </nav>
        <Link className="nav-action" href="/1-minute-typing-test">START A TEST <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="ticket-notches" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
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
            <span>TYPING PERFORMANCE / TEST. UNDERSTAND. RETEST.</span>
            <nav aria-label="Footer navigation"><Link href="/typing-test">TEST</Link><Link href="/average-wpm">WPM</Link><Link href="/average-typing-speed">SPEED</Link></nav>
          </footer>
        </div>
      </body>
    </html>
  );
}

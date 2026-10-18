import type { Metadata } from "next";
import Link from "next/link";
import { supportEmail } from "@/lib/contact";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact TypingLevel",
  description: "Contact TypingLevel about the typing test, practice tools, accessibility, privacy, or a technical problem.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="content-page trust-page">
      <section className="content-hero">
        <span className="eyebrow dark">PRODUCT SUPPORT</span>
        <h1>CONTACT<br /><strong>TYPINGLEVEL.</strong></h1>
        <p>Send questions about the typing test, practice tools, accessibility, privacy, or a technical problem to the address below.</p>
      </section>

      <div className="trust-content">
        <section className="trust-section" aria-labelledby="contact-email">
          <h2 id="contact-email">Email TypingLevel</h2>
          <p><a href={`mailto:${supportEmail}`}>{supportEmail}</a></p>
          <a className="button button-primary" href={`mailto:${supportEmail}?subject=TypingLevel%20support`}>START AN EMAIL <span aria-hidden="true">↗</span></a>
        </section>

        <section className="trust-section" aria-labelledby="contact-report">
          <h2 id="contact-report">What should an issue report include?</h2>
          <p>Include the page address, test or practice mode, device and browser, what you expected to happen, and what happened instead. A screenshot can help when the problem is visual. Please do not include passwords, sensitive personal information, or text you did not intend to share.</p>
        </section>

        <section className="trust-section" aria-labelledby="contact-privacy">
          <h2 id="contact-privacy">Have a privacy question?</h2>
          <p>TypingLevel works without an account, stores results and learning progress in the browser, and provides separate controls for clearing them. Read the <Link href="/privacy">privacy notice</Link> before contacting support if your question concerns local storage or analytics.</p>
        </section>

        <section className="trust-section" aria-labelledby="contact-links">
          <h2 id="contact-links">Looking for product information?</h2>
          <p>Read <Link href="/about">About TypingLevel</Link> for the product purpose and scoring approach, <Link href="/faq">Typing FAQ</Link> for common questions, or <Link href="/how-wpm-is-calculated">How WPM is calculated</Link> for the exact formulas.</p>
          <p className="trust-updated">This page was last reviewed October 18, 2026.</p>
        </section>
      </div>
    </main>
  );
}

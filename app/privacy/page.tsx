import type { Metadata } from "next";
import ClearLocalResults from "@/components/privacy/ClearLocalResults";

export const metadata: Metadata = {
  title: "Privacy — TypingLevel",
  description: "How TypingLevel handles typing tests, local results, and site requests.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="content-page">
      <section className="content-hero">
        <span className="eyebrow dark">PRIVACY / FIRST LAUNCH</span>
        <h1>YOUR TEST<br /><strong>STAYS YOURS.</strong></h1>
        <p>TypingLevel works without an account. This notice describes the first-launch version of the site, last updated October 11, 2026.</p>
      </section>
      <section className="content-article">
        <div className="content-index">01 / YOUR BROWSER</div>
        <div>
          <h2>RESULTS STAY LOCAL.</h2>
          <p>Your browser can store up to 20 completed result summaries, including the test duration, score, accuracy, errors, and completion time. It also stores preferences such as text difficulty and the finger guide setting. The application does not upload the passage you typed or your individual keystrokes.</p>
          <p>You can remove saved results here. You can remove preferences and other site storage through your browser settings.</p>
          <ClearLocalResults />
        </div>
      </section>
      <section className="content-article">
        <div className="content-index">02 / ANALYTICS</div>
        <div>
          <h2>OFF AT LAUNCH.</h2>
          <p>Google Analytics, Vercel Web Analytics, and Vercel Speed Insights are disabled for this launch. Their scripts do not load, and TypingLevel does not send test events to them.</p>
        </div>
      </section>
      <section className="content-article">
        <div className="content-index">03 / HOSTING</div>
        <div>
          <h2>DELIVERING THE SITE.</h2>
          <p>TypingLevel is hosted on Vercel. Vercel may process technical information about requests to deliver and protect the site, such as an IP address. See <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">Vercel’s privacy notice</a> for its practices.</p>
        </div>
      </section>
      <section className="content-article">
        <div className="content-index">04 / CONTACT</div>
        <div>
          <h2>QUESTIONS?</h2>
          <p>For privacy questions about TypingLevel, email <a href="mailto:tyyslj7927@gmail.com">tyyslj7927@gmail.com</a>.</p>
        </div>
      </section>
    </main>
  );
}

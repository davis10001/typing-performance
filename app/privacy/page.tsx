import type { Metadata } from "next";
import ClearLocalResults from "@/components/privacy/ClearLocalResults";
import ClearLearningProgress from "@/components/privacy/ClearLearningProgress";
import { supportEmail } from "@/lib/contact";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy",
  description: "How TypingLevel handles typing tests, local results, and site requests.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="content-page">
      <section className="content-hero">
        <span className="eyebrow dark">PRIVACY NOTICE</span>
        <h1>YOUR TEST<br /><strong>STAYS YOURS.</strong></h1>
        <p>TypingLevel works without an account. This notice was last updated October 11, 2026.</p>
      </section>
      <section className="content-article">
        <div className="content-index">01 / YOUR BROWSER</div>
        <div>
          <h2>RESULTS STAY LOCAL.</h2>
          <p>Your browser can store up to 20 completed result summaries, including the test duration, score, accuracy, errors, and completion time. It also stores preferences such as text difficulty and the finger guide setting. Adaptive practice results and lesson progress are stored separately. TypingLevel does not upload the passage you typed or your individual keystrokes.</p>
          <p>Test results and practice progress have separate controls. You can remove preferences and other site storage through your browser settings.</p>
          <ClearLocalResults />
          <ClearLearningProgress />
        </div>
      </section>
      <section className="content-article">
        <div className="content-index">02 / ANALYTICS</div>
        <div>
          <h2>ANALYTICS ARE OFF.</h2>
          <p>Google Analytics, Vercel Web Analytics, and Vercel Speed Insights are currently disabled. Their scripts do not load, and TypingLevel does not send test events to them.</p>
        </div>
      </section>
      <section className="content-article">
        <div className="content-index">03 / HOSTING</div>
        <div>
          <h2>SITE HOSTING.</h2>
          <p>TypingLevel is hosted on Vercel. Vercel may process technical information about requests to deliver and protect the site, such as an IP address. See <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">Vercel’s privacy notice</a> for its practices.</p>
        </div>
      </section>
      <section className="content-article">
        <div className="content-index">04 / CONTACT</div>
        <div>
          <h2>QUESTIONS?</h2>
          <p>For privacy questions about TypingLevel, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
        </div>
      </section>
    </main>
  );
}

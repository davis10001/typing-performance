import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Learn touch typing",
  description: "Choose adaptive continuous practice or a fixed 15-lesson touch typing course.",
  path: "/learn",
});

export default function LearnPage() {
  return (
    <main className="learning-page">
      <section className="learning-hero" aria-labelledby="learn-title">
        <span className="eyebrow">LEARN</span>
        <h1 id="learn-title">Choose how you<br /><strong>build the skill.</strong></h1>
        <p>Both paths move from a small key set toward a larger one. Your progress stays in this browser and never mixes with typing-test history.</p>
      </section>
      <section className="learning-mode-grid" aria-label="Learning modes">
        <article>
          <span className="learning-mode-number">01</span>
          <p className="eyebrow dark">KEYBR GUIDED</p>
          <h2>Continuous practice</h2>
          <p>The original Guided engine selects a focus key and generates each next round from your per-key results.</p>
          <ul><li>Starts with six frequent letters</li><li>Adds keys from measured performance</li><li>No fixed lesson list</li></ul>
          <Link className="button button-primary" href="/learn/practice">Continue practice <span>↗</span></Link>
        </article>
        <article>
          <span className="learning-mode-number">02</span>
          <p className="eyebrow dark">KTOUCH COURSE</p>
          <h2>Fixed courses</h2>
          <p>Follow a visible 15-lesson English QWERTY sequence with original pass thresholds and sequential unlocks.</p>
          <ul><li>Two new letter keys per lesson</li><li>Beginner or experienced access</li><li>Letters and capitals only</li></ul>
          <Link className="button button-secondary" href="/learn/courses">View 15 lessons <span>↗</span></Link>
        </article>
      </section>
      <aside className="learning-source-note">
        <p>Learning behavior is based on locked source versions of Keybr and KTouch. See <Link href="/privacy">local-data details</Link> and the project&apos;s third-party notices for licensing and provenance.</p>
      </aside>
    </main>
  );
}

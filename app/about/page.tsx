import type { Metadata } from "next";
import Link from "next/link";
import { supportEmail } from "@/lib/contact";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About TypingLevel: Free Typing Tests and Practice",
  description: "Learn what TypingLevel measures, how its typing tests calculate results, how content is sourced, and how browser-local storage protects your work.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="content-page trust-page">
      <section className="content-hero">
        <span className="eyebrow dark">ABOUT TYPINGLEVEL</span>
        <h1>ABOUT<br /><strong>TYPINGLEVEL.</strong></h1>
        <p>TypingLevel is a free browser-based English typing test and touch-typing practice site. It measures WPM, raw WPM, accuracy, and mistakes without requiring an account.</p>
      </section>

      <div className="trust-content">
        <section className="trust-section" aria-labelledby="about-purpose">
          <h2 id="about-purpose">What is TypingLevel for?</h2>
          <p>TypingLevel helps people measure a repeatable typing baseline, understand what the result means, practice deliberately, and retest under the same conditions. Timed tests are available for one, two, three, five, or ten minutes, while separate practice modes focus on individual keys, structured lessons, and complete paragraphs.</p>
        </section>

        <section className="trust-section" aria-labelledby="about-scoring">
          <h2 id="about-scoring">How does TypingLevel calculate results?</h2>
          <p>Correct WPM counts characters that match the passage, divides by five, and then divides by elapsed minutes. Raw WPM uses all character keypresses. Accuracy compares correct character keypresses with all character keypresses, so a corrected mistake still remains part of the accuracy record.</p>
          <p>See the complete formulas and a worked example on <Link href="/how-wpm-is-calculated">How WPM is calculated</Link>.</p>
        </section>

        <section className="trust-section" aria-labelledby="about-evidence">
          <h2 id="about-evidence">How are benchmarks and practice content handled?</h2>
          <p>TypingLevel separates measured results from general context. Its average-speed guide cites an Aalto University study of 168,960 self-selected online volunteers and explains why that sample is not a universal adult average, percentile, or pass line.</p>
          <p>Timed passages are reviewed for the product, and incorporated open-source learning materials retain their source and license notices. Read the <Link href="/average-typing-speed">average typing speed evidence</Link> or choose a method on the <Link href="/learn">typing practice page</Link>.</p>
        </section>

        <section className="trust-section" aria-labelledby="about-privacy">
          <h2 id="about-privacy">What happens to your typing data?</h2>
          <p>TypingLevel stores completed result summaries, preferences, and learning progress in your browser. The application does not upload the passage you typed or your individual keystrokes. You can review and clear stored information from the <Link href="/privacy">privacy page</Link>.</p>
        </section>

        <section className="trust-section" aria-labelledby="about-contact">
          <h2 id="about-contact">How can you contact TypingLevel?</h2>
          <p>For product, accessibility, or privacy questions, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> or review the details that help with an issue report on the <Link href="/contact">contact page</Link>.</p>
          <p className="trust-updated">This page was last reviewed October 18, 2026.</p>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import TypingBenchmarkSummary from "@/components/home/TypingBenchmarkSummary";
import JsonLd from "@/components/seo/JsonLd";
import TestShell from "@/components/typing/TestShell";
import { testTexts } from "@/lib/content/test-texts";
import { buildPageMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "TypingLevel: Free Typing Test for WPM & Accuracy",
  description: "Take a free typing test and see your WPM, accuracy, and mistakes immediately. Compare your result with sourced typing speed benchmarks. No account needed.",
  path: "/",
});

export default function HomePage() {
  const applicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${siteUrl}/#typing-test-app`,
    name: "TypingLevel",
    url: siteUrl,
    description: "A free browser-based typing test that measures WPM, raw WPM, accuracy, and mistakes without requiring an account.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    publisher: { "@id": `${siteUrl}/#organization` },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: ["Timed typing tests", "WPM and accuracy results", "Browser-local result history", "Guided typing practice"],
  };

  return (
    <main className="home-page">
      <JsonLd data={applicationJsonLd} />
      <section className="home-hero" aria-labelledby="home-title">
        <h1 id="home-title">TypingLevel free typing test</h1>
        <p>Measure your WPM and accuracy in one minute. No account, no setup.</p>
      </section>

      <TestShell
        durationSeconds={60}
        texts={testTexts.map(({ id, difficulty, text }) => ({ id, difficulty, text }))}
        entryPage="typing-test"
      />

      <TypingBenchmarkSummary />

      <section className="home-result-guide" aria-labelledby="home-result-guide-title">
        <header>
          <h2 id="home-result-guide-title">UNDERSTAND YOUR RESULT.</h2>
          <p>Your first score is a starting point. A little context can help you decide what to try next.</p>
        </header>
        <div className="home-guide-topics">
          <article>
            <h3>What do WPM and accuracy mean?</h3>
            <p>Correct WPM shows your pace on the passage. Accuracy shows how often you pressed the right key. Read the two together.</p>
            <Link href="/how-wpm-is-calculated">How scoring works</Link>
          </article>
          <article>
            <h3>Is my typing speed good?</h3>
            <p>A one-minute test gives you a quick starting point. Compare a few runs at the same duration and difficulty, with accuracy beside your WPM.</p>
            <Link href="/good-typing-speed">Understand your speed</Link>
          </article>
          <article>
            <h3>What should I practice next?</h3>
            <p>Slow down enough to notice mistakes, then try again with the same settings. If a minute feels rushed, choose a longer test.</p>
            <Link href="/learn">Choose a practice method</Link>
          </article>
        </div>
      </section>
    </main>
  );
}

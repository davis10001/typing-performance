import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TestShell from "@/components/typing/TestShell";
import { testTexts } from "@/lib/content/test-texts";

export const metadata: Metadata = {
  title: "Typing Test — measure your speed and accuracy",
  description: "Start a free typing test right away. Choose a duration, type the passage, and see your WPM and accuracy. No account needed.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <h1 id="home-title">START <strong>TYPING.</strong></h1>
        </div>
        <p>See your speed and accuracy in one minute. No account, no setup. Just begin with the text below.</p>
        <Image className="hero-typing-art" src="/images/typing-hands-hero-cutout.png" alt="Illustration of hands typing on floating keys" width={1672} height={941} fetchPriority="high" unoptimized />
      </section>

      <TestShell
        durationSeconds={60}
        texts={testTexts.map(({ id, difficulty, text }) => ({ id, difficulty, text }))}
        entryPage="typing-test"
      />

      <section className="home-guide" aria-labelledby="home-guide-title">
        <div className="home-guide-heading">
          <h2 id="home-guide-title">UNDERSTAND YOUR RESULT.</h2>
          <p>Your first score is a starting point. A little context can help you decide what to try next.</p>
        </div>
        <div className="home-guide-topics">
          <article>
            <h3>What do WPM and accuracy mean?</h3>
            <p>Correct WPM shows your pace on the passage. Accuracy shows how often you pressed the right key. Read the two together.</p>
            <Link href="/average-wpm">How scoring works</Link>
          </article>
          <article>
            <h3>Is my typing speed good?</h3>
            <p>A one-minute test gives you a quick starting point. Compare a few runs at the same duration and difficulty, with accuracy beside your WPM.</p>
            <Link href="/average-typing-speed">Understand typing speed</Link>
          </article>
          <article>
            <h3>What should I practice next?</h3>
            <p>Slow down enough to notice mistakes, then try again with the same settings. If a minute feels rushed, choose a longer test.</p>
            <Link href="/faq#faq-improve">Read practice advice</Link>
          </article>
        </div>
      </section>
    </main>
  );
}

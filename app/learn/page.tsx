import type { Metadata } from "next";
import Link from "next/link";
import CourseCatalog from "@/components/learning/CourseCatalog";
import GuidedPractice from "@/components/learning/GuidedPractice";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Learn Touch Typing with Guided Practice and Lessons",
  description: "Learn touch typing with adaptive practice or choose any of 15 fixed English QWERTY lessons. Practice letter keys, accuracy, and keyboard control.",
  path: "/learn",
});

export default function LearnPage() {
  return (
    <main className="learning-page learning-overview-page">
      <h1 className="sr-only">Learn touch typing with guided practice and fixed lessons</h1>
      <p className="learning-intro">Build accuracy one key at a time. Start typing below, or choose a fixed lesson when you want a specific sequence.</p>

      <GuidedPractice embedded />
      <CourseCatalog embedded />

      <section className="learning-guide" aria-labelledby="learning-guide-title">
        <div className="learning-guide-heading">
          <h2 id="learning-guide-title">Two ways to learn touch typing.</h2>
          <p>Continuous practice adapts the next exercise to your saved results. Fixed lessons keep the content predictable when you want to practise a specific group of keys.</p>
        </div>
        <div className="learning-guide-topics">
          <article>
            <h3>How continuous practice works</h3>
            <p>The guided exercise begins with a small set of common letters. After each valid round, the Keybr engine uses your per-key results to choose the next focus and decide when another letter should enter the practice set.</p>
          </article>
          <article>
            <h3>What the fixed lessons cover</h3>
            <p>The 15 English QWERTY lessons introduce letter keys in a reviewed order and finish with capital letters. You can open any lesson and repeat it as often as needed. Numbers and punctuation are not included in this course.</p>
          </article>
          <article>
            <h3>Which practice should you choose?</h3>
            <p>Use continuous practice when you want the next round selected from your results. Choose a fixed lesson when you already know which keys need attention or prefer a visible sequence.</p>
          </article>
        </div>
        <p className="learning-source-note">Your learning progress stays in this browser and remains separate from typing-test history. Read the <Link href="/privacy">local-data details</Link> or <Link href="/faq#faq-improve">typing practice advice</Link>.</p>
      </section>
    </main>
  );
}

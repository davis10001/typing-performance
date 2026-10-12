import type { Metadata } from "next";
import Link from "next/link";
import CourseCatalog from "@/components/learning/CourseCatalog";
import GuidedPractice from "@/components/learning/GuidedPractice";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Typing Practice and Lessons",
  description: "Improve your touch typing with adaptive practice or choose from 15 English QWERTY lessons. Work on accuracy and individual keys at your own pace.",
  path: "/learn",
});

export default function LearnPage() {
  return (
    <main className="learning-page learning-overview-page">
      <h1 className="sr-only">Typing practice and lessons</h1>
      <p className="learning-intro">Build accuracy one key at a time. Start with adaptive practice, or pick a lesson to work on specific keys.</p>

      <GuidedPractice embedded />
      <CourseCatalog embedded />

      <section className="learning-guide" aria-labelledby="learning-guide-title">
        <div className="learning-guide-heading">
          <h2 id="learning-guide-title">Two ways to practice.</h2>
          <p>Adaptive practice chooses your next exercise based on your results. Typing lessons let you choose the keys you want to work on.</p>
        </div>
        <div className="learning-guide-topics">
          <article>
            <h3>Adaptive practice</h3>
            <p>Start with four keys from the same sequence as the lessons. Early rounds repeat short key patterns; as more letters become available, practice shifts into words and adds new keys based on your results.</p>
          </article>
          <article>
            <h3>Typing lessons</h3>
            <p>The 15 English QWERTY lessons introduce letter keys step by step and finish with capital letters. Start anywhere and repeat any lesson. Numbers and punctuation are not included.</p>
          </article>
          <article>
            <h3>Where should you start?</h3>
            <p>Try adaptive practice if you want the next exercise chosen for you. Pick a lesson if you already know which keys need work or prefer a clear sequence.</p>
          </article>
        </div>
        <p className="learning-source-note">Your practice progress stays in this browser, separate from your typing test results. Read the <Link href="/privacy">privacy details</Link> or <Link href="/faq#faq-improve">tips for improving</Link>.</p>
      </section>
    </main>
  );
}

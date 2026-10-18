import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Typing Practice: Choose Your Next Exercise",
  description: "Choose adaptive key practice, complete English QWERTY lessons, or paragraph practice. Your learning progress stays in this browser.",
  path: "/learn",
});

export default function LearnPage() {
  return <main className="learning-page learning-overview-page">
    <header className="learning-hero practice-choice-hero">
      <div className="practice-choice-copy">
        <h1>Practice typing.<br /><strong>Choose your focus.</strong></h1>
        <p>Pick the exercise that matches what you want to improve, then take another timed test under the same conditions.</p>
      </div>
    </header>
    <div className="practice-paths">
      <article className="practice-path practice-path-adaptive">
        <div className="practice-path-copy">
          <span className="practice-path-label">Adaptive practice</span>
          <h2>Build key accuracy</h2>
          <p>Adaptive rounds choose the next letters from your performance. Start with a small set of keys and unlock more as you practice.</p>
          <Link className="button button-primary" href="/learn/practice">Start adaptive practice <ArrowIcon /></Link>
        </div>
        <AdaptivePracticeVisual />
      </article>
      <article className="practice-path practice-path-lessons">
        <div className="practice-path-copy">
          <span className="practice-path-label">Guided lessons</span>
          <h2>Follow a lesson</h2>
          <p>Choose from 15 English QWERTY lessons covering letters and capitals. Return to any lesson when you want to practice those keys again.</p>
          <Link className="button button-secondary" href="/learn/courses">Browse lessons <ArrowIcon /></Link>
        </div>
        <LessonPracticeVisual />
      </article>
      <article className="practice-path practice-path-paragraphs">
        <div className="practice-path-copy">
          <span className="practice-path-label">Paragraph practice</span>
          <h2>Build real rhythm</h2>
          <p>Type complete English paragraphs with capitals, punctuation, numbers, and natural sentence flow. Review the keys that slowed you down after each set.</p>
          <Link className="button button-secondary" href="/learn/paragraphs">Choose a paragraph <ArrowIcon /></Link>
        </div>
        <ParagraphPracticeVisual />
      </article>
    </div>
    <p className="practice-paths-note">Lesson progress stays in this browser, separate from timed test results. <Link href="/privacy">How local storage works</Link> · <Link href="/">Take a typing test</Link></p>
  </main>;
}

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M6 14 14 6M8 6h6v6" /></svg>;
}

function AdaptivePracticeVisual() {
  return <div className="practice-path-visual adaptive-visual" aria-hidden="true">
    <div className="adaptive-focus-copy"><span>FOCUS KEY</span><strong>F</strong></div>
    <div className="adaptive-keyboard">
      <span>J</span><span>D</span><span className="is-focus">F</span><span>K</span><span>S</span>
    </div>
    <div className="adaptive-progress">
      <span className="is-complete" /><span className="is-complete" /><span className="is-current" /><span /><span />
    </div>
    <p>Practice adapts after every round</p>
  </div>;
}

function LessonPracticeVisual() {
  return <div className="practice-path-visual lesson-visual" aria-hidden="true">
    <div className="lesson-visual-heading"><span>15 LESSONS</span><strong>Learn in sequence</strong></div>
    <ol>
      <li className="is-complete"><span>01</span><strong><kbd>J</kbd><kbd>F</kbd></strong><i /></li>
      <li className="is-current"><span>02</span><strong><kbd>K</kbd><kbd>D</kbd></strong><i /></li>
      <li><span>03</span><strong><kbd>L</kbd><kbd>S</kbd></strong><i /></li>
    </ol>
  </div>;
}

function ParagraphPracticeVisual() {
  return <div className="practice-path-visual paragraph-visual" aria-hidden="true">
    <div className="paragraph-visual-heading"><span>3 PARAGRAPHS</span><strong>Practice complete text</strong></div>
    <p>“A clear morning gives the city a different rhythm. Shops open, buses arrive, and people begin the day with purpose.”</p>
    <div className="paragraph-visual-footer"><span>KEY REVIEW</span><strong>E</strong><strong>R</strong><strong>T</strong></div>
  </div>;
}

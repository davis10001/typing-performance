import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Average Typing Speed and Average WPM: What Research Shows",
  description: "A large online study reported an average typing speed of about 52 WPM. See who was measured, what the benchmark means, and how to compare your own result fairly.",
  path: "/average-typing-speed",
});

export default function AverageTypingSpeedPage() {
  return (
    <main className="content-page">
      <section className="content-hero"><span className="eyebrow dark">SPEED / RESEARCH</span><h1>AVERAGE<br /><strong>TYPING SPEED.</strong></h1><p>A large study of 168,960 self-selected online volunteers reported an average typing speed of about 52 WPM. That is not the average for all U.S. adults or a universal pass line.</p><Link className="button button-lilac" href="/">CHECK YOUR PACE <span aria-hidden="true">↗</span></Link></section>
      <section className="content-article">
        <div className="content-index">01 / A SOURCED AVERAGE</div>
        <div><h2>WHAT IS THE AVERAGE TYPING SPEED?</h2><p>An <a href="https://www.aalto.fi/en/news/the-traits-of-fast-typists-discovered-by-analysing-136-million-keystrokes">Aalto University report</a> on a study of 168,960 online volunteers reported an average of about 52 WPM, with most participants between 30 and 60 WPM. The study recorded roughly 136.9 million keystrokes while volunteers transcribed randomized English sentences.</p><p>The volunteers chose to take the online test. About 68% were from the United States, most were younger and interested in typing, and more than 70% had taken a typing course. The 52 WPM average describes this research sample and task. It does not establish the average for every adult, a population percentile, or a passing score.</p></div>
      </section>
      <section className="content-article">
        <div className="content-article-rail">
          <div className="content-index">02 / COMPARE FAIRLY</div>
          <div className="content-line-art content-line-art-conditions" aria-hidden="true">
            <Image src="/images/typing-conditions-line-art.png" alt="" fill sizes="(max-width: 900px) 24vw, 280px" unoptimized />
          </div>
        </div>
        <div><h2>COMPARE THE TESTS BEFORE THE NUMBERS.</h2><p>The research benchmark came from volunteers transcribing randomized English sentences in a controlled online test. TypingLevel also asks you to transcribe an English passage, but it reports correct WPM from the characters that match the passage and reports accuracy from every character keypress.</p><p>The passage, duration, error handling, keyboard, and sample can differ between tests. Use 52 WPM as context, then compare your own attempts at the same duration and difficulty. See <Link href="/how-wpm-is-calculated">How WPM is calculated</Link> for the formulas used here.</p></div>
      </section>
      <section className="content-article">
        <div className="content-article-rail">
          <div className="content-index">03 / READ TWO RESULTS</div>
          <div className="content-line-art content-line-art-progress" aria-hidden="true">
            <Image src="/images/typing-progress-line-art.png" alt="" fill sizes="(max-width: 900px) 24vw, 280px" unoptimized />
          </div>
        </div>
        <div><h2>THE SAME WPM CAN TELL TWO STORIES.</h2><p>Two one-minute results can both show 52 correct WPM while one has 99% accuracy and the other has 90%. Their final pace is the same, but the higher-accuracy attempt required fewer corrections and is usually the steadier baseline.</p><p>A 60 WPM one-minute result and a 54 WPM five-minute result also answer different questions. The first is a quick snapshot; the second shows a pace sustained for longer. Compare like with like, then use the <Link href="/good-typing-speed">personal speed guide</Link> to read WPM, accuracy, and test length together.</p></div>
      </section>
      <section className="content-cta"><h2>TAKE A<br /><strong>TYPING TEST.</strong></h2><p>Pick one, two, three, five, or ten minutes. Your result explains what was measured.</p><Link className="button button-primary" href="/5-minute-typing-test">TRY 5 MINUTES <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}

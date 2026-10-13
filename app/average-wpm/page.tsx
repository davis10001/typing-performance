import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "WPM Explained: How Typing Speed Is Calculated",
  description: "See how typing tests calculate WPM, how correct and raw WPM differ, and why accuracy and test length matter.",
  path: "/average-wpm",
});

export default function AverageWpmPage() {
  return (
    <main className="content-page">
      <section className="content-hero"><span className="eyebrow dark">WPM / EXPLAINED</span><h1>YOUR WPM,<br /><strong>EXPLAINED.</strong></h1><p>Words per minute measures typing speed. See how your score is calculated and what to check before comparing results.</p><Link className="button button-lilac" href="/1-minute-typing-test">TEST YOUR WPM <span aria-hidden="true">↗</span></Link></section>
      <section className="content-article"><div className="content-index">01 / THE MEASURE</div><div><h2>HOW IS WPM CALCULATED?</h2><p>TypingLevel treats five characters as one word. Correct WPM is the count of characters that match the passage, divided by five, then divided by elapsed minutes. For example, 250 matching characters in one minute is 50 correct WPM. Raw WPM uses all character keypresses, including ones you later correct, so it can be higher.</p></div></section>
      <section className="content-article"><div className="content-index">02 / THE CONTEXT</div><div><h2>ACCURACY CHANGES THE STORY.</h2><p>Accuracy is correct character keypresses divided by all character keypresses. Backspace does not erase an earlier mistaken keypress or stop the clock. Read correct WPM beside accuracy, and compare attempts taken at the same duration. A one-minute snapshot and a five-minute session answer slightly different questions.</p><p><Link href="/good-typing-speed">Interpret your own result</Link> with both measures.</p></div></section>
      <section className="content-article"><div className="content-index">03 / THE BENCHMARK</div><div><h2>AVERAGES NEED A SOURCE.</h2><p>A typing average only describes the people and test conditions behind it. For a sourced benchmark and its limits, read our <Link href="/average-typing-speed">guide to average typing speed</Link>.</p></div></section>
      <section className="content-cta"><h2>SEE YOUR<br /><strong>OWN NUMBER.</strong></h2><p>Choose a timed test and get a result you can revisit in this browser.</p><Link className="button button-primary" href="/3-minute-typing-test">TRY 3 MINUTES <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}

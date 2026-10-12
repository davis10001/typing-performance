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
      <section className="content-article"><div className="content-index">01 / THE MEASURE</div><div><h2>HOW IS WPM CALCULATED?</h2><p>Words per minute is calculated by dividing typed characters by five, then dividing by elapsed minutes. Correct WPM uses only characters that match the passage. Raw WPM uses every character entered, so mistakes can leave raw WPM higher than correct WPM.</p></div></section>
      <section className="content-article"><div className="content-index">02 / THE CONTEXT</div><div><h2>ACCURACY CHANGES THE STORY.</h2><p>A faster raw pace can come with more mistakes. Read WPM beside accuracy, and compare attempts taken at the same duration. A one-minute snapshot and a five-minute session answer slightly different questions.</p></div></section>
      <section className="content-article"><div className="content-index">03 / THE BENCHMARK</div><div><h2>AVERAGES NEED A SOURCE.</h2><p>A typing average only describes the people and test conditions behind it. For a sourced benchmark and its limits, read our <Link href="/average-typing-speed">guide to average typing speed</Link>.</p></div></section>
      <section className="content-cta"><h2>SEE YOUR<br /><strong>OWN NUMBER.</strong></h2><p>Choose a timed test and get a result you can revisit in this browser.</p><Link className="button button-primary" href="/3-minute-typing-test">TRY 3 MINUTES <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}

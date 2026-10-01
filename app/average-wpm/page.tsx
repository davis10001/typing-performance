import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Average WPM — understand words per minute",
  description: "Learn how WPM is calculated, why accuracy matters, and how to compare your own repeat typing tests.",
  alternates: { canonical: "/average-wpm" },
};

export default function AverageWpmPage() {
  return (
    <main className="content-page">
      <section className="content-hero"><span className="eyebrow dark">WPM / EXPLAINED</span><h1>WHAT IS<br /><strong>AVERAGE WPM?</strong></h1><p>Words per minute is a common way to describe typing speed. The meaning of an “average” depends on who was measured and how the test was run.</p><Link className="button button-lilac" href="/1-minute-typing-test">TEST YOUR WPM <span aria-hidden="true">↗</span></Link></section>
      <section className="content-article"><div className="content-index">01 / THE MEASURE</div><div><h2>ONE WORD = FIVE CHARACTERS.</h2><p>Typing tests normally turn characters into a standard word unit: five characters equal one word for the calculation. Correct WPM uses correctly typed characters; raw WPM uses all entered characters. Both are divided by the time in minutes.</p></div></section>
      <section className="content-article"><div className="content-index">02 / THE CONTEXT</div><div><h2>ACCURACY CHANGES THE STORY.</h2><p>A faster raw pace can come with more mistakes. Read WPM beside accuracy, and compare attempts taken at the same duration. A one-minute snapshot and a five-minute session answer slightly different questions.</p></div></section>
      <section className="content-cta"><h2>SEE YOUR<br /><strong>OWN NUMBER.</strong></h2><p>Choose a timed test and get a result you can revisit in this browser.</p><Link className="button button-primary" href="/3-minute-typing-test">TRY 3 MINUTES <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}

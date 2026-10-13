import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "How WPM Is Calculated: Correct WPM, Raw WPM & Accuracy",
  description: "Learn how TypingLevel calculates correct WPM, raw WPM, and accuracy, with a worked example and an explanation of how mistakes and backspaces affect the result.",
  path: "/how-wpm-is-calculated",
});

export default function HowWpmIsCalculatedPage() {
  return (
    <main className="content-page">
      <section className="content-hero"><span className="eyebrow dark">WPM / EXPLAINED</span><h1>HOW WPM IS<br />{" "}<strong>CALCULATED.</strong></h1><p>TypingLevel reports correct WPM, raw WPM, and accuracy. Each number answers a different part of how quickly and accurately you typed.</p><Link className="button button-lilac" href="/1-minute-typing-test">TEST YOUR WPM <span aria-hidden="true">↗</span></Link></section>
      <section className="content-article"><div className="content-index">01 / THE FORMULAS</div><div><h2>CORRECT AND RAW WPM.</h2><p>Typing tests treat five characters as one word. Correct WPM is the number of characters that match the passage, divided by five, then divided by elapsed minutes. Raw WPM uses every character keypress instead of only the characters that remain correct.</p><p><strong>Correct WPM = matching characters ÷ 5 ÷ elapsed minutes.</strong><br /><strong>Raw WPM = all character keypresses ÷ 5 ÷ elapsed minutes.</strong></p></div></section>
      <section className="content-article"><div className="content-index">02 / AN EXAMPLE</div><div><h2>FROM KEYS TO A SCORE.</h2><p>Suppose you enter 250 character keypresses in one minute. If 240 characters match the passage when time ends, your correct WPM is 48 and your raw WPM is 50. If 240 of those 250 character keypresses were correct when pressed, your accuracy is 96%.</p><p><strong>240 ÷ 5 ÷ 1 = 48 correct WPM.</strong><br /><strong>250 ÷ 5 ÷ 1 = 50 raw WPM.</strong><br /><strong>240 ÷ 250 × 100 = 96% accuracy.</strong></p></div></section>
      <section className="content-article"><div className="content-index">03 / ERRORS</div><div><h2>BACKSPACE DOES NOT ERASE HISTORY.</h2><p>A mistaken keypress still counts as an error and still affects accuracy after you press Backspace. Backspace removes the last character from the final text, but it does not add a character to raw WPM. Correcting the text can improve correct WPM because more of the final characters match the passage, while the timer continues to run.</p><p>Compare attempts at the same duration, and read correct WPM beside accuracy. For a sourced benchmark, see <Link href="/average-typing-speed">Average typing speed</Link>.</p></div></section>
      <section className="content-cta"><h2>SEE YOUR<br /><strong>OWN NUMBERS.</strong></h2><p>Take a timed test to see correct WPM, raw WPM, accuracy, and mistakes together.</p><Link className="button button-primary" href="/3-minute-typing-test">TRY 3 MINUTES <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Typing Speed FAQ: WPM, Accuracy & Test Scores",
  description: "Answers to common typing test questions about good and average typing speed, WPM, accuracy, mistakes, and test length.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <main className="content-page faq-page">
      <section className="content-hero" aria-labelledby="faq-title">
        <div className="faq-hero-copy">
          <span className="eyebrow dark">HELP / TYPING TEST</span>
          <h1 id="faq-title">TYPING<br />{" "}<strong>FAQ.</strong></h1>
        </div>
        <p>Typing speed, accuracy, and how this test scores your work.</p>
        <Image className="faq-hero-art" src="/images/typing-faq-hero.png" alt="" width={1672} height={941} unoptimized />
      </section>
      <section className="faq-section" aria-label="Frequently asked questions">
        <div className="faq-list">
          <section className="faq-entry" aria-labelledby="faq-good-speed">
            <h2 id="faq-good-speed">What is a good typing speed?</h2>
            <p>It depends on what you need to type. For practice, aim for a pace you can hold without frequent corrections. Compare a few attempts at the same duration and difficulty, and read accuracy alongside WPM.</p>
          </section>
          <section className="faq-entry" aria-labelledby="faq-average-speed">
            <h2 id="faq-average-speed">What is the average typing speed?</h2>
            <p>In an <a href="https://www.aalto.fi/en/news/the-traits-of-fast-typists-discovered-by-analysing-136-million-keystrokes">Aalto University study</a> of about 168,000 online volunteers, the average was 52 WPM, with most participants between 30 and 60 WPM. They chose to take a typing test, so treat that average as a reference point rather than a target for everyone. <Link href="/average-typing-speed">More on average typing speed.</Link></p>
          </section>
          <section className="faq-entry" aria-labelledby="faq-wpm">
            <h2 id="faq-wpm">How is WPM calculated in this typing test?</h2>
            <p>TypingLevel divides the number of characters that match the passage by five, then by the elapsed time in minutes. If 250 characters match in exactly one minute, that is 50 correct WPM. Raw WPM uses every character entered during the test, so the two numbers can differ. <Link href="/average-wpm">See how WPM works.</Link></p>
          </section>
          <section className="faq-entry" aria-labelledby="faq-improve">
            <h2 id="faq-improve">How can I improve my typing speed and accuracy?</h2>
            <p>Slow down enough to notice which words or keys trip you up. Practice with a fresh passage, and look at the text instead of your fingers when you can. Retest at the same duration to see whether your pace and accuracy are improving.</p>
          </section>
          <section className="faq-entry" aria-labelledby="faq-one-minute">
            <h2 id="faq-one-minute">Is a one-minute typing test enough?</h2>
            <p>A <Link href="/1-minute-typing-test">one-minute test</Link> gives you a quick check. A slow start or tricky sentence can have a bigger effect on a short run, so compare several attempts. Try a <Link href="/3-minute-typing-test">three-minute test</Link> if you want to see how your pace holds for longer.</p>
          </section>
          <section className="faq-entry" aria-labelledby="faq-accuracy">
            <h2 id="faq-accuracy">What is a good typing accuracy?</h2>
            <p>There is no single cutoff that suits every task. On this test, accuracy is the share of character keys you got right when you pressed them. If 90 out of 100 character keys were correct, your accuracy is 90%. Read it with correct WPM, since corrections take time.</p>
          </section>
          <section className="faq-entry" aria-labelledby="faq-vary">
            <h2 id="faq-vary">Why do my typing test results vary?</h2>
            <p>The passage, punctuation, difficulty setting, and test length can all change your result. Corrections take time, too. Compare runs at the same duration and difficulty, then look at several scores instead of only your fastest one.</p>
          </section>
          <section className="faq-entry" aria-labelledby="faq-mistakes">
            <h2 id="faq-mistakes">How do mistakes and backspaces affect my WPM?</h2>
            <p>A wrong key adds an error. Backspace removes the last character from your final text, but it does not erase the original error or its effect on accuracy; the timer keeps running. Correcting the text can improve correct WPM. Raw WPM counts characters you type again, but not the Backspace key itself.</p>
          </section>
        </div>
      </section>
    </main>
  );
}

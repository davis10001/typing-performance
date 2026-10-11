import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Average Typing Speed — put your result in context",
  description: "Understand the limits of average typing speed comparisons and see how repeat tests can reveal your own progress.",
  alternates: { canonical: "/average-typing-speed" },
};

export default function AverageTypingSpeedPage() {
  return (
    <main className="content-page">
      <section className="content-hero"><span className="eyebrow dark">SPEED / CONTEXT</span><h1>HOW FAST IS<br /><strong>FAST ENOUGH?</strong></h1><p>Average typing speed is useful only when the source, test length, and accuracy rule are clear. Your own repeat tests can tell you more about how your pace is changing.</p><Link className="button button-lilac" href="/3-minute-typing-test">CHECK YOUR PACE <span aria-hidden="true">↗</span></Link></section>
      <section className="content-article">
        <div className="content-article-rail">
          <div className="content-index">01 / COMPARE FAIRLY</div>
          <div className="content-line-art content-line-art-conditions" aria-hidden="true">
            <Image src="/images/typing-conditions-line-art.png" alt="" fill sizes="(max-width: 900px) 24vw, 280px" unoptimized />
          </div>
        </div>
        <div><h2>USE THE SAME CONDITIONS.</h2><p>If you want to compare two attempts, keep the duration and test method consistent. A quick burst can look different from a longer session. Review accuracy beside speed so a rushed result does not hide extra mistakes.</p></div>
      </section>
      <section className="content-article">
        <div className="content-article-rail">
          <div className="content-index">02 / MAKE IT USEFUL</div>
          <div className="content-line-art content-line-art-progress" aria-hidden="true">
            <Image src="/images/typing-progress-line-art.png" alt="" fill sizes="(max-width: 900px) 24vw, 280px" unoptimized />
          </div>
        </div>
        <div><h2>TRACK THE NEXT ATTEMPT.</h2><p>One result is a starting point. Take another test after a break or practice session and look for a steadier pace with fewer errors. Completed results stay in this browser until you clear them.</p></div>
      </section>
      <section className="content-cta"><h2>START WITH<br /><strong>A REAL TEST.</strong></h2><p>Pick one, two, three, five, or ten minutes. Your result explains what was measured.</p><Link className="button button-primary" href="/5-minute-typing-test">TRY 5 MINUTES <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}

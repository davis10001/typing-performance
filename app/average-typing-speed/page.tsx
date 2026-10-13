import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Average Typing Speed: What the Research Shows",
  description: "See a sourced average typing speed, understand who was measured, and learn how test length and accuracy affect comparisons with your own WPM.",
  path: "/average-typing-speed",
});

export default function AverageTypingSpeedPage() {
  return (
    <main className="content-page">
      <section className="content-hero"><span className="eyebrow dark">SPEED / RESEARCH</span><h1>AVERAGE<br /><strong>TYPING SPEED.</strong></h1><p>One large study reported about 52 WPM among online volunteers. The sample and test conditions matter before you compare that number with your own.</p><Link className="button button-lilac" href="/">CHECK YOUR PACE <span aria-hidden="true">↗</span></Link></section>
      <section className="content-article">
        <div className="content-index">01 / A SOURCED AVERAGE</div>
        <div><h2>WHAT IS THE AVERAGE TYPING SPEED?</h2><p>An <a href="https://www.aalto.fi/en/news/the-traits-of-fast-typists-discovered-by-analysing-136-million-keystrokes">Aalto University report</a> on a study of 168,960 online volunteers reported an average of about 52 WPM, with most participants between 30 and 60 WPM. The study recorded roughly 136.9 million keystrokes while participants transcribed randomized English sentences.</p><p>Participants volunteered online; they were mostly younger, had an interest in typing, and many had taken a typing course. The average describes that sample and task. It is not a population-wide norm, percentile table, or pass mark for your test.</p></div>
      </section>
      <section className="content-article">
        <div className="content-article-rail">
          <div className="content-index">02 / COMPARE FAIRLY</div>
          <div className="content-line-art content-line-art-conditions" aria-hidden="true">
            <Image src="/images/typing-conditions-line-art.png" alt="" fill sizes="(max-width: 900px) 24vw, 280px" unoptimized />
          </div>
        </div>
        <div><h2>USE THE SAME CONDITIONS.</h2><p>If you want to compare two attempts, keep the duration and test method consistent. A quick burst can look different from a longer session. Review accuracy beside speed so a rushed result does not hide extra mistakes.</p></div>
      </section>
      <section className="content-article">
        <div className="content-article-rail">
          <div className="content-index">03 / MAKE IT USEFUL</div>
          <div className="content-line-art content-line-art-progress" aria-hidden="true">
            <Image src="/images/typing-progress-line-art.png" alt="" fill sizes="(max-width: 900px) 24vw, 280px" unoptimized />
          </div>
        </div>
        <div><h2>TRACK THE NEXT ATTEMPT.</h2><p>One result is a starting point. Take another test after a break or practice session and look for a steadier pace with fewer errors. Completed results stay in this browser until you clear them. To read your own WPM, accuracy, and test length together, use the <Link href="/good-typing-speed">personal speed guide</Link>.</p></div>
      </section>
      <section className="content-cta"><h2>TAKE A<br /><strong>TYPING TEST.</strong></h2><p>Pick one, two, three, five, or ten minutes. Your result explains what was measured.</p><Link className="button button-primary" href="/5-minute-typing-test">TRY 5 MINUTES <span aria-hidden="true">↗</span></Link></section>
    </main>
  );
}

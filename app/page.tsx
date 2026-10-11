import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LocalPaceStats from "@/components/home/LocalPaceStats";
import { durationOptions } from "@/lib/content/test-pages";

const durationDescriptions = {
  60: "A quick snapshot",
  120: "Settle into a rhythm",
  180: "Find a steady rhythm",
  300: "See how your pace holds",
  600: "Stay consistent for longer",
} as const;

export const metadata: Metadata = {
  title: "TypingLevel — Test and understand your typing",
  description: "Take a free one, two, three, five, or ten minute typing test. See your WPM, accuracy, and a clear next step.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <span className="eyebrow dark">A BETTER READ ON YOUR TYPING</span>
          <h1 id="home-title">KNOW YOUR<br /><strong>TYPING</strong><br />PERFORMANCE.</h1>
          <p>Take a timed test, see your speed and accuracy, then choose what to do next. No account needed.</p>
          <Link className="button button-lilac" href="/1-minute-typing-test">TAKE THE 1 MINUTE TEST <span aria-hidden="true">↗</span></Link>
        </div>
        <Image className="hero-typing-art" src="/images/typing-hands-hero-cutout.png" alt="Illustration of two hands typing on floating keys" width={1672} height={941} priority unoptimized />
      </section>

      <div className="marquee-strip" aria-hidden="true"><span>TEST YOUR PACE&nbsp;&nbsp;·&nbsp;&nbsp;FIND YOUR RHYTHM</span></div>

      <section className="home-tests" aria-labelledby="choose-title">
        <div className="section-heading"><span className="eyebrow">CHOOSE YOUR SESSION</span><h2 id="choose-title"><strong>05</strong> WAYS TO TEST.</h2></div>
        <div className="home-duration-grid">
          {durationOptions.map((option, index) => (
            <article className={`home-duration-card card-${index + 1}`} key={option.seconds}>
              <strong>{option.label}</strong>
              <span className="home-duration-description">{durationDescriptions[option.seconds]}</span>
              <Link className="button home-duration-action" href={option.href} aria-label={`START ${option.seconds / 60} MIN TEST`}>START TEST <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
        </div>
        <p className="home-tests-note">ONE ENGINE. FIVE CLEAR WAYS TO CHECK YOUR PACE.</p>
        <LocalPaceStats />
      </section>

      <section className="home-understand" aria-labelledby="understand-title">
        <div className="understand-heading"><span className="eyebrow dark">AFTER THE TEST</span><h2 id="understand-title">A NUMBER IS<br /><strong>JUST THE START.</strong></h2></div>
        <div className="understand-copy"><p>Your result shows correct WPM, raw speed, accuracy, and mistakes. Learn what each measure says about this attempt, then retest on your own terms.</p><Link className="button button-primary" href="/average-wpm">UNDERSTAND WPM <span aria-hidden="true">↗</span></Link></div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TypingBenchmarks from "@/components/home/TypingBenchmarks";
import SpeedInterpretation from "@/components/speed/SpeedInterpretation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "What Is a Good Typing Speed? Understand Your WPM",
  description: "Compare a completed typing test with a sourced WPM benchmark, then use your accuracy and test length to choose a useful practice and retest step.",
  path: "/good-typing-speed",
});

export default function GoodTypingSpeedPage() {
  return <main className="content-page speed-page">
    <section className="content-hero"><h1>IS YOUR TYPING<br /><strong>SPEED GOOD?</strong></h1><p>A good typing speed is one you can maintain accurately and consistently for the task at hand. Read your result using correct WPM, accuracy, and test length, then compare attempts taken under the same conditions.</p><Image className="speed-hero-art" src="/images/typing-conditions-line-art.png" alt="" width={1792} height={1024} unoptimized /></section>
    <SpeedInterpretation />
    <TypingBenchmarks showExtended={false} />
    <section className="content-article"><div className="content-index">CONTEXT</div><div><h2>WHAT COUNTS AS GOOD?</h2><p>Judge a result using three things together: correct WPM, accuracy, and repeated tests at the same duration. Correct WPM shows how quickly you typed the passage after errors are counted. Accuracy shows how often you pressed the intended keys. Repeating the same test length helps separate a steady pace from a single unusually fast or slow attempt.</p><p>Read <Link href="/average-typing-speed">Average typing speed</Link> for the study and its limits, or see <Link href="/how-wpm-is-calculated">How WPM is calculated</Link>.</p></div></section>
    <section className="content-article"><div className="content-index">NEXT STEP</div><div><h2>TEST, PRACTICE, RETEST.</h2><p>Use a timed test to establish a baseline. Practice at a pace where you notice errors, then retest at the same duration. Compare both correct WPM and accuracy across several attempts.</p><p>For a longer passage without a countdown, try <Link href="/learn/paragraphs">paragraph practice</Link>. For key-level work, use <Link href="/learn/practice">adaptive practice</Link>.</p></div></section>
  </main>;
}

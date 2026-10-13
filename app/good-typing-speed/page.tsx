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
    <section className="content-hero"><h1>IS YOUR TYPING<br /><strong>SPEED GOOD?</strong></h1><p>A useful answer depends on accuracy, test length, and what you need to type. Start with your own result, then compare attempts taken under the same conditions.</p><Image className="speed-hero-art" src="/images/typing-conditions-line-art.png" alt="" width={1792} height={1024} unoptimized /></section>
    <SpeedInterpretation />
    <TypingBenchmarks showExtended={false} />
    <section className="content-article"><div className="content-index">CONTEXT</div><div><h2>WHAT COUNTS AS GOOD?</h2><p>There is no universal WPM threshold. A steady speed that lets you complete your work accurately is more useful than a single peak score. A study of 168,960 self-selected online volunteers reported an average near 52 WPM, but its participants and transcription task may differ from your test.</p><p>Read the <Link href="/average-typing-speed">research and its limits</Link>, or see <Link href="/average-wpm">how WPM is calculated</Link>.</p></div></section>
    <section className="content-article"><div className="content-index">NEXT STEP</div><div><h2>TEST, PRACTICE, RETEST.</h2><p>Use a timed test to establish a baseline. Practice at a pace where you notice errors, then retest at the same duration. Compare both correct WPM and accuracy across several attempts.</p><p>For a longer passage without a countdown, try <Link href="/learn/paragraphs">paragraph practice</Link>. For key-level work, use <Link href="/learn/practice">adaptive practice</Link>.</p></div></section>
  </main>;
}

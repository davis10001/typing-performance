import type { Metadata } from "next";
import GuidedPractice from "@/components/learning/GuidedPractice";
import PracticeBreadcrumb from "@/components/PracticeBreadcrumb";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Adaptive Typing Practice",
  description: "Practice touch typing with exercises that adjust to your results on each key.",
  path: "/learn/practice",
});

export default function GuidedPracticePage() {
  return <><section className="practice-page-context practice-page-intro" aria-labelledby="adaptive-practice-title"><div><PracticeBreadcrumb /><h1 id="adaptive-practice-title">Adaptive typing practice</h1><p>Begin with a small group of letters. The next exercise adjusts to your results, and your progress stays in this browser.</p></div></section><GuidedPractice /><nav className="practice-page-context practice-page-bottom" aria-label="After adaptive practice"><Link href="/learn/courses">Browse typing lessons ↗</Link><Link href="/">Retest your speed ↗</Link></nav></>;
}

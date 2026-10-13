import type { Metadata } from "next";
import CourseCatalog from "@/components/learning/CourseCatalog";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Touch Typing Lessons",
  description: "Choose from 15 English QWERTY typing lessons covering letter keys and capitals.",
  path: "/learn/courses",
});

export default function CoursesPage() {
  return <><section className="practice-page-context" aria-label="About typing lessons"><p>The 15 English QWERTY lessons introduce letters and capitals in stages. Choose a lesson, repeat it, and track completion in this browser.</p><Link href="/learn">All practice options ↗</Link></section><CourseCatalog /><nav className="practice-page-context practice-page-bottom" aria-label="After typing lessons"><Link href="/learn/practice">Try adaptive practice ↗</Link><Link href="/">Retest your speed ↗</Link></nav></>;
}

import type { Metadata } from "next";
import Link from "next/link";
import ParagraphPractice from "@/components/learning/ParagraphPractice";
import { paragraphSets } from "@/lib/learning/paragraph-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Paragraph Typing Practice",
  description: "Practice original English paragraphs by level and topic, complete three-part sets, track accuracy and speed, and review problem keys.",
  path: "/learn/paragraphs",
});

export default function ParagraphsPage() {
  return <main className="learning-page paragraph-page"><h1 className="sr-only">Paragraph practice</h1><ParagraphPractice sets={paragraphSets} /><section className="paragraph-next"><h2>Turn mistakes into practice.</h2><p><Link href="/learn/practice">Adaptive practice</Link> strengthens individual keys. <Link href="/learn/courses">Typing lessons</Link> introduce keys in sequence. When you are ready to measure sustained speed, <Link href="/">take a timed test</Link>.</p></section></main>;
}

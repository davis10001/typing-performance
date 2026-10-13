import type { Metadata } from "next";
import Link from "next/link";
import ParagraphPractice from "@/components/learning/ParagraphPractice";
import { testTexts } from "@/lib/content/test-texts";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Paragraph Typing Practice Without a Timer",
  description: "Choose an original English paragraph, practice typing without a countdown, and see your actual mistakes and keypress accuracy.",
  path: "/learn/paragraphs",
});

const titles = ["Everyday writing", "Focused work", "A new route"];
const paragraphs = testTexts.filter((item) => item.sourceType === "original" && item.difficulty === "standard").slice(0, 3).map((item, index) => ({
  id: item.id,
  title: titles[index],
  text: `${item.text.split(". ").slice(0, 4).join(". ").replace(/\.$/, "")}.`,
}));

export default function ParagraphsPage() {
  return <main className="learning-page paragraph-page"><header className="learning-hero"><h1>Paragraph practice.<br /><strong>At your pace.</strong></h1><p>Work through a complete passage without a timer. See where you made errors, then try again or take a timed test to measure WPM.</p></header><ParagraphPractice paragraphs={paragraphs} /><section className="paragraph-next"><h2>Want a different kind of practice?</h2><p><Link href="/learn/practice">Adaptive practice</Link> focuses on individual keys. <Link href="/learn/courses">Typing lessons</Link> build letter skills in a sequence. Your paragraph attempt stays on this page and is not added to your timed test history.</p></section></main>;
}

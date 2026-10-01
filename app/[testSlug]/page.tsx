import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TestShell from "@/components/typing/TestShell";
import { buildTestPrompt } from "@/lib/content/test-texts";
import { testPages, type TestPageSlug } from "@/lib/content/test-pages";

type Props = { params: Promise<{ testSlug: string }> };

function isTestSlug(value: string): value is TestPageSlug {
  return Object.prototype.hasOwnProperty.call(testPages, value);
}

export function generateStaticParams() {
  return Object.keys(testPages).map((testSlug) => ({ testSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { testSlug } = await params;
  if (!isTestSlug(testSlug)) return {};
  const config = testPages[testSlug];
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: `/${config.slug}` },
  };
}

export default async function TestPage({ params }: Props) {
  const { testSlug } = await params;
  if (!isTestSlug(testSlug)) notFound();
  const config = testPages[testSlug];
  const prompt = buildTestPrompt();
  const [firstTitleWord, ...otherTitleWords] = config.title.toUpperCase().split(" ");

  return (
    <main className="test-page">
      <section className="test-page-intro">
        <h1 aria-label={config.title.toUpperCase()}><span className="heavy">{firstTitleWord}</span>{" "}{otherTitleWords.join(" ")}</h1>
        <p>{config.intro}</p>
      </section>
      <TestShell durationSeconds={config.durationSeconds} prompt={prompt} entryPage={testSlug} />
      <section className="test-explainer" aria-labelledby="test-explainer-title">
        <div><span className="eyebrow dark">ABOUT THIS TEST</span><h2 id="test-explainer-title">MEASURE WITH<br /><strong>CONTEXT.</strong></h2></div>
        <div><p>{config.guidance}</p><p>Correct WPM counts the characters that match the passage, divided by five and by the time in minutes. Raw WPM counts every character you typed. Accuracy compares correct character keypresses with all character keypresses.</p><div className="text-links"><Link href="/average-wpm">How WPM works ↗</Link><Link href="/average-typing-speed">Understand typing speed ↗</Link></div></div>
      </section>
      <section className="faq-section" aria-labelledby="faq-title"><span className="eyebrow">SHORT ANSWERS</span><h2 id="faq-title">GOOD TO <strong>KNOW.</strong></h2><div className="faq-list">{config.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import TestShell from "@/components/typing/TestShell";
import { testTexts } from "@/lib/content/test-texts";
import { testPages, type TestPageSlug } from "@/lib/content/test-pages";
import { buildPageMetadata, siteUrl } from "@/lib/seo";

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
  return buildPageMetadata({ title: config.title, description: config.description, path: `/${config.slug}` });
}

export default async function TestPage({ params }: Props) {
  const { testSlug } = await params;
  if (!isTestSlug(testSlug)) notFound();
  const config = testPages[testSlug];
  const pageUrl = `${siteUrl}/${config.slug}`;
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: config.title,
        description: config.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "en",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: config.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
  return (
    <main className="test-page">
      <JsonLd data={pageJsonLd} />
      <section className="test-intro" aria-labelledby="test-title">
        <h1 id="test-title">{config.title}</h1>
        <p>{config.intro}</p>
      </section>
      <TestShell durationSeconds={config.durationSeconds} texts={testTexts.map(({ id, difficulty, text }) => ({ id, difficulty, text }))} entryPage={testSlug} />
      <section className="test-explainer" aria-labelledby="test-explainer-title">
        <div><span className="eyebrow dark">ABOUT THIS TEST</span><h2 id="test-explainer-title">UNDERSTAND<br /><strong>YOUR SCORE.</strong></h2></div>
        <div><p>{config.guidance}</p><p>Correct WPM counts the characters that match the passage, divided by five and by the time in minutes. Raw WPM counts every character you typed. Accuracy compares correct character keypresses with all character keypresses.</p><div className="text-links"><Link href="/how-wpm-is-calculated">How WPM works ↗</Link><Link href="/average-typing-speed">See average typing speed ↗</Link></div></div>
      </section>
      <section className="faq-section" aria-labelledby="faq-title"><span className="eyebrow">SHORT ANSWERS</span><h2 id="faq-title">GOOD TO <strong>KNOW.</strong></h2><div className="faq-list">{config.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>
    </main>
  );
}

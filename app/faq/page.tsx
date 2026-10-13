import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Typing Speed FAQ: WPM, Accuracy & Test Scores",
  description: "Answers to common typing test questions about good and average typing speed, WPM, accuracy, mistakes, and test length.",
  path: "/faq",
});

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  links?: { text: string; href: string }[];
};

const faqItems: FaqItem[] = [
  { id: "faq-good-speed", question: "What is a good typing speed?", answer: "It depends on what you need to type. Aim for a pace you can hold without frequent corrections, and compare attempts at the same duration. Interpret your own WPM and accuracy.", links: [{ text: "Interpret your own WPM and accuracy.", href: "/good-typing-speed" }] },
  { id: "faq-average-speed", question: "What is the average typing speed?", answer: "In an Aalto University study of about 168,000 self-selected online volunteers, the average was 52 WPM, with most participants between 30 and 60 WPM. Treat that average as a research reference rather than a target for everyone. More on average typing speed.", links: [{ text: "Aalto University study", href: "https://www.aalto.fi/en/news/the-traits-of-fast-typists-discovered-by-analysing-136-million-keystrokes" }, { text: "More on average typing speed.", href: "/average-typing-speed" }] },
  { id: "faq-wpm", question: "How is WPM calculated in this typing test?", answer: "TypingLevel divides the number of characters that match the passage by five, then by elapsed minutes. If 250 characters match in exactly one minute, that is 50 correct WPM. Raw WPM uses every character entered during the test, so the two numbers can differ. See how WPM is calculated.", links: [{ text: "See how WPM is calculated.", href: "/how-wpm-is-calculated" }] },
  { id: "faq-improve", question: "How can I improve my typing speed and accuracy?", answer: "Slow down enough to notice which words or keys trip you up. Try adaptive key practice or untimed paragraph practice, then retest at the same duration to see whether pace and accuracy improve.", links: [{ text: "adaptive key practice", href: "/learn/practice" }, { text: "untimed paragraph practice", href: "/learn/paragraphs" }] },
  { id: "faq-one-minute", question: "Is a one-minute typing test enough?", answer: "A one-minute test gives you a quick check. A slow start or tricky sentence can have a bigger effect on a short run, so compare several attempts. Try a three-minute test if you want to see how your pace holds for longer.", links: [{ text: "one-minute test", href: "/1-minute-typing-test" }, { text: "three-minute test", href: "/3-minute-typing-test" }] },
  { id: "faq-accuracy", question: "What is a good typing accuracy?", answer: "There is no single cutoff that suits every task. On this test, accuracy is the share of character keys you got right when you pressed them. If 90 out of 100 character keys were correct, your accuracy is 90%. Read it with correct WPM, since corrections take time." },
  { id: "faq-vary", question: "Why do my typing test results vary?", answer: "The passage, punctuation, difficulty setting, and test length can all change your result. Corrections take time, too. Compare runs at the same duration and difficulty, then look at several scores instead of only your fastest one." },
  { id: "faq-mistakes", question: "How do mistakes and backspaces affect my WPM?", answer: "A wrong key adds an error. Backspace removes the last character from your final text, but it does not erase the original error or its effect on accuracy; the timer keeps running. Correcting the text can improve correct WPM. Raw WPM counts characters you type again, but not the Backspace key itself." },
];

function FaqAnswer({ item }: { item: FaqItem }) {
  if (!item.links?.length) return item.answer;
  const parts: ReactNode[] = [];
  let rest = item.answer;
  item.links.forEach((link, index) => {
    const start = rest.indexOf(link.text);
    if (start === -1) return;
    if (start > 0) parts.push(rest.slice(0, start));
    parts.push(link.href.startsWith("http")
      ? <a key={link.href} href={link.href}>{link.text}</a>
      : <Link key={link.href} href={link.href}>{link.text}</Link>);
    rest = rest.slice(start + link.text.length);
    if (index === item.links!.length - 1 && rest) parts.push(rest);
  });
  return parts;
}

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/faq#faq`,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main className="content-page faq-page">
      <JsonLd data={faqJsonLd} />
      <section className="content-hero" aria-labelledby="faq-title">
        <div className="faq-hero-copy">
          <span className="eyebrow dark">HELP / TYPING TEST</span>
          <h1 id="faq-title">TYPING<br />{" "}<strong>FAQ.</strong></h1>
        </div>
        <p>Typing speed, accuracy, and how this test scores your work.</p>
        <Image className="faq-hero-art" src="/images/typing-faq-hero.png" alt="" width={1672} height={941} unoptimized />
      </section>
      <section className="faq-section" aria-label="Frequently asked questions">
        <div className="faq-list">
          {faqItems.map((item) => (
            <section className="faq-entry" aria-labelledby={item.id} key={item.id}>
              <h2 id={item.id}>{item.question}</h2>
              <p><FaqAnswer item={item} /></p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

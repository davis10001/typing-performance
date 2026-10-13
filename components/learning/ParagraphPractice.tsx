"use client";

import Link from "next/link";
import { useState } from "react";
import { accuracyBucket, telemetry } from "@/lib/telemetry/adapter";

type Paragraph = { id: string; title: string; text: string };

export default function ParagraphPractice({ paragraphs }: { paragraphs: Paragraph[] }) {
  const [selected, setSelected] = useState(0);
  const [typed, setTyped] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const paragraph = paragraphs[selected];
  const accuracy = attempts ? Math.round((attempts - mistakes) / attempts * 1000) / 10 : 100;
  const remainingErrors = [...typed].filter((character, index) => character !== paragraph.text[index]).length;

  function reset(next = selected) {
    setSelected(next);
    setTyped("");
    setAttempts(0);
    setMistakes(0);
    setFinished(false);
  }

  function change(next: string) {
    if (finished) return;
    const value = next.slice(0, paragraph.text.length);
    let prefix = 0;
    while (prefix < typed.length && prefix < value.length && typed[prefix] === value[prefix]) prefix += 1;
    let suffix = 0;
    while (typed.length - suffix > prefix && value.length - suffix > prefix && typed[typed.length - suffix - 1] === value[value.length - suffix - 1]) suffix += 1;
    const inserted = value.slice(prefix, value.length - suffix);
    const addedMistakes = [...inserted].filter((character, index) => character !== paragraph.text[prefix + index]).length;
    const nextAttempts = attempts + inserted.length;
    const nextMistakes = mistakes + addedMistakes;
    setTyped(value);
    setAttempts(nextAttempts);
    setMistakes(nextMistakes);
    if (value.length === paragraph.text.length) {
      setFinished(true);
      const bucket = accuracyBucket(nextAttempts ? (nextAttempts - nextMistakes) / nextAttempts * 100 : 100);
      if (bucket !== "none") telemetry.event({ name: "paragraph_complete", accuracy_bucket: bucket });
    }
  }

  return <section className="paragraph-tool" aria-labelledby="paragraph-tool-title">
    <div className="paragraph-tool-top"><div><h2 id="paragraph-tool-title">Choose a paragraph.</h2><p>No countdown. Type the passage, correct mistakes if you like, and review your accuracy when you finish.</p></div><Link href="/learn">All practice options ↗</Link></div>
    <div className="paragraph-choices" role="group" aria-label="Choose a practice paragraph">{paragraphs.map((item, index) => <button type="button" key={item.id} aria-pressed={index === selected} onClick={() => reset(index)}>{item.title}</button>)}</div>
    <div className="paragraph-workspace">
      <p className="paragraph-source">Original TypingLevel practice text · {paragraph.text.length} characters</p>
      <p id="paragraph-prompt" className="paragraph-prompt">{[...paragraph.text].map((character, index) => <span className={index < typed.length ? typed[index] === character ? "typed-correct" : "typed-error" : ""} key={index}>{character}</span>)}</p>
      <label className="paragraph-input-label" htmlFor="paragraph-input">Type the paragraph here</label>
      <textarea id="paragraph-input" value={typed} onChange={(event) => change(event.target.value)} onPaste={(event) => event.preventDefault()} onDrop={(event) => event.preventDefault()} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} readOnly={finished} rows={5} aria-describedby="paragraph-prompt paragraph-help" />
      <p id="paragraph-help" className="paragraph-help">{finished ? "Paragraph complete." : `${typed.length} of ${paragraph.text.length} characters entered. Backspace lets you correct the final text; earlier mistaken keystrokes still count toward accuracy.`}</p>
      {finished && <div className="paragraph-result" role="status"><h3>Paragraph complete</h3><p><strong>{accuracy}%</strong> keypress accuracy · <strong>{mistakes}</strong> mistaken character{mistakes === 1 ? "" : "s"} · <strong>{remainingErrors}</strong> still in the final text</p><p>Accuracy counts character inputs, including mistakes you later corrected. This is untimed practice, so it does not produce a WPM test result.</p><div><button type="button" className="button button-primary" onClick={() => reset()}>Practice this again</button><Link className="button button-secondary" href="/">Take a timed test</Link></div></div>}
    </div>
  </section>;
}

"use client";

import KeyboardGuide from "@/components/typing/KeyboardGuide";
import { alignTypingInput } from "@/lib/typing-engine/alignment";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  text: string;
  actual?: string;
  position: number;
  onCharacter: (character: string, timeStamp: number) => void;
  onBackspace: (word: boolean, timeStamp: number) => void;
  onBlur?: () => void;
  blurBehavior?: "reset" | "pause";
  status?: "idle" | "error";
  label: string;
  highlightCharacters?: readonly string[];
  showOnlyHighlightedCharacters?: boolean;
};

export default function LearningPracticeSurface({
  text,
  actual,
  position,
  onCharacter,
  onBackspace,
  onBlur,
  blurBehavior = "reset",
  status = "idle",
  label,
  highlightCharacters,
  showOnlyHighlightedCharacters,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const passageRef = useRef<HTMLDivElement>(null);
  const startHistoryRef = useRef([0]);
  const [windowStart, setWindowStart] = useState(0);
  useEffect(() => { inputRef.current?.focus(); }, [text]);

  const chars = [...text];
  const alignment = actual == null ? null : alignTypingInput(text, actual);
  const nextCharacter = chars[position] ?? null;
  const visibleCharacters = chars.slice(windowStart);

  useLayoutEffect(() => {
    if (position < windowStart) {
      const previousStart = startHistoryRef.current.findLast((candidate) => candidate <= position) ?? 0;
      startHistoryRef.current = startHistoryRef.current.filter((candidate) => candidate <= previousStart);
      setWindowStart(previousStart);
      return;
    }

    const passage = passageRef.current;
    const current = passage?.querySelector<HTMLElement>(`[data-learning-index="${position}"]`);
    if (!passage || !current) return;

    const characters = Array.from(passage.querySelectorAll<HTMLElement>("[data-learning-index]"));
    const lineTops = [...new Set(characters.map((character) => character.offsetTop))];
    const currentLine = lineTops.indexOf(current.offsetTop);
    const lineHeight = Number.parseFloat(getComputedStyle(passage).lineHeight);
    const visibleLines = Math.max(1, Math.floor(passage.clientHeight / lineHeight));
    const previewLines = visibleLines > 1 ? 1 : 0;
    if (currentLine < visibleLines - previewLines) return;

    const nextTop = lineTops[currentLine - visibleLines + previewLines + 1];
    const nextLineStart = characters.find((character) => character.offsetTop === nextTop);
    const nextStart = Number(nextLineStart?.dataset.learningIndex);
    if (!Number.isFinite(nextStart) || nextStart <= windowStart) return;

    startHistoryRef.current = [...startHistoryRef.current, nextStart];
    setWindowStart(nextStart);
  }, [position, windowStart, visibleCharacters]);

  return (
    <section
      className={`learning-practice-surface ${status === "error" ? "has-error" : ""}`}
      onClick={() => inputRef.current?.focus()}
      aria-label={label}
    >
      <div ref={passageRef} className="learning-passage" data-window-start={windowStart} aria-hidden="true">
        {visibleCharacters.map((character, relativeIndex) => {
          const index = windowStart + relativeIndex;
          let className = "learning-char";
          const state = alignment?.characterStates.get(index);
          if (state) className += state === "error" ? " typed-error" : " typed-correct";
          else if (index < position) className += " typed-correct";
          else if (index === position) className += " typed-current";
          if (character === " " && index === position && alignment?.extraCharacters.has(index)) className += " typed-space-error";
          return <span className={className} data-learning-index={index} key={index}>{character}</span>;
        })}
      </div>
      <textarea
        ref={inputRef}
        className="typing-capture-input"
        aria-label="Type the exercise here"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value=""
        onBlur={onBlur}
        onChange={() => {}}
        onPaste={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.repeat || event.metaKey || (event.ctrlKey && event.key !== "Backspace") || event.altKey) return;
          if (event.key === "Backspace") {
            event.preventDefault();
            onBackspace(event.ctrlKey, event.timeStamp);
            return;
          }
          const character = event.key === "Enter" ? "\n" : event.key;
          if ([...character].length === 1 || character === "\n") {
            event.preventDefault();
            onCharacter(character, event.timeStamp);
          }
        }}
      />
      <p className="learning-focus-note">Type to begin. Pasting is disabled. Leaving the exercise {blurBehavior === "reset" ? "resets an unfinished round" : "pauses the lesson timer"}.</p>
      <KeyboardGuide
        nextCharacter={nextCharacter}
        highlightCharacters={highlightCharacters}
        showOnlyHighlightedCharacters={showOnlyHighlightedCharacters}
      />
    </section>
  );
}

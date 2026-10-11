"use client";

import KeyboardGuide from "@/components/typing/KeyboardGuide";
import { useEffect, useRef } from "react";

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
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, [text]);

  const chars = [...text];
  const typed = actual == null ? null : [...actual];
  const nextCharacter = chars[position] ?? null;

  return (
    <section
      className={`learning-practice-surface ${status === "error" ? "has-error" : ""}`}
      onClick={() => inputRef.current?.focus()}
      aria-label={label}
    >
      <div className="learning-passage" aria-hidden="true">
        {chars.map((character, index) => {
          let className = "learning-char";
          if (index < position) {
            className += typed && typed[index] !== character ? " typed-error" : " typed-correct";
          } else if (index === position) className += " typed-current";
          return <span className={className} key={index}>{character}</span>;
        })}
      </div>
      <textarea
        ref={inputRef}
        className="typing-capture-input"
        aria-label="Type the learning exercise here"
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
      <KeyboardGuide nextCharacter={nextCharacter} />
    </section>
  );
}

"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ResetIcon from "@/components/ResetIcon";
import KeyboardGuide from "@/components/typing/KeyboardGuide";
import ResultPaceChart, { type PaceSample } from "@/components/typing/ResultPaceChart";
import { composeTestPrompt, nextTextIndex, type Difficulty, type PromptText } from "@/lib/content/prompt-selection";
import { durationOptions, type TestPageSlug } from "@/lib/content/test-pages";
import { saveHistory } from "@/lib/history/repository";
import { calculateResult } from "@/lib/scoring/calculate";
import { accuracyBucket, telemetry, wpmBucket } from "@/lib/telemetry/adapter";
import {
  applyBackspace, applyCharacter, beginRunning,
  completeSession, createSession, deadline, recordAnomaly,
} from "@/lib/typing-engine/machine";
import { alignTypingInput } from "@/lib/typing-engine/alignment";
import type { AnomalyFlag, TestResult, TestSession } from "@/lib/typing-engine/types";

type Props = {
  durationSeconds: 60 | 120 | 180 | 300 | 600;
  texts: PromptText[];
  entryPage: TestPageSlug;
};

type TypingFontSize = "small" | "medium" | "large";

const fingerGuideStorageKey = "typing-level:finger-guide:v1";
const typingSoundStorageKey = "typing-level:typing-sound:v1";
const recentTextsStorageKey = "typing-level:recent-texts:v1";
const difficultyStorageKey = "typing-level:difficulty:v1";
const fontSizeStorageKey = "typing-level:font-size:v1";
const durationHandoffStorageKey = "typing-level:duration-handoff:v1";
const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "standard", label: "Standard" },
  { value: "advanced", label: "Advanced" },
];
const fontSizeOptions: { value: TypingFontSize; label: string; shortLabel: string }[] = [
  { value: "small", label: "Small", shortLabel: "S" },
  { value: "medium", label: "Medium", shortLabel: "M" },
  { value: "large", label: "Large", shortLabel: "L" },
];
const visiblePromptCharacters = 520;
const visiblePromptLines = 5;

function formatScore(value: number | null, suffix = ""): string {
  return value === null ? "—" : `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
}

function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function appendPaceSample(samples: PaceSample[], session: TestSession, elapsedSeconds: number): PaceSample[] {
  const seconds = Math.min(session.durationSeconds, elapsedSeconds);
  if (seconds <= 0 || seconds <= (samples.at(-1)?.elapsedSeconds ?? 0)) return samples;
  const { correctCharacters } = alignTypingInput(session.prompt, session.typed);
  return [...samples, {
    elapsedSeconds: seconds,
    correctWpm: Math.round(correctCharacters * 120 / seconds) / 10,
    rawWpm: Math.round(session.totalInputChars * 120 / seconds) / 10,
  }];
}

function TimeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.5 2" />
    </svg>
  );
}

function DifficultyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" />
      <circle cx="9" cy="7" r="1.7" />
      <circle cx="15" cy="12" r="1.7" />
      <circle cx="11" cy="17" r="1.7" />
    </svg>
  );
}

function SoundIcon({ enabled }: { enabled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      {enabled ? <><path d="M16 9a4 4 0 0 1 0 6" /><path d="M19 6a8 8 0 0 1 0 12" /></> : <path d="M4 20 20 4" />}
    </svg>
  );
}

function KeyboardIcon({ enabled }: { enabled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M6 9h1m3 0h1m3 0h1m3 0h1M6 12h1m3 0h1m3 0h1m3 0h1M7 16h10" />
      {!enabled && <path d="M3 21 21 3" />}
    </svg>
  );
}

function TextRenderer({ prompt, typed, active }: { prompt: string; typed: string; active: boolean }) {
  const { cursorIndex, characterStates, extraCharacters } = alignTypingInput(prompt, typed);
  const passageRef = useRef<HTMLDivElement>(null);
  const startHistoryRef = useRef([0]);
  const [windowStart, setWindowStart] = useState(0);
  const start = windowStart;
  const end = prompt.indexOf(" ", Math.max(start + visiblePromptCharacters, cursorIndex + 1));
  const visible = prompt.slice(start, end < 0 ? undefined : end);

  useLayoutEffect(() => {
    if (cursorIndex < start) {
      const previousStart = startHistoryRef.current.findLast((candidate) => candidate <= cursorIndex) ?? 0;
      startHistoryRef.current = startHistoryRef.current.filter((candidate) => candidate <= previousStart);
      setWindowStart(previousStart);
      return;
    }

    const passage = passageRef.current;
    const current = passage?.querySelector<HTMLElement>(`[data-prompt-index="${cursorIndex}"]`);
    if (!passage || !current) return;

    const characters = Array.from(passage.querySelectorAll<HTMLElement>("[data-prompt-index]"));
    const lineTops = [...new Set(characters.map((character) => character.offsetTop))];
    const currentLine = lineTops.indexOf(current.offsetTop);
    if (currentLine < visiblePromptLines) return;

    const nextTop = lineTops[currentLine - visiblePromptLines + 1];
    const nextLineStart = characters.find((character) => character.offsetTop === nextTop);
    const nextStart = Number(nextLineStart?.dataset.promptIndex);
    if (!Number.isFinite(nextStart) || nextStart <= start) return;

    startHistoryRef.current = [...startHistoryRef.current, nextStart];
    setWindowStart(nextStart);
  }, [cursorIndex, prompt, start, visible]);

  return (
    <div
      ref={passageRef}
      className="typing-passage"
      role="text"
      aria-label={`Text to type: ${visible}`}
      data-window-start={start}
    >
      {Array.from(visible).map((character, relativeIndex) => {
        const index = start + relativeIndex;
        const state = characterStates.get(index);
        const className = state === "correct"
          ? "typed-correct"
          : state === "error"
            ? "typed-error"
            : (active && index === cursorIndex ? "typed-current" : "");
        const extras = extraCharacters.get(index);
        return (
          <Fragment key={index}>
            {extras && <span className="typed-extra" aria-hidden="true">{extras}</span>}
            <span className={className} data-prompt-index={index} aria-hidden="true">{character}</span>
          </Fragment>
        );
      })}
    </div>
  );
}

export default function TestShell({ durationSeconds, texts, entryPage }: Props) {
  const [session, setSession] = useState<TestSession>(() => createSession("unstarted", durationSeconds, composeTestPrompt(texts.filter((item) => item.difficulty === "standard"), 0)));
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [fontSize, setFontSize] = useState<TypingFontSize>("medium");
  const [remainingMs, setRemainingMs] = useState(durationSeconds * 1000);
  const sessionRef = useRef(session);
  const promptInitializedRef = useRef(false);
  const recentTextIdsRef = useRef<string[]>([texts.find((item) => item.difficulty === "standard")!.id]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [paceSamples, setPaceSamples] = useState<PaceSample[]>([]);
  const paceSamplesRef = useRef<PaceSample[]>([]);
  const [storageWarning, setStorageWarning] = useState(false);
  const [inputWarning, setInputWarning] = useState("");
  const [fingerGuideEnabled, setFingerGuideEnabled] = useState(true);
  const [typingSoundEnabled, setTypingSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickBufferRef = useRef<AudioBuffer | null>(null);

  const choosePrompt = useCallback((level: Difficulty) => {
    const options = texts.filter((item) => item.difficulty === level);
    if (options.every((item) => recentTextIdsRef.current.includes(item.id))) {
      const used = new Set(options.map((item) => item.id));
      recentTextIdsRef.current = recentTextIdsRef.current.filter((id) => !used.has(id));
    }
    const index = nextTextIndex(options, recentTextIdsRef.current);
    recentTextIdsRef.current = [...recentTextIdsRef.current, options[index].id].slice(-texts.length);
    try {
      window.localStorage.setItem(recentTextsStorageKey, JSON.stringify(recentTextIdsRef.current));
    } catch {
      // Text rotation still works for the current visit when storage is unavailable.
    }
    return composeTestPrompt(options, index);
  }, [texts]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (promptInitializedRef.current) return;
      promptInitializedRef.current = true;
      if (sessionRef.current.id !== "unstarted" || sessionRef.current.phase !== "ready") return;
      try {
        const rawHandoff = window.sessionStorage.getItem(durationHandoffStorageKey);
        window.sessionStorage.removeItem(durationHandoffStorageKey);
        if (rawHandoff) {
          const handoff: unknown = JSON.parse(rawHandoff);
          if (
            typeof handoff === "object" && handoff !== null
            && "prompt" in handoff && typeof handoff.prompt === "string" && handoff.prompt.length > 0
            && "difficulty" in handoff
            && (handoff.difficulty === "easy" || handoff.difficulty === "standard" || handoff.difficulty === "advanced")
          ) {
            setDifficulty(handoff.difficulty);
            const next = createSession("unstarted", durationSeconds, handoff.prompt);
            sessionRef.current = next;
            setSession(next);
            return;
          }
        }
      } catch {
        // A duration change can still complete when session storage is unavailable.
      }
      try {
        const stored: unknown = JSON.parse(window.localStorage.getItem(recentTextsStorageKey) ?? "[]");
        if (Array.isArray(stored)) recentTextIdsRef.current = stored.filter((id): id is string => typeof id === "string").slice(-texts.length);
      } catch {
        recentTextIdsRef.current = [];
      }
      let level: Difficulty = "standard";
      try {
        const stored = window.localStorage.getItem(difficultyStorageKey);
        if (stored === "easy" || stored === "standard" || stored === "advanced") level = stored;
      } catch {
        // The default difficulty remains available without browser storage.
      }
      setDifficulty(level);
      const next = createSession("unstarted", durationSeconds, choosePrompt(level));
      sessionRef.current = next;
      setSession(next);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [choosePrompt, durationSeconds, texts.length]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedPreference = window.localStorage.getItem(fingerGuideStorageKey);
        if (storedPreference !== null) {
          setFingerGuideEnabled(storedPreference === "on");
          return;
        }
        const compactPointer = window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;
        setFingerGuideEnabled(!compactPointer);
      } catch {
        setFingerGuideEnabled(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(fontSizeStorageKey);
        if (stored === "small" || stored === "medium" || stored === "large") setFontSize(stored);
      } catch {
        // The default text size remains available without browser storage.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setTypingSoundEnabled(window.localStorage.getItem(typingSoundStorageKey) !== "off");
      } catch {
        // Sound remains available when storage is unavailable.
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (audioContextRef.current) void audioContextRef.current.close();
      audioContextRef.current = null;
    };
  }, []);

  useEffect(() => {
    const current = sessionRef.current;
    if (current.phase !== "ready" || current.durationSeconds === durationSeconds) return;
    const next = createSession(current.id, durationSeconds, current.prompt);
    sessionRef.current = next;
    setSession(next);
    setRemainingMs(durationSeconds * 1000);
    inputRef.current?.focus();
  }, [durationSeconds]);

  const commit = useCallback((next: TestSession) => {
    const previous = sessionRef.current;
    sessionRef.current = next;
    setSession(next);
    if (next.phase === "completed") setRemainingMs(0);
    if (next.phase === "completed" && previous.phase !== "completed") {
      paceSamplesRef.current = appendPaceSample(paceSamplesRef.current, next, (next.endedAt! - next.startedAt!) / 1000);
      setPaceSamples(paceSamplesRef.current);
      const nextResult = calculateResult(next);
      setResult(nextResult);
      if (!nextResult) { telemetry.error("scoring"); return; }
      telemetry.event({
        name: "test_complete", duration: durationSeconds,
        wpm_bucket: wpmBucket(nextResult.wpm), accuracy_bucket: accuracyBucket(nextResult.accuracy),
        anomaly_flags: nextResult.anomalyFlags,
      });
      if (nextResult.wpm === null) return;
      try {
        if (!saveHistory(window.localStorage, nextResult, new Date())) { setStorageWarning(true); telemetry.error("storage_write"); }
        else window.dispatchEvent(new Event("typing-level:history-updated"));
      } catch { setStorageWarning(true); telemetry.error("storage_write"); }
    }
  }, [durationSeconds]);

  useEffect(() => {
    telemetry.event({ name: "test_view", page: entryPage, configured_duration: durationSeconds });
  }, [entryPage, durationSeconds]);

  useEffect(() => {
    if (session.phase === "ready" || session.phase === "running") inputRef.current?.focus();
  }, [session.phase]);

  useEffect(() => {
    if (session.phase !== "running") return;
    const updateCountdown = () => {
      const current = sessionRef.current;
      const end = deadline(current);
      if (end === null) return;
      const left = Math.max(0, end - performance.now());
      setRemainingMs(left);
      const elapsedWholeSeconds = Math.floor((durationSeconds * 1000 - left) / 1000);
      if (elapsedWholeSeconds > 0) paceSamplesRef.current = appendPaceSample(paceSamplesRef.current, current, elapsedWholeSeconds);
      if (left <= 0) commit(completeSession(current, performance.now()));
    };
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 100);
    return () => window.clearInterval(interval);
  }, [session.phase, commit, durationSeconds]);

  useEffect(() => {
    if (session.phase !== "running") return;
    const onVisibilityChange = () => {
      if (document.hidden) commit(recordAnomaly(sessionRef.current, "hidden"));
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [session.phase, commit]);

  function prepareTest(isRetest = false) {
    if (isRetest) telemetry.event({ name: "result_retest", from_duration: durationSeconds, to_duration: durationSeconds });
    setResult(null);
    paceSamplesRef.current = [];
    setPaceSamples([]);
    setInputWarning("");
    setRemainingMs(durationSeconds * 1000);
    commit(createSession(crypto.randomUUID(), durationSeconds, choosePrompt(difficulty)));
    inputRef.current?.focus();
  }

  function changeDifficulty(level: Difficulty) {
    if (sessionRef.current.phase !== "ready" || level === difficulty) return;
    setDifficulty(level);
    try {
      window.localStorage.setItem(difficultyStorageKey, level);
    } catch {
      // The selection still works for this visit when storage is unavailable.
    }
    setInputWarning("");
    commit(createSession(crypto.randomUUID(), durationSeconds, choosePrompt(level)));
    inputRef.current?.focus();
  }

  function changeFontSize(size: TypingFontSize) {
    setFontSize(size);
    try {
      window.localStorage.setItem(fontSizeStorageKey, size);
    } catch {
      // The selected size still works for this visit when storage is unavailable.
    }
    restoreTypingFocus();
  }

  function preservePromptForDurationChange() {
    try {
      window.sessionStorage.setItem(durationHandoffStorageKey, JSON.stringify({
        difficulty,
        prompt: sessionRef.current.prompt,
      }));
    } catch {
      // Navigation still works if the current prompt cannot be handed off.
    }
  }

  function markAnomaly(flag: AnomalyFlag, message: string) {
    commit(recordAnomaly(sessionRef.current, flag));
    setInputWarning(message);
  }

  function toggleFingerGuide() {
    setFingerGuideEnabled((enabled) => {
      const next = !enabled;
      try {
        window.localStorage.setItem(fingerGuideStorageKey, next ? "on" : "off");
      } catch {
        // The guide still works for this visit when storage is unavailable.
      }
      return next;
    });
  }

  function toggleTypingSound() {
    setTypingSoundEnabled((enabled) => {
      const next = !enabled;
      try {
        window.localStorage.setItem(typingSoundStorageKey, next ? "on" : "off");
      } catch {
        // The sound control still works for this visit when storage is unavailable.
      }
      return next;
    });
  }

  function restoreTypingFocus() {
    window.requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  function playTypingClick(backspace = false) {
    if (!typingSoundEnabled || !window.AudioContext) return;
    try {
      const audio = audioContextRef.current ?? new window.AudioContext();
      audioContextRef.current = audio;
      if (audio.state === "suspended") void audio.resume();
      if (!clickBufferRef.current) {
        const length = Math.ceil(audio.sampleRate * 0.035);
        const buffer = audio.createBuffer(1, length, audio.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < length; index += 1) {
          samples[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 1.5);
        }
        clickBufferRef.current = buffer;
      }
      const source = audio.createBufferSource();
      const tone = audio.createBiquadFilter();
      const volume = audio.createGain();
      const now = audio.currentTime;
      source.buffer = clickBufferRef.current;
      source.playbackRate.value = (backspace ? 0.77 : 0.95) + Math.random() * 0.12;
      tone.type = "bandpass";
      tone.frequency.value = backspace ? 1150 : 1850;
      tone.Q.value = 0.7;
      volume.gain.setValueAtTime(0.22, now);
      volume.gain.exponentialRampToValueAtTime(0.004, now + 0.032);
      source.connect(tone).connect(volume).connect(audio.destination);
      source.start(now);
    } catch {
      // Audio is optional; typing must work even when the browser blocks it.
    }
  }

  function onInput(value: string) {
    const current = sessionRef.current;
    const now = performance.now();
    if (current.phase === "ready") {
      if (value.length !== 1) {
        if (value) setInputWarning("Use the keyboard to type one character at a time.");
        return;
      }
      const fresh = current.id === "unstarted" ? createSession(crypto.randomUUID(), durationSeconds, current.prompt) : current;
      telemetry.event({ name: "test_start", duration: durationSeconds, entry_page: entryPage });
      setInputWarning("");
      commit(applyCharacter(beginRunning(fresh, now), value, now));
      playTypingClick();
      return;
    }
    if (current.phase !== "running") return;
    if (value.length === current.typed.length + 1 && value.startsWith(current.typed)) {
      commit(applyCharacter(current, value.slice(-1), now));
      playTypingClick();
    } else if (value.length === current.typed.length - 1 && current.typed.startsWith(value)) {
      commit(applyBackspace(current, now));
      playTypingClick(true);
    } else if (value !== current.typed) {
      markAnomaly("composition", "Use the keyboard to type one character at a time.");
    }
  }

  const isActive = session.phase === "running";
  const isReady = session.phase === "ready";
  const inputHelp = isActive
    ? "Type the passage. Backspace is available; paste is disabled."
    : "The timer starts with your first typed character. Type the passage to begin.";
  const countdownSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const { cursorIndex: nextPromptIndex, correctCharacters } = alignTypingInput(session.prompt, session.typed);
  const elapsedMs = Math.max(0, durationSeconds * 1000 - remainingMs);
  const liveWpm = session.phase === "completed"
    ? result?.wpm ?? 0
    : elapsedMs >= 1000 ? Math.round(correctCharacters * 12_000 / elapsedMs) : 0;

  return (
    <div className="test-shell" data-phase={session.phase} data-font-size={fontSize}>
      <div className="test-toolbar">
        {isReady ? (
          <div className="test-toolbar-config">
            <div className="duration-cards" role="group" aria-label="Choose test duration">
              <span className="test-control-icon" aria-hidden="true"><TimeIcon /></span>
              {durationOptions.map((option) => (
                <Link
                  key={option.seconds}
                  href={option.href}
                  scroll={false}
                  className={`duration-card ${option.seconds === durationSeconds ? "selected" : ""}`}
                  aria-current={entryPage !== "typing-test" && option.seconds === durationSeconds ? "page" : undefined}
                  onNavigate={preservePromptForDurationChange}
                >
                  {option.label}
                </Link>
              ))}
            </div>
            <div className="difficulty-group" role="group" aria-label="Text difficulty">
              <span className="test-control-icon" aria-hidden="true"><DifficultyIcon /></span>
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="difficulty-option"
                  aria-pressed={difficulty === option.value}
                  onClick={() => changeDifficulty(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="font-size-group" role="group" aria-label="Typing text size">
              <span className="test-control-icon font-size-icon" aria-hidden="true">Aa</span>
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="font-size-option"
                  aria-label={`${option.label} text size`}
                  aria-pressed={fontSize === option.value}
                  onClick={() => changeFontSize(option.value)}
                >
                  <span className="font-size-label">{option.label}</span>
                  <span className="font-size-short-label" aria-hidden="true">{option.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="test-toolbar-status">
            <span className="test-toolbar-title">Typing Test</span>
            <time
              className="test-page-countdown"
              role="timer"
              aria-label={`${formatCountdown(remainingMs)} remaining`}
              dateTime={`PT${countdownSeconds}S`}
            >
              {formatCountdown(remainingMs)}
            </time>
            <span className="test-toolbar-separator" aria-hidden="true">·</span>
            <span className="test-page-wpm">{liveWpm} WPM</span>
          </div>
        )}
        {session.phase !== "completed" && <div className="test-toolbar-actions">
          <button
            type="button"
            className="test-feature-toggle typing-sound-toggle"
            role="switch"
            aria-checked={typingSoundEnabled}
            aria-label="Typing sound"
            title={typingSoundEnabled ? "Turn typing sound off" : "Turn typing sound on"}
            onClick={() => {
              toggleTypingSound();
              restoreTypingFocus();
            }}
          >
            <SoundIcon enabled={typingSoundEnabled} />
          </button>
          <button
            type="button"
            className="test-feature-toggle keyboard-guide-toggle"
            role="switch"
            aria-checked={fingerGuideEnabled}
            aria-label="Show finger guide"
            title={fingerGuideEnabled ? "Hide finger guide" : "Show finger guide"}
            onClick={() => {
              toggleFingerGuide();
              restoreTypingFocus();
            }}
          >
            <KeyboardIcon enabled={fingerGuideEnabled} />
          </button>
          <button type="button" className="new-testing" onClick={() => prepareTest(session.phase === "completed")}>
            <ResetIcon />
            <span>Reset</span>
          </button>
        </div>}
      </div>

      {session.phase !== "completed" ? (
        <section className={`typing-chamber ${fingerGuideEnabled ? "has-keyboard-guide" : ""}`} aria-label="Typing test">
          <span id="typing-instructions" className="sr-only">{inputHelp}</span>
          <label className="typing-stage">
            <span className="sr-only">Type the passage shown below</span>
            <TextRenderer key={session.prompt} prompt={session.prompt} typed={session.typed} active={isReady || isActive} />
            <textarea
              ref={inputRef}
              className="typing-capture-input"
              aria-label="Type the passage here"
              aria-describedby="typing-instructions"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              readOnly={!isReady && !isActive}
              tabIndex={isReady || isActive ? 0 : -1}
              value={session.typed}
              onChange={(event) => onInput(event.target.value)}
              onPaste={(event) => { event.preventDefault(); if (isActive) markAnomaly("paste", "Paste isn't available in a typing test."); else setInputWarning("Paste isn't available in a typing test."); }}
              onDrop={(event) => { event.preventDefault(); if (isActive) markAnomaly("drop", "Drag and drop isn't available in a typing test."); else setInputWarning("Drag and drop isn't available in a typing test."); }}
              onBlur={(event) => {
                const nextTarget = event.relatedTarget;
                const movingToToolbarToggle = nextTarget instanceof HTMLElement
                  && (nextTarget.classList.contains("keyboard-guide-toggle") || nextTarget.classList.contains("typing-sound-toggle"));
                if (isActive && !movingToToolbarToggle) commit(recordAnomaly(sessionRef.current, "blur"));
              }}
            />
          </label>
          {isReady && <div className="typing-divider" aria-hidden="true" />}
          {fingerGuideEnabled && (
            <KeyboardGuide nextCharacter={session.prompt[nextPromptIndex] ?? null} />
          )}
          {inputWarning && <p className="inline-warning" role="status">{inputWarning}</p>}
        </section>
      ) : result?.wpm === null ? (
        <section className="result-card" aria-labelledby="empty-result-title">
          <span className="eyebrow dark">TEST COMPLETE</span>
          <h2 id="empty-result-title" className="empty-result-heading">No score recorded.</h2>
          <p>You did not type during this attempt, so there is no WPM or accuracy to save. Start a fresh test when you are ready.</p>
          <button type="button" className="button button-primary reset-button" onClick={() => prepareTest(true)}>
            <ResetIcon />
            Reset
          </button>
        </section>
      ) : result ? (
        <section className="result-card" aria-labelledby="result-title">
          <p className="sr-only" role="status">Test complete. Your result is {formatScore(result.wpm)} words per minute.</p>
          <p className="result-context">{result.durationSeconds / 60}-minute test result</p>
          <div className="result-main">
            <div className="result-primary"><h2 id="result-title">{formatScore(result.wpm)}<span> WPM</span></h2><p>Typing speed</p></div>
            <div className="result-primary result-primary-accuracy"><strong>{formatScore(result.accuracy, "%")}</strong><p>Accuracy</p></div>
          </div>
          <div className="result-metrics">
            <div><strong>{formatScore(result.rawWpm)}</strong><span>Raw WPM</span></div>
            <div><strong>{result.errors}</strong><span>Errors</span></div>
          </div>
          <ResultPaceChart samples={paceSamples} durationSeconds={result.durationSeconds} />
          <div className="result-actions">
            <button type="button" className="button button-primary reset-button" onClick={() => prepareTest(true)}>
              <ResetIcon />
              Try again
            </button>
            <Link className="button button-secondary" href="/learn">Practice typing</Link>
            <Link className="result-explainer" href="/average-wpm" onClick={() => telemetry.event({ name: "benchmark_click", target_page: "average-wpm" })}>How scoring works</Link>
          </div>
        </section>
      ) : <p className="inline-warning" role="status">The result could not be calculated. Please start a new test.</p>}

      {storageWarning && <p className="storage-warning" role="status">Recent results could not be saved in this browser. You can still take tests and view this result.</p>}

    </div>
  );
}

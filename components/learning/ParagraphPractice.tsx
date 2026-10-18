"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import BackIcon from "@/components/BackIcon";
import PracticeBreadcrumb from "@/components/PracticeBreadcrumb";
import ResetIcon from "@/components/ResetIcon";
import { evaluateCourseAttempt } from "@/lib/learning/course-engine";
import { CourseInputSession } from "@/lib/learning/course-input";
import type { ParagraphLevel, ParagraphSet, PracticeParagraph } from "@/lib/learning/paragraph-content";
import {
  aggregateExpectedKeyErrors,
  appendParagraphAttempt,
  appendParagraphRetry,
  attemptsForRun,
  completedParagraphIds,
  createParagraphState,
  paragraphStateSchema,
  startParagraphRun,
  type ParagraphAttempt,
  type ParagraphState,
} from "@/lib/learning/paragraph-state";
import { updateLearning } from "@/lib/learning/browser-repository";
import { loadLearning } from "@/lib/learning/repository";
import { paragraphLearningScope } from "@/lib/learning/scopes";
import { alignTypingInput } from "@/lib/typing-engine/alignment";
import { accuracyBucket, telemetry } from "@/lib/telemetry/adapter";
import LearningPracticeSurface from "./LearningPracticeSurface";

type Phase = "catalog" | "practice" | "result" | "summary";

const keyboardArt = { src: "/images/paragraph-practice/capitals-punctuation-v2.png", width: 1671, height: 941 };
const storyArt = { src: "/images/paragraph-practice/story-practice-v2.png", width: 1671, height: 941 };
const paragraphCardArt = {
  "everyday-english": storyArt,
  "work-and-study": keyboardArt,
  "capitals-and-punctuation": keyboardArt,
  "story-practice": storyArt,
  "numbers-and-symbols": keyboardArt,
  "long-paragraphs": storyArt,
} as const;

function id(prefix: string) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random()}`;
}

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M7 5h8v8" /></svg>;
}

function displayKey(key: string) {
  if (key === " ") return "Space";
  if (key === "\n") return "Enter";
  return key;
}

export default function ParagraphPractice({ sets }: { sets: readonly ParagraphSet[] }) {
  const [state, setState] = useState<ParagraphState>(createParagraphState);
  const [level, setLevel] = useState<ParagraphLevel>("intermediate");
  const [phase, setPhase] = useState<Phase>("catalog");
  const [runId, setRunId] = useState<string | null>(null);
  const [setId, setSetId] = useState<string | null>(null);
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [actual, setActual] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "error">("idle");
  const [result, setResult] = useState<ReturnType<typeof evaluateCourseAttempt> | null>(null);
  const [resultAttempt, setResultAttempt] = useState<ParagraphAttempt | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const sessionRef = useRef(new CourseInputSession(""));
  const startedAt = useRef<number | null>(null);
  const elapsed = useRef(0);

  const selectedSet = sets.find((item) => item.id === setId) ?? null;
  const currentParagraph = selectedSet?.paragraphs[paragraphIndex] ?? null;
  const alignment = useMemo(
    () => currentParagraph ? alignTypingInput(currentParagraph.text, actual) : null,
    [actual, currentParagraph],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = loadLearning(localStorage, paragraphLearningScope, paragraphStateSchema);
      if (stored.status === "ready") {
        setState(stored.state);
        const activeSet = stored.state.activeRun && sets.find((item) => item.id === stored.state.activeRun?.setId);
        if (activeSet) setLevel(activeSet.level);
      } else if (stored.status === "invalid" || stored.status === "incompatible") {
        setMessage("We couldn't read your saved paragraph progress. Your saved data has not been changed.");
      } else if (stored.status === "unavailable") {
        setMessage("Paragraph progress could not be read or saved in this browser.");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [sets]);

  function resetInput(paragraph: PracticeParagraph) {
    sessionRef.current = new CourseInputSession(paragraph.text);
    startedAt.current = null;
    elapsed.current = 0;
    setActual("");
    setFeedback("idle");
    setResult(null);
    setResultAttempt(null);
  }

  async function beginSet(nextSet: ParagraphSet, resume: boolean) {
    const active = resume && state.activeRun?.setId === nextSet.id ? state.activeRun : null;
    let nextState = state;
    const nextRunId = active?.runId ?? id("paragraph-run");
    let nextIndex = active?.nextIndex ?? 0;
    setMessage(null);

    if (!active) {
      nextState = startParagraphRun(state, nextRunId, nextSet.id);
      const saved = await updateLearning({
        storage: localStorage,
        scope: paragraphLearningScope,
        stateSchema: paragraphStateSchema,
        initialState: createParagraphState,
        update: (fresh) => startParagraphRun(fresh, nextRunId, nextSet.id),
        locks: "locks" in navigator ? navigator.locks : undefined,
      });
      if (saved.status === "saved") nextState = saved.state;
      else setMessage("This set is ready, but its progress could not be saved in this browser.");
    }

    nextIndex = Math.min(nextIndex, nextSet.paragraphs.length - 1);
    setState(nextState);
    setRunId(nextRunId);
    setSetId(nextSet.id);
    setParagraphIndex(nextIndex);
    setRetrying(false);
    resetInput(nextSet.paragraphs[nextIndex]);
    setPhase("practice");
  }

  function handleCharacter(character: string) {
    if (!currentParagraph || !alignment || saving) return;
    const now = performance.now();
    if (startedAt.current == null) startedAt.current = now;
    setFeedback(character === currentParagraph.text[alignment.cursorIndex] ? "idle" : "error");
    const snapshot = sessionRef.current.append(character);
    setActual(snapshot.actual);
    if (!snapshot.completed || !selectedSet || !runId) return;

    const attempt: ParagraphAttempt = {
      attemptId: id("paragraph-attempt"),
      runId,
      setId: selectedSet.id,
      paragraphId: currentParagraph.id,
      correctCharacters: snapshot.correctCharacters,
      errorCount: snapshot.errorCount,
      elapsedMilliseconds: Math.max(0, Math.round(elapsed.current + now - (startedAt.current ?? now))),
      errorsByExpectedKey: snapshot.errorsByExpectedKey,
      completedAt: Date.now(),
    };
    const evaluated = evaluateCourseAttempt(attempt);
    const bucket = accuracyBucket(evaluated.accuracy * 100);
    if (bucket !== "none") telemetry.event({ name: "paragraph_complete", accuracy_bucket: bucket });
    startedAt.current = null;
    setSaving(true);

    const localUpdate = (current: ParagraphState) => retrying
      ? appendParagraphRetry(current, attempt)
      : appendParagraphAttempt(current, attempt, selectedSet.paragraphs.length);
    let localState: ParagraphState;
    try {
      localState = localUpdate(state);
    } catch {
      localState = state;
    }

    void updateLearning({
      storage: localStorage,
      scope: paragraphLearningScope,
      stateSchema: paragraphStateSchema,
      initialState: createParagraphState,
      update: localUpdate,
      locks: "locks" in navigator ? navigator.locks : undefined,
    }).then((saved) => {
      if (saved.status === "saved") setState(saved.state);
      else {
        setState(localState);
        setMessage("Your result is shown, but paragraph progress could not be saved.");
      }
    }).catch(() => {
      setState(localState);
      setMessage("Your result is shown, but paragraph progress could not be saved.");
    }).finally(() => {
      setResult(evaluated);
      setResultAttempt(attempt);
      setPhase("result");
      setSaving(false);
    });
  }

  function tryAgain() {
    if (!currentParagraph) return;
    setRetrying(true);
    resetInput(currentParagraph);
    setPhase("practice");
  }

  function continueSet() {
    if (!selectedSet || !runId) return;
    const nextIndex = paragraphIndex + 1;
    if (nextIndex >= selectedSet.paragraphs.length) {
      setPhase("summary");
      return;
    }
    setParagraphIndex(nextIndex);
    setRetrying(false);
    resetInput(selectedSet.paragraphs[nextIndex]);
    setPhase("practice");
  }

  function leavePractice() {
    setPhase("catalog");
    setResult(null);
    setResultAttempt(null);
  }

  if (phase === "catalog") {
    const completed = completedParagraphIds(state);
    const visibleSets = sets.filter((item) => item.level === level);
    const activeSet = state.activeRun && sets.find((item) => item.id === state.activeRun?.setId);
    return (
      <section className="paragraph-catalog" aria-label="Paragraph practice sets">
        <header className="paragraph-library-heading">
          <PracticeBreadcrumb />
          <h2>Paragraph practice.<br /><strong>Build real rhythm.</strong></h2>
          <p>Choose a paragraph set by level, then practice complete English text with capitals, punctuation, numbers, and natural sentence flow.</p>
        </header>
        {message && <p className="paragraph-message" role="status">{message}</p>}
        <div className="paragraph-controls">
          <div className="paragraph-levels" role="group" aria-label="Paragraph difficulty">
            {(["beginner", "intermediate", "advanced"] as const).map((item) => (
              <button type="button" key={item} aria-pressed={level === item} onClick={() => setLevel(item)}>{item}</button>
            ))}
          </div>
          {activeSet && state.activeRun && (
            <button className="button button-secondary paragraph-resume" type="button" onClick={() => void beginSet(activeSet, true)} aria-label={`Continue ${activeSet.title}, ${state.activeRun.nextIndex} of ${activeSet.paragraphs.length} paragraphs completed`}>
              Continue <ArrowIcon />
            </button>
          )}
        </div>
        <ol className="paragraph-set-list">
          {visibleSets.map((item) => {
            const completedCount = item.paragraphs.filter((paragraph) => completed.has(paragraph.id)).length;
            const canResume = state.activeRun?.setId === item.id;
            const art = paragraphCardArt[item.id as keyof typeof paragraphCardArt];
            return (
              <li key={item.id}>
                <article className={`paragraph-set-card${art ? " has-illustration" : ""}`}>
                  <div className="paragraph-set-meta">
                    <span>{item.level}</span>
                    <span>{item.paragraphs.length} paragraphs</span>
                    <span>About {item.estimatedMinutes} min</span>
                  </div>
                  <div className="paragraph-set-body">
                    <div className="paragraph-set-copy">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <div className="paragraph-set-action">
                        <span>{completedCount} of {item.paragraphs.length} completed</span>
                        <button className="button button-secondary" type="button" onClick={() => void beginSet(item, canResume)}>
                          {canResume ? "Continue set" : completedCount === item.paragraphs.length ? "Practice again" : "Start practice"} <ArrowIcon />
                        </button>
                      </div>
                    </div>
                    {art && <div className="paragraph-card-art" aria-hidden="true"><Image src={art.src} alt="" width={art.width} height={art.height} sizes="(max-width: 760px) 0px, 300px" /></div>}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  if (!selectedSet || !currentParagraph || !runId) return null;

  if (phase === "summary") {
    const runAttempts = attemptsForRun(state, runId);
    const latestByParagraph = new Map<string, ParagraphAttempt>();
    for (const attempt of runAttempts) latestByParagraph.set(attempt.paragraphId, attempt);
    const attempts = [...latestByParagraph.values()];
    const totalCorrect = attempts.reduce((sum, attempt) => sum + attempt.correctCharacters, 0);
    const totalErrors = attempts.reduce((sum, attempt) => sum + attempt.errorCount, 0);
    const totalTime = attempts.reduce((sum, attempt) => sum + attempt.elapsedMilliseconds, 0);
    const accuracy = totalCorrect + totalErrors ? totalCorrect / (totalCorrect + totalErrors) : 1;
    const cpm = totalTime ? Math.floor(totalCorrect * 60_000 / totalTime) : 0;
    const difficultKeys = Object.entries(aggregateExpectedKeyErrors(attempts)).sort(([, a], [, b]) => b - a).slice(0, 4);
    return (
      <section className="learning-result-card lesson-result-card paragraph-summary" aria-labelledby="paragraph-summary-title" aria-live="polite">
        <header className="lesson-result-heading">
          <div>
            <span className="eyebrow dark">PRACTICE SET COMPLETE</span>
            <h2 id="paragraph-summary-title">Three paragraphs finished.</h2>
            <p><strong>{selectedSet.title}</strong> · Review your combined result and choose the next practice.</p>
          </div>
          <div className="lesson-progress" aria-label="3 of 3 paragraphs completed"><span>Set progress</span><strong>3<small>/3</small></strong><div aria-hidden="true"><span style={{ width: "100%" }} /></div></div>
        </header>
        <div className="lesson-result-metrics">
          <div><span>Average accuracy</span><strong>{(accuracy * 100).toFixed(1)}%</strong><small>Across {attempts.length} completed attempts</small></div>
          <div><span>Typing pace</span><strong>{cpm}<em> CPM</em></strong><small>{Math.floor(cpm / 5)} estimated WPM</small></div>
          <div><span>Mistakes</span><strong>{totalErrors}</strong><small>{Math.max(1, Math.round(totalTime / 60_000))} min active typing</small></div>
        </div>
        <div className="lesson-result-detail">
          <div className="lesson-result-summary"><h2>Set complete</h2><p>You completed the full sequence. Choose another set to work with different text, or use adaptive practice to strengthen the keys listed here.</p></div>
          <div className="course-result-keys"><h2>Problem keys</h2>{difficultKeys.length ? <ul>{difficultKeys.map(([key, count]) => <li key={key}><kbd>{displayKey(key)}</kbd><span>{count}</span></li>)}</ul> : <span>No mistakes recorded in this set.</span>}</div>
        </div>
        <footer className="lesson-result-footer">
          <div className="learning-result-actions">
            <Link className="button button-primary" href="/learn/practice?source=paragraphs">Practice problem keys <ArrowIcon /></Link>
            <button className="button button-secondary" type="button" onClick={leavePractice}>Choose another set</button>
            <button className="text-button" type="button" onClick={() => void beginSet(selectedSet, false)}>Repeat this set</button>
            <Link className="text-button" href="/">Take a timed test</Link>
          </div>
        </footer>
      </section>
    );
  }

  if (phase === "result" && result && resultAttempt) {
    const accuracyMet = Math.round(result.accuracy * 1000) >= 980;
    const speedMet = result.charactersPerMinute >= 180;
    const difficultKeys = Object.entries(resultAttempt.errorsByExpectedKey).sort(([, a], [, b]) => b - a).slice(0, 4);
    const finalParagraph = paragraphIndex === selectedSet.paragraphs.length - 1;
    return (
      <section className={`learning-result-card lesson-result-card paragraph-result-card ${result.passed ? "is-passed" : "needs-practice"}`} aria-labelledby="paragraph-result-title" aria-live="polite">
        <header className="lesson-result-heading">
          <div>
            <h2 id="paragraph-result-title">Paragraph {String(paragraphIndex + 1).padStart(2, "0")} complete.</h2>
            <p><strong>{currentParagraph.title}</strong> · {result.passed ? "Both practice goals met." : "Review the goals, then repeat or continue."}</p>
          </div>
          <div className="lesson-progress" aria-label={`${paragraphIndex + 1} of ${selectedSet.paragraphs.length} paragraphs completed`}><span>Set progress</span><strong>{paragraphIndex + 1}<small>/{selectedSet.paragraphs.length}</small></strong><div aria-hidden="true"><span style={{ width: `${(paragraphIndex + 1) / selectedSet.paragraphs.length * 100}%` }} /></div></div>
        </header>
        <div className="lesson-result-metrics">
          <div><span>Accuracy</span><strong>{(result.accuracy * 100).toFixed(1)}%</strong><small className={accuracyMet ? "is-met" : "is-missed"}>Goal 98% {accuracyMet ? "met" : "not met"}</small></div>
          <div><span>Typing pace</span><strong>{result.charactersPerMinute}<em> CPM</em></strong><small className={speedMet ? "is-met" : "is-missed"}>Goal 180 CPM {speedMet ? "met" : "not met"}</small></div>
          <div><span>Mistakes</span><strong>{resultAttempt.errorCount}</strong><small>{resultAttempt.errorCount === 0 ? "Clean run" : "Recorded during this paragraph"}</small></div>
        </div>
        <div className="lesson-result-detail">
          <div className="lesson-result-summary"><h2>{result.passed ? "Goals met" : "Keep building"}</h2><p>{accuracyMet && speedMet ? "Your accuracy and pace both reached the practice targets." : !accuracyMet ? "Slow down and correct each key before building speed." : "Your accuracy is on target. Repeat the paragraph to build a steadier pace."}</p></div>
          <div className="course-result-keys"><h2>Key review</h2>{difficultKeys.length ? <ul>{difficultKeys.map(([key, count]) => <li key={key}><kbd>{displayKey(key)}</kbd><span>{count}</span></li>)}</ul> : <span>No mistakes in this paragraph.</span>}</div>
        </div>
        <footer className="lesson-result-footer">
          <div className="learning-result-actions">
            <button className="button button-primary" type="button" onClick={continueSet}>{finalParagraph ? "View set summary" : "Start next paragraph"} <ArrowIcon /></button>
            <button className="button button-secondary reset-button" type="button" onClick={tryAgain}><ResetIcon />Try again</button>
            <button className="text-button" type="button" onClick={leavePractice}>Leave practice</button>
          </div>
        </footer>
      </section>
    );
  }

  return (
    <section className="paragraph-practice-session" aria-labelledby="paragraph-session-title">
      <header className="learning-toolbar">
        <div className="lesson-toolbar-main">
          <button className="toolbar-back" type="button" aria-label="Back to paragraph sets" title="Back to paragraph sets" onClick={leavePractice}><BackIcon /></button>
          <div className="lesson-toolbar-copy"><h2 id="paragraph-session-title">{selectedSet.title}</h2><span>Paragraph {String(paragraphIndex + 1).padStart(2, "0")} of {String(selectedSet.paragraphs.length).padStart(2, "0")}</span></div>
        </div>
        <button className="learning-toolbar-action" type="button" onClick={() => resetInput(currentParagraph)}><ResetIcon /><span>Reset</span></button>
      </header>
      {message && <p className="learning-message" role="status">{message}</p>}
      <LearningPracticeSurface
        key={`${runId}-${currentParagraph.id}-${retrying ? "retry" : "first"}`}
        text={currentParagraph.text}
        actual={actual}
        position={alignment?.cursorIndex ?? 0}
        status={feedback}
        label={`Paragraph practice: ${currentParagraph.title}`}
        onCharacter={handleCharacter}
        onBackspace={(word) => { setActual(sessionRef.current.backspace(word).actual); setFeedback("idle"); }}
        onBlur={() => {
          if (startedAt.current != null) {
            elapsed.current += Math.max(0, performance.now() - startedAt.current);
            startedAt.current = null;
          }
        }}
      />
    </section>
  );
}

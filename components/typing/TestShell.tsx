"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { durationOptions, type TestPageSlug } from "@/lib/content/test-pages";
import { clearHistory, loadHistory, saveHistory, type StoredResultSummary } from "@/lib/history/repository";
import { calculateResult } from "@/lib/scoring/calculate";
import { accuracyBucket, countBucket, telemetry, wpmBucket } from "@/lib/telemetry/adapter";
import {
  abandonSession, applyBackspace, applyCharacter, beginCountdown, beginRunning,
  completeSession, createSession, deadline, recordAnomaly,
} from "@/lib/typing-engine/machine";
import type { AnomalyFlag, TestResult, TestSession } from "@/lib/typing-engine/types";

type Props = {
  durationSeconds: 60 | 180 | 300;
  prompt: string;
  entryPage: TestPageSlug;
};

function formatScore(value: number | null, suffix = ""): string {
  return value === null ? "—" : `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
}

function TextRenderer({ prompt, typed }: { prompt: string; typed: string }) {
  const start = Math.max(0, Math.floor(typed.length / 80) * 80 - 40);
  const visible = prompt.slice(start, start + 240);
  return (
    <div className="typing-passage" role="text" aria-label={`Text to type: ${visible}`}>
      {Array.from(visible).map((character, relativeIndex) => {
        const index = start + relativeIndex;
        const className = index < typed.length
          ? (typed[index] === character ? "typed-correct" : "typed-error")
          : (index === typed.length ? "typed-current" : "");
        return <span className={className} aria-hidden="true" key={index}>{character}</span>;
      })}
    </div>
  );
}

function HistoryList({
  items, onClear,
}: {
  items: StoredResultSummary[];
  onClear: () => boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [clearError, setClearError] = useState(false);
  if (items.length === 0) return (
    <p className="history-empty">Your completed tests in this browser will appear here.</p>
  );
  return (
    <div className="history-content">
      <ul className="history-list">
        {items.slice(0, 5).map((item) => (
          <li key={item.id} className="history-item">
            <span className="history-date">{new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <strong>{formatScore(item.wpm)} <small>WPM</small></strong>
            <span>{item.durationSeconds / 60} min · {formatScore(item.accuracy, "%")}</span>
          </li>
        ))}
      </ul>
      {confirming ? (
        <div className="clear-confirm" role="group" aria-label="Clear recent results">
          <span>Remove every saved result from this browser? This cannot be undone.</span>
          <button type="button" onClick={() => { setClearError(!onClear()); setConfirming(false); }}>Clear results</button>
          <button type="button" onClick={() => setConfirming(false)}>Cancel</button>
        </div>
      ) : (
        <button type="button" className="text-button" onClick={() => setConfirming(true)}>Clear local history</button>
      )}
      {clearError && <p className="inline-warning" role="status">This browser could not clear the saved results.</p>}
    </div>
  );
}

export default function TestShell({ durationSeconds, prompt, entryPage }: Props) {
  const [session, setSession] = useState<TestSession>(() => createSession("unstarted", durationSeconds, prompt));
  const sessionRef = useRef(session);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [countdown, setCountdown] = useState(3);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(durationSeconds);
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<StoredResultSummary[]>([]);
  const [storageWarning, setStorageWarning] = useState(false);
  const [inputWarning, setInputWarning] = useState("");

  const commit = useCallback((next: TestSession) => {
    const previous = sessionRef.current;
    sessionRef.current = next;
    setSession(next);
    if (next.phase === "completed" && previous.phase !== "completed") {
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
        if (saveHistory(window.localStorage, nextResult, new Date())) setHistory(loadHistory(window.localStorage));
        else { setStorageWarning(true); telemetry.error("storage_write"); }
      } catch { setStorageWarning(true); telemetry.error("storage_write"); }
    }
  }, [durationSeconds]);

  useEffect(() => {
    telemetry.event({ name: "test_view", page: entryPage, configured_duration: durationSeconds });
    const frame = window.requestAnimationFrame(() => {
      try { setHistory(loadHistory(window.localStorage)); } catch { setStorageWarning(true); telemetry.error("storage_read"); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [entryPage, durationSeconds]);

  useEffect(() => {
    if (session.phase !== "countdown") return;
    let nextCount = 3;
    const interval = window.setInterval(() => {
      nextCount -= 1;
      if (nextCount <= 0) {
        window.clearInterval(interval);
        commit(beginRunning(sessionRef.current, performance.now()));
      } else setCountdown(nextCount);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session.phase, commit]);

  useEffect(() => {
    if (session.phase !== "running") return;
    inputRef.current?.focus();
    const interval = window.setInterval(() => {
      const current = sessionRef.current;
      const end = deadline(current);
      if (end === null) return;
      const left = Math.max(0, end - performance.now());
      setRemainingSeconds(Math.ceil(left / 1000));
      if (left <= 0) commit(completeSession(current, performance.now()));
    }, 100);
    return () => window.clearInterval(interval);
  }, [session.phase, commit]);

  useEffect(() => {
    if (session.phase !== "running") return;
    const onVisibilityChange = () => {
      if (document.hidden) commit(recordAnomaly(sessionRef.current, "hidden"));
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [session.phase, commit]);

  function startTest(isRetest = false) {
    if (isRetest) telemetry.event({ name: "result_retest", from_duration: durationSeconds, to_duration: durationSeconds });
    telemetry.event({ name: "test_start", duration: durationSeconds, entry_page: entryPage });
    const next = beginCountdown(createSession(crypto.randomUUID(), durationSeconds, prompt));
    setResult(null);
    setInputWarning("");
    setCountdown(3);
    setRemainingSeconds(durationSeconds);
    commit(next);
  }

  function markAnomaly(flag: AnomalyFlag, message: string) {
    commit(recordAnomaly(sessionRef.current, flag));
    setInputWarning(message);
  }

  function onInput(value: string) {
    const current = sessionRef.current;
    if (current.phase !== "running") return;
    const now = performance.now();
    if (value.length === current.typed.length + 1 && value.startsWith(current.typed)) {
      commit(applyCharacter(current, value.slice(-1), now));
    } else if (value.length === current.typed.length - 1 && current.typed.startsWith(value)) {
      commit(applyBackspace(current, now));
    } else if (value !== current.typed) {
      markAnomaly("composition", "Use the keyboard to type one character at a time.");
    }
  }

  function clearSavedResults(): boolean {
    try {
      const cleared = clearHistory(window.localStorage);
      if (cleared) {
        telemetry.event({ name: "history_clear", count_bucket: countBucket(history.length) });
        setHistory([]);
      } else telemetry.error("storage_clear");
      return cleared;
    } catch { telemetry.error("storage_clear"); return false; }
  }

  const isActive = session.phase === "running";
  const isReady = session.phase === "ready" || session.phase === "abandoned" || session.phase === "completed";
  const progress = isActive ? ((durationSeconds - remainingSeconds) / durationSeconds) * 100 : session.phase === "completed" ? 100 : 0;

  return (
    <div className="test-shell" data-phase={session.phase}>
      <div className="test-topline">
        <span className="eyebrow">THE TEST</span>
        <span className="test-duration">{durationSeconds / 60} MIN / ENGLISH</span>
      </div>

      <div className="duration-cards" role="group" aria-label={isReady ? "Choose test duration" : "Test duration options, available after this attempt"} tabIndex={isReady ? undefined : 0}>
        {durationOptions.map((option, index) => (
          <Link
            key={option.seconds}
            href={option.href}
            className={`duration-card ${option.seconds === durationSeconds ? "selected" : ""}`}
            aria-current={option.seconds === durationSeconds ? "page" : undefined}
            aria-disabled={!isReady}
            tabIndex={isReady ? 0 : -1}
            onClick={(event) => {
              if (!isReady) event.preventDefault();
              else if (session.phase === "completed" && option.seconds !== durationSeconds) {
                telemetry.event({ name: "result_retest", from_duration: durationSeconds, to_duration: option.seconds });
              }
            }}
          >
            <span className="duration-index">No.{index + 1}</span>
            <strong>{option.label}</strong>
            <small>{option.seconds === 60 ? "Quick check" : option.seconds === 180 ? "Find your rhythm" : "Stay consistent"}</small>
          </Link>
        ))}
      </div>

      <div className="progress-track" role="progressbar" aria-label="Test progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {session.phase !== "completed" ? (
        <section className="typing-chamber" aria-label="Typing test">
          <div className="chamber-heading">
            <div>
              <span className="eyebrow dark">READY WHEN YOU ARE</span>
              <h2>{isActive ? "Keep your rhythm." : session.phase === "countdown" ? "Get ready." : "Find your pace."}</h2>
            </div>
            <span className="timer-display" aria-label={`${remainingSeconds} seconds remaining`} aria-live="off">
              {session.phase === "countdown" ? countdown : `${Math.floor(remainingSeconds / 60).toString().padStart(2, "0")}:${(remainingSeconds % 60).toString().padStart(2, "0")}`}
            </span>
          </div>

          {isActive ? (
            <>
              <TextRenderer prompt={session.prompt} typed={session.typed} />
              <p id="typing-instructions" className="input-help">Type the passage above. Backspace is available; paste is disabled.</p>
              <textarea
                ref={inputRef}
                className="typing-input"
                aria-label="Type the passage here"
                aria-describedby="typing-instructions"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={session.typed}
                onChange={(event) => onInput(event.target.value)}
                onPaste={(event) => { event.preventDefault(); markAnomaly("paste", "Paste isn't available in a typing test."); }}
                onDrop={(event) => { event.preventDefault(); markAnomaly("drop", "Drag and drop isn't available in a typing test."); }}
                onBlur={() => commit(recordAnomaly(sessionRef.current, "blur"))}
              />
              {inputWarning && <p className="inline-warning" role="status">{inputWarning}</p>}
              <button type="button" className="text-button" onClick={() => commit(abandonSession(sessionRef.current))}>End this attempt</button>
            </>
          ) : session.phase === "countdown" ? (
            <p className="chamber-instruction" role="status">The test starts after the countdown. Place your hands on the keyboard.</p>
          ) : (
            <>
              <p className="chamber-instruction">{session.phase === "abandoned" ? "This attempt ended without a result. You can start a new one." : "Start typing when the countdown ends. Your test is timed locally in this browser."}</p>
              <button type="button" className="button button-primary" onClick={() => startTest()}>{session.phase === "abandoned" ? "START A NEW TEST" : "START TYPING TEST"}<span aria-hidden="true">↗</span></button>
            </>
          )}
        </section>
      ) : result?.wpm === null ? (
        <section className="result-card" aria-labelledby="empty-result-title">
          <span className="eyebrow dark">TEST COMPLETE</span>
          <h2 id="empty-result-title" className="empty-result-heading">No score recorded.</h2>
          <p>You did not type during this attempt, so there is no WPM or accuracy to save. Start a fresh test when you are ready.</p>
          <button type="button" className="button button-primary" onClick={() => startTest(true)}>RETEST {durationSeconds / 60} MIN <span aria-hidden="true">↗</span></button>
        </section>
      ) : result ? (
        <section className="result-card" aria-labelledby="result-title">
          <p className="sr-only" role="status">Test complete. Your result is {formatScore(result.wpm)} words per minute.</p>
          <span className="eyebrow dark">YOUR RESULT</span>
          <div className="result-main">
            <div><h2 id="result-title">{formatScore(result.wpm)}<span> WPM</span></h2><p>Correct words per minute</p></div>
            <p className="result-summary">A snapshot of this attempt. Use the same duration when you compare your next test.</p>
          </div>
          <div className="result-metrics">
            <div><strong>{formatScore(result.accuracy, "%")}</strong><span>Accuracy</span></div>
            <div><strong>{formatScore(result.rawWpm)}</strong><span>Raw WPM</span></div>
            <div><strong>{result.errors}</strong><span>Errors</span></div>
            <div><strong>{result.durationSeconds / 60} min</strong><span>Duration</span></div>
          </div>
          <p className="benchmark-note">Benchmark comparison is awaiting source review. <Link href="/average-wpm" onClick={() => telemetry.event({ name: "benchmark_click", target_page: "average-wpm" })}>Learn what WPM measures</Link>.</p>
          <div className="result-actions">
            <button type="button" className="button button-primary" onClick={() => startTest(true)}>RETEST {durationSeconds / 60} MIN <span aria-hidden="true">↗</span></button>
            <Link className="button button-secondary" href="/average-typing-speed" onClick={() => telemetry.event({ name: "benchmark_click", target_page: "average-typing-speed" })}>UNDERSTAND YOUR RESULT</Link>
          </div>
        </section>
      ) : <p className="inline-warning" role="status">The result could not be calculated. Please start a new test.</p>}

      {storageWarning && <p className="storage-warning" role="status">Recent results could not be saved in this browser. You can still take tests and view this result.</p>}

      <section className="history-section" aria-labelledby="history-title">
        <div><span className="eyebrow">YOUR BROWSER</span><h2 id="history-title">RECENT <strong>RESULTS</strong></h2></div>
        <HistoryList items={history} onClear={clearSavedResults} />
      </section>
    </div>
  );
}

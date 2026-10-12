"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ResetIcon from "@/components/ResetIcon";
import { createGuidedMilestones, loadEnglishGuidedLesson, createGuidedRound, type GuidedRound } from "@/lib/learning/guided-engine";
import { GuidedInputSession } from "@/lib/learning/guided-input";
import { createGuidedState, guidedStateSchema, recordGuidedResult, restoreGuidedResults, rewindGuidedState, type GuidedState } from "@/lib/learning/guided-state";
import { loadLearning } from "@/lib/learning/repository";
import { updateLearning } from "@/lib/learning/browser-repository";
import { guidedLearningScope } from "@/lib/learning/scopes";
import type { GuidedLesson } from "@/vendor/keybr/packages/keybr-lesson/lib/guided";
import type { Result } from "@keybr/result";
import LearningPracticeSurface from "./LearningPracticeSurface";

type Completion = { result: Result; saved: boolean };
type GuidedPracticeProps = { embedded?: boolean };

function attemptId() {
  return globalThis.crypto?.randomUUID?.() ?? `guided-${Date.now()}-${Math.random()}`;
}

export default function GuidedPractice({ embedded = false }: GuidedPracticeProps) {
  const [lesson, setLesson] = useState<GuidedLesson | null>(null);
  const [history, setHistory] = useState<GuidedState>(createGuidedState);
  const [round, setRound] = useState<GuidedRound | null>(null);
  const [position, setPosition] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "error">("idle");
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isRewinding, setIsRewinding] = useState(false);
  const sessionRef = useRef<GuidedInputSession | null>(null);
  const lastInputAt = useRef(0);

  const startRound = useCallback((engine: GuidedLesson, state: GuidedState) => {
    const next = createGuidedRound(engine, restoreGuidedResults(state));
    sessionRef.current = new GuidedInputSession(next.text);
    lastInputAt.current = 0;
    setRound(next);
    setPosition(0);
    setFeedback("idle");
    setCompletion(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let state = createGuidedState();
      const stored = loadLearning(localStorage, guidedLearningScope, guidedStateSchema);
      if (stored.status === "ready") state = stored.state;
      else if (stored.status === "invalid" || stored.status === "incompatible") {
        setMessage("Saved continuous-practice progress belongs to another version or is damaged. It was kept unchanged.");
      } else if (stored.status === "unavailable") setMessage("Progress could not be read or saved in this browser.");
      try {
        const engine = await loadEnglishGuidedLesson();
        if (cancelled) return;
        setLesson(engine);
        setHistory(state);
        startRound(engine, state);
      } catch {
        if (!cancelled) setMessage("Practice couldn't load. Reload the page to try again.");
      }
    })();
    return () => { cancelled = true; };
  }, [startRound]);

  const restoredResults = useMemo(() => restoreGuidedResults(history), [history]);
  const milestones = useMemo(() => lesson == null ? [] : createGuidedMilestones(lesson, restoredResults), [lesson, restoredResults]);

  const restartFrom = useCallback((resultCount: number) => {
    if (!lesson || isRewinding) return;
    setIsRewinding(true);
    setMessage(null);
    const locks = "locks" in navigator ? navigator.locks : undefined;
    void updateLearning({
      storage: localStorage,
      scope: guidedLearningScope,
      stateSchema: guidedStateSchema,
      initialState: createGuidedState,
      update: (state) => rewindGuidedState(state, resultCount),
      locks,
    }).then((saved) => {
      if (saved.status === "saved") {
        setHistory(saved.state);
        startRound(lesson, saved.state);
      } else {
        setMessage(saved.status === "conflict" ? "Progress changed in another tab. Reload before restarting." : "Progress could not be restarted in this browser.");
      }
    }).finally(() => setIsRewinding(false));
  }, [isRewinding, lesson, startRound]);

  const handleCharacter = useCallback((character: string, timeStamp: number) => {
    const session = sessionRef.current;
    if (!session || completion) return;
    const timeToType = lastInputAt.current === 0 ? 0 : Math.max(0, timeStamp - lastInputAt.current);
    lastInputAt.current = timeStamp;
    const snapshot = session.onInput({
      inputType: character === "\n" ? "appendLineBreak" : "appendChar",
      codePoint: character.codePointAt(0) ?? 0,
      timeStamp,
      timeToType,
    });
    setPosition(snapshot.position);
    setFeedback(snapshot.feedback === 2 ? "error" : "idle");
    if (!snapshot.completed) return;
    const result = session.takeResult();
    if (!result) return;
    const id = attemptId();
    const recorded = recordGuidedResult(history, id, result);
    if (recorded.status !== "recorded") {
      setCompletion({ result, saved: false });
      setMessage("That round was too short or too fast to count toward your progress. Try another round.");
      return;
    }
    setHistory(recorded.state);
    setCompletion({ result, saved: false });
    const locks = "locks" in navigator ? navigator.locks : undefined;
    void updateLearning({
      storage: localStorage,
      scope: guidedLearningScope,
      stateSchema: guidedStateSchema,
      initialState: createGuidedState,
      update: (state) => recordGuidedResult(state, id, result).state,
      locks,
    }).then((saved) => {
      if (saved.status === "saved") setCompletion({ result, saved: true });
      else setMessage(saved.status === "conflict" ? "Progress changed in another tab. Reload before continuing." : "Progress could not be saved in this browser.");
    });
  }, [completion, history]);

  if (!round || !lesson) return <section className={`learning-loading ${embedded ? "is-embedded" : ""}`} aria-live="polite">Loading practice…{message && <p>{message}</p>}</section>;

  const focusMistakes = completion && round.focusCharacter
    ? completion.result.histogram.get(round.focusCharacter.codePointAt(0) ?? 0)?.missCount
    : null;
  const Heading = embedded ? "h2" : "h1";
  const ResultHeading = embedded ? "h2" : "h1";
  const content = (
    <>
      <header className="learning-toolbar">
        <div>
          <Heading id="guided-practice-title">Focus {round.focusCharacter?.toUpperCase() ?? "review"}</Heading>
          <div className="learning-stage-list" aria-label="Restart continuous practice from a learned stage">
            {round.availableCharacters.map((character, index) => {
              const milestone = milestones.find((item) => item.character === character);
              const tooltipId = `restart-stage-${character.codePointAt(0)}`;
              return (
                <span className="learning-stage-item" key={character}>
                  <button
                    type="button"
                    className="learning-stage-button"
                    aria-current={character === round.focusCharacter ? "step" : undefined}
                    aria-describedby={tooltipId}
                    aria-label={`Restart from ${character.toUpperCase()} stage`}
                    disabled={isRewinding || milestone == null}
                    onClick={() => milestone && restartFrom(milestone.resultCount)}
                  >
                    {character.toUpperCase()}
                    <span className="learning-stage-tooltip" id={tooltipId} role="tooltip">Restart from here</span>
                  </button>
                  {index < round.availableCharacters.length - 1 && <span className="learning-stage-separator" aria-hidden="true">·</span>}
                </span>
              );
            })}
          </div>
        </div>
        <button className="learning-toolbar-action" type="button" aria-label="Reset continuous practice progress" title="Restart from the beginning" disabled={isRewinding} onClick={() => restartFrom(0)}>
          <ResetIcon />
          <span>Reset</span>
        </button>
      </header>
      {message && <p className="learning-message" role="status">{message}</p>}
      {completion ? (
        <section className="learning-result-card" aria-labelledby="guided-result-title">
          <span className="eyebrow dark">ROUND COMPLETE</span>
          <ResultHeading id="guided-result-title">Here&apos;s how you did.</ResultHeading>
          <div className="learning-result-metrics">
            <p><strong>{Math.round(completion.result.speed)}</strong><span>characters/min</span></p>
            <p><strong>{Math.round(completion.result.accuracy * 100)}%</strong><span>accuracy</span></p>
            <p><strong>{completion.result.errors}</strong><span>errors</span></p>
          </div>
          {focusMistakes != null && <p className="guided-result-note">Focus key {round.focusCharacter!.toUpperCase()}: {focusMistakes === 0 ? "no mistakes this round" : `${focusMistakes} ${focusMistakes === 1 ? "mistake" : "mistakes"} this round`}.</p>}
          <p>{completion.saved ? "Progress saved in this browser." : "Your result is shown here, but your progress could not be saved."}</p>
          <div className="learning-result-actions">
            <button className="button button-primary" type="button" onClick={() => startRound(lesson, history)}>Continue practice <span>↗</span></button>
            {embedded ? <a className="text-button" href="#courses">Browse lessons</a> : <Link className="button button-secondary" href="/learn">Back to practice</Link>}
          </div>
        </section>
      ) : (
        <LearningPracticeSurface
          key={round.text}
          text={round.text}
          position={position}
          status={feedback}
          label="Adaptive typing exercise"
          highlightCharacters={round.availableCharacters}
          onCharacter={handleCharacter}
          onBackspace={(word, timeStamp) => {
            const session = sessionRef.current;
            if (!session) return;
            const snapshot = session.onInput({ inputType: word ? "clearWord" : "clearChar", codePoint: 0, timeStamp, timeToType: 0 });
            setPosition(snapshot.position);
            setFeedback("idle");
          }}
          onBlur={() => {
            if (position === 0) return;
            sessionRef.current = new GuidedInputSession(round.text);
            lastInputAt.current = 0;
            setPosition(0);
            setFeedback("idle");
          }}
        />
      )}
    </>
  );

  if (embedded) return <section className="learning-practice-page learning-practice-block" aria-labelledby="guided-practice-title">{content}</section>;
  return <main className="learning-page learning-practice-page">{content}</main>;
}

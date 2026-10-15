"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ResetIcon from "@/components/ResetIcon";
import { createGuidedMilestones, loadEnglishGuidedLesson, createGuidedRound, type GuidedRound } from "@/lib/learning/guided-engine";
import { GuidedInputSession } from "@/lib/learning/guided-input";
import { advanceGuidedState, createGuidedState, guidedStateSchema, recordGuidedResult, restoreGuidedResults, rewindGuidedState, type GuidedState } from "@/lib/learning/guided-state";
import { loadLearning } from "@/lib/learning/repository";
import { updateLearning } from "@/lib/learning/browser-repository";
import { guidedLearningScope } from "@/lib/learning/scopes";
import type { GuidedLesson } from "@/vendor/keybr/packages/keybr-lesson/lib/guided";
import type { Result } from "@keybr/result";
import LearningPracticeSurface from "./LearningPracticeSurface";

type Completion = { result: Result; saved: boolean; nextRound: GuidedRound };
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
  const [isAdvancing, setIsAdvancing] = useState(false);
  const sessionRef = useRef<GuidedInputSession | null>(null);
  const lastInputAt = useRef(0);

  const startRound = useCallback((engine: GuidedLesson, state: GuidedState) => {
    const next = createGuidedRound(engine, restoreGuidedResults(state), undefined, state.minimumKeyCount);
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

  const restartFrom = useCallback((resultCount: number, minimumKeyCount = 4) => {
    if (!lesson || isRewinding) return;
    setIsRewinding(true);
    setMessage(null);
    const locks = "locks" in navigator ? navigator.locks : undefined;
    void updateLearning({
      storage: localStorage,
      scope: guidedLearningScope,
      stateSchema: guidedStateSchema,
      initialState: createGuidedState,
      update: (state) => rewindGuidedState(state, resultCount, minimumKeyCount),
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
    if (!session || !lesson || !round || completion) return;
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
      setCompletion({ result, saved: false, nextRound: round });
      setMessage("That round was too short or too fast to count toward your progress. Try another round.");
      return;
    }
    const nextRound = createGuidedRound(lesson, restoreGuidedResults(recorded.state), undefined, recorded.state.minimumKeyCount);
    setHistory(recorded.state);
    setCompletion({ result, saved: false, nextRound });
    const locks = "locks" in navigator ? navigator.locks : undefined;
    void updateLearning({
      storage: localStorage,
      scope: guidedLearningScope,
      stateSchema: guidedStateSchema,
      initialState: createGuidedState,
      update: (state) => recordGuidedResult(state, id, result).state,
      locks,
    }).then((saved) => {
      if (saved.status === "saved") setCompletion((current) => current == null ? null : { ...current, saved: true });
      else setMessage(saved.status === "conflict" ? "Progress changed in another tab. Reload before continuing." : "Progress could not be saved in this browser.");
    });
  }, [completion, history, lesson, round]);

  const continueToNextKey = useCallback(() => {
    if (!lesson || !round || !completion?.saved || isAdvancing) return;
    setIsAdvancing(true);
    setMessage(null);
    const locks = "locks" in navigator ? navigator.locks : undefined;
    void updateLearning({
      storage: localStorage,
      scope: guidedLearningScope,
      stateSchema: guidedStateSchema,
      initialState: createGuidedState,
      update: (state) => advanceGuidedState(state, round.availableCharacters.length),
      locks,
    }).then((saved) => {
      if (saved.status === "saved") {
        setHistory(saved.state);
        startRound(lesson, saved.state);
      } else {
        setMessage(saved.status === "conflict" ? "Progress changed in another tab. Reload before continuing." : "The next letter could not be saved in this browser.");
      }
    }).finally(() => setIsAdvancing(false));
  }, [completion?.saved, isAdvancing, lesson, round, startRound]);

  if (!round || !lesson) return <section className={`learning-loading ${embedded ? "is-embedded" : ""}`} aria-live="polite">Loading practice…{message && <p>{message}</p>}</section>;

  const focusMistakes = completion && round.focusCharacter
    ? completion.result.histogram.get(round.focusCharacter.codePointAt(0) ?? 0)?.missCount
    : null;
  const nextCharacter = round.availableCharacters.length < lesson.letters.length
    ? String.fromCodePoint(lesson.letters[round.availableCharacters.length].codePoint).toUpperCase()
    : null;
  const reachedRecommendedLevel = completion != null && completion.nextRound.availableCharacters.length > round.availableCharacters.length;
  const Heading = "h2";
  const ResultHeading = "h2";
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
                    disabled={isRewinding}
                    onClick={() => restartFrom(milestone?.resultCount ?? history.results.length, index + 1)}
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
        <button className="learning-toolbar-action" type="button" aria-label="Reset continuous practice progress" title="Restart from the beginning" disabled={isRewinding} onClick={() => restartFrom(0, 4)}>
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
          {reachedRecommendedLevel ? (
            <p className="guided-result-note">You reached the recommended level. {nextCharacter ? `${nextCharacter} is ready next.` : "Continue practicing all letters."}</p>
          ) : nextCharacter ? (
            <p className="guided-result-note">You can practice {round.focusCharacter?.toUpperCase()} again, or continue to {nextCharacter} now.</p>
          ) : null}
          <p>{completion.saved ? "Progress saved in this browser." : message ? "Your result is shown here, but your progress could not be saved." : "Saving progress…"}</p>
          <div className="learning-result-actions">
            {reachedRecommendedLevel || nextCharacter == null ? (
              <button className="button button-primary" type="button" onClick={() => startRound(lesson, history)}>Continue practice <span>↗</span></button>
            ) : (
              <>
                <button className="button button-primary" type="button" disabled={!completion.saved || isAdvancing} onClick={continueToNextKey}>Continue to {nextCharacter} <span>↗</span></button>
                <button className="button button-secondary" type="button" onClick={() => startRound(lesson, history)}>Practice {round.focusCharacter?.toUpperCase()} again</button>
              </>
            )}
            {embedded ? <a className="text-button" href="#courses">Browse lessons</a> : <Link className="button button-secondary" href="/learn">All practice options</Link>}
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

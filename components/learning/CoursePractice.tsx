"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import ResetIcon from "@/components/ResetIcon";
import type { LearningCourse } from "@/lib/learning/course-content";
import { englishQwertyCourse } from "@/lib/learning/course-content";
import { evaluateCourseAttempt } from "@/lib/learning/course-engine";
import { CourseInputSession } from "@/lib/learning/course-input";
import { completeCourseAttempt, type CourseCompletion } from "@/lib/learning/course-session";
import { createCourseState, courseStateSchema, type CourseState } from "@/lib/learning/course-state";
import { courseLearningScope } from "@/lib/learning/scopes";
import { loadLearning } from "@/lib/learning/repository";
import { updateLearning } from "@/lib/learning/browser-repository";
import { alignTypingInput } from "@/lib/typing-engine/alignment";
import LearningPracticeSurface from "./LearningPracticeSurface";

type Lesson = LearningCourse["lessons"][number];

function attemptId() {
  return globalThis.crypto?.randomUUID?.() ?? `course-${Date.now()}-${Math.random()}`;
}

type ConfettiStyle = CSSProperties & {
  "--confetti-drift": string;
  "--confetti-spin": string;
};

const confettiStyles: ConfettiStyle[] = Array.from({ length: 30 }, (_, index) => ({
  left: `${(index * 37 + 5) % 100}%`,
  animationDelay: `${(index % 10) * 42}ms`,
  animationDuration: `${1450 + (index % 6) * 95}ms`,
  "--confetti-drift": `${((index % 7) - 3) * 18}px`,
  "--confetti-spin": `${420 + (index % 5) * 90}deg`,
}));

function LessonCelebration() {
  return (
    <div className="lesson-confetti" aria-hidden="true">
      {confettiStyles.map((style, index) => <span key={index} style={style} />)}
    </div>
  );
}

function StatusIcon({ met }: { met: boolean }) {
  return met ? (
    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10.2 3.3 3.3 7.7-7.7" /></svg>
  ) : (
    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 5.2v5.4M10 14.3v.1" /></svg>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M7 5h8v8" /></svg>;
}

function BackIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5.5 5.5 5.5 5.5M7.5 10h7" /></svg>;
}

export default function CoursePractice({ lesson }: { lesson: Lesson }) {
  const first = englishQwertyCourse.lessons[0].id;
  const sessionRef = useRef(new CourseInputSession(lesson.text));
  const resultCardRef = useRef<HTMLElement>(null);
  const startedAt = useRef<number | null>(null);
  const elapsed = useRef(0);
  const [state, setState] = useState<CourseState>(() => createCourseState(first, "advanced"));
  const [actual, setActual] = useState("");
  const [completion, setCompletion] = useState<CourseCompletion | null>(null);
  const [errorsByKey, setErrorsByKey] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);
  const lessonIndex = useMemo(() => englishQwertyCourse.lessons.findIndex(({ id }) => id === lesson.id), [lesson.id]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = loadLearning(localStorage, courseLearningScope, courseStateSchema);
      if (stored.status === "ready") setState({ ...stored.state, learner: "advanced" });
      else if (stored.status === "invalid" || stored.status === "incompatible") setMessage("We couldn't read your saved lesson progress.");
      else if (stored.status === "unavailable") setMessage("Progress could not be read or saved in this browser.");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!completion) return;
    const frame = requestAnimationFrame(() => {
      resultCardRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [completion]);

  const reset = () => {
    sessionRef.current = new CourseInputSession(lesson.text);
    startedAt.current = null;
    elapsed.current = 0;
    setActual("");
    setCompletion(null);
    setErrorsByKey({});
  };

  const handleCharacter = (character: string) => {
    if (completion) return;
    const now = performance.now();
    if (startedAt.current == null) startedAt.current = now;
    const snapshot = sessionRef.current.append(character);
    setActual(snapshot.actual);
    if (!snapshot.completed) return;
    const attempt = {
      attemptId: attemptId(),
      lessonId: lesson.id,
      correctCharacters: snapshot.correctCharacters,
      errorCount: snapshot.errorCount,
      elapsedMilliseconds: Math.max(0, Math.round(elapsed.current + now - (startedAt.current ?? now))),
      completedAt: Date.now(),
    };
    let localCompletion: CourseCompletion;
    try {
      localCompletion = completeCourseAttempt(englishQwertyCourse, { ...state, learner: "advanced" }, attempt);
    } catch (error) {
      setMessage(error instanceof Error && error.message.startsWith("Locked lesson") ? "This beginner lesson is still locked. Complete the previous lesson first." : "This lesson could not be completed.");
      return;
    }
    setState(localCompletion.state);
    setCompletion(localCompletion);
    setErrorsByKey(snapshot.errorsByExpectedKey);
    startedAt.current = null;
    const locks = "locks" in navigator ? navigator.locks : undefined;
    void updateLearning({
      storage: localStorage,
      scope: courseLearningScope,
      stateSchema: courseStateSchema,
      initialState: () => createCourseState(first, "advanced"),
      update: (fresh) => completeCourseAttempt(englishQwertyCourse, { ...fresh, learner: "advanced" }, attempt).state,
      locks,
    }).then((saved) => {
      if (saved.status !== "saved") setMessage(saved.status === "conflict" ? "Progress changed in another tab. Reload before continuing." : "The result is shown, but progress could not be saved.");
    });
  };

  const accuracyMet = completion ? Math.round(completion.result.accuracy * 1000) >= 980 : false;
  const speedMet = completion ? completion.result.charactersPerMinute >= 180 : false;
  const errorCount = Object.values(errorsByKey).reduce((total, count) => total + count, 0);
  const focusKeys = [...new Set(lesson.newCharacters)].filter((key) => lesson.newCharacters.length <= 4 || (errorsByKey[key] ?? 0) > 0)
    .sort((left, right) => (errorsByKey[right] ?? 0) - (errorsByKey[left] ?? 0)).slice(0, 4);
  const focusErrorCount = [...new Set(lesson.newCharacters)].reduce((total, key) => total + (errorsByKey[key] ?? 0), 0);
  const completedLessonCount = useMemo(() => new Set(
    state.attempts.filter((attempt) => evaluateCourseAttempt(attempt).passed).map((attempt) => attempt.lessonId),
  ).size, [state.attempts]);
  const nextLesson = completion?.nextLessonId
    ? englishQwertyCourse.lessons.find(({ id }) => id === completion.nextLessonId) ?? null
    : null;
  const nextLessonIndex = nextLesson ? englishQwertyCourse.lessons.findIndex(({ id }) => id === nextLesson.id) : -1;
  const progressPercent = Math.round(completedLessonCount / englishQwertyCourse.lessons.length * 100);

  return (
    <main className="learning-page learning-practice-page">
      <header className="learning-toolbar">
        <div className="lesson-toolbar-main">
          <Link className="lesson-toolbar-back" href="/learn#courses" aria-label="Back to lessons" title="Back to lessons">
            <BackIcon />
          </Link>
          <div className="lesson-toolbar-copy">
            <h1>{lesson.title}</h1>
            <span>Lesson {String(lessonIndex + 1).padStart(2, "0")} of {englishQwertyCourse.lessons.length}</span>
          </div>
        </div>
        <button className="learning-toolbar-action" type="button" onClick={reset}>
          <ResetIcon />
          <span>Reset</span>
        </button>
      </header>
      {message && <p className="learning-message" role="status">{message}</p>}
      {completion ? (
        <>
          {completion.result.passed && <LessonCelebration />}
          <section ref={resultCardRef} className={`learning-result-card lesson-result-card ${completion.result.passed ? "is-passed" : "needs-practice"}`} aria-labelledby="course-result-title" aria-live="polite">
            <header className="lesson-result-heading">
              <div>
                <h1 id="course-result-title">{completion.result.passed
                  ? `Lesson ${String(lessonIndex + 1).padStart(2, "0")} complete.`
                  : "Lesson not passed yet."}</h1>
                <p><strong>{lesson.title}</strong> · {completion.result.passed ? "Both lesson goals met." : "Review the missed goal and choose what to do next."}</p>
              </div>
              <div className="lesson-progress" aria-label={`${completedLessonCount} of ${englishQwertyCourse.lessons.length} lessons passed`}>
                <span>Course progress</span>
                <strong>{completedLessonCount}<small>/{englishQwertyCourse.lessons.length}</small></strong>
                <div aria-hidden="true"><span style={{ width: `${progressPercent}%` }} /></div>
              </div>
            </header>

            <div className="lesson-result-metrics">
              <div>
                <span>Accuracy</span>
                <strong>{(completion.result.accuracy * 100).toFixed(1)}%</strong>
                <small className={accuracyMet ? "is-met" : "is-missed"}><StatusIcon met={accuracyMet} /> Goal 98% {accuracyMet ? "met" : "not met"}</small>
              </div>
              <div>
                <span>Typing pace</span>
                <strong>{completion.result.charactersPerMinute}<em> CPM</em></strong>
                <small className={speedMet ? "is-met" : "is-missed"}><StatusIcon met={speedMet} /> Goal 180 CPM {speedMet ? "met" : "not met"}</small>
              </div>
              <div>
                <span>Mistakes</span>
                <strong>{errorCount}</strong>
                <small>{errorCount === 0 ? "Clean run" : `${errorCount} recorded during the lesson`}</small>
              </div>
            </div>

            <div className="lesson-result-detail">
              <div className="lesson-result-summary">
                <h2>{completion.result.passed ? "Ready to move on" : "Try this lesson again"}</h2>
                <p>{accuracyMet && speedMet
                  ? "Your accuracy and pace both reached the lesson targets."
                  : !accuracyMet
                    ? "Slow down and correct each key before building speed."
                    : "Your accuracy is on target. Repeat the lesson and build a steadier pace."}</p>
              </div>
              <div className="course-result-keys">
                <h2>New key review</h2>
                <strong>{focusErrorCount} {focusErrorCount === 1 ? "mistake" : "mistakes"} on this lesson&apos;s new keys</strong>
                {focusKeys.length > 0 ? (
                  <ul>{focusKeys.map((key) => <li key={key}><kbd>{key}</kbd><span>{errorsByKey[key] ?? 0}</span></li>)}</ul>
                ) : <span>No mistakes on the new keys.</span>}
              </div>
            </div>

            <footer className="lesson-result-footer">
              {nextLesson && (
                <div className="lesson-next">
                  <div>
                    <span>Next · Lesson {String(nextLessonIndex + 1).padStart(2, "0")}</span>
                    <strong>{nextLesson.title}</strong>
                    <small>New keys {nextLesson.newCharacters}</small>
                  </div>
                  <Link className={`button ${completion.result.passed ? "button-primary" : "button-secondary"}`} href={`/learn/courses/${nextLesson.id}`}>
                    Start next lesson <ArrowIcon />
                  </Link>
                </div>
              )}
              <div className="learning-result-actions">
                <button className={`button ${completion.result.passed ? "button-secondary" : "button-primary"} reset-button`} type="button" onClick={reset}>
                  <ResetIcon />
                  Try again
                </button>
                <Link className="text-button" href="/learn#courses">All lessons</Link>
              </div>
            </footer>
          </section>
        </>
      ) : (
        <LearningPracticeSurface
          key={lesson.id}
          text={lesson.text}
          actual={actual}
          position={alignTypingInput(lesson.text, actual).cursorIndex}
          label={`Course lesson ${lesson.title}`}
          highlightCharacters={[...new Set(lesson.newCharacters)]}
          showOnlyHighlightedCharacters
          blurBehavior="pause"
          onCharacter={handleCharacter}
          onBackspace={(word) => setActual(sessionRef.current.backspace(word).actual)}
          onBlur={() => {
            if (startedAt.current != null) {
              elapsed.current += Math.max(0, performance.now() - startedAt.current);
              startedAt.current = null;
            }
          }}
        />
      )}
    </main>
  );
}

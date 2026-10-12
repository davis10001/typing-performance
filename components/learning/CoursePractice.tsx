"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ResetIcon from "@/components/ResetIcon";
import type { LearningCourse } from "@/lib/learning/course-content";
import { englishQwertyCourse } from "@/lib/learning/course-content";
import { CourseInputSession } from "@/lib/learning/course-input";
import { completeCourseAttempt, type CourseCompletion } from "@/lib/learning/course-session";
import { createCourseState, courseStateSchema, type CourseState } from "@/lib/learning/course-state";
import { courseLearningScope } from "@/lib/learning/scopes";
import { loadLearning } from "@/lib/learning/repository";
import { updateLearning } from "@/lib/learning/browser-repository";
import LearningPracticeSurface from "./LearningPracticeSurface";

type Lesson = LearningCourse["lessons"][number];

function attemptId() {
  return globalThis.crypto?.randomUUID?.() ?? `course-${Date.now()}-${Math.random()}`;
}

export default function CoursePractice({ lesson }: { lesson: Lesson }) {
  const first = englishQwertyCourse.lessons[0].id;
  const sessionRef = useRef(new CourseInputSession(lesson.text));
  const startedAt = useRef<number | null>(null);
  const elapsed = useRef(0);
  const [state, setState] = useState<CourseState>(() => createCourseState(first, "advanced"));
  const [actual, setActual] = useState("");
  const [completion, setCompletion] = useState<CourseCompletion | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const lessonIndex = useMemo(() => englishQwertyCourse.lessons.findIndex(({ id }) => id === lesson.id), [lesson.id]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = loadLearning(localStorage, courseLearningScope, courseStateSchema);
      if (stored.status === "ready") setState({ ...stored.state, learner: "advanced" });
      else if (stored.status === "invalid" || stored.status === "incompatible") setMessage("Saved course progress is not compatible with this course version.");
      else if (stored.status === "unavailable") setMessage("Progress could not be read or saved in this browser.");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const reset = () => {
    sessionRef.current = new CourseInputSession(lesson.text);
    startedAt.current = null;
    elapsed.current = 0;
    setActual("");
    setCompletion(null);
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

  return (
    <main className="learning-page learning-practice-page">
      <header className="learning-toolbar">
        <div>
          <h1>{lesson.title}</h1>
          <span>Lesson {String(lessonIndex + 1).padStart(2, "0")} of {englishQwertyCourse.lessons.length} · New keys {lesson.newCharacters}</span>
        </div>
        <button className="learning-toolbar-action" type="button" onClick={reset}>
          <ResetIcon />
          <span>Reset</span>
        </button>
      </header>
      {message && <p className="learning-message" role="status">{message}</p>}
      {completion ? (
        <section className="learning-result-card" aria-labelledby="course-result-title">
          <span className="eyebrow dark">LESSON COMPLETE</span>
          <h1 id="course-result-title">{completion.result.passed ? "Lesson passed." : "Practice it again."}</h1>
          <div className="learning-result-metrics">
            <p><strong>{completion.result.charactersPerMinute}</strong><span>CPM · need 180</span></p>
            <p><strong>{(completion.result.accuracy * 100).toFixed(1)}%</strong><span>accuracy · need 98%</span></p>
          </div>
          <div className="learning-result-actions">
            {completion.nextLessonId && <Link className="button button-primary" href={`/learn/courses/${completion.nextLessonId}`}>Next lesson <span>↗</span></Link>}
            <button className="button button-secondary reset-button" type="button" onClick={reset}>
              <ResetIcon />
              Reset
            </button>
            <Link className="text-button" href="/learn#courses">All lessons</Link>
          </div>
        </section>
      ) : (
        <LearningPracticeSurface
          key={lesson.id}
          text={lesson.text}
          actual={actual}
          position={[...actual].length}
          label={`Course lesson ${lesson.title}`}
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { englishQwertyCourse } from "@/lib/learning/course-content";
import { evaluateCourseAttempt } from "@/lib/learning/course-engine";
import { createCourseState, courseStateSchema, type CourseState } from "@/lib/learning/course-state";
import { courseLearningScope } from "@/lib/learning/scopes";
import { loadLearning, saveLearning } from "@/lib/learning/repository";

export default function CourseCatalog() {
  const first = englishQwertyCourse.lessons[0].id;
  const [state, setState] = useState<CourseState>(() => createCourseState(first, "beginner"));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = loadLearning(localStorage, courseLearningScope, courseStateSchema);
      if (stored.status === "ready") setState(stored.state);
      else if (stored.status === "invalid" || stored.status === "incompatible") setMessage("Saved course progress belongs to another version or is damaged. It was kept unchanged.");
      else if (stored.status === "unavailable") setMessage("Progress could not be read or saved in this browser.");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const chooseLearner = (learner: CourseState["learner"]) => {
    const current = loadLearning(localStorage, courseLearningScope, courseStateSchema);
    if (current.status === "invalid" || current.status === "incompatible") {
      setMessage("Reset the incompatible saved progress before changing learner type.");
      return;
    }
    const next = { ...(current.status === "ready" ? current.state : createCourseState(first, learner)), learner };
    const saved = saveLearning(localStorage, courseLearningScope, courseStateSchema, next, current.status === "ready" ? current.token : null);
    setState(next);
    setMessage(saved.status === "saved" ? null : "Learner type changed for this visit, but could not be saved.");
  };

  const unlockedIndex = englishQwertyCourse.lessons.findIndex(({ id }) => id === state.lastUnlockedLessonId);
  const completed = new Set(state.attempts.filter((attempt) => evaluateCourseAttempt(attempt).passed).map(({ lessonId }) => lessonId));

  return (
    <main className="learning-page course-page">
      <section className="learning-hero">
        <span className="eyebrow">FIXED COURSES · 15 LESSONS</span>
        <h1>Build the keyboard<br /><strong>two keys at a time.</strong></h1>
        <p>This is the reviewed KTouch English QWERTY sequence. It teaches letters and capitals; it does not claim to cover numbers or punctuation.</p>
        <div className="learner-toggle" role="group" aria-label="Course access mode">
          <button type="button" aria-pressed={state.learner === "beginner"} onClick={() => chooseLearner("beginner")}>Beginner · unlock in order</button>
          <button type="button" aria-pressed={state.learner === "advanced"} onClick={() => chooseLearner("advanced")}>Experienced · all lessons</button>
        </div>
        {message && <p className="learning-message" role="status">{message}</p>}
      </section>
      <ol className="course-grid">
        {englishQwertyCourse.lessons.map((lesson, index) => {
          const unlocked = state.learner === "advanced" || index <= unlockedIndex;
          return (
            <li className={`course-card ${unlocked ? "" : "is-locked"}`} key={lesson.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{lesson.title}</h2>
              <p>New keys <strong>{lesson.newCharacters}</strong></p>
              <p>{completed.has(lesson.id) ? "Completed" : unlocked ? "Ready" : "Locked"}</p>
              {unlocked ? <Link href={`/learn/courses/${lesson.id}`}>{completed.has(lesson.id) ? "Practice again" : "Start lesson"} ↗</Link> : <span aria-label="Lesson locked">Complete the previous lesson</span>}
            </li>
          );
        })}
      </ol>
    </main>
  );
}

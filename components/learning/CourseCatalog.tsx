"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { englishQwertyCourse } from "@/lib/learning/course-content";
import { evaluateCourseAttempt } from "@/lib/learning/course-engine";
import { createCourseState, courseStateSchema, type CourseState } from "@/lib/learning/course-state";
import { courseLearningScope } from "@/lib/learning/scopes";
import { loadLearning } from "@/lib/learning/repository";

type CourseCatalogProps = { embedded?: boolean };

export default function CourseCatalog({ embedded = false }: CourseCatalogProps) {
  const first = englishQwertyCourse.lessons[0].id;
  const [state, setState] = useState<CourseState>(() => createCourseState(first, "advanced"));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = loadLearning(localStorage, courseLearningScope, courseStateSchema);
      if (stored.status === "ready") setState({ ...stored.state, learner: "advanced" });
      else if (stored.status === "invalid" || stored.status === "incompatible") setMessage("We couldn't read your saved lesson progress. Your saved data has not been changed.");
      else if (stored.status === "unavailable") setMessage("Progress could not be read or saved in this browser.");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const completed = new Set(state.attempts.filter((attempt) => evaluateCourseAttempt(attempt).passed).map(({ lessonId }) => lessonId));
  const nextLessonId = englishQwertyCourse.lessons.find(({ id }) => !completed.has(id))?.id;
  const CardHeading = embedded ? "h3" : "h2";
  const heading = embedded ? (
    <header className="learning-section-heading">
      <div>
        <h2 id="courses-title">Typing lessons</h2>
        <p>Explore 15 English QWERTY lessons, from letter keys to capitals. Start with the keys you want to practice.</p>
      </div>
      <p className="learning-section-note">Each lesson has speed and accuracy goals. These lessons cover letters and capitals, not numbers or punctuation.</p>
    </header>
  ) : (
    <header className="learning-hero">
      <h1 id="courses-title">Typing lessons.<br /><strong>Start anywhere.</strong></h1>
      <p>Explore 15 English QWERTY lessons, from letter keys to capitals. You can repeat any lesson, and your completed lessons stay marked in this browser.</p>
      {message && <p className="learning-message" role="status">{message}</p>}
    </header>
  );

  const content = (
    <>
      {heading}
      {embedded && message && <p className="learning-message" role="status">{message}</p>}
      <ol className="course-grid">
        {englishQwertyCourse.lessons.map((lesson, index) => {
          const status = completed.has(lesson.id) ? "completed" : lesson.id === nextLessonId ? "next" : "not-started";
          const titleKeys = lesson.title.split(" and ");
          return (
            <li className="course-card-item" key={lesson.id}>
              <Link className={`course-card course-card--${status}`} href={`/learn/courses/${lesson.id}`} aria-label={`${status === "completed" ? "Practice again" : "Start lesson"}: ${lesson.title}`}>
                <div className="course-card-meta">
                  <span className="course-card-number">LESSON {String(index + 1).padStart(2, "0")}</span>
                  <span className="course-card-state">{status === "completed" ? "Completed" : status === "next" ? "Up next" : "Not started"}</span>
                </div>
                <div className="course-card-body">
                  <CardHeading className="course-card-title">
                    {titleKeys.length === 2 ? (
                      <><kbd>{titleKeys[0]}</kbd><span className="course-card-conjunction">and</span><kbd>{titleKeys[1]}</kbd></>
                    ) : (
                      <kbd className="course-card-keycap-wide">{lesson.title}</kbd>
                    )}
                  </CardHeading>
                </div>
                <span className="course-card-action" aria-hidden="true">
                  {status === "completed" ? "Practice again" : "Start lesson"}
                  <svg viewBox="0 0 20 20" fill="none"><path d="M4 16 16 4M7 4h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );

  if (embedded) return <section className="learning-courses" id="courses" aria-labelledby="courses-title">{content}</section>;
  return <main className="learning-page course-page">{content}</main>;
}

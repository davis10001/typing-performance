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
      else if (stored.status === "invalid" || stored.status === "incompatible") setMessage("Saved course progress belongs to another version or is damaged. It was kept unchanged.");
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
        <h2 id="courses-title">Choose a fixed lesson.</h2>
        <p>Fifteen English QWERTY lessons introduce letter keys in a set order. Every lesson is available, so you can start where the keyboard still feels unfamiliar.</p>
      </div>
      <p className="learning-section-note">Each lesson keeps the reviewed KTouch text and pass targets. Courses cover letters and capitals, not numbers or punctuation.</p>
    </header>
  ) : (
    <header className="learning-hero">
      <h1 id="courses-title">Choose a lesson<br /><strong>and start anywhere.</strong></h1>
      <p>Follow the reviewed 15-lesson KTouch English QWERTY sequence. Every lesson is open for practice; completed lessons stay marked in this browser.</p>
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
            <li className={`course-card course-card--${status}`} key={lesson.id}>
              <div className="course-card-meta">
                <span className="course-card-number">LESSON {String(index + 1).padStart(2, "0")}</span>
                <span className="course-card-state">{status === "completed" ? "Completed" : status === "next" ? "Up next" : "Not started"}</span>
              </div>
              <div className="course-card-body">
                <CardHeading>{titleKeys.length === 2 ? <>{titleKeys[0]} <span className="course-card-conjunction">and</span> {titleKeys[1]}</> : lesson.title}</CardHeading>
                <p className="course-card-keys">New keys <span className="course-card-keyset" title={lesson.newCharacters}>{lesson.newCharacters.length > 8 ? <kbd>A–Z</kbd> : [...lesson.newCharacters].map((character) => <kbd key={character}>{character}</kbd>)}</span></p>
              </div>
              <Link className="course-card-action" href={`/learn/courses/${lesson.id}`} aria-label={`${status === "completed" ? "Practice again" : "Start lesson"}: ${lesson.title}`}>
                {status === "completed" ? "Practice again" : "Start lesson"}
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M4 16 16 4M7 4h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
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

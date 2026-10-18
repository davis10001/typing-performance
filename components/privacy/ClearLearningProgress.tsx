"use client";

import { useState } from "react";
import { clearLearningMode, LEARNING_STORAGE_PREFIX } from "@/lib/learning/repository";

export default function ClearLearningProgress() {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  function clearProgress() {
    const storage = window.localStorage;
    const guidedToken = storage.getItem(`${LEARNING_STORAGE_PREFIX}:guided`);
    const courseToken = storage.getItem(`${LEARNING_STORAGE_PREFIX}:course`);
    const paragraphToken = storage.getItem(`${LEARNING_STORAGE_PREFIX}:paragraph`);
    const guided = clearLearningMode(storage, "guided", guidedToken);
    const course = clearLearningMode(storage, "course", courseToken);
    const paragraph = clearLearningMode(storage, "paragraph", paragraphToken);
    setMessage(
      guided.status === "cleared" && course.status === "cleared" && paragraph.status === "cleared"
        ? "Practice progress removed. Your saved typing test results are still here."
        : "Practice progress changed in another tab or could not be removed. Reload and try again.",
    );
    setConfirming(false);
  }

  return (
    <div className="privacy-clear-results">
      {confirming ? (
        <div className="privacy-clear-actions" role="group" aria-label="Clear practice progress">
          <span>Remove adaptive practice, lesson, and paragraph progress from this browser? Your test results will stay.</span>
          <button type="button" onClick={clearProgress}>Clear practice progress</button>
          <button type="button" onClick={() => setConfirming(false)}>Cancel</button>
        </div>
      ) : (
        <button type="button" className="text-button" onClick={() => { setMessage(""); setConfirming(true); }}>Clear practice progress</button>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}

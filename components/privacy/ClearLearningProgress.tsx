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
    const guided = clearLearningMode(storage, "guided", guidedToken);
    const course = clearLearningMode(storage, "course", courseToken);
    setMessage(
      guided.status === "cleared" && course.status === "cleared"
        ? "Learning progress removed. Saved typing-test results were not changed."
        : "Learning progress changed in another tab or could not be removed. Reload and try again.",
    );
    setConfirming(false);
  }

  return (
    <div className="privacy-clear-results">
      {confirming ? (
        <div className="privacy-clear-actions" role="group" aria-label="Clear learning progress">
          <span>Remove continuous-practice and course progress from this browser? Test history will stay.</span>
          <button type="button" onClick={clearProgress}>Clear learning progress</button>
          <button type="button" onClick={() => setConfirming(false)}>Cancel</button>
        </div>
      ) : (
        <button type="button" className="text-button" onClick={() => { setMessage(""); setConfirming(true); }}>Clear learning progress</button>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}

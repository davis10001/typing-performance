"use client";

import { useState } from "react";
import { clearHistory } from "@/lib/history/repository";

export default function ClearLocalResults() {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  function clearResults() {
    try {
      if (!clearHistory(window.localStorage)) throw new Error("Could not clear results");
      setMessage("Saved results removed from this browser.");
    } catch {
      setMessage("This browser could not remove saved results. Try clearing site data in your browser settings.");
    }
    setConfirming(false);
  }

  return (
    <div className="privacy-clear-results">
      {confirming ? (
        <div className="privacy-clear-actions" role="group" aria-label="Clear saved results">
          <span>Remove all saved test results from this browser? This cannot be undone.</span>
          <button type="button" onClick={clearResults}>Clear results</button>
          <button type="button" onClick={() => setConfirming(false)}>Cancel</button>
        </div>
      ) : (
        <button type="button" className="text-button" onClick={() => { setMessage(""); setConfirming(true); }}>Clear local history</button>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}

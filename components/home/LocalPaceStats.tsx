"use client";

import { useEffect, useState } from "react";
import { clearHistory, loadHistory, type StoredResultSummary } from "@/lib/history/repository";
import { summarizeWpmByDuration } from "@/lib/history/stats";
import { countBucket, telemetry } from "@/lib/telemetry/adapter";

function displayWpm(value: number | null): string {
  if (value === null) return "—";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export default function LocalPaceStats() {
  const [history, setHistory] = useState<StoredResultSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearError, setClearError] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setHistory(loadHistory(window.localStorage));
      } catch {
        setStorageUnavailable(true);
      }
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const rows = summarizeWpmByDuration(history);
  const hasScores = rows.some((row) => row.count > 0);
  const highest = Math.max(0, ...rows.flatMap((row) => [row.averageWpm ?? 0, row.medianWpm ?? 0]));
  const scale = Math.max(40, Math.ceil(highest / 10) * 10);

  function clearSavedResults() {
    try {
      if (!clearHistory(window.localStorage)) throw new Error("Could not clear local results");
      telemetry.event({ name: "history_clear", count_bucket: countBucket(history.length) });
      setHistory([]);
      setClearError(false);
    } catch {
      telemetry.error("storage_clear");
      setClearError(true);
    }
    setConfirmingClear(false);
  }

  return (
    <section className="home-stats" aria-labelledby="home-stats-title">
      <div className="home-stats-heading">
        <div className="home-stats-intro">
          <span className="eyebrow dark">PERFORMANCE SNAPSHOT</span>
          <h3 id="home-stats-title">PACE BY DURATION.</h3>
          <p>Your average and median correct WPM across your most recent 20 completed tests in this browser.</p>
        </div>
      </div>
      <div className="home-stats-body">
        <div className="home-stats-chart" role="group" aria-label="Your average and median correct WPM by test duration">
          <div className="home-stats-panel-head"><strong>PACE PROFILE</strong><span>CORRECT WPM</span></div>
          <div className="home-stats-legend" aria-hidden="true"><span><i className="stat-key average" />Average</span><span><i className="stat-key median" />Median</span></div>
          {!loaded ? <p className="home-stats-empty" role="status">Loading local results…</p> : (
            <>
              {!hasScores && <p className="home-stats-empty">{storageUnavailable ? "Local results are unavailable in this browser." : "No completed tests in this browser yet. Your chart will fill in after a test."}</p>}
              <div className="home-stats-rows">
                {rows.map((row) => (
                  <div className="home-stat-row" key={row.durationSeconds}>
                    <strong>{row.durationSeconds / 60} MIN</strong>
                    <div className="home-stat-bars" aria-hidden="true">
                      <div className="home-stat-track"><span className="average" style={{ width: `${((row.averageWpm ?? 0) / scale) * 100}%` }} /></div>
                      <div className="home-stat-track"><span className="median" style={{ width: `${((row.medianWpm ?? 0) / scale) * 100}%` }} /></div>
                    </div>
                    <span className="home-stat-end">{row.count > 0 ? `${displayWpm(row.averageWpm)} WPM` : "—"}</span>
                  </div>
                ))}
              </div>
              <div className="home-stats-axis" aria-hidden="true"><span>0</span><span>{scale / 2}</span><span>{scale} WPM</span></div>
            </>
          )}
        </div>
        <div className="home-stats-list">
          <div className="home-stats-panel-head"><strong>SESSION DETAIL</strong><span>LOCAL / RECENT 20</span></div>
          <div className="home-stats-list-head" aria-hidden="true"><span>TEST</span><span>AVG</span><span>MEDIAN</span><span>N</span></div>
          <div className="home-stats-list-rows">
            {rows.map((row) => (
              <div className="home-stats-list-row" key={row.durationSeconds}>
                <strong>{row.durationSeconds / 60} MIN</strong>
                <span data-label="Average">{displayWpm(row.averageWpm)}</span>
                <span data-label="Median">{displayWpm(row.medianWpm)}</span>
                <span data-label="N">{row.count}</span>
              </div>
            ))}
          </div>
          <p className="home-stats-list-note">N = scored tests. WPM values are rounded to one decimal. No public benchmark is included in this launch.</p>
          {hasScores && (confirmingClear ? (
            <div className="home-stats-clear-confirm" role="group" aria-label="Clear local results">
              <span>Remove every saved result from this browser? This cannot be undone.</span>
              <button type="button" onClick={clearSavedResults}>Clear results</button>
              <button type="button" onClick={() => setConfirmingClear(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="text-button home-stats-clear" onClick={() => setConfirmingClear(true)}>Clear local history</button>
          ))}
          {clearError && <p className="home-stats-clear-error" role="status">This browser could not clear the saved results.</p>}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { loadHistory, type StoredResultSummary } from "@/lib/history/repository";
import { summarizeWpmByDuration } from "@/lib/history/stats";

// External values stay empty until duration, population, WPM definition, and source are approved.
const reviewedPublicMedianWpm: Record<number, number | null> = { 60: null, 120: null, 180: null, 300: null, 600: null };

function displayWpm(value: number | null): string {
  if (value === null) return "—";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export default function LocalPaceStats() {
  const [history, setHistory] = useState<StoredResultSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);

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
  const highest = Math.max(0, ...rows.flatMap((row) => [row.averageWpm ?? 0, row.medianWpm ?? 0, reviewedPublicMedianWpm[row.durationSeconds] ?? 0]));
  const scale = Math.max(40, Math.ceil(highest / 10) * 10);
  const hasPublicReference = rows.some((row) => reviewedPublicMedianWpm[row.durationSeconds] !== null);

  return (
    <section className="home-stats" aria-labelledby="home-stats-title">
      <div className="home-stats-heading">
        <div className="home-stats-intro">
          <span className="eyebrow dark">PERFORMANCE SNAPSHOT</span>
          <h3 id="home-stats-title">PACE BY DURATION.</h3>
          <p>Your average and median correct WPM across your most recent 20 completed tests in this browser.</p>
        </div>
        <div className="home-stats-reference">
          <span>PUBLIC MEDIAN REFERENCE</span>
          <strong>{hasPublicReference ? "Reviewed source" : "Awaiting source review"}</strong>
          <small>{hasPublicReference ? "See duration-specific values below." : "No external benchmark is shown until its source and test method are approved."}</small>
        </div>
      </div>
      <div className="home-stats-body">
        <div className="home-stats-chart" role="group" aria-label="Your average and median correct WPM by test duration">
          <div className="home-stats-panel-head"><strong>PACE PROFILE</strong><span>CORRECT WPM</span></div>
          <div className="home-stats-legend" aria-hidden="true"><span><i className="stat-key average" />Average</span><span><i className="stat-key median" />Median</span>{hasPublicReference && <span><i className="stat-key reference" />Public median</span>}</div>
          {!loaded ? <p className="home-stats-empty" role="status">Loading local results…</p> : (
            <>
              {!hasScores && <p className="home-stats-empty">{storageUnavailable ? "Local results are unavailable in this browser." : "No completed tests in this browser yet. Your chart will fill in after a test."}</p>}
              <div className="home-stats-rows">
                {rows.map((row) => {
                  const reference = reviewedPublicMedianWpm[row.durationSeconds];
                  return (
                    <div className="home-stat-row" key={row.durationSeconds}>
                      <strong>{row.durationSeconds / 60} MIN</strong>
                      <div className="home-stat-bars" aria-hidden="true">
                        <div className="home-stat-track"><span className="average" style={{ width: `${((row.averageWpm ?? 0) / scale) * 100}%` }} /></div>
                        <div className="home-stat-track"><span className="median" style={{ width: `${((row.medianWpm ?? 0) / scale) * 100}%` }} /></div>
                        {reference !== null && <i className="home-stat-reference" style={{ left: `${(reference / scale) * 100}%` }} />}
                      </div>
                      <span className="home-stat-end">{row.count > 0 ? `${displayWpm(row.averageWpm)} WPM` : "—"}</span>
                    </div>
                  );
                })}
              </div>
              <div className="home-stats-axis" aria-hidden="true"><span>0</span><span>{scale / 2}</span><span>{scale} WPM</span></div>
            </>
          )}
        </div>
        <div className="home-stats-list">
          <div className="home-stats-panel-head"><strong>SESSION DETAIL</strong><span>LOCAL / RECENT 20</span></div>
          <div className="home-stats-list-head" aria-hidden="true"><span>TEST</span><span>AVG</span><span>MEDIAN</span><span>PUBLIC</span><span>N</span></div>
          <div className="home-stats-list-rows">
            {rows.map((row) => (
              <div className="home-stats-list-row" key={row.durationSeconds}>
                <strong>{row.durationSeconds / 60} MIN</strong>
                <span data-label="Average">{displayWpm(row.averageWpm)}</span>
                <span data-label="Median">{displayWpm(row.medianWpm)}</span>
                <span data-label="Public">{displayWpm(reviewedPublicMedianWpm[row.durationSeconds])}</span>
                <span data-label="N">{row.count}</span>
              </div>
            ))}
          </div>
          <p className="home-stats-list-note">N = scored tests. WPM values are rounded to one decimal. “Public” remains blank until a comparable source is approved.</p>
        </div>
      </div>
    </section>
  );
}

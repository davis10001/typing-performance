"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import benchmark from "@/content/benchmark/typing-speed-benchmarks-v1.json";
import { durationOptions } from "@/lib/content/test-pages";
import { telemetry } from "@/lib/telemetry/adapter";

type Score = { wpm: number; accuracy: number; durationSeconds: number };
const handoffKey = "typinglevel:result-handoff:v1";
const durations = [60, 120, 180, 300, 600];
const [commonStart, commonEnd] = benchmark.adultStudy.commonRangeWpm;

function validScore(value: unknown): value is Score {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.wpm === "number" && Number.isFinite(item.wpm) && item.wpm >= 0 && item.wpm <= 1000
    && typeof item.accuracy === "number" && Number.isFinite(item.accuracy) && item.accuracy >= 0 && item.accuracy <= 100
    && typeof item.durationSeconds === "number" && durations.includes(item.durationSeconds);
}

function resultContext(score: Score) {
  if (score.wpm < commonStart) return `Your result is below the ${commonStart}–${commonEnd} WPM range where most study participants landed.`;
  if (score.wpm <= commonEnd) return `Your result is within the ${commonStart}–${commonEnd} WPM range where most study participants landed.`;
  if (score.wpm <= benchmark.historicalProfessionalRangeWpm[1]) return `Your result is above the study’s most common range and within the ${benchmark.historicalProfessionalRangeWpm.join("–")} WPM range reported in earlier professional studies.`;
  return `Your result is above the study’s most common range and the ${benchmark.historicalProfessionalRangeWpm.join("–")} WPM range reported in earlier professional studies.`;
}

function TestLengthLinks() {
  return <nav className="speed-duration-picker" aria-label="Typing test lengths">
    {durationOptions.map((option) => {
      const minutes = option.seconds / 60;
      return <Link key={option.seconds} href={option.href} aria-label={`Take a ${minutes}-minute test`}>
        <span className="speed-duration-value"><strong>{minutes}</strong><span>min</span></span>
        <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M6 14 14 6M8 6h6v6" /></svg>
      </Link>;
    })}
  </nav>;
}

function ReportCard({ score }: { score: Score | null }) {
  const durationMinutes = score ? score.durationSeconds / 60 : null;

  return <div className="speed-report-preview" role="region" aria-label={score ? "Completed typing report" : "Preview of an unfilled typing report"}>
    <dl className="speed-report-preview-metrics">
      <div><dt>Correct speed</dt><dd>{score ? Number(score.wpm.toFixed(1)) : <><span aria-hidden="true">—</span><span className="sr-only">Waiting for your result</span></>} <small>WPM</small></dd></div>
      <div><dt>Accuracy</dt><dd>{score ? Number(score.accuracy.toFixed(1)) : <><span aria-hidden="true">—</span><span className="sr-only">Waiting for your result</span></>} <small>%</small></dd></div>
      <div><dt>Test length</dt><dd>{durationMinutes ?? <><span aria-hidden="true">—</span><span className="sr-only">Waiting for your result</span></>} <small>min</small></dd></div>
    </dl>
  </div>;
}

export default function SpeedInterpretation() {
  const [score, setScore] = useState<Score | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const handoff = sessionStorage.getItem(handoffKey);
        sessionStorage.removeItem(handoffKey);
        if (handoff) {
          const parsed: unknown = JSON.parse(handoff);
          if (validScore(parsed)) {
            setScore(parsed);
            telemetry.event({ name: "speed_interpretation", source: "test" });
          }
        }
      } catch { /* The default test invitation remains available without session storage. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const durationMinutes = score ? score.durationSeconds / 60 : 1;

  return (
    <section className="speed-followup">
      {score ? <div className="speed-result" aria-live="polite" aria-labelledby="speed-result-title">
        <h2 id="speed-result-title">Your typing report is ready.</h2>
        <p className="speed-result-intro">Your completed {durationMinutes}-minute test now appears below. Use the same test length when you compare another attempt.</p>
        <TestLengthLinks />
        <ReportCard score={score} />
        <div className="speed-result-reading">
          <h3>{score.accuracy < 90 ? "Make accuracy the next focus." : score.accuracy < 95 ? "Build a steadier pace." : "Keep this pace consistent."}</h3>
          <p className="speed-score-context">{resultContext(score)} {score.durationSeconds === 60 ? "A one-minute test is a quick snapshot, so repeat it before judging a trend." : `Compare this ${durationMinutes}-minute result with other attempts at the same length.`}</p>
          <p>{score.accuracy < 90
            ? "Slow down enough to reduce mistakes, then repeat the same test length."
            : score.accuracy < 95
              ? "Practice the words that interrupt your rhythm, then repeat the same test length."
              : "Your accuracy is strong on this attempt. Repeat the same test length to see whether the pace holds."}</p>
        </div>
      </div> : <div className="speed-empty" aria-labelledby="speed-empty-title">
        <h2 id="speed-empty-title">Your typing report will appear here.</h2>
        <p className="speed-empty-intro">Complete a typing test, then choose <strong>Understand my speed</strong>. Your score will automatically fill this report.</p>
        <TestLengthLinks />
        <ReportCard score={null} />
      </div>}
    </section>
  );
}

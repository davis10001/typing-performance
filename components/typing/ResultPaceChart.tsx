export type PaceSample = {
  elapsedSeconds: number;
  correctKeys: number;
  typedKeys: number;
  correctWpm: number;
  rawWpm: number;
};

export type TimedError = {
  elapsedSeconds: number;
  inputIndex: number;
  corrected: boolean;
};

function timeLabel(seconds: number): string {
  return seconds >= 60 ? `${seconds / 60} min` : `${seconds}s`;
}

export default function ResultPaceChart({ samples, errors, durationSeconds }: { samples: PaceSample[]; errors: TimedError[]; durationSeconds: number }) {
  const points = [{ elapsedSeconds: 0, correctWpm: 0, rawWpm: 0 }, ...samples];
  const ceiling = Math.max(20, Math.ceil(Math.max(...points.flatMap((point) => [point.correctWpm, point.rawWpm])) / 10) * 10);
  const correctedCount = errors.filter((error) => error.corrected).length;
  const remainingCount = errors.length - correctedCount;
  const path = (key: "correctWpm" | "rawWpm") => points.map((point, index) =>
    `${index === 0 ? "M" : "L"} ${(point.elapsedSeconds / durationSeconds * 600).toFixed(1)} ${(160 - point[key] / ceiling * 160).toFixed(1)}`,
  ).join(" ");

  return (
    <figure className="result-pace" aria-labelledby="result-pace-title">
      <figcaption>
        <div>
          <h3 id="result-pace-title">Your pace during this test</h3>
          <p>Recent speed in 5-second windows</p>
        </div>
        <div className="result-pace-legend" aria-label="Chart lines">
          <span className="result-pace-legend-correct">Correct WPM</span>
          <span className="result-pace-legend-raw">Raw WPM</span>
          {correctedCount > 0 && <span className="result-pace-legend-fixed">Corrected</span>}
          {remainingCount > 0 && <span className="result-pace-legend-remaining">Uncorrected</span>}
        </div>
      </figcaption>
      <div className="result-pace-plot">
        <div className="result-pace-y" aria-hidden="true"><span>{ceiling}</span><span>{ceiling / 2}</span><span>0</span></div>
        <svg viewBox="0 0 600 160" preserveAspectRatio="none" role="img" aria-label={`Recent correct and raw typing pace across this ${timeLabel(durationSeconds)} test; ${correctedCount} corrected errors and ${remainingCount} remaining errors`}>
          <path className="result-pace-grid" d="M 0 0 H 600 M 0 80 H 600 M 0 160 H 600" />
          <path className="result-pace-raw" d={path("rawWpm")} />
          <path className="result-pace-correct" d={path("correctWpm")} />
        </svg>
        <div className="result-pace-markers" aria-hidden="true">
          {errors.map((error, index) => (
            <span
              key={index}
              className={error.corrected ? "result-pace-error-fixed" : "result-pace-error-remaining"}
              style={{ left: `clamp(6px, ${error.elapsedSeconds / durationSeconds * 100}%, calc(100% - 6px))` }}
            />
          ))}
        </div>
      </div>
      <div className="result-pace-x" aria-hidden="true"><span>0</span><span>{timeLabel(durationSeconds / 2)}</span><span>{timeLabel(durationSeconds)}</span></div>
      <p className="result-pace-insight">
        {errors.length === 0
          ? "No mistakes in this attempt."
          : `${errors.length} ${errors.length === 1 ? "mistake" : "mistakes"}: ${correctedCount} corrected with Backspace, ${remainingCount} left in the final text.`}
      </p>
    </figure>
  );
}

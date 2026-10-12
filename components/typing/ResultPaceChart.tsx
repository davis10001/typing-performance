export type PaceSample = {
  elapsedSeconds: number;
  correctWpm: number;
  rawWpm: number;
};

function timeLabel(seconds: number): string {
  return seconds >= 60 ? `${seconds / 60} min` : `${seconds}s`;
}

export default function ResultPaceChart({ samples, durationSeconds }: { samples: PaceSample[]; durationSeconds: number }) {
  const points = [{ elapsedSeconds: 0, correctWpm: 0, rawWpm: 0 }, ...samples];
  const ceiling = Math.max(20, Math.ceil(Math.max(...points.map((point) => point.rawWpm)) / 10) * 10);
  const path = (key: "correctWpm" | "rawWpm") => points.map((point, index) =>
    `${index === 0 ? "M" : "L"} ${(point.elapsedSeconds / durationSeconds * 600).toFixed(1)} ${(160 - point[key] / ceiling * 160).toFixed(1)}`,
  ).join(" ");

  return (
    <figure className="result-pace" aria-labelledby="result-pace-title">
      <figcaption>
        <div>
          <h3 id="result-pace-title">Your pace during this test</h3>
          <p>Cumulative WPM, sampled each second</p>
        </div>
        <div className="result-pace-legend" aria-label="Chart lines">
          <span className="result-pace-legend-correct">Correct WPM</span>
          <span className="result-pace-legend-raw">Raw WPM</span>
        </div>
      </figcaption>
      <div className="result-pace-plot">
        <div className="result-pace-y" aria-hidden="true"><span>{ceiling}</span><span>{ceiling / 2}</span><span>0</span></div>
        <svg viewBox="0 0 600 160" preserveAspectRatio="none" role="img" aria-label={`Correct and raw words per minute across this ${timeLabel(durationSeconds)} test`}>
          <path className="result-pace-grid" d="M 0 0 H 600 M 0 80 H 600 M 0 160 H 600" />
          <path className="result-pace-correct" d={path("correctWpm")} />
          <path className="result-pace-raw" d={path("rawWpm")} />
        </svg>
      </div>
      <div className="result-pace-x" aria-hidden="true"><span>0</span><span>{timeLabel(durationSeconds / 2)}</span><span>{timeLabel(durationSeconds)}</span></div>
    </figure>
  );
}

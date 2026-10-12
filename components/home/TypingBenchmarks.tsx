import Link from "next/link";
import benchmark from "@/content/benchmark/typing-speed-benchmarks-v1.json";

const [commonStart, commonEnd] = benchmark.adultStudy.commonRangeWpm;
const [professionalStart, professionalEnd] = benchmark.historicalProfessionalRangeWpm;

function SchoolLevelIcon({ index }: { index: number }) {
  const paths = [
    <path key="book" d="M4 5.5c3-1.2 5.7-.8 8 1.2v12c-2.3-2-5-2.4-8-1.2v-12Zm16 0c-3-1.2-5.7-.8-8 1.2v12c2.3-2 5-2.4 8-1.2v-12Z" />,
    <path key="pencil" d="m5 17 1-4L16.5 2.5a2.1 2.1 0 0 1 3 3L9 16l-4 1Zm9.5-12.5 3 3M4 21h16" />,
    <path key="cap" d="m3 9 9-5 9 5-9 5-9-5Zm4 2.2V16c2.8 2.2 7.2 2.2 10 0v-4.8M21 9v6" />,
    <path key="briefcase" d="M4 7h16v12H4V7Zm5 0V4h6v3M4 12h16M10 12v2h4v-2" />,
  ];

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[index]}</svg>;
}

export default function TypingBenchmarks() {
  return (
    <section className="home-guide home-benchmark" aria-labelledby="typing-benchmark-title">
      <header className="benchmark-heading">
        <h2 id="typing-benchmark-title">WHAT IS A GOOD TYPING SPEED?</h2>
        <p>In a study of 168,960 typists, the average was <strong>52 WPM</strong> and most people typed between <strong>30 and 60 WPM</strong>.</p>
      </header>

      <figure className="benchmark-bar-card" aria-labelledby="benchmark-bar-title benchmark-bar-caption">
        <header>
          <span>Adult keyboard study</span>
          <p>{benchmark.adultStudy.sampleSize.toLocaleString("en-US")} participants</p>
        </header>

        <div className="benchmark-bar-summary">
          <p><strong>{benchmark.adultStudy.displayAverageWpm}</strong><span>average WPM</span></p>
          <p><span>Most participants</span><strong>{commonStart}–{commonEnd} WPM</strong></p>
        </div>

        <div
          className="benchmark-bar-scale"
          role="img"
          aria-label={`A WPM scale from 0 to 120. Most study participants typed between ${commonStart} and ${commonEnd} WPM, the average was ${benchmark.adultStudy.displayAverageWpm} WPM, and the fastest participants reached ${benchmark.adultStudy.fastestObservedWpm} WPM or more.`}
        >
          <strong id="benchmark-bar-title">MOST PARTICIPANTS</strong>
          <div className="benchmark-bar-track" aria-hidden="true">
            <span className="benchmark-bar-range" />
            <span className="benchmark-bar-average"><i>{benchmark.adultStudy.displayAverageWpm} avg</i></span>
          </div>
          <div className="benchmark-bar-ticks" aria-hidden="true">
            <span>0</span><span>30</span><span>60</span><span>90</span><span>120+</span>
          </div>
        </div>

        <dl className="benchmark-bar-evidence">
          <div><dt>Participants</dt><dd>{benchmark.adultStudy.sampleSize.toLocaleString("en-US")}</dd></div>
          <div><dt>Keystrokes</dt><dd>136.9M</dd></div>
          <div><dt>Fastest observed</dt><dd>{benchmark.adultStudy.fastestObservedWpm}+ WPM</dd></div>
        </dl>

        <figcaption id="benchmark-bar-caption">The study measured transcription typing from randomized English sentences.</figcaption>
      </figure>

      <div className="benchmark-scan">
        <section aria-labelledby="benchmark-ranges-title">
          <h3 id="benchmark-ranges-title">A quick way to read your score</h3>
          <div className="benchmark-range-grid">
            <p><strong>Under {commonStart}</strong><span>Below the main study range</span></p>
            <p><strong>{commonStart}–{commonEnd}</strong><span>Most participants</span></p>
            <p><strong>{professionalStart}–{professionalEnd}</strong><span>Earlier professional studies</span></p>
            <p><strong>{benchmark.adultStudy.fastestObservedWpm}+</strong><span>Fastest observed</span></p>
          </div>
        </section>

        <section className="benchmark-school" aria-labelledby="benchmark-school-title">
          <div>
            <h3 id="benchmark-school-title">School-level planning guide</h3>
            <p>Useful targets, not fixed ability standards.</p>
          </div>
          <table>
            <thead>
              <tr><th><span className="sr-only">Stage icon</span></th><th>Level</th><th>Stage</th><th>Reference</th></tr>
            </thead>
            <tbody>
              {benchmark.educationGuidance.groups.map((group, index) => (
                <tr key={group.label}>
                  <td><i><SchoolLevelIcon index={index} /></i></td>
                  <th scope="row">{group.label}</th>
                  <td>{group.detail}</td>
                  <td><strong>{group.range}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <footer className="benchmark-footer">
        <p>Accuracy and steady progress matter alongside speed. The study used self-selected volunteers, so treat its results as a reference rather than a pass or fail line.</p>
        <nav aria-label="Typing speed resources">
          <a href={benchmark.adultStudy.sourceUrl} target="_blank" rel="noopener noreferrer">Study source</a>
          <a href={benchmark.educationGuidance.sourceUrl} target="_blank" rel="noopener noreferrer">School guidance</a>
          <Link href="/average-typing-speed">More on typing speed</Link>
          <Link href="/average-wpm">How WPM works</Link>
        </nav>
      </footer>
    </section>
  );
}

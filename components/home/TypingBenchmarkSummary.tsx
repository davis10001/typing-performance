import Link from "next/link";
import benchmark from "@/content/benchmark/typing-speed-benchmarks-v1.json";

export default function TypingBenchmarkSummary() {
  return <section className="home-guide home-benchmark-summary" aria-labelledby="typing-benchmark-summary-title">
    <div><h2 id="typing-benchmark-summary-title">What does your speed mean?</h2><p>In a study of {benchmark.adultStudy.sampleSize.toLocaleString("en-US")} self-selected online volunteers, the average was {benchmark.adultStudy.displayAverageWpm} WPM. Your own accuracy, test length, and repeat attempts matter when reading a result.</p></div>
    <nav aria-label="Understand typing speed"><Link className="button button-primary" href="/good-typing-speed">Understand my speed <span aria-hidden="true">↗</span></Link></nav>
  </section>;
}

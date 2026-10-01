# Typing Performance · Ubiquitous Language

This glossary deliberately contains business terms only; implementation lives in `architecture/`.

| Term | Canonical meaning | Not the same as |
|---|---|---|
| Timed Test | A fixed-duration attempt to type a prescribed text | A lesson, race, or certificate exam |
| Test Session | One attempt from Ready through Completed or Abandoned | A browser visit or user account |
| Test Result | The immutable summary produced only by a completed Test Session | Live input state or a historical percentile |
| WPM | Correct characters divided by five and elapsed minutes | Raw WPM |
| Raw WPM | All typed characters divided by five and elapsed minutes | WPM; it does not discount errors |
| Accuracy | Correct keystrokes divided by total keystrokes | Correct characters / text length |
| Benchmark Band | A sourced, explanatory score range | A percentile or proof of skill |
| Local History | Browser-local, user-clearable result summaries | Cloud history or a cross-device profile |
| Verified Certificate | A future P1 credential whose result and integrity rules are explicitly checked | A normal P0 test result |

Rules: a completed Test Session produces at most one Test Result; an Abandoned Session produces none. A Benchmark Band may describe a Test Result but never makes it verified or percentile-ranked.

# Paragraph Practice product design

Status: implemented
Primary benchmark: [Typing.com Paragraph Practice](https://www.typing.com/en-gb/student/lesson/33164/paragraph-practice)

## Product role

Paragraph Practice connects the existing learning modes:

1. Typing Lessons introduce keys.
2. Adaptive Practice strengthens weak keys.
3. Paragraph Practice combines those skills in complete English passages.
4. Timed Tests measure sustained performance.
5. Errors found in paragraph practice return to the weak-key practice loop.

The typing interaction, finger guide, error behavior, result hierarchy, goals, and controls must reuse the existing learning product. Competitor research informs feature coverage and content structure only.

## First release

The first release includes:

- 18 original US English paragraphs.
- Beginner, Intermediate, and Advanced levels.
- Six practice focuses: Everyday English, Work & Study, Capitals & Punctuation, Numbers & Symbols, Story Practice, and Long Paragraphs.
- Three paragraphs per practice set.
- A continuous set flow with a next-paragraph action and set summary.
- Browser-local completion and attempt history.
- Aggregated problem keys and a route back to Adaptive Practice.
- Server-rendered descriptions and paragraph previews for search discovery.

Teacher assignments, classroom reporting, rankings, streaks, achievements, AI-generated passages, and public sharing are outside the first release.

## Content model

Each paragraph has an ID, title, text, level, focus, set ID, order, locale, and content revision. Sets contain three passages ordered from shorter or simpler to longer or more complex.

### Difficulty guidelines

- Beginner: 45–70 words, common vocabulary, short sentences, periods and commas.
- Intermediate: 55–90 words, longer sentences, capitals, apostrophes, questions, and common workplace or study vocabulary.
- Advanced: 60–160 words, compound sentences, quotations, colons, semicolons, numbers, and sustained input.

### Initial sets

| Set | Level | Primary skill |
| --- | --- | --- |
| Everyday English | Beginner | Natural sentences and basic punctuation |
| Work & Study | Beginner | Common practical vocabulary |
| Capitals & Punctuation | Intermediate | Shift use and punctuation |
| Story Practice | Intermediate | Sentence rhythm and narrative continuity |
| Numbers & Symbols | Advanced | Dates, times, currency, percentages, and symbols |
| Long Paragraphs | Advanced | Accuracy and pace over longer passages |

## User flow

### New learner

1. Open `/learn/paragraphs`.
2. Select a level and practice set from a vertically stacked catalog.
3. Start the set.
4. Complete paragraph 1 with the existing `LearningPracticeSurface`.
5. Review the existing learning result format.
6. Continue through paragraphs 2 and 3.
7. Review a set summary and choose problem-key practice, another set, a repeat, or a timed test.

### Returning learner

The catalog presents an unfinished set first. The learner resumes at the next uncompleted paragraph. Only completed attempts are stored; unfinished text and individual keystrokes are not persisted.

## Page states

### Catalog

- Introductory copy.
- Level filter.
- Vertically stacked practice-set cards.
- Level, focus, paragraph count, approximate time, and completed count.
- Start or Continue action.

### Practice

- Existing learning toolbar and reset control.
- Set title and `Paragraph 01 of 03` context.
- Existing inline passage input, typing sound, keyboard, and finger guide.

### Paragraph result

- Existing Accuracy, Typing pace, and Mistakes metrics.
- Existing 98% accuracy and 180 CPM goals.
- Existing problem-key review treatment.
- Start next paragraph, Try again, and Leave practice actions.
- Missing a goal recommends a repeat but does not lock the next paragraph.

### Set summary

- Average speed and accuracy.
- Total mistakes and active typing time.
- Up to four most frequent problem keys.
- Practice problem keys, choose another set, repeat this set, and timed test actions.

## Persistence

Use a separate `paragraph` learning scope in browser local storage. Store completed attempts with a run ID, set ID, paragraph ID, correct-character count, error count, active typing time, expected-key error totals, and completion time. Keep the active run pointer so a returning learner can resume at the next paragraph.

Do not store unfinished passage input or the sequence of actual keys entered. Include paragraph progress in the existing Clear practice progress control.

## Problem-key loop

Each attempt produces `errorsByExpectedKey`. The product aggregates these values across saved attempts, combines uppercase and lowercase errors by physical letter key, shows the worst four keys in the summary, and passes them to Adaptive Practice through `?source=paragraphs`. Adaptive Practice adds those letters to the generated exercise and focuses the currently weakest recommended key without advancing the learner's saved course stage. A future shared weak-key profile can combine course, adaptive, and paragraph evidence.

## Search and navigation

Keep `/learn/paragraphs` as the single indexable route for the first release. Filters remain UI state so they do not create thin or duplicate pages. Server output includes the product definition, level descriptions, set metadata, passage previews, and internal links to lessons, adaptive practice, and timed tests.

## Success measures

- Page-to-start conversion.
- Single-paragraph completion rate.
- Paragraph 1 to paragraph 2 continuation rate.
- Three-paragraph set completion rate.
- Retry rate.
- Problem-key practice click-through.
- Timed-test click-through.
- Seven-day return rate.

## Acceptance criteria

- Paragraph typing behaves exactly like existing course typing.
- Paragraph results follow the existing learning result rules and visual hierarchy.
- A learner can filter, start, complete, continue, resume, repeat, and finish a three-paragraph set.
- Completed attempts survive reloads in the same browser.
- A set summary accurately aggregates its three attempts.
- Problem keys link the learner back to Adaptive Practice.
- Clear practice progress removes paragraph progress alongside course and adaptive progress.
- The catalog and practice flow work without horizontal page overflow and meet the existing accessibility checks.

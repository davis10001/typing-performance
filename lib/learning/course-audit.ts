/** Content checks only; this module does not invent or change teaching rules. */
export type CourseLesson = {
  id: string;
  title: string;
  newCharacters: string;
  text: string;
};

export type CourseIssue = {
  lessonId: string;
  code: "empty-course" | "duplicate-id" | "missing-id" | "missing-title" | "empty-text" | "untaught-characters" | "unpractised-new-characters";
  characters?: string[];
};

export function auditCourse(lessons: readonly CourseLesson[]): CourseIssue[] {
  const issues: CourseIssue[] = [];
  if (!lessons.length) return [{ lessonId: "", code: "empty-course" }];
  const ids = new Set<string>();
  // Spaces and line separators format the course; all other characters must be introduced.
  const introduced = new Set([" ", "\n", "\r", "\t"]);
  for (const lesson of lessons) {
    if (!lesson.id.trim()) issues.push({ lessonId: lesson.id, code: "missing-id" });
    if (ids.has(lesson.id)) issues.push({ lessonId: lesson.id, code: "duplicate-id" });
    ids.add(lesson.id);
    if (!lesson.title.trim()) issues.push({ lessonId: lesson.id, code: "missing-title" });
    if (!lesson.text.trim()) issues.push({ lessonId: lesson.id, code: "empty-text" });
    for (const character of lesson.newCharacters) introduced.add(character);
    const characters = [...new Set(lesson.text)].filter((character) => !introduced.has(character)).sort();
    if (characters.length) issues.push({ lessonId: lesson.id, code: "untaught-characters", characters });
    const unpractised = [...new Set(lesson.newCharacters)].filter((character) => !lesson.text.includes(character));
    if (unpractised.length) issues.push({ lessonId: lesson.id, code: "unpractised-new-characters", characters: unpractised });
  }
  return issues;
}

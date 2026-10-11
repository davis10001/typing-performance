import { z } from "zod";
import content from "./content/english-qwerty.json";
import { auditCourse } from "./course-audit";

const courseContentSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  sourceLayout: z.string().min(1),
  source: z.strictObject({
    repository: z.url(), revision: z.string().min(1), path: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  contentRevision: z.string().regex(/^[a-f0-9]{64}$/),
  repairs: z.array(z.strictObject({
    lessonId: z.string().min(1), reason: z.string().min(1), originalTextSha256: z.string().regex(/^[a-f0-9]{64}$/), append: z.string().min(1),
  })),
  lessons: z.array(z.strictObject({
    id: z.string().min(1), title: z.string().min(1), newCharacters: z.string(), text: z.string().min(1),
  })).min(1),
});

export type LearningCourse = z.infer<typeof courseContentSchema>;

export const englishQwertyCourse: LearningCourse = courseContentSchema.parse(content);
const issues = auditCourse(englishQwertyCourse.lessons);
if (issues.length) throw new Error(`Bundled learning course failed audit: ${JSON.stringify(issues)}`);

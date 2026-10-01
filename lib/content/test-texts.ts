import { z } from "zod";
import foundations from "@/content/test-texts/english-foundations.json";
import focus from "@/content/test-texts/english-focus.json";

export const testTextSchema = z.object({
  id: z.string().min(1),
  language: z.literal("en"),
  difficulty: z.enum(["standard"]),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  sourceType: z.enum(["original", "public-domain", "licensed"]),
  sourceRef: z.string().min(1),
  tags: z.array(z.string()),
  text: z.string().min(100),
});

export type TestText = z.infer<typeof testTextSchema>;

export const testTexts: TestText[] = z.array(testTextSchema).min(1).parse([
  foundations,
  focus,
]);

export function buildTestPrompt(minimumCharacters = 12_000): string {
  const passage = testTexts.map((item) => item.text.trim()).join(" ");
  let prompt = passage;
  while (prompt.length < minimumCharacters) prompt += ` ${passage}`;
  return prompt;
}

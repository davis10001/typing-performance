import { z } from "zod";
import foundations from "@/content/test-texts/english-foundations.json";
import focus from "@/content/test-texts/english-focus.json";
import collection from "@/content/test-texts/english-collection-v1.json";
import easy from "@/content/test-texts/english-easy-v1.json";
import advanced from "@/content/test-texts/english-advanced-v1.json";

export const testTextSchema = z.object({
  id: z.string().min(1),
  language: z.literal("en"),
  difficulty: z.enum(["easy", "standard", "advanced"]),
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
  ...collection,
  ...easy,
  ...advanced,
]);

import { Language, Layout, loadKeyboard } from "@keybr/keyboard";
import { makePhoneticModel, type PhoneticModel } from "@keybr/phonetic-model";
import type { RNGStream } from "@keybr/rand";
import { makeKeyStatsMap, type Result } from "@keybr/result";
import { Settings } from "@keybr/settings";
import words from "@/vendor/keybr/packages/keybr-content-words/lib/data/words-en.json";
import { CourseOrderedGuidedLesson } from "./course-ordered-guided-lesson";
import { Lesson } from "@/vendor/keybr/packages/keybr-lesson/lib/lesson";
import type { GuidedLesson } from "@/vendor/keybr/packages/keybr-lesson/lib/guided";

export const KEYBR_MODEL_URL = "/learning/keybr/model-en.data";

export type GuidedRound = {
  text: string;
  availableCharacters: string[];
  focusCharacter: string | null;
};

export type GuidedMilestone = {
  character: string;
  resultCount: number;
};

export function createEnglishGuidedLesson(modelData: Uint8Array): GuidedLesson {
  const model: PhoneticModel = makePhoneticModel(Language.EN, modelData);
  return new CourseOrderedGuidedLesson(new Settings(), loadKeyboard(Layout.EN_US), model, words);
}

export async function loadEnglishGuidedLesson(
  fetchModel: (url: string) => Promise<Response> = fetch,
): Promise<GuidedLesson> {
  const response = await fetchModel(KEYBR_MODEL_URL);
  if (!response.ok) throw new Error(`Unable to load the Keybr English model (${response.status})`);
  return createEnglishGuidedLesson(new Uint8Array(await response.arrayBuffer()));
}

function updateGuidedLesson(lesson: GuidedLesson, results: readonly Result[], minimumKeyCount = 4) {
  const keyStatsMap = makeKeyStatsMap(lesson.letters, lesson.filter(results));
  return lesson instanceof CourseOrderedGuidedLesson
    ? lesson.updateWithMinimum(keyStatsMap, minimumKeyCount)
    : lesson.update(keyStatsMap);
}

export function createGuidedRound(
  lesson: GuidedLesson,
  results: readonly Result[],
  rng: RNGStream = Lesson.rng,
  minimumKeyCount = 4,
): GuidedRound {
  const lessonKeys = updateGuidedLesson(lesson, results, minimumKeyCount);
  const focusedKey = lessonKeys.findFocusedKey();
  return {
    text: lesson.generate(lessonKeys, rng),
    availableCharacters: lessonKeys.findIncludedKeys().map(({ letter }) => String.fromCodePoint(letter.codePoint)),
    focusCharacter: focusedKey == null ? null : String.fromCodePoint(focusedKey.letter.codePoint),
  };
}

export function createGuidedMilestones(
  lesson: GuidedLesson,
  results: readonly Result[],
): GuidedMilestone[] {
  const milestones: GuidedMilestone[] = [];
  const seen = new Set<string>();

  for (let resultCount = 0; resultCount <= results.length; resultCount += 1) {
    const lessonKeys = updateGuidedLesson(lesson, results.slice(0, resultCount));
    for (const { letter } of lessonKeys.findIncludedKeys()) {
      const character = String.fromCodePoint(letter.codePoint);
      if (seen.has(character)) continue;
      seen.add(character);
      milestones.push({ character, resultCount });
    }
  }

  return milestones;
}

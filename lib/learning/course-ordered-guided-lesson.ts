import type { WordList } from "@keybr/content";
import type { Keyboard } from "@keybr/keyboard";
import { Filter, Letter, type PhoneticModel } from "@keybr/phonetic-model";
import type { RNGStream } from "@keybr/rand";
import type { KeyStatsMap } from "@keybr/result";
import type { Settings } from "@keybr/settings";
import { englishQwertyCourse } from "./course-content";
import { GuidedLesson } from "@/vendor/keybr/packages/keybr-lesson/lib/guided";
import { LessonKey, LessonKeys } from "@/vendor/keybr/packages/keybr-lesson/lib/key";
import { lessonProps } from "@/vendor/keybr/packages/keybr-lesson/lib/settings";
import { Target } from "@/vendor/keybr/packages/keybr-lesson/lib/target";
import { generateFragment } from "@/vendor/keybr/packages/keybr-lesson/lib/text/fragment";
import {
  mangledWords,
  phoneticWords,
  randomWords,
  uniqueWords,
} from "@/vendor/keybr/packages/keybr-lesson/lib/text/words";

const INITIAL_KEY_COUNT = 4;
const MIN_NATURAL_WORDS = 15;
const INITIAL_FOCUS = "f";

export const COURSE_GUIDED_LETTER_ORDER = [
  ...new Set(englishQwertyCourse.lessons.flatMap(({ newCharacters }) =>
    [...newCharacters.toLowerCase()].filter((character) => /^[a-z]$/.test(character)),
  )),
];

const courseDrillWords = [...new Set(englishQwertyCourse.lessons.flatMap(({ text }) =>
  text.toLowerCase().split(/\s+/).filter((word) => /^[a-z]{2,6}$/.test(word)),
))];

function orderLetters(letters: readonly Letter[]): Letter[] {
  const remaining = new Map(letters.map((letter) => [String.fromCodePoint(letter.codePoint), letter]));
  const ordered: Letter[] = [];
  for (const character of COURSE_GUIDED_LETTER_ORDER) {
    const letter = remaining.get(character);
    if (letter == null) continue;
    ordered.push(letter);
    remaining.delete(character);
  }
  return [...ordered, ...Letter.frequencyOrder(remaining.values())];
}

function matchingCourseDrills(filter: Filter): string[] {
  return courseDrillWords.filter((word) =>
    [...word].every((character) => filter.includes(character.codePointAt(0)!)) &&
    (filter.focusedCodePoint == null || word.includes(String.fromCodePoint(filter.focusedCodePoint))),
  );
}

function fallbackDrills(filter: Filter): string[] {
  const characters = COURSE_GUIDED_LETTER_ORDER.filter((character) => filter.includes(character.codePointAt(0)!));
  const focus = filter.focusedCodePoint == null ? characters[0] : String.fromCodePoint(filter.focusedCodePoint);
  const partner = characters.find((character) => character !== focus) ?? focus;
  return [`${focus}${partner}`, `${partner}${focus}`, `${focus}${focus}`];
}

/** Keybr progression using the same letter sequence as the bundled KTouch course. */
export class CourseOrderedGuidedLesson extends GuidedLesson {
  readonly #orderedLetters: readonly Letter[];

  constructor(settings: Settings, keyboard: Keyboard, model: PhoneticModel, wordList: WordList) {
    super(settings, keyboard, model, wordList);
    this.#orderedLetters = orderLetters(this.model.letters);
  }

  override get letters(): readonly Letter[] {
    return this.#orderedLetters;
  }

  override update(keyStatsMap: KeyStatsMap): LessonKeys {
    return this.updateWithMinimum(keyStatsMap, INITIAL_KEY_COUNT);
  }

  updateWithMinimum(
    keyStatsMap: KeyStatsMap,
    minimumKeyCount: number,
    preferredFocusCharacters: readonly string[] = [],
  ): LessonKeys {
    const alphabetSize = this.settings.get(lessonProps.guided.alphabetSize);
    const recoverKeys = this.settings.get(lessonProps.guided.recoverKeys);
    const configuredSize = INITIAL_KEY_COUNT + Math.round((this.letters.length - INITIAL_KEY_COUNT) * alphabetSize);
    const maxSize = Math.min(this.letters.length, Math.max(configuredSize, Math.trunc(minimumKeyCount)));
    const target = new Target(this.settings);
    const lessonKeys = new LessonKeys(
      this.letters.map((letter) => LessonKey.from(keyStatsMap.get(letter), target)),
    );

    for (const lessonKey of lessonKeys) {
      const includedKeys = lessonKeys.findIncludedKeys();
      if (includedKeys.length < INITIAL_KEY_COUNT) {
        lessonKeys.include(lessonKey.letter);
      } else if (includedKeys.length < maxSize) {
        lessonKeys.force(lessonKey.letter);
      } else if ((lessonKey.bestConfidence ?? 0) >= 1) {
        lessonKeys.include(lessonKey.letter);
      } else if (recoverKeys) {
        if (includedKeys.every((key) => (key.confidence ?? 0) >= 1)) lessonKeys.include(lessonKey.letter);
      } else if (includedKeys.every((key) => (key.bestConfidence ?? 0) >= 1)) {
        lessonKeys.include(lessonKey.letter);
      }
    }

    const preferredKeys = preferredFocusCharacters
      .map((character) => lessonKeys.find(character.toLowerCase().codePointAt(0) ?? -1))
      .filter((key): key is LessonKey => key != null);
    for (const key of preferredKeys) lessonKeys.include(key.letter);

    const confidenceOf = (key: LessonKey): number =>
      recoverKeys ? (key.confidence ?? 0) : (key.bestConfidence ?? 0);
    const includedKeys = lessonKeys.findIncludedKeys();
    const weakestKeys = includedKeys
      .filter((key) => confidenceOf(key) < 1)
      .sort((a, b) => confidenceOf(a) - confidenceOf(b));
    const weakestPreferredKey = preferredKeys
      .map((key, order) => ({ key, order }))
      .sort((a, b) => confidenceOf(a.key) - confidenceOf(b.key) || a.order - b.order)[0]?.key;
    if (weakestPreferredKey != null) {
      lessonKeys.focus(weakestPreferredKey.letter);
    } else if (weakestKeys.length > 0) {
      const initialFocus = includedKeys.every(({ samples }) => samples.length === 0)
        ? lessonKeys.find(INITIAL_FOCUS.codePointAt(0)!)
        : null;
      lessonKeys.focus(initialFocus?.letter ?? weakestKeys[0].letter);
    }

    return lessonKeys;
  }

  override generate(lessonKeys: LessonKeys, rng: RNGStream): string {
    const filter = new Filter(lessonKeys.findIncludedKeys(), lessonKeys.findFocusedKey());
    const naturalWords = this.dictionary.find(filter).slice(0, 1000);
    const limitedVocabulary = naturalWords.length < MIN_NATURAL_WORDS;
    const words = [...naturalWords];

    if (limitedVocabulary) {
      for (const word of matchingCourseDrills(filter)) {
        if (!words.includes(word)) words.push(word);
      }
      const nextPhoneticWord = phoneticWords(this.model, filter, rng);
      let attempts = 0;
      while (words.length < MIN_NATURAL_WORDS && attempts < MIN_NATURAL_WORDS * 3) {
        attempts += 1;
        const word = nextPhoneticWord();
        if (!word) break;
        if (!words.includes(word)) words.push(word);
      }
    }
    if (words.length === 0) words.push(...fallbackDrills(filter));

    const nextWord = mangledWords(
      uniqueWords(randomWords(words, rng)),
      this.model.language,
      Letter.restrict(Letter.punctuators, this.codePoints),
      {
        withCapitals: this.settings.get(lessonProps.capitals),
        withPunctuators: this.settings.get(lessonProps.punctuators),
      },
      rng,
    );
    return generateFragment(this.settings, nextWord, {
      repeatWords: limitedVocabulary ? 2 : this.settings.get(lessonProps.repeatWords),
    });
  }
}

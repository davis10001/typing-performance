export type CourseInputSnapshot = {
  actual: string;
  completed: boolean;
  correctCharacters: number;
  errorCount: number;
};

/**
 * Mirrors KTouch TrainingLineCore with its locked default
 * EnforceTypingErrorCorrection=true: input is appended, a wrong character
 * blocks progress until backspace, and deleting never rewrites statistics.
 */
export class CourseInputSession {
  #actual = "";
  #correctCharacters = 0;
  #errorCount = 0;

  constructor(readonly text: string) {}

  get snapshot(): CourseInputSnapshot {
    return {
      actual: this.#actual,
      completed: this.#actual === this.text,
      correctCharacters: this.#correctCharacters,
      errorCount: this.#errorCount,
    };
  }

  append(character: string): CourseInputSnapshot {
    if (this.snapshot.completed || character.length === 0) return this.snapshot;
    const room = this.text.length - this.#actual.length;
    const input = character.slice(0, room);
    for (let index = 0; index < input.length; index += 1) {
      const expected = this.text[this.#actual.length + index];
      if (input[index] === expected) this.#correctCharacters += 1;
      else this.#errorCount += 1;
    }
    this.#actual += input;
    return this.snapshot;
  }

  backspace(word = false): CourseInputSnapshot {
    if (this.#actual.length === 0) return this.snapshot;
    if (word) {
      const trimmed = this.#actual.replace(/\S+\s*$/, "");
      this.#actual = trimmed.length === this.#actual.length ? this.#actual.slice(0, -1) : trimmed;
    } else {
      this.#actual = this.#actual.slice(0, -1);
    }
    return this.snapshot;
  }
}

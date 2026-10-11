import { Layout } from "@keybr/keyboard";
import { Result, TextType } from "@keybr/result";
import { Feedback, makeStats, TextInput, type Char } from "@keybr/textinput";

export type LearningInputType = "appendChar" | "appendLineBreak" | "clearChar" | "clearWord";

export type LearningInputEvent = {
  timeStamp: number;
  inputType: LearningInputType;
  codePoint: number;
  timeToType: number;
};

/** Defaults produced by Keybr's locked Settings + toTextInputSettings path. */
export const KEYBR_GUIDED_INPUT_DEFAULTS = {
  stopOnError: true,
  forgiveErrors: true,
  spaceSkipsWords: false,
} as const;

export type GuidedInputSnapshot = {
  completed: boolean;
  position: number;
  chars: readonly Char[];
  feedback: Feedback | null;
};

/** Thin session wrapper. All cursor, typo and recovery behavior stays in Keybr TextInput. */
export class GuidedInputSession {
  readonly #input: TextInput;
  #feedback: Feedback | null = null;
  #result: Result | null = null;

  constructor(readonly text: string) {
    this.#input = new TextInput(text, KEYBR_GUIDED_INPUT_DEFAULTS);
  }

  get snapshot(): GuidedInputSnapshot {
    return {
      completed: this.#input.completed,
      position: this.#input.pos,
      chars: this.#input.chars,
      feedback: this.#feedback,
    };
  }

  /** Paste is deliberately absent: upstream InputHandler discards insertFromPaste. */
  onInput(event: LearningInputEvent): GuidedInputSnapshot {
    if (this.#input.completed) return this.snapshot;
    this.#feedback = this.#input.onInput(event);
    if (this.#input.completed && this.#result == null) {
      this.#result = Result.fromStats(Layout.EN_US, TextType.GENERATED, Date.now(), makeStats(this.#input.steps));
    }
    return this.snapshot;
  }

  takeResult(): Result | null {
    const result = this.#result;
    this.#result = null;
    return result;
  }
}

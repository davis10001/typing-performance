export type TypedCharacterState = "correct" | "error";

export type AlignedTypingInput = {
  cursorIndex: number;
  characterStates: Map<number, TypedCharacterState>;
  extraCharacters: Map<number, string>;
  correctCharacters: number;
};

export function alignTypingInput(prompt: string, typed: string): AlignedTypingInput {
  const characterStates = new Map<number, TypedCharacterState>();
  const extraCharacters = new Map<number, string>();
  let cursorIndex = 0;
  let correctCharacters = 0;

  for (const inputCharacter of typed) {
    if (cursorIndex >= prompt.length) break;
    const expectedCharacter = prompt[cursorIndex];

    if (expectedCharacter === " " && inputCharacter !== " ") {
      extraCharacters.set(cursorIndex, `${extraCharacters.get(cursorIndex) ?? ""}${inputCharacter}`);
      continue;
    }

    const isCorrect = inputCharacter === expectedCharacter;
    characterStates.set(cursorIndex, isCorrect ? "correct" : "error");
    correctCharacters += Number(isCorrect);
    cursorIndex += 1;
  }

  return { cursorIndex, characterStates, extraCharacters, correctCharacters };
}

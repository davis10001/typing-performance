export type HandSide = "left" | "right";
export type FingerName = "pinky" | "ring" | "middle" | "index" | "thumb";

export type FingerId = `${HandSide}-${FingerName}`;

export type KeyGuidance = {
  character: string;
  displayCharacter: string;
  primaryKey: string;
  modifierKey: "ShiftLeft" | "ShiftRight" | null;
  fingers: FingerId[];
  instruction: string;
};

type KeyAssignment = {
  code: string;
  finger: FingerId;
};

const fingerLabels: Record<FingerId, string> = {
  "left-pinky": "Left pinky",
  "left-ring": "Left ring finger",
  "left-middle": "Left middle finger",
  "left-index": "Left index finger",
  "left-thumb": "Left thumb",
  "right-thumb": "Right thumb",
  "right-index": "Right index finger",
  "right-middle": "Right middle finger",
  "right-ring": "Right ring finger",
  "right-pinky": "Right pinky",
};

const baseAssignments: Record<string, KeyAssignment> = {
  "`": { code: "Backquote", finger: "left-pinky" },
  "1": { code: "Digit1", finger: "left-pinky" },
  "2": { code: "Digit2", finger: "left-ring" },
  "3": { code: "Digit3", finger: "left-middle" },
  "4": { code: "Digit4", finger: "left-index" },
  "5": { code: "Digit5", finger: "left-index" },
  "6": { code: "Digit6", finger: "right-index" },
  "7": { code: "Digit7", finger: "right-index" },
  "8": { code: "Digit8", finger: "right-middle" },
  "9": { code: "Digit9", finger: "right-ring" },
  "0": { code: "Digit0", finger: "right-pinky" },
  "-": { code: "Minus", finger: "right-pinky" },
  "=": { code: "Equal", finger: "right-pinky" },
  q: { code: "KeyQ", finger: "left-pinky" },
  w: { code: "KeyW", finger: "left-ring" },
  e: { code: "KeyE", finger: "left-middle" },
  r: { code: "KeyR", finger: "left-index" },
  t: { code: "KeyT", finger: "left-index" },
  y: { code: "KeyY", finger: "right-index" },
  u: { code: "KeyU", finger: "right-index" },
  i: { code: "KeyI", finger: "right-middle" },
  o: { code: "KeyO", finger: "right-ring" },
  p: { code: "KeyP", finger: "right-pinky" },
  "[": { code: "BracketLeft", finger: "right-pinky" },
  "]": { code: "BracketRight", finger: "right-pinky" },
  "\\": { code: "Backslash", finger: "right-pinky" },
  a: { code: "KeyA", finger: "left-pinky" },
  s: { code: "KeyS", finger: "left-ring" },
  d: { code: "KeyD", finger: "left-middle" },
  f: { code: "KeyF", finger: "left-index" },
  g: { code: "KeyG", finger: "left-index" },
  h: { code: "KeyH", finger: "right-index" },
  j: { code: "KeyJ", finger: "right-index" },
  k: { code: "KeyK", finger: "right-middle" },
  l: { code: "KeyL", finger: "right-ring" },
  ";": { code: "Semicolon", finger: "right-pinky" },
  "'": { code: "Quote", finger: "right-pinky" },
  z: { code: "KeyZ", finger: "left-pinky" },
  x: { code: "KeyX", finger: "left-ring" },
  c: { code: "KeyC", finger: "left-middle" },
  v: { code: "KeyV", finger: "left-index" },
  b: { code: "KeyB", finger: "left-index" },
  n: { code: "KeyN", finger: "right-index" },
  m: { code: "KeyM", finger: "right-index" },
  ",": { code: "Comma", finger: "right-middle" },
  ".": { code: "Period", finger: "right-ring" },
  "/": { code: "Slash", finger: "right-pinky" },
  " ": { code: "Space", finger: "right-thumb" },
};

const shiftedCharacters: Record<string, string> = {
  "~": "`",
  "!": "1",
  "@": "2",
  "#": "3",
  "$": "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  _: "-",
  "+": "=",
  "{": "[",
  "}": "]",
  "|": "\\",
  ":": ";",
  '"': "'",
  "<": ",",
  ">": ".",
  "?": "/",
};

export function getKeyGuidance(character: string | null | undefined): KeyGuidance | null {
  if (!character) return null;

  const isUppercaseLetter = /^[A-Z]$/.test(character);
  const baseCharacter = isUppercaseLetter
    ? character.toLowerCase()
    : (shiftedCharacters[character] ?? character);
  const assignment = baseAssignments[baseCharacter];
  if (!assignment) return null;

  const needsShift = isUppercaseLetter || character in shiftedCharacters;
  const primaryHand = assignment.finger.startsWith("left-") ? "left" : "right";
  const modifierKey = needsShift ? (primaryHand === "left" ? "ShiftRight" : "ShiftLeft") : null;
  const modifierFinger: FingerId | null = modifierKey === "ShiftRight"
    ? "right-pinky"
    : modifierKey === "ShiftLeft"
      ? "left-pinky"
      : null;
  const fingers = modifierFinger && modifierFinger !== assignment.finger
    ? [assignment.finger, modifierFinger]
    : [assignment.finger];
  const displayCharacter = character === " " ? "SPACE" : character;
  const instruction = modifierFinger
    ? `${fingerLabels[assignment.finger]} + ${fingerLabels[modifierFinger]} for Shift`
    : fingerLabels[assignment.finger];

  return {
    character,
    displayCharacter,
    primaryKey: assignment.code,
    modifierKey,
    fingers,
    instruction,
  };
}

export const keyboardRows = [
  [
    ["Backquote", "`", 1], ["Digit1", "1", 1], ["Digit2", "2", 1], ["Digit3", "3", 1],
    ["Digit4", "4", 1], ["Digit5", "5", 1], ["Digit6", "6", 1], ["Digit7", "7", 1],
    ["Digit8", "8", 1], ["Digit9", "9", 1], ["Digit0", "0", 1], ["Minus", "-", 1],
    ["Equal", "=", 1], ["Backspace", "BACK", 1.65],
  ],
  [
    ["Tab", "TAB", 1.45], ["KeyQ", "Q", 1], ["KeyW", "W", 1], ["KeyE", "E", 1],
    ["KeyR", "R", 1], ["KeyT", "T", 1], ["KeyY", "Y", 1], ["KeyU", "U", 1],
    ["KeyI", "I", 1], ["KeyO", "O", 1], ["KeyP", "P", 1], ["BracketLeft", "[", 1],
    ["BracketRight", "]", 1], ["Backslash", "\\", 1.35],
  ],
  [
    ["CapsLock", "CAPS", 1.8], ["KeyA", "A", 1], ["KeyS", "S", 1], ["KeyD", "D", 1],
    ["KeyF", "F", 1], ["KeyG", "G", 1], ["KeyH", "H", 1], ["KeyJ", "J", 1],
    ["KeyK", "K", 1], ["KeyL", "L", 1], ["Semicolon", ";", 1], ["Quote", "'", 1],
    ["Enter", "ENTER", 1.85],
  ],
  [
    ["ShiftLeft", "SHIFT", 2.35], ["KeyZ", "Z", 1], ["KeyX", "X", 1], ["KeyC", "C", 1],
    ["KeyV", "V", 1], ["KeyB", "B", 1], ["KeyN", "N", 1], ["KeyM", "M", 1],
    ["Comma", ",", 1], ["Period", ".", 1], ["Slash", "/", 1], ["ShiftRight", "SHIFT", 2.35],
  ],
  [["Space", "SPACE", 6.5]],
] as const;

export const fingerOrder: FingerName[] = ["pinky", "ring", "middle", "index", "thumb"];

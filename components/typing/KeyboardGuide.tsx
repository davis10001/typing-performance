import {
  getKeyGuidance,
  keyboardRows,
  type FingerId,
  type FingerName,
  type HandSide,
  type KeyGuidance,
} from "@/lib/typing-guide/keyboard";
import type { CSSProperties } from "react";

type Props = {
  nextCharacter: string | null;
  highlightCharacters?: readonly string[];
};

type HandTarget = {
  active: boolean;
  finger: FingerName;
  keyCode: string;
  side: HandSide;
};

type KeyPosition = {
  x: number;
  y: number;
};

type HandStyle = CSSProperties & {
  "--hand-reach-x": string;
  "--hand-reach-y": string;
  "--hand-rotation": string;
};

const keyboardGapUnits = 0.12;
const rowYPositions = [5, 26, 47, 68, 89];
const rowWidths = keyboardRows.map((row) => (
  row.reduce((total, [, , width]) => total + width, 0) + ((row.length - 1) * keyboardGapUnits)
));
const keyboardWidth = Math.max(...rowWidths);
const keyPositions = new Map<string, KeyPosition>();

keyboardRows.forEach((row, rowIndex) => {
  const rowWidth = rowWidths[rowIndex];
  let cursor = (keyboardWidth - rowWidth) / 2;
  row.forEach(([code, , width]) => {
    keyPositions.set(code, {
      x: ((cursor + (width / 2)) / keyboardWidth) * 100,
      y: rowYPositions[rowIndex],
    });
    cursor += width + keyboardGapUnits;
  });
});

const homeKeys: Record<HandSide, string> = {
  left: "KeyF",
  right: "KeyJ",
};

function parseFinger(fingerId: FingerId): { side: HandSide; finger: FingerName } {
  const [side, finger] = fingerId.split("-") as [HandSide, FingerName];
  return { side, finger };
}

function getHandTargets(guidance: KeyGuidance | null): HandTarget[] {
  const targets: Record<HandSide, HandTarget> = {
    left: { active: false, finger: "index", keyCode: homeKeys.left, side: "left" },
    right: { active: false, finger: "index", keyCode: homeKeys.right, side: "right" },
  };

  guidance?.fingers.forEach((fingerId, index) => {
    const { side, finger } = parseFinger(fingerId);
    targets[side] = {
      active: true,
      finger,
      keyCode: index === 0 ? guidance.primaryKey : (guidance.modifierKey ?? guidance.primaryKey),
      side,
    };
  });

  return [targets.left, targets.right];
}

function getHandStyle(target: HandTarget): HandStyle {
  const home = keyPositions.get(homeKeys[target.side]);
  const destination = keyPositions.get(target.keyCode);
  if (!target.active || !home || !destination) {
    return {
      "--hand-reach-x": "0cqw",
      "--hand-reach-y": "0cqw",
      "--hand-rotation": "0deg",
    };
  }

  const horizontalDistance = destination.x - home.x;
  const verticalDistance = destination.y - home.y;
  return {
    // Keep the wrist anchored while letting the selected pose lean toward the key.
    "--hand-reach-x": `${(horizontalDistance * 0.16).toFixed(2)}cqw`,
    "--hand-reach-y": `${(verticalDistance * 0.1).toFixed(2)}cqw`,
    "--hand-rotation": `${(horizontalDistance * 0.11).toFixed(2)}deg`,
  };
}

function PhotoHand({ target }: { target: HandTarget }) {
  return (
    <span
      className={`photo-hand photo-hand-${target.side} hand-pose-${target.finger} ${target.active ? "is-active" : "is-resting"}`}
      data-target-key={target.keyCode}
      data-finger={target.finger}
      style={getHandStyle(target)}
    >
      <span className="photo-hand-sprite photo-hand-sprite-base" />
      {target.active && <span className="photo-hand-sprite photo-hand-sprite-accent" />}
    </span>
  );
}

export default function KeyboardGuide({
  nextCharacter,
  highlightCharacters = [],
}: Props) {
  const guidance = getKeyGuidance(nextCharacter);
  const activeKeys = new Set([guidance?.primaryKey, guidance?.modifierKey].filter(Boolean));
  const stageKeys = new Set(highlightCharacters
    .map((character) => getKeyGuidance(character)?.primaryKey)
    .filter((key): key is string => Boolean(key)));
  const stageCharacters = [...new Set(highlightCharacters.map((character) => character.toUpperCase()))];
  const handTargets = getHandTargets(guidance);

  return (
    <section className="keyboard-guide is-open" aria-label="Finger guide">
      <div className="keyboard-guide-bar">
        <div className="keyboard-guide-heading">
          <h2>Finger guide</h2>
          {guidance && (
            <p>
              Next <strong>{guidance.displayCharacter}</strong>
              <span aria-hidden="true"> · </span>
              <span>{guidance.instruction}</span>
            </p>
          )}
        </div>
      </div>

      <div
        className="keyboard-guide-visual"
        data-hand-state={guidance ? "target" : "rest"}
        role="img"
        aria-label={stageCharacters.length > 0
          ? guidance
            ? `Practice keys ${stageCharacters.join(", ")}. Next key ${guidance.displayCharacter}. ${guidance.instruction}.`
            : `Practice keys ${stageCharacters.join(", ")}. Hands resting on F and J.`
          : guidance
            ? `Next key ${guidance.displayCharacter}. ${guidance.instruction}.`
            : "Hands resting on F and J."}
      >
        <div className="virtual-keyboard" aria-hidden="true">
          {keyboardRows.map((row, rowIndex) => (
            <div className={`virtual-keyboard-row row-${rowIndex + 1}`} key={rowIndex}>
              {row.map(([code, label, width]) => {
                const active = activeKeys.has(code);
                const modifier = guidance?.modifierKey === code;
                const stageKey = stageKeys.has(code);
                return (
                  <span
                    className={`virtual-key ${stageKey ? "is-stage-key" : ""} ${active ? "is-active" : ""} ${modifier ? "is-modifier" : ""}`}
                    data-key-code={code}
                    key={code}
                    style={{ "--key-width": width } as CSSProperties}
                  >
                    <span className="virtual-key-label">{label}</span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="keyboard-hands" aria-hidden="true">
          {handTargets.map((target) => (
            <PhotoHand key={target.side} target={target} />
          ))}
        </div>
      </div>
    </section>
  );
}

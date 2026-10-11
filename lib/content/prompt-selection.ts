export type Difficulty = "easy" | "standard" | "advanced";
export type PromptText = { id: string; difficulty: Difficulty; text: string };

export function nextTextIndex(texts: PromptText[], recentIds: string[]): number {
  if (texts.length === 0) throw new Error("A typing test needs text.");
  const recent = new Set(recentIds);
  const available = texts.findIndex((item) => !recent.has(item.id));
  return available < 0 ? 0 : available;
}

export function composeTestPrompt(texts: PromptText[], startIndex: number, minimumCharacters = 12_000): string {
  if (texts.length === 0) throw new Error("A typing test needs text.");
  const passages: string[] = [];
  let length = 0;
  for (let offset = 0; length < minimumCharacters || offset < texts.length; offset += 1) {
    const passage = texts[(startIndex + offset) % texts.length].text.trim();
    passages.push(passage);
    length += passage.length + 1;
  }
  return passages.join(" ");
}

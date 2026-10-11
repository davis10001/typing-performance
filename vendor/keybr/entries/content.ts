import { Enum, type EnumItem } from "@keybr/lang";

class BookItem implements EnumItem {
  constructor(readonly id: string) {}
  toString() { return this.id; }
  toJSON() { return this.id; }
}

const EN_ALICE_WONDERLAND = new BookItem("en-alice-wonderland");
export const Book = { EN_ALICE_WONDERLAND, ALL: new Enum(EN_ALICE_WONDERLAND) } as const;
export type WordList = readonly string[];

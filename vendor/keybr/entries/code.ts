import { Enum, type EnumItem } from "@keybr/lang";

class SyntaxItem implements EnumItem {
  constructor(readonly id: string) {}
  toString() { return this.id; }
  toJSON() { return this.id; }
}

const HTML = new SyntaxItem("html");
export const Syntax = { HTML, ALL: new Enum(HTML), FLAGS: [] as readonly string[] } as const;

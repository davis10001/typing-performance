export * from "../packages/keybr-result/lib/keystats.ts";
export * from "../packages/keybr-result/lib/result.ts";
export * from "../packages/keybr-result/lib/texttype.ts";

type GroupedResult = { readonly layout: { readonly family: string } };

export class ResultGroups {
  static byLayoutFamily<T extends GroupedResult>(results: readonly T[]): { get(family: string): readonly T[] } {
    const groups = new Map<string, T[]>();
    for (const result of results) {
      const group = groups.get(result.layout.family) ?? [];
      group.push(result);
      groups.set(result.layout.family, group);
    }
    return { get: (family) => groups.get(family) ?? [] };
  }
}

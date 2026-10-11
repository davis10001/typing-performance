import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const files = new Map([
  ["vendor/ktouch/courses/gb.xml", "54441dfcc0be7fe11bde1e9b6f74f7b3bc7c6134acbeae5369ef8e0a632df20f"],
  ["vendor/ktouch/LICENSES/GPL-2.0-or-later.txt", "b58671fb4d9e9efeb9a6af1bdba02e61ac69af654855b45a372efe8f52413f83"],
  ["vendor/keybr/packages/keybr-lesson/lib/guided.ts", "b1a80535e631277d05bd56dfec66b979c985b20c76ff7851dc8f7d3b6ee558af"],
  ["vendor/keybr/packages/keybr-content-words/lib/data/words-en.json", "067adf66de5f0a7ca17f3bf187bab378d8ad71e87856e4a25a208905404b949a"],
  ["vendor/keybr/packages/keybr-phonetic-model/assets/model-en.data", "4a389241e2f05a9d62a0e9f34bafc5f333cf08dda100c80805bda8a39550376b"],
  ["vendor/keybr/packages/keybr-textinput/lib/textinput.ts", "82c56195cb94b7011aa8a6bc13762c5ae330a3d77949cb4aedeba68e42d9e229"],
  ["vendor/keybr/packages/keybr-textinput/lib/stats.ts", "b4a37c9fb00445337673ed333d488174048f8b8301c8b2e49f5c5f288ac218d3"],
  ["vendor/keybr/packages/keybr-textinput/lib/histogram.ts", "66471d7b9f075e65590b56d56fc742ef9be1769da938828c625f70a9e57fa519"],
  ["vendor/keybr/packages/keybr-keyboard/lib/filter.ts", "f85f5beadb8d0481e1601d5c121971553d05d66053cb11bf532cbb87d92d0980"],
  ["vendor/keybr/packages/keybr-themes/lib/fonts/index.ts", "e8f4a6982583ea694d130d1a11da8b7a2af0378e096bf80148535ab675bcf3a5"],
  ["public/learning/keybr/model-en.data", "4a389241e2f05a9d62a0e9f34bafc5f333cf08dda100c80805bda8a39550376b"],
  ["vendor/keybr/packages/tsconfig-template.json", "97e8c64847e3ecc00df3df38e2a9eb0f2d406f8777cbc22a4ff2529719a56dff"],
  ["vendor/keybr/packages/tsconfig-template-dom.json", "b0453cdc9bb938d59527fa5061856ac09f7a4e965fabb1b5ee6e96617d3da476"],
  ["vendor/keybr/packages/tsconfig-template-webworker.json", "e48c12e0a7fcb15a7e392529824980f9aeadba36e4f65e91f3d36e4825c8df5f"],
  ["vendor/keybr/LICENSE", "7f8f48e4266aa8fd3033dfaa4bb7f6e83a60c6e099f82d4959b81de90e67cd8f"],
]);

const failures = [];
for (const [path, expected] of files) {
  try {
    const contents = await readFile(path);
    const actual = createHash("sha256").update(contents).digest("hex");
    if (actual !== expected) failures.push({ path, expected, actual });
  } catch (error) {
    failures.push({ path, expected, error: String(error) });
  }
}

if (failures.length) {
  process.stderr.write(`${JSON.stringify({ status: "failed", failures }, null, 2)}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`${JSON.stringify({ status: "verified", revision: "05a37bc5265f65ff538c59c613db29442f345d51", files: files.size }, null, 2)}\n`);
}

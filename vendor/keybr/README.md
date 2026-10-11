# Keybr source snapshot

This directory contains an unmodified source snapshot used to integrate the
Guided lesson behavior. It is not a rewritten approximation.

- Upstream: <https://github.com/aradzie/keybr.com>
- Revision: `05a37bc5265f65ff538c59c613db29442f345d51`
- License: GNU Affero General Public License v3.0; see `LICENSE`
- Imported: the Guided runtime's direct internal packages, the English word
  list, and the English phonetic model.
- Omitted: unrelated language word lists and phonetic-model assets.

Integrity anchors:

| File | SHA-256 |
|---|---|
| `packages/keybr-lesson/lib/guided.ts` | `b1a80535e631277d05bd56dfec66b979c985b20c76ff7851dc8f7d3b6ee558af` |
| `packages/keybr-content-words/lib/data/words-en.json` | `067adf66de5f0a7ca17f3bf187bab378d8ad71e87856e4a25a208905404b949a` |
| `packages/keybr-phonetic-model/assets/model-en.data` | `4a389241e2f05a9d62a0e9f34bafc5f333cf08dda100c80805bda8a39550376b` |
| `packages/keybr-textinput/lib/textinput.ts` | `82c56195cb94b7011aa8a6bc13762c5ae330a3d77949cb4aedeba68e42d9e229` |
| `packages/keybr-textinput/lib/stats.ts` | `b4a37c9fb00445337673ed333d488174048f8b8301c8b2e49f5c5f288ac218d3` |
| `packages/keybr-textinput/lib/histogram.ts` | `66471d7b9f075e65590b56d56fc742ef9be1769da938828c625f70a9e57fa519` |
| `packages/keybr-keyboard/lib/filter.ts` | `f85f5beadb8d0481e1601d5c121971553d05d66053cb11bf532cbb87d92d0980` |
| `packages/keybr-themes/lib/fonts/index.ts` | `e8f4a6982583ea694d130d1a11da8b7a2af0378e096bf80148535ab675bcf3a5` |
| `packages/tsconfig-template.json` | `97e8c64847e3ecc00df3df38e2a9eb0f2d406f8777cbc22a4ff2529719a56dff` |
| `packages/tsconfig-template-dom.json` | `b0453cdc9bb938d59527fa5061856ac09f7a4e965fabb1b5ee6e96617d3da476` |
| `packages/tsconfig-template-webworker.json` | `e48c12e0a7fcb15a7e392529824980f9aeadba36e4f65e91f3d36e4825c8df5f` |
| `LICENSE` | `7f8f48e4266aa8fd3033dfaa4bb7f6e83a60c6e099f82d4959b81de90e67cd8f` |

Project adapters live in `vendor/keybr/entries/` and `lib/learning/`; the
upstream files listed above remain byte-for-byte verified. Deployment must provide the
corresponding source and build materials required by the license.

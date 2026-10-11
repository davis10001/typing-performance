import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@keybr/binary": fileURLToPath(new URL("./vendor/keybr/entries/binary.ts", import.meta.url)),
      "@keybr/code": fileURLToPath(new URL("./vendor/keybr/entries/code.ts", import.meta.url)),
      "@keybr/content": fileURLToPath(new URL("./vendor/keybr/entries/content.ts", import.meta.url)),
      "@keybr/keyboard": fileURLToPath(new URL("./vendor/keybr/entries/keyboard.ts", import.meta.url)),
      "@keybr/lang": fileURLToPath(new URL("./vendor/keybr/entries/lang.ts", import.meta.url)),
      "@keybr/math": fileURLToPath(new URL("./vendor/keybr/entries/math.ts", import.meta.url)),
      "@keybr/phonetic-model": fileURLToPath(new URL("./vendor/keybr/entries/phonetic-model.ts", import.meta.url)),
      "@keybr/rand": fileURLToPath(new URL("./vendor/keybr/entries/rand.ts", import.meta.url)),
      "@keybr/result": fileURLToPath(new URL("./vendor/keybr/entries/result.ts", import.meta.url)),
      "@keybr/settings": fileURLToPath(new URL("./vendor/keybr/entries/settings.ts", import.meta.url)),
      "@keybr/textinput": fileURLToPath(new URL("./vendor/keybr/entries/textinput.ts", import.meta.url)),
      "@keybr/themes": fileURLToPath(new URL("./vendor/keybr/entries/themes.ts", import.meta.url)),
      "@keybr/unicode": fileURLToPath(new URL("./vendor/keybr/entries/unicode.ts", import.meta.url)),
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/component/**/*.test.tsx"],
  },
});

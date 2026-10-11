import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { auditCourse } from "../lib/learning/course-audit.ts";

const sourcePath = "vendor/ktouch/courses/gb.xml";
const outputPath = "lib/learning/content/english-qwerty.json";
const sourceRevision = "a3f57d03e6c14956378af1176eef3404430c773e";
const expectedSourceSha256 = "54441dfcc0be7fe11bde1e9b6f74f7b3bc7c6134acbeae5369ef8e0a632df20f";

const source = await readFile(sourcePath, "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
if (sha256(source) !== expectedSourceSha256) throw new Error("KTouch course source hash mismatch");

const dom = new JSDOM(source, { contentType: "text/xml" });
try {
  const document = dom.window.document;
  const read = (element, selector) => element.querySelector(selector)?.textContent ?? "";
  const lessons = [...document.querySelectorAll("course > lessons > lesson")].map((element) => ({
    id: read(element, "id"),
    title: read(element, "title"),
    newCharacters: read(element, "newCharacters"),
    text: read(element, "text"),
  }));
  const capitalisation = lessons.at(-1);
  if (capitalisation?.title !== "Capitalisation" || capitalisation.newCharacters !== "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    throw new Error("The reviewed capitalisation lesson was not found");
  }
  const missing = [...capitalisation.newCharacters].filter((character) => !capitalisation.text.includes(character));
  if (missing.join("") !== "QXY") throw new Error(`Unexpected capitalisation defect: ${missing.join("")}`);
  const originalTextSha256 = sha256(capitalisation.text);
  capitalisation.text = `${capitalisation.text}\nQ X Y`;

  const issues = auditCourse(lessons);
  if (issues.length) throw new Error(`Converted course failed audit: ${JSON.stringify(issues)}`);
  const contentRevision = sha256(JSON.stringify(lessons));
  const output = {
    schemaVersion: 1,
    id: "ktouch-en-gb-letters",
    title: "English QWERTY",
    description: read(document, "course > description"),
    sourceLayout: read(document, "course > keyboardLayout"),
    source: { repository: "https://invent.kde.org/education/ktouch", revision: sourceRevision, path: "data/courses/gb.xml", sha256: expectedSourceSha256 },
    contentRevision,
    repairs: [{
      lessonId: capitalisation.id,
      reason: "Declared new characters Q, X, and Y were absent from the lesson text.",
      originalTextSha256,
      append: "Q X Y",
    }],
    lessons,
  };
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ status: "built", outputPath, lessonCount: lessons.length, contentRevision }, null, 2)}\n`);
} finally {
  dom.window.close();
}

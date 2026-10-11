// Read-only audit: upstream course texts stay in memory, never enter the shipped bundle.
import { createHash } from "node:crypto";
import { JSDOM } from "jsdom";
import baseline from "../lib/learning/source-baseline.json" with { type: "json" };
import { auditCourse } from "../lib/learning/course-audit.ts";

async function readSource(repository, revision, path) {
  const repositoryPath = new URL(repository).pathname;
  const url = `https://raw.githubusercontent.com${repositoryPath}/${revision}/${path}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const text = await response.text();
  return { url, sha256: createHash("sha256").update(text).digest("hex"), text };
}

async function inspectCourse(path) {
  const source = await readSource(baseline.ktouch.repository, baseline.ktouch.revision, path);
  const dom = new JSDOM(source.text, { contentType: "text/xml" });
  try {
    const document = dom.window.document;
    const read = (element, selector) => element.querySelector(selector)?.textContent ?? "";
    const lessons = [...document.querySelectorAll("course > lessons > lesson")].map((element) => ({
      id: read(element, "id"), title: read(element, "title"),
      newCharacters: read(element, "newCharacters"), text: read(element, "text"),
    }));
    if (!lessons.length) throw new Error(`No lessons found: ${source.url}`);
    return {
      url: source.url, sha256: source.sha256,
      title: read(document, "course > title"), layout: read(document, "course > keyboardLayout"),
      lessonCount: lessons.length,
      lessons: lessons.map(({ id, title, newCharacters, text }, index) => ({
        position: index + 1, id, title, newCharacters, characterCount: text.length,
      })),
      issues: auditCourse(lessons),
      licenseInCourseFile: /SPDX-License-Identifier|<license[\s>]|Creative Commons|GNU General Public License/i.test(source.text),
    };
  } finally {
    dom.window.close();
  }
}

const results = await Promise.allSettled([
  readSource(baseline.keybr.repository, baseline.keybr.revision, baseline.keybr.settingsPath),
  readSource(baseline.keybr.repository, baseline.keybr.revision, baseline.keybr.licensePath),
  ...baseline.ktouch.candidateCoursePaths.map(inspectCourse),
]);
const failures = results.flatMap((result, index) => result.status === "rejected" ? [{ index, error: String(result.reason) }] : []);
const settings = results[0].status === "fulfilled" ? results[0].value : null;
const license = results[1].status === "fulfilled" ? results[1].value : null;
const courses = results.slice(2).flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
const targetMatch = settings?.text.match(/numberProp\("lesson\.targetSpeed",\s*(\d+)/);
const report = {
  revisions: { keybr: baseline.keybr.revision, ktouch: baseline.ktouch.revision },
  keybr: settings && {
    settingsUrl: settings.url, settingsSha256: settings.sha256,
    targetSpeedCpm: targetMatch ? Number(targetMatch[1]) : null,
    naturalWordsDefault: /booleanProp\("lesson\.guided\.naturalWords",\s*true\)/.test(settings.text),
    keyboardOrderDefault: /booleanProp\("lesson\.guided\.keyboardOrder",\s*true\)/.test(settings.text),
    licenseUrl: license?.url ?? null,
    agpl3InLicense: license ? /GNU AFFERO GENERAL PUBLIC LICENSE\s+Version 3/.test(license.text) : null,
  },
  courses, failures,
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
// A nonzero exit is evidence of a source problem, not permission to repair the source silently.
if (failures.length || !targetMatch || courses.some((course) => course.issues.length)) process.exitCode = 1;

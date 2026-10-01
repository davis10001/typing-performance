import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const approvals = JSON.parse(readFileSync(resolve("release/approvals.json"), "utf8"));
const required = {
  benchmark: ["approved", "source", "version", "reviewer"],
  privacyAndDomain: ["approved", "domain", "privacyPolicy", "analyticsDecision", "reviewer"],
  testTextLicense: ["approved", "manifest", "reviewer"],
  verification: ["approved", "evidence", "reviewer"],
};

const missing = [];
for (const [gate, fields] of Object.entries(required)) {
  for (const field of fields) {
    const value = approvals[gate]?.[field];
    if (field === "approved" ? value !== true : typeof value !== "string" || value.trim() === "") {
      missing.push(`${gate}.${field}`);
    }
  }
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl || !/^https:\/\//.test(siteUrl) || /localhost|127\.0\.0\.1/.test(siteUrl)) {
  missing.push("NEXT_PUBLIC_SITE_URL (production HTTPS domain)");
}

if (missing.length > 0) {
  process.stderr.write(`Production release blocked. Missing approvals/evidence:\n- ${missing.join("\n- ")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Production release gates passed. Verify CI is green before any manual deployment.\n");
}

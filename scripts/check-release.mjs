import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const approvals = JSON.parse(readFileSync(resolve("release/approvals.json"), "utf8"));
const required = {
  benchmark: ["approved", "source", "version", "definition", "reviewer"],
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

if (approvals.privacyAndDomain?.approved === true && siteUrl) {
  try {
    if (new URL(siteUrl).hostname !== approvals.privacyAndDomain.domain) missing.push("production domain must match approved domain");
  } catch { missing.push("NEXT_PUBLIC_SITE_URL (valid URL)"); }
}

if (process.env.NEXT_PUBLIC_ANALYTICS_MODE !== "opt-in") missing.push("NEXT_PUBLIC_ANALYTICS_MODE=opt-in");
if (!/^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "")) missing.push("NEXT_PUBLIC_GA4_MEASUREMENT_ID");
try {
  const privacyUrl = new URL(process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL ?? "");
  if (privacyUrl.protocol !== "https:" || !privacyUrl.hostname) missing.push("NEXT_PUBLIC_PRIVACY_POLICY_URL (reviewed HTTPS notice)");
} catch { missing.push("NEXT_PUBLIC_PRIVACY_POLICY_URL (reviewed HTTPS notice)"); }
if (approvals.privacyAndDomain?.approved === true && process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL !== approvals.privacyAndDomain.privacyPolicy) {
  missing.push("privacy policy URL must match approved notice");
}

for (const [gate, field] of [["benchmark", "definition"], ["testTextLicense", "manifest"]]) {
  const path = approvals[gate]?.[field];
  if (typeof path === "string" && path.trim() !== "" && !existsSync(resolve(path))) {
    missing.push(`${gate}.${field} (file does not exist)`);
  }
}

if (missing.length > 0) {
  process.stderr.write(`Production release blocked. Missing approvals/evidence:\n- ${missing.join("\n- ")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Production release gates passed. Verify CI is green before any manual deployment.\n");
}

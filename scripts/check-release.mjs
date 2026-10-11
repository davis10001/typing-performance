import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const approvals = JSON.parse(readFileSync(resolve("release/approvals.json"), "utf8"));
const required = {
  benchmark: ["approved", "mode", "reviewer"],
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

if (approvals.benchmark?.mode === "published") {
  for (const field of ["source", "version", "definition"]) {
    if (!approvals.benchmark[field]?.trim()) missing.push(`benchmark.${field}`);
  }
} else if (approvals.benchmark?.mode !== "excluded") {
  missing.push("benchmark.mode (excluded or published)");
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

if (approvals.privacyAndDomain?.analyticsDecision === "off") {
  if (process.env.NEXT_PUBLIC_ANALYTICS_MODE !== "off") missing.push("NEXT_PUBLIC_ANALYTICS_MODE=off");
} else if (approvals.privacyAndDomain?.analyticsDecision === "opt-in") {
  if (process.env.NEXT_PUBLIC_ANALYTICS_MODE !== "opt-in") missing.push("NEXT_PUBLIC_ANALYTICS_MODE=opt-in");
  if (!/^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "")) missing.push("NEXT_PUBLIC_GA4_MEASUREMENT_ID");
  if (process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL !== approvals.privacyAndDomain.privacyPolicy) {
    missing.push("privacy policy URL must match approved notice");
  }
} else {
  missing.push("privacyAndDomain.analyticsDecision (off or opt-in)");
}
if (approvals.privacyAndDomain?.approved === true) {
  try {
    const privacyUrl = new URL(approvals.privacyAndDomain.privacyPolicy);
    if (privacyUrl.protocol !== "https:" || !privacyUrl.hostname) missing.push("privacyAndDomain.privacyPolicy (reviewed HTTPS notice)");
  } catch { missing.push("privacyAndDomain.privacyPolicy (reviewed HTTPS notice)"); }
}

for (const [gate, field] of [["testTextLicense", "manifest"], ...(approvals.benchmark?.mode === "published" ? [["benchmark", "definition"]] : [])]) {
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

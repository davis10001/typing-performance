const CONSENT_KEY = "typinglevel:analytics-consent:v1";

export type AnalyticsChoice = "pending" | "accepted" | "declined";

export function readAnalyticsChoice(storage: Storage): AnalyticsChoice {
  try {
    const value = storage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : "pending";
  } catch { return "pending"; }
}

export function saveAnalyticsChoice(storage: Storage, choice: Exclude<AnalyticsChoice, "pending">): void {
  try { storage.setItem(CONSENT_KEY, choice); } catch { /* Keep the decision for this page only. */ }
}

export function analyticsConfigReady(mode: string | undefined, gaId: string | undefined, policyUrl: string | undefined): boolean {
  if (mode !== "opt-in" || !/^G-[A-Z0-9]+$/.test(gaId ?? "")) return false;
  try {
    const url = new URL(policyUrl ?? "");
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch { return false; }
}

export function redactTelemetryUrl<T extends { url: string }>(event: T): T | null {
  try {
    const url = new URL(event.url);
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch { return null; }
}

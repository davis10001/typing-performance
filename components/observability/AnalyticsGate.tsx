"use client";

import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";
import { setTelemetryTransport } from "@/lib/telemetry/adapter";
import { analyticsConfigReady, readAnalyticsChoice, redactTelemetryUrl, saveAnalyticsChoice, type AnalyticsChoice } from "@/lib/telemetry/privacy";

type Props = {
  mode: string | undefined;
  gaId: string | undefined;
  privacyPolicyUrl: string | undefined;
};

export default function AnalyticsGate({ mode, gaId, privacyPolicyUrl }: Props) {
  const [choice, setChoice] = useState<AnalyticsChoice>("pending");
  const [loaded, setLoaded] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const configured = analyticsConfigReady(mode, gaId, privacyPolicyUrl);

  useEffect(() => {
    if (!configured) return;
    const frame = window.requestAnimationFrame(() => {
      setChoice(readAnalyticsChoice(window.localStorage));
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [configured]);

  useEffect(() => {
    if (!configured || choice !== "accepted") return;
    setTelemetryTransport({
      event: (value) => {
        const { name, ...parameters } = value;
        const safeParameters = "anomaly_flags" in parameters
          ? { ...parameters, anomaly_flags: parameters.anomaly_flags.join(",") }
          : parameters;
        sendGAEvent("event", name, safeParameters);
      },
      error: () => {},
      vital: () => {},
    });
    return () => setTelemetryTransport(null);
  }, [configured, choice]);

  if (!configured || !loaded) return null;

  function choose(next: Exclude<AnalyticsChoice, "pending">) {
    saveAnalyticsChoice(window.localStorage, next);
    setTelemetryTransport(null);
    if (choice === "accepted" && next === "declined") {
      window.location.reload(); // Removes already-injected vendor scripts after revocation.
      return;
    }
    setChoice(next);
    setShowChoices(false);
  }

  return (
    <>
      {choice === "accepted" && (
        <>
          <GoogleAnalytics gaId={gaId!} />
          <Analytics beforeSend={redactTelemetryUrl} debug={false} />
          <SpeedInsights beforeSend={redactTelemetryUrl} debug={false} />
        </>
      )}
      <button type="button" className="analytics-settings" onClick={() => setShowChoices(true)}>Analytics choices</button>
      {(choice === "pending" || showChoices) && (
        <aside className="analytics-consent" aria-labelledby="analytics-consent-title">
          <div>
            <strong id="analytics-consent-title">Optional analytics</strong>
            <p>Help us understand site use and speed. The typing test works without analytics, and typed text is never sent. <a href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer">Privacy notice</a></p>
          </div>
          <div className="analytics-consent-actions">
            <button type="button" className="button button-primary" onClick={() => choose("accepted")}>ACCEPT</button>
            <button type="button" className="button button-secondary" onClick={() => choose("declined")}>DECLINE</button>
            {showChoices && choice !== "pending" && <button type="button" className="text-button" onClick={() => setShowChoices(false)}>Cancel</button>}
          </div>
        </aside>
      )}
    </>
  );
}

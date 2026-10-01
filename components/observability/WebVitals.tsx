"use client";

import { useReportWebVitals } from "next/web-vitals";
import { telemetry, type WebVitalName } from "@/lib/telemetry/adapter";

const supported = new Set<WebVitalName>(["CLS", "FCP", "INP", "LCP", "TTFB"]);

type ReportCallback = Parameters<typeof useReportWebVitals>[0];
const report: ReportCallback = (metric) => {
  if (supported.has(metric.name as WebVitalName)) {
    telemetry.vital(metric.name as WebVitalName, metric.value, window.location.pathname);
  }
};

export default function WebVitals() {
  useReportWebVitals(report);
  return null;
}

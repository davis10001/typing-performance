import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AnalyticsGate from "@/components/observability/AnalyticsGate";
import { setTelemetryTransport, telemetry } from "@/lib/telemetry/adapter";
import { sendGAEvent } from "@next/third-parties/google";

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: () => <div data-testid="ga4-script" />,
  sendGAEvent: vi.fn(),
}));
vi.mock("@vercel/analytics/next", () => ({ Analytics: () => <div data-testid="vercel-analytics-script" /> }));
vi.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: () => <div data-testid="vercel-speed-script" /> }));

const configured = {
  mode: "opt-in",
  gaId: "G-TEST123",
  privacyPolicyUrl: "https://example.com/privacy",
};

afterEach(() => {
  cleanup();
  setTelemetryTransport(null);
});

describe("analytics consent gate", () => {
  it("loads no vendor component before explicit consent", async () => {
    const storage = new Map<string, string>();
    Object.defineProperty(window, "localStorage", { configurable: true, value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    } });
    render(<AnalyticsGate {...configured} />);
    expect(await screen.findByText("Optional analytics")).toBeInTheDocument();
    expect(screen.queryByTestId("ga4-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("vercel-analytics-script")).not.toBeInTheDocument();
    expect(screen.queryByTestId("vercel-speed-script")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "DECLINE" }));
    expect(storage.get("typinglevel:analytics-consent:v1")).toBe("declined");
    expect(screen.queryByTestId("ga4-script")).not.toBeInTheDocument();
  });

  it("mounts the selected providers only after acceptance", async () => {
    const storage = new Map<string, string>();
    Object.defineProperty(window, "localStorage", { configurable: true, value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    } });
    render(<AnalyticsGate {...configured} />);
    await screen.findByText("Optional analytics");
    fireEvent.click(screen.getByRole("button", { name: "ACCEPT" }));
    expect(storage.get("typinglevel:analytics-consent:v1")).toBe("accepted");
    expect(screen.getByTestId("ga4-script")).toBeInTheDocument();
    expect(screen.getByTestId("vercel-analytics-script")).toBeInTheDocument();
    expect(screen.getByTestId("vercel-speed-script")).toBeInTheDocument();
    telemetry.event({ name: "test_complete", duration: 60, wpm_bucket: "40-59", accuracy_bucket: "95-100", anomaly_flags: ["paste"] });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "test_complete", {
      duration: 60, wpm_bucket: "40-59", accuracy_bucket: "95-100", anomaly_flags: "paste",
    });
  });

  it("does not render a consent UI or vendor scripts when disabled", () => {
    render(<AnalyticsGate {...configured} mode="off" />);
    expect(screen.queryByText("Optional analytics")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ga4-script")).not.toBeInTheDocument();
  });
});

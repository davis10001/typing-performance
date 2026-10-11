import type { Metadata } from "next";
import GuidedPractice from "@/components/learning/GuidedPractice";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Continuous typing practice",
  description: "Practice with the Keybr Guided engine and advance according to per-key performance.",
  path: "/learn/practice",
});

export default function GuidedPracticePage() {
  return <GuidedPractice />;
}

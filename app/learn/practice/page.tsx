import type { Metadata } from "next";
import GuidedPractice from "@/components/learning/GuidedPractice";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Adaptive Typing Practice",
  description: "Practice touch typing with exercises that adjust to your results on each key.",
  path: "/learn/practice",
});

export default function GuidedPracticePage() {
  return <GuidedPractice />;
}

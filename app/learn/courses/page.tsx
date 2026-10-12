import type { Metadata } from "next";
import CourseCatalog from "@/components/learning/CourseCatalog";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Touch Typing Lessons",
  description: "Choose from 15 English QWERTY typing lessons covering letter keys and capitals.",
  path: "/learn/courses",
});

export default function CoursesPage() {
  return <CourseCatalog />;
}

import type { Metadata } from "next";
import CourseCatalog from "@/components/learning/CourseCatalog";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Touch typing courses",
  description: "A reviewed 15-lesson KTouch English QWERTY course for letters and capitals.",
  path: "/learn/courses",
});

export default function CoursesPage() {
  return <CourseCatalog />;
}

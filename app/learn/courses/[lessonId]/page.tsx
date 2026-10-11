import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CoursePractice from "@/components/learning/CoursePractice";
import { englishQwertyCourse } from "@/lib/learning/course-content";

type Props = { params: Promise<{ lessonId: string }> };

export function generateStaticParams() {
  return englishQwertyCourse.lessons.map(({ id: lessonId }) => ({ lessonId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = englishQwertyCourse.lessons.find(({ id }) => id === lessonId);
  if (!lesson) return {};
  return { title: `${lesson.title} typing lesson`, robots: { index: false, follow: true } };
}

export default async function CourseLessonPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = englishQwertyCourse.lessons.find(({ id }) => id === lessonId);
  if (!lesson) notFound();
  return <CoursePractice lesson={lesson} />;
}

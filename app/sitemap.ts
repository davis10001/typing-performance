import type { MetadataRoute } from "next";
import { testPages } from "@/lib/content/test-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const paths = ["/", ...Object.keys(testPages).filter((slug) => slug !== "typing-test").map((slug) => `/${slug}`), "/learn", "/learn/practice", "/learn/courses", "/learn/paragraphs", "/faq", "/how-wpm-is-calculated", "/average-typing-speed", "/good-typing-speed", "/about", "/contact", "/privacy"];
  return paths.map((path) => ({ url: new URL(path, origin).toString(), changeFrequency: "weekly" }));
}

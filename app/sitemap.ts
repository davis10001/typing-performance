import type { MetadataRoute } from "next";
import { testPages } from "@/lib/content/test-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const paths = ["/", ...Object.keys(testPages).map((slug) => `/${slug}`), "/average-wpm", "/average-typing-speed", "/privacy"];
  return paths.map((path) => ({ url: new URL(path, origin).toString(), changeFrequency: "weekly" }));
}

import type { Metadata } from "next";

export const siteName = "TypingLevel";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const siteUrl = configuredSiteUrl.replace(/\/$/, "");
export const siteDescription = "Take a free typing test, measure WPM and accuracy, and build speed with guided typing practice. No account required.";
export const socialImage = "/images/typing-hands-hero.png";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function buildPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName,
      title,
      description,
      images: [{ url: socialImage, width: 1672, height: 941, alt: "TypingLevel typing test" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

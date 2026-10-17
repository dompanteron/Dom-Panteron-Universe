import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteName = "Dom Panteron Universe";
const defaultDescription = "Clothing, music, and conscious elevation.";

export function rootSiteMetadata(): Metadata {
  const base = getSiteUrl();

  return {
    metadataBase: new URL(base),
    title: {
      default: siteName,
      template: `%s | ${siteName}`
    },
    description: defaultDescription,
    openGraph: {
      type: "website",
      locale: "en_GB",
      url: base,
      siteName,
      title: siteName,
      description: defaultDescription
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: defaultDescription
    }
  };
}

export function pageTitle(title: string): Metadata {
  return {
    title,
    openGraph: { title: `${title} | ${siteName}` }
  };
}

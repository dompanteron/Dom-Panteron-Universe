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

export function buildShareMetadata(input: {
  title: string;
  description?: string | null;
  path?: string;
  imageUrl?: string | null;
}): Metadata {
  const base = getSiteUrl();
  const description = input.description?.trim() || defaultDescription;
  const pageUrl = input.path ? `${base}${input.path}` : undefined;
  const image = input.imageUrl?.trim();

  const images = image ? [{ url: image, alt: input.title }] : undefined;

  return {
    title: input.title,
    description,
    openGraph: {
      title: input.title,
      description,
      url: pageUrl,
      images
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: image ? [image] : undefined
    }
  };
}

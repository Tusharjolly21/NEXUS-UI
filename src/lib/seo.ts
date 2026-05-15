import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";

const site = getSiteUrl();

export const siteConfig = {
  name: "Nexus-UI",
  tagline: "Motion-built UI for ambitious product teams.",
  description:
    "Browse animated components, production templates, and blocks. Copy code, ship faster, and upgrade with premium access.",
  url: site,
};

export function createMetadata(override: Metadata = {}): Metadata {
  let metadataBase: URL;
  try {
    metadataBase = new URL(siteConfig.url);
  } catch {
    metadataBase = new URL("http://localhost:3000");
  }
  return {
    metadataBase,
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s · ${siteConfig.name}`,
    },
    description: siteConfig.description,
    openGraph: {
      title: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
    },
    ...override,
  };
}

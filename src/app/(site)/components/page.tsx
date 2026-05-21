import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { ComponentsCatalog } from "./_catalog";

export const metadata: Metadata = createMetadata({
  title: "Next.js and React Components",
  description:
    "Animated Next.js and React components built with Tailwind CSS and Framer Motion. Building blocks for modern user interfaces — copy-paste, free and pro tiers.",
  alternates: { canonical: "/components" },
});

export default function ComponentsPage() {
  return <ComponentsCatalog />;
}

import type { Metadata } from "next";
import { ComponentsPageContent } from "@/components/listing/components-page-content";
import { getPricing } from "@/lib/region";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: { absolute: "Animated React Components for Next.js | Nexus UI" },
  description:
    "Free and Pro animated React components built with Tailwind CSS and Framer Motion, many with sound. Install any of them with the shadcn CLI.",
  alternates: { canonical: "/components" },
});

export default async function ComponentsPage() {
  return <ComponentsPageContent pricing={await getPricing()} />;
}

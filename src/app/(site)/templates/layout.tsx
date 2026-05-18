import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Templates",
  description:
    "Full-page Next.js templates built for production SaaS. Animated landing pages, pricing flows, and dashboards you can copy and ship.",
  alternates: { canonical: "/templates" },
});

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

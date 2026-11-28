import type { Metadata } from "next";
import { ComponentsJsonLd } from "@/components/listing/components-jsonld";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Animated React Components with Tailwind CSS",
  description:
    "Free animated React components for Next.js with Tailwind CSS: text effects, backgrounds, sidebars, inputs and more. Copy-paste TypeScript.",
  alternates: { canonical: "/components" },
});

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ComponentsJsonLd />
      {children}
    </>
  );
}

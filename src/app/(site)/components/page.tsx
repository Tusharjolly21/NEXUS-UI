import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { libraryComponents } from "@/lib/catalog/library-components";
import { ComponentsCatalog } from "./_catalog";

export const metadata: Metadata = createMetadata({
  title: "Free React UI Components — Tailwind CSS & Framer Motion",
  description:
    "Free React UI components built with Tailwind CSS and Framer Motion. Text animations, backgrounds, sidebars, and more for Next.js. Copy-paste, free and pro.",
  alternates: { canonical: "/components" },
});

export default function ComponentsPage() {
  return (
    <>
      {/* Server-rendered index so search engines can discover all component pages.
          Hidden visually but present in the HTML for crawlers. */}
      <ul aria-hidden className="sr-only">
        {libraryComponents.map((c) => (
          <li key={c.slug}>
            <Link href={`/components/${c.slug}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
      <ComponentsCatalog />
    </>
  );
}

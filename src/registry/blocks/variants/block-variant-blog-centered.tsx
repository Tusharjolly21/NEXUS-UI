"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { BlogContentCentered } from "@/components/blocks/blog-content-sections";

export function PreviewBlockVariantBlogCentered() {
  return <BlogContentCentered />;
}

"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { BlogHoverImageCardShowcase } from "@/components/blocks/blog-content-sections";

export function PreviewBlockVariantBlogHoverCard() {
  return <BlogHoverImageCardShowcase />;
}

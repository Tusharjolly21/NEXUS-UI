"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { BlogContentWithToc } from "@/components/blocks/blog-content-sections";

export function PreviewBlockVariantBlogToc() {
  return <BlogContentWithToc />;
}

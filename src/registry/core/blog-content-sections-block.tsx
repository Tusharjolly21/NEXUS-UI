"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { BlogContentSectionsBlockPreview } from "@/components/blocks/blog-content-sections";

export function PreviewBlogContentSectionsBlock() {
  return <BlogContentSectionsBlockPreview />;
}

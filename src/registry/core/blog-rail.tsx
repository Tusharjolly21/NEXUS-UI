"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { EditorialRail } from "@/components/editorial-blog-rail";

export function PreviewBlogRail() {
  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center p-6">
      <EditorialRail className="max-w-[980px]" />
    </div>
  );
}

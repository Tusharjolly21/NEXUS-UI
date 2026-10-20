"use client";

import { EditorialRail } from "@/components/editorial-blog-rail";

export function PreviewEditorialBlogRailRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <EditorialRail autoplay className={compact ? "max-w-[760px]" : "max-w-[980px]"} />
    </div>
  );
}

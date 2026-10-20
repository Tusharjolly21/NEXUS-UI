"use client";

import { LinkPreview } from "@/components/link-preview";

export function PreviewLinkPreviewRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-end justify-center p-8 pb-16 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex max-w-[440px] flex-col items-center gap-4 text-center">
        <p className={`${compact ? "text-[18px]" : "text-[21px]"} font-medium leading-[1.45] tracking-[-0.02em]`}>
          Read the{" "}
          <LinkPreview href="https://motion.dev/docs/react-transitions" title="Transitions" description="Springs, tweens and inertia, and when to use each." width={260} height={132} autoplay>
            spring guide
          </LinkPreview>{" "}
          before you tune the{" "}
          <LinkPreview href="https://www.apple.com/design/" title="Apple Design" description="Guidelines, resources and talks." width={260} height={132}>
            motion
          </LinkPreview>
          , then ship it.
        </p>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Hover or focus a link.</span>
      </div>
    </div>
  );
}

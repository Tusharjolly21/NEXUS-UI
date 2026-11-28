"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { ImagesBadge } from "@/components/images-badge";

const IB_TEAM = [
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
    alt: "Felix",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",
    alt: "Aneka",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Milo&backgroundColor=d1d4f9",
    alt: "Milo",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&backgroundColor=ffd5dc",
    alt: "Zoe",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kai&backgroundColor=ffdfbf",
    alt: "Kai",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Luna&backgroundColor=c1f0c8",
    alt: "Luna",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Omar&backgroundColor=b6e3f4",
    alt: "Omar",
  },
];

export function PreviewImagesBadgeLarge({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        compact ? "min-h-[220px]" : "min-h-[280px]",
      )}
    >
      <ImagesBadge
        images={IB_TEAM}
        maxVisible={4}
        revealCount={3}
        label="12,000+ developers"
        size="lg"
        shape="circle"
        onClick={() => {}}
      />
    </div>
  );
}

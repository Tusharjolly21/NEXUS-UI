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

export function PreviewImagesBadgeCompact({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-4 px-6",
        compact ? "min-h-[220px]" : "min-h-[280px]",
      )}
    >
      {[
        {
          text: "Felix, Aneka + 3 others liked your post",
          imgs: IB_TEAM.slice(0, 5),
        },
        { text: "Milo, Zoe + 2 others commented", imgs: IB_TEAM.slice(2, 6) },
        { text: "Kai started following you", imgs: IB_TEAM.slice(4, 7) },
      ].map((row, i) => (
        <div key={i} className="flex items-center gap-3">
          <ImagesBadge
            images={row.imgs}
            maxVisible={2}
            revealCount={2}
            size="sm"
            shape="circle"
          />
          <span
            className={cn(
              "text-muted-foreground",
              compact ? "text-[11px]" : "text-sm",
            )}
          >
            {row.text}
          </span>
        </div>
      ))}
    </div>
  );
}

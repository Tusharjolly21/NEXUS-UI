"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { ImagesBadge } from "@/components/images-badge";

const IB_PRODUCTS = [
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=alpha&backgroundColor=1e293b",
    alt: "Alpha",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=beta&backgroundColor=0f172a",
    alt: "Beta",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=gamma&backgroundColor=172554",
    alt: "Gamma",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=delta&backgroundColor=1c1917",
    alt: "Delta",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=epsilon&backgroundColor=14532d",
    alt: "Epsilon",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=zeta&backgroundColor=450a0a",
    alt: "Zeta",
  },
];

export function PreviewImagesBadgeDefault({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        compact ? "min-h-[220px]" : "min-h-[280px]",
      )}
    >
      <div className="inline-flex items-center gap-3">
        <span className="text-2xl select-none" aria-hidden>
          📁
        </span>
        <ImagesBadge
          images={IB_PRODUCTS}
          maxVisible={3}
          revealCount={2}
          label="Introducing Marketing Template"
          size="md"
          shape="rounded"
        />
      </div>
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        hover the images to fan open
      </p>
    </div>
  );
}

"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { ImageTrail } from "@/components/image-trail";

const TRAIL_IMAGES = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", alt: "Mountains" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80", alt: "Forest" },
  { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80", alt: "Valley" },
  { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&q=80", alt: "Autumn" },
  { src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=300&q=80", alt: "Lake" },
];

export function PreviewImageTrail({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[420px] max-h-[420px]" : "min-h-[500px]",
      )}
    >
      <ImageTrail
        images={TRAIL_IMAGES}
        spacing={32}
        duration={950}
        imageSize={compact ? 100 : 130}
        cornerRadius={10}
        fadeOutBlur={6}
        className={cn(
          "w-full rounded-2xl border border-border bg-muted/20",
          compact ? "h-80" : "h-96",
        )}
      >
        <div className="pointer-events-none flex h-full items-center justify-center">
          <p className={cn("select-none text-muted-foreground/50", compact ? "text-xs" : "text-sm")}>
            Move cursor here
          </p>
        </div>
      </ImageTrail>
    </div>
  );
}

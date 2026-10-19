"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScaledPreview } from "./scaled-preview";
import { TINT_CLASSES, type GalleryItem } from "./types";

/**
 * A quiet gallery tile: the live component is the thumbnail. The name and the open action appear
 * on hover or keyboard focus, and stay visible on touch screens. Both are real links to the
 * component's page; `onOpen` turns them into "open the detail modal" when JavaScript is running.
 */
export function GalleryTile({ item, onOpen }: { item: GalleryItem; onOpen?: (slug: string) => void }) {
  const href = `/components/${item.slug}`;
  const open = (e: React.MouseEvent) => {
    if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(item.slug);
  };

  return (
    <div className={cn("group relative h-full rounded-tile p-3", TINT_CLASSES[item.tint])}>
      <div className="h-full overflow-hidden rounded-[20px] bg-card">
        <ScaledPreview exportName={item.exportName} canvas={item.canvas} />
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-6 bottom-6 flex items-center justify-between gap-3 opacity-0 transition-opacity duration-150",
          "group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none",
        )}
      >
        <Link
          href={href}
          onClick={open}
          className="pg-glass pointer-events-auto max-w-[75%] truncate rounded-full bg-card px-3.5 py-1.5 text-[13px] font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {item.name}
        </Link>
        <Link
          href={href}
          onClick={open}
          tabIndex={-1}
          aria-hidden
          className="pg-glass pointer-events-auto grid size-9 place-items-center rounded-full bg-foreground text-background"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

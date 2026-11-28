"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { FloatingDockDesktop } from "@/components/floating-dock";
import { Home, LayoutGrid, Layers, DollarSign, BookOpen, Search, User } from "lucide-react";

const previewDockItems = [
  { title: "Home", icon: <Home />, href: "/" },
  { title: "Components", icon: <LayoutGrid />, href: "/components" },
  { title: "Templates", icon: <Layers />, href: "/templates" },
  { title: "Pricing", icon: <DollarSign />, href: "/pricing" },
  { title: "Docs", icon: <BookOpen />, href: "/docs/installation" },
  { title: "Search", icon: <Search />, href: "/search" },
  { title: "Profile", icon: <User />, href: "/login" },
];

export function PreviewFloatingDock({
  compact = true,
}: { compact?: boolean } = {}) {
  const items = compact ? previewDockItems.slice(0, 5) : previewDockItems;
  return (
    <div
      className={cn(
        "relative flex w-full items-end justify-center overflow-visible rounded-xl bg-gradient-to-b from-muted/45 to-zinc-950/80 dark:from-zinc-950/85 dark:to-zinc-950/40",
        compact ? "min-h-[440px]" : "min-h-[240px]",
      )}
    >
      <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4">
        <FloatingDockDesktop
          className="relative bottom-auto left-auto flex items-end justify-center rounded-full border border-border/60 bg-background/80 px-4 py-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/85"
          items={items}
          disableLinks
        />
      </div>
    </div>
  );
}

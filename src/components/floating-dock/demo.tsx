"use client";

import {
  BookOpen,
  DollarSign,
  Home,
  LayoutGrid,
  Layers,
  Search,
  User,
} from "lucide-react";
import { FloatingDock } from "./floating-dock";

const demoItems = [
  { title: "Home", icon: <Home />, href: "/" },
  { title: "Components", icon: <LayoutGrid />, href: "/components" },
  { title: "Templates", icon: <Layers />, href: "/templates" },
  { title: "Pricing", icon: <DollarSign />, href: "/pricing" },
  { title: "Docs", icon: <BookOpen />, href: "/docs/installation" },
  { title: "Search", icon: <Search />, href: "/search" },
  { title: "Profile", icon: <User />, href: "/login" },
];

export function FloatingDockDemo() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/20 to-background pb-36">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 sm:py-16">
        <header className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Navigation</p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Floating dock
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            macOS-style magnification on desktop; compact menu on small screens. Resize the viewport or move the
            pointer across the dock to feel the springy neighbor scaling.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card/60 p-6 text-left shadow-sm dark:bg-white/[0.03]">
          <h2 className="text-sm font-semibold text-foreground">Behavior</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Desktop: pointer X drives per-icon scale with smooth springs; tooltips above the hovered target.</li>
            <li>Mobile: floating action opens a vertical sheet; backdrop tap or Escape closes.</li>
            <li>Reduced motion: magnification and tooltip motion are toned down.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border/70 bg-gradient-to-b from-card to-muted/20 p-6 shadow-sm dark:from-zinc-950/80 dark:to-zinc-950/35">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Preview Surface</p>
          <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-6 dark:bg-zinc-950/70">
            <p className="text-center text-sm text-muted-foreground">
              More spacing between dock items for cleaner readability and premium feel.
            </p>
          </div>
        </section>
      </div>

      <FloatingDock items={demoItems} />
    </div>
  );
}

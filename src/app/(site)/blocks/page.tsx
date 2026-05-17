"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  PanelLeft,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { blocks, type BlockCategory } from "@/lib/catalog/blocks";
import {
  LibraryExplorerSidebarProvider,
  LibraryExplorerSidebarDesktopChrome,
  LibraryExplorerSidebarMobileSheetBody,
  useLibraryExplorerSidebar,
} from "@/components/library/library-explorer-sidebar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const CATEGORY_NOTES: Record<BlockCategory, string> = {
  "Hero blocks": "Opening sections with motion, atmosphere, and sharp conversion hierarchy.",
  "Pricing blocks": "Billing sections with clear plan comparison and upgrade affordances.",
  Testimonials: "Social proof patterns for trust, launches, and product validation.",
  "Feature grids": "Dense product storytelling for capabilities, metrics, and workflows.",
  "Logo clouds": "Trust bands for partners, users, and ecosystem proof.",
  "Stats sections": "Numerical proof points with restrained, dashboard-like polish.",
  "CTA sections": "Closing sections for trials, demos, waitlists, and upgrades.",
  "Interactive backgrounds": "Responsive motion fields for hero backdrops, feature cards, and product storytelling.",
  "FAQ sections": "Supportive answer layouts tuned for scannability.",
  "Blog sections": "Editorial rails for content hubs and announcement pages.",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_NOTES) as BlockCategory[];

export default function BlocksPage() {
  return (
    <React.Suspense fallback={null}>
      <LibraryExplorerSidebarProvider>
        <BlocksPageInner />
      </LibraryExplorerSidebarProvider>
    </React.Suspense>
  );
}

function BlocksPageInner() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const reduce = useReducedMotion() === true;
  const { bcat, query, premiumOnly, commitParams } = useLibraryExplorerSidebar();

  const normalizedQuery = query.trim().toLowerCase();
  const filteredBlocks = React.useMemo(() => {
    return blocks.filter((block) => {
      const categoryMatch = !bcat || block.category === bcat;
      const premiumMatch = !premiumOnly || block.premium;
      const searchMatch =
        !normalizedQuery ||
        `${block.name} ${block.description} ${block.category} ${block.tags.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);

      return categoryMatch && premiumMatch && searchMatch;
    });
  }, [bcat, normalizedQuery, premiumOnly]);

  const visibleBlocks = React.useMemo(() => {
    return CATEGORY_ORDER.flatMap((category) =>
      filteredBlocks.filter((block) => block.category === category),
    );
  }, [filteredBlocks]);

  return (
    <div className="flex flex-1 lg:flex-row">
      <aside className="relative hidden w-[272px] shrink-0 border-r border-border/40 lg:block">
        <div className="sticky top-16 flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden">
          <LibraryExplorerSidebarDesktopChrome />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-16 z-20 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-md lg:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2 border-border bg-muted dark:bg-zinc-900/80",
              )}
            >
              <PanelLeft className="size-4" />
              Menu
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[min(100%,300px)] border-border bg-background p-0 dark:bg-zinc-950"
            >
              <SheetHeader className="border-b border-border px-4 py-4 text-left">
                <SheetTitle className="text-base text-foreground">Library</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100dvh-7rem)]">
                <div className="px-3 py-4">
                  <LibraryExplorerSidebarMobileSheetBody onPick={() => setMobileNavOpen(false)} />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <span className="text-xs font-medium text-muted-foreground">Blocks catalog</span>
        </div>

        <main className="mx-auto w-full max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10 lg:py-16 xl:px-14">
          <section className="pb-16 lg:pb-24">
            <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Blocks
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Clean, minimal shadcn compatible blocks for polished product pages.
              Built for developers who care about design.
            </p>

            {(bcat || premiumOnly || normalizedQuery) && (
              <div className="mt-7 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredBlocks.length}</span> block
                {filteredBlocks.length !== 1 && "s"}
                {bcat && (
                  <Badge variant="outline" className="border-border/70 text-muted-foreground">
                    {bcat}
                  </Badge>
                )}
                {premiumOnly && (
                  <Badge className="bg-foreground text-background">Premium only</Badge>
                )}
                <button
                  type="button"
                  onClick={() => commitParams({ bcat: null, premium: null, q: null })}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
                >
                  Clear filters
                  <X className="size-3" />
                </button>
              </div>
            )}
          </section>

          {visibleBlocks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-6 py-16 text-center">
              <Search className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-4 text-base font-semibold text-foreground">No blocks found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try another category, search, or access filter.</p>
            </div>
          ) : (
            <section className="grid gap-10 lg:grid-cols-2 xl:gap-x-12 xl:gap-y-14">
              {visibleBlocks.map((block, index) => (
                <BlockCard
                  key={block.slug}
                  block={block}
                  index={index}
                  reduceMotion={reduce}
                />
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function BlockCard({
  block,
  index,
  reduceMotion,
}: {
  block: (typeof blocks)[number];
  index: number;
  reduceMotion: boolean;
}) {
  const Preview = block.Preview;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.28), duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        id={block.slug}
        href={`/blocks/${block.slug}`}
        className="group block h-full overflow-hidden rounded-[28px] bg-muted/55 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:bg-muted/70 hover:shadow-2xl hover:shadow-foreground/10 dark:bg-white/[0.055] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] dark:hover:bg-white/[0.075]"
      >
        <div className="relative p-2.5">
          <div className="relative h-[260px] overflow-hidden rounded-[22px] border border-border/70 bg-zinc-950 shadow-inner sm:h-[300px] xl:h-[320px] dark:border-white/10">
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="w-full origin-center scale-[1.18]">
                <Preview />
              </div>
            </div>
            <div className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-border/60 bg-background/95 text-amber-500 shadow-lg shadow-black/10 dark:border-white/10 dark:bg-zinc-950/90">
              <Sparkles className="size-5 fill-current" />
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              {block.name}
            </h2>
            <span className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-sm font-medium text-foreground shadow-sm dark:bg-white/[0.04]">
              {block.variants.length}+ blocks
            </span>
          </div>
          <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
            {block.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-border/70 bg-background/70 text-muted-foreground dark:bg-white/[0.04]">
              {block.category}
            </Badge>
            <Badge
              variant={block.premium ? "default" : "outline"}
              className={cn(
                block.premium
                  ? "bg-foreground text-background"
                  : "border-border/70 bg-background/70 text-muted-foreground dark:bg-white/[0.04]",
              )}
            >
              {block.premium ? "Included with premium" : "Free"}
            </Badge>
            <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-foreground opacity-0 transition group-hover:opacity-100">
              Open
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

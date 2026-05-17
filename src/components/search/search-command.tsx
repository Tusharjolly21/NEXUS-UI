"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Eye, Search, Sparkles, X, Zap } from "lucide-react";
import { libraryComponents } from "@/lib/catalog/library-components";
import { cn } from "@/lib/utils";

/* ── Category colour map ───────────────────────────────────────────────────── */
const CAT_COLORS: Record<string, string> = {
  animations: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  buttons: "bg-sky-500/15 text-sky-400 border-sky-500/25",
  inputs: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  navigation: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  cards: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  loaders: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  effects: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25",
};
const catColor = (slug: string) =>
  CAT_COLORS[slug] ?? "bg-zinc-700/40 text-zinc-400 border-zinc-600/40";

/* ── Search trigger button ─────────────────────────────────────────────────── */
function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open search"
      className={cn(
        "group inline-flex h-9 items-center gap-2.5 rounded-lg border border-border/70 bg-muted/20 px-3",
        "text-sm text-muted-foreground transition-all duration-200",
        "hover:border-primary/30 hover:bg-muted/50 hover:text-foreground",
        "dark:bg-white/3 dark:hover:border-primary/20",
      )}
    >
      <Search className="size-3.5 shrink-0 transition-colors duration-200 group-hover:text-primary" />
      <span className="hidden text-xs md:inline">Search components…</span>
      <span className="flex items-center gap-0.5">
        <kbd className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-sm dark:bg-white/5">
          ⌘
        </kbd>
        <kbd className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-sm dark:bg-white/5">
          K
        </kbd>
      </span>
    </button>
  );
}

/* ── Two-panel command palette ─────────────────────────────────────────────── */
export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  /* Keyboard shortcut: ⌘K / Ctrl+K / / */
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "/" && !["input", "textarea"].includes(
        (e.target as HTMLElement | null)?.tagName?.toLowerCase() ?? "",
      )) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      const id = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
  }, [open]);

  const needle = query.trim().toLowerCase();

  const popular = React.useMemo(
    () => [...libraryComponents].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 8),
    [],
  );

  const results = React.useMemo(() => {
    if (!needle) return popular;
    return [...libraryComponents]
      .filter(
        (c) =>
          c.name.toLowerCase().includes(needle) ||
          c.slug.toLowerCase().includes(needle) ||
          c.tags.some((t) => t.toLowerCase().includes(needle)) ||
          c.categorySlug.toLowerCase().includes(needle),
      )
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 12);
  }, [needle, popular]);

  React.useEffect(() => setActiveIdx(0), [needle]);

  const activeItem = results[activeIdx] ?? null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeItem) {
      setOpen(false);
      router.push(`/components/${activeItem.slug}`);
    }
  };

  return (
    <>
      <SearchTrigger onClick={() => setOpen(true)} />

      <AnimatePresence>
        {open && (
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[6vh]"
            onMouseDown={() => setOpen(false)}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            {/* Palette */}
            <motion.div
              key="search-modal"
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_32px_80px_-8px_rgba(0,0,0,0.85)]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/80 to-transparent" />

              {/* ── LEFT: search + results ── */}
              <div className="flex min-w-0 flex-1 flex-col border-r border-white/8">

                {/* Search input */}
                <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
                  <Search className="size-4 shrink-0 text-zinc-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search components, tags, effects…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                      className="rounded-md p-1 text-zinc-500 transition hover:text-zinc-200"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
                  >
                    esc
                  </button>
                </div>

                {/* Section label */}
                <p className="px-5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  {needle
                    ? `${results.length} result${results.length !== 1 ? "s" : ""}`
                    : "Trending components"}
                </p>

                {/* Results */}
                <div className="max-h-105 overflow-y-auto pb-3">
                  {results.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <Search className="size-9 text-zinc-700" />
                      <p className="text-sm text-zinc-500">Nothing found for &ldquo;{query}&rdquo;</p>
                    </div>
                  ) : (
                    results.map((item, idx) => {
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={item.slug}
                          type="button"
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => {
                            setOpen(false);
                            router.push(`/components/${item.slug}`);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors",
                            isActive ? "bg-white/7" : "hover:bg-white/4",
                          )}
                        >
                          {/* Category icon */}
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold",
                              catColor(item.categorySlug),
                            )}
                          >
                            {item.categorySlug.slice(0, 2).toUpperCase()}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium leading-tight text-zinc-100">{item.name}</p>
                              {item.premium && <Sparkles className="size-3 shrink-0 text-amber-400" />}
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-zinc-500">{item.description}</p>
                          </div>

                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -4 }}
                                transition={{ duration: 0.12 }}
                              >
                                <ArrowUpRight className="size-4 text-zinc-400" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer hints */}
                <div className="mt-auto flex items-center gap-5 border-t border-white/8 bg-white/2 px-5 py-2.5 text-[11px] text-zinc-600">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/10 bg-white/6 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">↑</kbd>
                    <kbd className="rounded border border-white/10 bg-white/6 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/10 bg-white/6 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">↵</kbd>
                    open
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/10 bg-white/6 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">/</kbd>
                    search
                  </span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <Zap className="size-3 text-primary" />
                    {libraryComponents.length} components
                  </span>
                </div>
              </div>

              {/* ── RIGHT: component detail panel ── */}
              <div className="hidden w-96 shrink-0 flex-col sm:flex">
                <AnimatePresence mode="wait">
                  {activeItem && (
                    <motion.div
                      key={activeItem.slug}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.14 }}
                      className="flex flex-1 flex-col"
                    >
                      {/* Live component preview */}
                      <div className="flex-1 overflow-hidden border-b border-white/8 bg-zinc-900">
                        <div className="flex h-7 items-center gap-1.5 border-b border-white/8 bg-zinc-900/80 px-3">
                          <span className="size-2 rounded-full bg-red-500/60" />
                          <span className="size-2 rounded-full bg-yellow-500/60" />
                          <span className="size-2 rounded-full bg-green-500/60" />
                          <span className="ml-auto font-mono text-[9px] text-zinc-600">preview</span>
                        </div>
                        <div className="relative h-64 overflow-hidden">
                          <div className="pointer-events-none absolute inset-x-0 top-0 w-full">
                            <React.Suspense
                              fallback={
                                <div className="h-16 w-32 animate-pulse rounded-lg bg-white/5" />
                              }
                            >
                              <activeItem.Preview compact />
                            </React.Suspense>
                          </div>
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-zinc-900 to-transparent" />
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-1 flex-col bg-zinc-900/40 p-4">
                        <p className="text-sm font-semibold leading-snug text-zinc-100">
                          {activeItem.name}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">
                          {activeItem.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", catColor(activeItem.categorySlug))}>
                            {activeItem.categorySlug}
                          </span>
                          {activeItem.premium ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
                              <Sparkles className="size-2.5" />
                              Premium
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                              Free
                            </span>
                          )}
                        </div>

                        {activeItem.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {activeItem.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md border border-white/8 bg-white/4 px-1.5 py-0.5 text-[10px] text-zinc-500"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              router.push(`/components/${activeItem.slug}`);
                            }}
                            className="flex-1 rounded-lg bg-white/10 py-2 text-center text-xs font-semibold text-zinc-100 transition hover:bg-white/15"
                          >
                            View component
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              router.push(`/components/${activeItem.slug}`);
                            }}
                            className="flex items-center justify-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
                          >
                            <Eye className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { libraryComponents } from "@/lib/catalog/library-components";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function SearchCommand() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "/") {
        const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const base = [...libraryComponents].sort((a, b) => b.trendingScore - a.trendingScore);
    if (!needle) return base.slice(0, 8);
    return base
      .filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          item.slug.toLowerCase().includes(needle) ||
          item.tags.some((t) => t.toLowerCase().includes(needle)),
      )
      .slice(0, 12);
  }, [query]);

  function openComponent(slug: string) {
    setOpen(false);
    router.push(`/components/${slug}`);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background/90 px-3 text-sm text-muted-foreground transition",
          "hover:border-primary/40 hover:text-foreground",
        )}
        aria-label="Open search"
      >
        <Search className="size-4" />
        <span className="hidden md:inline">Search components...</span>
        <span className="md:hidden">Search</span>
        <kbd className="ml-1 hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background/90 px-3 text-sm text-muted-foreground transition",
          "hover:border-primary/40 hover:text-foreground",
        )}
        aria-label="Open search"
      >
        <Search className="size-4" />
        <span className="hidden md:inline">Search components...</span>
        <span className="md:hidden">Search</span>
        <kbd className="ml-1 hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">
          ⌘K
        </kbd>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0" showCloseButton={false}>
        <div className="border-b border-border p-4">
          <DialogTitle className="sr-only">Search components</DialogTitle>
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components, tags, and effects..."
            className="h-10 border-border bg-background text-foreground"
          />
          <p className="mt-2 text-xs text-muted-foreground">Press Esc to close</p>
        </div>
        <div className="max-h-[60vh] overflow-auto p-2">
          {results.length ? (
            results.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => openComponent(item.slug)}
                className="flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-border hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <Badge variant="outline" className="hidden border-border text-[10px] text-muted-foreground sm:inline-flex">
                    {item.categorySlug}
                  </Badge>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </button>
            ))
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No components found for “{query}”.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

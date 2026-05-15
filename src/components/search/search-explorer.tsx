"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { blocks } from "@/lib/catalog/blocks";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDiscovery } from "@/hooks/use-discovery";
import { Button } from "@/components/ui/button";

function hrefForFavorite(kind: "component" | "template" | "block", slug: string) {
  if (kind === "component") return `/components/${slug}`;
  if (kind === "template") return `/templates/${slug}`;
  return `/blocks/${slug}`;
}

type Kind = "all" | "component" | "template" | "block";

export function SearchExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");
  const kind = (searchParams.get("kind") as Kind) || "all";
  const sort = searchParams.get("sort") ?? "trending";
  const { favorites, bookmarks, recent, toggleFavorite } = useDiscovery();

  React.useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  function pushParams(next: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v || v === "all") p.delete(k);
      else p.set(k, v);
    });
    router.push(`/search?${p.toString()}`);
  }

  const results = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const comps = libraryComponents
      .filter((c) => kind === "all" || kind === "component")
      .filter(
        (c) =>
          !needle ||
          c.name.toLowerCase().includes(needle) ||
          c.tags.some((t) => t.toLowerCase().includes(needle)),
      )
      .map((c) => ({
        kind: "component" as const,
        title: c.name,
        href: `/components/${c.slug}`,
        meta: c.categorySlug,
        score: c.trendingScore,
        premium: c.premium,
      }));
    const tmpls = templates
      .filter((t) => kind === "all" || kind === "template")
      .filter(
        (t) =>
          !needle ||
          t.title.toLowerCase().includes(needle) ||
          t.tags.some((x) => x.toLowerCase().includes(needle)),
      )
      .map((t) => ({
        kind: "template" as const,
        title: t.title,
        href: `/templates/${t.slug}`,
        meta: t.category,
        score: t.trendingScore,
        premium: t.premium,
      }));
    const blks = blocks
      .filter((b) => kind === "all" || kind === "block")
      .filter(
        (b) =>
          !needle ||
          b.name.toLowerCase().includes(needle) ||
          b.tags.some((x) => x.toLowerCase().includes(needle)),
      )
      .map((b) => ({
        kind: "block" as const,
        title: b.name,
        href: `/blocks/${b.slug}`,
        meta: b.category,
        score: b.premium ? 70 : 50,
        premium: b.premium,
      }));
    let merged = [...comps, ...tmpls, ...blks];
    if (sort === "trending") merged.sort((a, b) => b.score - a.score);
    if (sort === "newest") merged.reverse();
    return merged;
  }, [q, kind, sort]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">Search & discovery</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Live search across components, templates, and blocks. Favorites and bookmarks stay on
          this device until you connect Supabase sync.
        </p>
      </div>

      <Card className="border-border bg-muted/50 dark:bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && pushParams({ q })}
            placeholder="Try “pricing”, “hero”, “dashboard”…"
            className="border-border bg-muted dark:bg-black/40 text-foreground"
          />
          <Select value={kind} onValueChange={(v) => pushParams({ kind: v })}>
            <SelectTrigger className="border-border bg-muted dark:bg-black/40 text-foreground">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everything</SelectItem>
              <SelectItem value="component">Components</SelectItem>
              <SelectItem value="template">Templates</SelectItem>
              <SelectItem value="block">Blocks</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => pushParams({ sort: v })}>
            <SelectTrigger className="border-border bg-muted dark:bg-black/40 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Results ({results.length})</p>
          <div className="space-y-2">
            {results.map((r) => (
              <Link
                key={`${r.kind}-${r.href}`}
                href={r.href}
                className="flex items-center justify-between rounded-2xl border border-border bg-muted dark:bg-zinc-950/60 px-4 py-3 transition hover:border-cyan-400/40"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.kind} · {r.meta}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.premium ? (
                    <Badge className="border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100">
                      Premium
                    </Badge>
                  ) : null}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(r.kind, r.href.split("/").pop()!);
                    }}
                  >
                    <span className="sr-only">Favorite</span>♥
                  </Button>
                </div>
              </Link>
            ))}
            {!results.length ? (
              <p className="text-sm text-muted-foreground">No matches — broaden your query or reset filters.</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-4">
          <Card className="border-border bg-muted/50 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Favorites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {favorites.length ? (
                favorites.slice(0, 8).map((f) => (
                  <div key={`${f.kind}-${f.slug}`} className="flex justify-between gap-2">
                    <span>
                      {f.kind} · {f.slug}
                    </span>
                    <Link className="text-primary hover:text-foreground" href={hrefForFavorite(f.kind, f.slug)}>
                      Open
                    </Link>
                  </div>
                ))
              ) : (
                <p>Save items with the heart icon.</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border bg-muted/50 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Bookmarks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {bookmarks.length ? (
                bookmarks.slice(0, 8).map((b) => (
                  <div key={`${b.kind}-${b.slug}`}>{b.kind} · {b.slug}</div>
                ))
              ) : (
                <p>Use bookmarks from detail pages.</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border bg-muted/50 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Recently viewed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {recent.length ? (
                recent.map((slug) => (
                  <Link key={slug} className="block text-primary hover:text-foreground" href={`/components/${slug}`}>
                    {slug}
                  </Link>
                ))
              ) : (
                <p>Open a component to populate history.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

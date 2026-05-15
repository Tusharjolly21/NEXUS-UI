"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Copy,
  Crown,
  ExternalLink,
  Heart,
  Maximize2,
  Sparkles,
} from "lucide-react";
import type { LibraryComponent } from "@/lib/catalog/library-components";
import { libraryComponents } from "@/lib/catalog/library-components";
import { COMPONENT_CATEGORIES } from "@/lib/catalog/taxonomy";
import { SHADCN_REGISTRY_SCOPE, shadcnRegistryUrl } from "@/lib/registry-scope";
import { siteConfig } from "@/lib/seo";
import { useDiscovery } from "@/hooks/use-discovery";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Independent Preview / Code block used for previewSections ───
function PreviewSection({
  section,
  idx,
  liveDemoLink,
  previewFrameMaxWidth,
  slug,
  copyText,
}: {
  section: { Preview: React.ComponentType<{ compact?: boolean }>; reactSource: string };
  idx: number;
  liveDemoLink: string;
  previewFrameMaxWidth: string;
  slug: string;
  copyText: (text: string, label: string) => Promise<void>;
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-auto w-fit gap-1 rounded-full border border-border bg-muted/50 p-1 dark:bg-white/[0.06]">
            {(["preview", "code"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setTab(v)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium capitalize transition",
                  tab === v
                    ? "bg-background text-foreground shadow-sm dark:bg-zinc-900"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v === "code" ? "Code" : "Preview"}
              </button>
            ))}
          </div>
          {/* Live demo link only on first section */}
          {idx === 0 && (
            <Link
              href={liveDemoLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full border-border")}
            >
              <Maximize2 className="mr-2 size-4" />
              Live demo
              <ExternalLink className="ml-2 size-3.5 opacity-70" />
            </Link>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {tab === "preview"
            ? "Try interactions here, or open Live demo in a new tab."
            : "Copy snippet into your App Router project."}
        </p>
      </div>

      {/* Preview frame */}
      {tab === "preview" && (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-neutral-950">
            <div
              className={cn(
                "preview relative flex w-full items-center justify-center p-2 sm:p-6",
                "min-h-[350px]",
              )}
            >
              <div className={cn("w-full", previewFrameMaxWidth)}>
                <section.Preview compact={false} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code frame */}
      {tab === "code" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
              React
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => copyText(section.reactSource, `section-${idx}`)}
            >
              <Copy className="mr-2 size-4" />
              Copy
            </Button>
          </div>
          <pre className="max-h-[min(70vh,520px)] overflow-auto p-4 font-mono text-xs leading-relaxed text-zinc-200">
            <code>{section.reactSource}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export function ComponentDetailView({ item }: { item: LibraryComponent }) {
  const Preview = item.Preview;
  const previewVariants = item.detailPreviews?.length ? item.detailPreviews : [Preview];
  const [rootTab, setRootTab] = React.useState<"preview" | "source">("preview");
  const [codeTab, setCodeTab] = React.useState<"react" | "tailwind">("react");
  const { toggleFavorite, toggleBookmark, isFavorite, isBookmarked, pushRecent } = useDiscovery();

  const related = React.useMemo(
    () =>
      libraryComponents
        .filter((c) => c.categorySlug === item.categorySlug && c.slug !== item.slug)
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 4),
    [item.categorySlug, item.slug],
  );

  React.useEffect(() => {
    pushRecent(item.slug);
  }, [item.slug, pushRecent]);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label}`);
    } catch {
      toast.error("Clipboard unavailable");
    }
  }

  const categoryLabel =
    COMPONENT_CATEGORIES.find((c) => c.slug === item.categorySlug)?.label ?? item.categorySlug;

  const installCmd = `npm install ${(item.dependencies ?? []).join(" ")}`;
  const reactExamples = item.reactExamples?.length
    ? item.reactExamples
    : [{ title: "React Source", code: item.reactSource ?? "" }];
  const previewFrameMaxWidth =
    item.slug === "sparkles" ? "max-w-2xl" : item.slug === "signup-form" ? "max-w-md" : "max-w-5xl";
  const liveDemoLink =
    item.resourceLinks?.find((link) => /live demo/i.test(link.label))?.href ?? `/live-preview/${item.slug}`;
  const nonDemoResourceLinks =
    item.resourceLinks?.filter((link) => !/live demo/i.test(link.label)) ?? [];

  const registryBaseName = item.registryCliName ?? item.slug;
  const shadcnAddCmd = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${registryBaseName}`;
  const registryJsonSnippet = `"registries": {
  "${SHADCN_REGISTRY_SCOPE}": "${shadcnRegistryUrl(siteConfig.url)}"
}`;

  const sidebar = (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">shadcn CLI</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add <span className="font-mono text-foreground">{SHADCN_REGISTRY_SCOPE}</span> to{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">components.json</code>, then run:
        </p>
        <div className="mt-2 flex gap-2 rounded-xl border border-border bg-muted/40 p-2 dark:bg-white/[0.04]">
          <pre className="min-w-0 flex-1 overflow-x-auto p-2 font-mono text-[11px] leading-relaxed text-foreground">
            {shadcnAddCmd}
          </pre>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0 self-start rounded-lg"
            onClick={() => copyText(shadcnAddCmd, "shadcn add")}
          >
            <Copy className="size-4" />
          </Button>
        </div>
        <div className="mt-2 flex gap-2 rounded-xl border border-border bg-muted/40 p-2 dark:bg-white/[0.04]">
          <pre className="min-w-0 flex-1 overflow-x-auto p-2 font-mono text-[10px] leading-relaxed text-foreground">
            {registryJsonSnippet}
          </pre>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0 self-start rounded-lg"
            onClick={() => copyText(registryJsonSnippet, "registry snippet")}
          >
            <Copy className="size-4" />
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">npm packages</p>
        <div className="mt-2 flex gap-2 rounded-xl border border-border bg-muted/40 p-2 dark:bg-white/[0.04]">
          <pre className="min-w-0 flex-1 overflow-x-auto p-2 font-mono text-[11px] leading-relaxed text-foreground">
            {installCmd}
          </pre>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0 self-start rounded-lg"
            onClick={() => copyText(installCmd, "install command")}
          >
            <Copy className="size-4" />
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Dependencies</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {(item.dependencies ?? []).map((d) => (
            <li key={d} className="rounded-lg border border-border/80 bg-background/80 px-2.5 py-1.5 font-mono text-xs dark:bg-black/30">
              {d}
            </li>
          ))}
        </ul>
      </div>
      <Separator />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Motion</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(item.animationKinds ?? []).map((a) => (
            <Badge key={a} variant="outline" className="border-border capitalize text-muted-foreground">
              {a}
            </Badge>
          ))}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Client-only boundaries for motion. Tune tokens and gradients for your brand.
      </p>
    </div>
  );

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:space-y-10 md:py-10">
        {/* Breadcrumb + back */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link
            href="/components"
            className="inline-flex items-center gap-1.5 font-medium text-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-3.5 opacity-70" />
            Components
          </Link>
          <ChevronRight className="size-3.5 opacity-40" aria-hidden />
          <Link
            href={`/components?view=components&cat=${encodeURIComponent(item.categorySlug)}`}
            className="transition hover:text-primary"
          >
            {categoryLabel}
          </Link>
          <ChevronRight className="size-3.5 opacity-40" aria-hidden />
          <span className="truncate text-foreground/80">{item.name}</span>
        </nav>

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-muted/40 to-transparent p-6 sm:p-8 dark:from-primary/15 dark:via-white/[0.04]"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-foreground/[0.04] blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur dark:bg-zinc-900/80">
                <Sparkles className="size-3.5 text-primary" />
                Interactive catalog
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {categoryLabel}
                </Badge>
                {item.premium ? (
                  <Badge className="border border-border/60 bg-muted/30 text-foreground">
                    Premium
                  </Badge>
                ) : (
                  <Badge className="border border-border/60 bg-muted/30 text-foreground">
                    Free
                  </Badge>
                )}
              </div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {item.name}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px] md:text-base">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {(item.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border/80 bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm dark:bg-zinc-900/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {nonDemoResourceLinks.length ? (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Reference and assets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {nonDemoResourceLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "rounded-full border-border text-xs font-normal",
                        )}
                      >
                        {link.label}
                        <ExternalLink className="ml-1.5 size-3 opacity-70" />
                      </a>
                    ))}
                  </div>
                  {item.slug === "terminal" ? (
                    <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                      Sprite audio requires a <span className="font-medium text-foreground">sound.ogg</span> file — add{" "}
                      <code className="rounded bg-muted px-1 font-mono text-[11px]">public/sounds/sound.ogg</code> (see{" "}
                      <code className="rounded bg-muted px-1 font-mono text-[11px]">public/sounds/README.md</code> or run{" "}
                      <code className="rounded bg-muted px-1 font-mono text-[11px]">npm run sounds:fetch</code>).
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-border"
                onClick={() => toggleFavorite("component", item.slug)}
              >
                <Heart
                  className={cn(
                    "mr-2 size-4",
                    isFavorite("component", item.slug) && "fill-primary text-primary",
                  )}
                />
                Favorite
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-border"
                onClick={() => toggleBookmark("component", item.slug)}
              >
                <Bookmark
                  className={cn(
                    "mr-2 size-4",
                    isBookmarked("component", item.slug) && "fill-foreground text-foreground",
                  )}
                />
                Bookmark
              </Button>
            </div>
          </div>
        </motion.header>

        {item.premium ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/8 via-muted/40 to-muted/20 px-5 py-4 dark:from-primary/12"
          >
            <div className="flex items-start gap-3">
              <Crown className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Premium component</p>
                <p className="text-xs text-muted-foreground">
                  Included with Nexus-UI Premium — commercial license and full template access.
                </p>
              </div>
            </div>
            <Link href="/pricing" className={cn(buttonVariants(), "shrink-0 rounded-full px-5")}>
              View plans
            </Link>
          </motion.div>
        ) : null}

        {item.previewSections?.length ? (
          /* ── Paired sections: each has its own Preview / Code tabs ── */
          <>
            <div className="space-y-10">
              {item.previewSections.map((section, idx) => (
                <PreviewSection
                  key={`${item.slug}-section-${idx}`}
                  section={section}
                  idx={idx}
                  liveDemoLink={liveDemoLink}
                  previewFrameMaxWidth={previewFrameMaxWidth}
                  slug={item.slug}
                  copyText={copyText}
                />
              ))}
            </div>
            {/* Installation sidebar shown once below all sections */}
            <Card className="border-border bg-card/90 p-5 shadow-sm dark:bg-white/[0.04]">
              {sidebar}
            </Card>
          </>
        ) : (
          /* ── Default: shared Preview | Code tabs ──────────────────── */
          <Tabs value={rootTab} onValueChange={(v) => setRootTab(v as typeof rootTab)} className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <TabsList className="inline-flex h-auto w-fit flex-wrap gap-1 rounded-full border border-border bg-muted/50 p-1 dark:bg-white/[0.06]">
                  <TabsTrigger
                    value="preview"
                    className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900"
                  >
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="source"
                    className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900"
                  >
                    Code
                  </TabsTrigger>
                </TabsList>
                <Link
                  href={liveDemoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full border-border",
                  )}
                >
                  <Maximize2 className="mr-2 size-4" />
                  Live demo
                  <ExternalLink className="ml-2 size-3.5 opacity-70" />
                </Link>
              </div>
              <p className="text-xs text-muted-foreground lg:max-w-xs lg:text-right">
                {rootTab === "preview"
                  ? "Try interactions here, or open Live demo in a new tab."
                  : "Copy snippets into your App Router project. Tailwind notes are starter guidance."}
              </p>
            </div>

            <TabsContent value="preview" className="mt-0 outline-none focus-visible:ring-0">
              <div className="space-y-5">
                {previewVariants.map((PreviewVariant, idx) => (
                  <div
                    key={`${item.slug}-preview-${idx}`}
                    className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-neutral-950">
                      <div
                        className={cn(
                          "preview relative flex w-full items-center justify-center p-2 sm:p-10",
                          item.slug === "sparkles" || item.slug === "signup-form"
                            ? "aspect-square min-h-0"
                            : "min-h-[350px]",
                        )}
                      >
                        <div className={cn("w-full", previewFrameMaxWidth)}>
                          <PreviewVariant compact={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="source" className="mt-0 outline-none focus-visible:ring-0">
              <div className="grid gap-8 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px]">
                <div className="min-w-0">
                  <Tabs value={codeTab} onValueChange={(v) => setCodeTab(v as typeof codeTab)}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 px-3 py-2 shadow-sm dark:bg-white/[0.04]">
                      <TabsList className="h-9 rounded-full border border-border bg-muted/50 p-0.5 dark:bg-black/30">
                        <TabsTrigger value="react" className="rounded-full px-4 text-xs sm:text-sm">
                          React
                        </TabsTrigger>
                        <TabsTrigger value="tailwind" className="rounded-full px-4 text-xs sm:text-sm">
                          Tailwind
                        </TabsTrigger>
                      </TabsList>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full"
                        onClick={() => copyText(
                          codeTab === "react" ? reactExamples.map((ex) => ex.code).join("\n\n") : item.tailwindSource,
                          codeTab,
                        )}
                      >
                        <Copy className="mr-2 size-4" />
                        Copy {codeTab === "react" ? (reactExamples.length > 1 ? "all React" : "React") : "Tailwind"}
                      </Button>
                    </div>
                    <TabsContent value="react" className="mt-0">
                      {reactExamples.length === 1 ? (
                        <pre className="max-h-[min(70vh,560px)] overflow-auto rounded-2xl border border-border bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-200">
                          <code>{reactExamples[0]?.code ?? ""}</code>
                        </pre>
                      ) : (
                        <div className="space-y-4">
                          {reactExamples.map((example, idx) => (
                            <div key={`${example.title}-${idx}`} className="overflow-hidden rounded-2xl border border-border bg-zinc-950">
                              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
                                  {example.title}
                                </p>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded-full"
                                  onClick={() => copyText(example.code, example.title)}
                                >
                                  <Copy className="mr-2 size-4" />
                                  Copy
                                </Button>
                              </div>
                              <pre className="max-h-[min(62vh,460px)] overflow-auto p-4 font-mono text-xs leading-relaxed text-zinc-200">
                                <code>{example.code}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="tailwind" className="mt-0">
                      <pre className="max-h-[min(70vh,560px)] overflow-auto rounded-2xl border border-border bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-200">
                        <code>{item.tailwindSource}</code>
                      </pre>
                    </TabsContent>
                  </Tabs>
                </div>
                <Card className="h-fit border-border bg-card/90 p-5 shadow-sm dark:bg-white/[0.04] lg:sticky lg:top-20">
                  {sidebar}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {item.props?.length ? (
          <section className="space-y-3 rounded-2xl border border-border bg-card/90 p-5 shadow-sm dark:bg-white/[0.04]">
            <h2 className="text-base font-semibold text-foreground">Props</h2>
            <div className="overflow-x-auto rounded-xl border border-border/80">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-muted/50 dark:bg-black/30">
                  <tr className="border-b border-border/80">
                    <th className="px-3 py-2 font-semibold text-foreground">Prop name</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Type</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Default</th>
                    <th className="px-3 py-2 font-semibold text-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {item.props.map((prop) => (
                    <tr key={prop.name} className="border-b border-border/70 last:border-b-0">
                      <td className="px-3 py-2 align-top font-mono font-semibold text-foreground">{prop.name}</td>
                      <td className="px-3 py-2 align-top font-mono text-muted-foreground">{prop.type}</td>
                      <td className="px-3 py-2 align-top font-mono text-muted-foreground">
                        {prop.defaultValue ?? "—"}
                      </td>
                      <td className="px-3 py-2 align-top text-muted-foreground">{prop.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="space-y-5 border-t border-border pt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Same category
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Related components</h2>
              </div>
              <Link
                href={`/components?view=components&cat=${encodeURIComponent(item.categorySlug)}`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary")}
              >
                Browse {categoryLabel}
                <ExternalLink className="ml-1 size-3 opacity-70" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => {
                const P = r.Preview;
                return (
                  <Link
                    key={r.slug}
                    href={`/components/${r.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="relative aspect-[5/3] overflow-hidden border-b border-border bg-muted dark:bg-zinc-950">
                      <div className="absolute inset-0 bg-primary/[0.06] dark:bg-primary/10" />
                      <div className="relative flex h-full items-center justify-center p-2">
                        <div className="w-full origin-center scale-[0.72] transition duration-300 group-hover:scale-[0.76]">
                          <P />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary">{r.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="rounded-2xl border border-dashed border-border bg-muted/25 px-5 py-6 dark:bg-white/[0.03]">
          <p className="text-sm font-medium text-foreground">Explore by tag</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(item.tags ?? []).map((t) => (
              <Link
                key={t}
                href={`/search?q=${encodeURIComponent(t)}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-full border-border text-xs",
                )}
              >
                Search “{t}”
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

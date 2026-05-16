"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Copy,
  Check,
  Crown,
  ExternalLink,
  Heart,
  Maximize2,
  Sparkles,
  Package,
  Zap,
} from "lucide-react";
import type { LibraryComponent } from "@/lib/catalog/library-components";
import { libraryComponents } from "@/lib/catalog/library-components";
import { COMPONENT_CATEGORIES } from "@/lib/catalog/taxonomy";
import { SHADCN_REGISTRY_SCOPE, shadcnRegistryUrl } from "@/lib/registry-scope";
import { siteConfig } from "@/lib/seo";
import { useDiscovery } from "@/hooks/use-discovery";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ── Animation variants ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 },
  }),
};

const FADE_IN_PROPS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
} as const;

// ── Copy button with check state ────────────────────────────────────
function CopyButton({
  text,
  label,
  className,
  size = "sm",
}: {
  text: string;
  label: string;
  className?: string;
  size?: "sm" | "xs";
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`Copied ${label}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard unavailable");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border/80 hover:bg-accent hover:text-foreground",
        size === "xs" && "px-2 py-1 text-[11px]",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="check" {...FADE_IN_PROPS} className="flex items-center gap-1.5 text-emerald-500">
            <Check className="size-3.5" /> Copied
          </motion.span>
        ) : (
          <motion.span key="copy" {...FADE_IN_PROPS} className="flex items-center gap-1.5">
            <Copy className="size-3.5" /> Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ── Code block ──────────────────────────────────────────────────────
function CodeBlock({ code, label, maxH = "520px" }: { code: string; label?: string; maxH?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
      {label && (
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            {label}
          </span>
          <CopyButton text={code} label={label} />
        </div>
      )}
      {!label && (
        <div className="flex justify-end border-b border-zinc-800/80 px-4 py-2.5">
          <CopyButton text={code} label="code" />
        </div>
      )}
      <pre
        className="overflow-auto p-5 font-mono text-xs leading-relaxed text-zinc-200"
        style={{ maxHeight: maxH }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Tab pill bar ────────────────────────────────────────────────────
function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1 dark:bg-white/[0.05]">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            active === value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {active === value && (
            <motion.span
              layoutId="tab-pill"
              className="absolute inset-0 rounded-full bg-background shadow-sm dark:bg-zinc-900"
              transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
            />
          )}
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Preview frame ───────────────────────────────────────────────────
function PreviewFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/60 via-muted/30 to-background",
        className,
      )}
    >
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative flex min-h-[640px] w-full items-center justify-center p-4 sm:p-10">
        {children}
      </div>
    </motion.div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────
function InstallSidebar({
  item,
  shadcnAddCmd,
  registryJsonSnippet,
  installCmd,
}: {
  item: LibraryComponent;
  shadcnAddCmd: string;
  registryJsonSnippet: string;
  installCmd: string;
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur dark:bg-white/[0.03]">
      {/* shadcn CLI */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="size-3.5 text-muted-foreground" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            shadcn CLI
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Add{" "}
          <span className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground">
            {SHADCN_REGISTRY_SCOPE}
          </span>{" "}
          to{" "}
          <span className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground">
            components.json
          </span>
          , then run:
        </p>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 dark:bg-white/[0.04]">
          <pre className="overflow-x-auto p-3 pr-10 font-mono text-[11px] leading-relaxed text-foreground">
            {shadcnAddCmd}
          </pre>
          <div className="absolute right-2 top-2">
            <CopyButton text={shadcnAddCmd} label="shadcn add" size="xs" />
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 dark:bg-white/[0.04]">
          <pre className="overflow-x-auto p-3 pr-10 font-mono text-[10px] leading-relaxed text-foreground">
            {registryJsonSnippet}
          </pre>
          <div className="absolute right-2 top-2">
            <CopyButton text={registryJsonSnippet} label="registry" size="xs" />
          </div>
        </div>
      </div>

      <Separator />

      {/* npm packages */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="size-3.5 text-muted-foreground" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            npm packages
          </p>
        </div>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 dark:bg-white/[0.04]">
          <pre className="overflow-x-auto p-3 pr-10 font-mono text-[11px] leading-relaxed text-foreground">
            {installCmd}
          </pre>
          <div className="absolute right-2 top-2">
            <CopyButton text={installCmd} label="install" size="xs" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Dependencies */}
      {(item.dependencies ?? []).length > 0 && (
        <>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Dependencies
            </p>
            <ul className="space-y-1.5">
              {(item.dependencies ?? []).map((d) => (
                <li
                  key={d}
                  className="rounded-lg border border-border/70 bg-background/60 px-2.5 py-1.5 font-mono text-[11px] text-foreground dark:bg-black/20"
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <Separator />
        </>
      )}

      {/* Motion tags */}
      {(item.animationKinds ?? []).length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Motion
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(item.animationKinds ?? []).map((a) => (
              <Badge
                key={a}
                variant="outline"
                className="rounded-full border-border text-[10px] capitalize text-muted-foreground"
              >
                {a}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PreviewSection (for previewSections items) ──────────────────────
function PreviewSection({
  section,
  idx,
  liveDemoLink,
  previewFrameMaxWidth,
  shadcnAddCmd,
  registryJsonSnippet,
  installCmd,
  item,
}: {
  section: { Preview: React.ComponentType<{ compact?: boolean }>; reactSource: string };
  idx: number;
  liveDemoLink: string;
  previewFrameMaxWidth: string;
  shadcnAddCmd: string;
  registryJsonSnippet: string;
  installCmd: string;
  item: LibraryComponent;
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <TabBar
            tabs={[
              { value: "preview", label: "Preview" },
              { value: "code", label: "Code" },
            ]}
            active={tab}
            onChange={setTab}
          />
          {idx === 0 && (
            <Link
              href={liveDemoLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full border-border text-xs",
              )}
            >
              <Maximize2 className="mr-1.5 size-3.5" />
              Live demo
              <ExternalLink className="ml-1.5 size-3 opacity-60" />
            </Link>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {tab === "preview"
            ? "Interact with the live preview below."
            : "Copy into your App Router project."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {tab === "preview" ? (
          <motion.div key="preview" {...FADE_IN_PROPS}>
            <PreviewFrame>
              <div className={cn("w-full", previewFrameMaxWidth)}>
                <section.Preview compact={false} />
              </div>
            </PreviewFrame>
          </motion.div>
        ) : (
          <motion.div key="code" {...FADE_IN_PROPS}>
            <CodeBlock code={section.reactSource} label="React" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────
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

  const categoryLabel =
    COMPONENT_CATEGORIES.find((c) => c.slug === item.categorySlug)?.label ?? item.categorySlug;

  const installCmd = `npm install ${(item.dependencies ?? []).join(" ")}`;
  const reactExamples = item.reactExamples?.length
    ? item.reactExamples
    : [{ title: "React Source", code: item.reactSource ?? "" }];
  const previewFrameMaxWidth =
    item.slug === "sparkles" ? "max-w-2xl" : item.slug === "signup-form" ? "max-w-md" : "max-w-5xl";
  const liveDemoLink =
    item.resourceLinks?.find((link) => /live demo/i.test(link.label))?.href ??
    `/live-preview/${item.slug}`;
  const nonDemoResourceLinks =
    item.resourceLinks?.filter((link) => !/live demo/i.test(link.label)) ?? [];

  const registryBaseName = item.registryCliName ?? item.slug;
  const shadcnAddCmd = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${registryBaseName}`;
  const registryJsonSnippet = `"registries": {\n  "${SHADCN_REGISTRY_SCOPE}": "${shadcnRegistryUrl(siteConfig.url)}"\n}`;

  const favorited = isFavorite("component", item.slug);
  const bookmarked = isBookmarked("component", item.slug);

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 md:py-12">

        {/* Breadcrumb */}
        <motion.nav
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link
            href="/components"
            className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            Components
          </Link>
          <ChevronRight className="size-3.5 opacity-40" />
          <Link
            href={`/components?view=components&cat=${encodeURIComponent(item.categorySlug)}`}
            className="transition-colors hover:text-foreground"
          >
            {categoryLabel}
          </Link>
          <ChevronRight className="size-3.5 opacity-40" />
          <span className="truncate text-foreground/70">{item.name}</span>
        </motion.nav>

        {/* Hero */}
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/60 via-background to-background p-6 shadow-sm sm:p-8 dark:from-white/[0.04] dark:via-background"
        >
          {/* Background blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-8 size-48 rounded-full bg-primary/5 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-4">
              {/* Category chip */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur">
                <Sparkles className="size-3 text-primary" />
                {categoryLabel}
              </div>

              {/* Name + badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {item.premium ? (
                    <Badge className="gap-1 border border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-400">
                      <Crown className="size-3" /> Premium
                    </Badge>
                  ) : (
                    <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Free
                    </Badge>
                  )}
                </div>
                <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  {item.name}
                </h1>
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {(item.tags ?? []).map((t) => (
                  <Link
                    key={t}
                    href={`/search?q=${encodeURIComponent(t)}`}
                    className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground dark:bg-zinc-900/60"
                  >
                    {t}
                  </Link>
                ))}
              </div>

              {/* Resource links */}
              {nonDemoResourceLinks.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Resources
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
                          "rounded-full border-border text-xs",
                        )}
                      >
                        {link.label}
                        <ExternalLink className="ml-1.5 size-3 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 gap-2 lg:flex-col lg:items-stretch">
              <button
                type="button"
                onClick={() => toggleFavorite("component", item.slug)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  favorited
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                    : "border-border bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Heart className={cn("size-4", favorited && "fill-current")} />
                {favorited ? "Saved" : "Favorite"}
              </button>
              <button
                type="button"
                onClick={() => toggleBookmark("component", item.slug)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  bookmarked
                    ? "border-border bg-foreground text-background"
                    : "border-border bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
                Bookmark
              </button>
            </div>
          </div>
        </motion.header>

        {/* Premium banner */}
        {item.premium && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-400/8 via-muted/30 to-transparent px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <Crown className="mt-0.5 size-5 shrink-0 text-amber-500" />
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
        )}

        {/* Preview / Code section */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
          {item.previewSections?.length ? (
            <div className="space-y-12">
              {item.previewSections.map((section, idx) => (
                <PreviewSection
                  key={`${item.slug}-section-${idx}`}
                  section={section}
                  idx={idx}
                  liveDemoLink={liveDemoLink}
                  previewFrameMaxWidth={previewFrameMaxWidth}
                  shadcnAddCmd={shadcnAddCmd}
                  registryJsonSnippet={registryJsonSnippet}
                  installCmd={installCmd}
                  item={item}
                />
              ))}
              <InstallSidebar
                item={item}
                shadcnAddCmd={shadcnAddCmd}
                registryJsonSnippet={registryJsonSnippet}
                installCmd={installCmd}
              />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Tab bar row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <TabBar
                    tabs={[
                      { value: "preview", label: "Preview" },
                      { value: "source", label: "Code" },
                    ]}
                    active={rootTab}
                    onChange={setRootTab}
                  />
                  <Link
                    href={liveDemoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-full border-border text-xs",
                    )}
                  >
                    <Maximize2 className="mr-1.5 size-3.5" />
                    Live demo
                    <ExternalLink className="ml-1.5 size-3 opacity-60" />
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  {rootTab === "preview"
                    ? "Interact with the live preview below."
                    : "Copy snippets into your App Router project."}
                </p>
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {rootTab === "preview" ? (
                  <motion.div key="preview" {...FADE_IN_PROPS}>
                    <div className="space-y-4">
                      {previewVariants.map((PreviewVariant, idx) => (
                        <PreviewFrame key={`${item.slug}-preview-${idx}`}>
                          <div
                            className={cn(
                              "w-full",
                              previewFrameMaxWidth,
                              (item.slug === "sparkles" || item.slug === "signup-form") &&
                                "flex items-center justify-center",
                            )}
                          >
                            <PreviewVariant compact={false} />
                          </div>
                        </PreviewFrame>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="source" {...FADE_IN_PROPS}>
                    <div className="grid gap-6 lg:grid-cols-[1fr_268px] xl:grid-cols-[1fr_288px]">
                      {/* Code panel */}
                      <div className="min-w-0 space-y-4">
                        {/* React / Tailwind tabs */}
                        <div className="flex items-center justify-between gap-3">
                          <TabBar
                            tabs={[
                              { value: "react", label: "React" },
                              { value: "tailwind", label: "Tailwind" },
                            ]}
                            active={codeTab}
                            onChange={setCodeTab}
                          />
                          <CopyButton
                            text={
                              codeTab === "react"
                                ? reactExamples.map((ex) => ex.code).join("\n\n")
                                : item.tailwindSource ?? ""
                            }
                            label={codeTab}
                          />
                        </div>
                        <AnimatePresence mode="wait">
                          {codeTab === "react" ? (
                            <motion.div key="react" {...FADE_IN_PROPS}>
                              {reactExamples.length === 1 ? (
                                <CodeBlock code={reactExamples[0]?.code ?? ""} />
                              ) : (
                                <div className="space-y-4">
                                  {reactExamples.map((example, idx) => (
                                    <CodeBlock
                                      key={`${example.title}-${idx}`}
                                      code={example.code}
                                      label={example.title}
                                    />
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div key="tailwind" {...FADE_IN_PROPS}>
                              <CodeBlock code={item.tailwindSource ?? ""} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Sidebar */}
                      <div className="lg:sticky lg:top-20 lg:self-start">
                        <InstallSidebar
                          item={item}
                          shadcnAddCmd={shadcnAddCmd}
                          registryJsonSnippet={registryJsonSnippet}
                          installCmd={installCmd}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Props table */}
        {item.props?.length ? (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="space-y-4 rounded-2xl border border-border bg-card/60 p-5 dark:bg-white/[0.03]"
          >
            <h2 className="text-base font-semibold text-foreground">Props</h2>
            <div className="overflow-x-auto rounded-xl border border-border/80">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-muted/50 dark:bg-black/20">
                  <tr className="border-b border-border/60">
                    {["Prop", "Type", "Default", "Description"].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-semibold text-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.props.map((prop, i) => (
                    <tr
                      key={prop.name}
                      className={cn(
                        "border-b border-border/50 last:border-b-0",
                        i % 2 === 0 ? "" : "bg-muted/20 dark:bg-white/[0.01]",
                      )}
                    >
                      <td className="px-4 py-2.5 align-top font-mono font-semibold text-foreground">
                        {prop.name}
                      </td>
                      <td className="px-4 py-2.5 align-top font-mono text-primary/80">{prop.type}</td>
                      <td className="px-4 py-2.5 align-top font-mono text-muted-foreground">
                        {prop.defaultValue ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 align-top text-muted-foreground">{prop.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        ) : null}

        {/* Related components */}
        {related.length > 0 && (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="space-y-6 border-t border-border pt-10"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Same category
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                  Related components
                </h2>
              </div>
              <Link
                href={`/components?view=components&cat=${encodeURIComponent(item.categorySlug)}`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary")}
              >
                Browse {categoryLabel}
                <ExternalLink className="ml-1 size-3 opacity-60" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r, i) => {
                const P = r.Preview;
                return (
                  <motion.div
                    key={r.slug}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={i * 0.5 + 5}
                  >
                    <Link
                      href={`/components/${r.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="relative aspect-[5/3] overflow-hidden border-b border-border bg-muted dark:bg-zinc-950">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                        <div className="relative flex h-full items-center justify-center overflow-hidden p-2">
                          <div className="w-full origin-center scale-[0.72] transition-transform duration-500 group-hover:scale-[0.77]">
                            <P />
                          </div>
                        </div>
                      </div>
                      <div className="p-3.5">
                        <p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                          {r.name}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Explore by tag */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={6}
          className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-6 dark:bg-white/[0.02]"
        >
          <p className="text-sm font-semibold text-foreground">Explore by tag</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(item.tags ?? []).map((t) => (
              <Link
                key={t}
                href={`/search?q=${encodeURIComponent(t)}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-full border-border text-xs transition-all hover:border-primary/40 hover:text-primary",
                )}
              >
                {t}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

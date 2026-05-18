"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Code2,
  Copy,
  Expand,
  Monitor,
  Package,
  X,
  Zap,
} from "lucide-react";
import { getLibraryComponent } from "@/lib/catalog/library-components";
import { getComponentCategoryLabel, type ComponentCategorySlug } from "@/lib/catalog/taxonomy";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { CodeBlock } from "@/components/code-block/code-block";

// ── tiny copy button ────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-background/80 px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
    >
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── install sidebar (matches the screenshot) ────────────────────────
function InstallSidebar({
  slug,
  registryCliName,
  dependencies,
  animationKinds,
}: {
  slug: string;
  registryCliName?: string;
  dependencies: string[];
  animationKinds: string[];
}) {
  const name = registryCliName ?? slug;
  const shadcnAddCmd = `npx shadcn@latest add @next-ui/${name}`;
  const registryConfig = `"registries": {\n  "@next-ui": "https://nexus-ui.com/r/{name}.json"\n}`;
  const installCmd = `npm install ${dependencies.join(" ")}`;

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card/80 p-5 shadow-sm dark:bg-white/[0.03]">
      {/* shadcn CLI */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="size-3.5 text-muted-foreground" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Shadcn CLI
          </p>
        </div>

        {/* Step 1 */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-foreground">Step 1 — One-time setup</p>
          <p className="text-[11px] text-muted-foreground">
            Create or open <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground">components.json</code> in your project root and add:
          </p>
          <div className="relative rounded-xl border border-border bg-muted/30 dark:bg-white/4">
            <pre className="max-h-40 overflow-auto p-3 pr-16 font-mono text-[10px] leading-relaxed text-foreground">
              {registryConfig}
            </pre>
            <div className="absolute right-2 top-2">
              <CopyBtn text={registryConfig} />
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-foreground">Step 2 — Install component</p>
          <div className="relative rounded-xl border border-border bg-muted/30 dark:bg-white/4">
            <pre className="max-h-40 overflow-auto p-3 pr-16 font-mono text-[11px] leading-relaxed text-foreground">
              {shadcnAddCmd}
            </pre>
            <div className="absolute right-2 top-2">
              <CopyBtn text={shadcnAddCmd} />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* npm packages */}
      {dependencies.length > 0 && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="size-3.5 text-muted-foreground" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                npm packages
              </p>
            </div>
            <div className="relative rounded-xl border border-border bg-muted/30 dark:bg-white/4">
              <pre className="max-h-40 overflow-auto p-3 pr-16 font-mono text-[11px] leading-relaxed text-foreground">
                {installCmd}
              </pre>
              <div className="absolute right-2 top-2">
                <CopyBtn text={installCmd} />
              </div>
            </div>
          </div>

          <Separator />

          {/* dependencies list */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Dependencies
            </p>
            <ul className="space-y-1.5">
              {dependencies.map((d) => (
                <li
                  key={d}
                  className="rounded-lg border border-border/70 bg-background/60 px-2.5 py-1.5 font-mono text-[11px] text-foreground dark:bg-black/20"
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {animationKinds.length > 0 && <Separator />}
        </>
      )}

      {/* motion tags */}
      {animationKinds.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Motion
          </p>
          <div className="flex flex-wrap gap-1.5">
            {animationKinds.map((a) => (
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

// ── main client component ───────────────────────────────────────────
export function ComponentDetailPageClient({ slug }: { slug: string }) {
  const comp = getLibraryComponent(slug);
  if (!comp) return null;

  const categoryLabel = getComponentCategoryLabel(comp.categorySlug as ComponentCategorySlug);

  return (
    <main className="mx-auto w-full max-w-[1420px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10 xl:px-14">
      <nav className="mb-7 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/components" className="transition hover:text-foreground">
          Components
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/components?cat=${comp.categorySlug}`}
          className="transition hover:text-foreground"
        >
          {categoryLabel}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{comp.name}</span>
      </nav>

      <header>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {comp.name}
        </h1>
        <p className="mt-4 max-w-3xl text-xl leading-8 text-muted-foreground">
          {comp.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-border/70 bg-muted/50 text-muted-foreground">
            {categoryLabel}
          </Badge>
          {comp.animationKinds.map((kind) => (
            <Badge
              key={kind}
              variant="outline"
              className="border-border/70 bg-muted/50 text-muted-foreground"
            >
              {kind}
            </Badge>
          ))}
          {comp.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-border/70 bg-muted/50 text-muted-foreground"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <Accordion defaultValue={[]} className="mt-10">
        <AccordionItem value="installation" className="border-0">
          <AccordionTrigger className="rounded-xl bg-muted/70 px-5 py-4 text-2xl font-semibold text-foreground no-underline hover:bg-muted hover:no-underline dark:bg-white/[0.06] dark:hover:bg-white/[0.08]">
            Installation
          </AccordionTrigger>
          <AccordionContent className="rounded-b-xl border border-t-0 border-border/50 bg-muted/25 px-5 py-4 text-sm text-muted-foreground dark:bg-white/[0.03]">
            <p>
              Copy the component code from the Code tab and place it in your components directory.
              The preview below shows the component in a realistic context.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {comp.previewSections ? (
        comp.previewSections.map((section, i) => {
          const SectionPreview = section.Preview;
          return (
            <PreviewCodeSection
              key={i}
              title={comp.previewSections!.length > 1 ? `${comp.name} — Variant ${i + 1}` : comp.name}
              code={section.reactSource}
              slug={comp.slug}
              dependencies={comp.dependencies}
              animationKinds={comp.animationKinds}
              registryCliName={comp.registryCliName}
              className={i > 0 ? "mt-16" : undefined}
            >
              <SectionPreview compact={false} />
            </PreviewCodeSection>
          );
        })
      ) : (
        <PreviewCodeSection
          title={comp.name}
          code={comp.reactSource ?? ""}
          slug={comp.slug}
          dependencies={comp.dependencies}
          animationKinds={comp.animationKinds}
          registryCliName={comp.registryCliName}
        >
          <comp.Preview compact={false} />
        </PreviewCodeSection>
      )}

      <section className="mt-10 grid gap-4 border-t border-border/50 pt-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Animation effects</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {comp.animationKinds.length > 0 ? (
              comp.animationKinds.map((kind) => (
                <Badge key={kind} variant="outline" className="border-border/70 text-muted-foreground">
                  {kind}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="border-border/70 text-muted-foreground">
                static
              </Badge>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 dark:bg-white/4">
          <p className="text-sm font-semibold text-foreground">Copy-paste ready</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Use the Code tab above to inspect and copy this component into your project.
          </p>
        </div>
      </section>
    </main>
  );
}

// ── preview + code tabs ─────────────────────────────────────────────
function PreviewCodeSection({
  title,
  code,
  slug,
  dependencies,
  animationKinds,
  registryCliName,
  className,
  children,
}: {
  title: string;
  code: string;
  slug: string;
  dependencies: string[];
  animationKinds: string[];
  registryCliName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <section className={className ?? "mt-14"}>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>

      <Tabs defaultValue="preview" className="mt-7 gap-0">
        <div className="flex items-end justify-between gap-3">
          <TabsList className="h-11 rounded-xl bg-muted p-1">
            <TabsTrigger value="preview" className="h-9 gap-2 rounded-lg px-4 text-base">
              <Monitor className="size-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="h-9 gap-2 rounded-lg px-4 text-base">
              <Code2 className="size-4" />
              Code
            </TabsTrigger>
          </TabsList>

          <button
            type="button"
            aria-label="Full screen preview"
            onClick={() => setExpanded(true)}
            className="grid size-10 place-items-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-sm transition hover:text-foreground dark:bg-white/4"
          >
            <Expand className="size-4" />
          </button>
        </div>

        <TabsContent value="preview" className="mt-4">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm dark:border-white/10 dark:bg-zinc-950">
            {children}
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <InstallSidebar
              slug={slug}
              registryCliName={registryCliName}
              dependencies={dependencies}
              animationKinds={animationKinds}
            />
            <div className="h-[600px] xl:h-[700px]">
              <CodeBlock
                code={code}
                language="tsx"
                theme="dark"
                header={{
                  enabled: true,
                  showDots: true,
                  title: `${title}.tsx`,
                  copy: {
                    enabled: true,
                    label: "Copy code",
                    copiedLabel: "Copied",
                    copiedDurationMs: 1400,
                  },
                }}
                codeArea={{ showLineNumbers: true, wrap: false, padding: 18 }}
                border={{ radius: "16px" }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* fullscreen expand dialog */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogPortal>
          <DialogOverlay />
          <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl dark:bg-zinc-950 sm:inset-6 lg:inset-10">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/60 px-5">
              <span className="text-sm font-semibold text-foreground">{title}</span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="flex min-h-full w-full items-start justify-center p-6">
                {children}
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </section>
  );
}

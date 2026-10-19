"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { highlight } from "sugar-high";
import { ArrowUpRight, Box, Check, ChevronRight, Code2, Copy, Link2, RotateCcw, Sparkles, X } from "lucide-react";
import { buildSnippet, ControlRow, initialValues, Segmented } from "@/components/library/props-playground";
import type { Playground, PlaygroundValues } from "@/lib/catalog/playgrounds";
import { SHADCN_REGISTRY_SCOPE } from "@/lib/registry-scope";
import { cn } from "@/lib/utils";
import { FitPreview } from "./fit-preview";
import { INTERACTION_FILTERS, TINT_CLASSES, type GalleryItem } from "./types";

const INTERACTION_LABELS = Object.fromEntries(INTERACTION_FILTERS.map((f) => [f.value, f.label]));
const SITE = "https://www.nexus-ui.com";

type Usage = { usage: string; props: { name: string; type: string; description: string; defaultValue?: string }[]; dependencies: string[]; premium: boolean };
type RegistryFile = { path: string; target?: string; content: string };

/** Values the visitor changed, as URL params, so a shared link opens with the same settings. */
function readUrlValues(playground: Playground): PlaygroundValues {
  const q = new URLSearchParams(window.location.search);
  const values = initialValues(playground.controls);
  for (const c of playground.controls) {
    const raw = q.get(c.prop);
    if (raw === null) continue;
    if (c.kind === "range") {
      const n = Number(raw);
      if (Number.isFinite(n)) values[c.prop] = Math.min(c.max, Math.max(c.min, n));
    } else if (c.kind === "toggle") values[c.prop] = raw === "1" || raw === "true";
    else if (c.options.includes(raw)) values[c.prop] = raw;
  }
  return values;
}

function writeUrlValues(playground: Playground, values: PlaygroundValues) {
  const url = new URL(window.location.href);
  for (const c of playground.controls) {
    const v = values[c.prop];
    if (v === c.defaultValue) url.searchParams.delete(c.prop);
    else url.searchParams.set(c.prop, typeof v === "boolean" ? (v ? "1" : "0") : String(v));
  }
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function useCopied(ms = 1600): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), ms);
    return () => clearTimeout(t);
  }, [copied, ms]);
  const copy = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // clipboard blocked; nothing to undo
    }
  }, []);
  return [copied, copy];
}

/** Dark+ token colours for sugar-high. */
const SH_VARS = {
  "--sh-keyword": "#c792ea",
  "--sh-string": "#c3e88d",
  "--sh-comment": "#6b7280",
  "--sh-identifier": "#e6e6eb",
  "--sh-sign": "#9aa0aa",
  "--sh-class": "#82aaff",
  "--sh-property": "#ffcb6b",
  "--sh-entity": "#f78c6c",
  "--sh-jsxliterals": "#e6e6eb",
} as React.CSSProperties;

function Code({ code }: { code: string }) {
  const html = React.useMemo(() => highlight(code), [code]);
  return (
    <pre
      className="max-h-[420px] overflow-auto rounded-2xl bg-[#121216] p-4 font-mono text-[12.5px] leading-[1.65] text-[#e6e6eb]"
      style={SH_VARS}
    >
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

function Section({
  title,
  open,
  onToggle,
  copyText,
  aside,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  copyText?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [copied, copy] = useCopied();
  return (
    <div className="rounded-[20px] bg-card shadow-[0_0_0_1px_rgba(23,23,28,0.06)]">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex h-9 flex-1 items-center gap-2 rounded-xl px-2 text-left text-[14px] font-medium text-foreground"
        >
          <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")} aria-hidden />
          {title}
        </button>
        {open ? aside : null}
        {copyText ? (
          <button
            type="button"
            onClick={() => copy(copyText)}
            aria-label={`Copy ${title.toLowerCase()}`}
            className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? <Check className="size-4 text-emerald-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          </button>
        ) : null}
      </div>
      {open ? <div className="px-2 pb-2">{children}</div> : null}
    </div>
  );
}

/**
 * The inspector: the component on a large stage on the left; on the right what it is, its live
 * controls (when it has a playground) and the ways to take it — install, Copy prompt for an AI
 * agent, and Share (a link that keeps the tweaked values). The stage flips to Install / Usage /
 * Source. Deep-linked by the caller as `?c=slug`, with tweaked values as further params.
 */
export function ComponentModal({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  return (
    <DialogPrimitive.Root open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-background/55 backdrop-blur-xl transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <DialogPrimitive.Popup className="fixed inset-x-2 bottom-2 top-14 z-[61] mx-auto flex max-w-[1180px] flex-col gap-2 outline-none transition-[opacity,transform] duration-200 ease-out data-[ending-style]:translate-y-3 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-3 data-[starting-style]:opacity-0 motion-reduce:transition-none sm:inset-x-6 sm:bottom-6 sm:top-20 lg:flex-row lg:gap-3">
          {item ? <Inspector key={item.slug} item={item} /> : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Inspector({ item }: { item: GalleryItem }) {
  const [playground, setPlayground] = React.useState<Playground | null | undefined>(undefined);
  const [values, setValues] = React.useState<PlaygroundValues>({});
  const [fill, setFill] = React.useState<"light" | "dark">("light");
  const [view, setView] = React.useState<"preview" | "code">("preview");
  const [run, setRun] = React.useState(0);
  const [usage, setUsage] = React.useState<Usage | null>(null);
  const [files, setFiles] = React.useState<RegistryFile[] | null | "locked">(null);
  const [fileIndex, setFileIndex] = React.useState(0);
  const [openSection, setOpenSection] = React.useState<"install" | "usage" | "source">("usage");
  const [shared, share] = useCopied();
  const [prompted, prompt] = useCopied(2200);

  // Load the live controls (heavy: imports every playground component) only when inspecting.
  React.useEffect(() => {
    let alive = true;
    import("@/lib/catalog/playgrounds").then(({ playgrounds }) => {
      if (!alive) return;
      const pg = playgrounds[item.slug] ?? null;
      setPlayground(pg);
      if (pg) {
        setValues(readUrlValues(pg));
        setFill(pg.defaultFill ?? "light");
      }
    });
    fetch(`/api/usage/${item.slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((u: Usage | null) => alive && setUsage(u))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [item.slug]);

  React.useEffect(() => {
    if (playground) writeUrlValues(playground, values);
  }, [playground, values]);

  // Leave the gallery URL clean when the inspector closes.
  React.useEffect(() => {
    if (!playground) return;
    return () => {
      const url = new URL(window.location.href);
      for (const c of playground.controls) url.searchParams.delete(c.prop);
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    };
  }, [playground]);

  // Full source from the registry, fetched the first time the Source section opens.
  React.useEffect(() => {
    if (view !== "code" || openSection !== "source" || files !== null) return;
    fetch(`/api/registry/${item.install}`)
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) return setFiles("locked");
        if (!r.ok) return setFiles([]);
        const json = (await r.json()) as { files?: RegistryFile[] };
        setFiles(json.files ?? []);
      })
      .catch(() => setFiles([]));
  }, [view, openSection, files, item.install]);

  const install = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${item.install}`;
  const installUrl = `npx shadcn@latest add ${SITE}/api/registry/${item.install}`;
  const snippet = playground ? buildSnippet(playground, values) : (usage?.usage ?? "");
  const dirty = playground ? playground.controls.some((c) => values[c.prop] !== c.defaultValue) : false;

  const promptText = [
    `Add the "${item.name}" component from Nexus UI to this project.`,
    "",
    `What it is: ${item.description}`,
    "",
    "1. Install it with the shadcn CLI:",
    `   ${install}`,
    `   If components.json has no "${SHADCN_REGISTRY_SCOPE}" registry, install from the URL instead: ${installUrl}`,
    usage?.dependencies?.length ? `   It uses: ${usage.dependencies.join(", ")}.` : null,
    "",
    "2. Use it like this:",
    "```tsx",
    snippet.trim(),
    "```",
    "",
    "3. Put it where I ask, keep the props shown above, and map its colours to this project's theme. It is a client component (\"use client\").",
    usage?.props?.length
      ? `\nProps: ${usage.props.map((p) => `${p.name}${p.defaultValue ? ` (default ${p.defaultValue})` : ""}`).join(", ")}.`
      : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const stageDark = playground ? fill === "dark" : item.fit.dark;

  return (
    <>
      {/* Stage */}
      <section
        aria-label={`${item.name} preview`}
        className={cn(
          "relative min-h-[280px] flex-1 overflow-hidden rounded-[28px] lg:min-h-0",
          !playground && !item.fit.bg && TINT_CLASSES[item.tint],
          playground && (fill === "dark" ? "dark bg-[#0b0b10]" : TINT_CLASSES[item.tint]),
        )}
        style={!playground && item.fit.bg ? { backgroundColor: item.fit.bg } : undefined}
      >
        {view === "preview" ? (
          playground ? (
            <div key={run} className="absolute inset-0 flex items-center justify-center p-6 text-foreground">
              {playground.render(values, fill)}
            </div>
          ) : (
            <FitPreview
              key={run}
              exportName={item.exportName}
              canvas={item.fit.canvas}
              focus={item.fit.focus}
              eager
              className={cn(
                item.fit.clearRoot &&
                  // light theme only: in dark, previews without dark styles keep their own light surface so text stays readable
                  "not-dark:[&>div>*]:!rounded-none not-dark:[&>div>*]:!border-0 not-dark:[&>div>*]:!bg-transparent not-dark:[&>div>*]:!shadow-none",
              )}
            />
          )
        ) : (
          <div className="absolute inset-0 space-y-2 overflow-y-auto p-3 pt-[60px]">
            <Section title="Install" open={openSection === "install"} onToggle={() => setOpenSection("install")} copyText={install}>
              <Code code={install} />
              <p className="px-2 pb-1 pt-3 text-[12.5px] leading-relaxed text-muted-foreground">
                No <code className="font-mono text-foreground">{SHADCN_REGISTRY_SCOPE}</code> registry in your{" "}
                <code className="font-mono text-foreground">components.json</code> yet? Install straight from the URL:
              </p>
              <Code code={installUrl} />
            </Section>
            <Section
              title={playground ? "Usage — with your settings" : "Usage"}
              open={openSection === "usage"}
              onToggle={() => setOpenSection("usage")}
              copyText={snippet}
            >
              {snippet ? <Code code={snippet} /> : <p className="px-2 py-3 text-[13px] text-muted-foreground">Loading…</p>}
            </Section>
            <Section
              title="Source"
              open={openSection === "source"}
              onToggle={() => setOpenSection("source")}
              copyText={Array.isArray(files) ? files[fileIndex]?.content : undefined}
              aside={
                Array.isArray(files) && files.length > 1 ? (
                  <div className="flex max-w-[60%] gap-1 overflow-x-auto">
                    {files.map((f, i) => (
                      <button
                        key={f.path}
                        type="button"
                        onClick={() => setFileIndex(i)}
                        className={cn(
                          "h-7 shrink-0 rounded-full px-2.5 font-mono text-[11.5px] transition-colors",
                          i === fileIndex ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {f.path.split("/").pop()}
                      </button>
                    ))}
                  </div>
                ) : null
              }
            >
              {files === null ? (
                <p className="px-2 py-3 text-[13px] text-muted-foreground">Loading…</p>
              ) : files === "locked" ? (
                <p className="px-2 py-3 text-[13px] text-muted-foreground">The source of this component comes with Pro.</p>
              ) : files.length ? (
                <Code code={files[Math.min(fileIndex, files.length - 1)].content} />
              ) : (
                <p className="px-2 py-3 text-[13px] text-muted-foreground">
                  Source isn&apos;t available here. <Link className="underline" href={`/components/${item.slug}`}>Open the full page</Link>.
                </p>
              )}
            </Section>
          </div>
        )}

        {/* stage toolbar */}
        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between">
          <div
            role="tablist"
            aria-label="View"
            className={cn(
              "flex items-center gap-0.5 rounded-full p-1 backdrop-blur-md",
              stageDark && view === "preview" ? "bg-white/10" : "bg-white/80 shadow-[0_0_0_1px_rgba(23,23,28,0.06)]",
            )}
          >
            {(
              [
                ["preview", Box, "Preview"],
                ["code", Code2, "Code"],
              ] as const
            ).map(([v, Icon, label]) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                aria-label={label}
                title={label}
                onClick={() => setView(v)}
                className={cn(
                  "grid h-8 w-9 place-items-center rounded-full transition-colors",
                  view === v
                    ? "bg-white text-[#17171c] shadow-sm"
                    : stageDark && view === "preview"
                      ? "text-white/70 hover:text-white"
                      : "text-[#17171c]/55 hover:text-[#17171c]",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
          {view === "preview" ? (
            <button
              type="button"
              onClick={() => setRun((r) => r + 1)}
              aria-label="Replay"
              title="Replay"
              className={cn(
                "grid size-10 place-items-center rounded-full backdrop-blur-md transition-colors",
                stageDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/80 text-[#17171c] shadow-[0_0_0_1px_rgba(23,23,28,0.06)] hover:bg-white",
              )}
            >
              <RotateCcw className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => prompt(promptText)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#17171c] px-4 text-[13.5px] font-semibold text-white transition-[width] dark:bg-white dark:text-[#17171c]"
            >
              {prompted ? <Check className="size-4" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
              <span aria-live="polite">{prompted ? "Copied — paste it into your agent" : "Copy prompt"}</span>
            </button>
          )}
        </div>
      </section>

      {/* Panel */}
      <aside className="flex max-h-[46%] w-full shrink-0 flex-col overflow-hidden rounded-[28px] bg-card shadow-[0_0_0_1px_rgba(23,23,28,0.06),0_24px_48px_-24px_rgba(23,23,28,0.25)] lg:max-h-none lg:w-[340px]">
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12.5px] text-muted-foreground">{item.categoryLabel}</p>
              <DialogPrimitive.Title className="mt-0.5 text-[20px] font-semibold tracking-[-0.02em] text-foreground">
                {item.name}
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X className="size-[18px]" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            {item.description}
          </DialogPrimitive.Description>

          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Details">
            {item.interactions.map((i) => (
              <li key={i} className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-foreground">
                {INTERACTION_LABELS[i]}
              </li>
            ))}
            <li className="rounded-full bg-tint-mint px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] dark:text-[#7be3a6]">Free</li>
            {item.isNew ? (
              <li className="rounded-full bg-foreground px-2.5 py-1 text-[12px] font-semibold text-background">New</li>
            ) : null}
          </ul>

          {playground ? (
            <div className="mt-5 space-y-2">
              <div className="flex min-h-9 items-center justify-between gap-2">
                <span className="text-[13px] text-foreground/75">Fill</span>
                <Segmented label="Fill" options={["light", "dark"] as const} value={fill} onChange={setFill} />
              </div>
              {playground.controls.map((control) => (
                <ControlRow
                  key={control.prop}
                  control={control}
                  value={values[control.prop]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [control.prop]: v }))}
                />
              ))}
              {dirty ? (
                <button
                  type="button"
                  onClick={() => setValues(initialValues(playground.controls))}
                  className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Reset to defaults
                </button>
              ) : null}
            </div>
          ) : playground === null ? (
            <div className="mt-5 rounded-2xl bg-muted/60 p-4">
              <p className="text-[13px] font-medium text-foreground">Install</p>
              <code className="mt-1.5 block break-all font-mono text-[12.5px] leading-relaxed text-muted-foreground">{install}</code>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 border-t border-border/70 p-4">
          <button
            type="button"
            onClick={() => share(window.location.href)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors",
              shared
                ? "bg-tint-mint text-[#126b3a] dark:text-[#7be3a6]"
                : "bg-card text-foreground shadow-[0_0_0_1px_rgba(23,23,28,0.12)] hover:bg-muted",
            )}
          >
            {shared ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
            <span aria-live="polite">{shared ? "Link copied" : dirty ? "Share these settings" : "Share"}</span>
          </button>
          <button
            type="button"
            onClick={() => prompt(promptText)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground text-[14px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            {prompted ? <Check className="size-4" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
            <span aria-live="polite">{prompted ? "Copied — paste into your agent" : "Copy prompt"}</span>
          </button>
          <Link
            href={`/components/${item.slug}`}
            className="inline-flex h-8 items-center justify-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Full page with props and docs
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </aside>
    </>
  );
}

"use client";

import { useRegistryFiles } from "@/components/library/use-registry-files";
import { AutoplaySound } from "@/lib/ui-sounds";
import * as React from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { highlight } from "sugar-high";
import { ArrowUpRight, Box, Check, ChevronRight, Code2, Copy, Link2, RotateCcw, Sparkles, X } from "lucide-react";
import { buildSnippet, ControlRow, initialValues, Segmented } from "@/components/library/props-playground";
import type { Playground, PlaygroundValues } from "@/lib/catalog/playgrounds";
import { SHADCN_REGISTRY_SCOPE } from "@/lib/registry-scope";
import { cn } from "@/lib/utils";
import { SoundSwitch, TypingSoundSwitch } from "@/components/site/sound-switch";
import { TYPING_NOTE } from "@/lib/catalog/component-sounds";
import { ProBadge, useCopyBuildPrompt, useLocked, useProAccess } from "@/components/pro/pro-access";
import { FitPreview } from "./fit-preview";
import { INTERACTION_FILTERS, TINT_CLASSES, type GalleryItem } from "./types";

const INTERACTION_LABELS = Object.fromEntries(INTERACTION_FILTERS.map((f) => [f.value, f.label]));
const SITE = "https://www.nexus-ui.com";

type Usage = {
  usage: string;
  props: { name: string; type: string; description: string; defaultValue?: string }[];
  dependencies: string[];
  premium: boolean;
  /** The server withheld the code: Pro component, no access. */
  locked?: boolean;
};

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
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-background/90 sm:bg-background/55 sm:backdrop-blur-xl transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
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
  const [fileIndex, setFileIndex] = React.useState(0);
  const [openSection, setOpenSection] = React.useState<"install" | "usage" | "source">("usage");
  const [shared, share] = useCopied();
  const [prompted, copyPrompt] = useCopied(2200);
  const { requestUpgrade } = useProAccess();
  // The UI lock follows the visitor's plan; the server's answer (usage.locked) wins when it says no.
  const locked = useLocked(item.premium) || !!usage?.locked;
  // Components with a build prompt copy that (free unless the component is Pro); the rest copy the install brief for an agent.
  const [buildState, copyBuild] = useCopyBuildPrompt(item.slug, item.name, { hasAccess: !locked, free: !item.premium });
  const prompt = (text: string) => (item.hasPrompt ? copyBuild() : locked ? requestUpgrade(item.name) : copyPrompt(text));
  const promptDone = item.hasPrompt ? buildState === "copied" : prompted;
  const promptLabel = item.hasPrompt
    ? buildState === "loading"
      ? "Copying…"
      : buildState === "copied"
        ? "Copied — paste it into your agent"
        : buildState === "error"
          ? "Couldn't copy, try again"
          : !locked
            ? "Copy build prompt"
            : "Copy build prompt with Pro"
    : prompted
      ? "Copied — paste into your agent"
      : locked
        ? "Copy prompt with Pro"
        : "Copy prompt";
  const pickView = (v: "preview" | "code") => (v === "code" && locked ? requestUpgrade(item.name) : setView(v));

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

  // Full source from the registry (plus the helper files it imports), fetched the first time the Source section opens.
  const sourceState = useRegistryFiles(item.install, view === "code" && openSection === "source");
  const files = sourceState.status === "ready" ? sourceState.files : null;

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
    item.premium
      ? `   This is a Pro item: it needs the API key set up first (save it as NEXUS_API_KEY in .env.local and add the "registries" entry with the Authorization header to components.json, see nexus-ui.com/docs/installation).`
      : `   If components.json has no "${SHADCN_REGISTRY_SCOPE}" registry, run npx shadcn@latest registry add "${SHADCN_REGISTRY_SCOPE}=${SITE}/api/registry/{name}" first, or install from the URL instead: ${installUrl}`,
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
          playground && (playground.lightOnly ? "bg-[#f5f5f7]" : fill === "dark" ? "dark bg-[#0b0b10]" : TINT_CLASSES[item.tint]),
        )}
        style={!playground && item.fit.bg ? { backgroundColor: item.fit.bg } : undefined}
      >
        {view === "preview" ? (
          playground ? (
            <div key={run} className={cn("absolute inset-0 flex items-center justify-center p-6", playground.lightOnly ? "text-[#1d1d1f]" : "text-foreground")}>
              <AutoplaySound allow>{playground.render(values, fill)}</AutoplaySound>
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
                {item.premium ? (
                  <>
                    Pro items need your API key set up first. Follow the{" "}
                    <Link className="underline" href="/docs/installation#add-a-pro-component-with-the-cli">
                      Pro steps in the Quick Start
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    First time in this project? Run{" "}
                    <code className="font-mono text-foreground">npx shadcn@latest init -d</code> once. Then connect the registry
                    with the command in the{" "}
                    <Link className="underline" href="/docs/installation#add-a-free-component-with-the-cli">
                      Quick Start
                    </Link>
                    , or install straight from the URL:
                  </>
                )}
              </p>
              {item.premium ? null : <Code code={installUrl} />}
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
              copyText={files ? files[Math.min(fileIndex, files.length - 1)]?.content : undefined}
              aside={
                files && files.length > 1 ? (
                  <div className="flex max-w-[60%] gap-1 overflow-x-auto">
                    {files.map((f, i) => (
                      <button
                        key={f.savePath}
                        type="button"
                        onClick={() => setFileIndex(i)}
                        className={cn(
                          "h-7 shrink-0 rounded-full px-2.5 font-mono text-[11.5px] transition-colors",
                          i === fileIndex ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {f.savePath.split("/").pop()}
                      </button>
                    ))}
                  </div>
                ) : null
              }
            >
              {sourceState.status === "idle" || sourceState.status === "loading" ? (
                <p className="px-2 py-3 text-[13px] text-muted-foreground">Loading…</p>
              ) : sourceState.status === "locked" ? (
                <p className="px-2 py-3 text-[13px] text-muted-foreground">The source of this component comes with Pro.</p>
              ) : files && files.length ? (
                <>
                  <p className="px-2 pb-2 pt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    Copying by hand? Save this file as{" "}
                    <code className="font-mono text-foreground">{files[Math.min(fileIndex, files.length - 1)].savePath}</code>
                    {files.length > 1 ? `, and do the same for the other ${files.length - 1} ${files.length === 2 ? "file" : "files"}` : ""}. Run{" "}
                    <code className="font-mono text-foreground">npx shadcn@latest init -d</code> first so{" "}
                    <code className="font-mono text-foreground">@/lib/utils</code> exists.
                  </p>
                  <Code code={files[Math.min(fileIndex, files.length - 1)].content} />
                </>
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
                onClick={() => pickView(v)}
                className={cn(
                  "grid h-8 w-9 place-items-center rounded-full transition-colors",
                  view === v
                    ? "bg-white text-[#1d1d1f] shadow-sm"
                    : stageDark && view === "preview"
                      ? "text-white/70 hover:text-white"
                      : "text-[#1d1d1f]/55 hover:text-[#1d1d1f]",
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
                stageDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/80 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(23,23,28,0.06)] hover:bg-white",
              )}
            >
              <RotateCcw className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => prompt(promptText)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1d1d1f] px-4 text-[13.5px] font-semibold text-white transition-[width] dark:bg-white dark:text-[#1d1d1f]"
            >
              {promptDone ? <Check className="size-4" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
              <span aria-live="polite">{promptLabel}</span>
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
            {item.premium ? (
              <li>
                <ProBadge />
              </li>
            ) : (
              <li className="rounded-full bg-tint-mint px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] dark:text-[#7be3a6]">Free</li>
            )}
            {item.isNew ? (
              <li className="rounded-full bg-card px-2.5 py-1 text-[12px] font-semibold text-[#bf4800] shadow-[0_0_0_0.5px_var(--border)] dark:text-[#ff9f0a]">New</li>
            ) : null}
          </ul>

          {locked ? (
            <div className="mt-5 rounded-2xl bg-muted/60 p-4">
              <p className="text-[14px] font-semibold text-foreground">Preview only</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Tweaking, the code and the install for {item.name} come with Pro.
              </p>
              <button
                type="button"
                onClick={() => requestUpgrade(item.name)}
                className="mt-3 inline-flex h-9 items-center rounded-full bg-action px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-action-hover"
              >
                Upgrade to Pro
              </button>
            </div>
          ) : playground ? (
            <div className="mt-5 space-y-2">
              {playground.lightOnly ? null : (
                <div className="flex min-h-9 items-center justify-between gap-2">
                  <span className="text-[13px] text-foreground/75">Fill</span>
                  <Segmented label="Fill" options={["light", "dark"] as const} value={fill} onChange={setFill} />
                </div>
              )}
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
          {item.sound ? (
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-muted/60 p-4">
              <SoundSwitch variant="pill" />
              <p className="min-w-0 flex-1 basis-48 text-[13px] leading-snug text-muted-foreground">{item.sound}</p>
            </div>
          ) : null}
          {item.typing ? (
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-muted/60 p-4">
              <TypingSoundSwitch />
              <p className="min-w-0 flex-1 basis-48 text-[13px] leading-snug text-muted-foreground">{TYPING_NOTE}</p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 border-t border-border/70 p-4">
          <Link
            href={`/components/${item.slug}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-action text-[14px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Open full page
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
          <p className="-mt-0.5 px-2 text-center text-[12.5px] text-muted-foreground">Props, usage, install and docs for {item.name}</p>
          <button
            type="button"
            onClick={() => prompt(promptText)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground text-[14px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            {promptDone ? <Check className="size-4" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
            <span aria-live="polite">{promptLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => share(window.location.href)}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold transition-colors",
              shared
                ? "bg-tint-mint text-[#126b3a] dark:text-[#7be3a6]"
                : "bg-card text-foreground shadow-[0_0_0_1px_rgba(23,23,28,0.12)] hover:bg-muted",
            )}
          >
            {shared ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
            <span aria-live="polite">{shared ? "Link copied" : dirty ? "Share these settings" : "Share"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

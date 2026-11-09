"use client";

import { AfterCopyProLine } from "@/components/pro/after-copy-pro-line";
import { ProNudge, type ProPick } from "@/components/pro/pro-nudge";
import { AutoplaySound } from "@/lib/ui-sounds";
import * as React from "react";
import Link from "next/link";
import { API_KEY_ENV_VAR, REGISTRIES_PRO, envLocalLine, installCommand, registryAddCommand } from "@/lib/registry-config";
import { useRegistryFiles } from "@/components/library/use-registry-files";
import { ArrowUpRight, Check, ChevronRight, Code2, Copy, Download, Expand, File, Folder, Link2, Lock, LockOpen, Monitor, Plus, RotateCcw, Sparkles } from "lucide-react";
import { componentDescriptions } from "@/lib/catalog/component-descriptions";
import { DynamicPreview } from "@/components/library/dynamic-preview";
import { FitPreview } from "@/components/library/fit-preview";
import { PreviewShield } from "@/components/pro/preview-shield";
import {
  getComponentCategoryHref,
  getComponentCategoryLabel,
  type ComponentCategorySlug,
} from "@/lib/catalog/taxonomy";
import { getPlayground } from "@/lib/catalog/playgrounds";
import { LivePropsPlayground } from "@/components/library/props-playground";
import { CodeBlock } from "@/components/code-block/code-block";
import { GalleryTile, TileCell, TileGrid } from "@/components/gallery/gallery-tile";
import { TINT_CLASSES, type GalleryItem, type TileTint } from "@/components/gallery/types";
import { InstallCard } from "@/components/site/install-card";
import { SoundSwitch, TypingSoundSwitch } from "@/components/site/sound-switch";
import { TYPING_NOTE } from "@/lib/catalog/component-sounds";
import { ProBadge, ProLock, useCopyBuildPrompt, useProAccess } from "@/components/pro/pro-access";
import { RainbowWord } from "@/components/site/rainbow-word";
import { cn } from "@/lib/utils";
import { MemberStack } from "@/components/pricing/member-stack";
import { PropControl, cleanDefaultValue, getEditableProps, propValueToCode, type PropDoc } from "@/components/library/prop-controls";
import PROMPT_ASSETS from "@/lib/catalog/prompt-assets.json";

const DEMO_SLUGS = new Set([
  "background-boxes",
  "background-gradient",
  "cursor-text-reveal",
  "encrypted-text",
  "floating-dock",
  "glowing-effect-cards",
  "gooey-input",
  "image-trail",
  "infinite-moving-cards",
  "keyboard",
  "meteors",
  "signup-form",
  "sparkles",
  "squiggly-text",
  "stateful-button",
  "terminal",
  "text-generate-effect",
  "text-reveal-card",
  "typewriter-effect",
]);

function toPascalCase(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function getImportName(code: string, fallbackName: string) {
  // the component's own import (from "@/components/..."), not an icon or helper imported first
  const componentImport = code.match(/import\s*\{\s*([A-Za-z0-9_]+)[^}]*\}\s*from\s*["']@\/components\//);
  if (componentImport?.[1]) return componentImport[1];
  const defaultImport = code.match(/import\s+([A-Z][A-Za-z0-9_]*)\s+from\s*["']@\/components\//);
  if (defaultImport?.[1]) return defaultImport[1];
  return toPascalCase(fallbackName);
}

const INCLUDED_PROJECT_PACKAGES = new Set(["next", "react", "react-dom"]);

function getExtraLibraries(dependencies: string[]) {
  return Array.from(new Set(dependencies.filter((dependency) => !INCLUDED_PROJECT_PACKAGES.has(dependency))));
}

function formatFolderStructure(files: string[]) {
  const lines: string[] = [];
  let previousFolders: string[] = [];
  for (const file of [...files].sort()) {
    const parts = file.split("/").filter(Boolean);
    const folders = parts.slice(0, -1);
    folders.forEach((folder, index) => {
      if (previousFolders[index] !== folder) lines.push(`${"  ".repeat(index)}${folder}/`);
    });
    lines.push(`${"  ".repeat(folders.length)}${parts.at(-1)}`);
    previousFolders = folders;
  }
  return lines.join("\n");
}

function getFolderStructureRows(files: string[]) {
  const rows: Array<{ depth: number; label: string; type: "folder" | "file" }> = [];
  let previousFolders: string[] = [];
  for (const file of [...files].sort()) {
    const parts = file.split("/").filter(Boolean);
    const folders = parts.slice(0, -1);
    folders.forEach((folder, index) => {
      if (previousFolders[index] !== folder) rows.push({ depth: index, label: folder, type: "folder" });
    });
    const filename = parts.at(-1);
    if (filename) rows.push({ depth: folders.length, label: filename, type: "file" });
    previousFolders = folders;
  }
  return rows;
}

function getExampleImport(source: string | undefined, registryImport: string | undefined, registryName: string, name: string) {
  const componentImport = source?.match(/^import\s+[^;\n]+\s+from\s+["']@\/components\/[^"']+["'];?/m)?.[0];
  return componentImport ?? registryImport ?? `import { ${toPascalCase(name)} } from "@/components/${registryName}";`;
}

const INTERACTION_OF: Record<string, string> = {
  hover: "Hover",
  magnetic: "Hover",
  scroll: "Scroll",
  parallax: "Scroll",
  spring: "Spring",
  gradient: "Glow",
  "3d": "3D",
};

// ── small pieces ─────────────────────────────────────────────────────

function CopyBtn({ text, label = "Copy", dark = false, onCopied }: { text: string; label?: string; dark?: boolean; onCopied?: () => void }) {
  const [copied, setCopied] = React.useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
        onCopied?.();
      },
      () => {}, // blocked (insecure context / permission denied): leave the button as it was
    );
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors",
        dark ? "bg-white/10 text-white hover:bg-white/15" : "pg-glass bg-foreground text-background",
      )}
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

function CodeSnippet({ code, onCopied }: { code: string; onCopied?: () => void }) {
  return (
    <div className="relative mt-3 rounded-2xl bg-[#1d1d1f]">
      <pre tabIndex={0} className="overflow-auto p-4 pr-24 font-mono text-[12.5px] leading-relaxed text-[#e6e6ea]">{code}</pre>
      <div className="absolute right-3 top-3">
        <CopyBtn text={code} dark onCopied={onCopied} />
      </div>
    </div>
  );
}

function FolderTree({ files }: { files: string[] }) {
  const rows = getFolderStructureRows(files);
  return (
    <div className="relative mt-3 rounded-2xl bg-muted p-4 pr-24">
      <div className="space-y-1 font-mono text-[12.5px] leading-relaxed text-foreground">
        {rows.map((row, index) => (
          <div key={`${row.type}-${row.depth}-${row.label}-${index}`} className="flex items-center gap-2" style={{ paddingLeft: `${row.depth * 16}px` }}>
            {row.type === "folder" ? (
              <Folder className="size-3.5 shrink-0 text-rainbow-blue" aria-hidden />
            ) : (
              <File className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span>
              {row.label}
              {row.type === "folder" ? "/" : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute right-3 top-3">
        <CopyBtn text={formatFolderStructure(files)} />
      </div>
    </div>
  );
}

function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="pg-display scroll-mt-28 text-[clamp(32px,4.5vw,44px)] leading-[1.02] text-foreground">
      {children}
    </h2>
  );
}

// ── per-variant actions ─────────────────────────────────────────────

/** Copies this variant's own build prompt (free on free components, Pro on Pro ones), the same way the page-level button copies the whole brief. */
function VariantPromptButton({ slug, title, promptId, locked }: { slug: string; title: string; promptId: string; locked: boolean }) {
  const [state, copy] = useCopyBuildPrompt(slug, title, {
    endpoint: `/api/prompt/${encodeURIComponent(slug)}?variant=${encodeURIComponent(promptId)}`,
    hasAccess: !locked,
  });
  return (
    <button
      type="button"
      onClick={copy}
      disabled={state === "loading"}
      aria-label={`Copy the build prompt for ${title}`}
      className="pg-glass inline-flex h-9 items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-medium text-foreground disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {state === "copied" ? <Check className="size-3.5" aria-hidden /> : !locked ? <Sparkles className="size-3.5" aria-hidden /> : <Lock className="size-3.5" aria-hidden />}
      <span aria-live="polite">
        {state === "loading" ? "Copying…" : state === "copied" ? "Copied" : state === "error" ? "Try again" : "Prompt"}
      </span>
    </button>
  );
}

/** Copies a link that opens the page at this variant. */
function VariantLinkButton({ anchor, title }: { anchor: string; title: string }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${anchor}`);
          setCopied(true);
        } catch {
          // clipboard blocked: the address bar link still works
        }
      }}
      aria-label={`Copy a link to ${title}`}
      className="pg-glass inline-flex h-9 items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Link2 className="size-3.5" aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : "Link"}</span>
    </button>
  );
}

// ── stage: live preview / code, with replay and full screen ─────────

/**
 * A page with several variants must not run them all at once: the motion and sound of three demos
 * on top of each other spoil each one. The page keeps one variant "in focus", the one that is most
 * on screen (ties go to the one nearest the middle of the screen), and only that one plays. The
 * others stay empty until they are scrolled to, then start from the beginning.
 */
const VariantFocusContext = React.createContext<{
  register: (id: string, el: HTMLElement | null) => void;
  active: string | null;
} | null>(null);

function VariantFocusProvider({ children }: { children: React.ReactNode }) {
  const els = React.useRef(new Map<string, HTMLElement>());
  const [active, setActive] = React.useState<string | null>(null);
  const frame = React.useRef(0);

  const measure = React.useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const vh = window.innerHeight;
      let best: string | null = null;
      let bestVisible = 0;
      let bestDistance = Infinity;
      els.current.forEach((el, id) => {
        const r = el.getBoundingClientRect();
        const shown = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if (shown <= 0 || r.height <= 0) return;
        // Share of the variant that is on screen, but a tall variant that fills the screen counts as whole.
        const visible = Math.min(1, shown / Math.min(r.height, vh * 0.8));
        const distance = Math.abs(r.top + r.height / 2 - vh / 2);
        if (visible > bestVisible + 0.05 || (Math.abs(visible - bestVisible) <= 0.05 && distance < bestDistance)) {
          best = id;
          bestVisible = visible;
          bestDistance = distance;
        }
      });
      // Less than a fifth on screen is not being looked at.
      setActive(bestVisible >= 0.2 ? best : null);
    });
  }, []);

  React.useEffect(() => {
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const register = React.useCallback(
    (id: string, el: HTMLElement | null) => {
      if (el) els.current.set(id, el);
      else els.current.delete(id);
      measure();
    },
    [measure],
  );

  const value = React.useMemo(() => ({ register, active }), [register, active]);
  return <VariantFocusContext.Provider value={value}>{children}</VariantFocusContext.Provider>;
}

/**
 * Plays its preview only while it is the variant in focus (see VariantFocusProvider); a page with
 * one variant always plays. Only a preview that is mostly on screen may be heard, so scrolling past
 * a variant does not leave its sound running under the next one.
 */
function HeardWhenVisible({ children, variantId }: { children: React.ReactNode; variantId?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const focus = React.useContext(VariantFocusContext);
  const [height, setHeight] = React.useState(0);
  const inFocus = !focus || !variantId || focus.active === variantId;

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5), { threshold: [0, 0.5, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const register = focus?.register;
  React.useEffect(() => {
    const el = ref.current;
    if (!register || !variantId || !el) return;
    register(variantId, el);
    return () => register(variantId, null);
  }, [register, variantId]);

  // Remember how tall the preview was so the page does not jump when it is taken off the stage.
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !inFocus || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [inFocus]);

  return (
    <div ref={ref} className="flex w-full" style={inFocus ? undefined : { minHeight: height || 460 }}>
      {inFocus ? <AutoplaySound allow={visible}>{children}</AutoplaySound> : null}
    </div>
  );
}

function Stage({
  title,
  code,
  exportName,
  slug,
  tint,
  locked,
  name,
  variant,
}: {
  title: string;
  code: string;
  exportName: string;
  slug: string;
  tint: TileTint;
  locked: boolean;
  name: string;
  /** Set on pages with several variants: this variant's place on the page and whether it has its own brief. */
  variant?: { index: number; anchor: string; promptId: string | null };
}) {
  const [view, setView] = React.useState<"preview" | "code">("preview");
  const { requestUpgrade } = useProAccess();
  const [run, setRun] = React.useState(0);

  return (
    <div className={cn("rounded-tile p-3", TINT_CLASSES[tint])}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3">
        <div role="tablist" aria-label={`${title} view`} className="flex gap-1 rounded-full bg-card/80 p-1">
          {(["preview", "code"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => (v === "code" && locked ? requestUpgrade(name) : setView(v))}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                view === v ? "bg-foreground text-background" : "text-foreground hover:bg-muted",
              )}
            >
              {v === "preview" ? (
                <Monitor className="size-3.5" aria-hidden />
              ) : locked ? (
                <Lock className="size-3.5" aria-hidden />
              ) : (
                <Code2 className="size-3.5" aria-hidden />
              )}
              {v === "preview" ? "Preview" : "Usage"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {variant?.promptId ? <VariantPromptButton slug={slug} title={title} promptId={variant.promptId} locked={locked} /> : null}
          {variant ? <VariantLinkButton anchor={variant.anchor} title={title} /> : null}
          {view === "preview" ? (
            <button
              type="button"
              onClick={() => setRun((n) => n + 1)}
              className="pg-glass inline-flex h-9 items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-medium text-foreground"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Replay
            </button>
          ) : null}
          {locked ? (
            <button
              type="button"
              onClick={() => requestUpgrade(name, "full-screen preview")}
              aria-label="Full-screen preview is part of Pro"
              className="pg-glass relative grid size-9 place-items-center rounded-full bg-card text-foreground"
            >
              <Expand className="size-4" aria-hidden />
              {/* Same arrows as the unlocked button, with a small lock on its corner to mark it Pro */}
              <span
                aria-hidden
                className="absolute -right-1 -top-1 grid size-[17px] place-items-center rounded-full bg-foreground text-background ring-2 ring-card"
              >
                <Lock className="size-[9px]" strokeWidth={3} />
              </span>
            </button>
          ) : (
            <Link
              href={`/live-preview/${slug}${variant ? `?v=${variant.index}` : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open full-screen preview in a new tab"
              className="pg-glass grid size-9 place-items-center rounded-full bg-card text-foreground"
            >
              <Expand className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>

      {view === "preview" ? (
        <div className="flex min-h-[460px] overflow-hidden rounded-[20px] bg-card">
          <PreviewShield active={locked} className="flex w-full">
            <HeardWhenVisible variantId={variant?.anchor}>
              <FitPreview key={run}>
                <DynamicPreview exportName={exportName} compact={false} />
              </FitPreview>
            </HeardWhenVisible>
          </PreviewShield>
        </div>
      ) : (
        <div className="h-[560px] overflow-hidden rounded-[20px]">
          <CodeBlock
            code={code}
            language="tsx"
            theme="dark"
            header={{
              enabled: true,
              showDots: true,
              title: "Usage example",
              copy: { enabled: true, label: "Copy code", copiedLabel: "Copied", copiedDurationMs: 1400 },
            }}
            codeArea={{ showLineNumbers: true, wrap: false, padding: 18 }}
            border={{ radius: "20px" }}
          />
        </div>
      )}
      {view === "code" ? (
        <p className="px-2 pt-3 text-[13px] leading-relaxed text-muted-foreground">
          A complete page you can paste into <code className="rounded bg-muted px-1 py-0.5 text-[12px]">src/app/page.tsx</code>{" "}
          once {name} is installed. It is not the component&apos;s own code. To get the component, use the command under{" "}
          <a href="#setup-heading" className="font-medium text-foreground underline underline-offset-4">
            Add it to your project
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}

// ── build prompt (free on free components, Pro on Pro ones) ──────────────────────────────────────────────

type PromptAsset = { label: string; href: string; filename: string; size: string; credit: string; save: string };
const ASSETS = PROMPT_ASSETS as Record<string, PromptAsset[]>;

function BuildPromptCard({ slug, name, locked, free }: { slug: string; name: string; locked: boolean; free: boolean }) {
  const [state, copy] = useCopyBuildPrompt(slug, name, { hasAccess: !locked, free });
  const assets = locked ? [] : (ASSETS[slug] ?? []);
  return (
    <div className="mt-6 rounded-[18px] bg-foreground/[0.04] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-semibold text-foreground">Build prompt</p>
        {locked ? <ProBadge /> : null}
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
        The exact brief to rebuild {name} from scratch with Claude, Cursor or v0: layout, colours, motion values and states.
      </p>
      <button
        type="button"
        onClick={copy}
        disabled={state === "loading"}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[14px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {state === "copied" ? <Check className="size-4" aria-hidden /> : !locked ? <Sparkles className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
        <span aria-live="polite">
          {state === "loading"
            ? "Copying…"
            : state === "copied"
              ? "Copied — paste it into your agent"
              : state === "error"
                ? "Couldn't copy, try again"
                : !locked
                  ? "Copy build prompt"
                  : "Copy build prompt with Pro"}
        </span>
      </button>
      {assets.map((a) => (
        <div key={a.href} className="mt-3">
          <a
            href={a.href}
            download={a.filename}
            aria-label={`Download the ${a.label}, mp3, ${a.size}`}
            className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-background text-[14px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Download className="size-4" aria-hidden />
            Download the track ({a.size})
          </a>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
            The prompt tells your agent to save it as <code className="font-mono text-[11.5px]">{a.save}</code>; the burst is timed to it. {a.credit}.
          </p>
        </div>
      ))}
    </div>
  );
}

// ── install panel ───────────────────────────────────────────────────

function InstallPanel({
  slug,
  registryCliName,
  dependencies,
  interactions,
  locked,
  premium,
  name,
  hasPrompt,
  hasSound,
}: {
  slug: string;
  registryCliName?: string;
  dependencies: string[];
  interactions: string[];
  locked: boolean;
  /** This component is Pro (and, past the locked branch, the visitor has it). */
  premium: boolean;
  name: string;
  hasPrompt: boolean;
  hasSound: boolean;
}) {
  const command = installCommand(registryCliName ?? slug);
  const extra = getExtraLibraries(dependencies);
  const { requestUpgrade } = useProAccess();

  if (locked) {
    return (
      <aside className="pg-float self-start rounded-tile bg-card p-6 lg:sticky lg:top-24">
        <ProBadge />
        <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.4px] text-foreground">Unlock {name}</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
          Preview it as much as you like. The source, the one-line install and the playground come with Pro.
        </p>
        <button
          type="button"
          onClick={() => requestUpgrade(name)}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-action text-[15px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Lock className="size-4" aria-hidden />
          Upgrade to Pro
        </button>
        <Link
          href="/pricing"
          className="mt-2 inline-flex h-9 w-full items-center justify-center text-[14px] font-medium text-link hover:underline hover:underline-offset-4"
        >
          See what Pro includes
        </Link>
        <MemberStack className="mt-3" />
        {hasPrompt ? <BuildPromptCard slug={slug} name={name} locked={locked} free={!premium} /> : null}
        {interactions.length ? (
          <div className="mt-6">
            <p className="text-[13px] font-medium text-foreground">How it moves</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {interactions.map((i) => (
                <li key={i} className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-foreground">
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
    );
  }

  return (
    <aside className="pg-float self-start rounded-tile bg-card p-6 lg:sticky lg:top-24">
      <h2 className="text-[19px] font-semibold tracking-[-0.4px] text-foreground">Install</h2>
      <p className="mt-1 text-[14px] text-muted-foreground">One command adds the component and its dependencies, once your project is set up.</p>
      <InstallCard wrap command={command} className="mt-4" upsell />

      {premium ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[#34c759]/12 p-3.5 text-[13.5px] leading-relaxed text-foreground">
          <LockOpen className="mt-0.5 size-4 shrink-0 text-[#248a3d] dark:text-[#30d158]" aria-hidden />
          <p>
            <span className="font-semibold">{name} is unlocked.</span> The command needs your API key, saved once per project.{" "}
            <a href="#setup-heading" className="font-medium text-link underline-offset-4 hover:underline">
              See the steps
            </a>
          </p>
        </div>
      ) : null}

      {hasSound ? (
        <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
          Makes sound. The sound engine (<code className="font-mono text-[12px]">lib/ui-sounds.ts</code>) installs with it, there are no audio files, and{" "}
          <code className="font-mono text-[12px]">enableSound={"{false}"}</code> silences it.
        </p>
      ) : null}

      {extra.length ? (
        <div className="mt-6">
          <p className="text-[13px] font-medium text-foreground">Copying by hand? Install these first:</p>
          <InstallCard wrap command={`npm install ${extra.join(" ")}`} className="mt-2 shadow-none ring-1 ring-border" />
        </div>
      ) : null}

      {hasPrompt ? <BuildPromptCard slug={slug} name={name} locked={locked} free={!premium} /> : null}

      {interactions.length ? (
        <div className="mt-6">
          <p className="text-[13px] font-medium text-foreground">How it moves</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {interactions.map((i) => (
              <li key={i} className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-foreground">
                {i}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {DEMO_SLUGS.has(slug) ? (
        <Link
          href={`/demos/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground"
        >
          Open the full-page demo
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      ) : null}
    </aside>
  );
}

// ── props playground: set the props, copy matching JSX ──────────────

function PropsPlayground({ props, importName }: { props?: PropDoc[]; importName: string }) {
  const editableProps = React.useMemo(() => getEditableProps(props), [props]);
  const defaults = React.useMemo(
    () => Object.fromEntries(editableProps.map((prop) => [prop.name, cleanDefaultValue(prop)])) as Record<string, unknown>,
    [editableProps],
  );
  const [values, setValues] = React.useState<Record<string, unknown>>(() => defaults);

  const usageCode = React.useMemo(() => {
    if (!editableProps.length) return "";
    const lines = editableProps.map((prop) => `  ${prop.name}=${propValueToCode(values[prop.name] ?? cleanDefaultValue(prop), prop)}`);
    return `<${importName}\n${lines.join("\n")}\n/>`;
  }, [editableProps, importName, values]);

  if (!editableProps.length) return null;

  return (
    <section aria-labelledby="playground-heading" className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionTitle id="playground-heading">Set it up, copy the code</SectionTitle>
          <p className="mt-3 max-w-[560px] text-[17px] text-muted-foreground">
            Choose values for the main props and the JSX on the right updates to match.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setValues(defaults)}
          className="pg-glass inline-flex h-10 items-center gap-1.5 rounded-full bg-card px-4 text-[13.5px] font-medium text-foreground"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </button>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="grid gap-3 sm:grid-cols-2">
          {editableProps.map((prop) => (
            <PropControl
              key={prop.name}
              prop={prop}
              value={values[prop.name] ?? cleanDefaultValue(prop)}
              onChange={(value) => setValues((current) => ({ ...current, [prop.name]: value }))}
            />
          ))}
        </div>
        <div className="flex flex-col overflow-hidden rounded-tile bg-[#1d1d1f] text-[#e6e6ea] lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
            <p className="text-[13px] font-medium text-white">Your JSX</p>
            <CopyBtn text={usageCode} dark />
          </div>
          <pre tabIndex={0} className="max-h-[380px] overflow-auto p-5 font-mono text-[12.5px] leading-6">{usageCode}</pre>
        </div>
      </div>
    </section>
  );
}

// ── props table ─────────────────────────────────────────────────────

function PropsTable({ props }: { props?: PropDoc[] }) {
  if (!props?.length) return null;
  return (
    <section aria-labelledby="props-heading" className="mt-20">
      <SectionTitle id="props-heading">Props</SectionTitle>
      <div className="pg-float mt-8 overflow-x-auto rounded-tile bg-card">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-border text-[13px] text-muted-foreground">
              <th className="px-6 py-3.5 font-medium">Prop</th>
              <th className="px-6 py-3.5 font-medium">Type</th>
              <th className="px-6 py-3.5 font-medium">Default</th>
              <th className="px-6 py-3.5 font-medium">What it does</th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr key={p.name} className="border-b border-border last:border-0">
                <td className="px-6 py-3.5 font-mono text-[13px] font-semibold text-foreground">{p.name}</td>
                <td className="px-6 py-3.5 font-mono text-[12.5px] text-link">{p.type}</td>
                <td className="px-6 py-3.5 font-mono text-[12.5px] text-muted-foreground">{p.defaultValue ?? "—"}</td>
                <td className="px-6 py-3.5 text-body">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── step-by-step setup ──────────────────────────────────────────────

function HandSource({ item, name }: { item: string; name: string }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const state = useRegistryFiles(item, open);
  const files = state.status === "ready" ? state.files : [];
  const file = files[Math.min(index, Math.max(files.length - 1, 0))];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Code2 className="size-4" aria-hidden />
        Show the source files
      </button>
    );
  }
  if (state.status === "idle" || state.status === "loading") return <p className="mt-3 text-[14px]">Loading the files…</p>;
  if (state.status === "locked")
    return <p className="mt-3 text-[14px]">The source of {name} is part of Pro. Sign in with a Pro plan to see it.</p>;
  if (state.status === "error" || !file)
    return <p className="mt-3 text-[14px]">The files could not be loaded. Reload the page, or install with the command above.</p>;

  return (
    <div className="mt-3">
      <p className="text-[14px]">
        {files.length} {files.length === 1 ? "file" : "files"}. For each tab, create the file at the path shown and paste the code. Create the folders if
        they do not exist yet.
      </p>
      <div role="tablist" aria-label="Files to copy" className="mt-3 flex flex-wrap gap-1.5">
        {files.map((f, i) => (
          <button
            key={f.savePath}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "h-8 rounded-full px-3 font-mono text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              i === index ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-muted/70",
            )}
          >
            {f.savePath.split("/").pop()}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[13px]">
        Save as <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[12.5px] text-foreground">{file.savePath}</code>
        {file.from !== item ? " (a helper this component imports)" : ""}
      </p>
      <div className="relative mt-2 rounded-2xl bg-[#1d1d1f]">
        <pre tabIndex={0} className="max-h-[420px] overflow-auto p-4 pr-24 font-mono text-[12.5px] leading-relaxed text-[#e6e6ea]">
          {file.content}
        </pre>
        <div className="absolute right-3 top-3">
          <CopyBtn text={file.content} dark />
        </div>
      </div>
    </div>
  );
}

/** The first steps (one-time project setup and the API key) are the same for every component, so they stay readable for everyone. */
const OPEN_STEPS = 2;

function SetupStep({ index, title, children }: { index: number; title: string; children: React.ReactNode }) {
  return (
    <li className="pg-float grid gap-4 rounded-tile bg-card p-6 sm:grid-cols-[48px_minmax(0,1fr)]">
      <span className="pg-display text-[32px] text-foreground">{index + 1}</span>
      <div className="min-w-0 text-[15px] leading-relaxed text-muted-foreground">
        <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.4px] text-foreground">{title}</h3>
        {children}
      </div>
    </li>
  );
}

/** Stand-in for a step's commands and code while the install steps are locked: grey bars, no real text. */
function RedactedStep() {
  return (
    <div aria-hidden className="grid gap-2.5 pt-1">
      <span className="h-3 w-[88%] rounded-full bg-muted" />
      <span className="h-3 w-[64%] rounded-full bg-muted" />
      <span className="mt-1 block h-11 w-full rounded-xl bg-muted/70" />
    </div>
  );
}

function Setup({
  name,
  slug,
  registryCliName,
  dependencies,
  installedFiles,
  registryImport,
  usageSource,
  premium,
  locked = false,
  teaser,
}: {
  name: string;
  slug: string;
  registryCliName?: string;
  dependencies: string[];
  installedFiles: string[];
  registryImport?: string;
  usageSource?: string;
  premium: boolean;
  /** Visitor has no access: steps after the first two show their titles but not their commands, files or code. */
  locked?: boolean;
  /** Shown above the locked steps: how the component works, in the author's own words. */
  teaser?: string;
}) {
  const [installCopied, setInstallCopied] = React.useState(false);
  const registryName = registryCliName ?? slug;
  const extra = getExtraLibraries(dependencies);
  const exampleImport = getExampleImport(usageSource, registryImport, registryName, name);
  const example = `// src/app/page.tsx\n${exampleImport}\n\nexport default function Page() {\n  return (\n    <main>\n      <${getImportName(exampleImport, name)} />\n    </main>\n  );\n}`;
  const inline = "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground";

  const steps: { title: string; body: React.ReactNode }[] = [
    {
      title: "Set up your project once",
      body: (
        <>
          <p>
            You need a Next.js project with Tailwind CSS and the <code className={inline}>@/</code> import alias. In its root folder, run this once. It creates{" "}
            <code className={inline}>components.json</code> and the <code className={inline}>cn()</code> helper in <code className={inline}>src/lib/utils.ts</code>:
          </p>
          <CodeSnippet code="npx shadcn@latest init -d" />
          <p className="mt-3">
            Starting from nothing? The{" "}
            <Link href="/docs/installation" className="font-medium text-link underline-offset-4 hover:underline">
              Quick Start
            </Link>{" "}
            walks through the whole thing.
          </p>
        </>
      ),
    },
    premium
      ? {
          title: "Connect the registry with your API key",
          body: (
            <>
              <p>
                {name} is a Pro item, so the CLI has to send your API key. Do this once per project:
              </p>
              <ol className="mt-3 list-decimal space-y-3 pl-5 marker:font-semibold marker:text-foreground">
                <li>
                  Create a key at{" "}
                  <Link href="/dashboard/api-key" className="font-medium text-link underline-offset-4 hover:underline">
                    nexus-ui.com/dashboard/api-key
                  </Link>
                  . Copy it straight away: it starts with <code className={inline}>nxs_</code> and is shown only once.
                </li>
                <li>
                  In your project root, next to <code className={inline}>package.json</code>, create a file named <code className={inline}>.env.local</code> with this
                  line, using your own key:
                  <CodeSnippet code={envLocalLine()} />
                </li>
                <li>
                  Open <code className={inline}>components.json</code> and add this entry inside the outermost braces, next to <code className={inline}>&quot;aliases&quot;</code>.
                  Leave <code className={inline}>{"{name}"}</code> and <code className={inline}>{"${" + API_KEY_ENV_VAR + "}"}</code> exactly as written; the CLI fills them in:
                  <CodeSnippet code={REGISTRIES_PRO} />
                </li>
              </ol>
            </>
          ),
        }
      : {
          title: "Connect the registry",
          body: (
            <>
              <p>
                Run this once per project. It writes the Nexus UI entry into <code className={inline}>components.json</code> for you:
              </p>
              <CodeSnippet code={registryAddCommand()} />
              <p className="mt-3">
                Type it exactly as shown. <code className={inline}>{"{name}"}</code> is filled in by the CLI with the component you ask for, so you never replace it.
              </p>
            </>
          ),
        },
    {
      title: "Add the component",
      body: (
        <>
          <p>Run this from your project root. It adds the component, the helpers it imports and its npm packages.</p>
          <CodeSnippet code={installCommand(registryName)} onCopied={() => setInstallCopied(true)} />
          {premium ? null : <AfterCopyProLine slug={slug} copied={installCopied} />}
        </>
      ),
    },
    {
      title: "Check what was added",
      body: (
        <>
          <p>With a project made as in the Quick Start (a <code className={inline}>src/</code> folder), these files land in it:</p>
          <FolderTree files={installedFiles} />
        </>
      ),
    },
    {
      title: "Copying by hand? Skip the registry",
      body: (
        <>
          <p>
            Instead of steps 2 and 3 you can copy the files yourself, with no registry and no API key. Step 1 still applies, so that{" "}
            <code className={inline}>cn()</code> exists. Install the packages:
          </p>
          <CodeSnippet code={`npm install ${extra.length ? extra.join(" ") : "framer-motion"}`} />
          <p className="mt-3">Then show the source and create each file at the path it gives:</p>
          <HandSource item={registryName} name={name} />
        </>
      ),
    },
    {
      title: "Use it in a page",
      body: (
        <>
          <p>
            Installing only adds the files. Import the component in a page and render it. The <span className="font-medium text-foreground">Usage</span> tab on the
            preview shows a fuller example with props:
          </p>
          <CodeSnippet code={example} />
        </>
      ),
    },
  ];

  return (
    <section aria-labelledby="setup-heading" className="mt-20">
      <SectionTitle id="setup-heading">Add it to your project</SectionTitle>
      <ol className="mt-8 grid gap-4">
        {steps.slice(0, OPEN_STEPS).map((s, i) => (
          <SetupStep key={s.title} index={i} title={s.title}>
            {s.body}
          </SetupStep>
        ))}
      </ol>
      {locked && teaser ? (
        <div className="pg-float mt-4 rounded-tile bg-tint-sky/70 p-6 sm:p-7">
          <h3 className="text-[19px] font-semibold tracking-[-0.4px] text-foreground">How {name} works</h3>
          <p className="mt-2 max-w-[680px] text-[15.5px] leading-[1.6] text-body">{teaser}</p>
          <p className="mt-3 text-[13.5px] text-muted-foreground">The source, the install command and the build prompt come with Pro.</p>
        </div>
      ) : null}
      {steps.length > OPEN_STEPS ? (
        <ProLock locked={locked} name={name} label="Install it with Pro" className="mt-4 rounded-tile" followScroll>
          <ol className="grid gap-4">
            {steps.slice(OPEN_STEPS).map((s, i) => (
              <SetupStep key={s.title} index={OPEN_STEPS + i} title={s.title}>
                {locked ? <RedactedStep /> : s.body}
              </SetupStep>
            ))}
          </ol>
        </ProLock>
      ) : null}
    </section>
  );
}

function About({ slug, name }: { slug: string; name: string }) {
  const desc = componentDescriptions[slug];
  if (!desc) return null;
  return (
    <section aria-labelledby="about-heading" className="mt-20 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <SectionTitle id="about-heading">About {name}</SectionTitle>
      <div>
        <p className="text-[17px] leading-relaxed text-body">{desc.about}</p>
        <h3 className="mt-8 text-[15px] font-semibold text-foreground">Good for</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {desc.useCases.map((uc) => (
            <li key={uc} className="rounded-full bg-card px-3.5 py-1.5 text-[14px] text-foreground ring-1 ring-border">
              {uc}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq({ name, items }: { name: string; items: { q: string; a: string }[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="mt-20 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <SectionTitle id="faq-heading">{name} questions</SectionTitle>
      <div className="border-t border-border">
        {items.map((f) => (
          <details key={f.q} className="group border-b border-border">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 py-4 text-[17px] font-semibold tracking-[-0.3px] text-foreground [&::-webkit-details-marker]:hidden">
              <h3 className="text-[17px] font-semibold">{f.q}</h3>
              <Plus
                className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                aria-hidden
              />
            </summary>
            <p className="max-w-[620px] pb-5 text-[15.5px] leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Guides({ items }: { items: { slug: string; title: string }[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="guides-heading" className="mt-20 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <SectionTitle id="guides-heading">Guides</SectionTitle>
      <ul className="border-t border-border">
        {items.map((g) => (
          <li key={g.slug} className="border-b border-border">
            <Link
              href={`/blog/${g.slug}`}
              className="group flex min-h-12 items-center justify-between gap-6 py-4 text-[17px] font-semibold tracking-[-0.3px] text-foreground hover:text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {g.title}
              <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── page ────────────────────────────────────────────────────────────

type SerializedSection = {
  title?: string;
  reactSource: string;
  previewExportName: string;
};

type ComponentDetailProps = {
  slug: string;
  isPremium?: boolean;
  name: string;
  description: string;
  categorySlug: string;
  animationKinds: string[];
  tags: string[];
  premium: boolean;
  registryCliName?: string;
  dependencies: string[];
  installedFiles: string[];
  registryImport?: string;
  reactSource?: string;
  props?: PropDoc[];
  previewExportName: string;
  serializedPreviewSections?: SerializedSection[];
  /** Tile tint from the gallery, so the stage matches the tile people clicked. */
  tint?: TileTint;
  /** Other components from the same category, as gallery items. */
  related?: GalleryItem[];
  /** Pro component and this visitor has no access: the server sent no code, the UI offers Pro. */
  locked?: boolean;
  /** Has a build prompt (Pro feature, fetched from the gated API on copy). */
  hasPrompt?: boolean;
  /** For each variant, the id of its own build prompt or null (ids only, never the text). */
  variantPrompts?: (string | null)[];
  /** What you hear, when the component makes interface sound. */
  sound?: string;
  /** The component types text: shows the typing sound switch. */
  typing?: boolean;
  /** Questions and answers about this component (also sent as FAQPage structured data). */
  faq?: { q: string; a: string }[];
  /** Blog guides that use this component. */
  guides?: { slug: string; title: string }[];
  /** A few Pro components from the same category, named in the upgrade card on free pages. */
  proPicks?: ProPick[];
  /** Locked Pro pages only: the plain-English note from the top of the source. */
  teaser?: string;
};

/** Anchor id for one variant section, so the jump bar and shared links can land on it. */
function variantId(title: string) {
  return `variant-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function ComponentDetailPageClient({
  slug,
  name,
  description,
  categorySlug,
  animationKinds,
  registryCliName,
  dependencies,
  installedFiles,
  registryImport,
  reactSource,
  props,
  previewExportName,
  serializedPreviewSections,
  tint = "violet",
  related = [],
  premium,
  locked = false,
  hasPrompt = false,
  sound,
  typing = false,
  variantPrompts = [],
  faq = [],
  guides = [],
  proPicks = [],
  teaser,
}: ComponentDetailProps) {
  const usageSource = serializedPreviewSections?.[0]?.reactSource ?? reactSource;
  const categoryLabel = getComponentCategoryLabel(categorySlug as ComponentCategorySlug);
  const interactions = [...new Set(animationKinds.map((k) => INTERACTION_OF[k]).filter(Boolean))];
  const [firstWord, ...rest] = name.split(" ");
  const sections = serializedPreviewSections?.length
    ? serializedPreviewSections.map((s, i) => ({
        title: s.title ?? (serializedPreviewSections.length > 1 ? `${name}, variant ${i + 1}` : name),
        code: s.reactSource,
        exportName: s.previewExportName,
      }))
    : [{ title: name, code: reactSource ?? "", exportName: previewExportName }];
  const importName = getImportName(sections[0].code, name);
  // the curated live playgrounds (12 components) replace the generic prop picker
  const livePlayground = getPlayground(slug);

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[128px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <Link href="/components" className="hover:text-foreground">
              Components
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href={getComponentCategoryHref(categorySlug as ComponentCategorySlug)} className="hover:text-foreground">
              {categoryLabel}
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span aria-current="page" className="font-medium text-foreground">
              {name}
            </span>
          </nav>
          <h1 className="pg-display mt-6 text-[clamp(44px,8vw,80px)] text-foreground">
            {/^[A-Za-z]{3,}$/.test(firstWord) ? <RainbowWord>{firstWord}</RainbowWord> : firstWord}
            {rest.length ? ` ${rest.join(" ")}` : ""}
            <span className="sr-only">, animated React component</span>
          </h1>
          <p className="mt-5 max-w-[680px] text-[19px] leading-[1.55] text-muted-foreground">{description}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="About this component">
            {premium ? (
              <li>
                <ProBadge className="px-3 text-[13px]" />
              </li>
            ) : (
              <li className="rounded-full bg-tint-mint px-3 py-1 text-[13px] font-semibold text-[#126b3a] dark:text-[#7be3a6]">Free</li>
            )}
            <li className="pg-glass rounded-full bg-card px-3 py-1 text-[13px] font-medium text-foreground">{categoryLabel}</li>
            {interactions.map((i) => (
              <li key={i} className="pg-glass rounded-full bg-card px-3 py-1 text-[13px] font-medium text-foreground">
                {i}
              </li>
            ))}
          </ul>
          {sound ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <SoundSwitch variant="pill" />
              <p className="max-w-[560px] text-[13.5px] leading-snug text-muted-foreground">
                {sound} Sound is off on this site until you switch it on.
              </p>
            </div>
          ) : null}
          {typing ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <TypingSoundSwitch />
              <p className="max-w-[560px] text-[13.5px] leading-snug text-muted-foreground">{TYPING_NOTE}</p>
            </div>
          ) : null}
          <nav aria-label="On this page" className="mt-5 flex flex-wrap items-center gap-2 text-[13.5px]">
            <span className="mr-1 text-muted-foreground">On this page</span>
            {[
              { href: "#preview", label: "Preview and install", show: true },
              { href: livePlayground ? "#playground-heading" : "#props-heading", label: livePlayground ? "Play with it" : "Props", show: !!livePlayground || !!props?.length },
              { href: "#setup-heading", label: "Add to your project", show: true },
              { href: "#faq-heading", label: "Questions", show: faq.length > 0 },
            ]
              .filter((l) => l.show)
              .map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="pg-glass rounded-full bg-card px-3 py-1 font-medium text-foreground transition-colors hover:bg-card/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {l.label}
                </a>
              ))}
          </nav>
        </div>
      </section>

      <div className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <div id="preview" className="grid scroll-mt-28 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid min-w-0 gap-10">
              {sections.length > 1 ? (
                <nav aria-label="Variants of this component" className="-mb-4 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[13px] font-semibold text-muted-foreground">{sections.length} variants</span>
                  {sections.map((s) => (
                    <a
                      key={s.title}
                      href={`#${variantId(s.title)}`}
                      className="pg-glass rounded-full bg-card px-3 py-1 text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              ) : null}
              <VariantFocusProvider>
              {sections.map((s, i) => (
                <div key={s.title} id={variantId(s.title)} className="scroll-mt-24">
                  {sections.length > 1 ? <h2 className="mb-3 text-[19px] font-semibold tracking-[-0.4px] text-foreground">{s.title}</h2> : null}
                  <Stage
                    title={s.title}
                    code={s.code}
                    exportName={s.exportName}
                    slug={slug}
                    tint={tint}
                    locked={locked}
                    name={name}
                    variant={
                      sections.length > 1
                        ? { index: i, anchor: variantId(s.title), promptId: variantPrompts[i] ?? null }
                        : undefined
                    }
                  />
                </div>
              ))}
              </VariantFocusProvider>
            </div>
            <InstallPanel
              slug={slug}
              registryCliName={registryCliName}
              dependencies={dependencies}
              interactions={interactions}
              locked={locked}
              premium={premium}
              name={name}
              hasPrompt={hasPrompt}
              hasSound={!!sound}
            />
          </div>

          {!premium ? <ProNudge slug={slug} name={name} picks={proPicks} placement="top" /> : null}

          {livePlayground ? (
            <section aria-labelledby="playground-heading" className="mt-20">
              <SectionTitle id="playground-heading">Play with it</SectionTitle>
              <p className="mb-6 mt-3 max-w-[560px] text-[17px] text-muted-foreground">
                {livePlayground.blurb ?? "Move the controls and watch it change. Copy code gives you a snippet with only the props you changed."}
              </p>
              <LivePropsPlayground playground={livePlayground} name={name} description={description} locked={locked} />
            </section>
          ) : (
            <ProLock locked={locked} name={name} label="Edit it with Pro">
              <PropsPlayground key={`${slug}-${importName}`} props={props} importName={importName} />
            </ProLock>
          )}
          <PropsTable props={props} />
          <Setup
            name={name}
            slug={slug}
            registryCliName={registryCliName}
            dependencies={dependencies}
            installedFiles={installedFiles}
            registryImport={registryImport}
            usageSource={usageSource}
            premium={premium}
            locked={locked}
            teaser={teaser}
          />
          {!premium ? <ProNudge slug={slug} name={name} picks={proPicks} /> : null}
          <About slug={slug} name={name} />
          <Faq name={name} items={faq} />
          <Guides items={guides} />

          {related.length ? (
            <section aria-labelledby="related-heading" className="mt-20">
              <SectionTitle id="related-heading">More {categoryLabel.toLowerCase()}</SectionTitle>
              <TileGrid className="mt-8">
                {related.map((item) => (
                  <TileCell key={item.slug} item={item}>
                    <GalleryTile item={item} />
                  </TileCell>
                ))}
              </TileGrid>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}


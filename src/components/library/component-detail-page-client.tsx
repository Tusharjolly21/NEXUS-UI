"use client";

import * as React from "react";
import Link from "next/link";
import { SHADCN_REGISTRY_SCOPE, shadcnRegistryUrl } from "@/lib/registry-scope";
import { ArrowUpRight, Check, ChevronRight, Code2, Copy, Expand, File, Folder, Lock, Monitor, RotateCcw, Sparkles } from "lucide-react";
import { componentDescriptions } from "@/lib/catalog/component-descriptions";
import { DynamicPreview } from "@/components/library/dynamic-preview";
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
import { ProBadge, ProLock, useCopyBuildPrompt, useProAccess } from "@/components/pro/pro-access";
import { RainbowWord } from "@/components/site/rainbow-word";
import { cn } from "@/lib/utils";

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

const PROP_CONTROL_LIMIT = 8;

type PropDoc = {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
};

function getEditableProps(props: PropDoc[] = []) {
  return props
    .filter((prop) => {
      const type = prop.type.toLowerCase();
      if (/^on[A-Z]/.test(prop.name)) return false;
      if (["className", "style", "children"].includes(prop.name) || /ClassName$/.test(prop.name)) return false;
      if (type.includes("reactnode") || type.includes("=>")) return false;
      if (type.includes("[]") || type.includes("array") || type.includes("object") || type.includes("partial<")) {
        return false;
      }
      return isBooleanProp(prop) || isNumberProp(prop) || isUnionProp(prop) || isStringProp(prop);
    })
    .slice(0, PROP_CONTROL_LIMIT);
}

function isBooleanProp(prop: PropDoc) {
  return prop.type === "boolean";
}

function isNumberProp(prop: PropDoc) {
  return prop.type === "number";
}

function isStringProp(prop: PropDoc) {
  return prop.type === "string" || prop.type === "string | undefined";
}

function isUnionProp(prop: PropDoc) {
  return /"[^"]+"/.test(prop.type) && prop.type.includes("|");
}

function unionOptions(type: string) {
  return [...type.matchAll(/"([^"]+)"/g)].map((match) => match[1]).slice(0, 6);
}

function cleanDefaultValue(prop: PropDoc) {
  if (!prop.defaultValue) {
    if (isBooleanProp(prop)) return false;
    if (isNumberProp(prop)) return 0;
    const option = unionOptions(prop.type)[0];
    return option ?? "";
  }

  const value = prop.defaultValue.trim();
  if (isBooleanProp(prop)) return value === "true";
  if (isNumberProp(prop)) return Number.parseFloat(value) || 0;
  const quoted = value.match(/^"([\s\S]*)"$/);
  return quoted?.[1] ?? value;
}

function propValueToCode(value: unknown, prop: PropDoc) {
  if (isBooleanProp(prop)) return value ? `{true}` : `{false}`;
  if (isNumberProp(prop)) return `{${Number(value)}}`;
  return JSON.stringify(String(value));
}

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

function CopyBtn({ text, label = "Copy", dark = false }: { text: string; label?: string; dark?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
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

function CodeSnippet({ code }: { code: string }) {
  return (
    <div className="relative mt-3 rounded-2xl bg-[#1d1d1f]">
      <pre className="overflow-auto p-4 pr-24 font-mono text-[12.5px] leading-relaxed text-[#e6e6ea]">{code}</pre>
      <div className="absolute right-3 top-3">
        <CopyBtn text={code} dark />
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
    <h2 id={id} className="pg-display text-[clamp(32px,4.5vw,44px)] leading-[1.02] text-foreground">
      {children}
    </h2>
  );
}

// ── stage: live preview / code, with replay and full screen ─────────

function Stage({
  title,
  code,
  exportName,
  slug,
  tint,
  locked,
  name,
}: {
  title: string;
  code: string;
  exportName: string;
  slug: string;
  tint: TileTint;
  locked: boolean;
  name: string;
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
              {v === "preview" ? "Preview" : "Code"}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
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
          <Link
            href={`/live-preview/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open full-screen preview in a new tab"
            className="pg-glass grid size-9 place-items-center rounded-full bg-card text-foreground"
          >
            <Expand className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      {view === "preview" ? (
        <div className="flex min-h-[460px] overflow-hidden rounded-[20px] bg-card [&>*]:min-h-[460px] [&>*]:w-full">
          <DynamicPreview key={run} exportName={exportName} compact={false} />
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
              title: `${title}.tsx`,
              copy: { enabled: true, label: "Copy code", copiedLabel: "Copied", copiedDurationMs: 1400 },
            }}
            codeArea={{ showLineNumbers: true, wrap: false, padding: 18 }}
            border={{ radius: "20px" }}
          />
        </div>
      )}
    </div>
  );
}

// ── build prompt (Pro) ──────────────────────────────────────────────

function BuildPromptCard({ slug, name }: { slug: string; name: string }) {
  const { isPro } = useProAccess();
  const [state, copy] = useCopyBuildPrompt(slug, name);
  return (
    <div className="mt-6 rounded-[18px] bg-foreground/[0.04] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-semibold text-foreground">Build prompt</p>
        {isPro ? null : <ProBadge />}
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
        {state === "copied" ? <Check className="size-4" aria-hidden /> : isPro ? <Sparkles className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
        <span aria-live="polite">
          {state === "loading"
            ? "Copying…"
            : state === "copied"
              ? "Copied — paste it into your agent"
              : state === "error"
                ? "Couldn't copy, try again"
                : isPro
                  ? "Copy build prompt"
                  : "Copy build prompt with Pro"}
        </span>
      </button>
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
  name,
  hasPrompt,
}: {
  slug: string;
  registryCliName?: string;
  dependencies: string[];
  interactions: string[];
  locked: boolean;
  name: string;
  hasPrompt: boolean;
}) {
  const command = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${registryCliName ?? slug}`;
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
        {hasPrompt ? <BuildPromptCard slug={slug} name={name} /> : null}
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
      <p className="mt-1 text-[14px] text-muted-foreground">One command adds the component and its dependencies.</p>
      <InstallCard wrap command={command} className="mt-4" />

      {extra.length ? (
        <div className="mt-6">
          <p className="text-[13px] font-medium text-foreground">Copying by hand? Install these first:</p>
          <InstallCard wrap command={`npm install ${extra.join(" ")}`} className="mt-2 shadow-none ring-1 ring-border" />
        </div>
      ) : null}

      {hasPrompt ? <BuildPromptCard slug={slug} name={name} /> : null}

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
          <pre className="max-h-[380px] overflow-auto p-5 font-mono text-[12.5px] leading-6">{usageCode}</pre>
        </div>
      </div>
    </section>
  );
}

function PropControl({ prop, value, onChange }: { prop: PropDoc; value: unknown; onChange: (value: unknown) => void }) {
  const id = React.useId();
  const head = (
    <div className="min-w-0">
      <label htmlFor={id} className="block truncate font-mono text-[13px] font-semibold text-foreground">
        {prop.name}
      </label>
      <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">{prop.description}</p>
    </div>
  );
  const box = "rounded-[20px] bg-card p-4 ring-1 ring-border";

  if (isBooleanProp(prop)) {
    return (
      <div className={cn(box, "flex items-start justify-between gap-3")}>
        {head}
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => onChange(!value)}
          className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", value ? "bg-foreground" : "bg-muted")}
        >
          <span className={cn("absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow transition-[left]", value ? "left-6" : "left-1")} />
        </button>
      </div>
    );
  }

  if (isUnionProp(prop)) {
    return (
      <div className={box}>
        {head}
        <div id={id} role="radiogroup" aria-label={prop.name} className="mt-3 flex flex-wrap gap-1.5">
          {unionOptions(prop.type).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={value === option}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors",
                value === option ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-accent",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isNumberProp(prop)) {
    return (
      <div className={box}>
        <div className="flex items-start justify-between gap-3">
          {head}
          <input
            id={id}
            type="number"
            value={Number(value)}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-9 w-20 shrink-0 rounded-lg bg-muted px-2 font-mono text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <input
          type="range"
          aria-label={`${prop.name} slider`}
          min={0}
          max={Math.max(Number(value) * 2 || 10, 10)}
          step={Number(value) % 1 === 0 ? 1 : 0.1}
          value={Number(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="mt-3 w-full accent-[#1d1d1f] dark:accent-white"
        />
      </div>
    );
  }

  const isColor = prop.name.toLowerCase().includes("color") || String(value).startsWith("#");
  return (
    <div className={box}>
      {head}
      <div className="mt-3 flex gap-2">
        {isColor && /^#[0-9a-fA-F]{6}$/.test(String(value)) ? (
          <input
            type="color"
            aria-label={`${prop.name} colour`}
            value={String(value)}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-10 shrink-0 cursor-pointer rounded-lg bg-muted p-1"
          />
        ) : null}
        <input
          id={id}
          type="text"
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 min-w-0 flex-1 rounded-lg bg-muted px-3 text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
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

function Setup({
  name,
  slug,
  registryCliName,
  dependencies,
  installedFiles,
  registryImport,
  usageSource,
}: {
  name: string;
  slug: string;
  registryCliName?: string;
  dependencies: string[];
  installedFiles: string[];
  registryImport?: string;
  usageSource?: string;
}) {
  const registryName = registryCliName ?? slug;
  const registryCommand = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${registryName}`;
  const registryConfig = `{\n  "$schema": "https://ui.shadcn.com/schema.json",\n  "style": "default",\n  "rsc": true,\n  "tsx": true,\n  "tailwind": {\n    "css": "src/app/globals.css",\n    "baseColor": "neutral",\n    "cssVariables": true,\n    "prefix": ""\n  },\n  "aliases": {\n    "components": "@/components",\n    "utils": "@/lib/utils",\n    "ui": "@/components/ui",\n    "lib": "@/lib",\n    "hooks": "@/hooks"\n  },\n  "registries": {\n    "${SHADCN_REGISTRY_SCOPE}": "${shadcnRegistryUrl()}"\n  }\n}`;
  const extra = getExtraLibraries(dependencies);
  const exampleImport = getExampleImport(usageSource, registryImport, registryName, name);
  const example = `// app/page.tsx\n${exampleImport}\n\nexport default function Page() {\n  return (\n    <main>\n      <${getImportName(exampleImport, name)} />\n    </main>\n  );\n}`;

  const steps: { title: string; body: React.ReactNode }[] = [
    {
      title: "Prepare your project",
      body: (
        <>
          <p>
            You need Tailwind CSS and the <code className="font-mono text-foreground">@/</code> import alias. If shadcn isn&apos;t set
            up yet, initialise it once:
          </p>
          <CodeSnippet code="npx shadcn@latest init" />
          <p className="mt-4">
            Then add the Nexus registry to your <code className="font-mono text-foreground">components.json</code> (the{" "}
            <code className="font-mono text-foreground">registries</code> key is the part that matters):
          </p>
          <CodeSnippet code={registryConfig} />
        </>
      ),
    },
    {
      title: "Add the component",
      body: (
        <>
          <p>Run this from your project root. It adds the component, the utilities it uses and its packages.</p>
          <CodeSnippet code={registryCommand} />
        </>
      ),
    },
    {
      title: "Check what was added",
      body: (
        <>
          <p>With the standard aliases, these files land in your project:</p>
          <FolderTree files={installedFiles} />
        </>
      ),
    },
    ...(extra.length
      ? [
          {
            title: "Copying by hand? Install the packages",
            body: (
              <>
                <p>Skip this if you used the command above.</p>
                <CodeSnippet code={`npm install ${extra.join(" ")}`} />
              </>
            ),
          },
        ]
      : []),
    {
      title: "Use it in a page",
      body: (
        <>
          <p>
            Import it and render it. The <span className="font-medium text-foreground">Code</span> tab above has the full example.
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
        {steps.map((s, i) => (
          <li key={s.title} className="pg-float grid gap-4 rounded-tile bg-card p-6 sm:grid-cols-[48px_minmax(0,1fr)]">
            <span className="pg-display text-[32px] text-foreground">{i + 1}</span>
            <div className="min-w-0 text-[15px] leading-relaxed text-muted-foreground">
              <h3 className="mb-2 text-[19px] font-semibold tracking-[-0.4px] text-foreground">{s.title}</h3>
              {s.body}
            </div>
          </li>
        ))}
      </ol>
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
};

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
        </div>
      </section>

      <div className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid min-w-0 gap-10">
              {sections.map((s) => (
                <div key={s.title}>
                  {sections.length > 1 ? <h2 className="mb-3 text-[19px] font-semibold tracking-[-0.4px] text-foreground">{s.title}</h2> : null}
                  <Stage title={s.title} code={s.code} exportName={s.exportName} slug={slug} tint={tint} locked={locked} name={name} />
                </div>
              ))}
            </div>
            <InstallPanel
              slug={slug}
              registryCliName={registryCliName}
              dependencies={dependencies}
              interactions={interactions}
              locked={locked}
              name={name}
              hasPrompt={hasPrompt}
            />
          </div>

          {livePlayground ? (
            <section aria-labelledby="playground-heading" className="mt-20">
              <SectionTitle id="playground-heading">Play with it</SectionTitle>
              <p className="mb-6 mt-3 max-w-[560px] text-[17px] text-muted-foreground">
                Move the controls and watch it change. Copy code gives you a snippet with only the props you changed.
              </p>
              <LivePropsPlayground playground={livePlayground} name={name} description={description} locked={locked} />
            </section>
          ) : (
            <ProLock locked={locked} name={name} label="Edit it with Pro">
              <PropsPlayground key={`${slug}-${importName}`} props={props} importName={importName} />
            </ProLock>
          )}
          <PropsTable props={props} />
          <ProLock locked={locked} name={name} label="Install it with Pro" className="rounded-tile">
          <Setup
            name={name}
            slug={slug}
            registryCliName={registryCliName}
            dependencies={dependencies}
            installedFiles={installedFiles}
            registryImport={registryImport}
            usageSource={usageSource}
          />
          </ProLock>
          <About slug={slug} name={name} />

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


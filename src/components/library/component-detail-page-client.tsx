"use client";

import * as React from "react";
import Link from "next/link";
import { SHADCN_REGISTRY_SCOPE } from "@/lib/registry-scope";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Crown,
  Expand,
  Lock,
  Monitor,
  Package,
  RotateCcw,
  Zap,
} from "lucide-react";

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

function getEditableProps(props: PropDoc[] = []) {
  return props
    .filter((prop) => {
      const type = prop.type.toLowerCase();
      if (/^on[A-Z]/.test(prop.name)) return false;
      if (["className", "style", "children"].includes(prop.name)) return false;
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
  const namedImport = code.match(/import\s*\{\s*([A-Za-z0-9_]+)/);
  if (namedImport?.[1]) return namedImport[1];
  return toPascalCase(fallbackName);
}
import { componentDescriptions } from "@/lib/catalog/component-descriptions";
import { DynamicPreview } from "@/components/library/dynamic-preview";
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
import { CodeBlock } from "@/components/code-block/code-block";
import { cn } from "@/lib/utils";

type PropDoc = {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
};

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
  const shadcnAddCmd = `npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${name}`;
  const installCmd = `npm install ${dependencies.join(" ")}`;

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card/80 p-5 shadow-sm dark:bg-white/[0.03]">
      {/* shadcn CLI */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="size-3.5 text-muted-foreground" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Shadcn CLI
          </p>
        </div>
        <div className="relative rounded-xl border border-border bg-muted/30 dark:bg-white/4">
          <pre className="max-h-40 overflow-auto p-3 pr-16 font-mono text-[11px] leading-relaxed text-foreground">
            {shadcnAddCmd}
          </pre>
          <div className="absolute right-2 top-2">
            <CopyBtn text={shadcnAddCmd} />
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

function PropsPlayground({
  props,
  importName,
}: {
  props?: PropDoc[];
  importName: string;
}) {
  const editableProps = React.useMemo(() => getEditableProps(props), [props]);
  const defaults = React.useMemo(
    () =>
      Object.fromEntries(
        editableProps.map((prop) => [prop.name, cleanDefaultValue(prop)]),
      ) as Record<string, unknown>,
    [editableProps],
  );
  const [values, setValues] = React.useState<Record<string, unknown>>(
    () => defaults,
  );

  const usageCode = React.useMemo(() => {
    if (!editableProps.length) return "";

    const lines = editableProps.map((prop) => {
      const value = values[prop.name] ?? cleanDefaultValue(prop);
      return `  ${prop.name}=${propValueToCode(value, prop)}`;
    });

    return `<${importName}\n${lines.join("\n")}\n/>`;
  }, [editableProps, importName, values]);

  if (!editableProps.length) return null;

  return (
    <section className="mt-7 overflow-hidden rounded-3xl border border-border/70 bg-background shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="relative border-b border-border/70 bg-[radial-gradient(circle_at_12%_10%,rgba(124,58,237,0.14),transparent_30%),linear-gradient(135deg,rgba(250,250,250,0.95),rgba(244,244,245,0.72))] px-5 py-5 dark:bg-[radial-gradient(circle_at_12%_10%,rgba(168,85,247,0.18),transparent_30%),linear-gradient(135deg,rgba(24,24,27,0.96),rgba(9,9,11,0.78))] sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09] dark:opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
              Playground
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Shape the component before you copy it.
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Adjust the important props for this component and grab JSX that matches your choices.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setValues(defaults)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/85 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground dark:bg-zinc-950/70"
          >
            <RotateCcw className="size-3.5" />
            Reset props
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.62fr)]">
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="grid gap-3 md:grid-cols-2">
            {editableProps.map((prop) => (
              <PropControl
                key={prop.name}
                prop={prop}
                value={values[prop.name] ?? cleanDefaultValue(prop)}
                onChange={(value) =>
                  setValues((current) => ({ ...current, [prop.name]: value }))
                }
              />
            ))}
          </div>
        </div>

        <aside className="border-t border-border/70 bg-zinc-950 text-zinc-100 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Generated JSX
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Copy this into your page.
              </p>
            </div>
            <CopyBtn text={usageCode} />
          </div>
          <pre className="max-h-[360px] overflow-auto p-4 font-mono text-[12px] leading-6 text-zinc-100">
            {usageCode}
          </pre>
        </aside>
      </div>
    </section>
  );
}

function PropControl({
  prop,
  value,
  onChange,
}: {
  prop: PropDoc;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = (
    <div className="min-w-0">
      <p className="truncate font-mono text-xs font-semibold text-foreground">
        {prop.name}
      </p>
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
        {prop.description}
      </p>
    </div>
  );

  if (isBooleanProp(prop)) {
    return (
      <label className="flex min-h-28 items-start justify-between gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 transition hover:border-border hover:bg-muted/40 dark:bg-white/[0.025] dark:hover:bg-white/[0.04]">
        {label}
        <button
          type="button"
          aria-pressed={Boolean(value)}
          onClick={() => onChange(!value)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full border transition",
            value
              ? "border-primary/40 bg-primary"
              : "border-border bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow transition",
              value ? "left-6" : "left-1",
            )}
          />
        </button>
      </label>
    );
  }

  if (isUnionProp(prop)) {
    const options = unionOptions(prop.type);
    return (
      <div className="min-h-28 rounded-2xl border border-border/70 bg-muted/25 p-4 transition hover:border-border hover:bg-muted/40 dark:bg-white/[0.025] dark:hover:bg-white/[0.04]">
        {label}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition",
                value === option
                  ? "border-primary/40 bg-primary text-primary-foreground"
                  : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
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
      <label className="min-h-28 rounded-2xl border border-border/70 bg-muted/25 p-4 transition hover:border-border hover:bg-muted/40 dark:bg-white/[0.025] dark:hover:bg-white/[0.04]">
        <div className="flex items-start justify-between gap-3">
          {label}
          <input
            type="number"
            value={Number(value)}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-9 w-24 shrink-0 rounded-lg border border-border bg-background px-2 font-mono text-xs text-foreground outline-none transition focus:border-primary"
          />
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(Number(value) * 2 || 10, 10)}
          step={Number(value) % 1 === 0 ? 1 : 0.1}
          value={Number(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="mt-3 w-full accent-primary"
        />
      </label>
    );
  }

  const isColor =
    prop.name.toLowerCase().includes("color") ||
    String(value).startsWith("#");

  return (
    <label className="min-h-28 rounded-2xl border border-border/70 bg-muted/25 p-4 transition hover:border-border hover:bg-muted/40 dark:bg-white/[0.025] dark:hover:bg-white/[0.04]">
      {label}
      <div className="mt-3 flex gap-2">
        {isColor && /^#[0-9a-fA-F]{6}$/.test(String(value)) && (
          <input
            type="color"
            value={String(value)}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-1"
          />
        )}
        <input
          type="text"
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none transition focus:border-primary"
        />
      </div>
    </label>
  );
}

// ── main client component ───────────────────────────────────────────
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
  reactSource?: string;
  props?: PropDoc[];
  previewExportName: string;
  serializedPreviewSections?: SerializedSection[];
};

export function ComponentDetailPageClient({
  slug,
  isPremium = false,
  name,
  description,
  categorySlug,
  animationKinds,
  tags,
  premium,
  registryCliName,
  dependencies,
  reactSource,
  props,
  previewExportName,
  serializedPreviewSections,
}: ComponentDetailProps) {
  const codeIsLocked = premium && !isPremium;

  const categoryLabel = getComponentCategoryLabel(categorySlug as ComponentCategorySlug);

  return (
    <main className="mx-auto w-full max-w-[1420px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10 xl:px-14">
      <nav className="mb-7 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/components" className="transition hover:text-foreground">
          Components
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/components?cat=${categorySlug}`}
          className="transition hover:text-foreground"
        >
          {categoryLabel}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{name}</span>
      </nav>

      <header>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {name}
          <span className="sr-only"> — React Component</span>
        </h1>
        <p className="mt-4 max-w-3xl text-xl leading-8 text-muted-foreground">
          {description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-border/70 bg-muted/50 text-muted-foreground">
            {categoryLabel}
          </Badge>
          {animationKinds.map((kind) => (
            <Badge
              key={kind}
              variant="outline"
              className="border-border/70 bg-muted/50 text-muted-foreground"
            >
              {kind}
            </Badge>
          ))}
          {tags.map((tag) => (
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

      {serializedPreviewSections ? (
        serializedPreviewSections.map((section, i) => (
          <PreviewCodeSection
            key={i}
            title={
              section.title ??
              (serializedPreviewSections.length > 1
                ? `${name} — Variant ${i + 1}`
                : name)
            }
            code={section.reactSource}
            slug={slug}
            props={props}
            importName={getImportName(section.reactSource, name)}
            dependencies={dependencies}
            animationKinds={animationKinds}
            registryCliName={registryCliName}
            className={i > 0 ? "mt-16" : undefined}
            locked={codeIsLocked}
          >
            <DynamicPreview exportName={section.previewExportName} compact={false} />
          </PreviewCodeSection>
        ))
      ) : (
        <PreviewCodeSection
          title={name}
          code={reactSource ?? ""}
          slug={slug}
          props={props}
          importName={getImportName(reactSource ?? "", name)}
          dependencies={dependencies}
          animationKinds={animationKinds}
          locked={codeIsLocked}
          registryCliName={registryCliName}
        >
          <DynamicPreview exportName={previewExportName} compact={false} />
        </PreviewCodeSection>
      )}

      <section className="mt-10 grid gap-4 border-t border-border/50 pt-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Animation effects</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {animationKinds.length > 0 ? (
              animationKinds.map((kind) => (
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
          {DEMO_SLUGS.has(slug) && (
            <Link
              href={`/demos/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
            >
              Full-page demo
              <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>
      </section>

      <ComponentAbout slug={slug} name={name} />
    </main>
  );
}

function ComponentAbout({ slug, name }: { slug: string; name: string }) {
  const desc = componentDescriptions[slug];
  if (!desc) return null;

  return (
    <section className="mt-16 border-t border-border/50 pt-10">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        About {name}
      </h2>
      <p className="mt-4 max-w-4xl text-base leading-8 text-muted-foreground">
        {desc.about}
      </p>
      <div className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Common use cases
        </h3>
        <ul className="mt-4 flex flex-wrap gap-3">
          {desc.useCases.map((uc) => (
            <li
              key={uc}
              className="rounded-xl border border-border/70 bg-muted/40 px-4 py-2 text-sm text-muted-foreground dark:bg-white/[0.04]"
            >
              {uc}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── preview + code tabs ─────────────────────────────────────────────
function PreviewCodeSection({
  title,
  code,
  slug,
  props,
  importName,
  dependencies,
  animationKinds,
  registryCliName,
  className,
  locked = false,
  children,
}: {
  title: string;
  code: string;
  slug: string;
  props?: PropDoc[];
  importName: string;
  dependencies: string[];
  animationKinds: string[];
  registryCliName?: string;
  className?: string;
  locked?: boolean;
  children: React.ReactNode;
}) {
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
            <TabsTrigger value="code" className="h-9 gap-2 rounded-lg px-4 text-base" disabled={locked}>
              {locked ? <Lock className="size-4" /> : <Code2 className="size-4" />}
              Code
            </TabsTrigger>
          </TabsList>

          <Link
            href={`/live-preview/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open full-screen preview in new tab"
            className="grid size-10 place-items-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-sm transition hover:text-foreground dark:bg-white/4"
          >
            <Expand className="size-4" />
          </Link>
        </div>

        <TabsContent value="preview" className="mt-4">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm dark:border-white/10 dark:bg-zinc-950">
            {children}
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          {locked ? (
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-muted/20">
              {/* Blurred code preview behind the paywall */}
              <div className="pointer-events-none select-none blur-sm" aria-hidden>
                <CodeBlock
                  code={code}
                  language="tsx"
                  theme="dark"
                  header={{ enabled: true, showDots: true, title: `${title}.tsx`, copy: { enabled: false, label: "", copiedLabel: "", copiedDurationMs: 0 } }}
                  codeArea={{ showLineNumbers: true, wrap: false, padding: 18 }}
                  border={{ radius: "16px" }}
                />
              </div>
              {/* Paywall overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-background/60 backdrop-blur-[2px]">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-lg">
                  <Crown className="size-6 text-amber-500" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">Pro component</p>
                  <p className="mt-1 text-sm text-muted-foreground">Upgrade to access the full source code</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
                  >
                    <Crown className="size-4" />
                    Upgrade to Pro
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    View plans
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
              <InstallSidebar
                slug={slug}
                registryCliName={registryCliName}
                dependencies={dependencies}
                animationKinds={animationKinds}
              />
              <div className="h-150 xl:h-175">
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
          )}
        </TabsContent>
      </Tabs>

      <PropsPlayground
        key={`${slug}-${importName}`}
        props={props}
        importName={importName}
      />

    </section>
  );
}

"use client";

import * as React from "react";
import { Layers } from "lucide-react";
import { DotGridHero } from "./dot-grid-hero";
import { cn } from "@/lib/utils";

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="relative rounded-2xl border border-border/70 bg-muted/30 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Code</span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
          className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TabSection({
  title, description, code, height = 520, children,
}: {
  title: string;
  description: string;
  code: string;
  height?: number;
  children: React.ReactNode;
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="inline-flex gap-0.5 rounded-xl border border-border/50 bg-muted/30 p-0.5 dark:bg-white/[0.04]">
        {(["preview", "code"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-[12px] font-medium capitalize transition-all duration-150",
              tab === t
                ? "bg-background text-foreground shadow-sm dark:bg-white/10 dark:text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "preview" ? (
        <div className="overflow-hidden rounded-2xl border border-border/50" style={{ height }}>
          {children}
        </div>
      ) : (
        <CodeBlock code={code} />
      )}
    </section>
  );
}

// ── 1. Default — white bg, multi-colour dashes (matches Antigravity reference) ─
function DefaultVariant() {
  return (
    <TabSection
      title="Default"
      description="White background with multi-colour scattered dashes. Move your cursor — particles repel and spring back."
      code={`import { DotGridHero } from "@/components/dot-grid-hero";

export function DefaultHero() {
  return (
    <DotGridHero
      title={"Build interfaces\\nthat ship."}
      subtitle="A motion-native component library for React."
      primaryCTA={{ label: "Get started",        href: "/components" }}
      secondaryCTA={{ label: "Browse components", href: "/components" }}
    />
  );
}`}
    >
      <DotGridHero
        title={"Build interfaces\nthat ship."}
        subtitle="A motion-native component library for React. Animated, accessible, and production-ready out of the box."
        primaryCTA={{ label: "Get started",         href: "#" }}
        secondaryCTA={{ label: "Browse components", href: "#" }}
        className="h-full min-h-0"
      />
    </TabSection>
  );
}

// ── 2. Large — dark bg, wider spacing, stronger repulsion ─────────────────────
function LargeVariant() {
  return (
    <TabSection
      title="Large — Dark, Wide Spacing"
      description="Dark background with lighter dashes and a wider interaction radius. Stronger repulsion force."
      code={`import { DotGridHero } from "@/components/dot-grid-hero";

export function DarkHero() {
  return (
    <DotGridHero
      title={"Design systems\\nmade simple."}
      subtitle="Everything you need to build fast, beautiful products at scale."
      primaryCTA={{ label: "Start for free", href: "#" }}
      secondaryCTA={{ label: "View docs",    href: "#" }}
      background="#09090b"
      textColor="#fafafa"
      dotGap={80}
      colors={["#818cf8","#6366f1","#a78bfa","#38bdf8","#f472b6"]}
      interactionRadius={160}
      repulsionStrength={10}
      springK={0.055}
      damping={0.78}
    />
  );
}`}
    >
      <DotGridHero
        title={"Design systems\nmade simple."}
        subtitle="Everything you need to build fast, beautiful products at scale."
        primaryCTA={{ label: "Start for free", href: "#" }}
        secondaryCTA={{ label: "View docs",    href: "#" }}
        background="#09090b"
        textColor="#fafafa"
        dotGap={80}
        colors={["#818cf8", "#6366f1", "#a78bfa", "#38bdf8", "#f472b6"]}
        interactionRadius={160}
        repulsionStrength={10}
        springK={0.055}
        damping={0.78}
        className="h-full min-h-0"
      />
    </TabSection>
  );
}

// ── 3. Compact — tighter grid, gentle spring ──────────────────────────────────
function CompactVariant() {
  return (
    <TabSection
      title="Compact — Dense Grid, Gentle Spring"
      description="Closer dot spacing with a softer spring constant — dashes drift back slowly like they're weightless."
      code={`import { DotGridHero } from "@/components/dot-grid-hero";

export function CompactHero() {
  return (
    <DotGridHero
      title={"Ship 10× faster\\nwith AI."}
      subtitle="AI-powered tooling that writes, tests,
and deploys automatically."
      primaryCTA={{ label: "Try it free",  href: "#" }}
      secondaryCTA={{ label: "Watch demo", href: "#" }}
      background="#fafafa"
      dotGap={52}
      colors={["#f59e0b","#f97316","#ef4444","#dc2626","#fb923c"]}
      interactionRadius={100}
      repulsionStrength={6}
      springK={0.04}
      damping={0.85}
    />
  );
}`}
    >
      <DotGridHero
        title={"Ship 10× faster\nwith AI."}
        subtitle="AI-powered tooling that writes, tests, and deploys automatically."
        primaryCTA={{ label: "Try it free",  href: "#" }}
        secondaryCTA={{ label: "Watch demo", href: "#" }}
        background="#fafafa"
        dotGap={52}
        colors={["#f59e0b", "#f97316", "#ef4444", "#dc2626", "#fb923c"]}
        interactionRadius={100}
        repulsionStrength={6}
        springK={0.04}
        damping={0.85}
        className="h-full min-h-0"
      />
    </TabSection>
  );
}

// ── 4. Wide Spread — large radius, explosive repulsion ────────────────────────
function WideSpreadVariant() {
  return (
    <TabSection
      title="Wide Spread — Explosive Repulsion"
      description="Huge interaction radius with maximum repulsion strength. Dashes fly far and snap back with a tight spring."
      code={`import { DotGridHero } from "@/components/dot-grid-hero";

export function ExplosiveHero() {
  return (
    <DotGridHero
      title={"Beautiful UX\\nstarts here."}
      subtitle="Craft interfaces your users will love."
      primaryCTA={{ label: "Explore now",   href: "#" }}
      secondaryCTA={{ label: "See pricing", href: "#" }}
      background="#fff0f3"
      textColor="#1a0a10"
      dotGap={90}
      colors={["#f43f5e","#e11d48","#fb7185","#fda4af","#9f1239"]}
      interactionRadius={200}
      repulsionStrength={14}
      springK={0.09}
      damping={0.76}
    />
  );
}`}
    >
      <DotGridHero
        title={"Beautiful UX\nstarts here."}
        subtitle="Craft interfaces your users will love. Premium components, zero compromise."
        primaryCTA={{ label: "Explore now",  href: "#" }}
        secondaryCTA={{ label: "See pricing", href: "#" }}
        background="#fff0f3"
        textColor="#1a0a10"
        dotGap={90}
        colors={["#f43f5e", "#e11d48", "#fb7185", "#fda4af", "#9f1239"]}
        interactionRadius={200}
        repulsionStrength={14}
        springK={0.09}
        damping={0.76}
        className="h-full min-h-0"
      />
    </TabSection>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export function DotGridHeroDemo() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-14">
      <header className="mx-auto max-w-2xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary">
          <Layers className="size-3.5" />
          Canvas hero component
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Interactive Dot Grid Hero
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Physics-based particle field inspired by Google Antigravity. Colorful
          elongated dashes repel from the cursor and spring back — built on Canvas
          + requestAnimationFrame at 60 fps.
        </p>
      </header>

      <div className="h-px bg-border/50" />
      <DefaultVariant />
      <div className="h-px bg-border/50" />
      <LargeVariant />
      <div className="h-px bg-border/50" />
      <CompactVariant />
      <div className="h-px bg-border/50" />
      <WideSpreadVariant />

      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Props</h2>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border/70 bg-muted/30">
              <tr>
                {["Prop", "Type", "Default", "Description"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {[
                ["title",             "string",    '"Build interfaces\\nthat ship."', "Heading — use \\n for line breaks."],
                ["subtitle",          "string",    "—",        "Supporting paragraph."],
                ["primaryCTA",        "CTAButton", "—",        "{ label, href?, onClick? }"],
                ["secondaryCTA",      "CTAButton", "—",        "{ label, href?, onClick? }"],
                ["dotGap",            "number",    "72",       "Average spacing between particles (px)."],
                ["interactionRadius", "number",    "120",      "Cursor repulsion radius (px)."],
                ["repulsionStrength", "number",    "7",        "Force magnitude applied to nearby dashes."],
                ["springK",           "number",    "0.065",    "Spring constant pulling dashes home."],
                ["damping",           "number",    "0.80",     "Velocity damping per frame (0–1)."],
                ["colors",            "string[]",  "palette",  "Array of hex colours for dashes."],
                ["background",        "string",    '"#ffffff"', "Canvas background colour (hex)."],
                ["textColor",         "string",    '"#09090b"', "Hero text colour (hex)."],
                ["className",         "string",    "—",        "Extra classes on the section element."],
              ].map(([p, t, d, desc]) => (
                <tr key={p} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono text-[12px] text-foreground">{p}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-primary/80">{t}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{d}</td>
                  <td className="px-4 py-2.5 text-[12px] text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { InteractiveStarfieldHero } from "./starfield-hero";
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

// ── 1. Default — zinc-950, blue/white particles ───────────────────────────────
function DefaultVariant() {
  return (
    <TabSection
      title="Default"
      description="Dark zinc background with blue particles that stretch, brighten, and rotate toward the cursor. Move your mouse to see the starfield react."
      code={`import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function DefaultHero() {
  return (
    <InteractiveStarfieldHero
      title={"Ship faster.\\nBuild better."}
      subtitle="A motion-native component library for React — animated, accessible, and production-ready."
      primaryCTA={{ label: "Get started",     href: "/components" }}
      secondaryCTA={{ label: "View components", href: "/components" }}
    />
  );
}`}
    >
      <InteractiveStarfieldHero
        title={"Ship faster.\nBuild better."}
        subtitle="A motion-native component library for React — animated, accessible, and production-ready."
        primaryCTA={{ label: "Get started",      href: "#" }}
        secondaryCTA={{ label: "View components", href: "#" }}
        className="h-full min-h-0 rounded-2xl"
      />
    </TabSection>
  );
}

// ── 2. Deep Space — pure black, violet particles ──────────────────────────────
function DeepSpaceVariant() {
  return (
    <TabSection
      title="Deep Space — Violet Nebula"
      description="Near-black background with violet/lavender particles. Higher particle count and wider influence radius for a dramatic nebula feel."
      code={`import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function DeepSpaceHero() {
  return (
    <InteractiveStarfieldHero
      title={"Design systems\\nmade simple."}
      subtitle="Everything you need to build beautiful products at scale."
      primaryCTA={{ label: "Start for free", href: "#" }}
      secondaryCTA={{ label: "View docs",    href: "#" }}
      particleCount={400}
      particleColor="#a78bfa"
      activeColor="#f0abfc"
      interactionRadius={180}
      speed={0.4}
    />
  );
}`}
    >
      <InteractiveStarfieldHero
        title={"Design systems\nmade simple."}
        subtitle="Everything you need to build beautiful products at scale."
        primaryCTA={{ label: "Start for free", href: "#" }}
        secondaryCTA={{ label: "View docs",    href: "#" }}
        particleCount={400}
        particleColor="#a78bfa"
        activeColor="#f0abfc"
        interactionRadius={180}
        speed={0.4}
        className="h-full min-h-0 rounded-2xl"
      />
    </TabSection>
  );
}

// ── 3. Ocean Night — cyan glow ────────────────────────────────────────────────
function OceanNightVariant() {
  return (
    <TabSection
      title="Ocean Night — Cyan Glow"
      description="Teal/cyan particles with a snappy spring — particles snap back fast. Great for developer-tool or SaaS landing pages."
      code={`import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function OceanNightHero() {
  return (
    <InteractiveStarfieldHero
      title={"Ship 10× faster\\nwith AI."}
      subtitle="AI-powered tooling that writes, tests, and deploys your code automatically."
      primaryCTA={{ label: "Try it free",  href: "#" }}
      secondaryCTA={{ label: "Watch demo", href: "#" }}
      particleColor="#22d3ee"
      activeColor="#ecfeff"
      interactionRadius={120}
      speed={0.8}
    />
  );
}`}
    >
      <InteractiveStarfieldHero
        title={"Ship 10× faster\nwith AI."}
        subtitle="AI-powered tooling that writes, tests, and deploys your code automatically."
        primaryCTA={{ label: "Try it free",  href: "#" }}
        secondaryCTA={{ label: "Watch demo", href: "#" }}
        particleColor="#22d3ee"
        activeColor="#ecfeff"
        interactionRadius={120}
        speed={0.8}
        className="h-full min-h-0 rounded-2xl"
      />
    </TabSection>
  );
}

// ── 4. Ember Storm — warm amber, dreamy return ────────────────────────────────
function EmberStormVariant() {
  return (
    <TabSection
      title="Ember Storm — Warm Amber"
      description="Amber/gold particles with a slow, dreamlike return speed. Sparse count gives each particle more visual weight."
      code={`import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function EmberStormHero() {
  return (
    <InteractiveStarfieldHero
      title={"Beautiful UX\\nstarts here."}
      subtitle="Craft interfaces your users will love. Premium components, zero compromise."
      primaryCTA={{ label: "Explore now",  href: "#" }}
      secondaryCTA={{ label: "See pricing", href: "#" }}
      particleCount={180}
      particleColor="#f59e0b"
      activeColor="#fef9c3"
      interactionRadius={160}
      speed={0.15}
    />
  );
}`}
    >
      <InteractiveStarfieldHero
        title={"Beautiful UX\nstarts here."}
        subtitle="Craft interfaces your users will love. Premium components, zero compromise."
        primaryCTA={{ label: "Explore now",  href: "#" }}
        secondaryCTA={{ label: "See pricing", href: "#" }}
        particleCount={180}
        particleColor="#f59e0b"
        activeColor="#fef9c3"
        interactionRadius={160}
        speed={0.15}
        className="h-full min-h-0 rounded-2xl"
      />
    </TabSection>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export function InteractiveStarfieldHeroDemo() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-14">
      <header className="mx-auto max-w-2xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary">
          <Sparkles className="size-3.5" />
          Canvas hero component
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Interactive Starfield Hero
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Dark hero section with a cursor-reactive starfield. Hundreds of glowing
          particles stretch, brighten, and rotate toward the cursor — built on
          Canvas + requestAnimationFrame at 60 fps.
        </p>
      </header>

      <div className="h-px bg-border/50" />
      <DefaultVariant />
      <div className="h-px bg-border/50" />
      <DeepSpaceVariant />
      <div className="h-px bg-border/50" />
      <OceanNightVariant />
      <div className="h-px bg-border/50" />
      <EmberStormVariant />

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
                ["title",             "string",    '"Ship faster.\\nBuild better."', "Hero heading — use \\n for line breaks."],
                ["subtitle",          "string",    "—",           "Supporting paragraph."],
                ["primaryCTA",        "CTAConfig", "—",           "{ label, href?, onClick? }"],
                ["secondaryCTA",      "CTAConfig", "—",           "{ label, href?, onClick? }"],
                ["particleCount",     "number",    "300",         "Total number of particles."],
                ["interactionRadius", "number",    "140",         "Cursor influence radius in px."],
                ["particleColor",     "string",    '"#60a5fa"',   "Base particle colour (hex)."],
                ["activeColor",       "string",    '"#ffffff"',   "Particle colour at full activation (hex)."],
                ["speed",             "number",    "0.5",         "Return speed: 0.1 (dreamlike) → 1.0 (snappy)."],
                ["children",         "ReactNode", "—",           "Override default hero content entirely."],
                ["className",        "string",    "—",           "Extra classes on the section element."],
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

"use client";

import * as React from "react";
import { Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ImagesBadge } from "./images-badge";
import { cn } from "@/lib/utils";

// ── Data ──────────────────────────────────────────────────────────────────────
const TEAM_AVATARS = [
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",  alt: "Felix"  },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",  alt: "Aneka"  },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Milo&backgroundColor=d1d4f9",   alt: "Milo"   },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&backgroundColor=ffd5dc",    alt: "Zoe"    },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kai&backgroundColor=ffdfbf",    alt: "Kai"    },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Luna&backgroundColor=c1f0c8",   alt: "Luna"   },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Omar&backgroundColor=b6e3f4",   alt: "Omar"   },
];

const TEMPLATE_IMAGES = [
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=dash&backgroundColor=0f172a",    alt: "Dashboard"  },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=land&backgroundColor=172554",    alt: "Landing"    },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=port&backgroundColor=1e1b4b",    alt: "Portfolio"  },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=saas&backgroundColor=1c1917",    alt: "SaaS"       },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=stor&backgroundColor=14532d",    alt: "Store"      },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=blog&backgroundColor=450a0a",    alt: "Blog"       },
];

// ── Shared demo card ──────────────────────────────────────────────────────────
function DemoCard({
  title,
  description,
  children,
  code,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  code: string;
}) {
  const [tab, setTab]     = React.useState<"preview" | "code">("preview");
  const [copied, setCopied] = React.useState(false);

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
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-border/50 bg-muted/20 dark:bg-white/[0.02]">
          {children}
        </div>
      ) : (
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
      )}
    </section>
  );
}

// ── 1. Default — the classic folder-badge (matches Aceternity reference) ──────
function DefaultDemo() {
  return (
    <DemoCard
      title="Default"
      description="Rounded-square thumbnails with per-card rotation angles. On hover they fan out in an arc — exactly like the Aceternity reference."
      code={`"use client";
import { ImagesBadge } from "@/components/images-badge";

const TEMPLATES = [
  { src: "/previews/dashboard.png", alt: "Dashboard" },
  { src: "/previews/landing.png",   alt: "Landing"   },
  { src: "/previews/saas.png",      alt: "SaaS"      },
  { src: "/previews/store.png",     alt: "Store"     },
  { src: "/previews/blog.png",      alt: "Blog"      },
];

export function FolderBadge() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="text-2xl">📁</span>
      <ImagesBadge
        images={TEMPLATES}
        maxVisible={3}
        revealCount={2}
        label="Introducing Marketing Template"
        size="md"
        shape="rounded"
      />
    </div>
  );
}`}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Exact Aceternity-style presentation */}
        <div className="inline-flex items-center gap-3">
          <span className="text-2xl select-none" aria-hidden>📁</span>
          <ImagesBadge
            images={TEMPLATE_IMAGES}
            maxVisible={3}
            revealCount={2}
            label="Introducing Marketing Template"
            size="md"
            shape="rounded"
          />
        </div>
        <p className="text-[11px] text-muted-foreground/60">hover the images</p>
      </div>
    </DemoCard>
  );
}

// ── 2. Large — hero social proof ──────────────────────────────────────────────
function LargeDemo() {
  return (
    <DemoCard
      title="Large"
      description="Bigger `lg` size with circle avatars — ideal for hero section social-proof blocks."
      code={`"use client";
import { ImagesBadge } from "@/components/images-badge";

export function SocialProof() {
  return (
    <div className="flex flex-col items-center gap-3">
      <ImagesBadge
        images={TEAM}
        maxVisible={4}
        revealCount={3}
        label="12,000+ developers"
        size="lg"
        shape="circle"
        onClick={() => router.push("/community")}
      />
      <p className="text-xs text-muted-foreground">⭐ 4.9 · 2,400 reviews</p>
    </div>
  );
}`}
    >
      <div className="flex flex-col items-center gap-4">
        <ImagesBadge
          images={TEAM_AVATARS}
          maxVisible={4}
          revealCount={3}
          label="12,000+ developers"
          size="lg"
          shape="circle"
          onClick={() => {}}
        />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="font-semibold text-foreground">4.9</span>
          <span>· 2,400 reviews</span>
        </div>
      </div>
    </DemoCard>
  );
}

// ── 3. Compact — notification rows ─────────────────────────────────────────────
function CompactDemo() {
  return (
    <DemoCard
      title="Compact"
      description="`sm` size in notification-style rows — table cells, comment threads, activity feeds."
      code={`"use client";
import { ImagesBadge } from "@/components/images-badge";

export function NotificationRow() {
  return (
    <div className="flex items-center gap-3">
      <ImagesBadge
        images={TEAM}
        maxVisible={2}
        revealCount={2}
        size="sm"
        shape="circle"
      />
      <span className="text-sm text-muted-foreground">
        Felix, Aneka + 3 others liked this
      </span>
    </div>
  );
}`}
    >
      <div className="flex flex-col items-start gap-5 px-6">
        {[
          { text: "Felix, Aneka + 3 others liked your post", imgs: TEAM_AVATARS.slice(0, 5) },
          { text: "Milo, Zoe + 2 others commented",          imgs: TEAM_AVATARS.slice(2, 6) },
          { text: "Kai started following you",                imgs: TEAM_AVATARS.slice(4, 7) },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <ImagesBadge images={row.imgs} maxVisible={2} revealCount={2} size="sm" shape="circle" />
            <span className="text-sm text-muted-foreground">{row.text}</span>
          </div>
        ))}
      </div>
    </DemoCard>
  );
}

// ── 4. Wide Spread — many images, prominent arc ───────────────────────────────
function WideSpreadDemo() {
  return (
    <DemoCard
      title="Wide Spread"
      description="High `revealCount` with 6 total images — the arc effect is most visible here. All images have unique rotation angles."
      code={`"use client";
import { ImagesBadge } from "@/components/images-badge";

export function WideSpread() {
  return (
    <ImagesBadge
      images={TEMPLATES}   // 6 images
      maxVisible={2}
      revealCount={4}
      label="6 templates included"
      size="md"
      shape="rounded"
    />
  );
}`}
    >
      <div className="flex flex-col items-center gap-6">
        <ImagesBadge
          images={TEMPLATE_IMAGES}
          maxVisible={2}
          revealCount={4}
          label="6 templates included"
          size="md"
          shape="rounded"
        />
        <div className="h-px w-24 bg-border/40" />
        {/* Circle variant with same wide spread */}
        <div className="flex items-center gap-3">
          <ImagesBadge
            images={TEAM_AVATARS}
            maxVisible={2}
            revealCount={5}
            label="Full team"
            size="md"
            shape="circle"
          />
        </div>
      </div>
    </DemoCard>
  );
}

// ── Root demo ──────────────────────────────────────────────────────────────────
export function ImagesBadgeDemo() {
  return (
    <div className="mx-auto max-w-3xl space-y-16 px-4 py-14">
      <header className="mx-auto max-w-xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary">
          <Sparkles className="size-3.5" />
          Social proof component
        </div>
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Images Badge
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Stacked images with per-card rotation that fan open on hover in a
          natural arc. Supports circular avatars, rounded thumbnails, and custom labels.
        </p>
      </header>

      <div className="h-px bg-border/50" />
      <DefaultDemo />
      <div className="h-px bg-border/50" />
      <LargeDemo />
      <div className="h-px bg-border/50" />
      <CompactDemo />
      <div className="h-px bg-border/50" />
      <WideSpreadDemo />

      {/* Props */}
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
                ["images",         "BadgeImage[]",                        "—",          "Array of { src, alt } objects"],
                ["maxVisible",     "number",                              "3",          "Images shown when collapsed"],
                ["revealCount",    "number",                              "2",          "Extra images revealed on hover"],
                ["label",          "string",                              "—",          "Text label after the stack"],
                ["size",           '"sm" | "md" | "lg"',                  '"md"',       "Image diameter and pill height"],
                ["shape",          '"circle" | "rounded" | "square"',     '"rounded"',  "Clipping shape for each image"],
                ["className",      "string",                              "—",          "Extra classes on the pill container"],
                ["imageClassName", "string",                              "—",          "Extra classes on each image wrapper"],
                ["onClick",        "() => void",                          "—",          "Makes badge interactive (button role)"],
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

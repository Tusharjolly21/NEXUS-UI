"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Code,
  Copy,
  Eye,
  ExternalLink,
  Lock,
  Monitor,
  Moon,
  ShoppingCart,
  Smartphone as SmartphoneIcon,
  Sparkles,
  Sun,
  Tablet as TabletIcon,
} from "lucide-react";
import type { MarketplaceTemplate } from "@/lib/catalog/templates";
import { cn } from "@/lib/utils";

function getTemplateCode(tmpl: MarketplaceTemplate): string {
  if (tmpl.slug === "talent-hub-landing") {
    return `// ${tmpl.title} — Production Template
// Stack: ${tmpl.techStack.join(", ")}
// Pages: ${tmpl.pages.join(", ")}

import type { Metadata } from "next";
import { TalentHubPage } from "@/components/templates/talent-hub-page";

export const metadata: Metadata = {
  title: "TalentHub — Scale Faster with Unicorn Talent",
  description:
    "World-class Admin, Ops, Marketing, Support & Finance talent " +
    "from the Philippines and LATAM at 60–70% less.",
  openGraph: {
    title: "TalentHub",
    description: "Unicorn talent at 70% less.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <TalentHubPage />;
}`;
  }

  if (tmpl.slug === "startup-landing-page") {
    return `// ${tmpl.title} — Production Template
// Stack: ${tmpl.techStack.join(", ")}
// Pages: ${tmpl.pages.join(", ")}

import type { Metadata } from "next";
import { StartupLandingPage } from "@/components/templates/startup-landing-page";

export const metadata: Metadata = {
  title: "Launchly — Launch your startup with a landing page that feels alive",
  description:
    "Ship beautiful, high-converting landing pages in hours. " +
    "Built for founders who care about design, performance, and growth from day one.",
  openGraph: {
    title: "Launchly",
    description: "The fastest way to launch a startup landing page that converts.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <StartupLandingPage />;
}`;
  }

  if (tmpl.slug === "nova-landing-page") {
    return `// ${tmpl.title} — Production Template
// Stack: ${tmpl.techStack.join(", ")}
// Pages: ${tmpl.pages.join(", ")}

import type { Metadata } from "next";
import { NovaLandingPage } from "@/components/templates/nova-landing-page";

export const metadata: Metadata = {
  title: "Nova — The AI that thinks with you",
  description:
    "Next-generation AI model built for the way you actually work. " +
    "Reasoning, creating, coding, and deciding alongside you in real time.",
  openGraph: {
    title: "Nova AI",
    description: "Intelligence, reimagined.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <NovaLandingPage />;
}`;
  }

  if (tmpl.slug === "simplistic-saas-template") {
    return `// ${tmpl.title} — Production Template
// Stack: ${tmpl.techStack.join(", ")}
// Pages: ${tmpl.pages.join(", ")}

import type { Metadata } from "next";
import { SimplisticSaaSPage } from "@/components/templates/simplistic-saas-page";

export const metadata: Metadata = {
  title: "Your Product — AI that works while you sleep",
  description:
    "Deploy intelligent agents in minutes. Automate workflows, " +
    "analyse data, and ship faster with our AI-native platform.",
  openGraph: {
    title: "Your Product",
    description: "The AI platform for ambitious teams.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <SimplisticSaaSPage />;
}`;
  }

  return `// ${tmpl.title} — Production Template
// Stack: ${tmpl.techStack.join(", ")}
// Pages: ${tmpl.pages.join(", ")}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${tmpl.title}",
  description: "${tmpl.description}",
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background antialiased">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            ${tmpl.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            ${tmpl.description}
          </p>
        </div>
      </section>

      {/* Full source included after All-Access purchase */}
    </main>
  );
}`;
}

function LockedCodeRow({ w }: { w: string }) {
  return <div className={`h-3 rounded-full bg-zinc-800 opacity-60 ${w}`} />;
}

export function FullPreviewShell({ tmpl }: { tmpl: MarketplaceTemplate }) {
  const [mode, setMode] = React.useState<"preview" | "code">("preview");
  const [viewport, setViewport] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = React.useState(false);
  const [isDark, setIsDark] = React.useState(true);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const code = getTemplateCode(tmpl);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    // Toggle shell
    document.documentElement.classList.toggle("dark", nextDark);
    // Sync iframe via postMessage
    iframeRef.current?.contentWindow?.postMessage(
      { type: "nexus-theme", dark: nextDark },
      "*",
    );
  };

  const iframeContainerClass = cn(
    "transition-all duration-500 ease-out",
    viewport === "desktop" && "w-full",
    viewport === "tablet" && "mx-auto max-w-[768px] border-x border-border/50 shadow-2xl rounded-xl overflow-hidden my-3",
    viewport === "mobile" && "mx-auto max-w-[375px] border-x border-border/50 shadow-2xl rounded-2xl overflow-hidden my-6",
  );

  return (
    <div className="relative min-h-screen bg-background">

      {/* ── Preview canvas ── */}
      <AnimatePresence mode="wait">
        {mode === "preview" ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={iframeContainerClass}
          >
            <iframe
              ref={iframeRef}
              src={`/live-preview/template/${tmpl.slug}`}
              className="w-full border-0"
              style={{ minHeight: "100vh" }}
              title={`${tmpl.title} Live Preview`}
              loading="eager"
            />
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6"
          >
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
              {/* Title bar */}
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-400/90" />
                    <span className="size-2.5 rounded-full bg-amber-400/90" />
                    <span className="size-2.5 rounded-full bg-emerald-400/90" />
                  </span>
                  <span className="font-mono text-xs text-zinc-400">
                    src/app/(template)/{tmpl.slug}/page.tsx
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Code + sidebar */}
              <div className="grid md:grid-cols-[200px_1fr]">
                {/* File tree */}
                <div className="border-b border-zinc-800 bg-zinc-900/50 p-4 font-mono text-xs text-zinc-500 space-y-1.5 md:border-b-0 md:border-r">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Files
                  </p>
                  {[
                    { icon: "📄", name: "page.tsx", active: true },
                    { icon: "📄", name: "layout.tsx" },
                    { icon: "📄", name: "globals.css" },
                    { icon: "📁", name: "components/" },
                    { icon: "", name: "├─ hero.tsx", indent: true },
                    { icon: "", name: "├─ bento.tsx", indent: true },
                    { icon: "", name: "├─ navbar.tsx", indent: true },
                    { icon: "", name: "└─ footer.tsx", indent: true },
                    { icon: "📁", name: "lib/" },
                    { icon: "📄", name: "tailwind.css" },
                  ].map((f) => (
                    <div
                      key={f.name}
                      className={cn(
                        "cursor-default truncate",
                        f.indent && "pl-3",
                        f.active ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300",
                      )}
                    >
                      {f.icon} {f.name}
                    </div>
                  ))}
                </div>

                {/* Code pane */}
                <div className="relative overflow-x-auto bg-zinc-950 p-4 sm:p-6">
                  <pre className="text-xs font-mono leading-relaxed text-zinc-300 whitespace-pre">
                    {code}
                  </pre>

                  {tmpl.premium && (
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-8 pt-32 bg-linear-to-t from-zinc-950 via-zinc-950/90 to-transparent">
                      <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900 px-6 py-5 text-center shadow-2xl max-w-xs">
                        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30">
                          <Lock className="size-5 text-amber-400" />
                        </div>
                        <p className="text-sm font-semibold text-white">Full source unlocked</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          Get All-Access to download every file, component, and config.
                        </p>
                        <Link
                          href="/pricing"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
                        >
                          <Sparkles className="size-3.5 text-amber-500" />
                          Unlock All-Access
                        </Link>
                      </div>
                      <div className="mt-6 w-full space-y-2 px-6 opacity-30 select-none">
                        <LockedCodeRow w="w-2/3" />
                        <LockedCodeRow w="w-full" />
                        <LockedCodeRow w="w-4/5" />
                        <LockedCodeRow w="w-3/4" />
                        <LockedCodeRow w="w-5/6" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2 text-center text-[11px] text-zinc-500">
                {tmpl.premium
                  ? "Full source · All-Access license · Instant download after purchase"
                  : "MIT license · Zero attribution required · Ready to deploy"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════
          FLOATING CONTROL DOCK
      ════════════════════════════════════════════ */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-border/40 bg-white/95 px-2.5 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-md dark:bg-zinc-900/95 dark:border-white/10 text-foreground sm:gap-1.5">

          {/* Back to detail page */}
          <Link
            href={`/templates/${tmpl.slug}`}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/5 sm:gap-1.5 sm:px-3"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline max-w-25 truncate">{tmpl.title}</span>
            <span className="sm:hidden text-[11px]">Back</span>
          </Link>

          <div className="h-4 w-px bg-border/60" />

          {/* Preview / Code toggle */}
          <div className="flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5 dark:bg-white/3">
            <button
              onClick={() => setMode("preview")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition",
                mode === "preview"
                  ? "bg-background text-foreground shadow-sm dark:bg-zinc-800"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Eye className="size-3" />
              Preview
            </button>
            <button
              onClick={() => setMode("code")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition",
                mode === "code"
                  ? "bg-background text-foreground shadow-sm dark:bg-zinc-800"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Code className="size-3" />
              Code
              {tmpl.premium && <Lock className="ml-0.5 size-2.5 text-amber-500/80" />}
            </button>
          </div>

          <div className="h-4 w-px bg-border/60" />

          {/* Viewport controls */}
          <div className="flex items-center gap-0.5">
            {(["desktop", "tablet", "mobile"] as const).map((vp) => {
              const Icon =
                vp === "desktop" ? Monitor : vp === "tablet" ? TabletIcon : SmartphoneIcon;
              return (
                <button
                  key={vp}
                  onClick={() => { setMode("preview"); setViewport(vp); }}
                  title={`${vp} view`}
                  className={cn(
                    "rounded-full p-1.5 transition",
                    vp === "tablet" && "hidden sm:inline-flex",
                    viewport === vp && mode === "preview"
                      ? "bg-muted text-foreground dark:bg-white/10"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                </button>
              );
            })}
          </div>

          <div className="hidden h-4 w-px bg-border/60 sm:block" />

          {/* Utilities */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => window.open(`/live-preview/template/${tmpl.slug}`, "_blank")}
              title="Raw fullscreen"
              className="hidden rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground dark:hover:bg-white/5 sm:inline-flex"
            >
              <ExternalLink className="size-3.5" />
            </button>
            <Link
              href="/pricing"
              title="Get All-Access"
              className="hidden rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground dark:hover:bg-white/5 sm:inline-flex"
            >
              <ShoppingCart className="size-3.5" />
            </Link>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground dark:hover:bg-white/5"
            >
              {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
          </div>

          {/* Purchase pill */}
          <div className="pl-1">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:gap-1.5 sm:px-4"
            >
              <Sparkles className="size-3 fill-current text-amber-400 dark:text-amber-500 sm:size-3.5" />
              All Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

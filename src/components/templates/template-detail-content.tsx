"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Monitor,
  Tablet as TabletIcon,
  Smartphone as SmartphoneIcon,
  Share2,
  ShoppingCart,
  Moon,
  Sun,
  Lock,
  Eye,
  Code,
  Copy,
  Check,
  ExternalLink,
  Layers,
} from "lucide-react";
import type { MarketplaceTemplate } from "@/lib/catalog/templates";
import { LandingPage } from "@/components/marketing/landing-page";
import { SimplisticSaaSPage } from "@/components/templates/simplistic-saas-page";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";
import { cn } from "@/lib/utils";

export function TemplateDetailContent({ tmpl }: { tmpl: MarketplaceTemplate }) {
  const [mode, setMode] = React.useState<"preview" | "code">("preview");
  const [viewport, setViewport] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = React.useState(false);
  const [isDark, setIsDark] = React.useState(true);

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSimulatedTheme = () => {
    setIsDark((prev) => !prev);
    // Directly inject or simulate theme toggling onto document root if supported
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark");
    }
  };

  // Determine viewport styles for smooth animated frame scaling
  const getViewportContainerStyles = () => {
    if (viewport === "desktop") return "w-full transition-all duration-500 ease-out";
    if (viewport === "tablet")
      return "max-w-[768px] mx-auto border-x border-border shadow-2xl transition-all duration-500 ease-out bg-background my-4 rounded-xl overflow-hidden";
    if (viewport === "mobile")
      return "max-w-[375px] mx-auto border-x border-border shadow-2xl transition-all duration-500 ease-out bg-background my-8 rounded-2xl overflow-hidden";
  };

  return (
    <div className="relative min-h-screen w-full bg-background pb-32">
      {/* ── Main Canvas Viewport ── */}
      <div className={cn(getViewportContainerStyles())}>
        <AnimatePresence mode="wait">
          {mode === "preview" ? (
            <motion.div
              key="preview-canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Render using an iframe to ensure Tailwind breakpoints work correctly inside the responsive container */}
              <iframe
                src={`/live-preview/template/${tmpl.slug}`}
                className="w-full h-full border-0 min-h-screen"
                title={`${tmpl.title} Preview`}
                loading="lazy"
              />
            </motion.div>
          ) : (
            /* ── Source Code IDE Profile View ── */
            <motion.div
              key="code-canvas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-6xl p-4 pt-16 sm:p-6 sm:pt-20"
            >
              <div className="overflow-hidden rounded-3xl border border-border/80 bg-zinc-950 shadow-2xl">
                {/* Header bar */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex gap-1.5">
                      <span className="size-2.5 rounded-full bg-red-400/90" />
                      <span className="size-2.5 rounded-full bg-amber-400/90" />
                      <span className="size-2.5 rounded-full bg-emerald-400/90" />
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      src/app/(site)/templates/{tmpl.slug}/bundle.manifest.ts
                    </span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Bundle</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy Code Manifest</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Content tree */}
                <div className="grid md:grid-cols-4">
                  {/* Internal tree pane */}
                  <div className="border-b border-zinc-800 bg-zinc-900/50 p-4 md:border-b-0 md:border-r text-xs font-mono text-zinc-500 space-y-2">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pb-1">
                      Bundle Tree
                    </p>
                    <div className="text-primary hover:underline cursor-pointer">
                      📄 page.tsx
                    </div>
                    <div className="text-zinc-300 hover:underline cursor-pointer">
                      📄 layout.tsx
                    </div>
                    <div className="text-zinc-300 hover:underline cursor-pointer">
                      📄 globals.css
                    </div>
                    <div className="text-zinc-300 hover:underline cursor-pointer">
                      📁 components/
                    </div>
                    <div className="pl-3 text-zinc-400">├─ hero.tsx</div>
                    <div className="pl-3 text-zinc-400">├─ bento-grid.tsx</div>
                    <div className="pl-3 text-zinc-400">├─ marquee.tsx</div>
                    <div className="pl-3 text-zinc-400">└─ navigation.tsx</div>
                    <div className="text-zinc-300">📁 lib/</div>
                  </div>

                  {/* Code editor pane */}
                  <div className="md:col-span-3 bg-zinc-950 p-4 sm:p-6 overflow-x-auto text-xs font-mono leading-relaxed text-zinc-300">
                    <pre>{`// Nexus-UI Component Layout Manifest
// Automatically generated static structure bundle for: ${tmpl.title}

import * as React from "react";
import { motion } from "framer-motion";
import { Container, Button, BentoGrid } from "@/components/ui";

export default function TemplateRoot() {
  return (
    <main className="relative min-h-screen bg-background antialiased">
      {/* High performance spring physics layout wrapper */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold tracking-tight text-foreground"
          >
            ${tmpl.title}
          </motion.h1>
          <p className="mt-4 text-lg text-muted-foreground">
            ${tmpl.description}
          </p>
        </div>
      </section>
      
      {/* Continuous integrated code layout arrays */}
      <BentoGrid items={[...]} />
    </main>
  );
}

// Built with: ${tmpl.techStack.join(", ")}`}</pre>
                  </div>
                </div>

                <div className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-center text-[11px] text-zinc-500">
                  {tmpl.premium ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Lock className="size-3 text-amber-400" />
                      <span>Full layout components unlocked after secure verification.</span>
                    </span>
                  ) : (
                    <span>MIT Open Source usage rights apply. Ready for static export.</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Persistent Floating Control Dock ── */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 sm:gap-2 rounded-full border border-border/40 bg-white/95 px-2.5 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.12)] backdrop-blur-md dark:bg-zinc-900/95 dark:border-white/10 text-foreground">
          {/* Back Trigger */}
          <Link
            href="/templates"
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/5"
          >
            <ArrowLeft className="size-3.5" />
            <span className="max-w-[80px] sm:max-w-[130px] truncate hidden sm:inline">
              {tmpl.title}
            </span>
            <span className="sm:hidden text-[11px]">Index</span>
          </Link>

          {/* Vertical Separator */}
          <div className="h-4 w-px bg-border/60" />

          {/* Mode switchers (Preview vs Code) */}
          <div className="flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5 dark:bg-white/[0.02]">
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
              <span>Preview</span>
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
              <span>Code</span>
              {tmpl.premium && <Lock className="size-2.5 text-amber-500/80 ml-0.5" />}
            </button>
          </div>

          {/* Vertical Separator */}
          <div className="h-4 w-px bg-border/60" />

          {/* Viewport resizing triggers */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => {
                setMode("preview");
                setViewport("desktop");
              }}
              title="Desktop scaling"
              className={cn(
                "rounded-full p-1.5 transition",
                viewport === "desktop" && mode === "preview"
                  ? "bg-muted text-foreground dark:bg-white/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Monitor className="size-3.5" />
            </button>
            <button
              onClick={() => {
                setMode("preview");
                setViewport("tablet");
              }}
              title="Tablet scaling"
              className={cn(
                "rounded-full p-1.5 transition hidden sm:inline-flex",
                viewport === "tablet" && mode === "preview"
                  ? "bg-muted text-foreground dark:bg-white/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <TabletIcon className="size-3.5" />
            </button>
            <button
              onClick={() => {
                setMode("preview");
                setViewport("mobile");
              }}
              title="Smartphone scaling"
              className={cn(
                "rounded-full p-1.5 transition",
                viewport === "mobile" && mode === "preview"
                  ? "bg-muted text-foreground dark:bg-white/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <SmartphoneIcon className="size-3.5" />
            </button>
          </div>

          {/* Vertical Separator */}
          <div className="h-4 w-px bg-border/60 hidden sm:block" />

          {/* Action modules */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => window.open(window.location.href, "_blank")}
              title="Launch standalone window"
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground dark:hover:bg-white/5 hidden sm:inline-flex"
            >
              <ExternalLink className="size-3.5" />
            </button>
            <Link
              href="/pricing"
              title="Secure shopping cart"
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground dark:hover:bg-white/5 hidden sm:inline-flex"
            >
              <ShoppingCart className="size-3.5" />
            </Link>
            <button
              onClick={toggleSimulatedTheme}
              title="Toggle theme profiles"
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground dark:hover:bg-white/5"
            >
              {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>
          </div>

          {/* Far Right Fulfillment Pill */}
          <div className="pl-1">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-zinc-950 px-3 sm:px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <Sparkles className="size-3 sm:size-3.5 fill-current text-amber-400 dark:text-amber-500" />
              <span>All Access</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

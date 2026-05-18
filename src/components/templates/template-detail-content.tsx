"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  ExternalLink,
  Mail,
  ShoppingCart,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import type { MarketplaceTemplate } from "@/lib/catalog/templates";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";
import { cn } from "@/lib/utils";

// ─── Inline tech-stack icons (simpleicons CDN — already used in codebase) ─────
const TECH_ICONS: Record<string, { slug: string; invert?: boolean; color?: string }> = {
  "Next.js":          { slug: "nextdotjs", invert: true },
  "Tailwind":         { slug: "tailwindcss", color: "#06b6d4" },
  "Tailwind CSS v4":  { slug: "tailwindcss", color: "#06b6d4" },
  "Framer Motion":    { slug: "framer", invert: true },
  "Motion":           { slug: "framer", invert: true },
  "React":            { slug: "react", color: "#61dafb" },
  "TypeScript":       { slug: "typescript", color: "#3178c6" },
  "Supabase":         { slug: "supabase", color: "#3ecf8e" },
  "Stripe":           { slug: "stripe", color: "#635bff" },
  "MDX":              { slug: "mdx", invert: true },
  "Lucide Icons":     { slug: "lucide", invert: true },
  "Sanity-ready":     { slug: "sanity", color: "#f03e2f" },
};

function TechBadge({ tech }: { tech: string }) {
  const icon = TECH_ICONS[tech];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground dark:bg-white/[0.04] transition hover:border-border hover:bg-muted/50">
      {icon ? (
        <img
          src={`https://cdn.simpleicons.org/${icon.slug}`}
          alt={tech}
          className={cn("size-3.5 shrink-0", icon.invert && "dark:invert")}
          style={icon.color ? { filter: `none` } : undefined}
        />
      ) : (
        <span className="size-3.5 shrink-0 rounded-sm bg-primary/20" />
      )}
      {tech}
    </span>
  );
}

// ─── Page card accent themes ──────────────────────────────────────────────────
const PAGE_BG = [
  { bg: "from-cyan-950/80 via-zinc-950 to-zinc-950", accent: "text-cyan-400" },
  { bg: "from-violet-950/80 via-zinc-950 to-zinc-950", accent: "text-violet-400" },
  { bg: "from-emerald-950/80 via-zinc-950 to-zinc-950", accent: "text-emerald-400" },
  { bg: "from-amber-950/80 via-zinc-950 to-zinc-950", accent: "text-amber-400" },
];

function ScreenshotCard({
  label,
  index,
  slug,
  reduce,
}: {
  label: string;
  index: number;
  slug: string;
  reduce: boolean;
}) {
  const theme = PAGE_BG[index % PAGE_BG.length];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "overflow-hidden rounded-2xl border border-white/6",
        `bg-linear-to-b ${theme.bg}`,
        "shadow-xl shadow-black/30",
      )}
    >
      {/* Thumbnail viewport — no chrome */}
      <div className="relative h-64 overflow-hidden">
        <div className="pointer-events-none origin-top-left scale-[0.42] w-[238%] will-change-transform">
          <TemplateSceneLoader slug={slug} />
        </div>
      </div>

      {/* Label */}
      <div className="flex items-center justify-between border-t border-white/6 bg-white/2 px-4 py-2.5">
        <span className={cn("text-xs font-semibold", theme.accent)}>{label}</span>
        <span className="font-mono text-[10px] text-white/20">
          {index === 0 ? "/" : `/${label.toLowerCase()}`}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Feature descriptions ─────────────────────────────────────────────────────
const FEATURE_COPY: Record<string, string> = {
  "AI agent hero with live motion effects": "A cinematic, full-viewport hero section with particle physics and spring-animated headline copy tuned for AI narratives.",
  "Asymmetrical bento feature grid": "Five-cell bento layout with hover-reactive illustrations and per-cell accent gradients that adapt to light and dark mode.",
  "Multi-device capability matrix": "Animated side-by-side device showcase — desktop, tablet, and phone — rendered with real responsive breakpoints.",
  "Logo marquee trust strip": "Infinite-scroll marquee of client and partner logos with reduced-motion fallback.",
  "Tiered pricing with toggle": "Monthly/annual billing toggle with animated card transitions and highlighted recommended tier.",
  "FAQ accordion with spring physics": "Smooth-opening accordion built with Framer Motion spring stiffness and damping for a premium tactile feel.",
  "Tailwind CSS v4 design tokens": "All colours, spacing, and radii defined as CSS custom properties using the oklch colour system.",
  "Framer Motion microinteractions": "Button hover, card lift, scroll-reveal, and stagger entrance animations using Framer Motion v12.",
  "TypeScript strict mode": "Full type coverage — props, catalog data, and utility functions are all strictly typed.",
  "Fully responsive on all viewports": "Tested on 375 px iPhone SE through 4 K desktop. Layout adapts using Tailwind's responsive prefix system.",
  "Animated hero with particle physics": "Physics-driven particle field synced to cursor movement with spring-based velocity alignment.",
  "Social proof logo carousel": "Continuous marquee strip with configurable speed and pause-on-hover behaviour.",
  "Bento metrics grid with motion": "Four-cell bento with counter animations and hover-lift interactions.",
  "Pricing toggle (monthly / annual)": "Animated pill toggle that transitions price copy with a staggered fade.",
  "Testimonial scroll rail": "Infinite horizontal rail of testimonial cards with drag-to-scroll support.",
  "SEO-optimised metadata": "Next.js Metadata API configured with OpenGraph, Twitter card, and canonical tags.",
  "Dark mode + light mode": "System-preference detection with manual override persisted to localStorage.",
  "Fully responsive layout": "Mobile-first grid using Tailwind's responsive prefix system, tested from 375 px to 4 K.",
  "3D Transforms": "CSS perspective and rotateX/Y/Z transforms power card flips, tilt effects, and depth-layered hero compositions.",
  "A11y Optimized": "WCAG 2.1 AA compliant — proper ARIA roles, keyboard navigation, focus rings, reduced-motion support, and colour contrast.",
  "Animations & Effects": "Scroll-triggered reveals, staggered entrances, blur-to-clear transitions, and hover microinteractions via Framer Motion v12.",
  "Automated SEO": "Next.js Metadata API pre-configured with titles, descriptions, OpenGraph, Twitter cards, and canonical URLs per page.",
  "Built-in Analytics": "Analytics event hooks wired to page views and CTA clicks — drop in your Plausible, Posthog, or GA4 token and go.",
  "CMS": "Content structured as typed TypeScript config objects for easy copy updates without touching layout or component code.",
  "Components": "40+ pre-built UI primitives — buttons, cards, badges, inputs, modals, tabs, and more — all dark-mode ready.",
  "Forms": "Contact and waitlist forms with client-side validation, accessible error states, and a submit handler ready to wire to any API.",
  "Layout Templates": "Named layout presets (hero, features, pricing, FAQ, CTA) that can be mixed and reordered with minimal prop changes.",
  "Overlays & Modals": "AnimatePresence-powered dialogs, drawers, and full-screen overlays with keyboard-dismissal and scroll-lock built in.",
  "Project Styles": "Global design tokens (colours, spacing, radii, shadows) defined as CSS custom properties for one-file brand theming.",
  "Slideshows/Tickers": "Auto-scrolling logo marquees and testimonial rails with configurable speed, gap, and pause-on-hover behaviour.",
  "Sticky Scrolling": "Sticky-left process section where the heading pins while step cards scroll past — built with CSS position:sticky.",
  "Visual Breakpoints": "Tailwind responsive prefixes cover sm/md/lg/xl/2xl with tested layouts from 375 px iPhone SE to 4 K desktop.",
};
function featureDesc(f: string) {
  return FEATURE_COPY[f] ?? "Production-ready and fully customisable out of the box.";
}

// ─── Add-to-Cart modal ────────────────────────────────────────────────────────
function AddToCartModal({
  tmpl,
  onClose,
}: {
  tmpl: MarketplaceTemplate;
  onClose: () => void;
}) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Redirect to pricing / Stripe after brief delay
    setTimeout(() => { window.location.href = "/pricing"; }, 600);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="size-4" />
          </button>

          <div className="p-6">
            {/* Product row */}
            <div className="flex items-start gap-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              {/* Tiny preview thumbnail */}
              <div className="relative size-16 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shrink-0 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="origin-top-left scale-[0.12] w-[833%] will-change-transform pointer-events-none">
                  <TemplateSceneLoader slug={tmpl.slug} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-white text-sm leading-snug">{tmpl.title}</p>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">$49</span>
                  <span className="text-sm text-zinc-400 line-through">$79</span>
                  <span className="ml-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Save 38%
                  </span>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="py-4 text-center space-y-1">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Paying a total of <span className="font-bold text-zinc-900 dark:text-white">$49</span> for <span className="font-bold text-zinc-900 dark:text-white">1 product</span>
              </p>
              <p className="text-xs text-zinc-400">
                Download with{" "}
                <Link href="/pricing" onClick={onClose} className="font-semibold text-zinc-600 underline dark:text-zinc-300">
                  All Access
                </Link>{" "}
                instead?
              </p>
            </div>

            {/* Checkout form */}
            <form onSubmit={handleCheckout} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/8 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading ? "Redirecting…" : "Checkout"}
              </button>
            </form>

            <p className="mt-3 text-center text-[11px] text-zinc-400">
              The above email will be used to create your account. You will be redirected to Stripe to complete your purchase.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function TemplateDetailContent({ tmpl }: { tmpl: MarketplaceTemplate }) {
  const reduce = useReducedMotion() === true;
  const [cartOpen, setCartOpen] = React.useState(false);
  const previewHref = `/template-preview/${tmpl.slug}`;
  const pageLabels = tmpl.pageLabels?.length ? tmpl.pageLabels : tmpl.pages.slice(0, 4);
  const features = tmpl.features ?? [];

  return (
    <div className="bg-background">
      {cartOpen && <AddToCartModal tmpl={tmpl} onClose={() => setCartOpen(false)} />}

      {/* ════════ BREADCRUMB ════════ */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Templates
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/40" />
          <span className="text-xs font-medium text-foreground">{tmpl.title}</span>
        </div>
      </div>

      {/* ════════ HERO ════════ */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl space-y-6"
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {tmpl.premium ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-400">
                <Sparkles className="size-3" />
                Premium
              </span>
            ) : (
              <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-[11px] text-muted-foreground">Free</span>
            )}
            <span className="rounded-full border border-border/50 bg-muted/20 px-3 py-1 text-[11px] text-muted-foreground">{tmpl.category}</span>
            <span className="rounded-full border border-border/50 bg-muted/20 px-3 py-1 text-[11px] text-muted-foreground">{tmpl.difficulty}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{tmpl.title}</h1>

          {/* Description */}
          <p className="text-base leading-relaxed text-muted-foreground max-w-2xl">{tmpl.description}</p>

          {/* Tech stack icons */}
          <div className="flex flex-wrap gap-2">
            {tmpl.techStack.map((t) => <TechBadge key={t} tech={t} />)}
          </div>

          {/* Price + CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {/* Price display */}
            {tmpl.premium && (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">$49</span>
                <span className="text-base text-muted-foreground line-through">$79</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                  <Tag className="size-2.5" />
                  Save 38%
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/40"
              >
                <ExternalLink className="size-4" />
                Live Preview
                <ArrowUpRight className="size-3.5" />
              </a>
              {tmpl.premium ? (
                <button
                  onClick={() => setCartOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow transition hover:bg-foreground/90"
                >
                  <ShoppingCart className="size-4" />
                  Add to Cart
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow transition hover:bg-foreground/90"
                >
                  Download Free
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════ 4 PAGE SCREENSHOTS ════════ */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {pageLabels.length} pages included
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pageLabels.slice(0, 4).map((label, i) => (
            <ScreenshotCard
              key={label}
              label={label}
              index={i}
              slug={tmpl.slug}
              reduce={reduce}
            />
          ))}
        </div>
      </section>

      {/* ════════ FEATURES GRID ════════ */}
      {features.length > 0 && (
        <section className="border-t border-border/30 bg-muted/20 dark:bg-white/1">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">What&apos;s included</p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Everything you need to ship</h2>
            </motion.div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {features.map((f, i) => (
                <motion.div
                  key={f}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="space-y-1.5 rounded-2xl border border-border/50 bg-background p-5 shadow-sm dark:bg-white/2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug">{f}</h3>
                  </div>
                  <p className="pl-8 text-xs leading-relaxed text-muted-foreground">{featureDesc(f)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ SECTIONS ════════ */}
      <section className="border-t border-border/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Included sections</p>
          <div className="flex flex-wrap gap-2">
            {tmpl.sections.map((s) => (
              <span key={s} className="rounded-full border border-border/50 bg-muted/20 px-3 py-1 text-xs text-muted-foreground dark:bg-white/2">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ BOTTOM CTA ════════ */}
      <section className="border-t border-border/30 bg-linear-to-b from-primary/4 to-transparent dark:from-primary/6">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Ready to ship with {tmpl.title}?</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                One-time payment. Instant download. Everything you need to go from idea to production.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/40"
              >
                <ExternalLink className="size-3.5" />
                Live Preview
              </a>
              {tmpl.premium ? (
                <button
                  onClick={() => setCartOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow transition hover:bg-foreground/90"
                >
                  <ShoppingCart className="size-4" />
                  Add to Cart — $49
                </button>
              ) : (
                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow transition hover:bg-foreground/90">
                  <Sparkles className="size-4 text-amber-400" />
                  Get All-Access
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

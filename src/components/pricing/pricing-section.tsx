"use client";

import * as React from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ─── Data ─────────────────────────────────────────────────────────────────────
const FREE_FEATURES = [
  "Curated free components",
  "Blocks (community subset)",
  "Template live previews",
  "Community support",
];

const PRO_FEATURES = [
  "All premium templates — full source",
  "Premium motion components",
  "Full-section blocks library",
  "Commercial & client project license",
  "1-year updates included",
  "Standard email support",
  "Download & deploy — no lock-in",
];

const ALL_ACCESS_FEATURES = [
  "Everything in Pro",
  "All future template drops",
  "Lifetime updates — never expires",
  "Admin dashboard access",
  "Priority support (24–48 h)",
  "Early-access drops",
];

const TESTIMONIALS = [
  {
    quote: "Saved our team weeks of design work. The motion components alone are worth 10x the price.",
    author: "Priya Sharma",
    role: "Lead Engineer, Streamline",
    stars: 5,
  },
  {
    quote: "Best UI kit I've purchased. Clean code, premium aesthetics, and the templates are production-ready out of the box.",
    author: "James Kowalski",
    role: "Founder, Orbital",
    stars: 5,
  },
  {
    quote: "I launched my SaaS landing page in a weekend. The bento and pricing components are insanely good.",
    author: "Sofia Chen",
    role: "Indie Hacker",
    stars: 5,
  },
  {
    quote: "The Framer Motion integration is flawless. Dark mode, responsive, TypeScript — everything just works.",
    author: "Marcus Reid",
    role: "Frontend Architect, Flux",
    stars: 5,
  },
  {
    quote: "Bought it for one template, stayed for the entire component library. Lifetime deal is a no-brainer.",
    author: "Aisha Nkosi",
    role: "Product Designer, Catalyst",
    stars: 5,
  },
  {
    quote: "Why is this even this affordable? The quality rivals component libraries costing 5× more.",
    author: "Tomás Reyes",
    role: "CTO, Prism Co",
    stars: 5,
  },
];

const FAQ_ITEMS = [
  {
    q: "Is this a one-time payment or subscription?",
    a: "Both options exist. The Lifetime plan is a single one-time payment that gives you permanent access — no renewals, no surprise charges. A monthly subscription is also available if you prefer.",
  },
  {
    q: "What do I get after purchasing?",
    a: "Instant access to every template, component, and block in the library. You can download the full source code, use it in unlimited projects, and access all future additions included in your plan.",
  },
  {
    q: "Can I use this in client projects?",
    a: "Yes. The All-Access license covers unlimited commercial and client projects while your plan is active. Build and ship as many products as you want.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day evaluation period for lifetime purchases. If you're not satisfied within 7 days, contact support and we'll process a full refund — no questions asked.",
  },
  {
    q: "How do I access the code after purchase?",
    a: "After checkout you'll receive account credentials. Log in to the dashboard, navigate to any template or component, and download the source directly. Everything is clean TypeScript with zero lock-in.",
  },
  {
    q: "Will I get future updates?",
    a: "Yes. All future template drops, new components, and blocks are included in your plan. A changelog ships with every release so you can stay on top of what's new.",
  },
];

// ─── Avatar placeholder ────────────────────────────────────────────────────────
const AVATAR_INITIALS = ["PS", "JK", "SC", "MR", "AN", "TR", "LF", "DV"];
const AVATAR_COLOURS = [
  "bg-cyan-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  "bg-fuchsia-500", "bg-sky-500", "bg-rose-500", "bg-teal-500",
];

function Avatar({ i }: { i: number }) {
  return (
    <div className={cn("flex size-7 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-background", AVATAR_COLOURS[i % AVATAR_COLOURS.length])}>
      {AVATAR_INITIALS[i % AVATAR_INITIALS.length]}
    </div>
  );
}

// ─── Pricing section ─────────────────────────────────────────────────────────
export function PricingSection() {
  const reduce = useReducedMotion() === true;

  async function checkout(tier: "pro" | "lifetime") {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Checkout unavailable"); return; }
      if (data.url) window.location.href = data.url;
      else toast.error("No checkout URL returned");
    } catch {
      toast.error("Network error");
    }
  }

  return (
    <div className="bg-background">

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-border/30">
        {/* Background glows */}
        <div className="pointer-events-none absolute -left-40 -top-40 size-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 size-[400px] rounded-full bg-fuchsia-500/5 blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-[11px] font-semibold text-primary dark:border-cyan-400/20 dark:bg-cyan-400/8 dark:text-cyan-300">
              <Zap className="size-3.5" />
              Simple, one-time pricing
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Pay once.{" "}
              <span className="bg-linear-to-r from-cyan-500 via-sky-400 to-fuchsia-500 bg-clip-text text-transparent dark:from-cyan-300 dark:to-fuchsia-300">
                Ship forever.
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
              One payment unlocks every template, component, and block — plus all future additions. No subscriptions unless you want one.
            </p>

            {/* Social proof strip */}
            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
              <div className="flex -space-x-2">
                {[...Array(8)].map((_, i) => <Avatar key={i} i={i} />)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Loved by <span className="font-semibold text-foreground">12,000+</span> developers
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING CARDS
      ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-6 lg:items-stretch">

          {/* Starter — free */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col rounded-3xl border border-border/60 bg-muted/20 p-8 dark:bg-white/2.5"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Starter</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">$0</p>
              <p className="mt-1 text-sm text-muted-foreground">Free forever. No card required.</p>

              <div className="mt-8 space-y-3">
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="size-4 shrink-0 text-muted-foreground/60" />
                    {f}
                  </div>
                ))}
                {["Premium template source", "Commercial license", "Priority support"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground/35">
                    <X className="size-4 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-8">
              <Link
                href="/components"
                className="block w-full rounded-xl border border-border/70 bg-background py-2.5 text-center text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/40"
              >
                Browse free catalog
              </Link>
            </div>
          </motion.div>

          {/* Pro — $99 */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col overflow-hidden rounded-3xl border border-primary/40 bg-linear-to-br from-primary/6 via-background to-background p-8 shadow-xl shadow-primary/5"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />

            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Pro</p>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Most popular
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-foreground">$99</span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Full source. Ship unlimited projects.</p>

              <div className="mt-8 space-y-3">
                {PRO_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-foreground/90">
                    <Check className="size-4 shrink-0 text-primary" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => checkout("pro")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-background shadow transition hover:bg-foreground/90"
              >
                <Sparkles className="size-4 text-amber-400" />
                Get Pro — $99
              </button>
            </div>
          </motion.div>

          {/* All-Access — $149 lifetime */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-linear-to-br from-amber-500/6 via-background to-fuchsia-500/6 p-8 shadow-xl shadow-amber-500/5"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-500/50 to-transparent" />
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-amber-500/6 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">All-Access</p>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500 dark:text-amber-400">
                  Best value
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-foreground">$149</span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Everything, forever. One payment.</p>

              <div className="mt-8 space-y-3">
                {ALL_ACCESS_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-foreground/90">
                    <Check className="size-4 shrink-0 text-amber-500 dark:text-amber-400" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-auto pt-8 space-y-3">
              <button
                type="button"
                onClick={() => checkout("lifetime")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-background shadow transition hover:bg-foreground/90"
              >
                <Sparkles className="size-4 text-amber-400" />
                Get Lifetime Access — $149
              </button>
              <Link
                href="/login"
                className="block w-full rounded-xl border border-border/60 bg-background/50 py-2.5 text-center text-sm font-medium text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
              >
                Sign in to existing account
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Template individual note ── */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Want just one template?{" "}
          <Link href="/templates" className="font-medium text-foreground underline underline-offset-2 hover:no-underline">
            Browse templates
          </Link>{" "}
          — individual purchases start at $49.
        </p>
      </section>

      {/* ═══════════════════════════════════════
          FEATURE TABLE
      ═══════════════════════════════════════ */}
      <section className="border-t border-border/30 bg-muted/10">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <h2 className="mb-8 text-center text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Everything compared
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Feature</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Free</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">Pro</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-500">All-Access</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Animated components", "Limited set", "All — 80+", "All — 80+"],
                  ["Page templates", "Preview only", "Full source", "Full source"],
                  ["Full-section blocks", "Community", "All variants", "All variants"],
                  ["Commercial license", false, true, true],
                  ["Updates", false, "1 year", "Lifetime"],
                  ["Admin dashboard", false, false, true],
                  ["Future template drops", false, false, true],
                  ["Priority support", false, false, true],
                ].map(([feat, free, pro, allAccess], i) => (
                  <tr key={String(feat)} className={cn("border-b border-border/30 last:border-0", i % 2 === 1 && "bg-muted/15")}>
                    <td className="px-5 py-3 font-medium text-foreground">{feat}</td>
                    <td className="px-5 py-3 text-center">
                      {typeof free === "boolean"
                        ? free ? <Check className="mx-auto size-4 text-emerald-500" /> : <X className="mx-auto size-4 text-muted-foreground/30" />
                        : <span className="text-xs text-muted-foreground">{free}</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {typeof pro === "boolean"
                        ? pro ? <Check className="mx-auto size-4 text-primary" /> : <X className="mx-auto size-4 text-muted-foreground/30" />
                        : <span className="text-xs font-medium text-foreground">{pro}</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {typeof allAccess === "boolean"
                        ? allAccess ? <Check className="mx-auto size-4 text-amber-500" /> : <X className="mx-auto size-4 text-muted-foreground/30" />
                        : <span className="text-xs font-semibold text-foreground">{allAccess}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="border-t border-border/30">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-2 flex justify-center gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Loved by thousands of developers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Real feedback from teams shipping real products.
            </p>
          </motion.div>

          <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.author}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className="mb-5 break-inside-avoid rounded-2xl border border-border/50 bg-background p-5 shadow-sm dark:bg-white/2.5"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <div className={cn("flex size-7 items-center justify-center rounded-full text-[9px] font-bold text-white", AVATAR_COLOURS[i % AVATAR_COLOURS.length])}>
                    {t.author.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t.author}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ
      ═══════════════════════════════════════ */}
      <section className="border-t border-border/30 bg-muted/10">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <p className="mb-10 text-center text-sm text-muted-foreground">
            Everything you need to know before purchasing.
          </p>
          <Accordion className="w-full" defaultValue={["faq-0"]}>
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`} className="border-border/50">
                <AccordionTrigger className="text-left text-[15px] font-medium text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BOTTOM CTA
      ═══════════════════════════════════════ */}
      <section className="border-t border-border/30 bg-linear-to-b from-primary/4 to-transparent">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary dark:border-cyan-400/20 dark:text-cyan-300">
              <Sparkles className="size-3.5" />
              One-time payment. Unlimited access.
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Start building today
            </h2>
            <p className="text-base text-muted-foreground">
              Join 12,000+ developers shipping faster with premium templates and components.
            </p>
            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
              <button
                onClick={() => checkout("lifetime")}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-background shadow-lg transition hover:bg-foreground/90"
              >
                <Sparkles className="size-4 text-amber-400" />
                Get All-Access — $149
              </button>
              <Link
                href="/templates"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted/40"
              >
                <ExternalLink className="size-4" />
                Browse templates first
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

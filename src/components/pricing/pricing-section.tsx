"use client";

import * as React from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Check, Sparkles, X, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const COMPARE_ROWS = [
  { feature: "Animated components", starter: "Limited", premium: "All" },
  { feature: "Page templates", starter: "Preview only", premium: "Download + source" },
  { feature: "Full-section blocks", starter: "Subset", premium: "All variants" },
  { feature: "Commercial use", starter: "Scoped", premium: "Broad license" },
  { feature: "Priority updates", starter: false, premium: true },
  { feature: "Admin dashboard", starter: false, premium: true },
];

const FAQ_ITEMS = [
  {
    q: "Do you offer refunds?",
    a: "We honour Stripe's refund window for subscription mistakes. Lifetime purchases include a 7-day evaluation policy.",
  },
  {
    q: "Can I use components in open-source projects?",
    a: "Marketing components can ship in public repos when attributed. Premium source is licensed for private and commercial apps.",
  },
  {
    q: "Can I use Nexus-UI in client projects?",
    a: "Premium includes a commercial license for unlimited client work while your subscription or lifetime pass is active.",
  },
  {
    q: "How do future updates work?",
    a: "Premium includes all future component drops and template revisions. A changelog ships with every release.",
  },
];

export function PricingSection() {
  const [annual, setAnnual] = React.useState(true);
  const reduce = useReducedMotion() === true;

  async function checkout(mode: "subscription" | "payment") {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) { toast.error(data.error || "Checkout unavailable"); return; }
      if (data.url) window.location.href = data.url;
      else toast.error("No checkout URL returned");
    } catch {
      toast.error("Network error");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-14 md:py-20">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/25 px-6 py-12 text-center dark:bg-white/[0.025] sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-primary/6 blur-[96px]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full bg-fuchsia-500/6 blur-[80px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary dark:border-cyan-400/20 dark:bg-cyan-400/8 dark:text-cyan-300">
            <Zap className="size-3.5" />
            Simple, transparent pricing
          </div>

          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Premium access,{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-fuchsia-500 bg-clip-text text-transparent dark:from-cyan-300 dark:to-fuchsia-300">
              engineered for velocity
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Unlock every template, block, and premium component. Stripe Checkout handles billing
            — configure{" "}
            <code className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              STRIPE_PRICE_*
            </code>{" "}
            env vars to go live.
          </p>

          {/* Billing toggle */}
          <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-5 py-2.5 text-sm dark:bg-white/[0.04]">
            <Label htmlFor="annual-toggle" className="cursor-pointer text-muted-foreground">
              Monthly
            </Label>
            <Switch
              id="annual-toggle"
              checked={annual}
              onCheckedChange={setAnnual}
            />
            <Label htmlFor="annual-toggle" className="cursor-pointer font-medium text-foreground">
              Yearly
              <Badge className="ml-1.5 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-800 dark:text-emerald-100">
                Save
              </Badge>
            </Label>
          </div>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Starter */}
        <motion.div
          layout
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="h-full border-border/70 bg-muted/30 dark:bg-white/[0.025]">
            <CardHeader className="pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Starter
              </p>
              <CardTitle className="mt-1 text-2xl font-bold text-foreground">Free</CardTitle>
              <p className="text-sm text-muted-foreground">
                For side projects and evaluation.
              </p>
              <p className="mt-4 text-5xl font-bold tracking-tight text-foreground">
                $0
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-sm text-muted-foreground">
                <PricingRow positive>Curated free components</PricingRow>
                <PricingRow positive>Full-section blocks (subset)</PricingRow>
                <PricingRow positive>Community updates</PricingRow>
                <PricingRow positive>Preview-only templates</PricingRow>
                <PricingRow negative>Commercial license</PricingRow>
                <PricingRow negative>Premium motion components</PricingRow>
              </div>
              <Link
                href="/components"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-2 w-full rounded-full border-border/70",
                )}
              >
                Browse free catalog
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Premium */}
        <motion.div
          layout
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="relative h-full overflow-hidden border-primary/30 bg-gradient-to-br from-cyan-500/8 via-background to-fuchsia-500/6 lf-glow dark:from-cyan-500/10 dark:via-background dark:to-fuchsia-500/8">
            {/* Decorative orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-fuchsia-500/8 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 size-40 rounded-full bg-cyan-500/8 blur-2xl" />

            <CardHeader className="relative pb-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Premium
                </p>
                <Badge className="border-primary/35 bg-primary/12 text-[10px] text-primary">
                  Most popular
                </Badge>
              </div>
              <CardTitle className="mt-1 text-2xl font-bold text-foreground">
                {annual ? "Lifetime" : "Monthly"}
              </CardTitle>
              <p className="text-sm text-muted-foreground dark:text-cyan-50/70">
                Everything unlocked — including future drops.
              </p>
              <div className="mt-4 flex items-end gap-2">
                <p className="text-5xl font-bold tracking-tight text-foreground">
                  {annual ? "$290" : "$39"}
                </p>
                <p className="mb-1 text-sm text-muted-foreground">
                  {annual ? "one-time" : "/ month"}
                </p>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
              <div className="space-y-2.5 text-sm text-foreground/90">
                <PricingRow positive>All components, blocks & templates</PricingRow>
                <PricingRow positive>Premium motion components</PricingRow>
                <PricingRow positive>Commercial license</PricingRow>
                <PricingRow positive>Admin dashboard</PricingRow>
                <PricingRow positive>Lifetime updates (on annual)</PricingRow>
                <PricingRow positive>Priority support</PricingRow>
              </div>
              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <Button
                  className="flex-1 rounded-full bg-foreground text-background hover:bg-foreground/90"
                  type="button"
                  onClick={() => checkout(annual ? "payment" : "subscription")}
                >
                  <Sparkles className="mr-1.5 size-3.5" />
                  Checkout with Stripe
                </Button>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "flex-1 rounded-full border-border/70 text-center",
                  )}
                >
                  Sign in first
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Comparison table ── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-border/70 bg-muted/20 dark:bg-white/[0.02]">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-bold">Feature comparison</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Feature
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Starter
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-border/40",
                      i % 2 === 0 ? "bg-transparent" : "bg-muted/20 dark:bg-white/[0.01]",
                    )}
                  >
                    <td className="px-6 py-3.5 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {typeof row.starter === "boolean" ? (
                        row.starter
                          ? <Check className="size-4 text-emerald-500" />
                          : <X className="size-4 text-muted-foreground/40" />
                      ) : row.starter}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-foreground">
                      {typeof row.premium === "boolean" ? (
                        row.premium
                          ? <Check className="size-4 text-primary" />
                          : <X className="size-4 text-muted-foreground/40" />
                      ) : row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── FAQ ── */}
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
          Frequently asked questions
        </h2>
        <Accordion className="mt-8 w-full" defaultValue={["p-0"]}>
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`p-${i}`}
              className="border-border/60"
            >
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

    </div>
  );
}

function PricingRow({
  children,
  positive,
  negative,
}: {
  children: React.ReactNode;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {positive && <Check className="size-4 shrink-0 text-primary" />}
      {negative && <X className="size-4 shrink-0 text-muted-foreground/35" />}
      <span className={cn(negative && "text-muted-foreground/60")}>{children}</span>
    </div>
  );
}

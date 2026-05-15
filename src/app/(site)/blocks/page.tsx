"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Blocks, Crown } from "lucide-react";
import { blocks } from "@/lib/catalog/blocks";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const premiumCount = blocks.filter((b) => b.premium).length;
const freeCount = blocks.length - premiumCount;

export default function BlocksPage() {
  const reduce = useReducedMotion() === true;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:py-14">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/25 px-6 py-10 dark:bg-white/[0.025] sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-foreground/[0.03] blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-56 rounded-full bg-primary/6 blur-[64px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary ">
              <Blocks className="size-3.5" />
              Full-section building blocks
            </div>

            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Paste and{" "}
              <span className="text-foreground">
                choreograph.
              </span>
            </h1>

            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Marketing-grade blocks with motion variants — tuned for accessibility,
              responsive density, and App Router projects.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm dark:bg-white/[0.04]">
                {blocks.length} blocks
              </span>
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-sm dark:bg-white/[0.04]">
                {freeCount} free · {premiumCount} premium
              </span>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/15"
              >
                <Crown className="size-3.5" />
                Upgrade
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block, i) => {
          const Preview = block.Preview;
          return (
            <motion.div
              key={block.slug}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-32px" }}
              transition={{ delay: i * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduce ? undefined : { y: -5 }}
              className="h-full"
            >
              <Card className="group h-full overflow-hidden border-border/70 bg-background/80 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 dark:bg-white/[0.03] dark:hover:border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {block.name}
                      </CardTitle>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                        {block.category}
                      </p>
                    </div>
                    {block.premium ? (
                      <Badge className="shrink-0 border border-border/60 bg-muted/30 text-[10px] text-foreground">
                        Premium
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0 border-border/70 text-[10px] text-muted-foreground">
                        Free
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Preview */}
                  <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/60 ring-0 transition duration-300 group-hover:ring-2 group-hover:ring-primary/15 dark:bg-zinc-950">
                    <div className="origin-top scale-[0.9]">
                      <Preview />
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {block.description}
                  </p>

                  {/* Variants */}
                  {block.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {block.variants.map((v) => (
                        <span
                          key={v}
                          className="rounded-full border border-border/50 bg-muted/50 px-2.5 py-0.5 text-[11px] text-muted-foreground dark:bg-white/[0.03]"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/blocks/${block.slug}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full rounded-full border-border/70 text-foreground hover:border-primary/30 hover:bg-accent",
                    )}
                  >
                    Open block
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}

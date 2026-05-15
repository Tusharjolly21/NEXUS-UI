"use client";

import * as React from "react";
import { BarChart3, Layers3, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingCard } from "./GlowingCard";

export function GlowingCardsLayout({ className }: { className?: string }) {
  return (
    <section className={cn("mx-auto w-full max-w-6xl", className)}>
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-primary/85">
        Hover over the cards to see the magic.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_240px_minmax(0,1fr)] lg:grid-rows-2">
        <GlowingCard
          icon={<Sparkles className="size-4" />}
          title="Interface polish"
          description="Ship refined interactions with futuristic borders that react to every cursor movement."
          cta="View components"
          className="lg:aspect-square"
        />

        <GlowingCard
          icon={<BarChart3 className="size-4" />}
          title="Decision cockpit"
          description="Consolidate metrics, alerts, and status signals in one premium card experience."
          cta="Open dashboard"
          className="lg:col-start-1 lg:row-start-2 lg:aspect-square"
        />

        <GlowingCard
          icon={<Workflow className="size-4" />}
          title="Control rail"
          description="A tall center card that anchors your layout and keeps critical actions in focus."
          cta="Manage flow"
          tall
          className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:w-[240px]"
        />

        <GlowingCard
          icon={<ShieldCheck className="size-4" />}
          title="Security confidence"
          description="Communicate trust with clear hierarchy, subtle glow, and clean dark-mode readability."
          cta="Review policy"
          className="lg:col-start-3 lg:row-start-1 lg:aspect-square"
        />

        <GlowingCard
          icon={<Layers3 className="size-4" />}
          title="Composable systems"
          description="Mix reusable card blocks across pricing, feature sections, and product showcases."
          cta="See templates"
          className="lg:col-start-3 lg:row-start-2 lg:aspect-square"
        />
      </div>
    </section>
  );
}

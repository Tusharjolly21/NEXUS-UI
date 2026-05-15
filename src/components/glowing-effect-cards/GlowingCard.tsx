"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "./GlowingEffect";

export type GlowingCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  tall?: boolean;
  cta?: string;
};

export function GlowingCard({
  title,
  description,
  icon,
  className,
  tall = false,
  cta,
}: GlowingCardProps) {
  return (
    <GlowingEffect
      className={cn(
        "h-full rounded-2xl",
        tall ? "min-h-[220px] lg:min-h-full" : "min-h-[210px]",
        className,
      )}
      borderRadius="1rem"
      intensity={1}
      blur={16}
    >
      <div className={cn("flex h-full flex-col justify-between p-5", tall && "lg:p-6")}>
        <div className="space-y-3">
          {icon ? (
            <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-primary/10 text-primary">
              {icon}
            </span>
          ) : null}
          <h3 className="text-lg font-semibold tracking-tight text-foreground dark:text-zinc-100">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {cta ? (
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {cta}
            <ArrowUpRight className="size-3.5" />
          </span>
        ) : null}
      </div>
    </GlowingEffect>
  );
}

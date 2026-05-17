"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── BentoGrid ─────────────────────────────────────────────────────────────────

export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid w-full gap-3",
        "grid-cols-1 lg:grid-cols-3",
        "[&>*:nth-child(1)]:lg:col-span-3 [&>*:nth-child(2)]:lg:col-span-2 [&>*:nth-child(3)]:lg:col-span-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── BentoCard ─────────────────────────────────────────────────────────────────

export interface BentoCardProps {
  Icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  href?: string;
  cta?: string;
  className?: string;
  background?: React.ReactNode;
  children?: React.ReactNode;
}

export function BentoCard({
  Icon,
  name,
  description,
  href,
  cta,
  className,
  background,
  children,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.07]",
        "bg-gradient-to-b from-white/[0.06] to-white/[0.02]",
        "p-6 transition-all duration-300 hover:-translate-y-1",
        "hover:border-white/[0.14] hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/20",
        className,
      )}
    >
      {/* Background slot */}
      {background && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {background}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <Icon className="size-4 text-white/60" />
          </div>
          <h3 className="text-base font-semibold text-white">{name}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/40">{description}</p>
        </div>

        {cta && (
          <a
            href={href ?? "#"}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400/80 transition-colors hover:text-cyan-300"
          >
            {cta}
            <span className="text-base">→</span>
          </a>
        )}

        {/* Default placeholder content when no background provided */}
        {!background && children}
      </div>
    </motion.div>
  );
}
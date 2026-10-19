"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BeamFieldProps = {
  /** Content placed over the field. Defaults to a short hero. */
  children?: React.ReactNode;
  /** Number of sweeping light columns. */
  beams?: number;
  /** Beam colour (any CSS colour). */
  color?: string;
  /** Seconds for one sweep. */
  speed?: number;
  className?: string;
};

/**
 * A cinematic dark backdrop: light columns sweep slowly across a fine grid, lighting the lines they
 * pass, over a soft horizon glow. Drop any content inside.
 */
export function BeamField({ children, beams = 3, color = "#67e8f9", speed = 11, className }: BeamFieldProps) {
  const reduce = useReducedMotion();
  return (
    <section className={cn("relative isolate flex min-h-[420px] w-full items-center justify-center overflow-hidden rounded-[28px] bg-[#05070b] px-8 py-16", className)}>
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black,transparent)]" />
        <div className="absolute inset-x-0 bottom-[-35%] h-[70%] rounded-[100%] blur-3xl" style={{ background: `radial-gradient(closest-side, ${color}33, transparent)` }} />
        {Array.from({ length: beams }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-y-0 w-[180px] -translate-x-1/2"
            style={{ left: `${20 + i * (60 / Math.max(1, beams - 1))}%` }}
            animate={reduce ? undefined : { left: ["-10%", "110%"] }}
            transition={{ duration: speed + i * 3, repeat: Infinity, ease: "easeInOut", delay: i * (speed / beams), repeatType: "mirror" }}
          >
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }} />
            <div className="absolute inset-y-[10%] left-1/2 w-[120px] -translate-x-1/2 opacity-40 blur-2xl" style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }} />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#05070b_95%)]" />
      </div>

      {children ?? (
        <div className="relative max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium text-white/70 backdrop-blur">
            <span className="size-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
            Now in public beta
          </span>
          <h2 className="mt-5 text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-white [text-wrap:balance]">Observability that sees every request</h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/55">Trace a slow page to the line of code behind it, without adding a single SDK.</p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <a href="#" className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-zinc-950">
              Start tracing <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#" className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-[14px] font-medium text-white/80 hover:bg-white/5">
              Read the docs
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

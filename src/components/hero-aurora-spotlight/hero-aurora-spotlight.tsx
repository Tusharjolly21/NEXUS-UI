"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroAuroraProps = {
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Spotlight colour that follows the pointer. */
  spotlight?: string;
  className?: string;
};

/**
 * A launch hero on a slow aurora: a soft spotlight follows the pointer, the headline catches the
 * light, and a glass product card floats underneath.
 */
export function HeroAurora({
  eyebrow = "Introducing Aurora 2.0",
  title = (
    <>
      Ship cinematic <span className="bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-transparent">interfaces</span> in an afternoon
    </>
  ),
  subtitle = "Motion-native components with taste built in. Copy them, own them, and launch something people remember.",
  primary = { label: "Start building", href: "#" },
  secondary = { label: "Watch the film", href: "#" },
  spotlight = "rgba(56,189,248,0.22)",
  className,
}: HeroAuroraProps) {
  const reduce = useReducedMotion();
  const x = useMotionValue(480);
  const y = useMotionValue(200);
  const sx = useSpring(x, { stiffness: 120, damping: 20 });
  const sy = useSpring(y, { stiffness: 120, damping: 20 });
  const light = useMotionTemplate`radial-gradient(520px circle at ${sx}px ${sy}px, ${spotlight}, transparent 60%)`;

  return (
    <section
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      className={cn("relative isolate w-full overflow-hidden rounded-[28px] bg-[#06060a] px-8 pb-0 pt-16 text-center", className)}
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <motion.div
          className="absolute -left-[10%] top-[-30%] h-[70%] w-[60%] rounded-full bg-[#4f46e5] opacity-40 blur-[110px]"
          animate={reduce ? undefined : { x: [0, 80, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-10%] top-[-20%] h-[60%] w-[55%] rounded-full bg-[#06b6d4] opacity-30 blur-[110px]"
          animate={reduce ? undefined : { x: [0, -60, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[10%] left-[30%] h-[40%] w-[40%] rounded-full bg-[#d946ef] opacity-25 blur-[120px]"
          animate={reduce ? undefined : { scale: [1, 1.2, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      </div>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: light }} />

      <motion.span
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[12.5px] font-medium text-white/80 backdrop-blur"
      >
        <Sparkles className="size-3.5 text-cyan-300" /> {eyebrow}
      </motion.span>
      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-6 max-w-2xl text-[46px] font-semibold leading-[1.02] tracking-[-0.045em] text-white [text-wrap:balance]"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.6 }}
        className="mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-white/60"
      >
        {subtitle}
      </motion.p>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.6 }}
        className="mt-8 flex items-center justify-center gap-3"
      >
        <a href={primary.href} className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-zinc-950 shadow-[0_8px_30px_-8px_rgba(255,255,255,0.5)]">
          {primary.label} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </a>
        <a href={secondary.href} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-[14px] font-medium text-white/85 backdrop-blur hover:bg-white/[0.08]">
          <Play className="size-3.5 fill-current" /> {secondary.label}
        </a>
      </motion.div>

      {/* floating product card */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-12 max-w-2xl rounded-t-[22px] border border-b-0 border-white/10 bg-white/[0.05] p-2 pb-0 backdrop-blur-xl"
        aria-hidden
      >
        <div className="rounded-t-[16px] border border-b-0 border-white/10 bg-[#0c0c12] p-4 text-left">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-white/20" />
            <span className="size-2 rounded-full bg-white/20" />
            <span className="size-2 rounded-full bg-white/20" />
            <span className="ml-3 h-5 flex-1 rounded-md bg-white/[0.04]" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["Conversion", "4.8%", "+0.9"],
              ["Sessions", "128k", "+12%"],
              ["Bounce", "31%", "-4%"],
            ].map(([k, v, d]) => (
              <div key={k} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] text-white/45">{k}</p>
                <p className="mt-1 text-[18px] font-semibold tabular-nums text-white">{v}</p>
                <p className="text-[11px] font-medium text-emerald-400">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 h-16 rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(99,102,241,0.25),rgba(6,182,212,0.15),rgba(217,70,239,0.2))]" />
        </div>
      </motion.div>
    </section>
  );
}

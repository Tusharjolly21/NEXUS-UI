"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { BookOpen, CheckCircle2, Cpu, DollarSign, Gauge, Home, LayoutGrid, Layers, Search, Shield, Sparkles, User } from "lucide-react";
import { FloatingDockDesktop } from "@/components/floating-dock";
import { BackgroundBoxes } from "@/components/background-boxes";
import { BackgroundGradient } from "@/components/background-gradient";
import { GooeyInput } from "@/components/gooey-input";
import { SignupForm } from "@/components/signup-form";
import { Sparkles as SparklesParticles } from "@/components/sparkles";
import { StatefulButton } from "@/components/stateful-button";
import { TextGenerateEffect } from "@/components/text-generate-effect";
import { TextRevealCard } from "@/components/text-reveal-card";
import { Meteors } from "@/components/meteors";
import { InfiniteMovingCards } from "@/components/infinite-moving-cards";
import { GlowingCardsLayout } from "@/components/glowing-effect-cards";
import { TypewriterEffect } from "@/components/typewriter-effect";
import { cn } from "@/lib/utils";
import { SquigglyDrinksHeadline, SquigglyText } from "@/components/squiggly-text";
import { Terminal } from "@/components/terminal";
import { EncryptedText } from "@/components/encrypted-text";
import { MacKeyboard, usePhysicalKeyboard, useKeyboardSound, MAC_ROWS, type SoundType, type KeyDef as KbKeyDef } from "@/components/keyboard";
import { ImagesBadge } from "@/components/images-badge";
import { DotGridHero } from "@/components/dot-grid-hero";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";
import { Compare } from "@/components/compare";
import { ExpandableCards } from "@/components/expandable-cards";
import type { CardItem } from "@/components/expandable-cards";
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";

export function PreviewCinematicLogoCloud() {
  const clients = [
    { name: "OpenAI", text: true, className: "font-sans font-semibold tracking-tight text-zinc-900 dark:text-white" },
    { name: "hello patient", text: true, className: "font-serif lowercase tracking-tight" },
    { name: "granola", text: true, className: "font-sans font-bold tracking-tighter" },
    { name: "character.ai", text: true, className: "font-bold tracking-tighter lowercase" },
    { name: "ORACLE", text: true, className: "font-sans font-black tracking-widest text-red-600 dark:text-red-500" },
    { name: "Portola", text: true, className: "font-serif tracking-widest uppercase" },
    { name: "Accel", text: true, className: "font-black tracking-tight" },
    { name: "Bloomberg", text: true, className: "font-sans font-black tracking-tighter text-zinc-900 dark:text-white" },
    { name: "Forbes", text: true, className: "font-serif font-bold tracking-tighter uppercase text-zinc-900 dark:text-white" },
    { name: "SoftBank", text: true, className: "font-sans font-bold tracking-tight text-zinc-900 dark:text-white" },
    { name: "The Guardian", slug: "theguardian", invertDark: true },
    { name: "WIRED", text: true, className: "font-sans font-black tracking-tighter text-zinc-900 dark:text-white" },
    { name: "hulu", text: true, className: "font-sans font-bold tracking-tighter text-[#1ce783] lowercase" },
    { name: "YouTube", slug: "youtube" },
    { name: "NETFLIX", slug: "netflix" },
    { name: "Spotify", slug: "spotify" },
    { name: "twitch", slug: "twitch" },
    { name: "Raycast", slug: "raycast" },
    { name: "Vercel", slug: "vercel", invertDark: true },
    { name: "Stripe", slug: "stripe" },
    { name: "Linear", slug: "linear", invertDark: true },
    { name: "GitHub", slug: "github", invertDark: true },
    { name: "Notion", slug: "notion", invertDark: true },
  ];

  return (
    <div className="flex w-full items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
      <div className="w-full scale-75 sm:scale-100">
        <CinematicLogoCloud clients={clients} className="bg-transparent dark:bg-transparent py-8" />
      </div>
    </div>
  );
}

// Code-to-char map used by detail-page keyboard previews
const KB_CODE_TO_CHAR: Record<string, string> = Object.fromEntries(
  MAC_ROWS.flat()
    .filter((k) => k.char && k.char !== "\t" && k.char !== "\n")
    .map((k) => [k.code, k.char]),
);

export function PreviewHeroAurora() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  }
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(56,189,248,0.35), transparent 60%)`;

  return (
    <div
      onMouseMove={onMove}
      className="relative isolate h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
    >
      <div className="lf-aurora absolute inset-0 opacity-80" />
      <motion.div style={{ backgroundImage: spotlight }} className="absolute inset-0" />
      <div className="relative flex h-full flex-col justify-end p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
          Nexus-UI
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Ship cinematic interfaces.
        </h3>
      </div>
    </div>
  );
}

export function PreviewBentoMetrics() {
  const items = [
    { label: "Latency", value: "42ms", icon: Gauge },
    { label: "Uptime", value: "99.99%", icon: Shield },
    { label: "Signals", value: "1.2M", icon: Sparkles },
    { label: "Edge", value: "12 regions", icon: Cpu },
  ];
  return (
    <div className="grid h-[220px] grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-zinc-950 p-3">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="lf-glass relative overflow-hidden rounded-2xl p-3"
        >
          <it.icon className="size-4 text-foreground/60" />
          <p className="mt-3 text-xs text-zinc-400">{it.label}</p>
          <p className="text-lg font-semibold text-white">{it.value}</p>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-foreground/5"
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function PreviewCardTilt() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-40, 40], [8, -8]), { stiffness: 260, damping: 20 });
  const ry = useSpring(useTransform(x, [-40, 40], [-8, 8]), { stiffness: 260, damping: 20 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="flex h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        className="relative h-44 w-72 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-2xl"
      >
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.25),transparent_55%)]" />
        <p className="text-xs text-foreground/55">Glass panel</p>
        <p className="mt-2 text-lg font-semibold text-white">3D hover depth</p>
        <p className="mt-2 text-sm text-zinc-400">
          Motion springs + perspective for premium product cards.
        </p>
      </motion.div>
    </div>
  );
}

export function PreviewNavbarFloating() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="lf-grid absolute inset-0 opacity-40" />
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mt-10 flex max-w-xl items-center justify-between gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700" />
          <span className="text-sm font-semibold text-white">Nexus-UI</span>
        </div>
        <div className="hidden items-center gap-4 text-xs text-zinc-300 sm:flex">
          <span>Library</span>
          <span>Templates</span>
          <span>Pricing</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900"
        >
          Get access
        </motion.button>
      </motion.div>
      <p className="absolute bottom-6 left-6 text-xs text-zinc-500">
        Floating glass navigation with spring entrance.
      </p>
    </div>
  );
}

export function PreviewPricingToggle() {
  const [annual, setAnnual] = React.useState(true);
  const price = annual ? 29 : 39;
  return (
    <div className="flex h-[220px] flex-col justify-between rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400">Premium</p>
          <p className="text-lg font-semibold text-white">Everything unlocked</p>
        </div>
        <button
          type="button"
          onClick={() => setAnnual((v) => !v)}
          className="relative h-8 w-16 rounded-full border border-white/10 bg-white/5"
        >
          <motion.span
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute top-1 left-1 h-6 w-6 rounded-full bg-foreground/20"
            animate={{ x: annual ? 0 : 32 }}
          />
        </button>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-semibold tracking-tight text-white">${price}</p>
          <p className="text-xs text-zinc-400">per seat / month</p>
        </div>
        <motion.div
          key={annual ? "a" : "m"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/50 bg-muted/40 px-3 py-2 text-xs text-foreground/80"
        >
          {annual ? "Save 20% annually" : "Flexible monthly"}
        </motion.div>
      </div>
    </div>
  );
}

export function PreviewLoaderOrbit() {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-zinc-950">
      <div className="relative size-28">
        <motion.span
          className="absolute inset-0 rounded-full border border-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-2 rounded-full border border-foreground/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-6 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/10 blur-xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
          LF
        </div>
      </div>
    </div>
  );
}

export function PreviewSpotlightPanel() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }
  const bg = useMotionTemplate`radial-gradient(240px circle at ${x}px ${y}px, rgba(244,114,182,0.35), transparent 60%)`;

  return (
    <div
      onMouseMove={onMove}
      className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6"
    >
      <motion.div style={{ backgroundImage: bg }} className="absolute inset-0" />
      <div className="relative space-y-2">
        <p className="text-xs text-zinc-400">Motion spotlight</p>
        <p className="text-xl font-semibold text-white">Trace the cursor glow</p>
        <p className="text-sm text-zinc-400">
          Subtle, performant gradients that follow interaction.
        </p>
      </div>
    </div>
  );
}

export function PreviewAiBar() {
  const [value, setValue] = React.useState("");
  return (
    <div className="flex h-[220px] flex-col justify-end rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 p-4">
      <motion.div layout className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Sparkles className="size-3 text-foreground/70" />
          Ask Nexus-UI to scaffold a hero…
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="Describe the interface you want…"
        />
        <div className="mt-2 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="rounded-full bg-foreground/90 px-3 py-1 text-xs font-semibold text-background"
          >
            Generate layout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export function PreviewTimeline() {
  const steps = ["Design", "Animate", "Ship"];
  return (
    <div className="h-[220px] rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <div className="relative pl-4">
        <div className="absolute top-1 bottom-1 left-[9px] w-px bg-white/10" />
        {steps.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="relative mb-6 flex items-center gap-3"
          >
            <span className="size-2 rounded-full bg-foreground/60" />
            <div>
              <p className="text-sm font-semibold text-white">{s}</p>
              <p className="text-xs text-zinc-500">Step {i + 1}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function PreviewFaq() {
  const [open, setOpen] = React.useState(0);
  const qs = [
    { q: "Can I use this commercially?", a: "Yes, with the premium license." },
    { q: "Does it work with App Router?", a: "Built for Next.js App Router + RSC." },
  ];
  return (
    <div className="space-y-2 rounded-3xl border border-white/10 bg-zinc-950 p-4">
      {qs.map((item, i) => (
        <button
          key={item.q}
          type="button"
          onClick={() => setOpen(i)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">{item.q}</p>
            <motion.span animate={{ rotate: open === i ? 90 : 0 }} className="text-xs text-zinc-400">
              ▸
            </motion.span>
          </div>
          {open === i ? (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 text-xs text-zinc-400"
            >
              {item.a}
            </motion.p>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function PreviewTestimonialStack() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-4 right-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
          style={{ top: 16 + i * 18 }}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 - i * 0.15 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
        >
          <p className="text-sm text-white">
            “{i === 0
              ? "The motion primitives are absurdly polished."
              : i === 1
                ? "Feels like Linear met a motion lab."
                : "We shipped our launch page in a weekend."}”
          </p>
          <p className="mt-2 text-xs text-zinc-400">Engineering lead · Series B SaaS</p>
        </motion.div>
      ))}
    </div>
  );
}

export function PreviewLoginGlass() {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 to-zinc-900 p-4">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
      >
        <p className="text-sm font-semibold text-white">Welcome back</p>
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
          placeholder="you@company.com"
        />
        <input
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
          placeholder="••••••••"
          type="password"
        />
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full rounded-xl bg-foreground py-2 text-sm font-semibold text-background"
        >
          Continue
        </motion.button>
      </motion.form>
    </div>
  );
}

export function PreviewFooterMini() {
  return (
    <div className="flex h-[220px] flex-col justify-between rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700" />
          <span className="text-sm font-semibold text-white">Nexus-UI</span>
        </div>
        <div className="flex gap-3 text-xs text-zinc-400">
          <span>Docs</span>
          <span>Changelog</span>
          <span>Status</span>
        </div>
      </div>
      <div className="flex items-end justify-between border-t border-white/10 pt-4 text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Nexus-UI</p>
        <p className="text-foreground/55">Built for builders</p>
      </div>
    </div>
  );
}

export function PreviewShaderNoise() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
        animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative flex h-full items-center justify-center text-center text-sm text-zinc-200">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-foreground/55">Shaders</p>
          <p className="mt-2 font-semibold">SVG turbulence noise field</p>
        </div>
      </div>
    </div>
  );
}

export function PreviewSidebarShell() {
  return (
    <div className="grid h-[220px] grid-cols-[92px_1fr] gap-3 rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-2">
        {["LF", "Inbox", "Ship", "Labs"].map((t, i) => (
          <motion.div
            key={t}
            whileHover={{ x: 2 }}
            className={`rounded-xl px-2 py-2 text-[11px] font-medium ${
              i === 0 ? "bg-white/10 text-white" : "text-zinc-400"
            }`}
          >
            {t}
          </motion.div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-3">
        <p className="text-xs text-zinc-400">Workspace</p>
        <p className="mt-2 text-sm font-semibold text-white">Motion dashboard shell</p>
        <div className="mt-3 h-20 rounded-xl border border-white/10 bg-black/30" />
      </div>
    </div>
  );
}

export function PreviewDashboardKpi() {
  return (
    <div className="grid h-[220px] grid-cols-3 gap-3 rounded-3xl border border-white/10 bg-zinc-950 p-3">
      {[
        { k: "Activation", v: "64%" },
        { k: "Retention", v: "81%" },
        { k: "Latency", v: "38ms" },
      ].map((c) => (
        <motion.div
          key={c.k}
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-3"
        >
          <p className="text-[11px] text-zinc-400">{c.k}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{c.v}</p>
          <div className="mt-3 h-10 rounded-lg bg-gradient-to-r from-muted/60 to-muted/40" />
        </motion.div>
      ))}
    </div>
  );
}

export function PreviewBlogRail() {
  return (
    <div className="grid h-[220px] grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs text-foreground/55">Guide</p>
        <p className="mt-2 text-sm font-semibold text-white">Designing scroll choreography</p>
        <p className="mt-2 text-xs text-zinc-500">12 min read</p>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-2">
            <div className="h-2 w-24 rounded bg-white/10" />
            <div className="mt-2 h-2 w-16 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PreviewContactSplit() {
  return (
    <div className="grid h-[220px] grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="text-sm font-semibold text-white">Talk with the team</p>
        <p className="mt-2 text-xs text-zinc-300">We help teams adopt motion systems safely.</p>
      </div>
      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        <input className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white" placeholder="Name" />
        <input className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white" placeholder="Email" />
        <motion.button whileTap={{ scale: 0.98 }} className="w-full rounded-lg bg-white py-1 text-xs font-semibold text-zinc-900">
          Request access
        </motion.button>
      </div>
    </div>
  );
}

export function PreviewCtaGlow() {
  return (
    <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        className="absolute size-40 rounded-full bg-foreground/8 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute size-40 rounded-full bg-foreground/6 blur-3xl"
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="lf-glow relative rounded-full bg-white px-6 py-2 text-sm font-semibold text-zinc-950"
      >
        Start building faster
      </motion.button>
    </div>
  );
}

export function PreviewSignupSplit() {
  return (
    <div className="grid h-[220px] grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
        <p className="text-sm font-semibold text-white">Create your workspace</p>
        <p className="mt-2 text-xs text-zinc-400">Invite engineers later.</p>
      </div>
      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        <input className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white" placeholder="Work email" />
        <input className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white" placeholder="Password" />
        <motion.button whileTap={{ scale: 0.98 }} className="w-full rounded-lg bg-foreground/20 py-1 text-xs font-semibold text-zinc-950">
          Continue
        </motion.button>
      </div>
    </div>
  );
}

export function PreviewSignupForm({ compact = true }: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-3xl border border-border bg-background p-3">
        <div className="w-full max-w-xs rounded-xl border border-border bg-card p-3 shadow-sm">
          <p className="text-sm font-semibold text-foreground">Signup Form</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Create your account</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-8 rounded-md border border-border bg-muted/30" />
            <div className="h-8 rounded-md border border-border bg-muted/30" />
          </div>
          <div className="mt-2 h-8 rounded-md border border-border bg-muted/30" />
          <div className="mt-2 h-8 rounded-md border border-border bg-muted/30" />
          <div className="mt-2 h-8 rounded-md border border-border bg-muted/30" />
          <div className="mt-3 h-8 rounded-md bg-primary/90" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-3xl border border-border p-3",
        "h-full min-h-[620px]",
      )}
    >
      <div
        className={cn(
          "card bg-base-100 shadow-sm rounded-xl border border-border bg-background",
          "w-full max-w-md",
        )}
      >
        <div className="card-body p-4 md:p-6">
          <h2 className="card-title text-lg font-semibold text-foreground">Welcome to Nexus-UI</h2>
          <p className="text-sm text-muted-foreground">
            Create your account to save favorites and access premium component docs.
          </p>
          <SignupForm
            className="w-full max-w-none border-0 bg-transparent p-0 shadow-none dark:bg-transparent"
            title="Create account"
            subtitle="Join Nexus-UI"
            submitLabel="Sign up"
            loadingLabel="Creating..."
            successLabel="Created"
            minPasswordLength={6}
            onSubmit={async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 700));
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function PreviewFeatureGrid() {
  const feats = ["Tokens", "Motion", "A11y", "SEO"];
  return (
    <div className="grid h-[220px] grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-zinc-950 p-3">
      {feats.map((f, i) => (
        <motion.div
          key={f}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-3"
        >
          <p className="text-sm font-semibold text-white">{f}</p>
          <p className="mt-1 text-xs text-zinc-400">Production-ready defaults.</p>
        </motion.div>
      ))}
    </div>
  );
}

export function PreviewBeamSweep() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <div className="lf-grid absolute inset-0 opacity-35" />
      <motion.div
        className="absolute inset-y-8 w-[2px] rounded-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_40px_rgba(34,211,238,0.55)]"
        animate={{ left: ["8%", "86%", "30%", "8%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex h-full items-center justify-center text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-foreground/55">Background</p>
          <p className="mt-2 text-sm font-semibold text-white">Beam sweep field</p>
        </div>
      </div>
    </div>
  );
}

export function PreviewSquigglyText({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={
        compact
          ? "flex min-h-[180px] w-full min-w-0 flex-col justify-center px-4 py-8"
          : "flex min-h-[260px] w-full min-w-0 flex-col items-center justify-center px-4 py-12 sm:py-16"
      }
    >
      {compact ? (
        <SquigglyText
          as="div"
          text="Motion that sells."
          textClassName="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-2xl"
          steps={5}
          stepDuration={90}
          scale={[5, 7]}
          baseFrequency={0.022}
          numOctaves={3}
        />
      ) : (
        <SquigglyDrinksHeadline />
      )}
    </div>
  );
}

const previewDockItems = [
  { title: "Home", icon: <Home />, href: "/" },
  { title: "Components", icon: <LayoutGrid />, href: "/components" },
  { title: "Templates", icon: <Layers />, href: "/templates" },
  { title: "Pricing", icon: <DollarSign />, href: "/pricing" },
  { title: "Docs", icon: <BookOpen />, href: "/docs/installation" },
  { title: "Search", icon: <Search />, href: "/search" },
  { title: "Profile", icon: <User />, href: "/login" },
];

export function PreviewFloatingDock({ compact = true }: { compact?: boolean } = {}) {
  const items = compact ? previewDockItems.slice(0, 5) : previewDockItems;
  return (
    <div
      className={cn(
        "flex w-full items-end justify-center overflow-visible rounded-xl border border-border bg-gradient-to-b from-muted/45 to-background/60 dark:from-zinc-950/85 dark:to-zinc-950/40",
        compact ? "min-h-[176px] px-4 py-6" : "min-h-[240px] px-6 py-10",
      )}
    >
      <FloatingDockDesktop
        className="relative inset-x-auto bottom-auto z-0 flex w-full max-w-2xl justify-center p-0"
        items={items}
        disableLinks
      />
    </div>
  );
}

export function PreviewStatefulButton() {
  async function fakeAction() {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1300);
    });
  }
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-border bg-muted/35 px-4 py-8 dark:bg-zinc-950/70">
      <StatefulButton
        onClick={fakeAction}
        loadingText="Send message"
        successText="Send message"
        className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 font-medium text-white ring-offset-2 transition duration-200 hover:ring-2 hover:ring-green-500 dark:ring-offset-black"
        successIcon={<CheckCircle2 className="size-4" />}
        resetDelay={1600}
      >
        Send message
      </StatefulButton>
    </div>
  );
}

export function PreviewSparklesLine({ compact = true }: { compact?: boolean } = {}) {
  const headingClass = compact ? "text-3xl" : "md:text-7xl text-3xl lg:text-9xl";
  return (
    <div className={cn("w-full", compact ? "h-[220px]" : "h-[40rem]")}>
      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
        <h1 className={cn("relative z-20 text-center font-bold text-white", headingClass)}>NEXUS-UI</h1>
        <div className={cn("relative", compact ? "h-28 w-[18rem]" : "h-40 w-[40rem]")}>
          <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
          <div className="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
          <div className="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
          <div className="h-full w-full opacity-100">
            <SparklesParticles
              className="h-full w-full"
              count={compact ? 180 : 260}
              density="high"
              color="#a8d7ff"
              minSize={0.55}
              maxSize={1.45}
              speed={1.15}
              opacity={0.95}
              direction="down"
              enableGlow
            />
          </div>
          <div className="absolute inset-0 h-full w-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
        </div>
      </div>
    </div>
  );
}

export function PreviewSparklesStarfield({ compact = true }: { compact?: boolean } = {}) {
  const headingClass = compact ? "text-2xl" : "md:text-7xl text-3xl lg:text-8xl";
  return (
    <div className={cn("w-full", compact ? "h-[220px]" : "h-[40rem]")}>
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
        <SparklesParticles
          background
          count={compact ? 96 : 145}
          density="high"
          color="#e6f3ff"
          minSize={compact ? 0.7 : 0.85}
          maxSize={compact ? 2 : 2.6}
          speed={0.95}
          opacity={1}
          direction="random"
          enableGlow
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_50%,transparent_0%,rgba(0,0,0,0.28)_100%)]" />
        <p className={cn("relative z-20 text-center font-bold text-white", headingClass)}>Build great products</p>
      </div>
    </div>
  );
}

export function PreviewSparkles({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("grid w-full gap-3", compact ? "grid-rows-2" : "grid-rows-2 gap-4")}>
      <PreviewSparklesLine compact={compact} />
      <PreviewSparklesStarfield compact={compact} />
    </div>
  );
}

export function PreviewGooeySearch() {
  return (
    <div className="flex min-h-[220px] items-center justify-center px-4 py-6">
      <GooeyInput
        placeholder="Search catalog…"
        collapsedWidth={112}
        expandedWidth={196}
        expandedOffset={56}
      />
    </div>
  );
}

export function PreviewTerminal({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className="flex h-[min(420px,58vh)] min-h-[300px] w-full flex-col">
      <Terminal
        className="min-h-0 flex-1"
        fillHeight
        theme="carbon"
        autoStart
        loop
        startupDelay={350}
        loopDelay={900}
        typingSpeed={22}
        typingJitter={28}
        delayBetweenCommands={650}
        showControls={false}
        showSoundToggle={!compact}
        enableSound={!compact}
        username="user"
        hostname="Nexus-Macbook"
        commands={[
          { input: "npm install", runDelayMs: 500, output: [{ text: "added 182 packages in 3s", tone: "muted" }] },
          { input: "pnpm dev", runDelayMs: 450, output: [{ text: "ready - http://localhost:3000", tone: "success" }] },
          { input: "git status", runDelayMs: 350, output: [{ text: "On branch main — nothing to commit", tone: "muted" }] },
          { input: "curl -I https://nexus-ui.com", runDelayMs: 400, output: [{ text: "HTTP/2 200", tone: "success" }] },
          { input: "echo \"Nexus UI\"", runDelayMs: 250, output: [{ text: "Nexus UI", tone: "info" }] },
        ]}
      />
    </div>
  );
}

export function PreviewTextGenerateEffect({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 px-5",
        compact ? "min-h-[190px]" : "min-h-[280px] py-10",
      )}
    >
      <div className="max-w-3xl text-center">
        <TextGenerateEffect
          as="h2"
          mode={compact ? "word" : "character"}
          text="Build elegant interfaces that feel alive, readable, and deeply polished from the very first impression."
          className={cn(
            "text-balance font-semibold tracking-tight text-foreground",
            compact ? "text-3xl" : "text-5xl lg:text-6xl",
          )}
          duration={0.4}
          stagger={compact ? 0.065 : 0.02}
          blur
        />
      </div>
    </div>
  );
}

export function PreviewTypewriterEffect({ compact = true }: { compact?: boolean } = {}) {
  const prefixText = "Ship delightful interfaces with ";
  const baseSpeed = compact ? 36 : 44;
  const accentDelay = prefixText.length * baseSpeed;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 px-5",
        compact ? "min-h-[190px]" : "min-h-[280px] py-10",
      )}
    >
      <div className="flex w-full justify-center text-center">
        <h2
          className={cn(
            "text-balance font-semibold tracking-tight text-foreground",
            compact ? "text-2xl" : "text-5xl lg:text-6xl",
          )}
        >
          <TypewriterEffect
            as="span"
            text={prefixText}
            typingSpeed={baseSpeed}
            deletingSpeed={0}
            pauseDuration={compact ? 900 : 1200}
            loop={false}
            showCursor={false}
          />
          <TypewriterEffect
            as="span"
            text="Nexus-UI"
            typingSpeed={compact ? 44 : 54}
            deletingSpeed={0}
            delay={accentDelay}
            pauseDuration={compact ? 900 : 1200}
            loop={false}
            className="text-primary"
            cursorClassName="bg-primary"
          />
        </h2>
      </div>
    </div>
  );
}

export function PreviewTextRevealCard({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[250px]" : "min-h-[420px] py-10",
      )}
    >
      <TextRevealCard
        title="Ship with confidence, not guesswork."
        description="Hover over the text area to see the magic."
        intensity={compact ? 1.05 : 1.2}
        className={cn(
          "w-full border-white/10 bg-[#070a14] text-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.9)]",
          compact ? "max-w-xl" : "max-w-2xl",
        )}
        revealContent="I ship the final narrative"
        revealClassName={cn(
          "border-white/10 bg-gradient-to-t from-white/5 via-white/[0.02] to-transparent",
          compact ? "[&_p]:text-4xl [&_p]:font-semibold [&_p]:tracking-tight" : "[&_p]:text-6xl [&_p]:font-semibold [&_p]:tracking-tight",
        )}
      />
    </div>
  );
}

export function PreviewMeteors({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[340px]" : "min-h-[500px] py-14",
      )}
    >
      <Meteors
        number={compact ? 18 : 28}
        minDelay={0.06}
        maxDelay={1.9}
        minDuration={2.8}
        maxDuration={5.6}
        angle={214}
        color="#93c5fd"
        intensity={compact ? "medium" : "high"}
        className={cn(
          "w-full overflow-hidden rounded-2xl border border-white/10 bg-[#050911] text-white",
          compact ? "max-w-2xl min-h-[260px] px-7 py-16" : "max-w-4xl min-h-[360px] px-10 py-24",
        )}
      >
        <div className="relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">Meteor Effect</p>
          <h3 className={cn("mt-2 font-semibold tracking-tight", compact ? "text-2xl" : "text-4xl")}>
            Diagonal cinematic beams
          </h3>
          <p className={cn("mx-auto mt-3 max-w-2xl text-slate-300/85", compact ? "text-xs" : "text-sm")}>
            Reusable motion background for heroes, cards, and pricing sections.
          </p>
        </div>
      </Meteors>
    </div>
  );
}

export function PreviewInfiniteMovingCards({ compact = true }: { compact?: boolean } = {}) {
  const items = [
    {
      id: "imc-1",
      title: "Motion-ready templates",
      description: "Seamless loops that keep content dynamic without visual jumps.",
      name: "Ariana",
      role: "Product lead",
      rating: 5,
      tags: ["Testimonials"],
    },
    {
      id: "imc-2",
      title: "Smooth and performant",
      description: "Linear marquee motion with hover pause for better readability.",
      name: "Marcus",
      role: "Frontend engineer",
      rating: 5,
      tags: ["Framer Motion"],
    },
    {
      id: "imc-3",
      title: "Built for launch pages",
      description: "Use for logo strips, reviews, case studies, and showcase rails.",
      name: "Lena",
      role: "Design manager",
      rating: 4,
      tags: ["Marketing"],
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[260px]" : "min-h-[360px] py-10",
      )}
    >
      <InfiniteMovingCards
        items={items}
        direction="left"
        speed={compact ? "normal" : "fast"}
        pauseOnHover
        className={cn("w-full", compact ? "max-w-3xl" : "max-w-5xl")}
        cardClassName={compact ? "min-w-[270px] max-w-[270px]" : "min-w-[320px] max-w-[320px]"}
      />
    </div>
  );
}

export function PreviewGlowingEffectCards({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[340px]" : "min-h-[520px] py-12",
      )}
    >
      <div className={cn("w-full", compact ? "max-w-5xl scale-[0.78] origin-center" : "max-w-6xl")}>
        <GlowingCardsLayout />
      </div>
    </div>
  );
}

export function PreviewBackgroundGradient({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("flex items-center justify-center", compact ? "min-h-[190px]" : "min-h-[260px] py-8")}>
      <BackgroundGradient
        as="section"
        className={cn("w-full rounded-2xl border-2", compact ? "max-w-md" : "max-w-sm aspect-[4/5]")}
        containerClassName={cn("rounded-[inherit] space-y-3", compact ? "p-4" : "p-7")}
        surfaceClassName="bg-white dark:bg-white"
        colors={["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]}
        animationSpeed={compact ? 1 : 1.25}
        blur={compact ? 20 : 30}
        interactive
      >
        <div className="overflow-hidden rounded-xl border-2 border-border/70">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"
            alt="Abstract UI gradient"
            className={cn(
              "h-full w-full object-cover transition duration-500",
              compact ? "max-h-32" : "max-h-48",
            )}
            loading="lazy"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Background Gradient</p>
        <h3 className={cn("font-semibold tracking-tight text-foreground", compact ? "text-lg" : "text-2xl")}>
          Animated glow wrapper for premium cards
        </h3>
        <p className={cn("leading-relaxed text-muted-foreground", compact ? "text-xs" : "text-sm")}>
          Use this component to frame cards, call-to-action blocks, and content panels with a soft animated glow while
          keeping all text highly readable on a clean inner surface.
        </p>
      </BackgroundGradient>
    </div>
  );
}

export function PreviewKeyboard({ compact = true }: { compact?: boolean } = {}) {
  const physical = usePhysicalKeyboard();
  return (
    <div className={cn(
      "flex items-center justify-center overflow-hidden rounded-xl",
      compact ? "p-4 scale-[0.72] origin-top" : "p-6",
    )}>
      <MacKeyboard
        layout="mac"
        enableSound
        volume={0.5}
        soundType="mechanical"
        activeKeys={physical}
        showFunctionRow={!compact}
        theme="dark"
      />
    </div>
  );
}

const SOUND_OPTS: { v: SoundType; l: string }[] = [
  { v: "mechanical", l: "Mechanical" },
  { v: "clicky",     l: "Clicky"     },
  { v: "soft",       l: "Soft"       },
];

export function PreviewKeyboardWithSoundDetail({ compact = true }: { compact?: boolean } = {}) {
  const [text,        setText]        = React.useState("");
  const [muted,       setMuted]       = React.useState(false);
  const [soundType,   setSoundType]   = React.useState<SoundType>("mechanical");
  const [showFn,      setShowFn]      = React.useState(!compact);
  const [virtualKeys, setVirtualKeys] = React.useState<string[]>([]);

  const physicalKeys = usePhysicalKeyboard();
  const { play }     = useKeyboardSound({ enabled: !muted, volume: 0.65, soundType });

  const activeKeys = React.useMemo(
    () => [...new Set([...physicalKeys, ...virtualKeys])],
    [physicalKeys, virtualKeys],
  );

  React.useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.metaKey && e.key !== "Meta") return;
      if (e.ctrlKey  && e.key !== "Control") return;
      const variant =
        e.code === "Space"     ? "space"    :
        e.code === "Enter"     ? "enter"    :
        e.code === "Backspace" ? "delete"   :
        (e.code.startsWith("Shift") || e.code.startsWith("Meta") ||
         e.code.startsWith("Alt")   || e.code.startsWith("Control") ||
         e.code === "CapsLock"      || e.code === "Tab") ? "modifier"
        : "normal" as const;
      play(variant);
      setText((prev) => {
        if (e.code === "Backspace") return prev.slice(0, -1);
        const ch = KB_CODE_TO_CHAR[e.code];
        return ch ? prev + ch : prev;
      });
    }
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [play]);

  const handleVirtualKey = React.useCallback((key: KbKeyDef) => {
    setVirtualKeys((p) => [...p, key.code]);
    setTimeout(() => setVirtualKeys((p) => p.filter((c) => c !== key.code)), 140);
    setText((prev) => {
      if (key.code === "Backspace") return prev.slice(0, -1);
      if (key.char === "\n") return prev;
      if (key.char) return prev + key.char;
      return prev;
    });
  }, []);

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">Keyboard 1 — With Mechanical Sound</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            muted
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-primary/35 bg-primary/10 text-primary hover:bg-primary/15",
          )}
        >
          {muted ? "Muted" : "Sound on"}
        </button>
        <div className="flex gap-1">
          {SOUND_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setSoundType(o.v)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                soundType === o.v
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/70 bg-muted/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {o.l}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowFn((f) => !f)}
          className="rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          {showFn ? "Fn row on" : "Fn row off"}
        </button>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
        <p className="min-h-[2rem] break-all font-mono text-sm text-foreground">
          {text || <span className="text-muted-foreground/50">Click keys or type…</span>}
          <span className="ml-px inline-block h-[1em] w-[2px] animate-pulse bg-primary align-middle" />
        </p>
        {text && (
          <button type="button" onClick={() => setText("")} className="mt-1 text-[11px] text-muted-foreground hover:text-destructive">
            Clear
          </button>
        )}
      </div>

      <MacKeyboard
        layout="mac"
        enableSound={!muted}
        volume={0.65}
        soundType={soundType}
        activeKeys={activeKeys}
        showFunctionRow={showFn}
        theme="auto"
        onKeyPress={handleVirtualKey}
      />
    </div>
  );
}

export function PreviewKeyboardSilentDetail({ compact = true }: { compact?: boolean } = {}) {
  const [text,        setText]        = React.useState("");
  const [showFn,      setShowFn]      = React.useState(!compact);
  const [virtualKeys, setVirtualKeys] = React.useState<string[]>([]);

  const physicalKeys = usePhysicalKeyboard();

  const activeKeys = React.useMemo(
    () => [...new Set([...physicalKeys, ...virtualKeys])],
    [physicalKeys, virtualKeys],
  );

  React.useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.metaKey && e.key !== "Meta") return;
      if (e.ctrlKey  && e.key !== "Control") return;
      setText((prev) => {
        if (e.code === "Backspace") return prev.slice(0, -1);
        const ch = KB_CODE_TO_CHAR[e.code];
        return ch ? prev + ch : prev;
      });
    }
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, []);

  const handleVirtualKey = React.useCallback((key: KbKeyDef) => {
    setVirtualKeys((p) => [...p, key.code]);
    setTimeout(() => setVirtualKeys((p) => p.filter((c) => c !== key.code)), 140);
    setText((prev) => {
      if (key.code === "Backspace") return prev.slice(0, -1);
      if (key.char === "\n") return prev;
      if (key.char) return prev + key.char;
      return prev;
    });
  }, []);

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-foreground">Keyboard 2 — Without Sound</p>
        <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          No audio
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowFn((f) => !f)}
          className="rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          {showFn ? "Fn row on" : "Fn row off"}
        </button>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
        <p className="min-h-[2rem] break-all font-mono text-sm text-foreground">
          {text || <span className="text-muted-foreground/50">Click keys or type…</span>}
          <span className="ml-px inline-block h-[1em] w-[2px] animate-pulse bg-primary align-middle" />
        </p>
        {text && (
          <button type="button" onClick={() => setText("")} className="mt-1 text-[11px] text-muted-foreground hover:text-destructive">
            Clear
          </button>
        )}
      </div>

      <MacKeyboard
        layout="mac"
        enableSound={false}
        activeKeys={activeKeys}
        showFunctionRow={showFn}
        theme="auto"
        onKeyPress={handleVirtualKey}
      />
    </div>
  );
}

export function PreviewEncryptedText({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 rounded-xl bg-zinc-950 px-6",
        compact ? "min-h-[300px] py-8" : "min-h-[420px] py-14",
      )}
    >
      <EncryptedText
        text="ACCESS GRANTED"
        trigger="load"
        loop
        loopDelay={1800}
        speed={55}
        shuffleSpeed={28}
        iterations={8}
        className={cn(
          "font-bold tracking-[0.18em] text-white",
          compact ? "text-2xl" : "text-4xl",
        )}
      />
      <EncryptedText
        text="DECRYPTING DATA..."
        trigger="load"
        loop
        loopDelay={2400}
        speed={38}
        shuffleSpeed={22}
        iterations={5}
        revealDelay={700}
        className={cn(
          "tracking-[0.22em] text-foreground/60",
          compact ? "text-xs" : "text-sm",
        )}
      />
    </div>
  );
}

export function PreviewBackgroundBoxes({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("flex items-center justify-center", compact ? "min-h-[430px]" : "min-h-[600px] py-12")}>
      <BackgroundBoxes
        rows={compact ? 12 : 14}
        columns={compact ? 20 : 24}
        boxSize={compact ? 20 : 24}
        highlightColor="hsl(210 100% 90% / 1)"
        defaultColor="hsl(222 55% 18% / 0.35)"
        borderColor="hsl(217 44% 29% / 0.62)"
        neighborRipple={false}
        animatePulse={false}
        gridClassName={cn("origin-center scale-[1.18]", compact ? "rotate-[7deg] skew-x-[-8deg]" : "rotate-[8deg] skew-x-[-7deg]")}
        className={cn(
          "w-full overflow-hidden rounded-2xl border border-blue-950/70 bg-gradient-to-b from-[#070f2b] via-[#0a1740] to-[#081638]",
          compact ? "h-[390px]" : "h-[560px]",
          compact ? "max-w-2xl" : "max-w-4xl",
        )}
      >
        <div
          data-bgboxes-content="true"
          className={cn(
            "pointer-events-none mx-auto flex w-full items-center justify-center text-center text-slate-100",
            compact ? "min-h-[390px] px-4" : "min-h-[560px] px-10",
          )}
        >
          <div className={cn("pointer-events-auto inline-block rounded-md px-2 py-1.5", compact ? "max-w-[20rem]" : "max-w-2xl")}>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/80">Background Boxes</p>
            <h3 className={cn("mt-2 font-semibold tracking-tight text-white", compact ? "text-xl" : "text-3xl")}>
              Tailwind is Awesome
            </h3>
            <p className={cn("mt-2 text-slate-300/85", compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed")}>
              Hover only reacts on the grid area, not on text.
            </p>
          </div>
        </div>
      </BackgroundBoxes>
    </div>
  );
}

// ── Images Badge previews ─────────────────────────────────────────────────────
const IB_TEAM = [
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",  alt: "Felix"  },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",  alt: "Aneka"  },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Milo&backgroundColor=d1d4f9",   alt: "Milo"   },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&backgroundColor=ffd5dc",    alt: "Zoe"    },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kai&backgroundColor=ffdfbf",    alt: "Kai"    },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Luna&backgroundColor=c1f0c8",   alt: "Luna"   },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Omar&backgroundColor=b6e3f4",   alt: "Omar"   },
];

const IB_PRODUCTS = [
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=alpha&backgroundColor=1e293b",    alt: "Alpha"   },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=beta&backgroundColor=0f172a",     alt: "Beta"    },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=gamma&backgroundColor=172554",    alt: "Gamma"   },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=delta&backgroundColor=1c1917",    alt: "Delta"   },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=epsilon&backgroundColor=14532d",  alt: "Epsilon" },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=zeta&backgroundColor=450a0a",     alt: "Zeta"    },
];

// Grid card preview — folder badge matching Aceternity reference style
export function PreviewImagesBadge({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("flex items-center justify-center", compact ? "min-h-[200px]" : "min-h-[260px]")}>
      <div className="inline-flex items-center gap-3">
        <span className="text-xl select-none" aria-hidden>📁</span>
        <ImagesBadge
          images={IB_PRODUCTS}
          maxVisible={3}
          revealCount={2}
          label="Marketing Template"
          size="md"
          shape="rounded"
        />
      </div>
    </div>
  );
}

// Detail page section 1 — folder-badge (exact Aceternity style)
export function PreviewImagesBadgeDefault({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", compact ? "min-h-[220px]" : "min-h-[280px]")}>
      <div className="inline-flex items-center gap-3">
        <span className="text-2xl select-none" aria-hidden>📁</span>
        <ImagesBadge
          images={IB_PRODUCTS}
          maxVisible={3}
          revealCount={2}
          label="Introducing Marketing Template"
          size="md"
          shape="rounded"
        />
      </div>
      <p className={cn("text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
        hover the images to fan open
      </p>
    </div>
  );
}

// Detail page section 2 — Large social proof
export function PreviewImagesBadgeLarge({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", compact ? "min-h-[220px]" : "min-h-[280px]")}>
      <ImagesBadge
        images={IB_TEAM}
        maxVisible={4}
        revealCount={3}
        label="12,000+ developers"
        size="lg"
        shape="circle"
        onClick={() => {}}
      />
    </div>
  );
}

// Detail page section 3 — Compact notification rows
export function PreviewImagesBadgeCompact({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("flex flex-col items-start justify-center gap-4 px-6", compact ? "min-h-[220px]" : "min-h-[280px]")}>
      {[
        { text: "Felix, Aneka + 3 others liked your post", imgs: IB_TEAM.slice(0, 5) },
        { text: "Milo, Zoe + 2 others commented",          imgs: IB_TEAM.slice(2, 6) },
        { text: "Kai started following you",                imgs: IB_TEAM.slice(4, 7) },
      ].map((row, i) => (
        <div key={i} className="flex items-center gap-3">
          <ImagesBadge images={row.imgs} maxVisible={2} revealCount={2} size="sm" shape="circle" />
          <span className={cn("text-muted-foreground", compact ? "text-[11px]" : "text-sm")}>{row.text}</span>
        </div>
      ))}
    </div>
  );
}

// Detail page section 4 — Wide spread left direction
export function PreviewImagesBadgeWide({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", compact ? "min-h-[220px]" : "min-h-[280px]")}>
      <ImagesBadge
        images={IB_PRODUCTS}
        maxVisible={2}
        revealCount={4}
        label="6 templates included"
        size="md"
        shape="rounded"
      />
      <p className={cn("text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
        hover to fan all 6 open
      </p>
    </div>
  );
}

// ── Dot Grid Hero previews ────────────────────────────────────────────────────

// Grid card — compact preview (white bg matching reference)
export function PreviewDotGridHero({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[240px]" : "h-[420px]", "w-full overflow-hidden rounded-xl")}>
      <DotGridHero
        title={"Build interfaces\nthat ship."}
        primaryCTA={{ label: "Get started", href: "#" }}
        secondaryCTA={{ label: "Learn more", href: "#" }}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// Section 1 — Default white bg, multi-colour dashes
export function PreviewDotGridHeroDefault({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[420px]" : "h-[560px]", "w-full overflow-hidden rounded-xl")}>
      <DotGridHero
        title={"Build interfaces\nthat ship."}
        subtitle="A motion-native component library for React. Animated, accessible, and production-ready out of the box."
        primaryCTA={{ label: "Get started",         href: "#" }}
        secondaryCTA={{ label: "Browse components", href: "#" }}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// Section 2 — Dark bg, indigo/purple dashes
export function PreviewDotGridHeroDense({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[420px]" : "h-[560px]", "w-full overflow-hidden rounded-xl")}>
      <DotGridHero
        title={"Design systems\nmade simple."}
        subtitle="Everything you need to build fast, beautiful products at scale."
        primaryCTA={{ label: "Start for free", href: "#" }}
        secondaryCTA={{ label: "View docs",    href: "#" }}
        background="#09090b"
        textColor="#fafafa"
        dotGap={80}
        colors={["#818cf8","#6366f1","#a78bfa","#38bdf8","#f472b6"]}
        interactionRadius={160}
        repulsionStrength={10}
        springK={0.055}
        damping={0.78}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// Section 3 — Light bg, amber/orange dashes, gentle spring
export function PreviewDotGridHeroAmber({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[420px]" : "h-[560px]", "w-full overflow-hidden rounded-xl")}>
      <DotGridHero
        title={"Ship 10× faster\nwith AI."}
        subtitle="AI-powered tooling that writes, tests, and deploys automatically."
        primaryCTA={{ label: "Try it free",  href: "#" }}
        secondaryCTA={{ label: "Watch demo", href: "#" }}
        background="#fafafa"
        dotGap={52}
        colors={["#f59e0b","#f97316","#ef4444","#dc2626","#fb923c"]}
        interactionRadius={100}
        repulsionStrength={6}
        springK={0.04}
        damping={0.85}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// Section 4 — Rose bg, explosive repulsion
export function PreviewDotGridHeroRose({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[420px]" : "h-[560px]", "w-full overflow-hidden rounded-xl")}>
      <DotGridHero
        title={"Beautiful UX\nstarts here."}
        subtitle="Craft interfaces your users will love. Premium components, zero compromise."
        primaryCTA={{ label: "Explore now",   href: "#" }}
        secondaryCTA={{ label: "See pricing", href: "#" }}
        background="#fff0f3"
        textColor="#1a0a10"
        dotGap={90}
        colors={["#f43f5e","#e11d48","#fb7185","#fda4af","#9f1239"]}
        interactionRadius={200}
        repulsionStrength={14}
        springK={0.09}
        damping={0.76}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// ── InteractiveStarfieldHero previews ─────────────────────────────────────────

// Grid card preview
export function PreviewStarfieldHero({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[420px]" : "h-[560px]", "w-full overflow-hidden rounded-xl")}>
      <InteractiveStarfieldHero
        title={"Ship faster.\nBuild better."}
        subtitle="A motion-native component library for React — animated, accessible, and production-ready."
        primaryCTA={{ label: "Get started",      href: "#" }}
        secondaryCTA={{ label: "View components", href: "#" }}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// Section 1 — Default: zinc-950, blue/white
export function PreviewStarfieldHeroDefault({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[420px]" : "h-[560px]", "w-full overflow-hidden rounded-xl")}>
      <InteractiveStarfieldHero
        title={"Ship faster.\nBuild better."}
        subtitle="A motion-native component library for React — animated, accessible, and production-ready."
        primaryCTA={{ label: "Get started",      href: "#" }}
        secondaryCTA={{ label: "View components", href: "#" }}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// Section 2 — Deep Space: violet/lavender
export function PreviewStarfieldHeroDeepSpace({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[420px]" : "h-[560px]", "w-full overflow-hidden rounded-xl")}>
      <InteractiveStarfieldHero
        title={"Design systems\nmade simple."}
        subtitle="Everything you need to build beautiful products at scale."
        primaryCTA={{ label: "Start for free", href: "#" }}
        secondaryCTA={{ label: "View docs",    href: "#" }}
        particleCount={400}
        particleColor="#a78bfa"
        activeColor="#f0abfc"
        interactionRadius={180}
        speed={0.4}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// Section 3 — Ocean Night: cyan, snappy
export function PreviewStarfieldHeroOcean({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[420px]" : "h-[560px]", "w-full overflow-hidden rounded-xl")}>
      <InteractiveStarfieldHero
        title={"Ship 10× faster\nwith AI."}
        subtitle="AI-powered tooling that writes, tests, and deploys your code automatically."
        primaryCTA={{ label: "Try it free",  href: "#" }}
        secondaryCTA={{ label: "Watch demo", href: "#" }}
        particleColor="#22d3ee"
        activeColor="#ecfeff"
        interactionRadius={120}
        speed={0.8}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// Section 4 — Ember Storm: amber, dreamy
export function PreviewStarfieldHeroEmber({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn(compact ? "h-[420px]" : "h-[560px]", "w-full overflow-hidden rounded-xl")}>
      <InteractiveStarfieldHero
        title={"Beautiful UX\nstarts here."}
        subtitle="Craft interfaces your users will love. Premium components, zero compromise."
        primaryCTA={{ label: "Explore now",  href: "#" }}
        secondaryCTA={{ label: "See pricing", href: "#" }}
        particleCount={180}
        particleColor="#f59e0b"
        activeColor="#fef9c3"
        interactionRadius={160}
        speed={0.15}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// ── Compare previews ──────────────────────────────────────────────────────────

const CMP = {
  colorA: "https://picsum.photos/seed/cmp-a/1200/675",
  grayA:  "https://picsum.photos/seed/cmp-a/1200/675?grayscale",
  colorB: "https://picsum.photos/seed/cmp-b/1200/675",
  blurB:  "https://picsum.photos/seed/cmp-b/1200/675?blur=4",
};

// Grid card preview
export function PreviewCompare() {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <Compare
        beforeImage={CMP.grayA}
        afterImage={CMP.colorA}
        beforeLabel="Before"
        afterLabel="After"
        className="aspect-video w-full max-w-sm"
      />
    </div>
  );
}

// Section 1 — Default (used in catalog previewSections)
export function PreviewCompareDefault() {
  return (
    <div className="p-6">
      <Compare
        beforeImage={CMP.grayA}
        afterImage={CMP.colorA}
        beforeLabel="Before"
        afterLabel="After"
        className="aspect-video w-full"
      />
    </div>
  );
}

// ── ExpandableCards previews ──────────────────────────────────────────────────

const EC_CARDS: CardItem[] = [
  {
    id: "p1",
    title: "Motion Design System",
    description: "Animation primitives built for React and Tailwind CSS.",
    fullDescription: "A cohesive set of animation primitives, spring physics, and declarative components. Every transition is GPU-accelerated and reduced-motion aware.",
    image: "https://picsum.photos/seed/ec-1/800/500",
    category: "Design",
    ctaText: "Explore",
    ctaLink: "#",
  },
  {
    id: "p2",
    title: "Canvas Particle Engine",
    description: "High-performance 60 fps particle system for modern web.",
    fullDescription: "Built on requestAnimationFrame with a custom physics solver. Supports gravity, wind, turbulence, and custom emitter shapes. Zero dependencies.",
    image: "https://picsum.photos/seed/ec-2/800/500",
    category: "Engineering",
    ctaText: "View docs",
    ctaLink: "#",
  },
  {
    id: "p3",
    title: "AI-Powered Layout",
    description: "Semantic layout engine that adapts to content automatically.",
    fullDescription: "Combine layout primitives with LLM-powered suggestions to automatically choose the best composition for your content type.",
    image: "https://picsum.photos/seed/ec-3/800/500",
    category: "AI",
    ctaText: "Try free",
    ctaLink: "#",
  },
];

export function PreviewExpandableCards() {
  return (
    <div className="p-4">
      <ExpandableCards cards={EC_CARDS} />
    </div>
  );
}

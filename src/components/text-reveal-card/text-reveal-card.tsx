"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type TextRevealCardProps = {
  /** Small heading above the reveal area. */
  title?: string;
  /** One-line hint under the reveal area. */
  description?: string;
  /** The sentence you see before scrubbing. */
  text?: string;
  /** What the scrub reveals. A string gets the gradient treatment; any node works. */
  revealContent?: React.ReactNode;
  /** Icon shown next to the title. */
  icon?: React.ReactNode;
  /** Optional image URL shown above the card body (you supply it; nothing is fetched by default). */
  image?: string;
  /** Extra content rendered at the bottom of the card. */
  children?: React.ReactNode;
  /** Classes for the card. */
  className?: string;
  /** Classes for the reveal area. */
  revealClassName?: string;
  /** Spark amount, 0.5 to 2.2. */
  intensity?: number;
  /** Shows the revealed sentence and turns the interaction off. */
  disabled?: boolean;
  /** Sweeps the divider across and back every few seconds until someone touches the card. */
  autoplay?: boolean;
};

type Spark = { x: number; y: number; vx: number; vy: number; life: number; hue: number };
const HUES = ["#0071e3", "#bf5af2", "#64d2ff"];
const HUES_DARK = ["#0a84ff", "#bf5af2", "#64d2ff"];

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
/** Follows the site's class-based dark mode; false on the server and during hydration. */
function useIsDark() {
  return React.useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"), () => false);
}

/**
 * Scrub a glass divider across a sentence to swap it for another one. The divider follows the
 * pointer on a spring, leans into the direction you move and swings upright when you stop, and
 * sheds a few sparks from the seam. Leaving the card snaps the divider home with a bounce.
 */
export function TextRevealCard({
  title,
  description = "Drag across the line, or use the arrow keys.",
  text = "Most teams ship on a hunch.",
  revealContent = "Yours will ship on proof.",
  icon,
  image,
  children,
  className,
  revealClassName,
  intensity = 1,
  disabled = false,
  autoplay = false,
}: TextRevealCardProps) {
  const still = useReducedMotion() === true;
  const dark = useIsDark();
  const stage = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const touched = React.useRef(false);
  const run = React.useRef<AnimationPlaybackControls | undefined>(undefined);
  const sparks = React.useRef<Spark[]>([]);
  const kick = React.useRef<() => void>(() => {});
  const amount = Math.max(0.5, Math.min(2.2, intensity));

  const target = useMotionValue(disabled ? 100 : 0);
  const pct = useSpring(target, still ? { stiffness: 2000, damping: 100 } : { stiffness: 260, damping: 24, mass: 0.7 });
  const vel = useVelocity(pct);
  const lean = useSpring(useTransform(vel, (v) => Math.max(-16, Math.min(16, v * 0.05))), { stiffness: 320, damping: 16 });
  const initial = disabled ? 100 : 0;
  // The slider value is written to the DOM as it springs, so screen readers stay in sync without re-renders.
  useMotionValueEvent(pct, "change", (v) => {
    const n = Math.round(Math.max(0, Math.min(100, v)));
    stage.current?.setAttribute("aria-valuenow", String(n));
    stage.current?.setAttribute("aria-valuetext", `${n}% revealed`);
  });

  const revealClip = useMotionTemplate`inset(0 calc(100% - ${pct}%) 0 0)`;
  const baseClip = useMotionTemplate`inset(0 0 0 ${pct}%)`;
  const left = useMotionTemplate`${pct}%`;
  const knob = useTransform(pct, (v) => (v <= 0.5 || v >= 99.5 ? 0 : 1));

  const to = React.useCallback(
    (v: number) => {
      run.current?.stop();
      target.set(Math.max(0, Math.min(100, v)));
    },
    [target],
  );

  // Sparks: spawned from the seam as it moves, drawn on one canvas, and the loop sleeps when none are left.
  React.useEffect(() => {
    const el = canvas.current;
    const host = stage.current;
    if (!el || !host || still) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = 0;
    let prev = pct.get();
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      el.width = Math.round(host.clientWidth * dpr);
      el.height = Math.round(host.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);
    const palette = dark ? HUES_DARK : HUES;
    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const w = host.clientWidth;
      const h = host.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const list = sparks.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const s = list[i]!;
        s.life -= dt * 1.6;
        if (s.life <= 0) {
          list.splice(i, 1);
          continue;
        }
        s.vy += 60 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.globalAlpha = s.life;
        ctx.fillStyle = palette[s.hue] ?? palette[0]!;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.2 + s.life * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = list.length ? requestAnimationFrame(frame) : 0;
      if (!raf) last = 0;
    };
    kick.current = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const off = pct.on("change", (v) => {
      const d = v - prev;
      prev = v;
      if (v <= 0.5 || v >= 99.5) return;
      const n = Math.min(4, Math.floor(Math.abs(d) * 0.9 * amount + (rnd() < 0.35 * amount ? 1 : 0)));
      if (!n) return;
      const w = host.clientWidth;
      const h = host.clientHeight;
      for (let k = 0; k < n; k++) {
        sparks.current.push({
          x: (v / 100) * w,
          y: h * (0.2 + rnd() * 0.6),
          vx: -Math.sign(d) * (20 + rnd() * 60),
          vy: -20 - rnd() * 50,
          life: 0.6 + rnd() * 0.4,
          hue: Math.floor(rnd() * 3),
        });
      }
      if (sparks.current.length > 120) sparks.current.splice(0, sparks.current.length - 120);
      kick.current();
    });
    return () => {
      off();
      ro.disconnect();
      cancelAnimationFrame(raf);
      kick.current = () => {};
    };
  }, [pct, still, dark, amount]);

  React.useEffect(() => {
    if (!autoplay || disabled || still) return;
    const sweep = () => {
      if (touched.current) return;
      run.current?.stop();
      run.current = animate(target, [0, 100, 100, 0], { duration: 3, times: [0, 0.45, 0.7, 1], ease: "easeInOut" });
    };
    const first = setTimeout(sweep, 700);
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      sweep();
    }, 4200);
    return () => {
      clearTimeout(first);
      clearInterval(t);
      run.current?.stop();
    };
  }, [autoplay, disabled, still, target]);

  const fromPointer = (e: React.PointerEvent) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r || disabled) return;
    touched.current = true;
    to(((e.clientX - r.left) / r.width) * 100);
  };

  const revealNode =
    typeof revealContent === "string" ? (
      <span className="bg-gradient-to-r from-[#0071e3] via-[#5e5ce6] to-[#bf5af2] bg-clip-text text-transparent dark:from-[#0a84ff] dark:via-[#7d7aff] dark:to-[#da8fff]">
        {revealContent}
      </span>
    ) : (
      revealContent
    );
  const line = "m-0 text-balance text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[32px]";

  return (
    <article
      className={cn(
        "w-full max-w-[460px] overflow-hidden rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      {image ? (
        // A plain img keeps the component free of next/image config; the URL is yours.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="aspect-[16/9] w-full object-cover" />
      ) : null}
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        {title || icon ? (
          <div className="flex items-center gap-2.5">
            {icon ? <span className="grid size-7 place-items-center rounded-full bg-[#f0f0f3] dark:bg-[#2c2c2e]">{icon}</span> : null}
            {title ? <h3 className="m-0 text-[15px] font-semibold tracking-[-0.01em]">{title}</h3> : null}
          </div>
        ) : null}
        <div
          ref={stage}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={typeof revealContent === "string" ? `Reveal: ${revealContent}` : "Reveal"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={initial}
          aria-valuetext={`${initial}% revealed`}
          onPointerEnter={fromPointer}
          onPointerMove={fromPointer}
          onPointerDown={fromPointer}
          onPointerLeave={() => {
            if (!disabled) to(0);
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            const now = target.get();
            let next: number | null = null;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") next = now + 10;
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = now - 10;
            if (e.key === "Home") next = 0;
            if (e.key === "End") next = 100;
            if (next === null) return;
            e.preventDefault();
            touched.current = true;
            to(next);
          }}
          className={cn(
            "relative cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[18px] bg-[#f5f5f7] px-5 py-7 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]",
            revealClassName,
          )}
        >
          <motion.p className={cn(line, "text-[#86868b] dark:text-[#98989d]")} style={{ clipPath: baseClip }}>
            {text}
          </motion.p>
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 px-5 py-7" style={{ clipPath: revealClip }}>
            <p className={line}>{revealNode}</p>
          </motion.div>
          <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
          <motion.span aria-hidden="true" className="pointer-events-none absolute inset-y-3 w-0" style={{ left, opacity: knob }}>
            <motion.span className="absolute inset-y-0 left-[-1px] block w-[2px]" style={{ rotate: lean }}>
              <span className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-[#0071e3] to-transparent dark:via-[#0a84ff]" />
              <span className="absolute left-1/2 top-1/2 block size-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_6px_14px_-4px_rgba(0,0,0,.35)] dark:bg-[#f5f5f7]">
                <span className="absolute inset-[7px] rounded-full bg-[#0071e3] dark:bg-[#0a84ff]" />
              </span>
            </motion.span>
          </motion.span>
        </div>
        {description ? <p className="m-0 text-[13px] text-[#86868b] dark:text-[#a1a1a6]">{description}</p> : null}
        {children}
      </div>
    </article>
  );
}

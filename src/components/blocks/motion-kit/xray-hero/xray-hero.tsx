"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface XrayHeroProps {
  /** Sweeps the lens across the page every 2s until the visitor first moves a pointer over it. */
  autoplay?: boolean;
  /** Called with the button that was pressed. Buttons never navigate. */
  onAction?: (label: "primary" | "secondary") => void;
  className?: string;
}

type Mode = "final" | "plan";

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const subscribeVisibility = (cb: () => void) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};
const usePageVisible = () =>
  useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);

/** A small spec label that only exists in the blueprint layer. */
function Note({ mode, children, className = "" }: { mode: Mode; children: ReactNode; className?: string }) {
  if (mode !== "plan") return null;
  return (
    <span className={`pointer-events-none absolute whitespace-nowrap font-mono text-[10.5px] text-[#9fd2ff] ${className}`}>
      {children}
    </span>
  );
}

function Measure({ mode, className, label, vertical = false }: { mode: Mode; className: string; label: string; vertical?: boolean }) {
  if (mode !== "plan") return null;
  return (
    <span className={`pointer-events-none absolute flex items-center justify-center ${className}`}>
      <span className={`absolute ${vertical ? "inset-y-0 left-1/2 w-px" : "inset-x-0 top-1/2 h-px"} bg-[#ff6b8b]`} />
      <span className="relative rounded-[3px] bg-[#ff6b8b] px-1 font-mono text-[9.5px] leading-[14px] text-white">{label}</span>
    </span>
  );
}

// ease-out-expo-ish curve the card plots: cubic-bezier(.16, 1, .3, 1)
const P1 = [0.16, 1];
const P2 = [0.3, 1];
const bz = (s: number, a: number, b: number) => 3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s;
/** Eased value at time u, solving the curve's x for u by bisection. */
function ease(u: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 18; i++) {
    const m = (lo + hi) / 2;
    if (bz(m, P1[0], P2[0]) < u) lo = m;
    else hi = m;
  }
  return bz((lo + hi) / 2, P1[1], P2[1]);
}
const PX = 22;
const PY = 14;
const PW = 236;
const PH = 132;
const map = (u: number, v: number) => [PX + u * PW, PY + (1 - v) * PH] as const;
const RUN_MS = 1400;
const LOOP_MS = 2300;

/** A curve editor card: the easing curve, its handles, and a dot riding it on a shared clock. */
function CurveCard({ mode, clock }: { mode: Mode; clock: MotionValue<number> }) {
  const plan = mode === "plan";
  // 1.4s run, 0.9s hold, forever; both layers read the same clock so they stay in step
  const u = useTransform(clock, (t) => Math.min(1, (t % LOOP_MS) / RUN_MS));
  const v = useTransform(u, ease);
  const dx = useTransform(u, (k) => PX + k * PW);
  const dy = useTransform(v, (k) => PY + (1 - k) * PH);
  const kx = useTransform(v, (k) => PX + k * PW);
  const [a, b, c, d] = [map(0, 0), map(P1[0], P1[1]), map(P2[0], P2[1]), map(1, 1)];
  // Stroke and fill come from classes so the finished layer follows the theme.
  const inkS = plan ? "stroke-[#e6f2ff]" : "stroke-[#1d1d1f] dark:stroke-[#f5f5f7]";
  const inkF = plan ? "fill-[#e6f2ff]" : "fill-[#1d1d1f] dark:fill-[#f5f5f7]";
  const softS = plan ? "stroke-[rgba(159,210,255,.35)]" : "stroke-[#ececf0] dark:stroke-[#2c2c2e]";
  const accS = plan ? "stroke-[#9fd2ff]" : "stroke-[#0071e3] dark:stroke-[#0a84ff]";
  const accF = plan ? "fill-[#9fd2ff]" : "fill-[#0071e3] dark:fill-[#0a84ff]";
  const diagS = plan ? "stroke-[rgba(159,210,255,.5)]" : "stroke-[#d2d2d7] dark:stroke-[#48484a]";
  const knobF = plan ? "fill-[#0b3a8c]" : "fill-white dark:fill-[#2c2c2e]";
  const knobS = plan ? "stroke-[#9fd2ff]" : "stroke-black/10 dark:stroke-white/20";
  return (
    <div
      className={`relative ml-auto w-[320px] rounded-[24px] p-5 ${
        plan
          ? "outline outline-1 outline-dashed outline-[#9fd2ff]/70"
          : "bg-white shadow-[0_30px_60px_-30px_rgba(20,40,90,.35),0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#1c1c1e] dark:shadow-[0_30px_60px_-30px_rgba(0,0,0,.8),0_0_0_1px_#3a3a3c]"
      }`}
    >
      <Note mode={mode} className="-top-5 left-0">&lt;CurveEditor padding=20 radius=24 /&gt;</Note>
      <div className="flex items-baseline justify-between">
        <span className={`text-[15px] font-semibold tracking-[-0.01em] ${plan ? "text-[#e6f2ff]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"}`}>motion/ease-out</span>
        <span className={`font-mono text-[11px] ${plan ? "text-[#9fd2ff]" : "text-[#86868b] dark:text-[#a1a1a6]"}`}>.16, 1, .3, 1</span>
      </div>
      <svg viewBox="0 0 280 196" className="mt-3 block w-full" aria-hidden="true">
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={PX} x2={PX + PW} y1={PY + g * PH} y2={PY + g * PH} className={softS} />
            <line y1={PY} y2={PY + PH} x1={PX + g * PW} x2={PX + g * PW} className={softS} />
          </g>
        ))}
        <line x1={a[0]} y1={a[1]} x2={d[0]} y2={d[1]} className={diagS} strokeDasharray="3 4" />
        {/* handles */}
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={accS} strokeWidth="1.25" />
        <line x1={d[0]} y1={d[1]} x2={c[0]} y2={c[1]} className={accS} strokeWidth="1.25" />
        <path d={`M ${a[0]} ${a[1]} C ${b[0]} ${b[1]}, ${c[0]} ${c[1]}, ${d[0]} ${d[1]}`} fill="none" className={inkS} strokeWidth="2.5" strokeLinecap="round" />
        {[b, c].map((q, i) => (
          <circle key={i} cx={q[0]} cy={q[1]} r="5" className={cn(knobF, accS)} strokeWidth="2" />
        ))}
        {[a, d].map((q, i) => (
          <circle key={i} cx={q[0]} cy={q[1]} r="3.5" className={inkF} stroke="none" />
        ))}
        {/* playhead and the dot riding the curve */}
        <motion.line x1={dx} x2={dx} y1={PY} y2={PY + PH} className={accS} strokeOpacity=".35" />
        <motion.circle cx={dx} cy={dy} r="5.5" className={accF} stroke="none" />
        {/* the same value applied to something: a knob sliding along a track */}
        <line x1={PX} x2={PX + PW} y1="178" y2="178" className={softS} strokeWidth="6" strokeLinecap="round" />
        <motion.line x1={PX} x2={kx} y1="178" y2="178" className={accS} strokeWidth="6" strokeLinecap="round" />
        <motion.circle
          cx={kx}
          cy="178"
          r="9"
          className={cn(knobF, knobS)}
          strokeWidth="1.5"
          style={plan ? undefined : { filter: "drop-shadow(0 2px 4px rgba(0,0,0,.18))" }}
        />
      </svg>
      <div className={`mt-1 flex justify-between font-mono text-[11px] ${plan ? "text-[#9fd2ff]" : "text-[#86868b] dark:text-[#a1a1a6]"}`}>
        <span>0ms</span>
        <span>duration 1400ms</span>
      </div>
      {plan && <span className="pointer-events-none absolute left-[124px] top-[80px] font-mono text-[10px] text-[#9fd2ff]">P1 (.16, 1) · P2 (.3, 1)</span>}
      <Measure mode={mode} className="-right-8 top-0 h-full w-6" label="20" vertical />
    </div>
  );
}

/** A pill that is a real button in the finished layer and a plain box in the blueprint layer. */
function Pill({
  mode,
  className,
  onPress,
  children,
}: {
  mode: Mode;
  className: string;
  onPress?: () => void;
  children: ReactNode;
}) {
  if (mode === "plan") return <span className={`relative rounded-full px-6 py-3.5 text-[16px] font-medium ${className}`}>{children}</span>;
  return (
    <button type="button" onClick={onPress} className={cn("relative rounded-full px-6 py-3.5 text-[16px] font-medium", className, ring)}>
      {children}
    </button>
  );
}

/** The same hero, drawn twice: the finished design and its blueprint. */
function Layout({ mode, clock, onAction }: { mode: Mode; clock: MotionValue<number>; onAction?: XrayHeroProps["onAction"] }) {
  const plan = mode === "plan";
  const box = (base: string, planCls = "") =>
    plan ? `${planCls} outline outline-1 outline-dashed outline-[#9fd2ff]/70 bg-transparent text-[#e6f2ff] shadow-none` : base;
  const chip =
    "bg-white text-[#1d1d1f] shadow-[0_8px_20px_-14px_rgba(20,40,90,.4),0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_#3a3a3c]";
  return (
    <div
      className={`absolute inset-0 grid grid-cols-1 items-center gap-10 px-8 py-14 md:grid-cols-[1.1fr_1fr] md:px-14 ${
        plan
          ? "bg-[#0b3a8c] [background-image:linear-gradient(rgba(159,210,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(159,210,255,.14)_1px,transparent_1px)] [background-size:24px_24px]"
          : "bg-[linear-gradient(160deg,#ffffff,#f3f5fb)] dark:bg-[linear-gradient(160deg,#000000,#0b0d14)]"
      }`}
    >
      <div className="relative">
        <span className={`relative inline-flex rounded-full px-3 py-1 text-[13px] font-medium ${box("bg-[#eef5ff] text-[#0071e3] dark:bg-[#0a84ff]/15 dark:text-[#0a84ff]")}`}>
          New · Variables 2.0
          <Note mode={mode} className="-top-4 left-0">&lt;Badge tone=&quot;blue&quot; /&gt;</Note>
        </span>
        <h1
          className={`relative m-0 mt-5 text-[clamp(38px,5.4vw,64px)] font-semibold leading-[1.02] tracking-[-0.045em] ${
            plan ? "text-[#e6f2ff] outline outline-1 outline-dashed outline-[#9fd2ff]/70" : "text-[#1d1d1f] dark:text-[#f5f5f7]"
          }`}
        >
          Every pixel,
          <br />
          on purpose.
          <Note mode={mode} className="-top-5 right-0">SF Pro Display · 64 / 1.02 · −4.5%</Note>
        </h1>
        <Measure mode={mode} className="left-0 top-[calc(100%+0px)] h-6 w-10" label="24" vertical />
        <p
          className={`relative m-0 mt-6 max-w-[420px] text-[18px] leading-[1.5] ${
            plan ? "text-[#cfe6ff] outline outline-1 outline-dashed outline-[#9fd2ff]/70" : "text-[#6e6e73] dark:text-[#a1a1a6]"
          }`}
        >
          Hover the page to see how it&apos;s built: spacing, type and components, measured.
          <Note mode={mode} className="-bottom-4 left-0">body/lg · #6E6E73 · max 420</Note>
        </p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <Pill mode={mode} onPress={() => onAction?.("primary")} className={box("bg-[#0071e3] text-white dark:bg-[#0a84ff]")}>
            Start building
            <Note mode={mode} className="-bottom-4 left-0">&lt;Button size=&quot;lg&quot; /&gt;</Note>
          </Pill>
          <Pill
            mode={mode}
            onPress={() => onAction?.("secondary")}
            className={box("bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_#3a3a3c]")}
          >
            Read the docs
          </Pill>
          <Measure mode={mode} className="left-[calc(50%-20px)] top-[-26px] h-5 w-10" label="12" />
        </div>
      </div>
      <div className="relative hidden md:block">
        <CurveCard mode={mode} clock={clock} />
        <div className="relative ml-auto mr-10 mt-4 flex w-fit gap-2">
          {[
            ["#0071e3", "blue/500"],
            ["#1d1d1f", "gray/900"],
            ["#e8e8ed", "radius/24"],
          ].map(([c, n]) => (
            <span key={n} className={`flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 font-mono text-[11px] ${box(chip)}`}>
              <span
                className="h-4 w-4 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.2)]"
                style={{ background: c }}
              />
              {n}
            </span>
          ))}
          <Note mode={mode} className="-bottom-4 left-0">&lt;TokenChip /&gt; × 3</Note>
        </div>
      </div>
    </div>
  );
}

/**
 * A hero with X-ray vision. Your pointer is a lens: inside it the polished page turns into its own
 * blueprint, with dashed component boxes, type specs, spacing measurements and the component names
 * behind each element. Move away and the lens closes. A Blueprint toggle opens the lens over the
 * whole page for keyboard and touch visitors.
 */
export function XrayHero({ autoplay = false, onAction, className }: XrayHeroProps) {
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(root, { amount: 0.2 });
  const visible = usePageVisible();
  const [touched, setTouched] = useState(false);
  const [hint, setHint] = useState(true);
  const [full, setFull] = useState(false);

  const lx = useMotionValue(560);
  const ly = useMotionValue(260);
  const lr = useMotionValue(0);
  const sx = useSpring(lx, { stiffness: 260, damping: 30 });
  const sy = useSpring(ly, { stiffness: 260, damping: 30 });
  const sr = useSpring(lr, { stiffness: 200, damping: 22 });
  // the radius spring overshoots a little when closing; a negative radius is not a valid circle()
  const rad = useTransform(sr, (v) => Math.max(0, v));
  const clip = useMotionTemplate`circle(${rad}px at ${sx}px ${sy}px)`;
  const ringX = useMotionTemplate`${sx}px`;
  const ringY = useMotionTemplate`${sy}px`;
  const ringD = useMotionTemplate`${rad}px`;
  /** Moves the lens target; under reduced motion the lens snaps there instead of springing. */
  const aim = (x: number | null, y: number | null, r: number) => {
    if (x !== null && y !== null) {
      lx.set(x);
      ly.set(y);
      if (reduce) {
        sx.jump(x);
        sy.jump(y);
      }
    }
    lr.set(r);
    if (reduce) sr.jump(r);
  };

  // One clock for the curve card in both layers. Stopped off screen, in a hidden tab and under reduced motion.
  const clock = useMotionValue(0);
  const running = inView && visible && !reduce;
  useEffect(() => {
    if (reduce) {
      clock.set(RUN_MS);
      return;
    }
    if (!running) return;
    const c = animate(clock, [0, LOOP_MS], { duration: LOOP_MS / 1000, ease: "linear", repeat: Infinity });
    return () => c.stop();
  }, [running, reduce, clock]);

  // The lens sweeps the page on its own until the visitor takes over.
  const sweeping = autoplay && !reduce && !touched && !full && running;
  useEffect(() => {
    if (!sweeping) return;
    let k = 0;
    const controls: ReturnType<typeof animate>[] = [];
    const tick = () => {
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      k++;
      lr.set(140);
      controls.push(
        animate(lx, r.width * (0.25 + 0.5 * ((k * 0.37) % 1)), { duration: 2, ease: "easeInOut" }),
        animate(ly, r.height * (0.3 + 0.4 * ((k * 0.61) % 1)), { duration: 2, ease: "easeInOut" }),
      );
    };
    const id = window.setInterval(tick, 2000);
    return () => {
      window.clearInterval(id);
      controls.forEach((c) => c.stop());
    };
  }, [sweeping, lx, ly, lr]);

  const openFull = (next: boolean) => {
    const el = root.current;
    setFull(next);
    setTouched(true);
    setHint(false);
    if (next && el) {
      const r = el.getBoundingClientRect();
      aim(r.width / 2, r.height / 2, Math.hypot(r.width, r.height) / 2 + 20);
    } else {
      aim(null, null, 0);
    }
  };

  return (
    <div
      ref={root}
      className={cn("relative h-[560px] w-full overflow-hidden md:h-[520px]", className)}
      onPointerMove={(e) => {
        if (full) return;
        setTouched(true);
        setHint(false);
        const r = e.currentTarget.getBoundingClientRect();
        aim(e.clientX - r.left, e.clientY - r.top, e.pointerType === "touch" ? 110 : 150);
      }}
      onPointerLeave={() => {
        if (!full) aim(null, null, 0);
      }}
      onPointerCancel={() => {
        if (!full) aim(null, null, 0);
      }}
    >
      <Layout mode="final" clock={clock} onAction={onAction} />
      <motion.div className="pointer-events-none absolute inset-0" style={{ clipPath: clip, WebkitClipPath: clip }} aria-hidden="true">
        <Layout mode="plan" clock={clock} />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute rounded-full shadow-[0_0_0_1.5px_rgba(255,255,255,.9),0_0_0_6px_rgba(10,132,255,.18),0_18px_40px_-10px_rgba(0,0,0,.35)]"
        style={{ left: ringX, top: ringY, width: ringD, height: ringD, x: "-50%", y: "-50%", scale: 2 }}
        aria-hidden="true"
      />
      {hint && !full && (
        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-[12px] text-white">
          Move over the page to x-ray it
        </span>
      )}
      <button
        type="button"
        aria-pressed={full}
        onClick={() => openFull(!full)}
        className={cn(
          "absolute bottom-4 right-4 z-10 rounded-full bg-black/70 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm",
          ring,
        )}
      >
        Blueprint
      </button>
    </div>
  );
}

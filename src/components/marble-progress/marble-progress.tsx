"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Matter from "matter-js";
import { useSound } from "@/lib/ui-sounds";

export interface MarbleStep {
  /** Checklist text. Also used as the React key, so keep labels unique. */
  label: string;
  /** Marble and checkbox colour (6-digit hex). */
  color: string;
}

export interface MarbleProgressProps {
  /** The onboarding steps. Each finished step drops one marble of its colour. */
  steps?: MarbleStep[];
  /** Ticks the steps one by one, then clears them, until someone clicks a step. Off under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

const STEPS: MarbleStep[] = [
  { label: "Create your workspace", color: "#0071e3" },
  { label: "Verify your email", color: "#30d158" },
  { label: "Invite a teammate", color: "#ff9f0a" },
  { label: "Connect a repository", color: "#bf5af2" },
  { label: "Ship your first deploy", color: "#ff375f" },
];
const STEP = 1000 / 60;
const RW = 120, RH = 300, R = 9;

type Marble = { body: Matter.Body; step: number; color: string; pop?: number };

/**
 * An onboarding checklist that keeps score with marbles. Tick a step and a
 * marble drops in at the top, rattles down the ramps and settles in the jar;
 * untick it and that marble pops. When the jar is full it lights up.
 */
export function MarbleProgress({ steps = STEPS, autoplay = false, enableSound = true }: MarbleProgressProps) {
  const play = useSound(enableSound);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Matter.Engine | null>(null);
  const marbles = useRef<Marble[]>([]);
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));
  const doneRef = useRef(done);
  const touched = useRef(false);
  const dark = useRef(false);
  const reduce = useReducedMotion();
  const count = done.filter(Boolean).length;
  const full = count === steps.length;
  const fullRef = useRef(full);

  useEffect(() => {
    fullRef.current = full;
  }, [full]);

  // Track the site theme so the ramps and jar are drawn in the right ink.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      dark.current = root.classList.contains("dark");
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const e = Matter.Engine.create({ gravity: { x: 0, y: 1 } });
    engine.current = e;
    const s = { isStatic: true, friction: 0.02, restitution: 0.3 };
    // Each ramp leaves a gap wider than a marble at its low end, and the last
    // one stops well short of the jar wall so nothing can wedge on the rim.
    const RAMPS = [
      { x: 46, y: 66, w: 92, a: 0.24 },
      { x: 76, y: 124, w: 92, a: -0.24 },
      { x: 40, y: 178, w: 76, a: 0.24 },
    ];
    const ramps = RAMPS.map((r) => Matter.Bodies.rectangle(r.x, r.y, r.w, 6, { ...s, angle: r.a, chamfer: { radius: 3 } }));
    const jar = [
      Matter.Bodies.rectangle(RW / 2, RH - 4, RW, 8, s),
      Matter.Bodies.rectangle(4, RH - 30, 8, 60, s),
      Matter.Bodies.rectangle(RW - 4, RH - 30, 8, 60, s),
      Matter.Bodies.rectangle(-4, RH / 2, 8, RH * 2, s),
      Matter.Bodies.rectangle(RW + 4, RH / 2, 8, RH * 2, s),
    ];
    Matter.Composite.add(e.world, [...ramps, ...jar]);

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = RW * dpr; c.height = RH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let raf = 0, acc = 0, last = performance.now(), glow = 0;
    let running = false, onScreen = false;
    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      const dt = Math.min(100, now - last);
      // Fixed 60 Hz steps so slow frames don't turn into slow motion.
      acc += Math.min(100, now - last);
      last = now;
      for (let n = 0; acc >= STEP && n < 4; n++) { Matter.Engine.update(e, STEP); acc -= STEP; }
      if (acc > STEP) acc = 0;
      const isDark = dark.current;
      ctx.clearRect(0, 0, RW, RH);
      // jar glow when full
      glow += ((fullRef.current ? 1 : 0) - glow) * 0.06;
      if (glow > 0.01) {
        const g = ctx.createRadialGradient(RW / 2, RH - 40, 4, RW / 2, RH - 40, 80);
        g.addColorStop(0, `rgba(48,209,88,${(isDark ? 0.42 : 0.35) * glow})`);
        g.addColorStop(1, "rgba(48,209,88,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, RH - 130, RW, 130);
      }
      // ramps
      ctx.fillStyle = isDark ? "#48484a" : "#d2d2d7";
      ramps.forEach((r, i) => {
        const w = RAMPS[i].w;
        ctx.save(); ctx.translate(r.position.x, r.position.y); ctx.rotate(r.angle);
        ctx.beginPath(); ctx.roundRect(-w / 2, -3, w, 6, 3); ctx.fill(); ctx.restore();
      });
      // jar glass
      ctx.strokeStyle = isDark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.14)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(3, RH - 62); ctx.lineTo(3, RH - 14); ctx.quadraticCurveTo(3, RH - 2, 15, RH - 2); ctx.lineTo(RW - 15, RH - 2); ctx.quadraticCurveTo(RW - 3, RH - 2, RW - 3, RH - 14); ctx.lineTo(RW - 3, RH - 62); ctx.stroke();
      ctx.fillStyle = isDark ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.55)"; ctx.fillRect(9, RH - 56, 3, 40);
      // marbles
      marbles.current = marbles.current.filter((m) => !(m.pop !== undefined && m.pop > 1));
      marbles.current.forEach((m) => {
        const { x, y } = m.body.position;
        let r = R;
        if (m.pop !== undefined) { m.pop += dt / 220; r = R * (1 + m.pop * 0.6); ctx.globalAlpha = Math.max(0, 1 - m.pop); }
        const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, "#ffffff"); g.addColorStop(0.25, m.color); g.addColorStop(1, shade(m.color));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        // a band so you can see it roll
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
        ctx.translate(x, y); ctx.rotate(m.body.angle);
        ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(-r, -1.6, r * 2, 3.2);
        ctx.restore();
        ctx.globalAlpha = 1;
      });
    };
    // Only simulate and draw while the jar is on screen and the tab is visible.
    const start = () => {
      if (running || !onScreen || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(c);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      Matter.Engine.clear(e);
      Matter.Composite.clear(e.world, false);
      marbles.current = [];
      if (engine.current === e) engine.current = null;
    };
  }, []);

  const drop = (i: number) => {
    const e = engine.current;
    if (!e) return;
    const body = Matter.Bodies.circle(14 + Math.random() * 10, -R * 2, R, { restitution: 0.45, friction: 0.005, frictionAir: 0.004, density: 0.004 });
    Matter.Body.setVelocity(body, { x: 1.2, y: 0 });
    Matter.Composite.add(e.world, body);
    marbles.current.push({ body, step: i, color: steps[i].color });
  };
  const pop = (i: number) => {
    const e = engine.current;
    const m = marbles.current.find((x) => x.step === i && x.pop === undefined);
    if (!e || !m) return;
    Matter.Composite.remove(e.world, m.body);
    m.pop = 0;
  };
  const toggle = (i: number) => {
    const next = doneRef.current.map((d, k) => (k === i ? !d : d));
    if (next[i]) drop(i);
    else pop(i);
    doneRef.current = next;
    setDone(next);
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let n = 0;
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      const total = steps.length;
      const t = n++ % (total + 3);
      if (t < total) toggle(t);
      else if (t === total + 2) {
        steps.forEach((_, i) => {
          if (doneRef.current[i]) toggle(i);
        });
      }
    }, 1400);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  return (
    <div className="w-[380px] max-w-full rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]">
      <div className="flex items-baseline justify-between">
        <h3 className="m-0 text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Get set up</h3>
        <span className="text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={count} className="inline-block font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>{count}</motion.span>
          </AnimatePresence>{" "}of {steps.length}
        </span>
      </div>
      <div className="mt-4 flex gap-3">
        <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-1 p-0">
          {steps.map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                role="checkbox"
                aria-checked={done[i]}
                onClick={() => {
                  touched.current = true;
                  if (doneRef.current[i]) play("off", 0.6);
                  else {
                    play("tick", 0.6);
                    if (doneRef.current.filter(Boolean).length === steps.length - 1) play("done", 0.8);
                  }
                  toggle(i);
                }}
                className="flex w-full items-center gap-2.5 rounded-[12px] px-2 py-2 text-left outline-none hover:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:hover:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
              >
                <motion.span
                  className="relative flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full"
                  animate={{ background: done[i] ? s.color : "rgba(0,0,0,0)", scale: done[i] ? [1, 1.25, 1] : 1 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* the empty ring, faded out under the fill once ticked */}
                  <motion.span
                    className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1.5px_#c7c7cc] dark:shadow-[inset_0_0_0_1.5px_#636366]"
                    initial={false}
                    animate={{ opacity: done[i] ? 0 : 1 }}
                    transition={{ duration: 0.35 }}
                  />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" className="relative" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={false} animate={{ pathLength: done[i] ? 1 : 0 }} transition={{ duration: 0.25, delay: done[i] ? 0.1 : 0 }} /></svg>
                </motion.span>
                <span className="relative min-w-0 text-[14px] leading-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {s.label}
                  <motion.span className="absolute left-0 top-1/2 h-[1.5px] bg-[#86868b] dark:bg-[#8e8e93]" initial={false} animate={{ width: done[i] ? "100%" : "0%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }} />
                </span>
              </button>
            </li>
          ))}
          <AnimatePresence>
            {full && (
              <motion.li key="all" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1 rounded-[12px] bg-[#30d158]/10 px-3 py-2 text-[13px] font-medium text-[#1a7f37] dark:bg-[#30d158]/15 dark:text-[#30d158]">
                You&apos;re all set.
              </motion.li>
            )}
          </AnimatePresence>
        </ul>
        <canvas ref={canvas} className="h-auto w-[120px] flex-none" style={{ aspectRatio: `${RW} / ${RH}` }} aria-hidden="true" />
      </div>
    </div>
  );
}

function shade(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * 0.55);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

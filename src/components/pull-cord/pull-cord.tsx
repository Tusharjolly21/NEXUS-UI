"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface PullCordProps {
  /** Whether the light starts on. */
  defaultOn?: boolean;
  /** Called with the new state when the user pulls the cord (or presses Enter/Space on it). */
  onChange?: (on: boolean) => void;
  /** Headline while the light is on. */
  onText?: string;
  /** Headline while the light is off. */
  offText?: string;
  /** Small line under the headline. */
  hint?: string;
  /** Extra classes for the outer wrapper (it is 320px wide and shrinks with `max-w-full`). */
  className?: string;
  /** Tugs the cord every 2.6s until someone grabs it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/** Panel size in px. The scene is drawn at this size and scaled down to fit narrower parents. */
const W = 320;
const H = 300;
/** Cord anchor, number of segments and rest length per segment. */
const AX = 236;
const AY = 0;
const SEG = 12;
const LEN = 9;
/** How far past its rest length the bead must be pulled to arm the switch. */
const ARM = 34;

type Pt = { x: number; y: number; px: number; py: number };
const restPoints = (): Pt[] => Array.from({ length: SEG + 1 }, (_, i) => ({ x: AX, y: AY + i * LEN, px: AX, py: AY + i * LEN }));
const REST_PATH = restPoints().reduce((d, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${d} L ${p.x} ${p.y}`), "");
const REST_BEAD = `translate(${AX - 11}px, ${AY + SEG * LEN - 4}px)`;

/**
 * A light switch on a cord. The cord is a little verlet rope; grab the bead,
 * pull it down past its slack and let go, and the room lights up (or goes
 * dark). It swings and settles like a real cord. Enter or Space tugs it for
 * keyboard users. The light only ever fills this panel, never the page.
 */
export function PullCord({
  defaultOn = false,
  onChange,
  onText = "Lights on.",
  offText = "Lights off.",
  hint = "Pull the cord.",
  className = "",
  autoplay = false,
  enableSound = true,
}: PullCordProps) {
  const play = useSound(enableSound);
  const [on, setOn] = useState(defaultOn);
  const [scale, setScale] = useState(1);
  const fit = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const bead = useRef<HTMLButtonElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const grab = useRef<{ x: number; y: number } | null>(null);
  const pts = useRef<Pt[]>(restPoints());
  const armed = useRef(false);
  const onRef = useRef(defaultOn);
  const changeRef = useRef(onChange);
  const timers = useRef<number[]>([]);
  const touched = useRef(false);

  useEffect(() => {
    changeRef.current = onChange;
  }, [onChange]);

  const toggle = useCallback((byUser: boolean) => {
    const next = !onRef.current;
    onRef.current = next;
    setOn(next);
    if (byUser) {
      play(next ? "on" : "off");
      changeRef.current?.(next);
    } else {
      play.auto(next ? "on" : "off");
    }
  }, [play]);

  // Pull the bead down programmatically, then release.
  const tug = useCallback(
    (byUser: boolean) => {
      const end = pts.current[SEG];
      grab.current = { x: end.x, y: end.y + 46 };
      timers.current.push(
        window.setTimeout(() => {
          grab.current = null;
          armed.current = false;
          toggle(byUser);
        }, 220),
      );
    },
    [toggle],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  // Scale the fixed-size scene down when the parent is narrower than 320px.
  useEffect(() => {
    const el = fit.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(1, entry.contentRect.width / W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = pts.current;
      for (let i = 1; i < p.length; i++) {
        const q = p[i];
        const vx = (q.x - q.px) * 0.985;
        const vy = (q.y - q.py) * 0.985;
        q.px = q.x;
        q.py = q.y;
        q.x += vx;
        q.y += vy + 0.45;
      }
      const g = grab.current;
      for (let k = 0; k < 8; k++) {
        p[0].x = AX;
        p[0].y = AY;
        if (g) {
          p[SEG].x = g.x;
          p[SEG].y = g.y;
        }
        for (let i = 0; i < SEG; i++) {
          const a = p[i];
          const b = p[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d <= LEN) continue; // a cord can go slack but not longer
          const diff = (d - LEN) / d;
          if (i === 0) {
            b.x -= dx * diff;
            b.y -= dy * diff;
          } else {
            a.x += dx * diff * 0.5;
            a.y += dy * diff * 0.5;
            b.x -= dx * diff * 0.5;
            b.y -= dy * diff * 0.5;
          }
        }
      }
      const end = p[SEG];
      const pulled = end.y - (AY + SEG * LEN);
      if (g && pulled > ARM) armed.current = true;
      let d = `M ${p[0].x} ${p[0].y}`;
      for (let i = 1; i < p.length; i++) d += ` L ${p[i].x} ${p[i].y}`;
      path.current?.setAttribute("d", d);
      if (bead.current) bead.current.style.transform = `translate(${end.x - 11}px, ${end.y - 4}px)`;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      tug(false);
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay, tug]);

  /** Pointer position in scene coordinates (works at any scale). */
  const local = (e: RPointerEvent) => {
    const el = stage.current;
    if (!el) return { x: AX, y: AY + SEG * LEN };
    const r = el.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const release = () => {
    if (!grab.current || !touched.current) return;
    grab.current = null;
    if (armed.current) {
      armed.current = false;
      toggle(true);
    }
  };

  return (
    <div ref={fit} className={`w-[320px] max-w-full ${className}`.trim()} style={{ height: H * scale }}>
      <div
        ref={stage}
        className="relative touch-none select-none overflow-hidden rounded-[26px] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
        style={{ width: W, height: H, transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: "0 0" }}
        onPointerMove={(e) => {
          if (grab.current && touched.current) {
            const l = local(e);
            grab.current = { x: Math.max(AX - 70, Math.min(AX + 70, l.x)), y: Math.max(40, Math.min(H - 20, l.y)) };
          }
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={release}
      >
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ background: on ? "linear-gradient(180deg,#fff7e6,#ffe7c2)" : "linear-gradient(180deg,#1b1d24,#2a2d36)" }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="pointer-events-none absolute left-[96px] top-[60px] h-[260px] w-[200px] -translate-x-1/2"
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{ duration: on ? 0.15 : 0.4 }}
          style={{
            background: "conic-gradient(from 160deg at 50% 0%, transparent 0deg, rgba(255,214,140,.55) 20deg, rgba(255,214,140,.55) 40deg, transparent 60deg)",
            filter: "blur(6px)",
          }}
        />
        <div className="absolute left-[96px] top-0 h-[34px] w-[2px] -translate-x-1/2 bg-[#3a3a3c]" />
        <motion.div
          className="absolute left-[96px] top-[32px] h-[38px] w-[84px] -translate-x-1/2 rounded-b-[6px] rounded-t-[42px]"
          initial={false}
          animate={{ backgroundColor: on ? "#1d1d1f" : "#44464f" }}
        />
        <motion.div
          className="absolute left-[96px] top-[64px] h-[18px] w-[18px] -translate-x-1/2 rounded-full"
          initial={false}
          animate={{ backgroundColor: on ? "#fff3c4" : "#6b6e78", boxShadow: on ? "0 0 30px 12px rgba(255,214,140,.9)" : "0 0 0 0 rgba(0,0,0,0)" }}
          transition={{ duration: on ? 0.12 : 0.4 }}
        />
        <motion.div className="absolute bottom-6 left-6" initial={false} animate={{ color: on ? "#1d1d1f" : "#f5f5f7" }} aria-live="polite">
          <div className="text-[22px] font-semibold tracking-[-0.03em]">{on ? onText : offText}</div>
          <div className="text-[12px] opacity-70">{hint}</div>
        </motion.div>
        <svg className="pointer-events-none absolute inset-0" width={W} height={H} aria-hidden="true">
          <path ref={path} d={REST_PATH} fill="none" stroke={on ? "#8e8e93" : "#c7c7cc"} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <button
          ref={bead}
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Light"
          onPointerDown={(e) => {
            touched.current = true;
            stage.current?.setPointerCapture(e.pointerId);
            grab.current = local(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (e.repeat) return;
              touched.current = true;
              tug(true);
            }
          }}
          className="absolute left-0 top-0 h-[26px] w-[22px] cursor-grab rounded-[11px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:focus-visible:ring-[#0a84ff]"
          style={{
            transform: REST_BEAD,
            background: "linear-gradient(180deg,#e5e5ea,#a1a1a6)",
            boxShadow: "0 4px 10px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.7)",
          }}
        />
      </div>
    </div>
  );
}

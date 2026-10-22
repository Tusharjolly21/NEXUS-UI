"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface ScratchRevealProps {
  /** The code under the foil; copied to the clipboard by the Copy button. */
  code?: string;
  /** Prize line above the code. */
  headline?: string;
  /** Small uppercase line above the headline. */
  eyebrow?: string;
  /** Colour of the eyebrow. */
  accent?: string;
  /** Share of the foil (0..1) that must be scratched off before the rest lifts away. */
  threshold?: number;
  /** Called once each time the foil comes off (scratched, revealed with the keyboard, or by autoplay). */
  onReveal?: () => void;
  /** Called with the code after it has been copied to the clipboard. */
  onCopy?: (code: string) => void;
  /** Extra classes for the outer wrapper (it is 320px wide and shrinks with `max-w-full`). */
  className?: string;
  /** Scratches the card in a zig-zag, reveals it and starts over, until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/** Card size and brush width in px. The card is drawn at this size and scaled down to fit narrower parents. */
const W = 320;
const H = 190;
const BRUSH = 22;
/** Extra canvas height below the card so dust can fall out of it. */
const SPILL = 80;
const CONFETTI = ["#ff375f", "#ffd60a", "#30d158", "#0a84ff", "#bf5af2"];

type Fleck = { x: number; y: number; vx: number; vy: number; life: number };

const dprOf = () => Math.min(2, window.devicePixelRatio || 1);

/** Brushed silver foil with grain and a "SCRATCH HERE" label. */
function paintFoil(c: HTMLCanvasElement) {
  const dpr = dprOf();
  c.width = W * dpr;
  c.height = H * dpr;
  // The first getContext call fixes the options; scratching reads pixels back often.
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return;
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.globalCompositeOperation = "source-over";
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#d9dadf");
  g.addColorStop(0.35, "#f4f5f8");
  g.addColorStop(0.5, "#b9bbc3");
  g.addColorStop(0.7, "#eceef2");
  g.addColorStop(1, "#c4c6cd");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.globalAlpha = 0.08;
  x.fillStyle = "#000";
  for (let i = 0; i < 900; i++) x.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  x.globalAlpha = 1;
  x.fillStyle = "rgba(29,29,31,.5)";
  x.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
  x.textAlign = "center";
  x.fillText("SCRATCH HERE", W / 2, H / 2 + 4);
}

/**
 * Scratch card for a reward. Rub the foil with the pointer: it wears through
 * where you scratch and sheds flecks of silver dust. Once most of it is gone
 * the rest of the foil lifts away on its own and the code is ready to copy.
 */
export function ScratchReveal({
  code = "MOTION20",
  headline = "20% off Pro",
  eyebrow = "You won",
  accent = "#bf5af2",
  threshold = 0.55,
  onReveal,
  onCopy,
  className = "",
  autoplay = false,
  enableSound = true,
}: ScratchRevealProps) {
  const play = useSound(enableSound);
  const foil = useRef<HTMLCanvasElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  const fit = useRef<HTMLDivElement>(null);
  const flecks = useRef<Fleck[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);
  const doneRef = useRef(false);
  const revealRef = useRef(onReveal);
  const touched = useRef(false);
  const lastSwipe = useRef(0);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const [pct, setPct] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    revealRef.current = onReveal;
  }, [onReveal]);

  const reveal = useCallback(
    (byUser = false) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setDone(true);
      if (byUser) play("success");
      else play.auto("success");
      revealRef.current?.();
    },
    [play],
  );

  // A fresh foil is painted whenever the card is (re)covered.
  useEffect(() => {
    if (!done && foil.current) paintFoil(foil.current);
  }, [done]);

  // Scale the fixed-size card down when the parent is narrower than 320px.
  useEffect(() => {
    const el = fit.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(1, entry.contentRect.width / W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Dust: a separate canvas, taller than the card, with simple gravity and fade.
  useEffect(() => {
    const d = dust.current;
    const dx = d?.getContext("2d");
    if (!d || !dx) return;
    const dpr = dprOf();
    d.width = W * dpr;
    d.height = (H + SPILL) * dpr;
    dx.scale(dpr, dpr);
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      dx.clearRect(0, 0, W, H + SPILL);
      flecks.current = flecks.current.filter((f) => f.life > 0);
      for (const f of flecks.current) {
        f.vy += 0.25;
        f.x += f.vx;
        f.y += f.vy;
        f.life -= 0.02;
        dx.globalAlpha = Math.max(0, f.life);
        dx.fillStyle = "#a1a3ab";
        dx.fillRect(f.x, f.y, 2, 2);
      }
      dx.globalAlpha = 1;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const scratch = useCallback(
    (x: number, y: number, byUser = false) => {
      const c = foil.current;
      const ctx = c?.getContext("2d", { willReadFrequently: true });
      if (doneRef.current || !c || !ctx) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = BRUSH;
      const l = last.current ?? { x, y };
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      last.current = { x, y };
      const now = performance.now();
      // The demo scratches on a frame loop, so its rasp is spaced wider than a hand's.
      if (now - lastSwipe.current >= (byUser ? 120 : 350)) {
        lastSwipe.current = now;
        if (byUser) play("swipe", 0.25);
        else play.auto("swipe", 0.25);
      }
      for (let i = 0; i < 3; i++) {
        flecks.current.push({ x: x + (Math.random() - 0.5) * BRUSH, y: y + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 1.5, life: 1 });
      }
      // Every 12th stroke, sample every 16th pixel's alpha to estimate how much foil is left.
      if (++strokes.current % 12 === 0) {
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let clear = 0;
        let total = 0;
        for (let i = 3; i < data.length; i += 4 * 16) {
          total++;
          if (data[i] < 40) clear++;
        }
        const p = clear / total;
        setPct(Math.round(p * 100));
        if (p > threshold) reveal(byUser);
      }
    },
    [threshold, reveal, play],
  );

  useEffect(() => {
    if (!autoplay) return;
    let raf = 0;
    let t = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (touched.current) {
        cancelAnimationFrame(raf);
        return;
      }
      t += 1;
      if (t < 220) {
        const k = t / 220;
        const x = 30 + ((Math.sin(k * Math.PI * 9) + 1) / 2) * (W - 60);
        const y = 25 + k * (H - 50);
        scratch(x, y);
      } else if (t > 380) {
        t = 0;
        last.current = null;
        strokes.current = 0;
        doneRef.current = false;
        setDone(false);
        setPct(0);
        setCopied("idle");
        if (foil.current) paintFoil(foil.current);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, scratch]);

  /** Pointer position in card coordinates (works at any scale). */
  const pos = (e: RPointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const copy = async () => {
    touched.current = true;
    play("tap");
    try {
      await navigator.clipboard.writeText(code);
      setCopied("copied");
      onCopy?.(code);
    } catch {
      // Clipboard can be blocked (permissions, insecure context, sandboxed iframe).
      setCopied("failed");
    }
  };

  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`.trim()}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div ref={fit} className="w-[320px] max-w-full" style={{ height: H * scale }}>
        <div className="relative overflow-visible" style={{ width: W, height: H, transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: "0 0" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[22px] text-center [background:radial-gradient(120%_100%_at_20%_0%,#fff3d6,transparent_60%),linear-gradient(135deg,#ffe7f0,#e8e4ff)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:[background:radial-gradient(120%_100%_at_20%_0%,rgba(255,214,140,.16),transparent_60%),linear-gradient(135deg,#3a2433,#262140)]">
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
              {eyebrow}
            </span>
            <span className="text-[30px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{headline}</span>
            <button
              type="button"
              disabled={!done}
              onClick={copy}
              aria-label={copied === "copied" ? `Code ${code} copied` : `Copy code ${code}`}
              className="mt-1 flex items-center gap-2 rounded-full border border-dashed border-[#1d1d1f]/30 bg-white/70 px-4 py-2 text-[15px] font-semibold tracking-[0.12em] text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] disabled:opacity-100 dark:border-white/30 dark:bg-white/10 dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
              style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}
            >
              {code}
              <span className="text-[11px] font-medium tracking-normal text-[#0071e3] dark:text-[#0a84ff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
                {copied === "copied" ? "Copied" : copied === "failed" ? "Couldn't copy" : "Copy"}
              </span>
            </button>
          </div>
          <AnimatePresence>
            {!done && (
              <motion.canvas
                key="foil"
                ref={foil}
                tabIndex={0}
                role="button"
                aria-label="Scratch card foil. Scratch it off, or press Enter to reveal the code."
                className="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
                exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)", transition: { duration: 0.6 } }}
                onPointerDown={(e) => {
                  touched.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  last.current = null;
                  const p = pos(e);
                  scratch(p.x, p.y, true);
                }}
                onPointerMove={(e) => {
                  if (e.buttons || e.pointerType === "touch") {
                    const p = pos(e);
                    scratch(p.x, p.y, true);
                  } else last.current = null;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    touched.current = true;
                    reveal(true);
                  }
                }}
              />
            )}
          </AnimatePresence>
          {done &&
            Array.from({ length: 14 }, (_, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute h-2 w-2 rounded-[2px]"
                style={{ left: W / 2, top: H / 2, background: CONFETTI[i % CONFETTI.length] }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: Math.cos(i) * (120 + (i % 3) * 30), y: Math.sin(i) * 80 - 30, opacity: 0, rotate: 180 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            ))}
          <canvas ref={dust} className="pointer-events-none absolute left-0 top-0" style={{ width: W, height: H + SPILL }} aria-hidden="true" />
        </div>
      </div>
      <span className="text-[13px] tabular-nums text-[#86868b] dark:text-[#98989d]">
        {done ? "Revealed. Tap the code to copy it." : `Scratch the foil · ${pct}%`}
      </span>
      <span role="status" className="sr-only">
        {done ? `Revealed: ${code}` : ""}
      </span>
    </div>
  );
}

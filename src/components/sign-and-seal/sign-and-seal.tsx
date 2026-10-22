"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SignAndSealProps {
  name?: string;
  title?: string;
  /** Ink colour. Defaults to near-black, or near-white in dark mode. */
  ink?: string;
  /** Signs itself on a loop until the user draws. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

const W = 300;
const H = 190;

// A loose cursive scribble used for the demo signature.
const DEMO: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 140; i++) {
    const t = i / 140;
    const x = 40 + t * 210;
    const y = 120 + Math.sin(t * 18) * 14 * (1 - t * 0.4) - Math.sin(t * 5) * 10 + (t > 0.85 ? (t - 0.85) * 120 : 0);
    pts.push([x + Math.cos(t * 18) * 9, y]);
  }
  return pts;
})();

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const readDark = () => document.documentElement.classList.contains("dark");
const readDarkServer = () => false;

/**
 * Sign the card with your pointer, one stroke at a time. Pause for a moment and
 * a clear plastic sleeve slides down over it, with a glint running across.
 */
export function SignAndSeal({ name = "Alex Rivera", title = "Founding member", ink, autoplay = false, enableSound = true }: SignAndSealProps) {
  const play = useSound(enableSound);
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<[number, number][][]>([]);
  const drawing = useRef(false);
  const idle = useRef<number | undefined>(undefined);
  const sounds = useRef<number[]>([]);
  const [inked, setInked] = useState(false);
  const [sealed, setSealed] = useState(false);
  const touched = useRef(false);
  const dark = useSyncExternalStore(subscribeTheme, readDark, readDarkServer);
  const color = ink ?? (dark ? "#f5f5f7" : "#1d1d1f");
  const inkRef = useRef(color);

  const redraw = useCallback(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = inkRef.current;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of strokes.current) {
      if (s.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(s[0][0], s[0][1]);
      for (let i = 1; i < s.length - 1; i++) {
        const mx = (s[i][0] + s[i + 1][0]) / 2,
          my = (s[i][1] + s[i + 1][1]) / 2;
        ctx.quadraticCurveTo(s[i][0], s[i][1], mx, my);
      }
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    redraw();
  }, [redraw]);

  // repaint the ink whenever its colour (or the theme) changes
  useEffect(() => {
    inkRef.current = color;
    redraw();
  }, [color, redraw]);

  const armSeal = useCallback(() => {
    clearTimeout(idle.current);
    idle.current = window.setTimeout(() => {
      if (strokes.current.some((s) => s.length > 6)) {
        setSealed(true);
        // Only the visitor's own signature is heard, never the autoplay demo.
        if (touched.current) {
          sounds.current.push(window.setTimeout(() => play("knock"), 350), window.setTimeout(() => play("success"), 800));
        }
      }
    }, 900);
  }, [play]);

  const clear = useCallback(() => {
    clearTimeout(idle.current);
    sounds.current.forEach((t) => window.clearTimeout(t));
    sounds.current.length = 0;
    strokes.current = [];
    setInked(false);
    setSealed(false);
    redraw();
  }, [redraw]);

  useEffect(() => {
    if (!autoplay) return;
    let raf = 0;
    const play = () => {
      if (touched.current) return;
      clear();
      let i = 0;
      strokes.current = [[]];
      const step = () => {
        if (touched.current) return;
        for (let k = 0; k < 3 && i < DEMO.length; k++, i++) strokes.current[0].push(DEMO[i]);
        setInked(true);
        redraw();
        if (i < DEMO.length) raf = requestAnimationFrame(step);
        else armSeal();
      };
      raf = requestAnimationFrame(step);
    };
    const a = setTimeout(play, 700);
    const t = setInterval(play, 5200);
    return () => {
      clearTimeout(a);
      clearInterval(t);
      cancelAnimationFrame(raf);
    };
  }, [autoplay, clear, redraw, armSeal]);

  useEffect(() => {
    const pending = sounds.current;
    return () => {
      clearTimeout(idle.current);
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const pos = (e: RPointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H] as [number, number];
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: W, height: H + 40 }}>
        <motion.div
          className="absolute bottom-0 left-0 overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_40px_-24px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_40px_-24px_rgba(0,0,0,.8)]"
          style={{ width: W, height: H }}
          animate={sealed ? { scale: [1, 0.985, 1] } : {}}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <div className="pointer-events-none absolute inset-x-5 top-4 flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#8e8e93]">{title}</span>
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{name}</span>
            </div>
            <span className="rounded-md bg-[#f0f0f3] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">No. 0042</span>
          </div>
          <div className="pointer-events-none absolute inset-x-5 bottom-10 border-b border-dashed border-[#d2d2d7] dark:border-[#48484a]" />
          <span className="pointer-events-none absolute bottom-4 left-5 text-[11px] text-[#86868b] dark:text-[#8e8e93]">{inked ? "Signature" : "Sign here"}</span>
          <canvas
            ref={canvas}
            aria-label="Signature pad. Draw your signature."
            role="img"
            className="absolute inset-0 cursor-crosshair touch-none"
            style={{ width: W, height: H }}
            onPointerDown={(e) => {
              if (sealed) return;
              touched.current = true;
              (e.currentTarget as Element).setPointerCapture(e.pointerId);
              drawing.current = true;
              clearTimeout(idle.current);
              strokes.current.push([pos(e)]);
              setInked(true);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              strokes.current[strokes.current.length - 1].push(pos(e));
              redraw();
            }}
            onPointerUp={() => {
              drawing.current = false;
              armSeal();
            }}
            onPointerCancel={() => {
              drawing.current = false;
            }}
          />
        </motion.div>

        {/* plastic sleeve */}
        <AnimatePresence>
          {sealed && (
            <motion.div
              key="sleeve"
              className="pointer-events-none absolute left-[-8px] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,.12))] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.9),inset_0_0_0_2.5px_rgba(0,0,0,.06),0_18px_30px_-18px_rgba(0,0,0,.35)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.04))] dark:shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.32),inset_0_0_0_2.5px_rgba(0,0,0,.4),0_18px_30px_-18px_rgba(0,0,0,.8)]"
              style={{ width: W + 16, height: H + 16, bottom: -8, backdropFilter: "saturate(1.1)" }}
              initial={{ y: -(H + 60), opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -(H + 60), opacity: 0, transition: { duration: 0.35 } }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
            >
              <span className="absolute left-1/2 top-2.5 h-2 w-14 -translate-x-1/2 rounded-full bg-[#1d1d1f]/10 shadow-[inset_0_1px_2px_rgba(0,0,0,.2)] dark:bg-black/40 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,.5)]" />
              <motion.span
                className="absolute -left-1/2 top-0 h-full w-1/2 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,.75),transparent)] dark:bg-[linear-gradient(100deg,transparent,rgba(255,255,255,.3),transparent)]"
                style={{ rotate: 12 }}
                initial={{ x: "-40%" }}
                animate={{ x: "380%" }}
                transition={{ duration: 1.1, delay: 0.45, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex h-9 items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
          {sealed ? (
            <motion.span key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
              Signed and sealed.
            </motion.span>
          ) : (
            <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">
              Sign, then pause.
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => {
            touched.current = true;
            clear();
          }}
          className="h-9 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:focus-visible:outline-[#0a84ff]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

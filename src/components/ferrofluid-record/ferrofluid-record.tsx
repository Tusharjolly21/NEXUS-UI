"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const S = 300, C = S / 2, N = 26;
const STEP = 1000 / 60; // the simulation advances in fixed 60 Hz steps, whatever the display refresh rate

export interface FerrofluidRecordProps {
  /** Moves a pretend magnet around the drop and records a few short notes until someone touches it. */
  autoplay?: boolean;
}

type Note = { id: number; secs: number };

/**
 * A record button made of ferrofluid. The black drop grows spikes towards
 * your cursor like a magnet is pulling at it, and while you record, the whole
 * surface bristles in time with your voice (a simulated voice: the
 * microphone is never opened). Stop, and the spikes melt back into a smooth bead.
 */
export function FerrofluidRecord({ autoplay = false }: FerrofluidRecordProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const magnet = useRef<{ x: number; y: number; on: boolean }>({ x: C, y: C, on: false });
  const recRef = useRef(false);
  const [rec, setRec] = useState(false);
  const [secs, setSecs] = useState(0);
  const secsRef = useRef(0);
  const noteId = useRef(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const touched = useRef(false);
  const active = useRef(true); // on screen and tab visible
  const gate = useRef<((on: boolean) => void) | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    secsRef.current = secs;
  });

  // track whether the component is on screen and the tab is visible
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let inView = true;
    const update = () => {
      const on = inView && !document.hidden;
      if (on === active.current) return;
      active.current = on;
      gate.current?.(on);
    };
    const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([e]) => { inView = e.isIntersecting; update(); }) : null;
    io?.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => { io?.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = S * dpr; c.height = S * dpr;
    // the drop is black on purpose; only the shadow, rim and sheen adapt to the page
    const html = document.documentElement;
    let dark = html.classList.contains("dark");
    const mo = new MutationObserver(() => { dark = html.classList.contains("dark"); });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });

    const theta = Array.from({ length: N }, (_, i) => (i / N) * Math.PI * 2 + Math.sin(i * 7.3) * 0.04);
    const h = new Float32Array(N), hv = new Float32Array(N);
    let R = 46, Rv = 0, cx = C, cy = C, t = 0, level = 0;
    const W = ((Math.PI * 2) / N) * 1.6;

    const step = () => {
      t += 1 / 60;
      const m = magnet.current, recording = recRef.current;
      // a fake voice: syllables riding on a slower phrase envelope
      const voice = recording ? Math.max(0, Math.sin(t * 2.1) * 0.5 + 0.5) * (0.45 + 0.55 * Math.abs(Math.sin(t * 9.7) * Math.sin(t * 5.3))) : 0;
      level += (voice - level) * 0.25;
      const targetR = recording ? 54 : 46;
      Rv += ((targetR - R) * 0.08 - Rv * 0.25); R += Rv;
      const mx = m.x - C, my = m.y - C, md = Math.hypot(mx, my), ma = Math.atan2(my, mx);
      const pull = m.on ? Math.max(0, Math.min(1, 1 - (md - R) / 170)) : 0;
      // the bead itself leans towards the magnet
      cx += (C + (m.on ? (mx / (md || 1)) * 7 * pull : 0) - cx) * 0.1;
      cy += (C + (m.on ? (my / (md || 1)) * 7 * pull : 0) - cy) * 0.1;
      for (let i = 0; i < N; i++) {
        let d = Math.abs(theta[i] - ma) % (Math.PI * 2); if (d > Math.PI) d = Math.PI * 2 - d;
        const align = Math.pow(Math.max(0, Math.cos(d)), 3);
        const noise = Math.sin(t * 3 + i * 2.17) * 0.5 + Math.sin(t * 7.1 + i * 0.73) * 0.5;
        const target = Math.pow(align, 1.5) * pull * 64 + level * (24 + 14 * noise) + (recording ? 7 : 0);
        hv[i] += (target - h[i]) * 0.12 - hv[i] * 0.22;
        h[i] += hv[i];
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, S, S);
      // soft floor shadow
      ctx.save(); ctx.translate(C, C + R + 34); ctx.scale(1, 0.22);
      const sh = ctx.createRadialGradient(0, 0, 2, 0, 0, R * 1.3);
      sh.addColorStop(0, dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.28)"); sh.addColorStop(1, dark ? "rgba(255,255,255,0)" : "rgba(0,0,0,0)");
      ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, R * 1.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.beginPath();
      const steps = 360;
      for (let k = 0; k <= steps; k++) {
        const phi = (k / steps) * Math.PI * 2;
        let r = R;
        for (let i = 0; i < N; i++) {
          let d = Math.abs(phi - theta[i]); if (d > Math.PI) d = Math.PI * 2 - d;
          if (d < W) r += Math.max(0, h[i]) * Math.pow(1 - d / W, 2.4);
        }
        const x = cx + Math.cos(phi) * r, y = cy + Math.sin(phi) * r;
        if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.closePath();
      const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.1, cx, cy, R * 1.6);
      g.addColorStop(0, "#3a3a3e"); g.addColorStop(0.45, "#121214"); g.addColorStop(1, "#000");
      ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.clip();
      // glossy highlights: a broad window reflection and a rim light
      const hl = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.5, 1, cx - R * 0.42, cy - R * 0.5, R * 0.55);
      hl.addColorStop(0, "rgba(255,255,255,.55)"); hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hl; ctx.fillRect(0, 0, S, S);
      const rim = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 2.2);
      rim.addColorStop(0, "rgba(255,255,255,0)"); rim.addColorStop(1, dark ? "rgba(160,175,200,.5)" : "rgba(160,175,200,.35)");
      ctx.fillStyle = rim; ctx.fillRect(0, 0, S, S);
      ctx.restore();
      ctx.lineWidth = 1; ctx.strokeStyle = dark ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.08)"; ctx.stroke();
    };

    let raf = 0, last = 0, acc = 0, running = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      acc += Math.min(100, now - last);
      last = now;
      let n = 0;
      while (acc >= STEP && n < 4) { step(); acc -= STEP; n++; }
      if (n === 4) acc = 0;
      draw();
    };
    const run = (on: boolean) => {
      if (on && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
      else if (!on && running) { running = false; cancelAnimationFrame(raf); }
    };
    gate.current = run;
    run(active.current);
    return () => { gate.current = null; run(false); mo.disconnect(); };
  }, []);

  useEffect(() => {
    if (!rec) return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [rec]);

  const toggle = useCallback(() => {
    const next = !recRef.current;
    recRef.current = next;
    setRec(next);
    if (next) setSecs(0);
    else {
      const n = Math.max(1, secsRef.current);
      setNotes((list) => [{ id: ++noteId.current, secs: n }, ...list].slice(0, 3));
    }
  }, []);

  useEffect(() => {
    if (!autoplay || reduced) return;
    let k = 0;
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      if (!active.current) return;
      k++;
      const a = k * 0.35;
      magnet.current = { x: C + Math.cos(a) * 110, y: C + Math.sin(a * 1.3) * 90, on: (k % 60) < 40 };
      if (k % 60 === 40 || k % 60 === 58) toggle();
    }, 50);
    return () => clearInterval(id);
  }, [autoplay, reduced, toggle]);

  return (
    <div ref={root} className="flex w-[340px] max-w-full flex-col items-center">
      <div
        className="relative touch-none"
        style={{ width: S, height: S }}
        onPointerMove={(e) => { touched.current = true; const r = e.currentTarget.getBoundingClientRect(); magnet.current = { x: ((e.clientX - r.left) / r.width) * S, y: ((e.clientY - r.top) / r.height) * S, on: true }; }}
        onPointerLeave={() => { magnet.current = { ...magnet.current, on: false }; }}
      >
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <motion.button
          type="button"
          onClick={() => { touched.current = true; toggle(); }}
          whileTap={{ scale: 0.9 }}
          aria-pressed={rec}
          aria-label={rec ? "Stop recording" : "Record a voice note"}
          style={{ x: "-50%", y: "-50%" }}
          className="absolute left-1/2 top-1/2 flex h-[92px] w-[92px] items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-[#2997ff] dark:focus-visible:ring-offset-black"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {rec ? (
              <motion.span key="stop" className="h-5 w-5 rounded-[5px] bg-[#ff453a]" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} />
            ) : (
              <motion.svg key="mic" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" />
                <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <div className="h-6 text-[14px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]" aria-live="polite">
        {rec ? <span className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#ff453a]" />Recording 0:{String(secs).padStart(2, "0")}</span> : "Tap the drop to record."}
      </div>
      <ul className="m-0 mt-3 flex min-h-[44px] w-full list-none flex-col gap-2 p-0">
        <AnimatePresence initial={false}>
          {notes.map(({ id, secs: n }) => (
            <motion.li key={id} layout initial={{ opacity: 0, y: -12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 rounded-full bg-[#f5f5f7] py-2 pl-3 pr-4 dark:bg-[#2c2c2e]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"><svg width="10" height="10" viewBox="0 0 24 24" className="fill-white dark:fill-[#1d1d1f]" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg></span>
              <span className="flex h-6 flex-1 items-center gap-[2px]" aria-hidden="true">
                {Array.from({ length: 28 }, (_, k) => <motion.span key={k} className="w-[3px] rounded-full bg-[#1d1d1f]/70 dark:bg-[#f5f5f7]/70" initial={{ height: 2 }} animate={{ height: 4 + Math.abs(Math.sin(k * 1.7 + n)) * 16 }} transition={{ delay: k * 0.012, type: "spring", stiffness: 400, damping: 20 }} />)}
              </span>
              <span className="text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">0:{String(n).padStart(2, "0")}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

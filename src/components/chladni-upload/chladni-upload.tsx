"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}


const MODES: [number, number][] = [
  [1, 3],
  [2, 3],
  [3, 5],
  [3, 7],
  [5, 8],
];
const COUNT = 2600;

type Phase = "idle" | "uploading" | "done";

/** Distance from p to segment ab. */
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const vx = bx - ax, vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  const cx = ax + vx * t, cy = ay + vy * t;
  return { d: Math.hypot(px - cx, py - cy), cx, cy };
}

/**
 * Chladni Upload: sand on a vibrating plate as an upload progress indicator.
 * Each stage of the upload plays a higher note, and the sand jumps off the moving
 * parts of the plate and settles on the new quiet lines, so the pattern gets finer
 * as the file goes up. When it finishes, the sand gathers into a check mark.
 */
export interface ChladniUploadProps {
  /** The file name shown under the plate. */
  fileName?: string;
  /** Size in MB. The "x of y MB" line counts up to it. */
  fileSize?: number;
  /** Called once each time an upload reaches 100%. */
  /** How long a full upload takes, in seconds. */
  duration?: number;
  onComplete?: () => void;
  /** Uploads, holds the check, resets and goes again until someone presses the button. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export function ChladniUpload({ fileName = "mix-final.wav", fileSize = 24.6, duration = 7, onComplete, autoplay = false, className }: ChladniUploadProps) {
  const reduce = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const onScreen = useDemoActive(cardRef, true);
  const onScreenRef = useRef(false);
  const activeAuto = useDemoActive(cardRef, autoplay && !reduce);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
    onScreenRef.current = onScreen;
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touched = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const modeRef = useRef(0);
  const [mode, setMode] = useState(0);
  const progress = useMotionValue(0);
  const pct = useTransform(progress, (p) => `${Math.round(p * 100)}%`);
  const sent = useTransform(progress, (p) => `${(p * fileSize).toFixed(1)} of ${fileSize.toFixed(1)} MB`);
  const barW = useTransform(progress, (p) => `${p * 100}%`);
  const thunk = useMotionValue(1);
  const kick = useRef(0);
  const run = useRef<ReturnType<typeof animate> | null>(null);

  const setStage = (i: number) => {
    if (modeRef.current === i) return;
    modeRef.current = i;
    setMode(i);
    kick.current = 1;
    animate(thunk, [0.97, 1.012, 1], { duration: 0.5, ease: "easeOut" });
  };

  const start = () => {
    phaseRef.current = "uploading";
    setPhase("uploading");
    progress.set(0);
    setStage(0);
    run.current?.stop();
    run.current = animate(progress, 1, {
      duration,
      ease: [0.3, 0.1, 0.4, 1],
      onComplete: () => {
        phaseRef.current = "done";
        setPhase("done");
        completeRef.current?.();
        kick.current = 1;
        animate(thunk, [0.95, 1.03, 1], { duration: 0.6, ease: "easeOut" });
      },
    });
  };

  const reset = () => {
    run.current?.stop();
    phaseRef.current = "idle";
    setPhase("idle");
    progress.set(0);
    modeRef.current = -1;
    setStage(0);
  };

  // stage follows progress
  useEffect(
    () =>
      progress.on("change", (p) => {
        if (phaseRef.current === "uploading") setStage(Math.min(MODES.length - 1, Math.floor(p * MODES.length)));
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress],
  );

  // particles
  useEffect(() => {
    const canvas = canvasRef.current!;
    const g = canvas.getContext("2d")!;
    const xs = new Float32Array(COUNT), ys = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      xs[i] = Math.random();
      ys[i] = Math.random();
    }
    // check mark in unit space
    const check = [
      [0.27, 0.53],
      [0.43, 0.68],
      [0.74, 0.34],
    ];
    let raf = 0;
    let size = 0;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size = Math.round(r.width * dpr);
      canvas.width = canvas.height = size;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    fit();

    const frame = () => {
      // the sand only moves while it is on screen
      if (onScreenRef.current) {
        for (let it = 0; it < 3; it++) step();
        draw();
      }
      raf = requestAnimationFrame(frame);
    };
    const step = () => {
      const done = phaseRef.current === "done";
      const [n, m] = MODES[Math.max(0, modeRef.current)];
      const k = kick.current;
      kick.current *= 0.965;
      const amp = (phaseRef.current === "idle" ? 0.012 : 0.02) + k * 0.05;
      for (let i = 0; i < COUNT; i++) {
        const x = xs[i], y = ys[i];
        if (done) {
          const a = segDist(x, y, check[0][0], check[0][1], check[1][0], check[1][1]);
          const b = segDist(x, y, check[1][0], check[1][1], check[2][0], check[2][1]);
          const c = a.d < b.d ? a : b;
          const jitter = Math.min(0.03, c.d * 0.25) + k * 0.03;
          xs[i] += (c.cx - x) * 0.06 + (Math.random() - 0.5) * jitter;
          ys[i] += (c.cy - y) * 0.06 + (Math.random() - 0.5) * jitter;
        } else {
          const f = Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) - Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
          const s = Math.abs(f) * amp + 0.00025;
          xs[i] += (Math.random() - 0.5) * s * 2;
          ys[i] += (Math.random() - 0.5) * s * 2;
        }
        if (xs[i] < 0.02) xs[i] = 0.02 + Math.random() * 0.01;
        if (xs[i] > 0.98) xs[i] = 0.98 - Math.random() * 0.01;
        if (ys[i] < 0.02) ys[i] = 0.02 + Math.random() * 0.01;
        if (ys[i] > 0.98) ys[i] = 0.98 - Math.random() * 0.01;
      }
    };
    const draw = () => {
      g.clearRect(0, 0, size, size);
      g.fillStyle = "#f5f5f7";
      const d = Math.max(1.2, size / 260);
      for (let i = 0; i < COUNT; i++) g.fillRect(xs[i] * size - d / 2, ys[i] * size - d / 2, d, d);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // autoplay: upload, hold the check, reset, repeat
  useEffect(() => {
    if (!autoplay || reduce || !activeAuto) return;
    let t: number;
    const loop = () => {
      if (touched.current) return;
      start();
      t = window.setTimeout(() => {
        if (touched.current) return;
        reset();
        t = window.setTimeout(loop, 2200);
      }, 10500);
    };
    t = window.setTimeout(loop, 1600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, activeAuto]);

  const [n, m] = MODES[Math.max(0, mode)];
  const note = ["A2", "E3", "B3", "F#4", "C#5"][Math.max(0, mode)];

  return (
    <div
      ref={cardRef}
      className={cn("w-[340px] max-w-full rounded-[24px] bg-white p-5 dark:bg-[#1c1c1e] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]", className)}
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
    >
      <motion.div style={{ scale: thunk }} className="relative aspect-square w-full overflow-hidden rounded-[18px] bg-[#1d1d1f] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06),inset_0_-30px_60px_rgba(0,0,0,.35)]">
        <canvas ref={canvasRef} className="block h-full w-full" role="img" aria-label={phase === "done" ? "Sand gathered into a check mark" : `Sand settling into a ${n} by ${m} vibration pattern`} />
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-medium tabular-nums text-white backdrop-blur-md">
            {phase === "done" ? "Done" : `${note} · mode ${n}:${m}`}
          </span>
        </div>
      </motion.div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[12px] bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l11-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="17" cy="16" r="3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{fileName}</div>
          <div className="text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
            {phase === "idle" ? `${fileSize.toFixed(1)} MB · ready` : <motion.span>{sent}</motion.span>}
          </div>
        </div>
        <motion.span className="text-[20px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]" aria-live="off">
          {pct}
        </motion.span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]" role="progressbar" aria-label="Upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={phase === "done" ? 100 : phase === "idle" ? 0 : undefined}>
        <motion.div className="h-full rounded-full" style={{ width: barW, background: phase === "done" ? "#30d158" : "#0071e3" }} />
      </div>

      <div className="mt-4 flex justify-center">
        <motion.button
          type="button"
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          whileTap={{ scale: 0.94 }}
          disabled={phase === "uploading"}
          onClick={() => {
            touched.current = true;
            if (phase === "done") reset();
            else start();
          }}
          className="h-11 overflow-hidden rounded-full bg-[#0071e3] px-6 text-[15px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:bg-[#e8e8ed] disabled:text-[#6e6e73] dark:ring-offset-[#1c1c1e] dark:disabled:bg-[#3a3a3c] dark:disabled:text-[#a1a1a6]"
        >
          <motion.span key={phase} layout="position" className="inline-block" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
            {phase === "idle" ? "Upload" : phase === "uploading" ? "Uploading…" : "Upload another"}
          </motion.span>
        </motion.button>
      </div>
      <p className="m-0 mt-3 text-center text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Each stage is a higher note. The sand finds the new quiet lines.</p>
    </div>
  );
}

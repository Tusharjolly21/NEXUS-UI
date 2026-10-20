"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface GenerateImageProps {
  /** Prompt the field starts with. */
  prompt?: string;
  /** Called with the prompt each time the user presses Generate. */
  onGenerate?: (prompt: string) => void;
  /** Generates a new scene every few seconds, cycling the sample prompts, until someone interacts. */
  autoplay?: boolean;
}

const S = 300;
/** Resolutions (px) the picture passes through, coarse to fine. */
const STEPS = [5, 8, 12, 18, 28, 44, 70, 110, 170, 300];
const PALETTES = [
  { sky: ["#ffb38a", "#ff6f91"], sun: "#fff1c1", hills: ["#c44569", "#7d3c98", "#3d1e6d"] },
  { sky: ["#a1c4fd", "#c2e9fb"], sun: "#ffffff", hills: ["#6dd3a0", "#2f9e8f", "#1b5e5a"] },
  { sky: ["#0f2027", "#2c5364"], sun: "#f5f7a8", hills: ["#3a6073", "#203a43", "#0f2027"] },
  { sky: ["#fceabb", "#f8b500"], sun: "#fff8e1", hills: ["#e17055", "#a0522d", "#5d3a1a"] },
];
export const GENERATE_IMAGE_PROMPTS = ["Pink dusk over soft hills", "Morning valley, mint and sky", "Moonlit ridge, deep teal", "Desert at golden hour"];

/** Paints scene `k` locally: a sky gradient, a glowing sun and three layers of hills. */
function paint(ctx: CanvasRenderingContext2D, k: number) {
  const p = PALETTES[k % PALETTES.length];
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, p.sky[0]); g.addColorStop(1, p.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  const sx = 80 + (k * 53) % 140, sy = 90 + (k * 31) % 40;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 90);
  sg.addColorStop(0, p.sun); sg.addColorStop(0.3, p.sun + "cc"); sg.addColorStop(1, p.sun + "00");
  ctx.fillStyle = sg; ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = p.sun; ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.fill();
  p.hills.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    const base = 170 + i * 42;
    ctx.moveTo(0, S);
    for (let x = 0; x <= S; x += 6) ctx.lineTo(x, base + Math.sin(x / (40 + i * 18) + k * 1.7 + i) * (22 - i * 4) + Math.sin(x / 13 + i) * 3);
    ctx.lineTo(S, S); ctx.closePath(); ctx.fill();
  });
}

/**
 * Press Generate and the picture arrives the way a generated one does: big
 * blocks of colour first, finer and finer, noise easing off, under a sheet of
 * glass with light running across it. The progress line counts the steps.
 * Everything is painted on a canvas in the browser; nothing is fetched.
 */
export function GenerateImage({ prompt: initialPrompt = GENERATE_IMAGE_PROMPTS[0], onGenerate, autoplay = false }: GenerateImageProps) {
  const view = useRef<HTMLCanvasElement>(null);
  const [k, setK] = useState(0);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const touched = useRef(false);
  const timer = useRef(0);
  const inputId = `gen-prompt-${useId().replace(/:/g, "")}`;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const run = (seed: number) => {
    const v = view.current;
    const ctx = v?.getContext("2d", { willReadFrequently: true });
    const src = document.createElement("canvas");
    src.width = S; src.height = S;
    const sctx = src.getContext("2d");
    const small = document.createElement("canvas");
    const smallCtx = small.getContext("2d");
    if (!ctx || !sctx || !smallCtx) return;
    paint(sctx, seed);
    window.clearTimeout(timer.current);
    setBusy(true);
    let i = 0;
    const tick = () => {
      const res = STEPS[i];
      small.width = res; small.height = res;
      smallCtx.drawImage(src, 0, 0, res, res);
      // Hard pixels until the last two passes, then smooth.
      ctx.imageSmoothingEnabled = i >= STEPS.length - 2;
      ctx.drawImage(small, 0, 0, S, S);
      const noise = 1 - i / (STEPS.length - 1);
      if (noise > 0) {
        const img = ctx.getImageData(0, 0, S, S);
        for (let p = 0; p < img.data.length; p += 4) { const n = (Math.random() - 0.5) * 90 * noise; img.data[p] += n; img.data[p + 1] += n; img.data[p + 2] += n; }
        ctx.putImageData(img, 0, 0);
      }
      setStep(i + 1);
      i++;
      if (i < STEPS.length) timer.current = window.setTimeout(tick, 170 + i * 25);
      else setBusy(false);
    };
    tick();
  };

  // Keep the latest run for the autoplay timer without restarting it.
  const actions = useRef({ run });
  useEffect(() => {
    actions.current = { run };
  });

  useEffect(() => {
    if (!autoplay) return;
    let n = 0;
    const go = () => {
      if (touched.current) return;
      const s = n++;
      setPrompt(GENERATE_IMAGE_PROMPTS[s % GENERATE_IMAGE_PROMPTS.length]);
      setK(s);
      actions.current.run(s);
    };
    const first = window.setTimeout(go, 600);
    const t = window.setInterval(go, 5200);
    return () => { window.clearTimeout(first); window.clearInterval(t); };
  }, [autoplay]);

  const pct = Math.round((step / STEPS.length) * 100);
  return (
    <div
      className="flex w-[320px] flex-col gap-3 rounded-[26px] bg-white p-2.5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-30px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-30px_rgba(0,0,0,.8)]"
      onPointerDown={() => (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <div className="relative h-[300px] w-[300px] overflow-hidden rounded-[18px] bg-[#f0f0f3] dark:bg-[#2c2c2e]">
        <canvas ref={view} width={S} height={S} className="h-full w-full" role="img" aria-label={busy ? "Generating image" : step === 0 ? "No image yet" : prompt} />
        <AnimatePresence>
          {busy && (
            <motion.div
              key="glass"
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              style={{ backdropFilter: "saturate(1.2)", background: "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.04))", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.35)" }}
            >
              <motion.div
                className="absolute inset-y-0 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: [-120, 360] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur">Denoising {pct}%</span>
            </motion.div>
          )}
        </AnimatePresence>
        {step === 0 && !busy && <span className="absolute inset-0 flex items-center justify-center text-[13px] text-[#86868b] dark:text-[#8e8e93]">Your image appears here</span>}
      </div>
      <form
        className="flex items-center gap-2 rounded-full bg-[#f5f5f7] p-1 pl-3.5 dark:bg-[#2c2c2e]"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) return;
          const s = k + 1;
          setK(s);
          onGenerate?.(prompt);
          run(s);
        }}
      >
        <label htmlFor={inputId} className="sr-only">Prompt</label>
        <input
          id={inputId}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-9 min-w-0 flex-1 bg-transparent text-[14px] text-[#1d1d1f] outline-none dark:text-[#f5f5f7]"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.94 }}
          disabled={busy}
          className="relative h-9 flex-none overflow-hidden rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] disabled:opacity-80 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff]"
        >
          {busy && <motion.span className="absolute inset-y-0 left-0 bg-white/20 dark:bg-black/15" animate={{ width: `${pct}%` }} />}
          <span className="relative">{busy ? "Generating" : "Generate"}</span>
        </motion.button>
      </form>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export type ImageGeneratingAction = "Variations" | "Upscale" | "Download";

export interface ImageGeneratingProps {
  /** Prompts shown in turn, one per run. Defaults to two demo prompts. */
  prompts?: string[];
  /** How many denoising steps a run takes (one step about every 105ms). */
  steps?: number;
  /** Called with the prompt when Variations, Upscale or Download is pressed. Variations also starts a new run. */
  onAction?: (action: ImageGeneratingAction, prompt: string) => void;
  /** Starts a new run every few seconds until someone touches the component. Never runs under reduced motion and pauses when off screen. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const IMAGE_GENERATING_PROMPTS = ["A quiet harbour at dusk, soft film grain", "Desert dunes under a pale morning moon"];

const W = 480;
const H = 320;
const ACTIONS: ImageGeneratingAction[] = ["Variations", "Upscale", "Download"];
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

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

/** Paints a stand-in "result" for the demo: a layered landscape, dusk for even seeds and desert for odd ones. */
function paint(seed: number) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return c;
  const rnd = (() => {
    let s = seed * 9301 + 49297;
    return () => (s = (s * 9301 + 49297) % 233280) / 233280;
  })();
  const dusk = seed % 2 === 0;
  const sky = g.createLinearGradient(0, 0, 0, H * 0.62);
  if (dusk) {
    sky.addColorStop(0, "#26315f");
    sky.addColorStop(0.55, "#c76a6a");
    sky.addColorStop(1, "#f6b26b");
  } else {
    sky.addColorStop(0, "#b8c7dc");
    sky.addColorStop(0.6, "#e9d7c3");
    sky.addColorStop(1, "#f3e3cc");
  }
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  g.fillStyle = dusk ? "#ffe2b0" : "#fbfaf5";
  g.beginPath();
  g.arc(W * 0.66, H * (dusk ? 0.5 : 0.24), dusk ? 30 : 18, 0, Math.PI * 2);
  g.fill();
  const ridge = (y: number, amp: number, col: string, f: number) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) g.lineTo(x, y + Math.sin(x / f + seed) * amp + Math.sin(x / (f * 0.37)) * amp * 0.3);
    g.lineTo(W, H);
    g.fill();
  };
  if (dusk) {
    ridge(H * 0.56, 14, "#5b3f5e", 70);
    ridge(H * 0.6, 8, "#3a2c4a", 40);
    const sea = g.createLinearGradient(0, H * 0.62, 0, H);
    sea.addColorStop(0, "#e39a77");
    sea.addColorStop(1, "#2b2c4d");
    g.fillStyle = sea;
    g.fillRect(0, H * 0.62, W, H);
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(255,220,170,${0.15 + rnd() * 0.3})`;
      g.fillRect(W * 0.66 - 40 + rnd() * 80, H * 0.64 + i * 3, 10 + rnd() * 40, 1.5);
    }
    g.fillStyle = "#1e1a30";
    [
      [110, 0.78],
      [300, 0.84],
    ].forEach(([x, y]) => {
      g.beginPath();
      g.moveTo(x - 22, H * y);
      g.lineTo(x + 22, H * y);
      g.lineTo(x + 14, H * y + 7);
      g.lineTo(x - 14, H * y + 7);
      g.fill();
      g.fillRect(x - 1, H * y - 26, 2, 26);
    });
  } else {
    ridge(H * 0.58, 22, "#e2b98b", 90);
    ridge(H * 0.7, 18, "#d39d6a", 60);
    ridge(H * 0.84, 14, "#b97d4e", 45);
  }
  return c;
}

/**
 * An image generation state that looks like the image is actually forming.
 * It starts as noise, then a blurry blocky guess, then sharpens in steps
 * while the noise fades, with the step count and a thin progress line under
 * the prompt. When it lands, the actions slide up underneath. Variations
 * starts the next run. Under reduced motion the picture simply appears.
 */
export function ImageGenerating({ prompts = IMAGE_GENERATING_PROMPTS, steps = 30, onAction, autoplay = false, enableSound = true, className }: ImageGeneratingProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const [took, setTook] = useState<number | null>(null);
  const touched = useRef(false);
  /** Who started the current run: the first paint stays silent, the visitor and autoplay each get their own sound. */
  const origin = useRef<"mount" | "user" | "auto">("mount");
  const active = useDemoActive(root, autoplay && !reduce);
  const list = prompts.length ? prompts : IMAGE_GENERATING_PROMPTS;
  const prompt = list[run % list.length];

  // The runs read the latest sound player and callback through a ref.
  const latest = useRef({ play, onAction });
  useEffect(() => {
    latest.current = { play, onAction };
  });

  useEffect(() => {
    const canvas = cv.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const target = paint(run);
    // Reduced motion: no coarse-to-fine animation, the finished picture is drawn at once.
    if (reduce) {
      ctx.drawImage(target, 0, 0);
      return;
    }
    const small = document.createElement("canvas");
    const sctx = small.getContext("2d");
    if (!sctx) return;
    let k = 0;
    let raf = 0;
    let last = 0;
    let t0 = 0;
    const frame = (now: number) => {
      if (!t0) t0 = now;
      if (now - last > 105) {
        last = now;
        const t = k / steps;
        // coarse to fine: render at a growing resolution, smoothed up, plus fading noise
        const res = Math.max(4, Math.round(Math.pow(t, 1.6) * W));
        small.width = res;
        small.height = Math.max(3, Math.round((res * H) / W));
        sctx.drawImage(target, 0, 0, small.width, small.height);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(small, 0, 0, W, H);
        const amp = Math.pow(1 - t, 1.4) * 255;
        if (amp > 2) {
          const img = ctx.getImageData(0, 0, W, H);
          const d = img.data;
          const mono = k < 4; // pure static at the very start
          for (let i = 0; i < d.length; i += 4) {
            const n = (Math.random() - 0.5) * amp;
            d[i] = mono ? 128 + n : d[i] + n;
            d[i + 1] = mono ? 128 + n : d[i + 1] + n * 0.9;
            d[i + 2] = mono ? 128 + n : d[i + 2] + n * 1.1;
          }
          ctx.putImageData(img, 0, 0);
        }
        setStep(k);
        k++;
        if (k > steps) {
          ctx.drawImage(target, 0, 0);
          setTook((now - t0) / 1000);
          if (origin.current === "user") latest.current.play("chime", 0.5);
          else if (origin.current === "auto") latest.current.play.auto("chime", 0.5);
          return;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [run, reduce, steps]);

  const nextRun = (from: "user" | "auto") => {
    origin.current = from;
    setStep(0);
    setTook(null);
    setRun((r) => r + 1);
  };

  // Demo: start a new run every few seconds.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const id = window.setInterval(() => {
      if (touched.current) return;
      latest.current.play.auto("tap", 0.4);
      origin.current = "auto";
      setStep(0);
      setTook(null);
      setRun((r) => r + 1);
    }, 7000);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active]);

  const done = reduce || step >= steps;
  const status = done ? `Image ready: ${prompt}` : "Generating image";

  return (
    <div
      ref={root}
      className={cn(
        "w-[520px] max-w-full rounded-[28px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-5 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center gap-3 px-1">
        <span className="min-w-0 flex-1 truncate text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">
          <span className="text-[#6e6e73] dark:text-[#a1a1a6]">Prompt · </span>
          {prompt}
        </span>
        <span aria-hidden="true" className="flex-none text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
          {done ? (took ? `Done in ${took.toFixed(1)}s` : "Done") : `Step ${step} of ${steps}`}
        </span>
      </div>
      <div className="mt-2 h-[2px] overflow-hidden rounded-full bg-[#f0f0f3] dark:bg-[#3a3a3c]" aria-hidden="true">
        <motion.div
          className="h-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
          animate={{ width: `${(Math.min(step, steps) / steps) * 100}%`, opacity: done ? 0 : 1 }}
          transition={reduce ? { duration: 0 } : { width: { duration: 0.1 }, opacity: { delay: 0.3 } }}
        />
      </div>
      <motion.div
        className="relative mt-3 overflow-hidden rounded-[18px] bg-[#1d1d1f] dark:bg-[#2c2c2e]"
        animate={{ scale: done && !reduce ? [1, 1.012, 1] : 1 }}
        transition={{ duration: reduce ? 0 : 0.5 }}
      >
        <canvas ref={cv} width={W} height={H} className="block h-auto w-full" role="img" aria-label={done ? `Generated image: ${prompt}` : "Image generating"} />
        <AnimatePresence>
          {!done && (
            <motion.span
              aria-hidden="true"
              className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11.5px] font-medium text-white backdrop-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span className="h-1.5 w-1.5 rounded-full bg-white" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              Generating
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
      <div className="mt-3 flex h-9 items-center gap-2">
        <AnimatePresence>
          {done &&
            ACTIONS.map((a, i) => (
              <motion.button
                key={a}
                type="button"
                onClick={() => {
                  touched.current = true;
                  onAction?.(a, prompt);
                  if (a === "Variations") {
                    play("tap");
                    nextRun("user");
                  }
                }}
                className={cn(
                  "h-9 rounded-full px-4 text-[13px] font-medium",
                  FOCUS,
                  i === 2
                    ? "ml-auto bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
                    : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]",
                )}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0.12 } : { delay: 0.15 + i * 0.06 }}
              >
                {a}
              </motion.button>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface AskNexusInputProps {
  /** Headline above the field. */
  title?: string;
  /** Questions that roll through the placeholder while the field is empty. Sending an empty field asks the one showing. */
  placeholders?: string[];
  /** Time each placeholder stays up, in ms. */
  placeholderInterval?: number;
  /** Text the field starts with. */
  defaultValue?: string;
  /** Called with the trimmed question the moment it is sent, before the text turns to dust. */
  onSubmit?: (value: string) => void;
  /** Types and sends the placeholders in turn until someone touches the field. */
  autoplay?: boolean;
  /** Extra classes for the root. */
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

const DEFAULT_PLACEHOLDERS = [
  "What makes a landing page convert?",
  "Explain springs versus easing curves",
  "Write a haiku about shipping on Friday",
  "Which stack should a new startup pick?",
  "How do I make a button feel alive?",
];

/** Dark flag from the `dark` class on <html>; false on the server. */
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const useDark = () =>
  useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

type Phase = "idle" | "dissolving";

/**
 * A headline over a pill-shaped question field. Placeholder questions roll
 * past while it's empty; send one and the words break into dust that blows
 * off to the right, letter by letter from the end, before the field resets.
 */
export function AskNexusInput({
  title = "Ask Nexus UI anything",
  placeholders = DEFAULT_PLACEHOLDERS,
  placeholderInterval = 2800,
  defaultValue = "",
  onSubmit,
  autoplay = false,
  className = "",
  enableSound = true,
}: AskNexusInputProps) {
  const play = useSound(enableSound);
  const id = useId().replace(/:/g, "");
  const dark = useDark();
  const still = useReducedMotion() === true;
  const [value, setValue] = useState(defaultValue);
  const [phase, setPhase] = useState<Phase>("idle");
  const [snapshot, setSnapshot] = useState("");
  const [font, setFont] = useState("");
  const [ph, setPh] = useState(0);
  const kick = useSpring(1, { stiffness: 520, damping: 13 });
  const input = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const ready = useRef<(() => void) | null>(null);

  const current = placeholders.length ? placeholders[ph % placeholders.length] : "";

  useEffect(() => {
    if (phase !== "idle" || value || placeholders.length <= 1) return;
    const t = window.setInterval(() => setPh((i) => (i + 1) % placeholders.length), placeholderInterval);
    return () => window.clearInterval(t);
  }, [phase, value, placeholders.length, placeholderInterval]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || phase !== "idle") return;
    play("whoosh");
    onSubmit?.(q);
    setFont(input.current ? getComputedStyle(input.current).font : "");
    setSnapshot(q);
    if (!still) kick.jump(0.965);
    kick.set(1);
    setPhase(still ? "idle" : "dissolving");
    if (still) setValue("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    touched.current = true;
    ask(value || current);
  };

  const done = () => {
    setSnapshot("");
    setValue("");
    setPhase("idle");
    ready.current?.();
    ready.current = null;
    if (touched.current) requestAnimationFrame(() => input.current?.focus());
  };

  // Autoplay: type the showing placeholder, send it, wait, repeat.
  const list = placeholders.join("\u0000");
  useEffect(() => {
    const qs = list ? list.split("\u0000") : [];
    if (!autoplay || qs.length === 0) return;
    const local: number[] = [];
    let k = 1;
    const later = (f: () => void, ms: number) => local.push(window.setTimeout(() => !touched.current && f(), ms));
    const cycle = () => {
      const q = qs[k++ % qs.length];
      for (let c = 1; c <= q.length; c++) later(() => setValue(q.slice(0, c)), c * 42);
      later(() => {
        ready.current = () => later(cycle, 1500);
        setFont(input.current ? getComputedStyle(input.current).font : "");
        setSnapshot(q);
        kick.jump(0.965);
        kick.set(1);
        setPhase("dissolving");
      }, q.length * 42 + 600);
    };
    local.push(window.setTimeout(cycle, 1400));
    return () => local.forEach((t) => window.clearTimeout(t));
  }, [autoplay, list, kick]);

  const showPh = phase === "idle" && !value;

  return (
    <div
      className={cn(`flex w-full flex-col items-center gap-8 px-1 py-6`, className)}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <h2 className="text-balance text-center text-[clamp(28px,6vw,44px)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
        {title}
      </h2>

      <form onSubmit={submit} className="w-full max-w-[540px]">
        <motion.div
          style={{ scale: kick }}
          className="flex h-14 items-center gap-2 rounded-full bg-white pl-5 pr-2 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-26px_rgba(0,0,0,.35)] transition-shadow focus-within:shadow-[0_0_0_1px_rgba(0,113,227,.5),0_0_0_5px_rgba(0,113,227,.12),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_20px_40px_-26px_rgba(0,0,0,.9)] dark:focus-within:shadow-[0_0_0_1px_rgba(10,132,255,.6),0_0_0_5px_rgba(10,132,255,.18),0_20px_40px_-26px_rgba(0,0,0,.9)]"
        >
          <svg viewBox="0 0 20 20" className="h-[18px] w-[18px] shrink-0 text-[#86868b] dark:text-[#98989d]" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12.6 12.6L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div className="relative h-7 min-w-0 flex-1">
            <div className="absolute inset-0 overflow-hidden">
              <label htmlFor={`${id}-q`} className="sr-only">
                Ask a question
              </label>
              <input
                ref={input}
                id={`${id}-q`}
                value={value}
                onChange={(e) => {
                  touched.current = true;
                  setValue(e.target.value);
                }}
                onFocus={() => {
                  touched.current = true;
                }}
                readOnly={phase !== "idle"}
                spellCheck={false}
                autoComplete="off"
                className={`absolute inset-0 w-full bg-transparent text-[16px] tracking-[-0.01em] text-[#1d1d1f] outline-none dark:text-[#f5f5f7] ${phase === "dissolving" ? "opacity-0" : ""}`}
              />
              <AnimatePresence mode="popLayout" initial={false}>
                {showPh && (
                  <motion.span
                    key={ph}
                    aria-hidden="true"
                    initial={{ y: 18, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -18, opacity: 0, filter: "blur(4px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="pointer-events-none absolute inset-0 flex items-center truncate text-[16px] tracking-[-0.01em] text-[#86868b] dark:text-[#8e8e93]"
                  >
                    {current}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {phase === "dissolving" && <Dust text={snapshot} font={font} rgb={dark ? "245,245,247" : "29,29,31"} onDone={done} />}
          </div>
          <motion.button
            type="submit"
            aria-label="Ask"
            disabled={phase !== "idle"}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.86 }}
            transition={{ type: "spring", stiffness: 520, damping: 18 }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0071e3] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:opacity-60 dark:bg-[#0a84ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
              <path d="M3 8h9.5M8.5 3.5L13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </motion.div>
      </form>
      <p className="-mt-4 text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Press Enter to ask. Empty asks the one showing.</p>
      <span className="sr-only" aria-live="polite">
        {snapshot ? `Asked: ${snapshot}` : ""}
      </span>
    </div>
  );
}

type Grain = { ox: number; oy: number; vx: number; vy: number; delay: number; life: number; size: number };

/** Room on the right for the dust to blow into. */
const OVERHANG = 110;
/** Gap between each letter breaking up, right to left. */
const LETTER_MS = 42;

/** Draws the text on a canvas, samples its pixels into grains and blows them away letter by letter from the end. */
function Dust({ text, font, rgb, onDone }: { text: string; font: string; rgb: string; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const baseW = Math.max(host.clientWidth, 1);
    const H = Math.max(host.clientHeight, 1);
    const W = baseW + OVERHANG;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);
    ctx.font = font || "16px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, H / 2);

    const chars = Array.from(text);
    const bounds: number[] = [];
    let x = 0;
    for (const ch of chars) {
      x += ctx.measureText(ch).width;
      bounds.push(x);
    }
    const letterOf = (lx: number) => {
      let lo = 0;
      let hi = bounds.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (lx < bounds[mid]) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    };

    const sw = Math.round(baseW * dpr);
    const sh = Math.round(H * dpr);
    const img = ctx.getImageData(0, 0, sw, sh);
    const grains: Grain[] = [];
    const stride = Math.max(1, Math.round(dpr));
    for (let py = 0; py < sh; py += stride) {
      for (let px = 0; px < sw; px += stride) {
        if (img.data[(py * sw + px) * 4 + 3] < 110) continue;
        const lx = px / dpr;
        const fromEnd = chars.length - 1 - letterOf(lx);
        const a = (Math.random() - 0.6) * Math.PI * 0.7;
        const sp = 0.25 + Math.random() * 0.7;
        const roll = Math.random();
        grains.push({
          ox: lx,
          oy: py / dpr,
          vx: Math.cos(a) * sp + 0.18,
          vy: Math.sin(a) * sp * 0.7 - 0.08,
          delay: fromEnd * LETTER_MS + Math.random() * 24,
          life: 520 + Math.random() * 380,
          size: roll < 0.65 ? 1 : roll < 0.92 ? 1.4 : 1.9,
        });
      }
    }
    ctx.clearRect(0, 0, W, H);

    let raf = 0;
    let t0 = 0;
    const frame = (now: number) => {
      if (!t0) t0 = now;
      const el = now - t0;
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const g of grains) {
        if (el < g.delay) {
          // A quick shiver in the last 80ms before a letter goes.
          const k = g.delay - el < 80 ? 1 - (g.delay - el) / 80 : 0;
          ctx.fillStyle = `rgb(${rgb})`;
          ctx.fillRect(g.ox + (Math.random() - 0.5) * 0.6 * k, g.oy + (Math.random() - 0.5) * 0.6 * k, g.size, g.size);
          alive++;
          continue;
        }
        const t = el - g.delay;
        if (t > g.life) continue;
        alive++;
        const n = t / g.life;
        const m = t / 16;
        // Ease-out drift with a little lift, like ash catching a breeze.
        const px = g.ox + g.vx * m * (1 - n * 0.35) + Math.sin((g.oy + m) * 0.3) * 0.5 * n;
        const py = g.oy + g.vy * m - n * n * 4;
        ctx.fillStyle = `rgba(${rgb},${Math.cos((n * Math.PI) / 2).toFixed(3)})`;
        ctx.fillRect(px, py, g.size, g.size);
      }
      if (alive === 0) {
        doneRef.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [text, font, rgb]);

  return <canvas ref={ref} className="pointer-events-none absolute left-0 top-0" aria-hidden="true" />;
}

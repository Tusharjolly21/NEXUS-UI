"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound, type SoundName } from "@/lib/ui-sounds";

export interface SpreadDeckPhoto {
  /** Caption under the picture. */
  title: string;
  /** Smaller line under the caption. */
  sub: string;
  /** Top and bottom colour of the sky. */
  sky: [string, string];
  /** Colour of the sun and its glow. */
  sun: string;
  /** Back and front colour of the two hills. */
  land: [string, string];
}

export interface SpreadDeckProps {
  /** The photos. They are drawn as gradient landscapes, so no images are loaded. Defaults to six demo places. */
  photos?: SpreadDeckPhoto[];
  /** Walks through pile, grid and focus by itself every 2.2s until someone touches the deck. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the root. */
  className?: string;
}

const DEFAULT_PHOTOS: SpreadDeckPhoto[] = [
  { title: "Lofoten", sub: "Norway", sky: ["#a1c4fd", "#c2e9fb"], sun: "#ffffff", land: ["#4a6fa5", "#2d4a7a"] },
  { title: "Big Sur", sub: "California", sky: ["#ff9a8b", "#ffd3a5"], sun: "#fff3d6", land: ["#c45b7a", "#6b2c4a"] },
  { title: "Atacama", sub: "Chile", sky: ["#fbc2eb", "#a6c1ee"], sun: "#fff", land: ["#c28f6b", "#7a4e33"] },
  { title: "Kyoto", sub: "Japan", sky: ["#d4fc79", "#96e6a1"], sun: "#fffbe6", land: ["#3f8f5c", "#1f5a39"] },
  { title: "Patagonia", sub: "Argentina", sky: ["#89f7fe", "#66a6ff"], sun: "#ffffff", land: ["#e8eef7", "#9fb3cc"] },
  { title: "Sahara", sub: "Morocco", sky: ["#fddb92", "#f6a96b"], sun: "#fff8e1", land: ["#e0954f", "#a85c26"] },
];

const CW = 150;
const CH = 200;
const H = 440;
const GAP = 16;
const TILT = [-7, 5, -3, 8, -5, 2];
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type Mode = { kind: "stack" } | { kind: "grid" } | { kind: "focus"; i: number };

/** A ref that reads true while the element is on screen and the tab is visible. Read it inside timers. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const on = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      on.current = inView && !document.hidden;
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return on;
}

function Scene({ p }: { p: SpreadDeckPhoto }) {
  return (
    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${p.sky[0]}, ${p.sky[1]})` }}>
      <span className="absolute left-[58%] top-[22%] h-10 w-10 rounded-full" style={{ background: p.sun, boxShadow: `0 0 30px ${p.sun}` }} />
      <svg className="absolute inset-x-0 bottom-0 h-[55%] w-full" viewBox="0 0 150 110" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50 C 30 30, 60 60, 90 40 S 140 30, 150 45 V110 H0Z" fill={p.land[0]} />
        <path d="M0 75 C 40 55, 70 85, 110 65 S 145 70, 150 72 V110 H0Z" fill={p.land[1]} />
      </svg>
    </div>
  );
}

/** Dealing out swipes, picking one up lifts, gathering the pile back up drops. */
function sound(m: Mode, say: (name: SoundName, volume?: number) => void) {
  if (m.kind === "grid") say("swipe", 0.7);
  else if (m.kind === "focus") say("lift", 0.7);
  else say("drop", 0.7);
}

/**
 * A photo deck with three states. Tap the pile and it deals itself out into a
 * grid; tap a photo and it flies to the middle and grows while the rest
 * gather into a little pile in the corner; tap again to go back, or stack it
 * all up. Every move is the same cards travelling, never a swap. The photos
 * are drawn from gradients, so nothing is fetched.
 */
export function SpreadDeck({ photos = DEFAULT_PHOTOS, autoplay = false, enableSound = true, className }: SpreadDeckProps) {
  const play = useSound(enableSound);
  const still = useReducedMotion() === true;
  const n = photos.length;
  const [mode, setMode] = useState<Mode>({ kind: "stack" });
  const [live, setLive] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // Unknown until the stage is measured, so the cards never travel from a guessed size.
  const [W, setW] = useState<number | null>(null);
  const touched = useRef(false);
  const onScreen = useOnScreen(box);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay || still || n < 2) return;
    const seq: Mode[] = [{ kind: "grid" }, { kind: "focus", i: Math.min(1, n - 1) }, { kind: "grid" }, { kind: "focus", i: Math.min(4, n - 1) }, { kind: "stack" }];
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (onScreen.current) {
        const m = seq[k++ % seq.length];
        sound(m, play.auto);
        setMode(m);
      }
    }, 2200);
    return () => window.clearInterval(id);
  }, [autoplay, still, n, onScreen, play]);

  const touch = () => {
    touched.current = true;
    setLive(true);
  };
  const go = (m: Mode) => {
    touch();
    sound(m, play);
    setMode(m);
  };

  const width = W ?? 560;
  const cols = width < 520 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  // Shrink the grid until it fits the stage in both directions.
  const gridScale = Math.min(1, (width - 32 - (cols - 1) * GAP) / (cols * CW), (H - 48 - (rows - 1) * GAP) / (rows * CH));
  const pileScale = width < 480 ? 0.78 : 1;

  const place = (i: number) => {
    if (mode.kind === "stack") {
      const k = n - 1 - i;
      return { x: width / 2 - CW / 2 + (i % 2 ? 4 : -4) * k * 0.5, y: H / 2 - CH / 2 - k * 3, rotate: TILT[i % TILT.length], scale: pileScale, z: i };
    }
    if (mode.kind === "grid") {
      const s = gridScale;
      const gw = cols * CW * s + (cols - 1) * GAP;
      const gh = rows * CH * s + (rows - 1) * GAP;
      const c = i % cols;
      const r = Math.floor(i / cols);
      return { x: (width - gw) / 2 + c * (CW * s + GAP) - (CW - CW * s) / 2, y: (H - gh) / 2 + r * (CH * s + GAP) - (CH - CH * s) / 2, rotate: 0, scale: s, z: i };
    }
    if (i === mode.i) return { x: width / 2 - CW / 2, y: H / 2 - CH / 2 - 10, rotate: 0, scale: Math.min(1.7, (H - 60) / CH), z: 50 };
    const k = i < mode.i ? i : i - 1;
    return { x: 18 - (CW - CW * 0.42) / 2 + k * 6, y: H - CH * 0.42 - 18 - (CH - CH * 0.42) / 2 - k * 4, rotate: -12 + k * 5, scale: 0.42, z: i };
  };

  const click = (i: number) => {
    if (mode.kind === "stack") go({ kind: "grid" });
    else if (mode.kind === "grid") go({ kind: "focus", i });
    else go(mode.i === i ? { kind: "grid" } : { kind: "focus", i });
  };

  const hint = mode.kind === "stack" ? "Tap the pile" : mode.kind === "grid" ? "Tap a photo" : "Tap it again to go back";
  const status = mode.kind === "focus" ? `${photos[mode.i]?.title}, ${photos[mode.i]?.sub}. ${hint}.` : `${mode.kind === "stack" ? "Stacked" : "Spread"}. ${hint}.`;

  return (
    <div className={cn("flex w-full max-w-[600px] flex-col items-center gap-3 text-[#1d1d1f] dark:text-[#f5f5f7]", className)}>
      <div
        ref={box}
        className="relative w-full overflow-hidden rounded-[28px] bg-[#f5f5f7] dark:bg-[#1c1c1e]"
        style={{ height: H }}
        onPointerDown={touch}
        onKeyDown={(e) => {
          if (e.key === "Escape" && mode.kind === "focus") go({ kind: "grid" });
        }}
      >
        {W !== null &&
          photos.map((p, i) => {
            const pos = place(i);
            const focused = mode.kind === "focus" && mode.i === i;
            // In the pile only the top photo is a control; the rest sit behind it.
            const buried = mode.kind === "stack" && i !== n - 1;
            return (
              <motion.button
                key={p.title}
                type="button"
                onClick={() => click(i)}
                tabIndex={buried ? -1 : 0}
                aria-hidden={buried || undefined}
                aria-label={mode.kind === "stack" ? "Spread the photos" : focused ? `${p.title}, ${p.sub}. Back to the grid` : `Open ${p.title}`}
                className={cn(
                  "absolute left-0 top-0 overflow-hidden rounded-[16px] bg-white p-1.5 text-left shadow-[0_2px_4px_rgba(0,0,0,.08),0_18px_30px_-18px_rgba(0,0,0,.5)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_18px_30px_-18px_rgba(0,0,0,.9)]",
                  FOCUS,
                )}
                style={{ width: CW, height: CH, zIndex: pos.z }}
                initial={false}
                animate={{ x: pos.x, y: pos.y, rotate: pos.rotate, scale: pos.scale }}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 24, delay: mode.kind === "grid" ? i * 0.035 : mode.kind === "stack" ? (n - i) * 0.03 : 0 }}
                whileHover={mode.kind === "grid" && !still ? { y: pos.y - 6 } : undefined}
              >
                <span className="relative block h-[calc(100%-34px)] overflow-hidden rounded-[11px]">
                  <Scene p={p} />
                </span>
                <span className="flex h-[34px] flex-col justify-center px-1.5">
                  <span className="text-[12px] font-semibold leading-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{p.title}</span>
                  <motion.span className="text-[10px] leading-tight text-[#6e6e73] dark:text-[#a1a1a6]" animate={{ opacity: focused || mode.kind !== "focus" ? 1 : 0 }}>
                    {p.sub}
                  </motion.span>
                </span>
              </motion.button>
            );
          })}
        <span className="pointer-events-none absolute bottom-3 right-4 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]" aria-hidden="true">
          {hint}
        </span>
        <span className="sr-only" aria-live={live ? "polite" : "off"}>
          {status}
        </span>
      </div>
      <div className="flex gap-2">
        {(["stack", "grid"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => go({ kind: k })}
            aria-pressed={mode.kind === k}
            className={cn(
              "h-9 rounded-full px-4 text-[13px] font-medium",
              FOCUS,
              mode.kind === k
                ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
                : "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]",
            )}
          >
            {k === "stack" ? "Stack" : "Spread"}
          </button>
        ))}
      </div>
    </div>
  );
}

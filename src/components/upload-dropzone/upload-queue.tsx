"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type DragEvent, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface UploadQueueProps {
  /** Called with the real files the user dropped or chose. The files are only listed; their contents are never read or sent. */
  onFiles?: (files: File[]) => void;
  /** Called with the file name when a row finishes its simulated transfer. */
  onComplete?: (name: string) => void;
  /** Called with the file name when a row is cancelled. */
  onCancel?: (name: string) => void;
  /** Drops three sample files in, pauses one and resumes it, in a loop, until someone presses or drops on the card. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

type ItemState = "up" | "paused" | "ok";
type Item = { id: number; name: string; size: number; done: number; state: ItemState; speed: number; audible: boolean };

const TYPES: Record<string, string> = { pdf: "#ff3b30", fig: "#bf5af2", mp4: "#ff9f0a", zip: "#8e8e93", png: "#0a84ff", jpg: "#0a84ff", csv: "#30d158" };
const FALLBACK_COLOR = "#8e8e93";
const SAMPLES = [
  { name: "Brand guidelines.pdf", size: 8.4e6 },
  { name: "Homepage v3.fig", size: 22.1e6 },
  { name: "Launch film.mp4", size: 48.6e6 },
];
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const ROW_BTN =
  "flex h-8 w-8 items-center justify-center rounded-full outline-none hover:bg-black/5 dark:hover:bg-white/10";

const ext = (n: string) => (n.split(".").pop() || "").toLowerCase();
const mb = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} kB`);

/** Small seeded generator (mulberry32). Speeds come from here, so the demo looks the same every time. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** A repeatable 0.6 to 1.4 wobble for one row on one tick, so progress is not perfectly even. */
function wobble(id: number, tick: number) {
  const h = Math.imul(id * 374761393 + tick * 668265263, 1274126177) >>> 0;
  return 0.6 + ((h ^ (h >>> 13)) % 1000) / 1250;
}

/** True while an autoplay demo may run: enabled, on screen, tab visible, motion allowed. */
function useAutoplayGate(ref: RefObject<HTMLElement | null>, enabled: boolean, reduce: boolean) {
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, enabled]);
  return enabled && !reduce && inView && tabVisible;
}

const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

/**
 * An upload list where each row is its own progress bar: the row fills from
 * left to right as the file "goes up", with the size and time left counting
 * along. Pause a row and the fill turns to moving stripes; cancel and it
 * folds away; finish and the fill fades into a check. Drag files anywhere over
 * the card and it tells you how many it is about to take. Progress is
 * simulated: nothing is read or sent.
 */
export function UploadQueue({ onFiles, onComplete, onCancel, autoplay = false, enableSound = true, className }: UploadQueueProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [over, setOver] = useState(0);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("");
  const nextId = useRef(1);
  const depth = useRef(0);
  const tick = useRef(0);
  const rng = useRef<() => number>(seeded(2024));
  const finished = useRef<Set<number>>(new Set());

  const gate = useAutoplayGate(cardRef, autoplay, reduce);
  const playing = gate && !touched;

  // `audible` marks rows the user added; the autoplay demo rows stay silent.
  const add = useCallback((files: { name: string; size: number }[], audible = false) => {
    const made: Item[] = files.map((f) => ({
      id: nextId.current++,
      name: f.name,
      size: f.size,
      done: 0,
      state: "up",
      speed: 2.2e6 + rng.current() * 3.5e6,
      audible,
    }));
    setItems((xs) => [...xs, ...made]);
  }, []);

  // Simulated transfer, one tick every 100ms, and only while a row is actually going up.
  const active = items.some((x) => x.state === "up");
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      tick.current += 1;
      const n = tick.current;
      setItems((xs) =>
        xs.map((x) => {
          if (x.state !== "up") return x;
          const done = Math.min(x.size, x.done + x.speed * 0.1 * wobble(x.id, n));
          return { ...x, done, state: done >= x.size ? "ok" : "up" };
        }),
      );
    }, 100);
    return () => clearInterval(id);
  }, [active]);

  // Report finished rows once each.
  useEffect(() => {
    for (const x of items) {
      if (x.state === "ok" && !finished.current.has(x.id)) {
        finished.current.add(x.id);
        if (x.audible) play("done");
        onComplete?.(x.name);
      }
    }
  }, [items, onComplete, play]);

  // Demo loop: drag three files over, drop them, pause one, resume it, clear.
  useEffect(() => {
    if (!playing) return;
    const ids: number[] = [];
    const at = (fn: () => void, t: number) => ids.push(window.setTimeout(fn, t));
    const loop = () => {
      at(() => {
        setOver(0);
        setItems([]);
      }, 0);
      at(() => setOver(3), 500);
      at(() => {
        setOver(0);
        setItems([]);
        add(SAMPLES);
      }, 1500);
      at(() => setItems((xs) => xs.map((x, i) => (i === 2 && x.state === "up" ? { ...x, state: "paused" } : x))), 3800);
      at(() => setItems((xs) => xs.map((x, i) => (i === 2 && x.state === "paused" ? { ...x, state: "up", speed: 9e6 } : x))), 6200);
      at(() => setItems([]), 13500);
      at(loop, 14000);
    };
    loop();
    return () => {
      ids.forEach(clearTimeout);
      setOver(0);
    };
  }, [playing, add]);

  const take = (list: File[]) => {
    if (!list.length) return;
    play("drop");
    add(list.map((f) => ({ name: f.name, size: Math.max(f.size, 2e5) })), true);
    setStatus(`${list.length} ${list.length === 1 ? "file" : "files"} added to the queue.`);
    onFiles?.(list);
  };
  const drop = {
    onDragEnter: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setTouched(true);
      depth.current += 1;
      setOver(e.dataTransfer.items?.length || 1);
    },
    onDragOver: (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    },
    onDragLeave: () => {
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setOver(0);
    },
    onDrop: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setOver(0);
      take(Array.from(e.dataTransfer.files));
    },
  };
  const toggle = (id: number) => {
    setTouched(true);
    setItems((xs) => xs.map((x) => (x.id === id && x.state !== "ok" ? { ...x, state: x.state === "up" ? "paused" : "up" } : x)));
  };
  const cancel = (x: Item) => {
    setTouched(true);
    setItems((xs) => xs.filter((y) => y.id !== x.id));
    setStatus(`${x.name} cancelled.`);
    onCancel?.(x.name);
  };
  const total = items.reduce((a, x) => a + x.size, 0);
  const sent = items.reduce((a, x) => a + x.done, 0);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative w-[460px] max-w-full overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-5 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.8)]",
        className,
      )}
      {...drop}
      onPointerDown={() => setTouched(true)}
    >
      <style>{`
@keyframes nx-uq-stripes{to{background-position:20px 0}}
.nx-uq-fill{background:color-mix(in srgb,var(--nx-uq-c) 12%,transparent);background-size:20px 20px}
.dark .nx-uq-fill{background:color-mix(in srgb,var(--nx-uq-c) 22%,transparent)}
.nx-uq-fill[data-paused]{background-image:linear-gradient(-45deg,color-mix(in srgb,var(--nx-uq-c) 18%,transparent) 25%,color-mix(in srgb,var(--nx-uq-c) 7%,transparent) 25%,color-mix(in srgb,var(--nx-uq-c) 7%,transparent) 50%,color-mix(in srgb,var(--nx-uq-c) 18%,transparent) 50%,color-mix(in srgb,var(--nx-uq-c) 18%,transparent) 75%,color-mix(in srgb,var(--nx-uq-c) 7%,transparent) 75%);background-color:transparent}
.dark .nx-uq-fill[data-paused]{background-image:linear-gradient(-45deg,color-mix(in srgb,var(--nx-uq-c) 32%,transparent) 25%,color-mix(in srgb,var(--nx-uq-c) 12%,transparent) 25%,color-mix(in srgb,var(--nx-uq-c) 12%,transparent) 50%,color-mix(in srgb,var(--nx-uq-c) 32%,transparent) 50%,color-mix(in srgb,var(--nx-uq-c) 32%,transparent) 75%,color-mix(in srgb,var(--nx-uq-c) 12%,transparent) 75%);background-color:transparent}
.nx-uq-fill[data-paused][data-motion]{animation:nx-uq-stripes 1s linear infinite}
`}</style>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">Assets</h3>
          <p className="m-0 truncate text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
            {items.length ? `${mb(sent)} of ${mb(total)}` : "Drop files anywhere on this card"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTouched(true);
            inputRef.current?.click();
          }}
          className={cn("h-9 flex-none rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
        >
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            take(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      <ul aria-label="Uploads" className="m-0 mt-4 flex min-h-[200px] list-none flex-col gap-2 p-0">
        <AnimatePresence initial={false}>
          {items.map((x) => {
            const p = x.done / x.size;
            const color = TYPES[ext(x.name)] ?? FALLBACK_COLOR;
            const left = x.state === "up" ? Math.max(1, Math.round((x.size - x.done) / x.speed)) : 0;
            return (
              <motion.li
                key={x.id}
                layout={!reduce}
                className="relative overflow-hidden rounded-[16px] bg-[#f5f5f7] dark:bg-[#2c2c2e]"
                style={{ "--nx-uq-c": color } as CSSProperties}
                initial={{ opacity: 0, height: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, height: 60, y: 0 }}
                exit={{ opacity: 0, height: 0, scale: reduce ? 1 : 0.96, transition: { duration: 0.25 } }}
                transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 32 }}
              >
                {/* the row is the progress bar */}
                <motion.span
                  className="nx-uq-fill absolute inset-y-0 left-0"
                  role="progressbar"
                  aria-label={`${x.name} upload progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(p * 100)}
                  data-paused={x.state === "paused" ? "" : undefined}
                  data-motion={reduce ? undefined : ""}
                  initial={{ width: "0%" }}
                  animate={{ width: `${p * 100}%`, opacity: x.state === "ok" ? 0 : 1 }}
                  transition={{ width: reduce ? { duration: 0.1 } : { type: "spring", stiffness: 90, damping: 22 }, opacity: { duration: 0.6, delay: 0.3 } }}
                />
                <div className="relative flex h-[60px] items-center gap-3 px-3">
                  <span
                    className="relative flex h-9 w-8 flex-none items-end justify-center rounded-[7px] pb-1 text-[8.5px] font-bold uppercase text-white"
                    style={{ background: color, clipPath: "polygon(0 0, 70% 0, 100% 26%, 100% 100%, 0 100%)" }}
                    aria-hidden="true"
                  >
                    {ext(x.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{x.name}</span>
                    <span className="block truncate text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
                      {x.state === "ok" ? mb(x.size) : x.state === "paused" ? `Paused · ${Math.round(p * 100)}%` : `${mb(x.done)} of ${mb(x.size)} · ${left}s left`}
                    </span>
                  </span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {x.state === "ok" ? (
                      <motion.span
                        key="ok"
                        className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#34c759] dark:bg-[#30d158]"
                        initial={{ scale: 0, rotate: reduce ? 0 : -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 500, damping: 18 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                          <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ delay: reduce ? 0 : 0.1 }} />
                        </svg>
                        <span className="sr-only">Uploaded</span>
                      </motion.span>
                    ) : (
                      <motion.span key="ctl" className="flex flex-none gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : 0.8 }}>
                        <button
                          type="button"
                          onClick={() => toggle(x.id)}
                          aria-label={x.state === "paused" ? `Resume ${x.name}` : `Pause ${x.name}`}
                          className={cn(ROW_BTN, "text-[#1d1d1f] dark:text-[#f5f5f7]", FOCUS)}
                        >
                          {x.state === "paused" ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                              <path d="M3 1.5l7 4.5-7 4.5z" fill="currentColor" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                              <rect x="2" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" />
                              <rect x="7.4" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancel(x)}
                          aria-label={`Cancel ${x.name}`}
                          className={cn(ROW_BTN, "text-[#6e6e73] dark:text-[#a1a1a6]", FOCUS)}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </button>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {!items.length && (
          <li className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#d2d2d7] text-[13px] text-[#6e6e73] dark:border-[#3a3a3c] dark:text-[#a1a1a6]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
            </svg>
            Nothing uploading
          </li>
        )}
      </ul>

      {/* whole-card drop target */}
      <AnimatePresence>
        {over > 0 && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[3px] dark:bg-[#1c1c1e]/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-3 rounded-[20px] border-2 border-dashed border-[#0071e3] dark:border-[#0a84ff]"
              initial={{ scale: reduce ? 1 : 1.04, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 1.04, opacity: 0 }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 24 }}
            />
            <motion.div className="flex flex-col items-center gap-2" initial={{ y: reduce ? 0 : 10, scale: reduce ? 1 : 0.95 }} animate={{ y: 0, scale: 1 }}>
              <motion.span
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0071e3] text-white dark:bg-[#0a84ff]"
                animate={{ y: reduce ? 0 : [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
              </motion.span>
              <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Drop to upload {over} {over === 1 ? "file" : "files"}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}

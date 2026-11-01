Add the "3D Folder Card" component from Nexus UI to my project.

A folder card that swings open when you hover, focus or tap it: the front flap falls forward on a spring and up to three papers fan up out of it, each settling with a wobble. Picking a paper grows its cover into a preview dialog you can page through with the arrow keys and close with Escape.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { ThreeDFolder } from "@/components/three-d-folder";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/three-d-folder/index.ts ---

```ts
export { ThreeDFolder } from "./three-d-folder";
export type { FolderProject, ThreeDFolderProps } from "./three-d-folder";
```

--- components/three-d-folder/three-d-folder.tsx ---

```tsx
"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export type FolderProject = {
  id: string;
  title: string;
  /** Optional cover photo (any URL you host). Without it the drawn art in `bg` is used. */
  image?: string;
  /** CSS background for the drawn cover. */
  bg?: string;
  /** Small line under the title in the preview, e.g. "Brand, 2026". */
  meta?: string;
  /** Adds an Open link to the preview. */
  href?: string;
};

export type ThreeDFolderProps = {
  /** Label under the folder. */
  title?: string;
  /** Up to three show as papers in the folder; the preview pages through all of them. */
  projects?: FolderProject[];
  /** Back panel and tab colour. */
  folderBackColor?: string;
  /** Front flap colour. */
  folderFrontColor?: string;
  /** Tab colour. Defaults to the back colour. */
  folderTabColor?: string;
  /** "sm" draws the folder at about 60% for dense grids. */
  size?: "sm" | "md";
  /** Called with the project id when a preview opens, and null when it closes. */
  onOpenProject?: (id: string | null) => void;
  /** Caption under the count. Empty string hides it. */
  hint?: string;
  /** Opens and closes the folder by itself until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

const DEFAULT_PROJECTS: FolderProject[] = [
  { id: "atlas", title: "Atlas", meta: "Brand system, 2026", bg: "linear-gradient(160deg,#64d2ff 0%,#0a84ff 55%,#0040dd 100%)" },
  { id: "prism", title: "Prism", meta: "Product launch, 2026", bg: "linear-gradient(160deg,#ffb3e6 0%,#bf5af2 55%,#5e2bd6 100%)" },
  { id: "signal", title: "Signal", meta: "Campaign, 2025", bg: "linear-gradient(160deg,#ffd60a 0%,#ff9f0a 50%,#ff453a 100%)" },
];

const noop = () => () => {};
/** False on the server and during hydration, true after: keeps the portal out of SSR. */
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

const SPREAD = [
  { x: -84, y: -62, r: -14, rx: -7, rr: -4 },
  { x: 0, y: -92, r: 0, rx: 0, rr: 0 },
  { x: 84, y: -62, r: 14, rx: 7, rr: 4 },
];

function Cover({ p, className = "", style }: { p: FolderProject; className?: string; style?: CSSProperties }) {
  return (
    <span className={`relative block overflow-hidden ${className}`} style={{ background: p.bg ?? "linear-gradient(160deg,#d2d2d7,#86868b)", ...style }}>
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      ) : (
        <span className="absolute inset-0" aria-hidden="true">
          <span className="absolute left-[12%] top-[12%] h-[9%] w-[46%] rounded-full bg-white/80" />
          <span className="absolute left-[12%] top-[26%] h-[5%] w-[30%] rounded-full bg-white/45" />
          <span className="absolute -bottom-[18%] -right-[22%] h-[78%] w-[92%] rounded-full bg-white/20" />
          <span className="absolute -bottom-[30%] right-[8%] h-[60%] w-[60%] rounded-full bg-white/15" />
        </span>
      )}
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.18),transparent_30%,rgba(0,0,0,.18))]" aria-hidden="true" />
    </span>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/**
 * A folder that swings open when you hover, focus or tap it. Its front flap
 * falls forward on a spring and the papers inside fan up out of it, each one
 * settling with a wobble. Pick a paper and it grows into a preview you can
 * page through with the arrow keys.
 */
export function ThreeDFolder({
  title = "Design Archive",
  projects = DEFAULT_PROJECTS,
  folderBackColor = "#3d9cf0",
  folderFrontColor = "#6cb8f6",
  folderTabColor,
  size = "md",
  onOpenProject,
  hint = "Hover or tap the folder.",
  autoplay = false,
  enableSound = true,
  className = "",
}: ThreeDFolderProps) {
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const openRef = useRef(false);
  const u = size === "sm" ? 0.62 : 1;
  const still = useReducedMotion() === true;
  const uid = useId().replace(/:/g, "");
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const touched = useRef(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const papers = projects.slice(0, 3);
  const shown = active === null ? null : projects[active];
  const tab = folderTabColor ?? folderBackColor;
  const W = 200 * u;
  const H = 150 * u;
  const PW = 92 * u;
  const PH = 118 * u;

  useEffect(() => {
    playRef.current = play;
    openRef.current = open;
  }, [play, open]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      playRef.current.auto(openRef.current ? "hush" : "whoosh", openRef.current ? 0.6 : 1);
      setOpen((o) => !o);
    }, 2200);
    return () => clearInterval(t);
  }, [autoplay]);

  const show = (i: number | null, from?: HTMLElement | null) => {
    if (i !== null && from) returnTo.current = from;
    if (i === null) play("hush", 0.5);
    else play("whoosh", 0.7);
    setActive(i);
    onOpenProject?.(i === null ? null : (projects[i]?.id ?? null));
  };
  const page = (d: number) => {
    if (active === null || projects.length === 0) return;
    const n = (active + d + projects.length) % projects.length;
    play("tick", 0.5);
    setActive(n);
    onOpenProject?.(projects[n]?.id ?? null);
  };

  useEffect(() => {
    if (active === null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        play("hush", 0.5);
        setActive(null);
        onOpenProject?.(null);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, onOpenProject, play]);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (active === null && wasOpen.current) returnTo.current?.focus();
    wasOpen.current = active !== null;
  }, [active]);

  const flap = { type: "spring" as const, stiffness: still ? 500 : 240, damping: still ? 50 : 13 };
  const isOpen = open || active !== null;

  return (
    <LayoutGroup id={`folder-${uid}`}>
      <div
        className={`relative flex max-w-full flex-col items-center rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${size === "sm" ? "w-[168px] px-3 pb-4 pt-16" : "w-[300px] px-6 pb-6 pt-[92px]"} ${className}`}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          touched.current = true;
          setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          setOpen(false);
        }}
        onPointerDown={() => {
          touched.current = true;
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
        }}
      >
        <div className="relative" style={{ width: W, height: H, perspective: 700 * u }}>
          {/* Shadow */}
          <motion.span
            className="absolute left-1/2 rounded-[50%] bg-black/25 blur-[10px] dark:bg-black/60"
            style={{ width: W * 0.9, height: 16 * u, bottom: -10 * u, marginLeft: -W * 0.45 }}
            animate={{ scaleX: isOpen ? 1.08 : 0.94, opacity: isOpen ? 0.9 : 0.6 }}
            transition={flap}
            aria-hidden="true"
          />
          {/* Back panel + tab */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            style={{ height: H - 14 * u, transformOrigin: "50% 100%" }}
            animate={{ rotateX: isOpen ? 8 : 0 }}
            transition={flap}
            aria-hidden="true"
          >
            <span className="absolute" style={{ width: 74 * u, height: 22 * u, top: -14 * u, left: 14 * u, background: tab, borderRadius: `${10 * u}px ${10 * u}px 0 0` }} />
            <span className="absolute inset-0 rounded-[14px]" style={{ background: folderBackColor, borderRadius: 14 * u }} />
          </motion.div>

          {/* Papers */}
          {papers.map((p, i) => {
            const at = SPREAD[papers.length === 1 ? 1 : papers.length === 2 ? [0, 2][i] : i] ?? SPREAD[1];
            const taken = active !== null && projects[active]?.id === p.id;
            return (
              <div key={p.id} className="absolute bottom-0 left-1/2" style={{ width: PW, height: PH, marginLeft: -PW / 2, bottom: 8 * u, zIndex: i === 1 ? 4 : 3 }}>
                <motion.div
                  className="h-full w-full"
                  initial={false}
                  animate={
                    isOpen
                      ? { x: at.x * u, y: at.y * u, rotate: at.r, scale: 1 }
                      : { x: at.rx * u, y: 0, rotate: at.rr, scale: 0.94 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: still ? 500 : 210,
                    damping: still ? 50 : 11,
                    mass: 0.9,
                    delay: still ? 0 : isOpen ? 0.05 + i * 0.05 : (papers.length - 1 - i) * 0.03,
                  }}
                >
                  <motion.button
                    type="button"
                    tabIndex={isOpen ? 0 : -1}
                    aria-hidden={!isOpen}
                    aria-label={`Preview ${p.title}`}
                    onClick={(e) => {
                      touched.current = true;
                      show(projects.findIndex((q) => q.id === p.id), e.currentTarget);
                    }}
                    onFocus={() => {
                      touched.current = true;
                      setOpen(true);
                    }}
                    whileHover={{ y: -10 * u, scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="block h-full w-full rounded-[12px] bg-white p-[5px] text-left shadow-[0_8px_18px_-8px_rgba(0,0,0,.4)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
                    style={{ borderRadius: 12 * u, padding: 5 * u }}
                  >
                    {taken ? (
                      <span className="block h-[72%] w-full rounded-[8px] bg-[#f0f0f3] dark:bg-[#3a3a3c]" />
                    ) : (
                      <motion.span layoutId={`cover-${p.id}`} className="block h-[72%] w-full overflow-hidden" style={{ borderRadius: 8 * u }}>
                        <Cover p={p} className="h-full w-full" />
                      </motion.span>
                    )}
                    <span className="mt-[6px] block truncate px-[2px] font-semibold tracking-[-0.01em]" style={{ fontSize: Math.max(9, 12 * u) }}>
                      {p.title}
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            );
          })}

          {/* Front flap */}
          <motion.button
            type="button"
            aria-label={`${title}, ${projects.length} projects`}
            aria-expanded={isOpen}
            onClick={() => {
              touched.current = true;
              play(open ? "hush" : "whoosh", open ? 0.6 : 1);
              setOpen((o) => !o);
            }}
            className="absolute inset-x-0 bottom-0 z-10 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
            style={{ height: H - 34 * u, transformOrigin: "50% 100%", background: folderFrontColor, borderRadius: 14 * u }}
            initial={false}
            animate={{ rotateX: isOpen ? -34 : 0 }}
            transition={flap}
          >
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.45)_0%,rgba(255,255,255,0)_14%),linear-gradient(135deg,rgba(255,255,255,.18),transparent_55%)]" aria-hidden="true" />
            <span className="absolute inset-x-0 top-0 h-px bg-white/70" aria-hidden="true" />
            <span
              className="absolute bottom-[14%] left-1/2 -translate-x-1/2 whitespace-nowrap font-semibold uppercase text-white/85"
              style={{ fontSize: Math.max(8, 10 * u), letterSpacing: "0.24em" }}
              aria-hidden="true"
            >
              {title}
            </span>
          </motion.button>
        </div>

        <h3 className={`mt-5 font-semibold tracking-[-0.02em] ${size === "sm" ? "text-[14px]" : "text-[17px]"}`}>{title}</h3>
        <p className="mt-0.5 text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
        {hint && size !== "sm" ? <p className="mt-2 text-[12px] text-[#86868b] dark:text-[#98989d]">{hint}</p> : null}
      </div>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {shown ? (
                <motion.div
                  key="backdrop"
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-md sm:p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => show(null)}
                >
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={shown.title}
                    className="relative w-full max-w-[560px] overflow-hidden rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]"
                    initial={{ y: 24, scale: 0.96 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 24, scale: 0.96, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") page(1);
                      if (e.key === "ArrowLeft") page(-1);
                    }}
                  >
                    <motion.span layoutId={`cover-${shown.id}`} className="block aspect-[16/10] w-full overflow-hidden" style={{ borderRadius: 0 }}>
                      <Cover p={shown} className="h-full w-full" />
                    </motion.span>
                    <div className="flex items-center justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <h3 className="truncate text-[20px] font-semibold tracking-[-0.03em]">{shown.title}</h3>
                        <p className="mt-0.5 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                          {shown.meta ?? `${(active ?? 0) + 1} of ${projects.length}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {projects.length > 1 ? (
                          <>
                            <button type="button" aria-label="Previous project" onClick={() => page(-1)} className="grid size-9 place-items-center rounded-full bg-[#f0f0f3] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]">
                              <Chevron dir="left" />
                            </button>
                            <button type="button" aria-label="Next project" onClick={() => page(1)} className="grid size-9 place-items-center rounded-full bg-[#f0f0f3] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]">
                              <Chevron dir="right" />
                            </button>
                          </>
                        ) : null}
                        {shown.href ? (
                          <a href={shown.href} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-full bg-[#0071e3] px-4 text-[13px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#0a84ff]">
                            Open
                          </a>
                        ) : null}
                      </div>
                    </div>
                    <button
                      ref={closeBtn}
                      type="button"
                      aria-label="Close preview"
                      onClick={() => show(null)}
                      className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/35 text-white backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </LayoutGroup>
  );
}

export default ThreeDFolder;
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

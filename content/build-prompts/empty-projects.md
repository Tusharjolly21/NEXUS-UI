# Empty Projects

Add the "Empty Projects" component from Nexus UI to my project.

An empty projects screen with three starter templates in a loose stack that fans out when you point at it. Picking a template flies that exact card into the grid as your first project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { EmptyProjects, EMPTY_PROJECTS_TEMPLATES } from "@/components/empty-projects";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/empty-projects/empty-projects.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface EmptyProjectsTemplate {
  /** Stable id. `landing`, `dashboard` and `docs` draw their own little page; any other id draws a plain page. */
  id: string;
  /** Name shown on the card and used for the new project ("My <name>"). */
  name: string;
  /** `[pastel background, accent]` for the card's header area. */
  tint: readonly [string, string];
}

export interface EmptyProjectsProps {
  /** The starter templates in the stack, left to right. Three works best. */
  templates?: EmptyProjectsTemplate[];
  /** Heading above the grid. */
  title?: string;
  /** Headline of the empty state. */
  emptyTitle?: string;
  /** Line under the headline. */
  emptyDescription?: string;
  /** Called when a template, or the blank project, is picked. Not called by the autoplay demo. */
  onCreate?: (template: EmptyProjectsTemplate) => void;
  /** Fans the stack, picks a template and starts over on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const EMPTY_PROJECTS_TEMPLATES: EmptyProjectsTemplate[] = [
  { id: "landing", name: "Landing page", tint: ["#e8f1ff", "#0a84ff"] },
  { id: "dashboard", name: "Dashboard", tint: ["#f3ecff", "#bf5af2"] },
  { id: "docs", name: "Docs site", tint: ["#e9f9ee", "#30d158"] },
];

const BLANK: EmptyProjectsTemplate = { id: "blank", name: "Untitled", tint: ["#f5f5f7", "#c7c7cc"] };
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

const projectName = (t: EmptyProjectsTemplate) => (t.id === "blank" ? "Untitled" : `My ${t.name.toLowerCase()}`);

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

function TemplateCard({ t, big = false }: { t: EmptyProjectsTemplate; big?: boolean }) {
  const vars = { "--tl": t.tint[0], "--td": `color-mix(in srgb, ${t.tint[1]} 26%, #2c2c2e)` } as CSSProperties;
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-18px_rgba(0,0,0,.45)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_14px_30px_-18px_rgba(0,0,0,.9)]" aria-hidden="true">
      <div className="relative h-[46%] bg-[var(--tl)] p-2.5 dark:bg-[var(--td)]" style={vars}>
        <div className="flex gap-1">
          {[0, 1, 2].map((k) => (
            <span key={k} className="h-1.5 w-1.5 rounded-full bg-black/10 dark:bg-white/25" />
          ))}
        </div>
        {t.id === "landing" && (
          <>
            <span className="mx-auto mt-3 block h-2 w-[60%] rounded-full" style={{ background: t.tint[1] }} />
            <span className="mx-auto mt-1.5 block h-1.5 w-[40%] rounded-full bg-black/10 dark:bg-white/25" />
          </>
        )}
        {t.id === "dashboard" && (
          <div className="mt-2.5 flex h-[60%] items-end gap-1">
            {[40, 70, 55, 90, 65].map((h, k) => (
              <span key={k} className="flex-1 rounded-[2px]" style={{ height: `${h}%`, background: t.tint[1], opacity: 0.35 + k * 0.13 }} />
            ))}
          </div>
        )}
        {t.id === "docs" && (
          <div className="mt-2.5 flex gap-2">
            <span className="h-10 w-[28%] rounded-[4px] bg-black/[.06] dark:bg-white/15" />
            <span className="flex-1 space-y-1">
              <span className="block h-1.5 w-full rounded-full" style={{ background: t.tint[1] }} />
              <span className="block h-1.5 w-[80%] rounded-full bg-black/10 dark:bg-white/25" />
              <span className="block h-1.5 w-[65%] rounded-full bg-black/10 dark:bg-white/25" />
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-2.5">
        <span className="space-y-1">
          <span className="block h-1.5 w-[85%] rounded-full bg-[#ececf0] dark:bg-[#48484a]" />
          <span className="block h-1.5 w-[60%] rounded-full bg-[#ececf0] dark:bg-[#48484a]" />
        </span>
        <span className={cn("font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]", big ? "text-[14px]" : "text-[11.5px]")}>{t.name}</span>
      </div>
    </div>
  );
}

/**
 * An empty projects screen that is one click from not being empty. Three
 * starter templates sit in a loose stack; point at them (or focus one) and
 * they fan out so you can see each one. Pick one and that exact card flies
 * into the grid as your first project while the empty state steps aside.
 * "Start over" brings the stack back. With `autoplay` it demos the whole
 * thing until the first touch.
 */
export function EmptyProjects({
  templates = EMPTY_PROJECTS_TEMPLATES,
  title = "Projects",
  emptyTitle = "No projects yet",
  emptyDescription = "Pick a starting point. You can change everything later.",
  onCreate,
  autoplay = false,
  enableSound = true,
  className,
}: EmptyProjectsProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [fan, setFan] = useState(false);
  const [picked, setPicked] = useState<EmptyProjectsTemplate | null>(null);
  const [gap, setGap] = useState(118);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const againBtn = useRef<HTMLButtonElement>(null);
  const tplBtns = useRef<(HTMLButtonElement | null)[]>([]);
  const touched = useRef(false);
  const landTimer = useRef<number | undefined>(undefined);
  const refocus = useRef<"again" | "first" | null>(null);
  const active = useDemoActive(root, autoplay && !reduce);

  // Pull the fan in on narrow containers so the cards never poke out of the card.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setGap(Math.max(64, Math.min(118, (entry.contentRect.width - 112 - 24) / 2)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(landTimer.current), []);

  const pick = (t: EmptyProjectsTemplate, auto = false, byKey = false) => {
    const p = auto ? play.auto : play;
    p("tap", 0.5);
    window.clearTimeout(landTimer.current);
    landTimer.current = window.setTimeout(() => p("drop", 0.55), reduce ? 120 : 520);
    if (byKey) refocus.current = "again";
    setPicked(t);
    setFan(false);
    if (!auto) onCreate?.(t);
  };
  const startOver = (byKey: boolean) => {
    window.clearTimeout(landTimer.current);
    play("tap", 0.35);
    if (byKey) refocus.current = "first";
    setPicked(null);
  };

  // After a keyboard pick the focused button leaves the page, so hand focus to the next sensible control.
  useEffect(() => {
    const want = refocus.current;
    refocus.current = null;
    if (want === "again") againBtn.current?.focus();
    else if (want === "first") tplBtns.current[0]?.focus();
  }, [picked]);

  // The demo reads the latest handler through a ref.
  const latest = useRef({ pick, templates });
  useEffect(() => {
    latest.current = { pick, templates };
  });

  // Demo: fan the stack, pick the second template, start over.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    const at = (fn: () => void, ms: number) => ids.push(window.setTimeout(() => !touched.current && fn(), ms));
    const loop = () => {
      if (touched.current) return;
      at(() => {
        setPicked(null);
        setFan(false);
      }, 0);
      at(() => setFan(true), 900);
      at(() => {
        const { templates: list, pick: choose } = latest.current;
        const t = list[1] ?? list[0];
        if (t) choose(t, true);
      }, 2600);
      at(() => setPicked(null), 6200);
      ids.push(window.setTimeout(loop, 6800));
    };
    loop();
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [autoplay, reduce, active]);

  const n = templates.length;
  const layoutT = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 26 };

  return (
    <div
      ref={root}
      className={cn(
        "w-[540px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3>
        <button
          type="button"
          onClick={(e) => {
            touched.current = true;
            if (templates[0]) pick(templates[0], false, e.detail === 0);
          }}
          className={cn("h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
        >
          New project
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {picked ? `Project created: ${projectName(picked)}` : ""}
      </span>
      <LayoutGroup>
        <div ref={stage} className="relative mt-5 h-[330px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {!picked ? (
              <motion.div
                key="empty"
                className="absolute inset-0 flex flex-col items-center rounded-[20px] border border-dashed border-[#d2d2d7] pt-8 dark:border-white/15"
                exit={{ opacity: 0, transition: { duration: reduce ? 0.1 : 0.2 } }}
              >
                <div
                  className="relative h-[150px] w-[300px] max-w-full"
                  onPointerEnter={() => {
                    touched.current = true;
                    setFan(true);
                  }}
                  onPointerLeave={() => setFan(false)}
                  onFocus={() => setFan(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFan(false);
                  }}
                >
                  {templates.map((t, i) => {
                    const o = i - (n - 1) / 2;
                    const side = Math.abs(o);
                    const spread = { x: o * gap, r: o * 12, y: 10 - 24 * Math.max(0, 1 - side) };
                    const rest = { x: o * 16, r: o * 7, y: 6 * Math.min(1, side) };
                    const p = fan ? spread : rest;
                    return (
                      <motion.button
                        key={t.id}
                        ref={(el) => {
                          tplBtns.current[i] = el;
                        }}
                        layoutId={`tpl-${t.id}`}
                        type="button"
                        onClick={(e) => pick(t, false, e.detail === 0)}
                        aria-label={`Start from the ${t.name} template`}
                        className={cn("absolute left-1/2 top-0 -ml-[56px] h-[136px] w-[112px] rounded-[14px]", FOCUS)}
                        style={{ zIndex: side < 0.5 ? 3 : 2 }}
                        animate={{ x: p.x, y: p.y, rotate: p.r }}
                        whileHover={fan && !reduce ? { y: p.y - 10, scale: 1.04 } : undefined}
                        transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 22 }}
                      >
                        <TemplateCard t={t} />
                      </motion.button>
                    );
                  })}
                </div>
                <h4 className="m-0 mt-5 text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{emptyTitle}</h4>
                <p className="m-0 mt-1 px-4 text-center text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{emptyDescription}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => pick(BLANK, false, e.detail === 0)}
                    className={cn("h-9 rounded-full bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]", FOCUS)}
                  >
                    Blank project
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="grid" className="absolute inset-0 grid grid-cols-2 content-start gap-3 sm:grid-cols-3" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                <motion.div layoutId={`tpl-${picked.id}`} className="h-[160px] rounded-[14px]" transition={layoutT}>
                  <TemplateCard t={{ ...picked, name: projectName(picked) }} big />
                </motion.div>
                <motion.button
                  ref={againBtn}
                  type="button"
                  onClick={(e) => {
                    touched.current = true;
                    startOver(e.detail === 0);
                  }}
                  className={cn("flex h-[160px] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#d2d2d7] text-[13px] font-medium text-[#6e6e73] hover:bg-[#fafafa] dark:border-white/15 dark:text-[#a1a1a6] dark:hover:bg-white/5", FOCUS)}
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: reduce ? 0 : 0.35 } }}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[18px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]" aria-hidden="true">
                    +
                  </span>
                  Start over
                </motion.button>
                <motion.div
                  className="col-span-full mt-2 flex items-center gap-2 rounded-[14px] bg-[#f5f5f7] px-4 py-3 text-[13px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
                  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.45 } }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" className="flex-none" aria-hidden="true">
                    <circle cx="12" cy="12" r="11" fill="#34c759" />
                    <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Project created. Invite your team when you&apos;re ready.
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
```

--- components/empty-projects/index.ts ---

```ts
export { EmptyProjects, EMPTY_PROJECTS_TEMPLATES } from "./empty-projects";
export type { EmptyProjectsProps, EmptyProjectsTemplate } from "./empty-projects";
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

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Bubble Tags

Add the "Bubble Tags" component from Nexus UI to my project.

A tag input where every tag is a soap bubble. Type a word and press Enter: a wand in the corner blows a bubble with the word inside, which swells, lets go with a wobble and drifts up to join the others. The bubbles hang in a sunlit garden, turning their colours, pressing softly against each other and leaning away when your pointer passes like a breath of air. Tap a bubble to remove its tag and it pops in a ring of droplets; Backspace in the empty field pops the newest. Every bubble is a real button and the field is a real input, so keyboards and screen readers get a plain list.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { BubbleTags } from "@/components/bubble-tags";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/bubble-tags/bubble-tags.tsx ---

```tsx
"use client";

import { AnimatePresence, motion, useAnimationControls, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type BubbleTagsProps = {
  /** controlled list of tags */
  tags?: string[];
  defaultTags?: string[];
  onChange?: (tags: string[]) => void;
  /** the most tags it will hold */
  max?: number;
  label?: string;
  placeholder?: string;
  /** Soft synthesised sounds, scored to the motion. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = { at?: number; dur?: number; gain?: number; type?: OscillatorType; glide?: number; bell?: number };
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

// Phosphor Icons (MIT), via Iconify
const ICON = {
  plus: '<path fill="currentColor" d="M228 128a12 12 0 0 1-12 12h-76v76a12 12 0 0 1-24 0v-76H40a12 12 0 0 1 0-24h76V40a12 12 0 0 1 24 0v76h76a12 12 0 0 1 12 12"/>',
};

const STAGE_H = 196;
const WAND = { x: 30, y: STAGE_H - 30, r: 12 }; // the wand's ring, in the stage
const BLOW = { x: 0.62, y: -0.785 }; // the way a new bubble swells off the ring: up and to the right
const GROW = 0.6; // seconds on the wand before it lets go
const MAX_CHARS = 14;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
/** a fixed scatter from a string, so each tag's bubble always has the same colours and drift */
const seedOf = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
};

/** one bubble's motion, kept outside React and written straight to the page each frame */
type Body = { tag: string; r: number; x: number; y: number; vx: number; vy: number; born: number; free: boolean; jelly: number; seed: number };

let ruler: CanvasRenderingContext2D | null = null;
/** how big a bubble a label needs */
const radiusFor = (label: string) => {
  if (typeof document !== "undefined" && !ruler) ruler = document.createElement("canvas").getContext("2d");
  let w = label.length * 7.2;
  if (ruler) {
    ruler.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    w = ruler.measureText(label).width;
  }
  return clamp(w / 2 + 14, 25, 56);
};

/** one step of the bubbles' world: they hang about the middle, drift, press softly against each other and the walls */
function stepBodies(list: Body[], w: number, h: number, t: number, dt: number, still: boolean) {
  for (const b of list) {
    if (!b.free) continue;
    const ph = b.seed * 6.28;
    let ax = -0.55 * (b.x - w * 0.54) + (still ? 0 : 10 * Math.sin(t * 0.6 + ph) + 5 * Math.sin(t * 1.31 + ph * 2.3));
    let ay = -1.2 * (b.y - h * 0.46) + (still ? 0 : 8 * Math.cos(t * 0.47 + ph * 1.7) + 4 * Math.sin(t * 1.13 + ph));
    for (const o of list) {
      if (o === b || !o.free) continue;
      const dx = b.x - o.x, dy = b.y - o.y, d = Math.hypot(dx, dy) || 0.01, over = b.r + o.r + 7 - d;
      if (over > 0) {
        // a soft cushion of air first, then the films themselves, which push back hard
        const push = over * 40 + Math.max(0, over - 7) * 260;
        ax += (dx / d) * push;
        ay += (dy / d) * push;
        if (over > 8 && !still) b.jelly = Math.min(0.09, b.jelly + (over - 8) * 0.004);
      }
    }
    const pad = 3;
    if (b.x < b.r + pad) ax += (b.r + pad - b.x) * 110;
    if (b.x > w - b.r - pad) ax -= (b.x - (w - b.r - pad)) * 110;
    if (b.y < b.r + pad) ay += (b.r + pad - b.y) * 110;
    if (b.y > h - b.r - pad) ay -= (b.y - (h - b.r - pad)) * 110;
    b.vx = (b.vx + ax * dt) * Math.exp(-2.4 * dt);
    b.vy = (b.vy + ay * dt) * Math.exp(-2.4 * dt);
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > 300) {
      b.vx *= 300 / sp;
      b.vy *= 300 / sp;
    }
  }
  for (const b of list) {
    if (!b.free) continue;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.jelly *= Math.exp(-2.6 * dt);
  }
}

/** the soap film: a clear middle, a bright rim, colours that turn slowly round it, and the window it reflects */
function Film({ seed, still }: { seed: number; still: boolean }) {
  const from = Math.round(seed * 360);
  const ring = "radial-gradient(circle closest-side, transparent 58%, #000 78%, #000 96%, transparent 100%)";
  return (
    <>
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle closest-side, rgba(6,28,22,.14) 0%, rgba(6,28,22,.07) 62%, rgba(255,255,255,.05) 80%, rgba(255,255,255,.16) 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.5), inset 0 0 9px rgba(255,255,255,.3), inset 7px -7px 14px rgba(110,225,255,.3), inset -7px 7px 14px rgba(255,130,215,.3), inset 0 -9px 14px rgba(255,220,130,.2), 0 0 12px rgba(255,255,255,.1)",
        }}
      />
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from ${from}deg, rgba(120,255,214,.05), rgba(120,255,214,.95), rgba(140,170,255,.9), rgba(255,120,225,.95), rgba(255,214,120,.95), rgba(160,255,150,.9), rgba(120,255,214,.05))`,
          WebkitMaskImage: ring,
          maskImage: ring,
          mixBlendMode: "screen",
          opacity: 0.62,
          filter: "blur(0.7px)",
        }}
        animate={still ? undefined : { rotate: seed > 0.5 ? 360 : -360 }}
        transition={{ duration: 16 + seed * 12, repeat: Infinity, ease: "linear" }}
      />
      {/* the sky's reflection up on the left, its echo down on the right */}
      <span className="absolute rounded-[50%]" style={{ left: "15%", top: "12%", width: "34%", height: "19%", transform: "rotate(-36deg)", background: "radial-gradient(ellipse closest-side, rgba(255,255,255,.7), rgba(255,255,255,.3) 55%, rgba(255,255,255,0))" }} />
      <span className="absolute rounded-full" style={{ inset: "8%", border: "2.6px solid transparent", borderTopColor: "rgba(255,255,255,.92)", transform: "rotate(-40deg)", filter: "blur(0.5px)" }} />
      <span className="absolute rounded-full" style={{ left: "13%", top: "36%", width: "7%", height: "7%", background: "rgba(255,255,255,.8)", filter: "blur(0.4px)" }} />
      <span className="absolute rounded-full" style={{ inset: "13%", border: "2px solid transparent", borderBottomColor: "rgba(255,255,255,.5)", transform: "rotate(-42deg)", filter: "blur(0.6px)" }} />
    </>
  );
}

type Pop = { id: number; tag: string; x: number; y: number; r: number };

/**
 * A tag input where every tag is a soap bubble.
 *
 * Type a word and press Enter: the wand in the corner blows a bubble with the word inside it, which swells, lets go
 * with a wobble and drifts up to join the others. They hang in a sunlit garden, turning their colours, pressing softly
 * against each other, and leaning away when your pointer moves past like a breath of air. Tap a bubble to remove its
 * tag and it pops in a ring of droplets; Backspace in the empty field pops the newest.
 *
 * Each bubble is a real button and the field is a real input, so the keyboard and screen readers get a plain list:
 *   <BubbleTags defaultTags={["design", "music"]} onChange={(tags) => save(tags)} />
 */
export default function BubbleTags({
  tags,
  defaultTags = ["design", "coffee", "hiking"],
  onChange,
  max = 8,
  label = "Topics",
  placeholder = "Add a topic",
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: BubbleTagsProps) {
  const reduce = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [inner, setInner] = useState<string[]>(defaultTags);
  const list = tags ?? inner;
  const listRef = useRef(list);
  useEffect(() => {
    listRef.current = list;
  });
  const [draft, setDraft] = useState("");
  const [pops, setPops] = useState<Pop[]>([]);
  const [said, setSaid] = useState("");
  const [blowing, setBlowing] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const demoTyping = useRef(false);
  const shake = useAnimationControls();
  /** the first touch ends the demo, and clears whatever it was in the middle of typing */
  const takeOver = () => {
    if (touched.current) return;
    touched.current = true;
    if (demoTyping.current) setDraft("");
  };

  const bodies = useRef(new Map<string, Body>());
  const nodes = useRef(new Map<string, HTMLButtonElement>());
  const dims = useRef({ w: 300, h: STAGE_H });
  const first = useRef(true);
  const clock = useRef(0);

  const write = (b: Body, now: number) => {
    const node = nodes.current.get(b.tag);
    if (!node) return;
    const age = (now - b.born) / 1000;
    const g = b.free ? 1 : 0.14 + 0.86 * (1 - Math.pow(1 - clamp(age / GROW), 3));
    const t = now / 1000, wob = b.jelly + (reduce ? 0 : 0.012);
    const sx = 1 + wob * Math.sin(t * 13 + b.seed * 9), sy = 1 - wob * Math.sin(t * 13 + b.seed * 9);
    node.style.width = node.style.height = `${(b.r * 2).toFixed(1)}px`;
    node.style.transform = `translate(${(b.x - b.r).toFixed(2)}px, ${(b.y - b.r).toFixed(2)}px) scale(${(g * sx).toFixed(4)}, ${(g * sy).toFixed(4)})`;
    node.style.opacity = "1";
  };

  /** keep the bubbles in step with the tags: new ones start on the wand, and they all shrink a little if it gets crowded */
  useLayoutEffect(() => {
    const now = performance.now(), map = bodies.current, { w, h } = dims.current;
    for (const tag of [...map.keys()]) if (!list.includes(tag)) map.delete(tag);
    const sizes = list.map(radiusFor);
    const area = sizes.reduce((s, r) => s + Math.PI * r * r, 0);
    const fit = Math.max(0.72, Math.min(1, Math.sqrt((0.5 * w * h) / Math.max(1, area))));
    list.forEach((tag, i) => {
      const r = Math.max(24, sizes[i]! * fit);
      const had = map.get(tag);
      if (had) {
        had.r = r;
        return;
      }
      const seed = seedOf(tag);
      if (first.current || reduce) {
        // already there when the page opens: scattered, to settle on their own
        map.set(tag, { tag, r, x: w * (0.3 + 0.5 * ((i * 0.37 + seed * 0.3) % 1)), y: h * (0.3 + 0.4 * seed), vx: 0, vy: 0, born: now - 5000, free: true, jelly: 0, seed });
      } else {
        map.set(tag, { tag, r, x: WAND.x, y: WAND.y, vx: 0, vy: 0, born: now, free: false, jelly: 0, seed });
      }
    });
    if (first.current || reduce) {
      const all = [...map.values()];
      for (let k = 0; k < 400; k++) stepBodies(all, w, h, 0, 1 / 60, true);
    }
    first.current = false;
    for (const b of map.values()) write(b, now);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, reduce]);

  // the stage's size
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const read = () => {
      dims.current = { w: stage.clientWidth, h: stage.clientHeight };
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // ── the frame loop ──
  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0, last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      clock.current += dt;
      const all = [...bodies.current.values()], { w, h } = dims.current;
      for (const b of all) {
        if (b.free) continue;
        // still on the wand: it swells out from the ring, then lets go with a kick and a wobble
        const age = (now - b.born) / 1000, g = 0.14 + 0.86 * (1 - Math.pow(1 - clamp(age / GROW), 3));
        b.x = WAND.x + BLOW.x * (WAND.r * 0.4 + b.r * g);
        b.y = WAND.y + BLOW.y * (WAND.r * 0.4 + b.r * g);
        if (age >= GROW) {
          b.free = true;
          b.vx = BLOW.x * 60 + (b.seed - 0.5) * 24;
          b.vy = BLOW.y * 60;
          b.jelly = 0.1;
          sfx.note(330 + (56 - b.r) * 5, { glide: 660 + (56 - b.r) * 9, dur: 0.13, gain: 0.05, bell: 0 });
        }
      }
      stepBodies(all, w, h, clock.current, dt, false);
      for (const b of all) write(b, now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  const commit = (next: string[]) => {
    listRef.current = next;
    if (tags === undefined) setInner(next);
    onChange?.(next);
  };

  const add = (raw: string) => {
    const word = raw.trim().replace(/\s+/g, " ").slice(0, MAX_CHARS);
    if (!word) return false;
    const now = listRef.current;
    const twin = now.find((t) => t.toLowerCase() === word.toLowerCase());
    if (twin) {
      // already there: its bubble shivers
      const b = bodies.current.get(twin);
      if (b) b.jelly = 0.16;
      sfx.tick({ freq: 500, gain: 0.07 });
      setSaid(`${twin} is already there.`);
      return true;
    }
    if (now.length >= max) {
      void shake.start({ x: [0, -7, 6, -4, 2, 0], transition: { duration: 0.34 } });
      sfx.note(196, { glide: 165, dur: 0.16, gain: 0.05, bell: 0 });
      setSaid(`That is all ${max}. Pop one to add another.`);
      return false;
    }
    sfx.whoosh(480, 1150, { dur: GROW * 0.9, gain: 0.03 });
    setBlowing((k) => k + 1);
    setSaid(`Added ${word}.`);
    commit([...now, word]);
    return true;
  };

  const remove = (tag: string) => {
    const b = bodies.current.get(tag);
    if (b) {
      setPops((q) => [...q, { id: performance.now(), tag, x: b.x, y: b.y, r: b.r }]);
      sfx.tick({ freq: 1500 + (56 - b.r) * 45, gain: 0.1 });
      sfx.note(1100 + (56 - b.r) * 14, { glide: 380, dur: 0.07, gain: 0.045, bell: 0 });
      // the ones beside it feel the pop
      for (const o of bodies.current.values()) {
        if (o === b || !o.free) continue;
        const dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy) || 1;
        if (d < b.r + o.r + 30) {
          o.vx += (dx / d) * 45;
          o.vy += (dy / d) * 45;
          o.jelly = Math.max(o.jelly, 0.07);
        }
      }
    }
    setSaid(`Removed ${tag}.`);
    commit(listRef.current.filter((t) => t !== tag));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (add(draft)) setDraft("");
  };
  const onKey = (e: RKeyboardEvent<HTMLInputElement>) => {
    if (e.key === ",") {
      if (!draft.trim()) return;
      e.preventDefault();
      if (add(draft)) setDraft("");
    } else if (e.key === "Backspace" && !draft && listRef.current.length) {
      e.preventDefault();
      remove(listRef.current[listRef.current.length - 1]!);
    }
  };

  // a breath of air from the pointer: bubbles near it are carried along and pushed aside
  const wind = useRef({ x: 0, y: 0, t: 0 });
  const onMove = (e: RPointerEvent) => {
    if (reduce) return;
    const box = stageRef.current!.getBoundingClientRect(), now = performance.now();
    const x = e.clientX - box.left, y = e.clientY - box.top, w = wind.current;
    const dtp = now - w.t;
    if (dtp > 0 && dtp < 90) {
      const vx = ((x - w.x) / dtp) * 1000, vy = ((y - w.y) / dtp) * 1000;
      for (const b of bodies.current.values()) {
        if (!b.free) continue;
        const dx = b.x - x, dy = b.y - y, d = Math.hypot(dx, dy) || 1, reach = b.r + 70;
        if (d > reach) continue;
        const fall = Math.pow(1 - d / reach, 2);
        b.vx += (vx * 0.05 + (dx / d) * 14) * fall;
        b.vy += (vy * 0.05 + (dy / d) * 14) * fall;
        b.jelly = Math.min(0.08, b.jelly + 0.004 * fall * Math.min(4, Math.hypot(vx, vy) / 200));
      }
    }
    w.x = x;
    w.y = y;
    w.t = now;
  };

  // autoplay: blow a few, pop a few, until someone touches it
  useEffect(() => {
    if (!autoplay || reduce || !inView || tags !== undefined) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    const words = ["travel", "books", "cinema", "jazz", "surfing", "baking", "chess", "film"];
    (async () => {
      await wait(1400);
      let k = 0;
      while (ok()) {
        const word = words[k++ % words.length]!;
        // type it into the field, then Enter
        demoTyping.current = true;
        for (let i = 1; i <= word.length && ok(); i++) {
          setDraft(word.slice(0, i));
          await wait(70 + Math.random() * 50);
        }
        if (ok()) await wait(260);
        if (!ok()) break;
        add(word);
        setDraft("");
        demoTyping.current = false;
        await wait(1900);
        if (!ok()) break;
        if (listRef.current.length > 5) {
          remove(listRef.current[Math.floor(Math.random() * 3)]!);
          await wait(900);
          if (!ok()) break;
          remove(listRef.current[0]!);
          await wait(1300);
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  const droplets = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ a: (i / 12) * Math.PI * 2 + (i % 2) * 0.2, d: 12 + ((i * 7) % 5) * 4, s: 2 + (i % 3) })), []);
  const full = list.length >= max;

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={takeOver}
      onKeyDownCapture={takeOver}
      className={`w-[340px] max-w-full rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      <div className="flex items-baseline justify-between">
        <label htmlFor={`in-${uid}`} className="text-[17px] font-semibold tracking-[-0.01em]">
          {label}
        </label>
        <span className="text-[13px] tabular-nums" style={{ color: full ? "#b25000" : "#6e6e73" }}>
          {list.length} of {max}
        </span>
      </div>

      {/* the garden: out of focus, with the sun coming through the leaves */}
      <div
        ref={stageRef}
        onPointerMove={onMove}
        className="relative mt-3 overflow-hidden rounded-[18px]"
        style={{ height: STAGE_H, background: "linear-gradient(168deg, #0e3b3a 0%, #165046 34%, #24684c 62%, #4f8a4c 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {[
            [8, 14, 64, "#d9f59a", 0.2],
            [30, -6, 46, "#fff3b0", 0.24],
            [58, 8, 78, "#a8e6a1", 0.16],
            [82, 20, 54, "#e9ffb5", 0.2],
            [70, 58, 70, "#7fd0b8", 0.14],
            [16, 60, 84, "#8fd7a0", 0.13],
            [44, 44, 40, "#fff7c9", 0.14],
            [92, 78, 60, "#cfee8f", 0.14],
            [50, 86, 52, "#6fc7b0", 0.12],
          ].map(([x, y, d, c, o], i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{ left: `${x}%`, top: `${y}%`, width: d as number, height: d as number, transform: "translate(-50%, -50%)", background: `radial-gradient(circle closest-side, ${c} 0%, ${c} 62%, transparent 100%)`, opacity: o as number, filter: "blur(2px)" }}
            />
          ))}
          <span className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(4,20,18,.45) 100%)" }} />
        </div>

        {/* the wand in the corner, a film of soap across its ring */}
        <motion.svg
          key={blowing}
          className="pointer-events-none absolute left-0 top-0"
          width={80}
          height={STAGE_H}
          viewBox={`0 0 80 ${STAGE_H}`}
          aria-hidden="true"
          style={{ transformOrigin: `4px ${STAGE_H - 2}px` }}
          initial={false}
          animate={blowing && !reduce ? { rotate: [0, -5, 1.5, 0] } : { rotate: 0 }}
          transition={{ duration: GROW + 0.4, ease: "easeOut" }}
        >
          <defs>
            <linearGradient id={`wand-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffd0de" />
              <stop offset="0.5" stopColor="#ff8fb0" />
              <stop offset="1" stopColor="#e85c88" />
            </linearGradient>
            <linearGradient id={`film-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8dfbe0" stopOpacity=".5" />
              <stop offset="0.5" stopColor="#c7a4ff" stopOpacity=".35" />
              <stop offset="1" stopColor="#ffd98a" stopOpacity=".5" />
            </linearGradient>
          </defs>
          <line x1={WAND.x - 8.4} y1={WAND.y + 8.6} x2={-4} y2={STAGE_H + 6} stroke={`url(#wand-${uid})`} strokeWidth={4.4} strokeLinecap="round" />
          <circle cx={WAND.x} cy={WAND.y} r={WAND.r - 1.6} fill={`url(#film-${uid})`} />
          <circle cx={WAND.x} cy={WAND.y} r={WAND.r} fill="none" stroke={`url(#wand-${uid})`} strokeWidth={3.2} />
          <circle cx={WAND.x} cy={WAND.y} r={WAND.r + 1.1} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={0.7} strokeDasharray="1.2 2.4" />
          <path d={`M${WAND.x - 9},${WAND.y - 6.5} A${WAND.r},${WAND.r} 0 0 1 ${WAND.x + 1},${WAND.y - 11.9}`} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={1} strokeLinecap="round" />
        </motion.svg>

        {list.map((tag) => (
          <button
            key={tag}
            ref={(node) => {
              if (node) nodes.current.set(tag, node);
              else nodes.current.delete(tag);
            }}
            type="button"
            onClick={() => {
              remove(tag);
              inputRef.current?.focus({ preventScroll: true });
            }}
            aria-label={`Remove ${tag}`}
            className="group absolute left-0 top-0 flex cursor-pointer items-center justify-center rounded-full p-0 outline-none [-webkit-tap-highlight-color:transparent] focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_rgba(255,255,255,.35)]"
            style={{ opacity: 0, willChange: "transform", transformOrigin: "50% 50%" }}
          >
            <Film seed={seedOf(tag)} still={reduce} />
            <span className="absolute inset-0 rounded-full bg-white/0 transition-colors duration-150 group-hover:bg-white/10" />
            <span className="relative max-w-[86%] truncate px-1 text-[13px] font-medium leading-none text-white" style={{ textShadow: "0 1px 2px rgba(0,25,20,.55)" }}>
              {tag}
            </span>
          </button>
        ))}

        {/* a pop: the film snaps back as a ring, the droplets fly, the word falls */}
        <AnimatePresence>
          {pops.map((p) => (
            <div key={p.id} className="pointer-events-none absolute left-0 top-0" style={{ transform: `translate(${p.x}px, ${p.y}px)` }} aria-hidden="true">
              <motion.span
                className="absolute rounded-full border-[1.5px] border-white/80"
                style={{ left: -p.r, top: -p.r, width: p.r * 2, height: p.r * 2 }}
                initial={{ scale: 1, opacity: 0.9 }}
                animate={{ scale: reduce ? 1 : 1.16, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
              {!reduce &&
                droplets.map((q, i) => (
                  <motion.span
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{ width: q.s, height: q.s, left: -q.s / 2, top: -q.s / 2 }}
                    initial={{ x: Math.cos(q.a) * p.r * 0.92, y: Math.sin(q.a) * p.r * 0.92, opacity: 0.95 }}
                    animate={{ x: Math.cos(q.a) * (p.r + q.d), y: Math.sin(q.a) * (p.r + q.d) + 12, opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.42, ease: [0.2, 0.7, 0.4, 1] }}
                  />
                ))}
              <motion.span
                className="absolute whitespace-nowrap text-[13px] font-medium leading-none text-white"
                style={{ left: 0, top: -6, x: "-50%" }}
                initial={{ y: 0, opacity: 0.9 }}
                animate={{ y: reduce ? 0 : 16, opacity: 0 }}
                transition={{ duration: 0.36, ease: "easeIn" }}
                onAnimationComplete={() => setPops((list0) => list0.filter((z) => z.id !== p.id))}
              >
                {p.tag}
              </motion.span>
            </div>
          ))}
        </AnimatePresence>
      </div>

      <motion.form onSubmit={onSubmit} animate={shake} className="mt-3 flex items-center gap-2 rounded-full bg-[#f5f5f7] py-1 pl-4 pr-1 focus-within:shadow-[0_0_0_2px_#0071e3]">
        <input
          ref={inputRef}
          id={`in-${uid}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={onKey}
          placeholder={full ? "Pop one to add another" : placeholder}
          maxLength={MAX_CHARS}
          enterKeyHint="done"
          autoComplete="off"
          autoCapitalize="none"
          className="h-9 min-w-0 flex-1 bg-transparent text-[16px] text-[#1d1d1f] outline-none placeholder:text-[#6e6e73]"
        />
        <button
          type="submit"
          aria-label="Add tag"
          disabled={!draft.trim()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0071e3] text-white outline-none transition-opacity focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#0071e3] disabled:opacity-30"
        >
          <svg viewBox="0 0 256 256" width="16" height="16" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.plus }} />
        </button>
      </motion.form>
      <span className="sr-only" role="status" aria-live="polite">
        {said}
      </span>
    </div>
  );
}
```

--- components/bubble-tags/index.ts ---

```ts
export { default as BubbleTags } from "./bubble-tags";
export type { BubbleTagsProps } from "./bubble-tags";
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
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```

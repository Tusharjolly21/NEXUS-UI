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

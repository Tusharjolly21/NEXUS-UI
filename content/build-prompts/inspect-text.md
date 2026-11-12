# Inspect Text

Add the "Inspect Text" component from Nexus UI to my project.

An intro paragraph where every word, logo and photo is its own layer, like in a design tool. A selection frame with handles and a live size tag springs between the layers as you point, and logos fill with colour from the edge you came in by. Click a layer to inspect its real styles, then point at another for red measurement lines between the two; drag a handle to resize. In autoplay a collaborator's cursor wanders in and does it for you.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { InspectText } from "@/components/inspect-text";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/inspect-text/index.ts ---

```ts
export { default as InspectText } from "./inspect-text";
export type { InspectTextProps } from "./inspect-text";
```

--- components/inspect-text/inspect-text.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type InspectLayer = {
  id: string;
  /** the word, or for a logo or photo, what it is */
  label: string;
  /** a logo or photo tile instead of a word: its background, the mark on it, round or rounded square */
  logo?: { bg: string; glyph: ReactNode; round?: boolean };
  /** the colour a logo fills with when you point at it */
  tint?: string;
};

export type InspectTextProps = {
  /** the sentence: strings, and layers in braces by id, e.g. "Hi, I'm {lena}." */
  text?: string;
  layers?: InspectLayer[];
  /** the collaborator whose cursor wanders in during autoplay */
  collaborator?: { name: string; color: string };
  /** Soft synthesised sounds: ticks as the frame moves, a tock when you select. They also follow the site-wide sound switch. */
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

const ICON_SPROUT = "M205.41 159.07a60.9 60.9 0 0 1-31.83 8.86a71.7 71.7 0 0 1-27.36-5.66A55.55 55.55 0 0 0 136 194.51V224a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.25v-12.44l-38.62-38.62A52.5 52.5 0 0 1 63.44 176a45.8 45.8 0 0 1-23.92-6.67C17.73 156.09 6 125.62 8.27 87.79a8 8 0 0 1 7.52-7.52c37.83-2.23 68.3 9.46 81.5 31.25a46 46 0 0 1 6.45 28.48a4 4 0 0 1-6.89 2.43l-19.2-20.1a8 8 0 0 0-11.31 11.31l53.88 55.25c.06-.78.13-1.56.21-2.33a68.56 68.56 0 0 1 18.64-39.46l50.59-53.46a8 8 0 0 0-11.31-11.32l-49 51.82a4 4 0 0 1-6.78-1.74c-4.74-17.48-2.65-34.88 6.4-49.82c17.86-29.48 59.42-45.26 111.18-42.22a8 8 0 0 1 7.52 7.52c3 51.77-12.78 93.33-42.26 111.19";
const ICON_NIB = "m243.31 81.36l-68.68-68.68a16 16 0 0 0-22.63 0l-28.44 28.44l-58 21.76a16 16 0 0 0-10.2 12.35l-20.77 124.6a4 4 0 0 0 6.77 3.49l57-57a23.85 23.85 0 0 1-2.29-12.08a24 24 0 1 1 13.6 23.4l-57 57a4 4 0 0 0 3.49 6.77l124.61-20.77a16 16 0 0 0 12.35-10.16l21.77-58.07L243.31 104a16 16 0 0 0 0-22.63ZM208 116.68L139.32 48l24-24L232 92.68Z";
const ICON_CURSOR = "M248 121.58a15.76 15.76 0 0 1-11.29 15l-.2.06l-78 21.84l-21.84 78l-.06.2a15.77 15.77 0 0 1-15 11.29h-.3a15.77 15.77 0 0 1-15.07-10.67L41 61.41a1 1 0 0 1-.05-.16a16 16 0 0 1 20.3-20.35l.16.05l175.92 65.26A15.78 15.78 0 0 1 248 121.58";

const glyph = (d: string, size = 60) => (
  <svg viewBox="0 0 256 256" style={{ width: `${size}%`, height: `${size}%`, filter: "drop-shadow(0 0.5px 0.5px rgba(0,0,0,.25))" }}>
    <path fill="currentColor" d={d} />
  </svg>
);
/** the Nexus UI mark: three spokes from a hub, each ending in a node */
const nexusMark = (
  <svg viewBox="0 0 64 64" style={{ width: "86%", height: "86%" }}>
    <g stroke="#fff" strokeLinecap="round" fill="none">
      <path d="M32 13v19" strokeWidth={2.4} />
      <path d="M32 32L12.8 45.2M32 32l19.2 13.2" strokeWidth={2.8} />
    </g>
    <g fill="#fff">
      <circle cx={32} cy={13} r={3.2} />
      <circle cx={32} cy={32} r={4.8} />
      <circle cx={12.8} cy={45.2} r={3.3} />
      <circle cx={51.2} cy={45.2} r={3.3} />
    </g>
  </svg>
);

// every word, logo and photo is its own layer, as it would be in a design file
const DEFAULT_LAYERS: InspectLayer[] = [
  { id: "photo", label: "Lena's photo", tint: "#0071e3", logo: { bg: "radial-gradient(120% 120% at 30% 20%,#ffd36e 0%,#ff9f0a 35%,#ff375f 100%)", round: true, glyph: <span className="text-[0.42em] font-bold leading-none tracking-normal" style={{ textShadow: "0 0.5px 1px rgba(0,0,0,.25)" }}>LO</span> } },
  { id: "lena", label: "Lena" },
  { id: "ortiz", label: "Ortiz" },
  { id: "fw-logo", label: "Fieldwork logo", tint: "#30d158", logo: { bg: "linear-gradient(160deg,#6fdc7a 0%,#2fb34f 45%,#1b7a34 100%)", glyph: glyph(ICON_SPROUT, 62) } },
  { id: "fieldwork", label: "Fieldwork" },
  { id: "np-logo", label: "North Press logo", tint: "#bf5af2", logo: { bg: "linear-gradient(160deg,#6b5cff 0%,#4a2fd6 50%,#2a1a8c 100%)", glyph: glyph(ICON_NIB, 58) } },
  { id: "north", label: "North" },
  { id: "press", label: "Press" },
  { id: "nx-logo", label: "Nexus UI logo", tint: "linear-gradient(135deg,#2f7bff 0%,#a855f7 55%,#ff7a3d 100%)", logo: { bg: "linear-gradient(160deg,#2a2a2e 0%,#0e0e10 60%)", glyph: nexusMark } },
  { id: "nexus", label: "Nexus" },
  { id: "ui", label: "UI" },
];
const DEFAULT_TEXT = "Hi, I'm {photo} {lena} {ortiz}. I lead design at {fw-logo} {fieldwork}, draw typefaces for {np-logo} {north} {press} and build with {nx-logo} {nexus} {ui}.";

type Box = { x: number; y: number; w: number; h: number };
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/**
 * An intro paragraph you can inspect like layers in a design tool.
 *
 * Every word, logo and photo is its own layer. Point at one and a selection frame springs onto it with a little
 * bounce, with corner handles and a live size tag, sliding from layer to layer as you move; point at a logo and it
 * fills with colour from the edge your pointer came in by, and drains out the edge you leave by. A hand-written nudge
 * says where to start. Click to
 * select it: the handles fill, an inspector card reads the real font, size, line height, colour and tracking off the
 * page, and then pointing at another name draws red measurement lines with the gap in pixels, the way a design tool
 * does. Drag a handle to resize the type itself. In autoplay a collaborator's cursor wanders through doing the same.
 * Every name is a real button, so Tab, Enter and Escape work.
 *   <InspectText text="I'm {sam} {acme}." layers={[{ id: "sam", label: "Sam" }, { id: "acme", label: "Acme" }]} />
 */
export default function InspectText({
  text = DEFAULT_TEXT,
  layers = DEFAULT_LAYERS,
  collaborator = { name: "Noah", color: "#ff375f" },
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: InspectTextProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const els = useRef<Record<string, HTMLButtonElement | null>>({});
  const inView = useInView(rootRef, { margin: "100px" });
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [scale, setScale] = useState<Record<string, number>>({});
  const [ghost, setGhost] = useState(false); // the collaborator is driving
  const lastHover = useRef<string | null>(null);
  const [hinted, setHinted] = useState(false);

  // the frame, sprung between layers
  const spring = reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 520, damping: 26, mass: 0.6 };
  const fx = useSpring(0, spring),
    fy = useSpring(0, spring),
    fw = useSpring(0, spring),
    fh = useSpring(0, spring);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // the collaborator's cursor
  const cx = useSpring(40, { stiffness: 60, damping: 16 }),
    cy = useSpring(120, { stiffness: 60, damping: 16 });

  const parts = useMemo(() => text.split(/(\{[a-z0-9-]+\})/i).filter(Boolean), [text]);

  const measure = () => {
    const root = boxRef.current;
    if (!root) return;
    const R = root.getBoundingClientRect();
    const out: Record<string, Box> = {};
    for (const l of layers) {
      const el = els.current[l.id];
      if (!el) continue;
      // the tight box of the type and its icon, not the whole line
      const r = (el.querySelector("[data-ink]") ?? el).getBoundingClientRect();
      out[l.id] = { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height };
    }
    setBoxes(out);
    return out;
  };
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, text]);
  useEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  // the frame follows the pointer until something's selected; then it stays on the selection and the pointer measures
  const target = selected ?? hover;
  useEffect(() => {
    const b = target ? boxes[target] : null;
    if (!b) return;
    const pad = 4;
    fx.set(b.x - pad);
    fy.set(b.y - pad);
    fw.set(b.w + pad * 2);
    fh.set(b.h + pad * 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, boxes]);
  useEffect(() => {
    const u = () => setSize({ w: Math.round(fw.get() - 8), h: Math.round(fh.get() - 8) });
    const a = fw.on("change", u),
      b = fh.on("change", u);
    return () => {
      a();
      b();
    };
  }, [fw, fh]);

  const hoverOn = (id: string | null, user: boolean) => {
    if (user) {
      touched.current = true;
      setGhost(false);
    }
    if (id) setHinted(true);
    if (id !== lastHover.current && id) sfx.tick({ freq: 2400, gain: 0.018 });
    lastHover.current = id;
    setHover(id);
  };
  const select = (id: string | null, user: boolean) => {
    if (user) {
      touched.current = true;
      setGhost(false);
      unlockAudio();
    }
    setSelected((cur) => {
      const next = cur === id ? null : id;
      if (next) sfx.note(520, { dur: 0.12, gain: 0.04, bell: 0.2 });
      return next;
    });
  };

  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "Escape") {
      setSelected(null);
      (e.target as HTMLElement).blur();
    }
  };

  // ── resizing the type by its handles ──
  const drag = useRef<{ id: string; x0: number; y0: number; s0: number; w: number; h: number; sx: number; sy: number } | null>(null);
  const onHandleDown = (e: RPointerEvent, sx: number, sy: number) => {
    const id = selected ?? hover;
    if (!id) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    touched.current = true;
    setSelected(id);
    const b = boxes[id];
    drag.current = { id, x0: e.clientX, y0: e.clientY, s0: scale[id] ?? 1, w: b.w, h: b.h, sx, sy };
  };
  const onHandleMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    // pulling a handle away from the middle grows the type, pushing it in shrinks it
    const gx = d.sx ? ((e.clientX - d.x0) * d.sx) / d.w : 0,
      gy = d.sy ? ((e.clientY - d.y0) * d.sy) / d.h : 0;
    const g = Math.abs(gx) > Math.abs(gy) ? gx : gy;
    const s = clamp(d.s0 * (1 + g), 0.6, 1.9);
    setScale((m) => ({ ...m, [d.id]: Math.round(s * 100) / 100 }));
  };
  const onHandleUp = () => {
    if (drag.current) sfx.tick({ freq: 1600, gain: 0.02 });
    drag.current = null;
  };

  // ── autoplay: a collaborator's cursor drops in and inspects things ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    const ids = layers.map((l) => l.id);
    let i = 0,
      t = 0;
    const tick = () => {
      if (touched.current) {
        setGhost(false);
        return;
      }
      setGhost(true);
      const bx = measure() ?? {};
      const id = ids[i % ids.length];
      const b = bx[id];
      i++;
      if (b) {
        cx.set(b.x + b.w * (0.3 + Math.random() * 0.5));
        cy.set(b.y + b.h * 0.7);
        window.setTimeout(() => {
          if (touched.current) return;
          setHover(id);
          setHinted(true);
          // every other stop, it selects, so the next stop shows the redlines
          if (i % 3 === 1) window.setTimeout(() => !touched.current && setSelected(id), 500);
          if (i % 3 === 0) window.setTimeout(() => !touched.current && setSelected(null), 1400);
        }, 650);
      }
      t = window.setTimeout(tick, 2100);
    };
    t = window.setTimeout(tick, 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const color = ghost ? collaborator.color : "#0071e3";
  const sel = selected ? boxes[selected] : null;
  const hov = hover && hover !== selected ? boxes[hover] : null;
  const layerOf = (id: string) => layers.find((l) => l.id === id);

  return (
    <div ref={rootRef} className={`w-full max-w-[520px] rounded-[24px] bg-white p-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="mb-3 flex items-center justify-between text-[12px] text-[#86868b]">
        <span>About</span>
        <span>{selected ? "Point at another name to measure" : "Point at a name, click to inspect"}</span>
      </div>
      <div ref={boxRef} className="relative" onPointerLeave={() => !ghost && hoverOn(null, false)} onPointerMove={onHandleMove} onPointerUp={onHandleUp}>
        <p className="text-[22px] font-semibold leading-[1.45] tracking-[-0.02em] text-[#86868b]">
          {parts.map((part, k) => {
            const m = part.match(/^\{(.+)\}$/);
            if (!m) return <span key={k}>{part}</span>;
            const l = layerOf(m[1]);
            if (!l) return <span key={k}>{part}</span>;
            return (
              <Word
                key={k}
                layer={l}
                active={hover === l.id || selected === l.id}
                scale={scale[l.id] ?? 1}
                reduce={reduce}
                refFn={(el) => (els.current[l.id] = el)}
                onEnter={() => hoverOn(l.id, true)}
                onClick={() => select(l.id, true)}
                onFocus={() => hoverOn(l.id, true)}
                onKey={onKey}
                selected={selected === l.id}
              />
            );
          })}
        </p>
        {/* a hand-written nudge, until someone points at something */}
        <AnimatePresence>
          {!hinted && boxes[layers[1]?.id ?? ""] && (
            <motion.div
              key="hint"
              aria-hidden="true"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="pointer-events-none absolute"
              style={{ left: boxes[layers[1].id].x + boxes[layers[1].id].w * 0.55, top: boxes[layers[1].id].y - 34 }}
            >
              <svg width="34" height="26" viewBox="0 0 34 26" className="absolute left-[-30px] top-[6px] text-[#86868b]">
                <path d="M31 4 C 20 2, 9 6, 6 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M2.5 15.5 L6 21 L10.5 16.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="whitespace-nowrap text-[13px] italic text-[#86868b]" style={{ fontFamily: '"Bradley Hand", "Segoe Print", "Comic Sans MS", cursive' }}>
                point here
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {/* the measurements, between the selection and what you're pointing at */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <AnimatePresence>{sel && hov && <Redlines key={`${selected}-${hover}`} a={sel} b={hov} />}</AnimatePresence>
        </svg>
        {/* the selection frame, its handles, its size */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0" style={{ x: fx, y: fy, width: fw, height: fh, opacity: target ? 1 : 0, transition: "opacity .15s" }}>
          <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 0 1.5px ${color}` }} />
          {[
            [0, 0, -1, -1],
            [1, 0, 1, -1],
            [0, 1, -1, 1],
            [1, 1, 1, 1],
          ].map(([hx, hy, sx, sy], k) => (
            <span
              key={k}
              className="pointer-events-auto absolute h-[8px] w-[8px] rounded-[1.5px] bg-white"
              style={{ left: `calc(${hx * 100}% - 4px)`, top: `calc(${hy * 100}% - 4px)`, boxShadow: `0 0 0 1.5px ${color}`, background: selected ? color : "#fff", cursor: sx * sy > 0 ? "nwse-resize" : "nesw-resize", touchAction: "none" }}
              onPointerDown={(e) => onHandleDown(e, sx, sy)}
              onDoubleClick={() => (selected ?? hover) && setScale((m) => ({ ...m, [(selected ?? hover)!]: 1 }))}
            />
          ))}
          <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-[4px] px-1.5 py-[1px] text-[11px] font-medium tabular-nums text-white transition-opacity" style={{ background: color, opacity: sel && hov ? 0 : 1 }}>
            {size.w} × {size.h}
          </span>
        </motion.div>
        {/* the collaborator */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0" style={{ x: cx, y: cy, opacity: ghost ? 1 : 0, transition: "opacity .3s" }}>
          <svg viewBox="0 0 256 256" className="h-[18px] w-[18px] -rotate-90 drop-shadow-[0_1px_1px_rgba(0,0,0,.25)]" style={{ color: collaborator.color }}>
            <path fill="currentColor" d={ICON_CURSOR} />
          </svg>
          <span className="absolute left-3.5 top-3.5 whitespace-nowrap rounded-full px-2 py-[2px] text-[11px] font-semibold text-white" style={{ background: collaborator.color }}>
            {collaborator.name}
          </span>
        </motion.div>
      </div>
      {/* the inspector, opening under the paragraph */}
      <AnimatePresence initial={false}>
        {selected && sel && els.current[selected] && (
          <Inspector key="inspector" el={els.current[selected]!} box={sel} scale={scale[selected] ?? 1} name={layerOf(selected)?.label ?? ""} logo={layerOf(selected)?.logo} reduce={reduce} />
        )}
      </AnimatePresence>
    </div>
  );
}

/** a layer: a word, or a logo whose colour fills in from the edge your pointer came in and drains out where it leaves */
function Word({
  layer,
  active,
  selected,
  scale,
  reduce,
  refFn,
  onEnter,
  onClick,
  onFocus,
  onKey,
}: {
  layer: InspectLayer;
  active: boolean;
  selected: boolean;
  scale: number;
  reduce: boolean;
  refFn: (el: HTMLButtonElement | null) => void;
  onEnter: () => void;
  onClick: () => void;
  onFocus: () => void;
  onKey: (e: RKeyboardEvent) => void;
}) {
  const fill = useMotionValue(0);
  const [edge, setEdge] = useState<"left" | "right" | "top" | "bottom">("left");
  /** which edge the pointer crossed: the nearest one, measured as a fraction of the box */
  const edgeOf = (e: { clientX: number; clientY: number; currentTarget: Element }) => {
    const b = e.currentTarget.getBoundingClientRect();
    const x = clamp((e.clientX - b.left) / b.width),
      y = clamp((e.clientY - b.top) / b.height);
    const d = { left: x, right: 1 - x, top: y, bottom: 1 - y };
    return (Object.keys(d) as (keyof typeof d)[]).reduce((a, k) => (d[k] < d[a] ? k : a), "left" as keyof typeof d);
  };
  useEffect(() => {
    animate(fill, active ? 1 : 0, reduce ? { duration: 0 } : { duration: active ? 0.42 : 0.32, ease: [0.22, 1, 0.36, 1] });
  }, [active, fill, reduce]);
  const horizontal = edge === "left" || edge === "right";
  const scaleX = useTransform(fill, (v) => (horizontal ? v : 1));
  const scaleY = useTransform(fill, (v) => (horizontal ? 1 : v));
  const tint = layer.tint ?? "#0071e3";
  const L = layer.logo;
  return (
    <button
      ref={refFn}
      type="button"
      aria-pressed={selected}
      aria-label={L ? layer.label : undefined}
      onPointerEnter={(e) => {
        setEdge(edgeOf(e));
        onEnter();
      }}
      onPointerLeave={(e) => setEdge(edgeOf(e))}
      onClick={onClick}
      onFocus={() => {
        setEdge("left");
        onFocus();
      }}
      onKeyDown={onKey}
      className={`relative inline whitespace-nowrap rounded-[6px] text-[#1d1d1f] outline-none ${L ? "px-[1px]" : "px-[1px]"}`}
      style={{ fontSize: `${scale}em`, lineHeight: "inherit" }}
    >
      {L ? (
        <span
          data-ink=""
          className={`relative inline-grid h-[1.15em] w-[1.15em] place-items-center overflow-hidden align-[-0.18em] text-white ${L.round ? "rounded-full" : "rounded-[0.3em]"}`}
          style={{ background: L.bg, boxShadow: "0 1px 2px rgba(0,0,0,.16), 0 3px 8px -4px rgba(0,0,0,.3)" }}
        >
          {/* the fill, growing from the edge you came in by */}
          <motion.span aria-hidden="true" className="absolute inset-0" style={{ background: tint, scaleX, scaleY, originX: edge === "right" ? 1 : 0, originY: edge === "bottom" ? 1 : 0 }} />
          {/* an app icon's light: a soft sheen from the top and a hairline edge */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ borderRadius: "inherit", background: "linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.06) 42%,rgba(255,255,255,0) 60%)", boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,.22), inset 0 -1px 1px rgba(0,0,0,.18)" }} />
          <span className="relative grid h-full w-full place-items-center">{L.glyph}</span>
        </span>
      ) : (
        <span data-ink="" className="relative">
          {layer.label}
        </span>
      )}
    </button>
  );
}

/** red lines between two boxes, with the gap in pixels: across, and up or down */
function Redlines({ a, b }: { a: Box; b: Box }) {
  const lines: { x1: number; y1: number; x2: number; y2: number; d: number; dash?: boolean }[] = [];
  const ar = a.x + a.w,
    br = b.x + b.w,
    ab = a.y + a.h,
    bb = b.y + b.h;
  const ovY = Math.max(a.y, b.y) < Math.min(ab, bb);
  const ovX = Math.max(a.x, b.x) < Math.min(ar, br);
  const yMid = ovY ? (Math.max(a.y, b.y) + Math.min(ab, bb)) / 2 : a.y + a.h / 2;
  const xMid = ovX ? (Math.max(a.x, b.x) + Math.min(ar, br)) / 2 : a.x + a.w / 2;
  if (b.x >= ar) lines.push({ x1: ar, y1: yMid, x2: b.x, y2: yMid, d: b.x - ar });
  else if (br <= a.x) lines.push({ x1: br, y1: yMid, x2: a.x, y2: yMid, d: a.x - br });
  if (b.y >= ab) lines.push({ x1: xMid, y1: ab, x2: xMid, y2: b.y, d: b.y - ab });
  else if (bb <= a.y) lines.push({ x1: xMid, y1: bb, x2: xMid, y2: a.y, d: a.y - bb });
  // dashed guides from the far box to the measuring line when they don't overlap
  const guides: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (!ovY && lines[0] && lines[0].y1 === lines[0].y2) guides.push({ x1: b.x + (b.x >= ar ? 0 : b.w), y1: b.y + b.h / 2, x2: b.x + (b.x >= ar ? 0 : b.w), y2: yMid });
  if (!ovX) {
    const v = lines.find((l) => l.x1 === l.x2);
    if (v) guides.push({ x1: b.x + b.w / 2, y1: v.y2 === b.y ? b.y : bb, x2: xMid, y2: v.y2 === b.y ? b.y : bb });
  }
  const red = "#ff3b30";
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <rect x={b.x - 3} y={b.y - 3} width={b.w + 6} height={b.h + 6} fill="none" stroke={red} strokeWidth={1} />
      {guides.map((g, k) => (
        <line key={`g${k}`} {...g} stroke={red} strokeWidth={1} strokeDasharray="3 3" />
      ))}
      {lines.map((l, k) => {
        const mx = (l.x1 + l.x2) / 2,
          my = (l.y1 + l.y2) / 2;
        const label = `${Math.round(l.d)}`;
        const tw = 8 + label.length * 6.5;
        return (
          <g key={k}>
            <motion.line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={red} strokeWidth={1} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }} />
            {l.y1 === l.y2 ? (
              <>
                <line x1={l.x1} y1={l.y1 - 4} x2={l.x1} y2={l.y1 + 4} stroke={red} />
                <line x1={l.x2} y1={l.y1 - 4} x2={l.x2} y2={l.y1 + 4} stroke={red} />
              </>
            ) : (
              <>
                <line x1={l.x1 - 4} y1={l.y1} x2={l.x1 + 4} y2={l.y1} stroke={red} />
                <line x1={l.x1 - 4} y1={l.y2} x2={l.x1 + 4} y2={l.y2} stroke={red} />
              </>
            )}
            <rect x={mx - tw / 2} y={my - 8} width={tw} height={16} rx={3} fill={red} />
            <text x={mx} y={my + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff" style={{ fontVariantNumeric: "tabular-nums" }}>
              {label}
            </text>
          </g>
        );
      })}
    </motion.g>
  );
}

/** the inspector: the real styles of the selected name, read off the page */
function Inspector({ el, box, scale, name, logo, reduce }: { el: HTMLElement; box: Box; scale: number; name: string; logo?: InspectLayer["logo"]; reduce: boolean }) {
  const [st, setSt] = useState<{ font: string; weight: string; size: number; lh: number; color: string; track: string } | null>(null);
  useEffect(() => {
    const cs = getComputedStyle(el);
    const fam = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
    const m = cs.color.match(/\d+(\.\d+)?/g)?.map(Number) ?? [0, 0, 0];
    const hex = "#" + m.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
    const size = parseFloat(cs.fontSize);
    const lh = cs.lineHeight === "normal" ? size * 1.2 : parseFloat(cs.lineHeight);
    const ls = cs.letterSpacing === "normal" ? "0" : (Math.round(parseFloat(cs.letterSpacing) * 100) / 100).toString();
    setSt({ font: /apple-system|system-ui|BlinkMac/i.test(fam) ? "System UI" : fam, weight: cs.fontWeight, size: Math.round(size * 10) / 10, lh: Math.round(lh), color: hex, track: ls });
  }, [el, scale]);
  const swatch = (c: string) => (
    <span key="s" className="inline-flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,.12)]" style={{ background: c }} />
      {c.startsWith("#") ? c.toUpperCase() : "Gradient"}
    </span>
  );
  const cells: [string, ReactNode][] = logo
    ? [
        ["Layer", logo.round ? "Photo, circle" : "Logo, rounded"],
        ["Size", `${Math.round(box.w)} × ${Math.round(box.h)}`],
        ["Fill", swatch(logo.bg)],
        ["Radius", logo.round ? "Full" : `${Math.round(box.h * 0.26)} px`],
      ]
    : st
    ? [
        ["Font", `${st.font} ${st.weight}`],
        ["Size", `${st.size} / ${st.lh}`],
        [
          "Fill",
          <span key="f" className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,.12)]" style={{ background: st.color }} />
            {st.color}
          </span>,
        ],
        ["Tracking", `${st.track} px`],
      ]
    : [];
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
      className="overflow-hidden"
    >
      <div role="status" aria-label={logo ? `${name}, ${Math.round(box.w)} by ${Math.round(box.h)} pixels` : st ? `${name}: ${st.font} ${st.weight}, ${st.size} pixels, ${st.color}` : name} className="relative mt-4 rounded-[14px] bg-[#f5f5f7] p-3.5">
        {/* a notch pointing up at the selected name */}
        <motion.span aria-hidden="true" className="absolute -top-[6px] h-3 w-3 rotate-45 rounded-[2px] bg-[#f5f5f7]" animate={{ left: Math.max(12, box.x + box.w / 2 - 6) }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">{name}</span>
          <span className="text-[11px] tabular-nums text-[#86868b]">
            {Math.round(box.w)} × {Math.round(box.h)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
          {cells.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <div className="text-[11px] text-[#86868b]">{k}</div>
              <div className="truncate text-[12px] font-medium tabular-nums text-[#1d1d1f]">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
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

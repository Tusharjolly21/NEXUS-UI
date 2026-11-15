# Filter Drawer

Add the "Filter Drawer" section from Nexus UI to my project.

A filters drawer over a shop of handmade ceramics, shown in real product photos (or drawn in SVG when you pass none). The drawer is a sheet of glass from the right, or a bottom sheet you drag between heights on a phone; the page behind sinks back and softens out of focus exactly as far as it's open. Filters apply live.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { FilterDrawer } from "@/components/blocks/motion-kit/filter-drawer";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/blocks/motion-kit/filter-drawer/index.ts ---

```ts
export { default as FilterDrawer } from "./filter-drawer";
export type { FilterDrawerProps } from "./filter-drawer";
```

--- components/blocks/motion-kit/filter-drawer/filter-drawer.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  type MotionValue,
  type PanInfo,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type ReactNode,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

/** `image` is a product photo (a URL or data URI), shown filling the card; without one the piece is drawn in SVG */
export type DrawerProduct = {
  id: string;
  name: string;
  price: number;
  kind: string;
  color: string;
  hue: [string, string];
  inStock: boolean;
  image?: string;
};
export type FilterDrawerProps = {
  products?: DrawerProduct[];
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
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
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
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

const I = {
  filter:
    "M40 92h30.06a36 36 0 0 0 67.88 0H216a12 12 0 0 0 0-24h-78.06a36 36 0 0 0-67.88 0H40a12 12 0 0 0 0 24m64-24a12 12 0 1 1-12 12a12 12 0 0 1 12-12m112 96h-14.06a36 36 0 0 0-67.88 0H40a12 12 0 0 0 0 24h94.06a36 36 0 0 0 67.88 0H216a12 12 0 0 0 0-24m-48 24a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  close:
    "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const KINDS = ["Vases", "Bowls", "Cups", "Planters"] as const;
type Shape = "vase" | "bud" | "amphora" | "bowl" | "cup" | "planter";
const KIND_SHAPE: Record<string, Shape> = {
  Vases: "vase",
  Bowls: "bowl",
  Cups: "cup",
  Planters: "planter",
};
const COLORS: { id: string; c: string }[] = [
  { id: "Oat", c: "#eadfca" },
  { id: "Sage", c: "#9db497" },
  { id: "Clay", c: "#c6795a" },
  { id: "Ink", c: "#2c3242" },
];
const P = (
  id: string,
  name: string,
  price: number,
  kind: string,
  color: string,
  shape: Shape,
  inStock = true,
): DrawerProduct & { shape: Shape } => {
  const base = COLORS.find((x) => x.id === color)!.c;
  return { id, name, price, kind, color, inStock, hue: [base, base], shape };
};
/** the demo shop. Pass these with an `image` on each to show photos instead of the drawn pieces */
export const CERAMICS: DrawerProduct[] = [
  P("p1", "Ring vase", 760, "Vases", "Oat", "vase"),
  P("p2", "Ink bud vase", 120, "Vases", "Ink", "bud"),
  P("p3", "Cream serving bowl", 190, "Bowls", "Oat", "bowl"),
  P("p4", "Face planter", 85, "Planters", "Sage", "planter"),
  P("p5", "Speckled tumbler", 38, "Cups", "Oat", "cup", false),
  P("p6", "Celadon bowl", 140, "Bowls", "Sage", "bowl"),
  P("p7", "Oxblood bottle vase", 280, "Vases", "Clay", "bud"),
  P("p8", "Carved planter", 120, "Planters", "Clay", "planter"),
  P("p9", "Bisque vase", 160, "Vases", "Oat", "vase"),
  P("p10", "Moss cup", 42, "Cups", "Sage", "cup"),
  P("p11", "Leaf bowl", 160, "Bowls", "Clay", "bowl", false),
  P("p12", "Dot planter", 95, "Planters", "Ink", "planter"),
];
const MIN = 0;
const MAX = 1000;

type F = {
  kinds: string[];
  colors: string[];
  lo: number;
  hi: number;
  stock: boolean;
  sort: "featured" | "low" | "high";
};
const EMPTY: F = {
  kinds: [],
  colors: [],
  lo: MIN,
  hi: MAX,
  stock: false,
  sort: "featured",
};
const apply = (ps: DrawerProduct[], f: F) => {
  const out = ps.filter(
    (p) =>
      (!f.kinds.length || f.kinds.includes(p.kind)) &&
      (!f.colors.length || f.colors.includes(p.color)) &&
      p.price >= f.lo &&
      p.price <= f.hi &&
      (!f.stock || p.inStock),
  );
  if (f.sort === "low") out.sort((a, b) => a.price - b.price);
  if (f.sort === "high") out.sort((a, b) => b.price - a.price);
  return out;
};
const countOn = (f: F) =>
  f.kinds.length +
  f.colors.length +
  (f.lo > MIN || f.hi < MAX ? 1 : 0) +
  (f.stock ? 1 : 0) +
  (f.sort !== "featured" ? 1 : 0);

/**
 * A filters drawer that behaves like a real sheet of glass laid over the page.
 *
 * On a wide card it slides in from the right edge; on a narrow one it rises from the bottom with two resting heights
 * (half and full), and you can drag it between them or flick it away, its speed carrying through. While it's open
 * the page behind sinks back, a little smaller and darker with its corners rounding, exactly as far as the drawer is
 * open, so dragging the sheet drags the page with it. Every change inside applies live: the grid behind reflows to
 * match, and the button's count rolls. A two-thumb price range, kinds, colours, in stock, and sorting; Reset clears
 * them. Escape or the scrim closes it, focus stays inside while it's open and returns to the button after.
 * Give each product an `image` to show its photo; without one, each piece is drawn in SVG.
 *   <FilterDrawer products={products} />
 */
export default function FilterDrawer({
  products = CERAMICS,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: FilterDrawerProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const [f, setF] = useState<F>(EMPTY);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState({ w: 720, h: 520 });
  const shown = useMemo(() => apply(products, f), [products, f]);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const bottom = size.w < 560;
  const cols = size.w < 420 ? 2 : size.w < 640 ? 3 : 4;

  // how far the sheet is out of its resting place: 0 is fully closed, 1 fully open (its own size, either axis)
  const SW = Math.min(372, size.w - 40);
  const FULL = size.h - 56; // a bottom sheet's full height
  const HALF = Math.min(FULL, size.h * 0.58);
  const pos = useMotionValue(bottom ? 0 : SW); // the sheet's translate: px from fully open toward closed
  const span = bottom ? FULL : SW;
  const progress = useTransform(pos, (v) => Math.max(0, Math.min(1, 1 - v / span)));
  const pageScale = useTransform(progress, [0, 1], [1, 0.93]);
  const pageRadius = useTransform(progress, [0, 1], [0, 22]);
  const pageY = useTransform(progress, [0, 1], [0, bottom ? 10 : 0]);
  // the page also goes slightly out of focus, as the eye moves to the glass in front of it
  const pageBlur = useTransform(progress, (v) =>
    v < 0.01 ? "none" : `blur(${(v * 2.2).toFixed(2)}px) saturate(${1 - v * 0.15})`,
  );
  const scrim = useTransform(progress, [0, 1], [0, 0.38]);
  // the footer rides up with the sheet so its button stays at the visible edge, at any height
  const footY = useTransform(pos, (v) => (bottom ? -Math.max(0, v) : 0));
  const shadowV = useTransform(
    progress,
    (v) => `0 0 0 .5px rgba(0,0,0,.08), 0 30px 80px -20px rgba(0,0,0,${0.45 * v})`,
  );

  const restFor = (which: "closed" | "half" | "full") =>
    bottom ? (which === "closed" ? FULL + 20 : which === "half" ? FULL - HALF : 0) : which === "closed" ? SW + 24 : 0;
  const glide = (to: number, velocity = 0) =>
    animate(
      pos,
      to,
      reduce
        ? { duration: 0 }
        : {
            type: "spring",
            stiffness: 340,
            damping: 34,
            velocity,
            restDelta: 0.5,
          },
    );
  // start closed, and keep the rest position right if the card resizes
  useLayoutEffect(() => {
    if (!open) pos.set(restFor("closed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottom, SW, FULL, HALF]);

  // the demo opens and closes it without moving anyone's focus
  const openSheet = (moveFocus = true) => {
    if (moveFocus) touched.current = true;
    setOpen(true);
    glide(restFor(bottom ? "half" : "full"));
    sfx.whoosh(400, 1400, { dur: 0.35, gain: 0.04 });
    if (moveFocus)
      setTimeout(
        () => sheetRef.current?.querySelector<HTMLElement>("button, input")?.focus({ preventScroll: true }),
        reduce ? 0 : 280,
      );
  };
  const closeSheet = (v = 0, moveFocus = true) => {
    glide(restFor("closed"), v).then(() => setOpen(false));
    sfx.whoosh(1300, 400, { dur: 0.3, gain: 0.035 });
    if (moveFocus) setTimeout(() => btnRef.current?.focus({ preventScroll: true }), 50);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const v = bottom ? info.velocity.y : info.velocity.x;
    const now = pos.get();
    if (!bottom) {
      if (v > 500 || now > SW * 0.45) closeSheet(v);
      else glide(0, v);
      return;
    }
    // project where a flick would carry it, then rest at the nearest height
    const projected = now + v * 0.18;
    const rests = [restFor("full"), restFor("half"), restFor("closed")];
    const to = rests.reduce((a, b) => (Math.abs(b - projected) < Math.abs(a - projected) ? b : a));
    if (to === restFor("closed")) closeSheet(v);
    else {
      glide(to, v);
      sfx.tick({ freq: to === 0 ? 2600 : 2000, gain: 0.04 });
    }
  };
  const onDrag = (_: unknown, info: PanInfo) => {
    const d = bottom ? info.delta.y : info.delta.x;
    let next = pos.get() + d;
    // past fully open it resists, like a rubber band
    if (next < 0) next = pos.get() + d * 0.25;
    pos.set(Math.max(-40, next));
  };

  // keep focus inside while it's open; Escape closes
  const onSheetKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeSheet();
      return;
    }
    if (e.key !== "Tab") return;
    const els = [
      ...(sheetRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input, [tabindex='0']") ?? []),
    ];
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const toggle = (k: "kinds" | "colors", v: string) => {
    setF((x) => ({
      ...x,
      [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v],
    }));
    sfx.tick({ freq: 2400, gain: 0.04 });
  };

  // ------------------------------------------------------------ autoplay
  const ap = useRef({ openSheet, closeSheet, toggle, setF, glide, restFor });
  ap.current = { openSheet, closeSheet, toggle, setF, glide, restFor };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (alive) {
        await sleep(1400);
        if (!ok()) break;
        ap.current.openSheet(false);
        await sleep(900);
        if (!ok()) break;
        ap.current.toggle("kinds", "Vases");
        await sleep(700);
        if (!ok()) break;
        ap.current.toggle("kinds", "Bowls");
        await sleep(700);
        if (!ok()) break;
        ap.current.setF((x) => ({ ...x, hi: 700 }));
        await sleep(800);
        if (!ok()) break;
        ap.current.toggle("colors", "Oat");
        await sleep(900);
        if (!ok()) break;
        if (bottomRef.current) {
          ap.current.glide(ap.current.restFor("full"));
          await sleep(900);
        }
        ap.current.closeSheet(0, false);
        await sleep(2400);
        if (!ok()) break;
        ap.current.setF(EMPTY);
        await sleep(1200);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);
  const bottomRef = useRef(bottom);
  bottomRef.current = bottom;

  const n = countOn(f);
  // the applied filters, as chips that each take themselves off
  const chips: { key: string; label: string; off: () => void }[] = [
    ...f.kinds.map((k) => ({
      key: "k" + k,
      label: k,
      off: () => toggle("kinds", k),
    })),
    ...(f.lo > MIN || f.hi < MAX
      ? [
          {
            key: "price",
            label: f.lo <= MIN ? `Under $${f.hi}` : f.hi >= MAX ? `Over $${f.lo}` : `$${f.lo} to $${f.hi}`,
            off: () => setF((x) => ({ ...x, lo: MIN, hi: MAX })),
          },
        ]
      : []),
    ...f.colors.map((c) => ({
      key: "c" + c,
      label: c,
      off: () => toggle("colors", c),
    })),
    ...(f.stock
      ? [
          {
            key: "stock",
            label: "In stock",
            off: () => setF((x) => ({ ...x, stock: false })),
          },
        ]
      : []),
    ...(f.sort !== "featured"
      ? [
          {
            key: "sort",
            label: f.sort === "low" ? "Price, low first" : "Price, high first",
            off: () => setF((x) => ({ ...x, sort: "featured" as const })),
          },
        ]
      : []),
  ];
  const font = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
  };

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={(e) => e.isTrusted && (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
      // focusing something the card clips would scroll the card itself; it never should
      onScroll={(e) => {
        e.currentTarget.scrollTop = 0;
        e.currentTarget.scrollLeft = 0;
      }}
      className={`relative h-[540px] w-full max-w-[860px] overflow-hidden rounded-[28px] bg-[#1d1d1f] text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.35)] ${className}`}
      style={font}
    >
      {/* the page, which sinks back as the drawer opens */}
      <motion.div
        className="absolute inset-0 overflow-hidden bg-[#f6f4f0]"
        style={{
          scale: pageScale,
          borderRadius: pageRadius,
          y: pageY,
          filter: pageBlur,
          transformOrigin: bottom ? "50% 0%" : "0% 50%",
        }}
        aria-hidden={open}
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
          <div className="min-w-0">
            <h3 className="text-[19px] font-semibold tracking-[-0.02em]">Ceramics</h3>
            <p className="text-[12.5px] text-[#6e6e73]">
              <Count n={shown.length} reduce={reduce} /> of {products.length} pieces
            </p>
          </div>
          <button
            ref={btnRef}
            type="button"
            onClick={() => openSheet()}
            aria-haspopup="dialog"
            aria-expanded={open}
            tabIndex={open ? -1 : 0}
            className="relative flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,.08),0_2px_6px_-2px_rgba(0,0,0,.12)] outline-none transition hover:shadow-[0_0_0_1px_rgba(0,0,0,.12),0_4px_10px_-4px_rgba(0,0,0,.2)] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
          >
            <Ico d={I.filter} size={15} />
            Filters
            <AnimatePresence initial={false}>
              {n > 0 && (
                <motion.span
                  className="grid h-5 min-w-[20px] place-items-center rounded-full bg-[#0071e3] px-1.5 text-[11.5px] font-semibold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 24 }}
                >
                  <Count n={n} reduce={reduce} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
        <div className="h-[calc(100%-76px)] overflow-y-auto px-5 pb-5 [scrollbar-width:thin]">
          <motion.div
            layout={!reduce}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {shown.map((p) => (
                <motion.div
                  key={p.id}
                  layout={reduce ? false : "position"}
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          scale: 0.85,
                          transition: { duration: 0.18 },
                        }
                  }
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="rounded-[18px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,.04)]"
                >
                  <div
                    className="relative aspect-square overflow-hidden rounded-[13px]"
                    style={{
                      background: "radial-gradient(120% 90% at 25% 0%, #fbf9f5 0%, #efeae2 55%, #e2dbd0 100%)",
                    }}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        draggable={false}
                        decoding="async"
                        className="absolute inset-0 h-full w-full select-none object-cover"
                      />
                    ) : (
                      <>
                        {/* a studio sweep: the wall curving into the floor */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-[34%]"
                          style={{
                            background: "linear-gradient(180deg, rgba(0,0,0,0), rgba(120,100,80,.08))",
                          }}
                        />
                        <Pot
                          shape={(p as DrawerProduct & { shape?: Shape }).shape ?? KIND_SHAPE[p.kind]}
                          glaze={p.hue[0]}
                          speckle={p.color === "Oat" || p.color === "Clay"}
                          seed={p.id}
                        />
                      </>
                    )}
                    {/* a hairline inside the edge, so a white photo still reads as a card */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[13px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)]"
                    />
                    {!p.inStock && (
                      <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-[1px] text-[10.5px] font-medium text-[#6e6e73]">
                        Sold out
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate px-1 text-[12.5px] font-medium">{p.name}</p>
                  <p className="px-1 pb-0.5 text-[12px] tabular-nums text-[#6e6e73]">${p.price}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {shown.length === 0 && (
            <div className="pt-16 text-center">
              <p className="text-[15px] font-semibold">Nothing matches</p>
              <p className="mt-1 text-[13px] text-[#6e6e73]">Try a wider price range, or fewer filters.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* the scrim */}
      {open && (
        <motion.button
          type="button"
          tabIndex={-1}
          aria-label="Close filters"
          onClick={() => closeSheet()}
          className="absolute inset-0 z-10 cursor-default bg-black"
          style={{ opacity: scrim }}
        />
      )}

      {/* the drawer */}
      <motion.div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-hidden={!open}
        onKeyDown={onSheetKey}
        onFocus={(e) => {
          // tabbing to a control below a half-height sheet's edge raises the sheet to full height
          if (!bottom || !rootRef.current || pos.get() <= 1 || !(e.target as HTMLElement).matches(":focus-visible"))
            return;
          const r = (e.target as HTMLElement).getBoundingClientRect();
          if (r.bottom > rootRef.current.getBoundingClientRect().bottom - 84) glide(restFor("full"));
        }}
        className={`absolute z-20 flex flex-col overflow-hidden bg-[#fbfaf7]/[0.97] backdrop-blur-2xl backdrop-saturate-150 ${bottom ? "inset-x-0 bottom-0 rounded-t-[28px]" : "bottom-3 right-3 top-3 rounded-[26px]"}`}
        style={{
          ...(bottom
            ? {
                y: pos,
                height: FULL + 40,
                paddingBottom: 40,
                marginBottom: -40,
              }
            : { x: pos, width: SW }),
          boxShadow: shadowV,
          visibility: open ? "visible" : "hidden",
        }}
      >
        {/* a lit top edge, as on a pane of glass */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        />
        {/* the grip: drag here (or anywhere on the header) */}
        <Grip bottom={bottom} pos={pos} onDrag={onDrag} onDragEnd={onDragEnd} reduce={reduce} />
        <div className={`flex items-start justify-between gap-3 px-6 ${bottom ? "pt-1" : "pt-6"}`}>
          <div>
            <h4 className="text-[21px] font-semibold leading-tight tracking-[-0.025em]">Filters</h4>
            <p className="mt-0.5 text-[13px] text-[#6e6e73]">
              <Count n={shown.length} reduce={reduce} /> of {products.length} pieces
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => closeSheet()}
            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/[0.05] text-[#3a3a3c] outline-none transition hover:bg-black/[0.09] focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/50"
          >
            <Ico d={I.close} size={13} />
          </button>
        </div>

        {/* what's applied, each one a chip that takes itself off */}
        <motion.div
          layout={reduce ? false : "size"}
          className="px-6"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        >
          <div className={`flex flex-wrap gap-1.5 ${chips.length ? "pt-3.5" : ""}`}>
            <AnimatePresence initial={false} mode="popLayout">
              {chips.map((c) => (
                <motion.button
                  key={c.key}
                  layout={!reduce}
                  type="button"
                  onClick={c.off}
                  aria-label={`Remove ${c.label}`}
                  initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          scale: 0.7,
                          transition: { duration: 0.14 },
                        }
                  }
                  transition={{ type: "spring", stiffness: 600, damping: 32 }}
                  className="flex h-7 items-center gap-1.5 rounded-full bg-[#1d1d1f] pl-3 pr-2 text-[12px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/40 focus-visible:ring-offset-2"
                >
                  {c.label}
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-white/20">
                    <Ico d={I.close} size={8} />
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="relative min-h-0 flex-1">
          <div
            className="h-full overflow-y-auto px-6 pb-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              maskImage: "linear-gradient(180deg, transparent 0, #000 14px, #000 calc(100% - 22px), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(180deg, transparent 0, #000 14px, #000 calc(100% - 22px), transparent 100%)",
            }}
          >
            <Section
              title="Price"
              meta={f.lo <= MIN && f.hi >= MAX ? "Any price" : `$${f.lo} to ${f.hi >= MAX ? `$${MAX}+` : `$${f.hi}`}`}
            >
              <Range
                lo={f.lo}
                hi={f.hi}
                prices={products.map((p) => p.price)}
                onChange={(lo, hi) => setF((x) => ({ ...x, lo, hi }))}
                reduce={reduce}
                uid={uid}
                tick={() => sfx.tick({ freq: 3200, gain: 0.015 })}
              />
            </Section>
            <Section title="Kind" meta={f.kinds.length ? `${f.kinds.length} chosen` : "All kinds"}>
              <div className="grid grid-cols-2 gap-2">
                {KINDS.map((k) => {
                  const on = f.kinds.includes(k);
                  const pic = products.find((p) => p.kind === k && p.image)?.image;
                  const cnt = apply(products, { ...f, kinds: [k] }).length;
                  return (
                    <motion.button
                      key={k}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle("kinds", k)}
                      whileTap={reduce ? undefined : { scale: 0.96 }}
                      className={`relative flex items-center gap-2.5 rounded-[16px] p-1.5 pr-3 text-left outline-none transition-[background-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/50 ${on ? "bg-white shadow-[0_0_0_1.5px_#1d1d1f,0_8px_18px_-10px_rgba(0,0,0,.35)]" : "bg-black/[0.035] hover:bg-black/[0.06]"}`}
                    >
                      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[11px] bg-[#efebe4] text-[#8a7f70]">
                        {pic ? (
                          <img src={pic} alt="" draggable={false} className="h-full w-full object-cover" />
                        ) : (
                          <Silhouette shape={KIND_SHAPE[k]} />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-semibold leading-tight">{k}</span>
                        <span className="block text-[11.5px] tabular-nums text-[#6e6e73]">
                          {cnt === 1 ? "1 piece" : `${cnt} pieces`}
                        </span>
                      </span>
                      <AnimatePresence>
                        {on && (
                          <motion.span
                            initial={reduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 700,
                              damping: 24,
                            }}
                            className="absolute -right-1 -top-1 grid h-[18px] w-[18px] place-items-center rounded-full bg-[#1d1d1f] text-white shadow-[0_0_0_2px_#fbfaf7]"
                          >
                            <Ico d={I.check} size={10} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </Section>
            <Section title="Glaze" meta={f.colors.length ? f.colors.join(", ") : "Any glaze"}>
              <div className="flex justify-between">
                {COLORS.map((c) => {
                  const on = f.colors.includes(c.id);
                  const cnt = apply(products, { ...f, colors: [c.id] }).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${c.id}, ${cnt} pieces`}
                      onClick={() => toggle("colors", c.id)}
                      className="group flex flex-col items-center gap-2 rounded-[12px] px-1 pt-1 outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/50"
                    >
                      <motion.span
                        className="grid h-12 w-12 place-items-center rounded-full"
                        style={{
                          // a glazed disc: lit from the top left, a pooled darker rim, a hard wet highlight
                          background: `radial-gradient(circle at 33% 27%, rgba(255,255,255,.5) 0 5%, rgba(255,255,255,0) 19%), radial-gradient(circle at 50% 42%, ${tone(c.c, 1.12)} 0%, ${c.c} 52%, ${tone(c.c, 0.72)} 100%)`,
                          color: c.id === "Ink" ? "#fff" : "#1d1d1f",
                        }}
                        animate={{
                          boxShadow: on
                            ? `0 0 0 2.5px #fbfaf7, 0 0 0 4px #1d1d1f, 0 6px 14px -6px ${tone(c.c, 0.5)}`
                            : `inset 0 0 0 .5px rgba(0,0,0,.12), 0 4px 10px -6px ${tone(c.c, 0.5)}`,
                        }}
                        whileTap={reduce ? undefined : { scale: 0.92 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AnimatePresence>
                          {on && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 20,
                              }}
                            >
                              <Ico d={I.check} size={15} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.span>
                      <span className={`text-[12px] ${on ? "font-semibold text-[#1d1d1f]" : "text-[#6e6e73]"}`}>
                        {c.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>
            <Section title="Sort by">
              <div
                role="radiogroup"
                aria-label="Sort"
                className="relative flex rounded-[13px] bg-black/[0.045] p-[3px]"
              >
                {(
                  [
                    ["featured", "Featured"],
                    ["low", "Price, low"],
                    ["high", "Price, high"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    role="radio"
                    aria-checked={f.sort === id}
                    onClick={() => setF((x) => ({ ...x, sort: id }))}
                    className={`relative z-0 flex-1 rounded-[10px] py-2 text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/50 ${f.sort === id ? "text-[#1d1d1f]" : "text-[#6e6e73] hover:text-[#1d1d1f]"}`}
                  >
                    {f.sort === id && (
                      <motion.span
                        layoutId={reduce ? undefined : `${uid}-sort`}
                        className="absolute inset-0 -z-10 rounded-[10px] bg-white shadow-[0_1px_2px_rgba(0,0,0,.1),0_3px_8px_-4px_rgba(0,0,0,.2)]"
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 38,
                        }}
                      />
                    )}
                    {label}
                  </button>
                ))}
              </div>
            </Section>
            <div className="flex items-center justify-between pt-4">
              <span>
                <span className="block text-[14px] font-semibold">In stock only</span>
                <span className="block text-[12px] text-[#6e6e73]">Hide pieces that have sold out</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={f.stock}
                aria-label="In stock only"
                onClick={() => {
                  setF((x) => ({ ...x, stock: !x.stock }));
                  sfx.tick({ freq: f.stock ? 1800 : 2800, gain: 0.05 });
                }}
                className={`relative h-[30px] w-[50px] shrink-0 rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/50 focus-visible:ring-offset-2 ${f.stock ? "bg-[#1d1d1f]" : "bg-black/[0.12]"}`}
              >
                <motion.span
                  className="absolute top-[2px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,.2)]"
                  animate={{ left: f.stock ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 600, damping: 32 }}
                />
              </button>
            </div>
          </div>
        </div>

        <motion.div
          className="relative z-10 flex items-center gap-3 border-t border-black/[0.06] bg-[#fbfaf7] px-5 py-4"
          style={{ y: footY }}
        >
          <button
            type="button"
            disabled={n === 0}
            onClick={() => {
              setF(EMPTY);
              sfx.note(523, { dur: 0.2, gain: 0.04 });
            }}
            className="h-12 shrink-0 rounded-[14px] px-3 text-[14px] font-semibold text-[#1d1d1f] underline decoration-black/25 underline-offset-4 outline-none transition hover:decoration-black/60 disabled:text-[#b8b8bd] disabled:no-underline focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/50"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => closeSheet()}
            style={{
              background: "linear-gradient(180deg, #3a3a3d 0%, #1d1d1f 60%, #121214 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.16), 0 1px 2px rgba(0,0,0,.3), 0 12px 24px -12px rgba(0,0,0,.6)",
            }}
            className="h-12 flex-1 rounded-[14px] text-[15px] font-semibold text-white outline-none transition hover:brightness-125 focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/50 focus-visible:ring-offset-2"
            aria-live="polite"
          >
            {shown.length === 0 ? (
              "No pieces match"
            ) : (
              <>
                Show <Count n={shown.length} reduce={reduce} /> {shown.length === 1 ? "piece" : "pieces"}
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** the drag handle: a pill on a bottom sheet, a thin bar down the left edge of a side drawer */
function Grip({
  bottom,
  pos,
  onDrag,
  onDragEnd,
  reduce,
}: {
  bottom: boolean;
  pos: MotionValue<number>;
  onDrag: (e: unknown, i: PanInfo) => void;
  onDragEnd: (e: unknown, i: PanInfo) => void;
  reduce: boolean;
}) {
  const start = useRef<{
    x: number;
    y: number;
    t: number;
    lx: number;
    ly: number;
    vx: number;
    vy: number;
  } | null>(null);
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      lx: e.clientX,
      ly: e.clientY,
      vx: 0,
      vy: 0,
    };
    void pos;
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    const now = performance.now();
    const dt = Math.max(1, now - s.t) / 1000;
    const dx = e.clientX - s.lx;
    const dy = e.clientY - s.ly;
    s.vx = s.vx * 0.6 + (dx / dt) * 0.4;
    s.vy = s.vy * 0.6 + (dy / dt) * 0.4;
    s.lx = e.clientX;
    s.ly = e.clientY;
    s.t = now;
    onDrag(e, {
      delta: { x: dx, y: dy },
      offset: { x: e.clientX - s.x, y: e.clientY - s.y },
      velocity: { x: s.vx, y: s.vy },
      point: { x: e.clientX, y: e.clientY },
    } as PanInfo);
  };
  const up = (e: RPointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    start.current = null;
    // a pause before letting go means no flick
    const stale = performance.now() - s.t > 90;
    onDragEnd(e, {
      delta: { x: 0, y: 0 },
      offset: { x: e.clientX - s.x, y: e.clientY - s.y },
      velocity: { x: stale ? 0 : s.vx, y: stale ? 0 : s.vy },
      point: { x: e.clientX, y: e.clientY },
    } as PanInfo);
  };
  return bottom ? (
    <div
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      aria-hidden="true"
      data-grip
    >
      <span className="h-[5px] w-10 rounded-full bg-black/[0.18]" />
    </div>
  ) : (
    <div
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="absolute -left-3 bottom-0 top-0 z-10 flex w-6 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      aria-hidden="true"
      data-grip
    >
      <span className="h-12 w-[5px] rounded-full bg-white/70 shadow-[0_0_0_.5px_rgba(0,0,0,.15)]" />
    </div>
  );
}

function Section({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <section className="border-b border-black/[0.06] py-5 first:pt-3">
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <h5 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h5>
        {meta && <span className="truncate text-[12.5px] tabular-nums text-[#86868b]">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

/** a two-thumb price range over a curve of how the pieces are spread across prices; inside the range the curve is ink */
function Range({
  lo,
  hi,
  prices,
  onChange,
  reduce,
  uid,
  tick,
}: {
  lo: number;
  hi: number;
  prices: number[];
  onChange: (lo: number, hi: number) => void;
  reduce: boolean;
  uid: string;
  tick: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<"lo" | "hi" | null>(null);
  const val = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return Math.round((Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * (MAX - MIN) + MIN) / 10) * 10;
  };
  const set = (which: "lo" | "hi", v: number) => {
    if (which === "lo") {
      const n = Math.min(v, hi - 50);
      if (n !== lo) tick();
      onChange(Math.max(MIN, n), hi);
    } else {
      const n = Math.max(v, lo + 50);
      if (n !== hi) tick();
      onChange(lo, Math.min(MAX, n));
    }
  };
  const fl = ((lo - MIN) / (MAX - MIN)) * 100;
  const fh = ((hi - MIN) / (MAX - MIN)) * 100;
  const key = (which: "lo" | "hi") => (e: RKeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 100 : 10;
    const cur = which === "lo" ? lo : hi;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") set(which, cur + step);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") set(which, cur - step);
    else if (e.key === "Home") set(which, MIN);
    else if (e.key === "End") set(which, MAX);
    else return;
    e.preventDefault();
  };
  // a smoothed density of the prices (a little gaussian per piece), as an area path in a 100 by 40 box
  const area = useMemo(() => {
    const N = 64;
    const bw = 0.06;
    const ys = Array.from({ length: N + 1 }, (_, i) => {
      const x = i / N;
      return prices.reduce(
        (s, p) => s + Math.exp(-(((Math.min(p, MAX) - MIN) / (MAX - MIN) - x) ** 2) / (2 * bw * bw)),
        0,
      );
    });
    const m = Math.max(...ys, 1e-6);
    const pts = ys.map((y, i) => [(i / N) * 100, 40 - 4 - (y / m) * 32] as const);
    let d = `M0,40 L${pts[0][0]},${pts[0][1].toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(2)},${y0.toFixed(2)} ${cx.toFixed(2)},${y1.toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)}`;
    }
    return d + " L100,40 Z";
  }, [prices]);
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 700, damping: 45 };
  return (
    <div>
      <div
        ref={track}
        className="relative h-[64px] touch-none"
        onPointerDown={(e) => {
          const v = val(e.clientX);
          drag.current = Math.abs(v - lo) < Math.abs(v - hi) ? "lo" : "hi";
          e.currentTarget.setPointerCapture(e.pointerId);
          set(drag.current, v);
        }}
        onPointerMove={(e) => drag.current && set(drag.current, val(e.clientX))}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-[13px] h-[44px] w-full"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={`${uid}-in`}>
              <motion.rect
                y="0"
                height="40"
                initial={false}
                animate={{ x: fl, width: Math.max(0, fh - fl) }}
                transition={spring}
              />
            </clipPath>
            <linearGradient id={`${uid}-ink`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1d1d1f" stopOpacity=".78" />
              <stop offset="1" stopColor="#1d1d1f" stopOpacity=".4" />
            </linearGradient>
          </defs>
          <path d={area} fill="rgba(0,0,0,.08)" />
          <path d={area} fill={`url(#${uid}-ink)`} clipPath={`url(#${uid}-in)`} />
        </svg>
        <div className="absolute inset-x-0 bottom-[12px] h-[2px] rounded-full bg-black/[0.1]" />
        <motion.div
          className="absolute bottom-[12px] h-[2px] rounded-full bg-[#1d1d1f]"
          initial={false}
          animate={{ left: `${fl}%`, width: `${fh - fl}%` }}
          transition={spring}
        />
        {(["lo", "hi"] as const).map((w) => (
          <motion.div
            key={w}
            role="slider"
            tabIndex={0}
            id={`${uid}-${w}`}
            aria-label={w === "lo" ? "Lowest price" : "Highest price"}
            aria-valuemin={MIN}
            aria-valuemax={MAX}
            aria-valuenow={w === "lo" ? lo : hi}
            aria-valuetext={`$${w === "lo" ? lo : hi}`}
            onKeyDown={key(w)}
            className="absolute bottom-0 grid h-[26px] w-[26px] place-items-center rounded-full bg-white outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/50 focus-visible:ring-offset-2"
            style={{
              x: "-50%",
              boxShadow: "0 0 0 .5px rgba(0,0,0,.14), 0 1px 2px rgba(0,0,0,.12), 0 6px 14px -6px rgba(0,0,0,.4)",
            }}
            initial={false}
            animate={{ left: `${w === "lo" ? fl : fh}%` }}
            whileTap={reduce ? undefined : { scale: 1.12 }}
            transition={spring}
          >
            <span className="h-[9px] w-[9px] rounded-full bg-[#1d1d1f]" />
          </motion.div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(["lo", "hi"] as const).map((w) => (
          <label key={w} htmlFor={`${uid}-${w}`} className="rounded-[12px] bg-black/[0.035] px-3 py-2">
            <span className="block text-[11px] text-[#6e6e73]">{w === "lo" ? "Minimum" : "Maximum"}</span>
            <span className="block text-[15px] font-semibold tabular-nums tracking-[-0.01em]">
              {w === "lo" ? `$${lo}` : hi >= MAX ? `$${MAX}+` : `$${hi}`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Count({ n, reduce }: { n: number; reduce: boolean }) {
  const [shown, setShown] = useState(n);
  const from = useRef(n);
  useEffect(() => {
    if (reduce) {
      setShown(n);
      from.current = n;
      return;
    }
    const a = animate(from.current, n, {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    from.current = n;
    return () => a.stop();
  }, [n, reduce]);
  return <span className="tabular-nums">{shown}</span>;
}

// ---------------------------------------------------------------- the ceramics

const hexRgb = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const tone = (h: string, k: number) => {
  const c = hexRgb(h).map((v) => Math.round(k >= 1 ? v + (255 - v) * (k - 1) : v * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
// a pot's profile, top to bottom: [height 0..1, radius 0..1]
const PROFILE: Record<Shape, { h: number; w: number; pts: [number, number][] }> = {
  vase: {
    h: 0.78,
    w: 0.66,
    pts: [
      [0, 0.42],
      [0.04, 0.4],
      [0.12, 0.5],
      [0.3, 0.86],
      [0.5, 1],
      [0.7, 0.92],
      [0.88, 0.66],
      [0.97, 0.5],
      [1, 0.48],
    ],
  },
  bud: {
    h: 0.82,
    w: 0.38,
    pts: [
      [0, 0.36],
      [0.05, 0.3],
      [0.3, 0.32],
      [0.55, 0.62],
      [0.75, 0.9],
      [0.9, 0.86],
      [0.98, 0.66],
      [1, 0.62],
    ],
  },
  amphora: {
    h: 0.82,
    w: 0.52,
    pts: [
      [0, 0.46],
      [0.05, 0.4],
      [0.16, 0.36],
      [0.32, 0.78],
      [0.5, 1],
      [0.7, 0.86],
      [0.88, 0.5],
      [0.97, 0.36],
      [1, 0.34],
    ],
  },
  bowl: {
    h: 0.36,
    w: 0.86,
    pts: [
      [0, 1],
      [0.25, 0.97],
      [0.55, 0.84],
      [0.8, 0.6],
      [0.95, 0.4],
      [1, 0.38],
    ],
  },
  cup: {
    h: 0.42,
    w: 0.5,
    pts: [
      [0, 1],
      [0.5, 0.97],
      [0.85, 0.9],
      [1, 0.82],
    ],
  },
  planter: {
    h: 0.5,
    w: 0.62,
    pts: [
      [0, 1],
      [0.08, 1],
      [0.1, 0.94],
      [0.7, 0.86],
      [1, 0.8],
    ],
  },
};
function smooth(pts: [number, number][], cx: number, top: number, H: number, W: number, side: 1 | -1) {
  // a Catmull-Rom curve through the profile, for one side
  const P = pts.map(([t, r]) => [cx + side * r * W, top + t * H] as [number, number]);
  let d = "";
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[Math.min(P.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return { d, P };
}
function bodyPath(shape: Shape, cx: number, top: number, H: number, W: number) {
  const pr = PROFILE[shape];
  const R = smooth(pr.pts, cx, top, H, W, 1);
  const L = smooth([...pr.pts].reverse(), cx, top, H, W, -1);
  const r0 = R.P[0];
  const b = R.P[R.P.length - 1];
  const lb = L.P[0];
  // the foot is a shallow arc, as a round base seen from a little above
  return `M${r0[0]} ${r0[1]}${R.d}Q${cx} ${b[1] + H * 0.045} ${lb[0]} ${lb[1]}${L.d}Z`;
}

/** a glazed pot, drawn as a round object: shaded across like a cylinder, lit from the upper left, sitting on the floor */
function Pot({ shape, glaze, speckle, seed }: { shape: Shape; glaze: string; speckle: boolean; seed: string }) {
  const id = `pot${seed}`;
  const pr = PROFILE[shape];
  const H = 100 * pr.h;
  const W = 50 * pr.w;
  const cx = 50;
  const base = 104;
  const top = base - H;
  const rimR = pr.pts[0][1] * W;
  const footR = pr.pts[pr.pts.length - 1][1] * W;
  const d = bodyPath(shape, cx, top, H, W);
  const dark = glaze === "#2c3242";
  const dots = useMemo(() => {
    if (!speckle) return [];
    let a = [...seed].reduce((x, c) => x * 31 + c.charCodeAt(0), 7) >>> 0;
    const r = () => (a = (a * 1664525 + 1013904223) >>> 0) / 4294967296;
    return Array.from({ length: 70 }, () => [cx - W + r() * W * 2, top + r() * H, 0.25 + r() * 0.55] as const);
  }, [speckle, seed, W, H, top]);
  return (
    <svg viewBox="0 0 100 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}x`} x1={cx - W} x2={cx + W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={tone(glaze, dark ? 0.55 : 0.6)} />
          <stop offset="0.16" stopColor={tone(glaze, 0.9)} />
          <stop offset="0.34" stopColor={tone(glaze, dark ? 1.28 : 1.18)} />
          <stop offset="0.5" stopColor={tone(glaze, 1.02)} />
          <stop offset="0.8" stopColor={tone(glaze, 0.78)} />
          <stop offset="0.93" stopColor={tone(glaze, 0.62)} />
          <stop offset="1" stopColor={tone(glaze, 0.72)} />
        </linearGradient>
        <linearGradient id={`${id}y`} x1="0" x2="0" y1={top} y2={base} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".28" />
        </linearGradient>
        <radialGradient id={`${id}o`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={tone(glaze, 0.2)} />
          <stop offset="1" stopColor={tone(glaze, 0.5)} />
        </radialGradient>
        <linearGradient id={`${id}in`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={tone(glaze, 0.55)} />
          <stop offset="1" stopColor={tone(glaze, 1.1)} />
        </linearGradient>
        <radialGradient id={`${id}sh`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3a2a1a" stopOpacity=".38" />
          <stop offset="0.6" stopColor="#3a2a1a" stopOpacity=".12" />
          <stop offset="1" stopColor="#3a2a1a" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}b`} x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
      </defs>
      {/* where it meets the floor: a soft pool, and a tight dark line of contact */}
      <ellipse cx={cx + 6} cy={base + 2} rx={footR * 2 + 10} ry={5} fill={`url(#${id}sh)`} />
      <ellipse
        cx={cx + 1}
        cy={base + 0.6}
        rx={footR * 1.05}
        ry={1.6}
        fill="#2a1d12"
        opacity=".35"
        filter={`url(#${id}b)`}
      />
      {shape === "cup" && (
        <path
          d={`M${cx + W * 0.92} ${top + H * 0.22} C ${cx + W * 1.55} ${top + H * 0.18}, ${cx + W * 1.6} ${top + H * 0.78}, ${cx + W * 0.88} ${top + H * 0.74}`}
          fill="none"
          stroke={tone(glaze, 0.72)}
          strokeWidth={W * 0.2}
          strokeLinecap="round"
        />
      )}
      <path d={d} fill={`url(#${id}x)`} />
      <g clipPath={`url(#${id}c)`}>
        <rect x="0" y={top} width="100" height={H + 6} fill={`url(#${id}y)`} />
        {dots.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={tone(glaze, 0.45)} opacity=".55" />
        ))}
        {/* the window, reflected in the glaze: a soft vertical streak, and a sharper one inside it */}
        <rect
          x={cx - W * 0.52}
          y={top - 4}
          width={W * 0.2}
          height={H + 8}
          fill="#fff"
          opacity={dark ? 0.32 : 0.42}
          filter={`url(#${id}b)`}
        />
        <rect
          x={cx - W * 0.46}
          y={top + H * 0.08}
          width={W * 0.05}
          height={H * 0.7}
          rx={W * 0.025}
          fill="#fff"
          opacity={dark ? 0.55 : 0.6}
        />
        {/* the glaze thins at the foot, showing the raw clay */}
        {shape !== "bowl" && (
          <rect
            x="0"
            y={base - H * 0.07}
            width="100"
            height={H * 0.1}
            fill={dark ? "#6b5a4a" : "#b89f84"}
            opacity=".55"
          />
        )}
      </g>
      {/* the rim and the dark of the opening */}
      {shape === "bowl" ? (
        <>
          <ellipse cx={cx} cy={top} rx={rimR} ry={rimR * 0.2} fill={tone(glaze, 1.05)} />
          <ellipse cx={cx} cy={top + 0.6} rx={rimR * 0.94} ry={rimR * 0.17} fill={`url(#${id}in)`} />
        </>
      ) : (
        <>
          <ellipse cx={cx} cy={top} rx={rimR} ry={Math.max(1.4, rimR * 0.22)} fill={tone(glaze, 1.15)} />
          <ellipse cx={cx} cy={top + 0.3} rx={rimR * 0.82} ry={Math.max(1, rimR * 0.17)} fill={`url(#${id}o)`} />
        </>
      )}
      {shape === "planter" && (
        <g>
          {[
            [-0.55, -1.3, -28],
            [-0.2, -1.6, -8],
            [0.15, -1.75, 6],
            [0.45, -1.4, 22],
            [0.7, -1.05, 40],
            [-0.8, -0.95, -42],
          ].map(([dx, h, rot], i) => (
            <path
              key={i}
              d={`M0 0 C ${-4} ${h * 12}, ${-2} ${h * 26}, 0 ${h * 34} C 2 ${h * 26}, 4 ${h * 12}, 0 0Z`}
              transform={`translate(${cx + dx * rimR * 0.6} ${top}) rotate(${rot})`}
              fill={i % 2 ? "#4f7a46" : "#5f8f52"}
              opacity=".95"
            />
          ))}
        </g>
      )}
    </svg>
  );
}

/** the kind, as a small solid outline for the filter chips */
function Silhouette({ shape }: { shape: Shape }) {
  const pr = PROFILE[shape];
  const H = 14 * pr.h;
  const W = 7 * pr.w;
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ display: "block" }}>
      <path d={bodyPath(shape, 7, 13.5 - H, H, W)} fill="currentColor" />
    </svg>
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

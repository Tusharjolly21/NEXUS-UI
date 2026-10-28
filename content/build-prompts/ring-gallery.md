# Ring Gallery

Add the "Ring Gallery" component from Nexus UI to my project.

A ring of photos standing on edge like the leaves of a turbine. Scroll, swipe or drag and it spins, glides and settles; move around it and the camera tilts and swings with your hand. Hover a photo and it rises out of the ring into the corner with its title, click it and that photo grows into a full entry page with links to the previous and next entry. Pure CSS 3D with spring-eased motion, keyboard control, and sounds that follow the ring: a tick per card, a thud as it settles, a whoosh as it spins in.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` and `@/lib/ui-sounds-pro` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
5. Use it like this: `import { RingGallery } from "@/components/ring-gallery";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/ring-gallery/index.ts ---

```ts
export { RingGallery } from "./ring-gallery";
export type { RingGalleryProps, RingItem } from "./ring-gallery";
```

--- components/ring-gallery/ring-gallery.tsx ---

```tsx
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as RKeyboardEvent,
  type MouseEvent as RMouseEvent,
  type PointerEvent as RPointerEvent,
} from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useProSound, type ProSoundName } from "@/lib/ui-sounds-pro";

/** One photo in the ring. `src` can be a URL or a data: URI; without it a soft gradient plate is drawn. */
export interface RingItem {
  src?: string;
  title: string;
  date?: string;
  summary?: string;
  sections?: { heading: string; text?: string; bullets?: string[] }[];
  /** Index into the built-in gradient plates, used while a photo loads or when there is none. */
  tone?: number;
}

/* ------------------------------------------------------------------ the scene, in world units
   A camera 1000 up and 2000 back looks at the centre of a flat ring of cards that stand on edge.
   Everything below is converted to CSS pixels from the tile's size, so the proportions hold at any width. */
const CAM_H = 1000;
const CAM_D = 2000;
const FOV = 44; // vertical field of view, degrees
const PAR_X = 100; // pointer left/right swings the camera this far round the ring
const PAR_Y = 200; // pointer up/down raises or lowers the camera this much
const PAD = 0.12; // ring radius = (1 - 2 * PAD) / 2 of the shorter side
const CARD_W = 120;
const CARD_H = 90;
const CARD_R = 4;
const LIFT = 60; // a hovered card rises this much
const Y_POS = 100; // the ring floats this far above the point the camera looks at
const D0 = Math.hypot(CAM_H, CAM_D);
const TAN = Math.tan((FOV * Math.PI) / 360);
const F_DEN = 400 * Math.SQRT2 * 2 * Math.tan((75 * Math.PI) / 360);

/* ------------------------------------------------------------------ motion feel
   Nothing is animated with durations. Every frame each value moves a fixed share of the way to its target,
   so the ring glides, settles and never snaps (the shares are for 60 fps and are corrected for other rates). */
const ROT_EASE = 0.1;
const CAM_EASE = 0.08;
const LIFT_EASE = 0.1;
const WHEEL = 0.001; // radians of turn per pixel of wheel
const INTRO_TURNS = 2;
const INTRO_MS = 2000;
const HOVER_AFTER = 0.5; // radians of intro spin left before hover wakes up

/* ------------------------------------------------------------------ sound
   Sounds are tied to the ring's own motion, not to timers: a tick each time a card passes the front (louder
   the faster the ring turns, fewer when it is spinning too fast to count), a thud when it settles, a whoosh as
   the ring spins in, and a rising or falling whoosh as the entry page opens and closes. Nothing plays on hover. */
const TICK_GAP_MS = 38; // fastest the card ticks can follow each other (about 26 a second)

/** One card's place on the ring: its angle, out to the radius, up by the ring's height and its hover lift. */
function cardT(i: number, lift: number, gg: ReturnType<typeof geometry>, n: number) {
  return `rotateY(${((i * 360) / n).toFixed(3)}deg) translateZ(${gg.R.toFixed(2)}px) translateY(${(-gg.y - lift * gg.lift).toFixed(2)}px) rotateY(90deg)`;
}

function geometry(W: number, H: number, radius = 1, cardSize = 1) {
  const k = H / (2 * D0 * TAN); // css px per world unit at the ring
  const m = Math.min(W, H);
  const f = m / k / F_DEN;
  return {
    k,
    persp: D0 * k,
    R: (m / 2) * (1 - 2 * PAD) * radius,
    cw: CARD_W * f * k * cardSize,
    ch: CARD_H * f * k * cardSize,
    cr: CARD_R * f * k * cardSize,
    lift: LIFT * k,
    y: Y_POS * k,
  };
}

/** cubic-bezier(x1, y1, x2, y2) as a function of progress. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const u = 1 - t;
      const bx = 3 * x1 * t * u * u + 3 * x2 * t * t * u + t * t * t - x;
      if (Math.abs(bx) < 1e-5) break;
      const d = 3 * x1 * u * u + 6 * (x2 - x1) * t * u + 3 * (1 - x2) * t * t;
      t = Math.min(1, Math.max(0, t - bx / (d || 1e-6)));
    }
    const u = 1 - t;
    return 3 * y1 * t * u * u + 3 * y2 * t * t * u + t * t * t;
  };
}
const INTRO_EASE = bezier(0.44, 0, 0.56, 1);
const ease60 = (share: number, dt: number) => 1 - Math.pow(1 - share, dt * 60);

/* ------------------------------------------------------------------ placeholder plates */
const TONES: [string, string, string][] = [
  ["#ffb072", "#c7360d", "#2b0602"],
  ["#f2f2f2", "#48484a", "#111113"],
  ["#e4f2ff", "#7fb0d8", "#27506f"],
  ["#5fe0d2", "#0e4a47", "#031615"],
  ["#ffd6dd", "#e0496a", "#5a0f26"],
  ["#f7e9d2", "#c99a5b", "#4a3418"],
  ["#e4d0ff", "#8a5cf5", "#1e1048"],
  ["#c8e8b0", "#3c7a3a", "#0d2a14"],
  ["#eceef1", "#8d99a6", "#2a3138"],
  ["#ffeaa8", "#ff9f0a", "#5a2d00"],
  ["#c4d8ff", "#2f5fe0", "#0a1a55"],
  ["#ffd0bd", "#ff6b4a", "#6a1a0c"],
];
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .11 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
function plate(tone: number): string {
  const [a, b, c] = TONES[((tone % TONES.length) + TONES.length) % TONES.length];
  return `${GRAIN}, radial-gradient(90% 70% at 24% 18%, ${a} 0%, transparent 64%), radial-gradient(85% 90% at 84% 90%, ${b} 0%, transparent 62%), linear-gradient(155deg, ${c}, ${b})`;
}

const DEFAULT_ITEMS: RingItem[] = [
  { title: "Ember Study", date: "Oct 12, 2026", tone: 0, summary: "A long exposure of molten glass leaving the furnace, shot at the exact second it stopped glowing.", sections: [{ heading: "Behind the frame", text: "The glassblowers work in a 90 second window. Every shot in this set was taken inside it, handheld, with a single warm key light from the furnace door.", bullets: ["Shot on a 50mm at f/2", "Natural furnace light only", "Edited for warmth, never for colour"] }] },
  { title: "Monochrome Bloom", date: "Sep 28, 2026", tone: 1, summary: "Tulips against a charcoal sheet, lit from one side until the petals read like folded paper." },
  { title: "Open Water", date: "Sep 03, 2026", tone: 2, summary: "Mist, swell and a horizon that never quite settles, from the ferry crossing before sunrise.", sections: [{ heading: "Notes", text: "The slow shutter turns the swell into brushed metal. Two seconds was the sweet spot: any longer and the boat's own motion smeared the horizon." }] },
  { title: "Teal Hour", date: "Aug 19, 2026", tone: 3, summary: "The ten minutes after sunset when the city lights are on but the sky has not given up yet." },
  { title: "Rose Quartz", date: "Aug 02, 2026", tone: 4, summary: "Studio colour tests on seamless paper, with a pale gel on the back light." },
  { title: "Dune Light", date: "Jul 21, 2026", tone: 5, summary: "Low sun across a ridge line, shot at the moment the shadows turn blue." },
  { title: "Violet Static", date: "Jul 06, 2026", tone: 6, summary: "A neon sign through rain on glass, focused on the drops instead of the sign." },
  { title: "Fern Canopy", date: "Jun 14, 2026", tone: 7, summary: "Backlit leaves in a rainforest understory, one frame from a six hour walk." },
];

/* ------------------------------------------------------------------ helpers */
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Turn data: URIs into short blob: URLs so 120 <img> faces do not each carry megabytes of base64. */
function useBlobUrls(items: RingItem[]): (string | undefined)[] {
  const [urls, setUrls] = useState<(string | undefined)[]>([]);
  useEffect(() => {
    const made: string[] = [];
    const next = items.map((it) => {
      const s = it.src;
      if (!s) return undefined;
      if (!s.startsWith("data:")) return s;
      try {
        const comma = s.indexOf(",");
        const mime = s.slice(5, s.indexOf(";")) || "image/jpeg";
        const bin = atob(s.slice(comma + 1));
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const u = URL.createObjectURL(new Blob([bytes], { type: mime }));
        made.push(u);
        return u;
      } catch {
        return s;
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- blob: URLs only exist in the browser, so they are made after mount
    setUrls(next);
    return () => made.forEach((u) => URL.revokeObjectURL(u));
  }, [items]);
  return urls;
}

function Art({ tone, url, fade = true }: { tone: number; url?: string; fade?: boolean }) {
  return (
    <div className="absolute inset-0" style={{ background: plate(tone) }}>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- photos can be any URL or a data: URI, so next/image does not apply
        <img
          src={url}
          alt=""
          draggable={false}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={fade ? { animation: "ringfade .6s ease-out both" } : undefined}
        />
      )}
    </div>
  );
}


/**
 * RingGallery: a ring of photo cards standing on edge like the leaves of a turbine, seen from above.
 *
 * - The ring rests until you move it. Scroll, swipe or drag and it glides to the new angle and settles.
 * - The camera follows the pointer: move up and it rises over the ring, move down and it sinks to a flatter
 *   view, move left or right and it swings round the side. Every value eases a share of the way per frame,
 *   so the whole thing feels like it breathes with your hand.
 * - The card under the pointer lifts out of the ring and its photo and title appear in the top-left corner.
 *   Click it and that corner photo grows into the entry page; the links at the bottom step through entries.
 * - On load the ring spins in with two turns. Keyboard: focus it, arrows turn it a card at a time,
 *   Enter opens the front card, Esc closes, arrows inside an entry step through them.
 *
 * - Sound follows the motion: a tick as each card passes the front (louder the faster it turns), a thud when
 *   the ring settles, a whoosh as the ring spins in, and a rising or falling whoosh as an entry opens and
 *   closes. Nothing plays on hover. Off until the visitor switches site sound on; pass `enableSound={false}`
 *   to keep it silent.
 *
 * Pass `items` with your own photos. `autoplay` drifts the camera on its own until the first touch.
 * The wheel turns the ring while the pointer is over it (set `captureWheel={false}` to let the page scroll).
 */
export interface RingGalleryProps {
  items?: RingItem[];
  /** Cards in the ring. Defaults to the photos repeated to about 60. */
  count?: number;
  /** Drifts the camera on its own until the first touch. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Spin in with two turns the first time the ring scrolls into view. */
  intro?: boolean;
  /** Scrolling over the ring turns it and keeps the page still. Set false to turn it and still scroll the page. */
  captureWheel?: boolean;
  /** Set false to skip the built-in entry page and handle `onSelect` yourself. */
  detail?: boolean;
  onSelect?: (item: RingItem, index: number) => void;
  /** Size of the ring itself, 1 is the default. Smaller pulls the cards in, larger spreads them out. */
  radius?: number;
  /** Size of each card, 1 is the default. Bigger cards overlap more. */
  cardSize?: number;
  /** How far the ring turns for each scroll or drag, 1 is the default. */
  speed?: number;
  /** How long the ring keeps gliding after you let go, 1 is the default. Higher glides further. */
  glide?: number;
  /** How far the camera follows your pointer, 1 is the default and 0 keeps it still. */
  tilt?: number;
  /** Plays sounds that follow the ring's motion. They follow the visitor's sound switch (off until switched on on this site). */
  enableSound?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function RingGallery({
  items = DEFAULT_ITEMS,
  count,
  autoplay = false,
  intro = true,
  captureWheel = true,
  detail = true,
  radius = 1,
  cardSize = 1,
  speed = 1,
  glide = 1,
  tilt = 1,
  onSelect,
  enableSound = true,
  className = "",
}: RingGalleryProps) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const P = items.length;
  const N = clamp(Math.round(count ?? P * Math.max(1, Math.round(60 / P))), 12, 120);
  const urls = useBlobUrls(items);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touched = useRef(false);
  const live = useRef(true); // false while an entry page covers the ring
  const [box, setBox] = useState({ W: 1000, H: 560 });
  const [hover, setHover] = useState<number | null>(null); // item index shown in the corner
  const [open, setOpen] = useState<number | null>(null);
  const [firstOpen, setFirstOpen] = useState<number | null>(null); // the entry the corner photo grew into
  const returnFocus = useRef<HTMLElement | null>(null);

  const g = geometry(box.W, box.H, clamp(radius, 0.4, 1.3), clamp(cardSize, 0.4, 2));
  const G = useRef(g);
  const NR = useRef({ N, P });
  const opts = useRef({ autoplay, intro, reduce: !!reduce, tilt, glide, speed });

  // sounds: a real visitor uses play(), the autoplay camera uses play.auto() (silent until the page has been clicked)
  const play = useProSound(enableSound);
  const playRef = useRef(play);
  useLayoutEffect(() => {
    G.current = g;
    NR.current = { N, P };
    opts.current = { autoplay, intro, reduce: !!reduce, tilt: clamp(tilt, 0, 3), glide: clamp(glide, 0.25, 4), speed: clamp(speed, 0.2, 4) };
    playRef.current = play;
  });
  const sfx = useCallback((name: ProSoundName, volume?: number) => {
    if (typeof document !== "undefined" && document.hidden) return;
    const p = playRef.current;
    if (touched.current) p(name, volume);
    else p.auto(name, volume);
  }, []);

  /* engine state lives in a ref: nothing here re-renders React */
  const S = useRef({
    rot: 0, target: 0, spin: 0, spinT0: -1, started: false,
    cx: 0, cy: CAM_H, cz: CAM_D, px: 0, py: 0,
    x: 0, y: 0, inside: false, hasPtr: false,
    down: false, moved: false, downX: 0, lastX: 0,
    hovered: -1, kbCard: -1, coarse: false,
    lifts: new Float32Array(N),
    // sound: where the ring was last frame, how fast it is going, which card is at the front, how far this move has gone
    lastTurn: 0, speed: 0, front: -1, peak: 0, lastTick: 0,
  });

  /* size: the tile picks its own height from its width */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const W = Math.round(e.contentRect.width);
      const H = W < 640 ? Math.round(clamp(W * 1.25, 360, 520)) : Math.round(clamp(W * 0.56, 320, 800));
      setBox((b) => (b.W === W && b.H === H ? b : { W, H }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* the loop */
  useEffect(() => {
    const world = worldRef.current;
    const root = rootRef.current;
    if (!world || !root) return;
    const s = S.current;
    s.coarse = window.matchMedia("(pointer: coarse)").matches;
    let vis = false;
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
      if (vis && !s.started) {
        s.started = true;
        if (opts.current.intro && !opts.current.reduce) {
          s.spin = INTRO_TURNS * Math.PI * 2;
          s.spinT0 = performance.now();
          sfx("ring-spool", 0.8); // swells and fades with the spin's own speed, so it ends as the ring comes to rest
        }
      }
    }, { threshold: 0.2 });
    io.observe(root);
    let raf = 0;
    let last = performance.now();
    let cursor = "";
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!vis || !live.current) return;
      const gg = G.current;
      const { N: n, P: p } = NR.current;
      const o = opts.current;

      // intro: two turns that ease out to rest
      if (s.spinT0 >= 0) {
        const t = (now - s.spinT0) / INTRO_MS;
        s.spin = t >= 1 ? 0 : (1 - INTRO_EASE(t)) * INTRO_TURNS * Math.PI * 2;
        if (t >= 1) s.spinT0 = -1;
      }
      // autoplay: a slow imaginary hand moves the camera until someone touches it
      if (o.autoplay && !touched.current && !o.reduce) {
        const tt = now / 1000;
        s.px = Math.sin(tt * 0.42) * 0.6;
        s.py = Math.sin(tt * 0.29 + 1.2) * 0.55;
      }

      s.rot += (s.target - s.rot) * ease60(Math.max(0.012, ROT_EASE / o.glide), dt);
      const par = o.reduce ? 0 : o.tilt;
      const kc = ease60(CAM_EASE, dt);
      s.cx += (-s.px * PAR_X * par - s.cx) * kc;
      s.cy += (CAM_H + s.py * PAR_Y * par - s.cy) * kc;
      s.cz += (CAM_D + Math.abs(s.px) * PAR_X * par - s.cz) * kc;

      // the camera, as one transform on the world: push back, look down, swing round, then the ring's own turn
      const yaw = Math.atan2(s.cx, s.cz);
      const pitch = Math.atan2(s.cy, Math.hypot(s.cx, s.cz));
      const dist = Math.hypot(s.cx, s.cy, s.cz) * gg.k;
      const turn = s.rot + s.spin;

      // sound, from the ring's actual motion: one tick per card that passes the front, a thud when it settles
      const step = (Math.PI * 2) / n;
      s.speed += ((Math.abs(turn - s.lastTurn) / Math.max(dt, 0.004)) - s.speed) * 0.25;
      s.lastTurn = turn;
      const front = ((Math.round(-turn / step) % n) + n) % n;
      if (front !== s.front) {
        if (s.front >= 0 && now - s.lastTick >= TICK_GAP_MS) {
          s.lastTick = now;
          sfx("ring-tick", Math.min(0.9, 0.3 + s.speed * 0.16));
        }
        s.front = front;
      }
      const away = Math.abs(s.target - s.rot) + Math.abs(s.spin);
      s.peak = Math.max(s.peak, away);
      if (s.peak > step * 0.9 && away < 0.0015 && !s.down) {
        sfx("ring-settle", Math.min(0.8, 0.35 + s.peak * 0.2));
        s.peak = 0;
      }

      world.style.transform = `translateZ(${(gg.persp - dist).toFixed(2)}px) rotateX(${((-pitch * 180) / Math.PI).toFixed(3)}deg) rotateY(${((-yaw * 180) / Math.PI).toFixed(3)}deg) rotateY(${((turn * 180) / Math.PI).toFixed(3)}deg)`;

      // which card is under the pointer, checked every frame so a card lifts even when the ring slides under a still hand
      let h = -1;
      if (Math.abs(s.spin) < HOVER_AFTER && !(s.down && s.moved)) {
        if (s.kbCard >= 0) h = s.kbCard;
        else if (s.coarse) {
          let best = -Infinity;
          for (let i = 0; i < n; i++) {
            const c = Math.cos((i / n) * Math.PI * 2 + turn - yaw);
            if (c > best) { best = c; h = i; }
          }
        } else if (s.hasPtr && s.inside) {
          const el = document.elementFromPoint(s.x, s.y);
          const card = el && (el as HTMLElement).closest ? (el as HTMLElement).closest<HTMLElement>("[data-ri]") : null;
          if (card && root.contains(card)) h = Number(card.dataset.ri);
        }
      }
      if (h !== s.hovered) {
        s.hovered = h;
        setHover(h >= 0 ? h % p : null);
      }
      const want = h >= 0 && !s.coarse ? "pointer" : "";
      if (want !== cursor) { cursor = want; root.style.cursor = want; }

      // lifts
      const kl = ease60(LIFT_EASE, dt);
      if (s.lifts.length !== n) s.lifts = new Float32Array(n);
      const L = s.lifts;
      for (let i = 0; i < n; i++) {
        const tgt = i === h ? 1 : 0;
        let v = L[i];
        if (v === 0 && tgt === 0) continue;
        v += (tgt - v) * kl;
        if (Math.abs(tgt - v) < 0.002) v = tgt;
        L[i] = v;
        const c = cardRefs.current[i];
        if (c) c.style.transform = cardT(i, v, gg, n);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [sfx]);

  /* pointer: tracked on the window, like the original, so the camera keeps following your hand */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const s = S.current;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      if (r.width === 0) return;
      s.x = e.clientX; s.y = e.clientY; s.hasPtr = true;
      s.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (e.pointerType !== "touch") {
        if (s.inside) touched.current = true;
        if (touched.current || !opts.current.autoplay) {
          s.px = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
          s.py = clamp(-(((e.clientY - r.top) / r.height) * 2 - 1), -1, 1);
        }
      }
      if (s.down) {
        s.target += ((e.clientX - s.lastX) / Math.max(r.width, 1)) * Math.PI * 2 * opts.current.speed;
        s.lastX = e.clientX;
        if (Math.abs(e.clientX - s.downX) > 6) s.moved = true;
      }
    };
    const onUp = () => { s.down = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  /* wheel: scroll down turns the front of the ring to the left, a sideways swipe follows your fingers */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!live.current) return;
      touched.current = true;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
      if (captureWheel && e.cancelable) e.preventDefault();
      S.current.kbCard = -1;
      S.current.target -= clamp(d, -400, 400) * WHEEL * opts.current.speed;
    };
    el.addEventListener("wheel", onWheel, { passive: !captureWheel });
    return () => el.removeEventListener("wheel", onWheel);
  }, [captureWheel]);

  const select = useCallback((card: number) => {
    const idx = card % P;
    onSelect?.(items[idx], idx);
    if (!detail) return;
    setFirstOpen(idx);
    returnFocus.current = stageRef.current;
    live.current = false;
    S.current.hovered = -1;
    sfx("ring-open", 0.7);
    setOpen(idx);
  }, [P, detail, items, onSelect, sfx]);

  const close = useCallback(() => {
    live.current = true;
    sfx("ring-close", 0.6);
    setOpen(null);
    setHover(null);
    setTimeout(() => returnFocus.current?.focus({ preventScroll: true }), 0);
  }, [sfx]);

  /** stepping between entries in the entry page: a short flick that rises going forward and falls going back */
  const stepEntry = useCallback((dir: 1 | -1) => sfx(dir === 1 ? "ring-next" : "ring-prev", 0.5), [sfx]);

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const s = S.current;
    s.down = true; s.moved = false; s.downX = e.clientX; s.lastX = e.clientX;
    s.kbCard = -1;
  };
  const onClick = (e: RMouseEvent<HTMLDivElement>) => {
    if (S.current.moved) return;
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-ri]");
    if (card) select(Number(card.dataset.ri));
    else if (S.current.hovered >= 0) select(S.current.hovered);
  };

  /** the card nearest the viewer for a given ring angle */
  const frontOf = (turn: number) => ((Math.round(-turn / ((Math.PI * 2) / N)) % N) + N) % N;

  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const s = S.current;
    const step = (Math.PI * 2) / N;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      touched.current = true;
      s.target = Math.round(s.target / step) * step + (e.key === "ArrowRight" ? -step : step);
      s.kbCard = frontOf(s.target);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(s.kbCard >= 0 ? s.kbCard : frontOf(s.target));
    }
  };

  const narrow = box.W < 640;
  const pvW = narrow ? 104 : Math.round(clamp(box.W * 0.16, 120, 240));
  const pvH = Math.round((pvW * 170) / 240);
  const showing = open === null && hover !== null ? items[hover] : null;

  return (
    <LayoutGroup id={uid}>
      <style>{`@keyframes ringfade{from{opacity:0}to{opacity:1}}`}</style>
      <div
        ref={rootRef}
        className={`relative isolate w-full select-none overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
        style={{ height: box.H, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
      >
        <div
          ref={stageRef}
          data-ringstage=""
          role="group"
          aria-roledescription="carousel"
          aria-label="Photo ring. Arrow keys turn it, Enter opens the front photo."
          tabIndex={open === null ? 0 : -1}
          onKeyDown={onKey}
          onBlur={() => { S.current.kbCard = -1; }}
          onPointerDown={onDown}
          onClick={onClick}
          className="absolute inset-0 rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3]"
          style={{ touchAction: "pan-y", perspective: g.persp, perspectiveOrigin: "50% 50%" }}
        >
          <div ref={worldRef} className="absolute left-1/2 top-1/2" style={{ width: 0, height: 0, transformStyle: "preserve-3d", willChange: "transform" }}>
            {Array.from({ length: N }, (_, i) => {
              const idx = i % P;
              return (
                <div
                  key={i}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  data-ri={i}
                  aria-hidden="true"
                  className="absolute overflow-hidden bg-white"
                  style={{ left: -g.cw / 2, top: -g.ch / 2, width: g.cw, height: g.ch, borderRadius: g.cr, transform: cardT(i, 0, g, N) }}
                >
                  <Art tone={items[idx].tone ?? idx} url={urls[idx]} />
                </div>
              );
            })}
          </div>
        </div>

        {/* the hovered photo, docked top-left */}
        {showing && hover !== null && (
          <div className="pointer-events-none absolute z-10" style={{ left: narrow ? 14 : 20, top: narrow ? 14 : 20, width: pvW }} aria-live="polite">
            <motion.div layoutId="ring-hero" transition={{ layout: { type: "spring", stiffness: 210, damping: 28 } }} className="relative overflow-hidden" style={{ width: pvW, height: pvH, borderRadius: 2 }}>
              <Art tone={items[hover].tone ?? hover} url={urls[hover]} fade={false} />
            </motion.div>
            <p className="m-0 truncate font-semibold leading-none tracking-[-0.03em] text-[#1d1d1f]" style={{ marginTop: narrow ? 8 : 10, fontSize: narrow ? 12 : pvW >= 200 ? 14 : 13 }}>{showing.title}</p>
          </div>
        )}

        <p className="pointer-events-none absolute bottom-3.5 left-0 right-0 z-10 m-0 px-4 text-center text-[12px] text-[#86868b]" aria-hidden="true">
          {narrow ? "Swipe to turn. Tap a photo to open." : "Scroll or drag to turn. Move around it to tilt, click a photo to open."}
        </p>

        <AnimatePresence>
          {open !== null && (
            <Entry key="entry" items={items} urls={urls} idx={open} firstIdx={firstOpen} setIdx={setOpen} onStep={stepEntry} onClose={close} />
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

/* ------------------------------------------------------------------ entry page */
function Entry({ items, urls, idx, firstIdx, setIdx, onStep, onClose }: { items: RingItem[]; urls: (string | undefined)[]; idx: number; firstIdx: number | null; setIdx: (i: number) => void; onStep: (dir: 1 | -1) => void; onClose: () => void }) {
  const P = items.length;
  const it = items[idx];
  const prev = (idx - 1 + P) % P;
  const next = (idx + 1) % P;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => { ref.current?.scrollTo({ top: 0 }); }, [idx]);
  const go = (i: number, dir: 1 | -1) => { onStep(dir); setIdx(i); };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") { e.stopPropagation(); onClose(); }
    else if (e.key === "ArrowRight" && P > 1) go(next, 1);
    else if (e.key === "ArrowLeft" && P > 1) go(prev, -1);
  };
  const link = "inline-flex max-w-[46%] items-center gap-1 truncate rounded-md px-1 py-0.5 text-[14px] font-medium text-[#0071e3] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#0071e3]";
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={it.title}
      tabIndex={-1}
      onKeyDown={onKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="absolute inset-0 z-20 overflow-y-auto overscroll-contain bg-white outline-none"
    >
      <button type="button" onClick={onClose} className="absolute left-4 top-4 z-10 inline-flex h-8 items-center gap-1 rounded-full bg-[#f5f5f7] pl-2.5 pr-3.5 text-[13px] font-medium text-[#1d1d1f] outline-none hover:bg-[#ebebed] focus-visible:ring-2 focus-visible:ring-[#0071e3]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        Gallery
      </button>
      <AnimatePresence mode="wait" initial={false}>
        <motion.article key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }} transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }} className="mx-auto flex w-full max-w-[572px] flex-col items-stretch px-5 pb-12 pt-[72px]">
          <h2 className="m-0 text-center text-[clamp(26px,5vw,36px)] font-bold leading-[1.1] tracking-[-0.035em] text-[#1d1d1f]">{it.title}</h2>
          {it.date && <p className="m-0 mt-2 text-center text-[13px] text-[#86868b] tabular-nums">{it.date}</p>}
          <motion.div
            layoutId={idx === firstIdx ? "ring-hero" : undefined}
            transition={{ layout: { type: "spring", stiffness: 210, damping: 28 } }}
            className="relative mt-7 w-full overflow-hidden"
            style={{ aspectRatio: "572 / 326", borderRadius: 20 }}
          >
            <Art tone={it.tone ?? idx} url={urls[idx]} fade={false} />
          </motion.div>
          <div className="mx-auto mt-9 flex w-full max-w-[490px] flex-col gap-5 text-left">
            {it.summary && <p className="m-0 text-[17px] leading-[1.5] tracking-[-0.01em] text-[#1d1d1f]">{it.summary}</p>}
            {it.sections?.map((s) => (
              <section key={s.heading} className="flex flex-col gap-2">
                <h3 className="m-0 text-[14px] font-semibold text-[#1d1d1f]">{s.heading}</h3>
                {s.text && <p className="m-0 text-[14px] leading-[1.6] text-[#6e6e73]">{s.text}</p>}
                {s.bullets && (
                  <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-[14px] leading-[1.55] text-[#6e6e73]">
                    {s.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                )}
              </section>
            ))}
            {P > 1 && (
              <nav aria-label="More entries" className="mt-6 flex items-center justify-between gap-4">
                <button type="button" onClick={() => go(prev, -1)} className={link}><span aria-hidden="true">‹</span><span className="truncate">{items[prev].title}</span></button>
                <button type="button" onClick={() => go(next, 1)} className={link}><span className="truncate">{items[next].title}</span><span aria-hidden="true">›</span></button>
              </nav>
            )}
          </div>
        </motion.article>
      </AnimatePresence>
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

--- lib/ui-sounds-pro.ts ---

```ts
/**
 * The Nexus UI Pro sound pack: 39 more interface sounds in six sets (Glass, Paper and wood,
 * Arcade, Studio, Devices, Gallery), made the same way as the free ones, from oscillators and filtered noise with the
 * Web Audio API. No audio files. It builds on `@/lib/ui-sounds`, which installs with it, and follows
 * the same on/off switch.
 *
 *   import { playProSound } from "@/lib/ui-sounds-pro";
 *   <button onClick={() => playProSound("glass-chime")}>Done</button>
 *
 * In a component with an `enableSound` option:
 *
 *   const play = useProSound(enableSound);
 *   play("coin");
 */

import * as React from "react";
import { audioAwake, hiss, playDef, tone, useAutoplaySoundAllowed, type SoundDef } from "@/lib/ui-sounds";

export type ProSoundCategory = "Glass" | "Paper and wood" | "Arcade" | "Studio" | "Devices" | "Gallery";
type ProDef = SoundDef & { category: ProSoundCategory };

export const PRO_SOUNDS = {
  // Glass: small, bright, with a ring that fades.
  "glass-tap": { category: "Glass", label: "Glass tap", play: (c, o) => { tone(c, o, { freq: 2400, to: 2200, decay: 0.06, gain: 0.2 }); tone(c, o, { freq: 3600, decay: 0.04, gain: 0.08 }); hiss(c, o, { freq: 6500, decay: 0.012, gain: 0.08, filter: "highpass" }); } },
  "glass-chime": { category: "Glass", label: "Glass chime", play: (c, o) => [1, 2.32, 4.25].forEach((m, i) => tone(c, o, { freq: 1320 * m, decay: 1.0 / (i + 1), gain: 0.16 / (i + 1) })) },
  "glass-ping": { category: "Glass", label: "Glass ping", play: (c, o) => { tone(c, o, { freq: 2093, decay: 1.1, gain: 0.14 }); tone(c, o, { freq: 3136, decay: 0.6, gain: 0.06 }); } },
  "glass-open": { category: "Glass", label: "Glass open", play: (c, o) => { tone(c, o, { freq: 1568, decay: 0.16, gain: 0.14 }); tone(c, o, { at: 0.07, freq: 2093, decay: 0.2, gain: 0.14 }); tone(c, o, { at: 0.14, freq: 2637, decay: 0.45, gain: 0.12 }); hiss(c, o, { at: 0.05, attack: 0.06, decay: 0.16, freq: 5000, to: 9000, gain: 0.04, filter: "highpass" }); } },
  "glass-close": { category: "Glass", label: "Glass close", play: (c, o) => { tone(c, o, { freq: 2637, decay: 0.14, gain: 0.12 }); tone(c, o, { at: 0.07, freq: 2093, decay: 0.16, gain: 0.12 }); tone(c, o, { at: 0.14, freq: 1568, decay: 0.4, gain: 0.12 }); } },
  "glass-clink": { category: "Glass", label: "Clink", play: (c, o) => { tone(c, o, { freq: 3136, decay: 0.28, gain: 0.12 }); tone(c, o, { at: 0.018, freq: 3520, decay: 0.22, gain: 0.1 }); hiss(c, o, { freq: 7000, decay: 0.01, gain: 0.1, filter: "highpass" }); } },

  // Paper and wood: dry, close and physical.
  "paper-flip": { category: "Paper and wood", label: "Page flip", play: (c, o) => { hiss(c, o, { attack: 0.012, decay: 0.09, freq: 3600, to: 1500, gain: 0.16, q: 0.9 }); hiss(c, o, { at: 0.075, attack: 0.008, decay: 0.05, freq: 2600, to: 1800, gain: 0.08, q: 0.9 }); } },
  "paper-crumple": { category: "Paper and wood", label: "Crumple", play: (c, o) => [[0, 3200], [0.028, 4400], [0.05, 2600], [0.085, 5000], [0.115, 3000], [0.15, 4200], [0.19, 2800]].forEach(([at, f], i) => hiss(c, o, { at, attack: 0.002, decay: 0.03 + (i % 3) * 0.01, freq: f, gain: 0.22, q: 2.4 })) },
  "paper-tear": { category: "Paper and wood", label: "Tear", play: (c, o) => { hiss(c, o, { attack: 0.02, decay: 0.24, freq: 1800, to: 5200, gain: 0.13, filter: "highpass", q: 0.7 }); [0.02, 0.06, 0.1, 0.15, 0.2].forEach((at) => hiss(c, o, { at, attack: 0.002, decay: 0.02, freq: 4200, gain: 0.08, q: 3 })); } },
  "wood-tap": { category: "Paper and wood", label: "Wood tap", play: (c, o) => { tone(c, o, { freq: 520, to: 300, decay: 0.07, gain: 0.32, type: "triangle" }); hiss(c, o, { freq: 1200, decay: 0.02, gain: 0.14, q: 3 }); } },
  "wood-block": { category: "Paper and wood", label: "Wood block", play: (c, o) => { tone(c, o, { freq: 880, decay: 0.12, gain: 0.28, type: "triangle" }); tone(c, o, { freq: 1320, decay: 0.06, gain: 0.1 }); hiss(c, o, { freq: 2400, decay: 0.012, gain: 0.1, q: 2 }); } },
  "wood-drop": { category: "Paper and wood", label: "Wood drop", play: (c, o) => { tone(c, o, { freq: 220, to: 120, decay: 0.14, gain: 0.42 }); hiss(c, o, { freq: 700, decay: 0.06, gain: 0.16, filter: "lowpass" }); tone(c, o, { at: 0.15, freq: 240, to: 150, decay: 0.08, gain: 0.2 }); } },

  // Arcade: square waves and quick arpeggios.
  coin: { category: "Arcade", label: "Coin", play: (c, o) => { tone(c, o, { freq: 988, decay: 0.07, gain: 0.12, type: "square" }); tone(c, o, { at: 0.07, freq: 1319, decay: 0.3, gain: 0.12, type: "square" }); } },
  "power-up": { category: "Arcade", label: "Power up", play: (c, o) => [392, 523, 659, 784, 1047].forEach((f, i) => tone(c, o, { at: i * 0.05, freq: f, decay: 0.12, gain: 0.1, type: "square" })) },
  blip: { category: "Arcade", label: "Blip", play: (c, o) => tone(c, o, { freq: 660, decay: 0.05, gain: 0.12, type: "square" }) },
  laser: { category: "Arcade", label: "Laser", play: (c, o) => tone(c, o, { freq: 1800, to: 200, glide: 0.18, decay: 0.18, gain: 0.1, type: "square" }) },
  "level-up": { category: "Arcade", label: "Level up", play: (c, o) => { [523, 659, 784, 1047].forEach((f, i) => tone(c, o, { at: i * 0.09, freq: f, decay: 0.12, gain: 0.1, type: "triangle" })); tone(c, o, { at: 0.36, freq: 1319, decay: 0.5, gain: 0.1, type: "triangle" }); } },
  "game-over": { category: "Arcade", label: "Game over", play: (c, o) => { [392, 370, 349, 330].forEach((f, i) => tone(c, o, { at: i * 0.17, freq: f, decay: 0.16, gain: 0.1, type: "square" })); tone(c, o, { at: 0.7, freq: 165, decay: 0.55, gain: 0.12, type: "square" }); } },

  // Studio: bigger moments with a tail.
  riser: { category: "Studio", label: "Riser", play: (c, o) => { hiss(c, o, { attack: 0.5, decay: 0.12, freq: 300, to: 6000, gain: 0.14, q: 0.8 }); tone(c, o, { freq: 110, to: 440, glide: 0.6, attack: 0.5, decay: 0.15, gain: 0.07, type: "sawtooth" }); } },
  impact: { category: "Studio", label: "Impact", play: (c, o) => { tone(c, o, { freq: 70, to: 35, glide: 0.35, decay: 0.45, gain: 0.55 }); hiss(c, o, { freq: 500, decay: 0.25, gain: 0.25, filter: "lowpass" }); } },
  sparkle: { category: "Studio", label: "Sparkle", play: (c, o) => [[0, 4000], [0.04, 5200], [0.075, 6200], [0.12, 4800], [0.16, 6800]].forEach(([at, f]) => tone(c, o, { at, freq: f, decay: 0.16, gain: 0.08 })) },
  "confetti-pop": { category: "Studio", label: "Confetti pop", play: (c, o) => { hiss(c, o, { freq: 1200, decay: 0.09, gain: 0.26, filter: "highpass" }); tone(c, o, { freq: 220, to: 90, decay: 0.08, gain: 0.3 }); [0.06, 0.1, 0.15].forEach((at, i) => tone(c, o, { at, freq: 3600 + i * 700, decay: 0.12, gain: 0.04 })); } },
  fanfare: { category: "Studio", label: "Fanfare", play: (c, o) => [[0, [523, 659, 784]], [0.12, [587, 740, 880]], [0.24, [659, 784, 1047]]].forEach(([at, notes]) => (notes as number[]).forEach((f) => tone(c, o, { at: at as number, freq: f, decay: 0.5, gain: 0.07, type: "triangle" }))) },
  swell: { category: "Studio", label: "Swell", play: (c, o) => [196, 247, 294, 392].forEach((f) => tone(c, o, { freq: f, attack: 0.5, decay: 1.2, gain: 0.05 })) },

  // Devices: scanners, readers, relays and machines. Short, dry and a little electronic.
  "scan-sweep": { category: "Devices", label: "Scan sweep", play: (c, o) => { hiss(c, o, { attack: 0.06, decay: 0.3, freq: 600, to: 3800, gain: 0.1, q: 1.6 }); tone(c, o, { freq: 420, to: 1250, glide: 0.38, attack: 0.05, decay: 0.12, gain: 0.05, type: "triangle" }); } },
  "card-insert": { category: "Devices", label: "Card insert", play: (c, o) => { hiss(c, o, { attack: 0.02, decay: 0.13, freq: 1800, to: 500, gain: 0.14, q: 1.2 }); tone(c, o, { at: 0.12, freq: 150, to: 90, decay: 0.07, gain: 0.3 }); hiss(c, o, { at: 0.12, freq: 3200, decay: 0.012, gain: 0.16, filter: "highpass" }); } },
  "access-granted": { category: "Devices", label: "Access granted", play: (c, o) => { tone(c, o, { freq: 988, decay: 0.09, gain: 0.14, type: "triangle" }); tone(c, o, { at: 0.1, freq: 1480, decay: 0.26, gain: 0.14, type: "triangle" }); } },
  "access-denied": { category: "Devices", label: "Access denied", play: (c, o) => { tone(c, o, { freq: 196, decay: 0.13, gain: 0.15, type: "square" }); tone(c, o, { at: 0.16, freq: 165, decay: 0.24, gain: 0.15, type: "square" }); } },
  "relay-click": { category: "Devices", label: "Relay click", play: (c, o) => { hiss(c, o, { freq: 2800, decay: 0.008, gain: 0.3, filter: "highpass" }); tone(c, o, { freq: 1800, to: 700, decay: 0.02, gain: 0.12 }); tone(c, o, { at: 0.015, freq: 120, decay: 0.05, gain: 0.24 }); } },
  bloop: { category: "Devices", label: "Bloop", play: (c, o) => { tone(c, o, { freq: 300, to: 720, glide: 0.09, decay: 0.12, gain: 0.3 }); tone(c, o, { at: 0.05, freq: 640, to: 1200, glide: 0.05, decay: 0.06, gain: 0.1 }); } },
  crumble: { category: "Devices", label: "Crumble", play: (c, o) => { [[0, 2400], [0.03, 1900], [0.07, 2600], [0.1, 1500], [0.15, 2100], [0.19, 1200], [0.26, 1700], [0.31, 900]].forEach(([at, f]) => hiss(c, o, { at, attack: 0.002, decay: 0.035, freq: f, gain: 0.12, q: 2 })); tone(c, o, { freq: 95, to: 60, decay: 0.22, gain: 0.12 }); } },
  pour: { category: "Devices", label: "Pour", play: (c, o) => { hiss(c, o, { attack: 0.04, decay: 0.5, freq: 3000, to: 1600, gain: 0.09, q: 1.2 }); hiss(c, o, { at: 0.08, attack: 0.05, decay: 0.4, freq: 5200, gain: 0.05, filter: "highpass" }); } },

  // Gallery: a ring of photo cards. Light, papery and airy, with a soft glass edge. They are written to follow the
  // motion of the Ring Gallery: a tick for each card that passes, a thud when the ring settles, a whoosh that swells
  // and fades with the speed of the spin-in. None plays on hover.
  "ring-tick": { category: "Gallery", label: "Ring tick", play: (c, o) => { const j = 0.94 + Math.random() * 0.12; hiss(c, o, { freq: 3800 * j, decay: 0.013, gain: 0.36, q: 3.2 }); tone(c, o, { freq: 1300 * j, to: 920 * j, decay: 0.03, gain: 0.17, type: "triangle" }); } },
  "ring-settle": { category: "Gallery", label: "Ring settle", play: (c, o) => { tone(c, o, { freq: 150, to: 92, glide: 0.1, decay: 0.16, gain: 0.28 }); hiss(c, o, { freq: 700, decay: 0.06, gain: 0.1, filter: "lowpass" }); tone(c, o, { at: 0.01, freq: 2093, decay: 0.5, gain: 0.035 }); } },
  "ring-spool": { category: "Gallery", label: "Ring spool", length: 2.2, play: (c, o) => {
    // Two seconds shaped like the spin it goes with: slow, fastest in the middle, slow again. A band of air opens as
    // the ring picks up speed and closes as it slows, with a low whine that rises and falls the same way.
    const t0 = c.currentTime, T = 2, K = 64;
    const bell = (k: number) => Math.pow(Math.sin((Math.PI * k) / (K - 1)), 1.6);
    const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const air = c.createBufferSource();
    air.buffer = buf;
    air.loop = true;
    const band = c.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.9;
    band.frequency.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 260 * Math.pow(10, bell(k))), t0, T);
    const ag = c.createGain();
    ag.gain.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 0.0001 + 0.15 * bell(k)), t0, T);
    air.connect(band).connect(ag).connect(o);
    air.start(t0);
    air.stop(t0 + T + 0.05);
    const whine = c.createOscillator();
    whine.type = "triangle";
    whine.frequency.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 90 * Math.pow(3.8, bell(k))), t0, T);
    const wg = c.createGain();
    wg.gain.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 0.0001 + 0.06 * bell(k) * bell(k)), t0, T);
    whine.connect(wg).connect(o);
    whine.start(t0);
    whine.stop(t0 + T + 0.05);
  } },
  "ring-open": { category: "Gallery", label: "Entry open", play: (c, o) => { hiss(c, o, { attack: 0.12, decay: 0.22, freq: 500, to: 3200, gain: 0.1, q: 0.9 }); tone(c, o, { freq: 196, to: 130, glide: 0.14, attack: 0.01, decay: 0.28, gain: 0.2 }); tone(c, o, { at: 0.2, freq: 1568, decay: 0.5, gain: 0.07 }); tone(c, o, { at: 0.24, freq: 2349, decay: 0.55, gain: 0.05 }); } },
  "ring-close": { category: "Gallery", label: "Entry close", play: (c, o) => { tone(c, o, { freq: 2349, decay: 0.25, gain: 0.05 }); tone(c, o, { at: 0.06, freq: 1568, decay: 0.3, gain: 0.07 }); hiss(c, o, { at: 0.02, attack: 0.06, decay: 0.22, freq: 3200, to: 500, gain: 0.09, q: 0.9 }); tone(c, o, { at: 0.22, freq: 170, to: 110, glide: 0.1, decay: 0.22, gain: 0.18 }); } },
  "ring-next": { category: "Gallery", label: "Next entry", play: (c, o) => { hiss(c, o, { attack: 0.01, decay: 0.08, freq: 2200, to: 4200, gain: 0.18, q: 0.9 }); tone(c, o, { freq: 740, to: 988, glide: 0.07, decay: 0.09, gain: 0.13, type: "triangle" }); } },
  "ring-prev": { category: "Gallery", label: "Previous entry", play: (c, o) => { hiss(c, o, { attack: 0.01, decay: 0.08, freq: 4200, to: 2200, gain: 0.18, q: 0.9 }); tone(c, o, { freq: 988, to: 740, glide: 0.07, decay: 0.09, gain: 0.13, type: "triangle" }); } },
} satisfies Record<string, ProDef>;

export type ProSoundName = keyof typeof PRO_SOUNDS;

/** Play a Pro sound by name. volume is 0..1 on top of the master level. Silent while sounds are off unless `force`. */
export function playProSound(name: ProSoundName, volume = 1, force = false) {
  if (!(name in PRO_SOUNDS)) return;
  playDef(name, PRO_SOUNDS[name], volume, force);
}

/**
 * Like useSound in `@/lib/ui-sounds`, for the Pro sounds: silent when `enabled` is false.
 * `play.auto(...)` is for a component that plays itself (autoplay).
 */
export type ProSoundPlayer = {
  (name: ProSoundName, volume?: number): void;
  auto: (name: ProSoundName, volume?: number) => void;
};

export function useProSound(enabled = true): ProSoundPlayer {
  const auto = useAutoplaySoundAllowed();
  return React.useMemo(
    () =>
      Object.assign(
        (name: ProSoundName, volume = 1) => {
          if (enabled) playProSound(name, volume);
        },
        {
          auto: (name: ProSoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playProSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}
```

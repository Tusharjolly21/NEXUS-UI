"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type RibbonPhoto = { src: string; title: string };
export type RibbonGalleryProps = {
  photos?: RibbonPhoto[];
  /** how deep the waves run, in pixels */
  wave?: number;
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

const TONES: [string, string][] = [
  ["#f6d365", "#fda085"],
  ["#a1c4fd", "#c2e9fb"],
  ["#d4fc79", "#96e6a1"],
  ["#fbc2eb", "#a6c1ee"],
  ["#ffecd2", "#fcb69f"],
  ["#84fab0", "#8fd3f4"],
];
const toneImage = ([a, b]: [string, string], i: number): RibbonPhoto => ({
  title: ["Saffron", "Harbour", "Lime", "Orchid", "Peach", "Mint"][i % 6],
  src:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='264'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='200' height='264' fill='url(#g)'/><circle cx='140' cy='80' r='36' fill='white' opacity='0.5'/></svg>`,
    ),
});

const CW = 200; // card width
const CH = 264;
const GAP = 22;
const PITCH = CW + GAP;
const SLICE = 10; // width of one strip of a card

type Slice = { card: number; off: number };

/**
 * A row of photographs printed on one long ribbon of paper that hangs in the air and moves like fabric. Drag it
 * sideways (or use the arrow keys) and it slides with momentum while the waves in it deepen and travel; let go and it
 * settles to a slow sway. Run the pointer along it and the ribbon swells towards you under your hand. Every card is
 * cut into thin strips placed along the curve, so the photos really bend, with light and shade across each fold.
 */
export default function RibbonGallery({
  photos,
  wave = 90,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: RibbonGalleryProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const list = useMemo(() => (photos && photos.length ? photos : TONES.map(toneImage)), [photos]);
  // every photo is drawn once into a card-sized picture (twice the card's pixels, cropped to fill it), so big
  // sources stay sharp and are not stretched, and hundreds of strips don't each scale a full-size photo
  const [fitted, setFitted] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    const made: string[] = [];
    list.forEach((p) => {
      if (p.src.startsWith("data:")) return;
      const im = new Image();
      try {
        if (new URL(p.src, location.href).origin !== location.origin) im.crossOrigin = "anonymous";
      } catch {
        /* keep going */
      }
      im.decoding = "async";
      im.onload = () => {
        const c = document.createElement("canvas");
        c.width = CW * 2;
        c.height = CH * 2;
        const g = c.getContext("2d");
        if (!g) return;
        const k = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight);
        g.imageSmoothingQuality = "high";
        g.drawImage(
          im,
          (c.width - im.naturalWidth * k) / 2,
          (c.height - im.naturalHeight * k) / 2,
          im.naturalWidth * k,
          im.naturalHeight * k,
        );
        try {
          c.toBlob(
            (b) => {
              if (!b) return;
              const u = URL.createObjectURL(b);
              made.push(u);
              if (alive) setFitted((f) => ({ ...f, [p.src]: u }));
              else URL.revokeObjectURL(u);
            },
            "image/jpeg",
            0.9,
          );
        } catch {
          // a photo from a server that doesn't allow reading it back: use it as it is
          if (alive) setFitted((f) => ({ ...f, [p.src]: p.src }));
        }
      };
      im.onerror = () => {
        if (alive) setFitted((f) => ({ ...f, [p.src]: p.src }));
      };
      im.src = p.src;
    });
    return () => {
      alive = false;
      made.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [list]);
  // enough cards to wrap round a wide stage
  const cards = useMemo(() => {
    const n = Math.max(12, Math.ceil(12 / list.length) * list.length);
    return Array.from({ length: n }, (_, i) => list[i % list.length]);
  }, [list]);
  const L = cards.length * PITCH;
  const slices = useMemo<Slice[]>(() => {
    const out: Slice[] = [];
    cards.forEach((_, c) => {
      for (let o = 0; o < CW; o += SLICE) out.push({ card: c, off: o });
    });
    return out;
  }, [cards]);

  const root = useRef<HTMLDivElement>(null);
  const sEls = useRef<(HTMLDivElement | null)[]>([]);
  const shEls = useRef<(HTMLDivElement | null)[]>([]);
  const st = useRef({
    x: 0,
    v: 0,
    amp: 0.4,
    phase: 0,
    hand: -9999,
    handA: 0,
    w: 900,
  });
  const touched = useRef(false);
  const [center, setCenter] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => (st.current.w = el.clientWidth));
    ro.observe(el);
    st.current.w = el.clientWidth;
    let raf = 0;
    let last = performance.now();
    let shown = -1;
    let lastCard = 0;
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const s = st.current;
      if (autoplay && !touched.current && !reduce) s.v += (-60 - s.v) * dt;
      s.x += s.v * dt;
      s.v *= Math.pow(0.18, dt);
      // the faster it moves, the deeper the waves
      const target = 0.35 + Math.min(1.4, Math.abs(s.v) / 900);
      s.amp += (target - s.amp) * Math.min(1, dt * (target > s.amp ? 6 : 1.2));
      s.phase += dt * (reduce ? 0 : 0.9 + Math.abs(s.v) / 260) * (s.v > 0 ? -1 : 1);
      s.handA += ((s.hand > -9000 ? 1 : 0) - s.handA) * Math.min(1, dt * 5);
      const half = s.w / 2;
      const A = reduce ? 0 : wave * s.amp;
      const bow = 0.00022;
      const z = (u: number) =>
        A * Math.sin(u / 170 + s.phase) * 0.7 +
        A * 0.45 * Math.sin(u / 97 - s.phase * 1.7) -
        bow * u * u +
        70 * s.handA * Math.exp(-((u - s.hand) ** 2) / (2 * 120 * 120));
      for (let i = 0; i < slices.length; i++) {
        const el2 = sEls.current[i];
        const sh = shEls.current[i];
        if (!el2 || !sh) continue;
        const sl = slices[i];
        let u = sl.card * PITCH + sl.off + SLICE / 2 + s.x;
        u = ((((u + L / 2) % L) + L) % L) - L / 2;
        if (Math.abs(u) > half + 260) {
          el2.style.visibility = "hidden";
          continue;
        }
        el2.style.visibility = "visible";
        const zz = z(u);
        const dz = (z(u + 2) - z(u - 2)) / 4;
        const ang = Math.atan(dz);
        const len = SLICE * Math.sqrt(1 + dz * dz) + 1.4;
        el2.style.width = `${len.toFixed(2)}px`;
        el2.style.transform = `translate3d(${(u - len / 2).toFixed(2)}px, 0, ${zz.toFixed(2)}px) rotateY(${(-ang * 57.2958).toFixed(2)}deg)`;
        // light from the front left: faces turned away go into shade; blended across the strip so there are no steps
        const shade = (uu: number) => {
          const lit = Math.sin(Math.atan((z(uu + 2) - z(uu - 2)) / 4) + 0.25);
          return lit < 0
            ? `rgba(20,16,12,${Math.min(0.42, -lit * 0.6).toFixed(3)})`
            : `rgba(255,255,255,${Math.min(0.18, lit * 0.24).toFixed(3)})`;
        };
        sh.style.background = `linear-gradient(90deg, ${shade(u - SLICE / 2)}, ${shade(u + SLICE / 2)})`;
      }
      const c = ((Math.round((-s.x - CW / 2) / PITCH) % cards.length) + cards.length) % cards.length;
      if (c !== shown) {
        shown = c;
        setCenter(c);
      }
      const passed = Math.floor(s.x / PITCH);
      if (passed !== lastCard) {
        lastCard = passed;
        if (Math.abs(s.v) > 120) sfx.tick({ freq: 2400, gain: 0.025 });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slices, L, wave, autoplay, reduce]);

  const drag = useRef<{ x: number; t: number } | null>(null);
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, t: performance.now() };
    sfx.whoosh(400, 900, { dur: 0.2, gain: 0.02 });
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = root.current?.getBoundingClientRect();
    if (r) st.current.hand = e.clientX - r.left - r.width / 2;
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    const dx = e.clientX - d.x;
    st.current.x += dx;
    st.current.v = st.current.v * 0.4 + (dx / Math.max(8, now - d.t)) * 1000 * 0.6;
    d.x = e.clientX;
    d.t = now;
  };
  const onUp = () => {
    drag.current = null;
  };
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "ArrowLeft") st.current.v += 700;
    else if (e.key === "ArrowRight") st.current.v -= 700;
    else return;
    e.preventDefault();
    touched.current = true;
  };

  return (
    <div
      ref={root}
      tabIndex={0}
      role="region"
      aria-roledescription="gallery"
      aria-label={`Ribbon gallery, ${list.length} photos. Drag or use the arrow keys to move along it.`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={() => (st.current.hand = -9999)}
      onKeyDown={onKey}
      className={`relative w-full overflow-hidden rounded-[24px] select-none outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${className}`}
      style={{
        height: 520,
        background: "radial-gradient(90% 70% at 50% 40%, #ffffff 0%, #f3f2ef 60%, #e9e7e2 100%)",
        cursor: "grab",
        touchAction: "pan-y",
      }}
    >
      {/* the soft shadow the ribbon casts on the floor */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          top: "76%",
          height: 40,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(60,50,40,0.22), transparent)",
          filter: "blur(8px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 900,
          perspectiveOrigin: "50% 30%",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "44%",
            transformStyle: "preserve-3d",
            transform: `translateY(${-CH / 2}px) rotateX(-4deg)`,
          }}
        >
          {slices.map((sl, i) => (
            <div
              key={i}
              ref={(el) => {
                sEls.current[i] = el;
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: SLICE,
                height: CH,
                backgroundImage: fitted[cards[sl.card].src]
                  ? `url("${fitted[cards[sl.card].src]}")`
                  : cards[sl.card].src.startsWith("data:")
                    ? `url("${cards[sl.card].src}")`
                    : "none",
                backgroundColor: "#dcdde2",
                backgroundSize: `${CW}px ${CH}px`,
                backgroundPosition: `${-sl.off}px 0`,
                backfaceVisibility: "visible",
                willChange: "transform",
                borderTopLeftRadius: sl.off === 0 ? 8 : 0,
                borderBottomLeftRadius: sl.off === 0 ? 8 : 0,
                borderTopRightRadius: sl.off + SLICE >= CW ? 8 : 0,
                borderBottomRightRadius: sl.off + SLICE >= CW ? 8 : 0,
                overflow: "hidden",
              }}
            >
              <div
                ref={(el) => {
                  shEls.current[i] = el;
                }}
                style={{ position: "absolute", inset: 0 }}
              />
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 34,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={center}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#1d1d1f",
            }}
          >
            {cards[center]?.title}
          </motion.div>
        </AnimatePresence>
        <div
          style={{
            fontSize: 12,
            color: "#6e6e73",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {(center % list.length) + 1} of {list.length}
        </div>
      </div>
    </div>
  );
}

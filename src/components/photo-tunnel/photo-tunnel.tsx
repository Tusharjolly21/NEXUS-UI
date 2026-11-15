"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

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

export type TunnelPhoto = { src: string; title: string };
export type PhotoTunnelProps = {
  /** the photos to fly through; without them the tunnel paints its own skies */
  photos?: TunnelPhoto[];
  /** how many frames hang in the tunnel (photos repeat to fill it) */
  count?: number;
  /** called when a photo is opened */
  onOpen?: (photo: TunnelPhoto, index: number) => void;
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
  close:
    "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

// painted skies to stand in when no photos are given
const SKIES: [string, string, string][] = [
  ["#0f2a4a", "#e8875a", "#f6d6a8"],
  ["#1b1f3b", "#6c5ce7", "#fbc4ab"],
  ["#0b3d3a", "#3fa796", "#e9f5db"],
  ["#2b1a2f", "#c0587e", "#ffd6a5"],
  ["#14213d", "#4895ef", "#caf0f8"],
  ["#283618", "#9caf88", "#fefae0"],
];
const skyPhoto = ([a, b, c]: [string, string, string], i: number): TunnelPhoto => ({
  title: ["Dusk", "Lilac", "Lagoon", "Ember", "Glacier", "Meadow"][i % 6],
  src:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='264'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='0.62' stop-color='${b}'/><stop offset='1' stop-color='${c}'/></linearGradient></defs><rect width='200' height='264' fill='url(#g)'/><path d='M0 200 L40 168 L70 184 L118 140 L160 176 L200 150 L200 264 L0 264Z' fill='${a}' opacity='0.85'/><path d='M0 228 L60 206 L110 222 L160 200 L200 214 L200 264 L0 264Z' fill='${a}'/></svg>`,
    ),
});

const PERSP = 700;
const GAP = 230; // depth between frames
const FW = 172;
const FH = 228;

type Item = {
  photo: TunnelPhoto;
  pi: number;
  x: number;
  y: number;
  z0: number;
  tilt: number;
};

/**
 * A spatial gallery: you look down a long tunnel of photographs hanging in the dark and fly through it. Drag (or use
 * the arrow keys, or scroll once you have clicked into it) and the frames rush towards you, swell and slip past the
 * edges, with momentum that carries on after you let go; the far frames sit in haze. Click a photo and the camera flies
 * to it and holds it up full; click again or press Escape to drop back into the tunnel. Autoplay drifts forward.
 */
export default function PhotoTunnel({
  photos,
  count = 28,
  onOpen,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: PhotoTunnelProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const list = useMemo(() => (photos && photos.length ? photos : SKIES.map(skyPhoto)), [photos]);
  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (let i = 0; i < count; i++) {
      const a = i * 2.39996 + 0.6; // the golden angle, so no two frames line up
      const r = 150 + ((i * 53) % 110);
      out.push({
        photo: list[i % list.length],
        pi: i % list.length,
        x: Math.cos(a) * r * 1.35,
        y: Math.sin(a) * r * 0.82,
        z0: -i * GAP,
        tilt: ((i * 37) % 9) - 4,
      });
    }
    return out;
  }, [list, count]);
  const span = count * GAP;

  const root = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const cam = useRef({
    z: 0,
    v: 0,
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    look: { x: 0, y: 0 },
  });
  const touched = useRef(false);
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef<number | null>(null);
  openRef.current = open;
  const focusZ = useRef<number | null>(null);
  const lastTick = useRef(0);
  const [near, setNear] = useState(0);

  // frame loop: move the camera, place every frame
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let nearShown = -1;
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const c = cam.current;
      if (focusZ.current !== null) {
        // flying to an open photo
        c.z += (focusZ.current - c.z) * Math.min(1, dt * 5);
        c.v = 0;
      } else {
        if (autoplay && !touched.current && !reduce) c.v += (90 - c.v) * dt * 0.8;
        c.z += c.v * dt;
        c.v *= Math.pow(0.12, dt);
      }
      c.x += (c.tx - c.x) * Math.min(1, dt * 4);
      c.y += (c.ty - c.y) * Math.min(1, dt * 4);
      // a soft click each time a frame passes you
      const passed = Math.floor(c.z / GAP);
      if (passed !== lastTick.current) {
        lastTick.current = passed;
        if (Math.abs(c.v) > 40 && focusZ.current === null) sfx.whoosh(900, 300, { dur: 0.22, gain: 0.018 });
      }
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < items.length; i++) {
        const el = els.current[i];
        if (!el) continue;
        const it = items[i];
        // depth relative to the camera, wrapped so the tunnel never ends
        let z = (((it.z0 + c.z) % span) + span) % span;
        z = z - span + PERSP * 0.7;
        const fade =
          Math.min(1, Math.max(0, (z + span - PERSP * 0.7) / (span * 0.28))) *
          Math.min(1, Math.max(0, (PERSP * 0.62 - z) / 140));
        const op = openRef.current === null ? 1 : openRef.current === i ? 1 : 0.18;
        el.style.transform = `translate3d(${it.x - c.x}px, ${it.y - c.y}px, ${z}px) rotate(${it.tilt}deg)`;
        el.style.opacity = String(fade * op);
        el.style.visibility = fade < 0.01 ? "hidden" : "visible";
        el.style.filter = `brightness(${(0.35 + 0.65 * Math.min(1, Math.max(0, (z + 2600) / 2400))).toFixed(3)})`;
        const d = Math.abs(z - 120);
        if (d < bestD && fade > 0.5) {
          bestD = d;
          best = it.pi;
        }
      }
      if (best !== nearShown) {
        nearShown = best;
        setNear(best);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, span, autoplay, reduce]);

  // dragging and scrolling push the camera
  const drag = useRef<{
    x: number;
    y: number;
    t: number;
    moved: number;
  } | null>(null);
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if (openRef.current !== null) return;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      moved: 0,
    };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = root.current?.getBoundingClientRect();
    if (r && openRef.current === null) {
      // the camera leans a little towards the pointer
      cam.current.tx = ((e.clientX - r.left) / r.width - 0.5) * -60;
      cam.current.ty = ((e.clientY - r.top) / r.height - 0.5) * -40;
    }
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const now = performance.now();
    const dt = Math.max(8, now - d.t);
    d.moved += Math.abs(dx) + Math.abs(dy);
    if (d.moved > 6) e.currentTarget.setPointerCapture(e.pointerId);
    // up or left flies forward
    const push = -(dy + dx * 0.6) * 3.2;
    cam.current.z += push;
    cam.current.v = cam.current.v * 0.5 + (push / dt) * 1000 * 0.5;
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = now;
  };
  const onUp = () => {
    drag.current = null;
  };
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (!el.contains(document.activeElement)) return;
      e.preventDefault();
      touched.current = true;
      if (openRef.current !== null) return;
      cam.current.v += e.deltaY * 4;
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  const openAt = (i: number) => {
    if (drag.current && drag.current.moved > 6) return;
    const it = items[i];
    touched.current = true;
    const c = cam.current;
    // bring the frame to a comfortable distance in front, centred
    let z = (((it.z0 + c.z) % span) + span) % span;
    z = z - span + PERSP * 0.7;
    focusZ.current = c.z + (PERSP * 0.38 - z);
    c.tx = it.x;
    c.ty = it.y;
    setOpen(i);
    sfx.whoosh(300, 1400, { dur: 0.5, gain: 0.05 });
    sfx.note(880, { at: 0.35, dur: 0.5, gain: 0.04, bell: 0.6 });
    onOpen?.(it.photo, it.pi);
  };
  const close = () => {
    if (openRef.current === null) return;
    focusZ.current = null;
    cam.current.tx = 0;
    cam.current.ty = 0;
    cam.current.v = -120;
    setOpen(null);
    sfx.whoosh(1400, 300, { dur: 0.4, gain: 0.04 });
  };

  const onKey = (e: RKeyboardEvent) => {
    touched.current = true;
    if (e.key === "Escape") close();
    if (openRef.current !== null) return;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      cam.current.v += 520;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      cam.current.v -= 520;
    }
  };

  const shown = open !== null ? items[open].pi : near;
  return (
    <div
      ref={root}
      tabIndex={0}
      role="region"
      aria-roledescription="gallery"
      aria-label="Photo tunnel. Drag or use the arrow keys to fly through; click a photo to open it."
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={() => {
        cam.current.tx = openRef.current === null ? 0 : cam.current.tx;
        cam.current.ty = openRef.current === null ? 0 : cam.current.ty;
      }}
      className={`relative w-full overflow-hidden rounded-[24px] select-none outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff] ${className}`}
      style={{
        height: 560,
        background: "radial-gradient(70% 70% at 50% 50%, #1a1b20 0%, #0b0b0d 70%, #060607 100%)",
        cursor: open === null ? "grab" : "zoom-out",
        touchAction: "none",
      }}
      onClick={(e) => {
        if (open !== null && e.target === e.currentTarget) close();
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: PERSP,
          perspectiveOrigin: "50% 50%",
        }}
        onClick={(e) => {
          if (openRef.current !== null && e.target === e.currentTarget) close();
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              ref={(el) => {
                els.current[i] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (open === i) close();
                else if (open === null) openAt(i);
                else close();
              }}
              style={{
                position: "absolute",
                left: -FW / 2,
                top: -FH / 2,
                width: FW,
                height: FH,
                borderRadius: 6,
                overflow: "hidden",
                pointerEvents: "auto",
                cursor: "pointer",
                willChange: "transform, opacity",
                boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
                background: "#111",
              }}
            >
              <img
                src={it.photo.src}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(160deg, rgba(255,255,255,0.12), transparent 40%)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* haze and grain over the depth */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(28% 30% at 50% 50%, rgba(10,10,12,0.75), transparent 70%), radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.65))",
          opacity: open === null ? 1 : 0.3,
          transition: "opacity 0.6s",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 20,
          bottom: 18,
          color: "rgba(255,255,255,0.86)",
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={shown}
            initial={{ y: 14, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -14, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}
          >
            {list[shown]?.title}
          </motion.div>
        </AnimatePresence>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {shown + 1} of {list.length}
        </div>
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close photo"
            className="outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{
              position: "absolute",
              right: 16,
              top: 16,
              width: 36,
              height: 36,
              borderRadius: 18,
              border: 0,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
            }}
          >
            <Ico d={I.close} size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

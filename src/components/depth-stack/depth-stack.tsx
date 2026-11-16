"use client";

/* eslint-disable react-hooks/immutability, react-hooks/purity -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type DepthPhoto = { src: string; title: string };
export type DepthStackProps = {
  photos?: DepthPhoto[];
  onOpen?: (photo: DepthPhoto, index: number) => void;
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

const TONES = ["#f6d365", "#a1c4fd", "#d4fc79", "#fbc2eb", "#ffecd2", "#84fab0", "#c2e9fb"];
const tone = (i: number): DepthPhoto => ({
  title: ["Dawn", "Harbour", "Meadow", "Bloom", "Sand", "Mint", "Mist"][i % 7],
  src:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='264'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${TONES[i % 7]}'/><stop offset='1' stop-color='#444'/></linearGradient></defs><rect width='200' height='264' fill='url(#g)'/></svg>`,
    ),
});

const CW = 188;
const CH = 248;

/**
 * A stack of photographs receding into the distance on a diagonal, like prints laid out down a long table seen from
 * one end. Scroll, drag or use the arrow keys to travel along it, with the cards blurring as they rush past; point at
 * a card and it lifts towards you in sharp focus while everything nearer and farther falls out of focus, the way a
 * camera lens would, with its title on it. Click to choose it.
 */
export default function DepthStack({
  photos,
  onOpen,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: DepthStackProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const list = useMemo(
    () => (photos && photos.length ? photos : Array.from({ length: 7 }, (_, i) => tone(i))),
    [photos],
  );
  const cards = useMemo(() => {
    const n = Math.max(14, Math.ceil(14 / list.length) * list.length);
    return Array.from({ length: n }, (_, i) => ({
      ...list[i % list.length],
      pi: i % list.length,
    }));
  }, [list]);
  const N = cards.length;
  const root = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const st = useRef({
    s: 0,
    v: 0,
    hover: -1,
    focus: 0,
    lift: new Float32Array(64),
    w: 900,
    h: 520,
  });
  const touched = useRef(false);
  const [hover, setHover] = useState(-1);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      st.current.w = el.clientWidth;
      st.current.h = el.clientHeight;
      kick.current();
    });
    ro.observe(el);
    st.current.w = el.clientWidth;
    st.current.h = el.clientHeight;
    let raf = 0;
    let running = false;
    let last = performance.now();
    let lastSlot = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      if (autoplay && !touched.current && !reduce) s.v += (0.55 - s.v) * dt * 2;
      s.s += s.v * dt;
      s.v *= Math.pow(0.08, dt);
      const slot = Math.floor(s.s);
      if (slot !== lastSlot) {
        lastSlot = slot;
        if (Math.abs(s.v) > 0.8) sfx.tick({ freq: 1800, gain: 0.02 });
      }
      const narrow = s.w < 560;
      // the diagonal: from the lower left, near, to the upper right, far
      const dx = narrow ? 30 : 64;
      const dy = narrow ? 30 : 38;
      const dz = 120;
      const ox = s.w * (narrow ? 0.32 : 0.26);
      const oy = s.h * 0.62;
      // where the lens is focused: on the card under the pointer, otherwise on the front of the stack
      const target = s.hover >= 0 ? s.hover : -1;
      let fDepth = 0.3;
      if (target >= 0) {
        let r = (((target - s.s) % N) + N) % N;
        if (r > N - 1.5) r -= N;
        fDepth = r;
      }
      s.focus += (fDepth - s.focus) * Math.min(1, dt * 7);
      let still = Math.abs(s.v) < 0.002 && Math.abs(fDepth - s.focus) < 0.002;
      for (let i = 0; i < N; i++) {
        const el2 = els.current[i];
        if (!el2) continue;
        // how far along the stack this card is from the front
        let r = (((i - s.s) % N) + N) % N;
        if (r > N - 1.5) r -= N;
        const lt = s.lift[i] + ((s.hover === i ? 1 : 0) - s.lift[i]) * Math.min(1, dt * 9);
        if (Math.abs(lt - s.lift[i]) > 0.001) still = false;
        s.lift[i] = lt;
        const x = ox + r * dx;
        const y = oy - r * dy - lt * 26;
        const z = -r * dz + lt * 70;
        // the lens: sharp at the focus, softer either side; plus a smear while moving
        const blur = reduce ? 0 : Math.min(14, Math.abs(r - s.focus) * (target >= 0 ? 2.6 : 0.9) + Math.abs(s.v) * 2.2);
        const fade = r < -0.6 ? Math.max(0, 1 + (r + 0.6) * 2.5) : r > N - 4 ? Math.max(0, (N - 1.5 - r) / 2.5) : 1;
        el2.style.transform = `translate3d(${(x - CW / 2).toFixed(1)}px, ${(y - CH / 2).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(-14 + lt * 10).toFixed(2)}deg) rotateZ(${(-3 + lt * 3).toFixed(2)}deg)`;
        el2.style.filter = `blur(${blur.toFixed(2)}px) brightness(${(1 - Math.max(0, r) * 0.015 + lt * 0.04).toFixed(3)})`;
        el2.style.opacity = fade.toFixed(3);
        el2.style.zIndex = String(1000 - Math.round(r * 10) + Math.round(lt * 20));
        el2.style.visibility = fade < 0.01 ? "hidden" : "visible";
        const cap = caps.current[i];
        if (cap) {
          cap.style.opacity = lt.toFixed(3);
          cap.style.transform = `translateY(${((1 - lt) * 8).toFixed(1)}px)`;
        }
      }
      if (still && !(autoplay && !touched.current)) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    kick.current = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    kick.current();
    const wheel = (e: WheelEvent) => {
      if (!el.contains(document.activeElement) && !el.matches(":hover")) return;
      e.preventDefault();
      touched.current = true;
      st.current.v += (e.deltaY + e.deltaX) * 0.0045;
      kick.current();
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("wheel", wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N, autoplay, reduce]);

  const drag = useRef<{
    x: number;
    y: number;
    t: number;
    moved: number;
  } | null>(null);
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      moved: 0,
    };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.moved += Math.abs(dx) + Math.abs(dy);
    if (d.moved > 6) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setHov(-1);
    }
    const now = performance.now();
    // dragging up and right travels into the stack
    const push = (dx - dy) * 0.012;
    st.current.s += push;
    st.current.v = (push / Math.max(0.008, (now - d.t) / 1000)) * 0.6;
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = now;
    kick.current();
  };
  const onUp = () => {
    drag.current = null;
  };
  const setHov = (i: number) => {
    if (st.current.hover === i) return;
    st.current.hover = i;
    setHover(i);
    if (i >= 0) sfx.tick({ freq: 2600, gain: 0.02 });
    kick.current();
  };
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") st.current.v += 3.2;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") st.current.v -= 3.2;
    else return;
    e.preventDefault();
    touched.current = true;
    kick.current();
  };

  return (
    <div
      ref={root}
      tabIndex={0}
      role="region"
      aria-roledescription="gallery"
      aria-label="Photo stack. Scroll, drag or use the arrow keys to travel along it."
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={() => setHov(-1)}
      onKeyDown={onKey}
      className={`relative w-full overflow-hidden rounded-[24px] select-none outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${className}`}
      style={{
        height: 520,
        background: "radial-gradient(90% 80% at 60% 40%, #fbfbfc 0%, #f1f1f3 60%, #e8e8ec 100%)",
        cursor: "grab",
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 1100,
          perspectiveOrigin: "60% 40%",
        }}
      >
        {cards.map((c, i) => (
          <div
            key={i}
            ref={(el) => {
              els.current[i] = el;
            }}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse" && !drag.current) setHov(i);
            }}
            onClick={() => {
              if (drag.current && drag.current.moved > 6) return;
              onOpen?.(c, c.pi);
              sfx.note(880, { dur: 0.25, gain: 0.05, bell: 0.5 });
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: CW,
              height: CH,
              borderRadius: 14,
              overflow: "hidden",
              willChange: "transform, filter",
              background: "#ddd",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.5) inset, 0 30px 40px -24px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.04)",
              cursor: "pointer",
            }}
          >
            <img
              src={c.src}
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
                background: "linear-gradient(160deg, rgba(255,255,255,0.22), transparent 38%)",
              }}
            />
            <div
              ref={(el) => {
                caps.current[i] = el;
              }}
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                bottom: 10,
                height: 30,
                borderRadius: 15,
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#1d1d1f",
                opacity: 0,
              }}
            >
              {c.title}
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {hover >= 0 ? cards[hover]?.title : ""}
      </p>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 16,
          fontSize: 12,
          color: "#86868b",
          pointerEvents: "none",
        }}
      >
        Scroll to move along the stack, point at a picture to focus on it
      </div>
    </div>
  );
}

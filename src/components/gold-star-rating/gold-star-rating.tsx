"use client";

import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type GoldStarRatingProps = {
  /** 0 for none, up to 5 */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  question?: string;
  /** the word for each score, 1 to 5 */
  labels?: [string, string, string, string, string];
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

function useSound(enabled: boolean, volume: number): Sound {
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
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
  }, [enabled, volume]);
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && vol.current > 0 && e.ctx.state === "running" ? e : null;
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

// ───────────── the star: a faceted bipyramid, ten faces a side, lit like polished metal ─────────────

type V3 = [number, number, number];
const OUTER = 1, INNER = 0.47, DEPTH = 0.34;
const VERTS: V3[] = (() => {
  const v: V3[] = [[0, 0, DEPTH], [0, 0, -DEPTH]];
  for (let i = 0; i < 5; i++) {
    const a = ((-90 + i * 72) * Math.PI) / 180, b = ((-90 + i * 72 + 36) * Math.PI) / 180;
    v.push([Math.cos(a) * OUTER, Math.sin(a) * OUTER, 0], [Math.cos(b) * INNER, Math.sin(b) * INNER, 0]);
  }
  return v;
})();
const O = (i: number) => 2 + ((i % 5) * 2), I = (i: number) => 3 + ((i % 5) * 2);
/** twenty faces, wound so their normals point out */
const FACES: [number, number, number][] = [];
for (let i = 0; i < 5; i++) {
  FACES.push([0, O(i), I(i)], [0, I(i), O(i + 1)]);
  FACES.push([1, I(i), O(i)], [1, O(i + 1), I(i)]);
}

const norm = (v: V3): V3 => {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
};
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const KEY = norm([-0.45, -0.75, 0.62]); // a softbox up and to the left (screen y points down)
const RIM = norm([0.85, -0.25, 0.45]);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const GOLD = { lo: [0.42, 0.25, 0.05], hi: [1, 0.8, 0.36], spec: 1 };
const SILVER = { lo: [0.47, 0.49, 0.55], hi: [0.93, 0.94, 0.97], spec: 0.5 };

/** the colour of one face: a studio environment reflected in it, tinted by gold or silver, plus the softbox glint */
function shade(n: V3, fill: number) {
  const r: V3 = [2 * n[2] * n[0], 2 * n[2] * n[1], 2 * n[2] * n[2] - 1]; // the view (0,0,1) reflected about n
  const sky = smooth(-0.15, 0.85, -r[1]); // what is above reflects bright, the floor dark
  const box = Math.pow(Math.max(0, dot(r, KEY)), 16);
  const rim = Math.pow(Math.max(0, dot(r, RIM)), 9) * 0.5;
  const out: number[] = [];
  for (let c = 0; c < 3; c++) {
    const g = GOLD.lo[c]! + (GOLD.hi[c]! - GOLD.lo[c]!) * sky;
    const s = SILVER.lo[c]! + (SILVER.hi[c]! - SILVER.lo[c]!) * (0.15 + 0.85 * sky);
    const base = s + (g - s) * fill;
    const spec = (box * 1.5 + rim) * (SILVER.spec + (GOLD.spec - SILVER.spec) * fill);
    out.push(Math.round(255 * Math.min(1, base + spec)));
  }
  return `rgb(${out[0]},${out[1]},${out[2]})`;
}

type StarState = { fill: number; spin: number; pop: number; lift: number; tx: number; ty: number; gx: number; gy: number };

const CX = (i: number) => 30 + i * 60;
const CY = 42;
const SIZE = 23;
const SILENT: Sound = { note: () => {}, whoosh: () => {}, tick: () => {} };
const DEFAULT_LABELS: [string, string, string, string, string] = ["Poor", "Fair", "Good", "Great", "Excellent"];
const TINGS = [1568, 1760, 2093, 2349, 2637];

/**
 * Five faceted gold stars, solid and lit like polished metal.
 *
 * Each star is a real three dimensional bipyramid of twenty flat faces. Every frame each face is turned, tested for
 * whether it faces you, sorted far to near, and coloured by the studio it reflects: bright from above, dark from the
 * floor, with a softbox glint that flashes across the faces as they turn. Empty stars are brushed silver. Choose a
 * score and the stars up to it spin round one after another and come out gold, each with a metallic ting a step
 * higher, a little pop and a sparkle; the rest spin back to silver. The stars lean towards your pointer, lift when
 * you point at them and turn ever so slightly while they wait, so the light keeps moving on them. A radio group, with
 * arrow keys, and the score in a polite live region.
 */
export default function GoldStarRating({
  value,
  defaultValue = 0,
  onChange,
  question = "Rate your order",
  labels = DEFAULT_LABELS,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: GoldStarRatingProps) {
  const reduce = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const sfx = useSound(enableSound && siteSound, volume);
  const [inner, setInner] = useState(defaultValue);
  const score = value ?? inner;
  const [hover, setHover] = useState(0);
  const [sparks, setSparks] = useState<{ id: number; i: number }[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const stars = useRef<StarState[]>(Array.from({ length: 5 }, (_, i) => ({ fill: i < defaultValue ? 1 : 0, spin: 0, pop: 0, lift: 0, tx: 0, ty: 0, gx: 0, gy: 0 })));
  const faceRefs = useRef<(SVGPathElement | null)[][]>(Array.from({ length: 5 }, () => []));
  const glowRefs = useRef<(SVGCircleElement | null)[]>([]);
  const shadowRefs = useRef<(SVGEllipseElement | null)[]>([]);
  const ids = useRef(0);

  /** turn, cull, sort and shade one star */
  const drawStar = (i: number, t: number) => {
    const s = stars.current[i]!;
    const wob = reduce ? 0 : Math.sin(t * 1.1 + i * 1.3) * 5; // a slow idle turn, so the light moves
    const ry = ((s.spin + s.ty + wob) * Math.PI) / 180, rx = ((s.tx + Math.cos(t * 0.9 + i) * (reduce ? 0 : 2)) * Math.PI) / 180;
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    const k = SIZE * (1 + s.pop * 0.16 + s.lift * 0.05);
    const ox = CX(i), oy = CY - s.lift * 3;
    const P = VERTS.map(([x, y, z]) => {
      // turn about y, then about x
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      return [x1, y2, z2] as V3;
    });
    const drawn = FACES.map((f, j) => {
      const a = P[f[0]]!, b = P[f[1]]!, c = P[f[2]]!;
      const n = norm([
        (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
        (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
        (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
      ]);
      return { j, n, z: (a[2] + b[2] + c[2]) / 3, a, b, c };
    })
      .filter((f) => f.n[2] > 0.001)
      .sort((p, q) => p.z - q.z);
    const els = faceRefs.current[i]!;
    for (let e = 0; e < els.length; e++) {
      const el = els[e];
      if (!el) continue;
      const f = drawn[e];
      if (!f) {
        el.setAttribute("d", "");
        continue;
      }
      const pt = (v: V3) => `${(ox + v[0] * k).toFixed(2)},${(oy + v[1] * k).toFixed(2)}`;
      el.setAttribute("d", `M${pt(f.a)}L${pt(f.b)}L${pt(f.c)}Z`);
      const col = shade(f.n, s.fill);
      el.setAttribute("fill", col);
      el.setAttribute("stroke", col);
    }
    glowRefs.current[i]?.setAttribute("opacity", (s.fill * 0.55).toFixed(3));
    const sh = shadowRefs.current[i];
    if (sh) {
      sh.setAttribute("rx", (k * 0.78 * (0.75 + 0.25 * Math.abs(cy))).toFixed(2));
      sh.setAttribute("opacity", (0.16 - s.lift * 0.05).toFixed(3));
    }
  };

  // one loop draws everything while it is on screen; it is cheap, twenty triangles a star
  useEffect(() => {
    if (!inView) {
      for (let i = 0; i < 5; i++) drawStar(i, 0);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      for (let i = 0; i < 5; i++) {
        const s = stars.current[i]!;
        // ease the lean towards where the pointer wants it
        s.tx += (s.gx - s.tx) * 0.14;
        s.ty += (s.gy - s.ty) * 0.14;
        drawStar(i, t);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  const target = useRef(defaultValue);
  const anims = useRef<{ stop: () => void }[][]>(Array.from({ length: 5 }, () => []));
  const tween = (i: number, key: "fill" | "spin" | "pop", to: number | number[], o: object) => {
    const s = stars.current[i]!;
    const from = s[key];
    const c = animate(from, to as never, { ...o, onUpdate: (v: number) => (s[key] = v) } as never);
    anims.current[i]!.push(c as unknown as { stop: () => void });
    return c;
  };

  const setScore = (next: number, fromUser = true) => {
    if (fromUser) touched.current = true;
    const v = Math.max(0, Math.min(5, next));
    const was = target.current;
    target.current = v;
    if (value === undefined) setInner(v);
    onChange?.(v);
    const play = fromUser || autoplaySoundOk ? sfx : SILENT;
    let k = 0;
    for (let i = 0; i < 5; i++) {
      const s = stars.current[i]!;
      const on = i < v;
      if ((on && i < was) || (!on && i >= was)) continue; // already on its way there
      anims.current[i]!.forEach((a) => a.stop());
      anims.current[i] = [];
      if (reduce) {
        s.fill = on ? 1 : 0;
        if (on) play.note(TINGS[i]!, { dur: 0.5, gain: 0.05, bell: 0.9 });
        continue;
      }
      const delay = on ? k++ * 0.085 : (4 - i) * 0.05;
      s.spin = ((s.spin % 360) + 360) % 360;
      if (on) {
        // a full turn, coming out gold as it passes edge on
        tween(i, "spin", s.spin + 360, { duration: 0.8, ease: [0.16, 0.9, 0.3, 1], delay });
        tween(i, "fill", 1, { duration: 0.16, ease: "easeIn", delay: delay + 0.05 });
        tween(i, "pop", [0, 1, 0], { duration: 0.55, ease: "easeOut", delay: delay + 0.04 });
        play.note(TINGS[i]!, { at: delay + 0.1, dur: 0.9, gain: 0.06, bell: 0.95 });
        play.note(TINGS[i]! * 2, { at: delay + 0.1, dur: 0.25, gain: 0.02, bell: 0 });
        play.whoosh(1800, 4200, { at: delay, dur: 0.18, gain: 0.015 });
        const id = ++ids.current;
        window.setTimeout(() => setSparks((p) => [...p.slice(-6), { id, i }]), (delay + 0.28) * 1000);
      } else {
        tween(i, "spin", s.spin - 360, { duration: 0.6, ease: [0.3, 0.7, 0.3, 1], delay });
        tween(i, "fill", 0, { duration: 0.2, ease: "easeOut", delay: delay + 0.06 });
        play.note(TINGS[i]! / 2, { at: delay + 0.08, dur: 0.25, gain: 0.025, bell: 0.4 });
      }
    }
  };

  useEffect(() => {
    if (value !== undefined && value !== target.current) setScore(value, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // the lean: every star looks towards the pointer
  const onMove = (e: RPointerEvent) => {
    if (reduce) return;
    const r = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 300, py = ((e.clientY - r.top) / r.height) * 84;
    stars.current.forEach((s, i) => {
      s.gy = Math.max(-1, Math.min(1, (px - CX(i)) / 90)) * 26;
      s.gx = -Math.max(-1, Math.min(1, (py - CY) / 40)) * 22;
    });
  };
  const onLeave = () => {
    stars.current.forEach((s) => {
      s.gx = 0;
      s.gy = 0;
    });
    setHover(0);
  };
  // lift the stars up to the one you point at, as a preview
  useEffect(() => {
    stars.current.forEach((s, i) => {
      void animate(s.lift, i < hover ? 1 : 0, { type: "spring", stiffness: 420, damping: 24, onUpdate: (v) => (s.lift = v) });
    });
  }, [hover]);

  // autoplay: four, then two, then five, until someone touches it
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    (async () => {
      await sleep(900);
      while (ok()) {
        for (const n of [4, 2, 5, 0]) {
          if (!ok()) return;
          setScore(n, false);
          await sleep(n === 0 ? 1400 : 2000);
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  const word = (hover || score) > 0 ? labels[(hover || score) - 1] : "Tap a star";
  const sparkle = useMemo(() => "M0,-7 C0.9,-0.9 0.9,-0.9 7,0 C0.9,0.9 0.9,0.9 0,7 C-0.9,0.9 -0.9,0.9 -7,0 C-0.9,-0.9 -0.9,-0.9 0,-7Z", []);

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onKeyDownCapture={() => {
        touched.current = true;
      }}
      className={`w-[340px] max-w-full rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      <p id={`q-${uid}`} className="m-0 text-[17px] font-semibold tracking-[-0.02em]">
        {question}
      </p>
      <div className="relative mt-3" onPointerMove={onMove} onPointerLeave={onLeave}>
        <svg ref={svgRef} viewBox="0 0 300 84" className="block w-full overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id={`glow-${uid}`}>
              <stop offset="0" stopColor="#ffd56b" stopOpacity=".55" />
              <stop offset="1" stopColor="#ffd56b" stopOpacity="0" />
            </radialGradient>
            <filter id={`soft-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.6" />
            </filter>
          </defs>
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i}>
              <ellipse ref={(el) => {
                  shadowRefs.current[i] = el;
                }} cx={CX(i)} cy={CY + SIZE + 9} rx={SIZE * 0.78} ry={3.2} fill="#000" filter={`url(#soft-${uid})`} opacity={0.16} />
              <circle ref={(el) => {
                  glowRefs.current[i] = el;
                }} cx={CX(i)} cy={CY} r={SIZE * 1.55} fill={`url(#glow-${uid})`} opacity={0} />
              {FACES.map((_, e) => (
                <path key={e} ref={(el) => {
                    faceRefs.current[i]![e] = el;
                  }} strokeWidth={0.7} strokeLinejoin="round" />
              ))}
            </g>
          ))}
          <AnimatePresence>
            {sparks.map((p) => (
              <motion.path
                key={p.id}
                d={sparkle}
                fill="#ffffff"
                initial={{ x: CX(p.i) - 8, y: CY - 10, scale: 0, rotate: 0, opacity: 1 }}
                animate={{ scale: [0, 1.25, 0], rotate: 90, opacity: [1, 1, 0] }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                onAnimationComplete={() => setSparks((q) => q.filter((s) => s.id !== p.id))}
              />
            ))}
          </AnimatePresence>
        </svg>
        <div role="radiogroup" aria-labelledby={`q-${uid}`} className="absolute inset-0">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={score === i + 1}
              aria-label={`${i + 1} of 5, ${labels[i]}`}
              tabIndex={score === i + 1 || (score === 0 && i === 0) ? 0 : -1}
              onPointerEnter={() => setHover(i + 1)}
              onFocus={() => setHover(0)}
              onClick={() => setScore(score === i + 1 ? 0 : i + 1)}
              onKeyDown={(e) => {
                const kk = e.key;
                const to = kk === "ArrowRight" || kk === "ArrowUp" ? Math.min(5, score + 1) : kk === "ArrowLeft" || kk === "ArrowDown" ? Math.max(1, score - 1) : kk === "Home" ? 1 : kk === "End" ? 5 : -1;
                if (to < 0) return;
                e.preventDefault();
                setScore(to);
                (e.currentTarget.parentElement?.children[to - 1] as HTMLElement | undefined)?.focus();
              }}
              className="absolute top-0 h-full rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50"
              style={{ left: `${(i * 60 + 2) / 3}%`, width: `${56 / 3}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between" aria-live="polite">
        <div className="relative h-[28px] flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={word}
              className={`absolute left-0 top-0 whitespace-nowrap text-[22px] font-semibold leading-[28px] tracking-[-0.02em] ${hover ? "text-[#a07414]" : score ? "text-[#1d1d1f]" : "text-[#86868b]"}`}
              initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              {word}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-[13px] tabular-nums text-[#6e6e73]">{score ? `${score} of 5` : "No score yet"}</span>
      </div>
    </div>
  );
}

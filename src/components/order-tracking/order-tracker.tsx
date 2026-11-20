"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import {
  AnimatePresence,
  type MotionValue,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type TrackStep = {
  id: string;
  label: string;
  time: string;
  at: number;
  eta: string;
  note: string;
};
export type OrderTrackerProps = {
  title?: string;
  items?: string;
  steps?: TrackStep[];
  /** index of the step the order has reached */
  current?: number;
  driver?: { name: string; avatar: string };
  onStep?: (index: number) => void;
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
  truck:
    "m255.43 117l-14-35a15.93 15.93 0 0 0-14.85-10H192v-8a8 8 0 0 0-8-8H32a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h17a32 32 0 0 0 62 0h50a32 32 0 0 0 62 0h17a16 16 0 0 0 16-16v-64a8.1 8.1 0 0 0-.57-3M80 208a16 16 0 1 1 16-16a16 16 0 0 1-16 16m-48-72V72h144v64Zm160 72a16 16 0 1 1 16-16a16 16 0 0 1-16 16m0-96V88h34.58l9.6 24Z",
  home: "M224 120v96a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8v-52a4 4 0 0 0-4-4h-40a4 4 0 0 0-4 4v52a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a16 16 0 0 1 4.69-11.31l80-80a16 16 0 0 1 22.62 0l80 80A16 16 0 0 1 224 120",
  store:
    "M231.69 93.81L217.35 43.6A16.07 16.07 0 0 0 202 32H54a16.07 16.07 0 0 0-15.35 11.6L24.31 93.81A8 8 0 0 0 24 96v16a40 40 0 0 0 16 32v72a8 8 0 0 0 8 8h160a8 8 0 0 0 8-8v-72a40 40 0 0 0 16-32V96a8 8 0 0 0-.31-2.19M88 112a24 24 0 0 1-35.12 21.26a8 8 0 0 0-1.82-1.06A24 24 0 0 1 40 112v-8h48Zm64 0a24 24 0 0 1-48 0v-8h48Zm64 0a24 24 0 0 1-11.07 20.2a8 8 0 0 0-1.8 1.05A24 24 0 0 1 168 112v-8h48Z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  phone:
    "M231.88 175.08A56.26 56.26 0 0 1 176 224C96.6 224 32 159.4 32 80a56.26 56.26 0 0 1 48.92-55.88a16 16 0 0 1 16.62 9.52l21.12 47.15v.12A16 16 0 0 1 117.39 96c-.18.27-.37.52-.57.77L96 121.45c7.49 15.22 23.41 31 38.83 38.51l24.34-20.71a8 8 0 0 1 .75-.56a16 16 0 0 1 15.17-1.4l.13.06l47.11 21.11a16 16 0 0 1 9.55 16.62",
  chat: "M128 24a104 104 0 0 0-91.82 152.88l-11.35 34.05a16 16 0 0 0 20.24 20.24l34.05-11.35A104 104 0 1 0 128 24M84 140a12 12 0 1 1 12-12a12 12 0 0 1-12 12m44 0a12 12 0 1 1 12-12a12 12 0 0 1-12 12m44 0a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  pkg: "m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 32l80.35 44l-29.78 16.29l-80.35-44Zm0 88L47.65 76l33.91-18.57l80.35 44Zm88 55.85l-80 43.79v-85.81l32-17.51V152a8 8 0 0 0 16 0v-44.44l32-17.51v85.76Z",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

// `at` is how far along the last-mile route the van is at that step, 0 at the depot and 1 at your door
const DEFAULT_STEPS: TrackStep[] = [
  {
    id: "ordered",
    label: "Ordered",
    time: "9:12",
    at: 0,
    eta: "2:30–4:30 PM",
    note: "We've got your order",
  },
  {
    id: "packed",
    label: "Packed",
    time: "10:40",
    at: 0,
    eta: "2:30–4:30 PM",
    note: "Packed and labelled at the depot",
  },
  {
    id: "shipped",
    label: "Shipped",
    time: "1:58",
    at: 0.06,
    eta: "2:40–3:40 PM",
    note: "Loaded on the van, 3 stops before yours",
  },
  {
    id: "way",
    label: "On the way",
    time: "2:31",
    at: 0.45,
    eta: "2:55–3:10 PM",
    note: "1 stop before yours",
  },
  {
    id: "done",
    label: "Delivered",
    time: "3:02",
    at: 1,
    eta: "3:02 PM",
    note: "Left at the front door",
  },
];
// other people's drop-offs along the way
const STOPS = [0.3, 0.6];
const W = 340;
const H = 176;
// how much of the map shows: the camera looks across it at an angle, like a navigation view
const HV = 200;
// where on the screen the van sits while following it
const AX = W / 2;
const AY = HV * 0.6;
const ROUTE =
  "M 34 44 H 112 Q 124 44 124 56 V 98 Q 124 110 136 110 H 222 Q 234 110 234 98 V 74 Q 234 62 246 62 H 284 Q 296 62 296 74 V 142";

/**
 * A delivery tracker with a little map. The van follows the real route along the streets, the road behind it filling
 * in blue as it goes, slowing into each of the other drop-offs before yours and pulling away again, while the arrival
 * window narrows and its times roll. Click any step in the timeline to see where your parcel was then: the van drives
 * back or forward along the route to that point. When it reaches your door the pin turns into a green tick with a
 * ripple and the whole route turns green behind it. Steps are buttons, so Tab and Enter work.
 */
export default function OrderTracker({
  title = "Arriving today",
  items = "Linen shirt and 2 more",
  steps = DEFAULT_STEPS,
  current = 3,
  driver = {
    name: "Tomás",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20curly%20hair/Dark/3D/man_curly_hair_3d_dark.png",
  },
  onStep,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: OrderTrackerProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [step, setStep] = useState(current);
  const stepRef = useRef(step);
  stepRef.current = step;
  const [noted, setNoted] = useState(false);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(600);
  const dist = useMotionValue(steps[current]?.at ?? 0);
  const vx = useMotionValue(0);
  const vy = useMotionValue(0);
  const ang = useMotionValue(0);
  const flip = useMotionValue(1);
  const done = steps[step]?.id === "done";
  const following = steps[step]?.id === "way";
  const followRef = useRef(following);
  followRef.current = following;
  // the camera: where it looks, how close and how steeply
  const camTX = useMotionValue(W / 2);
  const camTY = useMotionValue(H / 2);
  const zoomT = useMotionValue(1);
  const tiltT = useMotionValue(28);
  const camX = useSpring(camTX, { stiffness: 46, damping: 15 });
  const camY = useSpring(camTY, { stiffness: 46, damping: 15 });
  const zoom = useSpring(zoomT, { stiffness: 40, damping: 14 });
  const tilt = useSpring(tiltT, { stiffness: 40, damping: 14 });
  const plane = useTransform(
    [camX, camY, zoom, tilt],
    ([x, y, z, t]: number[]) => `translate(${AX - x}px, ${AY - y}px) rotateX(${t}deg) scale(${z})`,
  );
  const planeOrigin = useTransform([camX, camY], ([x, y]: number[]) => `${x}px ${y}px`);
  // markers stand up out of the map and keep their size, like pins in a navigation app
  const cam = { x: camX, y: camY, z: zoom, t: tilt };
  const heading = useTransform(ang, (a) => `translate(-50%, -50%) rotate(${a}deg)`);
  const [pop, setPop] = useState<{ k: number; at: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setK(el.clientWidth / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // overview when the van isn't moving, close behind it when it is
  useEffect(() => {
    const snap = reduce;
    const set = (mv: typeof camTX, v: number) => (snap ? mv.jump(v) : mv.set(v));
    if (following) {
      set(zoomT, 1.75);
      set(tiltT, 48);
      set(camTX, vx.get());
      set(camTY, vy.get());
    } else {
      set(zoomT, 0.94);
      set(tiltT, done ? 24 : 32);
      set(camTX, W / 2 + 6);
      set(camTY, H * 0.66);
    }
    if (snap) {
      camX.jump(camTX.get());
      camY.jump(camTY.get());
      zoom.jump(zoomT.get());
      tilt.jump(tiltT.get());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [following, done, reduce]);

  useEffect(() => {
    const r = route.current;
    if (!r) return;
    const L = r.getTotalLength();
    setLen(L);
    let lastX = 0;
    const place = (d: number) => {
      const c = Math.max(0, Math.min(1, d));
      const pt = r.getPointAtLength(c * L);
      const ah = r.getPointAtLength(Math.min(L, c * L + 4));
      const bh = r.getPointAtLength(Math.max(0, c * L - 4));
      if (Math.abs(pt.x - lastX) > 0.3) flip.set(pt.x < lastX ? -1 : 1);
      lastX = pt.x;
      vx.set(pt.x);
      vy.set(pt.y);
      ang.set((Math.atan2(ah.y - bh.y, ah.x - bh.x) * 180) / Math.PI);
      if (followRef.current) {
        camTX.set(pt.x);
        camTY.set(pt.y);
      }
    };
    place(dist.get());
    return dist.on("change", place);
  }, [dist, vx, vy, flip, ang, camTX, camTY]);
  const dash = useTransform(dist, (d) => len * (1 - Math.max(0, Math.min(1, d))));
  // minutes to your door, from how much of the route is left
  const [mins, setMins] = useState(1);
  useEffect(() => {
    const f = (d: number) =>
      setMins((m) => {
        const n = Math.max(1, Math.round((1 - d) * 22));
        return m === n ? m : n;
      });
    f(dist.get());
    return dist.on("change", f);
  }, [dist]);
  // how many other drop-offs are still ahead
  const [ahead, setAhead] = useState(STOPS.filter((s) => s > (steps[current]?.at ?? 0) + 0.001).length);
  useEffect(
    () =>
      dist.on("change", (d) => {
        const n = STOPS.filter((s) => s > d + 0.001).length;
        setAhead((a) => (a === n ? a : n));
      }),
    [dist],
  );

  /** drive to a point, easing in and out like a vehicle, and slowing for the stops in between */
  const drive = async (to: number) => {
    if (reduce) {
      dist.set(to);
      return;
    }
    const from = dist.get();
    const legs = [
      ...STOPS.filter((s) => (to > from ? s > from + 0.001 && s < to - 0.001 : s < from - 0.001 && s > to + 0.001)),
      to,
    ];
    if (to < from) legs.sort((a, b) => b - a);
    let at = from;
    for (const leg of legs) {
      const d = Math.abs(leg - at);
      sfx.whoosh(500, 900, { dur: Math.min(0.9, 0.3 + d * 1.6), gain: 0.02 });
      await animate(dist, leg, {
        duration: Math.max(0.35, d * 2.6),
        ease: [0.45, 0, 0.3, 1],
      }).then(() => undefined);
      at = leg;
      if (leg !== to) {
        sfx.tick({ freq: 1600, gain: 0.03 });
        if (to > from) {
          setPop({ k: Date.now(), at: leg });
          sfx.note(1046, { at: 0.25, dur: 0.15, gain: 0.025, bell: 0.4 });
        }
        await new Promise((r) => setTimeout(r, to > from ? 1000 : 120));
      }
    }
  };
  const goStep = async (i: number) => {
    const s = steps[i];
    if (!s) return;
    setStep(i);
    onStep?.(i);
    sfx.tick({ freq: 2400, gain: 0.03 });
    await drive(s.at);
    if (s.id === "done") {
      sfx.note(784, { dur: 0.25, gain: 0.045, bell: 0.5 });
      sfx.note(1175, { at: 0.1, dur: 0.5, gain: 0.04, bell: 0.6 });
    }
  };

  // autoplay: the whole journey, from leaving the depot to the door, then a look back
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 520) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      setGhost(true);
      await Promise.all([
        animate(gx, r.left - cb.left + r.width / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
        animate(gy, r.top - cb.top + r.height / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(100);
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1000);
      while (ok()) {
        dist.set(steps[2].at);
        setStep(2);
        setNoted(false);
        await wait(1200);
        if (!ok()) return;
        // live: it sets off
        setStep(3);
        await drive(steps[3].at);
        await wait(900);
        if (!ok()) return;
        await go("[data-note]");
        await tap();
        setNoted(true);
        sfx.note(988, { dur: 0.15, gain: 0.03 });
        await wait(1100);
        if (!ok()) return;
        setGhost(false);
        setStep(4);
        await drive(1);
        sfx.note(784, { dur: 0.25, gain: 0.045, bell: 0.5 });
        sfx.note(1175, { at: 0.1, dur: 0.5, gain: 0.04, bell: 0.6 });
        await wait(2600);
        if (!ok()) return;
        // look back at when it was packed
        await go('[data-step="1"]');
        await tap();
        await goStep(1);
        await wait(1500);
        setGhost(false);
        await wait(600);
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const s = steps[step];
  const vanColor = done ? "#30d158" : "#0071e3";

  return (
    <div
      className={`relative w-full max-w-[400px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 30,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -34px rgba(0,0,0,0.35)",
          padding: "20px 20px 18px",
        }}
      >
        {/* when */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 600,
              color: done ? "#248a3d" : "#86868b",
              transition: "color 0.4s",
            }}
          >
            {done ? "Delivered" : title}
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "#86868b",
            }}
          >
            <Ico d={I.pkg} size={13} />
            {items}
          </span>
        </div>
        <div
          style={{
            position: "relative",
            height: 40,
            overflow: "hidden",
            marginTop: 2,
          }}
          aria-live="polite"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={s.eta}
              initial={{ y: 30, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -30, opacity: 0, filter: "blur(4px)" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
                filter: { duration: 0.25 },
              }}
              style={{
                position: "absolute",
                inset: 0,
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {s.eta}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ fontSize: 13.5, color: "#6e6e73", marginTop: 2 }}>
          {done
            ? s.note
            : step === 3
              ? ahead
                ? `${ahead} stop${ahead > 1 ? "s" : ""} before yours`
                : "You're next"
              : s.note}
        </div>

        {/* the map: a ground plane the camera looks across, with pins standing up out of it */}
        <div
          ref={wrap}
          style={{
            position: "relative",
            marginTop: 14,
            borderRadius: 20,
            overflow: "hidden",
            background: "#dde1e6",
            height: HV * k,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: W,
              height: HV,
              transform: `scale(${k})`,
              transformOrigin: "0 0",
              perspective: 520,
              perspectiveOrigin: `${AX}px ${HV * 0.28}px`,
            }}
          >
            <motion.div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: W,
                height: H,
                transformStyle: "preserve-3d",
                transform: plane,
                transformOrigin: planeOrigin,
              }}
            >
              <svg
                viewBox={`-160 -200 ${W + 320} ${H + 300}`}
                width={W + 320}
                height={H + 300}
                style={{
                  position: "absolute",
                  left: -160,
                  top: -200,
                  display: "block",
                  overflow: "visible",
                }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ot-water" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#cfe2f7" />
                    <stop offset="0.5" stopColor="#dcebfb">
                      {!reduce && (
                        <animate attributeName="offset" values="0.2;0.8;0.2" dur="7s" repeatCount="indefinite" />
                      )}
                    </stop>
                    <stop offset="1" stopColor="#cfe2f7" />
                  </linearGradient>
                </defs>
                {/* the ground is the blocks; streets are drawn over it */}
                <rect x={-160} y={-200} width={W + 320} height={H + 300} fill="#dde1e6" />
                <path
                  d="M -160 150 C -60 120 40 128 80 150 S 170 196 236 190 C 300 186 380 200 480 186 L 480 120 L 480 260 L -160 260 Z"
                  fill="url(#ot-water)"
                />
                <rect x="146" y="8" width="70" height="44" rx="10" fill="#d4ead0" />
                <rect x="256" y="86" width="24" height="48" rx="8" fill="#d4ead0" />
                <rect x="-120" y="-150" width="110" height="80" rx="14" fill="#d4ead0" />
                {[
                  [158, 18],
                  [172, 30],
                  [188, 20],
                  [200, 36],
                  [166, 42],
                  [204, 16],
                  [262, 96],
                  [270, 112],
                  [264, 124],
                  [-100, -130],
                  [-80, -110],
                  [-50, -126],
                  [-30, -96],
                  [-70, -88],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={3 + (i % 3)} fill="#bcdcb4" />
                ))}
                {/* buildings: little raised roofs */}
                {[
                  [8, 10, 34, 20],
                  [48, 12, 40, 16],
                  [10, 60, 30, 24],
                  [70, 58, 36, 14],
                  [70, 76, 36, 12],
                  [142, 70, 34, 30],
                  [184, 72, 36, 26],
                  [256, 10, 30, 22],
                  [292, 12, 40, 34],
                  [142, 122, 36, 12],
                  [184, 120, 36, 16],
                  [10, 116, 40, 18],
                  [70, 118, 40, 16],
                  [-60, 60, 50, 30],
                  [-120, 10, 50, 24],
                  [360, 70, 60, 30],
                  [360, 10, 40, 30],
                  [150, -60, 60, 30],
                  [240, -70, 60, 40],
                  [20, -60, 80, 30],
                  [360, 120, 50, 40],
                  [-110, 100, 60, 30],
                ].map(([x, y, w, h], i) => (
                  <g key={i}>
                    <rect x={x} y={y + 2.5} width={w} height={h} rx="4" fill="#c9ced6" />
                    <rect x={x} y={y} width={w} height={h} rx="4" fill="#ebedf1" />
                  </g>
                ))}
                {/* streets */}
                <g stroke="#ffffff" strokeLinecap="round" fill="none">
                  <path
                    d="M -160 44 H 500 M -160 110 H 500 M 124 -200 V 400 M 234 -200 V 400 M 234 62 H 500 M 296 62 V 400 M 60 -200 V 400 M -30 -200 V 400 M 400 -200 V 400 M -160 -20 H 500"
                    strokeWidth="10"
                  />
                  <path
                    d="M -160 140 L 124 140 M 180 -200 V 110 M 270 110 V 400 M -160 86 H 124 M 340 -200 V 62 M -160 -100 H 500"
                    strokeWidth="5"
                  />
                </g>
                {/* a few other cars going about their day */}
                {!reduce &&
                  [
                    ["M -160 110 H 500", "11s", "#ffffff"],
                    ["M 234 400 V -200", "9s", "#ffffff"],
                    ["M 500 44 H -160", "13s", "#f4f4f6"],
                    ["M 60 -200 V 400", "10s", "#ffffff"],
                  ].map(([d, dur, c], i) => (
                    <rect
                      key={i}
                      x="-3.5"
                      y="-1.8"
                      width="7"
                      height="3.6"
                      rx="1.8"
                      fill={c}
                      stroke="#b8bec7"
                      strokeWidth="0.8"
                    >
                      <animateMotion path={d} dur={dur} begin={`${-i * 2.3}s`} repeatCount="indefinite" rotate="auto" />
                    </rect>
                  ))}
                {/* the route: the way ahead marching towards you, the part driven solid */}
                <path
                  ref={route}
                  d={ROUTE}
                  stroke="#9cc0f4"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray="1 8"
                >
                  {!reduce && (
                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.1s" repeatCount="indefinite" />
                  )}
                </path>
                <motion.path
                  d={ROUTE}
                  stroke={vanColor}
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={len}
                  style={{ strokeDashoffset: dash, transition: "stroke 0.6s" }}
                />
                {/* arriving: a glint runs the whole way */}
                {done && !reduce && (
                  <motion.path
                    key="glint"
                    d={ROUTE}
                    stroke="#ffffff"
                    strokeOpacity={0.9}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`28 ${len + 40}`}
                    initial={{ strokeDashoffset: 28 }}
                    animate={{ strokeDashoffset: -len }}
                    transition={{
                      duration: 1.1,
                      ease: [0.4, 0, 0.2, 1],
                      delay: 0.2,
                    }}
                  />
                )}
              </svg>

              {/* the van's heading, lying on the road */}
              {!done && (
                <motion.div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: vx,
                    top: vy,
                    width: 46,
                    height: 46,
                    transform: heading,
                    borderRadius: 23,
                    background: `conic-gradient(from 60deg, transparent 0deg, ${vanColor}55 30deg, transparent 60deg)`,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* soft shadows where the pins stand */}
              {[
                [34, 44],
                [296, 142],
              ].map(([x, y]) => (
                <div
                  key={x}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: x - 10,
                    top: y - 4,
                    width: 20,
                    height: 8,
                    borderRadius: "50%",
                    background: "radial-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0))",
                  }}
                />
              ))}
              {!done && (
                <motion.div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: vx,
                    top: vy,
                    width: 22,
                    height: 9,
                    x: "-50%",
                    y: "-50%",
                    borderRadius: "50%",
                    background: "radial-gradient(rgba(0,40,100,0.32), rgba(0,0,0,0))",
                  }}
                />
              )}
            </motion.div>
          </div>
          {/* pins drawn flat on top, placed where the camera sees their spot on the map */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: W,
              height: HV,
              transform: `scale(${k})`,
              transformOrigin: "0 0",
              pointerEvents: "none",
            }}
          >
            {/* other drop-offs: a check once the van has been */}
            {STOPS.map((t) => {
              const r = route.current;
              if (!r) return null;
              const pt = r.getPointAtLength(t * len);
              const been = ahead < STOPS.length - STOPS.indexOf(t) || done;
              return (
                <Pin key={t} x={pt.x} y={pt.y} cam={cam}>
                  <motion.div
                    animate={{
                      scale: been ? 1 : 0.8,
                      backgroundColor: been ? "#30d158" : "#ffffff",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    style={{
                      position: "absolute",
                      left: -8,
                      top: -17,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      boxShadow: been ? "0 0 0 2px #fff" : "inset 0 0 0 2px #86868b",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {been && <Ico d={I.check} size={9} />}
                  </motion.div>
                </Pin>
              );
            })}
            {/* a parcel hops out at each stop */}
            <AnimatePresence>
              {pop && route.current && (
                <Pin
                  key={pop.k}
                  x={route.current.getPointAtLength(pop.at * len).x}
                  y={route.current.getPointAtLength(pop.at * len).y}
                  cam={cam}
                >
                  <motion.div
                    initial={{ y: 0, scale: 0.3, opacity: 0 }}
                    animate={{
                      y: [-6, -30, -26],
                      scale: 1,
                      opacity: [0, 1, 1],
                    }}
                    exit={{ opacity: 0, y: -40, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.6, ease: [0.3, 1.4, 0.5, 1] }}
                    onAnimationComplete={() => window.setTimeout(() => setPop(null), 400)}
                    style={{
                      position: "absolute",
                      left: -13,
                      top: -30,
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: "#c69a5b",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 6px 10px -4px rgba(0,0,0,0.4)",
                    }}
                  >
                    <Ico d={I.pkg} size={15} />
                  </motion.div>
                </Pin>
              )}
            </AnimatePresence>

            {/* depot */}
            <Pin x={34} y={44} cam={cam}>
              <div
                style={{
                  position: "absolute",
                  left: -13,
                  top: -28,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: "#fff",
                  color: "#6e6e73",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 2px 6px -2px rgba(0,0,0,0.25)",
                }}
              >
                <Ico d={I.store} size={13} />
              </div>
            </Pin>
            {/* your door */}
            <Pin x={296} y={142} cam={cam}>
              {!reduce && !done && (
                <motion.span
                  animate={{ scale: [0.8, 2.4], opacity: [0.28, 0] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  style={{
                    position: "absolute",
                    left: -16,
                    top: -34,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: "#1d1d1f",
                  }}
                />
              )}
              <AnimatePresence>
                {done && (
                  <motion.span
                    key="ripple"
                    initial={{ scale: 0.6, opacity: 0.6 }}
                    animate={{ scale: 3.4, opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      left: -16,
                      top: -34,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      background: "#30d158",
                    }}
                  />
                )}
              </AnimatePresence>
              <motion.div
                animate={{
                  backgroundColor: done ? "#30d158" : "#1d1d1f",
                  scale: done ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.45 }}
                style={{
                  position: "absolute",
                  left: -16,
                  top: -34,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 0 0 3px #fff, 0 6px 12px -4px rgba(0,0,0,0.35)",
                }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={done ? "c" : "h"}
                    initial={{ scale: 0, rotate: -60 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    style={{ display: "grid" }}
                  >
                    <Ico d={done ? I.check : I.home} size={15} />
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </Pin>
            {/* the van */}
            <Pin x={vx} y={vy} cam={cam}>
              {!done && !reduce && (
                <motion.span
                  animate={{ scale: [1, 2.1], opacity: [0.32, 0] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  style={{
                    position: "absolute",
                    left: -16,
                    top: -34,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: vanColor,
                  }}
                />
              )}
              <motion.div
                animate={{ opacity: done ? 0 : 1, scale: done ? 0.4 : 1 }}
                style={{
                  position: "absolute",
                  left: -16,
                  top: -34,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: "#fff",
                  color: vanColor,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 6px 14px -4px rgba(0,60,140,0.55)",
                }}
              >
                <motion.span style={{ display: "grid", scaleX: flip }}>
                  <Ico d={I.truck} size={17} />
                </motion.span>
              </motion.div>
              {/* minutes away, riding above it */}
              <AnimatePresence>
                {following && (
                  <motion.div
                    key="eta"
                    initial={{ opacity: 0, y: 6, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: -60,
                      x: "-50%",
                      padding: "3px 8px",
                      borderRadius: 9,
                      background: "#1d1d1f",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 650,
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      boxShadow: "0 6px 12px -6px rgba(0,0,0,0.5)",
                    }}
                  >
                    {mins} min
                  </motion.div>
                )}
              </AnimatePresence>
            </Pin>
          </div>
          {/* haze towards the horizon */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: "24%",
              background: "linear-gradient(rgba(240,242,245,0.95), rgba(240,242,245,0))",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* the steps */}
        <div
          role="list"
          aria-label="Delivery progress"
          style={{ position: "relative", display: "flex", marginTop: 16 }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: `${50 / steps.length}%`,
              right: `${50 / steps.length}%`,
              top: 9,
              height: 2,
              borderRadius: 1,
              background: "#e5e5ea",
            }}
          />
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{
              scaleX: step / (steps.length - 1),
              backgroundColor: vanColor,
            }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
            style={{
              position: "absolute",
              left: `${50 / steps.length}%`,
              right: `${50 / steps.length}%`,
              top: 9,
              height: 2,
              borderRadius: 1,
              transformOrigin: "0 50%",
            }}
          />
          {steps.map((st, i) => {
            const past = i <= step;
            const now = i === step;
            return (
              <button
                key={st.id}
                type="button"
                role="listitem"
                data-step={i}
                aria-current={now ? "step" : undefined}
                aria-label={`${st.label}${i <= current ? `, ${st.time}` : ""}`}
                onClick={() => {
                  touched.current = true;
                  void goStep(i);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                style={{
                  position: "relative",
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  border: 0,
                  background: "transparent",
                  padding: 0,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <motion.span
                  animate={{
                    scale: now ? 1.25 : 1,
                    backgroundColor: past ? vanColor : "#ffffff",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    boxShadow: past ? "0 0 0 3px #fff" : "inset 0 0 0 2px #d2d2d7, 0 0 0 3px #fff",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                  }}
                >
                  {past && !now && <Ico d={I.check} size={10} />}
                  {now && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: "#fff",
                      }}
                    />
                  )}
                </motion.span>
                <span
                  style={{
                    fontSize: 11.5,
                    lineHeight: 1.2,
                    textAlign: "center",
                    fontWeight: now ? 650 : 500,
                    color: past ? "#1d1d1f" : "#a1a1a6",
                    minHeight: "1.2em",
                  }}
                >
                  {st.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#a1a1a6",
                    fontVariantNumeric: "tabular-nums",
                    marginTop: -4,
                  }}
                >
                  {i <= Math.max(current, step) ? st.time : " "}
                </span>
              </button>
            );
          })}
        </div>

        {/* the driver */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: "#e9f1ff",
              display: "grid",
              placeItems: "center",
              flex: "none",
            }}
          >
            <img
              src={driver.avatar}
              alt=""
              width={30}
              height={30}
              draggable={false}
              style={{ width: 30, height: 30 }}
            />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 650 }}>{driver.name}, your driver</div>
            <div style={{ position: "relative", height: 17, overflow: "hidden" }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={noted ? "n" : "o"}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    fontSize: 12.5,
                    color: noted ? "#248a3d" : "#86868b",
                    whiteSpace: "nowrap",
                  }}
                >
                  {noted ? "Note sent: leave it at the door" : "Van 4, plate KX 21 BLU"}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <motion.button
            type="button"
            aria-label={`Call ${driver.name}`}
            whileTap={{ scale: 0.88 }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              border: 0,
              background: "#f5f5f7",
              color: "#1d1d1f",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Ico d={I.phone} size={16} />
          </motion.button>
          <motion.button
            type="button"
            data-note
            aria-label="Ask the driver to leave it at the door"
            aria-pressed={noted}
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              touched.current = true;
              setNoted((n) => !n);
              sfx.note(988, { dur: 0.15, gain: 0.03 });
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
            animate={{
              backgroundColor: noted ? "#e8f8ec" : "#f5f5f7",
              color: noted ? "#248a3d" : "#1d1d1f",
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              border: 0,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Ico d={I.chat} size={16} />
          </motion.button>
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(29,29,31,0.18)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}

type Cam = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  z: MotionValue<number>;
  t: MotionValue<number>;
};
const PERSP = 520;
/** where a spot on the tilted map lands on screen: the same scale, tilt and perspective the map gets, done by hand */
const project = (X: number, Y: number, cx: number, cy: number, z: number, t: number) => {
  const r = (t * Math.PI) / 180;
  const dx = (X - cx) * z;
  const dy = (Y - cy) * z;
  const x0 = AX + dx;
  const y0 = AY + dy * Math.cos(r);
  const depth = dy * Math.sin(r);
  const f = PERSP / (PERSP - depth);
  const oy = HV * 0.28;
  return [AX + (x0 - AX) * f, oy + (y0 - oy) * f, f] as const;
};
function Pin({
  x,
  y,
  cam,
  children,
}: {
  x: number | MotionValue<number>;
  y: number | MotionValue<number>;
  cam: Cam;
  children: ReactNode;
}) {
  const fx = useMotionValue(typeof x === "number" ? x : x.get());
  const fy = useMotionValue(typeof y === "number" ? y : y.get());
  useEffect(() => {
    if (typeof x === "number") fx.set(x);
    else {
      fx.set(x.get());
      return x.on("change", (v) => fx.set(v));
    }
  }, [x, fx]);
  useEffect(() => {
    if (typeof y === "number") fy.set(y);
    else {
      fy.set(y.get());
      return y.on("change", (v) => fy.set(v));
    }
  }, [y, fy]);
  const transform = useTransform([fx, fy, cam.x, cam.y, cam.z, cam.t], ([X, Y, cx, cy, z, t]: number[]) => {
    const [sx, sy, f] = project(X, Y, cx, cy, z, t);
    return `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) scale(${(0.82 + 0.18 * f).toFixed(3)})`;
  });
  return (
    <motion.div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        transform,
        transformOrigin: "0 0",
      }}
    >
      {children}
    </motion.div>
  );
}

"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose, and effects call helpers declared after them, which exist by the time effects run */


import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type TearOffCouponProps = {
  /** the code printed on the back of the stub */
  code?: string;
  /** the offer, big */
  offer?: string;
  /** under the offer */
  detail?: string;
  brand?: string;
  validity?: string;
  /** the coupon's colours, top left to bottom right */
  colors?: [string, string];
  /** called once the stub is torn off, and when the code is copied */
  onClaim?: (code: string) => void;
  onCopy?: (code: string) => void;
  /** Soft synthesised sounds: paper tearing, the stub landing, the flip. They also follow the site-wide sound switch. */
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
  copy: "<path fill=\"currentColor\" d=\"M216 34H88a6 6 0 0 0-6 6v42H40a6 6 0 0 0-6 6v128a6 6 0 0 0 6 6h128a6 6 0 0 0 6-6v-42h42a6 6 0 0 0 6-6V40a6 6 0 0 0-6-6m-54 176H46V94h116Zm48-48h-36V88a6 6 0 0 0-6-6H94V46h116Z\"/>",
  check: "<path fill=\"currentColor\" d=\"m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z\"/>",
  again: "<path fill=\"currentColor\" d=\"M222 128a94 94 0 0 1-92.74 94H128a93.43 93.43 0 0 1-64.5-25.65a6 6 0 1 1 8.24-8.72A82 82 0 1 0 70 70l-.19.19L39.44 98H72a6 6 0 0 1 0 12H24a6 6 0 0 1-6-6V56a6 6 0 0 1 12 0v34.34L61.63 61.4A94 94 0 0 1 222 128\"/>",
  grab: "<path fill=\"currentColor\" d=\"M188 82a25.85 25.85 0 0 0-14.59 4.49A26 26 0 0 0 128 75.41A26 26 0 0 0 82 92v22H68a26 26 0 0 0-26 26v12a86 86 0 0 0 172 0v-44a26 26 0 0 0-26-26m14 70a74 74 0 0 1-148 0v-12a14 14 0 0 1 14-14h14v26a6 6 0 0 0 12 0V92a14 14 0 0 1 28 0v28a6 6 0 0 0 12 0V92a14 14 0 0 1 28 0v28a6 6 0 0 0 12 0v-12a14 14 0 0 1 28 0Z\"/>",
};

// ── the scene, in css px ──
const W = 340,
  H = 336;
const TX = 10,
  TY = 8,
  TW = 320,
  TH = 138;
const PX = TX + 226; // the perforation
const SW = TX + TW - PX; // the stub's width
const NOTCH = 7;
const HOLE = 2.1;
const HOLES = Array.from({ length: 12 }, (_, k) => TY + 16 + k * 9);
// the bridges of paper between the holes: these are what tear
const CUTS = [TY + NOTCH, ...HOLES, TY + TH - NOTCH];
const BRIDGES = CUTS.slice(0, -1).map((y, k) => (y + (k === 0 ? 0 : HOLE) + CUTS[k + 1] - (k === CUTS.length - 2 ? 0 : HOLE)) / 2);
const BX = PX,
  BY = TY + TH; // the hinge: the bottom end of the perforation
const GIVE = 2.1; // how far a bridge stretches before it snaps, px
// where the stub comes to rest, and how it lies
const REST = { x: 26, y: TY + TH + 30, rot: -4 };

/** the coupon's outline: a rounded ticket whose one edge has the notch and the half of each hole that is its own */
function edgePath(side: "body" | "stub") {
  const r = 11;
  const d: string[] = [];
  if (side === "body") {
    d.push(`M${TX + r} ${TY}`, `L${PX - NOTCH} ${TY}`, `A${NOTCH} ${NOTCH} 0 0 0 ${PX} ${TY + NOTCH}`);
    for (const y of HOLES) d.push(`L${PX} ${y - HOLE}`, `A${HOLE} ${HOLE} 0 0 0 ${PX} ${y + HOLE}`);
    d.push(`L${PX} ${TY + TH - NOTCH}`, `A${NOTCH} ${NOTCH} 0 0 0 ${PX - NOTCH} ${TY + TH}`);
    d.push(`L${TX + r} ${TY + TH}`, `Q${TX} ${TY + TH} ${TX} ${TY + TH - r}`, `L${TX} ${TY + r}`, `Q${TX} ${TY} ${TX + r} ${TY}`, "Z");
  } else {
    // in the stub's own coordinates, its top left at the perforation's top
    d.push(`M${NOTCH} 0`, `L${SW - r} 0`, `Q${SW} 0 ${SW} ${r}`, `L${SW} ${TH - r}`, `Q${SW} ${TH} ${SW - r} ${TH}`, `L${NOTCH} ${TH}`, `A${NOTCH} ${NOTCH} 0 0 0 0 ${TH - NOTCH}`);
    for (const y of [...HOLES].reverse()) d.push(`L0 ${y - TY + HOLE}`, `A${HOLE} ${HOLE} 0 0 0 0 ${y - TY - HOLE}`);
    d.push(`L0 ${NOTCH}`, `A${NOTCH} ${NOTCH} 0 0 0 ${NOTCH} 0`, "Z");
  }
  return d.join(" ");
}
/** a few torn fibres sticking out where a bridge broke */
const fuzz = (x: number, y: number, dir: 1 | -1, seed: number) => {
  const j = (k: number) => ((Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
  return `M${x} ${y - 1.9} L${x + dir * (0.6 + j(1))} ${y - 1.2} L${x + dir * 0.3} ${y - 0.6} L${x + dir * (1 + j(2) * 1.2)} ${y} L${x + dir * 0.4} ${y + 0.5} L${x + dir * (0.5 + j(3))} ${y + 1.3} L${x} ${y + 1.9} Z`;
};

type Mode = "attached" | "free" | "landing" | "landed";

/**
 * A promo-code coupon you claim by tearing off its stub.
 *
 * Pull the stub away and it hinges about the bottom of the perforation, the way paper does: every little bridge of
 * paper between the holes stretches by the angle times its distance from the hinge and snaps when it passes its give,
 * so the tear runs down the perforation hole by hole from the top, with a rip for each, each side keeping its half
 * of every hole and a few torn fibres, and the last bridges near the hinge hold on hardest. Let go before it is free
 * and it springs back. Once it comes away it hangs from your finger as a pendulum and swings with your hand; let go
 * and it drops onto the tray below, flips over, and shows the code with a copy button. The Tear off button does the
 * same for keyboards.
 *   <TearOffCoupon code="LMN-20X4" offer="20% off" onClaim={(c) => track("claimed", c)} />
 */
export default function TearOffCoupon({
  code = "LMN-20X4",
  offer = "20% off",
  detail = "your first order",
  brand = "Lumen",
  validity = "Valid until 31 Dec",
  colors = ["#0a84ff", "#5e5ce6"],
  onClaim,
  onCopy,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: TearOffCouponProps) {
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
  const sceneRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const strandsRef = useRef<SVGGElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const [scale, setScale] = useState(1);
  const [mode, setMode] = useState<Mode>("attached");
  const [broken, setBroken] = useState<boolean[]>(() => BRIDGES.map(() => false));
  const [copied, setCopied] = useState(false);
  const cb = useRef({ onClaim, onCopy });
  cb.current = { onClaim, onCopy };
  const vol = useRef(volume);
  vol.current = volume;

  // the stub's pose: a translation and a turn about the hinge, and a flip
  const tx = useMotionValue(0),
    ty = useMotionValue(0),
    rot = useMotionValue(0),
    flip = useMotionValue(0),
    stubA = useMotionValue(1);
  // the stub peeling up off the page as it tears, and fluttering as it swings; the whole ticket tilting under the hand
  const lift = useMotionValue(0);
  const peelShade = useTransform(lift, (l) => Math.min(0.35, Math.abs(l) / 70));
  const tiltX = useMotionValue(0),
    tiltY = useMotionValue(0);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0, hover: false });
  const foilRef = useRef<HTMLCanvasElement>(null);

  const sim = useRef({
    mode: "attached" as Mode,
    theta: 0, // radians, opening about the hinge
    target: 0,
    dragging: false,
    scripted: false,
    grab: { x: SW * 0.7, y: TH * 0.3 }, // where it is held, in the stub's own coordinates
    pointer: { x: 0, y: 0 },
    broken: BRIDGES.map(() => false),
    lastBreak: 0,
    c: { x: 0, y: 0 },
    cPrev: { x: 0, y: 0 },
    phi: 0, // turn while free, radians
    vel: { x: 0, y: 0, r: 0 },
    specks: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
  });

  // fit the scene to the card
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rip = (big = false) => {
    const e = engine();
    if (!e || !(enableSound && siteSound) || !(touched.current || autoplayOk.current) || vol.current <= 0 || e.ctx.state !== "running") return;
    const { ctx, noise } = e;
    const t = ctx.currentTime + 0.005;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = big ? 1900 : 2600 + Math.random() * 1800;
    bp.Q.value = big ? 0.8 : 1.4;
    const g = ctx.createGain();
    const peak = (big ? 0.2 : 0.09) * vol.current;
    const dur = big ? 0.16 : 0.035 + Math.random() * 0.02;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  };

  /** where a point of the stub (its own coordinates) is in the scene, for the current pose */
  const toScene = (lx: number, ly: number, theta: number, ox = 0, oy = 0) => {
    // the stub turns about its bottom left corner, which is the hinge
    const dx = lx - 0,
      dy = ly - TH;
    const c = Math.cos(theta),
      s = Math.sin(theta);
    return { x: BX + ox + dx * c - dy * s, y: BY + oy + dx * s + dy * c };
  };
  const pointerAt = (e: { clientX: number; clientY: number }) => {
    const r = sceneRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  };

  // ── the loop ──
  useEffect(() => {
    if (!inView) return;
    let raf = 0,
      last = performance.now();
    const foil = foilRef.current ? makeFoil(foilRef.current) : null;
    const s = sim.current;
    const frame = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(frame);
      // the ticket tilts toward the hand while it is whole; idle, the foil drifts by itself
      const tl = tilt.current;
      const live = s.mode === "attached" && !reduce;
      const tx2 = live ? (tl.hover ? tl.tx : Math.sin(now / 1700) * 0.35) : 0,
        ty2 = live ? (tl.hover ? tl.ty : Math.cos(now / 2300) * 0.25) : 0;
      tl.x += (tx2 - tl.x) * Math.min(1, dt * 5);
      tl.y += (ty2 - tl.y) * Math.min(1, dt * 5);
      tiltY.set(tl.x * 7);
      tiltX.set(-tl.y * 6);
      foil?.render(now / 1000, tl.x, tl.y);
      if (s.mode === "attached") {
        if (s.scripted) s.target = Math.min(0.5, s.target + dt * (0.08 + s.target * 2.2));
        const want = s.dragging || s.scripted ? Math.max(-0.02, s.target) : 0;
        // the paper allows only as much opening as its topmost whole bridge can stretch
        const top = s.broken.indexOf(false);
        const allow = top < 0 ? Infinity : GIVE / Math.max(1, BY - BRIDGES[top]);
        let th = s.theta + (want - s.theta) * Math.min(1, dt * 22);
        if (th > allow) {
          // the bridge holds, stretching a little under the strain, until it is pulled well past its give
          th = allow + Math.min(0.012, (th - allow) * 0.25);
          if (want > allow + 0.055 && now - s.lastBreak > 55) {
            s.lastBreak = now;
            s.broken[top] = true;
            setBroken(s.broken.slice());
            const y = BRIDGES[top];
            for (let k = 0; k < 3; k++) s.specks.push({ x: BX + 1, y, vx: 30 + Math.random() * 50, vy: -20 + Math.random() * 40, life: 0 });
            const done = s.broken.every(Boolean);
            rip(done);
            if (done) {
              s.mode = "free";
              setMode("free");
              cb.current.onClaim?.(code);
              // hand it to the pendulum: where its centre is now, moving as it was
              const cNow = toScene(SW / 2, TH / 2, th);
              s.c = { ...cNow };
              s.cPrev = { ...cNow };
              s.phi = th;
              if (!s.dragging) {
                s.mode = "landing";
                setMode("landing");
              }
            }
          }
        }
        s.theta = th;
        rot.set((th * 180) / Math.PI);
        tx.set(0);
        ty.set(0);
        lift.set(reduce ? 0 : -Math.min(1, Math.max(0, th) / 0.2) * 24);
      } else if (s.mode === "free") {
        // hanging from the finger: the centre swings under gravity, held at its distance from the grip
        const g = s.pointer;
        const vx = (s.c.x - s.cPrev.x) * 0.985,
          vy = (s.c.y - s.cPrev.y) * 0.985;
        s.cPrev = { ...s.c };
        s.c.x += vx;
        s.c.y += vy + 900 * dt * dt;
        const L = Math.hypot(SW / 2 - s.grab.x, TH / 2 - s.grab.y) || 1;
        const dx = s.c.x - g.x,
          dy = s.c.y - g.y;
        const d = Math.hypot(dx, dy) || 1;
        s.c.x = g.x + (dx / d) * L;
        s.c.y = g.y + (dy / d) * L;
        const phi = Math.atan2(s.c.y - g.y, s.c.x - g.x) - Math.atan2(TH / 2 - s.grab.y, SW / 2 - s.grab.x);
        s.vel.r = (phi - s.phi) / Math.max(dt, 1e-3);
        s.phi = phi;
        // it flutters in depth as it swings
        lift.set(lift.get() + (Math.max(-32, Math.min(32, -s.vel.r * 7)) - lift.get()) * Math.min(1, dt * 8));
        pose(phi, g.x, g.y, s.grab.x, s.grab.y);
      } else if (s.mode === "landing") {
        // to the tray, on a spring, settling at a slight angle
        const target = restPose();
        const k = 70,
          c = 2 * Math.sqrt(k) * 0.75;
        const cx = tx.get(),
          cy = ty.get(),
          cr = rot.get();
        s.vel.x += (k * (target.x - cx) - c * s.vel.x) * dt;
        s.vel.y += (k * (target.y - cy) - c * s.vel.y) * dt;
        s.vel.r += (k * (target.r - cr) - c * s.vel.r) * dt;
        tx.set(cx + s.vel.x * dt);
        ty.set(cy + s.vel.y * dt);
        rot.set(cr + s.vel.r * dt);
        lift.set(lift.get() * (1 - Math.min(1, dt * 6)));
        if (Math.abs(target.x - cx) + Math.abs(target.y - cy) < 0.6 && Math.abs(s.vel.x) + Math.abs(s.vel.y) < 8) {
          s.mode = "landed";
          setMode("landed");
          sfx.tick({ freq: 700, gain: 0.06 });
          sfx.whoosh(900, 2400, { at: 0.12, dur: 0.3, gain: 0.025 });
          void animate(flip, 180, { type: "spring", stiffness: 120, damping: 15, delay: 0.1 });
        }
      }
      // the stretched bridges, drawn across the opening gap
      const gEl = strandsRef.current;
      if (gEl) {
        const kids = gEl.children;
        BRIDGES.forEach((y, k) => {
          const line = kids[k] as SVGLineElement | undefined;
          if (!line) return;
          if (s.broken[k] || s.mode !== "attached" || s.theta < 0.002) {
            line.setAttribute("opacity", "0");
            return;
          }
          const p = toScene(0, y - TY, s.theta);
          line.setAttribute("x1", String(PX));
          line.setAttribute("y1", String(y));
          line.setAttribute("x2", String(p.x));
          line.setAttribute("y2", String(p.y));
          line.setAttribute("opacity", "1");
        });
        // flecks of paper fibre from each snap
        const sp = kids[BRIDGES.length] as SVGPathElement | undefined;
        if (sp) {
          let d = "";
          for (const q of s.specks) {
            q.life += dt;
            q.vy += 300 * dt;
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            if (q.life < 0.6) d += `M${q.x.toFixed(1)} ${q.y.toFixed(1)}h1.2v0.9h-1.2z`;
          }
          s.specks = s.specks.filter((q) => q.life < 0.6);
          sp.setAttribute("d", d);
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      foil?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  /** set the stub's pose so its own point (gx, gy) sits at (px, py), turned by phi */
  const pose = (phi: number, px: number, py: number, gx: number, gy: number) => {
    const dx = gx - 0,
      dy = gy - TH;
    const c = Math.cos(phi),
      s = Math.sin(phi);
    tx.set(px - BX - (dx * c - dy * s));
    ty.set(py - BY - (dx * s + dy * c));
    rot.set((phi * 180) / Math.PI);
  };
  const restPose = () => {
    const phi = (REST.rot * Math.PI) / 180;
    // centre of the stub to the rest centre
    const cx = REST.x + SW / 2,
      cy = REST.y + TH / 2;
    const dx = SW / 2,
      dy = TH / 2 - TH;
    const c = Math.cos(phi),
      s = Math.sin(phi);
    return { x: cx - BX - (dx * c - dy * s), y: cy - BY - (dx * s + dy * c), r: REST.rot };
  };

  // ── the hand ──
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const s = sim.current;
    if (s.mode !== "attached" && s.mode !== "free") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pointerAt(e);
    // the grip, in the stub's own coordinates (undoing its current turn about the hinge)
    const c = Math.cos(-s.theta),
      sn = Math.sin(-s.theta);
    const dx = p.x - BX,
      dy = p.y - BY;
    s.grab = { x: dx * c - dy * sn, y: dx * sn + dy * c + TH };
    s.dragging = true;
    s.pointer = p;
    s.target = s.theta;
    sfx.tick({ freq: 1400, gain: 0.03 });
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (!s.dragging) return;
    const p = pointerAt(e);
    s.pointer = p;
    if (s.mode === "attached") {
      // the opening that puts the grip under the finger: the angle between them, seen from the hinge
      const a0 = Math.atan2(s.grab.y - TH, s.grab.x),
        a1 = Math.atan2(p.y - BY, p.x - BX);
      let d = a1 - a0;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      s.target = d;
    }
  };
  const onUp = () => {
    const s = sim.current;
    if (!s.dragging) return;
    s.dragging = false;
    if (s.mode === "free") {
      s.vel = { x: 0, y: 0, r: s.vel.r * 0.2 };
      s.mode = "landing";
      setMode("landing");
    }
  };

  const tearOff = (user = true) => {
    if (user) touched.current = true;
    const s = sim.current;
    if (s.mode !== "attached") return;
    if (reduce) {
      s.broken = BRIDGES.map(() => true);
      setBroken(s.broken.slice());
      const r = restPose();
      tx.set(r.x);
      ty.set(r.y);
      rot.set(r.r);
      flip.set(180);
      s.mode = "landed";
      setMode("landed");
      cb.current.onClaim?.(code);
      return;
    }
    s.scripted = true;
    s.target = s.theta;
  };
  const reset = (user = true) => {
    if (user) touched.current = true;
    const s = sim.current;
    void animate(stubA, 0, { duration: 0.2 }).then(() => {
      s.mode = "attached";
      s.theta = 0;
      s.target = 0;
      s.scripted = false;
      s.dragging = false;
      s.broken = BRIDGES.map(() => false);
      s.vel = { x: 0, y: 0, r: 0 };
      setBroken(s.broken.slice());
      tx.set(0);
      ty.set(0);
      rot.set(0);
      flip.set(0);
      setMode("attached");
      setCopied(false);
      void animate(stubA, 1, { duration: 0.3 });
    });
  };
  const copy = async () => {
    touched.current = true;
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      /* the clipboard can be unavailable; the code is still on screen to select */
    }
    cb.current.onCopy?.(code);
    setCopied(true);
    sfx.tick({ freq: 2400, gain: 0.05 });
    window.setTimeout(() => setCopied(false), 1600);
  };

  // ── autoplay: tear, land, a pause, and back ──
  const tearRef = useRef(tearOff);
  tearRef.current = tearOff;
  const resetRef = useRef(reset);
  resetRef.current = reset;
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let alive = true;
    const timers: number[] = [];
    const go = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => alive && !touched.current && fn(), ms));
    const loop = () => {
      go(1000, () => tearRef.current(false));
      go(6200, () => resetRef.current(false));
      go(7000, loop);
    };
    loop();
    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [autoplay, reduce, inView]);

  const bodyPath = useMemo(() => edgePath("body"), []);
  const stubPath = useMemo(() => edgePath("stub"), []);
  const gid = "tc";
  const torn = mode !== "attached";

  return (
    <div ref={rootRef} className={`w-full max-w-[380px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="text-[17px] font-semibold tracking-[-0.02em]">A gift for you</div>
      <div className="mt-0.5 text-[13px] text-[#6e6e73]">{mode === "landed" ? "Here is your code." : "Tear off the stub to claim it."}</div>

      <div ref={wrapRef} className="mt-4 w-full" style={{ height: H * scale }}>
        <div ref={sceneRef} className="relative origin-top-left select-none" style={{ width: W, height: H, transform: `scale(${scale})` }}>
          {/* the tray the stub lands in */}
          <div className="absolute rounded-[16px] border border-dashed border-black/[.12] bg-[#fafafa]" style={{ left: 10, top: REST.y - 14, width: TW, height: TH + 26 }} />
          <AnimatePresence>
            {mode !== "landed" && (
              <motion.div exit={{ opacity: 0 }} className="absolute text-[12px] text-[#86868b]" style={{ left: 150, top: REST.y + TH / 2 - 9 }}>
                Your code lands here
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {mode === "landed" && (
              <motion.div className="absolute" style={{ left: 146, top: REST.y + 8, width: 172 }} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 26 }}>
                <div className="text-[12px] text-[#86868b]">Your code</div>
                <div className="mt-0.5 text-[21px] font-semibold tabular-nums tracking-[0.02em]">{code}</div>
                <div className="mt-0.5 text-[12px] text-[#86868b]">
                  {offer} {detail}. {validity}.
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button type="button" onClick={copy} className="flex h-9 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-3.5 text-[13px] font-medium text-white outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#0071e3]">
                    <svg viewBox="0 0 256 256" width="14" height="14" aria-hidden="true" dangerouslySetInnerHTML={{ __html: copied ? ICON.check : ICON.copy }} />
                    {copied ? "Copied" : "Copy code"}
                  </button>
                  <button type="button" onClick={() => reset()} aria-label="Start over" className="grid h-9 w-9 place-items-center rounded-full text-[#6e6e73] outline-none hover:bg-[#f2f2f4] focus-visible:shadow-[0_0_0_2px_#0071e3]">
                    <svg viewBox="0 0 256 256" width="16" height="16" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.again }} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="absolute inset-0"
            style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900, transformOrigin: `${TX + TW / 2}px ${TY + TH / 2}px` }}
            onPointerMove={(e) => {
              const r = sceneRef.current!.getBoundingClientRect();
              const x = ((e.clientX - r.left) / scale - TX) / TW,
                y = ((e.clientY - r.top) / scale - TY) / TH;
              const t = tilt.current;
              t.hover = x > -0.1 && x < 1.1 && y > -0.2 && y < 1.2;
              t.tx = (x - 0.5) * 2;
              t.ty = (y - 0.5) * 2;
            }}
            onPointerLeave={() => (tilt.current.hover = false)}
          >
          {/* the coupon's body */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute left-0 top-0 overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id={`${gid}-fill`} x1={TX} y1={TY} x2={TX + TW} y2={TY + TH} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={colors[0]} />
                <stop offset="1" stopColor={colors[1]} />
              </linearGradient>
              <linearGradient id={`${gid}-sheen`} x1="0" y1={TY} x2="0" y2={TY + TH} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
                <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <filter id={`${gid}-shadow`} x="-10%" y="-20%" width="120%" height="150%">
                <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#1d2c6a" floodOpacity="0.22" />
              </filter>
            </defs>
            <g filter={`url(#${gid}-shadow)`}>
              <path d={bodyPath} fill={`url(#${gid}-fill)`} />
            </g>
            <path d={bodyPath} fill={`url(#${gid}-sheen)`} />
            {/* a faint guilloche of curves in the corner, like printed security lines */}
            <g stroke="#fff" strokeOpacity="0.13" fill="none">
              {Array.from({ length: 7 }, (_, k) => (
                <circle key={k} cx={PX - 20} cy={TY + TH + 30} r={60 + k * 9} />
              ))}
            </g>
            {/* torn fibres on the body's edge */}
            {BRIDGES.map((y, k) => (broken[k] ? <path key={k} d={fuzz(PX, y, 1, k + 1)} fill={colors[1]} opacity="0.95" /> : null))}
            {/* the perforation's stretched bridges, while it tears */}
            <g ref={strandsRef}>
              {BRIDGES.map((_, k) => (
                <line key={k} stroke={colors[1]} strokeWidth="2.6" strokeLinecap="round" opacity="0" />
              ))}
              <path fill={colors[1]} />
            </g>
          </svg>
          {/* holographic foil and a coated sheen, clipped to the body's outline */}
          <canvas ref={foilRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0" style={{ width: W, height: TY + TH, clipPath: `path("${bodyPath}")` }} />
          <div className="pointer-events-none absolute text-white" style={{ left: TX + 22, top: TY + 20, width: PX - TX - 40 }}>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold opacity-90">
              <span className="inline-block h-3.5 w-3.5 rounded-full" style={{ boxShadow: "inset 0 0 0 1.25px rgba(255,255,255,.75)" }} />
              {brand}
            </div>
            <div className="mt-4 text-[40px] font-semibold leading-none tracking-[-0.04em]">{offer}</div>
            <div className="mt-1.5 text-[14px] font-medium opacity-90">{detail}</div>
          </div>

          {/* the stub */}
          <motion.div
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="absolute touch-none"
            style={{
              left: PX,
              top: TY,
              width: SW,
              height: TH,
              x: tx,
              y: ty,
              rotate: rot,
              opacity: stubA,
              transformOrigin: `0px ${TH}px`,
              cursor: mode === "attached" || mode === "free" ? "grab" : "default",
              perspective: 600,
              zIndex: 2,
            }}
          >
            <motion.div className="absolute inset-0" style={{ rotateY: lift, transformStyle: "preserve-3d", transformOrigin: "0px 50%" }}>
            <motion.div className="absolute inset-0" style={{ rotateY: flip, transformStyle: "preserve-3d" }}>
              {/* front */}
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                <svg width={SW} height={TH} viewBox={`0 0 ${SW} ${TH}`} className="absolute inset-0 overflow-visible" aria-hidden="true">
                  <defs>
                    <linearGradient id={`${gid}-sfill`} x1={PX - TX - TW * 0.0} y1="0" x2={SW + 40} y2={TH} gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor={colors[0]} />
                      <stop offset="1" stopColor={colors[1]} />
                    </linearGradient>
                  </defs>
                  <path d={stubPath} fill={`url(#${gid}-sfill)`} style={{ filter: torn ? `drop-shadow(0 ${mode === "free" ? 10 : 4}px ${mode === "free" ? 8 : 5}px rgba(29,44,106,.3))` : undefined }} />
                  {BRIDGES.map((y, k) => (broken[k] ? <path key={k} d={fuzz(0, y - TY, -1, k + 9)} fill={colors[1]} opacity="0.95" /> : null))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                  <svg viewBox="0 0 256 256" width="22" height="22" aria-hidden="true" className="opacity-90" dangerouslySetInnerHTML={{ __html: ICON.grab }} />
                  <div className="text-center text-[12px] font-semibold leading-tight">
                    Tear to
                    <br />
                    claim
                  </div>
                </div>
                <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: peelShade, background: "linear-gradient(90deg, rgba(10,20,60,.55), rgba(10,20,60,0) 70%)", clipPath: `path("${stubPath}")` }} />
              </div>
              {/* back: the code */}
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <svg width={SW} height={TH} viewBox={`0 0 ${SW} ${TH}`} className="absolute inset-0 overflow-visible" aria-hidden="true">
                  <path d={stubPath} fill="#fffdf8" transform={`scale(-1 1) translate(${-SW} 0)`} style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,.18))" }} />
                  {BRIDGES.map((y, k) => (broken[k] ? <path key={k} d={fuzz(SW, y - TY, 1, k + 9)} fill="#f2ede1" /> : null))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between px-2 py-3 text-[#1d1d1f]">
                  <div className="text-[10px] font-semibold" style={{ color: colors[1] }}>
                    {brand}
                  </div>
                  <div className="text-center text-[13px] font-semibold leading-tight tabular-nums">{code}</div>
                  {/* a printed barcode */}
                  <div className="flex h-[26px] items-stretch gap-[1px]">
                    {Array.from({ length: 26 }, (_, k) => (
                      <span key={k} className="bg-[#1d1d1f]" style={{ width: ((k * 7 + code.length * 3) % 5) % 3 === 0 ? 2 : 1, opacity: (k * 11) % 7 === 0 ? 0 : 1 }} />
                    ))}
                  </div>
                  <div className="text-[10px] text-[#86868b]">{offer}</div>
                </div>
              </div>
            </motion.div>
            </motion.div>
          </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[12px] text-[#86868b]">{mode === "attached" ? "Pull the stub away from the ticket." : mode === "free" ? "Let go to drop it in the tray." : " "}</div>
        {mode === "attached" && (
          <button type="button" onClick={() => tearOff()} className="rounded-full px-3 py-1.5 text-[13px] font-medium text-[#0071e3] outline-none hover:bg-[#f2f7ff] focus-visible:shadow-[0_0_0_2px_#0071e3]">
            Tear off
          </button>
        )}
      </div>
    </div>
  );
}

// ───────────── holographic foil, on the GPU ─────────────
const FOIL_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FOIL_FS = `precision highp float;
uniform vec2 uRes; uniform float uDpr, uT; uniform vec2 uTilt;
uniform vec2 uStrip; uniform vec3 uLogo;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
// thin-film interference: the colour a film of this thickness reflects, seen at this angle
vec3 film(float d){
  vec3 w = vec3(0.65, 0.53, 0.45);
  return 0.5 + 0.5 * cos(6.2832 * (d / w) + vec3(0.0, 0.6, 1.2));
}
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  float view = 0.55 + 0.35 * uTilt.x + 0.25 * uTilt.y;
  // a diffraction grating: fine lines whose colour shifts with the angle you look from
  float grating = dot(p, normalize(vec2(0.8, 0.6))) * 0.045 + view * 1.8;
  float thick = 1.1 + 0.35 * n2(p * vec2(0.02, 0.012) + uT * 0.04) + grating * 0.6 + p.y * 0.004;
  vec3 rain = film(thick);
  // a guilloche pattern pressed into the strip
  float gl1 = 0.5 + 0.5 * sin((p.y + p.x * 0.6) * 1.6);
  float stripM = smoothstep(uStrip.x - 0.6, uStrip.x + 0.6, p.x) * (1.0 - smoothstep(uStrip.y - 0.6, uStrip.y + 0.6, p.x));
  float logoM = 1.0 - smoothstep(uLogo.z - 0.8, uLogo.z + 0.4, length(p - uLogo.xy));
  float m = max(stripM, logoM);
  vec3 foil = mix(vec3(0.88, 0.91, 0.98), rain, 0.55) * (0.9 + 0.1 * gl1);
  float glint = exp(-pow((fract(view * 0.8 + p.y * 0.006) - 0.5) * 5.0, 2.0)) * 0.35;
  foil += glint;
  // the coated paper's sheen: a soft band of light sliding across as it tilts
  float s = dot(p / uRes, vec2(0.75, 0.45)) - (0.45 + 0.35 * uTilt.x + 0.2 * uTilt.y);
  float sheen = exp(-s * s * 26.0) * 0.16;
  float a = m * 0.94 + sheen * (1.0 - m);
  vec3 c = foil * m * 0.94 + vec3(1.0) * sheen * (1.0 - m);
  gl_FragColor = vec4(c, a);
}`;
function makeFoil(canvas: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round((TY + TH) * dpr);
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const sh = (t: number, src: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, src);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const vs = sh(gl.VERTEX_SHADER, FOIL_VS),
    fs = sh(gl.FRAGMENT_SHADER, FOIL_FS);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "p");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  gl.uniform2f(u("uRes"), W, TY + TH);
  gl.uniform1f(u("uDpr"), dpr);
  // a security strip just before the perforation, and the brand's little round mark in foil
  gl.uniform2f(u("uStrip"), PX - 26, PX - 12);
  gl.uniform3f(u("uLogo"), TX + 29, TY + 28.5, 7);
  const uT = u("uT"),
    uTilt = u("uTilt");
  return {
    render(t: number, tx: number, ty: number) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uT, t);
      gl.uniform2f(uTilt, tx, ty);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}

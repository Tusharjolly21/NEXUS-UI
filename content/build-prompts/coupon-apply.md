# Coupon Apply

Add the "Coupon Apply" component from Nexus UI to my project.

A checkout where the coupon is a holographic foil stamp you can watch being spent. It tilts toward your pointer with the foil sliding through peach, lilac, sky and mint; apply it and it dissolves into thousands of specks that fall in a whirlpool down the order and pour into the total, where the old price is struck through and the new one rises into place. Remove it and the stamp comes back.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { CouponApply } from "@/components/coupon-apply";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/coupon-apply/coupon-apply.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type CouponApplyProps = {
  code?: string;
  brand?: string;
  /** the discount, as a fraction from 0 to 1 */
  discount?: number;
  subtotal?: number;
  delivery?: number;
  currency?: string;
  onApply?: (code: string) => void;
  onRemove?: (code: string) => void;
  onPlaceOrder?: () => void;
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
const engine = () =>
  (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ??
  null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
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
  whoosh: (
    from: number,
    to: number,
    o?: { at?: number; dur?: number; gain?: number },
  ) => void;
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
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running"
        ? e
        : null;
    };
    const env = (
      ctx: AudioContext,
      t: number,
      peak: number,
      attack: number,
      dur: number,
    ) => {
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
        if (o.glide)
          a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide)
            b.frequency.exponentialRampToValueAtTime(
              o.glide * 2.76,
              t + dur * 0.6,
            );
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
        g.gain.exponentialRampToValueAtTime(
          Math.max(0.0002, peak),
          t + dur * 0.35,
        );
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

const sans =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif";
const mono = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace";
const SW = 272,
  SH = 104,
  BITE = 4.2,
  STEP = 13; // the stamp, its scalloped edge
const FOIL = [
  "#ffd9c7",
  "#f3d2ff",
  "#cfe4ff",
  "#c9f7e6",
  "#fff1c2",
  "#ffd2e6",
  "#ffd9c7",
];
const I = {
  check:
    "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32",
  tag: "m246.15 133.18l-99.32-99.32A19.85 19.85 0 0 0 132.69 28H40a12 12 0 0 0-12 12v92.69a19.85 19.85 0 0 0 5.86 14.14l99.32 99.32a20 20 0 0 0 28.28 0l84.69-84.69a20 20 0 0 0 0-28.28m-98.83 93.17L52 131V52h79l95.32 95.32ZM104 88a16 16 0 1 1-16-16a16 16 0 0 1 16 16",
  x: "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none" }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);
const money = (n: number, cur: string) =>
  `${n < 0 ? "−" : ""}${cur}${Math.abs(n).toFixed(2)}`;

/** the outline of a postage stamp: a rectangle whose every edge is bitten into small half circles */
function stampPath(w: number, h: number) {
  const d: string[] = [];
  const nx = Math.round(w / STEP),
    ny = Math.round(h / STEP);
  const sx = w / nx,
    sy = h / ny;
  d.push(`M0 0`);
  for (let i = 0; i < nx; i++)
    d.push(
      `L${i * sx + sx / 2 - BITE} 0`,
      `A${BITE} ${BITE} 0 0 0 ${i * sx + sx / 2 + BITE} 0`,
    );
  d.push(`L${w} 0`);
  for (let i = 0; i < ny; i++)
    d.push(
      `L${w} ${i * sy + sy / 2 - BITE}`,
      `A${BITE} ${BITE} 0 0 0 ${w} ${i * sy + sy / 2 + BITE}`,
    );
  d.push(`L${w} ${h}`);
  for (let i = nx - 1; i >= 0; i--)
    d.push(
      `L${i * sx + sx / 2 + BITE} ${h}`,
      `A${BITE} ${BITE} 0 0 0 ${i * sx + sx / 2 - BITE} ${h}`,
    );
  d.push(`L0 ${h}`);
  for (let i = ny - 1; i >= 0; i--)
    d.push(
      `L0 ${i * sy + sy / 2 + BITE}`,
      `A${BITE} ${BITE} 0 0 0 0 ${i * sy + sy / 2 - BITE}`,
    );
  d.push("Z");
  return d.join(" ");
}
const STAMP = stampPath(SW, SH);

/** the stamp drawn on a canvas, so it can be read back pixel by pixel and turned into particles */
function paintStamp(code: string, brand: string, pct: string) {
  const c = document.createElement("canvas");
  c.width = SW;
  c.height = SH;
  const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, SW, SH * 1.3);
  FOIL.forEach((f, i) => gr.addColorStop(i / (FOIL.length - 1), f));
  g.fillStyle = gr;
  g.fill(new Path2D(STAMP));
  g.strokeStyle = "rgba(120,90,170,.35)";
  g.setLineDash([2, 3]);
  g.strokeRect(10, 10, SW - 20, SH - 20);
  g.setLineDash([]);
  g.fillStyle = "#5a4a78";
  g.font = `600 11px ${mono}`;
  g.fillText(brand.toUpperCase(), 22, 32);
  g.fillStyle = "#1d1d1f";
  g.font = `800 30px ${sans}`;
  g.fillText(code, 22, 70);
  g.textAlign = "right";
  g.font = `800 26px ${sans}`;
  g.fillText(pct, SW - 22, 52);
  g.font = `600 11px ${sans}`;
  g.fillText("OFF", SW - 22, 70);
  return g.getImageData(0, 0, SW, SH).data;
}

type P = {
  sx: number;
  sy: number;
  r0: number;
  a0: number;
  d: number;
  dur: number;
  col: string;
  size: number;
  spin: number;
};

/**
 * A checkout where the coupon is a foil stamp you can watch being spent.
 *
 * The code sits on a holographic postage stamp with a bitten, scalloped edge; move over it and it tilts toward you,
 * its foil sliding through peach, lilac, sky and mint under a glare that follows your pointer. Apply it, or just tap
 * the stamp, and it dissolves outward from where you touched it into thousands of specks of its own foil and ink.
 * They don't fly in a line: they fall into a whirlpool that drifts down the order and tightens as it goes, until the
 * last of it pours into the total. As it lands the old price is struck through and slides aside, the new one rises
 * into place with a little swell, a lilac coupon line opens in the summary and a tiny stamp is pressed beside the
 * total. Remove it and the stamp comes back. With reduced motion the change simply crossfades.
 */
export default function CouponApply({
  code = "SPRING25",
  brand = "atelier nº7",
  discount = 0.25,
  subtotal = 168,
  delivery = 0,
  currency = "£",
  onApply,
  onRemove,
  onPlaceOrder,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: CouponApplyProps) {
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [stage, setStage] = useState<"ready" | "melting" | "applied">("ready");
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLSpanElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const pct = `${Math.round(discount * 100)}%`;
  const saving = Math.round(subtotal * discount * 100) / 100;
  const applied = stage === "applied";
  const before = subtotal + delivery,
    after = before - saving;

  // tilt, foil and glare
  const tx = useSpring(0, { stiffness: 170, damping: 16 });
  const ty = useSpring(0, { stiffness: 170, damping: 16 });
  const gx = useMotionValue(50),
    gy = useMotionValue(30);
  const rX = useTransform(ty, (v) => v * -9);
  const rY = useTransform(tx, (v) => v * 13);
  const foilPos = useTransform(
    [tx, ty],
    ([a, b]: number[]) => `${50 + a * 45}% ${50 + b * 30}%`,
  );
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.8), rgba(255,255,255,0) 42%)`;
  // the dissolve: a growing hole round where it was touched
  const ox = useMotionValue(50),
    oy = useMotionValue(50),
    hole = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(circle at ${ox}% ${oy}%, transparent ${hole}px, #000 calc(${hole}px + 14px))`;
  const hovering = useRef(false);
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (!hovering.current) {
        const t = (now - t0) / 1000;
        tx.set(Math.sin(t * 0.8) * 0.35);
        ty.set(Math.sin(t * 0.6 + 1) * 0.2);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tx, ty]);
  const onTilt = (e: RPointerEvent) => {
    if (!stamp.current) return;
    const r = stamp.current.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width,
      v = (e.clientY - r.top) / r.height;
    hovering.current = true;
    tx.set(u * 2 - 1);
    ty.set(v * 2 - 1);
    gx.set(u * 100);
    gy.set(v * 100);
  };
  const offTilt = () => {
    hovering.current = false;
    gx.set(50);
    gy.set(30);
  };

  const parts = useRef<{
    list: P[];
    t: number;
    vx: number;
    vy: number;
    tx: number;
    ty: number;
    landed: boolean;
  } | null>(null);
  const kick = useRef<() => void>(() => {});
  const swell = useSpring(1, { stiffness: 420, damping: 14 });

  const apply = (user: boolean, at?: { u: number; v: number }) => {
    if (user) touched.current = true;
    if (
      stageRef.current !== "ready" ||
      !stamp.current ||
      !card.current ||
      !target.current
    )
      return;
    onApply?.(code);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setStage("applied");
      return;
    }
    const cr = card.current.getBoundingClientRect(),
      kr = stamp.current.getBoundingClientRect(),
      tr = target.current.getBoundingClientRect();
    const u0 = at?.u ?? 0.5,
      v0 = at?.v ?? 0.5;
    ox.set(u0 * 100);
    oy.set(v0 * 100);
    const px0 = kr.left - cr.left,
      py0 = kr.top - cr.top;
    const scx = kr.width / SW,
      scy = kr.height / SH;
    const T = {
      x: tr.left - cr.left + tr.width / 2,
      y: tr.top - cr.top + tr.height / 2,
    };
    // the whirlpool starts a little below the stamp, toward the side, and drifts down to the total
    const V = { x: cr.width * 0.62, y: py0 + kr.height + 70 };
    const data = paintStamp(code, brand, pct);
    const list: P[] = [];
    const ux = u0 * SW,
      vy = v0 * SH;
    const far = Math.hypot(Math.max(ux, SW - ux), Math.max(vy, SH - vy));
    for (let y = 1; y < SH; y += 3)
      for (let x = 1; x < SW; x += 3) {
        const i = (y * SW + x) * 4;
        if (data[i + 3] < 128) continue;
        const sx = px0 + x * scx,
          sy = py0 + y * scy;
        list.push({
          sx,
          sy,
          r0: Math.hypot(sx - V.x, sy - V.y),
          a0: Math.atan2(sy - V.y, sx - V.x),
          d: (Math.hypot(x - ux, y - vy) / far) * 0.5 + Math.random() * 0.06,
          dur: 1.05 + Math.random() * 0.35,
          col: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`,
          size: 1.2 + Math.random() * 1.2,
          spin: (2.2 + Math.random() * 0.9) * Math.PI,
        });
      }
    parts.current = {
      list,
      t: 0,
      vx: V.x,
      vy: V.y,
      tx: T.x,
      ty: T.y,
      landed: false,
    };
    setStage("melting");
    animate(hole, far * Math.max(scx, scy) + 20, {
      duration: 0.62,
      ease: [0.4, 0, 0.7, 1],
    });
    sfx.whoosh(3200, 500, { dur: 0.95, gain: 0.05 });
    kick.current();
  };
  const remove = (user: boolean) => {
    if (user) touched.current = true;
    if (stageRef.current !== "applied") return;
    onRemove?.(code);
    hole.set(0);
    setStage("ready");
    sfx.note(660, { dur: 0.3, gain: 0.04 });
  };

  // the whirlpool
  useEffect(() => {
    const c = cv.current,
      el = card.current;
    if (!c || !el) return;
    const g = c.getContext("2d");
    if (!g) return;
    let W = 0,
      H = 0,
      dpr = 1,
      raf = 0,
      last = performance.now();
    const resize = () => {
      W = el.offsetWidth;
      H = el.offsetHeight;
      dpr = Math.min(3, window.devicePixelRatio || 1);
      c.width = W * dpr;
      c.height = H * dpr;
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const P = parts.current;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      if (!P) {
        raf = 0;
        return;
      }
      P.t += dt;
      let alive = 0,
        home = 0;
      for (const p of P.list) {
        const a = P.t - p.d;
        if (a < 0) {
          alive++;
          continue;
        }
        const u = Math.min(1, a / p.dur);
        // the centre of the whirlpool slides from its start to the total; the orbit tightens on the way
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const cxp = P.vx + (P.tx - P.vx) * e,
          cyp = P.vy + (P.ty - P.vy) * e;
        const rad = p.r0 * Math.pow(1 - u, 1.35);
        const ang = p.a0 + p.spin * (1 - Math.pow(1 - u, 1.6));
        const x = cxp + Math.cos(ang) * rad,
          y = cyp + Math.sin(ang) * rad * 0.62;
        if (u >= 1) {
          home++;
          continue;
        }
        alive++;
        g.globalAlpha = u < 0.88 ? 1 : 1 - (u - 0.88) / 0.12;
        g.fillStyle = p.col;
        const s = p.size * (1 - u * 0.5);
        g.fillRect(x - s / 2, y - s / 2, s, s);
      }
      g.globalAlpha = 1;
      if (!P.landed && home > P.list.length * 0.6) {
        P.landed = true;
        setStage("applied");
        swell.set(1.12);
        setTimeout(() => swell.set(1), 140);
        sfx.note(988, { dur: 0.45, gain: 0.05, bell: 0.5 });
        sfx.note(1480, { at: 0.09, dur: 0.6, gain: 0.04, bell: 0.5 });
      }
      if (alive === 0) {
        parts.current = null;
        g.clearRect(0, 0, W, H);
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    kick.current = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autoplay: spend it, then take it back
  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await wait(1600);
      for (let k = 0; alive && !touched.current; k++) {
        apply(false, { u: k % 2 ? 0.3 : 0.7, v: 0.5 });
        await wait(4300);
        if (!alive || touched.current) break;
        remove(false);
        await wait(2200);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const row = "flex items-center justify-between text-[14px]";
  const foilBg = `linear-gradient(120deg, ${FOIL.join(", ")})`;
  const grating =
    "repeating-linear-gradient(115deg, rgba(255,255,255,.0) 0px, rgba(255,255,255,.0) 3px, rgba(255,255,255,.22) 4px, rgba(255,255,255,.0) 5px)";
  const clip = `path("${STAMP}")`;

  return (
    <div
      ref={card}
      className={`relative w-full max-w-[380px] overflow-hidden rounded-[26px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      style={{ fontFamily: sans }}
    >
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#6e6e73]">
            Your coupon
          </span>
          <span className="text-[11px] text-[#86868b]">
            Tap the stamp to use it
          </span>
        </div>
        <div
          className="relative mt-3 grid place-items-center"
          style={{ height: SH + 12, perspective: 700 }}
        >
          <AnimatePresence mode="popLayout">
            {stage !== "applied" ? (
              <motion.div
                key="stamp"
                onPointerMove={onTilt}
                onPointerLeave={offTilt}
                onClick={(e) => {
                  if (!stamp.current) return;
                  const r = stamp.current.getBoundingClientRect();
                  apply(true, {
                    u: (e.clientX - r.left) / r.width,
                    v: (e.clientY - r.top) / r.height,
                  });
                }}
                role="button"
                tabIndex={0}
                aria-label={`Use coupon ${code}, ${pct} off`}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  (e.preventDefault(), apply(true))
                }
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  rotate: -4,
                  filter: "blur(6px)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: -1.5,
                  filter: "blur(0px)",
                }}
                exit={{ opacity: 0, transition: { duration: 0.01 } }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                  filter: { duration: 0.3 },
                }}
                className="relative cursor-pointer outline-none focus-visible:shadow-[0_0_0_3px_#0071e3]"
                style={{
                  width: SW,
                  maxWidth: "100%",
                  height: SH,
                  rotateX: rX,
                  rotateY: rY,
                  filter: "drop-shadow(0 8px 14px rgba(120,90,170,.25))",
                }}
              >
                <div
                  ref={stamp}
                  className="absolute inset-0"
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute inset-0"
                  style={{
                    clipPath: clip,
                    WebkitMaskImage: mask,
                    maskImage: mask,
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: foilBg,
                      backgroundSize: "240% 240%",
                      backgroundPosition: foilPos,
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{ background: grating }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: glare, mixBlendMode: "soft-light" }}
                  />
                  <div className="absolute inset-[10px] border border-dashed border-[#7a5aaa]/35" />
                  <span
                    className="absolute left-[22px] top-[21px] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a4a78]"
                    style={{ fontFamily: mono }}
                  >
                    {brand}
                  </span>
                  <span className="absolute left-[22px] top-[44px] text-[30px] font-extrabold leading-none tracking-[-0.02em]">
                    {code}
                  </span>
                  <span className="absolute right-[22px] top-[30px] text-right leading-none">
                    <span className="block text-[26px] font-extrabold">
                      {pct}
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold">
                      OFF
                    </span>
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex w-full items-center gap-3 rounded-[18px] bg-[#f6f2fd] px-4 py-3"
              >
                <span className="text-[#8b5cf6]">
                  <Ico d={I.check} size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">
                    {code} is on your order
                  </span>
                  <span className="block text-[12px] text-[#6e6e73]">
                    {pct} off, saving {money(saving, currency)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(true)}
                  aria-label="Remove coupon"
                  className="grid h-8 w-8 place-items-center rounded-full text-[#6e6e73] outline-none hover:bg-black/5 focus-visible:shadow-[0_0_0_2px_#0071e3]"
                >
                  <Ico d={I.x} size={13} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 border-t border-black/[.06] px-5 pt-4">
        <div className="space-y-2.5">
          <div className={row}>
            <span className="text-[#6e6e73]">Subtotal</span>
            <span className="tabular-nums">{money(subtotal, currency)}</span>
          </div>
          <div className={row}>
            <span className="text-[#6e6e73]">Delivery</span>
            <span>{delivery ? money(delivery, currency) : "Free"}</span>
          </div>
          <AnimatePresence initial={false}>
            {applied && (
              <motion.div
                key="cp"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 22, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className={`${row} overflow-hidden`}
              >
                <span
                  className="rounded-full bg-[#f1eafe] px-2 py-0.5 text-[11px] font-semibold text-[#7c4ddb]"
                  style={{ fontFamily: mono }}
                >
                  {code}
                </span>
                <span className="tabular-nums text-[#7c4ddb]">
                  {money(-saving, currency)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-black/[.06] px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] text-[#6e6e73]">Total</div>
          <div className="relative mt-0.5 flex h-[30px] items-center gap-2">
            {/* the old price is struck through and slides aside; the new one rises into place */}
            <motion.span
              className="relative text-[20px] font-bold tabular-nums tracking-[-0.02em]"
              animate={
                applied
                  ? { fontSize: "13px", color: "#86868b", fontWeight: 500 }
                  : { fontSize: "20px", color: "#1d1d1f", fontWeight: 700 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {money(before, currency)}
              <motion.span
                className="absolute left-0 top-1/2 h-[1.5px] bg-current"
                initial={false}
                animate={{ width: applied ? "100%" : "0%" }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: applied ? 0.05 : 0,
                }}
              />
            </motion.span>
            <span
              ref={target}
              className="relative inline-flex min-w-[2px] items-center"
            >
              <AnimatePresence>
                {applied && (
                  <motion.span
                    key="new"
                    className="text-[20px] font-bold tabular-nums tracking-[-0.02em]"
                    style={{ scale: swell, display: "inline-block" }}
                    initial={{ y: 14, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: 10, opacity: 0, filter: "blur(4px)" }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 26,
                      filter: { duration: 0.25 },
                    }}
                  >
                    {money(after, currency)}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <AnimatePresence>
              {applied && (
                <motion.span
                  key="sticker"
                  aria-hidden="true"
                  className="h-[18px] w-[26px]"
                  style={{
                    clipPath: `path("${stampPath(26, 18)}")`,
                    background: foilBg,
                  }}
                  initial={{ scale: 1.8, rotate: -24, opacity: 0 }}
                  animate={{ scale: 1, rotate: -8, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 18,
                    delay: 0.15,
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
        <button
          type="button"
          onClick={onPlaceOrder}
          className="h-11 shrink-0 rounded-full bg-[#1d1d1f] px-6 text-[14px] font-semibold text-white outline-none focus-visible:shadow-[0_0_0_3px_#0071e3]"
        >
          Place order
        </button>
      </div>
      <canvas
        ref={cv}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
```

--- components/coupon-apply/index.ts ---

```ts
export { default as CouponApply } from "./coupon-apply";
export type { CouponApplyProps } from "./coupon-apply";
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

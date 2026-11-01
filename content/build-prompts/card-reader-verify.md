# Card Reader Verify

Add the "Card Reader Verify" component from Nexus UI to my project.

An ID check you do by hand. Drag the card into the reader: the light strip sweeps, the display runs each check, and the card springs back out with a Verified stamp. Insert it flipped and the reader shakes and rejects it. Drag with a mouse or finger, or use the keyboard buttons, in a 3D canvas card that needs only Framer Motion.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` and `@/lib/ui-sounds-pro` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
5. Use it like this: `import { CardReaderVerify } from "@/components/card-reader-verify";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/card-reader-verify/card-reader-verify.tsx ---

```tsx
"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { motion } from "framer-motion";
import { useProSound, type ProSoundName } from "@/lib/ui-sounds-pro";

type V3 = [number, number, number];
type RGB = [number, number, number];
type Mat = { amb: number; kd: number; ks: number; n: number; sh: number };
type Pt = { x: number; y: number };
type Phase = "float" | "drag" | "insert" | "read" | "eject" | "reject" | "flip";
type UIPhase = "ready" | "busy" | "verified" | "rejected";
type Tween = { t: number; dur: number; ease: (t: number) => number; fn: (v: number) => void; done: () => void };
type Engine = {
  insert: () => void;
  flip: () => void;
  down: (e: RPointerEvent<HTMLButtonElement>) => void;
  move: (e: RPointerEvent<HTMLButtonElement>) => void;
  up: (e: RPointerEvent<HTMLButtonElement>) => void;
  cancel: () => void;
  autoGrab: (p: Pt) => void;
  autoMove: (p: Pt) => void;
  autoDrop: () => void;
  cardPt: () => Pt;
  slotPt: () => Pt;
  phase: () => Phase;
  tween: (dur: number, ease: (t: number) => number, fn: (v: number) => void) => Promise<void>;
  ghost: { x: number; y: number; op: number; sc: number };
};

const CHECKS: { name: string; result: "Verified" | "Limited" | "Restricted" }[] = [
  { name: "Identity", result: "Verified" },
  { name: "Access", result: "Limited" },
  { name: "Data", result: "Verified" },
  { name: "AI usage", result: "Restricted" },
];
const RES_COL: Record<string, string> = { Verified: "#32d74b", Limited: "#ffb340", Restricted: "#ff6961" };
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';
const MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';

/* ---------- camera ---------- */
const F = 1300, YAW = (27 * Math.PI) / 180, PITCH = (15 * Math.PI) / 180;
const CYW = Math.cos(YAW), SYW = Math.sin(YAW), CPT = Math.cos(PITCH), SPT = Math.sin(PITCH);
const TG: V3 = [0, 86, 0];
const EYE: V3 = [TG[0] + F * CPT * SYW, TG[1] + F * SPT, TG[2] + F * CPT * CYW];
type Cam = { s: number; ox: number; oy: number };
const O = { x: 0, y: 0, z: 0 };
function proj(c: Cam, x: number, y: number, z: number) {
  const dx = x - TG[0], dy = y - TG[1], dz = z - TG[2];
  const x1 = dx * CYW - dz * SYW, z1 = dx * SYW + dz * CYW;
  const y2 = dy * CPT - z1 * SPT, z2 = dy * SPT + z1 * CPT;
  const k = (F / (F - z2)) * c.s;
  O.x = c.ox + x1 * k; O.y = c.oy - y2 * k; O.z = z2;
}
/** screen point to the world plane z = zc (the card's travel plane), returns [x, y] */
function unprojZ(c: Cam, sx: number, sy: number, zc: number): [number, number] {
  const a = (sx - c.ox) / c.s, b = (c.oy - sy) / c.s;
  // camera-space ray from (0,0,F) through (a,b,0); back to world: inverse pitch then inverse yaw
  const dirW = (x1: number, y2: number, z2: number): V3 => {
    const dy = y2 * CPT + z2 * SPT, z1 = -y2 * SPT + z2 * CPT;
    return [x1 * CYW + z1 * SYW, dy, -x1 * SYW + z1 * CYW];
  };
  const d = dirW(a, b, -F);
  const t = (zc - EYE[2]) / (d[2] || 1e-6);
  return [EYE[0] + d[0] * t, EYE[1] + d[1] * t];
}

/* ---------- light ---------- */
const n3 = (x: number, y: number, z: number): V3 => { const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
const LD = n3(-0.5, 0.78, 0.38);
const FILL = n3(EYE[0] - TG[0], EYE[1] - TG[1], EYE[2] - TG[2]);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t * t;
const rgb = (r: number, g: number, b: number) => `rgb(${Math.max(0, Math.min(255, Math.round(r)))},${Math.max(0, Math.min(255, Math.round(g)))},${Math.max(0, Math.min(255, Math.round(b)))})`;
function shade(c: RGB, m: Mat, nx: number, ny: number, nz: number, px: number, py: number, pz: number, mul = 1) {
  let vx = EYE[0] - px, vy = EYE[1] - py, vz = EYE[2] - pz;
  const vl = Math.hypot(vx, vy, vz); vx /= vl; vy /= vl; vz /= vl;
  let hx = LD[0] + vx, hy = LD[1] + vy, hz = LD[2] + vz;
  const hl = Math.hypot(hx, hy, hz); hx /= hl; hy /= hl; hz /= hl;
  const nl = Math.max(0, nx * LD[0] + ny * LD[1] + nz * LD[2]);
  const nf = Math.max(0, nx * FILL[0] + ny * FILL[1] + nz * FILL[2]);
  const nh = Math.max(0, nx * hx + ny * hy + nz * hz);
  const f = (m.amb + m.kd * nl + 0.22 * nf) * mul;
  const sp = (m.ks * Math.pow(nh, m.n) + m.sh * nh * nh * nh) * 255 * Math.min(1, mul);
  return rgb(c[0] * f + sp, c[1] * f + sp, c[2] * f + sp);
}
const MATTE_BLACK: Mat = { amb: 0.62, kd: 0.5, ks: 0.16, n: 9, sh: 0.05 };
const RIM: Mat = { amb: 0.6, kd: 0.5, ks: 0.75, n: 22, sh: 0.1 };
const C_BODY: RGB = [34, 35, 38], C_RIM: RGB = [74, 76, 80], C_EDGE: RGB = [214, 218, 224];

/* ---------- scene (world units; reader stands on the desk at the origin, card travels in the plane z = 0) ---------- */
const RW = 146, RD = 58, RH = 100, RR = 15, RCH = 2.6, RFOOT = 3.2;
const CW = 86, CHT = 54, CTH = 0.9, CRAD = 3.6;
const FLOAT_Y = RH + 26 + CHT / 2, INS_DEPTH = 40, REJ_DEPTH = 10;
const SLOT_HW = 47;
const TEX = 8;

type OP = { x: number; z: number; nx: number; nz: number };
function rrOutline(hx: number, hz: number, r: number, seg: number): OP[] {
  const out: OP[] = [];
  const cs: [number, number, number][] = [[hx - r, hz - r, 0], [-(hx - r), hz - r, 1], [-(hx - r), -(hz - r), 2], [hx - r, -(hz - r), 3]];
  for (const [cx, cz, q] of cs) for (let k = 0; k <= seg; k++) {
    const a = ((q + k / seg) * Math.PI) / 2, nx = Math.cos(a), nz = Math.sin(a);
    out.push({ x: cx + r * nx, z: cz + r * nz, nx, nz });
  }
  return out;
}
const R_OUT = rrOutline(RW / 2, RD / 2, RR, 10), R_IN = rrOutline(RW / 2 - RCH, RD / 2 - RCH, RR - RCH, 10);
/** card outline in its own plane (u right, v up) */
const C_LOOP: [number, number][] = (() => {
  const o: [number, number][] = [], hx = CW / 2 - CRAD, hy = CHT / 2 - CRAD;
  const cs: [number, number, number][] = [[hx, hy, 0], [-hx, hy, 1], [-hx, -hy, 2], [hx, -hy, 3]];
  for (const [cx, cy, q] of cs) for (let k = 0; k <= 4; k++) { const a = ((q + k / 4) * Math.PI) / 2; o.push([cx + CRAD * Math.cos(a), cy + CRAD * Math.sin(a)]); }
  return o;
})();

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
type Sprite = { c: HTMLCanvasElement; w: number; h: number; q: number };
function makeSprite(w: number, h: number, r: number, blur: number, q: number): Sprite {
  const pad = Math.ceil(blur * 2.2 + 2), c = document.createElement("canvas");
  c.width = Math.ceil((w + pad * 2) * q); c.height = Math.ceil((h + pad * 2) * q);
  const g = c.getContext("2d")!;
  g.shadowColor = "#000"; g.shadowBlur = blur * q; g.shadowOffsetX = 5000;
  g.beginPath(); rr(g, (pad - 5000 / q) * q, pad * q, w * q, h * q, r * q); g.fill();
  return { c, w, h, q };
}

/* ---------- the ID card artwork, drawn once into textures (vector paths, no images) ---------- */
const SILHOUETTE = "M2 28C2 20.6 6 17.8 11 17.8S20 20.6 20 28Z";
function cardFront(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = CW * TEX; c.height = CHT * TEX;
  const g = c.getContext("2d")!;
  g.scale(TEX, TEX);
  g.beginPath(); rr(g, 0, 0, CW, CHT, CRAD); g.clip();
  const bg = g.createLinearGradient(0, 0, CW, CHT);
  bg.addColorStop(0, "#fbfcfd"); bg.addColorStop(0.55, "#eef2f6"); bg.addColorStop(1, "#e4e9f0");
  g.fillStyle = bg; g.fillRect(0, 0, CW, CHT);
  // guilloche: interference waves across the lower band and a rosette under the foil seal
  g.lineWidth = 0.12;
  for (let j = 0; j < 22; j++) {
    g.beginPath();
    for (let x = 0; x <= CW; x += 0.8) { const y = 41 + j * 0.42 + 1.7 * Math.sin(x * 0.21 + j * 0.37) + 0.8 * Math.sin(x * 0.07 - j * 0.2); if (x) g.lineTo(x, y); else g.moveTo(x, y); }
    g.strokeStyle = `rgba(${40 + j * 3},${110 + j * 2},${160},0.22)`; g.stroke();
  }
  for (let j = 0; j < 16; j++) {
    g.beginPath();
    for (let k = 0; k <= 200; k++) {
      const a = (k / 200) * Math.PI * 2, r = 10.5 + 1.9 * Math.sin(9 * a + j * 0.39) + 0.6 * Math.cos(5 * a - j * 0.5);
      const x = 74 + r * 0.85 * Math.cos(a), y = 37 + r * 0.85 * Math.sin(a);
      if (k) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.strokeStyle = "rgba(60,120,170,0.2)"; g.stroke();
  }
  for (let j = 0; j < 12; j++) {
    g.beginPath();
    for (let x = 28; x <= CW; x += 0.8) { const y = 4 + j * 0.25 + 0.6 * Math.sin(x * 0.5 + j); if (x > 28) g.lineTo(x, y); else g.moveTo(x, y); }
    g.strokeStyle = "rgba(90,140,180,0.12)"; g.stroke();
  }
  // header
  g.fillStyle = "#1d1d1f"; g.font = `700 3.3px ${FONT}`; g.textBaseline = "alphabetic";
  g.fillText("IDENTITY CARD", 5, 8.2);
  g.fillStyle = "#6e6e73"; g.font = `500 2.4px ${FONT}`;
  g.fillText("ACCESS CREDENTIAL · CLASS A", 5, 11.4);
  // photo with a vector silhouette
  g.save();
  g.translate(5, 14.5);
  g.beginPath(); rr(g, 0, 0, 22, 28, 2.4);
  const ph = g.createLinearGradient(0, 0, 0, 28);
  ph.addColorStop(0, "#dfe7f1"); ph.addColorStop(1, "#c8d4e3");
  g.fillStyle = ph; g.fill();
  g.clip();
  g.fillStyle = "#8d9bb0";
  g.beginPath(); g.arc(11, 11.2, 5.1, 0, Math.PI * 2); g.fill();
  g.fill(new Path2D(SILHOUETTE));
  g.fillStyle = "rgba(255,255,255,.25)";
  g.beginPath(); g.ellipse(9.2, 9.6, 1.6, 2.4, -0.5, 0, Math.PI * 2); g.fill();
  g.restore();
  g.strokeStyle = "rgba(0,0,0,.08)"; g.lineWidth = 0.2; g.beginPath(); rr(g, 5, 14.5, 22, 28, 2.4); g.stroke();
  // name and fields
  g.fillStyle = "#1d1d1f"; g.font = `700 5.4px ${FONT}`;
  g.fillText("Ada Lovelace", 31, 20.5);
  const field = (label: string, val: string, x: number, y: number) => {
    g.fillStyle = "#86868b"; g.font = `600 2.1px ${FONT}`; g.fillText(label, x, y);
    g.fillStyle = "#1d1d1f"; g.font = `500 3.1px ${MONO}`; g.fillText(val, x, y + 3.6);
  };
  field("ID NUMBER", "1815-1210-AL", 31, 25.6);
  field("ROLE", "Analyst", 31, 32.4);
  field("VALID TO", "12/2031", 50, 32.4);
  // contact chip
  g.save();
  g.translate(69, 12.5);
  g.beginPath(); rr(g, 0, 0, 12, 9.2, 1.8);
  const cg = g.createLinearGradient(0, 0, 12, 9.2);
  cg.addColorStop(0, "#f3dc9a"); cg.addColorStop(0.45, "#d8b25e"); cg.addColorStop(1, "#b98f3e");
  g.fillStyle = cg; g.fill();
  g.strokeStyle = "rgba(110,80,20,.55)"; g.lineWidth = 0.18;
  g.beginPath();
  g.moveTo(0, 3); g.lineTo(4, 3); g.moveTo(0, 6.2); g.lineTo(4, 6.2); g.moveTo(8, 3); g.lineTo(12, 3); g.moveTo(8, 6.2); g.lineTo(12, 6.2);
  g.moveTo(4, 0); g.lineTo(4, 9.2); g.moveTo(8, 0); g.lineTo(8, 9.2); g.rect(4, 2.2, 4, 4.8);
  g.stroke();
  g.restore();
  // machine-readable zone
  g.fillStyle = "rgba(29,29,31,.72)"; g.font = `500 2.5px ${MONO}`;
  g.fillText("IDAL<<LOVELACE<<ADA<<<<<<<<<<<<", 5, 49.8);
  return c;
}
function cardBack(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = CW * TEX; c.height = CHT * TEX;
  const g = c.getContext("2d")!;
  g.scale(TEX, TEX);
  g.beginPath(); rr(g, 0, 0, CW, CHT, CRAD); g.clip();
  const bg = g.createLinearGradient(0, 0, CW, CHT);
  bg.addColorStop(0, "#f2f4f7"); bg.addColorStop(1, "#e2e6ec");
  g.fillStyle = bg; g.fillRect(0, 0, CW, CHT);
  const ms = g.createLinearGradient(0, 5, 0, 14);
  ms.addColorStop(0, "#36373b"); ms.addColorStop(0.5, "#1d1e21"); ms.addColorStop(1, "#2a2b2f");
  g.fillStyle = ms; g.fillRect(0, 5, CW, 9);
  g.fillStyle = "#ffffff"; g.fillRect(5, 18, 48, 7);
  g.strokeStyle = "rgba(10,132,255,.14)"; g.lineWidth = 0.15;
  for (let x = 5; x < 53; x += 1.2) { g.beginPath(); g.moveTo(x, 18); g.lineTo(x + 3, 25); g.stroke(); }
  g.fillStyle = "#6e6e73"; g.font = `500 2.2px ${FONT}`;
  g.fillText("AUTHORISED SIGNATURE", 5, 28.4);
  g.fillText("This card remains the property of the issuer.", 5, 33);
  g.fillText("If found, please return it to any service desk.", 5, 36);
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  g.fillStyle = "#1d1d1f";
  for (let x = 5; x < 58;) { const w = 0.25 + rnd() * 0.7; if (rnd() > 0.35) g.fillRect(x, 40, w, 8); x += w + 0.25 + rnd() * 0.5; }
  g.font = `500 2.2px ${MONO}`; g.fillText("1815 1210 0042", 5, 51);
  return c;
}

/**
 * Identity verification on a card reader. Drag the floating ID card down into the slot (or
 * press Enter): it slides in behind the slot lip, the reader dips under the weight and the LED
 * strip sweeps while the display runs each check. When it is done the card springs back out
 * and a Verified badge stamps onto it. Flip the card (button or double-click) and the reader
 * rejects it with a shake.
 */
export interface CardReaderVerifyProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Plays interface sounds that follow what happens on screen. They follow the visitor's sound switch (off until switched on on this site). */
  enableSound?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function CardReaderVerify({ autoplay = false, enableSound = true, className = "" }: CardReaderVerifyProps) {
  const uid = useId().replace(/:/g, "");
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cardBtn = useRef<HTMLButtonElement>(null);
  const ghostEl = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const eng = useRef<Engine | null>(null);
  const play = useProSound(enableSound);
  const playRef = useRef(play);
  useLayoutEffect(() => { playRef.current = play; });

  const [H, setH] = useState(330);
  const [ui, setUi] = useState<UIPhase>("ready");
  const uiRef = useRef<UIPhase>("ready");
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);
  const [status, setStatus] = useState("");
  const [caption, setCaption] = useState("Ready for a card");
  const [ghostOn, setGhostOn] = useState(false);
  const setUiBoth = (u: UIPhase) => { uiRef.current = u; setUi(u); };

  /* ================= engine ================= */
  useEffect(() => {
    const el = stage.current!, cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    let alive = true;
    let dpr = Math.min(2.5, window.devicePixelRatio || 1);
    let W = el.offsetWidth || 400, Hs = 330;
    const cam: Cam = { s: 1, ox: 0, oy: 0 };
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); };
    /** a sound from the visitor plays normally; one from the ghost pointer waits for the page's first click */
    const sfx = (name: ProSoundName, volume?: number) => {
      if (document.hidden) return;
      const p = playRef.current;
      if (touched.current) p(name, volume); else p.auto(name, volume);
    };
    const tweens = new Set<Tween>();
    const tween = (dur: number, ease: (t: number) => number, fn: (v: number) => void) => new Promise<void>((done) => { tweens.add({ t: 0, dur, ease, fn, done }); });

    const texF = cardFront(), texB = cardBack();
    const sprBody = makeSprite(RW - 6, RD - 6, RR, 3, 2), sprSoft = makeSprite(RW + 10, RD + 8, RR + 4, 14, 1), sprAmb = makeSprite(RW + 40, RD + 40, 40, 26, 0.5);
    const sprCard = makeSprite(CW - 6, 4, 2, 4, 2);

    /* ---------- sizing ---------- */
    const B = (() => {
      const c0: Cam = { s: 1, ox: 0, oy: 0 };
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      const add = (x: number, y: number, z: number) => { proj(c0, x, y, z); x0 = Math.min(x0, O.x); x1 = Math.max(x1, O.x); y0 = Math.min(y0, O.y); y1 = Math.max(y1, O.y); };
      for (const p of R_OUT) { add(p.x, 0, p.z); add(p.x, RH, p.z); }
      for (const [u, v] of C_LOOP) add(u, FLOAT_Y + v + 12, 0);
      return { x0, x1, y0, y1 };
    })();
    const resize = () => {
      W = el.offsetWidth || W;
      const bw = B.x1 - B.x0, bh = B.y1 - B.y0;
      cam.s = Math.min(1.8, (W - 40) / bw, 330 / bh);
      Hs = Math.ceil(bh * cam.s + 34);
      cam.ox = W / 2 - ((B.x0 + B.x1) / 2) * cam.s;
      cam.oy = Hs / 2 - ((B.y0 + B.y1) / 2) * cam.s - 2;
      dpr = Math.min(2.5, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hs * dpr);
      cv.style.width = `${W}px`; cv.style.height = `${Hs}px`;
      setH(Hs);
    };

    /* ---------- state ---------- */
    const C = { x: 0, y: FLOAT_Y, z: 0, yaw: 0, pitch: 0, roll: 0, vx: 0, vy: 0, vz: 0, vyaw: 0, vroll: 0 };
    const S = {
      t: 0, phase: "float" as Phase, flipped: false,
      dy: 0, dvy: 0, sx: 0, shake: 0, // reader dip and shake
      led: 0 as 0 | 1 | 2 | 3, ledT: 0, // 0 idle, 1 sweep, 2 ok, 3 error
      readT: -1, readDone: false, said: -1, // display timeline
      disp: "idle" as "idle" | "read" | "ok" | "err",
      badge: 0, bs: 1, bsv: 0, badgeOn: false, ring: -1,
      held: false, auto: false, grab: [0, 0] as [number, number], ptr: { x: 0, y: 0 },
      flipFrom: 0, flipTo: 0,
    };
    const ghost = { x: 0, y: 0, op: 0, sc: 1 };

    /* ---------- drawing helpers ---------- */
    const base = () => ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const plane = (ox: number, oy: number, oz: number, ux: number, uy: number, uz: number, vx: number, vy: number, vz: number) => {
      proj(cam, ox, oy, oz); const X = O.x, Y = O.y;
      const hu = 5 / (Math.hypot(ux, uy, uz) || 1), hv = 5 / (Math.hypot(vx, vy, vz) || 1);
      proj(cam, ox + ux * hu, oy + uy * hu, oz + uz * hu); let a = O.x, b = O.y;
      proj(cam, ox - ux * hu, oy - uy * hu, oz - uz * hu); a = (a - O.x) / (2 * hu); b = (b - O.y) / (2 * hu);
      proj(cam, ox + vx * hv, oy + vy * hv, oz + vz * hv); let c = O.x, d = O.y;
      proj(cam, ox - vx * hv, oy - vy * hv, oz - vz * hv); c = (c - O.x) / (2 * hv); d = (d - O.y) / (2 * hv);
      ctx.setTransform(dpr * a, dpr * b, dpr * c, dpr * d, dpr * X, dpr * Y);
    };
    const path3 = (p: number[]) => {
      ctx.beginPath();
      for (let i = 0; i < p.length; i += 3) { proj(cam, p[i], p[i + 1], p[i + 2]); if (i) ctx.lineTo(O.x, O.y); else ctx.moveTo(O.x, O.y); }
      ctx.closePath();
    };
    const facing = (nx: number, ny: number, nz: number, px: number, py: number, pz: number) => nx * (EYE[0] - px) + ny * (EYE[1] - py) + nz * (EYE[2] - pz) > 0;
    const gfill = (ax: number, ay: number, az: number, ca: string, bx: number, by: number, bz: number, cb: string, seam = 0.7) => {
      proj(cam, ax, ay, az); const X = O.x, Y = O.y;
      proj(cam, bx, by, bz);
      let paint: string | CanvasGradient = ca;
      if (Math.hypot(O.x - X, O.y - Y) > 0.4 && ca !== cb) { const g = ctx.createLinearGradient(X, Y, O.x, O.y); g.addColorStop(0, ca); g.addColorStop(1, cb); paint = g; }
      ctx.fillStyle = paint; ctx.fill();
      if (seam > 0) { ctx.strokeStyle = paint; ctx.lineWidth = seam; ctx.lineJoin = "round"; ctx.stroke(); }
    };
    const deskSprite = (sp: Sprite, cx: number, y: number, cz: number, sw: number, sh: number, alpha: number) => {
      if (alpha < 0.004) return;
      const kx = sw / sp.w / sp.q, kz = sh / sp.h / sp.q;
      plane(cx, y, cz, kx, 0, 0, 0, 0, kz);
      ctx.globalAlpha = alpha;
      ctx.drawImage(sp.c, -sp.c.width / 2, -sp.c.height / 2);
      ctx.globalAlpha = 1;
      base();
    };
    const topY = () => RH + S.dy;
    const rw = (x: number, y: number, z: number, out: number[]) => { out.push(x + S.sx, y + S.dy, z); };

    /* ---------- the reader ---------- */
    const drawReader = () => {
      const q: number[] = [];
      const n = R_OUT.length;
      const walls: number[][] = [];
      for (let i = 0; i < n; i++) {
        const A = R_OUT[i], Bq = R_OUT[(i + 1) % n];
        if (!facing(A.nx + Bq.nx, 0, A.nz + Bq.nz, (A.x + Bq.x) / 2, RH / 2, (A.z + Bq.z) / 2)) continue;
        q.length = 0;
        rw(A.x, RFOOT, A.z, q); rw(Bq.x, RFOOT, Bq.z, q); rw(Bq.x, RH - RCH, Bq.z, q); rw(A.x, RH - RCH, A.z, q);
        walls.push(q.slice());
        path3(q);
        const ym = RH * 0.6;
        gfill(A.x, ym, A.z, shade(C_BODY, MATTE_BLACK, A.nx, 0, A.nz, A.x, ym, A.z), Bq.x, ym, Bq.z, shade(C_BODY, MATTE_BLACK, Bq.nx, 0, Bq.nz, Bq.x, ym, Bq.z));
      }
      // soft vertical falloff: brighter toward the top edge, a touch of desk bounce at the foot
      for (const w of walls) {
        path3(w);
        proj(cam, (w[0] + w[3]) / 2, (w[1] + w[4]) / 2, (w[2] + w[5]) / 2); const X = O.x, Y = O.y;
        proj(cam, (w[6] + w[9]) / 2, (w[7] + w[10]) / 2, (w[8] + w[11]) / 2);
        const g = ctx.createLinearGradient(X, Y, O.x, O.y);
        g.addColorStop(0, "rgba(255,255,255,.05)"); g.addColorStop(0.08, "rgba(0,0,0,.18)"); g.addColorStop(0.4, "rgba(0,0,0,0)"); g.addColorStop(0.85, "rgba(255,255,255,.02)"); g.addColorStop(1, "rgba(255,255,255,.07)");
        ctx.fillStyle = g; ctx.fill();
      }
      // ribbing: the front lower band and the right side
      const fz = RD / 2 + 0.02;
      plane(S.sx, 20 + S.dy, fz, 1, 0, 0, 0, -1, 0);
      ctx.save();
      ctx.beginPath(); rr(ctx, -RW / 2 + RR - 2, -13, RW - 2 * RR + 4, 26, 2); ctx.clip();
      ribs(-RW / 2 + RR - 2, RW / 2 - RR + 2, -13, 13);
      ctx.restore();
      base();
      if (facing(1, 0, 0, RW / 2, RH / 2, 0)) {
        plane(RW / 2 + 0.02 + S.sx, 52 + S.dy, 0, 0, 0, -1, 0, -1, 0);
        ctx.save();
        ctx.beginPath(); rr(ctx, -RD / 2 + RR, -44, RD - 2 * RR, 88, 1); ctx.clip();
        ribs(-RD / 2 + RR, RD / 2 - RR, -44, 44);
        ctx.restore();
        base();
      }
      drawLed();
      drawDisplay();
      // top rim: a rounded, catch-light edge
      for (let i = 0; i < n; i++) {
        const A = R_OUT[i], Bq = R_OUT[(i + 1) % n], Ai = R_IN[i], Bi = R_IN[(i + 1) % n];
        const na = n3(A.nx, 1, A.nz), nb = n3(Bq.nx, 1, Bq.nz);
        if (!facing(na[0] + nb[0], na[1] + nb[1], na[2] + nb[2], A.x, RH, A.z)) continue;
        q.length = 0;
        rw(A.x, RH - RCH, A.z, q); rw(Bq.x, RH - RCH, Bq.z, q); rw(Bi.x, RH, Bi.z, q); rw(Ai.x, RH, Ai.z, q);
        path3(q);
        gfill(A.x, RH, A.z, shade(C_RIM, RIM, na[0], na[1], na[2], A.x, RH, A.z), Bq.x, RH, Bq.z, shade(C_RIM, RIM, nb[0], nb[1], nb[2], Bq.x, RH, Bq.z), 0.5);
      }
      // top face with the card slot
      q.length = 0;
      for (const p of R_IN) rw(p.x, RH, p.z, q);
      path3(q);
      gfill(-RW / 2, RH, -RD / 2, shade(C_BODY, MATTE_BLACK, 0, 1, 0, -RW / 2, RH, -RD / 2, 1.08), RW / 2, RH, RD / 2, shade(C_BODY, MATTE_BLACK, 0, 1, 0, RW / 2, RH, RD / 2, 0.98), 0);
      plane(S.sx, topY() + 0.02, 0, 1, 0, 0, 0, 0, 1);
      // slot: AO halo, dark opening, lit far wall, bright front lip
      const halo = ctx.createLinearGradient(0, -7, 0, 7);
      halo.addColorStop(0, "rgba(0,0,0,0)"); halo.addColorStop(0.5, "rgba(0,0,0,.35)"); halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo; ctx.beginPath(); rr(ctx, -SLOT_HW - 4, -7, SLOT_HW * 2 + 8, 14, 6); ctx.fill();
      ctx.beginPath(); rr(ctx, -SLOT_HW, -1.8, SLOT_HW * 2, 3.6, 1.8);
      const sg = ctx.createLinearGradient(0, -1.8, 0, 1.8);
      sg.addColorStop(0, "#26272a"); sg.addColorStop(0.3, "#040405"); sg.addColorStop(1, "#000000");
      ctx.fillStyle = sg; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-SLOT_HW + 1.8, 2.05); ctx.lineTo(SLOT_HW - 1.8, 2.05);
      ctx.strokeStyle = "rgba(255,255,255,.2)"; ctx.lineWidth = 0.5; ctx.stroke();
      base();
    };
    const ribs = (x0: number, x1: number, y0: number, y1: number) => {
      ctx.beginPath();
      for (let x = x0 + 0.6; x < x1; x += 1.7) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
      ctx.strokeStyle = "rgba(0,0,0,.42)"; ctx.lineWidth = 0.55; ctx.stroke();
      ctx.beginPath();
      for (let x = x0 + 1.25; x < x1; x += 1.7) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
      ctx.strokeStyle = "rgba(255,255,255,.075)"; ctx.lineWidth = 0.4; ctx.stroke();
    };
    const drawLed = () => {
      plane(S.sx, 39 + S.dy, RD / 2 + 0.03, 1, 0, 0, 0, -1, 0);
      const hw = 48;
      ctx.beginPath(); rr(ctx, -hw - 1, -1.9, hw * 2 + 2, 3.8, 1.9);
      ctx.fillStyle = "#050506"; ctx.fill();
      ctx.save();
      ctx.beginPath(); rr(ctx, -hw, -1.1, hw * 2, 2.2, 1.1); ctx.clip();
      const t = S.t;
      let col = "255,255,255", inten = 0.16 + 0.08 * Math.sin(t * 2.2);
      if (S.led === 1) { col = "100,190,255"; inten = 0.22; }
      if (S.led === 2) { col = "50,215,75"; inten = 0.85 * Math.exp(-Math.max(0, t - S.ledT) * 0.9) + 0.25; }
      if (S.led === 3) { col = "255,69,58"; inten = 0.6 + 0.4 * Math.abs(Math.sin((t - S.ledT) * 9)); }
      ctx.fillStyle = `rgba(${col},${inten.toFixed(3)})`;
      ctx.fillRect(-hw, -1.2, hw * 2, 2.4);
      if (S.led === 1) {
        // a comet sweeping left to right
        const p = ((t - S.ledT) * 0.9) % 1, cx = -hw + p * hw * 2;
        const g = ctx.createLinearGradient(cx - 30, 0, cx + 4, 0);
        g.addColorStop(0, "rgba(100,190,255,0)"); g.addColorStop(0.85, "rgba(150,215,255,.95)"); g.addColorStop(1, "rgba(255,255,255,1)");
        ctx.fillStyle = g; ctx.fillRect(cx - 30, -1.2, 34, 2.4);
      }
      ctx.restore();
      // bloom on the body around the strip
      if (S.led !== 0) {
        ctx.globalCompositeOperation = "lighter";
        const a = S.led === 1 ? 0.18 : S.led === 2 ? 0.22 * inten : 0.22 * inten;
        const g2 = ctx.createLinearGradient(0, -6, 0, 6);
        g2.addColorStop(0, `rgba(${col},0)`); g2.addColorStop(0.5, `rgba(${col},${a.toFixed(3)})`); g2.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g2; ctx.fillRect(-hw - 4, -6, hw * 2 + 8, 12);
        ctx.globalCompositeOperation = "source-over";
      }
      base();
    };
    const DISP_W = 118, DISP_H = 46;
    const drawDisplay = () => {
      plane(S.sx, 71 + S.dy, RD / 2 + 0.04, 1, 0, 0, 0, -1, 0);
      // glass: black, flush, with a fine bezel line
      ctx.beginPath(); rr(ctx, -DISP_W / 2 - 2.5, -DISP_H / 2 - 2.5, DISP_W + 5, DISP_H + 5, 6);
      ctx.fillStyle = "#08080a"; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 0.4; ctx.stroke();
      ctx.save();
      ctx.beginPath(); rr(ctx, -DISP_W / 2, -DISP_H / 2, DISP_W, DISP_H, 4); ctx.clip();
      const bg = ctx.createLinearGradient(0, -DISP_H / 2, 0, DISP_H / 2);
      bg.addColorStop(0, "#0d0f12"); bg.addColorStop(1, "#060607");
      ctx.fillStyle = bg; ctx.fillRect(-DISP_W / 2, -DISP_H / 2, DISP_W, DISP_H);
      const x0 = -DISP_W / 2 + 6, xr = DISP_W / 2 - 6;
      ctx.textBaseline = "middle";
      const t = S.t;
      if (S.disp === "idle") {
        ctx.fillStyle = "rgba(235,235,245,.6)"; ctx.font = `600 4.2px ${FONT}`; ctx.textAlign = "left";
        ctx.fillText("ID TERMINAL", x0, -DISP_H / 2 + 6.5);
        ctx.fillStyle = "rgba(48,209,88,.9)"; ctx.beginPath(); ctx.arc(xr - 1.5, -DISP_H / 2 + 6.5, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#f5f5f7"; ctx.font = `600 8.4px ${FONT}`; ctx.textAlign = "center";
        ctx.fillText(S.flipped ? "Card upside down" : "Insert your card", 0, 1);
        ctx.fillStyle = "rgba(235,235,245,.55)"; ctx.font = `500 4.6px ${FONT}`;
        ctx.fillText(S.flipped ? "Flip it, then insert" : "Chip first, facing you", 0, 10);
        const b = Math.sin(t * 3.2) * 1.2;
        ctx.strokeStyle = "rgba(235,235,245,.5)"; ctx.lineWidth = 0.8; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(-3, -9 + b); ctx.lineTo(0, -6 + b); ctx.lineTo(3, -9 + b); ctx.stroke();
      } else if (S.disp === "err") {
        ctx.fillStyle = "rgba(255,105,97,.95)"; ctx.font = `600 4.2px ${FONT}`; ctx.textAlign = "left";
        ctx.fillText("CARD REJECTED", x0, -DISP_H / 2 + 6.5);
        ctx.fillStyle = "#f5f5f7"; ctx.font = `600 8px ${FONT}`; ctx.textAlign = "center";
        ctx.fillText("Card upside down", 0, 1);
        ctx.fillStyle = "rgba(235,235,245,.6)"; ctx.font = `500 4.6px ${FONT}`;
        ctx.fillText("Flip it and try again", 0, 10);
      } else {
        // the checks, one per row, typed in monospace
        const rt = S.readT;
        const head = S.disp === "ok" ? "VERIFIED" : "VERIFYING" + ".".repeat(1 + (Math.floor(t * 3) % 3));
        ctx.fillStyle = S.disp === "ok" ? "rgba(50,215,75,1)" : "rgba(235,235,245,.62)"; ctx.font = `600 4.2px ${FONT}`; ctx.textAlign = "left";
        ctx.fillText(head, x0, -DISP_H / 2 + 6.5);
        ctx.fillStyle = "rgba(235,235,245,.45)"; ctx.textAlign = "right"; ctx.font = `500 4px ${MONO}`;
        ctx.fillText("ADA LOVELACE", xr, -DISP_H / 2 + 6.5);
        ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fillRect(x0, -DISP_H / 2 + 10, xr - x0, 0.3);
        ctx.font = `500 6.2px ${MONO}`;
        for (let i = 0; i < CHECKS.length; i++) {
          const st = 0.3 + i * 1.25, y = -DISP_H / 2 + 16 + i * 8.6;
          const lt = rt - st;
          if (lt < 0) break;
          const name = CHECKS[i].name, res = CHECKS[i].result;
          const nShown = Math.min(name.length, Math.floor((lt / 0.18) * name.length));
          ctx.textAlign = "left"; ctx.fillStyle = "rgba(235,235,245,.82)";
          ctx.fillText(name.slice(0, nShown), x0, y);
          if (lt > 0.18 && lt < 0.92) {
            // scanning: a travelling bar of dots where the result will appear
            ctx.fillStyle = "rgba(100,190,255,.85)";
            for (let k = 0; k < 6; k++) {
              const a = 0.25 + 0.75 * Math.max(0, Math.sin((lt * 7 - k * 0.55)));
              ctx.globalAlpha = a; ctx.fillRect(xr - 7 - 34 + k * 5.2, y - 0.6, 2.6, 1.2);
            }
            ctx.globalAlpha = 1;
          }
          if (nShown === name.length) {
            // dot leader joins the label to its result across the row
            const lx = x0 + ctx.measureText(name).width + 2, rx = xr - 7 - ctx.measureText(lt >= 0.9 ? res : "").width - 2 - (lt >= 0.9 ? 0 : 36);
            ctx.fillStyle = "rgba(235,235,245,.16)";
            for (let x = lx; x < rx; x += 2.2) ctx.fillRect(x, y + 1.2, 0.6, 0.6);
          }
          if (lt >= 0.9) {
            const k = Math.min(res.length, Math.ceil(((lt - 0.9) / 0.22) * res.length));
            ctx.textAlign = "right"; ctx.fillStyle = RES_COL[res];
            const shown = res.slice(0, k);
            ctx.fillText(shown + " ".repeat(res.length - k), xr - 7, y);
          }
          if (lt >= 1.1) {
            const p = clamp01((lt - 1.1) / 0.2), sc = p < 1 ? 0.4 + 0.9 * easeOut(p) - 0.3 * Math.sin(p * Math.PI) : 1;
            ctx.save(); ctx.translate(xr - 2, y); ctx.scale(sc, sc);
            ctx.beginPath(); ctx.arc(0, 0, 2.3, 0, Math.PI * 2); ctx.fillStyle = RES_COL[res]; ctx.fill();
            ctx.strokeStyle = "#0b0b0d"; ctx.lineWidth = 0.65; ctx.lineCap = "round"; ctx.lineJoin = "round";
            ctx.beginPath();
            if (res === "Restricted") { ctx.moveTo(-1.1, 0); ctx.lineTo(1.1, 0); }
            else { const d = clamp01((lt - 1.12) / 0.16); ctx.moveTo(-1.15, 0.05); ctx.lineTo(-0.35, 0.85); if (d > 0) ctx.lineTo(-0.35 + 1.6 * d, 0.85 - 1.85 * d); }
            ctx.stroke();
            ctx.restore();
          }
        }
        // scanning line sweeping the whole panel while a check runs
        const cur = Math.floor((rt - 0.3) / 1.25), lt = rt - 0.3 - cur * 1.25;
        if (S.disp === "read" && cur >= 0 && cur < CHECKS.length && lt > 0.18 && lt < 0.92) {
          const yy = -DISP_H / 2 + 10 + ((lt - 0.18) / 0.37 % 1) * (DISP_H - 10);
          const g = ctx.createLinearGradient(0, yy - 6, 0, yy + 0.6);
          g.addColorStop(0, "rgba(100,190,255,0)"); g.addColorStop(0.9, "rgba(100,190,255,.16)"); g.addColorStop(1, "rgba(170,225,255,.9)");
          ctx.fillStyle = g; ctx.fillRect(-DISP_W / 2, yy - 6, DISP_W, 6.6);
        }
      }
      // glass reflection
      const gr = ctx.createLinearGradient(-DISP_W / 2, -DISP_H / 2, -DISP_W / 2 + 50, DISP_H / 2);
      gr.addColorStop(0, "rgba(255,255,255,.08)"); gr.addColorStop(0.5, "rgba(255,255,255,.025)"); gr.addColorStop(0.51, "rgba(255,255,255,0)");
      ctx.fillStyle = gr; ctx.fillRect(-DISP_W / 2, -DISP_H / 2, DISP_W, DISP_H);
      ctx.restore();
      base();
    };

    /* ---------- the card ---------- */
    const U: V3 = [0, 0, 0], Vv: V3 = [0, 0, 0], Nn: V3 = [0, 0, 0];
    const frame3 = () => {
      const cr = Math.cos(C.roll), sr = Math.sin(C.roll), cp = Math.cos(C.pitch), sp = Math.sin(C.pitch), cy = Math.cos(C.yaw), sy = Math.sin(C.yaw);
      const rot = (u: number, v: number, w: number, o: V3) => {
        const x1 = u * cr - v * sr, y1 = u * sr + v * cr, z1 = w;
        const y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp;
        o[0] = x1 * cy + z2 * sy; o[1] = y2; o[2] = -x1 * sy + z2 * cy;
      };
      rot(1, 0, 0, U); rot(0, 1, 0, Vv); rot(0, 0, 1, Nn);
    };
    const cpt = (u: number, v: number, w: number): V3 => [C.x + U[0] * u + Vv[0] * v + Nn[0] * w, C.y + U[1] * u + Vv[1] * v + Nn[1] * w, C.z + U[2] * u + Vv[2] * v + Nn[2] * w];
    /** card outline at offset w, clipped to y >= yc (what is above the slot) */
    const outline = (w: number, yc: number) => {
      const pts = C_LOOP.map(([u, v]) => cpt(u, v, w));
      const out: V3[] = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], ia = a[1] >= yc, ib = b[1] >= yc;
        if (ia) out.push(a);
        if (ia !== ib) { const t = (yc - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * t, yc, a[2] + (b[2] - a[2]) * t]); }
      }
      return out;
    };
    const polyPath = (pts: V3[]) => { const f: number[] = []; for (const p of pts) f.push(p[0], p[1], p[2]); path3(f); };
    const drawCardShadow = () => {
      // soft shadow of the hovering card on the top face, sharpening as it comes down
      const h = C.y - CHT / 2 - topY();
      if (h < -1) return;
      const k = Math.max(0, h + CHT / 2) / LD[1];
      const sx = C.x - LD[0] * k * 0.55, sz = C.z - LD[2] * k * 0.55;
      const a = 0.42 * Math.exp(-Math.max(0, h) / 40);
      ctx.save();
      const q: number[] = [];
      for (const p of R_IN) rw(p.x, RH, p.z, q);
      path3(q); ctx.clip();
      const spread = 1 + Math.max(0, h) * 0.012;
      plane(sx + S.sx, topY() + 0.03, Math.max(-RD / 2 + 6, Math.min(RD / 2 - 6, sz)), (CW * spread) / sprCard.w / sprCard.q * Math.abs(Math.cos(C.yaw)), 0, 0, 0, 0, ((4 + Math.max(0, h) * 0.18) / sprCard.h) / sprCard.q);
      ctx.globalAlpha = a;
      ctx.drawImage(sprCard.c, -sprCard.c.width / 2, -sprCard.c.height / 2);
      ctx.globalAlpha = 1;
      ctx.restore();
      base();
    };
    const drawCard = () => {
      frame3();
      const yc = topY() - 0.2;
      const front = facing(Nn[0], Nn[1], Nn[2], C.x, C.y, C.z);
      const far = outline(front ? -CTH / 2 : CTH / 2, yc), near = outline(front ? CTH / 2 : -CTH / 2, yc);
      if (near.length < 3) return;
      // card edge (thickness) shows where the far face peeks out
      if (far.length > 2) {
        polyPath(far);
        const ec = shade(C_EDGE, MATTE_BLACK, Vv[0], Vv[1], Vv[2], C.x, C.y, C.z, 1.0);
        ctx.fillStyle = ec; ctx.fill(); ctx.strokeStyle = ec; ctx.lineWidth = 0.8; ctx.stroke();
      }
      ctx.save();
      polyPath(near); ctx.clip();
      const w = front ? CTH / 2 : -CTH / 2, c0 = cpt(0, 0, w);
      if (front) plane(c0[0], c0[1], c0[2], U[0], U[1], U[2], -Vv[0], -Vv[1], -Vv[2]);
      else plane(c0[0], c0[1], c0[2], -U[0], -U[1], -U[2], -Vv[0], -Vv[1], -Vv[2]);
      ctx.drawImage(front ? texF : texB, -CW / 2, -CHT / 2, CW, CHT);
      // lighting across the card face: Lambert + a moving specular sheen
      const nx = front ? Nn[0] : -Nn[0], ny = front ? Nn[1] : -Nn[1], nz = front ? Nn[2] : -Nn[2];
      const nl = Math.max(0, nx * LD[0] + ny * LD[1] + nz * LD[2]);
      ctx.fillStyle = `rgba(20,24,32,${(0.14 * (1 - nl)).toFixed(3)})`; ctx.fillRect(-CW / 2, -CHT / 2, CW, CHT);
      const sweep = (C.yaw * 1.6 + C.roll * 2.2 + (C.pitch % Math.PI) * 0.8 + (C.y - FLOAT_Y) * 0.004) * 60;
      if (front) {
        // holographic foil on the seal and the lower band: hue shifts with the viewing angle
        ctx.save();
        ctx.beginPath(); ctx.arc(74 - CW / 2, 37 - CHT / 2, 10.5, 0, Math.PI * 2);
        ctx.rect(-CW / 2, 41 - CHT / 2, 60, 9);
        ctx.clip();
        const hg = ctx.createLinearGradient(-60 + sweep, -40, 60 + sweep, 40);
        const hues = ["rgba(255,120,200,.34)", "rgba(255,210,120,.34)", "rgba(140,255,170,.34)", "rgba(110,200,255,.36)", "rgba(190,140,255,.34)", "rgba(255,120,200,.34)"];
        hues.forEach((c, i) => hg.addColorStop(i / (hues.length - 1), c));
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = hg; ctx.fillRect(-CW / 2, -CHT / 2, CW, CHT);
        ctx.globalCompositeOperation = "source-over";
        const sh = ctx.createLinearGradient(-30 + sweep * 0.8, -30, 10 + sweep * 0.8, 30);
        sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.5, "rgba(255,255,255,.55)"); sh.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = sh; ctx.fillRect(-CW / 2, -CHT / 2, CW, CHT);
        ctx.restore();
        // the stamped badge
        if (S.badge > 0.001) {
          const p = S.badge, a = clamp01(p * 3);
          ctx.save();
          ctx.translate(55 - CW / 2, 42 - CHT / 2); ctx.rotate(-0.14);
          const sc = Math.max(0.2, S.bs);
          ctx.scale(sc, sc);
          ctx.globalAlpha = a;
          ctx.beginPath(); rr(ctx, -14, -4.6, 28, 9.2, 4.6);
          ctx.fillStyle = "#28c840"; ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 0.6; ctx.stroke();
          ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.beginPath(); ctx.moveTo(-10.4, 0); ctx.lineTo(-8.6, 1.8); ctx.lineTo(-5.4, -1.8); ctx.stroke();
          ctx.fillStyle = "#ffffff"; ctx.font = `700 5px ${FONT}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillText("Verified", -3.6, 0.3);
          ctx.restore();
          if (S.ring >= 0 && S.ring < 1) {
            ctx.save();
            ctx.translate(55 - CW / 2, 42 - CHT / 2); ctx.rotate(-0.14);
            const rs = 1 + S.ring * 0.45;
            ctx.scale(rs, rs);
            ctx.beginPath(); rr(ctx, -14, -4.6, 28, 9.2, 4.6);
            ctx.strokeStyle = `rgba(40,200,64,${(0.6 * (1 - S.ring)).toFixed(3)})`; ctx.lineWidth = 0.8; ctx.stroke();
            ctx.restore();
          }
        }
      } else {
        const sh = ctx.createLinearGradient(-30 + sweep * 0.8, -30, 10 + sweep * 0.8, 30);
        sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.5, "rgba(255,255,255,.3)"); sh.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = sh; ctx.fillRect(-CW / 2, -CHT / 2, CW, CHT);
      }
      // occlusion where the card enters the slot
      const vClip = (yc - C.y) / (Math.abs(Vv[1]) > 0.2 ? Vv[1] : 1);
      if (C.y - CHT / 2 < yc + 6 && Math.abs(Vv[1]) > 0.5) {
        const ty = Vv[1] > 0 ? -vClip : vClip;
        const g = ctx.createLinearGradient(0, ty, 0, ty - 7 * Math.sign(Vv[1]));
        g.addColorStop(0, "rgba(0,0,0,.5)"); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(-CW / 2, Math.min(ty, ty - 7 * Math.sign(Vv[1])), CW, 7);
      }
      ctx.restore();
      base();
      polyPath(near);
      ctx.strokeStyle = "rgba(0,0,0,.14)"; ctx.lineWidth = 0.5; ctx.stroke();
    };

    /* ---------- paint ---------- */
    const paint = () => {
      base();
      ctx.clearRect(0, 0, W, Hs);
      const squash = clamp01(-S.dy / 2);
      deskSprite(sprAmb, 6, 0, 8, RW + 40, RD + 40, 0.1);
      deskSprite(sprSoft, 10 + S.sx, 0, 10, RW + 10, RD + 8, 0.28);
      deskSprite(sprBody, S.sx, 0, 0, RW - 6, RD - 6, 0.55 + 0.15 * squash);
      drawReader();
      drawCardShadow();
      drawCard();
      // the slot's front lip sits in front of an inserted card
      if (C.y - CHT / 2 < topY() + 0.5) {
        plane(S.sx, topY() + 0.03, 0, 1, 0, 0, 0, 0, 1);
        ctx.beginPath(); ctx.moveTo(-SLOT_HW + 1.5, 1.85); ctx.lineTo(SLOT_HW - 1.5, 1.85);
        ctx.strokeStyle = "rgba(60,62,66,1)"; ctx.lineWidth = 0.9; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-SLOT_HW + 1.8, 2.25); ctx.lineTo(SLOT_HW - 1.8, 2.25);
        ctx.strokeStyle = "rgba(255,255,255,.2)"; ctx.lineWidth = 0.4; ctx.stroke();
        base();
      }
      placeOverlay();
    };
    const cardRect = () => {
      frame3();
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const [u, v] of [[-CW / 2, -CHT / 2], [CW / 2, -CHT / 2], [CW / 2, CHT / 2], [-CW / 2, CHT / 2]]) {
        const p = cpt(u, v, 0);
        proj(cam, p[0], Math.max(p[1], topY()), p[2]);
        x0 = Math.min(x0, O.x); x1 = Math.max(x1, O.x); y0 = Math.min(y0, O.y); y1 = Math.max(y1, O.y);
      }
      return { x0, x1, y0, y1 };
    };
    const placeOverlay = () => {
      const b = cardBtn.current;
      if (!b) return;
      const r = cardRect();
      b.style.transform = `translate(${(r.x0 - 3).toFixed(1)}px,${(r.y0 - 3).toFixed(1)}px)`;
      b.style.width = `${(r.x1 - r.x0 + 6).toFixed(1)}px`; b.style.height = `${Math.max(16, r.y1 - r.y0 + 6).toFixed(1)}px`;
    };

    /* ---------- behaviour ---------- */
    const local = (e: { clientX: number; clientY: number }): Pt => {
      const r = el.getBoundingClientRect(), s = r.width / el.offsetWidth || 1;
      return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
    };
    const aligned = () => Math.abs(C.x) < 16 && C.y - CHT / 2 < topY() + 18;
    const insert = () => {
      if (S.phase !== "float" && S.phase !== "drag") return;
      S.held = false;
      S.phase = "insert";
      S.led = 0;
      setUiBoth("busy"); setCaption("Reading card");
      const x0 = C.x, y0 = C.y, yaw0 = C.yaw, roll0 = C.roll;
      const above = topY() + CHT / 2 + 1.5;
      const pre = Math.max(0, y0 - above) > 2 || Math.abs(x0) > 0.5 ? 0.36 : 0;
      const depth = S.flipped ? REJ_DEPTH : INS_DEPTH;
      const go = async () => {
        if (pre > 0) await tween(pre, easeIO, (v) => { C.x = lerp(x0, 0, v); C.y = lerp(y0, Math.min(y0, above), v); C.yaw = lerp(yaw0, 0, v); C.roll = lerp(roll0, 0, v); });
        if (!alive) return;
        const ys = C.y, yaw1 = C.yaw, roll1 = C.roll;
        const dur = S.flipped ? 0.2 : 0.42;
        // the slide, then the click as the card seats at the end of the tween
        later(() => sfx("card-insert", 0.6), Math.max(0, (dur - 0.12) * 1000));
        await tween(dur, S.flipped ? easeIn : (t) => t * t * (2.2 - 1.2 * t), (v) => { C.x = lerp(C.x, 0, v); C.yaw = lerp(yaw1, 0, v); C.roll = lerp(roll1, 0, v); C.y = lerp(ys, topY() + CHT / 2 - depth, v); });
        if (!alive) return;
        C.vx = C.vy = 0;
        if (S.flipped) reject(); else accept();
      };
      void go();
    };
    const accept = () => {
      S.phase = "read";
      S.dvy -= 30; // seats with a little dip
      S.led = 1; S.ledT = S.t;
      sfx("scan-sweep", 0.5);
      S.disp = "read"; S.readT = 0; S.said = -1; S.readDone = false;
      S.badge = 0; S.badgeOn = false;
      setStatus("Card inserted. Verifying.");
    };
    const reject = () => {
      S.phase = "reject";
      S.dvy -= 22;
      S.shake = 1; S.led = 3; S.ledT = S.t; S.disp = "err";
      sfx("access-denied", 0.7);
      setUiBoth("rejected"); setCaption("Card upside down");
      setStatus("Card rejected: it is upside down. Flip it and try again.");
      later(() => {
        S.led = 0; S.phase = "eject";
        sfx("wood-tap", 0.45);
        C.vy = 120;
        later(() => { S.phase = "float"; setUiBoth("ready"); }, 700);
      }, 650);
    };
    const finishRead = () => {
      S.readDone = true;
      S.led = 2; S.ledT = S.t; S.disp = "ok";
      sfx("access-granted", 0.7);
      setStatus("Identity verified. Access limited, AI usage restricted.");
      later(() => {
        S.phase = "eject";
        sfx("wood-tap", 0.45);
        C.vy = 70; S.dvy += 14;
        later(() => {
          sfx("wood-block", 0.75);
          S.badgeOn = true; S.badge = 0.001; S.ring = 0; S.bs = 1.9; S.bsv = 0;
          C.vz = -10;
        }, 360);
        later(() => { S.phase = "float"; setUiBoth("verified"); setCaption("Verified"); }, 900);
      }, 450);
    };
    const flip = () => {
      if (S.phase !== "float") return;
      S.phase = "flip";
      S.flipped = !S.flipped;
      sfx("paper-flip", 0.5);
      S.led = 0;
      flippedRef.current = S.flipped; setFlipped(S.flipped);
      const p0 = C.pitch, p1 = S.flipped ? Math.PI : 0, y0 = C.y, z0 = C.z;
      let cleared = false;
      void tween(0.62, easeIO, (v) => {
        C.pitch = lerp(p0, p1, v);
        C.y = lerp(y0, FLOAT_Y, v) + Math.sin(v * Math.PI) * 7;
        C.z = lerp(z0, 0, v) + Math.sin(v * Math.PI) * 10;
        // the stamp is reset while the front faces away
        if (!cleared && v > 0.5 && S.flipped && S.badge > 0) { cleared = true; S.badge = 0; S.badgeOn = false; S.ring = -1; }
      }).then(() => {
        C.pitch = p1;
        S.phase = "float";
        if (S.disp !== "read") S.disp = "idle";
        setUiBoth("ready"); setCaption(S.flipped ? "Card is upside down" : "Ready for a card");
        setStatus(S.flipped ? "Card flipped. It is now upside down." : "Card flipped back. Chip side forward.");
      });
    };
    const grab = (p: Pt, auto: boolean) => {
      if (S.phase !== "float") return false;
      const [gx, gy] = unprojZ(cam, p.x, p.y, C.z);
      S.grab = [C.x - gx, C.y - gy];
      S.held = true; S.auto = auto; S.ptr = p;
      S.phase = "drag";
      sfx("glass-tap", 0.3);
      return true;
    };
    const release = () => {
      if (S.phase !== "drag") return;
      S.held = false;
      if (aligned()) insert();
      else { S.phase = "float"; }
    };

    /* ---------- physics ---------- */
    const step = (dt: number) => {
      const t = S.t;
      const n = Math.ceil(dt / (1 / 240)), h = dt / n;
      for (let i = 0; i < n; i++) {
        // reader suspension (soft feet) and shake
        S.dvy += (-420 * S.dy - 16 * S.dvy) * h; S.dy += S.dvy * h;
        if (S.phase === "float" || S.phase === "flip") {
          const bob = Math.sin(t * 1.7) * 1.6, ty = FLOAT_Y + (S.phase === "flip" ? C.y - FLOAT_Y : bob);
          if (S.phase === "float") {
            C.vy += (90 * (ty - C.y) - 13 * C.vy) * h; C.y += C.vy * h;
            C.vx += (90 * (0 - C.x) - 13 * C.vx) * h; C.x += C.vx * h;
            C.z += (0 - C.z) * Math.min(1, h * 6);
            C.vyaw += (60 * (Math.sin(t * 0.9) * 0.16 - C.yaw) - 9 * C.vyaw) * h; C.yaw += C.vyaw * h;
            C.vroll += (70 * (Math.sin(t * 1.3 + 1) * 0.025 - C.roll) - 10 * C.vroll) * h; C.roll += C.vroll * h;
          }
        } else if (S.phase === "eject") {
          C.vy += (95 * (FLOAT_Y - C.y) - 9.5 * C.vy) * h; C.y += C.vy * h;
          C.z += C.vz * h; C.vz += (-120 * C.z - 10 * C.vz) * h;
          C.vyaw += (40 * (0 - C.yaw) - 8 * C.vyaw) * h; C.yaw += C.vyaw * h;
        } else if (S.phase === "read") {
          C.y = topY() + CHT / 2 - INS_DEPTH;
        } else if (S.phase === "reject") {
          C.y = topY() + CHT / 2 - REJ_DEPTH;
        }
      }
      // shake on reject, the card moves with the reader
      if (S.shake > 0.001) {
        S.shake *= Math.exp(-dt * 4.2);
        S.sx = Math.sin((t - S.ledT) * 46) * 1.9 * S.shake;
        if (S.phase === "reject") C.x = S.sx;
      } else if (S.sx !== 0) { S.sx = 0; }
      if (S.phase === "drag") {
        const [hx, hy] = unprojZ(cam, S.ptr.x, S.ptr.y, C.z);
        let tx = hx + S.grab[0], ty = hy + S.grab[1];
        // the slot guides the card: near it the card centres and straightens, and only then may go below the top
        const near = Math.abs(tx) < 16 && ty - CHT / 2 < topY() + 22;
        const minY = near ? topY() + CHT / 2 - INS_DEPTH * 0.5 : topY() + CHT / 2 + 2;
        if (near) tx *= clamp01((ty - CHT / 2 - topY()) / 22);
        ty = Math.max(minY, ty);
        const k = 1 - Math.exp(-dt * 40);
        const ox = C.x;
        C.x += (tx - C.x) * k; C.y += (ty - C.y) * k;
        C.vx = (C.x - ox) / dt;
        const rollT = near ? 0 : Math.max(-0.3, Math.min(0.3, -C.vx * 0.0016));
        C.roll += (rollT - C.roll) * Math.min(1, dt * 12);
        C.yaw += ((near ? 0 : 0.08) - C.yaw) * Math.min(1, dt * 8);
      }
      // display timeline
      if (S.phase === "read" && S.readT >= 0) {
        S.readT += dt;
        const done = Math.floor((S.readT - 0.3 - 1.1) / 1.25);
        if (done > S.said && done < CHECKS.length) {
          S.said = done;
          const c = CHECKS[done];
          sfx("relay-click", 0.3);
          setStatus(`${c.name}: ${c.result}.`);
          setCaption(`${c.name}: ${c.result}`);
        }
        if (!S.readDone && S.readT > 0.3 + CHECKS.length * 1.25 + 0.15) finishRead();
      } else if (S.readT >= 0 && S.disp === "ok") S.readT += dt;
      // badge stamp: overshoot then settle
      if (S.badgeOn && S.badge < 1) S.badge = Math.min(1, S.badge + dt / 0.12);
      if (S.badgeOn) {
        // the stamp hits, over-squashes and settles
        const n2 = Math.ceil(dt / (1 / 240));
        for (let i = 0; i < n2; i++) { S.bsv += (520 * (1 - S.bs) - 20 * S.bsv) * (dt / n2); S.bs += S.bsv * (dt / n2); }
      }
      if (S.ring >= 0 && S.ring < 1) S.ring = Math.min(1, S.ring + dt / 0.5);
    };

    /* ---------- loop ---------- */
    let raf = 0, last = performance.now();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min(1 / 30, Math.max(0.001, (now - last) / 1000));
      last = now;
      S.t += dt;
      for (const tw of [...tweens]) {
        tw.t += dt;
        const v = clamp01(tw.t / tw.dur);
        tw.fn(tw.ease(v));
        if (v >= 1) { tweens.delete(tw); tw.done(); }
      }
      step(dt);
      const gh = ghostEl.current;
      if (gh) { gh.style.transform = `translate(${(ghost.x - 13).toFixed(1)}px,${(ghost.y - 13).toFixed(1)}px) scale(${ghost.sc.toFixed(3)})`; gh.style.opacity = ghost.op.toFixed(3); }
      paint();
    };
    const ro = new ResizeObserver(() => resize());
    ro.observe(el);
    resize();
    raf = requestAnimationFrame(frame);

    eng.current = {
      insert,
      flip,
      down: (e) => { if (grab(local(e), false)) e.currentTarget.setPointerCapture(e.pointerId); },
      move: (e) => { if (S.held && !S.auto) S.ptr = local(e); },
      up: (e) => { if (S.held && !S.auto) { S.ptr = local(e); release(); } },
      cancel: () => { if (S.held && !S.auto) { S.held = false; S.phase = "float"; } },
      autoGrab: (p) => { grab(p, true); },
      autoMove: (p) => { if (S.held && S.auto) S.ptr = p; },
      autoDrop: () => { if (S.held && S.auto) release(); },
      cardPt: () => { const r = cardRect(); return { x: (r.x0 + r.x1) / 2, y: (r.y0 + r.y1) / 2 }; },
      slotPt: () => { proj(cam, 0, topY() + 6, 0); return { x: O.x, y: O.y }; },
      phase: () => S.phase,
      tween,
      ghost,
    };

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      timers.forEach(clearTimeout); timers.clear();
      tweens.clear();
      eng.current = null;
    };
  }, []);

  const onRootDown = () => {
    if (touched.current) return;
    touched.current = true;
    setGhostOn(false);
    const E = eng.current;
    if (E) { E.autoDrop(); E.ghost.op = 0; }
  };

  /* ================= autoplay: insert, verify, eject; flip, rejected; flip back; loop ================= */
  useEffect(() => {
    if (!autoplay) return;
    let dead = false;
    const local: ReturnType<typeof setTimeout>[] = [];
    const sleep = (ms: number) => new Promise<void>((r) => local.push(setTimeout(r, ms)));
    const stop = () => dead || touched.current || !eng.current;
    const E = () => eng.current!;
    const waitFloat = async (max = 12000) => { let t = 0; while (!stop() && (E().phase() !== "float" || uiRef.current === "busy") && t < max) { await sleep(100); t += 100; } };
    const moveGhost = (x: number, y: number, dur: number, drag: boolean) => {
      const g = E().ghost, x0 = g.x, y0 = g.y;
      const cx = (x0 + x) / 2 + (drag ? 0 : 20), cy = Math.min(y0, y) - (drag ? 6 : 20);
      return E().tween(dur, easeIO, (v) => {
        if (stop()) return;
        const a = (1 - v) ** 2, b = 2 * (1 - v) * v, c = v * v;
        g.x = a * x0 + b * cx + c * x; g.y = a * y0 + b * cy + c * y;
        if (drag) E().autoMove({ x: g.x, y: g.y });
      });
    };
    const dragIn = async () => {
      const g = E().ghost, cp = E().cardPt();
      setGhostOn(true);
      if (g.op < 0.05) { g.x = cp.x + 70; g.y = cp.y + 40; }
      void E().tween(0.3, easeIO, (v) => { g.op = Math.max(g.op, v); });
      await moveGhost(cp.x + 6, cp.y + 4, 0.6, false);
      if (stop()) return;
      await E().tween(0.1, easeOut, (v) => { g.sc = 1 - 0.18 * v; });
      E().autoGrab({ x: g.x, y: g.y });
      const sp = E().slotPt();
      await moveGhost(g.x - (cp.x - sp.x) * 0.2, g.y + 34, 0.5, true);
      await moveGhost(sp.x + 6, sp.y + 2, 0.45, true);
      await sleep(80);
      if (stop()) return;
      E().autoDrop();
      void E().tween(0.15, easeOut, (v) => { g.sc = 0.82 + 0.18 * v; });
      await sleep(200);
      void E().tween(0.4, easeIO, (v) => { g.op = Math.min(g.op, 1 - v); });
    };
    (async () => {
      await sleep(900);
      while (!stop()) {
        await dragIn();
        await sleep(400);
        await waitFloat();
        await sleep(1700);
        if (stop()) break;
        E().flip();
        await sleep(1100);
        if (stop()) break;
        E().insert();
        await sleep(600);
        await waitFloat();
        await sleep(900);
        if (stop()) break;
        E().flip();
        await sleep(1300);
      }
      if (!dead) setGhostOn(false);
    })();
    return () => { dead = true; local.forEach(clearTimeout); };
  }, [autoplay]);

  /* ================= render ================= */
  const busy = ui === "busy";
  return (
    <div
      className={`relative w-full max-w-[440px] select-none rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      onPointerDownCapture={onRootDown}
      onKeyDownCapture={onRootDown}
    >
      <div className="flex items-center justify-between gap-3 px-5 pb-0 pt-4">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">Verify identity</h3>
          <p className="truncate text-[12px] text-[#6e6e73]">Ada Lovelace &middot; Analyst</p>
        </div>
        <motion.span
          key={ui}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 28 }}
          className={`flex-none whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium ${ui === "verified" ? "bg-[#e8f8ec] text-[#1b7f35]" : ui === "rejected" ? "bg-[#fdecea] text-[#c4271d]" : ui === "busy" ? "bg-[#e8f2fd] text-[#0066cc]" : "bg-[#f5f5f7] text-[#6e6e73]"}`}
        >
          {caption}
        </motion.span>
      </div>

      <div ref={stage} role="group" aria-label="Card reader" className="relative mx-3" style={{ height: H }}>
        <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute left-0 top-0" />
        <button
          ref={cardBtn}
          type="button"
          aria-label={`ID card for Ada Lovelace${flipped ? ", upside down" : ""}. Drag it into the reader or press Enter to insert. Double-click to flip.`}
          onPointerDown={(e) => eng.current?.down(e)}
          onPointerMove={(e) => eng.current?.move(e)}
          onPointerUp={(e) => eng.current?.up(e)}
          onPointerCancel={() => eng.current?.cancel()}
          onDoubleClick={() => eng.current?.flip()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); eng.current?.insert(); } }}
          className="absolute left-0 top-0 cursor-grab touch-none rounded-[8px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] active:cursor-grabbing"
        />
        {ghostOn && <div ref={ghostEl} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-30 h-[26px] w-[26px] rounded-full border-2 border-white bg-[#1d1d1f]/25 shadow-[0_4px_12px_rgba(0,0,0,.25)]" style={{ opacity: 0 }} />}
      </div>

      <div className="flex items-center justify-center gap-2 px-5 pt-1">
        <motion.button
          type="button"
          aria-disabled={busy}
          onClick={() => { if (!busy) eng.current?.insert(); }}
          whileTap={busy ? undefined : { scale: 0.95 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          className={`h-10 rounded-full px-5 text-[14px] font-semibold tracking-[-0.01em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] ${busy ? "bg-[#e8e8ed] text-[#5e5e63]" : "bg-[#0071e3] text-white"}`}
        >
          {ui === "verified" ? "Verify again" : "Insert card"}
        </motion.button>
        <motion.button
          type="button"
          aria-disabled={busy}
          aria-pressed={flipped}
          onClick={() => { if (!busy) eng.current?.flip(); }}
          whileTap={busy ? undefined : { scale: 0.95 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          className="h-10 rounded-full bg-[#f5f5f7] px-5 text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
        >
          Flip card
        </motion.button>
      </div>
      <p id={`${uid}hint`} className="px-5 pb-4 pt-3 text-center text-[12px] text-[#6e6e73]">Drag the card into the slot, or press Insert card. Double-click the card to flip it.</p>
      <div className="sr-only" role="status" aria-live="polite">{status}</div>
    </div>
  );
}
```

--- components/card-reader-verify/index.ts ---

```ts
export { CardReaderVerify } from "./card-reader-verify";
export type { CardReaderVerifyProps } from "./card-reader-verify";
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

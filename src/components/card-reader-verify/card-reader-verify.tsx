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

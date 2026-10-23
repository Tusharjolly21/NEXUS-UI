"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Branch = { x: number; y: number; a: number; left: number; w: number; depth: number; speed: number; next: number; curl: number; side: number };
type Crack = { x: number; y: number; a: number; left: number; w: number; depth: number; next: number };
type Shard = { pts: number[]; cx: number; cy: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; age: number; snap: HTMLCanvasElement };
type Chip = { x: number; y: number; vx: number; vy: number; s: number; age: number; life: number };
type Mist = { x: number; y: number; r: number; age: number; life: number; vx: number };

type Api = {
  focus: (x?: number) => void;
  blur: () => void;
  crack: () => void;
  shatter: (fromButton: boolean) => void;
  shake: () => void;
  reset: () => void;
};

const noop = () => {};
const FONT = `500 18px -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif`;
const PAD_L = 24;
const GHOST_TEXT = "hello@nexus.design";

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Ratio between painted and layout size, i.e. the CSS scale of a parent (1 when there is none). */
function layoutScale(el: HTMLElement, rectWidth: number) {
  const k = el.offsetWidth ? rectWidth / el.offsetWidth : 1;
  return Math.abs(k - 1) < 0.005 ? 1 : k;
}

/**
 * Frost Input: a sign-up field with an ice power. Focus it and frost crystals branch out from where
 * you clicked, six-fold like real ice, until the glass is frozen over and the text glows cold. Every
 * key you type drives a crack through the ice from the caret, with chips of ice spitting out. Send it
 * and the whole field shatters from the point of impact into tumbling shards that fall away to
 * reveal the confirmation, then the field freezes back together. Blur it and the frost thaws. The
 * input is a real form field (label, Enter to submit). With `autoplay` a ghost types an address and
 * sends it until you click in. Pauses off screen and stays calm for people who prefer reduced motion
 * (the frost appears at once, no cracks, shards or snow drift).
 */
export type FrostInputProps = {
  /** Placeholder text inside the empty field. */
  placeholder?: string;
  /** Headline above the field. */
  headline?: string;
  /** Message shown after the field shatters. */
  done?: string;
  /** Called with the trimmed value when the form is sent. */
  onSubmit?: (value: string) => void;
  /** Height of the stage, in px. */
  height?: number;
  /** A ghost clicks in, types an address and sends it, in a loop, until a real pointer or key arrives. */
  autoplay?: boolean;
  className?: string;
};

export function FrostInput({
  placeholder = "you@studio.com",
  headline = "Join the cold list.",
  done = "You’re on the list.",
  onSubmit,
  height = 420,
  autoplay = false,
  className,
}: FrostInputProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const reducedUi = useReducedMotion();
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);
  const api = useRef<Api>({ focus: noop, blur: noop, crack: noop, shatter: noop, shake: noop, reset: noop });
  const valueRef = useRef("");
  const ghostOn = useRef(false);
  const userTouched = useRef(false);

  useEffect(() => {
    const stage = stageRef.current!, bg = bgRef.current!, fx = fxRef.current!, pillEl = pillRef.current!, input = inputRef.current!;
    const gb = bg.getContext("2d")!, gf = fx.getContext("2d")!;
    const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // snow drifts and the demo plays only when asked for and when motion is welcome
    const ambient = autoplay && !reduced;
    let disposed = false;
    let w = 0, h = 0, dpr = 1;
    const pill = { x: 0, y: 0, w: 0, h: 0 };
    let frostC = document.createElement("canvas"), crackC = document.createElement("canvas");
    let fg = frostC.getContext("2d")!, cg = crackC.getContext("2d")!;
    // where frost has formed (soft coverage), a grain texture, and a scratch canvas to combine them
    let hazeC = document.createElement("canvas"), grainC = document.createElement("canvas"), compC = document.createElement("canvas");
    let hg = hazeC.getContext("2d")!, pg = compC.getContext("2d")!;
    const makeGrain = (cw: number, ch: number) => {
      const c = document.createElement("canvas");
      c.width = cw; c.height = ch;
      const q = c.getContext("2d")!;
      // frost is grainy: thousands of tiny crystals catching the light at different angles
      for (let k = 0; k < (cw * ch) / 9; k++) {
        const x = Math.random() * cw, y = Math.random() * ch;
        q.fillStyle = `rgba(240,250,255,${(0.05 + Math.random() * 0.35).toFixed(3)})`;
        const r = Math.random() < 0.85 ? 0.6 : 1.4;
        q.fillRect(x, y, r * dpr, r * dpr * (0.5 + Math.random()));
      }
      for (let k = 0; k < (cw * ch) / 400; k++) {
        const x = Math.random() * cw, y = Math.random() * ch, a = Math.random() * Math.PI, L = (2 + Math.random() * 5) * dpr;
        q.strokeStyle = `rgba(245,252,255,${(0.15 + Math.random() * 0.3).toFixed(3)})`;
        q.lineWidth = 0.5 * dpr;
        q.beginPath(); q.moveTo(x, y); q.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); q.stroke();
      }
      return c;
    };

    // ---- loop plumbing ----
    // The loop only runs while something moves and the stage is on screen; the last frame drawn stays
    // as the still image.
    let raf = 0;
    let visible = true;
    let prev = performance.now();
    let hadFx = false;
    let frame: (now: number) => void = () => {};
    const wake = () => {
      if (disposed || raf || !visible) return;
      prev = performance.now();
      raf = requestAnimationFrame((t) => frame(t));
    };

    const measure = () => {
      const a = stage.getBoundingClientRect(), b = pillEl.getBoundingClientRect();
      // Layout size and a scale-corrected offset, so a CSS-scaled parent does not skew the canvas.
      const k = layoutScale(stage, a.width);
      const nw = pillEl.offsetWidth, nh = pillEl.offsetHeight;
      if (Math.abs(nw - pill.w) > 0.5 || Math.abs(nh - pill.h) > 0.5) {
        frostC = document.createElement("canvas"); crackC = document.createElement("canvas");
        hazeC = document.createElement("canvas"); compC = document.createElement("canvas");
        for (const c of [frostC, crackC, hazeC, compC]) { c.width = Math.max(1, Math.round(nw * dpr)); c.height = Math.max(1, Math.round(nh * dpr)); }
        fg = frostC.getContext("2d")!; cg = crackC.getContext("2d")!; hg = hazeC.getContext("2d")!; pg = compC.getContext("2d")!;
        fg.setTransform(dpr, 0, 0, dpr, 0, 0); cg.setTransform(dpr, 0, 0, dpr, 0, 0); hg.setTransform(dpr, 0, 0, dpr, 0, 0);
        grainC = makeGrain(frostC.width, frostC.height);
      }
      pill.x = (b.left - a.left) / k; pill.y = (b.top - a.top) / k; pill.w = nw; pill.h = nh;
    };
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = stage.offsetWidth; h = stage.offsetHeight;
      for (const c of [bg, fx]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      pill.w = 0;
      measure();
      wake();
    };

    // ---- state ----
    let focused = false;
    let cold = 0;
    let branches: Branch[] = [];
    let cracks: Crack[] = [];
    let shards: Shard[] = [];
    const chips: Chip[] = [];
    let seeds = 0;
    let freezeT = 0;
    let shake = 0;
    let shattered = false;
    let mist: Mist[] = [];
    const flakes = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6, s: 8 + Math.random() * 22, p: Math.random() * 6 }));

    const inPill = (x: number, y: number) => x > 1 && y > 1 && x < pill.w - 1 && y < pill.h - 1;
    const sprout = (x: number, y: number, a: number, left: number) => {
      branches.push({ x, y, a, left, w: 1, depth: 0, speed: 38 + Math.random() * 34, next: 2 + Math.random() * 2, curl: (Math.random() - 0.5) * 0.9, side: Math.random() < 0.5 ? 1 : -1 });
    };
    const seed = (x: number, y: number, count = 6) => {
      const base = Math.random() * Math.PI;
      for (let k = 0; k < count; k++) sprout(x, y, base + (k / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4, 40 + Math.random() * 80);
      seeds++;
    };
    // frost starts at the cold rim and feathers inward
    const rimSeed = () => {
      const top = Math.random() < 0.5;
      const x = pill.h * 0.5 + Math.random() * (pill.w - pill.h);
      sprout(x, top ? 2 : pill.h - 2, (top ? Math.PI / 2 : -Math.PI / 2) + (Math.random() - 0.5) * 1.1, 18 + Math.random() * 34);
    };
    const charX = () => {
      gb.font = FONT;
      const v = input.value;
      // email fields do not report a caret position; the end of the text is a fine stand-in
      let sel = v.length;
      try { sel = input.selectionStart ?? v.length; } catch { /* unsupported input type */ }
      return Math.min(pill.w - 70, PAD_L + gb.measureText(v.slice(0, sel)).width);
    };

    // the frost as it really looks: grainy rime where it has formed, a milky haze, then the feathers
    const drawFrost = (g: CanvasRenderingContext2D, x: number, y: number, a: number) => {
      pg.setTransform(1, 0, 0, 1, 0, 0);
      pg.globalCompositeOperation = "source-over";
      pg.clearRect(0, 0, compC.width, compC.height);
      pg.drawImage(hazeC, 0, 0);
      pg.globalCompositeOperation = "source-in";
      pg.drawImage(grainC, 0, 0);
      pg.globalCompositeOperation = "source-over";
      g.save();
      g.globalAlpha = a * 0.6;
      g.drawImage(hazeC, x, y, pill.w, pill.h);
      g.globalAlpha = a;
      g.drawImage(compC, x, y, pill.w, pill.h);
      g.drawImage(frostC, x, y, pill.w, pill.h);
      g.drawImage(crackC, x, y, pill.w, pill.h);
      g.restore();
    };

    // the glass body of the field
    const drawBody = (g: CanvasRenderingContext2D, x: number, y: number, c: number) => {
      roundRect(g, x, y, pill.w, pill.h, pill.h / 2);
      const grd = g.createLinearGradient(0, y, 0, y + pill.h);
      grd.addColorStop(0, `rgba(${200 + 30 * c},${230 + 15 * c},255,${0.1 + 0.16 * c})`);
      grd.addColorStop(1, `rgba(160,210,255,${0.05 + 0.1 * c})`);
      g.fillStyle = grd;
      g.fill();
      g.strokeStyle = `rgba(220,240,255,${0.22 + 0.45 * c})`;
      g.lineWidth = 1;
      g.stroke();
      // a cold sheen along the top edge
      g.save();
      roundRect(g, x, y, pill.w, pill.h, pill.h / 2);
      g.clip();
      const sh = g.createLinearGradient(0, y, 0, y + pill.h * 0.5);
      sh.addColorStop(0, `rgba(255,255,255,${0.12 + 0.12 * c})`);
      sh.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = sh;
      g.fillRect(x, y, pill.w, pill.h * 0.5);
      g.restore();
    };

    // freeze seeding plus the growth of every frost branch
    const growFrost = (dt: number) => {
      if (focused) {
        freezeT += dt;
        // more seeds along the field so it freezes over completely
        if (seeds < 3 && freezeT > seeds * 0.45) seed(pill.w * (0.15 + 0.7 * Math.random()), pill.h * (0.2 + 0.6 * Math.random()), 5);
        if (freezeT < 2.6 && Math.random() < dt * 14) rimSeed();
      }
      fg.save();
      roundRect(fg, 0, 0, pill.w, pill.h, pill.h / 2);
      fg.clip();
      fg.lineCap = "round";
      const born: Branch[] = [];
      hg.save();
      roundRect(hg, 0, 0, pill.w, pill.h, pill.h / 2);
      hg.clip();
      for (const b of branches) {
        if (b.left <= 0) continue;
        const step = Math.min(b.left, b.speed * dt);
        // feathers curve gently as they grow
        b.a += b.curl * step * 0.012 + (Math.random() - 0.5) * 0.05;
        const nx = b.x + Math.cos(b.a) * step, ny = b.y + Math.sin(b.a) * step;
        const W = [0.85, 0.6, 0.42, 0.32][b.depth] ?? 0.3;
        const A = [0.42, 0.32, 0.25, 0.18][b.depth] ?? 0.15;
        fg.strokeStyle = `rgba(238,250,255,${A})`;
        fg.lineWidth = W;
        fg.beginPath(); fg.moveTo(b.x, b.y); fg.lineTo(nx, ny); fg.stroke();
        // the coverage the grainy frost will fill in, laid down behind each growing tip
        if (b.depth < 2) {
          const r = 7 - b.depth * 2.5;
          const grd = hg.createRadialGradient(nx, ny, 0, nx, ny, r);
          grd.addColorStop(0, "rgba(255,255,255,0.06)");
          grd.addColorStop(1, "rgba(255,255,255,0)");
          hg.fillStyle = grd;
          hg.beginPath(); hg.arc(nx, ny, r, 0, Math.PI * 2); hg.fill();
        }
        b.x = nx; b.y = ny; b.left -= step; b.next -= step;
        if (!inPill(nx, ny)) b.left = 0;
        // fern-like ice: short twigs off alternate sides at about sixty degrees, every few pixels
        if (b.next <= 0 && b.depth < 3 && branches.length + born.length < 2600) {
          b.next = (b.depth === 0 ? 2.6 : 2.2) + Math.random() * 2.2;
          b.side = -b.side;
          const len = Math.min(b.left * 0.45 + 3, (b.depth === 0 ? 5 : 2.5) + Math.random() * (b.depth === 0 ? 14 : 5));
          born.push({ x: nx, y: ny, a: b.a + b.side * (Math.PI / 3 + (Math.random() - 0.5) * 0.25), left: len, w: b.w * 0.7, depth: b.depth + 1, speed: b.speed * 0.85, next: 1.6 + Math.random() * 1.5, curl: b.curl * 0.5, side: b.side });
        }
      }
      hg.restore();
      branches = branches.filter((b) => b.left > 0).concat(born);
      fg.restore();
    };

    const growCracks = (dt: number) => {
      cg.save();
      roundRect(cg, 0, 0, pill.w, pill.h, pill.h / 2);
      cg.clip();
      cg.lineCap = "round";
      const kids: Crack[] = [];
      for (const c of cracks) {
        if (c.left <= 0) continue;
        const step = Math.min(c.left, 6 + Math.random() * 6, 600 * dt);
        const a = c.a + (Math.random() - 0.5) * 0.9;
        const nx = c.x + Math.cos(a) * step, ny = c.y + Math.sin(a) * step;
        // a dark refraction line under a bright edge reads as a crack in glass
        cg.strokeStyle = "rgba(6,30,64,0.5)";
        cg.lineWidth = c.w + 0.9;
        cg.beginPath(); cg.moveTo(c.x + 0.7, c.y + 0.7); cg.lineTo(nx + 0.7, ny + 0.7); cg.stroke();
        cg.strokeStyle = "rgba(255,255,255,0.95)";
        cg.lineWidth = c.w;
        cg.beginPath(); cg.moveTo(c.x, c.y); cg.lineTo(nx, ny); cg.stroke();
        c.x = nx; c.y = ny; c.left -= step; c.next -= step;
        if (!inPill(nx, ny)) c.left = 0;
        if (c.next <= 0 && c.depth < 2) {
          c.next = 8 + Math.random() * 10;
          if (Math.random() < 0.45) kids.push({ x: nx, y: ny, a: c.a + (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.6), left: c.left * 0.6 + 5, w: c.w * 0.7, depth: c.depth + 1, next: 8 });
        }
      }
      cracks = cracks.filter((c) => c.left > 0).concat(kids);
      cg.restore();
    };

    const clearIce = () => {
      fg.clearRect(0, 0, pill.w, pill.h); hg.clearRect(0, 0, pill.w, pill.h); cg.clearRect(0, 0, pill.w, pill.h);
      branches = []; cracks = [];
      seeds = 0;
    };

    // ---- interaction api ----
    api.current.focus = (x?: number) => {
      if (shattered || focused) return;
      focused = true;
      if (seeds === 0 || cold < 0.2) {
        clearIce();
        seed(x === undefined ? pill.w * 0.3 : Math.max(10, Math.min(pill.w - 10, x)), pill.h / 2);
        freezeT = 0;
      }
      if (reduced) {
        // no growing: let the ice form at once and show it frozen
        for (let i = 0; i < 90; i++) growFrost(1 / 30);
        cold = 1;
      }
      wake();
    };
    api.current.blur = () => { focused = false; wake(); };
    api.current.shake = () => { if (reduced) return; shake = 1; wake(); };
    api.current.crack = () => {
      if (reduced) return;
      const x = charX(), y = pill.h / 2 + (Math.random() - 0.5) * 8;
      // a crack runs both ways from the caret, then splits
      const up = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
      cracks.push({ x, y, a: up, left: pill.h * (0.6 + Math.random() * 0.5), w: 1.2, depth: 0, next: 6 });
      cracks.push({ x, y, a: up + Math.PI + (Math.random() - 0.5) * 0.6, left: pill.h * (0.6 + Math.random() * 0.5), w: 1.2, depth: 0, next: 6 });
      // where the blow landed the ice goes white and crazed: a spall of tiny fractures
      cg.save();
      const spall = cg.createRadialGradient(x, y, 0, x, y, 6);
      spall.addColorStop(0, "rgba(240,250,255,0.55)");
      spall.addColorStop(1, "rgba(240,250,255,0)");
      cg.fillStyle = spall;
      cg.beginPath(); cg.arc(x, y, 6, 0, Math.PI * 2); cg.fill();
      cg.strokeStyle = "rgba(255,255,255,0.7)";
      cg.lineWidth = 0.5;
      for (let k = 0; k < 7; k++) {
        const a = Math.random() * Math.PI * 2, L = 2 + Math.random() * 5;
        cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); cg.stroke();
      }
      cg.restore();
      if (Math.random() < 0.5) cracks.push({ x, y, a: (Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.7, left: 18 + Math.random() * 30, w: 0.8, depth: 1, next: 8 });
      for (let k = 0; k < 9; k++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, sp = 60 + Math.random() * 180;
        chips.push({ x: pill.x + x, y: pill.y + y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: 1 + Math.random() * 2.2, age: 0, life: 0.5 + Math.random() * 0.5 });
      }
      shake = Math.max(shake, 0.35);
      wake();
    };
    api.current.shatter = (fromButton: boolean) => {
      if (shattered) return;
      shattered = true;
      focused = false;
      cold = 0;
      if (reduced) {
        // no flying pieces: the field simply gives way to the confirmation
        clearIce();
        wake();
        return;
      }
      // a snapshot of the frozen field: body, frost, cracks and text
      const snap = document.createElement("canvas");
      snap.width = Math.round(pill.w * dpr); snap.height = Math.round(pill.h * dpr);
      const sg = snap.getContext("2d")!;
      sg.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawBody(sg, 0, 0, 1);
      drawFrost(sg, 0, 0, 1);
      sg.font = FONT;
      sg.textBaseline = "middle";
      sg.fillStyle = "#eaf7ff";
      sg.shadowColor = "rgba(140,210,255,0.8)"; sg.shadowBlur = 8;
      sg.fillText(input.value, PAD_L, pill.h / 2 + 1);
      sg.shadowBlur = 0;
      // the send button
      const bx = pill.w - pill.h / 2, by = pill.h / 2;
      sg.fillStyle = "rgba(220,240,255,0.22)";
      sg.beginPath(); sg.arc(bx, by, pill.h / 2 - 8, 0, Math.PI * 2); sg.fill();
      // impact point, and a radial fracture pattern around it
      const ix = fromButton ? bx : charX(), iy = pill.h / 2;
      const rays = 18;
      const angles = Array.from({ length: rays }, (_, k) => (k / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.3).sort((a, b) => a - b);
      const rings = [0, 10, 24, 44, 70, 100, 135, 175, 220, 270, 330, 400, 480, 580];
      const vert = (ri: number, ai: number) => {
        const r = rings[ri] * (ri === 0 ? 1 : 0.8 + Math.random() * 0.4);
        const a = angles[ai % rays];
        return [ix + Math.cos(a) * r, iy + Math.sin(a) * r];
      };
      // share vertices between neighbouring shards so the pieces fit
      const V: number[][][] = rings.map((_, ri) => angles.map((__, ai) => vert(ri, ai)));
      const list: Shard[] = [];
      for (let ri = 0; ri < rings.length - 1; ri++) {
        for (let ai = 0; ai < rays; ai++) {
          const a0 = V[ri][ai], a1 = V[ri][(ai + 1) % rays], b1 = V[ri + 1][(ai + 1) % rays], b0 = V[ri + 1][ai];
          const poly = ri === 0 ? [a0, b1, b0] : [a0, a1, b1, b0];
          const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
          // skip pieces that hold nothing of the field
          const minX = Math.min(...poly.map((p) => p[0])), maxX = Math.max(...poly.map((p) => p[0]));
          const minY = Math.min(...poly.map((p) => p[1])), maxY = Math.max(...poly.map((p) => p[1]));
          if (maxX < 0 || minX > pill.w || maxY < 0 || minY > pill.h) continue;
          const dx = cx - ix, dy = cy - iy, dl = Math.hypot(dx, dy) || 1;
          const sp = 140 + 260 / (1 + dl / 60) + Math.random() * 90;
          list.push({
            pts: poly.flat(), cx, cy, x: pill.x + cx, y: pill.y + cy,
            vx: (dx / dl) * sp, vy: (dy / dl) * sp * 0.6 - 160 - Math.random() * 120,
            rot: 0, vr: (Math.random() - 0.5) * 9, age: -dl / 1400, snap,
          });
        }
      }
      shards = list;
      for (let k = 0; k < 70; k++) {
        const a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 380;
        chips.push({ x: pill.x + ix, y: pill.y + iy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, s: 0.8 + Math.random() * 2.4, age: 0, life: 0.6 + Math.random() * 0.8 });
      }
      clearIce();
      wake();
    };
    api.current.reset = () => { shattered = false; wake(); };

    // ---- ghost ----
    let gt = 0, typed = 0;
    const ghost = { x: 0, y: 0, on: false };

    const update = (dt: number, now: number) => {
      void now;
      // autoplay: click in, type, send, wait, repeat
      ghost.on = false;
      if (ambient && !userTouched.current) {
        ghostOn.current = true;
        gt += dt;
        const clickX = pill.w * 0.18;
        const typedAt = 1.6 + GHOST_TEXT.length * 0.11;
        if (gt < 0.8) { ghost.on = true; ghost.x = pill.x + clickX + (1 - gt / 0.8) * 120; ghost.y = pill.y + pill.h / 2 + (1 - gt / 0.8) * 90; }
        else if (gt < 1.0) { ghost.on = true; if (!focused && !shattered) api.current.focus(clickX); }
        else if (gt < 1.6) { /* let it freeze */ }
        else if (typed < GHOST_TEXT.length) {
          if (gt > 1.6 + typed * 0.11) {
            typed++;
            const v = GHOST_TEXT.slice(0, typed);
            input.value = v;
            valueRef.current = v;
            setValue(v);
            api.current.crack();
          }
        } else if (!shattered && gt > typedAt + 0.5) {
          ghost.on = true; ghost.x = pill.x + pill.w - pill.h / 2; ghost.y = pill.y + pill.h / 2;
          api.current.shatter(true);
          setSent(true);
        } else if (shattered && gt > typedAt + 3.6) {
          setSent(false);
          valueRef.current = "";
          setValue("");
          input.value = "";
          shattered = false;
          gt = 0; typed = 0;
        }
        if (gt > typedAt && gt < typedAt + 0.7) {
          ghost.on = true;
          const e = Math.min(1, (gt - typedAt) / 0.5);
          ghost.x = pill.x + pill.w * 0.5 + (pill.w * 0.5 - pill.h / 2) * e; ghost.y = pill.y + pill.h / 2 + (1 - e) * 30;
        }
      } else ghostOn.current = false;

      // freeze / thaw
      if (reduced) cold = focused ? 1 : 0;
      else {
        cold += ((focused ? 1 : 0) - cold) * Math.min(1, dt * (focused ? 2.2 : 1.1));
        if (!focused && cold < 0.02) cold = 0;
      }
      if (!reduced) growFrost(dt);
      else if (!focused && cold === 0 && seeds) clearIce();
      // cold vapour curling up off the frozen field
      if (!reduced && focused && cold > 0.3 && !shattered && Math.random() < dt * 9 * cold) {
        mist.push({ x: pill.x + pill.h * 0.4 + Math.random() * (pill.w - pill.h * 0.8), y: pill.y + 4, r: 6 + Math.random() * 10, age: 0, life: 2 + Math.random() * 1.6, vx: (Math.random() - 0.5) * 8 });
      }
      if (!focused && cold === 0 && seeds) clearIce();
      growCracks(dt);
    };

    const draw = (dt: number, now: number) => {
      const time = ambient ? now / 1000 : 0;
      // snow, then the field
      gb.setTransform(dpr, 0, 0, dpr, 0, 0);
      gb.clearRect(0, 0, w, h);
      for (const f of flakes) {
        if (ambient) {
          f.y += (f.s / h) * dt;
          if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
        }
        const x = (f.x + Math.sin(time * 0.6 + f.p) * 0.01) * w, y = f.y * h;
        gb.fillStyle = `rgba(230,244,255,${0.25 + 0.35 * (f.r / 2.2)})`;
        gb.beginPath(); gb.arc(x, y, f.r, 0, Math.PI * 2); gb.fill();
      }
      if (!shattered) {
        // an icy glow around the field while it is frozen
        if (cold > 0.02) {
          gb.save();
          gb.shadowColor = `rgba(120,200,255,${0.55 * cold})`;
          gb.shadowBlur = 30 * cold;
          roundRect(gb, pill.x, pill.y, pill.w, pill.h, pill.h / 2);
          gb.fillStyle = "rgba(0,0,0,0.01)";
          gb.fill();
          gb.restore();
        }
        drawBody(gb, pill.x, pill.y, cold);
        drawFrost(gb, pill.x, pill.y, Math.min(1, cold * 1.2));
      }
      // vapour rises, spreads and fades
      const mistDrawn = mist.length > 0;
      for (const m of mist) {
        m.age += dt;
        m.y -= 11 * dt;
        m.x += m.vx * dt;
        m.r += 7 * dt;
        const a = Math.sin(Math.PI * Math.min(1, m.age / m.life)) * 0.07;
        const grd = gb.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        grd.addColorStop(0, `rgba(220,238,255,${a.toFixed(3)})`);
        grd.addColorStop(1, "rgba(220,238,255,0)");
        gb.fillStyle = grd;
        gb.beginPath(); gb.arc(m.x, m.y, m.r, 0, Math.PI * 2); gb.fill();
      }
      mist = mist.filter((m) => m.age < m.life);

      // text glows cold as it freezes; the field trembles as it cracks
      shake = Math.max(0, shake - dt * 4);
      const jx = shake > 0 ? (Math.random() - 0.5) * 3 * shake : 0, jy = shake > 0 ? (Math.random() - 0.5) * 1.5 * shake : 0;
      pillEl.style.transform = shake > 0 ? `translate(${jx.toFixed(2)}px, ${jy.toFixed(2)}px)` : "";
      input.style.textShadow = `0 0 ${(8 * cold).toFixed(1)}px rgba(140,210,255,${(0.8 * cold).toFixed(2)})`;
      pillEl.style.transition = shattered ? "none" : "opacity 0.5s";
      pillEl.style.opacity = shattered ? "0" : "1";

      // effects: shards and chips
      gf.setTransform(dpr, 0, 0, dpr, 0, 0);
      gf.clearRect(0, 0, w, h);
      const fxDrawn = shards.length > 0 || chips.length > 0 || ghost.on || mistDrawn;
      for (const s of shards) {
        s.age += dt;
        if (s.age > 0) {
          s.vy += 1500 * dt;
          s.x += s.vx * dt; s.y += s.vy * dt;
          s.rot += s.vr * dt;
        }
        const alpha = Math.max(0, 1 - Math.max(0, s.age - 0.8) / 0.6);
        if (alpha <= 0 || s.y > h + 80) continue;
        gf.save();
        gf.globalAlpha = alpha;
        gf.translate(s.x, s.y);
        gf.rotate(s.rot);
        const poly = () => {
          gf.beginPath();
          for (let k = 0; k < s.pts.length; k += 2) {
            const qx = s.pts[k] - s.cx, qy = s.pts[k + 1] - s.cy;
            if (k === 0) gf.moveTo(qx, qy); else gf.lineTo(qx, qy);
          }
          gf.closePath();
        };
        // only the part of the shard that held glass is drawn, edges included
        poly();
        gf.clip();
        roundRect(gf, -s.cx, -s.cy, pill.w, pill.h, pill.h / 2);
        gf.clip();
        gf.drawImage(s.snap, -s.cx, -s.cy, pill.w, pill.h);
        poly();
        gf.strokeStyle = "rgba(235,248,255,0.7)";
        gf.lineWidth = 1.2;
        gf.stroke();
        gf.restore();
      }
      shards = shards.filter((s) => s.age < 1.6 && s.y < h + 80);
      for (let k = chips.length - 1; k >= 0; k--) {
        const c = chips[k];
        c.age += dt;
        c.vy += 900 * dt;
        c.x += c.vx * dt; c.y += c.vy * dt;
        const a = 1 - c.age / c.life;
        if (a <= 0) { chips.splice(k, 1); continue; }
        gf.fillStyle = `rgba(235,248,255,${a.toFixed(3)})`;
        gf.save();
        gf.translate(c.x, c.y);
        gf.rotate(c.age * 8 + k);
        gf.fillRect(-c.s / 2, -c.s / 2, c.s, c.s * 0.6);
        gf.restore();
      }
      if (ghost.on) {
        gf.fillStyle = "rgba(255,255,255,0.92)";
        gf.beginPath(); gf.arc(ghost.x, ghost.y, 5, 0, Math.PI * 2); gf.fill();
        gf.strokeStyle = "rgba(255,255,255,0.35)";
        gf.lineWidth = 1.5;
        gf.beginPath(); gf.arc(ghost.x, ghost.y, 11, 0, Math.PI * 2); gf.stroke();
      }
      hadFx = fxDrawn;
    };

    frame = (now: number) => {
      raf = 0;
      if (disposed || !visible || !w || !h) return;
      const dt = Math.max(1 / 240, Math.min(0.033, (now - prev) / 1000));
      prev = now;
      measure();
      update(dt, now);
      draw(dt, now);
      // keep going while anything moves; one more frame after the last effect clears the fx layer
      const busy = ambient || focused || cold > 0 || branches.length > 0 || cracks.length > 0 || shards.length > 0 || chips.length > 0 || mist.length > 0 || shake > 0 || hadFx;
      if (busy) raf = requestAnimationFrame((t) => frame(t));
    };

    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    ro.observe(pillEl);
    fit();
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(stage);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      ro.disconnect();
      api.current = { focus: noop, blur: noop, crack: noop, shatter: noop, shake: noop, reset: noop };
      pillEl.style.transform = "";
      pillEl.style.opacity = "";
      pillEl.style.transition = "";
      input.style.textShadow = "";
      // a half-played demo should not leave its typed address behind
      if (ghostOn.current) {
        ghostOn.current = false;
        valueRef.current = "";
        input.value = "";
        setValue("");
        setSent(false);
      }
    };
  }, [autoplay]);

  // after a real send, show the confirmation, then freeze back together
  useEffect(() => {
    if (!sent || ghostOn.current) return;
    const t = window.setTimeout(() => {
      setSent(false);
      valueRef.current = "";
      setValue("");
      if (inputRef.current) inputRef.current.value = "";
      api.current.reset();
    }, 3000);
    return () => window.clearTimeout(t);
  }, [sent]);

  // the first real touch ends the demo and hands over a clean field
  const takeOver = () => {
    if (userTouched.current) return;
    userTouched.current = true;
    ghostOn.current = false;
    api.current.reset();
    api.current.blur();
    setSent(false);
    setValue("");
    valueRef.current = "";
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = (fromButton: boolean) => {
    const v = valueRef.current.trim();
    if (!v) {
      api.current.shake();
      inputRef.current?.focus();
      return;
    }
    api.current.shatter(fromButton);
    setSent(true);
    onSubmit?.(v);
    inputRef.current?.blur();
  };

  return (
    <div
      ref={stageRef}
      className={cn("relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[24px] px-6", className)}
      style={{
        height,
        background: "radial-gradient(120% 90% at 50% 0%,#1d4a6e 0%,#0f2a44 45%,#081624 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, system-ui, sans-serif",
      }}
      onPointerDown={takeOver}
    >
      <canvas ref={bgRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
      <form
        className="relative z-10 flex w-full max-w-[460px] flex-col items-center gap-5"
        onSubmit={(e) => { e.preventDefault(); submit(false); }}
      >
        <div className="text-center">
          <p className="m-0 text-[clamp(28px,4.4vw,40px)] font-semibold leading-[1.05] tracking-[-0.035em] text-white">{headline}</p>
          <p className="m-0 mt-2 text-[15px] text-[#a9cbe6]">Click in. Type. Send it.</p>
        </div>
        <div ref={pillRef} className="relative flex h-[60px] w-full items-center rounded-full">
          <label htmlFor={inputId} className="sr-only">Email address</label>
          <input
            ref={inputRef}
            id={inputId}
            type="email"
            autoComplete="email"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              const grew = e.target.value.length > valueRef.current.length;
              setValue(e.target.value);
              valueRef.current = e.target.value;
              if (grew) api.current.crack();
            }}
            onFocus={() => {
              takeOver();
              api.current.focus();
            }}
            onPointerDown={(e) => {
              takeOver();
              const r = e.currentTarget.getBoundingClientRect();
              // undo any CSS scale on a parent so the click lands in layout space
              api.current.focus((e.clientX - r.left) / layoutScale(e.currentTarget, r.width));
            }}
            onBlur={() => api.current.blur()}
            className="h-full w-full rounded-full border-0 bg-transparent pl-6 pr-16 text-[18px] font-medium text-[#eaf7ff] caret-[#bfe6ff] outline-none placeholder:text-[#9cc3e0]/70"
            style={{ font: FONT }}
          />
          <motion.button
            type="button"
            whileTap={reducedUi ? undefined : { scale: 0.9 }}
            onClick={() => { takeOver(); submit(true); }}
            aria-label="Send"
            className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-[#dff2ff]/20 text-white outline-none hover:bg-[#dff2ff]/30 focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </motion.button>
        </div>
      </form>
      <canvas ref={fxRef} className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden="true" />
      <div role="status" className="sr-only">{sent ? done : ""}</div>
      <AnimatePresence>
        {sent ? (
          <motion.div
            key="done"
            initial={reducedUi ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedUi ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={reducedUi ? { duration: 0.15 } : { type: "spring", stiffness: 260, damping: 18, delay: 0.25 }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 z-30 mt-6 flex items-center justify-center gap-2.5 text-[18px] font-semibold text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bfe6ff] text-[#0f2a44]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12 5 5 9-10" />
              </svg>
            </span>
            {done}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getSoundsEnabled, useAutoplaySoundAllowed } from "@/lib/ui-sounds";
import { createDustSound, type DustFrame, type DustSound } from "./dust-snap-sound";

/* ------------------------------------------------------------------ noise: smooth value noise and its octaves */
const P = new Uint8Array(512);
{
  let s = 1337;
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
}
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const h = (a: number, b: number) => P[(P[(a & 255)] + (b & 255)) & 511] / 255;
  const u = fade(xf), v = fade(yf);
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v; // 0..1
}
const fbm = (x: number, y: number) => noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15;

/* ------------------------------------------------------------------ timing and feel */
const SPREAD = 1.9; // seconds for the crumbling to cross the word
const ASHEN = 0.5; // how long a patch goes dark and grainy before it gives way
const LIFE = 3.4; // how long a speck lasts on the wind before it has thinned to nothing
const BACK = 1.2; // how long a speck takes to fly home
const PER_CELL = 5; // specks per cell of the word: enough that the cloud is dense, as it is on film

type Rgb = [number, number, number];
interface Look { bg: string; ink: string; ash: Rgb[]; fleck: Rgb[]; film: Rgb[] }
/** The dust is dry and earthy: dark browns, with a few lighter flecks catching the light. */
const LOOKS: Record<"dark" | "light", Look> = {
  light: {
    bg: "#f2f0ec", ink: "#1d1d1f",
    ash: [[42, 35, 30], [56, 46, 38], [32, 28, 25], [70, 57, 46], [26, 23, 21]],
    fleck: [[120, 100, 80], [142, 120, 96]],
    film: [[66, 55, 46], [52, 44, 38], [84, 70, 58]],
  },
  dark: {
    bg: "#0b0b0c", ink: "#f5f5f7",
    ash: [[126, 110, 94], [104, 90, 78], [146, 128, 110], [88, 76, 66], [116, 102, 88]],
    fleck: [[196, 178, 154], [176, 158, 136]],
    film: [[140, 124, 106], [118, 104, 90], [160, 142, 122]],
  },
};

/* ------------------------------------------------------------------ sound plumbing: when the picture may make noise */
function useDustAudio(enableSound: boolean, volume: number, inViewRef: RefObject<boolean>, engaged: RefObject<boolean>) {
  const autoOk = useAutoplaySoundAllowed();
  const cfg = useRef({ enableSound, volume, autoOk });
  const eng = useRef<DustSound | null>(null);
  const tried = useRef(false);
  useEffect(() => {
    cfg.current = { enableSound, volume, autoOk };
    eng.current?.setVolume(volume);
  }, [enableSound, volume, autoOk]);
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) eng.current?.hush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      eng.current?.close();
      eng.current = null;
      tried.current = false;
    };
  }, []);
  return useMemo(() => {
    /** Whether the word may make sound right now: asked for, switched on, on screen, and used or allowed to demo. */
    const on = () => {
      const c = cfg.current;
      if (!c.enableSound || !getSoundsEnabled() || document.hidden || !inViewRef.current) return false;
      return engaged.current || c.autoOk;
    };
    const wake = (gesture: boolean) => {
      if (eng.current) {
        eng.current.wake();
        return;
      }
      if (tried.current || !cfg.current.enableSound) return;
      if (!gesture && !navigator.userActivation?.hasBeenActive) return;
      tried.current = true;
      eng.current = createDustSound(cfg.current.volume);
      eng.current?.wake();
    };
    return {
      wake,
      /** Once per animation frame, with what the word is doing. */
      frame(f: DustFrame) {
        const live = on();
        if (live && !eng.current) wake(false);
        const e = eng.current;
        if (e) e.frame(f, live && e.awake());
      },
      snap(again: boolean) {
        if (!on()) return;
        wake(false);
        eng.current?.snap(again);
      },
      /** Off screen or unmounted: let go of the continuous layers. */
      idle() {
        eng.current?.hush();
      },
    };
  }, [inViewRef, engaged]);
}

/**
 * DustSnap: a word that turns to dust when you snap, the way it happens on film. A moment after the snap the word
 * shivers; then, starting from one end, the surface goes dark and grainy in creeping patches and gives way. It does
 * not vanish as smoke: it becomes a dense cloud of dry, earthy specks that holds the word's shape for a beat, then a
 * wind from the left picks it up and carries it off to the right in wisps, thinning as it goes, a few light flecks catching
 * the light. Snap again and the dust is drawn back in against the wind, last gone first home, landing dark before its colour returns.
 *
 * `text` is the word. `theme` is "light" (dark dust on a pale ground, as in the film) or "dark". `enableSound` plays a
 * dry finger snap, then crackle, grains and a breath of air that follow the picture frame by frame (it follows the
 * site-wide sound switch, and browsers only allow it after a click). `volume` is 0 to 1. `framed` (default true) draws
 * the card with its rounded corners and shadow; pass false to fill whatever surface you put it on. `onChange(gone)` fires when
 * it finishes either way. `autoplay` loops it until the first real interaction. Reduced motion fades instead.
 */
export function DustSnap({ autoplay = false, text = "NexusUI", theme = "light", enableSound = true, volume = 0.7, framed = true, onChange }: { autoplay?: boolean; text?: string; theme?: "dark" | "light"; enableSound?: boolean; volume?: number; framed?: boolean; onChange?: (gone: boolean) => void }) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"whole" | "going" | "gone" | "coming">("whole");
  const cmd = useRef<null | "snap" | "back">(null);
  const touched = useRef(false);
  const inViewRef = useRef(true);
  const audio = useDustAudio(enableSound, volume, inViewRef, touched);
  const look = LOOKS[theme];

  useEffect(() => {
    const cv = canvas.current, box = wrap.current;
    if (!cv || !box) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    let W = 0, H = 0, dpr = 1, fs = 0;
    // the word as drawn, the word as it stands (cells are cleared as they give way), and the dust layer
    const src = document.createElement("canvas"), stand = document.createElement("canvas"), dust = document.createElement("canvas");
    const sx = src.getContext("2d")!, tx = stand.getContext("2d")!, dx = dust.getContext("2d")!;
    let img: ImageData, buf: Uint32Array;
    // the surface, pixel by pixel: each inked pixel has its own moment to go dark and grainy and its own moment to give way
    let simg: ImageData, sbuf: Uint32Array;
    let pIdx: Uint32Array, pInk: Uint32Array, pAsh: Uint32Array, pDark: Float32Array, pGone: Float32Array, pHome: Float32Array;
    let backAt = 0;
    // what the sound listens to: how much of the word is dark and grainy, and how many specks left the word or came home
    let ashenFrac = 0, leftN = 1, landedAcc = 0, panX = 0;
    // cells of the word
    let C = 0, step = 1.6;
    let cx: Float32Array, cy: Float32Array, ct: Float32Array;
    // specks
    let n = 0;
    let cid: Uint32Array, x: Float32Array, y: Float32Array, vx: Float32Array, vy: Float32Array, t0: Float32Array;
    let size: Float32Array, weight: Float32Array, life: Float32Array, bright: Float32Array, ang: Float32Array, spin: Float32Array;
    let fx: Float32Array, fy: Float32Array, rt: Float32Array, col: Uint32Array, state: Uint8Array;
    let mode: "whole" | "going" | "gone" | "coming" = "whole";
    let clock = 0, last = performance.now(), maxT = 0, shudder = 0, midX = 0, midY = 0;

    const pack = (r: number, g: number, b: number, a: number) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;

    const layout = () => {
      // layout width, not getBoundingClientRect: gallery tiles scale previews with a transform, and a scaled
      // measurement would draw the canvas narrower than the box it is stretched across
      W = Math.max(280, Math.round(box.offsetWidth)); H = Math.round(Math.min(320, Math.max(200, W * 0.36)));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const c of [cv, src, stand, dust]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      cv.style.height = `${H}px`;
      fs = Math.min(170, W / (text.length * 0.62));
      sx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sx.clearRect(0, 0, W, H);
      sx.fillStyle = look.ink;
      sx.textAlign = "center";
      sx.textBaseline = "middle";
      const setFont = () => {
        sx.font = `700 ${fs}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;
        (sx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${-fs * 0.012}px`;
      };
      setFont();
      // fit the word to the card with room around it and for the dust to drift, whatever the width
      const tw = sx.measureText(text).width;
      if (tw > W * 0.76) { fs *= (W * 0.76) / tw; setFont(); }
      // a touch below the middle of the canvas, so the word sits in the middle of the whole card (the caption row is under it)
      sx.fillText(text, W / 2, H * 0.57 - fs * 0.06);
      tx.setTransform(1, 0, 0, 1, 0, 0);
      tx.clearRect(0, 0, stand.width, stand.height);
      tx.drawImage(src, 0, 0);
      img = dx.createImageData(dust.width, dust.height);
      buf = new Uint32Array(img.data.buffer);
      simg = tx.createImageData(stand.width, stand.height);
      sbuf = new Uint32Array(simg.data.buffer);
      sample();
      mode = "whole"; setPhase("whole");
    };

    const sample = () => {
      step = Math.max(1.4, Math.min(2.2, fs / 68));
      const data = sx.getImageData(0, 0, src.width, src.height).data;
      const cells: [number, number][] = [];
      const cw = step * dpr;
      for (let yy = 0; yy < H; yy += step) for (let xx = 0; xx < W; xx += step) {
        // keep the cell if any of its pixels has ink, so no outline is left behind
        let hit = false;
        const px0 = Math.floor(xx * dpr), py0 = Math.floor(yy * dpr);
        for (let oy = 0; oy < cw && !hit; oy++) for (let ox = 0; ox < cw && !hit; ox++) {
          const px = px0 + ox, py = py0 + oy;
          if (px < src.width && py < src.height && data[(py * src.width + px) * 4 + 3] > 6) hit = true;
        }
        if (hit) cells.push([xx + step / 2, yy + step / 2]);
      }
      C = cells.length;
      cx = new Float32Array(C); cy = new Float32Array(C); ct = new Float32Array(C);
      let minX = 1e9, maxX = -1e9, sumY = 0;
      for (const [a, b] of cells) { minX = Math.min(minX, a); maxX = Math.max(maxX, a); sumY += b; }
      midX = (minX + maxX) / 2; midY = sumY / Math.max(1, C);
      let s = 99;
      const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      maxT = 0;
      for (let i = 0; i < C; i++) {
        const [a, b] = cells[i];
        cx[i] = a; cy[i] = b;
        // it starts at the far end and creeps back across the word, in ragged patches rather than a straight line
        const across = 1 - (a - minX) / Math.max(1, maxX - minX);
        const patch = fbm(a / 34, b / 34);
        ct[i] = Math.max(0, (across * 0.66 + patch * 0.55 - 0.14) * SPREAD + rnd() * 0.06);
        maxT = Math.max(maxT, ct[i]);
      }
      // every inked pixel follows the same patchy front as the cells, with its own grain so the edge is crumbly, not stepped
      const PW = src.width;
      const ink: number[] = [];
      for (let k = 0; k < data.length / 4; k++) if (data[k * 4 + 3] > 6) ink.push(k);
      const m = ink.length;
      pIdx = new Uint32Array(ink); pInk = new Uint32Array(m); pAsh = new Uint32Array(m);
      pDark = new Float32Array(m); pGone = new Float32Array(m); pHome = new Float32Array(m);
      for (let j = 0; j < m; j++) {
        const k = ink[j], al = data[k * 4 + 3];
        const a = (k % PW) / dpr, b = Math.floor(k / PW) / dpr;
        pInk[j] = pack(data[k * 4], data[k * 4 + 1], data[k * 4 + 2], al);
        const across = 1 - (a - minX) / Math.max(1, maxX - minX);
        const tt = Math.max(0, (across * 0.66 + fbm(a / 34, b / 34) * 0.55 - 0.14) * SPREAD + rnd() * 0.1);
        pGone[j] = tt;
        // it darkens in grains, not as a wash: some grains turn early, most just before the patch goes
        const g = rnd();
        pDark[j] = tt - ASHEN * (0.15 + g * g * 0.85) * (0.6 + noise(a / 9, b / 9) * 0.8);
        const grain = noise(a / 2.2, b / 2.2) * 0.6 + rnd() * 0.4;
        const f = look.film[Math.min(look.film.length - 1, Math.floor(grain * look.film.length))];
        const sh = 0.82 + rnd() * 0.3;
        pAsh[j] = pack(Math.min(255, f[0] * sh) | 0, Math.min(255, f[1] * sh) | 0, Math.min(255, f[2] * sh) | 0, al);
        // on the way back it lands when its dust does (last gone, first home), dark at first, then its colour returns
        pHome[j] = (maxT - tt) * 0.5 + BACK * 0.92;
      }
      n = C * PER_CELL;
      cid = new Uint32Array(n); x = new Float32Array(n); y = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n); t0 = new Float32Array(n);
      size = new Float32Array(n); weight = new Float32Array(n); life = new Float32Array(n); bright = new Float32Array(n); ang = new Float32Array(n); spin = new Float32Array(n);
      fx = new Float32Array(n); fy = new Float32Array(n); rt = new Float32Array(n); col = new Uint32Array(n); state = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const c = i % C;
        cid[i] = c;
        // the specks of a cell give way a beat apart, so a patch crumbles rather than lifting off in one piece
        t0[i] = ct[c] + rnd() * 0.18;
        const shard = rnd() < 0.05;
        size[i] = shard ? 2 + rnd() * 1.6 : 0.7 + rnd() * rnd() * 1.3;
        weight[i] = shard ? 1.5 + rnd() * 0.6 : 0.55 + rnd() * 0.9; // heavier specks fall sooner
        life[i] = LIFE * (0.45 + rnd() * 0.75);
        bright[i] = 0.78 + rnd() * 0.22;
        ang[i] = rnd() * Math.PI;
        spin[i] = shard ? (rnd() - 0.5) * 10 : 0;
        const fleck = rnd() < 0.09;
        const [r, g, b] = fleck ? look.fleck[Math.floor(rnd() * look.fleck.length)] : look.ash[Math.floor(rnd() * look.ash.length)];
        col[i] = pack(r, g, b, 255);
      }
    };

    // the word as it stands at this moment, written pixel by pixel
    const paintSurface = (going: boolean) => {
      sbuf.fill(0);
      const t = clock;
      let pending = 0, ash = 0;
      for (let j = 0; j < pIdx.length; j++) {
        let v = 0;
        if (going) {
          if (t < pDark[j]) v = pInk[j];
          else if (t < pGone[j]) { v = pAsh[j]; ash++; }
        } else {
          // coming back: what never left stays; what left returns when its dust arrives
          if (pGone[j] > backAt) v = pInk[j];
          else if (t >= pHome[j] + 0.45 + (j % 7) * 0.03) v = pInk[j];
          else if (t >= pHome[j]) { v = pAsh[j]; pending++; }
          else pending++;
        }
        if (v) sbuf[pIdx[j]] = v;
      }
      tx.putImageData(simg, 0, 0);
      ashenFrac = going ? ash / Math.max(1, pIdx.length) : 0;
      return pending;
    };
    const resetSurface = () => { tx.setTransform(1, 0, 0, 1, 0, 0); tx.clearRect(0, 0, stand.width, stand.height); tx.drawImage(src, 0, 0); };

    const snap = () => {
      if (mode !== "whole") return;
      audio.snap(false);
      mode = "going"; setPhase("going"); clock = 0; shudder = 0.28;
      state.fill(0);
    };
    const back = () => {
      if (mode !== "gone" && mode !== "going") return;
      audio.snap(true);
      backAt = mode === "gone" ? 1e9 : clock;
      mode = "coming"; setPhase("coming"); clock = 0;
      // last gone, first home
      for (let i = 0; i < n; i++) {
        fx[i] = x[i]; fy[i] = y[i];
        rt[i] = state[i] === 0 ? -1 : Math.max(0, (maxT - t0[i]) * 0.5 + (i % 11) * 0.008);
      }
      leftN = 1; landedAcc = 0;
      for (let i = 0; i < n; i++) if (rt[i] >= 0) leftN++;
    };

    const move = (i: number, age: number, dt: number, t: number) => {
      // a steady wind from the left picks the dust up and carries it off to the right. It catches the fine dust first and
      // the heavier grains a beat later, gusts in slow waves, and curls it into wisps; a little lift keeps it airborne.
      const sc = 1 / 52;
      const nx = x[i] * sc - t * 0.9, ny = y[i] * sc + t * 0.15;
      const n0 = noise(nx, ny);
      const gx = (noise(nx + 0.05, ny) - n0) / 0.05, gy = (noise(nx, ny + 0.05) - n0) / 0.05;
      const gust = 0.75 + noise(t * 0.7, y[i] / 90) * 0.6;
      const pick = Math.min(1, age * (1.6 / weight[i]));
      const wind = (70 + 70 / weight[i]) * gust * pick;
      vx[i] += (wind + gy * 40 - vx[i]) * 1.6 * dt;
      vy[i] += (-gx * 44 - 13 / weight[i] - vy[i]) * 1.6 * dt;
      x[i] += vx[i] * dt; y[i] += vy[i] * dt;
      ang[i] += spin[i] * dt;
      if (x[i] > W + 12) life[i] = Math.min(life[i], age); // blown off the card
    };

    const plot = (i: number, a: number, s: number) => {
      if (a <= 0.01) return;
      const c = col[i];
      const A = Math.round(Math.min(1, a) * 255);
      const v = ((c & 0x00ffffff) | (A << 24)) >>> 0;
      const px = Math.round(x[i] * dpr), py = Math.round(y[i] * dpr);
      const sp = Math.max(1, Math.round(s * dpr * 0.85));
      const w = dust.width, h = dust.height;
      for (let oy = 0; oy < sp; oy++) {
        const yy = py + oy;
        if (yy < 0 || yy >= h) continue;
        const row = yy * w;
        for (let ox = 0; ox < sp; ox++) { const xx = px + ox; if (xx >= 0 && xx < w) buf[row + xx] = v; }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      clock += dt;
      if (cmd.current === "snap") { cmd.current = null; snap(); }
      if (cmd.current === "back") { cmd.current = null; back(); }

      buf.fill(0);
      const shards: number[] = [];
      let emitted = 0, landed = 0, seen = 0, outN = 0, xs = 0, xn = 0;
      if (mode === "going" || mode === "gone") {
        // the surface darkens and gives way, grain by grain
        if (mode === "going") paintSurface(true);
        let live = 0;
        for (let i = 0; i < n; i++) {
          if (state[i] === 2) continue;
          if (state[i] === 0) {
            if (clock < t0[i]) { live++; continue; }
            state[i] = 1;
            emitted++; xs += cx[cid[i]]; xn++;
            const c = cid[i];
            x[i] = cx[c] + (Math.random() - 0.5) * step * 1.4;
            y[i] = cy[c] + (Math.random() - 0.5) * step * 1.4;
            // a small outward swell from the middle of the word, and a nudge in the direction it was going
            const ox = x[i] - midX, oy = y[i] - midY, ol = Math.hypot(ox, oy) || 1;
            const push = 4 + Math.random() * 12;
            vx[i] = (ox / ol) * push * 0.4 + 10 + (Math.random() - 0.5) * 8;
            vy[i] = (oy / ol) * push * 0.5 - 3 - Math.random() * 5;
          }
          const age = clock - t0[i];
          if (age > life[i]) { state[i] = 2; continue; }
          move(i, age, dt, clock);
          live++;
          // dense at first, thinning slowly to a haze, and the settled dust fades last
          // thick as it leaves, thinning to nothing as it streams away
          const a = bright[i] * Math.pow(Math.max(0, 1 - age / life[i]), 0.9);
          seen += a;
          if (size[i] > 1.9) shards.push(i); else plot(i, a, size[i]);
        }
        if (mode === "going" && !live) { mode = "gone"; setPhase("gone"); onChange?.(true); ashenFrac = 0; }
      } else if (mode === "coming") {
        let out = paintSurface(false);
        for (let i = 0; i < n; i++) {
          if (rt[i] < 0) continue;
          const u = (clock - rt[i]) / BACK;
          if (u < 0) { out++; continue; }
          const c = cid[i];
          if (u >= 1) { rt[i] = -1; state[i] = 0; landed++; landedAcc++; xs += x[i]; xn++; continue; }
          out++; outN++;
          // home along a rising curve, swinging out and settling in, fading in as it comes
          const e = 1 - Math.pow(1 - u, 3);
          const hx = cx[c], hy = cy[c];
          const sw = Math.sin(u * Math.PI) * (14 + (i % 13) * 1.6) * (i % 2 ? 1 : -1);
          const ddx = hx - fx[i], ddy = hy - fy[i];
          const len = Math.hypot(ddx, ddy) || 1;
          x[i] = fx[i] + ddx * e + (-ddy / len) * sw * (1 - u);
          y[i] = fy[i] + ddy * e + (ddx / len) * sw * (1 - u);
          ang[i] += spin[i] * dt * (1 - u);
          const a = Math.min(1, u * 2.2) * bright[i];
          if (size[i] > 1.9) shards.push(i); else plot(i, a, size[i]);
        }
        if (!out) {
          mode = "whole"; setPhase("whole"); onChange?.(false);
          resetSurface();
        }
      }

      // tell the sound what just happened, so it stays in step with the picture
      if (xn) panX += ((xs / xn / Math.max(1, W)) * 2 - 1 - panX) * 0.6;
      const heard: DustFrame = {
        phase: mode, dt, emitted, landed,
        ashen: mode === "going" ? ashenFrac : 0,
        airborne: n && mode === "going" ? seen / (n * 0.42) : 0,
        returning: mode === "coming" ? outN / leftN : 0,
        home: mode === "coming" ? landedAcc / leftN : 0,
        x: panX,
      };
      audio.frame(heard);

      // compose: ground, the word as it stands (shivering at the snap), the dust, then the tumbling shards
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = look.bg;
      ctx.fillRect(0, 0, cv.width, cv.height);
      let jx = 0, jy = 0;
      if (shudder > 0) { shudder -= dt; const k = Math.max(0, shudder / 0.28); jx = Math.sin(clock * 97) * 0.7 * dpr * k; jy = Math.cos(clock * 71) * 0.4 * dpr * k; }
      ctx.drawImage(stand, jx, jy);
      dx.putImageData(img, 0, 0);
      ctx.drawImage(dust, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const i of shards) {
        const c = col[i];
        const r = c & 255, g = (c >> 8) & 255, b = (c >> 16) & 255;
        const age = mode === "coming" ? 0 : clock - t0[i];
        const a = mode === "coming" ? bright[i] : bright[i] * Math.pow(Math.max(0, 1 - age / life[i]), 0.9);
        // a shard tumbling: a little irregular sliver that narrows and widens as it turns
        const z = size[i], sq = 0.2 + Math.abs(Math.cos(ang[i])) * 0.8, k = (i % 5) / 5;
        ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
        ctx.save();
        ctx.translate(x[i], y[i]);
        ctx.rotate(ang[i] * 0.35 + i);
        ctx.scale(sq, 1);
        ctx.beginPath();
        ctx.moveTo(-z * 0.5, -z * (0.2 + k * 0.3));
        ctx.lineTo(z * (0.4 + k * 0.2), -z * 0.35);
        ctx.lineTo(z * 0.2, z * 0.45);
        ctx.lineTo(-z * 0.35, z * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };

    layout();
    const still = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = look.bg; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(stand, 0, 0); };
    if (reduce) still(); else raf = requestAnimationFrame(frame);
    let rw = box.offsetWidth;
    const ro = new ResizeObserver(() => { const w = box.offsetWidth; if (Math.abs(w - rw) > 4 && mode === "whole") { rw = w; layout(); if (reduce) still(); } });
    ro.observe(box);
    const vis = new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); inViewRef.current = en.isIntersecting; if (en.isIntersecting && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } else audio.idle(); });
    vis.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect(); audio.idle(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, theme, reduce, audio]);

  // the demo: snap, let the dust settle, snap again
  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(1400);
      while (live && !touched.current) {
        cmd.current = "snap";
        await sleep(7000); if (!live || touched.current) break;
        cmd.current = "back";
        await sleep(4800);
      }
    })();
    return () => { live = false; };
  }, [autoplay, reduce]);

  const gone = phase === "gone" || phase === "going";
  const press = () => {
    touched.current = true;
    audio.wake(true);
    if (reduce) { audio.snap(gone); setPhase(gone ? "whole" : "gone"); onChange?.(!gone); return; }
    cmd.current = gone ? "back" : "snap";
  };
  const dark = theme === "dark";

  return (
    <div className={`w-full select-none overflow-hidden ${framed ? "max-w-[760px] rounded-[28px] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_30px_60px_-30px_rgba(0,0,0,.4)]" : ""}`} style={{ background: look.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}>
      <div ref={wrap} className="relative w-full">
        <canvas ref={canvas} onClick={press} className="block w-full cursor-pointer" role="img" aria-label={gone ? `${text}, turned to dust` : text} style={reduce ? { opacity: phase === "gone" ? 0 : 1, transition: "opacity .6s" } : undefined} />
      </div>
      <div className="flex items-center justify-between gap-3 px-6 pb-6">
        <p className={`m-0 text-[12.5px] ${dark ? "text-white/45" : "text-[#86868b]"}`} aria-live="polite">
          {phase === "going" ? "Turning to dust" : phase === "gone" ? "Gone. Snap again to bring it back." : phase === "coming" ? "Coming back" : "Snap to turn it to dust."}
        </p>
        <motion.button
          type="button"
          onClick={press}
          whileTap={{ scale: 0.95 }}
          disabled={phase === "coming"}
          className={`inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium outline-none transition-colors focus-visible:ring-4 disabled:opacity-50 ${dark ? "bg-white text-[#1d1d1f] hover:bg-white/90 focus-visible:ring-white/30" : "bg-[#1d1d1f] text-white hover:bg-black focus-visible:ring-[#1d1d1f]/30"}`}
        >
          {gone ? "Snap again" : "Snap"}
        </motion.button>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { motion } from "framer-motion";
import { useProSound, type ProSoundName } from "@/lib/ui-sounds-pro";

/* ------------------------------------------------------------------ */
/* Scene constants (logical units; the canvas scales them to its size) */
/* ------------------------------------------------------------------ */
const SW = 440, SH = 250, HZ = 172; // scene width, height, wall/floor line
const PX = 250; // pendant pivot x (ceiling)
const LY = 90; // light source distance below the pivot (bulb centre)
const KMIN = 2700, KMAX = 6500;

type Scene = { id: string; name: string; b: number; k: number };
const SCENES: Scene[] = [
  { id: "relax", name: "Relax", b: 45, k: 2700 },
  { id: "read", name: "Read", b: 80, k: 4000 },
  { id: "focus", name: "Focus", b: 100, k: 5600 },
  { id: "night", name: "Night", b: 12, k: 2700 },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const bump = (t: number, c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));
const rubber = (x: number, d: number) => (1 - 1 / ((x * 0.55) / d + 1)) * d;

/** Black-body colour (Tanner Helland fit), 0..255. */
function kelvinRGB(k: number): [number, number, number] {
  const t = k / 100;
  let r: number, g: number, b: number;
  if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307; }
  else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); b = 255; }
  return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
}
const warmWord = (k: number) => (k < 3300 ? "Warm" : k < 4700 ? "Neutral" : k < 5900 ? "Cool" : "Daylight");
const roundK = (k: number) => Math.round(k / 50) * 50;

/* The light switching on: the filament glows first, then the room fills (~0.4 s) with a couple of flickers. */
function warmCurve(t: number) {
  if (t < 0.16) return 0;
  const u = clamp((t - 0.16) / 0.42);
  const e = 1 - Math.pow(1 - u, 3);
  return e * (1 - 0.42 * bump(t, 0.27, 0.022) - 0.24 * bump(t, 0.38, 0.018) - 0.1 * bump(t, 0.47, 0.016));
}

/* ------------------------------------------------------------------ */
/* Drawing helpers                                                     */
/* ------------------------------------------------------------------ */
type C2 = CanvasRenderingContext2D;
function mk(w: number, h: number) { const c = document.createElement("canvas"); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; }
function rrect(c: C2, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
/** Soft elliptical blob from a radial gradient. `inner` (0..1) is how far the full alpha holds before falling off. */
function blob(c: C2, x: number, y: number, rx: number, ry: number, rgb: string, a: number, inner = 0) {
  if (a <= 0.001) return;
  c.save(); c.translate(x, y); c.scale(rx, ry);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(inner, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, Math.PI * 2); c.fill(); c.restore();
}
function blurred(src: HTMLCanvasElement, px: number, color = "#000") {
  const d = mk(src.width, src.height); const c = d.getContext("2d")!;
  c.shadowColor = color; c.shadowBlur = px; c.shadowOffsetX = src.width + 4; c.drawImage(src, -src.width - 4, 0);
  return d;
}
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* Silhouettes (shared by the albedo pass and the shadow masks) */
// leaves: x, y, angle (rad, 0 = up), length, half width
const LEAVES: [number, number, number, number, number][] = [
  [165, 152, -1.25, 25, 8.5], [168, 148, 1.15, 25, 8.5], [163, 136, -0.85, 30, 10.5], [168, 130, 0.95, 29, 10],
  [161, 124, -1.45, 24, 8], [170, 118, 1.35, 22, 8], [162, 114, -0.5, 29, 10.5], [167, 108, 0.62, 30, 10.5],
  [163, 98, -0.18, 26, 9], [166, 94, 0.38, 23, 8],
];
function leafPath(c: C2, x: number, y: number, a: number, l: number, w: number) {
  c.save(); c.translate(x, y); c.rotate(a);
  c.moveTo(0, 0); c.bezierCurveTo(w * 1.05, -l * 0.2, w * 0.95, -l * 0.78, 0, -l); c.bezierCurveTo(-w * 0.95, -l * 0.78, -w * 1.05, -l * 0.2, 0, 0); c.closePath();
  c.restore();
}
function potPath(c: C2) { c.moveTo(150, 160); c.lineTo(182, 160); c.lineTo(178.5, 195); c.quadraticCurveTo(166, 198.5, 153.5, 195); c.closePath(); }
function plantShape(c: C2) { c.beginPath(); potPath(c); for (const L of LEAVES) leafPath(c, ...L); c.rect(164.5, 96, 2, 64); }
function sofaShape(c: C2) {
  c.beginPath(); rrect(c, 296, 118, 128, 46, 14); rrect(c, 286, 140, 20, 52, 10); rrect(c, 414, 140, 20, 52, 10); rrect(c, 294, 150, 132, 42, 8);
  c.rect(301, 188, 6, 10); c.rect(413, 188, 6, 10);
}
function tableShape(c: C2) {
  c.beginPath(); c.ellipse(250, 151.5, 28, 7, 0, 0, Math.PI * 2); c.rect(247.5, 152, 5, 41); c.ellipse(250, 194, 13, 3, 0, 0, Math.PI * 2);
  c.moveTo(245, 147); c.bezierCurveTo(243, 140, 244.5, 136, 247, 134); c.lineTo(253, 134); c.bezierCurveTo(255.5, 136, 257, 140, 255, 147); c.closePath();
}
function artShape(c: C2) { c.beginPath(); c.rect(330, 48, 62, 46); }

/* Albedo: the room as it would look under flat white light. Painted once per size. */
function paintAlbedo(c: C2) {
  // wall
  let g = c.createLinearGradient(0, 0, 0, HZ);
  g.addColorStop(0, "#d6d0c8"); g.addColorStop(1, "#e2ddd5");
  c.fillStyle = g; c.fillRect(0, 0, SW, HZ);
  // plaster grain
  const r = rng(7);
  for (let i = 0; i < 1400; i++) { c.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.08)" : "rgba(90,80,70,0.06)"; c.fillRect(r() * SW, r() * HZ, 0.8, 0.8); }
  // corner occlusion near ceiling and floor line
  g = c.createLinearGradient(0, 0, 0, 26); g.addColorStop(0, "rgba(60,50,40,0.22)"); g.addColorStop(1, "rgba(60,50,40,0)");
  c.fillStyle = g; c.fillRect(0, 0, SW, 26);

  // window
  c.fillStyle = "#efebe5"; c.fillRect(34, 30, 90, 110);
  g = c.createLinearGradient(38, 34, 46, 44); g.addColorStop(0, "#b9b2a8"); g.addColorStop(1, "#d8d2ca");
  c.fillStyle = g; c.fillRect(38, 34, 82, 102);
  c.fillStyle = "#000"; c.fillRect(41, 37, 37, 44); c.fillRect(81, 37, 36, 44); c.fillRect(41, 84, 37, 50); c.fillRect(81, 84, 36, 50);
  c.fillStyle = "rgba(255,255,255,0.5)"; c.fillRect(34, 30, 90, 1);
  // sill
  c.fillStyle = "#f4f1ec"; c.fillRect(29, 138, 100, 5);
  c.fillStyle = "rgba(255,255,255,0.7)"; c.fillRect(29, 138, 100, 1);
  blob(c, 79, 146, 54, 4, "60,50,40", 0.28);

  // framed print
  c.fillStyle = "#3a3a3c"; c.fillRect(330, 48, 62, 46);
  c.fillStyle = "#f5f3ee"; c.fillRect(332, 50, 58, 42);
  c.fillStyle = "#e9e4da"; c.fillRect(339, 56, 44, 30);
  c.fillStyle = "#c9775a"; c.beginPath(); c.arc(354, 74, 9, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#8ea08a"; c.beginPath(); c.moveTo(339, 86); c.quadraticCurveTo(360, 64, 383, 80); c.lineTo(383, 86); c.closePath(); c.fill();

  // baseboard
  c.fillStyle = "#ebe7e1"; c.fillRect(0, HZ - 9, SW, 9);
  c.fillStyle = "rgba(255,255,255,0.6)"; c.fillRect(0, HZ - 9, SW, 1);
  c.fillStyle = "rgba(70,55,40,0.28)"; c.fillRect(0, HZ - 1, SW, 1);

  // floor: oak planks converging to a vanishing point
  const vx = 226, vy = 118, f = (SH - vy) / (HZ - vy);
  for (let i = -14, x0 = -300; x0 < 760; i++, x0 += 30) {
    const xa = x0, xb = x0 + 30;
    const t = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const s = Math.abs(t) * 14 - 7;
    c.fillStyle = `rgb(${182 + s},${143 + s * 0.8},${104 + s * 0.6})`;
    c.beginPath(); c.moveTo(xa, HZ); c.lineTo(xb, HZ); c.lineTo(vx + (xb - vx) * f, SH); c.lineTo(vx + (xa - vx) * f, SH); c.closePath(); c.fill();
    c.strokeStyle = "rgba(80,52,28,0.22)"; c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(xa, HZ); c.lineTo(vx + (xa - vx) * f, SH); c.stroke();
  }
  g = c.createLinearGradient(0, HZ, 0, SH); g.addColorStop(0, "rgba(60,40,20,0.18)"); g.addColorStop(0.3, "rgba(60,40,20,0)"); g.addColorStop(1, "rgba(255,240,220,0.06)");
  c.fillStyle = g; c.fillRect(0, HZ, SW, SH - HZ);

  // rug
  c.save(); c.translate(318, 216); c.scale(1, 0.13);
  g = c.createRadialGradient(0, 0, 0, 0, 0, 150); g.addColorStop(0, "#cfc6b7"); g.addColorStop(0.86, "#c4baa9"); g.addColorStop(0.9, "#d8d0c2"); g.addColorStop(0.93, "#c4baa9"); g.addColorStop(1, "#b0a593");
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, 150, 0, Math.PI * 2); c.fill();
  c.restore();

  // contact occlusion under objects
  blob(c, 360, 197, 80, 6, "40,30,20", 0.5, 0.3);
  blob(c, 250, 195, 18, 3.5, "40,30,20", 0.5, 0.2);
  blob(c, 166, 196, 20, 3.5, "40,30,20", 0.55, 0.2);

  // plant: pot (matte ceramic cylinder)
  g = c.createLinearGradient(150, 0, 182, 0);
  g.addColorStop(0, "#b9b3aa"); g.addColorStop(0.32, "#f3f0eb"); g.addColorStop(0.55, "#e4e0d9"); g.addColorStop(1, "#a9a39a");
  c.fillStyle = g; c.beginPath(); potPath(c); c.fill();
  c.fillStyle = "#4a3b2e"; c.beginPath(); c.ellipse(166, 160.5, 15.2, 2.6, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(255,255,255,0.75)"; c.lineWidth = 0.8; c.beginPath(); c.ellipse(166, 160, 16, 2.8, 0, Math.PI, Math.PI * 2); c.stroke();
  // stems
  c.strokeStyle = "#45603a"; c.lineWidth = 1.6; c.lineCap = "round";
  c.beginPath(); c.moveTo(166, 160); c.bezierCurveTo(164, 140, 167, 120, 164.5, 96); c.stroke();
  // leaves
  for (const [x, y, a, l, w] of LEAVES) {
    c.save(); c.translate(x, y); c.rotate(a);
    const lg = c.createLinearGradient(-w, 0, w, 0);
    lg.addColorStop(0, "#2c5233"); lg.addColorStop(0.5, "#3e6f41"); lg.addColorStop(1, "#5d9157");
    c.fillStyle = lg; c.beginPath(); leafPath(c, 0, 0, 0, l, w); c.fill();
    c.strokeStyle = "rgba(200,230,170,0.35)"; c.lineWidth = 0.6; c.beginPath(); c.moveTo(0, -1); c.quadraticCurveTo(w * 0.08, -l * 0.5, 0, -l * 0.92); c.stroke();
    c.restore();
  }

  // side table (walnut)
  g = c.createLinearGradient(247, 0, 253, 0); g.addColorStop(0, "#3e2a1d"); g.addColorStop(0.45, "#7a5338"); g.addColorStop(1, "#3a271b");
  c.fillStyle = g; c.fillRect(247.5, 152, 5, 41);
  c.fillStyle = "#3a281c"; c.beginPath(); c.ellipse(250, 194, 13, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#4b3223"; c.beginPath(); c.ellipse(250, 153.2, 28, 5.6, 0, 0, Math.PI * 2); c.fill();
  g = c.createLinearGradient(222, 146, 278, 156); g.addColorStop(0, "#9a6c48"); g.addColorStop(0.5, "#b48058"); g.addColorStop(1, "#86593b");
  c.fillStyle = g; c.beginPath(); c.ellipse(250, 150.6, 28, 5.6, 0, 0, Math.PI * 2); c.fill();
  // vase with a sprig
  c.strokeStyle = "#5a7a4c"; c.lineWidth = 0.9;
  c.beginPath(); c.moveTo(250, 135); c.quadraticCurveTo(247, 124, 241, 117); c.moveTo(250, 135); c.quadraticCurveTo(253, 125, 258, 121); c.stroke();
  blob(c, 241, 117, 2.6, 2.6, "110,150,90", 1, 0.6); blob(c, 258, 121, 2.4, 2.4, "110,150,90", 1, 0.6);
  g = c.createLinearGradient(245, 0, 255, 0); g.addColorStop(0, "#c7c1b8"); g.addColorStop(0.35, "#faf8f4"); g.addColorStop(1, "#b0aaa1");
  c.fillStyle = g; c.beginPath(); c.moveTo(245, 147); c.bezierCurveTo(243, 140, 244.5, 136, 247, 134); c.lineTo(253, 134); c.bezierCurveTo(255.5, 136, 257, 140, 255, 147); c.closePath(); c.fill();

  // sofa (slate fabric)
  const fab = (y0: number, y1: number, a: string, b: string) => { const lg = c.createLinearGradient(0, y0, 0, y1); lg.addColorStop(0, a); lg.addColorStop(1, b); return lg; };
  c.fillStyle = "#4a3426"; c.fillRect(301, 188, 6, 10); c.fillRect(413, 188, 6, 10);
  c.fillStyle = fab(118, 164, "#7d8a98", "#5f6b78"); c.beginPath(); rrect(c, 296, 118, 128, 46, 14); c.fill();
  for (const x of [303, 361]) {
    c.fillStyle = fab(123, 160, "#8d9aa8", "#6c7885"); c.beginPath(); rrect(c, x, 123, 56, 36, 11); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.16)"; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 9, 124); c.lineTo(x + 47, 124); c.stroke();
  }
  c.fillStyle = fab(150, 192, "#7a8794", "#4f5965"); c.beginPath(); rrect(c, 294, 150, 132, 42, 8); c.fill();
  c.fillStyle = fab(151, 172, "#8794a1", "#6a7682"); c.beginPath(); rrect(c, 300, 151, 59, 20, 7); rrect(c, 361, 151, 59, 20, 7); c.fill();
  c.fillStyle = "rgba(20,25,35,0.25)"; c.fillRect(298, 171, 124, 1.5);
  for (const x of [286, 414]) {
    const lg = c.createLinearGradient(x, 0, x + 20, 0);
    lg.addColorStop(0, "#6a7683"); lg.addColorStop(0.45, "#8996a3"); lg.addColorStop(1, "#5a6571");
    c.fillStyle = lg; c.beginPath(); rrect(c, x, 140, 20, 52, 10); c.fill();
    c.fillStyle = "rgba(255,255,255,0.14)"; c.beginPath(); rrect(c, x + 3, 141.5, 14, 4, 2); c.fill();
  }

  // vignette, like a lens
  c.save(); c.translate(SW / 2, SH / 2); c.scale(1, SH / SW);
  g = c.createRadialGradient(0, 0, SW * 0.32, 0, 0, SW * 0.72); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(20,15,10,0.28)");
  c.fillStyle = g; c.fillRect(-SW, -SW, SW * 2, SW * 2); c.restore();
}

/* Night sky seen through the panes (emissive, not multiplied by room light). */
const PANES: [number, number, number, number][] = [[41, 37, 37, 44], [81, 37, 36, 44], [41, 84, 37, 50], [81, 84, 36, 50]];
function paintSky(c: C2) {
  c.save(); c.beginPath(); for (const p of PANES) c.rect(...p); c.clip();
  const g = c.createLinearGradient(0, 37, 0, 134); g.addColorStop(0, "#0b1530"); g.addColorStop(0.7, "#1b2f5c"); g.addColorStop(1, "#2a4372");
  c.fillStyle = g; c.fillRect(38, 34, 82, 102);
  const r = rng(3);
  for (let i = 0; i < 22; i++) { c.fillStyle = `rgba(230,236,255,${0.25 + r() * 0.6})`; const s = r() < 0.2 ? 1.1 : 0.7; c.fillRect(41 + r() * 76, 37 + r() * 60, s, s); }
  blob(c, 60, 56, 20, 20, "170,190,255", 0.3);
  c.fillStyle = "#eef1fb"; c.beginPath(); c.arc(60, 56, 5.5, 0, Math.PI * 2); c.fill();
  blob(c, 58.5, 55, 1.6, 1.4, "170,175,195", 0.6); blob(c, 61.8, 58, 1.2, 1.1, "170,175,195", 0.5);
  // distant hills
  c.fillStyle = "#0d1630"; c.beginPath(); c.moveTo(38, 136); c.lineTo(38, 116); c.quadraticCurveTo(58, 104, 80, 114); c.quadraticCurveTo(100, 108, 120, 112); c.lineTo(120, 136); c.closePath(); c.fill();
  // glass sheen
  c.fillStyle = "rgba(255,255,255,0.05)"; c.beginPath(); c.moveTo(48, 37); c.lineTo(64, 37); c.lineTo(44, 134); c.lineTo(41, 134); c.lineTo(41, 70); c.closePath(); c.fill();
  c.restore();
}

/* Moonlight: deep-blue ambient, a spill around the window and a soft pane-shaped patch on the floor. */
function paintAmbient(c: HTMLCanvasElement, pr: number) {
  const x = c.getContext("2d")!; x.setTransform(pr, 0, 0, pr, 0, 0);
  x.fillStyle = "rgb(30,41,76)"; x.fillRect(0, 0, SW, SH);
  x.globalCompositeOperation = "lighter";
  blob(x, 79, 92, 120, 96, "40,56,105", 0.55);
  const patch = mk(c.width, c.height); const p = patch.getContext("2d")!; p.setTransform(pr, 0, 0, pr, 0, 0);
  // project each pane down onto the floor, so the mullions leave gaps
  const proj = (wx: number, wy: number): [number, number] => { const t = (wy - 37) / 97; return [wx + 46 + t * 6 + (1 - t) * 60, HZ + 4 + (1 - t) * 70]; };
  p.fillStyle = "#000";
  for (const [px, py, pw, ph] of PANES) {
    const a = proj(px, py + ph), b2 = proj(px + pw, py + ph), cc = proj(px + pw, py), d = proj(px, py);
    p.beginPath(); p.moveTo(...a); p.lineTo(...b2); p.lineTo(...cc); p.lineTo(...d); p.closePath(); p.fill();
  }
  // the pot and the table base stand in the beam: they block it
  p.globalCompositeOperation = "destination-out";
  p.beginPath(); p.moveTo(148, 158); p.lineTo(184, 158); p.lineTo(214, 206); p.lineTo(176, 210); p.closePath(); p.fill();
  plantShape(p); p.fill();
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.drawImage(blurred(patch, 5 * pr, "rgba(92,118,186,0.62)"), 0, 0);
  x.globalCompositeOperation = "source-over";
}

/* Shadow masks: where the lamp's direct light is blocked. Two blur levels; brightness blends them. */
function buildMasks(pw: number, ph: number, pr: number) {
  const raw = mk(pw, ph); const c = raw.getContext("2d")!; c.setTransform(pr, 0, 0, pr, 0, 0);
  c.fillStyle = "#000";
  // on the wall: silhouettes projected from the bulb (scaled about it by depth ratio)
  c.save(); c.beginPath(); c.rect(0, 0, SW, HZ - 0.5); c.clip();
  const casts: [(c: C2) => void, number][] = [[plantShape, 1.36], [sofaShape, 1.17], [tableShape, 1.3], [artShape, 1.03]];
  for (const [shape, k] of casts) { c.save(); c.translate(PX, LY); c.scale(k, k); c.translate(-PX, -LY); shape(c); c.fill(); c.restore(); }
  c.restore();
  // on the floor: cast away from the lamp
  c.save(); c.beginPath(); c.rect(0, HZ - 0.5, SW, SH); c.clip();
  c.beginPath(); c.moveTo(296, 190); c.lineTo(432, 190); c.lineTo(452, 206); c.lineTo(312, 206); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(181, 194); c.lineTo(152, 194); c.lineTo(122, 205); c.lineTo(160, 205); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(250, 197.5, 29, 5.2, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  const soft = blurred(raw, 11 * pr), sharp = blurred(raw, 2.2 * pr);
  // objects are never in their own cast shadow
  for (const m of [soft, sharp]) {
    const x = m.getContext("2d")!; x.setTransform(pr, 0, 0, pr, 0, 0); x.globalCompositeOperation = "destination-out";
    for (const s of [plantShape, sofaShape, tableShape, artShape]) { s(x); x.fill(); }
  }
  return { soft, sharp };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
type Sim = {
  b: number; bv: number; bT: number; k: number; kv: number; kT: number;
  on: boolean; env: number; resid: number; fil: number; warmT: number;
  th: number; thv: number; velS: number; prevB: number;
  st: number; sv: number; dragB: boolean; dragK: boolean; lastOn: number;
  drawn: number[]; visible: boolean; resized: boolean;
};

/**
 * A Home-style pendant light with a real room behind it. Drag the tall pill to set brightness (it
 * rubber-bands past either end like iOS), slide warmth from amber 2700 K to cool 6500 K, or tap a scene.
 * The rendered room responds physically: light falls off across wall and floor, a cone spills from the
 * glass shade, shadows sharpen with brightness, and the lamp swings a little when the level jumps.
 */
export interface SmartLightProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Plays interface sounds that follow what happens on screen. They follow the visitor's sound switch (off until switched on on this site). */
  enableSound?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function SmartLight({ autoplay = false, enableSound = true, className = "" }: SmartLightProps) {
  const uid = useId().replace(/:/g, "");
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const pillBodyRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<SVGGElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const kRef = useRef<HTMLSpanElement>(null);
  const kWordRef = useRef<HTMLSpanElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const thumbDotRef = useRef<HTMLSpanElement>(null);
  const touched = useRef(false);
  const play = useProSound(enableSound);
  const playRef = useRef(play);
  useLayoutEffect(() => { playRef.current = play; });
  /** Visitor input plays normally; the autoplay ghost pointer plays through the quieter `auto` path. */
  const sfx = (name: ProSoundName, volume?: number) => (touched.current ? playRef.current(name, volume) : playRef.current.auto(name, volume));
  const snd = useRef({ tickAt: 0, bStep: -1, kStep: -1, word: "", over: false });
  /** Rate-limited tick: at most ~12 per second. */
  const tick = (name: ProSoundName, volume: number) => {
    const now = performance.now();
    if (now - snd.current.tickAt < 85) return;
    snd.current.tickAt = now;
    sfx(name, volume);
  };
  const startOn = !autoplay;
  const sim = useRef<Sim>({
    b: startOn ? 60 : 0, bv: 0, bT: startOn ? 60 : 0, k: 3000, kv: 0, kT: 3000,
    on: startOn, env: startOn ? 1 : 0, resid: 0, fil: startOn ? 1 : 0, warmT: startOn ? 9 : 0,
    th: 0, thv: 0, velS: 0, prevB: startOn ? 60 : 0, st: 0, sv: 0, dragB: false, dragK: false, lastOn: 60,
    drawn: [], visible: true, resized: true,
  });
  const [on, setOn] = useState(startOn);
  const [active, setActive] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [sceneLabel, setSceneLabel] = useState("Living room with a pendant light");

  const describe = () => {
    const s = sim.current;
    if (!s.on) return "Light off";
    return `${Math.round(s.bT)} percent, ${roundK(s.kT)} K, ${warmWord(s.kT).toLowerCase()}`;
  };
  const announce = () => { const d = describe(); setStatus(d); setSceneLabel(`Living room with a pendant light, ${d}`); };

  const setB = (v: number) => {
    const s = sim.current;
    s.bT = clamp(v, 0, 100);
    const nowOn = s.bT > 0.4;
    if (nowOn !== s.on) {
      s.on = nowOn;
      // the glass lights up or goes dark: a relay click plus a soft glass note
      sfx("relay-click", nowOn ? 0.7 : 0.55);
      sfx(nowOn ? "glass-open" : "glass-close", 0.3);
      if (nowOn) { if (s.env > 0.55) s.warmT = 9; else { s.warmT = 0; s.resid = s.env; } }
      setOn(nowOn);
    }
    if (nowOn) s.lastOn = s.bT;
  };
  const applyScene = (sc: Scene) => { sfx("glass-chime", 0.5); setB(sc.b); sim.current.kT = sc.k; setActive(sc.id); announce(); };
  const togglePower = () => { const s = sim.current; if (s.on) { const keep = s.bT; setB(0); s.lastOn = keep; } else setB(s.lastOn || 60); setActive(null); announce(); };

  /* ---------- render + physics loop ---------- */
  useEffect(() => {
    const canvas = canvasRef.current!, host = sceneRef.current!;
    const ctx = canvas.getContext("2d")!;
    let albedo: HTMLCanvasElement | null = null, sky: HTMLCanvasElement | null = null, amb: HTMLCanvasElement | null = null;
    let light: HTMLCanvasElement | null = null, masks: { soft: HTMLCanvasElement; sharp: HTMLCanvasElement } | null = null;
    let pr = 1, lpr = 1;
    const build = () => {
      const w = host.clientWidth; if (!w) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const pw = Math.round(w * dpr), ph = Math.round((w * SH / SW) * dpr);
      canvas.width = pw; canvas.height = ph; pr = pw / SW;
      albedo = mk(pw, ph); const a = albedo.getContext("2d")!; a.setTransform(pr, 0, 0, pr, 0, 0); paintAlbedo(a);
      sky = mk(pw, ph); const k = sky.getContext("2d")!; k.setTransform(pr, 0, 0, pr, 0, 0); paintSky(k);
      // the light map is smooth (gradients, blurred shadows), so it can run at a lower resolution than the picture
      const lw = Math.round(Math.min(pw, w * 1.15)), lh = Math.round(lw * SH / SW); lpr = lw / SW;
      amb = mk(lw, lh); paintAmbient(amb, lpr);
      light = mk(lw, lh); masks = buildMasks(lw, lh, lpr);
      sim.current.resized = true;
    };
    build();
    const ro = new ResizeObserver(() => { if (canvas.width !== Math.round(host.clientWidth * Math.min(2, window.devicePixelRatio || 1))) build(); });
    ro.observe(host);
    const io = new IntersectionObserver((es) => { sim.current.visible = es[0]?.isIntersecting ?? true; }, { rootMargin: "80px" });
    io.observe(host);

    const draw = (s: Sim) => {
      if (!albedo || !light || !masks || !amb || !sky) return;
      const L = (s.b / 100) * s.env, I = Math.pow(L, 0.85);
      const [kr, kg, kb] = kelvinRGB(s.k); const rgb = `${kr | 0},${kg | 0},${kb | 0}`;
      const lx = PX - LY * Math.sin(s.th), ly = LY * Math.cos(s.th);
      const heat = s.fil * (0.28 + 0.72 * Math.sqrt(clamp(s.b / 100)));
      // ---- light map: lamp (direct, shadowed) + moonlight ambient + bounce ----
      const lc = light.getContext("2d")!;
      lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = "source-over"; lc.globalAlpha = 1; lc.clearRect(0, 0, light.width, light.height);
      lc.setTransform(lpr, 0, 0, lpr, 0, 0);
      if (I > 0.002) {
        lc.globalCompositeOperation = "lighter";
        const g = lc.createRadialGradient(lx, ly + 4, 0, lx, ly + 4, 340);
        g.addColorStop(0, `rgba(${rgb},${I})`); g.addColorStop(0.1, `rgba(${rgb},${0.9 * I})`); g.addColorStop(0.32, `rgba(${rgb},${0.55 * I})`);
        g.addColorStop(0.62, `rgba(${rgb},${0.24 * I})`); g.addColorStop(1, `rgba(${rgb},0)`);
        lc.fillStyle = g; lc.fillRect(0, 0, SW, SH);
        blob(lc, lx + (lx - PX) * 1.4, 212, 165, 44, rgb, 0.45 * I, 0.05);
        // the shade blocks most upward light
        lc.globalCompositeOperation = "destination-out";
        const up = lc.createLinearGradient(0, 0, 0, ly + 8); up.addColorStop(0, "rgba(0,0,0,0.55)"); up.addColorStop(1, "rgba(0,0,0,0)");
        lc.fillStyle = up; lc.fillRect(0, 0, SW, ly + 8);
        // cast shadows: soft and faint when dim, crisp and dark when bright
        const sharp = sstep(0.05, 0.95, L), dark = 0.55 + 0.42 * L, ox = -(lx - PX) * 0.32;
        lc.globalAlpha = dark * (1 - sharp); lc.drawImage(masks.soft, ox, 0, SW, SH);
        lc.globalAlpha = dark * sharp; lc.drawImage(masks.sharp, ox, 0, SW, SH);
        lc.globalAlpha = 1;
      }
      lc.globalCompositeOperation = "lighter";
      lc.drawImage(amb, 0, 0, SW, SH);
      if (I > 0.002) { lc.fillStyle = `rgba(${rgb},${0.16 * I})`; lc.fillRect(0, 0, SW, SH); }
      lc.globalCompositeOperation = "source-over";

      // ---- compose ----
      const m = ctx; m.setTransform(pr, 0, 0, pr, 0, 0);
      m.globalCompositeOperation = "source-over"; m.globalAlpha = 1;
      m.drawImage(albedo, 0, 0, SW, SH);
      m.globalCompositeOperation = "multiply"; m.drawImage(light, 0, 0, SW, SH);
      m.globalCompositeOperation = "source-over";
      m.globalAlpha = 1 - 0.38 * I; m.drawImage(sky, 0, 0, SW, SH); m.globalAlpha = 1;
      // lamp reflected in the window glass
      m.save(); m.beginPath(); for (const p of PANES) m.rect(...p); m.clip();
      m.globalCompositeOperation = "screen"; blob(m, 108 - (lx - PX) * 0.3, 70, 9, 12, rgb, 0.45 * I + 0.25 * heat * 0.3); blob(m, 79, 85, 60, 60, rgb, 0.08 * I);
      m.restore();

      // volumetric cone and hot spot (additive, in the lamp's swinging frame)
      m.globalCompositeOperation = "lighter";
      blob(m, lx, ly - 6, 64, 56, rgb, 0.09 * I);
      blob(m, lx, ly - 2, 22 + 30 * I, 22 + 30 * I, rgb, 0.15 * I + 0.1 * (s.fil * (0.28 + 0.72 * Math.sqrt(clamp(s.b / 100))))); // glare in the air around the shade
      if (I > 0.002) {
        m.save(); m.translate(PX, 0); m.rotate(s.th);
        for (const [w, a] of [[1, 0.3], [0.8, 0.32], [0.6, 0.38]] as const) {
          const cg = m.createLinearGradient(0, 100, 0, 245);
          cg.addColorStop(0, `rgba(${rgb},${a * 0.22 * I})`); cg.addColorStop(0.55, `rgba(${rgb},${a * 0.07 * I})`); cg.addColorStop(1, `rgba(${rgb},0)`);
          m.fillStyle = cg; m.beginPath(); m.moveTo(-30 * (0.5 + 0.5 * w), 100); m.lineTo(30 * (0.5 + 0.5 * w), 100); m.lineTo(128 * w, 248); m.lineTo(-128 * w, 248); m.closePath(); m.fill();
        }
        m.restore();
      }
      m.globalCompositeOperation = "source-over";

      // ---- the lamp ----
      const amb2 = 0.22 + 0.78 * clamp(I * 1.4); // how much light falls on the lamp itself
      const dim = (path: () => void, extra = 0) => { const d = (1 - amb2) * 0.82 + extra; if (d > 0.01) { m.fillStyle = `rgba(14,20,42,${d})`; path(); m.fill(); } };
      // ceiling canopy
      const canopy = () => { m.beginPath(); rrect(m, PX - 13, -4, 26, 8, 3); };
      let gg = m.createLinearGradient(PX - 13, 0, PX + 13, 0); gg.addColorStop(0, "#2a2a2d"); gg.addColorStop(0.4, "#5a5a60"); gg.addColorStop(1, "#1d1d20");
      m.fillStyle = gg; canopy(); m.fill(); dim(canopy);
      m.save(); m.translate(PX, 0); m.rotate(s.th);
      m.strokeStyle = `rgba(20,20,24,0.9)`; m.lineWidth = 1.2; m.beginPath(); m.moveTo(0, 3); m.lineTo(0, 58); m.stroke();
      // brass cap
      const cap = () => { m.beginPath(); rrect(m, -6.5, 56, 13, 13, 3); };
      gg = m.createLinearGradient(-6.5, 0, 6.5, 0);
      gg.addColorStop(0, "#5e4426"); gg.addColorStop(0.3, "#c9a564"); gg.addColorStop(0.42, "#f6e2b0"); gg.addColorStop(0.6, "#a8854f"); gg.addColorStop(1, "#4d381f");
      m.fillStyle = gg; cap(); m.fill(); dim(cap);
      // glass dome
      const dome = () => { m.beginPath(); m.moveTo(-7, 68); m.bezierCurveTo(-9, 81, -31, 85, -34, 100); m.quadraticCurveTo(0, 107, 34, 100); m.bezierCurveTo(31, 85, 9, 81, 7, 68); m.closePath(); };
      m.fillStyle = `rgba(232,238,246,${0.12 + 0.1 * amb2})`; dome(); m.fill();
      const glow = clamp(I * 1.25 + heat * 0.18);
      if (glow > 0.003) {
        const dg = m.createRadialGradient(0, 88, 0, 0, 88, 40);
        dg.addColorStop(0, `rgba(${rgb},${0.55 * glow})`); dg.addColorStop(0.45, `rgba(${rgb},${0.3 * glow})`); dg.addColorStop(1, `rgba(${rgb},${0.1 * glow})`);
        m.fillStyle = dg; dome(); m.fill();
      }
      // bulb: glass globe + filament
      m.fillStyle = `rgba(255,255,255,${0.06 + 0.1 * amb2})`; m.beginPath(); m.arc(0, 87, 8.5, 0, Math.PI * 2); m.fill();
      m.strokeStyle = `rgba(255,255,255,${0.18 + 0.25 * amb2})`; m.lineWidth = 0.6; m.stroke();
      const fr = heat < 0.35 ? 70 + (heat / 0.35) * 150 : 220 + ((heat - 0.35) / 0.65) * 35;
      const fg = heat < 0.35 ? 60 + (heat / 0.35) * 10 : 70 + ((heat - 0.35) / 0.65) * (kg - 70 + 20);
      const fb = heat < 0.35 ? 55 - (heat / 0.35) * 35 : 20 + ((heat - 0.35) / 0.65) * (kb * 0.85);
      if (heat > 0.01) { m.globalCompositeOperation = "lighter"; blob(m, 0, 88, 9, 9, `${fr | 0},${clamp(fg, 0, 255) | 0},${clamp(fb, 0, 255) | 0}`, 0.8 * heat); m.globalCompositeOperation = "source-over"; }
      m.strokeStyle = `rgb(${fr | 0},${clamp(fg, 0, 255) | 0},${clamp(fb, 0, 255) | 0})`; m.lineWidth = 1.1; m.lineJoin = "round";
      m.beginPath(); m.moveTo(-3.4, 93); m.lineTo(-2.4, 85.5); m.quadraticCurveTo(0, 82.6, 2.4, 85.5); m.lineTo(3.4, 93); m.stroke();
      m.strokeStyle = "rgba(160,150,140,0.7)"; m.lineWidth = 0.7; m.beginPath(); m.moveTo(-3.4, 93); m.lineTo(-2, 97); m.moveTo(3.4, 93); m.lineTo(2, 97); m.stroke();
      // fresnel edge, studio reflections, rim
      m.strokeStyle = `rgba(70,58,44,${0.3 * clamp(I * 1.2)})`; m.lineWidth = 2.2; dome(); m.stroke(); // refraction edge reads dark against a bright wall
      m.strokeStyle = `rgba(255,255,255,${0.28 + 0.32 * amb2})`; m.lineWidth = 1.1; dome(); m.stroke();
      m.lineCap = "round";
      m.strokeStyle = `rgba(255,255,255,${0.2 + 0.5 * amb2})`; m.lineWidth = 2.6; m.beginPath(); m.moveTo(-9.5, 73); m.bezierCurveTo(-14, 82, -24, 87, -27.5, 97); m.stroke();
      m.strokeStyle = `rgba(255,255,255,${0.1 + 0.22 * amb2})`; m.lineWidth = 1.2; m.beginPath(); m.moveTo(10.5, 74); m.bezierCurveTo(16, 82, 22.5, 88, 25, 95); m.stroke();
      m.lineCap = "butt";
      const rg = m.createLinearGradient(-34, 0, 34, 0);
      rg.addColorStop(0, `rgba(255,255,255,${0.15 + 0.4 * amb2})`); rg.addColorStop(0.5, `rgba(${rgb},${0.25 + 0.6 * glow})`); rg.addColorStop(1, `rgba(255,255,255,${0.1 + 0.3 * amb2})`);
      m.strokeStyle = rg; m.lineWidth = 1.4; m.beginPath(); m.ellipse(0, 100.6, 33.6, 3.6, 0, 0, Math.PI); m.stroke();
      m.restore();
      // lens core over the bulb
      m.globalCompositeOperation = "lighter";
      const bx = PX - 88 * Math.sin(s.th), by = 88 * Math.cos(s.th);
      blob(m, bx, by, 13, 13, rgb, 0.22 * I + 0.12 * heat);
      blob(m, bx, by, 6, 6, "255,250,240", 0.5 * I);
      m.globalCompositeOperation = "source-over";
    };

    let raf = 0, last = performance.now();
    let shownPct = -1, shownK = -1;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      const s = sim.current;
      // brightness: spring unless the finger owns it
      if (!s.dragB) { const a = 120 * (s.bT - s.b) - 20.5 * s.bv; s.bv += a * dt; s.b += s.bv * dt; if (Math.abs(s.bT - s.b) < 0.005 && Math.abs(s.bv) < 0.01) { s.b = s.bT; s.bv = 0; } }
      else s.bv = (s.b - s.prevB) / Math.max(dt, 0.001);
      s.b = clamp(s.b, 0, 100);
      // pendulum follow-through driven by how hard the level accelerates
      const vNow = (s.b - s.prevB) / Math.max(dt, 0.001) / 100; s.prevB = s.b;
      const vS = s.velS + (vNow - s.velS) * Math.min(1, dt / 0.05);
      const acc = (vS - s.velS) / Math.max(dt, 0.001); s.velS = vS;
      const W = 2 * Math.PI * 0.85;
      s.thv += (-W * W * s.th - 2 * 0.07 * W * s.thv - 0.12 * clamp(acc, -150, 150)) * dt;
      s.th = clamp(s.th + s.thv * dt, -0.09, 0.09);
      if (Math.abs(s.th) < 1e-5 && Math.abs(s.thv) < 1e-4) { s.th = 0; s.thv = 0; }
      // warmth
      if (!s.dragK) { const a = 90 * (s.kT - s.k) - 18 * s.kv; s.kv += a * dt; s.k += s.kv * dt; if (Math.abs(s.kT - s.k) < 0.5 && Math.abs(s.kv) < 1) { s.k = s.kT; s.kv = 0; } }
      // switch-on envelope and filament heat
      if (s.on) { s.warmT += dt; s.env = Math.max(warmCurve(s.warmT), s.resid * Math.exp(-s.warmT / 0.09)); s.fil = Math.min(1, s.fil + dt / 0.22); }
      else { s.env *= Math.exp(-dt / 0.08); s.fil *= Math.exp(-dt / 0.32); if (s.env < 1e-3) s.env = 0; if (s.fil < 2e-3) s.fil = 0; }
      // rubber-band settle
      if (!s.dragB) { s.sv += (-420 * s.st - 34 * s.sv) * dt; s.st += s.sv * dt; if (Math.abs(s.st) < 0.02 && Math.abs(s.sv) < 0.2) { s.st = 0; s.sv = 0; } }

      // DOM: pill, slider, readouts (cheap, but only when changed)
      const pill = pillRef.current, body = pillBodyRef.current, fill = fillRef.current;
      if (pill && body && fill) {
        const H = body.offsetHeight || 176;
        const st = s.st;
        body.style.transformOrigin = st >= 0 ? "50% 100%" : "50% 0%";
        body.style.transform = st ? `scale(${1 - Math.abs(st) / H * 0.22}, ${1 + Math.abs(st) / H})` : "";
        fill.style.transform = `translateY(${(100 - s.b).toFixed(2)}%)`;
        const [r, g, b] = kelvinRGB(s.k);
        const mixw = 0.3;
        fill.style.background = `linear-gradient(180deg, rgb(${r * (1 - mixw) + 255 * mixw | 0},${g * (1 - mixw) + 255 * mixw | 0},${b * (1 - mixw) + 255 * mixw | 0}), rgb(${r * 0.8 + 51 | 0},${g * 0.8 + 51 | 0},${b * 0.8 + 51 | 0}))`;
        raysRef.current?.setAttribute("transform", `translate(12 12) scale(${(0.55 + 0.45 * s.b / 100).toFixed(3)}) translate(-12 -12)`);
        const pct = Math.round(s.b);
        if (pct !== shownPct) {
          shownPct = pct;
          const offNow = !s.on && pct === 0;
          if (pctRef.current) pctRef.current.textContent = offNow ? "Off" : `${pct}%`;
          pill.setAttribute("aria-valuenow", String(pct));
          pill.setAttribute("aria-valuetext", offNow ? "Off" : `${pct} percent`);
        }
      }
      const kr = roundK(s.k);
      if (thumbRef.current) thumbRef.current.style.left = `${((s.k - KMIN) / (KMAX - KMIN)) * 100}%`;
      if (kr !== shownK) {
        shownK = kr;
        if (kRef.current) kRef.current.textContent = `${kr} K`;
        if (kWordRef.current) kWordRef.current.textContent = warmWord(s.k);
        const [r, g, b] = kelvinRGB(s.k);
        if (thumbDotRef.current) thumbDotRef.current.style.background = `rgb(${r | 0},${g | 0},${b | 0})`;
        warmRef.current?.setAttribute("aria-valuenow", String(kr));
        warmRef.current?.setAttribute("aria-valuetext", `${kr} kelvin, ${warmWord(s.k).toLowerCase()}`);
      }

      // canvas: only when something visible changed
      if (!s.visible) return;
      const snap = [s.b, s.k, s.env, s.fil, s.th];
      const d = s.drawn;
      const changed = s.resized || d.length === 0 || Math.abs(snap[0] - d[0]) > 0.01 || Math.abs(snap[1] - d[1]) > 0.5 || Math.abs(snap[2] - d[2]) > 0.0008 || Math.abs(snap[3] - d[3]) > 0.002 || Math.abs(snap[4] - d[4]) > 0.00004;
      if (changed) { s.resized = false; s.drawn = snap; draw(s); }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  /* ---------- autoplay: off -> Relax -> Read -> Focus (+ overscroll) -> Night -> off ... ---------- */
  useEffect(() => {
    if (!autoplay) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => { if (!touched.current) fn(); }, ms));
    const cycle = () => {
      const s = sim.current;
      if (s.on) { s.lastOn = 45; setB(0); }
      setActive(null); setStatus("Light off");
      at(1300, () => applyScene(SCENES[0]));
      at(4100, () => applyScene(SCENES[1]));
      at(6500, () => applyScene(SCENES[2]));
      at(7900, () => { sim.current.sv = 520; sfx("wood-drop", 0.45); });
      at(9300, () => applyScene(SCENES[3]));
      at(11900, cycle);
    };
    cycle();
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  /* ---------- brightness pill: relative drag with rubber-band ends ---------- */
  const pDrag = useRef({ y0: 0, v0: 0, scale: 1, H: 176, moved: false });
  const onPillDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    snd.current.bStep = Math.round(sim.current.b / 5); snd.current.over = false;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.setPointerCapture(e.pointerId);
    const s = sim.current;
    s.dragB = true; s.prevB = s.b;
    pDrag.current = { y0: e.clientY, v0: s.b, scale: r.height / (el.offsetHeight || 1), H: el.offsetHeight || 176, moved: false };
  };
  const onPillMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = sim.current; if (!s.dragB) return;
    const p = pDrag.current;
    const dy = (e.clientY - p.y0) / p.scale;
    if (Math.abs(dy) > 2) p.moved = true;
    const raw = p.v0 - (dy / p.H) * 100;
    const v = clamp(raw, 0, 100);
    const flips = (v > 0.4) !== s.on;
    s.b = v; setB(v);
    const snk = snd.current, bs = Math.round(v / 5);
    if (bs !== snk.bStep) { snk.bStep = bs; if (!flips) tick("glass-tap", 0.3); }
    const over = raw > 100 || raw < 0;
    if (over && !snk.over) sfx("wood-drop", 0.4); // hit the end stop
    snk.over = over;
    const overPx = ((raw > 100 ? raw - 100 : raw < 0 ? raw : 0) / 100) * p.H;
    s.st = Math.sign(overPx) * rubber(Math.abs(overPx), 32); s.sv = 0;
    if (p.moved) setActive(null);
  };
  const onPillUp = () => {
    const s = sim.current; if (!s.dragB) return;
    s.dragB = false; s.bT = s.b; snd.current.over = false;
    if (!s.on) s.b = 0;
    announce();
  };
  const onPillKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    const s = sim.current; const cur = s.bT;
    const map: Record<string, number> = { ArrowUp: cur + 5, ArrowRight: cur + 5, ArrowDown: cur - 5, ArrowLeft: cur - 5, PageUp: cur + 20, PageDown: cur - 20, Home: 0, End: 100 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const target = map[e.key];
    const bump = (target > 100 && cur >= 100) || (target < 0 && cur <= 0);
    if (bump) { s.sv = target > 100 ? 300 : -300; sfx("wood-drop", 0.4); } // bump the end
    const flips = (clamp(target, 0, 100) > 0.4) !== s.on;
    setB(target); setActive(null); announce();
    if (!bump && !flips) tick("glass-tap", 0.3);
  };

  /* ---------- warmth slider: absolute, 1:1 ---------- */
  const setKFromX = (el: HTMLDivElement, clientX: number) => {
    const r = el.getBoundingClientRect(); const sc = r.width / (el.offsetWidth || 1);
    const pad = 13; const w = el.offsetWidth - pad * 2;
    const x = (clientX - r.left) / sc - pad;
    const k = KMIN + clamp(x / w) * (KMAX - KMIN);
    const s = sim.current; s.k = k; s.kT = k; s.kv = 0;
    warmSound(k);
  };
  /** A wood tick every ~150 K while sliding, and a glass ping when the warmth name changes. */
  const warmSound = (k: number) => {
    const snk = snd.current, step = Math.round(k / 150), word = warmWord(k);
    const wordChanged = snk.word !== "" && word !== snk.word;
    snk.word = word;
    if (wordChanged) { snd.current.kStep = step; sfx("glass-ping", 0.35); return; }
    if (step !== snk.kStep) { snk.kStep = step; tick("wood-tap", 0.3); }
  };
  const onWarmDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true; e.currentTarget.setPointerCapture(e.pointerId);
    snd.current.word = warmWord(sim.current.kT); snd.current.kStep = Math.round(sim.current.kT / 150);
    sim.current.dragK = true; setKFromX(e.currentTarget, e.clientX); setActive(null);
  };
  const onWarmMove = (e: RPointerEvent<HTMLDivElement>) => { if (sim.current.dragK) setKFromX(e.currentTarget, e.clientX); };
  const onWarmUp = () => { if (!sim.current.dragK) return; sim.current.dragK = false; announce(); };
  const onWarmKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    const s = sim.current; const cur = s.kT;
    const map: Record<string, number> = { ArrowUp: cur + 100, ArrowRight: cur + 100, ArrowDown: cur - 100, ArrowLeft: cur - 100, PageUp: cur + 500, PageDown: cur - 500, Home: KMIN, End: KMAX };
    if (!(e.key in map)) return;
    e.preventDefault();
    snd.current.word = warmWord(cur);
    s.kT = clamp(Math.round(map[e.key] / 50) * 50, KMIN, KMAX); setActive(null); announce();
    if (s.kT !== cur) { if (warmWord(s.kT) !== snd.current.word) sfx("glass-ping", 0.35); else tick("wood-tap", 0.3); }
  };

  return (
    <div
      className={`relative w-full max-w-[440px] overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      role="group"
      aria-label="Pendant light control"
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
    >
      <div ref={sceneRef} className="relative w-full" style={{ aspectRatio: `${SW} / ${SH}` }}>
        <canvas ref={canvasRef} role="img" aria-label={sceneLabel} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-black/[0.06]" />
      </div>

      <div className="px-[18px] pb-4 pt-4">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#6e6e73]">Living Room</p>
            <p className="text-[17px] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f]">Pendant Light</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Pendant light power"
            onClick={() => { touched.current = true; togglePower(); }}
            className={`flex h-10 w-10 flex-none items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] ${on ? "bg-[#fff1d6] text-[#c46a00]" : "bg-[#f2f2f7] text-[#6e6e73]"}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 3v8" /><path d="M6.6 6.4a8 8 0 1 0 10.8 0" /></svg>
          </button>
        </div>

        <div className="flex gap-4">
          {/* iOS Control Center style brightness pill */}
          <div
            ref={pillRef}
            role="slider"
            tabIndex={0}
            aria-label="Brightness"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={startOn ? 60 : 0}
            aria-valuetext={startOn ? "60 percent" : "Off"}
            onPointerDown={onPillDown}
            onPointerMove={onPillMove}
            onPointerUp={onPillUp}
            onPointerCancel={onPillUp}
            onKeyDown={onPillKey}
            className="relative h-[176px] w-[76px] flex-none cursor-grab touch-none select-none rounded-[26px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#0071e3] active:cursor-grabbing"
          >
            <div ref={pillBodyRef} className="absolute inset-0 overflow-hidden rounded-[26px] bg-[#dedee3] shadow-[inset_0_1px_2px_rgba(0,0,0,.08),inset_0_0_0_1px_rgba(0,0,0,.03)]" style={{ willChange: "transform" }}>
              <div ref={fillRef} className="absolute inset-0" style={{ transform: `translateY(${startOn ? 40 : 100}%)`, willChange: "transform" }}>
                <div className="absolute inset-x-0 top-0 h-px bg-black/[0.06]" />
              </div>
              <svg className="absolute bottom-[14px] left-1/2 ml-[-12px] text-[#1d1d1f]/80" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3.6" fill="currentColor" stroke="none" />
                <g ref={raysRef}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                    <line key={a} x1="12" y1="3" x2="12" y2="5.2" transform={`rotate(${a} 12 12)`} />
                  ))}
                </g>
              </svg>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-[#6e6e73]">Brightness</p>
              <span ref={pctRef} className="block text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] tabular-nums text-[#1d1d1f]">{startOn ? "60%" : "Off"}</span>
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[12px]">
                <span className="font-medium text-[#6e6e73]">Warmth</span>
                <span className="truncate tabular-nums text-[#1d1d1f]"><span ref={kRef}>3000 K</span><span className="text-[#6e6e73]"> · </span><span ref={kWordRef}>Warm</span></span>
              </div>
              <div
                ref={warmRef}
                role="slider"
                tabIndex={0}
                aria-label="Colour temperature"
                aria-valuemin={KMIN}
                aria-valuemax={KMAX}
                aria-valuenow={3000}
                aria-valuetext="3000 kelvin, warm"
                onPointerDown={onWarmDown}
                onPointerMove={onWarmMove}
                onPointerUp={onWarmUp}
                onPointerCancel={onWarmUp}
                onKeyDown={onWarmKey}
                className="relative h-[30px] cursor-pointer touch-none select-none rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
              >
                <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,.12),inset_0_0_0_1px_rgba(0,0,0,.04)]" style={{ background: "linear-gradient(90deg,#ffad5a,#ffd3a1 30%,#fff3e6 55%,#f2f5ff 78%,#d9e6ff)" }} />
                <div className="absolute inset-y-0 left-[13px] right-[13px]">
                  <div ref={thumbRef} className="absolute top-1/2 h-[26px] w-[26px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.22),0_0_0_0.5px_rgba(0,0,0,.08)]" style={{ left: `${((3000 - KMIN) / (KMAX - KMIN)) * 100}%`, transform: "translate(-50%,-50%)" }}>
                    <span ref={thumbDotRef} className="absolute inset-[7px] rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,.15)]" style={{ background: "#ffb46b" }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Scenes">
              {SCENES.map((sc) => {
                const sel = active === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    aria-pressed={sel}
                    onClick={() => { touched.current = true; applyScene(sc); }}
                    className={`relative flex h-[30px] items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] ${sel ? "text-white" : "bg-[#f2f2f7] text-[#1d1d1f] hover:bg-[#e9e9ee]"}`}
                  >
                    {sel && <motion.span layoutId={`${uid}-chip`} className="absolute inset-0 rounded-full bg-[#1d1d1f]" transition={{ type: "spring", stiffness: 520, damping: 36 }} />}
                    <span className="relative flex items-center gap-1.5">
                      <SceneIcon id={sc.id} />
                      {sc.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-3.5 text-[12px] leading-snug text-[#6e6e73]">Drag the pill or use the arrow keys. Tap a scene to set the mood.</p>
      </div>
      <p className="sr-only" aria-live="polite">{status}</p>
    </div>
  );
}

function SceneIcon({ id }: { id: string }) {
  const p = { width: 13, height: 13, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (id === "relax") return <svg {...p}><path d="M2 9.5c2-2.6 4-2.6 6 0s4 2.6 6 0" /><path d="M2 5.5c2-2.6 4-2.6 6 0s4 2.6 6 0" opacity=".55" /></svg>;
  if (id === "read") return <svg {...p}><path d="M8 4.2C6.6 3.2 4.6 2.9 2.5 3.2v9c2.1-.3 4.1 0 5.5 1 1.4-1 3.4-1.3 5.5-1v-9c-2.1-.3-4.1 0-5.5 1z" /><path d="M8 4.2v9" /></svg>;
  if (id === "focus") return <svg {...p}><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none" /></svg>;
  return <svg {...p}><path d="M13 9.6A5.6 5.6 0 1 1 6.4 3a4.4 4.4 0 0 0 6.6 6.6z" /></svg>;
}

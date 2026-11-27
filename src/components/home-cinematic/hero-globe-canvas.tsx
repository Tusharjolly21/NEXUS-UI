"use client";

import * as React from "react";
import { isLand } from "@/components/dot-globe";

const rad = (d: number) => (d * Math.PI) / 180;
const CITIES: Record<string, [number, number]> = {
  sf: [37.77, -122.42],
  ny: [40.71, -74.01],
  ldn: [51.51, -0.13],
  dxb: [25.2, 55.27],
  blr: [12.97, 77.59],
  sgp: [1.35, 103.82],
  tyo: [35.68, 139.69],
  syd: [-33.87, 151.21],
  cpt: [-33.92, 18.42],
};
const ARCS: [string, string][] = [
  ["ny", "ldn"],
  ["ldn", "dxb"],
  ["dxb", "blr"],
  ["blr", "sgp"],
  ["sgp", "tyo"],
  ["ldn", "cpt"],
];

/** The view: which longitude and latitude face the screen. */
const FACE_LON = 24;
const TILT = rad(22);

type Vec = [number, number, number];
/** Latitude and longitude to a point on the unit sphere, turned to face the view. */
function project(lat: number, lon: number): Vec {
  const la = rad(lat);
  const lo = rad(lon - FACE_LON);
  const x = Math.cos(la) * Math.sin(lo);
  const y = Math.sin(la);
  const z = Math.cos(la) * Math.cos(lo);
  return [x, y * Math.cos(TILT) - z * Math.sin(TILT), y * Math.sin(TILT) + z * Math.cos(TILT)];
}

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function draw(canvas: HTMLCanvasElement, size: number, dark: boolean) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);

  const c = size / 2;
  const R = size * 0.45;
  const k = size / 1100;

  // palette
  const landA = dark ? [150, 128, 255] : [96, 78, 236];
  const landB = dark ? [64, 176, 255] : [30, 124, 230];
  const ocean = dark ? "170,160,255" : "70,60,150";

  // the globe's body: a faint lit sphere, brighter toward its edge
  const body = ctx.createRadialGradient(c, c, R * 0.55, c, c, R);
  body.addColorStop(0, dark ? "rgba(110,91,255,0)" : "rgba(110,91,255,0)");
  body.addColorStop(1, dark ? "rgba(110,91,255,0.16)" : "rgba(110,91,255,0.07)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.fill();

  // dots on a Fibonacci lattice: land bright, ocean faint, smaller toward the rim
  const N = 18000;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    const px = Math.cos(t) * r;
    const pz = Math.sin(t) * r;
    // back to latitude / longitude on the unmoved sphere
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = (Math.atan2(px, pz) * 180) / Math.PI;
    const [vx, vy, vz] = project(lat, lon);
    if (vz <= 0.02) continue;
    const land = isLand(lat, lon);
    const depth = Math.pow(vz, 0.6);
    const radius = (land ? 1.45 : 0.62) * k * (0.45 + 0.55 * depth);
    const X = c + vx * R;
    const Y = c - vy * R;
    if (land) {
      const col = mix(landA, landB, Math.min(1, Math.max(0, (vy + 1) / 2)));
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${(0.5 + 0.5 * depth).toFixed(3)})`;
    } else {
      ctx.fillStyle = `rgba(${ocean},${(0.04 + 0.1 * depth).toFixed(3)})`;
    }
    ctx.beginPath();
    ctx.arc(X, Y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // flight arcs: great circles lifted off the surface, drawn only where they face us
  const unit = (lat: number, lon: number): Vec => {
    const la = rad(lat);
    const lo = rad(lon);
    return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
  };
  const view = (v: Vec, lift: number): Vec => {
    const len = Math.hypot(...v) || 1;
    const lat = (Math.asin(v[1] / len) * 180) / Math.PI;
    const lon = (Math.atan2(v[0], v[2]) * 180) / Math.PI;
    const p = project(lat, lon);
    return [p[0] * lift, p[1] * lift, p[2] * lift];
  };
  ctx.lineCap = "round";
  for (const [a, b] of ARCS) {
    const va = unit(...CITIES[a]);
    const vb = unit(...CITIES[b]);
    const dot = Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
    const ang = Math.acos(dot);
    const steps = 48;
    let prev: [number, number, number] | null = null;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const sa = Math.sin((1 - t) * ang) / Math.sin(ang);
      const sb = Math.sin(t * ang) / Math.sin(ang);
      const mid: Vec = [va[0] * sa + vb[0] * sb, va[1] * sa + vb[1] * sb, va[2] * sa + vb[2] * sb];
      const lift = 1 + 0.22 * Math.sin(Math.PI * t) * Math.min(1, ang / 1.2);
      const p = view(mid, lift);
      if (prev && p[2] > 0 && prev[2] > 0) {
        ctx.strokeStyle = dark ? `rgba(190,180,255,${(0.55 * Math.sin(Math.PI * t) + 0.12).toFixed(3)})` : `rgba(90,70,230,${(0.5 * Math.sin(Math.PI * t) + 0.12).toFixed(3)})`;
        ctx.lineWidth = 1.2 * k + 0.3;
        ctx.beginPath();
        ctx.moveTo(c + prev[0] * R, c - prev[1] * R);
        ctx.lineTo(c + p[0] * R, c - p[1] * R);
        ctx.stroke();
      }
      prev = p;
    }
  }

  // city pins with a soft glow
  for (const [lat, lon] of Object.values(CITIES)) {
    const [vx, vy, vz] = project(lat, lon);
    if (vz <= 0.05) continue;
    const X = c + vx * R;
    const Y = c - vy * R;
    const glow = ctx.createRadialGradient(X, Y, 0, X, Y, 16 * k + 6);
    glow.addColorStop(0, dark ? "rgba(170,150,255,0.75)" : "rgba(96,78,236,0.5)");
    glow.addColorStop(1, "rgba(110,91,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(X, Y, 16 * k + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark ? "#ffffff" : "#3b2fd0";
    ctx.beginPath();
    ctx.arc(X, Y, 2.4 * k + 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // a thin lit rim
  const rim = ctx.createLinearGradient(c - R, c - R, c + R, c + R);
  rim.addColorStop(0, dark ? "rgba(190,180,255,0.55)" : "rgba(96,78,236,0.35)");
  rim.addColorStop(0.5, dark ? "rgba(110,91,255,0.12)" : "rgba(110,91,255,0.06)");
  rim.addColorStop(1, dark ? "rgba(0,144,247,0.4)" : "rgba(0,144,247,0.25)");
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.stroke();
}

const SIZE = 1280;

/**
 * A large dotted globe behind the hero, half of it off the right edge. It is drawn once (nothing on it moves), from the
 * same land outline the Outpost template uses, and redrawn only when the theme changes. Wide screens only.
 */
export default function HeroGlobeCanvas() {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const [wide, setWide] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!wide || !canvas) return;
    const paint = () => draw(canvas, SIZE, document.documentElement.classList.contains("dark"));
    // after the page has painted, so it never delays the headline
    const id = window.setTimeout(paint, 250);
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.clearTimeout(id);
      mo.disconnect();
    };
  }, [wide]);

  if (!wide) return null;
  return <canvas ref={ref} aria-hidden className="cx-globe" style={{ width: SIZE, height: SIZE }} />;
}

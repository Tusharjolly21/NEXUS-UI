"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

export interface DotGlobeCity {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const DOT_GLOBE_CITIES: DotGlobeCity[] = [
  { id: "sf", name: "San Francisco", lat: 37.77, lon: -122.42 },
  { id: "ny", name: "New York", lat: 40.71, lon: -74.01 },
  { id: "sp", name: "São Paulo", lat: -23.55, lon: -46.63 },
  { id: "ldn", name: "London", lat: 51.51, lon: -0.13 },
  { id: "cpt", name: "Cape Town", lat: -33.92, lon: 18.42 },
  { id: "blr", name: "Bengaluru", lat: 12.97, lon: 77.59 },
  { id: "tyo", name: "Tokyo", lat: 35.68, lon: 139.69 },
  { id: "syd", name: "Sydney", lat: -33.87, lon: 151.21 },
];

export const DOT_GLOBE_ROUTES: [string, string][] = [["sf", "tyo"], ["ny", "ldn"], ["ldn", "blr"], ["blr", "syd"], ["sp", "cpt"], ["ny", "sp"], ["tyo", "syd"]];

const rad = (d: number) => (d * Math.PI) / 180;
const toVec = (lat: number, lon: number): [number, number, number] => {
  const la = rad(lat), lo = rad(lon);
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
};

// Land outline: a 150 x 55 bitmap (2.4 degree cells, 76N to 55S, from 168W), one bit per cell, in hex.
const LAND = { cols: 150, rows: 55, lat0: 76, lon0: -168, step: 2.3866666666666667, data: "00000102f803fffc00000003001ff800880000000037ce7c01fff00000000c18fffff07000003fc007f31fc1fff80001e0001fffffffff80007ffffffff2e0ff80000ffe5ffbffffffffffe0ffffffffe3d0fc07801e79ffffffffffffffd87fffffff10407800007dffffffffffffffffc07f7ffffe03801000007cfffffffffffffe3c000c03fffe03f0000008187fffffffffff8040003001ffffc3f800000c31ffffffffffff00c0000000fffff7fe00003c7fffffffffffff80800000007ffffffe00000fffffffffffffffa0000000003fffffa300000fffffffffffffff80000000003fffffe0000003ffebe7ffffffff00000000003fffff80000003d7c1cffffffffe20000000003fffff0000001e09cceffffffff800000000001ffffe0000003c053fe7ffffff1040000000001ffffe00000009e02bffffffff9880000000000ffffc0000000fe007ffffffff87000000000007fff00000003ff987ffffffff80000000000003fe800000003fffffefffffffc0000000000000fc080000007ffff7e7ffffff800000000000017800000000fffffbf41fffff00000000000000380c000001fffffdfe1ff7fc000000000000003cc0000000fffffdfe07c7e8000000000000000f80000000fffffefc0783e04000000000000001e0000001fffffef00701f0000000000000000020000001ffffff00030070000000000000000021f00000fffffff003002000000000000000000bfc00007fffffe0008000200000000000000003ff00003c7fffe00000c1000000000000000003ff8000003fffc0000143000000000000000007ff8000003fff800000cf600000000000000007fff000003fff0000004ec2000000000000000ffffc00001ffe00000062c1e00000000000000fffff00000ffe0000001000f100000000000007ffff00000ffe00000001504800000000000003fffe00000ffe00000000000000000000000003fffc00000ffe00000000062000000000000001fffc00001ffe200000003f20000000000000007ffc00001ffc600000003ff0000000000000007ff800000ff860000001fff8100000000000007ff000000ff840000003fffc000000000000007fc0000007f040000003fffc000000000000007fc0000007f000000003fffe00000000000000ff80000003e000000001fffe00000000000000ff00000003c000000001e1fc00000000000000fc00000000000000000100fc00000000000000fc000000000000000000007800000000000000f0000000000000000000000001800000000001e0000000000000000000001802000000000001e0000000000000000000000004000000000001c0000000000000000000000000000000000001c0000000000000100000000000000000000001c4000000000000000000000000000000000000c000000000000000000000000000" };
const LAND_CELLS = (() => {
  const grid = new Uint8Array(LAND.cols * LAND.rows);
  const perRow = Math.ceil(LAND.cols / 4);
  for (let row = 0; row < LAND.rows; row++) {
    for (let chunk = 0; chunk < perRow; chunk++) {
      const bits = parseInt(LAND.data[row * perRow + chunk], 16);
      for (let bit = 0; bit < 4; bit++) {
        const col = chunk * 4 + bit;
        if (bits & (8 >> bit) && col < LAND.cols) grid[row * LAND.cols + col] = 1;
      }
    }
  }
  return grid;
})();

/** True when the point (degrees) is on land, as far as the outline can tell. */
export function isLand(lat: number, lon: number) {
  const lng = lon < LAND.lon0 ? lon + 360 : lon;
  const col = Math.floor((lng - LAND.lon0) / LAND.step);
  const row = Math.floor((LAND.lat0 - lat) / LAND.step);
  if (col < 0 || col >= LAND.cols || row < 0 || row >= LAND.rows) return false;
  return LAND_CELLS[row * LAND.cols + col] === 1;
}

// Sphere of dots on a Fibonacci lattice; the fourth number is 1 for dots that sit on land. Built the first time a globe
// is drawn, not when this file loads, so a page that only imports it pays nothing.
type Dot = [number, number, number, number];
let SPHERE_CACHE: Dot[] | null = null;
function sphere(): Dot[] {
  if (SPHERE_CACHE) return SPHERE_CACHE;
  const out: Dot[] = [];
  const N = 5200;
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = g * i;
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;
    out.push([x, y, z, isLand((Math.asin(y) * 180) / Math.PI, (Math.atan2(x, z) * 180) / Math.PI) ? 1 : 0]);
  }
  return (SPHERE_CACHE = out);
}

export interface DotGlobeProps {
  /** Canvas size in px (square). */
  size?: number;
  /** Arc, pin and selected-chip colour. */
  accent?: string;
  /** Cities to pin and list as chips. */
  cities?: DotGlobeCity[];
  /** Flight arcs as pairs of city ids. */
  routes?: [string, string][];
  /** Turns slowly and tours cities until the user interacts. */
  autoplay?: boolean;
  /** Draws only when something changes: no automatic spin, travelling arcs or pulsing pins. Dragging and choosing a city still work. */
  still?: boolean;
}

/**
 * A dotted globe drawn on canvas with an orthographic projection. Drag to spin
 * it (it coasts and slows), or pick a city and it springs round to face you.
 * Flight arcs draw themselves along great circles between cities.
 */
export function DotGlobe({ size = 340, accent = "#0071e3", cities = DOT_GLOBE_CITIES, routes = DOT_GLOBE_ROUTES, autoplay = false, still = false }: DotGlobeProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const yaw = useMotionValue(-20);
  const pitch = useMotionValue(-18);
  const [active, setActive] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number; vx: number; lt: number; lx: number } | null>(null);
  const spin = useRef(true);
  const touched = useRef(false);
  const ctl = useRef<{ stop: () => void }[]>([]);
  const dark = useRef(false);

  // Track the site theme so the canvas redraws in the right palette.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      dark.current = root.classList.contains("dark");
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  const focus = (c: DotGlobeCity) => {
    ctl.current.forEach((x) => x.stop());
    spin.current = false;
    setActive(c.id);
    // Shortest way round.
    let target = -c.lon;
    const cur = yaw.get();
    target += Math.round((cur - target) / 360) * 360;
    ctl.current = [
      animate(yaw, target, { type: "spring", stiffness: 40, damping: 14 }),
      animate(pitch, c.lat * 0.85, { type: "spring", stiffness: 40, damping: 14 }),
    ];
  };

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr;
    cv.height = size * dpr;
    const R = size * 0.42;
    const C = size / 2;
    const SPHERE = sphere();
    let raf = 0;
    let last = performance.now();
    const t0 = performance.now();
    const byId = Object.fromEntries(cities.map((c) => [c.id, c]));

    const project = (v: readonly number[], ya: number, pi: number) => {
      // rotate around Y (yaw) then X (pitch)
      const cy = Math.cos(ya), sy = Math.sin(ya), cp = Math.cos(pi), sp = Math.sin(pi);
      const x1 = v[0] * cy + v[2] * sy;
      const z1 = -v[0] * sy + v[2] * cy;
      const y2 = v[1] * cp - z1 * sp;
      const z2 = v[1] * sp + z1 * cp;
      return { x: C + x1 * R, y: C - y2 * R, z: z2 };
    };

    // Draw only while on screen (and, when `still`, only after something changed), so idle globes cost nothing.
    let visible = true;
    let queued = false;
    const schedule = () => {
      if (queued || !visible) return;
      queued = true;
      raf = requestAnimationFrame(frame);
    };

    const frame = (now: number) => {
      queued = false;
      const dt = (now - last) / 1000;
      last = now;
      const isDark = dark.current;
      const ink = isDark ? "245,245,247" : "29,29,31";
      if (!still && spin.current && !drag.current) yaw.set(yaw.get() + dt * 8);
      const ya = rad(yaw.get()), pi = rad(pitch.get());
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // soft body
      const g = ctx.createRadialGradient(C - R * 0.35, C - R * 0.4, R * 0.1, C, C, R * 1.05);
      g.addColorStop(0, isDark ? "#3a3a3c" : "#ffffff");
      g.addColorStop(1, isDark ? "#1c1c1e" : "#eef1f6");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(C, C, R, 0, Math.PI * 2);
      ctx.fill();

      for (const d of SPHERE) {
        const p = project(d, ya, pi);
        if (p.z < -0.15) continue;
        const land = d[3] === 1;
        const front = Math.max(0, p.z);
        const a = p.z < 0 ? (land ? 0.1 : 0.03) : land ? 0.4 + front * 0.6 : 0.07 + front * 0.14;
        ctx.fillStyle = land && p.z >= 0 ? accent : `rgba(${ink},${a.toFixed(3)})`;
        ctx.globalAlpha = land && p.z >= 0 ? Math.min(1, 0.35 + front * 0.65) : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (land ? 0.8 : 0.45) + front * (land ? 0.95 : 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // arcs
      const phase = still ? 0.5 : ((now - t0) / 2600) % 1;
      routes.forEach(([a, b], k) => {
        const A = byId[a], B = byId[b];
        if (!A || !B) return;
        const va = toVec(A.lat, A.lon), vb = toVec(B.lat, B.lon);
        const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
        const om = Math.acos(dot);
        const steps = 48;
        const prog = (phase + k * 0.17) % 1;
        const head = Math.min(1, prog * 1.6);
        const tail = Math.max(0, prog * 1.6 - 0.6);
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        for (let i = 0; i < steps; i++) {
          const t1 = i / steps, t2 = (i + 1) / steps;
          if (t2 < tail || t1 > head) continue;
          const pt = (t: number) => {
            const s = Math.sin(om) || 1;
            const w1 = Math.sin((1 - t) * om) / s, w2 = Math.sin(t * om) / s;
            const lift = 1 + Math.sin(Math.PI * t) * 0.18;
            return project([(va[0] * w1 + vb[0] * w2) * lift, (va[1] * w1 + vb[1] * w2) * lift, (va[2] * w1 + vb[2] * w2) * lift], ya, pi);
          };
          const p1 = pt(t1), p2 = pt(t2);
          if (p1.z < -0.05 && p2.z < -0.05) continue;
          ctx.strokeStyle = accent;
          ctx.globalAlpha = 0.25 + 0.75 * Math.sin(Math.PI * ((t1 - tail) / Math.max(0.01, head - tail)));
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });

      // pins
      const pulse = still ? 0.35 : ((now - t0) / 1400) % 1;
      cities.forEach((c) => {
        const p = project(toVec(c.lat, c.lon), ya, pi);
        if (p.z < 0) return;
        const on = c.id === active;
        ctx.fillStyle = accent;
        ctx.globalAlpha = (1 - pulse) * 0.5 * p.z;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + pulse * (on ? 18 : 9), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, on ? 5 : 3.2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#1c1c1e" : "#fff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, on ? 3.6 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.fill();
        if (on) {
          ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
          const w = ctx.measureText(c.name).width + 16;
          ctx.fillStyle = isDark ? "rgba(245,245,247,.92)" : "rgba(29,29,31,.9)";
          ctx.beginPath();
          ctx.roundRect(p.x - w / 2, p.y - 34, w, 22, 11);
          ctx.fill();
          ctx.fillStyle = isDark ? "#1d1d1f" : "#fff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(c.name, p.x, p.y - 23);
        }
      });
      if (!still) schedule();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
      if (visible) schedule();
    });
    io.observe(cv);
    const offYaw = yaw.on("change", schedule);
    const offPitch = pitch.on("change", schedule);
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    schedule();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      offYaw();
      offPitch();
    };
  }, [size, accent, cities, routes, active, yaw, pitch, still]);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      focus(cities[(k += 3) % cities.length]);
    }, 3200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className="flex flex-col items-center gap-4 [--dg-chip-ink:#1d1d1f] [--dg-chip:#ffffff] dark:[--dg-chip-ink:#f5f5f7] dark:[--dg-chip:#2c2c2e]">
      <canvas
        ref={canvas}
        role="img"
        aria-label={`Globe${active ? `, showing ${cities.find((c) => c.id === active)?.name}` : ""}. Drag to spin.`}
        className="cursor-grab touch-none [filter:drop-shadow(0_30px_40px_rgba(0,0,0,.12))] active:cursor-grabbing dark:[filter:drop-shadow(0_30px_40px_rgba(0,0,0,.6))]"
        style={{ width: size, height: size }}
        onPointerDown={(e) => {
          touched.current = true;
          ctl.current.forEach((x) => x.stop());
          spin.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, yaw: yaw.get(), pitch: pitch.get(), vx: 0, lt: performance.now(), lx: e.clientX };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const now = performance.now();
          d.vx = ((e.clientX - d.lx) * 0.4) / Math.max(0.008, (now - d.lt) / 1000);
          d.lx = e.clientX;
          d.lt = now;
          yaw.set(d.yaw + (e.clientX - d.x) * 0.4);
          pitch.set(Math.max(-60, Math.min(60, d.pitch + (e.clientY - d.y) * 0.3)));
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (d) ctl.current = [animate(yaw, [yaw.get()], { type: "inertia", velocity: d.vx, power: 0.6, timeConstant: 700 })];
        }}
      />
      <div className="flex max-w-[420px] flex-wrap justify-center gap-1.5">
        {cities.map((c) => (
          <motion.button
            key={c.id}
            type="button"
            aria-pressed={active === c.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => { touched.current = true; focus(c); }}
            style={{ backgroundColor: active === c.id ? accent : "var(--dg-chip)", color: active === c.id ? "#ffffff" : "var(--dg-chip-ink)" }}
            className="h-8 rounded-full px-3 text-[12px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,.08)] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:focus-visible:outline-[#0a84ff]"
          >
            {c.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

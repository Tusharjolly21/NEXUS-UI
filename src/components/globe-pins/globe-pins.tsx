"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type GlobePin = {
  id: string;
  country: string;
  city?: string;
  address?: string;
  phone?: string;
  lat: number;
  lon: number;
};

export type GlobeConnection = {
  from: string;
  to: string;
};

export type GlobePinsProps = {
  pins?: GlobePin[];
  connections?: GlobeConnection[];
  autoRotate?: boolean;
  rotationSpeed?: number;
  initialRotation?: number;
  dotColor?: string;
  dotSize?: number;
  dotOpacity?: number;
  dotDensity?: number;
  bloom?: boolean;
  pinColor?: string;
  pinSize?: number;
  showLabels?: boolean;
  labelBackground?: string;
  labelColor?: string;
  labelBorderColor?: string;
  fontFamily?: string;
  fontSize?: number;
  className?: string;
};

// ── Default data ──────────────────────────────────────────────────────────────

export const DEFAULT_PINS: GlobePin[] = [
  { id: "uk", country: "United Kingdom", city: "London", address: "Borton str. 88", phone: "+44 20 7946 0958", lat: 51.5, lon: -0.1 },
  { id: "us", country: "USA",           city: "Los Angeles", address: "Beverly Hills 55a", phone: "+1 213-555-0173", lat: 34.05, lon: -118.25 },
];

export const DEFAULT_CONNECTIONS: GlobeConnection[] = [{ from: "uk", to: "us" }];

// ── Geo data (cached) ─────────────────────────────────────────────────────────

type LonLat = readonly [number, number];

let _geoCache: LonLat[] | null = null;
let _geoLoading = false;
const _geoCbs: Array<(pts: LonLat[]) => void> = [];

function loadGeoData(cb: (pts: LonLat[]) => void) {
  if (_geoCache) { cb(_geoCache); return; }
  _geoCbs.push(cb);
  if (_geoLoading) return;
  _geoLoading = true;
  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
    .then((r) => r.json())
    .then((topo: Record<string, unknown>) => {
      const t = topo.transform as { scale: number[]; translate: number[] } | undefined;
      const sc = t?.scale ?? [1, 1];
      const tr = t?.translate ?? [0, 0];
      const pts: LonLat[] = [];
      for (const arc of topo.arcs as number[][][]) {
        let x = 0, y = 0;
        for (const delta of arc) {
          x += delta[0]; y += delta[1];
          pts.push([x * sc[0] + tr[0], y * sc[1] + tr[1]]);
        }
      }
      _geoCache = pts;
      _geoCbs.forEach((fn) => fn(pts));
      _geoCbs.length = 0;
    })
    .catch(() => { _geoLoading = false; _geoCbs.length = 0; });
}

// ── Projection ────────────────────────────────────────────────────────────────

type ScreenPt = { x: number; y: number; depth: number };

/**
 * 3D unit-sphere dot stored as pre-computed XZ components + latitude.
 * wx = cos(lat)*cos(lon), wy = sin(lat), wz = cos(lat)*sin(lon)
 * This lets us rotate cheaply per frame: z' = wz*cos(θ) - wx*sin(θ)
 */
type WorldDot = { wx: number; wy: number; wz: number };

function projectToWorld3D(lat: number, lon: number): { wx: number; wy: number; wz: number } {
  const φ = (lat * Math.PI) / 180;
  const λ = (lon * Math.PI) / 180;
  const cosP = Math.cos(φ);
  return {
    wx: cosP * Math.cos(λ),
    wy: Math.sin(φ),
    wz: cosP * Math.sin(λ),
  };
}

function project(lat: number, lon: number, rotDeg: number, cx: number, cy: number, r: number): ScreenPt | null {
  const dot = projectToWorld3D(lat, lon);
  const rot = ((rotDeg % 360) + 360) % 360;
  const rad = (rot * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);
  // Y-axis rotation of unit sphere
  const rx = dot.wx;
  const rz = dot.wz;
  const vx = rx * cosR + rz * sinR;   // rotated X (screen x')
  const vz = -rx * sinR + rz * cosR;   // rotated Z = depth (positive = front)
  if (vz <= 0.012) return null;
  return {
    x: cx + r * vx,
    y: cy - r * dot.wy,
    depth: vz,
  };
}

// ── Canvas render ─────────────────────────────────────────────────────────────

function drawRotated3D(
  dot: WorldDot, rotDeg: number, cx: number, cy: number, r: number
): { x: number; y: number; depth: number } | null {
  const rot = ((rotDeg % 360) + 360) % 360;
  const rad = (rot * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);
  // Y-axis rotation
  const vx = dot.wx * cosR + dot.wz * sinR;
  const vz = -dot.wx * sinR + dot.wz * cosR;
  if (vz <= 0.012) return null;
  return { x: cx + r * vx, y: cy - r * dot.wy, depth: dot.wy * 1.3 + 0.08 };
}

function draw(ctx: CanvasRenderingContext2D, size: number, o: DrawOpts) {
  const { geo, pins, connections, pinMap, rot, cx, cy, r, bloomGrid } = o;
  const bloom = o.bloom;
  const dc = bloom ? "#22d3ee" : o.dotColor;
  const pc = o.pinColor;

  ctx.clearRect(0, 0, size, size);

  // ── Country dots ────────────────────────────────────────────────────────────
  ctx.fillStyle = dc;
  for (let i = 0; i < geo.length; i++) {
    const pt = drawRotated3D(geo[i], rot, cx, cy, r);
    if (!pt) continue;
    ctx.globalAlpha = Math.min(o.dotOpacity, o.dotOpacity * pt.depth);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, o.dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Bloom grid (no shadow — just fill for perf) ───────────────────────────
  if (bloom && bloomGrid.length > 0) {
    ctx.fillStyle = "#22d3ee";
    for (let i = 0; i < bloomGrid.length; i++) {
      const pt = drawRotated3D(bloomGrid[i], rot, cx, cy, r);
      if (!pt) continue;
      ctx.globalAlpha = 0.07 * pt.depth;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;

  // ── Arcs ──────────────────────────────────────────────────────────────────
  for (const conn of connections) {
    const a = pinMap[conn.from], b = pinMap[conn.to];
    if (!a || !b) continue;
    const pa = project(a.lat, a.lon, rot, cx, cy, r);
    const pb = project(b.lat, b.lon, rot, cx, cy, r);
    if (!pa || !pb) continue;
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2 - Math.hypot(pb.x - pa.x, pb.y - pa.y) * 0.38;
    ctx.strokeStyle = bloom ? pc : "rgba(255,255,255,0.72)";
    ctx.lineWidth = bloom ? 1.5 : 1;
    if (bloom) { ctx.shadowBlur = 16; ctx.shadowColor = pc; }
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.quadraticCurveTo(mx, my, pb.x, pb.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ── Pins ───────────────────────────────────────────────────────────────────
  for (const pin of pins) {
    const pt = project(pin.lat, pin.lon, rot, cx, cy, r);
    if (!pt) continue;
    if (bloom) { ctx.shadowBlur = 30; ctx.shadowColor = pc; }
    ctx.globalAlpha = 1;
    ctx.fillStyle = pc;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, o.pinSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

interface DrawOpts {
  geo: WorldDot[];
  pins: GlobePin[];
  connections: GlobeConnection[];
  pinMap: Record<string, GlobePin>;
  rot: number;
  cx: number; cy: number; r: number;
  dotColor: string;
  dotSize: number;
  dotOpacity: number;
  bloom: boolean;
  pinColor: string;
  pinSize: number;
  bloomGrid: WorldDot[];
}

// ── Main component ────────────────────────────────────────────────────────────

export function GlobePins({
  pins = DEFAULT_PINS,
  connections = DEFAULT_CONNECTIONS,
  autoRotate = true,
  rotationSpeed = 60,
  initialRotation = 300,
  dotColor = "rgba(255,255,255,0.88)",
  dotSize = 0.85,
  dotOpacity = 0.72,
  dotDensity = 1,
  bloom = false,
  pinColor = "#38BDF8",
  pinSize = 11,
  showLabels = true,
  labelBackground = "rgba(16,16,20,0.88)",
  labelColor = "#ffffff",
  labelBorderColor = "rgba(255,255,255,0.1)",
  fontFamily = "'Courier New', Courier, monospace",
  fontSize = 13,
  className,
}: GlobePinsProps) {

  const wrapRef   = React.useRef<HTMLDivElement>(null);
  const canvRef   = React.useRef<HTMLCanvasElement>(null);
  const lblRefs   = React.useRef<Record<string, HTMLDivElement | null>>({});
  const rotRef    = React.useRef(initialRotation);
  const [geoReady, setGeoReady] = React.useState(false);
  const geoRef = React.useRef<LonLat[]>([]);

  const [size, setSize] = React.useState(0);
  const [labelsReady, setLabelsReady] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);
  const forceActive = className?.includes("preview-force-active");

  // Memoize static data
  const pinMap = React.useMemo(() => Object.fromEntries(pins.map((p) => [p.id, p])), [pins]);
  const pinsRef = React.useRef(pins);
  const connectionsRef = React.useRef(connections);
  pinsRef.current = pins;
  connectionsRef.current = connections;

  // Clamp size to max 560px
  const clampedSize = Math.min(size, 560);

  // ── Pre-compute world-space geo dots (3D unit sphere, once per size change)
  const geoWorldDots = React.useMemo(() => {
    if (clampedSize === 0 || !geoReady) return [];
    const r = clampedSize * 0.44;
    const pts: WorldDot[] = [];
    // Step of 2 halves ~6000 points while looking visually dense at 560px
    for (let i = 0; i < geoRef.current.length; i += 2) {
      const lon = geoRef.current[i][0];
      const lat = geoRef.current[i][1];
      const dot = projectToWorld3D(lat, lon);
      // Discard points too close to poles (wy close to ±1) since they project poorly
      if (dot.wy > 0.98 || dot.wy < -0.98) continue;
      pts.push(dot);
    }
    return pts;
  }, [clampedSize, geoReady]);

  // ── Pre-compute bloom grid world-space points ───────────────────────────────
  const bloomGridDots = React.useMemo(() => {
    if (clampedSize === 0 || !geoReady) return [];
    const pts: WorldDot[] = [];
    for (let lat = -80; lat <= 80; lat += 10) {
      for (let lon = -180; lon < 180; lon += 8) {
        pts.push(projectToWorld3D(lat, lon));
      }
    }
    return pts;
  }, [clampedSize, geoReady]);

  // ── Resize observer — clamp to max 560px ──────────────────────────────────
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.min(e.contentRect.width, 560);
      setSize(w > 0 ? w : e.contentRect.width);
    });
    ro.observe(el);
    const initialW = Math.min(el.offsetWidth, 560);
    if (initialW > 0) setSize(initialW);
    return () => ro.disconnect();
  }, []);

  // ── Geo data load ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    loadGeoData((pts) => {
      geoRef.current = pts;
      setGeoReady(true);
    });
  }, []);

  // ── Labels ready ───────────────────────────────────────────────────────────
  React.useEffect(() => { setLabelsReady(true); }, []);

  // ── Intersection Observer ─────────────────────────────────────────────────
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { setIsActive(entry.isIntersecting); },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── RAF render loop — capped at 30fps, only when active ───────────────────
  React.useEffect(() => {
    const canvas = canvRef.current;
    if (!canvas || clampedSize === 0) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 1.5);
    canvas.width  = clampedSize * dpr;
    canvas.height = clampedSize * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const dps = 360 / rotationSpeed;
    let last = 0;
    let raf = 0;
    let cancelled = false;
    let tabVisible = true;
    let frameCount = 0;

    const cx = clampedSize / 2;
    const cy = clampedSize / 2;
    const r  = clampedSize * 0.44;

    function frame(now: number) {
      if (cancelled) return;
      if (!tabVisible || (!isActive && !forceActive)) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const dt = last ? (now - last) / 1000 : 0;
      last = now;

      // Cap at ~30fps — always update rotation for smooth labels, draw every other frame
      frameCount++;
      if (frameCount % 2 !== 0) {
        // Still update rotation but skip draw
        if (autoRotate) {
          const safeDt = Math.min(dt * 2, 0.05);
          rotRef.current = (rotRef.current + dps * safeDt) % 360;
        }
        raf = requestAnimationFrame(frame);
        return;
      }

      if (autoRotate) {
        const safeDt = Math.min(dt * 2, 0.05);
        rotRef.current = (rotRef.current + dps * safeDt) % 360;
      }

      const rot = rotRef.current;

      draw(ctx, clampedSize, {
        geo: geoReady ? geoWorldDots : [],
        pins: pinsRef.current,
        connections: connectionsRef.current,
        pinMap,
        rot, cx, cy, r,
        dotColor, dotSize, dotOpacity,
        bloom, pinColor, pinSize,
        bloomGrid: bloom && geoReady ? bloomGridDots : [],
      });

      // Update labels imperatively
      for (const pin of pinsRef.current) {
        const el = lblRefs.current[pin.id];
        if (!el) continue;
        const pt = project(pin.lat, pin.lon, rot, cx, cy, r);
        if (pt) {
          el.style.display  = "block";
          el.style.left     = `${pt.x}px`;
          el.style.top      = `${pt.y - pinSize - 10}px`;
        } else {
          el.style.display  = "none";
        }
      }

      raf = requestAnimationFrame(frame);
    }

    const onVisibility = () => { tabVisible = document.visibilityState === "visible"; };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
    };
  }, [
    clampedSize, labelsReady, autoRotate, rotationSpeed,
    dotColor, dotSize, dotOpacity,
    bloom, pinColor, pinSize,
    pinMap, geoReady, geoWorldDots, bloomGridDots,
    isActive, forceActive,
  ]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full aspect-square", className)}
      style={{ maxWidth: 560, maxHeight: 560 }}
      aria-label="Animated globe with location pins"
    >
      {!geoReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
      <canvas
        ref={canvRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: clampedSize,
          height: clampedSize,
          display: geoReady ? "block" : "none",
        }}
      />
      {showLabels && pins.map((pin) => (
        <div
          key={pin.id}
          ref={(el) => { lblRefs.current[pin.id] = el; }}
          style={{
            position: "absolute",
            display: "none",
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: labelBackground,
              border: `1px solid ${labelBorderColor}`,
              borderRadius: 8,
              padding: "10px 14px",
              color: labelColor,
              fontFamily,
              fontSize,
              lineHeight: 1.65,
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 1 }}>{pin.country}</div>
            {pin.city    && <div>{pin.city}</div>}
            {pin.address && <div>{pin.address}</div>}
            {pin.phone   && <div>{pin.phone}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
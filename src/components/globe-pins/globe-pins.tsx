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
  // Rotation
  autoRotate?: boolean;
  /** Seconds for one full 360° rotation */
  rotationSpeed?: number;
  /** Initial globe rotation in degrees (longitude at center) */
  initialRotation?: number;
  // Country dot styling
  dotColor?: string;
  dotSize?: number;
  dotOpacity?: number;
  /** 0–1 fraction of geo points rendered (lower = sparser) */
  dotDensity?: number;
  // Bloom / glow effect
  bloom?: boolean;
  // Pins
  pinColor?: string;
  /** Pin circle radius in px */
  pinSize?: number;
  // Labels
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
  {
    id: "uk",
    country: "United Kingdom",
    city: "London",
    address: "Borton str. 88",
    phone: "+44 20 7946 0958",
    lat: 51.5,
    lon: -0.1,
  },
  {
    id: "us",
    country: "USA",
    city: "Los Angeles",
    address: "Beverly Hills 55a",
    phone: "+1 213-555-0173",
    lat: 34.05,
    lon: -118.25,
  },
];

export const DEFAULT_CONNECTIONS: GlobeConnection[] = [{ from: "uk", to: "us" }];

// ── Geo data ──────────────────────────────────────────────────────────────────

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
      const transform = topo.transform as { scale: number[]; translate: number[] } | undefined;
      const scale = transform?.scale ?? [1, 1];
      const translate = transform?.translate ?? [0, 0];

      const pts: LonLat[] = [];
      for (const arc of topo.arcs as number[][][]) {
        let x = 0, y = 0;
        for (const delta of arc) {
          x += delta[0]; y += delta[1];
          pts.push([x * scale[0] + translate[0], y * scale[1] + translate[1]]);
        }
      }
      _geoCache = pts;
      _geoCbs.forEach((fn) => fn(pts));
      _geoCbs.length = 0;
    })
    .catch(() => {
      _geoLoading = false;
      _geoCbs.length = 0;
    });
}

// ── Orthographic projection ───────────────────────────────────────────────────

type ScreenPt = { x: number; y: number; depth: number };

function project(
  lat: number,
  lon: number,
  rotDeg: number,
  cx: number,
  cy: number,
  r: number
): ScreenPt | null {
  const φ = (lat * Math.PI) / 180;
  // Effective longitude after globe rotation (normalise to –180…+180)
  const λ = ((((lon - rotDeg) % 360) + 540) % 360 - 180) * (Math.PI / 180);
  const depth = Math.cos(φ) * Math.cos(λ);
  if (depth <= 0.012) return null;
  return {
    x: cx + r * Math.cos(φ) * Math.sin(λ),
    y: cy - r * Math.sin(φ),
    depth,
  };
}

// ── Canvas render ─────────────────────────────────────────────────────────────

interface DrawOpts {
  geo: LonLat[];
  pins: GlobePin[];
  connections: GlobeConnection[];
  pinMap: Record<string, GlobePin>;
  rot: number;
  cx: number; cy: number; r: number;
  dotColor: string;
  dotSize: number;
  dotOpacity: number;
  dotDensity: number;
  bloom: boolean;
  pinColor: string;
  pinSize: number;
}

function draw(ctx: CanvasRenderingContext2D, size: number, o: DrawOpts) {
  const { geo, pins, connections, pinMap, rot, cx, cy, r } = o;
  const bloom = o.bloom;
  const dc = bloom ? "#22d3ee" : o.dotColor;
  const pc = o.pinColor;

  ctx.clearRect(0, 0, size, size);

  // ── Country dots ────────────────────────────────────────────────────────────
  const step = Math.max(1, Math.round(1 / Math.max(0.02, o.dotDensity)));

  if (bloom) { ctx.shadowBlur = 5; ctx.shadowColor = "#22d3ee"; }

  ctx.fillStyle = dc;
  for (let i = 0; i < geo.length; i += step) {
    const pt = project(geo[i][1], geo[i][0], rot, cx, cy, r);
    if (!pt) continue;
    ctx.globalAlpha = Math.min(o.dotOpacity, o.dotOpacity * (pt.depth * 1.3 + 0.08));
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, o.dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Bloom lat/lon grid overlay ───────────────────────────────────────────────
  if (bloom) {
    ctx.shadowBlur = 3;
    ctx.shadowColor = "#22d3ee";
    ctx.fillStyle = "#22d3ee";
    for (let lat = -80; lat <= 80; lat += 5) {
      for (let lon = -180; lon < 180; lon += 4) {
        const pt = project(lat, lon, rot, cx, cy, r);
        if (!pt) continue;
        ctx.globalAlpha = 0.07 * pt.depth;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // ── Arcs ─────────────────────────────────────────────────────────────────────
  for (const conn of connections) {
    const a = pinMap[conn.from];
    const b = pinMap[conn.to];
    if (!a || !b) continue;
    const pa = project(a.lat, a.lon, rot, cx, cy, r);
    const pb = project(b.lat, b.lon, rot, cx, cy, r);
    if (!pa || !pb) continue;

    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const lift = Math.hypot(pb.x - pa.x, pb.y - pa.y) * 0.38;

    if (bloom) { ctx.shadowBlur = 16; ctx.shadowColor = pc; }
    ctx.strokeStyle = bloom ? pc : "rgba(255,255,255,0.72)";
    ctx.lineWidth = bloom ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.quadraticCurveTo(mx, my - lift, pb.x, pb.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ── Pins ──────────────────────────────────────────────────────────────────────
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

// ── Main component ────────────────────────────────────────────────────────────

export function GlobePins({
  pins = DEFAULT_PINS,
  connections = DEFAULT_CONNECTIONS,
  autoRotate = true,
  rotationSpeed = 60,
  initialRotation = 300, // Atlantic-centred — shows both default pins
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
  const geoRef    = React.useRef<LonLat[]>([]);
  const geoReady  = React.useRef(false);

  const [size, setSize] = React.useState(0);
  const [labelsReady, setLabelsReady] = React.useState(false);

  const pinMap = React.useMemo(
    () => Object.fromEntries(pins.map((p) => [p.id, p])),
    [pins],
  );

  // ── Resize ──────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize(e.contentRect.width));
    ro.observe(el);
    setSize(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // ── Geo data ─────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    loadGeoData((pts) => {
      geoRef.current = pts;
      geoReady.current = true;
    });
  }, []);

  // ── Label DOM is ready once pins mount ────────────────────────────────────────
  React.useEffect(() => { setLabelsReady(true); }, []);

  // ── RAF render loop ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    const canvas = canvRef.current;
    if (!canvas || size === 0) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const dps = 360 / rotationSpeed;
    let last = 0;
    let raf  = 0;
    let cancelled = false;

    const cx = size / 2;
    const cy = size / 2;
    const r  = size * 0.44;

    function frame(now: number) {
      if (cancelled) return;
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      if (autoRotate) rotRef.current = (rotRef.current + dps * dt) % 360;

      const rot = rotRef.current;

      draw(ctx, size, {
        geo: geoRef.current,
        pins, connections, pinMap, rot, cx, cy, r,
        dotColor, dotSize, dotOpacity, dotDensity,
        bloom, pinColor, pinSize,
      });

      // Imperatively update label positions (no React re-render)
      for (const pin of pins) {
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

    raf = requestAnimationFrame(frame);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [
    size, labelsReady,
    autoRotate, rotationSpeed,
    dotColor, dotSize, dotOpacity, dotDensity,
    bloom, pinColor, pinSize,
    pins, connections, pinMap,
  ]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full aspect-square", className)}
      aria-label="Animated globe with location pins"
    >
      <canvas
        ref={canvRef}
        aria-hidden
        style={{ position: "absolute", inset: 0, width: size, height: size }}
      />

      {/* Label cards — rendered once, positioned each frame via imperative DOM */}
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

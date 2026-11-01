"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import { CURRENCIES } from "./data";
import type { Currency } from "./data";
import { LAND_POINTS } from "./globe-data";

export const DEG = Math.PI / 180;

type Vec3 = [number, number, number];

// [screen x, screen y, depth (positive faces the viewer), squared distance from the globe centre in unit radii]
type ProjectedPoint = [number, number, number, number];

export type GlobeTone = "ink" | "accent";

type GlobePalette = {
  dot: string;
  dotAlpha: number;
  sphereIn: string;
  sphereOut: string;
  rim: string;
  rimGlow: number;
  shadow: string;
  accent: string;
  ambient: string;
  label: string;
  halo: string;
  amber: string;
};

export const toUnitVector = (lat: number, lng: number): Vec3 => [
  Math.cos(lat * DEG) * Math.sin(lng * DEG),
  Math.sin(lat * DEG),
  Math.cos(lat * DEG) * Math.cos(lng * DEG),
];

export let landCache: Float32Array | null = null;

export function getLandPoints(): Float32Array {
  if (landCache) return landCache;
  const binary = atob(LAND_POINTS),
    count = binary.length / 4,
    points = new Float32Array(count * 3),
    readInt16 = (offset: number) => ((binary.charCodeAt(offset) | (binary.charCodeAt(offset + 1) << 8)) << 16) >> 16;
  for (let index = 0; index < count; index++) {
    const unit = toUnitVector(readInt16(index * 4) / 100, readInt16(index * 4 + 2) / 100);
    points.set(unit, index * 3);
  }
  return ((landCache = points), points);
}

export function arcPoint(from: Vec3, to: Vec3, progress: number, height: number): Vec3 {
  const cosAngle = Math.min(1, Math.max(-1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2])),
    angle = Math.acos(cosAngle),
    sinAngle = Math.sin(angle) || 1e-6,
    weightFrom = Math.sin((1 - progress) * angle) / sinAngle,
    weightTo = Math.sin(progress * angle) / sinAngle,
    lift = 1 + height * Math.sin(Math.PI * progress);
  return [
    (from[0] * weightFrom + to[0] * weightTo) * lift,
    (from[1] * weightFrom + to[1] * weightTo) * lift,
    (from[2] * weightFrom + to[2] * weightTo) * lift,
  ];
}

export const globePalette = (tone: GlobeTone): GlobePalette => {
  const isDark = document.documentElement.classList.contains("dark");
  return tone === "accent"
    ? isDark
      ? {
          dot: "91,139,255",
          dotAlpha: 0.95,
          sphereIn: "#0a1430",
          sphereOut: "#000000",
          rim: "rgba(91,139,255,.75)",
          rimGlow: 28,
          shadow: "rgba(39,103,255,0)",
          accent: "91,139,255",
          ambient: "141,176,255",
          label: "#ffffff",
          halo: "rgba(0,0,0,.85)",
          amber: "255,190,80",
        }
      : {
          dot: "39,103,255",
          dotAlpha: 0.8,
          sphereIn: "#ffffff",
          sphereOut: "#dbe6ff",
          rim: "rgba(39,103,255,.35)",
          rimGlow: 0,
          shadow: "rgba(39,103,255,.10)",
          accent: "29,84,216",
          ambient: "39,103,255",
          label: "#0a0a0a",
          halo: "rgba(255,255,255,.92)",
          amber: "200,120,10",
        }
    : isDark
      ? {
          dot: "235,235,240",
          dotAlpha: 0.62,
          sphereIn: "#1b1c22",
          sphereOut: "#050506",
          rim: "rgba(255,255,255,.12)",
          rimGlow: 0,
          shadow: "rgba(39,103,255,.10)",
          accent: "91,139,255",
          ambient: "255,255,255",
          label: "#ffffff",
          halo: "rgba(0,0,0,.85)",
          amber: "255,179,64",
        }
      : {
          dot: "10,10,10",
          dotAlpha: 0.5,
          sphereIn: "#ffffff",
          sphereOut: "#e7e9ef",
          rim: "rgba(0,0,0,.07)",
          rimGlow: 0,
          shadow: "rgba(0,0,0,.10)",
          accent: "39,103,255",
          ambient: "10,10,10",
          label: "#0a0a0a",
          halo: "rgba(255,255,255,.92)",
          amber: "232,128,10",
        };
};

export const HERO_ROUTES: [string, string][] = [
  ["GBP", "INR"],
  ["SGD", "AUD"],
  ["BRL", "NGN"],
  ["AED", "SGD"],
  ["CAD", "GBP"],
  ["JPY", "SGD"],
  ["MXN", "USD"],
];

type Drag = {
  x: number;
  y: number;
  t: number;
  vx: number;
  vy: number;
};

type GlobeRoute = {
  a: Vec3;
  b: Vec3;
  from: Currency;
  to: Currency;
};

type GlobeState = {
  phi: number;
  theta: number;
  vphi: number;
  vtheta: number;
  target: { phi: number; theta: number };
  focus: boolean;
  drag: Drag | null;
  draw: number;
  packet: number;
  pulse: number;
  route: GlobeRoute;
  label: string;
  arrive: (() => void) | undefined;
};

export type GlobeProps = {
  from: Currency;
  to: Currency;
  launch?: number;
  label?: string;
  onArrive?: () => void;
  frameX?: number;
  frameY?: number;
  tone?: GlobeTone;
  className?: string;
};

export function Globe({
  from,
  to,
  launch,
  label,
  onArrive,
  frameX = 0.22,
  frameY = 0.24,
  tone = "ink",
  className = "",
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null),
    stateRef = useRef<GlobeState>({
      phi: -(from.lng + to.lng) * 0.5 * DEG,
      theta: 0.42,
      vphi: 0,
      vtheta: 0,
      target: {
        phi: 0,
        theta: 0.42,
      },
      focus: true,
      drag: null,
      draw: 0,
      packet: -1,
      pulse: -1,
      route: {
        a: toUnitVector(from.lat, from.lng),
        b: toUnitVector(to.lat, to.lng),
        from,
        to,
      },
      label: label ?? "",
      arrive: onArrive,
    });
  stateRef.current.label = label ?? "";
  stateRef.current.arrive = onArrive;
  useEffect(() => {
    const state = stateRef.current,
      fromVec = toUnitVector(from.lat, from.lng),
      toVec = toUnitVector(to.lat, to.lng),
      mid = arcPoint(fromVec, toVec, 0.5, 0),
      midLat = Math.asin(Math.max(-1, Math.min(1, mid[1] / Math.hypot(...mid)))) / DEG,
      midLng = Math.atan2(mid[0], mid[2]) / DEG;
    state.route = {
      a: fromVec,
      b: toVec,
      from,
      to,
    };
    state.target = {
      phi: Math.asin(frameX) - midLng * DEG,
      theta: Math.max(-0.35, Math.min(0.95, midLat * DEG - Math.asin(frameY))),
    };
    state.focus = true;
    state.draw = 0;
    state.packet = -1;
  }, [from, to, frameX, frameY]);
  const isFirstLaunch = useRef(true);
  useEffect(() => {
    if (isFirstLaunch.current) {
      isFirstLaunch.current = false;
      return;
    }
    const state = stateRef.current;
    state.focus = true;
    state.draw = Math.max(state.draw, 0.999);
    state.packet = 0;
  }, [launch]);
  useEffect(() => {
    const canvas = canvasRef.current!,
      ctx = canvas.getContext("2d")!,
      land = getLandPoints(),
      landCount = land.length / 3,
      reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let palette = globePalette(tone);
    const themeObserver = new MutationObserver(() => (palette = globePalette(tone)));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    let width = 0,
      height = 0,
      dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    let inView = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), {
      threshold: 0,
    });
    visibilityObserver.observe(canvas);
    const ambientRoutes = HERO_ROUTES.map(([fromCode, toCode], index) => {
      const fromCurrency = CURRENCIES.find((currency) => currency.code === fromCode)!,
        toCurrency = CURRENCIES.find((currency) => currency.code === toCode)!;
      return {
        a: toUnitVector(fromCurrency.lat, fromCurrency.lng),
        b: toUnitVector(toCurrency.lat, toCurrency.lng),
        t: (index * 0.37) % 1,
        speed: 0.16 + (index % 3) * 0.04,
      };
    });
    let frameId = 0,
      lastTime = performance.now();
    const frame = (now: number) => {
      frameId = requestAnimationFrame(frame);
      if (!inView || document.hidden) {
        lastTime = now;
        return;
      }
      const dt = Math.min(0.05, (now - lastTime) / 1e3);
      lastTime = now;
      const state = stateRef.current;
      if (!state.drag) {
        if (state.focus && Math.abs(state.vphi) < 0.25) {
          const sway = reduceMotion ? 0 : Math.sin(now / 5200) * 0.06;
          let phiError = state.target.phi + sway - state.phi;
          phiError = ((((phiError + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
          const stiffness = 9;
          state.vphi += (stiffness * phiError - 2 * Math.sqrt(stiffness) * 0.95 * state.vphi) * dt;
          state.vtheta +=
            (stiffness * (state.target.theta - state.theta) - 2 * Math.sqrt(stiffness) * 0.95 * state.vtheta) * dt;
        } else {
          state.vphi *= Math.exp(-dt * 1.6);
          state.vtheta *= Math.exp(-dt * 4);
          if (Math.abs(state.vphi) < 0.25) state.focus = true;
        }
        state.phi += state.vphi * dt;
        state.theta = Math.max(-0.4, Math.min(1, state.theta + state.vtheta * dt));
      }
      state.draw = Math.min(1, state.draw + dt / (reduceMotion ? 0.2 : 0.9));
      if (state.packet >= 0) {
        state.packet += dt / (reduceMotion ? 0.5 : 1.8);
        if (state.packet >= 1) {
          state.packet = -1;
          state.pulse = 0;
          state.arrive?.call(state);
        }
      }
      if (state.pulse >= 0) {
        state.pulse += dt / 1.1;
        if (state.pulse >= 1) state.pulse = -1;
      }
      const cosPhi = Math.cos(state.phi),
        sinPhi = Math.sin(state.phi),
        cosTheta = Math.cos(state.theta),
        sinTheta = Math.sin(state.theta),
        radius = Math.min(width, height) * 0.44,
        centerX = width / 2,
        centerY = height / 2,
        project = (x: number, y: number, z: number): ProjectedPoint => {
          const screenX = x * cosPhi + z * sinPhi,
            rotatedZ = -x * sinPhi + z * cosPhi,
            screenY = y * cosTheta - rotatedZ * sinTheta,
            depth = y * sinTheta + rotatedZ * cosTheta;
          return [centerX + screenX * radius, centerY - screenY * radius, depth, screenX * screenX + screenY * screenY];
        };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const sphereGradient = ctx.createRadialGradient(
        centerX - radius * 0.35,
        centerY - radius * 0.4,
        radius * 0.1,
        centerX,
        centerY,
        radius,
      );
      sphereGradient.addColorStop(0, palette.sphereIn);
      sphereGradient.addColorStop(1, palette.sphereOut);
      ctx.fillStyle = palette.shadow;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + radius * 1.06, radius * 0.72, radius * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = sphereGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.rim;
      ctx.lineWidth = palette.rimGlow ? 1.5 : 1;
      if (palette.rimGlow) {
        ctx.shadowColor = palette.rim;
        ctx.shadowBlur = palette.rimGlow;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      // land dots bucketed by depth so nearer dots draw larger and brighter
      const depthBuckets: number[][] = [[], [], [], [], [], []];
      for (let index = 0; index < landCount; index++) {
        const [screenX, screenY, depth] = project(land[index * 3], land[index * 3 + 1], land[index * 3 + 2]);
        if (depth <= 0.02) continue;
        depthBuckets[Math.min(5, Math.floor(depth * 6))].push(screenX, screenY, depth);
      }
      const baseDotRadius = Math.max(0.7, radius / 260);
      depthBuckets.forEach((bucket, bucketIndex) => {
        if (bucket.length) {
          ctx.fillStyle = `rgba(${palette.dot},${palette.dotAlpha * (0.28 + (bucketIndex / 5) * 0.72)})`;
          ctx.beginPath();
          for (let index = 0; index < bucket.length; index += 3) {
            const dotRadius = baseDotRadius * (0.75 + bucket[index + 2] * 0.55);
            ctx.moveTo(bucket[index] + dotRadius, bucket[index + 1]);
            ctx.arc(bucket[index], bucket[index + 1], dotRadius, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      });
      const isVisible = (point: ProjectedPoint) => point[2] > 0 || point[3] > 1,
        strokeArc = (
          fromVec: Vec3,
          toVec: Vec3,
          fraction: number,
          arcHeight: number,
          color: string,
          lineWidth: number,
        ) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "round";
          ctx.beginPath();
          let penDown = false;
          const segments = 64;
          for (let step = 0; step <= segments * fraction; step++) {
            const arc = arcPoint(fromVec, toVec, step / segments, arcHeight),
              projected = project(arc[0], arc[1], arc[2]);
            if (!isVisible(projected)) {
              penDown = false;
              continue;
            }
            if (penDown) ctx.lineTo(projected[0], projected[1]);
            else ctx.moveTo(projected[0], projected[1]);
            penDown = true;
          }
          ctx.stroke();
        };
      if (!reduceMotion) {
        for (const ambient of ambientRoutes) {
          ambient.t = (ambient.t + dt * ambient.speed) % 1.25;
          strokeArc(ambient.a, ambient.b, 1, 0.16, `rgba(${palette.ambient},.10)`, 1);
          if (ambient.t <= 1) {
            const arc = arcPoint(ambient.a, ambient.b, ambient.t, 0.16),
              projected = project(arc[0], arc[1], arc[2]);
            if (isVisible(projected)) {
              ctx.fillStyle = `rgba(${palette.amber},.85)`;
              ctx.beginPath();
              ctx.arc(projected[0], projected[1], 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      const { a: routeA, b: routeB, from: routeFrom, to: routeTo } = state.route,
        arcHeight =
          0.14 +
          0.22 *
            (Math.acos(
              Math.max(-1, Math.min(1, routeA[0] * routeB[0] + routeA[1] * routeB[1] + routeA[2] * routeB[2])),
            ) /
              Math.PI),
        drawProgress = 1 - Math.pow(1 - state.draw, 3);
      strokeArc(routeA, routeB, drawProgress, arcHeight, `rgba(${palette.accent},.9)`, 2);
      const drawEndpoint = (unit: Vec3, city: string, isDestination: boolean) => {
        const point = project(unit[0], unit[1], unit[2]);
        if (point[2] <= 0) return;
        ctx.fillStyle = `rgba(${palette.accent},1)`;
        ctx.beginPath();
        ctx.arc(point[0], point[1], isDestination ? 4 : 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${palette.accent},.35)`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(point[0], point[1], 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "500 12px Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 4;
        ctx.strokeStyle = palette.halo;
        ctx.strokeText(city, point[0], point[1] - 14);
        ctx.fillStyle = palette.label;
        ctx.fillText(city, point[0], point[1] - 14);
      };
      drawEndpoint(routeA, routeFrom.city, false);
      drawEndpoint(routeB, routeTo.city, true);
      if (state.packet >= 0) {
        const eased =
          state.packet < 0.5 ? 2 * state.packet * state.packet : 1 - Math.pow(-2 * state.packet + 2, 2) / 2;
        for (let trail = 8; trail >= 0; trail--) {
          const progress = Math.max(0, eased - trail * 0.012),
            arc = arcPoint(routeA, routeB, progress, arcHeight),
            projected = project(arc[0], arc[1], arc[2]);
          if (isVisible(projected)) {
            ctx.fillStyle = `rgba(${palette.accent},${trail === 0 ? 1 : 0.5 * (1 - trail / 9)})`;
            ctx.beginPath();
            ctx.arc(projected[0], projected[1], trail === 0 ? 5 : 4 * (1 - trail / 10), 0, Math.PI * 2);
            ctx.fill();
            if (trail === 0 && state.label) {
              ctx.font = "500 12px Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
              const pillWidth = ctx.measureText(state.label).width + 16,
                pillX = projected[0] + 10,
                pillY = projected[1] - 30;
              ctx.fillStyle = `rgba(${palette.accent},1)`;
              ctx.beginPath();
              ctx.roundRect(pillX, pillY, pillWidth, 22, 11);
              ctx.fill();
              ctx.fillStyle = "#fff";
              ctx.textAlign = "left";
              ctx.fillText(state.label, pillX + 8, pillY + 15);
            }
          }
        }
      }
      if (state.pulse >= 0) {
        const point = project(routeB[0], routeB[1], routeB[2]);
        if (point[2] > 0) {
          ctx.strokeStyle = `rgba(${palette.accent},${1 - state.pulse})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(point[0], point[1], 6 + state.pulse * 30, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };
    frameId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);
  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const state = stateRef.current;
      event.currentTarget.setPointerCapture(event.pointerId);
      state.drag = {
        x: event.clientX,
        y: event.clientY,
        t: performance.now(),
        vx: 0,
        vy: 0,
      };
      state.focus = false;
    },
    handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const state = stateRef.current,
        drag = state.drag;
      if (!drag) return;
      const now = performance.now(),
        dx = event.clientX - drag.x,
        dy = event.clientY - drag.y,
        elapsed = Math.max(1, now - drag.t) / 1e3,
        radians = 1 / Math.max(140, (canvasRef.current?.clientWidth ?? 400) * 0.44);
      state.phi += dx * radians;
      state.theta = Math.max(-0.4, Math.min(1, state.theta + dy * radians));
      drag.vx = drag.vx * 0.6 + ((dx * radians) / elapsed) * 0.4;
      drag.vy = drag.vy * 0.6 + ((dy * radians) / elapsed) * 0.4;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.t = now;
    },
    handlePointerUp = () => {
      const state = stateRef.current,
        drag = state.drag;
      if (!drag) return;
      state.drag = null;
      const flung = performance.now() - drag.t < 80;
      state.vphi = flung ? Math.max(-9, Math.min(9, drag.vx)) : 0;
      state.vtheta = flung ? Math.max(-3, Math.min(3, drag.vy)) * 0.5 : 0;
      state.focus = Math.abs(state.vphi) < 0.25;
    };
  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Globe showing a payment route from ${from.city} to ${to.city}. Drag to spin it.`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`block h-full w-full cursor-grab touch-pan-y active:cursor-grabbing ${className}`}
    />
  );
}

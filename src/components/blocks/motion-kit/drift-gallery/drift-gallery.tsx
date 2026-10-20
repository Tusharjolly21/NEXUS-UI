"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export interface DriftGalleryWork {
  title: string;
  by: string;
  year: string;
  /**
   * Image URL, cover-cropped to 4:5 on the wall (load it from your own origin or one that sends CORS
   * headers). Without it, a poster is drawn locally from `palette` and `pattern`.
   */
  src?: string;
  /** Generated poster only: [shape colour, paper, ink]. */
  palette?: [string, string, string];
  /** Generated poster only: which of the ten designs to draw (0–9). */
  pattern?: number;
}

export interface DriftGalleryProps {
  /** Pieces on the wall. They repeat to fill the 8 × 6 grid of sheets. */
  works?: DriftGalleryWork[];
  eyebrow?: string;
  title?: string;
  /** Pill in the corner while the pointer is in use. */
  hint?: string;
  /** Pill in the corner while the wall has keyboard focus. */
  keyboardHint?: string;
  /** Button that closes an open piece. */
  closeLabel?: string;
  /** Slow idle drift whenever nobody is dragging. Off under reduced motion. */
  autoplay?: boolean;
  /** Called when a piece is opened, with the work and its index in `works`. */
  onOpen?: (work: DriftGalleryWork, index: number) => void;
  className?: string;
}

const PALETTES: [string, string, string][] = [
  ["#ff6b4a", "#ffd6a5", "#1d1d1f"],
  ["#0071e3", "#a1e3ff", "#ffffff"],
  ["#30d158", "#e8ffe9", "#0b3d1a"],
  ["#bf5af2", "#ffd1f7", "#2a0b3d"],
  ["#ff9f0a", "#fff1d6", "#3d2200"],
  ["#1d1d1f", "#f5f5f7", "#ff375f"],
  ["#64d2ff", "#003049", "#fdf0d5"],
  ["#ffd60a", "#1d1d1f", "#ffffff"],
  ["#ff375f", "#ffe5ec", "#3d0013"],
  ["#5e5ce6", "#e5e4ff", "#ffd60a"],
];
const TITLES = ["Low Sun", "Tidal", "Field Notes", "Bloom", "Copper Hour", "Signal", "Undertow", "Grid Study", "Pulse", "Night Shift"];
const BY = ["A. Moreau", "K. Tanaka", "L. Okafor", "S. Lindqvist", "R. Mehta", "J. Alvarez", "E. Novak", "M. Haddad", "I. Rossi", "T. Nguyen"];

/** Ten generated posters: each draws its own pattern and palette on a local canvas. */
export const DEFAULT_DRIFT_GALLERY_WORKS: DriftGalleryWork[] = TITLES.map((title, i) => ({
  title,
  by: BY[i],
  year: String(2019 + (i % 7)),
  palette: PALETTES[i],
  pattern: i,
}));

const W = 400;
const H = 500;
const FONT = "-apple-system, system-ui, sans-serif";

function drawPoster(x: CanvasRenderingContext2D, work: DriftGalleryWork, i: number) {
  const [a, b, ink] = work.palette ?? PALETTES[i % PALETTES.length];
  x.fillStyle = b;
  x.fillRect(0, 0, W, H);
  x.fillStyle = a;
  x.strokeStyle = a;
  switch ((((work.pattern ?? i) % 10) + 10) % 10) {
    case 0:
      x.beginPath();
      x.arc(W / 2, 250, 120, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = ink;
      x.fillRect(0, 300, W, 200);
      break;
    case 1:
      for (let k = 0; k < 9; k++) {
        x.beginPath();
        x.lineWidth = 14;
        x.moveTo(0, 90 + k * 36);
        for (let s = 0; s <= W; s += 10) x.lineTo(s, 90 + k * 36 + Math.sin(s / 40 + k) * 16);
        x.stroke();
      }
      break;
    case 2:
      for (let r = 0; r < 8; r++)
        for (let q = 0; q < 6; q++) {
          x.beginPath();
          x.arc(50 + q * 60, 60 + r * 50, 8 + ((r + q) % 3) * 6, 0, Math.PI * 2);
          x.fill();
        }
      break;
    case 3:
      for (let k = 0; k < 6; k++) {
        x.save();
        x.translate(W / 2, 230);
        x.rotate((k * Math.PI) / 3);
        x.beginPath();
        x.ellipse(0, -70, 42, 90, 0, 0, Math.PI * 2);
        x.globalAlpha = 0.8;
        x.fill();
        x.restore();
      }
      break;
    case 4:
      for (let k = 0; k < 7; k++) {
        x.beginPath();
        x.lineWidth = 18;
        x.arc(W / 2, 420, 60 + k * 34, Math.PI, Math.PI * 2);
        x.globalAlpha = 1 - k * 0.12;
        x.stroke();
      }
      x.globalAlpha = 1;
      break;
    case 5:
      x.font = `800 380px ${FONT}`;
      x.textAlign = "center";
      x.fillText("S", W / 2, 390);
      break;
    case 6:
      for (let k = 0; k < 12; k++) {
        x.fillStyle = k % 2 ? a : ink;
        x.fillRect(0, k * 42, W, 42 - (k % 3) * 8);
      }
      break;
    case 7:
      x.lineWidth = 3;
      for (let k = 0; k <= 10; k++) {
        x.beginPath();
        x.moveTo(k * 40, 0);
        x.lineTo(k * 40, H);
        x.stroke();
        x.beginPath();
        x.moveTo(0, k * 50);
        x.lineTo(W, k * 50);
        x.stroke();
      }
      x.fillStyle = ink;
      x.fillRect(120, 150, 160, 200);
      break;
    case 8:
      for (let k = 0; k < 40; k++) {
        x.beginPath();
        x.lineWidth = 4;
        const y = 30 + k * 11;
        x.moveTo(30, y);
        x.lineTo(30 + 340 * Math.abs(Math.sin(k * 0.45)), y);
        x.stroke();
      }
      break;
    default:
      x.beginPath();
      x.moveTo(0, H);
      x.lineTo(W / 2, 80);
      x.lineTo(W, H);
      x.fill();
      x.fillStyle = ink;
      x.beginPath();
      x.arc(300, 110, 36, 0, Math.PI * 2);
      x.fill();
  }
  x.globalAlpha = 1;
  x.fillStyle = ink;
  x.textAlign = "left";
  x.font = `700 26px ${FONT}`;
  x.fillText(work.title, 26, H - 52);
  x.font = `500 15px ${FONT}`;
  x.globalAlpha = 0.7;
  x.fillText(`${work.by} · ${work.year}`, 26, H - 26);
  x.globalAlpha = 1;
}

type Art = { url: string; tex: THREE.CanvasTexture };

/** Draws (or loads and crops) one piece into a 400 × 500 canvas and wraps it in a texture. */
function makeArt(work: DriftGalleryWork, i: number): Art {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (!work.src) {
    drawPoster(x, work, i);
    tex.needsUpdate = true;
    return { url: c.toDataURL("image/jpeg", 0.86), tex };
  }
  x.fillStyle = "#e8e8ed";
  x.fillRect(0, 0, W, H);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.onload = () => {
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    x.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    tex.needsUpdate = true;
  };
  img.src = work.src;
  return { url: work.src, tex };
}

const COLS = 8,
  ROWS = 6,
  PW = 1.5,
  PH = 1.875,
  GX = 0.32,
  GY = 0.32;
const SX = PW + GX,
  SY = PH + GY,
  TW = COLS * SX,
  TH = ROWS * SY;

const vert = /* glsl */ `
uniform vec2 uVel;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  float d = length(w.xy);
  w.z -= d * d * 0.03;                                   // a shallow bowl, so the wall curves away
  w.z += sin(uv.x * 3.14159) * uVel.x * -0.9 + sin(uv.y * 3.14159) * uVel.y * 0.9; // sheets flex as you drag
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const frag = /* glsl */ `
uniform sampler2D map;
uniform vec2 uVel;
uniform float uHover;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * vec2(${PW.toFixed(3)}, ${PH.toFixed(3)});
  vec2 q = abs(p) - vec2(${(PW / 2).toFixed(3)}, ${(PH / 2).toFixed(3)}) + 0.06;
  if (length(max(q, 0.0)) > 0.06) discard;               // rounded corners
  vec2 uv = (vUv - 0.5) / (1.0 + uHover * 0.06) + 0.5;  // the image zooms a touch inside its frame on hover
  vec2 off = uVel * 0.02;                                // colour fringing grows with speed
  gl_FragColor = vec4(texture2D(map, uv + off).r, texture2D(map, uv).g, texture2D(map, uv - off).b, 1.0);
  #include <colorspace_fragment>
}`;

type V2 = MutableRefObject<{ x: number; y: number }>;

function Wall({
  art,
  panRef,
  velRef,
  centreRef,
  focusedRef,
  wrapRef,
  onOpen,
}: {
  art: Art[];
  panRef: V2;
  velRef: V2;
  /** Written every frame: index (into `art`) of the sheet nearest the middle. */
  centreRef: MutableRefObject<number>;
  /** True while the wall has keyboard focus: the centred sheet lifts as if hovered. */
  focusedRef: MutableRefObject<boolean>;
  wrapRef: MutableRefObject<HTMLDivElement | null>;
  onOpen: (i: number) => void;
}) {
  const meshes = useRef<THREE.Mesh[]>([]);
  const hover = useRef(-1);
  const geo = useMemo(() => new THREE.PlaneGeometry(PW, PH, 18, 18), []);
  const mats = useMemo(
    () =>
      Array.from(
        { length: COLS * ROWS },
        (_, k) =>
          new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: { map: { value: art[k % art.length].tex }, uVel: { value: new THREE.Vector2() }, uHover: { value: 0 } },
          }),
      ),
    [art],
  );
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);
  useEffect(() => () => geo.dispose(), [geo]);
  const sv = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector2());

  useFrame(() => {
    sv.current.lerp(target.current.set(velRef.current.x, velRef.current.y), 0.12);
    let best = -1;
    let bestD = Infinity;
    for (let k = 0; k < COLS * ROWS; k++) {
      const m = meshes.current[k];
      if (!m) continue;
      const c = k % COLS,
        r = Math.floor(k / COLS);
      const off = r % 2 ? SX / 2 : 0;
      const x = ((((c * SX + off + panRef.current.x) % TW) + TW) % TW) - TW / 2 + SX / 2;
      const y = ((((r * SY + panRef.current.y) % TH) + TH) % TH) - TH / 2 + SY / 2;
      m.position.set(x, y, 0);
      const d = x * x + y * y;
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    centreRef.current = best;
    const lifted = hover.current >= 0 ? hover.current : focusedRef.current ? best : -1;
    for (let k = 0; k < COLS * ROWS; k++) {
      const m = meshes.current[k];
      if (!m) continue;
      const mat = m.material as THREE.ShaderMaterial;
      mat.uniforms.uVel.value.copy(sv.current);
      const h = lifted === k ? 1 : 0;
      mat.uniforms.uHover.value += (h - mat.uniforms.uHover.value) * 0.12;
      const s = 1 + mat.uniforms.uHover.value * 0.05;
      m.scale.set(s, s, 1);
    }
  });

  return (
    <group>
      {mats.map((mat, k) => (
        <mesh
          key={k}
          ref={(m) => {
            if (m) meshes.current[k] = m;
          }}
          geometry={geo}
          material={mat}
          onPointerOver={(e) => {
            e.stopPropagation();
            hover.current = k;
            if (wrapRef.current) wrapRef.current.dataset.hover = "1";
          }}
          onPointerOut={() => {
            if (hover.current === k) hover.current = -1;
            if (wrapRef.current) delete wrapRef.current.dataset.hover;
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.delta < 6) onOpen(k % art.length);
          }}
        />
      ))}
    </group>
  );
}

/** Inertia after a fling, and a slow drift when nobody is touching it. */
function Drift({ panRef, velRef, dragRef, drift }: { panRef: V2; velRef: V2; dragRef: MutableRefObject<unknown>; drift: boolean }) {
  useFrame((_, delta) => {
    if (dragRef.current) return;
    // A resumed loop can report one very long frame; don't let it fling the wall.
    const dt = Math.min(delta, 0.1);
    const k = Math.pow(0.04, dt);
    velRef.current.x = velRef.current.x * k + (drift ? 0.0016 : 0) * (1 - k);
    velRef.current.y = velRef.current.y * k + (drift ? 0.0009 : 0) * (1 - k);
    panRef.current.x += velRef.current.x * dt * 60;
    panRef.current.y += velRef.current.y * dt * 60;
  });
  return null;
}

/** Clear colour follows the site's `dark` class. */
function Backdrop() {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      gl.setClearColor(root.classList.contains("dark") ? "#000000" : "#f5f5f7");
      invalidate();
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [gl, invalidate]);
  return null;
}

/**
 * An endless wall of work. Drag anywhere and it slides with inertia, wrapping forever in every
 * direction; the sheets flex and fringe with your speed and the whole wall curves away like a
 * bowl. Hover lifts a piece, click opens it. Left alone, it drifts. With the wall focused, the
 * arrow keys pan it, Enter opens the centred piece and Escape closes it.
 */
export function DriftGallery({
  works = DEFAULT_DRIFT_GALLERY_WORKS,
  eyebrow = "Spring exhibition",
  title = "Ten artists, no edges.",
  hint = "Drag anywhere · click to open",
  keyboardHint = "Arrows to move · Enter to open",
  closeLabel = "Back to the wall",
  autoplay = true,
  onOpen,
  className,
}: DriftGalleryProps) {
  const list = works.length ? works : DEFAULT_DRIFT_GALLERY_WORKS;
  const art = useMemo(() => (typeof document === "undefined" ? [] : list.map((w, i) => makeArt(w, i))), [list]);
  useEffect(() => () => art.forEach((a) => a.tex.dispose()), [art]);

  const reduce = useReducedMotion() ?? false;
  const wrapRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const centreRef = useRef(-1);
  const focusedRef = useRef(false);
  const [open, setOpen] = useState<number | null>(null);
  const [running, setRunning] = useState(true);
  const descId = `mk-dg-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Stop rendering while the wall is off screen or the tab is hidden.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let visible = true;
    const sync = () => setRunning(visible && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const openPiece = (i: number) => {
    if (i < 0 || i >= list.length) return;
    setOpen(i);
    onOpen?.(list[i], i);
  };
  const close = () => {
    setOpen(null);
    wrapRef.current?.focus({ preventScroll: true });
  };

  // Escape closes the open piece wherever focus is.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setOpen(null);
      wrapRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const down = (e: ReactPointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    if (wrapRef.current) wrapRef.current.dataset.grabbing = "1";
  };
  const move = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const k = 0.011;
    velRef.current = { x: (e.clientX - d.x) * k, y: -(e.clientY - d.y) * k };
    panRef.current.x += velRef.current.x;
    panRef.current.y += velRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
  };
  const up = () => {
    dragRef.current = null;
    if (wrapRef.current) delete wrapRef.current.dataset.grabbing;
  };
  const key = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (open !== null || e.target !== e.currentTarget) return;
    focusedRef.current = true;
    // A push that coasts about one column (or row) on the wall's own inertia.
    const NUDGE = 0.1;
    const push: Record<string, [number, number]> = {
      ArrowLeft: [NUDGE, 0],
      ArrowRight: [-NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    };
    const p = push[e.key];
    if (p) {
      e.preventDefault();
      velRef.current = { x: p[0], y: p[1] };
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (centreRef.current >= 0) openPiece(centreRef.current % list.length);
    }
  };

  const piece = open !== null ? list[open] : null;
  const pieceArt = open !== null ? art[open] : null;

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role="region"
      aria-roledescription="gallery"
      aria-label={title}
      aria-describedby={descId}
      className={cn(
        "group relative h-[600px] w-full cursor-grab touch-none select-none overflow-hidden bg-[#f5f5f7] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3] data-[hover]:cursor-pointer data-[grabbing]:cursor-grabbing dark:bg-black dark:focus-visible:ring-[#0a84ff]",
        className,
      )}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerLeave={up}
      onKeyDown={key}
      onFocus={(e) => {
        if (e.target === e.currentTarget) focusedRef.current = e.currentTarget.matches(":focus-visible");
      }}
      onBlur={(e) => {
        if (e.target === e.currentTarget) focusedRef.current = false;
      }}
    >
      <p id={descId} className="sr-only">
        Use the arrow keys to move the wall, Enter to open the piece in the middle, and Escape to close it.
      </p>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7.4], fov: 45 }}
        gl={{ antialias: true }}
        frameloop={running ? "always" : "never"}
        aria-hidden="true"
      >
        <Backdrop />
        <Drift panRef={panRef} velRef={velRef} dragRef={dragRef} drift={autoplay && !reduce} />
        {art.length > 0 && <Wall art={art} panRef={panRef} velRef={velRef} centreRef={centreRef} focusedRef={focusedRef} wrapRef={wrapRef} onOpen={openPiece} />}
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f5f5f7] to-transparent dark:from-black" />
      <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 sm:bottom-8 sm:left-10 sm:right-10">
        <div>
          <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73] dark:text-[#a1a1a6]">{eyebrow}</p>
          <h3 className="m-0 mt-1 text-[clamp(28px,4vw,44px)] font-semibold leading-none tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3>
        </div>
        <span className="hidden rounded-full bg-white/80 px-3 py-1.5 text-[12px] text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.06)] backdrop-blur group-focus-visible:hidden dark:bg-[#1c1c1e]/80 dark:text-[#a1a1a6] dark:shadow-[0_0_0_1px_#3a3a3c] sm:inline">
          {hint}
        </span>
        <span className="hidden rounded-full bg-white/80 px-3 py-1.5 text-[12px] text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.06)] backdrop-blur group-focus-visible:inline dark:bg-[#1c1c1e]/80 dark:text-[#a1a1a6] dark:shadow-[0_0_0_1px_#3a3a3c]">
          {keyboardHint}
        </span>
      </div>
      <AnimatePresence>
        {piece && pieceArt && (
          <motion.div
            key="lb"
            role="dialog"
            aria-modal="true"
            aria-label={`${piece.title} by ${piece.by}`}
            className="absolute inset-0 z-10 flex cursor-default items-center justify-center bg-[#f5f5f7]/70 p-6 backdrop-blur-md dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={close}
          >
            <motion.figure
              className="m-0 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-8"
              initial={reduce ? { opacity: 0 } : { scale: 0.85, y: 30, rotateX: 25 }}
              animate={reduce ? { opacity: 1 } : { scale: 1, y: 0, rotateX: 0 }}
              exit={reduce ? { opacity: 0 } : { scale: 0.9, y: 20, opacity: 0 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 24 }}
              style={{ transformPerspective: 900 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local data URL or the caller's own image */}
              <img
                src={pieceArt.url}
                alt={`${piece.title} by ${piece.by}`}
                className="aspect-[4/5] h-[min(420px,60vh)] w-auto rounded-[14px] object-cover shadow-[0_30px_60px_-24px_rgba(0,0,0,.5)]"
              />
              <figcaption className="flex flex-col items-center gap-1 sm:items-start">
                <span className="text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{piece.title}</span>
                <span className="text-[15px] text-[#6e6e73] dark:text-[#a1a1a6]">
                  {piece.by} · {piece.year}
                </span>
                <button
                  type="button"
                  autoFocus
                  onClick={close}
                  className="mt-3 h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
                >
                  {closeLabel}
                </button>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

# Glass Lens

Add the "Glass Lens" component from Nexus UI to my project.

A glass puck you drag over content. It magnifies the centre and splits colour toward the rim, built from three offset copies of the content instead of a shader. Also includes Zoom Lens: A magnifier that springs after your pointer and shows full detail, so tiny map labels become readable. Scroll or use the slider to zoom.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { GlassLens } from "@/components/glass-lens/glass-lens";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/glass-lens/glass-lens.tsx ---

```tsx
"use client";
import { useEffect, useRef, type KeyboardEvent as RKeyboardEvent, type ReactNode } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";

export interface GlassLensProps {
  /** Lens diameter in px. */
  size?: number;
  /** Magnification at the centre of the lens. */
  zoom?: number;
  /** Width of the content surface in px. */
  width?: number;
  /** Height of the content surface in px. */
  height?: number;
  /** Content under the glass. It is rendered four times (page + three lens layers), so keep it static. */
  children?: ReactNode;
  /** Drifts across the content by itself until the user drags it. */
  autoplay?: boolean;
}

const DEFAULT_TEXT = (
  <div className="flex h-full flex-col justify-center gap-3 px-8">
    <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#86868b] dark:text-[#8e8e93]">Field notes</p>
    <p className="m-0 text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">
      Glass is not a filter you lay on top. It is a material that bends whatever sits behind it.
    </p>
    <p className="m-0 text-[15px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">Drag the lens across the page. The edges split light into colour, the centre magnifies.</p>
  </div>
);

const STEP = 24;

/**
 * A draggable glass puck. Three copies of the content sit inside it at slightly
 * different magnifications, tinted red, green and blue, so colour fringes grow
 * toward the rim the way chromatic aberration does in a real lens.
 */
export function GlassLens({ size = 150, zoom = 1.45, width = 520, height = 300, children = DEFAULT_TEXT, autoplay = false }: GlassLensProps) {
  const x = useMotionValue(width * 0.18);
  const y = useMotionValue(height * 0.3);
  const touched = useRef(false);
  const r = size / 2;
  const innerX = useTransform(x, (v) => -v);
  const innerY = useTransform(y, (v) => -v);
  const originX = useTransform(x, (v) => v + r);
  const originY = useTransform(y, (v) => v + r);
  const origin = useMotionTemplate`${originX}px ${originY}px`;

  useEffect(() => {
    if (!autoplay) return;
    let ctl: { stop: () => void }[] = [];
    const drift = () => {
      if (touched.current) return;
      const tx = Math.random() * (width - size);
      const ty = Math.random() * (height - size);
      ctl = [animate(x, tx, { type: "spring", stiffness: 30, damping: 12 }), animate(y, ty, { type: "spring", stiffness: 30, damping: 12 })];
    };
    const a = setTimeout(drift, 500);
    const b = setInterval(drift, 2600);
    return () => { clearTimeout(a); clearInterval(b); ctl.forEach((c) => c.stop()); };
  }, [autoplay, x, y, width, height, size]);

  const onKeyDown = (e: RKeyboardEvent) => {
    const dx = e.key === "ArrowLeft" ? -STEP : e.key === "ArrowRight" ? STEP : 0;
    const dy = e.key === "ArrowUp" ? -STEP : e.key === "ArrowDown" ? STEP : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    touched.current = true;
    const spring = { type: "spring", stiffness: 300, damping: 30 } as const;
    if (dx) animate(x, Math.max(0, Math.min(width - size, x.get() + dx)), spring);
    if (dy) animate(y, Math.max(0, Math.min(height - size, y.get() + dy)), spring);
  };

  const layer = (scale: number, tint?: string) => (
    <motion.div
      aria-hidden="true"
      className={tint ? "absolute left-0 top-0 mix-blend-multiply dark:mix-blend-screen" : "absolute left-0 top-0"}
      style={{ width, height, x: innerX, y: innerY, scale, transformOrigin: origin, ...(tint ? { color: tint, opacity: 0.55 } : {}) }}
    >
      <div className={tint ? "h-full [&_*]:text-current!" : "h-full"}>{children}</div>
    </motion.div>
  );

  return (
    <div
      className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_50px_-28px_rgba(0,0,0,.3)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_50px_-28px_rgba(0,0,0,.8)]"
      style={{ width, height, maxWidth: "100%" }}
    >
      {children}
      <motion.div
        drag
        dragConstraints={{ left: 0, top: 0, right: width - size, bottom: height - size }}
        dragElastic={0.15}
        dragTransition={{ power: 0.3, timeConstant: 300, bounceStiffness: 300, bounceDamping: 20 }}
        onPointerDown={() => { touched.current = true; }}
        onKeyDown={onKeyDown}
        whileDrag={{ scale: 1.06 }}
        whileHover={{ scale: 1.02 }}
        className="absolute left-0 top-0 cursor-grab overflow-hidden rounded-full bg-white shadow-[0_24px_40px_-14px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:bg-[#1c1c1e] dark:shadow-[0_24px_40px_-14px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.14)] dark:focus-visible:ring-[#0a84ff]"
        style={{ x, y, width: size, height: size }}
        role="img"
        tabIndex={0}
        aria-label="Magnifying glass. Drag it, or use the arrow keys, to move it over the text."
      >
        {layer(zoom * 1.035, "#ff2d55")}
        {layer(zoom * 0.965, "#0a84ff")}
        {layer(zoom)}
        {/* glass body: rim light, inner shadow and a specular highlight */}
        <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.9),inset_0_10px_18px_rgba(255,255,255,.7),inset_0_-14px_26px_rgba(0,0,0,.10),inset_0_0_30px_rgba(0,0,0,.06)] dark:shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.28),inset_0_10px_18px_rgba(255,255,255,.12),inset_0_-14px_26px_rgba(0,0,0,.45),inset_0_0_30px_rgba(0,0,0,.3)]" />
        <span className="pointer-events-none absolute left-[18%] top-[10%] h-[22%] w-[40%] -rotate-[24deg] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,0))] blur-[1px] dark:opacity-40" />
      </motion.div>
    </div>
  );
}
```

# Zoom Lens

Add the "Zoom Lens" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { ZoomLens } from "@/components/glass-lens/zoom-lens";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/glass-lens/zoom-lens.tsx ---

```tsx
"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ZoomLensProps {
  /** Picture to magnify, as a URL or data URI. Defaults to a drawn map of an invented harbour district with street names too small to read without the lens. */
  image?: string;
  /** Picture to use in dark mode. Defaults to a dark version of the demo map, or to `image` when you pass your own. */
  darkImage?: string;
  /** Width divided by height of the picture. */
  aspectRatio?: number;
  /** Accessible description of the picture. */
  label?: string;
  /** Starting magnification. */
  defaultZoom?: number;
  /** Smallest magnification. */
  minZoom?: number;
  /** Largest magnification. */
  maxZoom?: number;
  /** Lens diameter in px. */
  lensSize?: number;
  /** Shows the zoom slider under the picture. The wheel and the plus and minus keys still work without it. */
  showControl?: boolean;
  /** The lens wanders over the picture by itself until someone points at it or presses a key. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

const IW = 1800;
const IH = 1100;
const KEY_STEP = 40;

type MapTheme = {
  bg: string;
  blocks: [string, string, string];
  window: string;
  park: string;
  trees: string;
  river: string;
  avenue: string;
  centreLine: string;
  label: string;
  riverLabel: string;
  pinLabel: string;
};

const LIGHT_MAP: MapTheme = {
  bg: "#f4f1ea",
  blocks: ["#ebe6dc", "#e6e0d4", "#efeae1"],
  window: "rgba(0,0,0,.05)",
  park: "#cfe8c6",
  trees: "#a9d39c",
  river: "#a9cbe8",
  avenue: "#ffffff",
  centreLine: "#ffd36b",
  label: "#6b6b70",
  riverLabel: "#3b6ea5",
  pinLabel: "#1d1d1f",
};

const DARK_MAP: MapTheme = {
  bg: "#1c1c1e",
  blocks: ["#27272b", "#2b2b30", "#242428"],
  window: "rgba(255,255,255,.05)",
  park: "#1f3a28",
  trees: "#2f5a3b",
  river: "#1f4263",
  avenue: "#3d3d42",
  centreLine: "#8c6f1f",
  label: "#a1a1a6",
  riverLabel: "#7db4e6",
  pinLabel: "#f5f5f7",
};

const STREETS = ["Linden St", "Harbour Rd", "Mill Ln", "Quay Ave", "Orchard Way", "Elm Row", "Kiln St", "Bridge St"];
const PINS: [number, number, string, string][] = [
  [640, 330, "#ff3b30", "Studio"],
  [1230, 580, "#0a84ff", "Cafe Lumen"],
  [420, 610, "#34c759", "Park gate"],
];

/** Draws the little city map as an SVG data URI. Street names are tiny on purpose: you need the lens to read them. Pure, so it is safe to call during render. */
function mapUri(t: MapTheme) {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${IW}" height="${IH}" viewBox="0 0 ${IW} ${IH}"><rect width="${IW}" height="${IH}" fill="${t.bg}"/>`;
  for (let y = 0; y < IH; y += 120) {
    for (let x = 0; x < IW; x += 150) {
      const park = (x / 150 + y / 120) % 7 === 3;
      s += `<rect x="${x + 14}" y="${y + 14}" width="122" height="92" rx="8" fill="${park ? t.park : t.blocks[(x + y) % 3]}"/>`;
      if (!park) {
        for (let k = 0; k < 6; k++) s += `<rect x="${x + 22 + (k % 3) * 38}" y="${y + 22 + Math.floor(k / 3) * 40}" width="30" height="30" fill="${t.window}"/>`;
      } else {
        for (let k = 0; k < 5; k++) s += `<circle cx="${x + 40 + k * 18}" cy="${y + 50 + (k % 2) * 16}" r="7" fill="${t.trees}"/>`;
      }
    }
  }
  s += `<path d="M-40 820 C 500 640, 900 1040, 1840 700" fill="none" stroke="${t.river}" stroke-width="46" stroke-linecap="round"/>`;
  s += `<g stroke="${t.avenue}" stroke-width="16" fill="none"><path d="M0 360H${IW}M0 600H${IW}M600 0V${IH}M1200 0V${IH}"/></g>`;
  s += `<g stroke="${t.centreLine}" stroke-width="4" fill="none"><path d="M0 360H${IW}M600 0V${IH}"/></g>`;
  s += `<g fill="${t.label}" font-family="system-ui, sans-serif" font-size="11" font-weight="600">`;
  for (let i = 0; i < 40; i++) s += `<text x="${30 + ((i * 263) % (IW - 120))}" y="${66 + Math.floor(i / 8) * 240}">${STREETS[i % STREETS.length]}</text>`;
  s += `</g><text x="820" y="870" fill="${t.riverLabel}" font-family="system-ui, sans-serif" font-size="14" font-weight="600" font-style="italic">River Ash</text>`;
  for (const [x, y, col, label] of PINS) {
    s += `<circle cx="${x}" cy="${y}" r="9" fill="${col}"/><text x="${x + 14}" y="${y + 4}" fill="${t.pinLabel}" font-family="system-ui, sans-serif" font-size="12" font-weight="700">${label}</text>`;
  }
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(`${s}</svg>`)}")`;
}

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/**
 * A magnifier for images and maps. The lens springs after your pointer and
 * shows the picture at full detail, so tiny labels that are unreadable in
 * the overview become clear. Scroll over the picture, use the slider, or press
 * plus and minus to change the zoom; leave and the lens shrinks away. The
 * picture is focusable: the arrow keys move the lens. Under reduced motion the
 * lens follows the pointer directly and fades instead of popping.
 */
export function ZoomLens({
  image,
  darkImage,
  aspectRatio = IW / IH,
  label = "Map of the harbour district. Use the lens to read street names.",
  defaultZoom = 2.6,
  minZoom = 1.5,
  maxZoom = 4,
  lensSize = 164,
  showControl = true,
  autoplay = false,
  className,
}: ZoomLensProps) {
  const reduce = useReducedMotion() ?? false;
  const R = lensSize / 2;
  const lightUrl = useMemo(() => (image ? `url("${image}")` : mapUri(LIGHT_MAP)), [image]);
  const darkUrl = useMemo(() => (darkImage ? `url("${darkImage}")` : image ? `url("${image}")` : mapUri(DARK_MAP)), [darkImage, image]);
  const box = useRef<HTMLDivElement>(null);
  const placed = useRef(false);
  const touched = useRef(false);
  const [zoom, setZoom] = useState(defaultZoom);
  const [on, setOn] = useState(true);
  const [size, setSize] = useState({ w: 600, h: Math.round(600 / aspectRatio) });
  const mx = useMotionValue(300);
  const my = useMotionValue(180);
  const sx = useSpring(mx, { stiffness: 260, damping: 28 });
  const sy = useSpring(my, { stiffness: 260, damping: 28 });
  const x = reduce ? mx : sx;
  const y = reduce ? my : sy;
  const z = useMotionValue(defaultZoom);
  const bgPos = useTransform([x, y, z], ([a, b, k]: number[]) => `${-(a * k - R)}px ${-(b * k - R)}px`);
  const active = useDemoActive(box, autoplay && !reduce);

  useEffect(() => {
    z.set(zoom);
  }, [zoom, z]);

  // Measure the picture, and park the lens in its middle the first time.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setSize({ w, h });
      if (!placed.current) {
        placed.current = true;
        mx.jump(w / 2);
        my.jump(h / 2);
        sx.jump(w / 2);
        sy.jump(h / 2);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mx, my, sx, sy]);

  // Demo: wander until someone takes over.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    let k = 0;
    const id = window.setInterval(() => {
      const el = box.current;
      if (touched.current || !el) return;
      k++;
      animate(mx, el.offsetWidth * (0.2 + 0.6 * ((k * 0.37) % 1)), { duration: 1.6, ease: "easeInOut" });
      animate(my, el.offsetHeight * (0.25 + 0.5 * ((k * 0.61) % 1)), { duration: 1.6, ease: "easeInOut" });
    }, 1700);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active, mx, my]);

  // Wheel zoom needs a non-passive listener so the page does not scroll with it.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      touched.current = true;
      setZoom((v) => Math.max(minZoom, Math.min(maxZoom, v - e.deltaY * 0.004)));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [minZoom, maxZoom]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const move: Record<string, [number, number]> = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP] };
    const step = move[e.key];
    if (step) {
      e.preventDefault();
      touched.current = true;
      setOn(true);
      mx.set(Math.max(0, Math.min(size.w, mx.get() + step[0])));
      my.set(Math.max(0, Math.min(size.h, my.get() + step[1])));
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      touched.current = true;
      setZoom((v) => Math.min(maxZoom, +(v + 0.2).toFixed(1)));
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      touched.current = true;
      setZoom((v) => Math.max(minZoom, +(v - 0.2).toFixed(1)));
    }
  };

  const bgSize = `${size.w * zoom}px ${size.h * zoom}px`;
  const layer = (url: string, extra: string) => <motion.div aria-hidden="true" className={cn("absolute inset-0", extra)} style={{ backgroundImage: url, backgroundSize: bgSize, backgroundPosition: bgPos, backgroundRepeat: "no-repeat" }} />;
  const sameImage = lightUrl === darkUrl;

  return (
    <div className={cn("flex w-full max-w-[640px] flex-col gap-3", className)}>
      <div
        ref={box}
        tabIndex={0}
        role="group"
        aria-label={`${label} Arrow keys move the lens, plus and minus change the zoom.`}
        className={cn(
          "relative w-full cursor-none touch-none select-none overflow-hidden rounded-[22px] bg-[#f4f1ea] shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
          FOCUS,
        )}
        style={{ aspectRatio }}
        onPointerMove={(e) => {
          touched.current = true;
          setOn(true);
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onPointerLeave={() => {
          if (touched.current) setOn(false);
        }}
        onPointerEnter={() => setOn(true)}
        onKeyDown={onKeyDown}
        onFocus={() => setOn(true)}
      >
        <div aria-hidden="true" className={cn("absolute inset-0", sameImage ? "" : "dark:hidden")} style={{ backgroundImage: lightUrl, backgroundSize: "100% 100%" }} />
        {!sameImage && <div aria-hidden="true" className="absolute inset-0 hidden dark:block" style={{ backgroundImage: darkUrl, backgroundSize: "100% 100%" }} />}
        <AnimatePresence>
          {on && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 overflow-hidden rounded-full bg-[#f4f1ea] shadow-[0_0_0_3px_#fff,0_0_0_4px_rgba(0,0,0,.12),0_18px_40px_-10px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_3px_#2c2c2e,0_0_0_4px_rgba(255,255,255,.16),0_18px_40px_-10px_rgba(0,0,0,.85)]"
              style={{ width: lensSize, height: lensSize, x, y, translateX: -R, translateY: -R }}
              initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 26 }}
            >
              {layer(lightUrl, sameImage ? "" : "dark:hidden")}
              {!sameImage && layer(darkUrl, "hidden dark:block")}
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.35),transparent_45%)] dark:bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.14),transparent_45%)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showControl && (
        <label className="flex items-center gap-3 px-1 text-[12.5px] text-[#6e6e73] dark:text-[#a1a1a6]">
          Zoom
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.1}
            value={zoom}
            onChange={(e) => {
              touched.current = true;
              setZoom(+e.target.value);
            }}
            className={cn("h-1 flex-1 accent-[#1d1d1f] dark:accent-[#f5f5f7]", FOCUS)}
          />
          <span className="w-9 text-right tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{zoom.toFixed(1)}x</span>
        </label>
      )}
    </div>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Add the "Interactive Globe Explorer" component from Nexus UI to my project.

An office finder: a dotted globe drawn on canvas beside a list of cities, with the address and email of the selected one ready to copy. Pick a city or its pin and the globe swings round on a spring, overshoots a touch and settles with the city in the middle, where its pin drops in with a bounce and sends out a ripple.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { InteractiveGlobeExplorer } from "@/components/interactive-globe-explorer";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/interactive-globe-explorer/index.ts ---

```ts
export {
  InteractiveGlobeExplorer,
  default,
  type GlobeLocation,
  type InteractiveGlobeExplorerProps,
} from "./interactive-globe-explorer";
```

--- components/interactive-globe-explorer/interactive-globe-explorer.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { cn } from "@/lib/utils";

export type GlobeLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  email: string;
};

export type InteractiveGlobeExplorerProps = {
  /** Offices or places to pin. Defaults to 20 cities. */
  locations?: GlobeLocation[];
  /** Id of the location selected first. */
  initialLocationId?: string;
  /** Called with a location whenever one is selected. */
  onSelect?: (location: GlobeLocation) => void;
  /** Heading above the list. */
  title?: string;
  /** Flies from city to city every few seconds until someone touches the explorer. */
  autoplay?: boolean;
  /** Classes for the outer card. Give it a height for the side-by-side layout, e.g. "h-[480px]". */
  className?: string;
};

const DEFAULT_LOCATIONS: GlobeLocation[] = [
  { id: "1", name: "Milan", lat: 45.4642, lng: 9.19, address: "123 Via Milano, Milan 20121, IT", email: "hello@nexus-ui.com" },
  { id: "2", name: "Cape Town", lat: -33.9249, lng: 18.4241, address: "456 Table Mountain Rd, Cape Town 8001, ZA", email: "hello@nexus-ui.com" },
  { id: "3", name: "New York", lat: 40.7128, lng: -74.006, address: "789 Broadway, New York NY 10003, US", email: "hello@nexus-ui.com" },
  { id: "4", name: "London", lat: 51.5074, lng: -0.1278, address: "2 Bedford Gardens, London W8 7EH, UK", email: "hello@nexus-ui.com" },
  { id: "5", name: "Johannesburg", lat: -26.2041, lng: 28.0473, address: "321 Nelson Mandela Square, Johannesburg 2196, ZA", email: "hello@nexus-ui.com" },
  { id: "6", name: "Tokyo", lat: 35.6762, lng: 139.6503, address: "1-1-1 Shibuya, Tokyo 150-0002, JP", email: "hello@nexus-ui.com" },
  { id: "7", name: "Paris", lat: 48.8566, lng: 2.3522, address: "5 Avenue des Champs-Elysees, Paris 75008, FR", email: "hello@nexus-ui.com" },
  { id: "8", name: "Sydney", lat: -33.8688, lng: 151.2093, address: "100 George Street, Sydney NSW 2000, AU", email: "hello@nexus-ui.com" },
  { id: "9", name: "Dubai", lat: 25.2048, lng: 55.2708, address: "Sheikh Zayed Road, Dubai, AE", email: "hello@nexus-ui.com" },
  { id: "10", name: "Singapore", lat: 1.3521, lng: 103.8198, address: "1 Marina Boulevard, Singapore 018989, SG", email: "hello@nexus-ui.com" },
  { id: "11", name: "Mumbai", lat: 19.076, lng: 72.8777, address: "Nariman Point, Mumbai 400021, IN", email: "hello@nexus-ui.com" },
  { id: "12", name: "Sao Paulo", lat: -23.5505, lng: -46.6333, address: "Avenida Paulista, Sao Paulo 01310-100, BR", email: "hello@nexus-ui.com" },
  { id: "13", name: "Toronto", lat: 43.6532, lng: -79.3832, address: "100 Queen Street, Toronto ON M5H 2N2, CA", email: "hello@nexus-ui.com" },
  { id: "14", name: "Berlin", lat: 52.52, lng: 13.405, address: "Unter den Linden 77, Berlin 10117, DE", email: "hello@nexus-ui.com" },
  { id: "15", name: "Hong Kong", lat: 22.3193, lng: 114.1694, address: "1 Harbour Road, Hong Kong, HK", email: "hello@nexus-ui.com" },
  { id: "16", name: "Los Angeles", lat: 34.0522, lng: -118.2437, address: "100 Wilshire Blvd, Los Angeles CA 90012, US", email: "hello@nexus-ui.com" },
  { id: "17", name: "Barcelona", lat: 41.3874, lng: 2.1686, address: "Passeig de Gracia, Barcelona 08007, ES", email: "hello@nexus-ui.com" },
  { id: "18", name: "Amsterdam", lat: 52.3676, lng: 4.9041, address: "Dam Square 1, Amsterdam 1012 JS, NL", email: "hello@nexus-ui.com" },
  { id: "19", name: "Seoul", lat: 37.5665, lng: 126.978, address: "Gangnam-gu, Seoul 06236, KR", email: "hello@nexus-ui.com" },
  { id: "20", name: "Istanbul", lat: 41.0082, lng: 28.9784, address: "Taksim Square, Istanbul 34437, TR", email: "hello@nexus-ui.com" },
];

/**
 * Land on a 120×60 grid of 3° cells, one hex string per row from 90°N down,
 * each bit a cell from 180°W eastward. Traced from a public-domain Blue Marble
 * image; coarse on purpose, it only decides where the dots go.
 */
const LAND_MASK = [
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "00000001fefff00000000000000000",
  "0000004ffffffc00e0000018000000",
  "00000f0fc7fffc000000801fc00000",
  "00003ebfc07ff800000201fff61000",
  "03f017dbf83ff8000c003fffffffc0",
  "c7ffffff9e3f80007f8fffffffffff",
  "07ffffff1c1e0600ef7fffffffffff",
  "07fffff8300c0003dffffffffffffc",
  "0101fff83e000002cfffffffffe040",
  "0000ffff3f0000201fffffffffc0c0",
  "00007fffff800053ffffffffffe080",
  "00001ffffc40000fffffffffffe000",
  "00001ffffc00001fffffffffffc000",
  "00001ffff800003d7877ffffff9000",
  "00001fffe00000701ff3fffffe0000",
  "00001fffe000007007fbfffff22000",
  "00000fffc000003f00fffffff04000",
  "000007ff8000007fdbfffffff80000",
  "000003f0800000fffff7fffff80000",
  "000000f0000001fffffafffff00000",
  "00000060000003ffff7f1fffc00000",
  "00000072000003ffffbe0f1e000000",
  "0000001e000003ffffbc060f080000",
  "00000003000003fffff00607000000",
  "000000001c0001fffff80401000000",
  "000000003f0000fffff80000040000",
  "000000003fe00003fff00000200000",
  "000000003ff00001ffe00006600000",
  "000000007ff80001ffc00002600000",
  "000000007ffe0000ff800002007000",
  "000000007fff0000ff800000003800",
  "000000003fff00007f800000000000",
  "000000001ffe0000ffc80000019000",
  "000000000ffe0000ff98000007d800",
  "000000000ffe0000ff1000000ff800",
  "0000000007fc00007f3000003ffc00",
  "000000000ff000007e0000003ffe00",
  "000000000ff000007e0000003ffe00",
  "000000000fe000003c0000003ffe00",
  "000000000fc0000000000000103c00",
  "000000000f80000000000000001c00",
  "000000000e00000000000000000000",
  "000000000c00000000000000000000",
  "000000001c00000000000000000000",
  "000000001800000000000000000000",
  "000000000800000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
  "000000000000000000000000000000",
];

const isLand = (lat: number, lng: number) => {
  const row = Math.min(59, Math.max(0, Math.floor((90 - lat) / 3)));
  const col = Math.min(119, Math.max(0, Math.floor((lng + 180) / 3)));
  const nib = parseInt(LAND_MASK[row][col >> 2], 16);
  return ((nib >> (3 - (col & 3))) & 1) === 1;
};

/** Dots on land, from an even spread over the sphere. Built once; the same on server and client. */
const LAND_DOTS: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  const n = 12000;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lng = (Math.atan2(x, z) * 180) / Math.PI;
    if (isLand(lat, lng)) out.push([x, y, z]);
  }
  return out;
})();

const toVec = (lat: number, lng: number): [number, number, number] => {
  const a = (lat * Math.PI) / 180;
  const b = (lng * Math.PI) / 180;
  return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
};

function subscribeDark(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const useDark = () =>
  useSyncExternalStore(
    subscribeDark,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

/** A spring with a little overshoot, so the globe swings past the city and settles back. */
const FLY = { type: "spring" as const, stiffness: 46, damping: 11, mass: 1 };

function CopyButton({ label, value, onCopied }: { label: string; value: string; onCopied: (what: string) => void }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setDone(false), 1400);
    return () => window.clearTimeout(t);
  }, [done]);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          // Clipboard can be blocked (insecure context, permissions); the button still confirms.
        }
        setDone(true);
        onCopied(label);
      }}
      aria-label={`Copy ${label}`}
      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f0f0f3] text-[#1d1d1f] outline-none transition-colors hover:bg-[#e6e6ea] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] dark:focus-visible:ring-[#0a84ff]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {done ? (
          <motion.svg
            key="ok"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="#30d158"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
          >
            <path d="M2.5 7.4 5.6 10.4 11.5 3.8" />
          </motion.svg>
        ) : (
          <motion.svg
            key="copy"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
          >
            <rect x="4.5" y="4.5" width="8" height="8" rx="2" />
            <path d="M9.5 2.5V2A1.5 1.5 0 0 0 8 .9H2.6A1.5 1.5 0 0 0 1 2.4v5.4a1.5 1.5 0 0 0 1.5 1.5h.5" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * An office finder: a dotted globe drawn on canvas beside a list of cities.
 * Pick a city (or its pin) and the globe swings round on a spring, overshoots
 * a touch and settles with the city in the middle, where its pin drops in
 * with a bounce and sends out a ripple. Drag the globe to spin it; it coasts.
 */
export function InteractiveGlobeExplorer({
  locations = DEFAULT_LOCATIONS,
  initialLocationId = "4",
  onSelect,
  title = "Our offices",
  autoplay = false,
  className = "",
}: InteractiveGlobeExplorerProps) {
  const reduce = useReducedMotion() === true;
  const dark = useDark();
  const first = locations.find((l) => l.id === initialLocationId) ?? locations[0];
  const [selectedId, setSelectedId] = useState<string | undefined>(first?.id);
  const [copied, setCopied] = useState("");
  const selected = locations.find((l) => l.id === selectedId) ?? locations[0];
  const yaw = useMotionValue(first ? (-first.lng * Math.PI) / 180 : 0);
  const pitch = useMotionValue(first ? (first.lat * Math.PI) / 180 : 0.3);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const flight = useRef<AnimationPlaybackControls[]>([]);
  const touched = useRef(false);
  const live = useRef({ dark, selectedId, locations, reduce, landedAt: 0 });
  const hits = useRef<{ id: string; x: number; y: number }[]>([]);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    live.current.dark = dark;
    live.current.locations = locations;
    live.current.reduce = reduce;
  }, [dark, locations, reduce]);

  const flyTo = (loc: GlobeLocation) => {
    flight.current.forEach((f) => f.stop());
    const ty0 = (-loc.lng * Math.PI) / 180;
    // Take the short way round.
    const cur = yaw.get();
    const ty = ty0 + Math.round((cur - ty0) / (2 * Math.PI)) * 2 * Math.PI;
    const tp = Math.max(-1.1, Math.min(1.1, (loc.lat * Math.PI) / 180));
    if (reduce) {
      yaw.set(ty);
      pitch.set(tp);
      live.current.landedAt = performance.now();
      return;
    }
    flight.current = [animate(yaw, ty, FLY), animate(pitch, tp, FLY)];
    live.current.landedAt = performance.now() + 450;
  };

  const choose = (loc: GlobeLocation, fromUser = true) => {
    if (fromUser) touched.current = true;
    setSelectedId(loc.id);
    live.current.selectedId = loc.id;
    flyTo(loc);
    onSelectRef.current?.(loc);
    // Keep the chosen row in view inside the list without scrolling the page.
    const row = list.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(loc.id)}"]`);
    const box = list.current;
    if (row && box) {
      const top = row.offsetTop - box.offsetTop;
      if (top < box.scrollTop || top + row.offsetHeight > box.scrollTop + box.clientHeight) {
        box.scrollTo({ top: top - box.clientHeight / 2 + row.offsetHeight / 2, behavior: reduce ? "auto" : "smooth" });
      }
    }
  };
  const chooseRef = useRef(choose);
  useEffect(() => {
    chooseRef.current = choose;
  });

  useEffect(() => () => flight.current.forEach((f) => f.stop()), []);

  // Canvas: draw every frame from the motion values; spin on drag with inertia.
  useEffect(() => {
    const cv = canvas.current;
    const host = stage.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !host || !ctx) return;
    let size = 0;
    let dpr = 1;
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      size = Math.max(120, Math.min(host.clientWidth, host.clientHeight));
      cv.width = Math.round(size * dpr);
      cv.height = Math.round(size * dpr);
      cv.style.width = `${size}px`;
      cv.style.height = `${size}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    let raf = 0;
    let last = 0;
    let spin = 0;
    let tilt = 0;
    let drag: { x: number; y: number; sx: number; sy: number; t: number; vx: number; vy: number } | null = null;
    let hover: string | null = null;
    const pins = () => live.current.locations.map((l) => ({ id: l.id, name: l.name, v: toVec(l.lat, l.lng) }));
    let pinList = pins();
    let pinKey = live.current.locations;

    const draw = (now: number) => {
      const { dark: dk, selectedId: sel, reduce: rd, landedAt } = live.current;
      if (pinKey !== live.current.locations) {
        pinKey = live.current.locations;
        pinList = pins();
      }
      const R = size * 0.44;
      const c = size / 2;
      const cy = Math.cos(yaw.get());
      const sy = Math.sin(yaw.get());
      const cp = Math.cos(pitch.get());
      const sp = Math.sin(pitch.get());
      const proj = (v: [number, number, number]) => {
        const x1 = v[0] * cy + v[2] * sy;
        const z1 = -v[0] * sy + v[2] * cy;
        const y2 = v[1] * cp - z1 * sp;
        const z2 = v[1] * sp + z1 * cp;
        return [c + x1 * R, c - y2 * R, z2] as const;
      };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Sphere body with a soft light from the top left.
      const g = ctx.createRadialGradient(c - R * 0.35, c - R * 0.4, R * 0.1, c, c, R);
      g.addColorStop(0, dk ? "#26304a" : "#ffffff");
      g.addColorStop(1, dk ? "#121726" : "#e4ebf5");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = dk ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Land dots, fading toward the rim.
      ctx.fillStyle = dk ? "#d5def2" : "#3d4a5f";
      const dot = Math.max(1.3, size / 190);
      for (const v of LAND_DOTS) {
        const [x, y, z] = proj(v);
        if (z <= 0.02) continue;
        ctx.globalAlpha = 0.22 + z * 0.68;
        ctx.fillRect(x - dot / 2, y - dot / 2, dot, dot);
      }
      ctx.globalAlpha = 1;

      // Pins.
      const accent = dk ? "#0a84ff" : "#0071e3";
      const nextHits: { id: string; x: number; y: number }[] = [];
      let label: { x: number; y: number; name: string } | null = null;
      const since = Math.max(0, (now - landedAt) / 1000);
      for (const p of pinList) {
        const [x, y, z] = proj(p.v);
        if (z <= 0) continue;
        nextHits.push({ id: p.id, x, y });
        const isSel = p.id === sel;
        const a = Math.min(1, z * 2.2);
        if (isSel) {
          // Drops in with a bounce once the globe has (nearly) landed, then a ripple.
          const drop = rd ? 1 : since <= 0 ? 0 : 1 - Math.exp(-since * 9) * Math.cos(since * 15);
          if (!rd && since > 0) {
            const rp = (since % 2.2) / 1.2;
            if (rp < 1) {
              ctx.globalAlpha = (1 - rp) * 0.5 * a;
              ctx.strokeStyle = accent;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(x, y, 6 + rp * 22, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
          ctx.globalAlpha = a;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(x, y, 7.5 * drop, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.arc(x, y, 5.5 * drop, 0, Math.PI * 2);
          ctx.fill();
          if (drop > 0.6) label = { x, y, name: p.name };
        } else {
          ctx.globalAlpha = a * (hover === p.id ? 1 : 0.85);
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.arc(x, y, hover === p.id ? 4.5 : 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (label) {
        ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";
        const w = ctx.measureText(label.name).width + 16;
        const lx = Math.max(4, Math.min(size - w - 4, label.x - w / 2));
        const ly = label.y - 34;
        ctx.fillStyle = dk ? "#f5f5f7" : "#1d1d1f";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") ctx.roundRect(lx, ly, w, 22, 11);
        else ctx.rect(lx, ly, w, 22);
        ctx.fill();
        ctx.fillStyle = dk ? "#1d1d1f" : "#ffffff";
        ctx.textBaseline = "middle";
        ctx.fillText(label.name, lx + 8, ly + 11.5);
      }
      hits.current = nextHits;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!drag && !live.current.reduce) {
        if (Math.abs(spin) > 0.002 || Math.abs(tilt) > 0.002) {
          yaw.set(yaw.get() + spin * dt);
          pitch.set(Math.max(-1.2, Math.min(1.2, pitch.get() + tilt * dt)));
          spin *= Math.exp(-dt * 1.8);
          tilt *= Math.exp(-dt * 3);
        }
      }
      draw(now);
    };
    raf = requestAnimationFrame(tick);

    const local = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const pinAt = (x: number, y: number) => {
      let best: string | null = null;
      let bd = 16;
      for (const h of hits.current) {
        const d = Math.hypot(h.x - x, h.y - y);
        if (d < bd) {
          bd = d;
          best = h.id;
        }
      }
      return best;
    };
    const onDown = (e: PointerEvent) => {
      touched.current = true;
      flight.current.forEach((f) => f.stop());
      const p = local(e);
      drag = { x: p.x, y: p.y, sx: p.x, sy: p.y, t: e.timeStamp, vx: 0, vy: 0 };
      spin = 0;
      tilt = 0;
      try {
        cv.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic pointers can't be captured.
      }
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (!drag) {
        const h = pinAt(p.x, p.y);
        if (h !== hover) {
          hover = h;
          cv.style.cursor = h ? "pointer" : "grab";
        }
        return;
      }
      const k = 2.2 / Math.max(1, size);
      const dy = (p.x - drag.x) * k;
      const dp = (p.y - drag.y) * k;
      yaw.set(yaw.get() + dy);
      pitch.set(Math.max(-1.2, Math.min(1.2, pitch.get() + dp)));
      const dts = Math.max(0.008, (e.timeStamp - drag.t) / 1000);
      drag.vx = drag.vx * 0.4 + (dy / dts) * 0.6;
      drag.vy = drag.vy * 0.4 + (dp / dts) * 0.6;
      drag.x = p.x;
      drag.y = p.y;
      drag.t = e.timeStamp;
    };
    const onUp = () => {
      if (!drag) return;
      const moved = Math.hypot(drag.x - drag.sx, drag.y - drag.sy);
      if (moved < 5) {
        const id = pinAt(drag.sx, drag.sy);
        const loc = id ? live.current.locations.find((l) => l.id === id) : undefined;
        if (loc) chooseRef.current(loc);
      } else if (!live.current.reduce) {
        spin = Math.max(-6, Math.min(6, drag.vx));
        tilt = Math.max(-3, Math.min(3, drag.vy));
      }
      drag = null;
    };
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
    };
  }, [yaw, pitch]);

  // Autoplay: tour the cities in order until someone touches the explorer.
  useEffect(() => {
    if (!autoplay || locations.length < 2) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const at = locations.findIndex((l) => l.id === live.current.selectedId);
      chooseRef.current(locations[(at + 1) % locations.length], false);
    }, 3200);
    return () => window.clearInterval(t);
  }, [autoplay, locations]);

  const onListKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const at = locations.findIndex((l) => l.id === selectedId);
    const next = locations[(at + (e.key === "ArrowDown" ? 1 : -1) + locations.length) % locations.length];
    choose(next);
    list.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(next.id)}"]`)?.focus();
  };

  return (
    <div
      className={cn(
        "@container relative flex min-h-[420px] w-full overflow-hidden rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
        className,
      )}
    >
      <div className="flex min-h-0 w-full flex-col @min-[500px]:flex-row">
        <div ref={stage} className="relative flex h-[250px] min-h-0 shrink-0 items-center justify-center @min-[500px]:h-auto @min-[500px]:flex-1">
          <canvas
            ref={canvas}
            role="img"
            aria-label={`Globe centred on ${selected?.name ?? "the world"}. Drag to spin it, or pick a city from the list.`}
            className="block cursor-grab touch-none select-none active:cursor-grabbing"
          />
          <p className="pointer-events-none absolute bottom-3 left-0 right-0 m-0 text-center text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Drag to spin. Tap a pin.</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col border-t border-black/[0.06] @min-[500px]:w-[230px] @min-[500px]:flex-none @min-[500px]:border-l @min-[500px]:border-t-0 dark:border-white/[0.08]">
          <div className="flex items-baseline justify-between px-5 pb-2 pt-4">
            <h3 className="m-0 text-[15px] font-semibold tracking-[-0.01em]">{title}</h3>
            <span className="text-[12px] tabular-nums text-[#86868b] dark:text-[#a1a1a6]">{locations.length}</span>
          </div>
          <div
            ref={list}
            role="listbox"
            aria-label="Cities"
            aria-activedescendant={selected ? `globe-city-${selected.id}` : undefined}
            onKeyDown={onListKey}
            className="relative max-h-[180px] min-h-0 flex-1 overflow-y-auto px-2 pb-2 [scrollbar-width:thin] @min-[500px]:max-h-none"
          >
            {locations.map((loc) => {
              const on = loc.id === selected?.id;
              return (
                <button
                  key={loc.id}
                  id={`globe-city-${loc.id}`}
                  data-id={loc.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => choose(loc)}
                  className="relative flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
                >
                  {on ? (
                    <motion.span
                      layoutId="globe-row"
                      className="absolute inset-0 rounded-[12px] bg-[#f0f0f3] dark:bg-[#2c2c2e]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className={`relative ${on ? "font-semibold" : ""}`}>{loc.name}</span>
                  <span className="relative text-[11px] tabular-nums text-[#86868b] dark:text-[#a1a1a6]">
                    {Math.abs(loc.lat).toFixed(1)}°{loc.lat >= 0 ? "N" : "S"}
                  </span>
                </button>
              );
            })}
          </div>
          {selected ? (
            <div className="border-t border-black/[0.06] p-4 dark:border-white/[0.08]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={selected.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                >
                  <p className="m-0 text-[17px] font-semibold tracking-[-0.02em]">{selected.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="m-0 min-w-0 flex-1 text-[12px] leading-snug text-[#6e6e73] dark:text-[#a1a1a6]">{selected.address}</p>
                    <CopyButton label="address" value={selected.address} onCopied={setCopied} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <p className="m-0 min-w-0 flex-1 truncate text-[12px] text-[#0059b3] dark:text-[#6cb6ff]">{selected.email}</p>
                    <CopyButton label="email" value={selected.email} onCopied={setCopied} />
                  </div>
                </motion.div>
              </AnimatePresence>
              <span className="sr-only" aria-live="polite">
                {copied ? `${copied} copied` : ""}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default InteractiveGlobeExplorer;
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

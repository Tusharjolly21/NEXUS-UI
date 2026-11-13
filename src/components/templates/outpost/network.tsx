"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useAnimationFrame, useReducedMotion } from "framer-motion";
import { REGIONS } from "./data";
import { LAND_MASK } from "./land-mask";
import { CONTAINER, DARK, FONT_MONO, clamp } from "./theme";
import { AnimatedNumber, Button, Icon, Reveal, SectionLabel, SectionTitle, useLiveInView } from "./ui";

/** Land cells of the dot map as [col, row], unpacked from the hex bitmask. */
const LAND_CELLS = (() => {
  const cells: [number, number][] = [];
  const perRow = Math.ceil(LAND_MASK.cols / 4);
  for (let row = 0; row < LAND_MASK.rows; row++) {
    for (let chunk = 0; chunk < perRow; chunk++) {
      const bits = parseInt(LAND_MASK.data[row * perRow + chunk], 16);
      for (let bit = 0; bit < 4; bit++) {
        if (bits & (8 >> bit)) {
          const col = chunk * 4 + bit;
          if (col < LAND_MASK.cols) {
            cells.push([col, row]);
          }
        }
      }
    }
  }
  return cells;
})();

/** Latitude and longitude to map grid units. */
const toGrid = (lat: number, lon: number) => {
  let lng = lon;
  if (lng < LAND_MASK.lon0) {
    lng += 360;
  }
  return [(lng - LAND_MASK.lon0) / LAND_MASK.step, (LAND_MASK.lat0 - lat) / LAND_MASK.step];
};

/** Map grid units back to [lat, lon]. */
const fromGrid = (col: number, row: number) => {
  let lon = LAND_MASK.lon0 + col * LAND_MASK.step;
  if (lon > 180) {
    lon -= 360;
  }
  return [LAND_MASK.lat0 - row * LAND_MASK.step, lon];
};

/** Great-circle distance between two [lat, lon] points. */
function distanceKm(a: number[], b: number[]) {
  const rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad;
  const dLon = (b[1] - a[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function nearestRegion(lat: number, lon: number) {
  let best = 0;
  let bestKm = 1 / 0;
  REGIONS.forEach((region, i) => {
    const km = distanceKm([lat, lon], [region.lat, region.lon]);
    if (km < bestKm) {
      bestKm = km;
      best = i;
    }
  });
  return {
    i: best,
    ms: Math.round(14 + bestKm / 105),
  };
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function ScrambleText({ text }: { text: string }) {
  const [shown, setShown] = useState(text);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) {
      // no scramble under reduced motion: show the final text at once
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(text);
      return;
    }
    let tick = 0;
    const timer = window.setInterval(() => {
      tick++;
      setShown(
        text
          .split("")
          .map((char, i) =>
            char === " " || i < tick / 2 ? char : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0],
          )
          .join(""),
      );
      if (tick / 2 > text.length) {
        window.clearInterval(timer);
      }
    }, 28);
    return () => window.clearInterval(timer);
  }, [text, reduce]);
  return <>{shown}</>;
}

export function Network() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ref, live, inView] = useLiveInView("0px");
  const [size, setSize] = useState({
    w: 1200,
    h: 440,
    cell: 8,
    off: 0,
  });
  /** requests in flight: from (fx, fy) to region `to`, started at t0, `you` when the visitor sent it */
  const arcs = useRef<{ fx: number; fy: number; to: number; t0: number; dur: number; you?: boolean }[]>([]);
  /** rings drawn where a request landed */
  const pings = useRef<{ i: number; t0: number }[]>([]);
  const landRef = useRef<HTMLCanvasElement | null>(null);
  const [focus, setFocus] = useState(0);
  const [picked, setPicked] = useState<{ x: number; y: number; city: string; ms: number; k: number } | null>(null);
  const [rps, setRps] = useState(51480);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const mapWidth = Math.max(width, 820);
      const cell = mapWidth / LAND_MASK.cols;
      setSize({
        w: mapWidth,
        h: cell * LAND_MASK.rows,
        cell,
        off: (width - mapWidth) / 2,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const land = document.createElement("canvas");
    land.width = size.w * dpr;
    land.height = size.h * dpr;
    const ctx = land.getContext("2d")!;
    ctx.scale(dpr, dpr);
    LAND_CELLS.forEach(([col, row], i) => {
      const noise = Math.sin(i * 91.7) * 1e4;
      const shade = noise - Math.floor(noise);
      ctx.beginPath();
      ctx.arc((col + 0.5) * size.cell, (row + 0.5) * size.cell, size.cell * (0.16 + shade * 0.1), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(241,239,234,${0.1 + shade * 0.34})`;
      ctx.fill();
    });
    landRef.current = land;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = size.w * dpr;
      canvas.height = size.h * dpr;
    }
  }, [size]);
  useEffect(() => {
    if (!live) {
      return;
    }
    const timer = window.setInterval(() => setFocus((prev) => (prev + 1) % REGIONS.length), 2600);
    const rpsTimer = window.setInterval(
      () => setRps((prev) => Math.round(clamp(prev + (Math.random() - 0.48) * 2600, 46e3, 58e3))),
      1100,
    );
    return () => {
      window.clearInterval(timer);
      window.clearInterval(rpsTimer);
    };
  }, [live]);
  const lastSpawn = useRef(0);
  const lastFrame = useRef(0);
  useAnimationFrame((time) => {
    lastFrame.current = time;
    const canvas = canvasRef.current;
    const land = landRef.current;
    if (!canvas || !land || !inView) {
      return;
    }
    const ctx = canvas.getContext("2d")!;
    const scale = canvas.width / size.w;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.drawImage(land, 0, 0, size.w, size.h);
    const cell = size.cell;
    if (live && time - lastSpawn.current > 230) {
      lastSpawn.current = time;
      const [col, row] = LAND_CELLS[(Math.random() * LAND_CELLS.length) | 0];
      const [lat, lon] = fromGrid(col + 0.5, row + 0.5);
      arcs.current.push({
        fx: (col + 0.5) * cell,
        fy: (row + 0.5) * cell,
        to: nearestRegion(lat, lon).i,
        t0: time,
        dur: 900 + Math.random() * 500,
      });
    }
    for (let i = 0; i < 26; i++) {
      const index = (Math.floor(time / 900) * 131 + i * 977) % LAND_CELLS.length;
      const [col, row] = LAND_CELLS[index];
      const glow = 0.5 + 0.5 * Math.sin(time / 500 + i);
      ctx.beginPath();
      ctx.arc((col + 0.5) * cell, (row + 0.5) * cell, cell * 0.26, 0, 7);
      ctx.fillStyle = `rgba(63,224,197,${0.25 + glow * 0.5})`;
      ctx.fill();
    }
    arcs.current = arcs.current.filter((arc) => {
      const progress = (time - arc.t0) / arc.dur;
      if (progress > 1) {
        pings.current.push({
          i: arc.to,
          t0: time,
        });
        return false;
      }
      const [toX, toY] = toGrid(REGIONS[arc.to].lat, REGIONS[arc.to].lon).map((v) => v * cell);
      const ctrlX = (arc.fx + toX) / 2;
      const ctrlY = (arc.fy + toY) / 2 - Math.hypot(toX - arc.fx, toY - arc.fy) * 0.32 - 6;
      const head = 1 - Math.pow(1 - progress, 3);
      const tail = Math.max(0, head - 0.35);
      ctx.beginPath();
      for (let step = 0; step <= 16; step++) {
        const u = tail + ((head - tail) * step) / 16;
        const x = (1 - u) ** 2 * arc.fx + 2 * (1 - u) * u * ctrlX + u * u * toX;
        const y = (1 - u) ** 2 * arc.fy + 2 * (1 - u) * u * ctrlY + u * u * toY;
        if (step) {
          ctx.lineTo(x, y);
        } else {
          ctx.moveTo(x, y);
        }
      }
      const rgb = arc.you ? "246,178,75" : "63,224,197";
      ctx.strokeStyle = `rgba(${rgb},${arc.you ? 0.95 : 0.55})`;
      ctx.lineWidth = arc.you ? 2 : 1.1;
      ctx.stroke();
      const headX = (1 - head) ** 2 * arc.fx + 2 * (1 - head) * head * ctrlX + head * head * toX;
      const headY = (1 - head) ** 2 * arc.fy + 2 * (1 - head) * head * ctrlY + head * head * toY;
      ctx.beginPath();
      ctx.arc(headX, headY, arc.you ? 3 : 1.8, 0, 7);
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.fill();
      if (progress < 0.3) {
        ctx.beginPath();
        ctx.arc(arc.fx, arc.fy, cell * 0.3 + progress * 14, 0, 7);
        ctx.strokeStyle = `rgba(${rgb},${0.6 - progress * 2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      return true;
    });
    pings.current = pings.current.filter((ping) => {
      const age = (time - ping.t0) / 700;
      if (age > 1) {
        return false;
      }
      const [x, y] = toGrid(REGIONS[ping.i].lat, REGIONS[ping.i].lon).map((v) => v * cell);
      ctx.beginPath();
      ctx.arc(x, y, 4 + age * 16, 0, 7);
      ctx.strokeStyle = `rgba(106,169,255,${0.7 * (1 - age)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      return true;
    });
    REGIONS.forEach((region, i) => {
      const [x, y] = toGrid(region.lat, region.lon).map((v) => v * cell);
      ctx.beginPath();
      ctx.arc(x, y, i === focus ? 5 : 3.6, 0, 7);
      ctx.fillStyle = i === focus ? "#6AA9FF" : "rgba(106,169,255,.85)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, (i === focus ? 9 : 7) + Math.sin(time / 400 + i) * 1.5, 0, 7);
      ctx.strokeStyle = "rgba(106,169,255,.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  });
  const sendRequest = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const [lat, lon] = fromGrid(x / size.cell, y / size.cell);
    const hit = nearestRegion(lat, lon);
    arcs.current.push({
      fx: x,
      fy: y,
      to: hit.i,
      t0: lastFrame.current,
      dur: 1100,
      you: true,
    });
    setPicked({
      x,
      y,
      city: REGIONS[hit.i].city,
      ms: hit.ms,
      k: Date.now(),
    });
    setFocus(hit.i);
  };
  const focused = REGIONS[focus];
  const [focusX, focusY] = toGrid(focused.lat, focused.lon).map((v) => v * size.cell);
  return (
    <section id="network" ref={ref} className="relative pb-24 pt-10">
      <div className={`${CONTAINER} relative z-10`}>
        <div>
          <Reveal>
            <SectionLabel icon="ph:globe-hemisphere-west">Global network</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <SectionTitle className="max-w-[440px]">Every request lands close to home</SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button icon="ph:arrow-right" href="#pricing" size="sm">
                See all regions
              </Button>
              <span
                className="text-[12.5px]"
                style={{
                  color: DARK.soft,
                }}
              >
                Click the map to send a request.
              </span>
            </div>
          </Reveal>
        </div>
      </div>
      <div
        ref={wrapRef}
        className="relative mx-auto mt-6 max-w-[1440px] overflow-hidden"
        style={{
          height: size.h,
        }}
      >
        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-16"
          style={{
            background: `linear-gradient(${DARK.bg}, transparent)`,
          }}
        />
        <div
          className="absolute top-0"
          style={{
            left: size.off,
            width: size.w,
            height: size.h,
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={sendRequest}
            className="absolute inset-0 size-full cursor-crosshair"
            style={{
              width: size.w,
              height: size.h,
            }}
            aria-label="World map of Outpost regions. Click anywhere to send a request to the nearest region."
            role="img"
          />
          <div
            className="pointer-events-none absolute flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1 text-[11.5px] transition-[left,top] duration-500"
            style={{
              left: focusX + 12,
              top: focusY - 12,
              background: "rgba(9,9,11,.75)",
              backdropFilter: "blur(6px)",
              boxShadow: `inset 0 0 0 1px ${DARK.line2}`,
              fontFamily: FONT_MONO,
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{
                background: DARK.sky,
              }}
            />
            <span
              style={{
                color: DARK.ink,
              }}
            >
              <ScrambleText text={focused.city} />
            </span>
            <span
              style={{
                color: DARK.text,
              }}
            >
              {focused.ms}
              {" ms"}
            </span>
          </div>
          <AnimatePresence>
            {picked && (
              <motion.div
                key={picked.k}
                initial={{
                  opacity: 0,
                  y: 6,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 28,
                }}
                className="pointer-events-none absolute whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12px]"
                style={{
                  left: picked.x - 10,
                  top: picked.y + 12,
                  background: DARK.ink,
                  color: DARK.bg,
                  boxShadow: "0 10px 24px -8px rgba(0,0,0,.8)",
                }}
              >
                {"Your request went to "}
                <b className="font-[600]">{picked.city}</b>
                {" · "}
                {picked.ms}
                {" ms"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-5 flex gap-8 text-right sm:right-10">
          <div>
            <p
              className="text-[11.5px]"
              style={{
                color: DARK.soft,
              }}
            >
              Requests / sec
            </p>
            <p
              className="text-[22px] font-[500] tracking-[-0.02em]"
              style={{
                color: DARK.ink,
              }}
            >
              <AnimatedNumber value={rps} />
            </p>
          </div>
          <div>
            <p
              className="text-[11.5px]"
              style={{
                color: DARK.soft,
              }}
            >
              Regions live
            </p>
            <p
              className="text-[22px] font-[500]"
              style={{
                color: DARK.ink,
              }}
            >
              8
            </p>
          </div>
        </div>
      </div>
      <div className={`${CONTAINER} mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4`}>
        {[
          [
            "ph:globe",
            "One endpoint, eight regions",
            "Deploy once. Outpost serves the model from every region on the map.",
          ],
          [
            "ph:arrows-split",
            "Closest-region routing",
            "Each request goes to the nearest healthy region. No DNS to change.",
          ],
          [
            "ph:arrows-clockwise",
            "Failover in seconds",
            "If a region slows down, traffic moves to the next closest one.",
          ],
          [
            "ph:heartbeat",
            "GPU checks every 10 sec",
            "We test each GPU and drain bad hardware before it serves a token.",
          ],
        ].map(([label, value, note], i) => (
          <Reveal key={value} delay={i * 0.06}>
            <span
              style={{
                color: DARK.teal,
              }}
            >
              <Icon name={label} size={18} />
            </span>
            <p
              className="mt-4 text-[15px] font-[500]"
              style={{
                color: DARK.ink,
              }}
            >
              {value}
            </p>
            <p
              className="mt-1.5 text-[14px] leading-[1.55]"
              style={{
                color: DARK.text,
              }}
            >
              {note}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

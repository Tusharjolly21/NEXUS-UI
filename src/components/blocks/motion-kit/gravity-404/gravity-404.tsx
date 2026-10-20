"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import Matter from "matter-js";
import { cn } from "@/lib/utils";

export type Gravity404Action = "primary" | "secondary" | "nav";

export interface Gravity404Props {
  /** The big code, one falling piece per character. */
  code?: string;
  /** Headline under the code, one falling piece per word. */
  headline?: string;
  message?: string;
  /** Wordmark at the top left. */
  brand?: string;
  /** Nav link labels at the top right. */
  navLinks?: string[];
  primaryLabel?: string;
  secondaryLabel?: string;
  /** Toggle label while the page is intact. */
  fallLabel?: string;
  /** Toggle label once everything has fallen. */
  restoreLabel?: string;
  /** Hint shown at the top while the pieces are loose. */
  hint?: string;
  /** Drops the page and puts it back every 3.6 s until the visitor touches it. Off under reduced motion. */
  autoplay?: boolean;
  /** Called with the link or button that was pressed and its label. Nothing navigates on its own. */
  onAction?: (action: Gravity404Action, label: string) => void;
  className?: string;
}

type Piece = { el: HTMLElement; body: Matter.Body; cx: number; cy: number };

const STEP = 1000 / 60;
const piece = "inline-block will-change-transform";
const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black";

/**
 * A 404 page that lives up to its name. Press "Let it fall" (or just knock the
 * headline) and every piece of the page drops under gravity: digits, words,
 * buttons, even the nav. Bat them around with the cursor, grab and throw them,
 * then "Put it back" springs each one home in a ripple.
 */
export function Gravity404({
  code = "404",
  headline = "This page fell apart.",
  message = "The link might be old, or the page moved. Pick yourself up and try one of these.",
  brand = "Nexus",
  navLinks = ["Product", "Pricing", "Docs"],
  primaryLabel = "Go home",
  secondaryLabel = "Search the docs",
  fallLabel = "Let it fall",
  restoreLabel = "Put it back",
  hint = "Grab, throw, or swipe through them.",
  autoplay = false,
  onAction,
  className,
}: Gravity404Props) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const engine = useRef<Matter.Engine | null>(null);
  const pieces = useRef<Piece[]>([]);
  const cursor = useRef<Matter.Body | null>(null);
  const grab = useRef<Matter.Constraint | null>(null);
  const raf = useRef(0);
  const brokenRef = useRef(false);
  const touched = useRef(false);
  const visible = useRef(true);
  const prev = useRef({ x: 0, y: 0, t: 0 });
  const [broken, setBroken] = useState(false);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    grab.current = null;
    cursor.current = null;
    if (engine.current) {
      Matter.Composite.clear(engine.current.world, false, true);
      Matter.Engine.clear(engine.current);
    }
    engine.current = null;
  };

  const fall = (kick?: { x: number; y: number }) => {
    const box = root.current;
    if (!box || brokenRef.current) return;
    brokenRef.current = true;
    setBroken(true);
    const r0 = box.getBoundingClientRect();
    const W = r0.width;
    const H = r0.height;
    const e = Matter.Engine.create({ gravity: { x: 0, y: 1.2 } });
    engine.current = e;
    const wall = { isStatic: true, friction: 0.6 };
    Matter.Composite.add(e.world, [
      Matter.Bodies.rectangle(W / 2, H + 40, W * 2, 80, wall),
      Matter.Bodies.rectangle(-40, H / 2, 80, H * 3, wall),
      Matter.Bodies.rectangle(W + 40, H / 2, 80, H * 3, wall),
      Matter.Bodies.rectangle(W / 2, -H - 40, W * 2, 80, wall),
    ]);
    pieces.current = [...box.querySelectorAll<HTMLElement>("[data-piece]")].map((el, i) => {
      el.getAnimations().forEach((a) => a.cancel());
      el.style.transform = "";
      const r = el.getBoundingClientRect();
      const cx = r.left - r0.left + r.width / 2;
      const cy = r.top - r0.top + r.height / 2;
      const body = Matter.Bodies.rectangle(cx, cy, Math.max(1, r.width), Math.max(1, r.height), {
        chamfer: { radius: Math.max(0, Math.min(10, r.height / 2 - 0.5)) },
        restitution: 0.25,
        friction: 0.5,
        frictionAir: 0.01,
        density: 0.0015,
      });
      // A little nudge so things topple instead of dropping straight down.
      Matter.Body.setAngularVelocity(body, ((i % 7) - 3) * 0.004);
      if (kick) {
        const dx = cx - kick.x;
        const dy = cy - kick.y;
        const d = Math.hypot(dx, dy) + 40;
        Matter.Body.setVelocity(body, { x: (dx / d) * 9, y: (dy / d) * 9 - 4 });
      }
      return { el, body, cx, cy };
    });
    Matter.Composite.add(e.world, pieces.current.map((p) => p.body));
    cursor.current = Matter.Bodies.circle(-200, -200, 22, { isStatic: true });
    Matter.Composite.add(e.world, cursor.current);

    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      raf.current = requestAnimationFrame(loop);
      // Paused off screen or in a hidden tab; resume without a catch-up jump.
      if (!visible.current || document.hidden) {
        last = now;
        return;
      }
      // Fixed 60 Hz steps so slow frames don't turn into slow motion.
      acc += Math.min(100, now - last);
      last = now;
      for (let n = 0; acc >= STEP && n < 4; n++) {
        Matter.Engine.update(e, STEP);
        acc -= STEP;
      }
      if (acc > STEP) acc = 0;
      for (const p of pieces.current) {
        p.el.style.transform = `translate(${p.body.position.x - p.cx}px, ${p.body.position.y - p.cy}px) rotate(${p.body.angle}rad)`;
      }
    };
    raf.current = requestAnimationFrame(loop);
  };

  const restore = () => {
    if (!brokenRef.current) return;
    stop();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    pieces.current.forEach((p, i) => {
      const from = p.el.style.transform;
      p.el.style.transform = "";
      if (still || !from) return;
      p.el.animate([{ transform: from }, { transform: "translate(0,0) rotate(0rad)" }], {
        duration: 900,
        delay: i * 28,
        easing: "cubic-bezier(.2,1.25,.35,1)",
        fill: "backwards",
      });
    });
    brokenRef.current = false;
    setBroken(false);
  };

  const center = (fy: number, fx = 0.5) => {
    const r = root.current!.getBoundingClientRect();
    return { x: r.width * fx, y: r.height * fy };
  };
  const toggle = () => {
    touched.current = true;
    if (brokenRef.current) restore();
    else fall(center(0.3));
  };

  // Tear down on unmount; put everything back if the width changes (the layout under the pieces moved).
  const onWidth = useEffectEvent(() => restore());
  const teardown = useEffectEvent(() => stop());
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let w0 = el.offsetWidth;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      if (w === w0) return;
      w0 = w;
      onWidth();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
      teardown();
    };
  }, []);

  // Autoplay: fall, then put it back, every 3.6 s until someone touches the page.
  const autoStep = useEffectEvent((drop: boolean) => {
    if (drop) fall(center(0.45, 0.3));
    else restore();
  });
  useEffect(() => {
    if (!autoplay || reduce) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (!visible.current || document.hidden) return;
      autoStep(k++ % 2 === 0);
    }, 3600);
    return () => window.clearInterval(id);
  }, [autoplay, reduce]);

  const local = (e: ReactPointerEvent) => {
    const r = root.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const move = (e: ReactPointerEvent) => {
    const p = local(e);
    if (grab.current) {
      grab.current.pointA = p;
      return;
    }
    const c = cursor.current;
    if (!c || !engine.current) return;
    const now = performance.now();
    const dt = Math.max(8, now - prev.current.t);
    Matter.Body.setPosition(c, p);
    // Give the static cursor a velocity so collisions carry momentum.
    Matter.Body.setVelocity(c, { x: ((p.x - prev.current.x) / dt) * 16, y: ((p.y - prev.current.y) / dt) * 16 });
    prev.current = { ...p, t: now };
  };
  const down = (e: ReactPointerEvent) => {
    touched.current = true;
    const p = local(e);
    if (!brokenRef.current) {
      if ((e.target as HTMLElement).closest("[data-trigger]")) fall(p);
      return;
    }
    const hit = Matter.Query.point(
      pieces.current.map((x) => x.body),
      p,
    )[0];
    if (!hit || !engine.current) return;
    e.preventDefault();
    root.current!.setPointerCapture(e.pointerId);
    if (cursor.current) Matter.Body.setPosition(cursor.current, { x: -200, y: -200 });
    grab.current = Matter.Constraint.create({
      pointA: p,
      bodyB: hit,
      pointB: { x: p.x - hit.position.x, y: p.y - hit.position.y },
      stiffness: 0.2,
      damping: 0.1,
      length: 0,
    });
    Matter.Composite.add(engine.current.world, grab.current);
  };
  const up = () => {
    if (grab.current && engine.current) Matter.Composite.remove(engine.current.world, grab.current);
    grab.current = null;
  };
  const leave = () => {
    if (cursor.current) Matter.Body.setPosition(cursor.current, { x: -200, y: -200 });
  };
  const keyDown = (e: ReactKeyboardEvent) => {
    touched.current = true;
    if (e.key === "Escape" && brokenRef.current) {
      e.preventDefault();
      restore();
    }
  };
  const press = (action: Gravity404Action, label: string) => (e: ReactMouseEvent) => {
    e.preventDefault();
    onAction?.(action, label);
  };

  const words = headline.split(" ").filter(Boolean);

  return (
    <div
      ref={root}
      className={cn(
        "@container relative flex min-h-[560px] w-full flex-col overflow-hidden bg-white dark:bg-black",
        broken && "cursor-grab touch-none select-none",
        className,
      )}
      onPointerMove={move}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerLeave={leave}
      onKeyDown={keyDown}
    >
      <nav className="flex items-center justify-between gap-3 px-6 py-5 @2xl:px-10" aria-label="Site">
        <span data-piece className={cn(piece, "flex items-center gap-2 text-[15px] font-semibold", ink)}>
          <span className="h-6 w-6 rounded-[7px] bg-[#1d1d1f] dark:bg-[#f5f5f7]" aria-hidden="true" />
          {brand}
        </span>
        <div className="flex gap-1.5">
          {navLinks.map((l, i) => (
            <a
              key={`${i}-${l}`}
              data-piece
              href="#"
              onClick={press("nav", l)}
              className={cn(piece, "rounded-full px-3 py-1.5 text-[13px] hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e]", ink, focusRing)}
            >
              {l}
            </a>
          ))}
        </div>
      </nav>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <div
          data-trigger
          role="img"
          aria-label={code}
          title={broken ? undefined : "Knock it over"}
          className={cn(
            "flex gap-1 text-[clamp(110px,22cqi,220px)] font-semibold leading-[0.8] tracking-[-0.06em]",
            ink,
            !broken && "cursor-pointer",
          )}
        >
          {[...code].map((d, i) => (
            <span key={i} data-piece className={cn(piece, "py-2")}>
              {d}
            </span>
          ))}
        </div>
        <h1 className={cn("m-0 mt-6 text-[clamp(26px,4cqi,40px)] font-semibold tracking-[-0.03em]", ink)}>
          <span className="sr-only">{headline}</span>
          <span className="flex flex-wrap justify-center gap-x-[0.28em]" aria-hidden="true">
            {words.map((w, i) => (
              <span key={i} data-piece className={piece}>
                {w}
              </span>
            ))}
          </span>
        </h1>
        <p data-piece className={cn(piece, "m-0 mt-3 max-w-[440px] text-[17px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]")}>
          {message}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            data-piece
            href="#"
            onClick={press("primary", primaryLabel)}
            className={cn(piece, "rounded-full bg-[#0071e3] px-5 py-3 text-[15px] font-medium text-white dark:bg-[#0a84ff]", focusRing)}
          >
            {primaryLabel}
          </a>
          <a
            data-piece
            href="#"
            onClick={press("secondary", secondaryLabel)}
            className={cn(piece, "rounded-full bg-[#f0f0f3] px-5 py-3 text-[15px] font-medium dark:bg-[#2c2c2e]", ink, focusRing)}
          >
            {secondaryLabel}
          </a>
        </div>
      </div>
      <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2">
        <motion.button
          type="button"
          layout={!reduce}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={toggle}
          whileTap={reduce ? undefined : { scale: 0.95 }}
          className="flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,.6)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-black dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,.9)] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        >
          <motion.svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ rotate: broken ? -180 : 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 18 }}
            aria-hidden="true"
          >
            <path d="M12 4v13M6 11l6 6 6-6" />
          </motion.svg>
          {broken ? restoreLabel : fallLabel}
        </motion.button>
      </div>
      {broken && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] text-[#6e6e73] dark:bg-[#1c1c1e] dark:text-[#a1a1a6]"
        >
          {hint}
        </span>
      )}
      <p className="sr-only" aria-live="polite">
        {broken ? `Everything fell. Use "${restoreLabel}" or press Escape to restore the page.` : ""}
      </p>
    </div>
  );
}

"use client";

import * as React from "react";

/**
 * A scripted "ghost" cursor that shows people how a preview is meant to be used.
 *
 * It glides between points (given as fractions of its parent box), and can press, drag and
 * release on whatever sits under it, so the component reacts exactly as it would to a real
 * pointer. It only plays while the preview is on screen and nobody is touching it, steps aside
 * the moment a real pointer enters, comes back after a pause, and never runs for people who ask
 * for reduced motion.
 *
 * Preview-only helper: it is not part of any installable component.
 */
export type DemoStep = {
  /** Horizontal position as a fraction of the parent's width (0–1). Omit to stay put. */
  x?: number;
  /** Vertical position as a fraction of the parent's height (0–1). Omit to stay put. */
  y?: number;
  /** Travel time to this point, in ms. */
  ms?: number;
  /** Pause after arriving, in ms. */
  wait?: number;
  /** Pointer action performed on arrival. `click` = down + up. */
  action?: "down" | "up" | "click";
};

type Props = {
  script: DemoStep[];
  /** Pause before the script starts again, in ms. */
  loopDelay?: number;
  /** Delay before the very first run, in ms. */
  startDelay?: number;
  /** Pause after a real pointer leaves before the demo resumes, in ms. */
  resumeAfter?: number;
  /** Cursor colour. */
  color?: string;
  className?: string;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function fire(target: Element, type: string, x: number, y: number, buttons: number) {
  const init: PointerEventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: x,
    clientY: y,
    pointerId: 71,
    pointerType: "mouse",
    isPrimary: true,
    button: type.endsWith("down") || type.endsWith("up") || type === "click" ? 0 : -1,
    buttons,
  };
  if (type.startsWith("pointer")) target.dispatchEvent(new PointerEvent(type, init));
  else target.dispatchEvent(new MouseEvent(type, init));
}

export function DemoCursor({
  script,
  loopDelay = 1400,
  startDelay = 700,
  resumeAfter = 2600,
  color = "#6d5cff",
  className,
}: Props) {
  const anchorRef = React.useRef<HTMLSpanElement | null>(null);
  const cursorRef = React.useRef<HTMLDivElement | null>(null);
  // Never during SSR (previews mount client-side), never for reduced motion, never in the tile lab
  // (it measures the component itself, not the demo).
  const [enabled] = React.useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !document.documentElement.hasAttribute("data-tile-lab"),
  );

  React.useEffect(() => {
    if (!enabled) return;
    const anchor = anchorRef.current;
    const cursor = cursorRef.current;
    const host = anchor?.parentElement;
    if (!anchor || !cursor || !host) return;

    let raf = 0;
    let timer = 0;
    let visible = false;
    let userInside = false;
    let pressed = false;
    let lastTarget: Element | null = null;
    let pos = { x: 0.5, y: 0.62 };
    let stopped = false;

    const point = () => {
      const r = host.getBoundingClientRect();
      return { x: r.left + pos.x * r.width, y: r.top + pos.y * r.height, r };
    };

    const under = (x: number, y: number) => {
      cursor.style.visibility = "hidden";
      const el = document.elementFromPoint(x, y);
      cursor.style.visibility = "";
      return el && host.contains(el) ? el : null;
    };

    const place = () => {
      const { x, y, r } = point();
      const scale = r.width / host.offsetWidth || 1; // host may be scaled down inside a tile
      // counter-scale so the cursor keeps its real size when the preview is shrunk into a tile
      cursor.style.transform = `translate(${(x - r.left) / scale}px, ${(y - r.top) / scale}px) scale(${Math.min(4, 1 / scale)})`;
      const el = under(x, y);
      if (el) {
        if (el !== lastTarget) {
          if (lastTarget) {
            fire(lastTarget, "pointerout", x, y, pressed ? 1 : 0);
            fire(lastTarget, "mouseout", x, y, pressed ? 1 : 0);
          }
          fire(el, "pointerover", x, y, pressed ? 1 : 0);
          fire(el, "pointerenter", x, y, pressed ? 1 : 0);
          fire(el, "mouseover", x, y, pressed ? 1 : 0);
          fire(el, "mouseenter", x, y, pressed ? 1 : 0);
          lastTarget = el;
        }
        fire(el, "pointermove", x, y, pressed ? 1 : 0);
        fire(el, "mousemove", x, y, pressed ? 1 : 0);
      }
      if (pressed) {
        // drag libraries listen on the window once a press starts
        window.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, pointerId: 71, pointerType: "mouse", isPrimary: true, buttons: 1, bubbles: true }));
      }
    };

    const act = (action: DemoStep["action"]) => {
      const { x, y } = point();
      const el = under(x, y) ?? lastTarget;
      if (!el) return;
      if (action === "down" || action === "click") {
        pressed = true;
        cursor.dataset.pressed = "true";
        fire(el, "pointerdown", x, y, 1);
        fire(el, "mousedown", x, y, 1);
      }
      if (action === "up" || action === "click") {
        pressed = false;
        cursor.dataset.pressed = "false";
        fire(el, "pointerup", x, y, 0);
        fire(el, "mouseup", x, y, 0);
        window.dispatchEvent(new PointerEvent("pointerup", { clientX: x, clientY: y, pointerId: 71, pointerType: "mouse", isPrimary: true, bubbles: true }));
        fire(el, "click", x, y, 0);
      }
    };

    const release = () => {
      if (!pressed) return;
      act("up");
    };

    const leaveTarget = () => {
      if (!lastTarget) return;
      const { x, y } = point();
      fire(lastTarget, "pointerout", x, y, 0);
      fire(lastTarget, "pointerleave", x, y, 0);
      fire(lastTarget, "mouseout", x, y, 0);
      fire(lastTarget, "mouseleave", x, y, 0);
      lastTarget = null;
    };

    const show = (on: boolean) => {
      cursor.style.opacity = on ? "1" : "0";
    };

    const run = (i: number) => {
      if (stopped || userInside || !visible) return;
      if (i >= script.length) {
        release();
        leaveTarget();
        show(false);
        timer = window.setTimeout(() => {
          pos = { x: 0.5, y: 0.62 };
          run(0);
        }, loopDelay);
        return;
      }
      show(true);
      const step = script[i];
      const from = { ...pos };
      const to = { x: step.x ?? pos.x, y: step.y ?? pos.y };
      const ms = step.ms ?? (from.x === to.x && from.y === to.y ? 0 : 650);
      const start = performance.now();
      const tick = (now: number) => {
        if (stopped || userInside) return;
        const t = ms === 0 ? 1 : Math.min(1, (now - start) / ms);
        const k = ease(t);
        pos = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
        place();
        if (t < 1) {
          raf = requestAnimationFrame(tick);
          return;
        }
        if (step.action) act(step.action);
        timer = window.setTimeout(() => run(i + 1), step.wait ?? 120);
      };
      raf = requestAnimationFrame(tick);
    };

    const halt = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      release();
      leaveTarget();
      show(false);
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerId === 71) return;
      userInside = true;
      halt();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerId === 71) return;
      userInside = false;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => run(0), resumeAfter);
    };
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && !userInside) {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => run(0), startDelay);
      }
      if (!visible && was) halt();
    });
    io.observe(host);

    return () => {
      stopped = true;
      halt();
      io.disconnect();
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, script, loopDelay, startDelay, resumeAfter]);

  if (!enabled) return null;

  return (
    <>
      <span ref={anchorRef} hidden />
      <div
        ref={cursorRef}
        aria-hidden
        data-pressed="false"
        className={
          "pointer-events-none absolute left-0 top-0 z-50 origin-top-left opacity-0 transition-opacity duration-300 [&[data-pressed=true]_svg]:scale-[0.86] " +
          (className ?? "")
        }
        style={{ willChange: "transform" }}
      >
        <svg
          width="22"
          height="24"
          viewBox="0 0 22 24"
          className="-translate-x-[3px] -translate-y-[2px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-transform duration-150"
        >
          <path
            d="M3 2.2v17.6c0 .7.8 1 1.3.5l4.2-4.3 2.9 6.3c.2.5.8.7 1.3.5l2-.9c.5-.2.7-.8.5-1.3l-2.9-6.2h6c.7 0 1-.8.5-1.3L4.3 1.7C3.8 1.2 3 1.5 3 2.2Z"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}

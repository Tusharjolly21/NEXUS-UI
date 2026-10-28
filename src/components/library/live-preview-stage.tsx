"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

/** Width components are laid out at before being scaled: the width the catalog designs for. */
const BASE_WIDTH = 1152;
const MAX_SCALE = 3;
const MIN_SCALE = 0.15;

type Box = { left: number; top: number; right: number; bottom: number };

const REPLACED = new Set(["IMG", "SVG", "CANVAS", "VIDEO", "IFRAME", "INPUT", "TEXTAREA", "SELECT", "BUTTON"]);

function paintsBox(el: Element, cs: CSSStyleDeclaration) {
  if (REPLACED.has(el.tagName.toUpperCase())) return true;
  if (cs.backgroundImage !== "none") return true;
  const bg = cs.backgroundColor;
  if (bg && bg !== "transparent" && !/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(bg)) return true;
  if (cs.boxShadow !== "none") return true;
  for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
    if (parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Style`] !== "none") return true;
  }
  return false;
}

function grow(box: Box | null, r: { left: number; top: number; right: number; bottom: number }): Box {
  if (!box) return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
  return {
    left: Math.min(box.left, r.left),
    top: Math.min(box.top, r.top),
    right: Math.max(box.right, r.right),
    bottom: Math.max(box.bottom, r.bottom),
  };
}

/**
 * The box the visitor actually sees: the union of everything that paints (backgrounds, borders,
 * images, text), so empty layout wrappers and off-screen decoration don't count. Elements that
 * clip their children (overflow hidden/auto) count as one box, which also keeps a spinning 3D
 * ring or a moving marquee from changing the size from frame to frame. Returns `fixed: true`
 * when something is position:fixed, since a transformed parent would move it.
 */
export function measureContent(root: HTMLElement): { box: Box | null; fixed: boolean } {
  let box: Box | null = null;
  let fixed = false;
  const walk = (el: Element) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    if (cs.position === "fixed") {
      fixed = true;
      return;
    }
    // Decoration that doesn't take part in layout (glows, grain, hit areas)
    if (cs.position === "absolute" && cs.pointerEvents === "none" && el !== root) return;
    if (el !== root && el.getAttribute("aria-hidden") === "true" && cs.position === "absolute") return;
    const r = el.getBoundingClientRect();
    const clips = cs.overflowX !== "visible" || cs.overflowY !== "visible";
    if (el !== root && r.width > 0 && r.height > 0 && (paintsBox(el, cs) || clips)) {
      box = grow(box, r);
      if (clips || el.tagName.toUpperCase() === "SVG") return;
    }
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === 3 && node.textContent && node.textContent.trim()) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const tr = range.getBoundingClientRect();
        if (tr.width > 0 && tr.height > 0) box = grow(box, tr);
      } else if (node.nodeType === 1) {
        walk(node as Element);
      }
    }
  };
  walk(root);
  return { box, fixed };
}

type Fit = { scale: number; x: number; y: number; ready: boolean };

/**
 * Full-window preview. The component is laid out at its design width, measured, then scaled and
 * centred so it fills the screen without leaving it: a small card grows to fill a desktop, a tall
 * one shrinks to fit a phone, and landscape works the same way. Nothing scrolls.
 */
export function LivePreviewStage({ children }: { children: React.ReactNode }) {
  const stage = React.useRef<HTMLDivElement>(null);
  const inner = React.useRef<HTMLDivElement>(null);
  const [fit, setFit] = React.useState<Fit>({ scale: 1, x: 0, y: 0, ready: false });
  const [baseWidth, setBaseWidth] = React.useState(BASE_WIDTH);
  const scaleRef = React.useRef(1);

  React.useEffect(() => {
    const st = stage.current;
    const el = inner.current;
    if (!st || !el) return;
    let frame = 0;
    let timers: number[] = [];

    const run = () => {
      const sw = st.clientWidth;
      const sh = st.clientHeight;
      if (!sw || !sh) return;
      const pad = Math.max(12, Math.min(40, sw * 0.03));
      const availW = sw - pad * 2;
      const availH = sh - pad * 2;
      const width = Math.max(240, Math.min(BASE_WIDTH, availW));
      setBaseWidth((w) => (w === width ? w : width));
      // Measure at scale 1 and the new width, then restore.
      const prevT = el.style.transform;
      const prevW = el.style.width;
      el.style.transition = "none";
      el.style.transform = "none";
      el.style.width = `${width}px`;
      const { box, fixed } = measureContent(el);
      const origin = el.getBoundingClientRect();
      el.style.transform = prevT;
      el.style.width = prevW;
      if (fixed || !box) {
        setFit((f) => (f.scale === 1 && f.x === 0 && f.y === 0 && f.ready ? f : { scale: 1, x: 0, y: 0, ready: true }));
        scaleRef.current = 1;
        return;
      }
      const b = box as Box;
      const bx = b.left - origin.left;
      const by = b.top - origin.top;
      const bw = Math.max(1, b.right - b.left);
      const bh = Math.max(1, b.bottom - b.top);
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(availW / bw, availH / bh)));
      const x = (sw - bw * scale) / 2 - bx * scale;
      const y = (sh - bh * scale) / 2 - by * scale;
      setFit((f) => {
        // Ignore sub-pixel jitter once placed so a settled preview doesn't shimmer
        if (f.ready && Math.abs(f.scale - scale) < 0.004 && Math.abs(f.x - x) < 1 && Math.abs(f.y - y) < 1) return f;
        return { scale, x, y, ready: true };
      });
      scaleRef.current = scale;
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    };

    schedule();
    // Entrance animations change the box for a moment; settle on the final size.
    timers = [350, 900, 1800, 3200].map((ms) => window.setTimeout(schedule, ms));
    const ro = new ResizeObserver(schedule);
    ro.observe(st);
    ro.observe(el);
    window.addEventListener("orientationchange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      ro.disconnect();
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);

  // Dragging inside a scaled parent would otherwise move things by `scale` times the pointer
  const correctPoint = React.useCallback(
    (p: { x: number; y: number }) => ({ x: p.x / scaleRef.current, y: p.y / scaleRef.current }),
    [],
  );

  return (
    <div ref={stage} className="fixed inset-0 overflow-hidden" data-live-stage>
      <div
        ref={inner}
        data-live-inner
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{
          width: baseWidth,
          transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
          opacity: fit.ready ? 1 : 0,
          transition: fit.ready ? "transform 280ms cubic-bezier(.2,.7,.2,1), opacity 160ms" : "none",
        }}
      >
        <MotionConfig transformPagePoint={correctPoint}>
          <div className="flex w-full justify-center">{children}</div>
        </MotionConfig>
      </div>
    </div>
  );
}

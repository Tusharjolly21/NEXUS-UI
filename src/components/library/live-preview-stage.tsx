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
    // Screen-reader-only text is clipped to nothing even when a table ignores its 1px size
    if (cs.position === "absolute" && (/inset\(\s*50%/.test(cs.clipPath) || /rect\(\s*0(px)?,\s*0(px)?,\s*0(px)?,\s*0(px)?\s*\)/.test(cs.clip))) return;
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

/**
 * Some previews are driven by the page's own scroll (a progress bar, a marquee that reacts to
 * scroll speed, a sticky story). Those must be able to scroll the window, so they can't live
 * in a fixed, scaled stage. Components register their listeners in effects, which run after this
 * module loads, so a small probe on addEventListener sees them without each component opting in.
 */
let windowScrollWatchers = 0;
function probeWindowScroll() {
  const proto = EventTarget.prototype;
  const original = proto.addEventListener;
  proto.addEventListener = function (this: EventTarget, type: string, ...rest: unknown[]) {
    if (type === "scroll" && (this === window || this === document || this === document.documentElement || this === document.body)) {
      windowScrollWatchers += 1;
    }
    return (original as (...a: unknown[]) => void).call(this, type, ...rest);
  } as typeof proto.addEventListener;
  return () => {
    proto.addEventListener = original;
  };
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
  const [scrollMode, setScrollMode] = React.useState(false);
  const scaleRef = React.useRef(1);
  // Everything the component has covered so far (relative to its own top-left, at scale 1).
  // A demo that swings or grows after mount widens it, so the scale only ever tightens and the
  // result is steady instead of breathing with the animation.
  const seen = React.useRef<{ width: number; box: Box; recent: Box[] } | null>(null);

  // Installed before any child effect can run (children mount first, so a probe in this
  // component's effect would be too late; a layout-time module probe is not).
  React.useInsertionEffect(() => {
    windowScrollWatchers = 0;
    return probeWindowScroll();
  }, []);

  React.useEffect(() => {
    const st = stage.current;
    const el = inner.current;
    if (!st || !el) return;
    let frame = 0;
    let timers: number[] = [];
    const startedAt = performance.now();

    const run = () => {
      if (windowScrollWatchers > 0) {
        setScrollMode((m) => (m ? m : true));
        return;
      }
      const sw = st.clientWidth;
      const sh = st.clientHeight;
      if (!sw || !sh) return;
      const pad = Math.max(12, Math.min(40, sw * 0.03));
      const availW = sw - pad * 2;
      const availH = sh - pad * 2;
      const width = Math.max(240, Math.min(BASE_WIDTH, availW));
      // A width change re-lays the component out; measure again once it has (the resize
      // observer on the inner box schedules that).
      if (Math.abs(el.offsetWidth - width) > 0.5) {
        setBaseWidth((w) => (w === width ? w : width));
        return;
      }
      // Measure in place. Switching the transform off to measure and back on would make the
      // browser animate from the unscaled state each time, which reads as flicker; instead
      // read the rects as they are and divide the current scale back out.
      const { box, fixed } = measureContent(el);
      const origin = el.getBoundingClientRect();
      const cur = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      const k = cur.a > 0.01 ? cur.a : 1;
      if (fixed || !box) {
        setFit((f) => (f.scale === 1 && f.x === 0 && f.y === 0 && f.ready ? f : { scale: 1, x: 0, y: 0, ready: true }));
        scaleRef.current = 1;
        return;
      }
      const m = box as Box;
      const local: Box = {
        left: (m.left - origin.left) / k,
        top: (m.top - origin.top) / k,
        right: (m.right - origin.left) / k,
        bottom: (m.bottom - origin.top) / k,
      };
      const prev = seen.current;
      // Entrance animations start displaced; don't let that early shape stick
      const settling = performance.now() - startedAt < 1000;
      const fresh = settling || !prev || prev.width !== width;
      // Only what three samples in a row all cover (about a second) widens the box. Something
      // that really grew (a pill that gained an avatar, an island that opened) is in all of
      // them; a card thrown across the stage for a moment is not, so it can't shrink everything.
      const window3 = [...(prev && !fresh ? prev.recent : []), local];
      const both: Box | null =
        fresh || window3.length < 3
          ? null
          : {
              left: Math.max(...window3.map((b) => b.left)),
              top: Math.max(...window3.map((b) => b.top)),
              right: Math.min(...window3.map((b) => b.right)),
              bottom: Math.min(...window3.map((b) => b.bottom)),
            };
      const hasBoth = both && both.right > both.left && both.bottom > both.top;
      const merged = fresh ? local : hasBoth ? grow(prev.box, both) : prev.box;
      const fitOf = (b: Box) =>
        Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(availW / Math.max(1, b.right - b.left), availH / Math.max(1, b.bottom - b.top))));
      seen.current = { width, box: merged, recent: window3.slice(-2) };
      const bx = merged.left;
      const by = merged.top;
      const bw = Math.max(1, merged.right - merged.left);
      const bh = Math.max(1, merged.bottom - merged.top);
      const scale = fitOf(merged);
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
    // Entrance animations and autoplay demos change the box for a while; keep checking early on.
    timers = Array.from({ length: 44 }, (_, i) => 350 * (i + 1)).map((ms) => window.setTimeout(schedule, ms));
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
    <div
      ref={stage}
      className={scrollMode ? "relative min-h-dvh p-4 md:p-8" : "fixed left-0 top-0 w-full overflow-hidden"}
      // svh, not dvh: the small viewport height doesn't change when a phone's address bar slides
      // away, so the preview doesn't re-fit (and visibly jump) as the visitor touches the page.
      style={scrollMode ? undefined : { height: "100svh" }}
      data-live-stage
      data-mode={scrollMode ? "scroll" : "fit"}
    >
      <div
        ref={inner}
        data-live-inner
        className={scrollMode ? "mx-auto" : "absolute left-0 top-0 origin-top-left"}
        style={
          scrollMode
            ? { width: "100%", maxWidth: 1280 }
            : {
                width: baseWidth,
                transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
                opacity: fit.ready ? 1 : 0,
                transition: fit.ready ? "opacity 160ms" : "none",
              }
        }
      >
        <MotionConfig transformPagePoint={scrollMode ? undefined : correctPoint}>
          <div className="flex w-full justify-center">{children}</div>
        </MotionConfig>
      </div>
    </div>
  );
}

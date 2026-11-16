"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion";
import { PALETTE_NAMES, modelById, styleName } from "./data";
import { COLORS, FONT_MONO, SPRING_SOFT, clamp, formatAgo } from "./theme";
import type { Img, ViewerActs } from "./types";
import { Icon, IconButton } from "./ui";

type Pointer = { x: number; y: number };

/**
 * The print at full size: wheel or pinch to zoom around the cursor, drag to pan, double-click to jump in.
 * Zoom and pan live in motion values, so none of it re-renders React.
 */
function ZoomCanvas({ im: img }: { im: Img }) {
  const stage = useRef<HTMLDivElement>(null);
  const zoom = useMotionValue(1);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const [fit, setFit] = useState({
    w: 0,
    h: 0,
  });
  const pointers = useRef(new Map<number, Pointer>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const dragFrom = useRef<Pointer | null>(null);
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) {
      return;
    }
    const measure = () => {
      const roomW = el.clientWidth - (el.clientWidth > 700 ? 150 : 32);
      const roomH = el.clientHeight - (el.clientWidth > 700 ? 110 : 90);
      const ratio = img.h / img.w;
      const w = Math.min(roomW, roomH / ratio);
      setFit({
        w,
        h: w * ratio,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [img]);
  /** Keep the zoomed print from being dragged off screen. */
  const clampPan = useCallback(
    (scale: number, x: number, y: number) => {
      const el = stage.current;
      if (!el) {
        return [x, y];
      }
      const maxX = Math.max(0, (fit.w * scale - el.clientWidth) / 2 + 24);
      const maxY = Math.max(0, (fit.h * scale - el.clientHeight) / 2 + 24);
      return [clamp(x, -maxX, maxX), clamp(y, -maxY, maxY)];
    },
    [fit],
  );
  /** Zoom to a level while keeping the point under (clientX, clientY) still. */
  const zoomAt = useCallback(
    (level: number, clientX: number, clientY: number, smooth = false) => {
      const el = stage.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const fromCenterX = clientX - rect.left - rect.width / 2;
      const fromCenterY = clientY - rect.top - rect.height / 2;
      const next = clamp(level, 1, 6);
      const factor = next / zoom.get();
      const [x, y] = clampPan(
        next,
        fromCenterX - (fromCenterX - panX.get()) * factor,
        fromCenterY - (fromCenterY - panY.get()) * factor,
      );
      if (smooth) {
        animate(zoom, next, SPRING_SOFT);
        animate(panX, x, SPRING_SOFT);
        animate(panY, y, SPRING_SOFT);
      } else {
        zoom.set(next);
        panX.set(x);
        panY.set(y);
      }
    },
    [zoom, panX, panY, clampPan],
  );
  useEffect(() => {
    zoom.set(1);
    panX.set(0);
    panY.set(0);
  }, [img.id, zoom, panX, panY]);
  useEffect(() => {
    const el = stage.current;
    if (!el) {
      return;
    }
    // A native listener, because React's wheel handler is passive and cannot stop the page scrolling.
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomAt(zoom.get() * Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0012)), event.clientX, event.clientY);
    };
    el.addEventListener("wheel", onWheel, {
      passive: false,
    });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, zoom]);
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    (event.target as Element).setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    dragFrom.current = {
      x: event.clientX,
      y: event.clientY,
    };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        zoom: zoom.get(),
      };
    }
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) {
      return;
    }
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      zoomAt(
        pinch.current.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.dist),
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
      );
      return;
    }
    if (dragFrom.current && zoom.get() > 1.001) {
      const [x, y] = clampPan(
        zoom.get(),
        panX.get() + event.clientX - dragFrom.current.x,
        panY.get() + event.clientY - dragFrom.current.y,
      );
      panX.set(x);
      panY.set(y);
    }
    dragFrom.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) {
      pinch.current = null;
    }
    dragFrom.current = pointers.current.size ? [...pointers.current.values()][0] : null;
  };
  const [zoomed, setZoomed] = useState(false);
  useMotionValueEvent(zoom, "change", (level) => setZoomed(level > 1.01));
  return (
    <div
      ref={stage}
      data-testid="zoom-stage"
      className="relative size-full touch-none select-none overflow-hidden"
      style={{
        cursor: zoomed ? "grab" : "zoom-in",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(event) => zoomAt(zoom.get() > 1.2 ? 1 : 2.5, event.clientX, event.clientY, true)}
    >
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{
          width: fit.w,
          height: fit.h,
          marginLeft: -fit.w / 2,
          marginTop: -fit.h / 2,
          x: panX,
          y: panY,
          scale: zoom,
        }}
      >
        <motion.img
          layoutId={`g-${img.id}`}
          src={img.url}
          alt={img.title}
          draggable={false}
          className="size-full rounded-[6px] object-cover"
          style={{
            boxShadow: "0 30px 80px -20px rgba(0,0,0,.7)",
            imageRendering: img.spec.style === "pixel" ? "pixelated" : "auto",
          }}
          transition={SPRING_SOFT}
        />
      </motion.div>
      <ZoomBar
        s={zoom}
        onSet={(level) => {
          const rect = stage.current?.getBoundingClientRect();
          if (rect) {
            zoomAt(level, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
          }
        }}
      />
    </div>
  );
}

/** Zoom out, the current level, zoom in, and fit. */
function ZoomBar({ s: zoom, onSet }: { s: MotionValue<number>; onSet: (level: number) => void }) {
  const [shown, setShown] = useState(1);
  useMotionValueEvent(zoom, "change", setShown);
  return (
    <div
      className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full p-1 backdrop-blur-xl"
      style={{
        background: "rgba(20,18,16,.72)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)",
        color: "#E9E3DA",
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => onSet(shown / 1.5)}
        className="grid size-8 place-items-center rounded-full hover:bg-white/10"
      >
        <Icon name="ph:minus" size={14} />
      </button>
      <span
        className="w-12 text-center text-[12px] tabular-nums"
        style={{
          fontFamily: FONT_MONO,
        }}
        aria-live="polite"
      >
        {Math.round(shown * 100)}%
      </span>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => onSet(shown * 1.5)}
        className="grid size-8 place-items-center rounded-full hover:bg-white/10"
      >
        <Icon name="ph:plus" size={14} />
      </button>
      <span className="mx-1 h-4 w-px bg-white/15" />
      <button
        type="button"
        aria-label="Fit to screen"
        onClick={() => onSet(1)}
        className="grid size-8 place-items-center rounded-full hover:bg-white/10"
      >
        <Icon name="ph:corners-in" size={14} />
      </button>
    </div>
  );
}

type ViewerProps = {
  im: Img;
  now: number;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  acts: ViewerActs;
  onUse: () => void;
  onRemix: () => void;
  copy: (text: string) => void;
};

/** Full-screen view of one print with its prompt, details and actions. Arrow keys step through the gallery. */
export function Viewer({ im: img, now, onClose, onPrev, onNext, acts, onUse, onRemix, copy }: ViewerProps) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft" && onPrev) {
        onPrev();
      }
      if (event.key === "ArrowRight" && onNext) {
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);
  const ago = formatAgo(img.at, now);
  const details: [string, ReactNode][] = [
    ["Style", styleName(img.spec.style)],
    ["Palette", PALETTE_NAMES[img.palette]],
    [
      "Seed",
      <span
        key="s"
        style={{
          fontFamily: FONT_MONO,
        }}
      >
        {img.spec.seed}
      </span>,
    ],
    [
      "Size",
      <span
        key="z"
        style={{
          fontFamily: FONT_MONO,
        }}
      >
        {img.w}
        {" × "}
        {img.h}
      </span>,
    ],
    ["Aspect", img.spec.aspect],
    ["Model", modelById(img.model).name],
  ];
  return (
    <motion.div
      role="dialog"
      aria-modal={true}
      aria-label={img.title}
      className="fixed inset-0 z-[70] flex flex-col lg:flex-row"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.2,
        },
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(8,7,6,.86)",
          backdropFilter: "blur(18px)",
        }}
        onClick={onClose}
      />
      <div className="relative min-h-0 flex-1">
        <ZoomCanvas im={img} />
        <div className="absolute left-3 top-3 flex gap-1">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="grid size-9 place-items-center rounded-full backdrop-blur-xl hover:bg-white/15"
            style={{
              background: "rgba(20,18,16,.6)",
              color: "#EEE8DF",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)",
            }}
          >
            <Icon name="ph:x" size={16} />
          </button>
        </div>
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full backdrop-blur-xl hover:bg-white/15"
            style={{
              background: "rgba(20,18,16,.55)",
              color: "#EEE8DF",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)",
            }}
          >
            <Icon name="ph:caret-left" size={16} />
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full backdrop-blur-xl hover:bg-white/15"
            style={{
              background: "rgba(20,18,16,.55)",
              color: "#EEE8DF",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)",
            }}
          >
            <Icon name="ph:caret-right" size={16} />
          </button>
        )}
      </div>
      <motion.aside
        initial={{
          x: 40,
          opacity: 0,
        }}
        animate={{
          x: 0,
          opacity: 1,
        }}
        exit={{
          x: 40,
          opacity: 0,
        }}
        transition={SPRING_SOFT}
        className="dr-viewer thin relative max-h-[44vh] w-full overflow-y-auto lg:max-h-none lg:w-[360px]"
        style={{
          background: COLORS.panel,
          boxShadow: `-1px 0 0 ${COLORS.line}`,
        }}
      >
        <div className="p-5">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h2
                className="text-[19px] font-[600] tracking-[-0.02em]"
                style={{
                  color: COLORS.ink,
                }}
              >
                {img.title}
              </h2>
              <p
                className="mt-0.5 text-[12.5px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                {"Developed "}
                {ago === "now" ? "just now" : ago + (ago.length <= 3 ? " ago" : "")}
              </p>
            </div>
            <IconButton
              icon={img.fav ? "ph:heart-fill" : "ph:heart"}
              label={img.fav ? "Remove from favourites" : "Add to favourites"}
              pressed={img.fav}
              onClick={() => acts.fav(img.id)}
              style={
                img.fav
                  ? {
                      color: COLORS.acc,
                    }
                  : undefined
              }
            />
            <IconButton icon="ph:download-simple" label="Download PNG" onClick={() => acts.download(img.id)} />
            <IconButton icon="ph:trash" label="Delete" onClick={() => acts.remove(img.id)} />
          </div>
          <div
            className="mt-5 rounded-[12px] p-3.5"
            style={{
              background: COLORS.raise,
            }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className="text-[12px] font-[500]"
                style={{
                  color: COLORS.soft,
                }}
              >
                Prompt
              </span>
              <button
                type="button"
                onClick={() => {
                  copy(img.spec.prompt);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1300);
                }}
                className="flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-[11.5px] hover:bg-[var(--raise2)]"
                style={{
                  color: COLORS.soft,
                }}
              >
                <Icon name={copied ? "ph:check" : "ph:copy"} size={12} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p
              className="text-[14px] leading-[1.5]"
              style={{
                color: COLORS.ink,
              }}
            >
              {img.spec.prompt}
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {details.map(([term, value]) => (
              <div key={term}>
                <dt
                  className="text-[11.5px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  {term}
                </dt>
                <dd
                  className="mt-0.5 text-[13px]"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onUse}
              className="flex h-10 items-center justify-center gap-1.5 rounded-[11px] text-[13.5px] font-[500] transition-[filter,transform] hover:brightness-110 active:scale-[.98]"
              style={{
                background: COLORS.raise2,
                color: COLORS.ink,
                boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
              }}
            >
              <Icon name="ph:arrow-bend-up-left" size={15} />
              Use prompt
            </button>
            <button
              type="button"
              onClick={onRemix}
              className="flex h-10 items-center justify-center gap-1.5 rounded-[11px] text-[13.5px] font-[600] transition-[filter,transform] hover:brightness-110 active:scale-[.98]"
              style={{
                background: COLORS.acc,
                color: COLORS.accInk,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.25)",
              }}
            >
              <Icon name="ph:shuffle" size={15} />
              Remix
            </button>
          </div>
          <p
            className="mt-3 text-[12px] leading-snug"
            style={{
              color: COLORS.soft,
            }}
          >
            Remix keeps the prompt and style and develops it again on a new seed. Scroll or pinch to zoom, drag to pan,
            double-click to jump in.
          </p>
        </div>
      </motion.aside>
    </motion.div>
  );
}

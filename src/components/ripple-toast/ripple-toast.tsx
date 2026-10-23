"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

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


type Kind = "done" | "message" | "warn";
type Toast = { id: number; kind: Kind; title: string; body: string };

const KINDS: Record<Kind, { color: string; label: string }> = {
  done: { color: "#30d158", label: "Done" },
  message: { color: "#0071e3", label: "Message" },
  warn: { color: "#ff9f0a", label: "Heads up" },
};

const SAMPLES: Omit<Toast, "id">[] = [
  { kind: "done", title: "Mix exported", body: "Low Tide (master).wav is in Downloads." },
  { kind: "message", title: "Ana left a comment", body: "“Bring the bass up at 1:12?”" },
  { kind: "warn", title: "Storage almost full", body: "1.2 GB left on this device." },
  { kind: "done", title: "Stems uploaded", body: "6 files shared with the band." },
  { kind: "message", title: "Theo replied", body: "“Sending the new vocal take now.”" },
];

function Icon({ kind }: { kind: Kind }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "#fff", strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (kind === "done") return <svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
  if (kind === "message") return <svg {...p}><path d="M5 6h14v9H9l-4 3.5z" /></svg>;
  return <svg {...p}><path d="M12 7v6M12 17h.01" /></svg>;
}

/** One toast: falls as a drop, splashes into a pill and its ripples settle out of the text. */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const fid = `rt-${useId().replace(/:/g, "")}`;
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const warp = useMotionValue(0);
  const ring = useMotionValue(0);
  const k = KINDS[toast.kind];
  const ringOpacity = useTransform(ring, [0, 0.05, 1], [0, 0.7, 0]);
  const ringScale = useTransform(ring, [0, 1], [1, 1.14]);

  useEffect(() => {
    const off = warp.on("change", (v) => {
      dispRef.current?.setAttribute("scale", v.toFixed(2));
      turbRef.current?.setAttribute("baseFrequency", `${(0.012 + v * 0.0004).toFixed(4)} ${(0.08 - v * 0.0008).toFixed(4)}`);
    });
    // splash on landing, then the ripples settle with a little overshoot
    const t = window.setTimeout(() => {
      warp.set(26);
      animate(warp, 0, { type: "spring", stiffness: 120, damping: 9, restDelta: 0.05 });
      ring.set(0);
      animate(ring, 1, { duration: 0.9, ease: [0.2, 0.7, 0.3, 1] });
    }, 260);
    return () => {
      off();
      window.clearTimeout(t);
    };
  }, [warp, ring]);

  return (
    <motion.li
      layout
      role="status"
      initial={{ y: -90, scaleX: 0.16, scaleY: 0.5, borderRadius: 999, opacity: 0.4 }}
      animate={{ y: 0, scaleX: [0.16, 0.16, 1.08, 1], scaleY: [0.5, 0.5, 0.82, 1], opacity: 1, borderRadius: 22 }}
      exit={{ y: -40, scaleX: 0.16, scaleY: 0.4, opacity: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.6, 1] } }}
      transition={{ y: { type: "spring", stiffness: 380, damping: 26 }, scaleX: { duration: 0.6, times: [0, 0.4, 0.7, 1] }, scaleY: { duration: 0.6, times: [0, 0.4, 0.7, 1] }, opacity: { duration: 0.2 } }}
      className="relative w-full list-none"
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[22px] border-2"
        style={{ borderColor: k.color, opacity: ringOpacity, scale: ringScale }}
      />
      <div className="relative flex items-center gap-3 rounded-[22px] bg-white p-3 pr-2 dark:bg-[#2c2c2e] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id={fid} x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence ref={turbRef} type="turbulence" baseFrequency="0.012 0.08" numOctaves="1" seed="7" result="n" />
            <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full" style={{ background: k.color }}>
          <Icon kind={toast.kind} />
        </span>
        <div className="min-w-0 flex-1" style={{ filter: `url(#${fid})` }}>
          <div className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{toast.title}</div>
          <div className="truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{toast.body}</div>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={onClose}
          aria-label={`Dismiss: ${toast.title}`}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-[#6e6e73] outline-none hover:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#a1a1a6] dark:hover:bg-[#3a3a3c]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </motion.button>
      </div>
    </motion.li>
  );
}

/**
 * Ripple Toast: notifications that arrive like a drop hitting water. Each one falls
 * in as a small bead, splashes flat into a pill with an overshoot, sends out a ring,
 * and its text resolves out of the ripples. Newer toasts push the stack down; dismissed
 * ones lift back up as a drop. Up to three stay on screen.
 */
export interface RippleToastProps {
  /** Sends a notification every couple of seconds and dismisses one now and then, until someone presses a button. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

export function RippleToast({ autoplay = false, className }: RippleToastProps) {
  const reduce = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const activeAuto = useDemoActive(rootRef, autoplay && !reduce);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const touched = useRef(false);
  const nextId = useRef(1);
  const sample = useRef(0);

  const push = (kind?: Kind) => {
    let s = SAMPLES[sample.current % SAMPLES.length];
    if (kind) {
      const found = SAMPLES.find((x, i) => x.kind === kind && i >= sample.current % SAMPLES.length) || SAMPLES.find((x) => x.kind === kind)!;
      s = found;
    }
    sample.current++;
    const id = nextId.current++;
    setToasts((ts) => [{ ...s, id }, ...ts].slice(0, 3));
  };
  const close = (id: number) => setToasts((ts) => ts.filter((t) => t.id !== id));

  useEffect(() => {
    if (!autoplay || reduce || !activeAuto) return;
    let n = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      n++;
      if (n % 4 === 0) setToasts((ts) => ts.slice(0, -1));
      else push();
    }, 1700);
    const first = window.setTimeout(() => !touched.current && push(), 500);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [autoplay, reduce, activeAuto]);

  return (
    <div ref={rootRef} className={cn("flex w-[360px] max-w-full flex-col gap-4", className)} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}>
      <div className="relative h-[262px] overflow-hidden rounded-[24px] bg-[#e8e8ed] p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#1c1c1e] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
        <ol className="m-0 flex list-none flex-col gap-2 p-0" aria-label="Notifications" aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            {toasts.map((t) => (
              <ToastItem
                key={t.id}
                toast={t}
                onClose={() => {
                  touched.current = true;
                  close(t.id);
                }}
              />
            ))}
          </AnimatePresence>
        </ol>
        {toasts.length === 0 && <p className="absolute inset-0 m-0 flex items-center justify-center text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">No notifications</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {(Object.keys(KINDS) as Kind[]).map((kind) => (
          <motion.button
            key={kind}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              touched.current = true;
              push(kind);
            }}
            className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: KINDS[kind].color }} aria-hidden="true" />
            {KINDS[kind].label}
          </motion.button>
        ))}
      </div>
      <p className="m-0 text-center text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Send one. It lands like a drop and the ripples settle out of the text.</p>
    </div>
  );
}

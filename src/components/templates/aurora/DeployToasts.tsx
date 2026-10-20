"use client";
// Aurora copy of the Motion Kit Toast Stack with deploy notifications.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Kind = "success" | "error" | "loading" | "info";
interface Toast { id: number; kind: Kind; title: string; body?: string }

export interface ToastStackProps {
  /** Pushes sample toasts by itself until the user interacts. */
  autoplay?: boolean;
}

const SAMPLES: Omit<Toast, "id">[] = [
  { kind: "loading", title: "Deploying a41f9c2", body: "Rolling out to 18 regions" },
  { kind: "info", title: "Preview ready", body: "pr-212.acme-web.aurora.run" },
  { kind: "error", title: "Canary paused", body: "Error rate 2.1% in sin, above budget" },
  { kind: "success", title: "Rolled back", body: "v412 is live everywhere again" },
];

const ICON: Record<Kind, { color: string; path: string }> = {
  success: { color: "#34c759", path: "M5 12.5l4.5 4.5L19 7.5" },
  error: { color: "#ff3b30", path: "M7 7l10 10M17 7L7 17" },
  info: { color: "#047857", path: "M12 11v6M12 7.5v.5" },
  loading: { color: "#86868b", path: "" },
};

const GAP = 10;
const HEIGHT = 68;

export default function DeployToasts({ autoplay = false }: ToastStackProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expanded, setExpanded] = useState(false);
  const nextId = useRef(1);
  const sample = useRef(0);
  const touched = useRef(false);
  const timers = useRef(new Map<number, number>());

  const dismiss = (id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((t) => t.filter((x) => x.id !== id));
  };

  const schedule = (id: number, ms = 4200) => {
    clearTimeout(timers.current.get(id));
    timers.current.set(id, window.setTimeout(() => dismiss(id), ms));
  };

  const push = (t: Omit<Toast, "id">) => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-4), { ...t, id }]);
    if (t.kind === "loading") {
      window.setTimeout(() => {
        setToasts((list) => list.map((x) => (x.id === id ? { ...x, kind: "success", title: "Live in 18 regions", body: "a41f9c2 · 37.6 seconds" } : x)));
        schedule(id);
      }, 1800);
    } else schedule(id);
  };

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      push(SAMPLES[sample.current++ % SAMPLES.length]);
    }, 1500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  // Pause auto-dismiss while hovered.
  useEffect(() => {
    if (expanded) timers.current.forEach((t) => clearTimeout(t));
    else toasts.forEach((t) => t.kind !== "loading" && schedule(t.id, 2600));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const ordered = [...toasts].reverse(); // newest first

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <ol
        aria-live="polite"
        className="relative h-[240px] w-full max-w-[380px]"
        onPointerEnter={() => setExpanded(true)}
        onPointerLeave={() => setExpanded(false)}
      >
        <AnimatePresence initial={false}>
          {ordered.map((t, i) => {
            const hidden = !expanded && i > 2;
            return (
              <motion.li
                key={t.id}
                drag="x"
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 90) dismiss(t.id); }}
                initial={{ y: 80, opacity: 0, scale: 0.9 }}
                animate={{
                  y: expanded ? -i * (HEIGHT + GAP) : -i * 13,
                  scale: expanded ? 1 : 1 - i * 0.05,
                  opacity: hidden ? 0 : 1,
                  zIndex: 100 - i,
                }}
                exit={{ opacity: 0, scale: 0.9, y: 30, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-x-0 bottom-0 flex h-[68px] cursor-grab items-center gap-3 rounded-[20px] bg-white/90 pl-3.5 pr-2 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_12px_30px_-12px_rgba(0,0,0,.25)] backdrop-blur-xl active:cursor-grabbing"
                style={{ transformOrigin: "50% 100%" }}
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full" style={{ background: `${ICON[t.kind].color}1f` }}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {t.kind === "loading" ? (
                      <motion.span key="spin" exit={{ scale: 0 }} className="h-4 w-4 rounded-full border-2 border-[#d2d2d7] border-t-[#1d1d1f]" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
                    ) : (
                      <motion.svg key={t.kind} initial={{ scale: 0.3, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 600, damping: 16 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ICON[t.kind].color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <motion.path d={ICON[t.kind].path} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.1 }} />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{t.title}</span>
                  {t.body && <span className="truncate text-[13px] text-[#6e6e73]">{t.body}</span>}
                </span>
                <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="flex h-9 w-9 items-center justify-center rounded-full text-[#86868b] hover:bg-black/5 hover:text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#047857]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {toasts.length === 0 && (
          <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-x-0 bottom-6 list-none text-center text-[13px] text-[#6e6e73]">
            Notifications appear here
          </motion.li>
        )}
      </ol>
      <div className="flex flex-wrap justify-center gap-2" onPointerDown={() => (touched.current = true)}>
        {SAMPLES.map((s) => (
          <motion.button
            key={s.kind}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => push(s)}
            className="h-9 rounded-full bg-white px-4 text-[13px] font-medium capitalize text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#047857]"
          >
            {{ loading: "Deploy", info: "Preview", error: "Alert", success: "Rollback" }[s.kind]}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

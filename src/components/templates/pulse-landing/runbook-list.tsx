"use client";
/**
 * Local copy of the kit Todo List. The kit version can call its counter
 * animation from a timeout after it has unmounted (it unmounts when the
 * incident story swaps steps), which throws. This copy clears its timers.
 */
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";

interface Task { id: number; text: string; done: boolean; leaving?: boolean }

export interface TodoListProps {
  initial?: string[];
  accent?: string;
  /** Ticks tasks off by itself until the user interacts. */
  autoplay?: boolean;
}

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

export default function TodoList({ initial = ["Reply to design review", "Ship the pricing page", "Book flights for March", "Renew domain"], accent = "#0071e3", autoplay = false }: TodoListProps) {
  const uid = useId();
  const nextId = useRef(initial.length + 1);
  const [tasks, setTasks] = useState<Task[]>(() => initial.map((text, i) => ({ id: i + 1, text, done: false })));
  const [draft, setDraft] = useState("");
  const [showDone, setShowDone] = useState(false);
  const counter = useAnimationControls();
  const touched = useRef(false);

  const open = tasks.filter((t) => !t.done || t.leaving);
  const done = tasks.filter((t) => t.done && !t.leaving);

  const timers = useRef<number[]>([]);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const list = timers.current;
    return () => { mounted.current = false; list.forEach((t) => clearTimeout(t)); };
  }, []);

  const complete = (id: number) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: true, leaving: true } : t)));
    timers.current.push(window.setTimeout(() => {
      if (!mounted.current) return;
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: false } : t)));
      counter.start({ scale: [1, 1.25, 1], transition: { duration: 0.35 } });
    }, 750));
  };

  const restore = (id: number) => setTasks((ts) => [...ts.filter((t) => t.id !== id), { ...ts.find((t) => t.id === id)!, done: false, leaving: false }]);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setTasks((ts) => [...ts, { id: nextId.current++, text, done: false }]);
    setDraft("");
  };

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setTasks((ts) => {
        const next = ts.find((x) => !x.done);
        if (next) {
          timers.current.push(window.setTimeout(() => mounted.current && complete(next.id), 0));
          return ts;
        }
        return ts.map((x) => ({ ...x, done: false, leaving: false }));
      });
    }, 1500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className="flex w-full max-w-[380px] flex-col gap-3" onPointerDown={() => (touched.current = true)} onKeyDown={() => (touched.current = true)}>
      <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_14px_34px_-20px_rgba(0,0,0,.3)]">
        <ul className="m-0 list-none p-1.5">
          <AnimatePresence initial={false}>
            {open.map((t) => (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: 14, scale: 0.96, filter: "blur(3px)", transition: { ...spring, opacity: { duration: 0.2 } } }}
                transition={spring}
                className="overflow-hidden"
              >
                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-[#f5f5f7]">
                  <input type="checkbox" className="peer sr-only" checked={t.done} onChange={() => !t.done && complete(t.id)} />
                  <motion.span
                    className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                    initial={false}
                    animate={{ backgroundColor: t.done ? accent : "rgba(0,0,0,0)", boxShadow: t.done ? "inset 0 0 0 0px #c7c7cc" : "inset 0 0 0 1.5px #c7c7cc", scale: t.done ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ outlineColor: accent }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: t.done ? 1 : 0 }} transition={{ duration: 0.25, delay: 0.08 }} />
                    </svg>
                  </motion.span>
                  <span className="relative text-[15px] text-[#1d1d1f]">
                    <motion.span initial={false} animate={{ color: t.done ? "#86868b" : "#1d1d1f" }} transition={{ delay: 0.15 }}>
                      {t.text}
                    </motion.span>
                    <motion.span aria-hidden="true" className="absolute left-0 top-1/2 h-[1.5px] w-full origin-left bg-[#86868b]" initial={false} animate={{ scaleX: t.done ? 1 : 0 }} transition={{ duration: 0.35, delay: 0.1, ease: [0.65, 0, 0.35, 1] }} />
                  </span>
                </label>
              </motion.li>
            ))}
          </AnimatePresence>
          {open.length === 0 && (
            <motion.li initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-3 py-5 text-center text-[14px] text-[#86868b]">
              All clear.
            </motion.li>
          )}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
          className="flex items-center gap-2 border-t border-[#f0f0f3] px-4 py-2"
        >
          <label htmlFor={`${uid}-new`} className="sr-only">New task</label>
          <span className="text-[20px] font-light text-[#c7c7cc]" aria-hidden="true">+</span>
          <input id={`${uid}-new`} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task" className="h-9 flex-1 bg-transparent text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6]" />
        </form>
      </div>

      <button
        type="button"
        onClick={() => setShowDone((s) => !s)}
        aria-expanded={showDone}
        disabled={done.length === 0}
        className="flex h-9 items-center gap-2 self-start rounded-full px-3 text-[13px] font-medium text-[#6e6e73] hover:bg-black/5 disabled:opacity-50 focus-visible:outline focus-visible:outline-2"
        style={{ outlineColor: accent }}
      >
        <motion.span animate={counter} className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] font-semibold text-white tabular-nums" style={{ background: accent }}>
          {done.length}
        </motion.span>
        Completed
        <motion.svg animate={{ rotate: showDone ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {showDone && done.length > 0 && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="m-0 list-none overflow-hidden p-0">
            {done.map((t) => (
              <motion.li layout key={t.id} className="flex items-center justify-between px-3 py-1.5 text-[14px] text-[#86868b]">
                <span className="line-through">{t.text}</span>
                <button type="button" onClick={() => restore(t.id)} className="rounded-md px-1.5 text-[12px] font-medium focus-visible:outline focus-visible:outline-2" style={{ color: accent, outlineColor: accent }}>
                  Undo
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

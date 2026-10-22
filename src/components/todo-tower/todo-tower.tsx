"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

/** A starting task: its label and how far (px) it sits off-centre. */
export interface TodoTowerTask {
  text: string;
  x: number;
}

export interface TodoTowerProps {
  /** The starting pile, top to bottom. */
  tasks?: TodoTowerTask[];
  /** Labels the "Add a task" button drops onto the top of the pile, in turn. */
  moreTasks?: string[];
  /** How far (px) a brick may hang past the one beneath it before it tips off. */
  overhang?: number;
  /** Most bricks the pile holds; "Add a task" does nothing past this. */
  maxBricks?: number;
  /** Called with a task's label when it is ticked off. */
  onComplete?: (text: string) => void;
  /** Ticks tasks off and adds new ones by itself until someone touches the pile. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

interface Brick {
  id: number;
  text: string;
  x: number;
  /** Small random tilt the brick falls in with. */
  spin: number;
  done?: boolean;
  tip?: -1 | 1;
}
type Exit = "done" | "pulled-left" | "pulled-right" | "tip-left" | "tip-right";

export const TODO_TOWER_TASKS: TodoTowerTask[] = [
  { text: "Call the landlord", x: -18 },
  { text: "Pay the invoice", x: -4 },
  { text: "Export the icons", x: 10 },
  { text: "Book the flights", x: 26 },
  { text: "Renew the domain", x: 14 },
  { text: "Reply to Nadia", x: 0 },
];
export const TODO_TOWER_MORE = ["Water the plants", "Send the estimate", "Book the studio", "Back up the laptop"];

function exitFor(why: Exit | undefined) {
  if (why === "done") return { opacity: 0, scale: 0.8, y: -30, filter: "blur(6px)", transition: { duration: 0.35 } };
  if (why === "pulled-left") return { x: -420, opacity: 0, rotate: -8, transition: { duration: 0.4 } };
  if (why === "pulled-right") return { x: 420, opacity: 0, rotate: 8, transition: { duration: 0.4 } };
  const dir = why === "tip-left" ? -1 : 1;
  return { x: dir * 140, y: 420, rotate: dir * 80, opacity: 0, transition: { duration: 0.75, ease: [0.5, 0, 0.75, 0] as const } };
}

/**
 * A to-do list stacked like bricks. Tick one off or drag one out sideways and
 * everything above drops into the gap with a bounce; any brick now hanging too
 * far over the one beneath it tips over its edge and falls away. New tasks
 * drop onto the top of the pile.
 */
export function TodoTower({
  tasks = TODO_TOWER_TASKS,
  moreTasks = TODO_TOWER_MORE,
  overhang = 24,
  maxBricks = 8,
  onComplete,
  autoplay = false,
  enableSound = true,
}: TodoTowerProps) {
  const play = useSound(enableSound);
  const [bricks, setBricks] = useState<Brick[]>(() => tasks.map((b, i) => ({ ...b, id: i, spin: ((i * 37) % 10) - 5 })));
  const [exits, setExits] = useState<Record<number, Exit>>({});
  const list = useRef(bricks);
  const nextId = useRef(tasks.length);
  const more = useRef(0);
  const touched = useRef(false);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    list.current = bricks;
  }, [bricks]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((t) => window.clearTimeout(t));
      pending.clear();
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  };

  // After the pile drops, check each brick against the one under it (bottom up);
  // the first one hanging too far tips toward its overhang and falls off.
  const settle = () => {
    later(() => {
      const l = list.current;
      for (let i = l.length - 2; i >= 0; i--) {
        const d = l[i].x - l[i + 1].x;
        if (Math.abs(d) > overhang && !l[i].tip) {
          const dir: -1 | 1 = d > 0 ? 1 : -1;
          const id = l[i].id;
          setBricks((cur) => cur.map((b) => (b.id === id ? { ...b, tip: dir } : b)));
          later(() => remove(id, dir > 0 ? "tip-right" : "tip-left"), 520);
          return;
        }
      }
    }, 420);
  };

  const remove = (id: number, why: Exit) => {
    setExits((e) => ({ ...e, [id]: why }));
    setBricks((l) => l.filter((b) => b.id !== id));
    settle();
  };

  const check = (id: number) => {
    const brick = list.current.find((b) => b.id === id);
    if (!brick || brick.done) return;
    setBricks((l) => l.map((b) => (b.id === id ? { ...b, done: true } : b)));
    onComplete?.(brick.text);
    later(() => remove(id, "done"), 380);
  };

  const add = () => {
    if (moreTasks.length === 0) return;
    const text = moreTasks[more.current++ % moreTasks.length];
    const brick: Brick = { id: nextId.current++, text, x: Math.round((Math.random() - 0.5) * 30), spin: (Math.random() - 0.5) * 10 };
    setBricks((l) => (l.length >= maxBricks ? l : [brick, ...l]));
  };

  // The "Add a task" button: the brick lands on the pile a moment after it is dropped in.
  const addSounding = (say: (name: SoundName, volume?: number) => void) => {
    const room = moreTasks.length > 0 && list.current.length < maxBricks;
    add();
    if (room) later(() => say("drop", 0.8), 280);
  };
  const addByUser = () => addSounding(play);

  // Keep the latest handlers for the autoplay timer without restarting it.
  const actions = useRef<{ add: () => void; check: (id: number) => void }>({ add: () => {}, check: () => {} });
  useEffect(() => {
    actions.current = {
      add: () => addSounding(play.auto),
      check: (id) => {
        const brick = list.current.find((b) => b.id === id);
        if (brick && !brick.done) play.auto("tick");
        check(id);
      },
    };
  });

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) return window.clearInterval(t);
      const l = list.current;
      if (l.length <= 2 || k % 4 === 3) actions.current.add();
      else actions.current.check(l[Math.min(l.length - 2, 1 + (k % (l.length - 1)))].id);
      k++;
    }, 1900);
    return () => window.clearInterval(t);
  }, [autoplay]);

  return (
    <div
      className="flex flex-col items-center gap-4 [--tt-box-line:#c7c7cc] [--tt-box:#fff] dark:[--tt-box-line:#636366] dark:[--tt-box:#2c2c2e]"
      onPointerDown={() => (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <div className="relative flex h-[340px] w-[300px] flex-col items-center justify-end overflow-visible pb-1">
        <AnimatePresence initial={false} custom={exits}>
          {bricks.map((b) => (
            <motion.div
              key={b.id}
              layout="position"
              initial={{ y: -300, opacity: 0, rotate: b.spin }}
              animate={{ y: 0, opacity: 1, rotate: b.tip ? b.tip * 24 : 0, x: b.x + (b.tip ? b.tip * 18 : 0) }}
              variants={{ gone: (ex: Record<number, Exit>) => exitFor(ex?.[b.id]) }}
              exit="gone"
              transition={{ layout: { type: "spring", stiffness: 300, damping: 13 }, default: { type: "spring", stiffness: 260, damping: 16 } }}
              style={{ transformOrigin: b.tip ? (b.tip > 0 ? "0% 100%" : "100% 100%") : "50% 50%" }}
              className="relative flex-none"
            >
              <motion.div
                drag="x"
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={(_, info: PanInfo) => {
                  if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 700) {
                    play("swipe");
                    remove(b.id, info.offset.x > 0 ? "pulled-right" : "pulled-left");
                  }
                }}
                whileDrag={{ scale: 1.04, zIndex: 10, boxShadow: "0 18px 30px -14px rgba(0,0,0,.35)" }}
                className="relative flex h-[42px] w-[190px] cursor-grab items-center gap-2.5 rounded-[12px] bg-white px-3 shadow-[0_0_0_1px_rgba(0,0,0,.07),0_2px_4px_rgba(0,0,0,.04)] active:cursor-grabbing dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_2px_4px_rgba(0,0,0,.4)]"
              >
                <button
                  type="button"
                  aria-label={`Complete ${b.text}`}
                  aria-pressed={!!b.done}
                  onClick={() => {
                    if (!b.done) play("tick");
                    check(b.id);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[5px] border-[1.5px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
                  style={{ borderColor: b.done ? "#30d158" : "var(--tt-box-line)", background: b.done ? "#30d158" : "var(--tt-box)" }}
                >
                  {b.done && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }} />
                    </svg>
                  )}
                </button>
                <span className="relative truncate text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {b.text}
                  <motion.span
                    className="absolute left-0 top-1/2 h-[1.5px] bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                    initial={false}
                    animate={{ width: b.done ? "100%" : "0%" }}
                    transition={{ duration: 0.25 }}
                  />
                </span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute bottom-0 h-[3px] w-[260px] translate-y-full rounded-full bg-[#d2d2d7] dark:bg-[#3a3a3c]" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={addByUser}
          className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        >
          Add a task
        </motion.button>
        <span className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">Tick one, or drag one out sideways.</span>
      </div>
    </div>
  );
}

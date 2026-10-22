"use client";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

type AnimationControls = ReturnType<typeof useAnimationControls>;

export interface DominoMessage {
  /** Sender name; its first letter is drawn in the avatar. */
  from: string;
  subject: string;
  time: string;
  /** Avatar colour (any CSS colour). */
  color: string;
}

export interface DominoSelectProps {
  /** The rows to list. Changing the number of rows resets the selection. */
  messages?: DominoMessage[];
  /** Called with the indexes of the ticked rows whenever the selection changes (once per row during a chain). */
  onSelectionChange?: (selected: number[]) => void;
  /** Ticks and unticks the master box by itself until someone interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const MAIL: DominoMessage[] = [
  { from: "Linear", subject: "3 issues assigned to you", time: "9:41", color: "#5e5ce6" },
  { from: "Stripe", subject: "Payout of $4,210 is on its way", time: "9:12", color: "#635bff" },
  { from: "Maya Chen", subject: "Re: launch checklist", time: "8:57", color: "#ff9f0a" },
  { from: "GitHub", subject: "[nexus-ui] PR #482 merged", time: "8:30", color: "#1d1d1f" },
  { from: "Figma", subject: "Jun commented on Pricing v3", time: "Yesterday", color: "#ff375f" },
  { from: "Vercel", subject: "Deployment ready: nexus-ui.com", time: "Yesterday", color: "#000000" },
  { from: "Dodo", subject: "Your payout settings were updated", time: "Mon", color: "#30d158" },
];
const GAP = 0.075; // seconds between each domino

const BOX_OFF = "bg-white shadow-[inset_0_0_0_1.5px_#c7c7cc] dark:bg-[#1c1c1e] dark:shadow-[inset_0_0_0_1.5px_#636366]";
const BOX_ON = "bg-[#0071e3] dark:bg-[#0a84ff]";
const FOCUS = "focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#2997ff]";

function Box({ on }: { on: boolean }) {
  return (
    <span className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] transition-colors duration-150 ${on ? BOX_ON : BOX_OFF}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={false} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 0.22 }} />
      </svg>
    </span>
  );
}

function Row({
  i,
  n,
  m,
  on,
  register,
  onToggle,
}: {
  i: number;
  n: number;
  m: DominoMessage;
  on: boolean;
  register: (i: number, c: AnimationControls | null) => void;
  onToggle: () => void;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    register(i, controls);
    return () => register(i, null);
  }, [i, controls, register]);
  return (
    <motion.li animate={controls} className="relative" style={{ originY: 1 }}>
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        aria-label={`${m.from}: ${m.subject}`}
        onClick={onToggle}
        className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left outline-none transition-colors ${FOCUS} ${
          on ? "bg-[#eef5ff] dark:bg-[#0a84ff]/20" : "bg-white dark:bg-[#2c2c2e]"
        } shadow-[0_0_0_1px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]`}
        style={{ zIndex: n - i }}
      >
        <Box on={on} />
        <span
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[13px] font-semibold text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,.16)]"
          style={{ background: m.color }}
          aria-hidden="true"
        >
          {m.from[0]}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{m.from}</span>
            <span className="flex-none text-[12px] text-[#86868b] dark:text-[#8e8e93]">{m.time}</span>
          </span>
          <span className="truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{m.subject}</span>
        </span>
      </button>
    </motion.li>
  );
}

/**
 * Select all, as a row of dominoes. Tick the master box and each email tips
 * forward onto the next one in a chain, then the whole list springs back up
 * with every box ticked. Untick and the chain runs the other way, from the
 * bottom up. Single rows still toggle on their own with a small nod.
 */
export function DominoSelect({ messages = MAIL, onSelectionChange, autoplay = false, enableSound = true }: DominoSelectProps) {
  return <DominoList key={messages.length} messages={messages} onSelectionChange={onSelectionChange} autoplay={autoplay} enableSound={enableSound} />;
}

function DominoList({ messages, onSelectionChange, autoplay, enableSound }: Required<Pick<DominoSelectProps, "messages" | "autoplay" | "enableSound">> & Pick<DominoSelectProps, "onSelectionChange">) {
  const play = useSound(enableSound);
  const n = messages.length;
  const [on, setOn] = useState<boolean[]>(() => messages.map(() => false));
  const reduced = useReducedMotion();
  const reducedRef = useRef(false);
  const ctrls = useRef<(AnimationControls | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const touched = useRef(false);
  const visible = useRef(true);
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  const firstReport = useRef(true);
  const onChangeRef = useRef(onSelectionChange);
  const all = n > 0 && on.every(Boolean);
  const some = on.some(Boolean);
  const count = on.filter(Boolean).length;

  const register = useCallback((i: number, c: AnimationControls | null) => {
    ctrls.current[i] = c;
  }, []);

  useEffect(() => {
    reducedRef.current = !!reduced;
    onChangeRef.current = onSelectionChange;
  });

  useEffect(() => {
    alive.current = true;
    const pending = timers.current;
    return () => {
      alive.current = false;
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    if (firstReport.current) {
      firstReport.current = false;
      return;
    }
    onChangeRef.current?.(on.flatMap((v, i) => (v ? [i] : [])));
  }, [on]);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const chain = async (select: boolean, byUser = false) => {
    if (busy.current) return;
    if (byUser) play("knock", 0.8);
    else play.auto("knock", 0.8);
    if (reducedRef.current) {
      setOn(messages.map(() => select));
      return;
    }
    busy.current = true;
    const order = [...Array(n).keys()];
    if (!select) order.reverse();
    await Promise.all(
      order.map((idx, k) => {
        const last = k === n - 1;
        const fall = select ? (last ? -84 : -58) : last ? 84 : 58;
        const delay = k * GAP;
        // flip each box at the moment its row stands back up
        timers.current.push(
          window.setTimeout(() => {
            setOn((o) => o.map((v, j) => (j === idx ? select : v)));
            if (byUser) play("tick", 0.4);
            else play.auto("tick", 0.4);
          }, (delay + 0.55 + (n - k) * 0.03) * 1000),
        );
        const c = ctrls.current[idx];
        if (!c) return Promise.resolve();
        return c.start({
          rotateX: [0, fall, fall, 0],
          originY: select ? "100%" : "0%",
          transition: { rotateX: { duration: 0.95 + (n - k) * 0.03, delay, times: [0, 0.28, 0.5, 1], ease: ["easeIn", "linear", [0.2, 1.4, 0.4, 1]] } },
        });
      }),
    );
    busy.current = false;
  };

  const one = (i: number) => {
    touched.current = true;
    if (busy.current) return;
    play("knock", 0.5);
    setOn((o) => o.map((v, j) => (j === i ? !v : v)));
    if (!reducedRef.current) void ctrls.current[i]?.start({ rotateX: [0, -14, 0], originY: "100%", transition: { duration: 0.35 } });
  };

  const autoChain = useEffectEvent((select: boolean) => void chain(select));

  useEffect(() => {
    if (!autoplay || reduced) return;
    let s = false;
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      if (!visible.current || document.hidden || !alive.current) return;
      s = !s;
      autoChain(s);
    }, 2600);
    return () => clearInterval(id);
  }, [autoplay, reduced]);

  return (
    <div
      ref={root}
      className="w-[380px] max-w-full rounded-[26px] bg-[#f5f5f7] p-3 shadow-[0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between px-2 pb-3 pt-1">
        <button
          type="button"
          role="checkbox"
          aria-checked={all ? true : some ? "mixed" : false}
          onClick={() => {
            touched.current = true;
            void chain(!all, true);
          }}
          className={`flex items-center gap-2.5 rounded-[10px] px-1 py-1 text-[14px] font-semibold text-[#1d1d1f] outline-none dark:text-[#f5f5f7] ${FOCUS}`}
        >
          <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-[7px] ${all || some ? BOX_ON : BOX_OFF}`}>
            {all ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            ) : some ? (
              <span className="h-[3px] w-[10px] rounded-full bg-white" />
            ) : null}
          </span>
          Select all
        </button>
        <span className="text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]" aria-live="polite">
          {count ? `${count} selected` : `${n} messages`}
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="Messages" style={{ perspective: 700, transformStyle: "preserve-3d" }}>
        {messages.map((m, i) => (
          <Row key={`${m.from}-${i}`} i={i} n={n} m={m} on={on[i]} register={register} onToggle={() => one(i)} />
        ))}
      </ul>
      <motion.div className="flex items-center justify-between overflow-hidden px-2" initial={false} animate={{ height: some ? 48 : 0, opacity: some ? 1 : 0 }} inert={!some}>
        <span className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Do something with them</span>
        <span className="flex gap-1.5">
          {["Archive", "Mark read"].map((a) => (
            <button
              key={a}
              type="button"
              className={`h-8 rounded-full bg-white px-3 text-[12px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] ${FOCUS}`}
            >
              {a}
            </button>
          ))}
        </span>
      </motion.div>
    </div>
  );
}

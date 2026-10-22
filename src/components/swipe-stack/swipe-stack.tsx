"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SwipePayment {
  /** Display amount, already formatted. */
  amount: string;
  from: string;
  to: string;
  /** Memo shown in quotes under the parties. */
  note: string;
  /** Relative time, e.g. "3h". */
  when: string;
  /** Hue (0-360) for the two avatar gradients. */
  hue: number;
}

export interface SwipeStackProps {
  /** Payments to review, top card first. "Load more" deals the same list again. */
  payments?: SwipePayment[];
  /** Called after a card is thrown: `approved` is true for right / approve, false for left / flag. */
  onDecide?: (payment: SwipePayment, approved: boolean) => void;
  /** Throws a card every 1.7 s (mostly approvals) and reloads when empty, until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

type Card = SwipePayment & { id: number };

export const DEFAULT_PAYMENTS: SwipePayment[] = [
  { amount: "$4,200", from: "James", to: "Jackson", note: "rent", when: "3h", hue: 215 },
  { amount: "$18.75", from: "Riya", to: "you", note: "tacos", when: "5h", hue: 25 },
  { amount: "$320", from: "Studio Co", to: "you", note: "invoice #118", when: "1d", hue: 150 },
  { amount: "$62.40", from: "you", to: "Maya", note: "concert tickets", when: "2d", hue: 285 },
  { amount: "$1,050", from: "Noor", to: "you", note: "flight split", when: "3d", hue: 340 },
];

/**
 * Payments to review as a stack of cards. Drag the top card right to approve
 * or left to flag; it tilts as you pull, a stamp fades in, and once thrown the
 * next card rises from the deck.
 */
export function SwipeStack({ payments = DEFAULT_PAYMENTS, onDecide, autoplay = false, enableSound = true }: SwipeStackProps) {
  const play = useSound(enableSound);
  const [cards, setCards] = useState<Card[]>(() => payments.map((d, i) => ({ ...d, id: i })));
  const [log, setLog] = useState<{ ok: boolean; amount: string } | null>(null);
  const nextId = useRef(payments.length);
  const touched = useRef(false);
  const busy = useRef(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-18, 18]);
  const approve = useTransform(x, [20, 120], [0, 1]);
  const flag = useTransform(x, [-120, -20], [1, 0]);

  const cardsRef = useRef(cards);
  const paymentsRef = useRef(payments);
  const onDecideRef = useRef(onDecide);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);
  useEffect(() => {
    paymentsRef.current = payments;
    onDecideRef.current = onDecide;
  }, [payments, onDecide]);

  const fling = useCallback(
    async (dir: 1 | -1, byUser = true) => {
      const top = cardsRef.current[0];
      if (!top || busy.current) return;
      busy.current = true;
      const say = byUser ? play : play.auto;
      say("swipe");
      say(dir > 0 ? "success" : "off", 0.6);
      await animate(x, dir * 520, { type: "spring", stiffness: 180, damping: 24, velocity: dir * 800 });
      setLog({ ok: dir > 0, amount: top.amount });
      setCards((c) => c.slice(1));
      x.set(0);
      busy.current = false;
      const { id, ...payment } = top;
      void id;
      onDecideRef.current?.(payment, dir > 0);
    },
    [x, play],
  );

  const reset = useCallback(() => {
    setCards(paymentsRef.current.map((d) => ({ ...d, id: nextId.current++ })));
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      if (cardsRef.current.length === 0) reset();
      else void fling(Math.random() > 0.35 ? 1 : -1, false);
    }, 1700);
    return () => clearInterval(t);
  }, [autoplay, fling, reset]);

  const onEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600) void fling(info.offset.x > 0 ? 1 : -1);
    else animate(x, 0, { type: "spring", stiffness: 400, damping: 26 });
  };

  const press = (dir: 1 | -1) => {
    touched.current = true;
    void fling(dir);
  };

  return (
    <div
      className="flex flex-col items-center gap-5"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="relative h-[230px] w-[320px]">
        <AnimatePresence initial={false}>
          {cards.slice(0, 4).map((c, i) => {
            const top = i === 0;
            return (
              <motion.div
                key={c.id}
                className="absolute inset-x-0 top-6 h-[180px] touch-none rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-24px_rgba(0,0,0,.9)]"
                style={top ? { x, rotate, zIndex: 10 } : { zIndex: 10 - i }}
                drag={top ? "x" : false}
                dragMomentum={false}
                onDragEnd={top ? onEnd : undefined}
                initial={{ y: -40, scale: 0.8, opacity: 0 }}
                animate={{ y: -i * 12, scale: 1 - i * 0.05, opacity: i > 2 ? 0 : 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                aria-hidden={top ? undefined : true}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[34px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{c.amount}</span>
                  <span className="flex -space-x-2">
                    <span className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1c1c1e]" style={{ background: `linear-gradient(140deg,hsl(${c.hue} 90% 65%),hsl(${c.hue + 30} 80% 45%))` }} />
                    <span className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1c1c1e]" style={{ background: `linear-gradient(140deg,hsl(${c.hue + 120} 70% 60%),hsl(${c.hue + 160} 70% 40%))` }} />
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-between text-[14px]">
                  <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <b className="font-semibold">{c.from}</b> paid <b className="font-semibold">{c.to}</b>
                  </span>
                  <span className="text-[#86868b] dark:text-[#8e8e93]">{c.when}</span>
                </div>
                <span className="mt-1 block text-[14px] italic text-[#6e6e73] dark:text-[#a1a1a6]">“{c.note}”</span>
                {top && (
                  <>
                    <motion.span className="absolute left-5 top-5 rotate-[-12deg] rounded-lg border-[3px] border-[#34c759] px-2 py-0.5 text-[15px] font-bold uppercase tracking-wider text-[#34c759] dark:border-[#30d158] dark:text-[#30d158]" style={{ opacity: approve }} aria-hidden="true">
                      Approve
                    </motion.span>
                    <motion.span className="absolute right-5 top-5 rotate-[12deg] rounded-lg border-[3px] border-[#ff3b30] px-2 py-0.5 text-[15px] font-bold uppercase tracking-wider text-[#ff3b30] dark:border-[#ff453a] dark:text-[#ff453a]" style={{ opacity: flag }} aria-hidden="true">
                      Flag
                    </motion.span>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>
          {cards.length === 0 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">All caught up.</span>
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  reset();
                }}
                className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:outline-[#0a84ff]"
              >
                Load more
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          aria-label="Flag payment"
          disabled={!cards.length}
          onClick={() => press(-1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#ff3b30] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] disabled:opacity-40 dark:bg-[#2c2c2e] dark:text-[#ff453a] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:focus-visible:outline-[#0a84ff]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </motion.button>
        <span className="relative h-5 w-[150px] overflow-hidden text-center text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={log ? `${log.amount}-${log.ok}-${cards.length}` : "none"} className="block" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
              {log ? `${log.ok ? "Approved" : "Flagged"} ${log.amount}` : `${cards.length} to review`}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          aria-label="Approve payment"
          disabled={!cards.length}
          onClick={() => press(1)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#34c759] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] disabled:opacity-40 dark:bg-[#2c2c2e] dark:text-[#30d158] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:focus-visible:outline-[#0a84ff]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}

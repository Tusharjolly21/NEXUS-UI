"use client";
import { useEffect, useEffectEvent, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SlingshotMessage {
  id: number;
  /** True for messages sent by you (right-hand blue bubbles). */
  me: boolean;
  text: string;
  /** Used while a message is still in flight: the bubble is laid out but invisible. */
  hidden?: boolean;
}

export interface SlingshotSendProps {
  /** Name shown in the thread header; its first letter is used for the avatar. */
  name?: string;
  /**
   * Called with the trimmed text when a message is fired. This is the only output of the
   * component: nothing is ever sent over the network.
   */
  onSend?: (text: string) => void;
  /** Adds a canned reply from the other person a moment after each message lands. */
  autoReply?: boolean;
  /** Types, pulls back and fires messages by itself until someone touches the component. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

type Point = { x: number; y: number };
type Flight = { text: string; from: Point; to: Point & { w: number; h: number }; power: number; id: number };

const START: SlingshotMessage[] = [
  { id: 1, me: false, text: "Are we still on for tonight?" },
  { id: 2, me: true, text: "Yes! Where do you want to go?" },
  { id: 3, me: false, text: "That ramen place on 5th?" },
];
const REPLIES = ["Perfect.", "Haha okay", "On my way", "Love that"];
const AUTOPLAY_LINES = ["See you at 7?", "I'll book a table", "Bring the umbrella"];
const STEPS = 12;

/**
 * A send button you fire. Pull the blue stone back in the slingshot, the bands
 * stretch, and let go: your message flies out along an arc and lands in the
 * thread with a squash. A short tug just twangs back. Return still sends it
 * normally, and Enter or Space on the focused stone fires it too.
 */
export function SlingshotSend({ name = "Maya", onSend, autoReply = true, autoplay = false, enableSound = true }: SlingshotSendProps) {
  const play = useSound(enableSound);
  const [msgs, setMsgs] = useState<SlingshotMessage[]>(START);
  const [draft, setDraft] = useState("See you at 7?");
  const draftRef = useRef("See you at 7?");
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loaded, setLoaded] = useState(true);
  const reduced = useReducedMotion();
  const reducedRef = useRef(false);
  const onSendRef = useRef(onSend);
  const autoReplyRef = useRef(autoReply);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const stone = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const touched = useRef(false);
  const visible = useRef(true);
  const nextId = useRef(10);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    reducedRef.current = !!reduced;
    onSendRef.current = onSend;
    autoReplyRef.current = autoReply;
  });

  // bands from the prong tips to the stone, driven straight from the motion values
  const bandLeftX = useTransform(x, (v) => 32 + v - 9);
  const bandRightX = useTransform(x, (v) => 32 + v + 9);
  const bandY = useTransform(y, (v) => 22 + v);
  const stretch = useTransform([x, y] as MotionValue<number>[], ([a, b]: number[]) => Math.min(1, Math.hypot(a, b) / 70));
  const bandOpacity = useTransform(stretch, (s) => 0.35 + s * 0.4);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const writeDraft = (v: string) => {
    draftRef.current = v;
    setDraft(v);
  };

  const land = (id: number) => {
    setMsgs((m) => m.map((msg) => (msg.id === id ? { ...msg, hidden: false } : msg)));
    setFlight(null);
    later(() => setLoaded(true), 250);
    if (autoReplyRef.current) {
      later(() => setMsgs((m) => [...m, { id: nextId.current++, me: false, text: REPLIES[id % REPLIES.length] }]), 1100);
    }
  };

  const fire = (power: number, byUser = false) => {
    const text = draftRef.current.trim();
    const rootEl = root.current;
    const stoneEl = stone.current;
    const listEl = list.current;
    if (!text || !rootEl || !stoneEl || !listEl) return;
    if (byUser) play("whoosh");
    else play.auto("whoosh");
    const rr = rootEl.getBoundingClientRect();
    const sr = stoneEl.getBoundingClientRect();
    const from = { x: sr.left - rr.left + sr.width / 2, y: sr.top - rr.top + sr.height / 2 };
    const id = nextId.current++;
    const skipFlight = reducedRef.current;
    flushSync(() => {
      setMsgs((m) => [...m, { id, me: true, text, hidden: !skipFlight }]);
      draftRef.current = "";
      setDraft("");
      setLoaded(false);
    });
    onSendRef.current?.(text);
    listEl.scrollTop = listEl.scrollHeight;
    if (skipFlight) {
      land(id);
      return;
    }
    // the invisible landing spot now exists: measure it and launch
    const el = listEl.querySelector<HTMLElement>(`[data-id="${id}"]`);
    if (!el) {
      land(id);
      return;
    }
    const er = el.getBoundingClientRect();
    setFlight({ text, from, to: { x: er.left - rr.left, y: er.top - rr.top, w: er.width, h: er.height }, power, id });
  };

  const release = (byUser = false) => {
    const d = Math.hypot(x.get(), y.get());
    if (d > 26 && draftRef.current.trim()) fire(Math.min(1, d / 70), byUser);
    const spring = { type: "spring" as const, stiffness: 700, damping: d > 26 ? 12 : 9 };
    animate(x, 0, spring);
    animate(y, 0, spring);
  };

  const pull = async (dx: number, dy: number) => {
    await Promise.all([animate(x, dx, { duration: 0.5 }), animate(y, dy, { duration: 0.5 })]);
  };

  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [msgs.length]);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const autoLift = useEffectEvent(() => play.auto("lift"));
  const autoRelease = useEffectEvent(() => release());

  useEffect(() => {
    if (!autoplay || reduced) return;
    let k = 0;
    let cancelled = false;
    const id = setInterval(async () => {
      if (touched.current) return clearInterval(id);
      if (!visible.current || document.hidden) return;
      const line = AUTOPLAY_LINES[k++ % AUTOPLAY_LINES.length];
      writeDraft(line);
      autoLift();
      await pull(-18, 52);
      if (touched.current || cancelled) return;
      autoRelease();
      if (k % 3 === 0) setMsgs(START);
    }, 3200);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    touched.current = true;
    fire(0.6, true);
  };

  const keyFire = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    touched.current = true;
    if (!draftRef.current.trim()) return;
    play("lift");
    void pull(-12, 46).then(() => {
      release(true);
      input.current?.focus();
    });
  };

  // flight path: a quadratic curve whose first leg follows the launch direction
  const path = flight
    ? (() => {
        const tx = flight.to.x + flight.to.w / 2;
        const ty = flight.to.y + flight.to.h / 2;
        const cx = flight.from.x - 60 - flight.power * 60;
        const cy = Math.min(flight.from.y, ty) - 90 - flight.power * 90;
        return Array.from({ length: STEPS + 1 }, (_, i) => {
          const t = i / STEPS;
          return {
            x: (1 - t) ** 2 * flight.from.x + 2 * (1 - t) * t * cx + t * t * tx,
            y: (1 - t) ** 2 * flight.from.y + 2 * (1 - t) * t * cy + t * t * ty,
          };
        });
      })()
    : null;

  const blue = "bg-[#0071e3] dark:bg-[#0a84ff]";

  return (
    <div
      ref={root}
      className="relative flex h-[500px] w-[360px] max-w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-3.5 dark:border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff9f0a] text-[14px] font-semibold text-white" aria-hidden="true">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{name}</span>
          <span className="text-[12px] text-[#30d158]">Online</span>
        </div>
      </div>
      <div ref={list} role="log" aria-label={`Conversation with ${name}`} aria-live="polite" className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {msgs.map((m) => (
          <motion.div
            key={m.id}
            data-id={m.id}
            layout="position"
            initial={m.me ? false : { opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: m.hidden ? 0 : 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`max-w-[75%] rounded-[18px] px-3.5 py-2 text-[15px] leading-[1.35] ${
              m.me ? `self-end rounded-br-[6px] ${blue} text-white` : "self-start rounded-bl-[6px] bg-[#f0f0f3] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
            }`}
          >
            {m.text}
          </motion.div>
        ))}
      </div>

      <form onSubmit={submit} className="relative flex items-end gap-3 border-t border-black/5 px-4 pb-5 pt-3 dark:border-white/10">
        <input
          ref={input}
          value={draft}
          onChange={(e) => writeDraft(e.target.value)}
          placeholder="Message"
          aria-label="Message"
          className="h-11 min-w-0 flex-1 rounded-full bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93] dark:focus-visible:ring-[#0a84ff]"
        />
        {/* the slingshot */}
        <div className="relative h-[70px] w-[64px] flex-none">
          <svg className="pointer-events-none absolute inset-0 overflow-visible" width="64" height="70" aria-hidden="true">
            <path d="M32 70 L32 46 M32 46 Q18 40 14 18 M32 46 Q46 40 50 18" stroke="#8e8e93" strokeWidth="6" strokeLinecap="round" fill="none" />
            <motion.line x1="14" y1="18" x2={bandLeftX} y2={bandY} strokeWidth="2.5" strokeLinecap="round" className="stroke-black dark:stroke-white" style={{ opacity: bandOpacity }} />
            <motion.line x1="50" y1="18" x2={bandRightX} y2={bandY} strokeWidth="2.5" strokeLinecap="round" className="stroke-black dark:stroke-white" style={{ opacity: bandOpacity }} />
          </svg>
          <AnimatePresence>
            {loaded && (
              <motion.div
                ref={stone}
                key="stone"
                role="button"
                tabIndex={0}
                aria-label="Send message. Drag back and release, or press Enter or Space."
                aria-disabled={!draft.trim()}
                onKeyDown={keyFire}
                drag
                dragMomentum={false}
                dragElastic={0.6}
                dragConstraints={{ left: -50, right: 50, top: -10, bottom: 70 }}
                onDragStart={() => {
                  touched.current = true;
                  play("lift");
                }}
                onDragEnd={() => release(true)}
                style={{ x, y }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, transition: { duration: 0.05 } }}
                className={`absolute left-[14px] top-[4px] flex h-9 w-9 cursor-grab touch-none items-center justify-center rounded-full ${blue} shadow-[0_6px_14px_-6px_rgba(0,113,227,.8)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:cursor-grabbing dark:focus-visible:ring-[#2997ff] dark:focus-visible:ring-offset-[#1c1c1e]`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="pointer-events-none absolute -top-1 right-4 text-[11px] text-[#86868b] dark:text-[#8e8e93]">{draft.trim() ? "Pull back and let go" : ""}</span>
      </form>

      {flight && path && (
        <motion.div
          key={flight.id}
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 top-0 z-10 max-w-[75%] origin-center rounded-[18px] rounded-br-[6px] ${blue} px-3.5 py-2 text-[15px] leading-[1.35] text-white shadow-[0_14px_30px_-12px_rgba(0,113,227,.7)]`}
          style={{ width: flight.to.w }}
          initial={{ x: flight.from.x - flight.to.w / 2, y: flight.from.y - flight.to.h / 2, scale: 0.3, rotate: -30 }}
          animate={{
            x: path.map((p) => p.x - flight.to.w / 2),
            y: path.map((p) => p.y - flight.to.h / 2),
            scale: path.map((_, i) => (i === STEPS ? 1 : 0.4 + (i / STEPS) * 0.7)),
            rotate: path.map((_, i) => -30 + (i / STEPS) * 30),
            scaleY: path.map((_, i) => (i === STEPS ? 0.82 : 1)),
          }}
          transition={{ duration: 0.75 - flight.power * 0.25, ease: [0.3, 0.1, 0.45, 1] }}
          onAnimationComplete={() => land(flight.id)}
        >
          {flight.text}
        </motion.div>
      )}
    </div>
  );
}

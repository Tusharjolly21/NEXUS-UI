"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  /** Stable key for the message. */
  id: string;
  /** Who sent it. User bubbles sit on the right in blue, assistant bubbles on the left in grey. */
  sender: "user" | "assistant";
  /** Message text. */
  content: string;
  /** Optional time shown under the last bubble of a group, e.g. "9:41". */
  timestamp?: string;
}

export interface ChatMessagesProps {
  /** The conversation. With `autoplay` it plays out one message at a time; otherwise it shows in full. */
  messages?: ChatMessage[];
  /** Plays the conversation (typing dots, then each bubble) and loops it until someone touches the chat. */
  autoplay?: boolean;
  /** @deprecated Use `autoplay`. Kept so older code keeps working. */
  autoPlay?: boolean;
  /** Pause after each message during autoplay, in ms. */
  autoPlayDelay?: number;
  /** How long the assistant shows typing dots before a reply, in ms. */
  typingDuration?: number;
  /** Shows a replay button in the header. */
  showReplay?: boolean;
  /** Lets the visitor type and send their own messages. */
  interactive?: boolean;
  /** Produces the assistant's answer to a sent message. Defaults to a few canned replies. */
  reply?: (text: string) => string | Promise<string>;
  /** Called with the text whenever the visitor sends a message. */
  onSend?: (text: string) => void;
  /** Name in the header. */
  title?: string;
  /** Extra classes for the root. Give it a height (e.g. `h-[480px]`) to change the default 440px. */
  className?: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: "1", sender: "assistant", content: "Hi, I'm Nexus. What are we building today?" },
  { id: "2", sender: "user", content: "A landing page for my app." },
  { id: "3", sender: "assistant", content: "Nice. Start with a hero, three feature cards and a pricing table. Want me to lay it out?" },
  { id: "4", sender: "user", content: "Yes, and keep it light." },
  { id: "5", sender: "assistant", content: "Done. White cards, one blue accent, soft shadows. Take a look.", timestamp: "9:41" },
];

const CANNED = [
  "Good question. Give me a second and I'll sketch it out.",
  "Got it. I'd keep that to one screen and one clear action.",
  "Sure. Want the short version or the full plan?",
];

type Item = ChatMessage & { via: "static" | "typed" | "sent" };

/** Bubbles pop from their corner with a little overshoot. */
const POP = { type: "spring" as const, stiffness: 520, damping: 24, mass: 0.8 };
/** The typing bubble grows into the reply on this spring: the signature move. */
const MORPH = { type: "spring" as const, stiffness: 380, damping: 30 };

function Dots({ still }: { still: boolean }) {
  return (
    <span className="flex items-center gap-[5px] px-1 py-[3px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-[7px] w-[7px] rounded-full bg-[#8e8e93]"
          animate={still ? undefined : { y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/**
 * A chat thread in the style of a messaging app. With autoplay the
 * conversation plays itself: user lines type into the composer and pop out
 * as blue bubbles, and the assistant's typing dots grow into each reply.
 * Visitors can then send their own messages and get an answer.
 */
export function ChatMessages({
  messages = DEFAULT_MESSAGES,
  autoplay,
  autoPlay,
  autoPlayDelay = 900,
  typingDuration = 1300,
  showReplay = true,
  interactive = true,
  reply,
  onSend,
  title = "Nexus AI",
  className = "",
}: ChatMessagesProps) {
  const uid = useId().replace(/:/g, "");
  const still = useReducedMotion() === true;
  const playing = autoplay ?? autoPlay ?? false;
  const [items, setItems] = useState<Item[]>(() => (playing ? [] : messages.map((m) => ({ ...m, via: "static" as const }))));
  const [typing, setTyping] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [demoDraft, setDemoDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const touched = useRef(false);
  const demo = useRef(false);
  const seq = useRef(0);
  const canned = useRef(0);

  const later = (f: () => void, ms: number) => {
    timers.current.push(window.setTimeout(f, ms));
  };
  const clearLater = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach((t) => window.clearTimeout(t));
  }, []);

  // Keep the newest bubble in view.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const id = requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: still ? "auto" : "smooth" }));
    return () => cancelAnimationFrame(id);
  }, [items.length, typing, still]);

  const playFrom = (list: ChatMessage[], i: number) => {
    if (i >= list.length) {
      // Loop the demo until someone joins in.
      later(() => {
        if (touched.current) return;
        setItems([]);
        later(() => playFrom(list, 0), 500);
      }, 3200);
      return;
    }
    const m = list[i];
    if (m.sender === "assistant") {
      setTyping(m.id);
      later(() => {
        setTyping(null);
        setItems((p) => [...p, { ...m, via: "typed" }]);
        later(() => playFrom(list, i + 1), autoPlayDelay);
      }, typingDuration);
      return;
    }
    const step = still ? 0 : 24;
    for (let c = 1; c <= m.content.length; c++) later(() => setDemoDraft(m.content.slice(0, c)), c * step);
    later(() => {
      setDemoDraft("");
      setItems((p) => [...p, { ...m, via: "sent" }]);
      later(() => playFrom(list, i + 1), autoPlayDelay);
    }, m.content.length * step + 260);
  };

  const key = messages.map((m) => `${m.id}\u0001${m.sender}\u0001${m.content}`).join("\u0000");
  useEffect(() => {
    if (!playing) return;
    demo.current = true;
    const t = window.setTimeout(() => playFrom(messages, 0), 450);
    return () => {
      window.clearTimeout(t);
      demo.current = false;
    };
    // Restart only when the conversation itself changes, not on every new array literal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, key]);

  /** First touch during the demo: stop it and show the whole conversation so the visitor can join in. */
  const takeOver = () => {
    if (touched.current) return;
    touched.current = true;
    if (!demo.current) return;
    demo.current = false;
    clearLater();
    setTyping(null);
    setDemoDraft("");
    setItems(messages.map((m) => ({ ...m, via: "static" as const })));
  };

  const replay = () => {
    touched.current = false;
    demo.current = true;
    clearLater();
    setTyping(null);
    setDemoDraft("");
    setItems([]);
    later(() => playFrom(messages, 0), 350);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    takeOver();
    const text = draft.trim();
    if (!text || !interactive) return;
    const n = ++seq.current;
    const answerId = `${uid}-a${n}`;
    setDraft("");
    setItems((p) => [...p, { id: `${uid}-u${n}`, sender: "user", content: text, via: "sent" }]);
    onSend?.(text);
    later(() => setTyping(answerId), 350);
    const started = performance.now();
    const answer = reply ? Promise.resolve(reply(text)) : Promise.resolve(CANNED[canned.current++ % CANNED.length]);
    answer
      .then((content) => {
        const wait = Math.max(0, typingDuration + 350 - (performance.now() - started));
        later(() => {
          setTyping((t) => (t === answerId ? null : t));
          setItems((p) => [...p, { id: answerId, sender: "assistant", content, via: "typed" }]);
        }, wait);
      })
      .catch(() => setTyping(null));
  };

  const shownDraft = demoDraft || draft;

  return (
    <div
      className={cn(`flex h-[440px] w-full max-w-[400px] flex-col overflow-hidden rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]`, className)}
      onPointerDown={takeOver}
    >
      <div className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.08]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#0071e3,#bf5af2)] text-white" aria-hidden="true">
          <svg viewBox="0 0 20 20" className="h-4 w-4">
            <path d="M10 2l1.7 4.6a2 2 0 0 0 1.2 1.2L17.5 9.5l-4.6 1.7a2 2 0 0 0-1.2 1.2L10 17l-1.7-4.6a2 2 0 0 0-1.2-1.2L2.5 9.5l4.6-1.7a2 2 0 0 0 1.2-1.2L10 2z" fill="currentColor" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">{title}</p>
          <div className="relative h-4 overflow-hidden text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={typing ? "typing" : "online"}
                className="absolute left-0 top-0 flex items-center gap-1.5"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={POP}
              >
                {!typing && <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />}
                {typing ? "typing..." : "Online"}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        {showReplay && (
          <motion.button
            type="button"
            onClick={replay}
            whileTap={{ scale: 0.9, rotate: -40 }}
            aria-label="Replay conversation"
            className="grid h-8 w-8 place-items-center rounded-full text-[#6e6e73] outline-none hover:bg-[#f0f0f3] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#a1a1a6] dark:hover:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
              <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
      </div>

      <div ref={scroller} role="log" aria-label="Conversation" aria-live="polite" className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 [scrollbar-width:none]">
        <LayoutGroup id={uid}>
          <div className="flex flex-col">
            {items.map((m, i) => {
              const user = m.sender === "user";
              const next = items[i + 1];
              const last = !next || next.sender !== m.sender;
              const first = i === 0 || items[i - 1].sender !== m.sender;
              return (
                <div key={m.id} className={`flex flex-col ${user ? "items-end" : "items-start"} ${first && i > 0 ? "mt-3" : "mt-[3px]"}`}>
                  <motion.div
                    layoutId={`${uid}-b-${m.id}`}
                    initial={m.via === "sent" && !still ? { opacity: 0, scale: 0.5, y: 14 } : false}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={m.via === "typed" ? MORPH : POP}
                    style={{
                      originX: user ? 1 : 0,
                      originY: 1,
                      borderTopLeftRadius: 18,
                      borderTopRightRadius: 18,
                      borderBottomLeftRadius: last && !user ? 6 : 18,
                      borderBottomRightRadius: last && user ? 6 : 18,
                    }}
                    className={`max-w-[78%] px-3.5 py-2 text-[14px] leading-[1.38] ${
                      user ? "bg-[#0071e3] text-white dark:bg-[#0a84ff]" : "bg-[#e9e9eb] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
                    }`}
                  >
                    <motion.span
                      layout="position"
                      className="block break-words"
                      initial={m.via === "typed" && !still ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, delay: 0.08 }}
                    >
                      {m.content}
                    </motion.span>
                  </motion.div>
                  {last && m.timestamp && <span className="mt-1 px-1 text-[11px] tabular-nums text-[#86868b] dark:text-[#98989d]">{m.timestamp}</span>}
                </div>
              );
            })}
            {typing && (
              <div className={`flex ${items.length && items[items.length - 1].sender === "assistant" ? "mt-[3px]" : "mt-3"}`}>
                <motion.div
                  layoutId={`${uid}-b-${typing}`}
                  initial={still ? false : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={POP}
                  style={{ originX: 0, originY: 1, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 6 }}
                  className="bg-[#e9e9eb] px-3 py-2.5 dark:bg-[#2c2c2e]"
                  role="status"
                  aria-label={`${title} is typing`}
                >
                  <Dots still={still} />
                </motion.div>
              </div>
            )}
          </div>
        </LayoutGroup>
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-black/[0.06] p-3 dark:border-white/[0.08]">
        <label htmlFor={`${uid}-in`} className="sr-only">
          Message
        </label>
        <input
          id={`${uid}-in`}
          value={shownDraft}
          onChange={(e) => {
            takeOver();
            setDraft(e.target.value);
          }}
          onFocus={takeOver}
          readOnly={!interactive}
          placeholder={interactive ? "Message" : "Replay to watch again"}
          autoComplete="off"
          className="h-9 min-w-0 flex-1 rounded-full bg-[#f0f0f3] px-4 text-[14px] outline-none placeholder:text-[#86868b] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 dark:bg-[#2c2c2e] dark:placeholder:text-[#8e8e93] dark:focus-visible:ring-[#0a84ff]/70"
        />
        <motion.button
          type="submit"
          aria-label="Send"
          disabled={!interactive || !draft.trim()}
          animate={{ scale: shownDraft.trim() ? 1 : 0.86, opacity: shownDraft.trim() ? 1 : 0.45 }}
          whileTap={{ scale: 0.82 }}
          transition={POP}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0071e3] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
            <path d="M8 13V3.5M3.5 7.5L8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </form>
    </div>
  );
}

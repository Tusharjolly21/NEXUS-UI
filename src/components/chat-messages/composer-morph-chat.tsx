"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface ComposerMorphChatProps {
  /** Types two scripted questions into the composer and sends them, once, until someone touches the chat. */
  autoplay?: boolean;
  /** Called with the text whenever a message is sent. */
  onSend?: (text: string) => void;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the root. */
  className?: string;
}

type Msg = { id: number; me: boolean; text: string; hidden?: boolean; card?: boolean };

const SCRIPT = [
  { ask: "Make the hero feel less static", reply: "Try a slow drift on the background and let the headline settle in word by word. Here's a starting point:", card: true },
  { ask: "Nice. Shorter copy?", reply: "Ship interfaces that move. Six words, one idea, room for the visual to breathe.", card: false },
];
const REPLIES = ["Good call. I'd keep the spacing generous and let one accent colour do the work.", "Done. I tightened the type scale and gave the buttons a softer press."];
const SNIPPET = `<motion.h1\n  initial={{ opacity: 0, y: 12 }}\n  animate={{ opacity: 1, y: 0 }}\n/>`;
const FLIGHT = { type: "spring", stiffness: 260, damping: 26 } as const;
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

/** A ref that reads true while the element is on screen and the tab is visible. Read it inside timers. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const on = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      on.current = inView && !document.hidden;
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return on;
}

/** Words arrive one at a time, each sharpening out of a blur. */
function Stream({ text, still }: { text: string; still: boolean }) {
  if (still) return <span>{text}</span>;
  const words = text.split(" ");
  return (
    <span>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, filter: "blur(6px)", y: 3 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ delay: i * 0.055, duration: 0.35, filter: { duration: 0.35 } }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

/** The code card that slides in under the first scripted reply. */
function CodeCard({ delay, still }: { delay: number; still: boolean }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = () => {
    // Clipboard access can be refused; the label only changes when it worked.
    navigator.clipboard
      ?.writeText(SNIPPET)
      .then(() => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => {});
  };
  return (
    <motion.div
      className="mt-3 overflow-hidden rounded-[16px] border border-black/[.07] bg-[#f5f5f7] dark:border-white/10 dark:bg-[#2c2c2e]"
      initial={still ? false : { opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 26 }}
    >
      <div className="flex items-center justify-between border-b border-black/[.06] px-3 py-2 text-[11px] font-medium text-[#6e6e73] dark:border-white/10 dark:text-[#a1a1a6]">
        <span>hero.tsx</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-white px-2 py-0.5 text-[#0071e3] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#1c1c1e] dark:text-[#0a84ff] dark:focus-visible:outline-[#0a84ff]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="m-0 overflow-hidden px-3 py-2.5 text-[11.5px] leading-[1.55] text-[#1d1d1f] dark:text-[#f5f5f7]" style={{ fontFamily: MONO }}>
        {SNIPPET}
      </pre>
    </motion.div>
  );
}

/**
 * An AI chat where your message doesn't just appear: the text in the composer
 * lifts out of the field and morphs into the sent bubble on its way up the
 * thread. The reply starts as a shimmering "thinking" pill, then streams in
 * word by word, sharpening out of a blur, sometimes with a card attached.
 * The replies are canned demo text; nothing leaves the page.
 */
export function ComposerMorphChat({ autoplay = false, onSend, enableSound = true, className }: ComposerMorphChatProps) {
  const still = useReducedMotion() === true;
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ id: 1, me: false, text: "Hi, I'm Nexus. Ask me anything about your interface." }]);
  const [draft, setDraft] = useState("");
  useTypedText(draft, enableSound);
  const [thinking, setThinking] = useState(false);
  const [flight, setFlight] = useState<{ id: number; text: string; from: DOMRect; to: DOMRect } | null>(null);
  const [live, setLive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const pending = useRef<{ id: number; text: string; from: DOMRect } | null>(null);
  const nextId = useRef(2);
  const turn = useRef(0);
  const touched = useRef(false);
  const inFlight = useRef(false);
  /** Whether the message now in flight was sent by the visitor (the autoplay demo uses `play.auto`). */
  const flightByUser = useRef(false);
  const timers = useRef<number[]>([]);
  const demoTimers = useRef<number[]>([]);
  const onSendRef = useRef(onSend);
  const onScreen = useOnScreen(root);

  useEffect(() => {
    onSendRef.current = onSend;
    playRef.current = play;
  }, [onSend, play]);

  const later = useCallback((fn: () => void, ms: number, demo = false) => {
    (demo ? demoTimers : timers).current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const a = timers;
    const b = demoTimers;
    return () => {
      a.current.forEach((t) => window.clearTimeout(t));
      b.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  /** Any touch ends the autoplay demo for good. */
  const touch = () => {
    touched.current = true;
    setLive(true);
    demoTimers.current.forEach((t) => window.clearTimeout(t));
    demoTimers.current = [];
  };

  const startReply = useCallback((byUser: boolean) => {
    setThinking(true);
    const k = turn.current++;
    const s = SCRIPT[k % SCRIPT.length];
    later(() => {
      const scripted = k < SCRIPT.length;
      const id = nextId.current++;
      setThinking(false);
      setMsgs((m) => [...m, { id, me: false, text: scripted ? s.reply : REPLIES[k % REPLIES.length], card: scripted && s.card }]);
      if (byUser) playRef.current("ping", 0.7);
      else playRef.current.auto("ping", 0.7);
    }, 1400);
  }, [later]);

  const send = useCallback(
    (raw: string, byUser = false) => {
      const text = raw.trim();
      const rootEl = root.current;
      const fieldEl = field.current;
      if (!text || !rootEl || !fieldEl || inFlight.current) return;
      onSendRef.current?.(text);
      if (byUser) playRef.current("whoosh");
      else playRef.current.auto("whoosh");
      const id = nextId.current++;
      setDraft("");
      if (still) {
        setMsgs((m) => [...m, { id, me: true, text }]);
        startReply(byUser);
        return;
      }
      const rr = rootEl.getBoundingClientRect();
      const fr = fieldEl.getBoundingClientRect();
      pending.current = { id, text, from: new DOMRect(fr.left - rr.left, fr.top - rr.top, fr.width, fr.height) };
      inFlight.current = true;
      flightByUser.current = byUser;
      setMsgs((m) => [...m, { id, me: true, text, hidden: true }]);
    },
    [still, startReply],
  );

  // Once the hidden bubble is laid out, measure where it will sit and fly the composer text there.
  useLayoutEffect(() => {
    const p = pending.current;
    const listEl = list.current;
    const rootEl = root.current;
    if (!p || !listEl || !rootEl) return;
    pending.current = null;
    listEl.scrollTop = listEl.scrollHeight;
    const el = listEl.querySelector<HTMLElement>(`[data-id="${p.id}"]`);
    if (!el) {
      inFlight.current = false;
      setMsgs((m) => m.map((x) => (x.id === p.id ? { ...x, hidden: false } : x)));
      return;
    }
    const rr = rootEl.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setFlight({ id: p.id, text: p.text, from: p.from, to: new DOMRect(er.left - rr.left, er.top - rr.top, er.width, er.height) });
  }, [msgs]);

  const landed = (id: number) => {
    if (!inFlight.current) return;
    inFlight.current = false;
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, hidden: false } : x)));
    setFlight(null);
    startReply(flightByUser.current);
  };

  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [msgs.length, thinking]);

  // Autoplay: wait until the chat is on screen, then type the scripted questions into the composer and send them.
  useEffect(() => {
    if (!autoplay || still) return;
    const typeAsk = (k: number) => {
      const text = SCRIPT[k % SCRIPT.length].ask;
      const step = (i: number) => {
        if (touched.current) return;
        if (i <= text.length) {
          setDraft(text.slice(0, i));
          later(() => step(i + 1), 45, true);
          return;
        }
        later(() => {
          if (!touched.current) send(text);
        }, 400, true);
      };
      step(1);
    };
    const begin = () => {
      if (touched.current) return;
      if (!onScreen.current) {
        later(begin, 400, true);
        return;
      }
      later(() => typeAsk(0), 900, true);
      later(() => typeAsk(1), 6200, true);
    };
    begin();
    const pendingDemo = demoTimers;
    return () => {
      pendingDemo.current.forEach((t) => window.clearTimeout(t));
      pendingDemo.current = [];
    };
  }, [autoplay, still, later, send, onScreen]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    touch();
    send(draft, true);
  };
  const filled = draft.trim().length > 0;

  return (
    <div
      ref={root}
      className={cn(
        "relative flex h-[520px] w-[380px] max-w-full flex-col overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={touch}
      onFocusCapture={touch}
    >
      <style>{`@keyframes nx-cm-shine{from{background-position:100% 0}to{background-position:-100% 0}}.nx-cm-shine{background-image:linear-gradient(90deg,#6e6e73 0%,#6e6e73 35%,#1d1d1f 50%,#6e6e73 65%,#6e6e73 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:nx-cm-shine 1.4s linear infinite}.dark .nx-cm-shine{background-image:linear-gradient(90deg,#a1a1a6 0%,#a1a1a6 35%,#f5f5f7 50%,#a1a1a6 65%,#a1a1a6 100%)}@media (prefers-reduced-motion:reduce){.nx-cm-shine{animation:none}}`}</style>
      <div className="flex items-center gap-3 px-5 py-4">
        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[conic-gradient(from_200deg,#0a84ff,#bf5af2,#ff375f,#ff9f0a,#0a84ff)]" aria-hidden="true">
          <span className="h-3.5 w-3.5 rounded-full bg-white dark:bg-[#1c1c1e]" />
        </span>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold">Nexus</span>
          <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Design assistant</span>
        </div>
      </div>
      <div ref={list} role="log" aria-label="Conversation" aria-live={live ? "polite" : "off"} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
        {msgs.map((m) => (
          <div
            key={m.id}
            data-id={m.id}
            className={cn(
              "max-w-[82%] text-[15px] leading-[1.45]",
              m.me ? "self-end rounded-[20px] rounded-br-[6px] bg-[#0071e3] px-4 py-2.5 text-white dark:bg-[#0a84ff]" : "self-start text-[#1d1d1f] dark:text-[#f5f5f7]",
            )}
            style={{ opacity: m.hidden ? 0 : 1 }}
          >
            {m.me ? m.text : <Stream text={m.text} still={still} />}
            {m.card && <CodeCard delay={m.text.split(" ").length * 0.055 + 0.1} still={still} />}
          </div>
        ))}
        <AnimatePresence>
          {thinking && (
            <motion.div
              key="t"
              role="status"
              aria-label="Nexus is thinking"
              className="self-start overflow-hidden rounded-full bg-[#f5f5f7] px-4 py-2 text-[13px] font-medium dark:bg-[#2c2c2e]"
              initial={still ? false : { opacity: 0, scale: 0.8, originX: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={still ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            >
              <span className="nx-cm-shine" aria-hidden="true">
                Thinking
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-black/[.05] p-3 dark:border-white/[.08]">
        <input
          ref={field}
          value={draft}
          onChange={(e) => {
            touch();
            setDraft(e.target.value);
          }}
          placeholder="Ask Nexus…"
          aria-label="Message"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-full bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93] dark:focus-visible:ring-[#0a84ff]"
        />
        <motion.button
          type="submit"
          whileTap={still ? undefined : { scale: 0.9 }}
          aria-label="Send"
          aria-disabled={!filled}
          animate={{ scale: filled ? 1 : 0.85, opacity: filled ? 1 : 0.4 }}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#0071e3] text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#0a84ff] dark:focus-visible:outline-[#0a84ff]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      </form>

      {flight && (
        <motion.div
          key={flight.id}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 overflow-hidden text-[15px] leading-[1.45]"
          initial={{ x: flight.from.x, y: flight.from.y, width: flight.from.width, height: flight.from.height, borderRadius: 22 }}
          animate={{ x: flight.to.x, y: flight.to.y, width: flight.to.width, height: flight.to.height, borderRadius: 20 }}
          transition={FLIGHT}
          onAnimationComplete={() => landed(flight.id)}
        >
          {/* Two layers share the text: the sent look underneath, the composer look fading away on top. */}
          <span className="absolute inset-0 bg-[#0071e3] px-4 pt-2.5 text-white dark:bg-[#0a84ff]">{flight.text}</span>
          <motion.span
            className="absolute inset-0 bg-[#f5f5f7] px-4 pt-2.5 text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={FLIGHT}
          >
            {flight.text}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}

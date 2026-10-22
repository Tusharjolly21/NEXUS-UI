"use client";

import * as React from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";

export type SplitContactValues = { name: string; email: string; topic: string; message: string };

export type SplitContactProps = {
  heading?: string;
  intro?: string;
  email?: string;
  location?: string;
  /** IANA time zone used for the live clock. */
  timeZone?: string;
  replyTime?: string;
  topics?: string[];
  /** Called with the values after local validation; return a promise to show the sending state, throw to show an error. Without it the form simulates a send. */
  onSubmit?: (values: SplitContactValues) => Promise<void> | void;
  /** Message character limit. */
  maxLength?: number;
  /** Fills in a demo message and sends it until someone touches the form. */
  autoplay?: boolean;
  className?: string;
};

type Phase = "idle" | "sending" | "sent";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO = { name: "Jonah Reyes", email: "jonah@kitefly.co", message: "We're building a travel app and would love your help with the motion system." };

/** Hours, minutes and seconds in a zone, read in an effect so the server never renders a time. */
function useZoneTime(timeZone: string) {
  const [t, setT] = React.useState<{ h: number; m: number; s: number; label: string } | null>(null);
  React.useEffect(() => {
    let fmt: Intl.DateTimeFormat;
    let label: Intl.DateTimeFormat;
    try {
      fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone });
      label = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone });
    } catch {
      fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
      label = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
    }
    const tick = () => {
      const now = new Date();
      const [h, m, s] = fmt.format(now).split(":").map(Number);
      setT({ h, m, s, label: label.format(now) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeZone]);
  return t;
}

/** A small analog clock. Each hand rides a spring, so the second hand ticks with a little overshoot. */
function Clock({ time, still }: { time: { h: number; m: number; s: number } | null; still: boolean }) {
  // Angles only ever grow, so the springs never spin backwards at the top of the hour.
  const base = React.useRef({ s: 0, m: 0, h: 0, last: -1 });
  const sec = useSpring(0, still ? { stiffness: 2000, damping: 200 } : { stiffness: 380, damping: 14 });
  const min = useSpring(0, { stiffness: 120, damping: 20 });
  const hr = useSpring(0, { stiffness: 120, damping: 20 });
  React.useEffect(() => {
    if (!time) return;
    const b = base.current;
    const total = time.h * 3600 + time.m * 60 + time.s;
    if (b.last >= 0 && total < b.last) {
      b.s += 360 * 60;
      b.m += 360 * 24;
      b.h += 720;
    }
    b.last = total;
    const first = sec.get() === 0 && min.get() === 0;
    const s = b.s + time.s * 6;
    const m = b.m + time.m * 6 + time.s * 0.1;
    const h = b.h + (time.h % 12) * 30 + time.m * 0.5;
    if (first) {
      sec.jump(s);
      min.jump(m);
      hr.jump(h);
    } else {
      sec.set(s);
      min.set(m);
      hr.set(h);
    }
  }, [time, sec, min, hr]);
  return (
    <span className="relative block size-11 shrink-0 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.08),0_4px_10px_-4px_rgba(0,0,0,.25)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="absolute left-1/2 top-[3px] h-[3px] w-px origin-[50%_19px] bg-[#86868b]" style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }} />
      ))}
      <motion.span className="absolute bottom-1/2 left-[calc(50%-1.25px)] h-[11px] w-[2.5px] origin-bottom rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ rotate: hr }} />
      <motion.span className="absolute bottom-1/2 left-[calc(50%-1px)] h-[16px] w-[2px] origin-bottom rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ rotate: min }} />
      <motion.span className="absolute bottom-1/2 left-[calc(50%-0.5px)] h-[18px] w-px origin-bottom bg-[#ff9f0a]" style={{ rotate: sec }} />
      <span className="absolute left-1/2 top-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9f0a]" />
    </span>
  );
}

function Plane({ flying, still }: { flying: boolean; still: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 20 20"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
      initial={false}
      animate={flying && !still ? { x: [0, -4, 70], y: [0, 2, -46], rotate: [0, -10, -24], opacity: [1, 1, 0], scale: [1, 1.1, 0.6] } : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
      transition={flying ? { duration: 0.75, times: [0, 0.25, 1], ease: ["easeOut", "easeIn"] } : { duration: 0 }}
    >
      <path d="M17.5 2.5 9 11M17.5 2.5l-5 15-3.5-6.5L2.5 7.5l15-5Z" />
    </motion.svg>
  );
}

/**
 * A contact section in two panes: a glass panel with how to reach the team,
 * their local time on a springy little clock, and a copyable email; and a
 * form with topic chips, a message with a filling count ring, and a send
 * button whose paper plane takes off when the message goes.
 */
export function SplitContact({
  heading = "Let's build something good",
  intro = "Tell us what you're making. A designer and an engineer read every message.",
  email = "hello@studio.dev",
  location = "Lisbon, Portugal",
  timeZone = "Europe/Lisbon",
  replyTime = "Replies within a day",
  topics = ["Custom work", "Partnership", "Support", "Press"],
  onSubmit,
  maxLength = 500,
  autoplay = false,
  className = "",
}: SplitContactProps) {
  const still = useReducedMotion() === true;
  const id = React.useId().replace(/:/g, "");
  const time = useZoneTime(timeZone);
  const [values, setValues] = React.useState<SplitContactValues>({ name: "", email: "", topic: topics[0] ?? "", message: "" });
  useTypedText(values.name);
  useTypedText(values.email);
  useTypedText(values.message);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [flying, setFlying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const touched = React.useRef(false);
  const alive = React.useRef(true);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(copyTimer.current);
    };
  }, []);

  const used = values.message.length / Math.max(1, maxLength);
  const ring = useSpring(0, { stiffness: 200, damping: 22 });
  React.useEffect(() => {
    ring.set(Math.min(1, used));
  }, [used, ring]);
  const dash = useTransform(ring, (v) => (1 - v) * 50.27);
  const ringColor = used > 0.9 ? "#ff9f0a" : "#0071e3";

  const touch = () => {
    touched.current = true;
  };
  const set = (k: keyof SplitContactValues, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    touch();
    setError(null);
    setValues((v) => ({ ...v, [k]: e.target.value.slice(0, k === "message" ? maxLength : 200) }));
  };

  async function send(v: SplitContactValues) {
    setPhase("sending");
    setFlying(true);
    try {
      if (onSubmit) await onSubmit({ ...v, name: v.name.trim(), email: v.email.trim(), message: v.message.trim() });
      else await new Promise((r) => setTimeout(r, 1000));
      if (alive.current) setPhase("sent");
    } catch (err) {
      if (!alive.current) return;
      setPhase("idle");
      setFlying(false);
      setError(err instanceof Error && err.message ? err.message : "That didn't send. Try again in a moment.");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    touch();
    if (phase !== "idle") return;
    if (!values.name.trim()) return setError("Add your name so we know who to reply to.");
    if (!EMAIL.test(values.email.trim())) return setError("Add an email we can reply to.");
    if (values.message.trim().length < 10) return setError("Tell us a little more (10+ characters).");
    setError(null);
    void send(values);
  }

  const reset = () => {
    setPhase("idle");
    setFlying(false);
    setValues({ name: "", email: "", topic: topics[0] ?? "", message: "" });
  };

  const topicKey = topics.join("\u0000");
  React.useEffect(() => {
    if (!autoplay) return;
    const list = topicKey ? topicKey.split("\u0000") : [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, f: () => void) =>
      timers.push(
        setTimeout(() => {
          if (!touched.current) f();
        }, ms),
      );
    const play = () => {
      let t = 600;
      for (let i = 1; i <= DEMO.name.length; i++) {
        const s = DEMO.name.slice(0, i);
        at((t += 45), () => setValues((v) => ({ ...v, name: s })));
      }
      for (let i = 1; i <= DEMO.email.length; i++) {
        const s = DEMO.email.slice(0, i);
        at((t += 35), () => setValues((v) => ({ ...v, email: s })));
      }
      list.slice(0, 3).forEach((topic) => at((t += 450), () => setValues((v) => ({ ...v, topic }))));
      for (let i = 2; i <= DEMO.message.length; i += 2) {
        const s = DEMO.message.slice(0, i);
        at((t += 28), () => setValues((v) => ({ ...v, message: s })));
      }
      at((t += 500), () => {
        setPhase("sending");
        setFlying(true);
      });
      at((t += 1000), () => setPhase("sent"));
      at((t += 2600), () => {
        setPhase("idle");
        setFlying(false);
        setValues({ name: "", email: "", topic: list[0] ?? "", message: "" });
      });
      at((t += 500), play);
    };
    play();
    return () => timers.forEach(clearTimeout);
  }, [autoplay, topicKey]);

  const copy = async () => {
    touch();
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard can be blocked; the address is still visible to select.
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1600);
  };

  const focus = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";
  const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
  const soft = "text-[#6e6e73] dark:text-[#a1a1a6]";
  const field = `w-full rounded-[12px] bg-[#f5f5f7] px-3.5 text-[14.5px] outline-none ring-1 ring-black/[.04] transition-shadow placeholder:text-[#86868b] focus:bg-white focus:ring-2 focus:ring-[#0071e3] disabled:opacity-60 dark:bg-[#2c2c2e] dark:ring-white/[.06] dark:placeholder:text-[#8e8e93] dark:focus:ring-[#0a84ff] ${ink}`;
  const busy = phase !== "idle";

  return (
    <section
      className={`@container w-full overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={touch}
      onKeyDown={touch}
      aria-labelledby={`${id}-h`}
    >
      <div className="grid @[560px]:grid-cols-2">
        <div className="relative isolate overflow-hidden p-6 @[560px]:p-7">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 [background:var(--l)] dark:[background:var(--d)]"
            style={
              {
                "--l": "radial-gradient(70% 60% at 100% 0%, rgba(255,159,10,.32), transparent 70%), radial-gradient(80% 70% at 0% 100%, rgba(90,200,250,.4), transparent 70%), #f5f5f7",
                "--d": "radial-gradient(70% 60% at 100% 0%, rgba(255,159,10,.22), transparent 70%), radial-gradient(80% 70% at 0% 100%, rgba(10,132,255,.3), transparent 70%), #232326",
              } as React.CSSProperties
            }
          />
          <h2 id={`${id}-h`} className={`text-[26px] font-semibold leading-[1.08] tracking-[-0.04em] [text-wrap:balance] ${ink}`}>
            {heading}
          </h2>
          {intro && <p className={`mt-2.5 text-[14px] leading-relaxed ${soft}`}>{intro}</p>}
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-3 rounded-[16px] bg-white/70 p-2.5 ring-1 ring-white/80 backdrop-blur-md dark:bg-white/[.06] dark:ring-white/10">
              <Clock time={time} still={still} />
              <div className="min-w-0">
                <p className={`text-[12px] ${soft}`}>{location}</p>
                <p className={`text-[15px] font-semibold tabular-nums tracking-[-0.01em] ${ink}`}>
                  {time ? time.label : "--:--"} <span className={`text-[12px] font-normal ${soft}`}>local time</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={copy}
              className={`flex w-full items-center gap-3 rounded-[16px] bg-white/70 p-2.5 text-left ring-1 ring-white/80 backdrop-blur-md transition-colors hover:bg-white dark:bg-white/[.06] dark:ring-white/10 dark:hover:bg-white/10 ${focus}`}
              aria-label={`Copy ${email}`}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-white dark:bg-[#0a84ff]" aria-hidden>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
                  <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" />
                  <path d="m3.5 6 6.5 5 6.5-5" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[12px] ${soft}`} aria-live="polite">
                  {copied ? "Copied to clipboard" : "Email us"}
                </span>
                <span className={`block truncate text-[15px] font-semibold tracking-[-0.01em] ${ink}`}>{email}</span>
              </span>
              <span className="relative mr-1 size-4 shrink-0" aria-hidden>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.svg
                    key={copied ? "y" : "n"}
                    viewBox="0 0 16 16"
                    className={`absolute inset-0 size-4 ${copied ? "text-[#248a3d] dark:text-[#30d158]" : soft}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 600, damping: 22 }}
                  >
                    {copied ? <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeWidth={2.2} /> : <><rect x="5" y="5" width="8.5" height="8.5" rx="2" /><path d="M10.5 5V3.8A1.3 1.3 0 0 0 9.2 2.5H3.8a1.3 1.3 0 0 0-1.3 1.3v5.4a1.3 1.3 0 0 0 1.3 1.3H5" /></>}
                  </motion.svg>
                </AnimatePresence>
              </span>
            </button>
            <p className={`flex items-center gap-2 px-1 pt-1 text-[12.5px] ${soft}`}>
              <span className="size-1.5 rounded-full bg-[#30d158]" aria-hidden />
              {replyTime}
            </p>
          </div>
        </div>

        <div className="relative p-6 @[560px]:p-7">
          <AnimatePresence mode="popLayout" initial={false}>
            {phase === "sent" ? (
              <motion.div
                key="sent"
                role="status"
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 24 }}
                className="flex min-h-[320px] flex-col items-center justify-center text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-[#30d158] text-white shadow-[0_12px_30px_-10px_rgba(48,209,88,.8)]">
                  <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <motion.path d="M5 12.5 10 17.5 19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.1 }} />
                  </svg>
                </span>
                <p className={`mt-4 text-[20px] font-semibold tracking-[-0.03em] ${ink}`}>Message sent</p>
                <p className={`mt-1 max-w-[260px] text-[14px] ${soft}`}>
                  Thanks{values.name.trim() ? `, ${values.name.trim().split(" ")[0]}` : ""}. {replyTime}.
                </p>
                <button type="button" onClick={reset} className={`mt-5 rounded-full px-4 py-2 text-[13px] font-medium text-[#0066cc] hover:bg-[#0071e3]/10 dark:text-[#64b5ff] ${focus}`}>
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={submit}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}
                className="space-y-3"
              >
                <div className="grid gap-2.5 @[760px]:grid-cols-2">
                  <label className="block">
                    <span className="sr-only">Name</span>
                    <input value={values.name} onChange={(e) => set("name", e)} disabled={busy} autoComplete="name" placeholder="Name" className={`${field} h-11`} />
                  </label>
                  <label className="block">
                    <span className="sr-only">Email</span>
                    <input value={values.email} onChange={(e) => set("email", e)} disabled={busy} type="email" inputMode="email" autoComplete="email" placeholder="Email" className={`${field} h-11`} />
                  </label>
                </div>
                <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-1.5">
                  <LayoutGroup id={`${id}-topics`}>
                    {topics.map((t) => {
                      const on = values.topic === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          disabled={busy}
                          onClick={() => {
                            touch();
                            setValues((v) => ({ ...v, topic: t }));
                          }}
                          className={`relative rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${focus} ${on ? "text-white" : `${soft} bg-[#f5f5f7] hover:text-[#1d1d1f] dark:bg-[#2c2c2e] dark:hover:text-[#f5f5f7]`}`}
                        >
                          {on && (
                            <motion.span
                              layoutId="chip"
                              className="absolute inset-0 rounded-full bg-[#1d1d1f] dark:bg-[#0a84ff]"
                              transition={still ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          <span className="relative">{t}</span>
                        </button>
                      );
                    })}
                  </LayoutGroup>
                </div>
                <label className="relative block">
                  <span className="sr-only">Message</span>
                  <textarea
                    value={values.message}
                    onChange={(e) => set("message", e)}
                    disabled={busy}
                    rows={3}
                    placeholder="What are you working on?"
                    aria-describedby={`${id}-count`}
                    className={`${field} block resize-none py-3 pr-12`}
                  />
                  <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5" aria-hidden>
                    <svg viewBox="0 0 20 20" className="size-5 -rotate-90">
                      <circle cx="10" cy="10" r="8" fill="none" strokeWidth="2.4" className="stroke-[#e8e8ed] dark:stroke-[#3a3a3c]" />
                      <motion.circle cx="10" cy="10" r="8" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="50.27" style={{ strokeDashoffset: dash }} stroke={ringColor} />
                    </svg>
                  </span>
                  <span id={`${id}-count`} className="sr-only">
                    {values.message.length} of {maxLength} characters
                  </span>
                </label>
                <div className="flex items-center justify-between gap-3">
                  <p className={`min-w-0 text-[12.5px] ${error ? "text-[#d70015] dark:text-[#ff6961]" : soft}`} role={error ? "alert" : undefined}>
                    {error ?? <span className="tabular-nums">{maxLength - values.message.length} characters left</span>}
                  </p>
                  <motion.button
                    type="submit"
                    disabled={busy}
                    whileTap={still ? undefined : { scale: 0.95 }}
                    className={`flex h-11 shrink-0 items-center gap-2 overflow-visible rounded-full bg-[#0071e3] pl-5 pr-4 text-[14.5px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(0,113,227,.9)] transition-colors hover:bg-[#0077ed] dark:bg-[#0a84ff] ${focus} focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1c1c1e]`}
                  >
                    {phase === "sending" ? "Sending" : "Send"}
                    <Plane flying={flying} still={still} />
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, LayoutGroup, animate, motion, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface WaitlistCtaMember {
  /** Two letters shown in the avatar. Also the key, so keep it unique. */
  initials: string;
  /** Avatar colour. */
  hue: string;
}

export interface WaitlistCtaProps {
  /** Big heading. */
  heading?: string;
  /** Supporting line under the heading. */
  description?: string;
  /** Text of the join button. */
  buttonLabel?: string;
  /** Placeholder of the email field. */
  placeholder?: string;
  /** People already on the list, drawn as an overlapping row of avatars. */
  crowd?: WaitlistCtaMember[];
  /** How many people are on the list before the visitor joins. The visitor becomes the next number. */
  baseCount?: number;
  /** Host and path of the referral link shown after joining. The visitor's handle is added as ?ref=. */
  referralBase?: string;
  /**
   * Types an address and joins by itself, then resets and repeats, until the visitor touches the section.
   * Pauses off screen and in a hidden tab. Never runs under reduced motion.
   */
  autoplay?: boolean;
  /** Taps when Join is pressed and chimes when the place appears. Follows the site-wide sound switch. */
  enableSound?: boolean;
  /** Called with the address when a valid email is submitted. The address is not stored or sent anywhere by the block. */
  onJoin?: (email: string) => void;
  className?: string;
}

export const DEFAULT_WAITLIST_CROWD: WaitlistCtaMember[] = [
  { initials: "MC", hue: "#ff9f0a" },
  { initials: "LP", hue: "#0a84ff" },
  { initials: "AL", hue: "#bf5af2" },
  { initials: "NH", hue: "#30d158" },
  { initials: "KI", hue: "#5e5ce6" },
];

type State = "idle" | "busy" | "in";

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** True while the element is on screen and the tab is visible, so timers can stand down otherwise. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return inView && visible;
}

/**
 * A waitlist call to action that makes joining feel like something happened. Enter an email and the button
 * turns into a spinner, then the whole form folds into the visitor's place in line: the count ticks over to
 * their number, their avatar joins the front of the crowd, and a referral link appears to move them up. A
 * bad address shakes the form. Under reduced motion nothing shakes, morphs or spins. The address is only
 * used to build the demo handle; nothing is stored or sent.
 */
export function WaitlistCta({
  heading = "Get Nexus Pro before everyone else.",
  description = "Early members get every block, every template, and a say in what we build next.",
  buttonLabel = "Join waitlist",
  placeholder = "you@company.com",
  crowd = DEFAULT_WAITLIST_CROWD,
  baseCount = 1283,
  referralBase = "nexus-ui.com/pro",
  autoplay = false,
  enableSound = true,
  onJoin,
  className,
}: WaitlistCtaProps) {
  const reduce = useReducedMotion();
  const play = useSound(enableSound);
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root);
  const [email, setEmail] = useState("");
  useTypedText(email, enableSound);
  const [state, setState] = useState<State>("idle");
  const [bad, setBad] = useState(false);
  const [count, setCount] = useState(baseCount);
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);
  const timers = useRef(new Set<number>());
  const counter = useRef<AnimationPlaybackControls | null>(null);
  const demoActive = useRef(false);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);
  const clearAll = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current.clear();
    counter.current?.stop();
    counter.current = null;
  }, []);
  useEffect(() => clearAll, [clearAll]);

  const handle = (email.split("@")[0] || "you").replace(/[^a-z0-9]/gi, "").slice(0, 12) || "you";
  const me = handle.slice(0, 2).toUpperCase();
  const link = `${referralBase}?ref=${handle.toLowerCase()}42`;

  const join = useCallback(
    (value: string, auto = false) => {
      const tap = auto ? play.auto : play;
      tap("tap", 0.5);
      const v = value.trim();
      if (!/^\S+@\S+\.\S+$/.test(v)) {
        setBad(true);
        later(() => setBad(false), 450);
        return;
      }
      onJoin?.(v);
      setState("busy");
      later(
        () => {
          setState("in");
          tap("success", 0.6);
          if (reduce) setCount(baseCount + 1);
          else counter.current = animate(baseCount, baseCount + 1, { duration: 0.8, delay: 0.3, onUpdate: (x) => setCount(Math.round(x)) });
        },
        reduce ? 400 : 900,
      );
    },
    [play, later, onJoin, reduce, baseCount],
  );

  const reset = useCallback(() => {
    clearAll();
    demoActive.current = false;
    setState("idle");
    setEmail("");
    setCount(baseCount);
    setCopied(false);
    setBad(false);
  }, [clearAll, baseCount]);

  // The first touch hands the section over: a demo caught half way is cleared so the form is ready to use.
  const takeOver = () => {
    if (touched) return;
    setTouched(true);
    if (demoActive.current) reset();
  };

  const running = autoplay && !reduce && !touched && onScreen;
  useEffect(() => {
    if (!running) return;
    const ids: number[] = [];
    const go = (fn: () => void, ms: number) => ids.push(window.setTimeout(fn, ms));
    const addr = "sam@studio.co";
    const loop = () => {
      go(() => {
        reset();
        demoActive.current = true;
      }, 0);
      addr.split("").forEach((_, i) => go(() => setEmail(addr.slice(0, i + 1)), 900 + i * 60));
      go(() => join(addr, true), 2000);
      go(() => reset(), 7600);
    };
    loop();
    const every = window.setInterval(loop, 8000);
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      window.clearInterval(every);
    };
  }, [running, join, reset]);

  const members = state === "in" ? [{ initials: me, hue: "", me: true }, ...crowd.map((c) => ({ ...c, me: false }))] : crowd.map((c) => ({ ...c, me: false }));
  const boxSpring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <section
      ref={root}
      aria-label="Join the waitlist"
      className={cn("w-full bg-white px-4 py-12 dark:bg-black", className)}
      onPointerDownCapture={takeOver}
      onKeyDownCapture={takeOver}
    >
      <div className="relative mx-auto w-full max-w-[1080px] overflow-hidden rounded-[28px] bg-[#f5f5f7] px-6 py-12 text-center sm:py-16 dark:bg-[#1c1c1e]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(0,0,0,.08)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000,transparent)] dark:[background-image:radial-gradient(rgba(255,255,255,.1)_1px,transparent_1px)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[560px]">
          <h2 className="m-0 text-[clamp(30px,5vw,48px)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">{heading}</h2>
          <p className="m-0 mx-auto mt-4 max-w-[420px] text-[17px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">{description}</p>
          <LayoutGroup id={`${uid}-wl`}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <div className="flex" aria-hidden="true">
                <AnimatePresence initial={false}>
                  {members.map((m, i) => (
                    <motion.span
                      key={m.initials + m.hue}
                      layout={!reduce}
                      className={cn(
                        "-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-[3px] ring-[#f5f5f7] first:ml-0 dark:ring-[#1c1c1e]",
                        m.me && "bg-[#1d1d1f] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]",
                      )}
                      style={{ background: m.me ? undefined : m.hue, zIndex: 10 - i }}
                      initial={reduce ? { opacity: 0 } : { scale: 0, x: -10 }}
                      animate={reduce ? { opacity: 1 } : { scale: 1, x: 0 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 22, delay: m.me ? 0.35 : 0 }}
                    >
                      {m.initials}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <span className="text-[14px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
                <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{count.toLocaleString("en-US")}</span> on the list
              </span>
            </div>

            <div className="mx-auto mt-7 max-w-[440px]">
              <AnimatePresence mode="popLayout" initial={false}>
                {state !== "in" ? (
                  <motion.form
                    key="form"
                    layoutId={`${uid}-box`}
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      setTouched(true);
                      join(email);
                    }}
                    className="flex h-14 items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-18px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_30px_-18px_rgba(0,0,0,.9)]"
                    animate={{ x: bad && !reduce ? [0, -10, 9, -5, 0] : 0 }}
                    transition={{ x: { duration: reduce ? 0 : 0.4 }, layout: boxSpring }}
                  >
                    <input
                      value={email}
                      onChange={(e) => {
                        setTouched(true);
                        setEmail(e.target.value);
                      }}
                      type="email"
                      required
                      placeholder={placeholder}
                      aria-label="Email address"
                      aria-invalid={bad || undefined}
                      autoComplete="off"
                      disabled={state === "busy"}
                      className={cn(
                        "min-w-0 flex-1 rounded-md bg-transparent text-[16px] text-[#1d1d1f] placeholder:text-[#6e6e73] dark:text-[#f5f5f7] dark:placeholder:text-[#a1a1a6]",
                        FOCUS,
                      )}
                    />
                    <motion.button
                      layout={!reduce}
                      type="submit"
                      disabled={state === "busy"}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-full bg-[#1d1d1f] text-[15px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]",
                        FOCUS,
                      )}
                      style={{ width: state === "busy" && !reduce ? 44 : 132 }}
                      transition={boxSpring}
                    >
                      {state === "busy" ? (
                        reduce ? (
                          "Joining"
                        ) : (
                          <>
                            <motion.span
                              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white dark:border-black/20 dark:border-t-[#1d1d1f]"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                              aria-hidden="true"
                            />
                            <span className="sr-only">Joining</span>
                          </>
                        )
                      ) : (
                        buttonLabel
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="in"
                    layoutId={`${uid}-box`}
                    className="rounded-[26px] bg-white p-5 text-left shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-18px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_30px_-18px_rgba(0,0,0,.9)]"
                    transition={boxSpring}
                  >
                    <motion.div initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { delay: 0.2 }}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">You&rsquo;re in.</span>
                        <span className="text-[14px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
                          Place <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">#{count.toLocaleString("en-US")}</span>
                        </span>
                      </div>
                      <p className="m-0 mt-1 text-[13.5px] text-[#6e6e73] dark:text-[#a1a1a6]">Invite 3 friends and skip 500 places.</p>
                      <div className="mt-3 flex h-11 items-center gap-2 rounded-[12px] bg-[#f5f5f7] pl-3.5 pr-1 dark:bg-[#1c1c1e]">
                        <span className="min-w-0 flex-1 truncate text-[13.5px] text-[#1d1d1f] dark:text-[#f5f5f7]">{link}</span>
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard?.writeText(`https://${link}`).catch(() => {});
                            setCopied(true);
                            later(() => setCopied(false), 1500);
                          }}
                          className={cn(
                            "h-9 rounded-[9px] bg-white px-3 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#48484a] dark:text-[#f5f5f7] dark:shadow-none",
                            FOCUS,
                          )}
                        >
                          {copied ? "Copied" : "Copy link"}
                        </button>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5" role="img" aria-label="0 of 3 friends joined">
                        {[0, 1, 2].map((k) => (
                          <span key={k} className="h-1.5 flex-1 rounded-full bg-[#ececf0] dark:bg-[#3a3a3c]" />
                        ))}
                        <span className="ml-1 text-[11.5px] text-[#6e6e73] dark:text-[#a1a1a6]">0/3</span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>
          <p className="sr-only" role="status" aria-live="polite">
            {bad ? "Enter a valid email address." : state === "in" ? `You are in. Place number ${(baseCount + 1).toLocaleString("en-US")}.` : copied ? "Link copied." : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

export interface PeekLoginValues {
  email: string;
  password: string;
}

export interface PeekLoginProps {
  /** Colour of the face, the focus rings and the Show/Hide button. */
  accent?: string;
  /**
   * Called with the typed values when the form is submitted. The component never sends
   * anything anywhere itself; it only plays a short local "signing in" state.
   */
  onSubmit?: (values: PeekLoginValues) => void;
  /** Types a sample email and password and peeks at it, on a loop, until someone interacts. */
  autoplay?: boolean;
}

function Eye({ x, y, closed, side }: { x: MotionValue<number>; y: MotionValue<number>; closed: boolean; side: -1 | 1 }) {
  // The eye on the far side of where it's looking gets smaller, like it's turning away.
  const size = useTransform(x, (v) => 1 - Math.max(0, -side * v) * 0.07);
  return (
    <motion.span
      className="relative flex h-[22px] w-[18px] items-center justify-center overflow-hidden rounded-full bg-white"
      style={{ scale: size }}
      animate={{ scaleY: closed ? 0.1 : 1 }}
      transition={{ duration: 0.12 }}
    >
      <motion.span className="h-[10px] w-[10px] rounded-full bg-[#1d1d1f]" style={{ x, y }} />
    </motion.span>
  );
}

// Keep password managers and browser autofill out of a demo form.
const NO_FILL = { autoComplete: "off", "data-1p-ignore": true, "data-lpignore": "true", "data-bwignore": true, "data-form-type": "other" } as const;

/**
 * Sign-in card with a little face that watches. Its eyes follow the pointer,
 * track the caret while you type your email, and it covers them with its
 * paws when you type a password. Show the password and it peeks.
 */
export function PeekLogin({ accent = "#0071e3", onSubmit, autoplay = false }: PeekLoginProps) {
  const face = useRef<HTMLDivElement>(null);
  const tx = useMotionValue(0), ty = useMotionValue(0);
  const x = useSpring(tx, { stiffness: 300, damping: 22 }), y = useSpring(ty, { stiffness: 300, damping: 22 });
  const tilt = useTransform(x, (v) => v * 1.6);
  const shift = useTransform(x, (v) => v * 1.2);
  const [field, setField] = useState<"none" | "email" | "pw">("none");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  useTypedText(email);
  useTypedText(pw);
  const [show, setShow] = useState(false);
  const [blink, setBlink] = useState(false);
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const touched = useRef(false);
  const statusTimers = useRef<number[]>([]);

  useEffect(() => {
    let open = 0;
    const t = window.setInterval(() => {
      setBlink(true);
      open = window.setTimeout(() => setBlink(false), 140);
    }, 3200);
    return () => { window.clearInterval(t); window.clearTimeout(open); };
  }, []);

  useEffect(() => {
    const pending = statusTimers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (field === "email") return;
      const r = face.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 160);
      tx.set((dx / d) * 4 * k);
      ty.set((dy / d) * 5 * k);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [field, tx, ty]);

  // While the email field is active the eyes read along the text, left to right.
  useEffect(() => {
    if (field === "email") { tx.set(-4 + Math.min(email.length, 24) / 3); ty.set(5); }
  }, [email, field, tx, ty]);

  useEffect(() => {
    if (!autoplay) return;
    const script: [number, () => void][] = [];
    const typed = (s: string, set: (v: string) => void, at: number) => s.split("").forEach((_, i) => script.push([at + i * 90, () => set(s.slice(0, i + 1))]));
    script.push([400, () => setField("email")]);
    typed("sam@studio.com", setEmail, 600);
    script.push([2200, () => setField("pw")]);
    typed("hunter22", setPw, 2500);
    script.push([3600, () => setShow(true)]);
    script.push([4800, () => setShow(false)]);
    script.push([5600, () => setField("none")]);
    script.push([7000, () => { setEmail(""); setPw(""); }]);
    let timers: number[] = [];
    const run = () => { timers = script.map(([t, f]) => window.setTimeout(() => { if (!touched.current) f(); }, t)); };
    run();
    const loop = window.setInterval(() => { if (touched.current) return window.clearInterval(loop); run(); }, 7600);
    return () => { timers.forEach((t) => window.clearTimeout(t)); window.clearInterval(loop); };
  }, [autoplay]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    onSubmit?.({ email, password: pw });
    // Simulated locally: nothing leaves the page.
    setStatus("busy");
    statusTimers.current.push(
      window.setTimeout(() => setStatus("done"), 900),
      window.setTimeout(() => setStatus("idle"), 2600),
    );
  };

  const covering = field === "pw" && !show;
  const peeking = field === "pw" && show;
  const ring = { ["--tw-ring-color" as string]: accent };

  return (
    <form
      className="flex w-[290px] flex-col gap-3 rounded-[26px] bg-white p-5 pt-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]"
      onSubmit={submit}
      onPointerDown={() => (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
      autoComplete="off"
      noValidate
    >
      <motion.div
        ref={face}
        className="relative mx-auto mb-1 flex h-[78px] w-[96px] items-center justify-center overflow-hidden rounded-[40px_40px_32px_32px]"
        style={{ background: accent, rotate: tilt, x: shift }}
        aria-hidden="true"
      >
        <div className="flex gap-3">
          <Eye x={x} y={y} closed={blink || covering} side={-1} />
          <Eye x={x} y={y} closed={blink || covering} side={1} />
        </div>
        <motion.span className="absolute bottom-[14px] h-[6px] w-[14px] rounded-b-full bg-[#0b2a4a]/40" animate={{ scaleX: field === "email" || status === "done" ? 1.3 : 1 }} />
        <motion.span
          className="absolute left-[10px] h-[34px] w-[34px] rounded-full bg-[#5ac8fa]"
          style={{ boxShadow: "inset 0 -4px 0 rgba(0,0,0,.1)" }}
          animate={{ y: covering ? 0 : peeking ? 18 : 60, x: covering ? 6 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
        />
        <motion.span
          className="absolute right-[10px] h-[34px] w-[34px] rounded-full bg-[#5ac8fa]"
          style={{ boxShadow: "inset 0 -4px 0 rgba(0,0,0,.1)" }}
          animate={{ y: covering || peeking ? 0 : 60, x: covering || peeking ? -6 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 24, delay: 0.04 }}
        />
      </motion.div>
      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Email</span>
        <input
          type="text"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          {...NO_FILL}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setField("email")}
          onBlur={() => setField("none")}
          placeholder="you@company.com"
          className="h-11 rounded-xl bg-[#f5f5f7] px-3.5 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6] focus:ring-2 dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93]"
          style={ring}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Password</span>
        <span className="relative flex">
          <input
            type={show ? "text" : "password"}
            {...NO_FILL}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onFocus={() => setField("pw")}
            onBlur={() => setField("none")}
            placeholder="••••••••"
            className="h-11 w-full rounded-xl bg-[#f5f5f7] pl-3.5 pr-16 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6] focus:ring-2 dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93]"
            style={ring}
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[12px] font-semibold outline-none focus-visible:ring-2"
            style={{ color: accent, ...ring }}
          >
            {show ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        aria-busy={status === "busy"}
        className="mt-1 h-11 rounded-xl bg-[#1d1d1f] text-[15px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-offset-[#1c1c1e]"
        style={ring}
      >
        {status === "busy" ? "Signing in…" : status === "done" ? "Signed in" : "Sign in"}
      </motion.button>
      <span role="status" className="sr-only">
        {status === "done" ? "Signed in" : ""}
      </span>
    </form>
  );
}

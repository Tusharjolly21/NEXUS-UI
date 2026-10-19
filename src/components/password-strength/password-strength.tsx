"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface PasswordStrengthProps {
  accent?: string;
  onChange?: (value: string, score: number) => void;
  /** Types a sample password by itself until the user clicks in. */
  autoplay?: boolean;
}

const LEVELS = [
  { label: "Enter a password", color: "#d2d2d7" },
  { label: "Weak", color: "#ff3b30" },
  { label: "Fair", color: "#ff9f0a" },
  { label: "Good", color: "#ffcc00" },
  { label: "Strong", color: "#34c759" },
];

export function scorePassword(pw: string) {
  const rules = [
    { label: "8+ characters", met: pw.length >= 8 },
    { label: "Upper & lower case", met: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: "A number", met: /\d/.test(pw) },
    { label: "A symbol", met: /[^A-Za-z0-9]/.test(pw) },
  ];
  let score = rules.filter((r) => r.met).length;
  if (!pw) score = 0;
  else if (pw.length < 8) score = Math.min(score, 1);
  return { rules, score };
}

export function PasswordStrength({ accent = "#0071e3", onChange, autoplay = false }: PasswordStrengthProps) {
  const id = useId();
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const touched = useRef(false);
  const { rules, score } = scorePassword(pw);
  const level = LEVELS[score];

  useEffect(() => {
    if (!autoplay) return;
    const sample = "Sunset-Drive9";
    let i = 0;
    let t: number;
    const tick = () => {
      if (touched.current) return;
      i += 1;
      if (i <= sample.length) {
        setPw(sample.slice(0, i));
        t = window.setTimeout(tick, 120 + Math.random() * 80);
      } else {
        t = window.setTimeout(() => { if (!touched.current) { setPw(""); i = 0; t = window.setTimeout(tick, 900); } }, 2600);
      }
    };
    t = window.setTimeout(tick, 900);
    return () => clearTimeout(t);
  }, [autoplay]);

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-4">
      <label htmlFor={id} className="text-[24px] font-semibold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">
        Create a password
      </label>
      <motion.div
        className="relative flex h-14 items-center rounded-2xl bg-white dark:bg-[#2c2c2e]"
        animate={{ boxShadow: `inset 0 0 0 1px ${score ? level.color : "rgba(120,120,128,.36)"}, 0 0 0 ${score ? 4 : 0}px ${level.color}22` }}
        transition={{ duration: 0.3 }}
      >
        <input
          id={id}
          type={show ? "text" : "password"}
          value={pw}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          onFocus={() => { if (!touched.current) { touched.current = true; setPw(""); } }}
          onChange={(e) => { touched.current = true; setPw(e.target.value); onChange?.(e.target.value, scorePassword(e.target.value).score); }}
          className="h-full min-w-0 flex-1 bg-transparent px-[18px] text-[17px] font-medium tracking-wide text-[#1d1d1f] outline-none dark:text-[#f5f5f7] placeholder:font-normal placeholder:tracking-normal placeholder:text-[#a1a1a6]"
          aria-describedby={`${id}-rules`}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="mr-1.5 flex h-11 w-11 items-center justify-center rounded-xl text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7] focus-visible:outline focus-visible:outline-2"
          style={{ outlineColor: accent }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <motion.circle cx="12" cy="12" r="3" animate={{ scale: show ? 1 : 0.6 }} transition={{ type: "spring", stiffness: 500, damping: 18 }} />
            <motion.path d="M4 4l16 16" initial={false} animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }} />
          </svg>
        </motion.button>
      </motion.div>

      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]">
              <motion.div
                className="h-full origin-left rounded-full"
                initial={false}
                animate={{ scaleX: i < score ? 1 : 0, backgroundColor: level.color }}
                transition={{ type: "spring", stiffness: 300, damping: 24, delay: i < score ? i * 0.05 : (3 - i) * 0.03 }}
              />
            </div>
          ))}
        </div>
        <div className="flex h-5 items-center justify-between overflow-hidden text-[13px]">
          <span className="text-[#86868b] dark:text-[#98989d]">Strength</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={level.label}
              initial={{ y: 16, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -16, opacity: 0, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="font-semibold"
              style={{ color: score ? (score === 3 ? "#b38f00" : level.color) : "#86868b" }}
            >
              {level.label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <ul id={`${id}-rules`} className="mt-1 grid grid-cols-2 gap-x-4 gap-y-3">
        {rules.map((r) => (
          <li key={r.label} className={`flex items-center gap-2.5 text-[14px] transition-colors ${r.met ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#86868b] dark:text-[#98989d]"}`}>
            <motion.span
              className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full ${r.met ? "" : "shadow-[inset_0_0_0_1.5px_#c7c7cc] dark:shadow-[inset_0_0_0_1.5px_#636366]"}`}
              animate={{ backgroundColor: r.met ? accent : "rgba(0,0,0,0)", scale: r.met ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 0.35 }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <motion.path d="M2.5 6.2l2.3 2.3L9.5 3.8" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: r.met ? 1 : 0 }} transition={{ duration: 0.3, delay: r.met ? 0.1 : 0 }} />
              </svg>
            </motion.span>
            {r.label}
            <span className="sr-only">{r.met ? "(met)" : "(not met)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

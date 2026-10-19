"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";

type Status = "idle" | "verifying" | "error" | "success" | "done";

export interface OtpInputProps {
  length?: number;
  /** Return true when the code is valid. Defaults to accepting "482913". */
  verify?: (code: string) => boolean | Promise<boolean>;
  /** Types this code by itself until the user clicks in. */
  autoplay?: string;
  accent?: string;
  /** Called when "Resend code" is pressed. */
  onResend?: () => void;
  /** Called once a code verifies. */
  onVerified?: (code: string) => void;
}

const spring = { type: "spring", stiffness: 500, damping: 30 } as const;

export function OtpInput({
  length = 6,
  verify = (c) => c === "482913",
  autoplay,
  accent = "#0071e3",
  onResend,
  onVerified,
}: OtpInputProps) {
  const uid = useId();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [focused, setFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const shake = useAnimationControls();
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const submit = async (value: string) => {
    setStatus("verifying");
    await new Promise<void>((r) => later(r, 900));
    const ok = await verify(value);
    if (ok) {
      setStatus("success");
      onVerified?.(value);
      later(() => setStatus("done"), 650);
    } else {
      setStatus("error");
      setShowError(true);
      shake.start({ x: [0, -14, 12, -9, 7, -4, 0], transition: { duration: 0.5 } });
      later(() => {
        setCode("");
        setStatus("idle");
      }, 600);
    }
  };

  const handle = (raw: string) => {
    if (status === "verifying" || status === "success" || status === "done") return;
    const value = raw.replace(/\D/g, "").slice(0, length);
    setCode(value);
    if (value.length) setShowError(false);
    if (value.length === length) submit(value);
  };

  const reset = () => {
    clearTimers();
    setCode("");
    setStatus("idle");
    setShowError(false);
  };

  // Self-typing demo until the user takes over.
  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    const run = (delay: number) =>
      later(() => {
        if (!alive || touched.current) return;
        let i = 0;
        const step = () => {
          if (!alive || touched.current) return;
          i += 1;
          setCode(autoplay.slice(0, i));
          if (i < autoplay.length) later(step, 140 + Math.random() * 90);
          else {
            later(() => submit(autoplay), 50);
            later(() => {
              if (!alive || touched.current) return;
              reset();
              run(900);
            }, 4200);
          }
        };
        step();
      }, delay);
    run(900);
    return () => {
      alive = false;
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const takeOver = () => {
    if (touched.current) return;
    touched.current = true;
    reset();
  };

  const locked = status === "verifying" || status === "success" || status === "done";
  const activeIndex = Math.min(code.length, length - 1);
  const center = (length - 1) / 2;

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div animate={shake} className="relative flex h-[66px] items-center">
        <AnimatePresence initial={false}>
          {status !== "done" &&
            Array.from({ length }).map((_, i) => {
              const filled = i < code.length;
              const isActive = focused && !locked && i === activeIndex && code.length < length;
              const isError = status === "error";
              const isSuccess = status === "success";
              return (
                <motion.div
                  key={`box-${i}`}
                  custom={i}
                  initial={{ opacity: 0, y: 24, scale: 0.85 }}
                  animate={
                    status === "verifying"
                      ? { opacity: 1, scale: 1, y: [0, -8, 0], transition: { y: { duration: 0.8, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" } } }
                      : { opacity: 1, scale: 1, y: 0, x: 0, backgroundColor: isSuccess ? accent : "#ffffff", transition: { ...spring, delay: isSuccess ? i * 0.05 : 0 } }
                  }
                  exit={{ x: (center - i) * 64, scale: 0.3, opacity: 0, transition: { type: "spring", stiffness: 260, damping: 26, delay: Math.abs(center - i) * 0.03 } }}
                  className="relative flex h-[66px] w-[54px] items-center justify-center rounded-2xl"
                  style={{
                    marginRight: i === length - 1 ? 0 : i === length / 2 - 1 ? 22 : 10,
                    boxShadow: isError
                      ? "inset 0 0 0 2px #ff3b30, 0 0 0 5px rgba(255,59,48,.10)"
                      : filled
                        ? "inset 0 0 0 1px #aeaeb2, 0 1px 2px rgba(0,0,0,.04)"
                        : "inset 0 0 0 1px #d2d2d7, 0 1px 2px rgba(0,0,0,.04)",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId={`${uid}-ring`}
                      transition={{ type: "spring", stiffness: 520, damping: 38 }}
                      className="absolute inset-0 rounded-2xl"
                      style={{ boxShadow: `inset 0 0 0 2px ${accent}, 0 0 0 5px ${accent}24` }}
                    />
                  )}
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filled ? (
                      <motion.span
                        key={code[i] + i}
                        initial={{ y: 18, opacity: 0, scale: 0.4, filter: "blur(6px)" }}
                        animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ y: -14, opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                        transition={{ type: "spring", stiffness: 520, damping: 24 }}
                        className="text-[30px] font-semibold tracking-tight"
                        style={{ color: isSuccess ? "#fff" : "#1d1d1f" }}
                      >
                        {code[i]}
                      </motion.span>
                    ) : (
                      isActive && (
                        <motion.span
                          key="caret"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [1, 1, 0, 0] }}
                          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                          className="h-[30px] w-[2px] rounded-full"
                          style={{ background: accent }}
                        />
                      )
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
        </AnimatePresence>

        <AnimatePresence>
          {status === "done" && (
            <motion.div
              key="ok"
              role="status"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 20, delay: 0.15 }}
              className="absolute inset-0 m-auto flex h-[58px] w-max items-center gap-3 rounded-full bg-[#1d1d1f] pl-2.5 pr-6 text-[17px] font-semibold text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,.35)]"
            >
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full" style={{ background: accent }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <motion.path
                    d="M6 12.5l4 4L18 8.5"
                    stroke="#fff"
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, delay: 0.35, ease: [0.65, 0, 0.35, 1] }}
                  />
                </svg>
              </span>
              Verified
            </motion.div>
          )}
        </AnimatePresence>

        <label htmlFor={`${uid}-field`} className="sr-only">
          One-time code
        </label>
        <input
          id={`${uid}-field`}
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          value={code}
          disabled={locked}
          onChange={(e) => {
            takeOver();
            handle(e.target.value);
          }}
          onFocus={() => {
            takeOver();
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          className="absolute inset-0 h-full w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent opacity-0 disabled:cursor-default"
        />
      </motion.div>

      <div className="flex h-11 items-center justify-center text-[15px] text-[#6e6e73]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={status === "done" ? "done" : status === "verifying" || status === "success" ? "checking" : showError ? "error" : "idle"}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            {status === "done" ? (
              <button type="button" onClick={() => { touched.current = true; reset(); }} className="rounded-lg px-2 py-2 font-medium focus-visible:outline focus-visible:outline-2" style={{ color: accent }}>
                Replay
              </button>
            ) : status === "verifying" || status === "success" ? (
              <>
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-[#d2d2d7]"
                  style={{ borderTopColor: accent }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                />
                Checking…
              </>
            ) : showError ? (
              <span className="text-[#d70015]">That code didn’t match. Try again.</span>
            ) : (
              <span>Didn’t get it? <button type="button" onClick={onResend} className="font-medium" style={{ color: accent }}>Resend code</button></span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

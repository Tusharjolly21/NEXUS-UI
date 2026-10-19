"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Stage = "closed" | "open" | "sending" | "sent";

export interface FeedbackPillProps {
  label?: string;
  placeholder?: string;
  onSend?: (message: string) => void | Promise<void>;
  accent?: string;
  /** Opens, types and sends a sample message until the user interacts. */
  autoplay?: boolean;
}

const morph = { type: "spring", stiffness: 380, damping: 32 } as const;

export function FeedbackPill({ label = "Feedback", placeholder = "What would make this better?", onSend, accent = "#0071e3", autoplay = false }: FeedbackPillProps) {
  const id = useId();
  const [stage, setStage] = useState<Stage>("closed");
  const [text, setText] = useState("");
  const touched = useRef(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const send = async (msg = text) => {
    if (!msg.trim()) return;
    setStage("sending");
    await Promise.all([onSend?.(msg), new Promise((r) => setTimeout(r, 900))]);
    setStage("sent");
    later(() => {
      setStage("closed");
      setText("");
    }, 1700);
  };

  useEffect(() => {
    if (stage === "open" && touched.current) areaRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    if (!autoplay) return;
    const sample = "The dark mode toggle is hard to find.";
    const loop = () => {
      if (touched.current) return;
      setStage("open");
      let i = 0;
      const type = () => {
        if (touched.current) return;
        i++;
        setText(sample.slice(0, i));
        if (i < sample.length) later(type, 38 + Math.random() * 40);
        else later(() => !touched.current && send(sample), 500);
      };
      later(type, 700);
    };
    later(loop, 900);
    const t = setInterval(() => !touched.current && loop(), 7600);
    return () => {
      clearInterval(t);
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const takeOver = () => {
    if (touched.current) return;
    touched.current = true;
    timers.current.forEach(clearTimeout);
    if (stage !== "open") {
      setStage("closed");
      setText("");
    }
  };

  const isPill = stage === "closed";

  return (
    <div className="flex h-[240px] w-full items-center justify-center" onPointerDown={takeOver} onKeyDown={takeOver}>
      <motion.div
        layout
        transition={morph}
        style={{ borderRadius: isPill ? 999 : 24 }}
        className="overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_18px_40px_-20px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_18px_40px_-20px_rgba(0,0,0,.7)]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isPill && (
            <motion.button
              key="pill"
              type="button"
              onClick={() => setStage("open")}
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)", transition: { delay: 0.1 } }}
              exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.12 } }}
              className="flex h-11 items-center gap-2 px-5 text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
              style={{ outlineColor: accent }}
              aria-expanded={false}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
              </svg>
              {label}
            </motion.button>
          )}
          {(stage === "open" || stage === "sending") && (
            <motion.form
              key="form"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)", transition: { delay: 0.12 } }}
              exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.12 } }}
              className="flex w-[360px] flex-col gap-3 p-4"
            >
              <div className="flex items-center justify-between">
                <label htmlFor={id} className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {label}
                </label>
                <button type="button" onClick={() => setStage("closed")} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f0f3] text-[#6e6e73] hover:text-[#1d1d1f] dark:bg-[#3a3a3c] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7] focus-visible:outline focus-visible:outline-2" style={{ outlineColor: accent }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>
              <textarea
                id={id}
                ref={areaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                  if (e.key === "Escape") setStage("closed");
                }}
                placeholder={placeholder}
                rows={3}
                className="w-full resize-none rounded-2xl bg-[#f5f5f7] px-3.5 py-3 text-[15px] text-[#1d1d1f] outline-none dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93] placeholder:text-[#a1a1a6] focus:shadow-[inset_0_0_0_2px_var(--a)]"
                style={{ ["--a" as string]: accent }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">⌘ Enter to send</span>
                <motion.button
                  type="submit"
                  disabled={!text.trim() || stage === "sending"}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex h-9 min-w-[76px] items-center justify-center overflow-hidden rounded-full px-4 text-[14px] font-medium text-white disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ background: accent, outlineColor: accent }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {stage === "sending" ? (
                      <motion.span key="spin" initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} exit={{ scale: 0 }} transition={{ rotate: { duration: 0.7, repeat: Infinity, ease: "linear" } }} className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <motion.span key="send" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                        Send
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.form>
          )}
          {stage === "sent" && (
            <motion.div
              key="sent"
              role="status"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)", transition: { delay: 0.1 } }}
              exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.12 } }}
              className="flex w-[220px] flex-col items-center gap-2 px-5 py-5 text-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: accent }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <motion.path d="M6 12.5l4 4L18 8.5" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.25 }} />
                </svg>
              </span>
              <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Thanks, got it.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

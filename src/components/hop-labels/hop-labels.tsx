"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, motion } from "framer-motion";

export interface HopFieldProps {
  label: string;
  /** Input type, e.g. "email" or "password". */
  type?: string;
  /** Runs once the field has a value; `false` shakes the field and shows `errorMessage` when it loses focus. */
  validate?: (value: string) => boolean;
  /** Shown under the field when `validate` fails. */
  errorMessage?: string;
  /** Outline and label colour while focused. */
  accent?: string;
  /** When set, the field focuses itself and types this text one letter at a time (used by the autoplay demo). */
  demo?: string;
}

export interface HopLabelsProps {
  /** Outline and label colour while a field is focused. */
  accent?: string;
  /** Types a name and an email into the form by itself, until someone touches it. */
  autoplay?: boolean;
}

/**
 * One outlined text field. The label sits inside like a placeholder; on focus it lifts into the
 * border with a hop running along its letters while the outline parts to make room for it.
 */
export function HopField({ label, type = "text", validate, errorMessage = "That doesn't look like an email.", accent = "#0071e3", demo }: HopFieldProps) {
  const id = useId();
  const [v, setV] = useState("");
  useTypedText(v);
  const [focus, setFocus] = useState(false);
  const [lw, setLw] = useState(0);
  const lab = useRef<HTMLSpanElement>(null);

  // Measure the label so the notch in the outline matches it (and re-measure when fonts load).
  useEffect(() => {
    const el = lab.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLw(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [label]);

  useEffect(() => {
    if (demo === undefined) return;
    let i = 0;
    let off = 0;
    const start = window.setTimeout(() => setFocus(true), 0);
    const t = window.setInterval(() => {
      i++;
      setV(demo.slice(0, i));
      if (i >= demo.length) {
        window.clearInterval(t);
        off = window.setTimeout(() => setFocus(false), 500);
      }
    }, 70);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(t);
      window.clearTimeout(off);
    };
  }, [demo]);

  const up = focus || v.length > 0;
  const ok = validate ? (v.length > 0 ? validate(v) : null) : null;
  const bad = ok === false && !focus;
  const color = bad ? "var(--hl-err)" : focus ? accent : "var(--hl-idle)";

  return (
    <motion.div
      className="relative [--hl-err:#d70015] [--hl-idle:#c7c7cc] [--hl-muted:#86868b] dark:[--hl-err:#ff453a] dark:[--hl-idle:#48484a] dark:[--hl-muted:#8e8e93]"
      animate={{ x: bad ? [0, -6, 5, -3, 0] : 0 }}
      transition={{ duration: 0.35 }}
    >
      <fieldset
        className="pointer-events-none absolute inset-0 m-0 rounded-[14px] px-3 transition-[border-color,border-width] duration-200"
        style={{ border: `${focus ? 2 : 1.5}px solid ${color}` }}
        aria-hidden="true"
      >
        <motion.legend
          className="h-0 overflow-hidden p-0 text-[12px]"
          initial={false}
          animate={{ width: up ? lw * 0.78 + 8 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 36 }}
        />
      </fieldset>
      <input
        id={id}
        type={type}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        aria-invalid={bad || undefined}
        aria-describedby={bad ? `${id}-err` : undefined}
        className="relative h-14 w-full rounded-[14px] bg-transparent px-4 pt-1 text-[16px] text-[#1d1d1f] outline-none dark:text-[#f5f5f7]"
      />
      <motion.label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-1/2 origin-left transition-[color] duration-200"
        style={{ color: bad ? "var(--hl-err)" : focus ? accent : "var(--hl-muted)" }}
        initial={false}
        animate={{ y: up ? -38 : -10, x: up ? -4 : 0, scale: up ? 0.78 : 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 32 }}
      >
        <span ref={lab} className="inline-flex text-[16px]">
          {label.split("").map((c, i) => (
            <motion.span
              key={`${i}-${up}`}
              className="inline-block whitespace-pre"
              initial={{ y: 0 }}
              animate={{ y: [0, up ? -7 : 5, 0] }}
              transition={{ duration: 0.32, delay: i * 0.022, ease: "easeOut" }}
            >
              {c}
            </motion.span>
          ))}
        </span>
      </motion.label>
      <AnimatePresence>
        {ok === true && (
          <motion.span
            key="ok"
            className="absolute right-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#30d158]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bad && (
          <motion.span
            key="err"
            id={`${id}-err`}
            className="absolute -bottom-5 left-4 text-[12px]"
            style={{ color: "var(--hl-err)" }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {errorMessage}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

/**
 * Outlined text fields where the label is the placeholder until you focus.
 * Then it lifts into the border with a little hop running along its letters,
 * and the outline parts to make room for it. Email validates on blur with a
 * shake or a tick.
 */
export function HopLabels({ accent = "#0071e3", autoplay = false }: HopLabelsProps) {
  const [demo, setDemo] = useState<{ name?: string; email?: string }>({});
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    const a = window.setTimeout(() => {
      if (!touched.current) setDemo({ name: "Ada Lovelace" });
    }, 600);
    const b = window.setTimeout(() => {
      if (!touched.current) setDemo((d) => ({ ...d, email: "ada@engine.co" }));
    }, 2200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [autoplay]);

  const touch = () => {
    touched.current = true;
  };

  return (
    <form
      className="flex w-[300px] flex-col gap-6 rounded-[24px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
      onSubmit={(e) => e.preventDefault()}
      onPointerDown={touch}
      onKeyDown={touch}
    >
      <HopField label="Full name" accent={accent} demo={demo.name} />
      <HopField label="Email address" type="email" accent={accent} validate={isEmail} demo={demo.email} />
      <HopField label="Company (optional)" accent={accent} />
    </form>
  );
}

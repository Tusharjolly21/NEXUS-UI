"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Key = "name" | "email" | "password" | "terms";
interface FieldDef { key: Key; label: string; hint: string; type?: string; placeholder?: string; auto?: string }
const FIELDS: FieldDef[] = [
  { key: "name", label: "Full name", hint: "Add your name", placeholder: "Jane Appleseed", auto: "name" },
  { key: "email", label: "Email", hint: "Add an email you can open", type: "email", placeholder: "jane@example.com", auto: "email" },
  { key: "password", label: "Password", hint: "Use at least 8 characters", type: "password", placeholder: "8 or more characters", auto: "new-password" },
  { key: "terms", label: "I agree to the terms", hint: "Tick this to continue" },
];
const VALID: Record<Key, (v: string) => boolean> = {
  name: (v) => v.trim().length > 1,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  password: (v) => v.length >= 8,
  terms: (v) => v === "1",
};
const SHORT: Record<Key, string> = { name: "name", email: "email", password: "password", terms: "terms" };
const list = (a: string[]) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const EMPTY: Record<Key, string> = { name: "", email: "", password: "", terms: "" };
const SPRING = { type: "spring", stiffness: 520, damping: 38 } as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * TetheredSubmit: a sign-up form whose submit button explains why it is not ready. Hover, focus or press it while
 * the form is incomplete and a hairline draws out of the button, runs up the margin and touches the first field
 * that still needs something, which lights up with a one-line hint. Fill that field while the tether is out and it
 * swings to the next one. The button counts what is left, turns solid when nothing is, and confirms in place.
 *
 * Works with the keyboard: Enter anywhere aims the tether and moves focus to the field that needs attention.
 * `autoplay` fills the form on its own until the first real interaction.
 */
export function TetheredSubmit({ autoplay = false, onSubmit }: { autoplay?: boolean; onSubmit?: (v: Record<Key, string>) => void }) {
  const reduce = useReducedMotion();
  const [vals, setVals] = useState<Record<Key, string>>(EMPTY);
  const [aim, setAim] = useState<Key | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [geo, setGeo] = useState<{ d: string; ex: number; ey: number } | null>(null);
  const root = useRef<HTMLFormElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const refs = useRef<Partial<Record<Key, HTMLElement | null>>>({});
  const touched = useRef(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);

  const missing = FIELDS.filter((f) => !VALID[f.key](vals[f.key]));
  const ready = missing.length === 0;
  const target = aim ? (VALID[aim](vals[aim]) ? missing[0]?.key ?? null : aim) : null;

  // the tether: out of the button's top edge, up the right-hand margin, and into the side of the field
  const measure = useCallback(() => {
    const r = root.current, b = btn.current, f = target ? refs.current[target] : null;
    // the checkbox sits right above the button, so it is pointed out by its own glow rather than a line
    if (!r || !b || !f || target === "terms") return setGeo(null);
    const R = r.getBoundingClientRect(), B = b.getBoundingClientRect(), F = f.getBoundingClientRect();
    // the form can sit inside a scaled preview (a gallery tile): rects are in screen pixels, the line is drawn in the form's own
    const k = r.offsetWidth ? R.width / r.offsetWidth : 1;
    const sx = (B.right - R.left) / k - 34, sy = (B.top - R.top) / k;
    const ex = (F.right - R.left) / k, ey = (F.top - R.top + F.height / 2) / k;
    const gx = r.offsetWidth - 14;
    const d = `M${sx} ${sy} C${sx} ${sy - 18} ${gx} ${sy - 10} ${gx} ${sy - 34} L${gx} ${ey + 14} Q${gx} ${ey} ${ex + 2} ${ey}`;
    setGeo({ d, ex, ey });
  }, [target]);
  useLayoutEffect(() => { measure(); }, [measure, vals]);
  useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    if (root.current) ro.observe(root.current);
    return () => ro.disconnect();
  }, [measure]);

  // once the tether points nowhere (everything filled), let it go
  useEffect(() => { if (aim && ready) setAim(null); }, [aim, ready]);

  const point = (focus: boolean) => {
    if (ready) return;
    setAim(missing[0].key);
    if (hold.current) clearTimeout(hold.current);
    if (focus) {
      const el = refs.current[missing[0].key]?.querySelector("input");
      el?.focus({ preventScroll: true });
      hold.current = setTimeout(() => setAim(null), 1600);
    }
  };

  const submit = async () => {
    if (!ready) return point(true);
    setState("sending");
    await sleep(1100);
    setState("done");
    onSubmit?.(vals);
  };

  const reset = () => { setVals(EMPTY); setState("idle"); setAim(null); };

  // the demo: fills the form a field at a time, reaching for the button in between
  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const type = async (k: Key, text: string) => {
      for (let i = 1; i <= text.length && live && !touched.current; i++) {
        setVals((v) => ({ ...v, [k]: text.slice(0, i) }));
        await sleep(55 + Math.random() * 50);
      }
    };
    const step = async (fn: () => void | Promise<void>, wait: number) => {
      if (!live || touched.current) return false;
      await fn();
      await sleep(wait);
      return live && !touched.current;
    };
    (async () => {
      await sleep(900);
      while (live && !touched.current) {
        if (!(await step(() => setAim("name"), 1300))) break;
        if (!(await step(() => type("name", "Jane Appleseed"), 500))) break;
        if (!(await step(() => setAim(null), 700))) break;
        if (!(await step(() => setAim("email"), 1100))) break;
        if (!(await step(() => type("email", "jane@apple"), 900))) break;
        if (!(await step(() => type("email", "jane@appleseed.co"), 600))) break;
        if (!(await step(() => setAim(null), 400))) break;
        if (!(await step(() => type("password", "orchard-24"), 800))) break;
        if (!(await step(() => setAim("terms"), 1200))) break;
        if (!(await step(() => setVals((v) => ({ ...v, terms: "1" })), 1100))) break;
        if (!(await step(() => submit(), 2400))) break;
        if (!(await step(() => reset(), 1200))) break;
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const take = () => { touched.current = true; };
  const left = missing.length;

  return (
    <form
      ref={root}
      noValidate
      onSubmit={(e) => { e.preventDefault(); take(); void submit(); }}
      onPointerDownCapture={take}
      onKeyDownCapture={take}
      className="relative w-full max-w-[400px] rounded-[24px] bg-white px-7 pb-7 pt-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      <h3 className="m-0 text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Create your account</h3>
      <p className="m-0 mt-1 text-[14px] text-[#6e6e73]">It takes less than a minute.</p>

      <div className="mt-5 flex flex-col gap-3.5">
        {FIELDS.map((f) => {
          const on = target === f.key && (f.key === "terms" || !!geo);
          const ok = VALID[f.key](vals[f.key]);
          const hintId = `ts-hint-${f.key}`;
          if (f.key === "terms")
            return (
              <div key={f.key}>
                <label ref={(el) => { refs.current.terms = el; }} className="relative flex w-fit cursor-pointer items-center gap-2.5 rounded-[10px] py-1 pr-2 text-[14px] text-[#1d1d1f]">
                  <input type="checkbox" checked={ok} onChange={(e) => setVals((v) => ({ ...v, terms: e.target.checked ? "1" : "" }))} aria-describedby={on ? hintId : undefined} className="peer sr-only" />
                  <motion.span animate={{ scale: on ? [1, 1.18, 1] : 1, backgroundColor: ok ? "#0071e3" : "#ffffff", boxShadow: on ? "0 0 0 1.5px #0071e3, 0 0 0 5px rgba(0,113,227,.16)" : ok ? "0 0 0 1.5px #0071e3" : "0 0 0 1.5px #c7c7cc" }} transition={{ ...SPRING, scale: { duration: 0.45, ease: "easeOut" } }} className="grid h-[20px] w-[20px] place-items-center rounded-[6px] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#0071e3]">
                    <motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={false} animate={{ pathLength: ok ? 1 : 0 }} transition={{ duration: 0.25 }} /></motion.svg>
                  </motion.span>
                  {f.label}
                </label>
                <Hint id={hintId} show={on} text={f.hint} />
              </div>
            );
          return (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label htmlFor={`ts-${f.key}`} className="text-[13px] font-medium text-[#6e6e73]">{f.label}</label>
              <motion.div ref={(el) => { refs.current[f.key] = el; }} animate={{ boxShadow: on ? "0 0 0 1.5px #0071e3, 0 0 0 5px rgba(0,113,227,.14)" : "0 0 0 0px rgba(0,113,227,0)" }} transition={SPRING} className="relative rounded-[12px]">
                <input
                  id={`ts-${f.key}`}
                  type={f.type ?? "text"}
                  value={vals[f.key]}
                  autoComplete={f.auto}
                  placeholder={f.placeholder}
                  aria-invalid={on || undefined}
                  aria-describedby={on ? hintId : undefined}
                  onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="h-11 w-full rounded-[12px] bg-[#f5f5f7] px-3.5 pr-10 text-[15px] text-[#1d1d1f] outline-none transition-colors placeholder:text-[#a1a1a6] focus:bg-white focus:shadow-[0_0_0_1px_#d2d2d7]"
                />
                <AnimatePresence>
                  {ok && (
                    <motion.span key="ok" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={SPRING} className="absolute right-3 top-1/2 -mt-[8px] text-[#30a14e]"><Glyph d={ICON.checkmark_alt} size={16} /></motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <Hint id={hintId} show={on} text={f.hint} />
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="m-0 min-w-0 flex-1 text-[12px] leading-snug text-[#86868b] max-[460px]:sr-only" aria-live="polite">
          {state === "done" ? "Check your inbox to confirm." : ready ? "All set." : `Still needs ${list(missing.map((m) => SHORT[m.key]))}`}
        </p>
        <motion.button
          ref={btn}
          type="submit"
          aria-disabled={!ready || state !== "idle"}
          onPointerEnter={() => state === "idle" && point(false)}
          onPointerLeave={() => { if (!hold.current) setAim(null); }}
          onFocus={() => state === "idle" && point(false)}
          onBlur={() => setAim(null)}
          animate={{ backgroundColor: ready || state !== "idle" ? (state === "done" ? "#30a14e" : "#0071e3") : "#e8e8ed", color: ready || state !== "idle" ? "#ffffff" : "#6e6e73" }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING}
          className="relative inline-flex h-11 min-w-[176px] shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full px-5 text-[15px] font-medium outline-none focus-visible:ring-4 focus-visible:ring-[#0071e3]/30"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {state === "sending" ? (
              <motion.span key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={SPRING} className="flex items-center gap-2">
                <motion.span className="block h-4 w-4 rounded-full border-2 border-white/40 border-t-white" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                Creating
              </motion.span>
            ) : state === "done" ? (
              <motion.span key="d" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={SPRING} className="flex items-center gap-1.5">
                <Glyph d={ICON.checkmark_alt} size={16} />
                Account created
              </motion.span>
            ) : (
              <motion.span key="i" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={SPRING} className="flex items-center gap-2">
                Create account
                <AnimatePresence initial={false}>
                  {!ready && (
                    <motion.span key="n" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={SPRING} className="inline-flex h-[22px] items-center overflow-hidden rounded-full bg-white px-2 text-[12px] tabular-nums text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)]">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span key={left} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={SPRING}>{left}</motion.span>
                      </AnimatePresence>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* the tether itself, drawn over the form */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <AnimatePresence>
          {geo && target && (
            <motion.g key="t" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.25 } }}>
              <motion.path
                d={geo.d}
                fill="none"
                stroke="#0071e3"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, d: geo.d }}
                animate={{ pathLength: 1, d: geo.d }}
                exit={{ pathLength: 0 }}
                transition={{ pathLength: { duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }, d: SPRING }}
              />
              <motion.circle r="3.5" fill="#0071e3" initial={{ scale: 0, cx: geo.ex + 2, cy: geo.ey }} animate={{ scale: 1, cx: geo.ex + 2, cy: geo.ey }} exit={{ scale: 0 }} transition={{ scale: { delay: reduce ? 0 : 0.42, ...SPRING }, cx: SPRING, cy: SPRING }} />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
      {state === "done" && autoplay === false && (
        <button type="button" onClick={reset} className="absolute right-6 top-6 text-[13px] font-medium text-[#0071e3] outline-none focus-visible:underline">Start over</button>
      )}
    </form>
  );
}

function Hint({ id, show, text }: { id: string; show: boolean; text: string }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.p id={id} key="h" initial={{ opacity: 0, height: 0, y: -4 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -4 }} transition={SPRING} className="m-0 overflow-hidden text-[12.5px] font-medium text-[#0071e3]">
          {text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ icons: Framework7 Icons (MIT), via Iconify */
const ICON = {
  checkmark_alt: "m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0",
};
function Glyph({ d, size = 16, className, style }: { d: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true" className={className} style={style}>
      <path d={d} />
    </svg>
  );
}

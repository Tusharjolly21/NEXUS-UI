"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Key = "name" | "role" | "location" | "bio";
const START: Record<Key, string> = {
  name: "Jane Appleseed",
  role: "Designer",
  location: "Cupertino, California",
  bio: "Making tools that get out of the way. Previously at a small studio that made big apps.",
};
const LABEL: Record<Key, string> = { name: "Name", role: "Role", location: "Location", bio: "Bio" };
const SPRING = { type: "spring", stiffness: 480, damping: 34 } as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * GlassEdit: a profile you edit where it stands. Text looks like text until you point at it, when it sinks into a faint
 * recess. Click it (or press Enter on it) and it lifts off the card onto a pane of glass, with the rest of the card
 * stepping back. Press Enter or click away and it presses back down; a light passes over the new text to say it is
 * saved. Escape winds the text back to what it was.
 *
 * `onChange(key, value)` fires on each commit. `autoplay` edits a couple of fields until the first real interaction.
 */
export function GlassEdit({ autoplay = false, initial = START, onChange }: { autoplay?: boolean; initial?: Record<Key, string>; onChange?: (k: Key, v: string) => void }) {
  const reduce = useReducedMotion();
  const [vals, setVals] = useState(initial);
  const [active, setActive] = useState<Key | null>(null);
  const [draft, setDraft] = useState("");
  const [stamp, setStamp] = useState<{ k: Key; n: number; undo?: boolean } | null>(null);
  const touched = useRef(false);
  const now = useRef({ vals, active, draft });
  now.current = { vals, active, draft };

  const open = (k: Key) => { setActive(k); setDraft(now.current.vals[k]); };
  const commit = () => {
    const { active: k, draft: d, vals: v } = now.current;
    if (!k) return;
    const next = d.trim() || v[k];
    setActive(null);
    if (next !== v[k]) { setVals((s) => ({ ...s, [k]: next })); onChange?.(k, next); }
    setStamp((s) => ({ k, n: (s?.n ?? 0) + 1 }));
  };
  const cancel = () => {
    const k = now.current.active;
    setActive(null);
    if (k) setStamp((s) => ({ k, n: (s?.n ?? 0) + 1, undo: true }));
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const ok = () => live && !touched.current;
    const wait = async (ms: number) => { await sleep(ms); return ok(); };
    const type = async (t: string) => { for (let i = 0; i <= t.length; i++) { if (!ok()) return false; setDraft(t.slice(0, i)); await sleep(60 + Math.random() * 40); } return true; };
    (async () => {
      await sleep(1100);
      while (ok()) {
        open("role");
        if (!(await wait(700))) break;
        if (!(await type("Product designer"))) break;
        if (!(await wait(600))) break;
        commit();
        if (!(await wait(1800))) break;
        open("location");
        if (!(await wait(600))) break;
        if (!(await type("Lisb"))) break;
        if (!(await wait(800))) break;
        cancel();
        if (!(await wait(2000))) break;
        setVals(initial);
        if (!(await wait(800))) break;
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const take = () => { touched.current = true; };

  return (
    <div
      onPointerDownCapture={take}
      onKeyDownCapture={take}
      className="relative w-full max-w-[420px]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif", perspective: 900 }}
    >
      <motion.div
        animate={{ scale: active ? 0.985 : 1 }}
        transition={SPRING}
        className="rounded-[24px] bg-white px-6 pb-6 pt-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center gap-4">
          <motion.div animate={{ opacity: active ? 0.35 : 1 }} transition={{ duration: 0.25 }} className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-full bg-[#1d1d1f] text-[20px] font-semibold tracking-[-0.02em] text-white">
            {vals.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("")}
          </motion.div>
          <div className="min-w-0 flex-1">
            <Editable k="name" big value={vals.name} active={active} draft={draft} setDraft={setDraft} open={open} commit={commit} cancel={cancel} stamp={stamp} reduce={!!reduce} />
            <Editable k="role" value={vals.role} active={active} draft={draft} setDraft={setDraft} open={open} commit={commit} cancel={cancel} stamp={stamp} reduce={!!reduce} muted />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-1">
          <Meta label="Location" k="location" active={active}>
            <Editable k="location" value={vals.location} active={active} draft={draft} setDraft={setDraft} open={open} commit={commit} cancel={cancel} stamp={stamp} reduce={!!reduce} />
          </Meta>
          <Meta label="Bio" k="bio" active={active}>
            <Editable k="bio" multiline value={vals.bio} active={active} draft={draft} setDraft={setDraft} open={open} commit={commit} cancel={cancel} stamp={stamp} reduce={!!reduce} />
          </Meta>
        </div>
      </motion.div>
      <p className="m-0 mt-3 text-center text-[12px] text-[#86868b]">{active ? "Enter to save. Esc to undo." : "Click any text to edit it."}</p>
    </div>
  );
}

function Meta({ label, k, active, children }: { label: string; k: Key; active: Key | null; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[72px_1fr] items-start gap-2">
      <motion.span animate={{ opacity: active && active !== k ? 0.35 : 1 }} className="pt-[7px] text-[13px] font-medium text-[#86868b]">{label}</motion.span>
      {children}
    </div>
  );
}

interface EdProps {
  k: Key; value: string; active: Key | null; draft: string; setDraft: (s: string) => void; open: (k: Key) => void; commit: () => void; cancel: () => void;
  stamp: { k: Key; n: number; undo?: boolean } | null; reduce: boolean; big?: boolean; muted?: boolean; multiline?: boolean;
}
function Editable({ k, value, active, draft, setDraft, open, commit, cancel, stamp, reduce, big, muted, multiline }: EdProps) {
  const on = active === k;
  const dim = active !== null && !on;
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [hover, setHover] = useState(false);
  useEffect(() => { if (on) { const el = field.current; el?.focus({ preventScroll: true }); el?.setSelectionRange(el.value.length, el.value.length); } }, [on]);
  const mine = stamp?.k === k ? stamp : null;
  const type = big
    ? "text-[22px] font-semibold leading-[30px] tracking-[-0.02em] text-[#1d1d1f]"
    : muted
      ? "text-[15px] leading-[22px] text-[#6e6e73]"
      : "text-[15px] leading-[22px] text-[#1d1d1f]";
  const pad = "px-2 py-[5px]";

  return (
    <motion.div
      className="relative -mx-2 rounded-[10px]"
      animate={
        on
          ? { z: 40, y: -2, opacity: 1, backgroundColor: "rgba(255,255,255,0.92)", boxShadow: "0 0 0 1px rgba(0,113,227,.55), 0 0 0 4px rgba(0,113,227,.12), 0 18px 30px -12px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.9)" }
          : { z: 0, y: 0, opacity: dim ? 0.35 : 1, backgroundColor: hover ? "rgba(0,0,0,0.035)" : "rgba(0,0,0,0)", boxShadow: hover ? "0 0 0 0 rgba(0,113,227,0), 0 0 0 0 rgba(0,113,227,0), 0 0 0 0 rgba(0,0,0,0), inset 0 1px 2px rgba(0,0,0,.08)" : "0 0 0 0 rgba(0,113,227,0), 0 0 0 0 rgba(0,113,227,0), 0 0 0 0 rgba(0,0,0,0), inset 0 0 0 rgba(0,0,0,0)" }
      }
      transition={SPRING}
      style={{ transformStyle: "preserve-3d" }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* pressed back down after an edit: a short settle */}
      <motion.div key={mine ? mine.n : 0} initial={mine && !reduce ? { y: 2, scaleY: 0.96 } : false} animate={{ y: 0, scaleY: 1 }} transition={{ type: "spring", stiffness: 700, damping: 18 }} className="overflow-hidden rounded-[10px]">
        {on ? (
          multiline ? (
            <textarea ref={field} aria-label={LABEL[k]} value={draft} rows={3} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); } if (e.key === "Escape") { e.preventDefault(); cancel(); } }} className={`block w-full resize-none bg-transparent outline-none ${type} ${pad}`} style={{ caretColor: "#0071e3" }} />
          ) : (
            <input ref={field} aria-label={LABEL[k]} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") { e.preventDefault(); cancel(); } }} className={`block w-full bg-transparent outline-none ${type} ${pad}`} style={{ caretColor: "#0071e3" }} />
          )
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label={`${LABEL[k]}: ${value}. Press Enter to edit.`}
            onClick={() => open(k)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(k); } }}
            className={`relative cursor-text rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${type} ${pad}`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={value + (mine?.undo ? mine.n : "")} className="block" initial={mine?.undo ? { y: -10, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={SPRING}>
                {value}
              </motion.span>
            </AnimatePresence>
            {/* saved: a light passes across the text once */}
            {mine && !mine.undo && !reduce && (
              <motion.span key={mine.n} aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-[45%]" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(0,113,227,.16), rgba(255,255,255,0))" }} initial={{ left: "-45%" }} animate={{ left: "105%" }} transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1], delay: 0.08 }} />
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

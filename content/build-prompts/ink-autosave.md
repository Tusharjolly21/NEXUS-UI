# Ink Autosave

Add the "Ink Autosave" component from Nexus UI to my project.

A note that shows its save state as ink. What is saved is dry black ink; what you have typed since is wet blue at the end of the rule. Pause and it dries left to right. Go offline and it dries grey with a drop hanging off the nib, which falls in when you reconnect.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { InkAutosave } from "@/components/ink-autosave";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/ink-autosave/index.ts ---

```ts
import type { ComponentProps } from "react";
import { InkAutosave } from "./ink-autosave";

export { InkAutosave };
export type InkAutosaveProps = ComponentProps<typeof InkAutosave>;
```

--- components/ink-autosave/ink-autosave.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

const START = "Plan for Thursday: walk the new onboarding with design, then cut the release.";
const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const prefix = (a: string, b: string) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };

/**
 * InkAutosave: a note that shows its save state as ink. The rule under the text is your document: the part that is
 * safely saved is dry black ink, and what you have typed since is wet blue at the end, with the nib bobbing as you
 * type. Pause and the save lands as the wet ink dries from left to right. Lose the connection and the wet part dries
 * grey with one drop hanging off the end; when you are back online the drop falls in and the ink dries for real.
 *
 * `save(text)` is your persistence call; it should resolve when stored. `autoplay` writes and goes offline on its own
 * until the first real interaction.
 */
export function InkAutosave({ autoplay = false, save, initial = START }: { autoplay?: boolean; save?: (text: string) => Promise<void>; initial?: string }) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(false);
  const [beat, setBeat] = useState(0);
  const dry = useMotionValue(1); // how much of the rule is dry ink, 0..1
  const touched = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const now = useRef({ text, saved, online });
  now.current = { text, saved, online };

  const pending = text !== saved;
  const waiting = pending && !online;

  // as you type, the dry part is whatever still matches what was saved
  useEffect(() => {
    // unsaved characters show as wet ink at the end; a few words already make a visible stroke
    const fresh = text.length - prefix(saved, text) + Math.max(0, saved.length - text.length);
    const target = 1 - (0.85 * fresh) / (fresh + 36);
    if (!busy) animate(dry, pending ? target : 1, reduce ? { duration: 0 } : SPRING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, saved]);

  const commit = async () => {
    const { text: t, saved: s, online: o } = now.current;
    if (t === s || !o) return;
    setBusy(true);
    await (save ? save(t) : sleep(450));
    // the save landed: the wet ink dries from where it was to the end of the line
    await animate(dry, 1, reduce ? { duration: 0 } : { duration: 0.7, ease: [0.4, 0, 0.2, 1] });
    setSaved(t);
    setBusy(false);
    if (now.current.text !== t) schedule();
  };
  const schedule = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void commit(), 900);
  };
  const edit = (t: string) => { setText(t); setBeat((b) => b + 1); schedule(); };
  const toggleNet = () => setOnline((o) => !o);
  useEffect(() => { if (online && now.current.text !== now.current.saved) { const t = setTimeout(() => void commit(), 650); return () => clearTimeout(t); } }, [online]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const ok = () => live && !touched.current;
    const type = async (t: string) => { for (const ch of t) { if (!ok()) return false; edit(now.current.text + ch); await sleep(45 + Math.random() * 60); } return true; };
    const wait = async (ms: number) => { await sleep(ms); return ok(); };
    (async () => {
      await sleep(1000);
      while (ok()) {
        if (!(await type(" Then lunch."))) break;
        if (!(await wait(2600))) break;
        setOnline(false);
        if (!(await wait(900))) break;
        if (!(await type(" Ask Ana about the icons."))) break;
        if (!(await wait(2600))) break;
        setOnline(true);
        if (!(await wait(3200))) break;
        setText(initial); setSaved(initial); dry.set(1);
        if (!(await wait(900))) break;
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const take = () => { touched.current = true; };
  const inkW = useTransform(dry, (v) => `${(v * 100).toFixed(2)}%`);
  const wet = waiting ? "#c7c7cc" : "#0071e3";
  const status = waiting ? "Offline. Saves when you reconnect." : busy ? "Saving" : pending ? "Edited" : "Saved";

  return (
    <div
      onPointerDownCapture={take}
      onKeyDownCapture={take}
      className="w-full max-w-[460px] rounded-[24px] bg-white px-7 pb-6 pt-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-[#86868b]">Notes</span>
        <button type="button" role="switch" aria-checked={online} onClick={toggleNet} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f5f5f7] pl-2 pr-2.5 text-[12px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
          <Glyph d={online ? ICON.wifi : ICON.wifi_slash} size={15} className={online ? "text-[#1d1d1f]" : "text-[#86868b]"} />
          {online ? "Online" : "Offline"}
        </button>
      </div>
      <label htmlFor="ink-body" className="sr-only">Note</label>
      <textarea
        id="ink-body"
        value={text}
        onChange={(e) => edit(e.target.value)}
        rows={4}
        className="mt-3 block w-full resize-none bg-transparent text-[17px] leading-[1.5] tracking-[-0.01em] text-[#1d1d1f] outline-none"
      />

      {/* the rule: dry ink, then wet ink, then the nib */}
      <div className="relative mt-4 h-[3px] w-full rounded-full bg-[#f0f0f2]" aria-hidden="true">
        <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[#1d1d1f]" style={{ width: inkW }} />
        <motion.span className="absolute inset-y-0 right-0 rounded-full" style={{ left: inkW, opacity: 0 }} initial={false} animate={{ backgroundColor: pending ? wet : "#1d1d1f", opacity: pending ? 1 : 0 }} transition={{ duration: 0.4 }} />
        <motion.span key={beat} className="absolute right-[-4px] top-1/2 -mt-[4px] h-[8px] w-[8px] rounded-full" initial={{ scale: reduce ? 1 : 1.7 }} animate={{ scale: 1, backgroundColor: pending ? wet : "#1d1d1f" }} transition={SPRING} />
        {/* offline: one drop hangs off the nib; online again, it falls back into the line */}
        <AnimatePresence>
          {waiting && (
            <motion.span key="drop" className="absolute right-[-5px] top-[4px] block" initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1, y: [0, 2, 0] }} exit={{ y: -6, scaleY: 0.2, opacity: 0, transition: { duration: 0.35, ease: "easeIn" } }} transition={{ scaleY: SPRING, opacity: { duration: 0.2 }, y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } }} style={{ transformOrigin: "50% 0%" }}>
              <svg width="10" height="15" viewBox="0 0 8 12"><path d="M4 0C4 3 0 5.5 0 8.2A4 4 0 0 0 8 8.2C8 5.5 4 3 4 0z" fill="#c7c7cc" /></svg>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex h-4 items-center justify-between pr-4 text-[12px] text-[#86868b]" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={SPRING}>{status}</motion.span>
        </AnimatePresence>
        <span className="tabular-nums">{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ icons: Framework7 Icons (MIT), via Iconify */
const ICON = {
  wifi: "M5.465 25.035c.445.445 1.101.422 1.523-.023c5.532-5.883 12.844-8.977 21.024-8.977c8.226 0 15.562 3.117 21.07 9c.398.399 1.032.399 1.453-.047l3.118-3.117c.374-.398.374-.914.07-1.289c-5.297-6.516-15.258-11.32-25.711-11.32S7.598 14.066 2.3 20.582c-.328.375-.305.89.07 1.29Zm9.375 9.399c.469.492 1.078.445 1.523-.07c2.719-3.024 7.125-5.204 11.649-5.157c4.57-.047 8.953 2.203 11.695 5.227c.445.468 1.031.468 1.477-.024l3.492-3.445c.375-.375.422-.867.07-1.266c-3.398-4.195-9.703-7.289-16.734-7.289s-13.336 3.117-16.735 7.29c-.351.398-.304.866.07 1.265Zm13.172 12.304c.492 0 .937-.258 1.804-1.101l5.485-5.274c.351-.328.422-.843.117-1.242c-1.477-1.898-4.242-3.539-7.406-3.539c-3.235 0-6.047 1.711-7.5 3.68c-.211.328-.14.773.21 1.101l5.485 5.274c.867.843 1.313 1.101 1.805 1.101",
  wifi_slash: "M47.77 49.973a1.81 1.81 0 0 0 2.554 0c.68-.727.703-1.852 0-2.555L8.277 5.371c-.703-.703-1.851-.703-2.578 0c-.68.68-.68 1.875 0 2.555Zm1.312-20.344c.398.398 1.032.398 1.476-.047l3.095-3.117c.374-.399.374-.914.07-1.29c-5.414-6.421-15.258-11.32-25.711-11.32c-2.274 0-4.524.235-6.703.68l6.187 6.164c8.274-.164 15.797 3.024 21.586 8.93m-43.617-.047c.445.445 1.101.422 1.523-.023c2.813-3 6.117-5.25 9.75-6.75l-4.968-4.97c-3.797 1.946-7.079 4.5-9.47 7.337c-.327.375-.304.89.071 1.289Zm9.375 9.422c.469.469 1.078.445 1.523-.07c2.696-2.977 7.008-5.063 11.39-5.11l-5.952-5.93c-4.383 1.172-8.133 3.563-10.524 6.399c-.351.398-.304.89.07 1.266Zm28.64-2.297l1.196-1.148c.375-.375.422-.868.07-1.266c-2.25-2.695-5.742-4.945-9.82-6.14ZM28.035 51.332c.492 0 .938-.258 1.805-1.102l5.484-5.273c.352-.328.422-.844.117-1.242c-1.476-1.899-4.242-3.54-7.406-3.54c-3.234 0-6.047 1.712-7.5 3.68c-.21.329-.14.774.211 1.102l5.484 5.273c.868.844 1.313 1.102 1.805 1.102",
};
function Glyph({ d, size = 16, className, style }: { d: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true" className={className} style={style}>
      <path d={d} />
    </svg>
  );
}
```

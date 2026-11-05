# Paperclip Attach

Add the "Paperclip Attach" component from Nexus UI to my project.

A message composer that clips attachments on with a real paperclip. Attach a file (or drop it on the message) and the clip springs open, the file flies in from the button and slides under the wire, and the clip snaps shut, jiggling the stack. Older files fan out behind, pinned at the same corner; tap one to slip it out and back on top, or pull the top one off with its close button. Keyboard: the paperclip button opens the file picker; every card and close button is reachable with Tab.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { PaperclipAttach } from "@/components/paperclip-attach";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/paperclip-attach/index.ts ---

```ts
export { PaperclipAttach } from "./paperclip-attach";
export type { Attachment, PaperclipAttachProps } from "./paperclip-attach";
```

--- components/paperclip-attach/paperclip-attach.tsx ---

```tsx
"use client";

/* eslint-disable @next/next/no-img-element -- previews of files the visitor picked (object URLs), which next/image cannot load */

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent, type ReactElement } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type Attachment = { id: string; name: string; size: number; url?: string; file?: File };
export type PaperclipAttachProps = {
  to?: string;
  placeholder?: string;
  defaultMessage?: string;
  /** most files that fit under the clip */
  maxFiles?: number;
  onSend?: (message: string, files: Attachment[]) => void | Promise<void>;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (via Iconify), inlined
const ICON = {
  clip: { vb: 256, body: "<path fill=\"currentColor\" d=\"m212.48 136.49l-82.06 82a60 60 0 0 1-84.85-84.88l98.16-97.89a40 40 0 0 1 56.56 56.59l-.17.16l-95.8 92.22a12 12 0 1 1-16.64-17.3l95.71-92.12a16 16 0 0 0-22.7-22.56l-98.16 97.86a36 36 0 0 0 50.93 50.91l82.06-82a12 12 0 0 1 17 17Z\"/>" },
  image: { vb: 256, body: "<path fill=\"currentColor\" d=\"M144 96a16 16 0 1 1 16 16a16 16 0 0 1-16-16m92-40v144a20 20 0 0 1-20 20H40a20 20 0 0 1-20-20V56a20 20 0 0 1 20-20h176a20 20 0 0 1 20 20M44 60v79.72l33.86-33.86a20 20 0 0 1 28.28 0L147.31 147l17.18-17.17a20 20 0 0 1 28.28 0L212 149.09V60Zm0 136h118.34L92 125.66l-48 48Zm168 0v-13l-33.37-33.37L164.28 164l32 32Z\"/>" },
  send: { vb: 256, body: "<path fill=\"currentColor\" d=\"M208.49 120.49a12 12 0 0 1-17 0L140 69v147a12 12 0 0 1-24 0V69l-51.51 51.49a12 12 0 0 1-17-17l72-72a12 12 0 0 1 17 0l72 72a12 12 0 0 1 0 17\"/>" },
  x: { vb: 256, body: "<path fill=\"currentColor\" d=\"M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z\"/>" },
  check: { vb: 256, body: "<path fill=\"currentColor\" d=\"m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z\"/>" },
} as const;

const CARD_W = 104;
const CARD_H = 132;
const PIVOT = 16; // the clip holds every card at this point near its top-left corner
const STOP = Symbol("stop");
let seq = 0;

const SAMPLES: Omit<Attachment, "id">[] = [
  { name: "Review notes.pdf", size: 248_000 },
  { name: "Homepage v4.png", size: 1_840_000 },
  { name: "Launch plan.key", size: 5_200_000 },
  { name: "Budget.xlsx", size: 96_000 },
];

const ext = (n: string) => (n.includes(".") ? n.split(".").pop()!.slice(0, 4).toUpperCase() : "FILE");
const isImage = (a: Attachment) => !!a.url || /\.(png|jpe?g|gif|webp|heic|svg)$/i.test(a.name);
/** A colour per kind of file, so the stack reads at a glance. */
const TINT: [RegExp, string, string][] = [
  [/^PDF$/, "#ff4d6d", "#e11d48"],
  [/^(KEY|PPT|PPTX)$/, "#38bdf8", "#2563eb"],
  [/^(XLS|XLSX|CSV|NUMB)$/, "#34d399", "#059669"],
  [/^(DOC|DOCX|PAGE|TXT|MD)$/, "#818cf8", "#4f46e5"],
  [/^(ZIP|RAR|7Z)$/, "#fbbf24", "#d97706"],
  [/^(MP4|MOV|WEBM)$/, "#c084fc", "#9333ea"],
];
const tint = (e: string) => TINT.find(([re]) => re.test(e)) ?? [null, "#a78bfa", "#7c3aed"];
const human = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

/**
 * A message composer that clips attachments on with a real paperclip. Attach a file (or drop it on the
 * message) and the clip springs open, the file flies in from the button and slides under the wire, and the clip
 * snaps shut, jiggling the stack. Older files fan out behind, pinned at the same corner; tap one to slip it
 * out and back on top, or pull the top one off with its close button.
 * Keyboard: the paperclip button opens the file picker; every card and close button is reachable with Tab.
 */
export function PaperclipAttach({
  to = "Priya Shah",
  placeholder = "Write a message",
  defaultMessage = "Here are the files from today's review.",
  maxFiles = 6,
  onSend,
  autoplay = false,
  className = "",
}: PaperclipAttachProps) {
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const [message, setMessage] = useState(defaultMessage);
  const [files, setFiles] = useState<Attachment[]>([]); // newest last, drawn on top
  const filesRef = useRef(files);
  filesRef.current = files;
  const [drag, setDrag] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendingNow, setSendingNow] = useState(false);
  const [from, setFrom] = useState<{ x: number; y: number }>({ x: 0, y: 160 });

  // the clip: how open it is, and a jiggle the cards share when it snaps shut
  const open = useMotionValue(0);
  const jiggle = useMotionValue(0);
  const clipR = useTransform(open, (o) => -11 * o);
  const clipY = useTransform(open, (o) => -7 * o);
  const tongueShadow = useTransform(open, (o) => `drop-shadow(${1 + o * 3}px ${2 + o * 5}px ${1.5 + o * 3}px rgba(0,0,0,${0.28 - o * 0.1}))`);

  const snap = useCallback(
    (delay = 0.3) => {
      if (reduced) return;
      animate(open, [open.get(), 1, 1, 0], { duration: 0.55 + delay, times: [0, 0.18, delay / (0.55 + delay) + 0.1, 1], ease: ["easeOut", "linear", [0.5, 0, 0.2, 1.6]] });
      window.setTimeout(() => animate(jiggle, [0, 2.6, -1.6, 0.8, 0], { duration: 0.5 }), (0.5 + delay) * 1000);
    },
    [open, jiggle, reduced],
  );

  const measureFrom = () => {
    const b = btnRef.current?.getBoundingClientRect();
    const s = stackRef.current?.getBoundingClientRect();
    if (b && s) setFrom({ x: b.left - s.left + b.width / 2 - CARD_W / 2, y: b.top - s.top - CARD_H / 2 });
  };

  const add = useCallback(
    (list: Omit<Attachment, "id">[]) => {
      measureFrom();
      const room = maxFiles - filesRef.current.length;
      if (room <= 0) return;
      const next = list.slice(0, room).map((a) => ({ ...a, id: `a${seq++}` }));
      setSent(false);
      setFiles((f) => [...f, ...next]);
      snap(0.32);
    },
    [maxFiles, snap],
  );
  const remove = useCallback(
    (id: string) => {
      setFiles((f) => {
        const a = f.find((x) => x.id === id);
        if (a?.url) window.setTimeout(() => URL.revokeObjectURL(a.url!), 800);
        return f.filter((x) => x.id !== id);
      });
      snap(0.12);
    },
    [snap],
  );
  // tap a card behind: it slips out and goes back on top
  const raise = useCallback(
    (id: string) => {
      setFiles((f) => {
        const a = f.find((x) => x.id === id);
        return a && f[f.length - 1].id !== id ? [...f.filter((x) => x.id !== id), a] : f;
      });
      snap(0.2);
    },
    [snap],
  );

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []).map((file) => ({ name: file.name, size: file.size, file, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined }));
    if (list.length) add(list);
    e.target.value = "";
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const list = Array.from(e.dataTransfer.files).map((file) => ({ name: file.name, size: file.size, file, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined }));
    if (list.length) add(list);
  };

  const send = useCallback(async () => {
    if (!message.trim() && !filesRef.current.length) return;
    await onSend?.(message.trim(), filesRef.current);
    // the stack flies off the way a sent message would
    setSendingNow(true);
    await new Promise((r) => setTimeout(r, 0));
    setSent(true);
    setFiles([]);
    setMessage("");
    window.setTimeout(() => setSendingNow(false), 700);
  }, [message, onSend]);

  // ─── autoplay: clip three files on, shuffle one to the front, take one off, send ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const own = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, v: number, duration: number) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease: [0.4, 0, 0.2, 1], onComplete: () => (own.delete(c), res()) });
        own.add(c);
      });
    const tap = async (el: Element | null, act: () => void, fx = 0.5, fy = 0.5) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      const x = r.left - b.left + r.width * fx;
      const y = r.top - b.top + r.height * fy;
      if (go.get() < 0.5) {
        gx.set(x + 30);
        gy.set(y + 40);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, 0.45), run(gy, y, 0.45)]);
      await run(gs, 0.8, 0.09);
      act();
      await run(gs, 1, 0.11);
    };
    (async () => {
      await wait(900);
      while (alive) {
        for (let i = 0; i < 3; i++) {
          await tap(btnRef.current, () => add([SAMPLES[i]]));
          await wait(950);
        }
        // bring the one at the back to the front
        const back = root.querySelector("[data-card]");
        const id = back?.getAttribute("data-card");
        await tap(back, () => id && raise(id), 0.85, 0.85);
        await wait(1100);
        // take the top one off
        const xs = root.querySelectorAll("[data-remove]");
        const top = xs[xs.length - 1];
        const tid = top?.getAttribute("data-remove");
        await tap(top, () => tid && remove(tid));
        await wait(1000);
        await tap(root.querySelector("[data-send]"), () => void send());
        await run(go, 0, 0.3);
        await wait(1800);
        setMessage(defaultMessage);
        setSent(false);
        await wait(900);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const n = files.length;
  const total = files.reduce((a, f) => a + f.size, 0);
  const initials = to
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      ref={rootRef}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => !rootRef.current?.contains(e.relatedTarget as Node) && setDrag(false)}
      onDrop={onDrop}
      className={`relative w-full max-w-[460px] select-none rounded-[28px] bg-white p-4 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-26px_rgba(124,58,237,.45)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-black/[.06] px-1 pb-3">
        <span className="text-[13px] text-[#86868b]">To</span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#f5f0ff] py-1 pl-1 pr-2.5 text-[13px] font-medium text-[#3b1d78]">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[linear-gradient(135deg,#fb923c,#ec4899)] text-[9.5px] font-semibold text-white">{initials}</span>
          {to}
        </span>
      </div>

      <label htmlFor={`${uid}-msg`} className="sr-only">
        Message
      </label>
      <textarea
        id={`${uid}-msg`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="mt-3 block w-full resize-none border-0 bg-transparent px-1 text-[15px] leading-[1.5] text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6]"
      />

      {/* the clipped stack */}
      <div ref={stackRef} className="relative mt-1" style={{ height: 196 }} aria-label={n ? `${n} attached ${n === 1 ? "file" : "files"}` : "No attachments"} role="list">
        <AnimatePresence initial={false}>
          {!n && !sent && (
            <motion.p
              key="empty"
              className="pointer-events-none absolute inset-0 m-0 grid place-items-center rounded-[18px] border border-dashed border-[#c4b5fd] bg-[#faf7ff] text-[13px] text-[#6d5a9e]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.35, duration: 0.25 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              Attach files with the paperclip, or drop them here.
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {sent && (
            <motion.p key="sent" className="absolute inset-0 m-0 flex items-center justify-center gap-2 text-[14px] font-medium" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[linear-gradient(135deg,#34d399,#059669)] text-white">{ic("check", 12)}</span>
              Sent to {to}
            </motion.p>
          )}
        </AnimatePresence>

        {/* the back of the clip, behind the paper */}
        {n > 0 && <Clip part="back" r={clipR} y={clipY} />}
        <AnimatePresence>
          {files.map((f, i) => {
            const depth = n - 1 - i; // 0 is the top card
            return (
              <Card
                key={f.id}
                file={f}
                depth={depth}
                index={i}
                from={from}
                jiggle={jiggle}
                reduced={reduced}
                sending={sendingNow}
                onRaise={() => raise(f.id)}
                onRemove={() => remove(f.id)}
                closeIcon={ic("x", 10)}
                imageIcon={ic("image", 26)}
              />
            );
          })}
        </AnimatePresence>
        {/* the tongue of the clip, in front of the paper */}
        {n > 0 && <Clip part="front" r={clipR} y={clipY} shadow={tongueShadow} />}
        <AnimatePresence>
          {n > 0 && (
            <motion.p key="count" className="absolute bottom-1 right-1 m-0 text-right text-[12px] text-[#86868b]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="tabular-nums">{n}</span> {n === 1 ? "file" : "files"}, {human(total)}
            </motion.p>
          )}
        </AnimatePresence>
        {drag && <div className="pointer-events-none absolute inset-0 rounded-[18px] border-2 border-[#a855f7] bg-[#a855f7]/[.06]" />}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-black/[.06] pt-3">
        <input ref={fileRef} type="file" multiple className="sr-only" tabIndex={-1} onChange={pick} aria-hidden="true" />
        <motion.button
          ref={btnRef}
          type="button"
          onClick={() => {
            measureFrom();
            fileRef.current?.click();
          }}
          disabled={n >= maxFiles}
          aria-label="Attach files"
          whileTap={{ scale: 0.9, rotate: -12 }}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#fce7f3] text-[#be185d] outline-none transition-colors hover:bg-[#fbcfe8] focus-visible:ring-2 focus-visible:ring-[#a855f7] disabled:opacity-40"
        >
          {ic("clip", 19)}
        </motion.button>
        <motion.button
          type="button"
          data-send
          onClick={() => void send()}
          disabled={!message.trim() && !n}
          whileTap={{ scale: 0.95 }}
          className="flex h-10 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#7c3aed,#db2777)] pl-4 pr-3 text-[14px] font-medium text-white shadow-[0_10px_22px_-10px_rgba(219,39,119,.85)] outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 disabled:opacity-40"
        >
          Send
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">{ic("send", 13)}</span>
        </motion.button>
      </div>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}

const STACK_X = 30;
const STACK_Y = 22;

/** One attached file: a little sheet pinned at its corner, fanned out by how deep in the stack it sits. */
function Card({
  file,
  depth,
  index,
  from,
  jiggle,
  reduced,
  sending,
  onRaise,
  onRemove,
  closeIcon,
  imageIcon,
}: {
  file: Attachment;
  depth: number;
  index: number;
  from: { x: number; y: number };
  jiggle: MotionValue<number>;
  reduced: boolean;
  sending: boolean;
  onRaise: () => void;
  onRemove: () => void;
  closeIcon: ReactElement;
  imageIcon: ReactElement;
}) {
  const [, c1, c2] = tint(ext(file.name));
  const spin = useTransform(jiggle, (j) => j * (1 + depth * 0.4) * (index % 2 ? -1 : 1));
  const top = depth === 0;
  return (
    <motion.div
      data-card={file.id}
      role="listitem"
      className="absolute"
      style={{ left: STACK_X, top: STACK_Y, width: CARD_W, height: CARD_H, zIndex: 10 - depth, originX: `${PIVOT}px`, originY: `${PIVOT}px`, rotate: spin }}
      initial={reduced ? { opacity: 0 } : { x: from.x - STACK_X, y: from.y - STACK_Y, scale: 0.35, rotateZ: -28, opacity: 0 }}
      animate={{ x: depth * 7, y: 0, scale: 1 - depth * 0.015, rotateZ: -depth * 13, opacity: 1 }}
      exit={
        reduced
          ? { opacity: 0 }
          : sending
            ? { x: 260, y: -150, rotateZ: -18, scale: 0.6, opacity: 0, transition: { duration: 0.55, ease: [0.5, 0, 0.8, 0.6], delay: depth * 0.04 } }
            : { x: 150, y: 120, rotateZ: 40, opacity: 0, transition: { duration: 0.45, ease: [0.5, 0, 0.9, 0.6] } }
      }
      transition={{ type: "spring", stiffness: 210, damping: 21 }}
    >
      <button
        type="button"
        onClick={top ? undefined : onRaise}
        aria-label={top ? `${file.name}, ${human(file.size)}` : `${file.name}, bring to front`}
        className={`absolute inset-0 flex flex-col overflow-hidden rounded-[10px] bg-white text-left outline-none shadow-[0_0_0_1px_rgba(0,0,0,.07),0_8px_18px_-10px_rgba(0,0,0,.35)] focus-visible:ring-2 focus-visible:ring-[#a855f7] ${top ? "cursor-default" : "cursor-pointer"}`}
      >
        <span className="relative m-1.5 mb-0 grid h-[78px] place-items-center overflow-hidden rounded-[7px] text-white" style={{ background: `linear-gradient(150deg, ${c1}, ${c2})` }}>
          {file.url ? (
            <img src={file.url} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : isImage(file) ? (
            <span className="relative grid h-full w-full place-items-center overflow-hidden bg-[linear-gradient(180deg,#7c3aed,#ec4899_60%,#fb923c)]">
              <span className="absolute bottom-[-18px] left-[-10px] h-12 w-24 rounded-[50%] bg-[#4c1d95]/70" />
              <span className="absolute bottom-[-22px] right-[-16px] h-14 w-20 rounded-[50%] bg-[#831843]/70" />
              <span className="absolute right-3 top-3 h-4 w-4 rounded-full bg-[#fde68a]" />
              <span className="relative opacity-90">{imageIcon}</span>
            </span>
          ) : (
            <span className="flex h-full w-full flex-col justify-center gap-1.5 px-3">
              <span className="text-[13px] font-bold tracking-[0.04em] text-white">{ext(file.name)}</span>
              {[0.9, 0.7, 0.8].map((w, k) => (
                <span key={k} className="block h-[3px] rounded-full bg-white/45" style={{ width: `${w * 100}%` }} />
              ))}
            </span>
          )}
        </span>
        <span className="mt-auto px-2 pb-2">
          <span className="block truncate text-[11.5px] font-medium leading-[1.3]">{file.name}</span>
          <span className="block text-[10.5px] text-[#86868b]">{human(file.size)}</span>
        </span>
      </button>
      <AnimatePresence>
        {top && (
          <motion.button
            type="button"
            data-remove={file.id}
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#2e1065] text-white shadow-[0_2px_6px_rgba(46,16,101,.4)] outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 26, delay: 0.25 }}
          >
            {closeIcon}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * A gem paperclip drawn as wire. The "back" is the whole clip, which sits behind the paper; the "front" is the
 * inner tongue, which lies on top of it, so together the clip looks like it's really holding the stack.
 */
function Clip({ part, r, y, shadow }: { part: "back" | "front"; r: MotionValue<number>; y: MotionValue<number>; shadow?: MotionValue<string> }) {
  const full = "M14 40 L14 8 A6 6 0 0 0 2 8 L2 62 A8 8 0 0 0 18 62 L18 14 A4 4 0 0 0 10 14 L10 46";
  const tongue = "M10 20 L10 46";
  const s = 1.4;
  return (
    <motion.svg
      aria-hidden="true"
      width={20 * s}
      height={72 * s}
      viewBox="-1 -1 22 74"
      className="pointer-events-none absolute overflow-visible"
      style={{ left: STACK_X + PIVOT - 10 * s, top: STACK_Y + PIVOT - 30 * s, zIndex: part === "back" ? 1 : 20, rotate: r, y, originX: "50%", originY: "30%", filter: shadow }}
    >
      <defs>
        <linearGradient id={`clip-${part}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c0166f" />
          <stop offset="0.45" stopColor="#ff9ad5" />
          <stop offset="1" stopColor="#db2777" />
        </linearGradient>
      </defs>
      <path d={part === "back" ? full : tongue} fill="none" stroke={`url(#clip-${part})`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d={part === "back" ? full : tongue} fill="none" stroke="rgba(112,10,60,.35)" strokeWidth={0.6} strokeLinecap="round" transform="translate(0.5 0.6)" />
    </motion.svg>
  );
}
```

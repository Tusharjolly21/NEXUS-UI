"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;
const POP = { type: "spring", stiffness: 520, damping: 22 } as const;

export type ComposerModel = { id: string; name: string; note: string };
export type ComposerFile = { id: string; name: string; size: string; kind: string };
type Msg = { id: number; role: "user" | "ai"; text: string; files?: ComposerFile[]; streaming?: boolean; stopped?: boolean };

const MODELS: ComposerModel[] = [
  { id: "swift", name: "Swift", note: "Quick answers" },
  { id: "deep", name: "Deep", note: "Thinks it through" },
  { id: "vision", name: "Vision", note: "Reads images and PDFs" },
];

const IDEAS = ["Summarise this report in three bullets", "Draft a friendly reply to a late invoice", "Plan a four-day trip to Lisbon", "Explain this chart to a new hire"];

const DEMO_FILES: ComposerFile[] = [
  { id: "f1", name: "Q3-report.pdf", size: "2.4 MB", kind: "PDF" },
  { id: "f2", name: "launch-shot.png", size: "860 KB", kind: "PNG" },
];

function demoReply(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes("summar")) return "Revenue grew 18% on the quarter, led by the new team plan. Costs held flat because hosting moved to the edge network. The one risk is churn among small accounts, which rose two points.";
  if (p.includes("invoice") || p.includes("reply")) return "Hi Sam, hope your week is going well. A quick nudge on invoice 2041, which was due on the 3rd. If it has already gone out, thank you and please ignore this. Happy to resend it if that helps.";
  if (p.includes("trip") || p.includes("lisbon")) return "Day one, Alfama on foot and sunset at the Senhora do Monte viewpoint. Day two, Belém in the morning and LX Factory after lunch. Day three, a train to Sintra. Day four, Cascais and the coast road back.";
  return "Here is the short version. The line climbs steadily until March, dips when the price changed, then recovers within two weeks. The takeaway is that the change cost a fortnight of growth, not the quarter.";
}

const KIND_TONE: Record<string, string> = { PDF: "#ff3b30", PNG: "#0071e3", JPG: "#0071e3", MD: "#6e6e73", TXT: "#6e6e73", CSV: "#30d158" };

function sizeOf(b: number) {
  if (b > 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  if (b > 1e3) return `${Math.round(b / 1e3)} KB`;
  return `${b} B`;
}

export type AIComposerProps = {
  /** The models in the picker. The first one is selected to start with. */
  models?: ComposerModel[];
  /** Suggestions shown as the rotating placeholder and as the chips under the greeting. */
  ideas?: string[];
  greeting?: string;
  /** Type and send demo prompts until the first interaction. Off under reduced motion. */
  autoplay?: boolean;
  /** Return the reply (or a promise of it) to stream; without it a demo reply is used. */
  onSend?: (message: { text: string; files: ComposerFile[]; model: ComposerModel }) => string | Promise<string> | void;
  className?: string;
};

/**
 * AI Composer: the prompt box every AI product needs. It grows as you type,
 * cycles through suggestions while empty, takes attachments as chips and lets
 * you pick a model. Send, and your words dissolve into particles that drift up
 * into the thread while the send button folds into a stop button; the reply
 * shows a shimmering "Thinking" then streams in word by word. Enter sends,
 * Shift+Enter adds a line, Escape stops. Pass `onSend` to stream your own replies.
 */
export function AIComposer({
  models = MODELS,
  ideas = IDEAS,
  greeting = "What can I help with?",
  autoplay = true,
  onSend,
  className = "",
}: AIComposerProps) {
  const reduce = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.4 });
  const touched = useRef(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<ComposerFile[]>([]);
  const [model, setModel] = useState(models[0]);
  const [menu, setMenu] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState(0);
  const [fading, setFading] = useState(false);
  const timer = useRef<number | null>(null);
  const nextId = useRef(1);
  const busyRef = useRef(false);
  const raf = useRef(0);
  const fadeTimer = useRef<number | null>(null);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  // rotate the placeholder while the box is empty
  useEffect(() => {
    if (text) return;
    const id = window.setInterval(() => setHint((h) => (h + 1) % ideas.length), 2800);
    return () => window.clearInterval(id);
  }, [text, ideas.length]);

  // grow with the text, up to six lines
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(144, Math.max(24, el.scrollHeight))}px`;
  }, [text]);

  // close the model menu on outside click
  useEffect(() => {
    if (!menu) return;
    const off = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    window.addEventListener("mousedown", off);
    return () => window.removeEventListener("mousedown", off);
  }, [menu]);

  /** draw the words into the canvas and blow them away as particles */
  const vanish = useCallback((value: string) => {
    const cv = canvas.current;
    const ta = area.current;
    if (!cv || !ta || !value.trim() || reduce) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = ta.clientWidth;
    const H = Math.max(ta.clientHeight, 24);
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.width = `${W}px`;
    cv.style.height = `${H}px`;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const cs = getComputedStyle(ta);
    ctx.scale(dpr, dpr);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.fillStyle = "#1d1d1f";
    ctx.textBaseline = "top";
    // wrap like the textarea does
    const lh = parseFloat(cs.lineHeight) || 24;
    let y = 0;
    for (const para of value.split("\n")) {
      let line = "";
      for (const word of para.split(" ")) {
        const t = line ? `${line} ${word}` : word;
        if (ctx.measureText(t).width > W && line) {
          ctx.fillText(line, 0, y + 3);
          y += lh;
          line = word;
        } else line = t;
      }
      ctx.fillText(line, 0, y + 3);
      y += lh;
    }
    const img = ctx.getImageData(0, 0, cv.width, cv.height).data;
    type P = { x: number; y: number; vx: number; vy: number; a: number; r: number };
    const ps: P[] = [];
    const step = Math.max(2, Math.round(2 * dpr));
    for (let py = 0; py < cv.height; py += step) {
      for (let px = 0; px < cv.width; px += step) {
        if (img[(py * cv.width + px) * 4 + 3] > 120) {
          const x = px / dpr;
          ps.push({ x, y: py / dpr, vx: (Math.random() - 0.3) * 1.6, vy: -(0.6 + Math.random() * 2.4), a: 1, r: 0.8 + Math.random() * 0.7 });
        }
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = (now - t0) / 900;
      ctx.clearRect(0, 0, W, H + 40);
      for (const p of ps) {
        // particles leave from the right end first, like the words are blown away
        const start = (p.x / W) * 0.35;
        if (k < start) {
          ctx.globalAlpha = 1;
          ctx.fillRect(p.x, p.y, 1.4, 1.4);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.05;
        p.a -= 0.028;
        if (p.a <= 0) continue;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (k < 1.4) raf.current = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H + 40);
    };
    raf.current = requestAnimationFrame(tick);
  }, [reduce]);

  const stop = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setBusy(false);
    setMsgs((m) => m.map((x) => (x.streaming ? { ...x, streaming: false, stopped: true } : x)));
  }, []);

  const stream = useCallback((reply: string, id: number) => {
    const words = reply.split(" ");
    let n = 0;
    timer.current = window.setInterval(() => {
      n += 1 + (Math.random() < 0.3 ? 1 : 0);
      const done = n >= words.length;
      setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: words.slice(0, n).join(" "), streaming: !done } : x)));
      if (done) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        setBusy(false);
      }
    }, 55);
  }, []);

  const send = useCallback(
    async (value: string, withFiles: ComposerFile[]) => {
      const t = value.trim();
      if (!t || busyRef.current) return;
      vanish(value);
      setFading(true);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => setFading(false), 1000);
      setText("");
      setFiles([]);
      setBusy(true);
      const uidUser = nextId.current++;
      const uidAi = nextId.current++;
      window.setTimeout(() => {
        setMsgs((m) => [...m.slice(-2), { id: uidUser, role: "user", text: t, files: withFiles }, { id: uidAi, role: "ai", text: "", streaming: true }]);
      }, 380);
      let reply = demoReply(t);
      try {
        const out = onSend?.({ text: t, files: withFiles, model });
        const r = out instanceof Promise ? await out : out;
        if (typeof r === "string" && r) reply = r;
      } catch {
        reply = "Something went wrong. Try again in a moment.";
      }
      window.setTimeout(() => busyRef.current && stream(reply, uidAi), 1100);
    },
    [model, onSend, stream, vanish],
  );

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      cancelAnimationFrame(raf.current);
    },
    [],
  );

  // the demo: type an idea, sometimes attach a file, send, wait for the reply
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    (async () => {
      let k = 0;
      await wait(900);
      while (alive && !touched.current) {
        const idea = ideas[k % ideas.length];
        const attach = k % 2 === 0 ? [DEMO_FILES[k % 4 === 0 ? 0 : 1]] : [];
        if (attach.length) {
          setFiles(attach);
          await wait(500);
        }
        for (let i = 1; i <= idea.length && alive && !touched.current; i++) {
          setText(idea.slice(0, i));
          await wait(28 + Math.random() * 40);
        }
        if (!alive || touched.current) break;
        await wait(450);
        send(idea, attach);
        await wait(1500);
        while (alive && busyRef.current) await wait(200);
        await wait(2200);
        k += 1;
      }
    })();
    return () => {
      alive = false;
    };
  }, [autoplay, reduce, inView, ideas, send]);

  const touch = () => {
    if (!touched.current) {
      touched.current = true;
      setText("");
      setFiles([]);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(text, files);
    } else if (e.key === "Escape" && busy) stop();
  };

  const addFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: sizeOf(f.size),
      kind: (f.name.split(".").pop() || "FILE").toUpperCase().slice(0, 4),
    }));
    setFiles((fs) => [...fs, ...list].slice(-4));
    e.target.value = "";
  };

  const ready = !!text.trim() && !busy;

  return (
    <div ref={root} onPointerDown={touch} className={`flex w-full max-w-[560px] flex-col gap-3 ${className}`}>
      {/* thread */}
      <div className="relative flex h-[250px] flex-col justify-end overflow-hidden" style={{ maskImage: "linear-gradient(transparent, #000 22%)", WebkitMaskImage: "linear-gradient(transparent, #000 22%)" }} aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          {msgs.length === 0 ? (
            <motion.div key="hello" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16, filter: "blur(6px)" }} transition={{ ...SPRING, filter: { duration: 0.25 } }} className="flex flex-col items-center gap-4 pb-6 text-center">
              <motion.div aria-hidden="true" className="h-11 w-11 rounded-full" style={{ background: "conic-gradient(from 0deg, #0071e3, #bf5af2, #ff9f0a, #30d158, #0071e3)" }} animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
              <h3 className="m-0 text-[24px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">{greeting}</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {ideas.slice(0, 3).map((idea) => (
                  <motion.button
                    key={idea}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      touch();
                      setText(idea);
                      area.current?.focus();
                    }}
                    className="h-8 rounded-full border-0 bg-white px-3.5 text-[12.5px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.07)] outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                  >
                    {idea}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            msgs.map((m) =>
              m.role === "user" ? (
                <motion.div key={m.id} layout="position" initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={POP} style={{ originX: 1, originY: 1 }} className="mb-2 flex flex-col items-end gap-1.5">
                  {!!m.files?.length && (
                    <div className="flex gap-1.5">
                      {m.files.map((f) => (
                        <span key={f.id} className="rounded-[10px] bg-white px-2 py-1 text-[11px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)]">
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="max-w-[80%] rounded-[20px] rounded-br-[6px] bg-[#0071e3] px-4 py-2.5 text-[14.5px] leading-[1.4] text-white">{m.text}</div>
                </motion.div>
              ) : (
                <motion.div key={m.id} layout="position" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={SPRING} className="mb-2 flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-0.5 h-6 w-6 flex-none rounded-full" style={{ background: "conic-gradient(from 90deg, #0071e3, #bf5af2, #ff9f0a, #30d158, #0071e3)" }} />
                  <div className="min-w-0 pt-0.5 text-[14.5px] leading-[1.5] text-[#1d1d1f]">
                    {m.streaming && !m.text ? (
                      <motion.span
                        className="bg-clip-text font-medium text-transparent"
                        style={{ backgroundImage: "linear-gradient(90deg, #86868b 0%, #86868b 35%, #1d1d1f 50%, #86868b 65%, #86868b 100%)", backgroundSize: "250% 100%", WebkitBackgroundClip: "text" }}
                        animate={reduce ? undefined : { backgroundPosition: ["100% 0%", "0% 0%"] }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
                      >
                        Thinking
                      </motion.span>
                    ) : (
                      <>
                        {m.text}
                        {m.streaming && <motion.span aria-hidden="true" className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#0071e3]" animate={reduce ? undefined : { opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />}
                        {m.stopped && <span className="ml-1.5 text-[12px] text-[#86868b]">Stopped</span>}
                      </>
                    )}
                  </div>
                </motion.div>
              ),
            )
          )}
        </AnimatePresence>
      </div>

      {/* composer */}
      <motion.div layout transition={SPRING} className="relative rounded-[26px] bg-white p-2.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-26px_rgba(0,0,0,.35)] focus-within:shadow-[0_0_0_1px_rgba(0,113,227,.45),0_0_0_4px_rgba(0,113,227,.12),0_20px_40px_-26px_rgba(0,0,0,.35)]">
        <AnimatePresence initial={false} mode="popLayout">
          {files.length > 0 && (
            <motion.div key="files" layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={SPRING} className="flex flex-wrap gap-2 px-1 pb-2 pt-0.5">
              <AnimatePresence initial={false} mode="popLayout">
                {files.map((f) => (
                  <motion.div key={f.id} layout initial={{ opacity: 0, scale: 0.6, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.6 }} transition={POP} className="flex items-center gap-2 rounded-[14px] bg-[#f5f5f7] py-1.5 pl-1.5 pr-2">
                    <span className="grid h-8 w-8 place-items-center rounded-[9px] text-[9px] font-bold text-white" style={{ background: KIND_TONE[f.kind] ?? "#6e6e73" }}>
                      {f.kind}
                    </span>
                    <span className="flex flex-col leading-[1.2]">
                      <span className="max-w-[140px] truncate text-[12.5px] font-medium text-[#1d1d1f]">{f.name}</span>
                      <span className="text-[11px] text-[#6e6e73]">{f.size}</span>
                    </span>
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((fs) => fs.filter((x) => x.id !== f.id))} className="ml-0.5 grid h-5 w-5 place-items-center rounded-full border-0 bg-[#d2d2d7] p-0 text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
                      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                        <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative px-2 pt-1">
          <textarea
            ref={area}
            value={text}
            rows={1}
            onChange={(e) => {
              touch();
              setText(e.target.value);
            }}
            onKeyDown={onKey}
            onFocus={touch}
            aria-label="Message"
            placeholder=""
            className="block w-full resize-none border-0 bg-transparent p-0 text-[16px] leading-[24px] text-[#1d1d1f] outline-none [font-family:inherit]"
            style={{ height: 24 }}
          />
          {!text && !fading && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-2 top-1 h-6 overflow-hidden text-[16px] leading-[24px] text-[#86868b]">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span key={hint} className="absolute left-0 top-0 whitespace-nowrap" initial={{ y: 22, opacity: 0, filter: "blur(3px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -22, opacity: 0, filter: "blur(3px)" }} transition={{ ...SPRING, filter: { duration: 0.25 } }}>
                  {ideas[hint]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
          <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute left-2 top-1" />
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <input ref={fileInput} type="file" multiple className="sr-only" tabIndex={-1} onChange={addFiles} />
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            aria-label="Attach files"
            onClick={() => {
              touch();
              fileInput.current?.click();
            }}
            className="grid h-9 w-9 place-items-center rounded-full border-0 bg-[#f5f5f7] p-0 text-[#1d1d1f] outline-none hover:bg-[#e8e8ed] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </motion.button>

          <div ref={menuRef} className="relative">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              aria-haspopup="listbox"
              aria-expanded={menu}
              aria-controls={`models-${uid}`}
              onClick={() => {
                touch();
                setMenu((m) => !m);
              }}
              onKeyDown={(e) => e.key === "Escape" && setMenu(false)}
              className="flex h-9 items-center gap-1.5 rounded-full border-0 bg-[#f5f5f7] px-3.5 text-[13px] font-medium text-[#1d1d1f] outline-none [font-family:inherit] hover:bg-[#e8e8ed] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span key={model.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING}>
                  {model.name}
                </motion.span>
              </AnimatePresence>
              <motion.svg width="10" height="10" viewBox="0 0 10 10" animate={{ rotate: menu ? 180 : 0 }} aria-hidden="true">
                <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </motion.button>
            <AnimatePresence>
              {menu && (
                <motion.ul
                  id={`models-${uid}`}
                  role="listbox"
                  aria-label="Model"
                  initial={{ opacity: 0, y: 8, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={POP}
                  style={{ originX: 0, originY: 1 }}
                  className="absolute bottom-[calc(100%+8px)] left-0 z-20 m-0 w-[220px] list-none rounded-[18px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_48px_-20px_rgba(0,0,0,.35)]"
                >
                  {models.map((m) => (
                    <li key={m.id} role="option" aria-selected={m.id === model.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setModel(m);
                          setMenu(false);
                        }}
                        onKeyDown={(e) => e.key === "Escape" && setMenu(false)}
                        className="flex w-full items-center justify-between rounded-[12px] border-0 bg-transparent px-3 py-2 text-left outline-none [font-family:inherit] hover:bg-[#f5f5f7] focus-visible:bg-[#f5f5f7]"
                      >
                        <span className="flex flex-col">
                          <span className="text-[13.5px] font-medium text-[#1d1d1f]">{m.name}</span>
                          <span className="text-[12px] text-[#6e6e73]">{m.note}</span>
                        </span>
                        {m.id === model.id && (
                          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                            <path d="M3 7.5l2.6 2.6L11 4.5" fill="none" stroke="#0071e3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            aria-label={busy ? "Stop" : "Send"}
            disabled={!busy && !ready}
            onClick={() => {
              touch();
              if (busy) stop();
              else send(text, files);
            }}
            whileTap={{ scale: 0.86 }}
            animate={{ backgroundColor: busy ? "#1d1d1f" : ready ? "#0071e3" : "#e8e8ed" }}
            transition={{ duration: 0.2 }}
            className="ml-auto grid h-9 w-9 place-items-center overflow-hidden rounded-full border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {busy ? (
                <motion.span key="stop" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={POP} className="block h-3 w-3 rounded-[3px] bg-white" />
              ) : (
                <motion.svg key="up" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -22, opacity: 0 }} transition={POP}>
                  <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" fill="none" stroke={ready ? "#fff" : "#86868b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
      <p className="m-0 px-2 text-[12.5px] text-[#6e6e73]">Enter sends, Shift+Enter adds a line, Escape stops the reply.</p>
    </div>
  );
}

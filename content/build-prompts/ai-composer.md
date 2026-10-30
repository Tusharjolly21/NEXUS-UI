# AI Composer

Add the "AI Composer" component from Nexus UI to my project.

The prompt box every AI product needs. It grows as you type, cycles through suggestions while it is empty and lets you pick a model. The + opens a menu like the ones in AI apps: add photos (they show as thumbnails, and you can paste one), add files, or switch on a skill such as web search, deep research, image creation or code, which sits in the box as a chip you can remove. Send, and your words dissolve into particles that drift up into the thread while the send button folds into Stop; the reply shows a shimmering Thinking, then streams in word by word. Enter sends, Shift+Enter adds a line, Escape stops the reply. Until you touch it, it types and sends suggestions on its own, opening the + menu now and then. Pass onSend to stream your own replies.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { AIComposer } from "@/components/ai-composer";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/ai-composer/ai-composer.tsx ---

```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;
const POP = { type: "spring", stiffness: 520, damping: 22 } as const;

export type ComposerModel = { id: string; name: string; note: string };
export type ComposerFile = {
  id: string;
  name: string;
  size: string;
  kind: string;
  /** An object URL for a photo's thumbnail. Photos added from the menu or pasted get one. */
  preview?: string;
};
/** Something the + menu can switch on for the next messages, like web search or image creation. */
export type ComposerSkill = {
  id: string;
  name: string;
  note: string;
  icon?: "globe" | "search" | "image" | "code" | "spark";
  /** What the reply says it did, for example "Searched 5 sources". Defaults to the skill name. */
  used?: string;
};
type Msg = { id: number; role: "user" | "ai"; text: string; files?: ComposerFile[]; used?: string[]; image?: boolean; streaming?: boolean; stopped?: boolean };

const MODELS: ComposerModel[] = [
  { id: "swift", name: "Swift", note: "Quick answers" },
  { id: "deep", name: "Deep", note: "Thinks it through" },
  { id: "vision", name: "Vision", note: "Reads images and PDFs" },
];

const SKILLS: ComposerSkill[] = [
  { id: "web", name: "Web search", note: "Look it up online", icon: "globe", used: "Searched 5 sources" },
  { id: "research", name: "Deep research", note: "Reads widely, writes a report", icon: "search", used: "Read 12 sources" },
  { id: "image", name: "Create image", note: "Turn words into a picture", icon: "image", used: "Created an image" },
  { id: "code", name: "Write code", note: "Small, tested snippets", icon: "code", used: "Wrote code" },
];

const IDEAS = ["Summarise this report in three bullets", "Draft a friendly reply to a late invoice", "Plan a four-day trip to Lisbon", "Explain this chart to a new hire"];

const DEMO_FILES: ComposerFile[] = [
  { id: "f1", name: "Q3-report.pdf", size: "2.4 MB", kind: "PDF" },
  { id: "f2", name: "launch-shot.png", size: "860 KB", kind: "PNG" },
];

function demoReply(prompt: string, skills: ComposerSkill[]) {
  const has = (id: string) => skills.some((k) => k.id === id);
  if (has("image")) return "Here is a first take, soft light over a quiet harbour. Tell me what to change and I will redraw it.";
  if (has("code")) return "Here is a small function for it. It adds up the rows, skips the empty ones and returns a number, with a test for each case.";
  const p = prompt.toLowerCase();
  if (p.includes("summar")) return "Revenue grew 18% on the quarter, led by the new team plan. Costs held flat because hosting moved to the edge network. The one risk is churn among small accounts, which rose two points.";
  if (p.includes("invoice") || p.includes("reply")) return "Hi Sam, hope your week is going well. A quick nudge on invoice 2041, which was due on the 3rd. If it has already gone out, thank you and please ignore this. Happy to resend it if that helps.";
  if (p.includes("trip") || p.includes("lisbon")) return "Day one, Alfama on foot and sunset at the Senhora do Monte viewpoint. Day two, Belém in the morning and LX Factory after lunch. Day three, a train to Sintra. Day four, Cascais and the coast road back.";
  return "Here is the short version. The line climbs steadily until March, dips when the price changed, then recovers within two weeks. The takeaway is that the change cost a fortnight of growth, not the quarter.";
}

const KIND_TONE: Record<string, string> = { PDF: "#ff3b30", PNG: "#0071e3", JPG: "#0071e3", MD: "#6e6e73", TXT: "#6e6e73", CSV: "#30d158" };

function Glyph({ name }: { name: NonNullable<ComposerSkill["icon"]> | "photo" | "file" }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
  switch (name) {
    case "globe":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6" />
          <path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
      );
    case "image":
    case "photo":
      return (
        <svg {...common}>
          <rect x="2" y="3" width="12" height="10" rx="2.5" />
          <circle cx="6" cy="7" r="1.2" />
          <path d="M3 12l3.5-3.5 2.5 2.5 2-2 2 2" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="M5.5 5L2.5 8l3 3M10.5 5l3 3-3 3" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M4 2.5h5l3 3v8H4z" />
          <path d="M9 2.5v3h3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M8 2l1.4 3.6L13 7l-3.6 1.4L8 12l-1.4-3.6L3 7l3.6-1.4z" />
        </svg>
      );
  }
}

function sizeOf(b: number) {
  if (b > 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  if (b > 1e3) return `${Math.round(b / 1e3)} KB`;
  return `${b} B`;
}

export type AIComposerProps = {
  /** The models in the picker. The first one is selected to start with. */
  models?: ComposerModel[];
  /** The skills listed under + (web search, image creation and so on). Pass an empty array to hide them. */
  skills?: ComposerSkill[];
  /** Suggestions shown as the rotating placeholder and as the chips under the greeting. */
  ideas?: string[];
  greeting?: string;
  /** Type and send demo prompts until the first interaction. Off under reduced motion. */
  autoplay?: boolean;
  /** Return the reply (or a promise of it) to stream; without it a demo reply is used. */
  onSend?: (message: { text: string; files: ComposerFile[]; skills: ComposerSkill[]; model: ComposerModel }) => string | Promise<string> | void;
  className?: string;
};

/**
 * AI Composer: the prompt box every AI product needs. It grows as you type,
 * cycles through suggestions while empty and lets you pick a model. The +
 * opens a menu: add photos (with thumbnails, or paste one), add files, or switch
 * on a skill such as web search or image creation, which shows as a chip in the box. Send, and your words dissolve into particles that drift up
 * into the thread while the send button folds into a stop button; the reply
 * shows a shimmering "Thinking" then streams in word by word. Enter sends,
 * Shift+Enter adds a line, Escape stops. Pass `onSend` to stream your own replies.
 */
export function AIComposer({
  models = MODELS,
  skills = SKILLS,
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
  const photoInput = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLDivElement>(null);
  const plusBtn = useRef<HTMLButtonElement>(null);
  const plusList = useRef<HTMLDivElement>(null);
  const urls = useRef<Set<string>>(new Set());
  const inView = useInView(root, { amount: 0.4 });
  const touched = useRef(false);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<ComposerFile[]>([]);
  const [model, setModel] = useState(models[0]);
  const [menu, setMenu] = useState(false);
  const [plus, setPlus] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
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

  // close the model and + menus on outside click
  useEffect(() => {
    if (!menu && !plus) return;
    const off = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menu && !menuRef.current?.contains(t)) setMenu(false);
      if (plus && !plusRef.current?.contains(t)) setPlus(false);
    };
    window.addEventListener("mousedown", off);
    return () => window.removeEventListener("mousedown", off);
  }, [menu, plus]);

  // a person opening the + menu lands on its first item; the demo never takes focus
  useEffect(() => {
    if (!plus || !touched.current) return;
    plusList.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus();
  }, [plus]);

  // thumbnails are object URLs; release them when the composer goes away
  useEffect(() => {
    const set = urls.current;
    return () => {
      set.forEach((u) => URL.revokeObjectURL(u));
      set.clear();
    };
  }, []);

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
    async (value: string, withFiles: ComposerFile[], withSkills: ComposerSkill[]) => {
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
        setMsgs((m) => [
          ...m.slice(-2),
          { id: uidUser, role: "user", text: t, files: withFiles },
          { id: uidAi, role: "ai", text: "", streaming: true, used: withSkills.map((k) => k.used ?? k.name), image: withSkills.some((k) => k.id === "image") },
        ]);
      }, 380);
      let reply = demoReply(t, withSkills);
      try {
        const out = onSend?.({ text: t, files: withFiles, skills: withSkills, model });
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
        const skill = k % 2 === 1 ? skills[k % skills.length] : undefined;
        if (attach.length) {
          setFiles(attach);
          await wait(500);
        }
        if (skill) {
          // show the + menu: open it, pick a skill, let the chip land
          setPlus(true);
          await wait(1100);
          if (!alive || touched.current) break;
          setPicked([skill.id]);
          await wait(450);
          setPlus(false);
          await wait(450);
        }
        for (let i = 1; i <= idea.length && alive && !touched.current; i++) {
          setText(idea.slice(0, i));
          await wait(28 + Math.random() * 40);
        }
        if (!alive || touched.current) break;
        await wait(450);
        send(idea, attach, skill ? [skill] : []);
        await wait(1500);
        while (alive && busyRef.current) await wait(200);
        await wait(2200);
        setPicked([]);
        k += 1;
      }
    })();
    return () => {
      alive = false;
    };
  }, [autoplay, reduce, inView, ideas, skills, send]);

  const touch = () => {
    if (!touched.current) {
      touched.current = true;
      setText("");
      setFiles([]);
      setPicked([]);
      setPlus(false);
    }
  };

  const chosen = skills.filter((k) => picked.includes(k.id));

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(text, files, chosen);
    } else if (e.key === "Escape" && busy) stop();
  };

  const ingest = (picked: File[]) => {
    const list = picked.map((f, i) => {
      const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined;
      if (preview) urls.current.add(preview);
      return {
        id: `${Date.now()}-${i}`,
        name: f.name,
        size: sizeOf(f.size),
        kind: (f.name.split(".").pop() || "FILE").toUpperCase().slice(0, 4),
        preview,
      };
    });
    if (list.length) setFiles((fs) => [...fs, ...list].slice(-4));
  };

  const addFiles = (e: ChangeEvent<HTMLInputElement>) => {
    ingest(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const toggleSkill = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const onPlusKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setPlus(false);
      plusBtn.current?.focus();
      return;
    }
    if (e.key === "Tab") {
      setPlus(false);
      return;
    }
    const items = Array.from(plusList.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);
    const at = items.indexOf(document.activeElement as HTMLElement);
    const go = e.key === "ArrowDown" ? at + 1 : e.key === "ArrowUp" ? at - 1 : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : null;
    if (go === null) return;
    e.preventDefault();
    items[(go + items.length) % items.length]?.focus();
  };

  const ready = !!text.trim() && !busy;
  const chips = files.length > 0 || chosen.length > 0;

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
                      {m.files.map((f) =>
                        f.preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={f.id} src={f.preview} alt={f.name} className="h-14 w-14 rounded-[12px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,.08)]" />
                        ) : (
                          <span key={f.id} className="rounded-[10px] bg-white px-2 py-1 text-[11px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)]">
                            {f.name}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                  <div className="max-w-[80%] rounded-[20px] rounded-br-[6px] bg-[#0071e3] px-4 py-2.5 text-[14.5px] leading-[1.4] text-white">{m.text}</div>
                </motion.div>
              ) : (
                <motion.div key={m.id} layout="position" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={SPRING} className="mb-2 flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-0.5 h-6 w-6 flex-none rounded-full" style={{ background: "conic-gradient(from 90deg, #0071e3, #bf5af2, #ff9f0a, #30d158, #0071e3)" }} />
                  <div className="min-w-0 pt-0.5 text-[14.5px] leading-[1.5] text-[#1d1d1f]">
                    {!!m.used?.length && (
                      <div className="mb-1 flex flex-wrap gap-1.5">
                        {m.used.map((u) => (
                          <span key={u} className="rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[11.5px] font-medium text-[#0066cc]">
                            {u}
                          </span>
                        ))}
                      </div>
                    )}
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
                    {m.image && !m.streaming && !m.stopped && (
                      <motion.div
                        aria-hidden="true"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={POP}
                        className="mt-2 h-[84px] w-[150px] rounded-[16px] shadow-[0_0_0_1px_rgba(0,0,0,.06)]"
                        style={{ background: "radial-gradient(circle at 70% 34%, #fff4cf 0 9%, transparent 10%), linear-gradient(180deg, #ffb36b 0%, #ff7a9c 52%, #7b6cff 100%)" }}
                      />
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
          {chips && (
            <motion.div key="files" layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={SPRING} className="flex flex-wrap gap-2 px-1 pb-2 pt-0.5">
              <AnimatePresence initial={false} mode="popLayout">
                {chosen.map((k) => (
                  <motion.div key={k.id} layout initial={{ opacity: 0, scale: 0.6, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.6 }} transition={POP} className="flex h-[38px] items-center gap-1.5 rounded-full bg-[#0071e3]/10 pl-3 pr-1.5 text-[#0066cc]">
                    <Glyph name={k.icon ?? "spark"} />
                    <span className="text-[12.5px] font-medium">{k.name}</span>
                    <button type="button" aria-label={`Turn off ${k.name}`} onClick={() => toggleSkill(k.id)} className="grid h-5 w-5 place-items-center rounded-full border-0 bg-[#0071e3]/15 p-0 text-[#0066cc] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
                      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                        <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
                {files.map((f) => (
                  <motion.div key={f.id} layout initial={{ opacity: 0, scale: 0.6, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.6 }} transition={POP} className="flex items-center gap-2 rounded-[14px] bg-[#f5f5f7] py-1.5 pl-1.5 pr-2">
                    {f.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.preview} alt="" className="h-8 w-8 rounded-[9px] object-cover" />
                    ) : (
                      <span className="grid h-8 w-8 place-items-center rounded-[9px] text-[9px] font-bold text-white" style={{ background: KIND_TONE[f.kind] ?? "#6e6e73" }}>
                        {f.kind}
                      </span>
                    )}
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
            onPaste={(e) => {
              const pics = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
              if (!pics.length) return;
              e.preventDefault();
              touch();
              ingest(pics);
            }}
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
          <input ref={fileInput} type="file" multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={addFiles} />
          <input ref={photoInput} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={addFiles} />
          <div ref={plusRef} className="relative">
            <motion.button
              ref={plusBtn}
              type="button"
              whileTap={{ scale: 0.88 }}
              aria-label="Add photos, files and skills"
              aria-haspopup="menu"
              aria-expanded={plus}
              aria-controls={`plus-${uid}`}
              onClick={() => {
                touch();
                setMenu(false);
                setPlus((o) => !o);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setPlus(false);
                if (e.key === "ArrowDown" && !plus) {
                  e.preventDefault();
                  touched.current = true;
                  setMenu(false);
                  setPlus(true);
                }
              }}
              className="grid h-9 w-9 place-items-center rounded-full border-0 bg-[#f5f5f7] p-0 text-[#1d1d1f] outline-none hover:bg-[#e8e8ed] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
              style={{ backgroundColor: plus ? "#e8e8ed" : undefined }}
            >
              <motion.svg width="16" height="16" viewBox="0 0 16 16" animate={{ rotate: plus ? 45 : 0 }} transition={POP} aria-hidden="true">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </motion.svg>
            </motion.button>
            <AnimatePresence>
              {plus && (
                <motion.div
                  ref={plusList}
                  id={`plus-${uid}`}
                  role="menu"
                  aria-label="Add to your message"
                  onKeyDown={onPlusKey}
                  initial={{ opacity: 0, y: 8, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={POP}
                  style={{ originX: 0, originY: 1 }}
                  className="absolute bottom-[calc(100%+8px)] left-0 z-20 w-[264px] rounded-[20px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_48px_-20px_rgba(0,0,0,.35)]"
                >
                  <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73]" role="presentation">
                    Add
                  </div>
                  {(
                    [
                      { id: "photos", name: "Add photos", note: "From your device, or paste one", icon: "photo" },
                      { id: "files", name: "Add files", note: "PDFs, docs, spreadsheets", icon: "file" },
                    ] as const
                  ).map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => {
                        setPlus(false);
                        (a.id === "photos" ? photoInput : fileInput).current?.click();
                      }}
                      className="flex w-full items-center gap-3 rounded-[14px] border-0 bg-transparent px-2.5 py-1.5 text-left outline-none [font-family:inherit] hover:bg-[#f5f5f7] focus-visible:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                    >
                      <span className="grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-[#f5f5f7] text-[#1d1d1f]">
                        <Glyph name={a.icon} />
                      </span>
                      <span className="flex min-w-0 flex-col leading-[1.25]">
                        <span className="text-[13.5px] font-medium text-[#1d1d1f]">{a.name}</span>
                        <span className="text-[12px] text-[#6e6e73]">{a.note}</span>
                      </span>
                    </button>
                  ))}
                  {skills.length > 0 && (
                    <>
                      <div className="mx-3 my-1.5 h-px bg-black/[0.06]" role="separator" />
                      <div className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73]" role="presentation">
                        Skills
                      </div>
                      {skills.map((k) => {
                        const on = picked.includes(k.id);
                        return (
                          <button
                            key={k.id}
                            type="button"
                            role="menuitemcheckbox"
                            aria-checked={on}
                            tabIndex={-1}
                            onClick={() => toggleSkill(k.id)}
                            className="flex w-full items-center gap-3 rounded-[14px] border-0 bg-transparent px-2.5 py-1.5 text-left outline-none [font-family:inherit] hover:bg-[#f5f5f7] focus-visible:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                          >
                            <span className={`grid h-8 w-8 flex-none place-items-center rounded-[10px] transition-colors ${on ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#1d1d1f]"}`}>
                              <Glyph name={k.icon ?? "spark"} />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col leading-[1.25]">
                              <span className="text-[13.5px] font-medium text-[#1d1d1f]">{k.name}</span>
                              <span className="text-[12px] text-[#6e6e73]">{k.note}</span>
                            </span>
                            {on && (
                              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="flex-none">
                                <path d="M3 7.5l2.6 2.6L11 4.5" fill="none" stroke="#0071e3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div ref={menuRef} className="relative">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              aria-haspopup="listbox"
              aria-expanded={menu}
              aria-controls={`models-${uid}`}
              onClick={() => {
                touch();
                setPlus(false);
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
              else send(text, files, chosen);
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
```

--- components/ai-composer/index.ts ---

```ts
export { AIComposer } from "./ai-composer";
export type { AIComposerProps, ComposerFile, ComposerModel } from "./ai-composer";
```

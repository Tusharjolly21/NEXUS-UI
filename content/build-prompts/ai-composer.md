# AI Composer

Add the "AI Composer" component from Nexus UI to my project.

The prompt box every AI product needs. It grows as you type, cycles through suggestions while it is empty and lets you pick a model. The + opens a menu like the ones in AI apps: add photos (they show as thumbnails, and you can paste one), add files, or switch on a skill such as web search, deep research, image creation or code, which sits in the box as a chip you can remove. Send, and your words dissolve into particles that drift up into the thread while the send button folds into Stop; the reply shows a shimmering Thinking, then streams in word by word. Enter sends, Shift+Enter adds a line, Escape stops the reply. Until you touch it, it types and sends suggestions on its own, opening the + menu now and then. Pass onSend to stream your own replies. Also includes Orb Composer, an AI prompt box with a model menu that grows out of its pill, a live voice waveform, web search, chips that fly up into the message and a glass orb that thinks before the reply writes itself in.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { AIComposer } from "@/components/ai-composer/ai-composer";`. The props are typed and documented in the code.

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

# Orb Composer

Add the "Orb Composer" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { OrbComposer } from "@/components/ai-composer/orb-composer";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/ai-composer/orb-composer.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import {
  type ChangeEvent,
  type ReactNode,
  forwardRef,
  type DragEvent,
  type KeyboardEvent as RKeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ComposerModel = {
  id: string;
  name: string;
  note: string;
  icon: "quick" | "balanced" | "deep";
};
export type ComposerFile = {
  id: string;
  name: string;
  size: number;
  kind: "pdf" | "image" | "doc" | "link";
};
export type OrbComposerProps = {
  placeholder?: string;
  models?: ComposerModel[];
  suggestions?: string[];
  /** your model call: resolve with the reply's text. Leave out for a canned reply. */
  onSend?: (message: { text: string; files: ComposerFile[]; model: string; web: boolean }) => Promise<string> | string;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  plus: "M228 128a12 12 0 0 1-12 12h-76v76a12 12 0 0 1-24 0v-76H40a12 12 0 0 1 0-24h76V40a12 12 0 0 1 24 0v76h76a12 12 0 0 1 12 12",
  clip: "m212.48 136.49l-82.06 82a60 60 0 0 1-84.85-84.88l98.16-97.89a40 40 0 0 1 56.56 56.59l-.17.16l-95.8 92.22a12 12 0 1 1-16.64-17.3l95.71-92.12a16 16 0 0 0-22.7-22.56l-98.16 97.86a36 36 0 0 0 50.93 50.91l82.06-82a12 12 0 0 1 17 17Z",
  image:
    "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-60 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m60 112H40v-39.31l46.34-46.35a8 8 0 0 1 11.32 0L165 181.66a8 8 0 0 0 11.32-11.32l-17.66-17.65L173 138.34a8 8 0 0 1 11.31 0L216 170.07z",
  link: "M117.18 188.74a12 12 0 0 1 0 17l-5.12 5.12A58.26 58.26 0 0 1 70.6 228a58.62 58.62 0 0 1-41.46-100.08l34.75-34.75a58.64 58.64 0 0 1 98.56 28.11a12 12 0 1 1-23.37 5.44a34.65 34.65 0 0 0-58.22-16.58l-34.75 34.75A34.62 34.62 0 0 0 70.57 204a34.4 34.4 0 0 0 24.49-10.14l5.11-5.12a12 12 0 0 1 17.01 0M226.83 45.17a58.65 58.65 0 0 0-82.93 0l-5.11 5.11a12 12 0 0 0 17 17l5.12-5.12a34.63 34.63 0 1 1 49 49l-34.81 34.7A34.4 34.4 0 0 1 150.61 156a34.63 34.63 0 0 1-33.69-26.72a12 12 0 0 0-23.38 5.44A58.64 58.64 0 0 0 150.56 180h.05a58.28 58.28 0 0 0 41.47-17.17l34.75-34.75a58.62 58.62 0 0 0 0-82.91",
  mic: "M80 128V64a48 48 0 0 1 96 0v64a48 48 0 0 1-96 0m128 0a8 8 0 0 0-16 0a64 64 0 0 1-128 0a8 8 0 0 0-16 0a80.11 80.11 0 0 0 72 79.6V240a8 8 0 0 0 16 0v-32.4a80.11 80.11 0 0 0 72-79.6",
  up: "M208.49 120.49a12 12 0 0 1-17 0L140 69v147a12 12 0 0 1-24 0V69l-51.51 51.49a12 12 0 0 1-17-17l72-72a12 12 0 0 1 17 0l72 72a12 12 0 0 1 0 17",
  stop: "M216 56v144a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16",
  globe:
    "M128 20a108 108 0 1 0 108 108A108.12 108.12 0 0 0 128 20m83.13 96h-31.57a144.3 144.3 0 0 0-21.35-66.36A84.22 84.22 0 0 1 211.13 116M128 207c-9.36-10.81-24.46-33.13-27.45-67h54.94a119.74 119.74 0 0 1-17.11 52.77A108.6 108.6 0 0 1 128 207m-27.45-91a119.74 119.74 0 0 1 17.11-52.77A108.6 108.6 0 0 1 128 49c9.36 10.81 24.46 33.13 27.45 67Zm-2.76-66.36A144.3 144.3 0 0 0 76.44 116H44.87a84.22 84.22 0 0 1 52.92-66.36M44.87 140h31.57a144.3 144.3 0 0 0 21.35 66.36A84.22 84.22 0 0 1 44.87 140m113.34 66.36A144.3 144.3 0 0 0 179.56 140h31.57a84.22 84.22 0 0 1-52.92 66.36",
  caret: "m216.49 104.49l-80 80a12 12 0 0 1-17 0l-80-80a12 12 0 0 1 17-17L128 159l71.51-71.52a12 12 0 0 1 17 17Z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  x: "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
  pdf: "M44 120h168a4 4 0 0 0 4-4V88a8 8 0 0 0-2.34-5.66l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v76a4 4 0 0 0 4 4m108-76l44 44h-44Zm72 108.53a8.18 8.18 0 0 1-8.25 7.47H192v16h15.73a8.17 8.17 0 0 1 8.25 7.47a8 8 0 0 1-8 8.53H192v15.73a8.17 8.17 0 0 1-7.47 8.25a8 8 0 0 1-8.53-8V152a8 8 0 0 1 8-8h32a8 8 0 0 1 8 8.53M64 144H48a8 8 0 0 0-8 8v55.73a8.17 8.17 0 0 0 7.47 8.27a8 8 0 0 0 8.53-8v-8h7.4c15.24 0 28.14-11.92 28.59-27.15A28 28 0 0 0 64 144m-.35 40H56v-24h8a12 12 0 0 1 12 13.16A12.25 12.25 0 0 1 63.65 184M128 144h-16a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8h15.32c19.66 0 36.21-15.48 36.67-35.13A36 36 0 0 0 128 144m-.49 56H120v-40h8a20 20 0 0 1 20 20.77c-.42 10.82-9.66 19.23-20.49 19.23",
  doc: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 176H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m0-32H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m-8-56V44l44 44Z",
  quick:
    "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
  balanced:
    "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24M40 128a88.1 88.1 0 0 1 88-88v176a88.1 88.1 0 0 1-88-88",
  deep: "M212 76v-4a44 44 0 0 0-74.86-31.31a3.93 3.93 0 0 0-1.14 2.8v88.72a4 4 0 0 0 6.2 3.33a47.67 47.67 0 0 1 25.48-7.54a8.18 8.18 0 0 1 8.31 7.58a8 8 0 0 1-8 8.42a32 32 0 0 0-32 32v33.88a4 4 0 0 0 1.49 3.12a47.92 47.92 0 0 0 74.21-17.16a4 4 0 0 0-4.49-5.56A68 68 0 0 1 192 192h-7.73a8.18 8.18 0 0 1-8.25-7.47a8 8 0 0 1 8-8.53h8a51.6 51.6 0 0 0 24-5.88A52 52 0 0 0 212 76m-12 36h-4a36 36 0 0 1-36-36v-4a8 8 0 0 1 16 0v4a20 20 0 0 0 20 20h4a8 8 0 0 1 0 16M88 28a44.05 44.05 0 0 0-44 44v4a52 52 0 0 0-4 94.12A51.6 51.6 0 0 0 64 176h7.73a8.18 8.18 0 0 1 8.27 7.47a8 8 0 0 1-8 8.53h-8a67.5 67.5 0 0 1-15.21-1.73a4 4 0 0 0-4.5 5.55A47.93 47.93 0 0 0 118.51 213a4 4 0 0 0 1.49-3.12V176a32 32 0 0 0-32-32a8 8 0 0 1-8-8.42a8.18 8.18 0 0 1 8.32-7.58a47.67 47.67 0 0 1 25.48 7.54a4 4 0 0 0 6.2-3.33V43.49a4 4 0 0 0-1.14-2.81A43.85 43.85 0 0 0 88 28m8 48a36 36 0 0 1-36 36h-4a8 8 0 0 1 0-16h4a20 20 0 0 0 20-20v-4a8 8 0 0 1 16 0Z",
  copy: "M216 28H88a12 12 0 0 0-12 12v36H40a12 12 0 0 0-12 12v128a12 12 0 0 0 12 12h128a12 12 0 0 0 12-12v-36h36a12 12 0 0 0 12-12V40a12 12 0 0 0-12-12m-60 176H52V100h104Zm48-48h-24V88a12 12 0 0 0-12-12h-68V52h104Z",
  again:
    "M228 48v48a12 12 0 0 1-12 12h-48a12 12 0 0 1 0-24h19l-7.8-7.8a75.55 75.55 0 0 0-53.32-22.26h-.43a75.5 75.5 0 0 0-53.06 21.63a12 12 0 1 1-16.78-17.16a99.38 99.38 0 0 1 69.87-28.47h.52a99.42 99.42 0 0 1 70.2 29.29L204 67V48a12 12 0 0 1 24 0m-44.39 132.43a75.5 75.5 0 0 1-53.09 21.63h-.43a75.55 75.55 0 0 1-53.32-22.26L69 172h19a12 12 0 0 0 0-24H40a12 12 0 0 0-12 12v48a12 12 0 0 0 24 0v-19l7.8 7.8a99.42 99.42 0 0 0 70.2 29.26h.56a99.38 99.38 0 0 0 69.87-28.47a12 12 0 0 0-16.78-17.16Z",
  good: "M237 77.47A28 28 0 0 0 216 68h-52V56a44.05 44.05 0 0 0-44-44a12 12 0 0 0-10.73 6.63L72.58 92H32a20 20 0 0 0-20 20v88a20 20 0 0 0 20 20h172a28 28 0 0 0 27.78-24.53l12-96a28 28 0 0 0-6.78-22M36 116h32v80H36Zm184-19.5l-12 96a4 4 0 0 1-4 3.5H92v-89.17l34.82-69.63A20 20 0 0 1 140 56v24a12 12 0 0 0 12 12h64a4 4 0 0 1 4 4.5",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const MODELS: ComposerModel[] = [
  {
    id: "quick",
    name: "Quick",
    note: "Fast answers for everyday things",
    icon: "quick",
  },
  {
    id: "balanced",
    name: "Balanced",
    note: "Careful and still quick",
    icon: "balanced",
  },
  {
    id: "deep",
    name: "Deep think",
    note: "Takes its time on hard problems",
    icon: "deep",
  },
];
const SUGGESTIONS = [
  "Summarise the attached brief in five bullets",
  "Draft a launch email for the new pricing",
  "Find three risks in this rollout plan",
];
const DEMO_FILES: ComposerFile[] = [
  { id: "f1", name: "Q4 brief.pdf", size: 482000, kind: "pdf" },
  { id: "f2", name: "pricing-hero.png", size: 1260000, kind: "image" },
];
const REPLY =
  "Here's the short version. The brief asks for one clear pricing story across the site by mid-December. Three things matter most: a single headline price on the hero, the annual discount shown as months free rather than a percentage, and a comparison table that fits on a phone. The riskiest part is the migration for existing teams, so I'd ship that behind a banner a week early and watch support volume before the full switch.";

const fileKind = (f: File): ComposerFile["kind"] =>
  f.type.startsWith("image/") ? "image" : f.type === "application/pdf" || f.name.endsWith(".pdf") ? "pdf" : "doc";
const size = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const KIND_COL: Record<ComposerFile["kind"], string> = {
  pdf: "#ff3b30",
  image: "#0071e3",
  doc: "#5e5ce6",
  link: "#30d158",
};

type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  files?: ComposerFile[];
  state?: "thinking" | "writing" | "done" | "stopped";
  secs?: number;
};

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/**
 * The box you talk to an AI through, and the first reply.
 *
 * Attach files with the plus, or drop them anywhere on the composer (it lights up to take them); each arrives as a
 * chip. Pick a model from a menu that grows out of its pill, and turn web search on and off. The box grows with your
 * words. The microphone turns the box into a live waveform of your voice, and in browsers that can, writes what you
 * say into it. Send, and the chips fly up into your message while the send button turns into a stop button with a
 * ring running round it; a glass orb with light swirling inside quickens while it thinks, then the reply writes itself in, word by word. Enter sends, Shift and Enter
 * starts a new line.
 *   <OrbComposer onSend={async ({ text }) => (await api.chat(text)).reply} />
 */
export default function OrbComposer({
  placeholder = "Ask anything",
  models = MODELS,
  suggestions = SUGGESTIONS,
  onSend,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: OrbComposerProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<ComposerFile[]>([]);
  const [model, setModel] = useState(models[1]?.id ?? models[0].id);
  const [web, setWeb] = useState(false);
  const [menu, setMenu] = useState<null | "model" | "add">(null);
  const [drag, setDrag] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState<null | { live: boolean }>(null);
  const [taH, setTaH] = useState(24);
  const stopRef = useRef(false);
  const M = models.find((m) => m.id === model) ?? models[0];

  const touch = () => {
    touched.current = true;
  };

  // the box grows with the words, up to six lines
  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    const h = Math.min(6 * 22 + 2, Math.max(24, ta.scrollHeight));
    ta.style.height = "";
    setTaH(h);
  }, [text]);

  // keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el)
      el.scrollTo({
        top: el.scrollHeight,
        behavior: reduce ? "auto" : "smooth",
      });
  }, [msgs, reduce]);

  // close a menu on a click elsewhere or Escape
  useEffect(() => {
    if (!menu) return;
    const off = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.(`[data-menu="${uid}"]`)) setMenu(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("pointerdown", off);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", off);
      window.removeEventListener("keydown", esc);
    };
  }, [menu, uid]);

  const addFiles = (fs: ComposerFile[]) => {
    if (!fs.length) return;
    setFiles((cur) => [...cur, ...fs.filter((f) => !cur.some((c) => c.name === f.name))].slice(0, 6));
    fs.forEach((_, i) =>
      sfx.note(880 + i * 120, {
        dur: 0.16,
        gain: 0.05,
        at: i * 0.07,
        bell: 0.4,
      }),
    );
  };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    addFiles(
      list.map((f, i) => ({
        id: `${f.name}-${Date.now()}-${i}`,
        name: f.name,
        size: f.size,
        kind: fileKind(f),
      })),
    );
    e.target.value = "";
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    touch();
    const list = Array.from(e.dataTransfer.files ?? []);
    addFiles(
      list.map((f, i) => ({
        id: `${f.name}-${Date.now()}-${i}`,
        name: f.name,
        size: f.size,
        kind: fileKind(f),
      })),
    );
  };

  // ------------------------------------------------------------ sending, and the reply
  const send = async (override?: string) => {
    const body = (override ?? text).trim();
    if (busy) {
      stopRef.current = true;
      return;
    }
    if (!body && !files.length) return;
    const sent = files;
    const id = `${Date.now()}`;
    setMsgs((m) => [
      ...m.slice(-4),
      { id: `u${id}`, role: "user", text: body, files: sent },
      { id: `a${id}`, role: "ai", text: "", state: "thinking" },
    ]);
    setText("");
    setFiles([]);
    setBusy(true);
    stopRef.current = false;
    sfx.whoosh(600, 2200, { dur: 0.3, gain: 0.05 });
    sfx.note(988, { dur: 0.2, gain: 0.05, at: 0.05 });
    const t0 = performance.now();
    let reply = REPLY;
    try {
      const r = onSend ? await onSend({ text: body, files: sent, model, web }) : null;
      if (r) reply = r;
    } catch {
      reply = "That didn't go through. Check your connection and send it again.";
    }
    // think for a moment, longer for the deeper model
    const think = model === "deep" ? 2600 : model === "quick" ? 900 : 1700;
    const wait = Math.max(0, think - (performance.now() - t0));
    await new Promise((r) => setTimeout(r, reduce ? 0 : wait));
    const secs = Math.max(1, Math.round((performance.now() - t0) / 1000));
    const words = reply.split(/(\s+)/);
    let out = "";
    setMsgs((m) => m.map((x) => (x.id === `a${id}` ? { ...x, state: "writing", secs } : x)));
    for (let i = 0; i < words.length; i += 2) {
      if (stopRef.current) break;
      out += words[i] + (words[i + 1] ?? "");
      const now = out;
      setMsgs((m) => m.map((x) => (x.id === `a${id}` ? { ...x, text: now } : x)));
      if (!reduce) await new Promise((r) => setTimeout(r, 34 + Math.random() * 46));
    }
    const stopped = stopRef.current;
    setMsgs((m) =>
      m.map((x) =>
        x.id === `a${id}`
          ? {
              ...x,
              text: reduce && !stopped ? reply : x.text,
              state: stopped ? "stopped" : "done",
            }
          : x,
      ),
    );
    setBusy(false);
    if (!stopped) sfx.note(1319, { dur: 0.35, gain: 0.04, bell: 0.5 });
  };

  // ------------------------------------------------------------ the microphone
  const levels = useRef<Float32Array>(new Float32Array(48));
  const micStop = useRef<() => void>(() => {});
  const startMic = async (simulated = false) => {
    setMenu(null);
    const bars = levels.current;
    let raf = 0;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let rec2: SpeechRec | null = null;
    let analyser: AnalyserNode | null = null;
    if (!simulated && navigator.mediaDevices?.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = new AudioContext();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
      } catch {
        stream = null;
      }
    }
    if (!stream && !simulated) {
      setRec(null);
      setNote("The microphone isn't available here.");
      return;
    }
    const W = window as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    const before = text;
    if (stream && SR) {
      try {
        rec2 = new SR();
        rec2.continuous = true;
        rec2.interimResults = true;
        rec2.lang = navigator.language || "en-US";
        rec2.onresult = (e) => {
          let said = "";
          for (let i = 0; i < e.results.length; i++) said += e.results[i][0].transcript;
          setText((before ? before + " " : "") + said.trim());
        };
        rec2.start();
      } catch {
        rec2 = null;
      }
    }
    setRec({ live: !!stream });
    sfx.note(660, { dur: 0.18, gain: 0.05 });
    sfx.note(990, { dur: 0.22, gain: 0.05, at: 0.08 });
    const buf = new Uint8Array(128);
    let t = 0;
    const tick = () => {
      t += 1 / 60;
      let lvl: number;
      if (analyser) {
        analyser.getByteTimeDomainData(buf);
        let s = 0;
        for (let i = 0; i < buf.length; i++) s += ((buf[i] - 128) / 128) ** 2;
        lvl = Math.min(1, Math.sqrt(s / buf.length) * 5);
      } else {
        // the demo's voice: syllables in bursts with pauses between words
        const word = Math.max(0, Math.sin(t * 2.3)) ** 0.6;
        lvl = word * (0.35 + 0.65 * Math.abs(Math.sin(t * 13.7) * Math.sin(t * 7.1 + 1)));
      }
      bars.copyWithin(0, 1);
      bars[bars.length - 1] = lvl;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    micStop.current = () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
      void ctx?.close();
      rec2?.stop();
      bars.fill(0);
      setRec(null);
      sfx.note(990, { dur: 0.16, gain: 0.05 });
      sfx.note(660, { dur: 0.2, gain: 0.05, at: 0.07 });
      setTimeout(() => taRef.current?.focus(), 50);
    };
  };
  useEffect(() => () => micStop.current(), []);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 2600);
    return () => clearTimeout(t);
  }, [note]);

  // ------------------------------------------------------------ autoplay
  const typeInto = async (s: string, alive: () => boolean) => {
    for (let i = 1; i <= s.length; i++) {
      if (!alive()) return;
      setText(s.slice(0, i));
      if (i % 3 === 0) sfx.tick({ freq: 3200, gain: 0.015 });
      await new Promise((r) => setTimeout(r, 26 + Math.random() * 30));
    }
  };
  const ap = useRef({
    typeInto,
    addFiles,
    setMenu,
    setModel,
    setWeb,
    send,
    startMic,
    stopMic: () => micStop.current(),
    reset: () => {},
  });
  ap.current = {
    typeInto,
    addFiles,
    setMenu,
    setModel,
    setWeb,
    send,
    startMic,
    stopMic: () => micStop.current(),
    reset: () => {
      setMsgs([]);
      setText("");
      setFiles([]);
      setModel(models[1]?.id ?? models[0].id);
      setWeb(false);
    },
  };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await sleep(1200);
        if (!ok()) break;
        ap.current.addFiles([{ ...DEMO_FILES[0], id: `d1${Date.now()}` }]);
        await sleep(500);
        if (!ok()) break;
        await ap.current.typeInto(suggestions[0], ok);
        await sleep(500);
        if (!ok()) break;
        ap.current.setMenu("model");
        await sleep(900);
        if (!ok()) break;
        ap.current.setModel(models[2]?.id ?? models[0].id);
        await sleep(450);
        ap.current.setMenu(null);
        await sleep(500);
        if (!ok()) break;
        ap.current.setWeb(true);
        await sleep(700);
        if (!ok()) break;
        await ap.current.send();
        await sleep(1800);
        if (!ok()) break;
        await ap.current.startMic(true);
        await ap.current.typeInto("Make it shorter and friendlier", ok);
        await sleep(900);
        ap.current.stopMic();
        await sleep(1600);
        if (!ok()) break;
        ap.current.reset();
        await sleep(600);
      }
    })();
    return () => {
      alive = false;
      micStop.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const onKey = (e: RKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  };
  const canSend = busy || !!text.trim() || files.length > 0;
  const empty = msgs.length === 0;

  return (
    <LayoutGroup id={uid}>
      <div
        ref={rootRef}
        onPointerDownCapture={touch}
        onKeyDownCapture={touch}
        onDragEnter={(e) => {
          if (Array.from(e.dataTransfer.types).includes("Files")) {
            e.preventDefault();
            setDrag(true);
          }
        }}
        onDragOver={(e) => {
          if (drag) e.preventDefault();
        }}
        onDragLeave={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node)) setDrag(false);
        }}
        onDrop={onDrop}
        className={`relative flex w-full max-w-[640px] flex-col overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.35)] ${className}`}
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
        }}
      >
        {/* the conversation */}
        <div
          ref={scrollRef}
          className="relative h-[340px] overflow-y-auto overscroll-contain px-4 pt-5 sm:px-6"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, #000 18px, #000 calc(100% - 18px), transparent)",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {empty ? (
              <motion.div
                key="hello"
                className="flex h-full flex-col items-center justify-center pb-6 text-center"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -12,
                  filter: "blur(4px)",
                  transition: { duration: 0.25 },
                }}
              >
                <Orb busy={false} reduce={reduce} size={40} />
                <p className="mt-4 text-[22px] font-semibold tracking-[-0.025em]">What are we working on?</p>
                <div className="mt-5 flex max-w-[480px] flex-wrap justify-center gap-2">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      onClick={() => {
                        setText(s);
                        taRef.current?.focus();
                      }}
                      className="rounded-full bg-[#f5f5f7] px-3.5 py-2 text-[13px] text-[#1d1d1f] outline-none transition-colors hover:bg-[#ececef] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: reduce ? 0 : 0.08 + i * 0.06,
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="thread" className="flex flex-col gap-5 pb-4" initial={false} aria-live="polite">
                {msgs.map((m) =>
                  m.role === "user" ? (
                    <motion.div
                      key={m.id}
                      className="flex flex-col items-end gap-2"
                      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 340,
                        damping: 30,
                      }}
                      style={{ originX: 1, originY: 1 }}
                    >
                      {!!m.files?.length && (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {m.files.map((f) => (
                            <Chip key={f.id} f={f} layoutId={`${uid}-f-${f.id}`} reduce={reduce} />
                          ))}
                        </div>
                      )}
                      {m.text && (
                        <div className="max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-br-[6px] bg-[#f0f0f3] px-4 py-2.5 text-[14.5px] leading-[1.45]">
                          {m.text}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <Reply key={m.id} m={m} reduce={reduce} model={M.name} />
                  ),
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* the composer */}
        <div className="relative px-3 pb-3 sm:px-4 sm:pb-4">
          <motion.div
            className="relative rounded-[24px] bg-white"
            animate={{
              boxShadow: drag
                ? "0 0 0 2px #0071e3, 0 0 0 6px rgba(0,113,227,.15), 0 16px 36px -18px rgba(0,113,227,.6)"
                : rec
                  ? "0 0 0 1.5px rgba(255,59,48,.55), 0 0 0 5px rgba(255,59,48,.10), 0 14px 30px -18px rgba(0,0,0,.4)"
                  : "0 0 0 1px rgba(0,0,0,.09), 0 1px 0 rgba(255,255,255,1) inset, 0 14px 30px -20px rgba(0,0,0,.35)",
            }}
            transition={{ duration: 0.25 }}
          >
            {/* attachments */}
            <AnimatePresence initial={false}>
              {files.length > 0 && (
                <motion.div
                  className="overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 38 }}
                >
                  <div className="flex flex-wrap gap-1.5 px-3 pt-3">
                    <AnimatePresence initial={false} mode="popLayout">
                      {files.map((f) => (
                        <Chip
                          key={f.id}
                          f={f}
                          layoutId={`${uid}-f-${f.id}`}
                          reduce={reduce}
                          onRemove={() => setFiles((c) => c.filter((x) => x.id !== f.id))}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* the words, or the voice */}
            <div className="relative px-4 pt-3">
              <motion.div
                animate={{ height: taH }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                className="relative"
              >
                <textarea
                  ref={taRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={onKey}
                  rows={1}
                  aria-label="Message"
                  placeholder={placeholder}
                  className={`block h-full w-full resize-none bg-transparent text-[15px] leading-[22px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] ${rec ? "opacity-0" : ""}`}
                />
                <AnimatePresence>
                  {rec && (
                    <motion.div
                      className="absolute inset-0 flex items-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Wave levels={levels.current} reduce={reduce} />
                      {text && (
                        <span className="min-w-0 max-w-[45%] truncate text-[13.5px] text-[#424245]">{text}</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* the tools */}
            <div className="flex items-center gap-1.5 px-2.5 pb-2.5 pt-2">
              <div className="relative" data-menu={uid}>
                <button
                  type="button"
                  aria-label="Attach"
                  aria-expanded={menu === "add"}
                  onClick={() => setMenu((m) => (m === "add" ? null : "add"))}
                  className="grid h-9 w-9 place-items-center rounded-full text-[#1d1d1f] outline-none transition hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                >
                  <motion.span
                    animate={{ rotate: menu === "add" ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                  >
                    <Ico d={I.plus} size={17} />
                  </motion.span>
                </button>
                <Pop open={menu === "add"} reduce={reduce} originX={0}>
                  {[
                    {
                      label: "Upload a file",
                      icon: I.clip,
                      act: () => fileRef.current?.click(),
                    },
                    {
                      label: "Add a photo",
                      icon: I.image,
                      act: () => addFiles([{ ...DEMO_FILES[1], id: `p${Date.now()}` }]),
                    },
                    {
                      label: "Paste a link",
                      icon: I.link,
                      act: () =>
                        addFiles([
                          {
                            id: `l${Date.now()}`,
                            name: "nexus-ui.com/pricing",
                            size: 0,
                            kind: "link",
                          },
                        ]),
                    },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        o.act();
                        setMenu(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left text-[13.5px] outline-none hover:bg-black/[0.05] focus-visible:bg-black/[0.05]"
                    >
                      <span className="text-[#6e6e73]">
                        <Ico d={o.icon} size={16} />
                      </span>
                      {o.label}
                    </button>
                  ))}
                </Pop>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={onPick} />
              </div>

              <div className="relative" data-menu={uid}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={menu === "model"}
                  onClick={() => setMenu((m) => (m === "model" ? null : "model"))}
                  className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#1d1d1f] outline-none transition hover:bg-black/[0.05] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                >
                  <span className="text-[#6e6e73]">
                    <Ico d={I[M.icon]} size={14} />
                  </span>
                  <span className="relative overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={M.id}
                        className="block whitespace-nowrap"
                        initial={reduce ? false : { y: 14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -14, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 34,
                        }}
                      >
                        {M.name}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <motion.span className="text-[#86868b]" animate={{ rotate: menu === "model" ? 180 : 0 }}>
                    <Ico d={I.caret} size={10} />
                  </motion.span>
                </button>
                <Pop open={menu === "model"} reduce={reduce} originX={0.2} wide>
                  <div role="listbox" aria-label="Model">
                    {models.map((m) => {
                      const on = m.id === model;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="option"
                          aria-selected={on}
                          onClick={() => {
                            setModel(m.id);
                            setMenu(null);
                            sfx.tick({ freq: 2400, gain: 0.04 });
                          }}
                          className="relative flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50"
                        >
                          {on && (
                            <motion.span
                              layoutId={`${uid}-msel`}
                              className="absolute inset-0 rounded-[12px] bg-black/[0.05]"
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 38,
                              }}
                            />
                          )}
                          <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#f5f5f7] text-[#1d1d1f]">
                            <Ico d={I[m.icon]} size={15} />
                          </span>
                          <span className="relative min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium">{m.name}</span>
                            <span className="block truncate text-[12px] text-[#6e6e73]">{m.note}</span>
                          </span>
                          <span className="relative w-4 text-[#0071e3]">{on && <Ico d={I.check} size={14} />}</span>
                        </button>
                      );
                    })}
                  </div>
                </Pop>
              </div>

              <button
                type="button"
                aria-pressed={web}
                aria-label="Search the web"
                onClick={() => {
                  setWeb((w) => !w);
                  sfx.tick({ freq: web ? 1800 : 2800, gain: 0.05 });
                }}
                className={`relative flex h-9 items-center gap-1.5 overflow-hidden rounded-full px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${web ? "bg-[#0071e3]/10 text-[#0066cc]" : "text-[#6e6e73] hover:bg-black/[0.05]"}`}
              >
                <motion.span
                  animate={web && !reduce ? { rotate: [0, 360] } : { rotate: 0 }}
                  transition={{ duration: 0.7, ease: [0.3, 0, 0.2, 1] }}
                >
                  <Ico d={I.globe} size={14} />
                </motion.span>
                <span className="hidden sm:inline">Search</span>
              </button>

              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={rec ? "Stop dictating" : "Dictate"}
                  aria-pressed={!!rec}
                  onClick={() => (rec ? micStop.current() : void startMic())}
                  className={`grid h-9 w-9 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${rec ? "bg-[#ff3b30] text-white" : "text-[#1d1d1f] hover:bg-black/[0.05]"}`}
                >
                  {rec ? <span className="h-2.5 w-2.5 rounded-[3px] bg-white" /> : <Ico d={I.mic} size={16} />}
                </button>
                <motion.button
                  type="button"
                  aria-label={busy ? "Stop" : "Send"}
                  disabled={!canSend}
                  onClick={() => void send()}
                  className="relative grid h-9 w-9 place-items-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 focus-visible:ring-offset-2"
                  animate={{
                    backgroundColor: !canSend ? "#d2d2d7" : busy ? "#1d1d1f" : "#0071e3",
                    scale: 1,
                  }}
                  whileTap={reduce || !canSend ? undefined : { scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {busy && !reduce && (
                    <motion.svg
                      className="absolute -inset-[3px]"
                      viewBox="0 0 42 42"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      aria-hidden="true"
                    >
                      <circle
                        cx="21"
                        cy="21"
                        r="19.5"
                        fill="none"
                        stroke="#0071e3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="30 100"
                      />
                    </motion.svg>
                  )}
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={busy ? "stop" : "up"}
                      initial={reduce ? false : { scale: 0.3, rotate: busy ? -90 : 90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.3, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 28,
                      }}
                    >
                      <Ico d={busy ? I.stop : I.up} size={busy ? 13 : 16} />
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {drag && (
                <motion.div
                  className="pointer-events-none absolute inset-0 grid place-items-center rounded-[24px] bg-[#0071e3]/[0.06] backdrop-blur-[2px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-medium text-[#0066cc] shadow-[0_6px_18px_-8px_rgba(0,113,227,.6)]">
                    <Ico d={I.clip} size={14} /> Drop to attach
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>
            {note && (
              <motion.p
                role="status"
                className="absolute inset-x-0 -top-7 text-center text-[12.5px] text-[#6e6e73]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {note}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  );
}

// ---------------------------------------------------------------- pieces

function Pop({
  open,
  reduce,
  originX,
  wide,
  children,
}: {
  open: boolean;
  reduce: boolean;
  originX: number;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          className={`absolute bottom-[calc(100%+10px)] left-0 z-40 rounded-[16px] bg-white/95 p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.07),0_22px_44px_-18px_rgba(0,0,0,.4)] backdrop-blur-xl ${wide ? "w-[268px]" : "w-[200px]"}`}
          style={{ originX, originY: 1 }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 4, filter: "blur(2px)" }}
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 34,
            filter: { duration: 0.18 },
            opacity: { duration: 0.14 },
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// a ref, so AnimatePresence's popLayout can measure it on the way out
const Chip = forwardRef<HTMLDivElement, { f: ComposerFile; layoutId: string; reduce: boolean; onRemove?: () => void }>(
  function Chip({ f, layoutId, reduce, onRemove }, ref) {
    const col = KIND_COL[f.kind];
    return (
      <motion.div
        ref={ref}
        layoutId={reduce ? undefined : layoutId}
        className="group relative flex h-11 max-w-[220px] items-center gap-2.5 rounded-[14px] bg-[#f5f5f7] pl-1.5 pr-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)]"
        initial={reduce ? false : { opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        style={{ borderRadius: 14 }}
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-white"
          style={{
            background: `linear-gradient(160deg, ${col}cc, ${col})`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)",
          }}
        >
          <Ico
            d={f.kind === "pdf" ? I.pdf : f.kind === "image" ? I.image : f.kind === "link" ? I.link : I.doc}
            size={15}
          />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-medium leading-tight text-[#1d1d1f]">{f.name}</span>
          <span className="block text-[11px] leading-tight text-[#86868b]">
            {f.kind === "link"
              ? "Link"
              : `${f.kind === "pdf" ? "PDF" : f.kind === "image" ? "Image" : "File"} · ${size(f.size)}`}
          </span>
        </span>
        {onRemove && (
          <button
            type="button"
            aria-label={`Remove ${f.name}`}
            onClick={onRemove}
            className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#1d1d1f] text-white opacity-0 shadow-[0_0_0_2px_#fff] outline-none transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Ico d={I.x} size={9} />
          </button>
        )}
      </motion.div>
    );
  },
);

// ---------------------------------------------------------------- the orb

// a tileable cloud texture, made once and shared by every orb on the page
const NT = 128;
let NOISE: Float32Array | null = null;
function noiseTex() {
  if (NOISE) return NOISE;
  let seed = 9;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const out = new Float32Array(NT * NT);
  let amp = 1;
  for (const per of [4, 8, 16, 32, 64]) {
    const lat = new Float32Array(per * per).map(() => rnd());
    for (let y = 0; y < NT; y++)
      for (let x = 0; x < NT; x++) {
        const fx = (x / NT) * per;
        const fy = (y / NT) * per;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        let tx = fx - ix;
        let ty = fy - iy;
        tx = tx * tx * (3 - 2 * tx);
        ty = ty * ty * (3 - 2 * ty);
        const a = lat[iy * per + ix];
        const b = lat[iy * per + ((ix + 1) % per)];
        const c = lat[((iy + 1) % per) * per + ix];
        const d = lat[((iy + 1) % per) * per + ((ix + 1) % per)];
        out[y * NT + x] += (a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty) * amp;
      }
    amp *= 0.52;
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of out) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - lo) / (hi - lo);
  NOISE = out;
  return out;
}
const samp = (T: Float32Array, u: number, v: number) => {
  const fu = Math.floor(u);
  const fv = Math.floor(v);
  const tu = u - fu;
  const tv = v - fv;
  const x0 = ((fu % NT) + NT) % NT;
  const y0 = ((fv % NT) + NT) % NT;
  const x1 = (x0 + 1) % NT;
  const y1 = (y0 + 1) % NT;
  const a = T[y0 * NT + x0];
  const b = T[y0 * NT + x1];
  const c = T[y1 * NT + x0];
  const d = T[y1 * NT + x1];
  return a + (b - a) * tu + (c - a) * tv + (a - b - c + d) * tu * tv;
};
/**
 * The assistant's orb: a small glass sphere with light moving inside it, drawn a pixel at a time.
 *
 * Inside, clouds of coloured light swirl, magnified toward the edge the way glass bends what's behind it, brightest
 * where the light pools at the bottom (a caustic) and thinnest at the rim. The glass has a bright Fresnel rim with a
 * faint oil-film sheen, a sharp reflection of a window up and to the left, a soft second glint below, and sits over a
 * contact shadow. While it works the swirl quickens and the core breathes.
 */
function Orb({ busy, reduce, size = 22 }: { busy: boolean; reduce: boolean; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLSpanElement>(null);
  const seen = useInView(wrap, { margin: "60px" });
  const busyRef = useRef(busy);
  busyRef.current = busy;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const T = noiseTex();
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const W = Math.max(16, Math.round(size * dpr));
    cv.width = W;
    cv.height = W;
    const img = ctx.createImageData(W, W);
    const px = img.data;
    let raf = 0;
    let t = Math.random() * 40;
    let speed = busyRef.current ? 1 : 0.35;
    let glow = busyRef.current ? 1 : 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const b = busyRef.current;
      speed += ((b ? 1 : 0.35) - speed) * Math.min(1, dt * 3);
      glow += ((b ? 1 : 0) - glow) * Math.min(1, dt * 3);
      if (!reduce) t += dt * speed;
      const breathe = 0.5 + 0.5 * Math.sin(now / 520);
      const rot = t * 0.9;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      for (let j = 0; j < W; j++) {
        const y = ((j + 0.5) / W) * 2 - 1;
        for (let i = 0; i < W; i++) {
          const x = ((i + 0.5) / W) * 2 - 1;
          const r2 = x * x + y * y;
          const o = (j * W + i) * 4;
          const r = Math.sqrt(r2);
          const edge = (1 - r) * W * 0.5 + 0.5; // antialiased silhouette
          if (edge <= 0) {
            px[o + 3] = 0;
            continue;
          }
          const z = Math.sqrt(Math.max(0, 1 - r2));
          // what's behind the glass, bent: magnified toward the rim, swirling faster near the middle
          const k = 1 / (0.42 + 0.58 * z);
          const sw = (1 - r) * 1.6;
          const cs = Math.cos(sw);
          const ss = Math.sin(sw);
          let qx = x * k;
          let qy = y * k;
          const ax = qx * cs - qy * ss;
          const ay = qx * ss + qy * cs;
          qx = ax * cr - ay * sr;
          qy = ax * sr + ay * cr;
          const u = qx * 34 + 64;
          const v = qy * 34 + 64;
          // domain-warped clouds
          const w1 = samp(T, u * 0.55 + t * 9, v * 0.55 + 17);
          const w2 = samp(T, u * 0.55 + 41, v * 0.55 - t * 7);
          const n = samp(T, u + (w1 - 0.5) * 52 + t * 5, v + (w2 - 0.5) * 52);
          // thin bright filaments where the clouds fold (ridged), over a dim haze deeper inside
          const ridge = 1 - Math.abs(2 * n - 1);
          const wisp = Math.pow(ridge, 5) * 1.7 + Math.pow(ridge, 14) * 1.4;
          const haze = Math.max(0, Math.min(1, (samp(T, x * 20 + 30 - t * 4, y * 20 + 90 + t * 3) - 0.3) * 1.7));
          // the filaments' colour drifts slowly between magenta, violet and a cold cyan
          const h = samp(T, u * 0.35 + 70 + t * 2, v * 0.35 + 10) * 2.2 + t * 0.08;
          // three inks, weighted round a slowly turning wheel: magenta, violet, cyan
          const k1 = Math.max(0, Math.cos(h * 2.4)) ** 2;
          const k2 = Math.max(0, Math.cos(h * 2.4 - 2.094)) ** 2;
          const k3 = Math.max(0, Math.cos(h * 2.4 + 2.094)) ** 2;
          const ks = k1 + k2 + k3 + 1e-4;
          const wr = (k1 * 1 + k2 * 0.52 + k3 * 0.22) / ks;
          const wg = (k1 * 0.28 + k2 * 0.32 + k3 * 0.86) / ks;
          const wb = (k1 * 0.78 + k2 * 1 + k3 * 1) / ks;
          // tiny sparks drifting in the depth
          const st = samp(T, x * 70 + 13 + t * 6, y * 70 + 57);
          const spark = st > 0.8 ? Math.pow((st - 0.8) * 5, 3) * (0.6 + 0.4 * Math.sin(now / 300 + st * 40)) : 0;
          // thicker glass at the middle holds more light; the inside is a deep ink
          const body = 0.35 + 0.75 * z;
          let R = (0.02 + haze * 0.14 + wisp * wr * 1.15) * body + spark * 0.9;
          let G = (0.012 + haze * 0.05 + wisp * wg * 1.15) * body + spark * 0.85;
          let B = (0.07 + haze * 0.32 + wisp * wb * 1.15) * body + spark;
          // a caustic: light focused through the sphere onto its lower inside
          const cx = x - 0.1;
          const cy = y - 0.55;
          const caus = Math.exp(-(cx * cx * 7 + cy * cy * 16)) * (0.3 + 0.22 * glow * breathe);
          R += caus * 0.7;
          G += caus * 0.55;
          B += caus * 1.0;
          // the core breathes while it works
          const core = Math.exp(-r2 * 4.2) * (0.05 + glow * (0.12 + 0.16 * breathe));
          R += core * 0.85;
          G += core * 0.8;
          B += core * 1.0;
          // a dark band just inside the rim gives the glass its thickness
          const band = Math.max(0, Math.min(1, (r - 0.8) / 0.12)) * Math.max(0, Math.min(1, (0.985 - r) / 0.04));
          R *= 1 - band * 0.35;
          G *= 1 - band * 0.35;
          B *= 1 - band * 0.3;
          // Fresnel rim, with a faint oil-film shift of hue round it
          const fr = Math.pow(1 - z, 3.2);
          const ang = Math.atan2(y, x);
          R += fr * (0.5 + 0.25 * Math.sin(ang * 2 + 0.5));
          G += fr * (0.58 + 0.25 * Math.sin(ang * 2 + 2.6));
          B += fr * (0.9 + 0.2 * Math.sin(ang * 2 + 4.7));
          // the window reflection up and to the left, sharp, and a soft sheen around it
          const sx = x + 0.36;
          const sy = y + 0.45;
          const spec = Math.exp(-(sx * sx * 30 + sy * sy * 48));
          const sheen = Math.exp(-(sx * sx * 4 + sy * sy * 6)) * 0.07;
          // a smaller, softer glint low on the right, where the room bounces back
          const gx = x - 0.42;
          const gy = y - 0.5;
          const glint = Math.exp(-(gx * gx * 60 + gy * gy * 60)) * 0.35;
          R += spec * 1.25 + sheen + glint;
          G += spec * 1.25 + sheen + glint;
          B += spec * 1.25 + sheen * 1.1 + glint;
          // filmic roll-off so the bright parts glow instead of clipping
          px[o] = 255 * (1 - Math.exp(-R * 1.35));
          px[o + 1] = 255 * (1 - Math.exp(-G * 1.35));
          px[o + 2] = 255 * (1 - Math.exp(-B * 1.35));
          px[o + 3] = 255 * Math.min(1, edge);
        }
      }
      ctx.putImageData(img, 0, 0);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    if (seen || reduce) raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size, reduce, seen]);

  return (
    <span ref={wrap} className="relative block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      {/* the light it throws around itself */}
      <motion.span
        className="absolute rounded-full"
        style={{
          inset: -size * 0.45,
          background: "radial-gradient(circle, rgba(140,92,255,.30), rgba(255,95,183,.10) 45%, rgba(140,92,255,0) 70%)",
          filter: `blur(${Math.max(3, size * 0.12)}px)`,
        }}
        animate={
          busy && !reduce ? { opacity: [0.55, 1, 0.55], scale: [0.92, 1.08, 0.92] } : { opacity: 0.55, scale: 1 }
        }
        transition={busy && !reduce ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.6 }}
      />
      {/* where it sits */}
      <span
        className="absolute left-1/2 rounded-full"
        style={{
          width: size * 0.8,
          height: size * 0.16,
          bottom: -size * 0.1,
          marginLeft: -size * 0.4,
          background: "radial-gradient(ellipse, rgba(40,20,90,.38), rgba(40,20,90,0) 70%)",
          filter: "blur(1.5px)",
        }}
      />
      <canvas ref={ref} className="relative block h-full w-full" />
    </span>
  );
}

function Reply({ m, reduce, model }: { m: Msg; reduce: boolean; model: string }) {
  const words = useMemo(() => m.text.split(/(\s+)/), [m.text]);
  const thinking = m.state === "thinking";
  return (
    <motion.div
      className="flex gap-3"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: reduce ? 0 : 0.12,
      }}
    >
      <div className="pt-0.5">
        <Orb busy={thinking || m.state === "writing"} reduce={reduce} />
      </div>
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {thinking ? (
            <motion.p
              key="t"
              className="text-[14px] font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(3px)" }}
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #86868b 0%, #86868b 40%, #1d1d1f 50%, #86868b 60%, #86868b 100%)",
                  backgroundSize: "250% 100%",
                  animation: reduce ? undefined : "aic-shimmer 1.6s linear infinite",
                }}
              >
                {model} is thinking
              </span>
              <style>{"@keyframes aic-shimmer{from{background-position:100% 0}to{background-position:-150% 0}}"}</style>
            </motion.p>
          ) : (
            <motion.div key="a" initial={false}>
              <p className="mb-1.5 text-[12px] text-[#86868b]">Thought for {m.secs ?? 1}s</p>
              <p className="text-[14.5px] leading-[1.6] text-[#1d1d1f]">
                {words.map((w, i) =>
                  /^\s+$/.test(w) ? (
                    w
                  ) : (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={reduce ? false : { opacity: 0, filter: "blur(6px)", y: 3 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {w}
                    </motion.span>
                  ),
                )}
                {m.state === "writing" && (
                  <motion.span
                    className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] rounded-full bg-[#0071e3]"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                )}
                {m.state === "stopped" && <span className="ml-1 text-[12.5px] text-[#86868b]">(stopped)</span>}
              </p>
              <AnimatePresence>
                {(m.state === "done" || m.state === "stopped") && (
                  <motion.div
                    className="mt-2 flex gap-0.5 text-[#86868b]"
                    initial={reduce ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {[
                      {
                        l: "Copy",
                        d: I.copy,
                        act: () => void navigator.clipboard?.writeText(m.text).catch(() => {}),
                      },
                      { l: "Good answer", d: I.good, act: () => {} },
                      { l: "Try again", d: I.again, act: () => {} },
                    ].map((b) => (
                      <button
                        key={b.l}
                        type="button"
                        aria-label={b.l}
                        onClick={b.act}
                        className="grid h-7 w-7 place-items-center rounded-full outline-none transition hover:bg-black/[0.05] hover:text-[#1d1d1f] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                      >
                        <Ico d={b.d} size={14} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/** the live voice: the latest levels as bars, newest on the right, mirrored about the middle */
function Wave({ levels, reduce }: { levels: Float32Array; reduce: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    const shown = new Float32Array(levels.length);
    const draw = () => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const n = levels.length;
      const step = w / n;
      for (let i = 0; i < n; i++) {
        shown[i] += (levels[i] - shown[i]) * (reduce ? 1 : 0.35);
        const bh = Math.max(3, shown[i] * (h - 2));
        const x = i * step + step / 2;
        // fade in from the left so old sound drifts away
        ctx.globalAlpha = 0.25 + 0.75 * (i / n);
        ctx.fillStyle = "#ff3b30";
        ctx.beginPath();
        ctx.roundRect(x - 1.25, h / 2 - bh / 2, 2.5, bh, 1.25);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [levels, reduce]);
  return <canvas ref={ref} aria-hidden="true" className="h-[24px] min-w-0 flex-1" />;
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```

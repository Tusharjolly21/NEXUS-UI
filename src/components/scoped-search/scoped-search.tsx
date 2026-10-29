"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type RefObject, type CSSProperties } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";

interface Msg { id: number; from: string; who: string; subject: string; preview: string; time: string; unread?: boolean; starred?: boolean; attachment?: boolean; archived?: boolean }
const MAIL: Msg[] = [
  { id: 1, from: "Anna Lee", who: "anna", subject: "Design review moved to Thursday", preview: "Same room, 2pm. Bring the onboarding flows.", time: "9:41", unread: true, starred: true },
  { id: 2, from: "Marcus Webb", who: "marcus", subject: "Invoice for October", preview: "Attached is the invoice for last month's work.", time: "9:12", attachment: true },
  { id: 3, from: "Anna Lee", who: "anna", subject: "Icons for the new tab bar", preview: "Here are three directions, I like the second.", time: "Yesterday", attachment: true, unread: true },
  { id: 4, from: "Priya Shah", who: "priya", subject: "Release notes draft", preview: "Can you check the wording on the design section?", time: "Yesterday", starred: true },
  { id: 5, from: "Leo Park", who: "leo", subject: "Lunch on Friday?", preview: "The new place on Fourth, around noon.", time: "Tue", unread: true },
  { id: 6, from: "Anna Lee", who: "anna", subject: "Old design tokens", preview: "Archiving these now that the new set is live.", time: "Mon", archived: true },
  { id: 7, from: "Priya Shah", who: "priya", subject: "Q4 roadmap", preview: "Final version with the design and eng dates.", time: "Mon", attachment: true },
];
const PEOPLE = [...new Map(MAIL.map((m) => [m.who, m.from])).entries()];
type Token = { key: "from" | "is" | "has" | "in"; value: string };
const TOKENS: { key: Token["key"]; values: string[]; hint: (v: string) => string }[] = [
  { key: "from", values: PEOPLE.map(([w]) => w), hint: (v) => PEOPLE.find(([w]) => w === v)?.[1] ?? v },
  { key: "is", values: ["unread", "starred"], hint: (v) => (v === "unread" ? "Unread" : "Starred") },
  { key: "has", values: ["attachment"], hint: () => "Has attachment" },
  { key: "in", values: ["archive"], hint: () => "In archive" },
];
const TINT: Record<Token["key"], string> = { from: "#0071e3", is: "#ff9f0a", has: "#30a14e", in: "#8e8e93" };
const SPRING = { type: "spring", stiffness: 520, damping: 38 } as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const label = (t: Token) => (t.key === "from" ? TOKENS[0].hint(t.value) : TOKENS.find((x) => x.key === t.key)!.hint(t.value));

/**
 * ScopedSearch: a mail search that understands filters as you type them. Write `from:anna`, `is:unread`, `has:attachment`
 * or `in:archive` and the moment it is complete the words lift out of the text and become a chip inside the field,
 * starting from exactly where you typed them. A menu offers matches as you go. Remove a chip by pressing it, by
 * pressing Backspace twice at the start of the field, or by dragging it out of the field. Results never blink: the ones
 * that stop matching fold away and the rest slide up.
 *
 * `items` replaces the demo mailbox. `autoplay` types searches until the first real interaction.
 */
export function ScopedSearch({ autoplay = false, items = MAIL }: { autoplay?: boolean; items?: Msg[] }) {
  const reduce = useReducedMotion();
  const [tokens, setTokens] = useState<(Token & { id: number; fromX: number })[]>([]);
  const [text, setText] = useState("");
  const [armed, setArmed] = useState(false); // Backspace pressed once at the start: the last chip is selected
  const [pick, setPick] = useState(0);
  const [focus, setFocus] = useState(false);
  const field = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const mirror = useRef<HTMLSpanElement>(null);
  const touched = useRef(false);
  const ids = useRef(1);
  const now = useRef({ text, tokens });
  now.current = { text, tokens };

  // the word being typed, and what it could become
  const word = text.split(" ").pop() ?? "";
  const suggestions = useMemo(() => {
    if (!word) return [];
    const [k, v = ""] = word.toLowerCase().split(":");
    if (!word.includes(":")) return TOKENS.filter((t) => t.key.startsWith(k) && k.length >= 1).map((t) => ({ key: t.key, value: "", text: `${t.key}:` }));
    const t = TOKENS.find((x) => x.key === k);
    return t ? t.values.filter((x) => x.startsWith(v)).map((x) => ({ key: t.key, value: x, text: `${t.key}:${x}` })) : [];
  }, [word]);
  useEffect(() => setPick(0), [word]);

  /** Where in the field a piece of the typed text begins, so its chip can start there. */
  const textX = (before: string) => {
    const m = mirror.current, i = input.current, f = field.current;
    if (!m || !i || !f) return 0;
    m.textContent = before;
    return i.getBoundingClientRect().left - f.getBoundingClientRect().left + m.offsetWidth - i.scrollLeft;
  };

  const promote = (key: Token["key"], value: string) => {
    const t = now.current.text;
    const start = t.lastIndexOf(" ") + 1;
    const fromX = textX(t.slice(0, start));
    setTokens((s) => [...s.filter((x) => !(x.key === key && x.value === value)), { key, value, id: ids.current++, fromX }]);
    setText(t.slice(0, start).trimEnd());
    setArmed(false);
  };
  const remove = (id: number) => { setTokens((s) => s.filter((t) => t.id !== id)); setArmed(false); };

  const onType = (v: string) => {
    setArmed(false);
    // a complete filter followed by a space becomes a chip
    const m = v.match(/(?:^|\s)(from|is|has|in):(\S+)\s$/i);
    if (m) {
      const t = TOKENS.find((x) => x.key === m[1].toLowerCase());
      const val = m[2].toLowerCase();
      if (t && t.values.includes(val)) { setText(v); now.current.text = v.trimEnd(); promote(t.key, val); return; }
    }
    setText(v);
  };
  const accept = (i: number) => {
    const s = suggestions[i];
    if (!s) return false;
    if (!s.value) { const t = now.current.text; onType(`${t.slice(0, t.length - word.length)}${s.text}`); return true; }
    promote(s.key as Token["key"], s.value);
    return true;
  };
  const onKey = (e: RKeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); setPick((p) => (p + (e.key === "ArrowDown" ? 1 : suggestions.length - 1)) % suggestions.length); }
    else if ((e.key === "Enter" || e.key === "Tab") && suggestions.length) { if (accept(pick)) e.preventDefault(); }
    else if (e.key === "Backspace" && input.current?.selectionStart === 0 && input.current.selectionEnd === 0 && tokens.length) {
      e.preventDefault();
      if (armed) remove(tokens[tokens.length - 1].id); else setArmed(true);
    } else if (e.key === "Escape") { setText(""); setArmed(false); }
  };

  // a filter still being typed is not a search word yet
  const terms = text.trim().toLowerCase().split(/\s+/).filter((w) => w && !/^(from|is|has|in):/.test(w) && !(w === word.toLowerCase() && suggestions.length > 0));
  const results = items.filter((m) => {
    for (const t of tokens) {
      if (t.key === "from" && m.who !== t.value) return false;
      if (t.key === "is" && !(t.value === "unread" ? m.unread : m.starred)) return false;
      if (t.key === "has" && !m.attachment) return false;
      if (t.key === "in" && !m.archived) return false;
    }
    if (!tokens.some((t) => t.key === "in") && m.archived) return false;
    const hay = `${m.from} ${m.subject} ${m.preview}`.toLowerCase();
    return terms.every((w) => hay.includes(w));
  });

  // the demo
  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const ok = () => live && !touched.current;
    const wait = async (ms: number) => { await sleep(ms); return ok(); };
    const type = async (s: string) => { for (const ch of s) { if (!ok()) return false; onType(now.current.text + ch); await sleep(70 + Math.random() * 50); } return true; };
    (async () => {
      await sleep(1000);
      while (ok()) {
        setFocus(true);
        if (!(await type("from:anna "))) break;
        if (!(await wait(1100))) break;
        if (!(await type("is:un"))) break;
        if (!(await wait(900))) break;
        promote("is", "unread");
        if (!(await wait(1300))) break;
        if (!(await type("icons"))) break;
        if (!(await wait(1500))) break;
        setText("");
        if (!(await wait(600))) break;
        setArmed(true);
        if (!(await wait(700))) break;
        setTokens((s) => s.slice(0, -1)); setArmed(false);
        if (!(await wait(1300))) break;
        setTokens([]); setFocus(false);
        if (!(await wait(1200))) break;
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const take = () => { touched.current = true; };
  const showMenu = focus && suggestions.length > 0;
  const hl = (s: string) => {
    if (!terms.length) return s;
    const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
    return s.split(re).map((p, i) => (i % 2 ? <mark key={i} className="rounded-[3px] bg-[#0071e3]/15 px-px text-inherit">{p}</mark> : p));
  };

  return (
    <div
      onPointerDownCapture={take}
      onKeyDownCapture={take}
      className="w-full max-w-[520px] rounded-[24px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      <div className="relative">
        <motion.div
          ref={field}
          onClick={() => input.current?.focus()}
          animate={{ boxShadow: focus ? "0 0 0 1.5px #0071e3, 0 0 0 4px rgba(0,113,227,.14)" : "0 0 0 0px rgba(0,113,227,0), 0 0 0 0px rgba(0,113,227,0)" }}
          transition={SPRING}
          className="relative flex min-h-[46px] cursor-text flex-wrap items-center gap-1.5 rounded-[14px] bg-[#f5f5f7] py-[7px] pl-10 pr-3"
        >
          <Glyph d={ICON.search} size={16} className="absolute left-3.5 top-[15px] text-[#86868b]" />
          <AnimatePresence initial={false}>
            {tokens.map((t, i) => (
              <Chip key={t.id} t={t} selected={armed && i === tokens.length - 1} field={field} reduce={!!reduce} onRemove={() => remove(t.id)} />
            ))}
          </AnimatePresence>
          <input
            ref={input}
            value={text}
            onChange={(e) => onType(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setFocus(true)}
            onBlur={() => setTimeout(() => setFocus(false), 120)}
            role="combobox"
            aria-expanded={showMenu}
            aria-controls="ss-menu"
            aria-label="Search mail"
            placeholder={tokens.length ? "" : "Search, or try from:anna"}
            className="h-8 min-w-[80px] flex-1 bg-transparent text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6]"
          />
          <span ref={mirror} aria-hidden="true" className="pointer-events-none invisible absolute whitespace-pre text-[15px]" />
        </motion.div>

        <AnimatePresence>
          {showMenu && (
            <motion.ul
              id="ss-menu"
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={SPRING}
              className="absolute inset-x-0 top-[calc(100%+6px)] z-20 m-0 list-none rounded-[14px] bg-white p-1.5 shadow-[0_0_0_.5px_rgba(0,0,0,.1),0_16px_36px_-12px_rgba(0,0,0,.3)]"
              style={{ transformOrigin: "50% 0%" }}
            >
              {suggestions.map((s, i) => (
                <li key={s.text} role="option" aria-selected={i === pick}>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); accept(i); }} onMouseEnter={() => setPick(i)} className="relative flex h-9 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left text-[14px] outline-none">
                    {i === pick && <motion.span layoutId="ss-pick" className="absolute inset-0 rounded-[9px] bg-[#f0f0f2]" transition={SPRING} />}
                    <span className="relative h-2 w-2 rounded-full" style={{ background: TINT[s.key as Token["key"]] }} />
                    <span className="relative font-medium text-[#1d1d1f]">{s.text}</span>
                    {s.value && <span className="relative text-[#86868b]">{label({ key: s.key as Token["key"], value: s.value })}</span>}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-[12px] text-[#86868b]">
        <span aria-live="polite" className="tabular-nums">{results.length} {results.length === 1 ? "message" : "messages"}</span>
        {tokens.length > 0 && <span>Drag a filter out to remove it</span>}
      </div>
      <ul className="m-0 mt-1.5 flex list-none flex-col p-0" style={{ minHeight: 380 }}>
        <AnimatePresence initial={false} mode="popLayout">
          {results.map((m) => (
            <motion.li key={m.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.18 } }} transition={SPRING} className="flex gap-3 rounded-[12px] px-2 py-2.5">
              <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full" style={{ background: m.unread ? "#0071e3" : "transparent" }} aria-label={m.unread ? "Unread" : undefined} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className={`truncate text-[14px] ${m.unread ? "font-semibold" : "font-medium"} text-[#1d1d1f]`}>{hl(m.from)}</span>
                  <span className="shrink-0 text-[12px] text-[#86868b]">{m.time}</span>
                </span>
                <span className="block truncate text-[13.5px] text-[#1d1d1f]">{hl(m.subject)}</span>
                <span className="block truncate text-[13px] text-[#86868b]">{hl(m.preview)}</span>
              </span>
            </motion.li>
          ))}
          {results.length === 0 && (
            <motion.li key="none" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="text-[14px] text-[#6e6e73]">Nothing matches every filter.</span>
              <button type="button" onClick={() => { setTokens([]); setText(""); }} className="text-[14px] font-medium text-[#0071e3] outline-none focus-visible:underline">Clear filters</button>
            </motion.li>
          )}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ a filter chip, born where its words were typed */
function Chip({ t, selected, field, reduce, onRemove }: { t: Token & { fromX: number }; selected: boolean; field: RefObject<HTMLDivElement | null>; reduce: boolean; onRemove: () => void }) {
  const el = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  useLayoutEffect(() => {
    const f = field.current, c = el.current;
    if (!f || !c || reduce) return;
    const left = c.getBoundingClientRect().left - f.getBoundingClientRect().left;
    x.set(t.fromX - left);
    animate(x, 0, SPRING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const tint = TINT[t.key];
  return (
    <motion.span
      ref={el}
      layout="position"
      drag
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={(_, i) => { if (Math.abs(i.offset.y) > 34 || Math.abs(i.offset.x) > 120) onRemove(); }}
      style={{ x }}
      initial={{ opacity: 0.4, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1, boxShadow: selected ? `0 0 0 2px ${tint}` : "0 0 0 .5px rgba(0,0,0,.1)" }}
      exit={{ opacity: 0, scale: 0.6, filter: "blur(4px)", transition: { duration: 0.22 } }}
      whileDrag={{ scale: 1.06, boxShadow: "0 10px 24px -8px rgba(0,0,0,.35)", cursor: "grabbing" }}
      transition={SPRING}
      className="relative z-10 inline-flex h-8 cursor-grab touch-none select-none items-center gap-1.5 rounded-[9px] bg-white pl-2 pr-1 text-[13.5px] font-medium text-[#1d1d1f]"
    >
      <span className="h-[7px] w-[7px] rounded-full" style={{ background: tint }} aria-hidden="true" />
      <span className="text-[#86868b]">{t.key}:</span>
      <span>{t.key === "from" ? label(t) : t.value}</span>
      <button type="button" aria-label={`Remove ${t.key} ${t.value}`} onClick={(e) => { e.stopPropagation(); onRemove(); }} onPointerDown={(e) => e.stopPropagation()} className="grid h-6 w-6 place-items-center rounded-[6px] text-[#86868b] outline-none hover:bg-[#f0f0f2] hover:text-[#1d1d1f] focus-visible:ring-2 focus-visible:ring-[#0071e3]">
        <Glyph d={ICON.xmark} size={11} />
      </button>
    </motion.span>
  );
}

/* ------------------------------------------------------------------ icons: Framework7 Icons (MIT), via Iconify */
const ICON = {
  search: "M23.957 41.77a18.02 18.02 0 0 0 10.477-3.376l11.109 11.11a2.66 2.66 0 0 0 1.898.773c1.524 0 2.625-1.172 2.625-2.672c0-.703-.234-1.359-.75-1.874L38.277 34.668c2.32-3.047 3.703-6.82 3.703-10.922c0-9.914-8.109-18.023-18.023-18.023c-9.937 0-18.023 8.109-18.023 18.023S14.02 41.77 23.957 41.77m0-3.891c-7.758 0-14.133-6.398-14.133-14.133S16.2 9.613 23.957 9.613c7.734 0 14.133 6.399 14.133 14.133c0 7.735-6.399 14.133-14.133 14.133",
  xmark: "M10.023 43.023c-.796.797-.82 2.157 0 2.954c.82.796 2.157.796 2.977 0l15-15l15 15c.797.796 2.156.82 2.977 0c.796-.82.796-2.157 0-2.954L30.953 28l15.024-15c.796-.797.82-2.156 0-2.953c-.844-.82-2.18-.82-2.977 0l-15 15l-15-15c-.82-.82-2.18-.844-2.977 0c-.796.82-.796 2.156 0 2.953l15 15Z",
};
function Glyph({ d, size = 16, className, style }: { d: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true" className={className} style={style}>
      <path d={d} />
    </svg>
  );
}

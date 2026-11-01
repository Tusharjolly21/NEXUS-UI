Add the "Code Block" component from Nexus UI to my project.

A syntax-highlighted code block with a title bar, language badge, line numbers and a copy button. A soft bar glides between lines as the pointer moves, highlightLines marks lines with an accent bar, and copying turns the icon into a tick that draws itself.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { CodeBlock, DEFAULT_HEADER, DEFAULT_CODE_AREA, DEFAULT_BORDER } from "@/components/code-block";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/code-block/code-block.tsx ---

```tsx
"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CodeLanguage = "plain" | "js" | "ts" | "jsx" | "tsx" | "css" | "json" | "html";

export type HeaderProps = {
  /** Shows the title bar. */
  enabled?: boolean;
  /** Shows the three window dots. */
  showDots?: boolean;
  /** Title bar background (custom theme). */
  background?: string;
  /** File name or label in the title bar. */
  title?: string;
  /** Font overrides for the title and copy button. */
  font?: React.CSSProperties;
  /** Title colour (custom theme). */
  titleColor?: string;
  /** Copy button settings. */
  copy?: CopyProps;
};

export type CopyProps = {
  enabled?: boolean;
  label?: string;
  copiedLabel?: string;
  copiedDurationMs?: number;
  /** Button colour (custom theme). */
  color?: string;
  /** Button colour once copied (custom theme). */
  accentColor?: string;
};

export type CodeAreaProps = {
  showLineNumbers?: boolean;
  /** Wraps long lines instead of scrolling sideways. */
  wrap?: boolean;
  /** Inner padding in px. */
  padding?: number;
  background?: string;
  selectionColor?: string;
  textColor?: string;
  /** Line number colour. */
  subtleTextColor?: string;
  font?: React.CSSProperties;
};

export type BorderProps = {
  color?: string;
  width?: number;
  radius?: string;
};

export type CodeBlockProps = {
  code?: string;
  language?: CodeLanguage;
  /** `dark` and `light` are built in, `auto` follows the page's `dark` class, and `custom` reads the colours from `header`, `codeArea` and `border`. */
  theme?: "dark" | "light" | "auto" | "custom";
  header?: HeaderProps;
  codeArea?: CodeAreaProps;
  border?: BorderProps;
  /** 1-based line numbers to mark with an accent bar. */
  highlightLines?: number[];
  /** A soft bar glides to whichever line the pointer is on. */
  hoverHighlight?: boolean;
  /** Walks the glide bar through `highlightLines` (or every line) until the pointer comes over the code. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_CODE = `import { useState } from "react";

export function PricingCard() {
  const [yearly, setYearly] = useState(false);
  const price = yearly ? 99 : 12;

  return (
    <div className="card">
      <h3>Pro</h3>
      <p className="price">\${price}</p>
      <button onClick={() => setYearly(!yearly)}>
        Bill {yearly ? "monthly" : "yearly"}
      </button>
    </div>
  );
}`;

export const DEFAULT_HEADER: HeaderProps = {
  enabled: true,
  showDots: true,
  title: "pricing-card.tsx",
  copy: { enabled: true, label: "Copy", copiedLabel: "Copied", copiedDurationMs: 1400 },
};

export const DEFAULT_CODE_AREA: CodeAreaProps = {
  showLineNumbers: true,
  wrap: false,
  padding: 18,
};

export const DEFAULT_BORDER: BorderProps = {
  width: 0,
  radius: "22px",
};

// ── Theme colours ─────────────────────────────────────────────────────────────

type Palette = {
  border: string;
  frame: string;
  headerBg: string;
  title: string;
  copy: string;
  copyAccent: string;
  codeBg: string;
  text: string;
  subtle: string;
  selection: string;
  glide: string;
  mark: string;
  markBar: string;
  dark: boolean;
};

const DARK: Palette = {
  border: "rgba(255,255,255,0.08)",
  frame: "#1c1c1e",
  headerBg: "#232325",
  title: "#a1a1a6",
  copy: "#a1a1a6",
  copyAccent: "#30d158",
  codeBg: "#1c1c1e",
  text: "#e5e5ea",
  subtle: "#636366",
  selection: "rgba(10,132,255,0.35)",
  glide: "rgba(255,255,255,0.06)",
  mark: "rgba(10,132,255,0.14)",
  markBar: "#0a84ff",
  dark: true,
};

const LIGHT: Palette = {
  border: "rgba(0,0,0,0.06)",
  frame: "#ffffff",
  headerBg: "#f5f5f7",
  title: "#6e6e73",
  copy: "#6e6e73",
  copyAccent: "#248a3d",
  codeBg: "#ffffff",
  text: "#1d1d1f",
  subtle: "#aeaeb2",
  selection: "rgba(0,113,227,0.18)",
  glide: "rgba(0,0,0,0.04)",
  mark: "rgba(0,113,227,0.08)",
  markBar: "#0071e3",
  dark: false,
};

/** Dark flag from the `dark` class on <html>; false on the server. */
function subscribeDark(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const readDark = () => document.documentElement.classList.contains("dark");

function isColorDark(color: string): boolean {
  const c = color.trim();
  let r = 0;
  let g = 0;
  let b = 0;
  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
    r = parseInt(hex.slice(0, 2), 16) || 0;
    g = parseInt(hex.slice(2, 4), 16) || 0;
    b = parseInt(hex.slice(4, 6), 16) || 0;
  } else if (c.startsWith("rgb")) {
    const m = c.match(/\d+(\.\d+)?/g);
    if (m && m.length >= 3) [r, g, b] = m.map(Number);
  } else return true;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

// ── Token types ───────────────────────────────────────────────────────────────

type TokenType =
  | "keyword"
  | "function"
  | "class"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "punct"
  | "tag"
  | "attr"
  | "value"
  | "boolean"
  | "nullish"
  | "plain";

type Token = { t: TokenType; v: string };

// ── Token colours (Xcode-like) ────────────────────────────────────────────────

const DARK_TOKENS: Record<TokenType, string> = {
  keyword: "#ff7ab2",
  function: "#67b7a4",
  class: "#5dd8ff",
  string: "#ff8170",
  number: "#d9c97c",
  comment: "#7f8c98",
  operator: "#a1a1a6",
  punct: "#c7c7cc",
  tag: "#5dd8ff",
  attr: "#d9c97c",
  value: "#ff8170",
  boolean: "#ff7ab2",
  nullish: "#ff7ab2",
  plain: "",
};

const LIGHT_TOKENS: Record<TokenType, string> = {
  keyword: "#9b2393",
  function: "#326d74",
  class: "#0b4f79",
  string: "#c41a16",
  number: "#1c00cf",
  comment: "#5d6c79",
  operator: "#3c3c43",
  punct: "#3c3c43",
  tag: "#0b4f79",
  attr: "#815f03",
  value: "#c41a16",
  boolean: "#9b2393",
  nullish: "#9b2393",
  plain: "",
};

function tokenColor(t: TokenType, base: string, dark: boolean): string {
  return (dark ? DARK_TOKENS : LIGHT_TOKENS)[t] || base;
}

// ── Tokenizer ──────────────────────────────────────────────────────────────────

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isIdentStart(ch: string): boolean {
  return (ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z") || ch === "_" || ch === "$";
}

function isIdentPart(ch: string): boolean {
  return isIdentStart(ch) || isDigit(ch);
}

function tokenizeCodeLine(line: string): Token[] {
  return tokenizeGeneric(line, {
    keywords: [
      "const", "let", "var", "function", "return", "if", "else", "for", "while",
      "do", "switch", "case", "break", "continue", "try", "catch", "finally",
      "throw", "new", "class", "extends", "super", "this", "import", "from",
      "export", "default", "type", "interface", "implements", "public", "private",
      "protected", "readonly", "as", "async", "await", "yield", "in", "of",
      "instanceof", "typeof", "void", "delete", "get", "set", "static",
    ],
    keywordType: () => "keyword" as TokenType,
    commentStyle: "line+block",
  });
}

function tokenizeJsonLine(line: string): Token[] {
  return tokenizeGeneric(line, {
    keywords: ["true", "false", "null"],
    keywordType: (w: string) => w === "null" ? "nullish" : "boolean",
    commentStyle: "none",
  });
}

function tokenizeCssLine(line: string): Token[] {
  return tokenizeGeneric(line, {
    keywords: [],
    keywordType: () => "keyword" as TokenType,
    commentStyle: "block",
  });
}

function tokenizeHtmlLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "<") {
      const close = line.indexOf(">", i + 1);
      const end = close === -1 ? line.length : close + 1;
      const segment = line.slice(i, end);
      const m = segment.match(/^<\/?\s*([a-zA-Z0-9:-]+)/);
      if (m) {
        const tagName = m[1];
        const prefixLen = segment.indexOf(tagName);
        if (prefixLen > 0) tokens.push({ t: "punct", v: segment.slice(0, prefixLen) });
        tokens.push({ t: "tag", v: tagName });
        const rest = segment.slice(prefixLen + tagName.length);
        tokens.push(...tokenizeHtmlAttrs(rest));
      } else {
        tokens.push({ t: "tag", v: segment });
      }
      i = end;
      continue;
    }
    const next = line.indexOf("<", i);
    const end = next === -1 ? line.length : next;
    tokens.push({ t: "plain", v: line.slice(i, end) });
    i = end;
  }
  return tokens;
}

function tokenizeHtmlAttrs(rest: string): Token[] {
  const tokens: Token[] = [];
  let s = rest;
  while (s.length) {
    const quoteIdx = s.search(/["']/);
    if (quoteIdx === -1) {
      tokens.push({ t: "punct", v: s });
      break;
    }
    if (quoteIdx > 0) {
      tokens.push(...tokenizeAttrNames(s.slice(0, quoteIdx)));
      s = s.slice(quoteIdx);
    }
    const q = s[0];
    const end = s.indexOf(q, 1);
    const v = end === -1 ? s : s.slice(0, end + 1);
    tokens.push({ t: "value", v });
    s = end === -1 ? "" : s.slice(end + 1);
  }
  return tokens;
}

function tokenizeAttrNames(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const m = text.slice(i).match(/^[\s/=>]+/);
    if (m) {
      tokens.push({ t: "punct", v: m[0] });
      i += m[0].length;
      continue;
    }
    const n = text.slice(i).match(/^[a-zA-Z_:][-a-zA-Z0-9_:.]*/);
    if (n) {
      tokens.push({ t: "attr", v: n[0] });
      i += n[0].length;
      continue;
    }
    tokens.push({ t: "punct", v: text[i] });
    i++;
  }
  return tokens;
}

type GenericOpts = {
  keywords: string[];
  keywordType: (w: string) => TokenType;
  commentStyle: "none" | "line" | "block" | "line+block";
};

function tokenizeGeneric(line: string, opts: GenericOpts): Token[] {
  const tokens: Token[] = [];
  const kw = new Set(opts.keywords);
  let i = 0;
  const push = (t: TokenType, v: string) => {
    if (!v) return;
    tokens.push({ t, v });
  };
  while (i < line.length) {
    const ch = line[i];

    if (
      (opts.commentStyle === "line" || opts.commentStyle === "line+block") &&
      ch === "/" && line[i + 1] === "/"
    ) {
      push("comment", line.slice(i));
      break;
    }
    if (
      (opts.commentStyle === "block" || opts.commentStyle === "line+block") &&
      ch === "/" && line[i + 1] === "*"
    ) {
      const end = line.indexOf("*/", i + 2);
      const seg = end === -1 ? line.slice(i) : line.slice(i, end + 2);
      push("comment", seg);
      i += seg.length;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      let j = i + 1;
      let escaped = false;
      while (j < line.length) {
        const cj = line[j];
        if (escaped) { escaped = false; }
        else if (cj === "\\") { escaped = true; }
        else if (cj === q) { j++; break; }
        j++;
      }
      push("string", line.slice(i, j));
      i = j;
      continue;
    }

    if (isDigit(ch) || (ch === "." && isDigit(line[i + 1] ?? ""))) {
      let j = i + 1;
      while (j < line.length && /[0-9._eE+-]/.test(line[j])) j++;
      push("number", line.slice(i, j));
      i = j;
      continue;
    }

    if (isIdentStart(ch)) {
      let j = i + 1;
      while (j < line.length && isIdentPart(line[j])) j++;
      const word = line.slice(i, j);
      let k = j;
      while (k < line.length && (line[k] === " " || line[k] === "\t")) k++;
      const isFunctionCall = line[k] === "(";
      const isUppercase = /^[A-Z]/.test(word);
      if (kw.has(word)) push(opts.keywordType(word), word);
      else if (word === "true" || word === "false") push("boolean", word);
      else if (word === "null" || word === "undefined") push("nullish", word);
      else if (isFunctionCall) push("function", word);
      else if (isUppercase) push("class", word);
      else push("plain", word);
      i = j;
      continue;
    }

    if (/[=+\-*/%<>!&|^~?:]/.test(ch)) {
      const two = line.slice(i, i + 2);
      const three = line.slice(i, i + 3);
      if (["===", "!==", ">>>"].includes(three)) {
        push("operator", three);
        i += 3;
        continue;
      }
      if (["==", "!=", "<=", ">=", "=>", "&&", "||", "??", "++", "--", "+=", "-=", "*=", "/="].includes(two)) {
        push("operator", two);
        i += 2;
        continue;
      }
      push("operator", ch);
      i++;
      continue;
    }

    if (/[()[\]{},.;]/.test(ch)) {
      push("punct", ch);
      i++;
      continue;
    }

    if (ch === " " || ch === "\t") {
      let j = i + 1;
      while (j < line.length && (line[j] === " " || line[j] === "\t")) j++;
      push("plain", line.slice(i, j));
      i = j;
      continue;
    }

    push("plain", ch);
    i++;
  }
  return tokens.length ? tokens : [{ t: "plain", v: " " }];
}

function tokenizeLine(line: string, language: CodeLanguage): Token[] | null {
  if (language === "plain") return null;
  if (language === "html") return tokenizeHtmlLine(line);
  if (language === "json") return tokenizeJsonLine(line);
  if (language === "css") return tokenizeCssLine(line);
  return tokenizeCodeLine(line);
}

// ── Pieces ────────────────────────────────────────────────────────────────────

const LANG_LABEL: Record<CodeLanguage, string> = { plain: "TXT", js: "JS", ts: "TS", jsx: "JSX", tsx: "TSX", css: "CSS", json: "JSON", html: "HTML" };

const POP = { type: "spring" as const, stiffness: 600, damping: 22 };

/** Two sheets turn into a tick: the tick draws itself and the badge overshoots. */
function CopyGlyph({ copied, still }: { copied: boolean; still: boolean }) {
  return (
    <span className="relative inline-grid h-4 w-4 place-items-center" aria-hidden="true">
      {/* Each icon sits in its own absolutely centred box. A bare <motion.svg> is never taken out of the
          layout by AnimatePresence, so the old and new icon would share the grid and push the tick off centre. */}
      <AnimatePresence initial={false}>
        {copied ? (
          <motion.span key="ok" className="absolute inset-0 grid place-items-center" initial={{ scale: 0.3, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.3, opacity: 0 }} transition={POP}>
            <svg viewBox="0 0 16 16" width={16} height={16}>
              <motion.path
                d="M3.5 8.4l2.9 2.8 6.1-6.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: still ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              />
            </svg>
          </motion.span>
        ) : (
          <motion.span key="copy" className="absolute inset-0 grid place-items-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={POP}>
            <svg viewBox="0 0 16 16" width={16} height={16}>
              <rect x="5.5" y="5.5" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 3.5v-.2A1.3 1.3 0 0 0 9.2 2H3.8A1.3 1.3 0 0 0 2.5 3.3v5.4A1.3 1.3 0 0 0 3.8 10h.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * A syntax-highlighted code block with a title bar, line numbers and a copy
 * button. A soft bar glides between lines as the pointer moves (the signature
 * move), `highlightLines` marks lines with an accent bar, and copying turns
 * the icon into a tick that draws itself.
 */
export function CodeBlock({
  code = DEFAULT_CODE,
  language = "tsx",
  theme = "dark",
  header = DEFAULT_HEADER,
  codeArea = DEFAULT_CODE_AREA,
  border = DEFAULT_BORDER,
  highlightLines,
  hoverHighlight = true,
  autoplay = false,
  enableSound = true,
  className,
  style,
}: CodeBlockProps) {
  const play = useSound(enableSound);
  const uid = React.useId().replace(/:/g, "");
  const still = useReducedMotion() === true;
  const pageDark = React.useSyncExternalStore(subscribeDark, readDark, () => false);
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | null>(null);
  const body = React.useRef<HTMLDivElement>(null);
  const touched = React.useRef(false);
  const spring = still ? { stiffness: 2000, damping: 100 } : { stiffness: 520, damping: 38, mass: 0.7 };
  const barY = useSpring(0, spring);
  const barH = useSpring(0, spring);
  const barO = useSpring(0, { stiffness: 380, damping: 40 });
  const barOn = React.useRef(false);

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const text = React.useMemo(() => (code ?? "").replace(/\r\n/g, "\n"), [code]);
  const lines = React.useMemo(() => text.split("\n"), [text]);
  const digits = String(Math.max(1, lines.length)).length;
  const tokens = React.useMemo(() => (language === "plain" ? null : lines.map((l) => tokenizeLine(l, language))), [lines, language]);
  const marked = React.useMemo(() => new Set(highlightLines ?? []), [highlightLines]);

  const pal = React.useMemo<Palette>(() => {
    if (theme === "light") return LIGHT;
    if (theme === "dark") return DARK;
    if (theme === "auto") return pageDark ? DARK : LIGHT;
    const bg = codeArea.background ?? DARK.codeBg;
    const base = isColorDark(bg) ? DARK : LIGHT;
    return {
      ...base,
      border: border.color ?? base.border,
      frame: bg,
      headerBg: header.background ?? base.headerBg,
      title: header.titleColor ?? base.title,
      copy: header.copy?.color ?? base.copy,
      copyAccent: header.copy?.accentColor ?? base.copyAccent,
      codeBg: bg,
      text: codeArea.textColor ?? base.text,
      subtle: codeArea.subtleTextColor ?? base.subtle,
      selection: codeArea.selectionColor ?? base.selection,
    };
  }, [theme, pageDark, border.color, header.background, header.titleColor, header.copy?.color, header.copy?.accentColor, codeArea.background, codeArea.textColor, codeArea.subtleTextColor, codeArea.selectionColor]);

  /** Moves the glide bar onto a line element. */
  const glideTo = (el: HTMLElement | null, jump = false) => {
    if (!el) return;
    if (jump || !barOn.current) {
      barY.jump(el.offsetTop);
      barH.jump(el.offsetHeight);
    } else {
      barY.set(el.offsetTop);
      barH.set(el.offsetHeight);
    }
    barOn.current = true;
    barO.set(1);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!hoverHighlight) return;
    touched.current = true;
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-ln]");
    if (el) glideTo(el);
  };

  // Autoplay: walk the bar through the marked lines (or every non-empty line).
  const stops = React.useMemo(() => {
    const list = highlightLines?.length ? highlightLines : lines.map((l, i) => (l.trim() ? i + 1 : 0)).filter(Boolean);
    return list.join(",");
  }, [highlightLines, lines]);
  React.useEffect(() => {
    if (!autoplay || !stops) return;
    const order = stops.split(",").map(Number);
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const el = body.current?.querySelector<HTMLElement>(`[data-ln="${order[k++ % order.length]}"]`);
      glideTo(el ?? null);
    }, 900);
    return () => window.clearInterval(t);
    // glideTo only touches motion values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, stops]);

  const copy = async () => {
    try {
      if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "true");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      play("success", 0.6);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), Math.max(300, header.copy?.copiedDurationMs ?? 1400));
    } catch {
      /* clipboard can be blocked; nothing to do */
    }
  };

  const showNumbers = codeArea.showLineNumbers ?? true;
  const wrap = codeArea.wrap ?? false;
  const padding = codeArea.padding ?? 18;
  const bw = border.width ?? (theme === "custom" ? 1 : 0);
  const copyLabel = header.copy?.label ?? "Copy";
  const copiedLabel = header.copy?.copiedLabel ?? "Copied";

  return (
    <div
      className={`cb-${uid} ${className ?? ""}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: border.radius ?? "22px",
        background: pal.frame,
        boxShadow: `0 0 0 ${bw > 0 ? bw : 1}px ${bw > 0 ? (border.color ?? pal.border) : pal.border}, 0 20px 40px -26px rgba(0,0,0,${pal.dark ? 0.6 : 0.3})`,
        ...style,
      }}
    >
      <style>{`.cb-${uid} ::selection{background:${pal.selection}}.cb-${uid} .cb-scroll::-webkit-scrollbar{width:0;height:0}`}</style>
      {header.enabled && (
        <div
          style={{ background: pal.headerBg, borderBottom: `1px solid ${pal.border}`, ...header.font }}
          className="flex h-11 shrink-0 items-center gap-3 pl-4 pr-2 text-[12.5px]"
        >
          {header.showDots && (
            <span className="flex shrink-0 gap-[7px]" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </span>
          )}
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className="shrink-0 rounded-[6px] px-1.5 py-[1px] text-[10px] font-semibold tracking-[0.04em]"
              style={{ color: pal.title, background: pal.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}
            >
              {LANG_LABEL[language] ?? "TXT"}
            </span>
            {header.title && (
              <span className="truncate font-medium" style={{ color: pal.title }}>
                {header.title}
              </span>
            )}
          </span>
          {header.copy?.enabled && (
            <motion.button
              type="button"
              onClick={copy}
              whileTap={{ scale: 0.92 }}
              aria-label={copied ? copiedLabel : copyLabel}
              className="relative flex h-8 shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0a84ff]"
              style={{ color: copied ? pal.copyAccent : pal.copy, background: copied ? (pal.dark ? "rgba(48,209,88,0.12)" : "rgba(36,138,61,0.08)") : "transparent", ...header.font }}
            >
              <CopyGlyph copied={copied} still={still} />
              <span className="relative inline-flex overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={copied ? "y" : "n"} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={POP} className="whitespace-nowrap">
                    {copied ? copiedLabel : copyLabel}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>
          )}
        </div>
      )}

      <div style={{ position: "relative", flex: "1 1 auto", minHeight: 0 }}>
        <div
          className="cb-scroll"
          style={{
            height: "100%",
            overflowY: "auto",
            overflowX: wrap ? "hidden" : "auto",
            scrollbarWidth: "none",
            padding,
            background: pal.codeBg,
          }}
        >
          <pre
            aria-label={`Code block (${language})`}
            style={{
              margin: 0,
              paddingBottom: 24,
              color: pal.text,
              background: "transparent",
              tabSize: 2,
              fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)",
              fontSize: 13,
              ...codeArea.font,
              lineHeight: codeArea.font?.lineHeight ?? "1.65em",
              whiteSpace: wrap ? "pre-wrap" : "pre",
              overflowWrap: wrap ? "anywhere" : "normal",
              wordBreak: wrap ? "break-word" : "normal",
            }}
          >
            <div
              ref={body}
              style={{ position: "relative", minWidth: wrap ? undefined : "max-content" }}
              onPointerMove={onMove}
              onPointerLeave={() => {
                if (autoplay) return;
                barOn.current = false;
                barO.set(0);
              }}
            >
              <motion.div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: -padding,
                  right: -padding,
                  top: 0,
                  y: barY,
                  height: barH,
                  opacity: barO,
                  background: pal.glide,
                  pointerEvents: "none",
                }}
              />
              <code style={{ display: "block", position: "relative" }}>
                {lines.map((line, i) => {
                  const n = i + 1;
                  const toks = tokens ? tokens[i] : null;
                  const on = marked.has(n);
                  return (
                    <div
                      key={i}
                      data-ln={n}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        position: "relative",
                        background: on ? pal.mark : undefined,
                        marginInline: on ? -padding : undefined,
                        paddingInline: on ? padding : undefined,
                        boxShadow: on ? `inset 3px 0 0 ${pal.markBar}` : undefined,
                      }}
                    >
                      {showNumbers && (
                        <span
                          aria-hidden="true"
                          style={{
                            flex: "0 0 auto",
                            width: `${Math.max(2, digits)}ch`,
                            textAlign: "right",
                            color: on ? pal.markBar : pal.subtle,
                            userSelect: "none",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {n}
                        </span>
                      )}
                      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                        {toks
                          ? toks.map((tok, j) => (
                              <span key={j} style={{ color: tokenColor(tok.t, pal.text, pal.dark), fontStyle: tok.t === "comment" ? "italic" : undefined }}>
                                {tok.v.length > 0 ? tok.v : " "}
                              </span>
                            ))
                          : line || " "}
                      </span>
                    </div>
                  );
                })}
              </code>
            </div>
          </pre>
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            insetInline: 0,
            bottom: 0,
            height: 36,
            pointerEvents: "none",
            background: `linear-gradient(to bottom, transparent, ${pal.codeBg})`,
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
}

export default CodeBlock;
```

--- components/code-block/index.ts ---

```ts
export { CodeBlock, DEFAULT_HEADER, DEFAULT_CODE_AREA, DEFAULT_BORDER } from "./code-block";
export type { CodeBlockProps, CodeLanguage, HeaderProps, CopyProps, CodeAreaProps, BorderProps } from "./code-block";
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
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

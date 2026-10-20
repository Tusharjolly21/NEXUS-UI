"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";

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
      <AnimatePresence mode="popLayout" initial={false}>
        {copied ? (
          <motion.svg key="ok" viewBox="0 0 16 16" width={16} height={16} initial={{ scale: 0.3, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.3, opacity: 0 }} transition={POP}>
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
          </motion.svg>
        ) : (
          <motion.svg key="copy" viewBox="0 0 16 16" width={16} height={16} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={POP}>
            <rect x="5.5" y="5.5" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 3.5v-.2A1.3 1.3 0 0 0 9.2 2H3.8A1.3 1.3 0 0 0 2.5 3.3v5.4A1.3 1.3 0 0 0 3.8 10h.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </motion.svg>
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
  className,
  style,
}: CodeBlockProps) {
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

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CodeSnippetLang = "js" | "ts" | "python" | "bash" | "json";

const SNIPPETS: Record<CodeSnippetLang, { id: string; label: string; file: string; code: string }> = {
  js: {
    id: "javascript",
    label: "JS",
    file: "fetch-user.js",
    code: `const fetchUser = async (id) => {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    if (!res.ok) throw new Error("Not found");
    return await res.json();
  } catch (error) {
    console.error("Request failed:", error);
    return null;
  }
};

fetchUser(42).then((user) => console.log(user.name));`,
  },
  ts: {
    id: "typescript",
    label: "TS",
    file: "fetch-user.ts",
    code: `type User = { id: number; name: string };

export async function fetchUser(id: number): Promise<User | null> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) return null;
  return (await res.json()) as User;
}

const user = await fetchUser(42);
console.log(user?.name ?? "anonymous");`,
  },
  python: {
    id: "python",
    label: "Python",
    file: "fetch_user.py",
    code: `import httpx

async def fetch_user(user_id: int) -> dict | None:
    # one request, no retries
    async with httpx.AsyncClient() as client:
        res = await client.get(f"/api/users/{user_id}")
        if res.status_code != 200:
            return None
        return res.json()

print(await fetch_user(42))`,
  },
  bash: {
    id: "bash",
    label: "Bash",
    file: "fetch-user.sh",
    code: `#!/usr/bin/env bash
set -euo pipefail

USER_ID=42
# pretty-print the user, or fail loudly
curl -fsS "https://api.example.com/users/$USER_ID" \\
  -H "Accept: application/json" | jq '.name'`,
  },
  json: {
    id: "json",
    label: "JSON",
    file: "user.json",
    code: `{
  "id": 42,
  "name": "Ada Lovelace",
  "roles": ["admin", "editor"],
  "active": true,
  "lastSeen": null
}`,
  },
};

const KEYWORDS: Record<CodeSnippetLang, string[]> = {
  js: ["const", "let", "var", "async", "await", "try", "catch", "throw", "new", "return", "if", "else", "function", "export", "import", "from", "null", "true", "false"],
  ts: ["const", "let", "type", "async", "await", "return", "if", "else", "function", "export", "import", "from", "as", "null", "true", "false", "number", "string", "Promise"],
  python: ["import", "from", "async", "await", "def", "with", "as", "if", "else", "return", "None", "True", "False", "int", "dict", "print"],
  bash: ["set", "if", "then", "fi", "for", "do", "done", "echo", "curl", "jq"],
  json: ["true", "false", "null"],
};

export type CodeSnippetTheme = "dark" | "light";
const THEMES: Record<CodeSnippetTheme, Record<string, string>> = {
  dark: { bg: "#0f1117", bar: "#0f1117", text: "#e6edf3", line: "#7d8590", kw: "#ff7b72", str: "#a5d6ff", num: "#79c0ff", com: "#8b949e", fn: "#d2a8ff", prop: "#7ee787", punct: "#c9d1d9", border: "rgba(240,246,252,.1)" },
  light: { bg: "#ffffff", bar: "#f6f8fa", text: "#1f2328", line: "#8c959f", kw: "#cf222e", str: "#0a3069", num: "#0550ae", com: "#6e7781", fn: "#8250df", prop: "#116329", punct: "#24292f", border: "rgba(31,35,40,.12)" },
};

type Tok = { t: string; k: string };

/** A small single-pass tokenizer: comments, strings, numbers, keywords, calls, JSON keys. */
function tokenize(line: string, lang: CodeSnippetLang): Tok[] {
  const out: Tok[] = [];
  const kw = new Set(KEYWORDS[lang]);
  const comment = lang === "python" || lang === "bash" ? /^#.*/ : /^\/\/.*/;
  let s = line;
  while (s.length) {
    let m: RegExpMatchArray | null;
    if ((m = s.match(comment)) && !(lang === "bash" && s.startsWith("#!") && out.length)) {
      out.push({ t: m[0], k: "com" });
    } else if ((m = s.match(/^(f?"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/))) {
      const isKey = lang === "json" && /^\s*:/.test(s.slice(m[0].length));
      out.push({ t: m[0], k: isKey ? "prop" : "str" });
    } else if ((m = s.match(/^\$[A-Za-z_]\w*/))) {
      out.push({ t: m[0], k: "num" });
    } else if ((m = s.match(/^\d+(\.\d+)?/))) {
      out.push({ t: m[0], k: "num" });
    } else if ((m = s.match(/^[A-Za-z_]\w*/))) {
      const word = m[0];
      const rest = s.slice(word.length);
      out.push({ t: word, k: kw.has(word) ? "kw" : rest.startsWith("(") ? "fn" : "text" });
    } else if ((m = s.match(/^=>/))) {
      out.push({ t: m[0], k: "punct" });
    } else if ((m = s.match(/^\s+/))) {
      out.push({ t: m[0], k: "text" });
    } else {
      out.push({ t: s[0], k: "punct" });
      m = [s[0]] as unknown as RegExpMatchArray;
    }
    s = s.slice(m[0].length);
  }
  return out;
}

const ORDER: CodeSnippetLang[] = ["js", "ts", "python", "bash", "json"];

/**
 * Code Snippet: a polished code block for developer landing pages. macOS-style header with traffic
 * lights, the language in quiet monospace on the right (click it to switch) and a small outlined
 * Copy button that morphs into a tick. Real token-level highlighting for JS, TS, Python, Bash and
 * JSON (no Prism, no Highlight.js), ligature-style arrows, optional line numbers, dark and light
 * themes. Switching language rolls the new lines in one after another. With `controls` a row of
 * chips under the block picks language, theme and line numbers. With `autoplay` it tours the
 * languages until touched, and pauses while off screen.
 */
export type CodeSnippetProps = {
  /** Language shown first. */
  initial?: CodeSnippetLang;
  theme?: CodeSnippetTheme;
  lineNumbers?: boolean;
  /** Show the chip row for language, theme and line numbers under the block. */
  controls?: boolean;
  /** Tours the languages every few seconds until someone touches it. */
  autoplay?: boolean;
  className?: string;
};

export function CodeSnippet({
  initial = "js",
  theme: initialTheme = "dark",
  lineNumbers = true,
  controls = true,
  autoplay = false,
  className,
}: CodeSnippetProps) {
  const [lang, setLang] = useState<CodeSnippetLang>(initial);
  const [theme, setTheme] = useState<CodeSnippetTheme>(initialTheme);
  const rootRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [numbers, setNumbers] = useState(lineNumbers);
  const [copied, setCopied] = useState(false);
  const touched = useRef(false);
  const T = THEMES[theme];
  const snippet = SNIPPETS[lang];
  const lines = useMemo(() => snippet.code.split("\n").map((l) => tokenize(l, lang)), [snippet, lang]);

  useEffect(() => {
    const el = rootRef.current;
    if (!autoplay || !el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay]);

  useEffect(() => {
    if (!autoplay || !onScreen) return;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      setLang((l) => ORDER[(ORDER.indexOf(l) + 1) % ORDER.length]);
    }, 3600);
    return () => window.clearInterval(id);
  }, [autoplay, onScreen]);

  const touch = () => (touched.current = true);
  const copy = async () => {
    touch();
    try {
      await navigator.clipboard.writeText(snippet.code);
    } catch {
      /* clipboard blocked; still confirm so the button never feels dead */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  const chip = (on: boolean) =>
    `h-9 rounded-full px-3.5 text-[12.5px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${on ? "bg-[#1d1d1f] text-white" : "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]"}`;

  return (
    <div ref={rootRef} className={cn("flex w-full max-w-[520px] flex-col gap-3", className)} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}>
      <motion.div
        animate={{ backgroundColor: T.bg, borderColor: T.border }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-[12px] border shadow-[0_24px_48px_-24px_rgba(0,0,0,.55)]"
      >
        <motion.div animate={{ borderColor: T.border }} className="flex items-center gap-3 border-b px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden="true">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} className="h-[11px] w-[11px] rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => {
              touch();
              setLang((l) => ORDER[(ORDER.indexOf(l) + 1) % ORDER.length]);
            }}
            aria-label={`Language: ${SNIPPETS[lang].label}. Switch language`}
            className="relative h-7 overflow-hidden rounded px-1 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{ color: T.line, fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace" }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={lang} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 34 }}>
                {SNIPPETS[lang].id}
              </motion.span>
            </AnimatePresence>
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={copy}
            aria-label={copied ? "Copied" : `Copy ${snippet.file}`}
            className="relative flex h-[22px] min-w-[46px] items-center justify-center overflow-hidden rounded-[4px] border px-1.5 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{ borderColor: T.border, color: T.text, background: "transparent" }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {copied ? (
                <motion.span key="ok" className="flex items-center gap-1" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
                  </svg>
                  Copied
                </motion.span>
              ) : (
                <motion.span key="copy" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                  Copy
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
        <div aria-label={snippet.file} className="overflow-x-auto py-4" style={{ fontFamily: "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace" }}>
          <pre className="m-0 text-[13px] leading-[1.55]">
            <code>
              {lines.map((toks, i) => (
                <motion.div
                  key={`${lang}-${i}`}
                  initial={{ opacity: 0, x: -8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ delay: i * 0.025, type: "spring", stiffness: 420, damping: 34 }}
                  className="flex whitespace-pre pr-4"
                >
                  {numbers && (
                    <span className="inline-block w-12 shrink-0 select-none pr-5 text-right tabular-nums" style={{ color: T.line, opacity: 0.7 }} aria-hidden="true">
                      {i + 1}
                    </span>
                  )}
                  <span className={numbers ? "" : "pl-5"}>
                    {toks.map((tk, j) => (
                      <span key={j} style={{ color: T[tk.k] ?? T.text }}>
                        {tk.t === "=>" ? "⇒" : tk.t}
                      </span>
                    ))}
                    {toks.length === 0 ? " " : null}
                  </span>
                </motion.div>
              ))}
            </code>
          </pre>
        </div>
      </motion.div>
      {controls ? (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {ORDER.map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} onClick={() => { touch(); setLang(l); }} className={chip(lang === l)}>
              {SNIPPETS[l].label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-black/10" aria-hidden="true" />
          <button type="button" aria-pressed={theme === "light"} onClick={() => { touch(); setTheme((t) => (t === "dark" ? "light" : "dark")); }} className={chip(false)}>
            {theme === "dark" ? "Light theme" : "Dark theme"}
          </button>
          <button type="button" aria-pressed={numbers} onClick={() => { touch(); setNumbers((n) => !n); }} className={chip(false)}>
            Line numbers {numbers ? "on" : "off"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

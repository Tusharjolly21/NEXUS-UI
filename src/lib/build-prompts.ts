/**
 * build-prompts.ts — SERVER ONLY
 *
 * Reads the build prompt files in content/build-prompts. A page with several variants keeps one
 * brief per variant in the same file, each starting with a top-level `# Title` heading that is the
 * variant's title on the page (the first brief is the original component's). These helpers split the
 * file on those headings (ignoring `#` lines inside code fences), so one variant's brief can be
 * served on its own.
 *
 * `variantPromptIds` only reads the headings. It never returns prompt text, so the page can know
 * which variants have a brief without the text reaching anyone who has not paid for it.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

/** The brief for the component itself, before the first heading, is served as this id. */
export const MAIN_BRIEF = "main";

type Parsed = { variants: Map<string, string> };
const cache = new Map<string, Promise<Parsed | null>>();

/** The id a variant is known by: its title, lower-cased and dashed. */
export function variantKey(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Lines that sit between briefs and are not part of one: blank, a rule, a marker comment, a note. */
const FILLER = /^(\s*|---|<!--.*-->|>.*)$/;

export function parsePromptFile(text: string): Parsed {
  const variants = new Map<string, string>();
  let key: string | null = null;
  let buf: string[] = [];
  const intro: string[] = [];
  let fence = false;
  const trim = (lines: string[]) => {
    const out = [...lines];
    while (out.length && FILLER.test(out[0])) out.shift();
    while (out.length && FILLER.test(out[out.length - 1])) out.pop();
    return out.join("\n").trim();
  };
  const flush = () => {
    if (!key) return;
    if (!variants.has(key)) variants.set(key, trim(buf) + "\n");
  };
  for (const line of text.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const h1 = !fence && /^# (.+?)\s*$/.exec(line);
    if (h1) {
      flush();
      key = variantKey(h1[1]);
      buf = [line];
    } else if (key) {
      buf.push(line);
    } else {
      intro.push(line);
    }
  }
  flush();
  // Text before the first heading is the component's own brief when it is more than a note about the page.
  const main = trim(intro);
  if (main.split(/\s+/).length >= 40) variants.set(MAIN_BRIEF, main + "\n");
  return { variants };
}

/** The slug is only ever a catalog slug (callers check), but never let it leave the folder anyway. */
function load(slug: string): Promise<Parsed | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return Promise.resolve(null);
  let hit = cache.get(slug);
  if (!hit) {
    hit = readFile(path.join(process.cwd(), "content", "build-prompts", `${slug}.md`), "utf8")
      .then(parsePromptFile)
      .catch(() => null);
    cache.set(slug, hit);
  }
  return hit;
}

/**
 * For each variant title on a page, the id of its own brief, or null when it has none. A variant
 * with no heading of its own uses the component's main brief when it is the first variant (the
 * original), or when the file has no headings at all (the variants are just examples of one
 * component). Returns ids only, never prompt text.
 */
export async function promptIdsFor(slug: string, titles: string[]): Promise<(string | null)[]> {
  const parsed = await load(slug);
  if (!parsed) return titles.map(() => null);
  const own = [...parsed.variants.keys()].filter((k) => k !== MAIN_BRIEF);
  const hasMain = parsed.variants.has(MAIN_BRIEF);
  return titles.map((t, i) => {
    const k = variantKey(t);
    if (parsed.variants.has(k)) return k;
    if (hasMain && (i === 0 || own.length === 0)) return MAIN_BRIEF;
    return null;
  });
}

/** One variant's brief, or null when the file has none for it. */
export async function variantPrompt(slug: string, id: string): Promise<string | null> {
  const parsed = await load(slug);
  return parsed?.variants.get(id) ?? null;
}

/**
 * Integrity check for the animated icon set. Runs before every build (npm run icons:check) and fails the
 * build, with a readable list, if anything a visitor could hit is broken:
 *
 *  - every catalog entry has an icon file, a sound score, four where-to-use scenes and a registry entry
 *  - slugs are unique, kebab-case, with valid categories, accents and non-empty copy
 *  - every icon file is self-contained: "use client" first, imports only react and framer-motion,
 *    respects reduced motion, takes the documented props, and never clips its own motion
 *  - every sound score exports length, level and play, uses only the kit, and no two icons share
 *    the same note sequence (each sound stays its own)
 *  - nothing on disk is orphaned (a file with no catalog entry would ship but be unreachable)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const errors = [];
const fail = (m) => errors.push(m);

const catalog = read("src/lib/icons/catalog.ts");
const uses = read("src/lib/icons/uses.ts");
const registry = read("src/components/nx-icons/registry.tsx");
const sounds = read("src/components/nx-icons/icon-sounds.ts");
const count = read("src/lib/icons/count.ts");

const categories = new Set([...catalog.matchAll(/\{ slug: "([a-z-]+)", label: "[^"]+", blurb: "[^"]+" \}/g)].map((m) => m[1]));
const entries = [...catalog.matchAll(/\{ slug: "([a-z0-9-]+)", component: "(\w+)", title: "([^"]+)", category: "([a-z-]+)", kind: "(\w+)", accent: "([^"]+)", heard: "((?:[^"\\]|\\.)*)"(?:, states: \[[^\]]*\])?, tags: \[([^\]]*)\], description: "((?:[^"\\]|\\.)*)", createdAt: "[^"]*", premium: (true|false) \}/g)];
const slugs = entries.map((m) => m[1]);

if (entries.length < 100) fail(`catalog parsed ${entries.length} entries (expected 100+): the catalog format may have changed`);
if (new Set(slugs).size !== slugs.length) fail("duplicate slugs in the catalog");
const declared = Number(/ICON_COUNT = (\d+)/.exec(count)?.[1]);
if (declared !== slugs.length) fail(`count.ts says ${declared} icons, the catalog has ${slugs.length}`);
const freeDeclared = Number(/FREE_ICON_COUNT = (\d+)/.exec(count)?.[1]);
const proDeclared = Number(/PRO_ICON_COUNT = (\d+)/.exec(count)?.[1]);
const freeActual = entries.filter((m) => m[10] === "false").length;
if (freeDeclared !== freeActual) fail(`count.ts says ${freeDeclared} free icons, the catalog has ${freeActual}`);
if (proDeclared !== slugs.length - freeActual) fail(`count.ts says ${proDeclared} Pro icons, the catalog has ${slugs.length - freeActual}`);

const dirFiles = (d, ext) => fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length));
const iconFiles = new Set(dirFiles("src/components/nx-icons/icons", ".tsx"));
const soundFiles = new Set(dirFiles("src/components/nx-icons/sounds", ".ts"));
for (const s of iconFiles) if (!slugs.includes(s)) fail(`icons/${s}.tsx has no catalog entry`);
for (const s of soundFiles) if (!slugs.includes(s)) fail(`sounds/${s}.ts has no catalog entry`);

const noteSeqs = new Map();
for (const [, slug, component, title, category, kind, accent, heard, tags, description, premium] of entries) {
  const where = `${slug}:`;
  if (premium !== "true" && premium !== "false") fail(`${where} premium must be true or false`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`${where} slug must be kebab-case`);
  if (!categories.has(category)) fail(`${where} unknown category "${category}"`);
  if (!/^#[0-9a-fA-F]{6}$/.test(accent)) fail(`${where} accent must be #rrggbb`);
  if (!["loop", "hover"].includes(kind)) fail(`${where} kind must be loop or hover`);
  if (!title.trim() || description.length < 20 || heard.length < 20) fail(`${where} title, description or heard text is missing`);
  if (tags.split(",").filter(Boolean).length < 4) fail(`${where} needs at least 4 tags`);

  // registry + sound map
  if (!registry.includes(`"${slug}": ${component},`)) fail(`${where} missing from the registry`);
  if (!registry.includes(`from "./icons/${slug}"`)) fail(`${where} registry does not import ./icons/${slug}`);
  if (!sounds.includes(`"${slug}": `)) fail(`${where} missing from icon-sounds.ts`);

  // scenes
  const block = new RegExp(`"${slug}": \\[\\n((?:    \\{ scene:.*\\n)+)  \\],`).exec(uses);
  if (!block) fail(`${where} has no where-to-use scenes`);
  else {
    const rows = block[1].trim().split("\n");
    if (rows.length < 4) fail(`${where} needs 4 scenes, has ${rows.length}`);
    for (const r of rows) {
      if (!/label: "[^"]+"/.test(r) || !/title: "[^"]+"/.test(r) || !/body: "[^"]{8,}"/.test(r)) fail(`${where} a scene is missing its title, label or body`);
    }
  }

  // the icon file
  const f = iconFiles.has(slug) ? read(`src/components/nx-icons/icons/${slug}.tsx`) : "";
  if (!f) { fail(`${where} icon file missing`); continue; }
  if (!f.startsWith('"use client";')) fail(`${where} icon file must start with "use client"`);
  const imports = [...f.matchAll(/^import .* from "([^"]+)";/gm)].map((m) => m[1]);
  for (const i of imports) if (!["react", "framer-motion"].includes(i)) fail(`${where} imports "${i}": icons may use only react and framer-motion`);
  if (!f.includes(`export function ${component}(`)) fail(`${where} does not export function ${component}`);
  if (!f.includes("useReducedMotion")) fail(`${where} ignores reduced motion`);
  if (!/aria-hidden="true"/.test(f)) fail(`${where} svg must be aria-hidden (icons are decorative)`);
  if (!f.includes('viewBox="0 0 24 24"')) fail(`${where} must draw on a 24 by 24 grid`);
  if (!f.includes('overflow="visible"')) fail(`${where} svg must be overflow visible so motion is never clipped`);
  for (const prop of ["size", "strokeWidth", "className", "speed", "accent", "play"]) if (!new RegExp(`\\b${prop}\\b`).test(f.split("return (")[0])) fail(`${where} missing prop ${prop}`);
  if (/\bMath\.random\b|\bDate\.now\b|window\.|document\./.test(f)) fail(`${where} uses a non-deterministic or browser-only API during render`);
  if (/duration: [0-9.]+(?! \/ speed)[,}\s]/.test(f.replace(/duration: [0-9.]+ \/ speed/g, ""))) fail(`${where} has a duration that does not follow speed`);

  // the sound
  const s = soundFiles.has(slug) ? read(`src/components/nx-icons/sounds/${slug}.ts`) : "";
  if (!s) { fail(`${where} sound score missing`); continue; }
  const len = Number(/export const length = ([0-9.]+);/.exec(s)?.[1]);
  const level = Number(/export const level = ([0-9.]+);/.exec(s)?.[1]);
  if (!(len >= 0.4 && len <= 3)) fail(`${where} sound length ${len} outside 0.4 to 3 seconds`);
  if (!(level >= 0.35 && level <= 3)) fail(`${where} sound level ${level} outside 0.35 to 3`);
  if (!s.includes("export function play(c: AudioContext, o: AudioNode, t: Time)")) fail(`${where} sound must export play(c, o, t)`);
  for (const i of [...s.matchAll(/^import .* from "([^"]+)";/gm)].map((m) => m[1])) if (i !== "../sound-kit") fail(`${where} sound imports "${i}": scores may use only ../sound-kit`);
  const body = s.slice(s.indexOf("export function play"));
  if (/\bMath\.random\b|\bawait\b|\bnew\b/.test(body)) fail(`${where} sound uses a forbidden construct`);
  const seq = (body.match(/N\.[A-G]\d/g) ?? []).join(" ");
  if (seq.split(" ").length >= 3) {
    if (noteSeqs.has(seq)) fail(`${where} shares its note sequence with ${noteSeqs.get(seq)}: every sound should be its own`);
    else noteSeqs.set(seq, slug);
  }
}

if (errors.length) {
  console.error(`\nIcon check failed (${errors.length}):\n` + errors.map((e) => `  - ${e}`).join("\n") + "\n");
  process.exit(1);
}
console.log(`Icon check passed: ${slugs.length} icons (${freeActual} free, ${slugs.length - freeActual} Pro), ${soundFiles.size} sounds, ${categories.size} categories.`);

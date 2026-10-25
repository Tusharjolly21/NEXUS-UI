/**
 * Finds which free sounds each component plays, by reading the component source for play("name")
 * calls, and writes src/lib/catalog/sound-usage.generated.json: { soundName: [{ slug, name }] }.
 * The /sounds page shows it as "Used by", so the list is always what the code really does.
 * Runs before every build; run it by hand after changing which sound a component plays.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = fs.readFileSync(path.join(root, "src/lib/catalog/library-components.ts"), "utf8");
const soundsSrc = fs.readFileSync(path.join(root, "src/lib/catalog/component-sounds.ts"), "utf8");
const withSound = new Set([...soundsSrc.matchAll(/^  "([a-z0-9-]+)": "/gm)].map((m) => m[1]));

// slug, name and the folder the component's source lives in (the registry name when it has one)
const comps = [];
for (const chunk of catalog.split(/\n  \{\n    slug: "/).slice(1)) {
  const slug = chunk.slice(0, chunk.indexOf('"'));
  const name = /\n    name: "((?:[^"\\]|\\.)*)"/.exec(chunk)?.[1];
  const cli = /\n    registryCliName: "([^"]+)"/.exec(chunk)?.[1];
  if (name && withSound.has(slug)) comps.push({ slug, name, dirs: [...new Set([slug, cli].filter(Boolean))] });
}

function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.tsx?$/.test(e.name) && !/^(demo|preview)\./.test(e.name) ? [p] : [];
  });
}

const { SOUND_NAMES } = await (async () => {
  const src = fs.readFileSync(path.join(root, "src/lib/ui-sounds.ts"), "utf8");
  const body = src.slice(src.indexOf("export const SOUNDS = {"), src.indexOf("} satisfies Record<string, Def>"));
  return { SOUND_NAMES: new Set([...body.matchAll(/^  ([a-z]+): \{ category:/gm)].map((m) => m[1])) };
})();

// Pro sound names (some have hyphens), so the page can show which components play them too.
const PRO_NAMES = new Set(
  [...fs.readFileSync(path.join(root, "src/lib/ui-sounds-pro.ts"), "utf8").matchAll(/^  (?:"([a-z-]+)"|([a-z]+)): \{ category:/gm)].map((m) => m[1] ?? m[2]),
);
const KNOWN = new Set([...SOUND_NAMES, ...PRO_NAMES]);

// Every sound name written as a string inside a play(...), play.auto(...), playSound(...) or sfx(...) call, including
// ones in a ternary like play(on ? "on" : "off"). Parentheses are matched, so nested calls work.
function soundNamesIn(text) {
  const names = new Set();
  for (const m of text.matchAll(/\b(?:play|playSound|playProSound|sfx)(?:\.auto)?\(/g)) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    for (; i < text.length && depth > 0; i++) {
      if (text[i] === "(") depth++;
      else if (text[i] === ")") depth--;
    }
    for (const q of text.slice(start, i).matchAll(/["']([a-z]+(?:-[a-z]+)*)["']/g)) if (KNOWN.has(q[1])) names.add(q[1]);
  }
  return names;
}

// The Pro sound list on the page must match the recipes in the Pro file.
{
  const pro = fs.readFileSync(path.join(root, "src/lib/ui-sounds-pro.ts"), "utf8");
  const meta = fs.readFileSync(path.join(root, "src/lib/ui-sounds-pro-meta.ts"), "utf8");
  const defined = [...pro.matchAll(/^  (?:"([a-z-]+)"|([a-z]+)): \{ category: "([^"]+)", label: "([^"]+)"/gm)].map((m) => `${m[1] ?? m[2]}|${m[3]}|${m[4]}`).sort();
  const listed = [...meta.matchAll(/\{ name: "([a-z-]+)", label: "([^"]+)", category: "([^"]+)" \}/g)].map((m) => `${m[1]}|${m[3]}|${m[2]}`).sort();
  if (defined.length === 0 || defined.join("\n") !== listed.join("\n")) {
    console.error("ui-sounds-pro-meta.ts does not match PRO_SOUNDS in ui-sounds-pro.ts.");
    process.exit(1);
  }
}

// The recorded Pro sounds on the page must match the player, and each needs its recording.
{
  const rec = fs.readFileSync(path.join(root, "src/lib/ui-sounds-recorded.ts"), "utf8");
  const meta = fs.readFileSync(path.join(root, "src/lib/ui-sounds-recorded-meta.ts"), "utf8");
  const defined = [...rec.matchAll(/^  ([a-z]+): define\("\1", "([^"]+)"\),/gm)].map((m) => `${m[1]}|${m[2]}`).sort();
  const listed = [...meta.matchAll(/\{ name: "([a-z]+)", label: "([^"]+)", category: "Recorded"/g)].map((m) => `${m[1]}|${m[2]}`).sort();
  const missing = defined.map((d) => d.split("|")[0]).filter((n) => !fs.existsSync(path.join(root, "assets-pro/sounds", `${n}.mp3`)) || !fs.existsSync(path.join(root, "public/sounds/preview", `${n}.mp3`)));
  if (defined.length === 0 || defined.join("\n") !== listed.join("\n") || missing.length) {
    console.error("ui-sounds-recorded-meta.ts must match ui-sounds-recorded.ts, and every sound needs assets-pro/sounds/<name>.mp3 and public/sounds/preview/<name>.mp3." + (missing.length ? ` Missing: ${missing.join(", ")}.` : ""));
    process.exit(1);
  }
}

// The Mac style must voice every free sound, and the page's labels must match its recipes.
{
  const mac = fs.readFileSync(path.join(root, "src/lib/ui-sounds-mac.ts"), "utf8");
  const meta = fs.readFileSync(path.join(root, "src/lib/ui-sounds-mac-meta.ts"), "utf8");
  const defined = [...mac.matchAll(/^  ([a-z]+): \{ category: "[^"]+", label: "([^"]+)"/gm)].map((m) => `${m[1]}|${m[2]}`).sort();
  const listed = [...meta.matchAll(/^  ([a-z]+): "([^"]+)",/gm)].map((m) => `${m[1]}|${m[2]}`).sort();
  const names = defined.map((d) => d.split("|")[0]).join(",");
  if (defined.length === 0 || defined.join("\n") !== listed.join("\n") || names !== [...SOUND_NAMES].sort().join(",")) {
    console.error("ui-sounds-mac.ts must voice every sound in ui-sounds.ts, and ui-sounds-mac-meta.ts must match it.");
    process.exit(1);
  }
}

const usage = {};
for (const c of comps) {
  const found = new Set();
  for (const d of c.dirs) {
    const list = [...files(path.join(root, "src/components", d)), ...(fs.existsSync(path.join(root, "src/components", `${d}.tsx`)) ? [path.join(root, "src/components", `${d}.tsx`)] : [])];
    for (const f of list) {
      const text = fs.readFileSync(f, "utf8");
      for (const name of soundNamesIn(text)) found.add(name);
    }
  }
  for (const s of found) (usage[s] ??= []).push({ slug: c.slug, name: c.name });
}
for (const s of Object.keys(usage)) usage[s].sort((a, b) => a.name.localeCompare(b.name));
const sorted = Object.fromEntries(Object.entries(usage).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(path.join(root, "src/lib/catalog/sound-usage.generated.json"), `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Sound usage: ${Object.keys(sorted).length} sounds used by ${comps.length} components.`);

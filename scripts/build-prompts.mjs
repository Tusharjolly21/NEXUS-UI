/**
 * Writes content/build-prompts/<slug>.md for every component that has one, from the component's
 * real source (the server registry that registry:build writes to .generated/registry).
 *
 * A build prompt is what a visitor pastes into their AI agent to get the exact component. So it
 * is short instructions plus the actual code, not a description of the code: the code is the only
 * thing precise enough to reproduce the component, and it can never drift from the real one.
 *
 * Blocks and templates keep their own prompts (content/build-prompts/blocks, /templates).
 * A component page with several variants keeps one brief per variant, each under its own
 * `# Title` heading (src/lib/build-prompts.ts splits the file on those headings); the titles come
 * from the existing file, in order.
 *
 * Run after registry:build (npm run build does both).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const promptsDir = path.join(root, "content", "build-prompts");
const registryDir = path.join(root, ".generated", "registry");

/** Catalog slug → registry file, where they differ. */
const REGISTRY_NAME = { "gooey-search-input": "gooey-input" };

/** Variant titles whose file name is not the title in dashes: "<slug>/<variant key>" → file name. */
const VARIANT_FILE = {
  "copy-button/selection-copy": "select-copy",
  "otp-input/underline-otp": "otp-line",
  "password-strength/crack-time-meter": "crack-time-password",
  "password-strength/suggested-password": "suggest-password",
};

const UTILS_FILE = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

const readItem = (name) => {
  const p = path.join(registryDir, `${name}.json`);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
};

const variantKey = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * The `# Title` headings of an existing prompt file, outside code fences, and whether text before
 * the first heading is a brief of its own (the page's main brief, as src/lib/build-prompts.ts reads it).
 */
function headingsOf(text) {
  const titles = [];
  const intro = [];
  let fence = false;
  for (const line of text.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const m = !fence && /^# (.+?)\s*$/.exec(line);
    if (m) titles.push(m[1]);
    else if (!titles.length) intro.push(line);
  }
  const words = intro.filter((l) => !/^(\s*|---|<!--.*-->|>.*)$/.test(l)).join(" ").split(/\s+/).filter(Boolean).length;
  return { titles, hasIntro: words >= 40 };
}

const langOf = (file) => (/\.tsx$/.test(file) ? "tsx" : /\.ts$/.test(file) ? "ts" : /\.css$/.test(file) ? "css" : /\.jsx?$/.test(file) ? "jsx" : "");

/** Relative imports of a file, resolved to other files in the same item. */
function localImports(file, files) {
  const dir = path.posix.dirname(file.target);
  const found = [];
  for (const m of file.content.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g)) {
    const base = path.posix.normalize(path.posix.join(dir, m[1]));
    const hit = files.find((f) => [".tsx", ".ts", "/index.ts", "/index.tsx", ".jsx", ".js", ".css", ""].some((e) => f.target === base + e));
    if (hit) found.push(hit);
  }
  return found;
}

function closure(start, files) {
  const seen = new Set();
  const order = [];
  const visit = (f) => {
    if (seen.has(f.target)) return;
    seen.add(f.target);
    for (const dep of localImports(f, files)) visit(dep);
    order.push(f);
  };
  for (const f of start) visit(f);
  return order;
}

/** The names a barrel file (or, failing that, the main file) exports. */
function exportedNames(files, entry) {
  const names = new Set();
  for (const f of entry) {
    for (const m of f.content.matchAll(/export\s*\{([^}]+)\}/g)) {
      for (const part of m[1].split(",")) {
        const n = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (n && !n.startsWith("type ")) names.add(n);
      }
    }
    for (const m of f.content.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+([A-Za-z0-9_]+)/g)) names.add(m[1]);
  }
  return [...names].filter((n) => /^[A-Z]/.test(n) && !/Demo$/.test(n));
}

function sharedLibs(files) {
  const need = new Set();
  const src = files.map((f) => f.content).join("\n");
  if (/@\/lib\/utils["']/.test(src)) need.add("utils");
  if (/@\/lib\/ui-sounds["']/.test(src)) need.add("ui-sounds");
  // the Pro sound pack builds on the free synthesiser, so a prompt that needs it ships both, free one first
  if (/@\/lib\/ui-sounds-pro["']/.test(src)) { need.add("ui-sounds"); need.add("ui-sounds-pro"); }
  if (/@\/lib\/typing-sound["']/.test(src)) need.add("typing-sound");
  if (need.has("typing-sound")) need.add("ui-sounds");
  return need;
}

function block(target, content) {
  const body = content.replace(/\s+$/, "");
  // A file that itself contains a fence must be wrapped in a longer one.
  const fence = /^\s*`{3,}/m.test(body) ? "````" : "```";
  return `--- ${target} ---\n\n${fence}${langOf(target)}\n${body}\n${fence}\n`;
}

function sectionFor({ title, heading = true, description, item, files, entryImport, main }) {
  const libs = sharedLibs(files);
  const npm = (item.dependencies ?? []).filter((d) => d !== "react" && d !== "react-dom");
  if (libs.has("utils")) for (const d of ["clsx", "tailwind-merge"]) if (!npm.includes(d)) npm.push(d);
  const shadcn = (item.registryDependencies ?? []).filter((d) => !/^https?:/.test(d) && d !== "utils");
  const src = files.map((f) => f.content).join("\n");
  const names = exportedNames(files, entryImport.files);

  const lines = [];
  // A file with no heading of its own is one brief for the whole page (served as "main"): keep it that way.
  if (heading) lines.push(`# ${title}`, "");
  lines.push(`Add the "${title}" component from Nexus UI to my project.`, "");
  if (description && main) lines.push(description, "");
  lines.push("Please:", "");
  let n = 1;
  const folder = [...new Set(files.map((f) => path.posix.dirname(f.target)))];
  lines.push(
    `${n++}. Create the files below at sensible paths for this project, keeping each file's name${folder.length === 1 ? "" : " and folder"}. They import each other with relative paths, so keep them together.`,
  );
  if (npm.length) lines.push(`${n++}. Install what it needs: ${npm.map((d) => "`" + d + "`").join(", ")} (use this project's package manager).`);
  if (shadcn.length) lines.push(`${n++}. It also builds on the shadcn ${shadcn.map((d) => "`" + d + "`").join(", ")} component${shadcn.length > 1 ? "s" : ""}. Add ${shadcn.length > 1 ? "them" : "it"} if missing (npx shadcn@latest add ${shadcn.join(" ")}).`);
  lines.push(`${n++}. It is styled with Tailwind CSS classes, so the project needs Tailwind.`);
  const sharedNames = [...libs].filter((l) => l !== "utils");
  if (libs.has("utils")) lines.push(`${n++}. It imports \`cn\` from \`@/lib/utils\`. If the project has no such helper, create it from the file below.`);
  if (sharedNames.length) {
    lines.push(
      `${n++}. It uses ${sharedNames.map((l) => "`@/lib/" + l + "`").join(" and ")} for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create ${sharedNames.length > 1 ? "them" : "it"} at lib/ from the file${sharedNames.length > 1 ? "s" : ""} below.`,
    );
  }
  const assets = [...new Set([...src.matchAll(/["'`](\/[A-Za-z0-9_\-/]+\.(?:jpg|jpeg|png|webp|avif|svg|mp3|ogg|wav|mp4|webm|glb))["'`]/g)].map((m) => m[1]))];
  if (assets.length) lines.push(`${n++}. The code refers to these files in /public: ${assets.map((a) => "`" + a + "`").join(", ")}. Point them at the project's own files (or leave them out if they are optional).`);
  if (/font-sans|--font-sans/.test(src)) lines.push(`${n++}. The look assumes the Inter font through Tailwind's \`font-sans\`. If the project uses another font, leave that as it is.`);
  if (names.length) lines.push(`${n++}. Use it like this: \`import { ${names.slice(0, 4).join(", ")} } from "${entryImport.path}";\`. The props are typed and documented in the code.`);
  lines.push("");
  lines.push(
    "Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.",
    "",
  );
  for (const f of files) lines.push(block(f.target, f.content));
  for (const l of sharedNames) {
    const lib = readItem(l);
    for (const f of lib?.files ?? []) lines.push(block(f.target ?? f.path, f.content));
  }
  if (libs.has("utils")) lines.push(block("lib/utils.ts", UTILS_FILE));
  return lines.join("\n");
}

const slugs = fs.readdirSync(promptsDir).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort();
const report = { written: 0, variants: 0, missing: [], fallback: [] };

for (const slug of slugs) {
  const file = path.join(promptsDir, `${slug}.md`);
  const old = fs.readFileSync(file, "utf8");
  const item = readItem(REGISTRY_NAME[slug] ?? slug);
  if (!item) {
    report.missing.push(slug);
    continue;
  }
  const files = item.files.map((f) => ({ target: f.target ?? f.path, content: f.content }));
  const { titles, hasIntro } = headingsOf(old);
  const mainFile = files.find((f) => path.posix.basename(f.target).replace(/\.[a-z]+$/, "") === slug && !/index\./.test(f.target));
  const barrel = files.find((f) => /\/index\.tsx?$/.test(f.target) && path.posix.dirname(f.target) === `components/${slug}`);
  const importDir = barrel ? path.posix.dirname(barrel.target) : null;
  const title = item.title ?? titles[0] ?? slug;
  const sections = [];

  if (titles.length === 0 || (titles.length === 1 && !hasIntro)) {
    sections.push(
      sectionFor({
        title: titles[0] ?? title,
        heading: titles.length > 0,
        description: item.description,
        item,
        files,
        entryImport: { files: barrel ? [barrel] : mainFile ? [mainFile] : files, path: importDir ? `@/${importDir}` : `@/${(mainFile ?? files[0]).target.replace(/\.[a-z]+$/, "")}` },
        main: true,
      }),
    );
  } else {
    // A brief before the first heading is the page's own (main) one: the main file, then each variant.
    if (hasIntro) {
      const start = mainFile ?? files[0];
      sections.push(
        sectionFor({
          title,
          heading: false,
          description: item.description,
          item,
          files: closure([start], files),
          entryImport: { files: [start], path: `@/${start.target.replace(/\.[a-z]+$/, "")}` },
          main: true,
        }),
      );
    }
    titles.forEach((t, i) => {
      const key = VARIANT_FILE[`${slug}/${variantKey(t)}`] ?? variantKey(t);
      let start = files.find((f) => variantKey(path.posix.basename(f.target).replace(/\.[a-z]+$/, "")) === key && !/index\./.test(f.target));
      if (!start && i === 0 && !hasIntro) start = mainFile;
      let chosen;
      if (start) chosen = closure([start], files);
      else {
        report.fallback.push(`${slug}: "${t}"`);
        chosen = files;
      }
      const entry = start ?? mainFile ?? files[0];
      sections.push(
        sectionFor({
          title: t,
          description: i === 0 && !hasIntro ? item.description : "",
          item,
          files: chosen,
          entryImport: { files: [entry], path: `@/${entry.target.replace(/\.[a-z]+$/, "")}` },
          main: i === 0 && !hasIntro,
        }),
      );
      report.variants++;
    });
  }
  fs.writeFileSync(file, sections.map((s) => s.replace(/\s+$/, "")).join("\n\n") + "\n");
  report.written++;
}

console.log(`Wrote ${report.written} build prompts (${report.variants} variant sections).`);
if (report.missing.length) console.log("No registry item, left as they were:", report.missing.join(", "));
if (report.fallback.length) console.log("Variants with no matching file (got all files):", report.fallback.join("; "));

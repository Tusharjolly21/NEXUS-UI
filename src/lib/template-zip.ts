/**
 * template-zip.ts — SERVER ONLY (reads the file system)
 *
 * Builds the source download for one template: a standalone Next.js 16 + Tailwind CSS 4 project
 * that runs with `npm install && npm run dev`, plus a README with step-by-step instructions and the
 * template's build prompt (PROMPT.md).
 *
 * What goes in, and nothing else:
 *  - the page file from `TEMPLATE_SOURCES`, and every local file it imports, followed transitively;
 *  - every file under `public/` the code references by a literal path ("/videos/hero.mp4");
 *  - generated project files (package.json with the packages the code imports, tsconfig, layout…).
 *
 * Safety: the entry comes from a fixed map (never from the request), imports must resolve inside
 * an allowlist of source folders (no dotfiles, no `.env`, no server code such as `src/lib/supabase`),
 * real paths are checked after symlinks, and public assets must stay inside `public/`. Nothing in
 * the output contains an absolute path or a secret. Access control lives in the route, not here.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { builtinModules } from "node:module";
import JSZip from "jszip";
import { getTemplate } from "@/lib/catalog/templates";
import { legalConfig } from "@/lib/legal";
import { getTemplateSource, templateEntryPath, templatePromptPath } from "@/lib/template-sources";

export class TemplateZipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateZipError";
  }
}

const SITE_URL = "https://nexus-ui.com";

/** Extensions a source import may resolve to, in resolution order. */
const SOURCE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".css", ".json"];
const CODE_FILE = /\.(?:[cm]?[jt]sx?)$/i;
const PUBLIC_ASSET_EXTENSIONS =
  /\.(?:avif|gif|glb|gltf|hdr|ico|jpe?g|json|mp3|mp4|ogg|otf|png|svg|ttf|wav|webm|webp|woff2?)$/i;
/** A literal root-relative path inside quotes or url(), e.g. "/videos/hero.mp4". */
const PUBLIC_ASSET_REFERENCE =
  /["'`(]\/([A-Za-z0-9_@][^"'`()\s?#]*?\.(?:avif|gif|glb|gltf|hdr|ico|jpe?g|json|mp3|mp4|ogg|otf|png|svg|ttf|wav|webm|webp|woff2?))(?:[?#][^"'`()\s]*)?(?=["'`)])/gi;

/** Packages every zip ships with, whatever the template imports. */
const BASE_DEPENDENCIES = ["next", "react", "react-dom"];
const BASE_DEV_DEPENDENCIES = [
  "@tailwindcss/postcss",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "postcss",
  "tailwindcss",
  "typescript",
];

const NODE_BUILTINS = new Set(builtinModules);

// ─── Path safety ─────────────────────────────────────────────────────────────

export function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

/** True when `absolutePath` is `root` or inside it. Both must be absolute and normalised. */
export function isWithinRoot(absolutePath: string, root: string = process.cwd()) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(absolutePath);
  return resolved === resolvedRoot || resolved.startsWith(`${resolvedRoot}${path.sep}`);
}

function hasUnsafeSegments(relativePath: string) {
  if (!relativePath || relativePath.includes("\\") || relativePath.includes("\0")) return true;
  if (relativePath.startsWith("/") || /^[A-Za-z]:/.test(relativePath)) return true;
  return relativePath.split("/").some((segment) => segment === "" || segment === "." || segment === ".." || segment.startsWith("."));
}

/**
 * May this project-relative file go into a zip as source? Only code, CSS and JSON under the
 * folders templates are built from. Server code (`src/lib/*` apart from `utils.ts`, `src/app`) and
 * dotfiles such as `.env` are never allowed.
 */
export function isAllowedSourcePath(relativePath: string) {
  if (hasUnsafeSegments(relativePath)) return false;
  if (path.posix.normalize(relativePath) !== relativePath) return false;
  if (!SOURCE_EXTENSIONS.some((extension) => relativePath.endsWith(extension))) return false;
  return (
    relativePath.startsWith("src/components/") ||
    relativePath.startsWith("src/hooks/") ||
    relativePath === "src/lib/utils.ts" ||
    (relativePath.startsWith("src/@types/") && relativePath.endsWith(".d.ts"))
  );
}

/**
 * Maps a referenced URL path ("videos/hero.mp4", without the leading slash) to its file under
 * `public/`, or null when it could escape `public/`, names a dotfile or isn't a known asset type.
 */
export function toPublicAssetPath(reference: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(reference);
  } catch {
    return null;
  }
  if (hasUnsafeSegments(decoded)) return null;
  if (!PUBLIC_ASSET_EXTENSIONS.test(decoded)) return null;
  return `public/${decoded}`;
}

async function isFile(absolutePath: string) {
  try {
    return (await fs.stat(absolutePath)).isFile();
  } catch {
    return false;
  }
}

/** The real path is inside the real root (so a symlink can't point a zip at /etc or ~/.ssh). */
async function realPathWithinRoot(absolutePath: string, root: string) {
  try {
    const [realFile, realRoot] = await Promise.all([fs.realpath(absolutePath), fs.realpath(root)]);
    return isWithinRoot(realFile, realRoot);
  } catch {
    return false;
  }
}

export type ImportResolution =
  | { status: "ok"; path: string }
  | { status: "blocked"; path: string }
  | { status: "missing" };

/**
 * Resolves a local import ("./x", "../x" or "@/x") from `fromPath` (project-relative) to a
 * project-relative file. Returns "blocked" for anything outside the allowed source folders.
 */
export async function resolveLocalImport(
  fromPath: string,
  specifier: string,
  root: string = process.cwd(),
): Promise<ImportResolution> {
  let base: string;
  if (specifier.startsWith("@/")) base = path.resolve(root, "src", specifier.slice(2));
  else if (specifier.startsWith("./") || specifier.startsWith("../")) base = path.resolve(root, path.dirname(fromPath), specifier);
  else return { status: "missing" };

  if (!isWithinRoot(base, root)) return { status: "blocked", path: specifier };

  const candidates = [
    base,
    ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ];

  for (const candidate of candidates) {
    if (!(await isFile(candidate))) continue;
    const relativePath = toPosixPath(path.relative(root, candidate));
    if (!isAllowedSourcePath(relativePath) || !(await realPathWithinRoot(candidate, root))) {
      return { status: "blocked", path: relativePath };
    }
    return { status: "ok", path: relativePath };
  }
  return { status: "missing" };
}

// ─── Import scanning ─────────────────────────────────────────────────────────

const REGEX_PRECEDERS = new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "~", "^"]);
const REGEX_KEYWORDS = new Set(["return", "typeof", "case", "do", "else", "in", "of", "new", "delete", "void", "throw", "yield", "await"]);

/**
 * Blanks comments, template-literal text and regex bodies (keeping line breaks and quoted strings),
 * so that import-looking text inside them, such as a code sample in the page copy, isn't followed.
 */
export function maskSource(source: string): string {
  const out = source.split("");
  const blank = (from: number, to: number) => {
    for (let k = from; k < to && k < out.length; k++) if (out[k] !== "\n") out[k] = " ";
  };
  const stack: Array<{ kind: "code"; depth: number } | { kind: "template" }> = [{ kind: "code", depth: 0 }];
  let lastSignificant = "";
  let i = 0;

  const previousWord = (index: number) => {
    let j = index - 1;
    while (j >= 0 && /\s/.test(source[j])) j--;
    let k = j;
    while (k >= 0 && /[\w$]/.test(source[k])) k--;
    return source.slice(k + 1, j + 1);
  };

  while (i < source.length) {
    const frame = stack[stack.length - 1];
    const c = source[i];

    if (frame.kind === "template") {
      if (c === "\\") {
        blank(i, i + 2);
        i += 2;
      } else if (c === "`") {
        stack.pop();
        lastSignificant = "`";
        i++;
      } else if (c === "$" && source[i + 1] === "{") {
        stack.push({ kind: "code", depth: 0 });
        lastSignificant = "{";
        i += 2;
      } else {
        blank(i, i + 1);
        i++;
      }
      continue;
    }

    if (c === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? source.length : end;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (c === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? source.length : end + 2;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < source.length && source[j] !== c && source[j] !== "\n") j += source[j] === "\\" ? 2 : 1;
      lastSignificant = c;
      i = j + 1;
      continue;
    }
    if (c === "`") {
      stack.push({ kind: "template" });
      i++;
      continue;
    }
    if (c === "/" && (REGEX_PRECEDERS.has(lastSignificant) || REGEX_KEYWORDS.has(previousWord(i)))) {
      let j = i + 1;
      let inClass = false;
      while (j < source.length && source[j] !== "\n") {
        const d = source[j];
        if (d === "\\") {
          j += 2;
          continue;
        }
        if (inClass) {
          if (d === "]") inClass = false;
        } else if (d === "[") inClass = true;
        else if (d === "/") break;
        j++;
      }
      blank(i + 1, j);
      lastSignificant = "/";
      i = j + 1;
      continue;
    }
    if (c === "{") frame.depth++;
    if (c === "}") {
      if (frame.depth === 0 && stack.length > 1) {
        stack.pop();
        lastSignificant = "}";
        i++;
        continue;
      }
      frame.depth--;
    }
    if (!/\s/.test(c)) lastSignificant = /[\w$]/.test(c) ? "a" : c;
    i++;
  }
  return out.join("");
}

const STATIC_IMPORT = /(?:^|[;{}\n])[ \t]*(?:import|export)\s+[\w$*{},\s]*?\bfrom\s*(["'])([^"'\n]+)\1/g;
const SIDE_EFFECT_IMPORT = /(?:^|[;{}\n])[ \t]*import\s*(["'])([^"'\n]+)\1/g;
const DYNAMIC_IMPORT = /\bimport\s*\(\s*(["'])([^"'\n]+)\1\s*[,)]/g;
const REQUIRE_CALL = /\brequire\s*\(\s*(["'])([^"'\n]+)\1\s*\)/g;
const CSS_IMPORT = /@import\s+(?:url\(\s*)?(["'])([^"'\n]+)\1/g;

/** Every module specifier a source file imports (static, side-effect, dynamic, require, CSS @import). */
export function getImportedSpecifiers(source: string, filePath: string): string[] {
  const specifiers = new Set<string>();
  if (filePath.endsWith(".css")) {
    const css = source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    for (const match of css.matchAll(CSS_IMPORT)) specifiers.add(match[2]);
    return [...specifiers];
  }
  if (!CODE_FILE.test(filePath)) return [];
  const masked = maskSource(source);
  for (const pattern of [STATIC_IMPORT, SIDE_EFFECT_IMPORT, DYNAMIC_IMPORT, REQUIRE_CALL]) {
    for (const match of masked.matchAll(pattern)) specifiers.add(match[2]);
  }
  return [...specifiers];
}

/** Public files referenced by literal path, as "public/…" paths (unchecked against the disk). */
export function getReferencedPublicAssets(source: string): string[] {
  const assets = new Set<string>();
  for (const match of source.matchAll(PUBLIC_ASSET_REFERENCE)) {
    const assetPath = toPublicAssetPath(match[1]);
    if (assetPath) assets.add(assetPath);
  }
  return [...assets];
}

/** The npm package a bare specifier belongs to ("gsap/all" → "gsap"), or null for local/builtin ones. */
export function getPackageName(specifier: string): string | null {
  if (/^(?:\.|\/|@\/|node:|[A-Za-z]:)/.test(specifier) || specifier.includes("\\")) return null;
  const parts = specifier.split("/");
  const name = specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  if (!/^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/i.test(name)) return null;
  if (NODE_BUILTINS.has(name)) return null;
  return name;
}

// ─── Versions ────────────────────────────────────────────────────────────────

type RootPackageJson = { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
type PackageLock = { packages?: Record<string, { version?: string }> };

async function readJson<T>(relativePath: string, root: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(root, relativePath), "utf8")) as T;
  } catch {
    return null;
  }
}

function typesPackageFor(name: string) {
  return name.startsWith("@") ? `@types/${name.slice(1).replace("/", "__")}` : `@types/${name}`;
}

// ─── Plan ────────────────────────────────────────────────────────────────────

export type TemplateZipFile = { path: string; kind: "source" | "asset" | "generated" };

export type TemplateZipPlan = {
  slug: string;
  /** Top-level folder inside the zip. */
  folder: string;
  title: string;
  description: string;
  /** Project-relative page file, e.g. "src/components/templates/relay-page.tsx". */
  entry: string;
  /** The export page.tsx renders ("default" or a name). */
  exportName: string;
  sources: string[];
  assets: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  /** Content/build-prompts/templates/<slug>.md exists and goes in as PROMPT.md. */
  hasPrompt: boolean;
  accent: string | null;
  /** Everything in the zip, relative to `folder`. */
  files: TemplateZipFile[];
};

const NEUTRAL_COLOURS = new Set([
  "#000000", "#ffffff", "#1d1d1f", "#6e6e73", "#86868b", "#f5f5f7", "#fbfbfd", "#a1a1a6", "#d2d2d7", "#e8e8ed", "#424245", "#fafafa",
]);

/** The template's accent: an `accent` set in the catalog, else its most used non-neutral colour. */
function detectAccent(entrySource: string, catalogAccent: unknown): string | null {
  if (typeof catalogAccent === "string" && /^#[0-9a-f]{6}$/i.test(catalogAccent)) return catalogAccent.toLowerCase();
  const counts = new Map<string, number>();
  for (const match of entrySource.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    const colour = match[0].toLowerCase();
    if (!NEUTRAL_COLOURS.has(colour)) counts.set(colour, (counts.get(colour) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] ?? null;
}

function hasExport(source: string, exportName: string) {
  const masked = maskSource(source);
  if (exportName === "default") return /\bexport\s+default\b/.test(masked) || /\bexport\s*\{[^}]*\bas\s+default\b/.test(masked);
  const name = exportName.replace(/[^\w$]/g, "");
  return (
    new RegExp(`\\bexport\\s+(?:async\\s+)?(?:function\\*?|const|let|var|class)\\s+${name}\\b`).test(masked) ||
    new RegExp(`\\bexport\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`).test(masked)
  );
}

/**
 * Works out everything that goes into the zip for `slug`, without reading file contents into the
 * archive. Throws TemplateZipError when the slug has no source or an import can't be shipped.
 */
export async function planTemplateZip(slug: string, root: string = process.cwd()): Promise<TemplateZipPlan> {
  const source = getTemplateSource(slug);
  if (!source) throw new TemplateZipError(`No template source for "${slug}"`);
  const entry = templateEntryPath(source);
  if (!isAllowedSourcePath(entry) || !(await isFile(path.join(root, entry)))) {
    throw new TemplateZipError(`Template entry missing for "${slug}"`);
  }

  const sources = new Set<string>();
  const assets = new Set<string>();
  const packages = new Map<string, string>(); // package → first file that imports it
  const problems: string[] = [];
  const queue = [entry];

  while (queue.length) {
    const current = queue.shift()!;
    if (sources.has(current)) continue;
    sources.add(current);
    const contents = await fs.readFile(path.join(root, current), "utf8");

    for (const assetPath of getReferencedPublicAssets(contents)) {
      const absolute = path.join(root, assetPath);
      if ((await isFile(absolute)) && (await realPathWithinRoot(absolute, path.join(root, "public")))) assets.add(assetPath);
    }

    for (const specifier of getImportedSpecifiers(contents, current)) {
      if (specifier.startsWith(".") || specifier.startsWith("@/")) {
        const resolved = await resolveLocalImport(current, specifier, root);
        if (resolved.status === "ok") queue.push(resolved.path);
        else if (resolved.status === "blocked") problems.push(`${current}: import "${specifier}" is outside the shippable source folders`);
        else problems.push(`${current}: import "${specifier}" does not resolve`);
        continue;
      }
      const name = getPackageName(specifier);
      if (name && !packages.has(name)) packages.set(name, current);
    }
  }

  // Ambient type declarations the repo keeps for untyped packages (src/@types/<pkg>.d.ts).
  for (const name of packages.keys()) {
    const declaration = `src/@types/${name.replace(/^@/, "").replace("/", "__")}.d.ts`;
    if (isAllowedSourcePath(declaration) && (await isFile(path.join(root, declaration)))) sources.add(declaration);
  }

  const rootPackage = (await readJson<RootPackageJson>("package.json", root)) ?? {};
  const lock = (await readJson<PackageLock>("package-lock.json", root)) ?? {};
  const declared = { ...rootPackage.devDependencies, ...rootPackage.dependencies };
  const versionOf = (name: string): string | null => {
    const installed = lock.packages?.[`node_modules/${name}`]?.version;
    if (installed && /^\d+\.\d+\.\d+/.test(installed)) return installed;
    return declared[name] ?? null;
  };

  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  for (const name of [...BASE_DEPENDENCIES, ...[...packages.keys()].filter((n) => !BASE_DEPENDENCIES.includes(n))].sort()) {
    if (BASE_DEV_DEPENDENCIES.includes(name)) continue;
    const version = versionOf(name);
    if (!version || !(name in declared)) {
      problems.push(`${packages.get(name) ?? "base"}: package "${name}" is not a dependency of the site`);
      continue;
    }
    dependencies[name] = version;
    const types = typesPackageFor(name);
    if (types in declared && versionOf(types)) devDependencies[types] = versionOf(types)!;
  }
  for (const name of BASE_DEV_DEPENDENCIES) {
    const version = versionOf(name);
    if (!version) problems.push(`base: dev package "${name}" has no installed version`);
    else devDependencies[name] = version;
  }

  if (problems.length) throw new TemplateZipError(`Template "${slug}" can't be packaged:\n- ${problems.join("\n- ")}`);

  const entrySource = await fs.readFile(path.join(root, entry), "utf8");
  let exportName: string = source.exportName;
  if (!hasExport(entrySource, exportName)) {
    if (hasExport(entrySource, "default")) exportName = "default";
    else throw new TemplateZipError(`Template "${slug}" has no export "${source.exportName}" or default export`);
  }

  const tmpl = getTemplate(slug);
  const hasPrompt = await isFile(path.join(root, promptPath(slug)));
  const generated = [
    ".gitignore",
    "README.md",
    ...(hasPrompt ? ["PROMPT.md"] : []),
    "next.config.mjs",
    "package.json",
    "postcss.config.mjs",
    "tsconfig.json",
    "src/app/globals.css",
    "src/app/layout.tsx",
    "src/app/page.tsx",
  ];
  const sortedSources = [...sources].sort();
  const sortedAssets = [...assets].sort();

  return {
    slug,
    folder: slug,
    title: tmpl?.title ?? slug,
    description: tmpl?.description ?? "",
    entry,
    exportName,
    sources: sortedSources,
    assets: sortedAssets,
    dependencies,
    devDependencies,
    hasPrompt,
    accent: detectAccent(entrySource, (tmpl as { accent?: unknown } | undefined)?.accent),
    files: [
      ...generated.map((p) => ({ path: p, kind: "generated" as const })),
      ...sortedSources.map((p) => ({ path: p, kind: "source" as const })),
      ...sortedAssets.map((p) => ({ path: p, kind: "asset" as const })),
    ].sort((a, b) => a.path.localeCompare(b.path)),
  };
}

function promptPath(slug: string) {
  const file = templatePromptPath(slug);
  if (!file) throw new TemplateZipError("Invalid slug");
  return file;
}

// ─── Generated files ─────────────────────────────────────────────────────────

function importPathFor(entry: string) {
  return `@/${entry.replace(/^src\//, "").replace(/\.[^.]+$/, "")}`;
}

function pageImportLine(plan: TemplateZipPlan) {
  const from = importPathFor(plan.entry);
  return plan.exportName === "default"
    ? `import TemplatePage from "${from}";`
    : `import { ${plan.exportName} as TemplatePage } from "${from}";`;
}

function sortKeys(record: Record<string, string>) {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

function packageJson(plan: TemplateZipPlan) {
  return `${JSON.stringify(
    {
      name: plan.slug,
      version: "0.1.0",
      private: true,
      engines: { node: ">=20.9.0" },
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: sortKeys(plan.dependencies),
      devDependencies: sortKeys(plan.devDependencies),
    },
    null,
    2,
  )}\n`;
}

const TSCONFIG = `${JSON.stringify(
  {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "react-jsx",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./src/*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.mts", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
    exclude: ["node_modules"],
  },
  null,
  2,
)}\n`;

const NEXT_CONFIG = `import path from "node:path";
import { fileURLToPath } from "node:url";

// Pin the project root to this folder, so a lockfile in a parent folder (for example in your home
// folder) doesn't make Next.js guess a different workspace root.
const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default nextConfig;
`;

const POSTCSS_CONFIG = `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`;

const GLOBALS_CSS = `@import "tailwindcss";

/*
 * The template hard-codes its colours, so it needs no theme tokens. These two lines give Tailwind's
 * font-sans and font-mono the system font stacks the template is designed with (nothing is
 * downloaded, so builds work offline).
 */
@theme {
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace;
}

@layer base {
  /* Tailwind 4 dropped the pointer cursor on buttons; restore it */
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]) {
    cursor: pointer;
  }
}
`;

const GITIGNORE = `# dependencies
/node_modules

# next.js
/.next/
/out/
next-env.d.ts
*.tsbuildinfo

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files
.env*

# vercel
.vercel
`;

function layoutTsx(plan: TemplateZipPlan) {
  return `import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: ${JSON.stringify(plan.title)},
  description: ${JSON.stringify(plan.description)},
};

export const viewport: Viewport = {
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`;
}

function pageTsx(plan: TemplateZipPlan) {
  return `${pageImportLine(plan)}

export default function HomePage() {
  return <TemplatePage />;
}
`;
}

/** An ASCII tree of the zip, for the README. */
function fileTree(folder: string, paths: string[]) {
  type Node = Map<string, Node>;
  const tree: Node = new Map();
  for (const p of paths) {
    let node = tree;
    for (const part of p.split("/")) {
      if (!node.has(part)) node.set(part, new Map());
      node = node.get(part)!;
    }
  }
  const lines = [`${folder}/`];
  const walk = (node: Node, prefix: string) => {
    const entries = [...node.entries()].sort(([a, an], [b, bn]) => Number(bn.size > 0) - Number(an.size > 0) || a.localeCompare(b));
    entries.forEach(([name, child], index) => {
      const last = index === entries.length - 1;
      lines.push(`${prefix}${last ? "└── " : "├── "}${name}${child.size ? "/" : ""}`);
      if (child.size) walk(child, `${prefix}${last ? "    " : "│   "}`);
    });
  };
  walk(tree, "");
  return lines.join("\n");
}

function readme(plan: TemplateZipPlan, entrySource: string) {
  const entryFile = plan.entry.split("/").pop()!;
  const entryImport = importPathFor(plan.entry);
  const routeName = plan.slug;
  const extraPackages = Object.entries(plan.dependencies).filter(([name]) => !BASE_DEPENDENCIES.includes(name));
  const extraTypes = Object.entries(plan.devDependencies).filter(([name]) => !BASE_DEV_DEPENDENCIES.includes(name));
  // The outermost folders that hold sources (sub-folders are copied along with them).
  const sourceFolders = [...new Set(plan.sources.map((s) => s.split("/").slice(0, -1).join("/")))]
    .sort()
    .filter((folder, _, all) => !all.some((other) => other !== folder && folder.startsWith(`${other}/`)));
  const shipsUtils = plan.sources.includes("src/lib/utils.ts");
  const usesKit = plan.sources.some((s) => s.startsWith("src/components/templates/kit/"));
  const hasReducedMotion = /reducedMotion=["']user["']/.test(entrySource);
  const accentConst = plan.accent
    ? entrySource.match(new RegExp(`const\\s+(\\w+)\\s*=\\s*["']${plan.accent}["']`, "i"))?.[1]
    : undefined;
  const accentRgb = plan.accent
    ? [1, 3, 5].map((i) => parseInt(plan.accent!.slice(i, i + 2), 16)).join(",")
    : null;
  const importLine =
    plan.exportName === "default"
      ? `import TemplatePage from "${entryImport}";`
      : `import { ${plan.exportName} as TemplatePage } from "${entryImport}";`;

  const sections: string[] = [];

  sections.push(`# ${plan.title}

${plan.description}

This folder is a complete, standalone Next.js 16 project (App Router, React 19, TypeScript, Tailwind CSS 4).
It contains the template page, every local file it imports, the images and media it uses, and the project
files needed to run it. Nothing is downloaded at build time (no Google Fonts, no remote images).

- Live preview: ${SITE_URL}/template-preview/${plan.slug}
- Template page: ${SITE_URL}/templates/${plan.slug}`);

  sections.push(`## What's inside

\`\`\`text
${fileTree(plan.folder, plan.files.map((f) => f.path))}
\`\`\`

| File | What it is |
| --- | --- |
| \`${plan.entry}\` | The template: every section, all the copy and the colours |
${usesKit ? "| `src/components/templates/kit/parts.tsx` | Shared page parts: nav, reveals, FAQ, sticky story, CTA band, footer |\n| `src/components/templates/kit/components/` | The Motion Kit components this page uses |\n" : ""}| \`src/app/page.tsx\` | Renders the template at \`/\` |
| \`src/app/layout.tsx\` | The root layout: page title and description |
| \`src/app/globals.css\` | Tailwind CSS 4 and the font stacks |
${plan.assets.length ? "| `public/` | Images, video and other media the template references |\n" : ""}${plan.hasPrompt ? "| `PROMPT.md` | The build prompt: a brief for an AI coding agent to rebuild this template from scratch |\n" : ""}| \`package.json\` | Exactly the packages the code imports, pinned to the versions it was tested with |`);

  sections.push(`## Option A: run it as its own project

1. **Install Node.js 20.9 or newer.** Check with \`node -v\`. Get it from https://nodejs.org if needed.
2. **Open a terminal in this folder** (the one with \`package.json\`):

   \`\`\`bash
   cd ${plan.folder}
   \`\`\`

3. **Install the packages:**

   \`\`\`bash
   npm install
   \`\`\`

4. **Start the dev server**, then open http://localhost:3000:

   \`\`\`bash
   npm run dev
   \`\`\`

5. **Build for production** (this also type-checks), and run the build locally:

   \`\`\`bash
   npm run build
   npm start
   \`\`\`

6. **Deploy to Vercel.** Either push the folder to a GitHub repository and import it at https://vercel.com/new
   (Vercel detects Next.js; no settings or environment variables are needed), or run \`npx vercel\` in this
   folder and follow the prompts. Any host that runs Next.js works too.

pnpm, yarn and bun work as well (\`pnpm install\`, \`pnpm dev\` and so on).`);

  const copyRows = [
    ...sourceFolders.map((folder) => {
      const target = folder.replace(/^src\//, "");
      return `| \`${folder}/\` (everything in it) | \`src/${target}/\`, or \`${target}/\` if your project has no \`src\` folder |`;
    }),
    ...(plan.assets.length ? ["| `public/` (the files in it) | your project's `public/`, keeping the same sub-folders |"] : []),
  ];

  sections.push(`## Option B: add it to an existing Next.js project

You need the App Router, React 19, Tailwind CSS 4 and TypeScript (Next.js 15 or 16).

1. **Install the packages the template uses:**

   \`\`\`bash
   ${extraPackages.length || extraTypes.length ? `npm i ${extraPackages.map(([n, v]) => `${n}@^${v.replace(/^[\^~]/, "")}`).join(" ")}${extraTypes.length ? `\n   npm i -D ${extraTypes.map(([n, v]) => `${n}@^${v.replace(/^[\^~]/, "")}`).join(" ")}` : ""}` : "# Nothing extra: the template only needs next, react and react-dom."}
   \`\`\`

2. **Copy the files** from this folder into your project:

   | From this folder | To your project |
   | --- | --- |
${copyRows.map((row) => `   ${row}`).join("\n")}

   Keep the folder structure as it is: the files import each other through the \`@/\` alias.
   Don't copy \`src/app\`, \`package.json\` or the config files; your project has its own.${shipsUtils ? "\n   If your project already has `lib/utils.ts` with a `cn()` helper (shadcn/ui projects do), keep yours: it is the same function." : ""}

3. **Check the \`@/\` import alias.** The files import each other as \`@/components/…\`. Your \`tsconfig.json\`
   needs this under \`compilerOptions\` (create-next-app sets it up by default):

   \`\`\`json
   "paths": { "@/*": ["./src/*"] }
   \`\`\`

   Use \`["./*"]\` instead if your project has no \`src\` folder. If you use a different alias, replace
   \`@/\` in the copied files' imports.

4. **Check your CSS.** Your global stylesheet (usually \`app/globals.css\`) must load Tailwind 4. The second rule
   gives buttons a pointer cursor, which Tailwind 4 no longer does by itself:

   \`\`\`css
   @import "tailwindcss";

   @layer base {
     button:not(:disabled),
     [role="button"]:not([aria-disabled="true"]) {
       cursor: pointer;
     }
   }
   \`\`\`

   Tailwind 4 finds the classes in the copied files automatically. If you put them in a folder that is
   git-ignored or outside the project, add \`@source "../components/templates";\` (path relative to the CSS
   file) after the import.

5. **Render it at a route.** Create \`src/app/${routeName}/page.tsx\` (or \`app/${routeName}/page.tsx\`):

   \`\`\`tsx
   ${importLine}

   export default function Page() {
     return <TemplatePage />;
   }
   \`\`\`

   The template sets its own background, text colour and light colour scheme, so it looks the same in a
   dark-mode site. If your root layout adds a header or padding around every page, move this route into a
   route group with its own layout, for example \`app/(landing)/${routeName}/page.tsx\`.

6. **Run \`npm run dev\`** and open http://localhost:3000/${routeName}.`);

  sections.push(`## Edit the copy and the colours

- **Copy:** everything you read on the page is in \`${plan.entry}\`, in the arrays and constants near the top of
  the file and in the JSX of each section. Search for a sentence you see in the browser to find it.${usesKit ? "\n- **Shared parts:** the nav, FAQ, sticky story, CTA band and footer are in `src/components/templates/kit/parts.tsx`\n  and take their content as props from the page file, so you rarely need to edit them." : ""}
- **Colours:** the template uses plain hex values in Tailwind classes (\`bg-[#f5f5f7]\`, \`text-[#1d1d1f]\`) and inline
  styles, not theme tokens, so it renders the same in any project. Change a colour by editing those values.
- **Page title and description:** \`src/app/layout.tsx\`.`);

  if (plan.accent) {
    sections.push(`### Swap the accent colour

The accent is \`${plan.accent}\`.${accentConst ? ` It is declared once as \`const ${accentConst} = "${plan.accent}"\` near the top of \`${entryFile}\`; change it there first.` : ""}
Then search the copied folders for the remaining uses and replace them:

- \`${plan.accent}\` (also try upper case), for example in \`bg-[${plan.accent}]\`;
- \`rgba(${accentRgb}\`, the same colour with transparency, used in shadows and glows.

Some Motion Kit components take a colour prop (such as \`accent\` or \`color\`); where the page sets one, it
passes the same value, so the search above finds it. Check your new colour against white for text contrast
(4.5:1 for body text).`);
  }

  sections.push(`## Reduced motion

${hasReducedMotion ? 'The page is wrapped in `<MotionConfig reducedMotion="user">`, so when a visitor turns on "Reduce motion" in their system settings, Framer Motion skips movement and keeps fades and colour changes.' : "Framer Motion follows the visitor's \"Reduce motion\" setting where the components opt in."} To test it, turn on
"Reduce motion" in your OS accessibility settings, or in Chrome DevTools open the Command menu, run "Show Rendering"
and set "Emulate CSS prefers-reduced-motion" to "reduce". Keep the wrapper if you move sections around.`);

  if (plan.hasPrompt) {
    sections.push(`## Build prompt

\`PROMPT.md\` is the brief an AI coding agent (Claude Code, Cursor, v0 and others) needs to rebuild this template
from scratch: the structure and copy, the exact colours, type sizes and radii, the motion values and the
accessibility rules. Paste it into your agent, or point the agent at the file, to make a variation of the page in
your own project.`);
  }

  sections.push(`## Packages

| Package | Version |
| --- | --- |
${Object.entries({ ...plan.dependencies, ...plan.devDependencies })
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, version]) => `| \`${name}\` | ${version} |`)
  .join("\n")}

The versions are the ones this template was built and tested with. Upgrading within the same major version is fine.`);

  sections.push(`## Licence

Your purchase or plan gives you the Nexus UI licence in section 5 of the terms (${SITE_URL}/terms#license): you
may use, copy and modify this template to build websites and apps ("End Products") for yourself or for clients.
You may not resell, share or redistribute the source on its own or with only minor changes, include it in a
template, theme, UI kit or marketplace that competes with Nexus UI, or publish it in a public repository. If you
keep a repository public, keep this code out of it.

Open-source packages (Next.js, React, Tailwind CSS, Framer Motion and the others above) are under their own
licences. Replace any placeholder images or media with your own before you ship.`);

  sections.push(`## Support

Email ${legalConfig.contactEmail} with the template name (${plan.title}), what you ran, and the full error
message. The output of \`node -v\` and \`npm -v\` helps too.

---
Downloaded from Nexus UI, ${SITE_URL}`);

  return `${sections.join("\n\n")}\n`;
}

// ─── Zip ─────────────────────────────────────────────────────────────────────

/** Builds the archive in memory. Every file sits under one top-level folder named after the slug. */
export async function createTemplateZip(slug: string, root: string = process.cwd()) {
  const plan = await planTemplateZip(slug, root);
  const zip = new JSZip();
  const folder = zip.folder(plan.folder)!;
  const entrySource = await fs.readFile(path.join(root, plan.entry), "utf8");

  for (const file of [...plan.sources, ...plan.assets]) {
    folder.file(file, await fs.readFile(path.join(root, file)));
  }

  folder.file(".gitignore", GITIGNORE);
  folder.file("README.md", readme(plan, entrySource));
  if (plan.hasPrompt) folder.file("PROMPT.md", await fs.readFile(path.join(root, promptPath(slug)), "utf8"));
  folder.file("next.config.mjs", NEXT_CONFIG);
  folder.file("package.json", packageJson(plan));
  folder.file("postcss.config.mjs", POSTCSS_CONFIG);
  folder.file("tsconfig.json", TSCONFIG);
  folder.file("src/app/globals.css", GLOBALS_CSS);
  folder.file("src/app/layout.tsx", layoutTsx(plan));
  folder.file("src/app/page.tsx", pageTsx(plan));

  return { zip, plan };
}

/** The finished zip as a Buffer (used by the verify script and tests). */
export async function buildTemplateZip(slug: string, root: string = process.cwd()): Promise<Buffer> {
  const { zip } = await createTemplateZip(slug, root);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
}

/**
 * Writes two files for the live previews:
 *   - src/registry/preview-loaders.generated.ts: for every preview, a function that loads just the module it lives in.
 *   - src/registry/preview-proxies.tsx: for every preview component, a small stand-in that loads its real module the
 *     first time it renders. The catalogue (server code) imports THESE, not the registry barrel.
 *
 * Why: the registry barrel (src/registry/component-previews.tsx) re-exports about 180 modules, so importing it to show
 * one preview pulls in every component's code, about 6 MB of script that has to be downloaded, parsed and run before the
 * first tile can draw (most of the blocking time on /components). A map from preview name to its own module lets the
 * bundler cut one chunk per module, and a page loads only the previews it shows.
 *
 * How: follows the barrel's `export * from` lines with the TypeScript parser, the same way build-home-snapshot.mjs does.
 * Each preview loads from the one module it lives in (src/registry/core/* for the ones that used to share one file).
 * Run `npm run previews:build` after adding a preview module or export (the build does it for you); `--check` fails if
 * the committed files are stale. A name missing from the map still works: the loader falls back to the barrel.
 *
 * Why the proxies: the barrel is a "use client" module, and a server module that imports it (the catalogue does, to hold
 * each component's preview) makes Next ship every preview's code to the visitor on every page that reads the catalogue,
 * about 8 MB of script on /components. A proxy is a few lines of client code, so the catalogue can still hand a preview to
 * the pages that render it (the component page server-renders it) while the page ships only the previews it shows.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

const BARREL = "src/registry/component-previews.tsx";
const OUT = "src/registry/preview-loaders.generated.ts";

function resolveSpec(spec, from) {
  let base;
  if (spec.startsWith("@/")) base = path.join("src", spec.slice(2));
  else if (spec.startsWith(".")) base = path.normalize(path.join(path.dirname(from), spec));
  else return null;
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const file = base + ext;
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

/** The value names a file exports directly (not through `export *`). */
function ownExports(file) {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const names = [];
  for (const st of source.statements) {
    if (ts.isExportDeclaration(st)) {
      if (!st.isTypeOnly && st.exportClause && ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) if (!el.isTypeOnly) names.push(el.name.text);
      }
      continue;
    }
    const exported = ts.canHaveModifiers(st) && ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) names.push(st.name.text);
    else if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
  }
  return names;
}

/** Names a file declares as `export function Name` (components), as opposed to constants and re-exports. */
function ownFunctions(file) {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const names = [];
  for (const st of source.statements) {
    if (ts.isFunctionDeclaration(st) && st.name && ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) names.push(st.name.text);
  }
  return names;
}

/** `export * from "x"` targets of a file, resolved to files. */
function starTargets(file) {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out = [];
  for (const st of source.statements) {
    if (ts.isExportDeclaration(st) && !st.exportClause && st.moduleSpecifier && !st.isTypeOnly) {
      const target = resolveSpec(st.moduleSpecifier.text, file);
      if (!target) throw new Error(`preview loaders: ${file} re-exports "${st.moduleSpecifier.text}", which can't be found`);
      out.push(target);
    }
  }
  return out;
}

/** name -> the file that defines it, following `export *` down to where each name is really written. */
const where = new Map();
const isFunction = new Set();
function visit(file, seen = new Set()) {
  if (seen.has(file)) return;
  seen.add(file);
  const fns = new Set(ownFunctions(file));
  for (const name of ownExports(file)) {
    if (where.has(name)) continue;
    where.set(name, file);
    if (fns.has(name)) isFunction.add(name);
  }
  for (const target of starTargets(file)) visit(target, seen);
}
visit(BARREL);

const names = [...where.keys()].filter((n) => n !== "default").sort();
if (names.length < 300) throw new Error(`preview loaders: found only ${names.length} previews; has the registry's layout changed?`);

// import("./x") paths, relative to src/registry, without the extension
const spec = (file) => {
  const rel = path.relative("src/registry", file).replace(/\\/g, "/").replace(/\.tsx?$/, "").replace(/\/index$/, "");
  return rel.startsWith(".") ? rel : "./" + rel;
};

const lines = names.map((n) => `  ${n}: () => import("${spec(where.get(n))}"),`);
const next = `// Generated by scripts/build-preview-loaders.mjs. Do not edit; run \`npm run previews:build\`.
// One loader per live preview, each importing only the module that preview lives in (see that script for why).
type PreviewModule = Record<string, unknown>;

export const PREVIEW_LOADERS: Record<string, () => Promise<PreviewModule>> = {
${lines.join("\n")}
};
`;

// The proxies: one per preview component (a function declaration), named exactly as it is in the registry.
const PROXY_OUT = "src/registry/preview-proxies.tsx";
const components = names.filter((n) => isFunction.has(n));
if (components.length < 300) throw new Error(`preview loaders: only ${components.length} preview components found`);
const nextProxies = `"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Generated by scripts/build-preview-loaders.mjs. Do not edit; run \`npm run previews:build\`.
// One small stand-in per live preview. Each loads the preview's real module the first time it renders (on the server too,
// so the pages that render a preview still send its HTML), so importing this file costs a few kilobytes instead of
// every component's code. See the generator for why the catalogue imports this and not component-previews.tsx.
import * as React from "react";
import dynamic from "next/dynamic";
import { PREVIEW_LOADERS } from "./preview-loaders.generated";

function proxy(name: string): React.ComponentType<any> {
  const Lazy = dynamic(() => PREVIEW_LOADERS[name]().then((m) => ({ default: m[name] as React.ComponentType<any> })));
  const Proxy = (props: Record<string, unknown>) => <Lazy {...props} />;
  Proxy.displayName = name;
  return Proxy;
}

${components.map((n) => `export const ${n} = proxy("${n}");`).join("\n")}
`;
const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";

const currentProxies = fs.existsSync(PROXY_OUT) ? fs.readFileSync(PROXY_OUT, "utf8") : "";

if (process.argv.includes("--check")) {
  if (current !== next || currentProxies !== nextProxies) {
    console.error(`${OUT} or ${PROXY_OUT} is out of date. Run \`npm run previews:build\` and commit the result.`);
    process.exit(1);
  }
  console.log("preview loaders: up to date");
} else {
  if (current !== next) fs.writeFileSync(OUT, next);
  if (currentProxies !== nextProxies) fs.writeFileSync(PROXY_OUT, nextProxies);
  const files = new Set(names.map((n) => where.get(n)));
  console.log(`preview loaders: ${names.length} exports in ${files.size} modules, ${components.length} preview proxies`);
}

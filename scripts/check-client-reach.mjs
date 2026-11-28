/**
 * Fails the build if a page that must stay light can reach the live-preview registry.
 *
 * Why: src/registry/component-previews.tsx is a "use client" module that imports every component (about
 * 11 MB of source, 1.9 MB of script after compression). When a server file imports it, even just to read
 * data, Next adds it to that page's client bundle and every visitor downloads it. library-components.ts
 * imports it (to render previews on component pages), so anything that imports library-components,
 * directly or through gallery-items.ts, category-seo.ts and similar, drags the registry along. The
 * homepage did this for months and took 4 to 5 seconds to open; the site layout nearly did too (see
 * scan-catalog-counts.mjs).
 *
 * How: reads the real import graph with TypeScript's parser (so import lines inside code-sample strings
 * don't count), walks from each guarded entry through server modules, and stops at the first "use client"
 * module on each path (that module is its own entry; only the registry itself is a problem).
 *
 * Run by hand with `npm run reach:check`; it also runs before every build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

/** Pages and layouts that must never ship the registry. */
const GUARDED = [
  "src/app/(site)/layout.tsx",
  "src/app/(static)/layout.tsx",
  "src/app/(site)/page.tsx",
  "src/app/(static)/home-static/page.tsx",
  "src/app/(static)/home-static-in/page.tsx",
  "src/app/(static)/components-static/page.tsx",
  "src/app/(static)/components-static-in/page.tsx",
];
const REGISTRY = "src/registry/component-previews.tsx";

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function resolveImport(spec, from) {
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

const graph = new Map();
const clientModules = new Set();

for (const file of walk("src")) {
  const text = fs.readFileSync(file, "utf8");
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const first = source.statements[0];
  if (first && ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression) && first.expression.text === "use client") {
    clientModules.add(file);
  }
  const deps = [];
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      if (statement.importClause?.isTypeOnly) continue;
      const target = resolveImport(statement.moduleSpecifier.text, file);
      if (target) deps.push(target);
    } else if (ts.isExportDeclaration(statement) && statement.moduleSpecifier) {
      if (statement.isTypeOnly) continue;
      const target = resolveImport(statement.moduleSpecifier.text, file);
      if (target) deps.push(target);
    }
  }
  graph.set(file, deps);
}

/** The shortest chain of server modules from `entry` to the registry, or null. */
function chainToRegistry(entry) {
  const parent = new Map([[entry, null]]);
  const queue = [entry];
  while (queue.length) {
    const node = queue.shift();
    if (node === REGISTRY) {
      const chain = [];
      for (let n = node; n; n = parent.get(n)) chain.push(n);
      return chain.reverse();
    }
    // another "use client" module is its own entry: its imports are its own business, not the server's
    if (node !== entry && clientModules.has(node)) continue;
    for (const dep of graph.get(node) ?? []) {
      if (!parent.has(dep)) {
        parent.set(dep, node);
        queue.push(dep);
      }
    }
  }
  return null;
}

let failed = false;
for (const entry of GUARDED) {
  if (!graph.has(entry)) continue; // a guarded page that doesn't exist (yet) can't ship anything
  const chain = chainToRegistry(entry);
  if (chain) {
    failed = true;
    console.error(`\n✗ ${entry} reaches the live-preview registry:\n    ${chain.map((f) => path.relative("src", f)).join("\n  → ")}`);
  }
}

if (failed) {
  console.error(
    "\nThe registry is about 1.9 MB of script (compressed). Read what the page needs from a generated snapshot\n" +
      "(src/lib/catalog/home-snapshot.generated.json, scripts/build-home-snapshot.mjs) instead of library-components.ts.\n",
  );
  process.exit(1);
}
console.log(`reach check: ${GUARDED.length} guarded entries, none reach the preview registry`);

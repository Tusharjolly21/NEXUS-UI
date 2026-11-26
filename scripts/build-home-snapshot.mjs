/**
 * Writes src/lib/catalog/home-snapshot.generated.json: the slice of the component catalogue the homepage shows
 * (its wall, the gallery-to-repo story, the category chips and the release log).
 *
 * Why: the catalogue (library-components.ts) imports the live-preview registry, a "use client" module of about
 * 11 MB of source. A page that imports the catalogue, even only to read names, ships that registry to every
 * visitor (1.9 MB of script after compression), and the homepage did, which is most of why it took 4 to 5
 * seconds to open. The page reads this small file instead. scripts/check-client-reach.mjs keeps it that way.
 *
 * How: runs the real catalogue code (src/lib/catalog/home-snapshot-source.ts) under Node, with the registry
 * replaced by stand-ins that carry the same export names, so the data is exactly what the site computed before.
 *
 * Runs before every build and dev start. Run it by hand (`npm run snapshot:build`) after changing the catalogue.
 * `--check` writes nothing and exits 1 when the committed file is out of date.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

const OUT = "src/lib/catalog/home-snapshot.generated.json";
const REGISTRY = "src/registry/component-previews.tsx";

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

/** The names a file exports as values, following `export * from`. */
function exportedNames(file, seen = new Set()) {
  if (seen.has(file)) return [];
  seen.add(file);
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const names = [];
  for (const st of source.statements) {
    if (ts.isExportDeclaration(st)) {
      if (st.isTypeOnly) continue;
      if (st.exportClause && ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) if (!el.isTypeOnly) names.push(el.name.text);
      } else if (!st.exportClause && st.moduleSpecifier) {
        const target = resolveSpec(st.moduleSpecifier.text, file);
        if (target) names.push(...exportedNames(target, seen));
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

/** One stand-in function per registry export, so `Previews.PreviewX` has an identity and a name to look up. */
function registryStandIns() {
  const names = [...new Set(exportedNames(REGISTRY))];
  if (names.length < 300) throw new Error(`home snapshot: found only ${names.length} exports in ${REGISTRY}; has its layout changed?`);
  const stub = {};
  for (const name of names) stub[name] = { [name]: () => null }[name];
  return stub;
}

const registry = registryStandIns();
const modules = new Map();

/** A small CommonJS loader: TypeScript to JS, `@/` paths, JSON, and the registry stand-ins. */
function load(file) {
  if (file === REGISTRY) return registry;
  if (modules.has(file)) return modules.get(file).exports;
  const mod = { exports: {} };
  modules.set(file, mod);
  if (file.endsWith(".json")) {
    mod.exports = JSON.parse(fs.readFileSync(file, "utf8"));
    return mod.exports;
  }
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const localRequire = (spec) => {
    const target = resolveSpec(spec, file);
    if (!target) throw new Error(`home snapshot: ${file} needs "${spec}", which this script can't load. Only plain data modules belong here.`);
    return load(target);
  };
  new Function("exports", "require", "module", "__filename", outputText)(mod.exports, localRequire, mod, file);
  return mod.exports;
}

const { buildHomeSnapshot } = load("src/lib/catalog/home-snapshot-source.ts");
const snapshot = buildHomeSnapshot();

// Fail loudly rather than ship a half-empty homepage.
const empty = [...snapshot.wall, ...snapshot.story].filter((i) => !i.exportName).map((i) => i.slug);
if (empty.length) throw new Error(`home snapshot: no preview export found for ${empty.join(", ")}`);
if (snapshot.wall.length < 16) throw new Error(`home snapshot: only ${snapshot.wall.length} wall items`);
if (snapshot.drops.length === 0 || snapshot.categories.length === 0) throw new Error("home snapshot: no releases or categories");

const next = JSON.stringify(snapshot, null, 1) + "\n";
const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";

if (process.argv.includes("--check")) {
  if (current !== next) {
    console.error(`${OUT} is out of date. Run \`npm run snapshot:build\` and commit the result.`);
    process.exit(1);
  }
  console.log("home snapshot: up to date");
} else {
  if (current !== next) fs.writeFileSync(OUT, next);
  console.log(`home snapshot: ${snapshot.wall.length} wall items, ${snapshot.story.length} story items, ${snapshot.categories.length} categories, ${snapshot.drops.length} months`);
}

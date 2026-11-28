/**
 * ONE-TIME refactor: splits src/lib/catalog/playgrounds.tsx (about 370 live "tweak the props" playgrounds and about 360
 * component imports in one file) into one module per playground under src/lib/catalog/playgrounds/, so a component's page
 * loads only its own playground instead of every playground's components (about 2.8 MB of script on every detail page).
 *
 * The Playground types move to playground-types.ts, and playgrounds.ts becomes a small index: the list of slugs (a plain
 * set, safe to import anywhere) and loadPlayground(slug), which imports just that module. Run it once; afterwards the new
 * files are the source.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

const SRC = "src/lib/catalog/playgrounds.tsx";
const DIR = "src/lib/catalog/playgrounds";
const TYPES = "src/lib/catalog/playground-types.ts";
const INDEX = "src/lib/catalog/playgrounds.ts";
const TYPE_NAMES = new Set(["PlaygroundControl", "PlaygroundValues", "Playground"]);

const text = fs.readFileSync(SRC, "utf8");
const sf = ts.createSourceFile(SRC, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const own = (n) => text.slice(n.getStart(), n.end);

const bindingNames = (name) => (ts.isIdentifier(name) ? [name.text] : name.elements.flatMap((e) => (ts.isOmittedExpression(e) ? [] : bindingNames(e.name))));

const imports = new Map();
const decls = new Map();
const order = [];
const typeStatements = [];
let table = null;

for (const st of sf.statements) {
  if (ts.isImportDeclaration(st)) {
    const mod = st.moduleSpecifier.text;
    const c = st.importClause;
    if (!c) continue;
    if (c.name) imports.set(c.name.text, { mod, kind: "default", name: c.name.text, typeOnly: c.isTypeOnly });
    if (c.namedBindings) {
      if (ts.isNamespaceImport(c.namedBindings)) imports.set(c.namedBindings.name.text, { mod, kind: "namespace", name: c.namedBindings.name.text, typeOnly: c.isTypeOnly });
      else for (const el of c.namedBindings.elements) imports.set(el.name.text, { mod, kind: "named", imported: (el.propertyName || el.name).text, name: el.name.text, typeOnly: c.isTypeOnly || el.isTypeOnly });
    }
    continue;
  }
  if (ts.isExpressionStatement(st)) continue;
  if (ts.isTypeAliasDeclaration(st) && TYPE_NAMES.has(st.name.text)) {
    typeStatements.push(st);
    continue;
  }
  if (ts.isVariableStatement(st) && st.declarationList.declarations.some((d) => ts.isIdentifier(d.name) && d.name.text === "playgrounds")) {
    table = st.declarationList.declarations.find((d) => ts.isIdentifier(d.name) && d.name.text === "playgrounds").initializer;
    continue;
  }
  if (ts.isFunctionDeclaration(st) && st.name?.text === "getPlayground") continue;
  let names = [];
  if (ts.isFunctionDeclaration(st) && st.name) names = [st.name.text];
  else if (ts.isVariableStatement(st)) names = st.declarationList.declarations.flatMap((d) => bindingNames(d.name));
  else if (ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) names = [st.name.text];
  else throw new Error(`split: unexpected top-level ${ts.SyntaxKind[st.kind]} at line ${sf.getLineAndCharacterOfPosition(st.getStart()).line + 1}`);
  for (const n of names) decls.set(n, [...(decls.get(n) || []), st]);
  order.push(st);
}
if (!table || !ts.isObjectLiteralExpression(table)) throw new Error("split: could not find the playgrounds table");
if (typeStatements.length !== TYPE_NAMES.size) throw new Error(`split: found ${typeStatements.length} of the Playground types`);

function boundIn(node) {
  const bound = new Set();
  const visit = (n) => {
    if (ts.isParameter(n) || ts.isVariableDeclaration(n) || ts.isBindingElement(n)) if (n.name) for (const b of bindingNames(n.name)) bound.add(b);
    if (ts.isFunctionDeclaration(n) && n.name && n !== node) bound.add(n.name.text);
    if (ts.isCatchClause(n) && n.variableDeclaration) for (const b of bindingNames(n.variableDeclaration.name)) bound.add(b);
    if (ts.isTypeParameterDeclaration(n) && n.name) bound.add(n.name.text);
    ts.forEachChild(n, visit);
  };
  visit(node);
  return bound;
}

function referenced(node) {
  const names = new Set();
  const bound = boundIn(node);
  const visit = (n) => {
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      const skip =
        (ts.isPropertyAccessExpression(p) && p.name === n) ||
        (ts.isQualifiedName(p) && p.right === n) ||
        (ts.isPropertyAssignment(p) && p.name === n) ||
        (ts.isPropertySignature(p) && p.name === n) ||
        (ts.isMethodDeclaration(p) && p.name === n) ||
        (ts.isPropertyDeclaration(p) && p.name === n) ||
        (ts.isJsxAttribute(p) && p.name === n) ||
        (ts.isBindingElement(p) && p.propertyName === n) ||
        ((ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isFunctionDeclaration(p) || ts.isTypeAliasDeclaration(p) || ts.isInterfaceDeclaration(p)) && p.name === n);
      if (!skip && !bound.has(n.text)) names.add(n.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return names;
}

function importLines(needed) {
  const byMod = new Map();
  for (const local of needed) {
    const imp = imports.get(local);
    if (!byMod.has(imp.mod)) byMod.set(imp.mod, []);
    byMod.get(imp.mod).push(imp);
  }
  const lines = [];
  for (const [mod, list] of byMod) {
    const def = list.find((i) => i.kind === "default");
    const ns = list.find((i) => i.kind === "namespace");
    const named = list.filter((i) => i.kind === "named");
    const allType = list.every((i) => i.typeOnly);
    const bits = [];
    if (def) bits.push(def.name);
    if (ns) bits.push(`* as ${ns.name}`);
    if (named.length) bits.push(`{ ${named.map((i) => `${i.typeOnly && !allType ? "type " : ""}${i.imported === i.name ? i.name : `${i.imported} as ${i.name}`}`).join(", ")} }`);
    lines.push(`import ${allType ? "type " : ""}${bits.join(", ")} from "${mod}";`);
  }
  return lines;
}

// 1. the types
const typeBody = typeStatements.map(own).join("\n\n");
const typeNeeds = new Set();
for (const st of typeStatements) for (const n of referenced(st)) if (imports.has(n)) typeNeeds.add(n);
fs.writeFileSync(TYPES, `// The shape of a playground (see playgrounds.ts). Split from the playgrounds themselves so it can be imported anywhere.\n${importLines(typeNeeds).join("\n")}\n\n${typeBody}\n`);

// 2. one module per entry
fs.mkdirSync(DIR, { recursive: true });
const slugs = [];
for (const prop of table.properties) {
  if (!ts.isPropertyAssignment(prop)) throw new Error("split: unexpected member in the playgrounds table");
  const slug = ts.isStringLiteral(prop.name) || ts.isIdentifier(prop.name) ? prop.name.text : null;
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) throw new Error(`split: odd playground key ${prop.name.getText()}`);
  const need = new Set();
  const needDecls = new Set();
  const seen = new Set();
  const queue = [prop.initializer];
  while (queue.length) {
    const node = queue.pop();
    for (const name of referenced(node)) {
      if (imports.has(name)) need.add(name);
      else if (decls.has(name)) {
        for (const st of decls.get(name)) {
          needDecls.add(st);
          if (!seen.has(st)) {
            seen.add(st);
            queue.push(st);
          }
        }
      }
    }
  }
  // names the entry uses from the types module
  const stmts = order.filter((s) => needDecls.has(s));
  for (const s of stmts) for (const n of referenced(s)) if (imports.has(n)) need.add(n);
  const body = stmts.map(own).join("\n\n");
  const file = `"use client";\n\n// Moved out of playgrounds.tsx so a component's page loads only its own playground.\n${importLines(need).join("\n")}\nimport type { Playground } from "../playground-types";\n\n${body ? body + "\n\n" : ""}export const playground: Playground = ${own(prop.initializer)};\n`;
  fs.writeFileSync(path.join(DIR, `${slug}.tsx`), file);
  slugs.push(slug);
}

// 3. the index
const index = `import type { Playground } from "./playground-types";

export type { Playground, PlaygroundControl, PlaygroundValues } from "./playground-types";

/**
 * The live "tweak the props" playgrounds, one module per component (src/lib/catalog/playgrounds). Import this file anywhere:
 * it holds only the list of slugs and a loader. The playgrounds themselves pull in their components, so they are loaded one at
 * a time, when a page needs one.
 */
export const PLAYGROUND_SLUGS: ReadonlySet<string> = new Set([
${slugs.map((s) => `  "${s}",`).join("\n")}
]);

const LOADERS: Record<string, () => Promise<{ playground: Playground }>> = {
${slugs.map((s) => `  "${s}": () => import("./playgrounds/${s}"),`).join("\n")}
};

/** Whether a component has a live playground (so a page can label its section before the playground has loaded). */
export function hasPlayground(slug: string): boolean {
  return PLAYGROUND_SLUGS.has(slug);
}

/** Loads one component's playground; undefined when it has none. */
export async function loadPlayground(slug: string): Promise<Playground | undefined> {
  const load = LOADERS[slug];
  return load ? (await load()).playground : undefined;
}
`;
fs.writeFileSync(INDEX, index);
fs.rmSync(SRC);
console.log(`split ${slugs.length} playgrounds into ${DIR}`);

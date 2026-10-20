/**
 * Verifies the template source downloads.
 *
 *   npx tsx scripts/verify-template-zips.ts [slug...] [--no-build] [--keep]
 *
 * 1. Unit checks for the path-safety helpers in src/lib/template-zip.ts (traversal, dotfiles,
 *    symlinks, import scanning).
 * 2. Cross-checks src/lib/template-sources.ts against the live preview page and the catalog, so the
 *    download and the preview render the same file.
 * 3. For each slug (default: every template with a source): builds the zip with buildTemplateZip,
 *    extracts it to a temp folder, checks that every local import resolves inside the zip, that
 *    every package import is in package.json, and that there are no absolute paths, env files, site
 *    theme tokens or next/font/google; then runs `npm install --no-audit --no-fund` and
 *    `npx next build` in it. Builds run one at a time.
 *
 * Exit code 1 if anything fails.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { templates } from "@/lib/catalog/templates";
import { TEMPLATE_SOURCES, TEMPLATE_SOURCE_SLUGS, getTemplateSource } from "@/lib/template-sources";
import {
  buildTemplateZip,
  getImportedSpecifiers,
  getPackageName,
  isAllowedSourcePath,
  isWithinRoot,
  maskSource,
  planTemplateZip,
  resolveLocalImport,
  toPublicAssetPath,
} from "@/lib/template-zip";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const slugs = args.filter((a) => !a.startsWith("--"));
const BUILD = !flags.has("--no-build");
const KEEP = flags.has("--keep");

let failures = 0;
const ok = (msg: string) => console.log(`  ok    ${msg}`);
const fail = (msg: string) => {
  failures++;
  console.log(`  FAIL  ${msg}`);
};
const warn = (msg: string) => console.log(`  warn  ${msg}`);
const check = (cond: boolean, msg: string) => (cond ? ok(msg) : fail(msg));

// ─── 1. Unit checks ──────────────────────────────────────────────────────────

async function unitChecks() {
  console.log("\nPath safety and import scanning");

  check(isWithinRoot("/srv/app/src/x.ts", "/srv/app"), "isWithinRoot accepts a file inside the root");
  check(!isWithinRoot("/srv/app/../etc/passwd", "/srv/app"), "isWithinRoot rejects ../ out of the root");
  check(!isWithinRoot("/srv/app-other/x.ts", "/srv/app"), "isWithinRoot rejects a sibling with the same prefix");

  check(isAllowedSourcePath("src/components/templates/relay-page.tsx"), "allows a template file");
  check(isAllowedSourcePath("src/lib/utils.ts"), "allows src/lib/utils.ts");
  for (const bad of [
    ".env",
    ".env.local",
    "src/components/.env.ts",
    "src/components/../../.env",
    "src/components/./x.tsx",
    "src/lib/supabase/admin.ts",
    "src/lib/entitlements.ts",
    "src/app/api/download/template/route.ts",
    "content/build-prompts/templates/relay.md",
    "/etc/passwd",
    "src\\components\\x.tsx",
    "src/components/x.tsx\0",
    "src/components/templates/notes.md",
    "package.json",
  ]) {
    check(!isAllowedSourcePath(bad), `rejects source path ${JSON.stringify(bad)}`);
  }

  check(toPublicAssetPath("videos/hero.mp4") === "public/videos/hero.mp4", "maps a public asset");
  for (const bad of ["../.env", "..%2F.env.json", "a/../../b.png", ".well-known/x.json", "x/.hidden.png", "x.exe", "%E0%A4%A.png", "a//b.png", "a\\b.png"]) {
    check(toPublicAssetPath(bad) === null, `rejects asset reference ${JSON.stringify(bad)}`);
  }

  const from = "src/components/templates/relay-page.tsx";
  const resolved = await resolveLocalImport(from, "@/components/templates/kit/parts");
  check(resolved.status === "ok" && resolved.path === "src/components/templates/kit/parts.tsx", "resolves @/components/templates/kit/parts");
  for (const spec of ["@/../.env", "@/../package.json", "../../../../../../etc/passwd", "@/lib/supabase/server", "@/lib/entitlements", "@/app/layout"]) {
    const r = await resolveLocalImport(from, spec);
    check(r.status !== "ok", `does not follow import ${JSON.stringify(spec)} (${r.status})`);
  }

  // A symlink inside an allowed folder that points outside the root must not be followed.
  const sandbox = await fs.mkdtemp(path.join(os.tmpdir(), "tplzip-root-"));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "tplzip-outside-"));
  try {
    await fs.mkdir(path.join(sandbox, "src/components"), { recursive: true });
    await fs.writeFile(path.join(outside, "secret.ts"), "export const secret = 1;\n");
    await fs.symlink(path.join(outside, "secret.ts"), path.join(sandbox, "src/components/evil.ts"));
    await fs.writeFile(path.join(sandbox, "src/components/fine.ts"), "export const fine = 1;\n");
    const evil = await resolveLocalImport("src/components/page.tsx", "./evil", sandbox);
    check(evil.status === "blocked", "does not follow a symlink that leaves the root");
    const fine = await resolveLocalImport("src/components/page.tsx", "./fine", sandbox);
    check(fine.status === "ok", "follows a normal file next to it");
  } finally {
    await fs.rm(sandbox, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }

  const sample = [
    `"use client";`,
    `// import Commented from "commented-out";`,
    `/* import Block from "block-comment"; */`,
    `import {`,
    `  a,`,
    `  type B,`,
    `} from "framer-motion";`,
    `import Default, { c } from "@/components/x";`,
    `import "./side-effect.css";`,
    `export * from "./reexport";`,
    `export { d } from "./named";`,
    "const code = [`import { Relay } from \"@relay/sdk\";`, `npm i ${'x'}`];",
    `const Lazy = dynamic(() => import("./lazy"), { ssr: false });`,
    `const re = /import x from "regex-pkg"/;`,
    `export function Page() { return <p title="from 'nowhere'">Don't import "jsx-text"</p>; }`,
  ].join("\n");
  const found = getImportedSpecifiers(sample, "x.tsx").sort();
  const expected = ["./lazy", "./named", "./reexport", "./side-effect.css", "@/components/x", "framer-motion"].sort();
  check(JSON.stringify(found) === JSON.stringify(expected), `scans imports, ignoring comments, strings and code samples (${found.join(", ")})`);
  check(maskSource("a // b\nc").split("\n").length === 2, "masking keeps line breaks");

  check(getPackageName("gsap/all") === "gsap", "package of gsap/all is gsap");
  check(getPackageName("@react-three/fiber/native") === "@react-three/fiber", "scoped package name");
  check(getPackageName("node:fs") === null && getPackageName("fs") === null, "node builtins are not packages");
  check(getPackageName("@/lib/utils") === null && getPackageName("./x") === null, "local imports are not packages");

  for (const bad of ["__proto__", "constructor", "../etc", "relay/../../x", "toString"]) {
    check(getTemplateSource(bad) === null, `no template source for ${JSON.stringify(bad)}`);
    const threw = await planTemplateZip(bad).then(
      () => false,
      () => true,
    );
    check(threw, `planTemplateZip refuses ${JSON.stringify(bad)}`);
  }
}

// ─── 2. Map cross-check ──────────────────────────────────────────────────────

async function mapChecks() {
  console.log("\nSource map vs live preview and catalog");
  const previewFile = path.join(ROOT, "src/app/live-preview/template/[slug]/page.tsx");
  const preview = await fs.readFile(previewFile, "utf8");

  const loaders = new Map<string, { file: string; exportName: string }>();
  const decl =
    /const\s+(\w+)\s*=\s*nextDynamic\(\s*\(\)\s*=>\s*import\(\s*"@\/components\/templates\/([^"]+)"\s*\)(?:\s*\.then\(\s*\(?\s*m\s*\)?\s*=>\s*\(\{\s*default:\s*m\.(\w+)\s*,?\s*\}\)\s*\))?/g;
  for (const m of preview.matchAll(decl)) loaders.set(m[1], { file: `${m[2]}.tsx`, exportName: m[3] ?? "default" });

  const rendered = new Map<string, string>();
  for (const m of preview.matchAll(/slug\s*===\s*"([^"]+)"\s*\)\s*\{\s*return\s*(?:<ThemeReceiver>\s*)?<(\w+)\s*\/>/g)) rendered.set(m[1], m[2]);
  const mapped = (preview.match(/TEMPLATE_SOURCES|getTemplateSource/g) ?? []).length > 0;

  for (const slug of TEMPLATE_SOURCE_SLUGS) {
    const source = TEMPLATE_SOURCES[slug];
    const variable = rendered.get(slug);
    const loader = variable ? loaders.get(variable) : undefined;
    if (!loader) {
      if (mapped) ok(`${slug}: live preview reads the shared map`);
      else warn(`${slug}: not rendered by the live preview page yet (add it there)`);
      continue;
    }
    check(
      loader.file === source.file && loader.exportName === source.exportName,
      `${slug}: preview renders ${loader.file}#${loader.exportName}, download ships ${source.file}#${source.exportName}`,
    );
  }
  for (const slug of rendered.keys()) {
    if (!getTemplateSource(slug)) fail(`${slug}: rendered by the live preview but has no download source`);
  }
  for (const t of templates) {
    if (!getTemplateSource(t.slug)) fail(`${t.slug}: in the catalog but has no download source`);
  }
  for (const slug of TEMPLATE_SOURCE_SLUGS) {
    if (!templates.some((t) => t.slug === slug)) warn(`${slug}: has a source but is not in the catalog yet (the route answers 404 until it is)`);
  }
}

// ─── 3. Zips ─────────────────────────────────────────────────────────────────

const SITE_TOKENS =
  /\b(?:bg|text|border|ring|from|to|via|fill|stroke|outline)-(?:background|foreground|muted|muted-foreground|card|card-foreground|popover|primary|secondary|accent|destructive|border|input|ring|action|link|tint-[a-z]+)\b|\brounded-tile\b|\bpg-(?:display|glass|float|dotgrid|bloom|cta)\b/;

function run(command: string, commandArgs: string[], cwd: string, logFile: string): Promise<{ code: number; tail: string }> {
  return new Promise((resolve) => {
    const env: NodeJS.ProcessEnv = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
    delete env.NODE_ENV;
    const child = spawn(command, commandArgs, {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("close", async (code) => {
      await fs.appendFile(logFile, `\n$ ${command} ${commandArgs.join(" ")}\n${output}`);
      resolve({ code: code ?? 1, tail: output.split("\n").slice(-40).join("\n") });
    });
  });
}

async function resolvesInside(dir: string, fromFile: string, specifier: string) {
  const base = specifier.startsWith("@/") ? path.join(dir, "src", specifier.slice(2)) : path.resolve(path.dirname(path.join(dir, fromFile)), specifier);
  if (!isWithinRoot(base, dir)) return false;
  const exts = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".css", ".json"];
  for (const candidate of [base, ...exts.map((e) => base + e), ...exts.map((e) => path.join(base, `index${e}`))]) {
    try {
      if ((await fs.stat(candidate)).isFile()) return true;
    } catch {
      // try the next candidate
    }
  }
  return false;
}

async function verifySlug(slug: string) {
  console.log(`\n${slug}`);
  const failuresBefore = failures;
  const work = await fs.mkdtemp(path.join(os.tmpdir(), `tplzip-${slug}-`));
  const logFile = path.join(work, "verify.log");
  try {
    const started = Date.now();
    const buffer = await buildTemplateZip(slug);
    ok(`built zip, ${(buffer.length / 1024).toFixed(0)} KB in ${Date.now() - started} ms`);

    const zip = await JSZip.loadAsync(buffer);
    const names = Object.keys(zip.files);
    const unsafe = names.filter((n) => n.startsWith("/") || n.includes("\\") || n.split("/").includes("..") || !n.startsWith(`${slug}/`));
    check(unsafe.length === 0, `every entry sits under ${slug}/ with no traversal${unsafe.length ? ` (${unsafe.join(", ")})` : ""}`);
    const envFiles = names.filter((n) => /(^|\/)\.env/.test(n));
    check(envFiles.length === 0, "no .env files");

    for (const name of names) {
      const entry = zip.files[name];
      const target = path.join(work, name);
      if (!isWithinRoot(target, work)) continue;
      if (entry.dir) await fs.mkdir(target, { recursive: true });
      else {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, await entry.async("nodebuffer"));
      }
    }
    const dir = path.join(work, slug);
    for (const required of ["package.json", "tsconfig.json", "postcss.config.mjs", "next.config.mjs", ".gitignore", "README.md", "src/app/layout.tsx", "src/app/page.tsx", "src/app/globals.css"]) {
      check(existsSync(path.join(dir, required)), `has ${required}`);
    }
    const promptSource = path.join(ROOT, "content/build-prompts/templates", `${slug}.md`);
    if (existsSync(promptSource)) check(existsSync(path.join(dir, "PROMPT.md")), "has PROMPT.md");
    else warn(`no build prompt at content/build-prompts/templates/${slug}.md yet, so no PROMPT.md`);

    const pkg = JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf8")) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    const declared = new Set([...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]);
    const usedPackages = new Set<string>(["next", "react", "react-dom"]);

    const textFiles = names.filter((n) => !zip.files[n].dir && /\.(?:tsx?|jsx?|mjs|css|json|md)$/.test(n));
    let unresolved = 0;
    let tokenFiles = 0;
    let absolute = 0;
    for (const name of textFiles) {
      const rel = name.slice(slug.length + 1);
      const text = await fs.readFile(path.join(work, name), "utf8");
      if (text.includes(ROOT) || /\/home\/|\/Users\/|[A-Z]:\\\\/.test(text)) {
        absolute++;
        fail(`${rel} contains an absolute path`);
      }
      if (/\.(?:tsx?|jsx?|mjs|css)$/.test(rel)) {
        for (const spec of getImportedSpecifiers(text, rel)) {
          if (spec.startsWith(".") || spec.startsWith("@/")) {
            if (!(await resolvesInside(dir, rel, spec))) {
              unresolved++;
              fail(`${rel}: import "${spec}" does not resolve inside the zip`);
            }
          } else {
            const name = getPackageName(spec);
            if (name) usedPackages.add(name);
          }
        }
      }
      if (rel.startsWith("src/") && /\.(?:tsx?|jsx?)$/.test(rel)) {
        if (SITE_TOKENS.test(maskSource(text).replace(/\/\/.*$/gm, "")) || SITE_TOKENS.test(text)) {
          tokenFiles++;
          fail(`${rel} uses Nexus UI site theme tokens (${text.match(SITE_TOKENS)?.[0]}), which the zip doesn't define`);
        }
        if (/next\/font\/google/.test(text)) fail(`${rel} uses next/font/google (needs network at build time)`);
      }
    }
    if (!unresolved) ok("every local import resolves inside the zip");
    if (!tokenFiles) ok("no site theme tokens");
    if (!absolute) ok("no absolute paths");
    const missingPkgs = [...usedPackages].filter((p) => p !== "tailwindcss" && !declared.has(p));
    check(missingPkgs.length === 0, `every imported package is in package.json${missingPkgs.length ? ` (missing: ${missingPkgs.join(", ")})` : ""}`);
    const unusedPkgs = Object.keys(pkg.dependencies).filter((p) => !usedPackages.has(p));
    check(unusedPkgs.length === 0, `no unused dependencies${unusedPkgs.length ? ` (${unusedPkgs.join(", ")})` : ""}`);

    if (BUILD) {
      const install = await run("npm", ["install", "--no-audit", "--no-fund"], dir, logFile);
      if (install.code !== 0) {
        fail(`npm install exited ${install.code}\n${install.tail}`);
      } else {
        ok("npm install");
        const warnings = (install.tail.match(/npm warn/gi) ?? []).length;
        if (warnings) warn(`npm install printed ${warnings} warning(s), see ${logFile}`);
        const started2 = Date.now();
        const build = await run("npx", ["next", "build"], dir, logFile);
        if (build.code !== 0) fail(`next build exited ${build.code}\n${build.tail}`);
        else {
          ok(`next build in ${((Date.now() - started2) / 1000).toFixed(0)} s`);
          const log = await fs.readFile(logFile, "utf8");
          const buildWarnings = log
            .split("\n")
            .filter((l) => /⚠|warn(ing)?\b/i.test(l) && !/npm warn/i.test(l));
          if (buildWarnings.length) warn(`build warnings:\n      ${buildWarnings.slice(0, 10).join("\n      ")}`);
          else ok("no build warnings");
          const tsconfigAfter = await fs.readFile(path.join(dir, "tsconfig.json"), "utf8");
          const original = await zip.files[`${slug}/tsconfig.json`].async("string");
          check(tsconfigAfter === original, "next build left tsconfig.json unchanged");
        }
      }
    }
  } catch (error) {
    fail(`${error instanceof Error ? error.message : String(error)}`);
  } finally {
    const passed = failures === failuresBefore;
    console.log(`  ${passed ? "PASS" : "FAIL"}  ${slug}${KEEP || !passed ? ` (files and log in ${work})` : ""}`);
    if (!KEEP && passed) await fs.rm(work, { recursive: true, force: true });
  }
  return failures === failuresBefore;
}

async function main() {
  await unitChecks();
  await mapChecks();
  const targets = slugs.length ? slugs : TEMPLATE_SOURCE_SLUGS;
  const results: Array<[string, boolean]> = [];
  for (const slug of targets) results.push([slug, await verifySlug(slug)]);
  console.log("\nSummary");
  for (const [slug, passed] of results) console.log(`  ${passed ? "PASS" : "FAIL"}  ${slug}`);
  console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
  process.exit(failures ? 1 : 0);
}

void main();

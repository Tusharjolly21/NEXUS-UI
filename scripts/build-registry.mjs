/**
 * Emits a complete server registry and public JSON only for free catalog components.
 * @see https://ui.shadcn.com/docs/registry/registry-item-json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicOutDir = path.join(root, "public", "r");
const serverOutDir = path.join(root, ".generated", "registry");
const catalogPath = path.join(root, "src", "lib", "catalog", "library-components.ts");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const PROJECT_RUNTIME_DEPENDENCIES = new Set(Object.keys(packageJson.dependencies ?? {}));
const NEXUS_FONT_REGISTRY_NAME = "nexus-font";
const UI_SOUNDS_REGISTRY_NAME = "ui-sounds";
const UI_SOUNDS_PRO_REGISTRY_NAME = "ui-sounds-pro";
const UI_SOUNDS_MAC_REGISTRY_NAME = "ui-sounds-mac";
const UI_SOUNDS_RECORDED_REGISTRY_NAME = "ui-sounds-recorded";
const homepage = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";

/** Catalog slug → CLI / JSON filename (e.g. gooey-search-input → gooey-input). */
const REGISTRY_CLI_NAME = {
  "gooey-search-input": "gooey-input",
};

const SOURCE_COMPONENT_NAME = {
  "mac-keyboard": "keyboard",
};

const SOURCE_ALIAS_SHIMS = {
  "mac-keyboard": `export { MacKeyboard, usePhysicalKeyboard } from "./keyboard";
export type { KeyboardProps } from "./keyboard";
export type { KeyDef, KeyKind, SoundVariant } from "./keyboard/keyboard-layout";
`,
};

const STANDARD_SHADCN_UI_DEPS = new Set([
  "accordion",
  "avatar",
  "badge",
  "button",
  "calendar",
  "card",
  "checkbox",
  "command",
  "dialog",
  "dropdown-menu",
  "input",
  "input-group",
  "label",
  "navigation-menu",
  "popover",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "switch",
  "table",
  "tabs",
  "textarea",
  "tooltip",
]);

function extractBlocks(ts) {
  const re = /  \{\n    slug: "([^"]+)"/g;
  const hits = [];
  let m;
  while ((m = re.exec(ts)) !== null) {
    hits.push({ slug: m[1], index: m.index });
  }
  return hits.map((h, i) => ({
    slug: h.slug,
    text: ts.slice(h.index, hits[i + 1]?.index ?? ts.length),
  }));
}

function extractReactSource(block) {
  const t = block.indexOf("tailwindSource:");
  if (t === -1) return null;
  const head = block.slice(0, t);
  const open = head.indexOf("reactSource:");
  if (open === -1) return null;
  const openTick = head.indexOf("`", open);
  const closeTick = head.lastIndexOf("`");
  if (closeTick <= openTick) return null;
  // The catalog stores the snippet inside a template literal, so \` \${ \\ and \" are escaped
  // there. Evaluate the literal (it has no interpolations) so the installed file is exactly the
  // code the user sees on the site.
  const raw = head.slice(openTick + 1, closeTick);
  try {
    return new Function(`return \`${raw}\`;`)();
  } catch {
    return raw.replace(/\\([`$\\])/g, "$1");
  }
}

function extractName(block) {
  const m = block.match(/    slug: "[^"]+",\n    name: "([^"]+)"/);
  return m?.[1] ?? "Component";
}

function extractDescription(block) {
  const m = block.match(/description:\s*\n\s*"([^"]+)"/);
  if (m) return m[1];
  const m2 = block.match(/description:\s*"([^"]*)"/);
  return m2?.[1] ?? "Catalog component";
}

function extractDependencies(block) {
  const m = block.match(/dependencies:\s*\[([^\]]*)\]/);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function isPremiumBlock(block) {
  return /\bpremium:\s*true\b/.test(block);
}

function extractRegistryCliName(slug, block) {
  const m = block.match(/registryCliName:\s*"([^"]+)"/);
  return m?.[1] ?? REGISTRY_CLI_NAME[slug] ?? slug;
}

function registryDepsForReactSource(src) {
  const deps = new Set();
  deps.add(`${homepage}/api/registry/nexus-font`);
  if (src.includes("@/lib/utils") || src.includes("@/components/ui")) deps.add("utils");
  // Components that make sound import the shared synthesiser; the CLI installs it alongside them.
  if (src.includes("@/lib/ui-sounds")) deps.add(`${homepage}/api/registry/${UI_SOUNDS_REGISTRY_NAME}`);

  for (const match of src.matchAll(/@\/components\/ui\/([a-z0-9-]+)/g)) {
    const dependency = match[1];
    if (STANDARD_SHADCN_UI_DEPS.has(dependency)) deps.add(dependency);
  }

  return [...deps];
}

function buildNexusFontItem() {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: NEXUS_FONT_REGISTRY_NAME,
    type: "registry:font",
    title: "Nexus UI Inter Font",
    description:
      "Inter font setup used by Nexus UI components so installed components match the preview typography.",
    font: {
      family: "'Inter Variable', sans-serif",
      provider: "google",
      import: "Inter",
      variable: "--font-sans",
      subsets: ["latin"],
      dependency: "@fontsource-variable/inter",
      selector: "body",
    },
    cssVars: {
      theme: {
        "--font-sans":
          "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        "--font-mono": "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace",
        "--font-heading": "var(--font-sans)",
      },
    },
  };
}

/** The free UI sounds library: one lib file (plus the on/off switch and the useSound hook), no dependencies. */
function buildUiSoundsItem() {
  const content = fs.readFileSync(path.join(root, "src", "lib", "ui-sounds.ts"), "utf8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: UI_SOUNDS_REGISTRY_NAME,
    type: "registry:lib",
    title: "UI Sounds",
    description: "24 interface sound effects synthesised with the Web Audio API, a useSound hook and a remembered on/off switch. One file, no audio assets.",
    dependencies: [],
    registryDependencies: [],
    files: [{ path: "next-ui/lib/ui-sounds.ts", type: "registry:lib", target: "lib/ui-sounds.ts", content }],
  };
}

/** The Pro sound pack: one lib file that builds on ui-sounds. Server registry only, never in public/r. */
function buildUiSoundsProItem() {
  const content = fs.readFileSync(path.join(root, "src", "lib", "ui-sounds-pro.ts"), "utf8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: UI_SOUNDS_PRO_REGISTRY_NAME,
    type: "registry:lib",
    title: "UI Sounds Pro",
    description: "24 more interface sounds in four sets (Glass, Paper and wood, Arcade, Studio), plus playProSound and useProSound. Builds on ui-sounds.",
    dependencies: [],
    registryDependencies: [`${homepage}/api/registry/${UI_SOUNDS_REGISTRY_NAME}`],
    files: [{ path: "next-ui/lib/ui-sounds-pro.ts", type: "registry:lib", target: "lib/ui-sounds-pro.ts", content }],
  };
}

/** The Mac style: the free sounds re-voiced to feel at home on a Mac. Pro, server registry only. */
function buildUiSoundsMacItem() {
  const content = fs.readFileSync(path.join(root, "src", "lib", "ui-sounds-mac.ts"), "utf8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: UI_SOUNDS_MAC_REGISTRY_NAME,
    type: "registry:lib",
    title: "UI Sounds Mac style",
    description: "The 24 interface sounds re-voiced to feel at home on a Mac or iPhone: glassy, rounded and short. Original Web Audio recipes, no audio files. Switch with setSoundStyle(\"mac\") or useMacSounds(). Builds on ui-sounds.",
    dependencies: [],
    registryDependencies: [`${homepage}/api/registry/${UI_SOUNDS_REGISTRY_NAME}`],
    files: [{ path: "next-ui/lib/ui-sounds-mac.ts", type: "registry:lib", target: "lib/ui-sounds-mac.ts", content }],
  };
}

/**
 * The recorded Pro sounds: a player (src/lib/ui-sounds-recorded.ts) and the recordings themselves as
 * data URIs, read from assets-pro/sounds. Server registry only, never in public/r, and the audio data
 * is written only into this item, never into src/ or the site's own bundle.
 */
function buildUiSoundsRecordedItem() {
  const player = fs.readFileSync(path.join(root, "src", "lib", "ui-sounds-recorded.ts"), "utf8");
  const names = [...player.matchAll(/^  (typing|camera|message|notification|screenshot): define\(/gm)].map((m) => m[1]);
  if (names.length !== 5) throw new Error("ui-sounds-recorded.ts must define the five recorded sounds.");
  const dir = path.join(root, "assets-pro", "sounds");
  const rows = names.map((n) => {
    const data = fs.readFileSync(path.join(dir, `${n}.mp3`));
    if (data.length < 1000) throw new Error(`assets-pro/sounds/${n}.mp3 is missing or empty.`);
    return `  ${n}: "data:audio/mpeg;base64,${data.toString("base64")}",`;
  });
  const audio = [
    'import type { RecordedSoundName } from "@/lib/ui-sounds-recorded";',
    "",
    "/** The recordings as data URIs, so there is no file to host. Generated; do not edit. */",
    "export const RECORDED_AUDIO: Record<RecordedSoundName, string> = {",
    ...rows,
    "};",
    "",
  ].join("\n");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: UI_SOUNDS_RECORDED_REGISTRY_NAME,
    type: "registry:lib",
    title: "UI Sounds Recorded",
    description: "Five recorded interface sounds (typing, camera, message, notification, screenshot) with playRecordedSound and useRecordedSound. The audio ships inside the package. Builds on ui-sounds.",
    dependencies: [],
    registryDependencies: [`${homepage}/api/registry/${UI_SOUNDS_REGISTRY_NAME}`],
    files: [
      { path: "next-ui/lib/ui-sounds-recorded.ts", type: "registry:lib", target: "lib/ui-sounds-recorded.ts", content: player },
      { path: "next-ui/lib/ui-sounds-recorded-audio.ts", type: "registry:lib", target: "lib/ui-sounds-recorded-audio.ts", content: audio },
    ],
  };
}

function buildSnippetItem(slug, block) {
  const cliName = extractRegistryCliName(slug, block);
  const reactSource = extractReactSource(block);
  if (!reactSource) {
    console.warn(`Skipping ${slug}: could not extract reactSource`);
    return null;
  }
  const title = extractName(block);
  const description = extractDescription(block);
  const files = new Map();
  files.set(`components/${cliName}.tsx`, {
    path: `next-ui/${cliName}.tsx`,
    type: "registry:component",
    target: `components/${cliName}.tsx`,
    content: `${reactSource.trim()}\n`,
  });
  collectImportedLocalFiles(files, new Set(), new Set());
  const contents = [...files.values()].map((file) => file.content).join("\n");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: cliName,
    type: "registry:component",
    title,
    description,
    dependencies: extractDependencies(block),
    registryDependencies: registryDepsForReactSource(contents),
    files: [...files.values()],
  };
}

function isRegistrySourceFile(filePath) {
  if (!/\.(tsx|ts)$/.test(filePath)) return false;
  const base = path.basename(filePath);
  // Skip dotfiles: macOS writes binary AppleDouble twins (`._foo.tsx`) on non-APFS drives
  if (base.startsWith(".")) return false;
  return !["demo.tsx", "preview.tsx"].includes(base);
}

function readRegistryFile(filePath, cliName) {
  let content = fs.readFileSync(filePath, "utf8");

  content = content
    .split("\n")
    .filter((line) => !/\bfrom ["'][^"']*\/(?:demo|preview)["']/.test(line))
    .join("\n");

  if (cliName === "interactive-globe-explorer") {
    content = content.replace(
      'globeTextureUrl = "/images/earth-blue-marble.jpg"',
      'globeTextureUrl = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"',
    );
  }

  return content.endsWith("\n") ? content : `${content}\n`;
}

function registryFileType(filePath, target) {
  if (target.startsWith("components/ui/")) return "registry:ui";
  return filePath.endsWith(".tsx") ? "registry:component" : "registry:lib";
}

function addRegistryFile(files, sourcePath, target, cliName) {
  if (files.has(target)) return;

  files.set(target, {
    path: `next-ui/${target.replace(/^components\//, "")}`,
    type: registryFileType(sourcePath, target),
    target,
    content: readRegistryFile(sourcePath, cliName),
  });
}

function collectDirectoryFiles(baseDir) {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const next = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectDirectoryFiles(next));
      continue;
    }
    if (entry.isFile() && isRegistrySourceFile(next)) files.push(next);
  }

  return files.sort();
}

function collectSourceFiles(cliName, files, seenComponents) {
  if (seenComponents.has(cliName)) return;
  seenComponents.add(cliName);

  const componentDir = path.join(root, "src", "components", cliName);
  const componentFile = path.join(root, "src", "components", `${cliName}.tsx`);
  const hasDir = fs.existsSync(componentDir) && fs.statSync(componentDir).isDirectory();
  const hasFile = fs.existsSync(componentFile) && fs.statSync(componentFile).isFile();

  if (!hasDir && !hasFile) return;

  if (hasDir) {
    for (const filePath of collectDirectoryFiles(componentDir)) {
      const relative = path.relative(componentDir, filePath);
      addRegistryFile(
        files,
        filePath,
        path.join("components", cliName, relative).replaceAll(path.sep, "/"),
        cliName,
      );
    }
  }

  if (hasFile) {
    addRegistryFile(files, componentFile, `components/${cliName}.tsx`, cliName);
  }
}

function collectCustomUiFile(name, files, seenUi) {
  if (seenUi.has(name) || STANDARD_SHADCN_UI_DEPS.has(name)) return;
  seenUi.add(name);

  const filePath = path.join(root, "src", "components", "ui", `${name}.tsx`);
  if (!fs.existsSync(filePath)) return;

  addRegistryFile(files, filePath, `components/ui/${name}.tsx`, name);
}

function collectImportedLocalFiles(files, seenComponents, seenUi) {
  let changed = true;

  while (changed) {
    changed = false;
    const before = files.size;

    for (const file of [...files.values()]) {
      for (const match of file.content.matchAll(/@\/components\/(?!ui\/)([a-zA-Z0-9_./-]+)/g)) {
        collectSourceFiles(match[1], files, seenComponents);
      }

      for (const match of file.content.matchAll(/@\/components\/ui\/([a-z0-9-]+)/g)) {
        collectCustomUiFile(match[1], files, seenUi);
      }
    }

    changed = files.size > before;
  }
}

function buildSourceBackedItem(slug, block) {
  const cliName = extractRegistryCliName(slug, block);
  const sourceName = SOURCE_COMPONENT_NAME[cliName] ?? cliName;
  const files = new Map();
  const seenComponents = new Set();
  const seenUi = new Set();

  collectSourceFiles(sourceName, files, seenComponents);
  if (files.size === 0) return null;

  if (sourceName !== cliName && SOURCE_ALIAS_SHIMS[cliName]) {
    files.set(`components/${cliName}.tsx`, {
      path: `next-ui/${cliName}.tsx`,
      type: "registry:component",
      target: `components/${cliName}.tsx`,
      content: SOURCE_ALIAS_SHIMS[cliName],
    });
  }

  collectImportedLocalFiles(files, seenComponents, seenUi);

  const content = [...files.values()].map((file) => file.content).join("\n");
  const dependencies = extractDependencies(block);
  const registryDependencies = registryDepsForReactSource(content);

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: cliName,
    type: "registry:component",
    title: extractName(block),
    description: extractDescription(block),
    dependencies,
    registryDependencies,
    files: [...files.values()],
  };
}

function detectedPackageDependencies(item) {
  if (!item.files?.length) return item;

  const dependencies = new Set(item.dependencies ?? []);
  const contents = item.files.map((file) => file.content ?? "").join("\n");
  const importSpecifiers = [
    ...contents.matchAll(/\bfrom\s+["']([^"']+)["']/g),
    ...contents.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g),
  ].map((match) => match[1]);

  for (const specifier of importSpecifiers) {
    if (specifier.startsWith(".") || specifier.startsWith("@/") || specifier.startsWith("/")) {
      continue;
    }
    const packageName = specifier.startsWith("@")
      ? specifier.split("/").slice(0, 2).join("/")
      : specifier.split("/")[0];
    if (PROJECT_RUNTIME_DEPENDENCIES.has(packageName)) dependencies.add(packageName);
  }

  const devDependencies = new Set(item.devDependencies ?? []);
  for (const dependency of dependencies) {
    const types = UNTYPED_PACKAGE_TYPES[dependency];
    if (types) devDependencies.add(types);
  }

  return {
    ...item,
    dependencies: [...dependencies],
    ...(devDependencies.size ? { devDependencies: [...devDependencies] } : {}),
  };
}

/** Packages that ship without TypeScript types; installing a component that imports them also needs these. */
const UNTYPED_PACKAGE_TYPES = {
  "topojson-client": "@types/topojson-client",
  three: "@types/three",
  "matter-js": "@types/matter-js",
};

function buildTerminalItem() {
  const terminalPath = path.join(root, "src", "components", "terminal", "terminal.tsx");
  const spritePath = path.join(root, "src", "components", "terminal", "sprite-audio.ts");
  let terminalContent = fs.readFileSync(terminalPath, "utf8");
  terminalContent = terminalContent.replace(
    'from "./sprite-audio"',
    'from "./terminal-sprite-audio"',
  );
  const spriteContent = fs.readFileSync(spritePath, "utf8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "terminal",
    type: "registry:component",
    title: "Interactive Terminal",
    description:
      "macOS-style terminal with typewriter commands, output sequencing, optional Aceternity sprite audio.",
    dependencies: ["framer-motion"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "next-ui/terminal.tsx",
        type: "registry:component",
        target: "components/terminal.tsx",
        content: terminalContent,
      },
      {
        path: "next-ui/terminal-sprite-audio.ts",
        type: "registry:lib",
        target: "components/terminal-sprite-audio.ts",
        content: spriteContent,
      },
    ],
  };
}

function buildSquigglyItem() {
  const main = fs.readFileSync(path.join(root, "src", "components", "squiggly-text", "squiggly-text.tsx"), "utf8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "squiggly-text",
    type: "registry:component",
    title: "RippleLine squiggly text",
    description:
      "Hero-grade headline with an animated wave underline, turbulence + Gaussian blur + displacement, optional glyph micro-warp, and reduced-motion fallbacks.",
    dependencies: ["framer-motion"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "next-ui/squiggly-text.tsx",
        type: "registry:component",
        target: "components/squiggly-text.tsx",
        content: main,
      },
    ],
  };
}

function buildFloatingDockItem() {
  const base = path.join(root, "src", "components", "floating-dock");
  const read = (f) => fs.readFileSync(path.join(base, f), "utf8");
  const rootShim = fs.readFileSync(path.join(root, "src", "components", "floating-dock.tsx"), "utf8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "floating-dock",
    type: "registry:component",
    title: "Nexus floating dock",
    description:
      "Bottom-centered macOS-style dock with pointer-driven magnification, glass pill, tooltips, and mobile sheet menu.",
    dependencies: ["framer-motion", "lucide-react"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "next-ui/floating-dock/types.ts",
        type: "registry:lib",
        target: "components/floating-dock/types.ts",
        content: read("types.ts"),
      },
      {
        path: "next-ui/floating-dock/icon-container.tsx",
        type: "registry:component",
        target: "components/floating-dock/icon-container.tsx",
        content: read("icon-container.tsx"),
      },
      {
        path: "next-ui/floating-dock/floating-dock-desktop.tsx",
        type: "registry:component",
        target: "components/floating-dock/floating-dock-desktop.tsx",
        content: read("floating-dock-desktop.tsx"),
      },
      {
        path: "next-ui/floating-dock/floating-dock-mobile.tsx",
        type: "registry:component",
        target: "components/floating-dock/floating-dock-mobile.tsx",
        content: read("floating-dock-mobile.tsx"),
      },
      {
        path: "next-ui/floating-dock/floating-dock.tsx",
        type: "registry:component",
        target: "components/floating-dock/floating-dock.tsx",
        content: read("floating-dock.tsx"),
      },
      {
        path: "next-ui/floating-dock/index.ts",
        type: "registry:lib",
        target: "components/floating-dock/index.ts",
        content: read("index.ts"),
      },
      {
        path: "next-ui/floating-dock-import.tsx",
        type: "registry:component",
        target: "components/floating-dock.tsx",
        content: rootShim,
      },
    ],
  };
}

function buildStatefulButtonItem() {
  const p = path.join(root, "src", "components", "stateful-button", "stateful-button.tsx");
  const content = fs.readFileSync(p, "utf8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "stateful-button",
    type: "registry:component",
    title: "Stateful message button",
    description:
      "Animated async button with idle → loading → success transitions, click guarding, and smooth icon/text motion.",
    dependencies: ["framer-motion", "lucide-react"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "next-ui/stateful-button.tsx",
        type: "registry:component",
        target: "components/stateful-button.tsx",
        content,
      },
    ],
  };
}

function buildSparklesItem() {
  const p = path.join(root, "src", "components", "sparkles", "sparkles.tsx");
  const content = fs.readFileSync(p, "utf8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "sparkles",
    type: "registry:component",
    title: "Sparkles field",
    description:
      "Configurable animated particle field for hero highlights, card backgrounds, and decorative UI layers.",
    dependencies: ["framer-motion"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "next-ui/sparkles.tsx",
        type: "registry:component",
        target: "components/sparkles.tsx",
        content,
      },
    ],
  };
}

function buildInteractiveGlobeExplorerItem() {
  const base = path.join(root, "src", "components", "interactive-globe-explorer");
  const componentPath = path.join(base, "interactive-globe-explorer.tsx");
  const indexPath = path.join(base, "index.ts");
  const componentContent = fs
    .readFileSync(componentPath, "utf8")
    .replace(
      'globeTextureUrl = "/images/earth-blue-marble.jpg"',
      'globeTextureUrl = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"',
    );
  const indexContent = fs.readFileSync(indexPath, "utf8");

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "interactive-globe-explorer",
    type: "registry:component",
    title: "Interactive Globe Explorer",
    description:
      "Scrollable office/location explorer with a live React Globe, synchronized city list, clickable map pins, responsive details popover, and one-click address/email copy actions.",
    dependencies: ["react-globe.gl", "three", "lucide-react"],
    registryDependencies: ["button", "utils"],
    files: [
      {
        path: "next-ui/interactive-globe-explorer/interactive-globe-explorer.tsx",
        type: "registry:component",
        target: "components/interactive-globe-explorer/interactive-globe-explorer.tsx",
        content: componentContent,
      },
      {
        path: "next-ui/interactive-globe-explorer/index.ts",
        type: "registry:lib",
        target: "components/interactive-globe-explorer/index.ts",
        content: indexContent,
      },
    ],
  };
}

function buildGooeyItem() {
  const p = path.join(root, "src", "components", "gooey-input", "gooey-input.tsx");
  const content = fs.readFileSync(p, "utf8");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "gooey-input",
    type: "registry:component",
    title: "Gooey Search Input",
    description: "Expandable search pill with SVG gooey filter and Framer Motion layout transitions.",
    dependencies: ["framer-motion", "lucide-react"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "next-ui/gooey-input.tsx",
        type: "registry:component",
        target: "components/gooey-input.tsx",
        content,
      },
    ],
  };
}

const BLOCK_REGISTRY_PACKAGES = [
  {
    name: "pricing-section",
    title: "Pricing Section",
    description:
      "Four interactive pricing layouts with radio selection, animated monthly and yearly billing transitions, and configurable feature lists.",
    premium: false,
    components: ["blocks/pricing-section"],
  },
  {
    name: "text-animations",
    title: "Text Animations",
    description:
      "Animated headings and generated text components with typewriter and blur reveal motion.",
    premium: true,
    components: ["blocks/text-animations"],
  },
  {
    name: "logo-clouds",
    title: "Brand Logo Animation",
    description:
      "A complete set of animated logo cloud layouts including marquee, spotlight, swapping, and blur variants.",
    premium: false,
    components: ["blocks/logo-clouds"],
  },
  {
    name: "interactive-backgrounds",
    title: "Interactive Background Card",
    description:
      "Interactive dot, layered wave, particle noise, and wavy line backgrounds for immersive sections.",
    premium: true,
    components: ["interactive-dots", "layered-wave-background", "particle-noise", "wavy-lines"],
  },
  {
    name: "why-choose-us-bento",
    title: "Why Choose Us Bento Grid",
    description:
      "Animated feature, ATS, and spotlight bento-grid block variants.",
    premium: true,
    components: ["blocks/animated-bento-grid", "blocks/ats-bento-grid", "blocks/spotlight-bento-grid"],
  },
  {
    name: "faq-folder-card",
    title: "FAQ Folder Card",
    description:
      "FAQ block layouts with searchable and chat-style animated variants.",
    premium: true,
    components: ["blocks/faq-folder-card"],
  },
  {
    name: "sidebar",
    title: "Sidebar",
    description:
      "Simple, collapsible, and grouped animated sidebar navigation layouts.",
    premium: false,
    components: ["blocks/sidebar"],
  },
  {
    name: "contact-page",
    title: "Contact Page",
    description:
      "Contact block variants with forms, social links, imagery, and the included Nexus mark.",
    premium: false,
    components: ["blocks/contact-page"],
  },
  {
    name: "checkout-moments",
    title: "Checkout Moments",
    description:
      "Pay-by-sliding order summary, one-time-code payment approval, and a tip-and-rate card.",
    premium: true,
    components: ["blocks/checkout-moments"],
    dependencies: ["framer-motion", "lucide-react"],
  },
  {
    name: "blog-content-sections",
    title: "Blog Content Sections",
    description:
      "Centered article, table-of-contents, editorial, featured post, and hover-card blog sections.",
    premium: false,
    components: ["blocks/blog-content-sections"],
  },
  // Motion Kit sections: each one installs on its own; Pro only.
  {
    name: "seat-ruler-pricing",
    title: "Seat Ruler Pricing",
    description: "Seat Ruler Pricing, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/seat-ruler-pricing"],
  },
  {
    name: "beam-pricing",
    title: "Beam Pricing",
    description: "Beam Pricing, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/beam-pricing"],
  },
  {
    name: "halftone-planet",
    title: "Halftone Planet",
    description: "Halftone Planet, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/halftone-planet"],
  },
  {
    name: "loupe-logo-cloud",
    title: "Loupe Logo Cloud",
    description: "Loupe Logo Cloud, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/loupe-logo-cloud"],
  },
  {
    name: "slide-to-pay",
    title: "Slide to Pay",
    description: "Slide to Pay, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/slide-to-pay"],
  },
  {
    name: "collapsing-rail",
    title: "Collapsing Rail",
    description: "Collapsing Rail, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/collapsing-rail"],
  },
  {
    name: "pulse-bento",
    title: "Pulse Bento",
    description: "Pulse Bento, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/pulse-bento"],
  },
  {
    name: "live-demo-bento",
    title: "Live Demo Bento",
    description: "Live Demo Bento, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/live-demo-bento"],
  },
  {
    name: "instant-search-faq",
    title: "Instant Search FAQ",
    description: "Instant Search FAQ, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/instant-search-faq"],
  },
  {
    name: "voice-note-contact",
    title: "Voice Note Contact",
    description: "Voice Note Contact, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/voice-note-contact"],
  },
  {
    name: "scramble-heading",
    title: "Scramble Heading",
    description: "Scramble Heading, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/scramble-heading"],
  },
  {
    name: "scroll-read-manifesto",
    title: "Scroll-read Manifesto",
    description: "Scroll-read Manifesto, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/scroll-read-manifesto"],
  },
  {
    name: "morphing-nav",
    title: "Morphing Nav",
    description: "Morphing Nav, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/morphing-nav"],
  },
  {
    name: "spotlight-hero",
    title: "Spotlight Hero",
    description: "Spotlight Hero, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/spotlight-hero"],
  },
  {
    name: "parallax-stack-hero",
    title: "Parallax Stack Hero",
    description: "Parallax Stack Hero, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/parallax-stack-hero"],
  },
  {
    name: "auto-advancing-tabs",
    title: "Auto-advancing Tabs",
    description: "Auto-advancing Tabs, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/auto-advancing-tabs"],
  },
  {
    name: "drawn-timeline",
    title: "Drawn Timeline",
    description: "Drawn Timeline, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/drawn-timeline"],
  },
  {
    name: "integrations-orbit",
    title: "Integrations Orbit",
    description: "Integrations Orbit, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/integrations-orbit"],
  },
  {
    name: "counting-stats",
    title: "Counting Stats",
    description: "Counting Stats, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/counting-stats"],
  },
  {
    name: "clothesline",
    title: "Clothesline",
    description: "Testimonials pegged to a washing line: a verlet rope that sags under each card, can be plucked or tugged, and opens a quote in a dialog when a card is clicked.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/clothesline"],
  },
  {
    name: "wall-of-love",
    title: "Wall of Love",
    description: "Wall of Love, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/wall-of-love"],
  },
  {
    name: "typo-catching-signup",
    title: "Typo-catching Signup",
    description: "Typo-catching Signup, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/typo-catching-signup"],
  },
  {
    name: "kinetic-hero",
    title: "Kinetic Hero",
    description: "Kinetic Hero, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/kinetic-hero"],
  },
  {
    name: "drift-gallery",
    title: "Drift Gallery",
    description: "Drift Gallery, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/drift-gallery"],
  },
  {
    name: "changelog-pile",
    title: "Changelog Pile",
    description: "Changelog Pile, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/changelog-pile"],
  },
  {
    name: "gravity-404",
    title: "Gravity 404",
    description: "Gravity 404, a Motion Kit block section.",
    premium: true,
    components: ["blocks/motion-kit/gravity-404"],
  },
  {
    name: "navigation-blocks",
    title: "Navigation Blocks",
    description: "A navigation bar that morphs into a compact pill as the page scrolls.",
    premium: true,
    components: ["blocks/motion-kit/morphing-nav", "blocks/motion-kit/scroll-navbar", "blocks/motion-kit/morph-menu", "blocks/motion-kit/announce-bar"],
  },
  {
    name: "velocity-marquee",
    title: "Velocity Marquee",
    description: "Two belts of customer reviews wired to page scroll velocity: scrolling speeds them up and leans them, scrolling back reverses them, hovering brakes and grabbing drags.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/velocity-marquee"],
  },
  {
    name: "logo-stories",
    title: "Logo Stories",
    description: "A logo cloud where a highlight glides from customer to customer and the panel below swaps to their headline number and quote.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/logo-stories"],
  },
  {
    name: "filterable-logo-wall",
    title: "Filterable Logo Wall",
    description: "A customer logo wall sortable by industry: non-matching logos shrink away, matches glide into place and the count rolls.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/filterable-logo-wall"],
  },
  {
    name: "cursor-crowd-hero",
    title: "Cursor Crowd Hero",
    description: "A hero where teammates' live cursors select and retype the headline, tug the button and drop comments, and your own cursor joins them.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/cursor-crowd-hero"],
  },
  {
    name: "xray-hero",
    title: "X-ray Hero",
    description: "A hero with a lens that follows the pointer and shows the page's blueprint underneath: grid, spacing, type specs and measurements.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/xray-hero"],
  },
  {
    name: "circuit-hero",
    title: "Circuit Hero",
    description: "A hero on a living circuit board canvas where signals race along traces, wires near the pointer warm up and fire, and a click sends a burst.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/circuit-hero"],
  },
  {
    name: "flip-dot-hero",
    title: "Flip-dot Hero",
    description: "A hero built around a flip-dot sign whose dots clack over in a ripple, with drag-to-flip and a sanitised type-your-own-word input.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/flip-dot-hero"],
  },
  {
    name: "team-clock",
    title: "Team Clock",
    description: "A team section where every card shows a person's local time, a draggable UTC bar shades the hours the team overlaps, and chips filter by team.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/team-clock"],
  },
  {
    name: "stats-odometer",
    title: "Stats Odometer",
    description: "Stat cards whose digits roll like an odometer when they scroll into view, with a period switch that rolls every number to its new value and redraws the sparklines.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/stats-odometer"],
  },
  {
    name: "blog-with-contents",
    title: "Blog with Contents",
    description: "A long-read article with a contents rail that tracks the active heading, fills a line beside each section as you read, counts down the time left and collapses into a pill on narrow screens.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/blog-with-contents"],
  },
  {
    name: "waitlist-cta",
    title: "Waitlist CTA",
    description: "A waitlist call to action where the email form turns into a spinner and then folds into the visitor's place in line with a ticking count, a new avatar and a referral link.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/waitlist-cta"],
  },
  {
    name: "auth-morph",
    title: "Auth Morph",
    description: "One auth card for sign in and sign up whose fields grow and fold as the mode changes, with a magic link option that ends on a check-your-inbox screen and resend timer.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/auth-morph"],
  },
  {
    name: "parallax-slider",
    title: "Parallax Slider",
    description: "A full-width photo slider with depth: the picture inside each slide trails the frame as you drag, titles rise in letter by letter, the counter rolls and a segment fills while it waits to move on.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/parallax-slider"],
  },
  {
    name: "card-rail",
    title: "Card Rail",
    description: "A snapping rail of gradient cards that ease up to full size at the front, with a progress bar and arrows; opening a card grows it into a detail panel that shrinks back into its slot.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/card-rail"],
  },
  {
    name: "sticky-scroll-story",
    title: "Sticky Scroll Story",
    description: "A scroll story where the copy scrolls past while one pinned card changes shape to match each step: button, menu, form, receipt.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/sticky-scroll-story"],
  },
  {
    name: "beam-timeline",
    title: "Beam Timeline",
    description: "A milestone timeline with a beam of light that follows your scroll; the glowing head stretches with scroll speed and each milestone lights up as the beam reaches it.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/beam-timeline"],
  },
  {
    name: "stacking-cards",
    title: "Stacking Cards",
    description: "Cards that pin one below the other as you scroll, each sliding over the last while the ones underneath shrink and dim to build depth.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/stacking-cards"],
  },
  {
    name: "scroll-navbar",
    title: "Scroll Navbar",
    description: "A navbar that tucks into a floating pill as you scroll, slides away going down, returns the moment you scroll up, and underlines the section you are reading.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/scroll-navbar"],
  },
  {
    name: "morph-menu",
    title: "Morph Menu",
    description: "A pill navbar whose single mega-menu panel reshapes itself between menus, with content sliding in from the side you moved toward and a caret that glides under the active item.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/morph-menu"],
  },
  {
    name: "announce-bar",
    title: "Announce Bar",
    description: "An announcement bar that rolls through several messages with a thin timer, pauses when you hover or focus it, and folds away when dismissed while the page slides up.",
    premium: true,
    dependencies: ["framer-motion"],
    components: ["blocks/motion-kit/announce-bar"],
  },
  {
    name: "hero-blocks",
    title: "Hero Blocks",
    description: "A cursor spotlight hero, a parallax stack hero and a scroll-driven kinetic headline hero.",
    premium: true,
    dependencies: ["framer-motion", "gsap"],
    components: ["blocks/motion-kit/spotlight-hero", "blocks/motion-kit/parallax-stack-hero", "blocks/motion-kit/kinetic-hero"],
  },
  {
    name: "feature-blocks",
    title: "Feature Blocks",
    description: "Auto-advancing feature tabs, a timeline that draws itself on scroll, and an integrations orbit.",
    premium: true,
    components: ["blocks/motion-kit/auto-advancing-tabs", "blocks/motion-kit/drawn-timeline", "blocks/motion-kit/integrations-orbit", "blocks/motion-kit/sticky-scroll-story", "blocks/motion-kit/beam-timeline", "blocks/motion-kit/stacking-cards"],
  },
  {
    name: "social-proof-blocks",
    title: "Social Proof Blocks",
    description: "Stats that count up into view and a wall of love testimonial grid.",
    premium: true,
    components: ["blocks/motion-kit/counting-stats", "blocks/motion-kit/wall-of-love", "blocks/motion-kit/clothesline", "blocks/motion-kit/velocity-marquee", "blocks/motion-kit/stats-odometer"],
  },
  {
    name: "newsletter-blocks",
    title: "Newsletter Blocks",
    description: "A newsletter signup that catches email typos before submitting.",
    premium: true,
    components: ["blocks/motion-kit/typo-catching-signup"],
  },
  {
    name: "gallery-blocks",
    title: "Gallery Blocks",
    description: "An endless 3D wall of work you can drag, fling and open.",
    premium: true,
    dependencies: ["framer-motion", "three", "@react-three/fiber"],
    components: ["blocks/motion-kit/drift-gallery", "blocks/motion-kit/parallax-slider", "blocks/motion-kit/card-rail"],
  },
  {
    name: "changelog-blocks",
    title: "Changelog Blocks",
    description: "Release notes as a pile of physical cards, with filters and a list view.",
    premium: true,
    dependencies: ["framer-motion", "matter-js"],
    components: ["blocks/motion-kit/changelog-pile"],
  },
  {
    name: "not-found-blocks",
    title: "404 Page Blocks",
    description: "A not-found page whose pieces fall under gravity and can be put back.",
    premium: true,
    dependencies: ["framer-motion", "matter-js"],
    components: ["blocks/motion-kit/gravity-404"],
  },
  {
    name: "cta-blocks",
    title: "CTA Blocks",
    description: "A call to action on a slow nebula with a glow that follows the pointer.",
    premium: true,
    components: ["nebula-cta-glow"],
  },
  {
    name: "footer-blocks",
    title: "Footer Blocks",
    description: "A site footer with link columns, newsletter, status and a lit wordmark.",
    premium: false,
    components: ["orbit-footer"],
  },
  {
    name: "signup-blocks",
    title: "Sign-up Blocks",
    description: "A split sign-up page with a self-ticking checklist and a strength meter.",
    premium: false,
    components: ["split-signup-convert"],
  },
];

function buildBlockCollectionItem(blockPackage) {
  const cliName = blockPackage.name;
  const files = new Map();
  const seenComponents = new Set();
  const seenUi = new Set();

  for (const component of blockPackage.components) {
    collectSourceFiles(component, files, seenComponents);
  }

  collectImportedLocalFiles(files, seenComponents, seenUi);
  const contents = [...files.values()].map((file) => file.content).join("\n");

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: cliName,
    type: "registry:component",
    title: blockPackage.title,
    description: blockPackage.description,
    dependencies: blockPackage.dependencies ?? [],
    registryDependencies: registryDepsForReactSource(contents),
    files: [...files.values()],
  };
}

// Sections that moved from the components library to the Blocks pages keep their install names;
// their entries share the catalog's shape, so they are read the same way.
const movedPath = path.join(root, "src", "lib", "catalog", "moved-sections.ts");
const catalogTs = fs.readFileSync(catalogPath, "utf8") + "\n" + fs.readFileSync(movedPath, "utf8");
const blocks = extractBlocks(catalogTs);

const items = [buildNexusFontItem(), buildUiSoundsItem(), buildUiSoundsProItem(), buildUiSoundsMacItem(), buildUiSoundsRecordedItem()];
const bySlug = new Map(blocks.map((b) => [b.slug, b.text]));

for (const { slug } of blocks) {
  const block = bySlug.get(slug);
  const sourceBackedItem = buildSourceBackedItem(slug, block);
  if (sourceBackedItem) {
    items.push(sourceBackedItem);
    continue;
  }

  if (slug === "terminal") {
    items.push(buildTerminalItem());
    continue;
  }
  if (slug === "gooey-search-input") {
    items.push(buildGooeyItem());
    continue;
  }
  if (slug === "squiggly-text") {
    items.push(buildSquigglyItem());
    continue;
  }
  if (slug === "floating-dock") {
    items.push(buildFloatingDockItem());
    continue;
  }
  if (slug === "stateful-button") {
    items.push(buildStatefulButtonItem());
    continue;
  }
  if (slug === "sparkles") {
    items.push(buildSparklesItem());
    continue;
  }
  if (slug === "interactive-globe-explorer") {
    items.push(buildInteractiveGlobeExplorerItem());
    continue;
  }
  const item = buildSnippetItem(slug, block);
  if (item) items.push(item);
}

for (const blockPackage of BLOCK_REGISTRY_PACKAGES) {
  items.push(buildBlockCollectionItem(blockPackage));
}

/**
 * Site utilities some components lean on (defined in src/app/globals.css). Ship them with the
 * item as `css` so an installed component looks the same outside Nexus UI.
 */
const SITE_UTILITY_CSS = {
  "lf-grid": {
    "@utility lf-grid": {
      "background-image":
        "linear-gradient(oklch(0 0 0 / 5%) 1px, transparent 1px), linear-gradient(90deg, oklch(0 0 0 / 5%) 1px, transparent 1px)",
      "background-size": "64px 64px",
      "&:where(.dark, .dark *)": {
        "background-image":
          "linear-gradient(oklch(1 0 0 / 6%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 6%) 1px, transparent 1px)",
      },
    },
  },
  "lf-aurora": {
    "@utility lf-aurora": {
      "background-image":
        "radial-gradient(60% 80% at 10% 10%, oklch(0.28 0.015 260 / 0.5), transparent 60%), radial-gradient(50% 70% at 90% 20%, oklch(0.22 0.01 260 / 0.4), transparent 55%), radial-gradient(70% 60% at 50% 100%, oklch(0.18 0.01 260 / 0.3), transparent 60%)",
      filter: "saturate(80%)",
    },
  },
  "lf-glass": {
    "@utility lf-glass": {
      border: "1px solid var(--border)",
      "background-color": "color-mix(in oklab, var(--card) 70%, transparent)",
      "box-shadow": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "backdrop-filter": "blur(24px)",
      "&:where(.dark, .dark *)": {
        "border-color": "rgb(255 255 255 / 0.1)",
        "background-color": "rgb(255 255 255 / 0.05)",
        "box-shadow": "inset 0 0 0 1px rgba(255,255,255,0.04)",
      },
    },
  },
};

function withSiteUtilityCss(item) {
  const contents = (item.files ?? []).map((file) => file.content ?? "").join("\n");
  const css = {};
  for (const [name, rules] of Object.entries(SITE_UTILITY_CSS)) {
    if (new RegExp(`\\b${name}\\b`).test(contents)) Object.assign(css, rules);
  }
  return Object.keys(css).length ? { ...item, css: { ...(item.css ?? {}), ...css } } : item;
}

const completedItems = items.map(detectedPackageDependencies).map(withSiteUtilityCss);

function buildRegistryIndex(registryItems) {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "next-ui",
    homepage,
    items: registryItems.map((it) => ({
      name: it.name,
      type: it.type,
      title: it.title,
      description: it.description,
      dependencies: it.dependencies,
      registryDependencies: it.registryDependencies ?? [],
      files: (it.files ?? []).map((f) => ({ path: f.path, type: f.type })),
    })),
  };
}

function writeRegistry(destination, registryItems) {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });
  for (const item of registryItems) {
    fs.writeFileSync(path.join(destination, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
  }
  fs.writeFileSync(
    path.join(destination, "registry.json"),
    `${JSON.stringify(buildRegistryIndex(registryItems), null, 2)}\n`,
  );
}

const publicNames = new Set([
  NEXUS_FONT_REGISTRY_NAME,
  UI_SOUNDS_REGISTRY_NAME,
  ...BLOCK_REGISTRY_PACKAGES
    .filter((blockPackage) => !blockPackage.premium)
    .map((blockPackage) => blockPackage.name),
  ...blocks
    .filter((block) => !isPremiumBlock(block.text))
    .map((block) => extractRegistryCliName(block.slug, block.text)),
]);
const publicItems = completedItems.filter((item) => publicNames.has(item.name));

writeRegistry(serverOutDir, completedItems);
writeRegistry(publicOutDir, publicItems);

console.log(
  `Wrote ${completedItems.length - 1} registry items to .generated/registry and ${publicItems.length - 1} free items to public/r.`,
);

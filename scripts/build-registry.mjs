/**
 * Emits shadcn-compatible registry JSON under public/r/ for every catalog component.
 * @see https://ui.shadcn.com/docs/registry/registry-item-json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "r");
const catalogPath = path.join(root, "src", "lib", "catalog", "library-components.ts");
const NEXUS_FONT_REGISTRY_NAME = "nexus-font";
const NEXUS_FONT_REGISTRY_DEP = "https://nexus-ui.com/r/nexus-font.json";

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
  return head.slice(openTick + 1, closeTick);
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

function extractRegistryCliName(slug, block) {
  const m = block.match(/registryCliName:\s*"([^"]+)"/);
  return m?.[1] ?? REGISTRY_CLI_NAME[slug] ?? slug;
}

function registryDepsForReactSource(src) {
  const deps = new Set();
  deps.add(NEXUS_FONT_REGISTRY_DEP);
  if (src.includes("@/lib/utils") || src.includes("@/components/ui")) deps.add("utils");

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
      family: "Inter",
      provider: "google",
      import:
        "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
      variable: "--font-sans",
      weight: ["100 900"],
      subsets: ["latin"],
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

function buildSnippetItem(slug, block) {
  const cliName = extractRegistryCliName(slug, block);
  const reactSource = extractReactSource(block);
  if (!reactSource) {
    console.warn(`Skipping ${slug}: could not extract reactSource`);
    return null;
  }
  const title = extractName(block);
  const description = extractDescription(block);
  const dependencies = extractDependencies(block);
  const registryDependencies = registryDepsForReactSource(reactSource);
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: cliName,
    type: "registry:component",
    title,
    description,
    dependencies,
    registryDependencies,
    files: [
      {
        path: `next-ui/${cliName}.tsx`,
        type: "registry:component",
        target: `components/${cliName}.tsx`,
        content: `${reactSource.trim()}\n`,
      },
    ],
  };
}

const homepage = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";

function isRegistrySourceFile(filePath) {
  if (!/\.(tsx|ts)$/.test(filePath)) return false;
  const base = path.basename(filePath);
  return !["demo.tsx", "preview.tsx"].includes(base);
}

function readRegistryFile(filePath, cliName) {
  let content = fs.readFileSync(filePath, "utf8");

  content = content
    .split("\n")
    .filter((line) => !/from "\.\/(demo|preview)"/.test(line))
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
      for (const match of file.content.matchAll(/@\/components\/(?!ui\/)([a-z0-9-]+)/g)) {
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

const catalogTs = fs.readFileSync(catalogPath, "utf8");
const blocks = extractBlocks(catalogTs);

const items = [buildNexusFontItem()];
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

const registryIndex = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "next-ui",
  homepage,
  items: items.map((it) => ({
    name: it.name,
    type: it.type,
    title: it.title,
    description: it.description,
    dependencies: it.dependencies,
    registryDependencies: it.registryDependencies ?? [],
    files: (it.files ?? []).map((f) => ({ path: f.path, type: f.type })),
  })),
};

fs.mkdirSync(outDir, { recursive: true });
for (const it of items) {
  fs.writeFileSync(path.join(outDir, `${it.name}.json`), `${JSON.stringify(it, null, 2)}\n`);
}
fs.writeFileSync(path.join(outDir, "registry.json"), `${JSON.stringify(registryIndex, null, 2)}\n`);

console.log(`Wrote ${items.length} registry items to public/r/ and registry.json`);

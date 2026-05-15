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

/** Catalog slug → CLI / JSON filename (e.g. gooey-search-input → gooey-input). */
const REGISTRY_CLI_NAME = {
  "gooey-search-input": "gooey-input",
};

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

function registryDepsForReactSource(src) {
  const deps = [];
  if (src.includes("@/lib/utils") || src.includes("@/components/ui")) deps.push("utils");
  return deps;
}

function buildSnippetItem(slug, block) {
  const cliName = REGISTRY_CLI_NAME[slug] ?? slug;
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

const items = [];
const bySlug = new Map(blocks.map((b) => [b.slug, b.text]));

for (const { slug } of blocks) {
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
  const block = bySlug.get(slug);
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
    files: it.files.map((f) => ({ path: f.path, type: f.type })),
  })),
};

fs.mkdirSync(outDir, { recursive: true });
for (const it of items) {
  fs.writeFileSync(path.join(outDir, `${it.name}.json`), `${JSON.stringify(it, null, 2)}\n`);
}
fs.writeFileSync(path.join(outDir, "registry.json"), `${JSON.stringify(registryIndex, null, 2)}\n`);

console.log(`Wrote ${items.length} registry items to public/r/ and registry.json`);

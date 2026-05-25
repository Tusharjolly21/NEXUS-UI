import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { createClient } from "@/lib/supabase/server";
import { canAccessTemplate } from "@/lib/entitlements";
import { getTemplate } from "@/lib/catalog/templates";
import { rateLimit } from "@/lib/rate-limit";

const ROOT = process.cwd();
const TEMPLATE_SOURCE_ROOT = "src/components/templates";
const INSPECTABLE_SOURCE_PATTERN = /\.(?:css|json|mjs|js|jsx|ts|tsx)$/i;
const PUBLIC_ASSET_PATTERN =
  /(?:["'`(])\/([^"'`()\s?#]+?\.(?:glb|gltf|jpe?g|json|mp3|mp4|ogg|otf|png|svg|wav|webm|webp|woff2?))(?:[?#][^"'`()\s]*)?(?=["'`)])/gi;

const SLUG_TO_FILE: Record<string, string> = {
  "noir-studio": "noir-studio-template-page.tsx",
  "nexus-ai-launch": "nexus-ai-launch-template-page.tsx",
  "talent-hub-landing": "talent-hub-page.tsx",
  "startup-landing-page": "startup-landing-page.tsx",
  "nova-landing-page": "nova-landing-page.tsx",
  "simplistic-saas-template": "simplistic-saas-page.tsx",
  "orbit-ai-page": "orbit-ai-page.tsx",
  "synapse-ai-platform": "synapse-ai-page.tsx",
  "helix-ai-platform": "helix-ai-platform.tsx",
  "orion-ai-ops": "orion-ai-ops.tsx",
  "pulse-landing": "pulse-landing-page.tsx",
  "aether-portfolio": "aether-portfolio-page.tsx",
  "claura-agency": "claura-agency-page.tsx",
  "ocean-flow": "ocean-flow-page.tsx",
  "saas-launch-aurora": "saas-launch-aurora-page.tsx",
  "ai-startup-forge": "ai-startup-forge-page.tsx",
  "macbook-pro-showcase": "gsap-macbook-landing-page.tsx",
};

// Some templates include a dedicated source bundle in addition to files reachable from the page entry.
const ASSOCIATED_SOURCE_DIRECTORIES: Record<string, string[]> = {
  "macbook-pro-showcase": ["src/components/templates/gsap-macbook-landing"],
};

type RootPackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type TemplateFiles = {
  assets: Set<string>;
  packages: Set<string>;
  sources: Set<string>;
};

function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

function isWithinRoot(absolutePath: string) {
  return absolutePath === ROOT || absolutePath.startsWith(`${ROOT}${path.sep}`);
}

async function readTextFile(relativePath: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(ROOT, relativePath), "utf8");
  } catch {
    return null;
  }
}

async function isFile(absolutePath: string) {
  try {
    return (await fs.stat(absolutePath)).isFile();
  } catch {
    return false;
  }
}

async function addFile(zip: JSZip, relativePath: string) {
  try {
    const contents = await fs.readFile(path.join(ROOT, relativePath));
    zip.file(relativePath, contents);
  } catch {
    // Missing optional images should not prevent the source archive from downloading.
  }
}

async function listFiles(relativeDirectory: string): Promise<string[]> {
  const absoluteDirectory = path.join(ROOT, relativeDirectory);
  try {
    const entries = await fs.readdir(absoluteDirectory, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const relativePath = toPosixPath(path.join(relativeDirectory, entry.name));
        return entry.isDirectory() ? listFiles(relativePath) : [relativePath];
      }),
    );
    return files.flat();
  } catch {
    return [];
  }
}

function getImportedSpecifiers(source: string) {
  const specifiers = new Set<string>();
  const staticImports =
    /(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/gm;
  const dynamicImports = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

  for (const expression of [staticImports, dynamicImports]) {
    for (const match of source.matchAll(expression)) {
      specifiers.add(match[1]);
    }
  }

  return specifiers;
}

function getPackageName(specifier: string) {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("node:")
  ) {
    return null;
  }

  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/");
  }

  return specifier.split("/")[0];
}

async function resolveLocalImport(sourcePath: string, specifier: string) {
  let absoluteBase: string | null = null;

  if (specifier.startsWith("@/")) {
    absoluteBase = path.join(ROOT, "src", specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    absoluteBase = path.resolve(path.dirname(path.join(ROOT, sourcePath)), specifier);
  }

  if (!absoluteBase || !isWithinRoot(absoluteBase)) return null;

  const candidates = [
    absoluteBase,
    `${absoluteBase}.ts`,
    `${absoluteBase}.tsx`,
    `${absoluteBase}.js`,
    `${absoluteBase}.jsx`,
    `${absoluteBase}.mjs`,
    `${absoluteBase}.css`,
    `${absoluteBase}.json`,
    path.join(absoluteBase, "index.ts"),
    path.join(absoluteBase, "index.tsx"),
    path.join(absoluteBase, "index.js"),
    path.join(absoluteBase, "index.jsx"),
    path.join(absoluteBase, "index.css"),
  ];

  for (const candidate of candidates) {
    if (await isFile(candidate)) return toPosixPath(path.relative(ROOT, candidate));
  }

  return null;
}

async function collectTemplateFiles(entryPath: string, slug: string): Promise<TemplateFiles> {
  const files: TemplateFiles = {
    assets: new Set<string>(),
    packages: new Set<string>(),
    sources: new Set<string>(),
  };
  const bundledDirectoryFiles = (
    await Promise.all((ASSOCIATED_SOURCE_DIRECTORIES[slug] ?? []).map(listFiles))
  ).flat();
  const queue = [entryPath, ...bundledDirectoryFiles];

  while (queue.length > 0) {
    const currentPath = queue.shift();
    if (!currentPath || files.sources.has(currentPath)) continue;

    const contents = await fs.readFile(path.join(ROOT, currentPath)).catch(() => null);
    if (!contents) continue;
    files.sources.add(currentPath);

    if (!INSPECTABLE_SOURCE_PATTERN.test(currentPath)) continue;
    const source = contents.toString("utf8");

    for (const match of source.matchAll(PUBLIC_ASSET_PATTERN)) {
      const publicPath = `public/${match[1]}`;
      if (await isFile(path.join(ROOT, publicPath))) files.assets.add(publicPath);
    }

    for (const specifier of getImportedSpecifiers(source)) {
      if (specifier.startsWith(".") || specifier.startsWith("@/")) {
        const dependencyPath = await resolveLocalImport(currentPath, specifier);
        if (dependencyPath) queue.push(dependencyPath);
        continue;
      }

      const packageName = getPackageName(specifier);
      if (packageName) files.packages.add(packageName);
    }
  }

  return files;
}

function getTemplatePageImport(componentSource: string, componentImportPath: string) {
  if (/\bexport\s+default\b/.test(componentSource)) {
    return `import TemplatePage from "${componentImportPath}";`;
  }

  const namedExports = Array.from(
    componentSource.matchAll(/\bexport\s+(?:async\s+)?(?:function|const)\s+(\w+)/g),
    (match) => match[1],
  );
  const pageExport =
    namedExports.find((exportName) => /(?:Page|Template)$/.test(exportName)) ??
    namedExports[namedExports.length - 1];

  if (!pageExport) throw new Error("The template component does not export a renderable page.");
  return `import { ${pageExport} as TemplatePage } from "${componentImportPath}";`;
}

function versionsFor(
  names: Iterable<string>,
  packageJson: RootPackageJson,
  fallbacks: Record<string, string> = {},
) {
  return Object.fromEntries(
    Array.from(names)
      .sort()
      .map((name) => [
        name,
        packageJson.dependencies?.[name] ??
          packageJson.devDependencies?.[name] ??
          fallbacks[name] ??
          "latest",
      ]),
  );
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const tmpl = getTemplate(slug);
  if (!tmpl) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`download:${user.id}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many download requests. Please wait before trying again." },
      { status: 429 },
    );
  }

  if (tmpl.premium) {
    const access = await canAccessTemplate(user.id, slug);
    if (!access) return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const componentFile = SLUG_TO_FILE[slug];
  if (!componentFile) {
    return NextResponse.json({ error: "Template source not available" }, { status: 404 });
  }

  const entryPath = `${TEMPLATE_SOURCE_ROOT}/${componentFile}`;
  const componentSource = await readTextFile(entryPath);
  if (!componentSource) {
    return NextResponse.json({ error: "Template source not available" }, { status: 404 });
  }

  const rootPackage = JSON.parse(
    (await readTextFile("package.json")) ?? "{}",
  ) as RootPackageJson;
  const zip = new JSZip();
  const collected = await collectTemplateFiles(entryPath, slug);

  for (const sourcePath of collected.sources) await addFile(zip, sourcePath);
  for (const assetPath of collected.assets) await addFile(zip, assetPath);
  for (const screenshotPath of await listFiles(`public/templates/${slug}`)) {
    await addFile(zip, screenshotPath);
  }

  const componentImportPath = `@/components/templates/${componentFile.replace(/\.[^.]+$/, "")}`;
  const pageImport = getTemplatePageImport(componentSource, componentImportPath);
  const title = JSON.stringify(tmpl.title);
  const description = JSON.stringify(tmpl.description);

  zip.file("src/app/page.tsx", `import type { Metadata } from "next";
${pageImport}

export const metadata: Metadata = {
  title: ${title},
  description: ${description},
};

export default function HomePage() {
  return <TemplatePage />;
}
`);

  zip.file("src/app/layout.tsx", `import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: ${title},
  description: ${description},
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
`);

  const globals = await readTextFile("src/app/globals.css");
  if (globals) zip.file("src/app/globals.css", globals);

  const runtimePackageNames = new Set([
    "next",
    "react",
    "react-dom",
    "shadcn",
    "tw-animate-css",
    ...collected.packages,
  ]);
  const developmentPackageNames = new Set([
    "@tailwindcss/postcss",
    "@types/node",
    "@types/react",
    "@types/react-dom",
    "postcss",
    "tailwindcss",
    "typescript",
  ]);

  zip.file(
    "package.json",
    JSON.stringify(
      {
        name: slug,
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
        },
        dependencies: versionsFor(runtimePackageNames, rootPackage),
        devDependencies: versionsFor(developmentPackageNames, rootPackage, { postcss: "^8" }),
      },
      null,
      2,
    ),
  );

  zip.file(
    "tsconfig.json",
    JSON.stringify(
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
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./src/*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      },
      null,
      2,
    ),
  );

  zip.file("next.config.ts", `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
    ],
  },
};

export default nextConfig;
`);

  zip.file("postcss.config.mjs", `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`);

  zip.file("README.md", `# ${tmpl.title}

${tmpl.description}

This download includes the template page, its local Nexus UI component dependencies, referenced public assets, and preview images.

## Stack
${tmpl.techStack.join(", ")}

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages
${tmpl.pages.join(", ")}

## Sections
${tmpl.sections.join(", ")}

---
Downloaded from [Nexus UI](https://nexus-ui.com)
`);

  // Media-heavy templates exceed buffered function response limits in production.
  const zipNodeStream = zip.generateNodeStream({
    type: "nodebuffer",
    streamFiles: true,
    compression: "DEFLATE",
  }) as unknown as Readable;
  const zipStream = Readable.toWeb(zipNodeStream) as ReadableStream<Uint8Array>;

  return new NextResponse(zipStream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}.zip"`,
    },
  });
}

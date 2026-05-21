import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import fs from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/entitlements";
import { getTemplate } from "@/lib/catalog/templates";

const ROOT = process.cwd();
const TEMPLATES_DIR = path.join(ROOT, "src", "components", "templates");

// Maps slug → main component file
const SLUG_TO_FILE: Record<string, string> = {
  "nexus-ai-launch":            "nexus-ai-launch-template-page.tsx",
  "talent-hub-landing":         "talent-hub-page.tsx",
  "startup-landing-page":       "startup-landing-page.tsx",
  "nova-landing-page":          "nova-landing-page.tsx",
  "simplistic-saas-template":   "simplistic-saas-page.tsx",
  "orbit-ai-page":              "orbit-ai-page.tsx",
  "synapse-ai-platform":        "synapse-ai-page.tsx",
  "helix-ai-platform":          "helix-ai-platform.tsx",
  "orion-ai-ops":               "orion-ai-ops.tsx",
  "pulse-landing":              "pulse-landing-page.tsx",
  "aether-portfolio":           "aether-portfolio-page.tsx",
  "claura-agency":              "claura-agency-page.tsx",
  "ocean-flow":                 "ocean-flow-page.tsx",
  "saas-launch-aurora":         "saas-launch-aurora-page.tsx",
  "ai-startup-forge":           "ai-startup-forge-page.tsx",
  "dev-portfolio-vector":       "dev-portfolio-vector-page.tsx",
  "agency-studio-deck":         "agency-studio-deck-page.tsx",
  "dashboard-aurora-analytics": "dashboard-aurora-analytics-page.tsx",
  "productivity-orbit-suite":   "productivity-orbit-suite-page.tsx",
  "yourbrand-hero":             "yourbrand-hero-page.tsx",
};

// Extra component files some templates depend on
const SLUG_EXTRA_DEPS: Record<string, string[]> = {
  "nexus-ai-launch": [
    "src/components/animated-bento-grid/index.ts",
    "src/components/animated-bento-grid/animated-bento-grid.tsx",
    "src/components/background-gradient/index.ts",
    "src/components/background-gradient/background-gradient.tsx",
    "src/components/hover-highlight-text/index.ts",
    "src/components/hover-highlight-text/hover-highlight-text.tsx",
    "src/components/infinite-moving-cards/index.ts",
    "src/components/infinite-moving-cards/InfiniteMovingCards.tsx",
    "src/components/meteors/index.ts",
    "src/components/meteors/meteors.tsx",
    "src/components/sparkles/index.ts",
    "src/components/sparkles/sparkles.tsx",
    "src/components/stateful-button/index.ts",
    "src/components/stateful-button/stateful-button.tsx",
    "src/components/text-generate-effect/index.ts",
    "src/components/text-generate-effect/text-generate-effect.tsx",
    "src/components/brand/index.ts",
    "src/components/brand/nexus-mark.tsx",
    "src/components/ui/accordion.tsx",
    "src/components/ui/button.tsx",
  ],
  "yourbrand-hero":           ["src/components/templates/yourbrand-dotted-sphere.tsx"],
  "ocean-flow":               ["src/components/infinite-moving-cards/InfiniteMovingCards.tsx"],
  "simplistic-saas-template": [
    "src/components/infinite-moving-cards/InfiniteMovingCards.tsx",
    "src/components/keyboard/keyboard.tsx",
    "src/components/keyboard/keyboard-key.tsx",
    "src/components/keyboard/keyboard-layout.ts",
    "src/components/keyboard/use-keyboard-sound.ts",
    "src/components/keyboard/index.ts",
  ],
};

async function readFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const tmpl = getTemplate(slug);
  if (!tmpl) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Premium check
  if (tmpl.premium) {
    const premium = await hasPremiumAccess(user.id);
    if (!premium) return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const componentFile = SLUG_TO_FILE[slug];
  const zip = new JSZip();

  // ── 1. Main template component ───────────────────────────────────────────────
  if (componentFile) {
    const content = await readFile(path.join(TEMPLATES_DIR, componentFile));
    if (content) {
      // Rewrite @/ imports to relative paths inside the zip
      const rewritten = content
        .replace(/@\/lib\/utils/g, "@/lib/utils")
        .replace(/@\/components\/infinite-moving-cards\/InfiniteMovingCards/g,
          "@/components/infinite-moving-cards/InfiniteMovingCards")
        .replace(/@\/components\/keyboard/g, "@/components/keyboard");
      zip.file(`src/components/${slug}/${componentFile}`, rewritten);
    }
  }

  // ── 2. lib/utils.ts ──────────────────────────────────────────────────────────
  const utilsContent = await readFile(path.join(ROOT, "src", "lib", "utils.ts"));
  if (utilsContent) zip.file("src/lib/utils.ts", utilsContent);

  // ── 3. Extra dependency files ────────────────────────────────────────────────
  const extras = SLUG_EXTRA_DEPS[slug] ?? [];
  for (const relPath of extras) {
    const content = await readFile(path.join(ROOT, relPath));
    if (content) zip.file(relPath, content);
  }

  // ── 4. app/page.tsx ──────────────────────────────────────────────────────────
  const componentName = componentFile
    ? componentFile.replace(".tsx", "").replace(".ts", "")
    : slug;

  // Derive the exported function name from the file
  const componentSource = componentFile
    ? await readFile(path.join(TEMPLATES_DIR, componentFile))
    : null;
  const exportMatch = componentSource?.match(/export default function (\w+)/);
  const exportName = exportMatch?.[1] ?? "TemplatePage";

  zip.file("src/app/page.tsx", `import type { Metadata } from "next";
import ${exportName} from "@/components/${slug}/${componentName}";

export const metadata: Metadata = {
  title: "${tmpl.title}",
  description: "${tmpl.description}",
};

export default function HomePage() {
  return <${exportName} />;
}
`);

  // ── 5. app/layout.tsx ────────────────────────────────────────────────────────
  zip.file("src/app/layout.tsx", `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${tmpl.title}",
  description: "${tmpl.description}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
`);

  // ── 6. app/globals.css ───────────────────────────────────────────────────────
  zip.file("src/app/globals.css", `@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-card: var(--card);
  --color-accent: var(--accent);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --card: oklch(1 0 0);
  --accent: oklch(0.97 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --border: oklch(0.269 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --card: oklch(0.205 0 0);
  --accent: oklch(0.269 0 0);
}

* { border-color: var(--border); }
body { background: var(--background); color: var(--foreground); }
`);

  // ── 7. package.json ──────────────────────────────────────────────────────────
  const deps: Record<string, string> = {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.511.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
  };

  if (tmpl.techStack.some(t => t.toLowerCase().includes("lenis"))) {
    deps["@studio-freight/lenis"] = "^1.0.42";
  }
  if (slug === "nexus-ai-launch") {
    deps["@base-ui/react"] = "^1.4.1";
  }
  if (extras.some(e => e.includes("keyboard"))) {
    deps["use-keyboard-sound"] = "^1.0.0";
  }
  if (slug === "yourbrand-hero") {
    deps["three"] = "^0.184.0";
    deps["@react-three/fiber"] = "^8.0.0";
    deps["@react-three/drei"] = "^9.0.0";
  }

  zip.file("package.json", JSON.stringify({
    name: slug,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
    },
    dependencies: deps,
    devDependencies: {
      "@types/node": "^22",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      "typescript": "^5",
      "tailwindcss": "^4",
      "tw-animate-css": "^1.2.5",
      "@tailwindcss/postcss": "^4",
      "postcss": "^8",
    },
  }, null, 2));

  // ── 8. tsconfig.json ─────────────────────────────────────────────────────────
  zip.file("tsconfig.json", JSON.stringify({
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
  }, null, 2));

  // ── 9. next.config.ts ────────────────────────────────────────────────────────
  zip.file("next.config.ts", `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`);

  // ── 10. postcss.config.mjs ───────────────────────────────────────────────────
  zip.file("postcss.config.mjs", `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`);

  // ── 11. README.md ────────────────────────────────────────────────────────────
  zip.file("README.md", `# ${tmpl.title}

${tmpl.description}

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

  // ── Generate zip ─────────────────────────────────────────────────────────────
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return new NextResponse(zipBuffer.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}.zip"`,
      "Content-Length": String(zipBuffer.byteLength),
    },
  });
}

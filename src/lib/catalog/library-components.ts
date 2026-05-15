import type { ComponentType } from "react";
import type { AnimationKind, ComponentCategorySlug } from "@/lib/catalog/taxonomy";
import * as Previews from "@/registry/component-previews";

export type LibraryComponent = {
  slug: string;
  name: string;
  description: string;
  categorySlug: ComponentCategorySlug;
  tags: string[];
  premium: boolean;
  trendingScore: number;
  createdAt: string;
  animationKinds: AnimationKind[];
  dependencies: string[];
  /** `compact` is honored by previews that support an embedded mode (e.g. terminal sound off in grids). */
  Preview: ComponentType<{ compact?: boolean }>;
  /** Optional: render each preview in its own mac card on detail page. */
  detailPreviews?: ComponentType<{ compact?: boolean }>[];
  /** Preview shell style on component detail pages. */
  previewShell?: "mac" | "plain";
  /** Required unless previewSections is provided (which supplies per-section code instead). */
  reactSource?: string;
  /** Optional multiple React snippets for components with more than one canonical variant/example. */
  reactExamples?: Array<{ title: string; code: string }>;
  /**
   * When present, the detail page renders each entry as its own independent
   * Preview / Code tab block instead of the shared single-tab layout.
   */
  previewSections?: Array<{
    Preview: ComponentType<{ compact?: boolean }>;
    reactSource: string;
  }>;
  tailwindSource: string;
  /** shadcn `add @scope/<name>` uses this basename; defaults to `slug` (e.g. gooey-search-input → gooey-input). */
  registryCliName?: string;
  /** Shown under the hero (reference docs, downloads, etc.). */
  resourceLinks?: Array<{ label: string; href: string }>;
  /** Optional prop docs shown on component detail pages. */
  props?: Array<{ name: string; type: string; description: string; defaultValue?: string }>;
};

const tw = `Use Tailwind utility composition with rounded-3xl, border-white/10, bg-zinc-950, backdrop-blur-xl, and gradient overlays. Prefer oklch-based neutrals and cyan/fuchsia accents for luminous contrast.`;

export const libraryComponents: LibraryComponent[] = [
  {
    slug: "cinematic-logo-cloud",
    name: "Cinematic Logo Cloud",
    description: "A staggered blur-fade entrance animation for brand logos. Uses framer-motion and fully semantic responsive layouts.",
    categorySlug: "logo-clouds",
    tags: ["logos", "brand", "marquee", "social proof", "framer-motion", "blur"],
    premium: false,
    trendingScore: 92,
    createdAt: "2024-05-15T00:00:00.000Z",
    animationKinds: ["spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCinematicLogoCloud,
    reactSource: `"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type LogoCloudClient = {
  name: string;
  slug?: string;
  text?: boolean;
  className?: string;
  invertDark?: boolean;
};

export interface CinematicLogoCloudProps {
  clients: LogoCloudClient[];
  className?: string;
}

export function CinematicLogoCloud({ clients, className }: CinematicLogoCloudProps) {
  const renderClient = (client: LogoCloudClient) => {
    if (client.text) {
      return (
        <span className={cn("text-xl font-bold text-zinc-900 dark:text-white", client.className)}>
          {client.name}
        </span>
      );
    }
    return (
      <img
        src={\`https://cdn.simpleicons.org/\${client.slug}\`}
        alt={client.name}
        className={cn("h-6 w-auto", client.invertDark && "dark:invert")}
        loading="lazy"
      />
    );
  };

  return (
    <div className={cn("w-full bg-zinc-50/50 py-12 md:py-16 dark:bg-zinc-950", className)}>
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Trusted by teams building the future of AI.
        </p>
        <p className="mt-1 text-xs text-zinc-500">From prototype to production, autonomously.</p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {},
          }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 transition-all"
        >
          {clients.map((brand) => (
            <motion.div
              key={brand.name}
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="flex min-w-[100px] items-center justify-center px-2 sm:min-w-[120px]"
            >
              {renderClient(brand)}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}`,
    tailwindSource: "",
    registryCliName: "cinematic-logo-cloud",
    props: [
      { name: "clients", type: "LogoCloudClient[]", description: "Array of brand objects containing name, optional slug, or text overrides." },
      { name: "className", type: "string", description: "Optional CSS classes to override wrapper styling." }
    ]
  },
  {
    slug: "hero-aurora-spotlight",
    name: "Aurora Hero Spotlight",
    description: "Cursor-reactive spotlight layered over an aurora field for launch heroes.",
    categorySlug: "hero-sections",
    tags: ["marketing", "gradient", "pointer"],
    premium: false,
    trendingScore: 98,
    createdAt: "2026-04-02",
    animationKinds: ["hover", "gradient"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewHeroAurora,
    reactSource: `"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export function HeroAurora() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotlight = useMotionTemplate\`radial-gradient(420px at \${x}px \${y}px, rgba(56,189,248,.35), transparent 60%)\`;

  return (
    <section onMouseMove={(e) => {
      const r = e.currentTarget.getBoundingClientRect();
      x.set(e.clientX - r.left); y.set(e.clientY - r.top);
    }} className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 p-10">
      <div className="lf-aurora absolute inset-0 opacity-80" />
      <motion.div className="absolute inset-0" style={{ backgroundImage: spotlight }} />
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Ship faster</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Motion-native interfaces</h1>
      </div>
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "bento-signal-grid",
    name: "Signal Bento Grid",
    description: "Animated bento tiles with breathing gradients for product metrics.",
    categorySlug: "bento-grids",
    tags: ["dashboard", "metrics"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-03-18",
    animationKinds: ["scroll", "gradient"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewBentoMetrics,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function BentoSignals() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {["Latency", "Uptime"].map((label, i) => (
        <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <p className="text-xs text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{i === 0 ? "42ms" : "99.99%"}</p>
        </motion.div>
      ))}
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "nebula-glass-card",
    name: "Nebula Glass Card",
    description: "3D tilt card with spring physics and luminous edge lighting.",
    categorySlug: "cards",
    tags: ["product", "depth"],
    premium: true,
    trendingScore: 104,
    createdAt: "2026-04-28",
    animationKinds: ["3d", "spring", "hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCardTilt,
    reactSource: `"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function NebulaCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-40, 40], [8, -8]), { stiffness: 260, damping: 20 });
  const ry = useSpring(useTransform(x, [-40, 40], [-8, 8]), { stiffness: 260, damping: 20 });

  return (
    <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }} onMouseMove={(e) => {
      const r = e.currentTarget.getBoundingClientRect();
      x.set(e.clientX - r.left - r.width / 2);
      y.set(e.clientY - r.top - r.height / 2);
    }} onMouseLeave={() => { x.set(0); y.set(0); }} className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
      <p className="text-white">Tilt depth</p>
    </motion.div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "float-glass-navbar",
    name: "Float Glass Navbar",
    description: "Glass navigation rail with spring entrance and CTA emphasis.",
    categorySlug: "navbars",
    tags: ["layout", "glass"],
    premium: false,
    trendingScore: 87,
    createdAt: "2026-02-10",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewNavbarFloating,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function FloatingNav() {
  return (
    <motion.header initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
      <span className="text-sm font-semibold text-white">Brand</span>
      <motion.button whileHover={{ scale: 1.03 }} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900">Start</motion.button>
    </motion.header>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "orbit-footer",
    name: "Orbit Footer",
    description: "Compact footer with balanced columns and developer-first links.",
    categorySlug: "footers",
    tags: ["layout"],
    premium: false,
    trendingScore: 62,
    createdAt: "2026-01-22",
    animationKinds: ["hover"],
    dependencies: [],
    Preview: Previews.PreviewFooterMini,
    reactSource: `export function OrbitFooter() {
  return (
    <footer className="rounded-3xl border border-white/10 bg-zinc-950 p-6 text-sm text-zinc-400">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-white">Nexus-UI</p>
        <div className="flex gap-4"><a href="#">Docs</a><a href="#">Status</a></div>
      </div>
    </footer>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "depth-testimonials",
    name: "Depth Testimonials",
    description: "Stacked testimonial planes with staggered motion reveals.",
    categorySlug: "testimonials",
    tags: ["social-proof"],
    premium: true,
    trendingScore: 76,
    createdAt: "2026-04-12",
    animationKinds: ["scroll", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewTestimonialStack,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function DepthTestimonials({ quotes }: { quotes: string[] }) {
  return (
    <div className="relative h-64">
      {quotes.map((q, i) => (
        <motion.figure key={q} className="absolute left-0 right-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl" style={{ top: 16 + i * 18 }} initial={{ y: 16, opacity: 0 }} whileInView={{ y: 0, opacity: 1 - i * 0.15 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
          <blockquote className="text-sm text-white">“{q}”</blockquote>
        </motion.figure>
      ))}
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "toggle-pricing-pro",
    name: "Toggle Pricing Pro",
    description: "Annual/monthly toggle with spring knob and contextual savings callout.",
    categorySlug: "pricing-sections",
    tags: ["billing", "motion"],
    premium: true,
    trendingScore: 112,
    createdAt: "2026-05-01",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion", "react"],
    Preview: Previews.PreviewPricingToggle,
    reactSource: `"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function PricingToggle() {
  const [annual, setAnnual] = useState(true);
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <button type="button" onClick={() => setAnnual((v) => !v)} className="relative h-8 w-16 rounded-full border border-white/10 bg-white/5">
        <motion.span className="absolute top-1 left-1 h-6 w-6 rounded-full bg-cyan-300" animate={{ x: annual ? 0 : 32 }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
      </button>
      <p className="mt-4 text-4xl font-semibold text-white">\${annual ? 29 : 39}</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "beam-sweep-field",
    name: "Beam Sweep Field",
    description: "Slow sweeping light column for cinematic section backgrounds.",
    categorySlug: "background-effects",
    tags: ["ambient"],
    premium: false,
    trendingScore: 84,
    createdAt: "2026-03-30",
    animationKinds: ["gradient", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewBeamSweep,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function BeamField() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <motion.div className="absolute inset-y-10 w-[2px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent" animate={{ left: ["8%", "86%", "30%", "8%"] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "vector-tilt-scene",
    name: "Vector Tilt Scene",
    description: "High depth glass panel for hero cards and feature highlights.",
    categorySlug: "three-d-components",
    tags: ["depth", "product"],
    premium: true,
    trendingScore: 96,
    createdAt: "2026-04-20",
    animationKinds: ["3d", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCardTilt,
    reactSource: `// Same implementation as Nebula Glass Card — tune perspective and lighting for scene-scale layouts.`,
    tailwindSource: tw,
  },
  {
    slug: "glass-login-stack",
    name: "Glass Login Stack",
    description: "Minimal glass authentication panel with crisp focus states.",
    categorySlug: "login-forms",
    tags: ["auth"],
    premium: false,
    trendingScore: 73,
    createdAt: "2026-02-02",
    animationKinds: ["spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewLoginGlass,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function GlassLogin() {
  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <input className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Email" />
      <input className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" type="password" placeholder="Password" />
      <button className="w-full rounded-xl bg-cyan-300 py-2 text-sm font-semibold text-zinc-950">Continue</button>
    </motion.form>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "split-signup-convert",
    name: "Split Signup Convert",
    description: "Two-column signup with narrative panel and compact fields.",
    categorySlug: "signup-forms",
    tags: ["auth", "conversion"],
    premium: false,
    trendingScore: 69,
    createdAt: "2026-03-08",
    animationKinds: ["hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewSignupSplit,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function SplitSignup() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-fuchsia-500/10 p-6">
        <p className="text-sm font-semibold text-white">Ship interfaces faster</p>
      </div>
      <motion.div whileTap={{ scale: 0.99 }} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        {/* fields */}
      </motion.div>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "signup-form",
    name: "Signup Form",
    registryCliName: "signup-form",
    resourceLinks: [{ label: "Live demo", href: "/demos/signup-form" }],
    description:
      "Customizable signup form built on shadcn input + label with subtle framer-motion transitions and async submit states.",
    categorySlug: "signup-forms",
    tags: ["auth", "forms", "signup", "shadcn"],
    premium: false,
    trendingScore: 107,
    createdAt: "2026-05-14",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    previewShell: "plain",
    props: [
      { name: "title", type: "string", defaultValue: "\"Create your account\"", description: "Main heading displayed at the top." },
      { name: "subtitle", type: "string", defaultValue: "\"Start building premium interfaces with motion-first components.\"", description: "Supporting text below the title." },
      { name: "submitLabel", type: "string", defaultValue: "\"Create account\"", description: "Button label in idle state." },
      { name: "loadingLabel", type: "string", defaultValue: "\"Creating account...\"", description: "Button label while submit is pending." },
      { name: "successLabel", type: "string", defaultValue: "\"Account created\"", description: "Button label after successful submit." },
      { name: "className", type: "string", description: "Optional class names for wrapper styling." },
      { name: "showNameField", type: "boolean", defaultValue: "true", description: "Shows or hides the full-name input." },
      { name: "showConfirmPasswordField", type: "boolean", defaultValue: "true", description: "Shows or hides the confirm-password input." },
      { name: "minPasswordLength", type: "number", defaultValue: "8", description: "Minimum password length enforced by validation." },
      { name: "defaultValues", type: "Partial<SignupFormValues>", description: "Initial values for prefilled form state." },
      { name: "onSubmit", type: "(values: SignupFormValues) => Promise<void> | void", description: "Submit handler called after validation passes." },
      { name: "showSocialLogins", type: "boolean", defaultValue: "true", description: "Shows GitHub/Apple/Google buttons under submit." },
      { name: "onSocialLogin", type: "(provider: \"github\" | \"apple\" | \"google\") => void", description: "Called when a social provider button is clicked." },
    ],
    Preview: Previews.PreviewSignupForm,
    reactSource: `"use client";

import { SignupForm, type SignupFormValues } from "@/components/signup-form";

export function AuthSignupCard() {
  async function createAccount(values: SignupFormValues) {
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  }

  return <SignupForm onSubmit={createAccount} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "workbench-sidebar",
    name: "Workbench Sidebar",
    description: "Dense sidebar navigation tuned for dashboards and tools.",
    categorySlug: "sidebars",
    tags: ["app-shell"],
    premium: true,
    trendingScore: 88,
    createdAt: "2026-04-05",
    animationKinds: ["hover", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewSidebarShell,
    reactSource: `"use client";

import { motion } from "framer-motion";

const items = ["Overview", "Library", "Billing"];

export function WorkbenchSidebar() {
  return (
    <aside className="w-64 space-y-2 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      {items.map((t) => (
        <motion.button key={t} whileHover={{ x: 2 }} className="w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/10 hover:text-white">{t}</motion.button>
      ))}
    </aside>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "pulse-dashboard-kpis",
    name: "Pulse Dashboard KPIs",
    description: "KPI strip with micro-hover lifts and soft chart placeholders.",
    categorySlug: "dashboards",
    tags: ["analytics"],
    premium: true,
    trendingScore: 101,
    createdAt: "2026-04-16",
    animationKinds: ["hover", "scroll"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewDashboardKpi,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function KpiStrip({ kpis }: { kpis: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {kpis.map((k) => (
        <motion.div key={k.label} whileHover={{ y: -2 }} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-zinc-400">{k.label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{k.value}</p>
        </motion.div>
      ))}
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "orbital-loader",
    name: "Orbital Loader",
    description: "Dual counter-rotating rings with breathing inner glow.",
    categorySlug: "loaders",
    tags: ["feedback"],
    premium: false,
    trendingScore: 80,
    createdAt: "2026-01-30",
    animationKinds: ["layout", "gradient"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewLoaderOrbit,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function OrbitalLoader() {
  return (
    <div className="relative size-28">
      <motion.span className="absolute inset-0 rounded-full border border-white/10" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
      <motion.span className="absolute inset-2 rounded-full border border-cyan-400/40" animate={{ rotate: -360 }} transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "milestone-timeline",
    name: "Milestone Timeline",
    description: "Vertical roadmap timeline with glowing nodes.",
    categorySlug: "timelines",
    tags: ["roadmap"],
    premium: false,
    trendingScore: 71,
    createdAt: "2026-02-18",
    animationKinds: ["scroll"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewTimeline,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function MilestoneTimeline({ steps }: { steps: string[] }) {
  return (
    <div className="relative pl-6">
      <div className="absolute top-1 bottom-1 left-[7px] w-px bg-white/10" />
      {steps.map((s, i) => (
        <motion.div key={s} initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative mb-6">
          <span className="absolute -left-[9px] top-1 size-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.65)]" />
          <p className="text-sm font-semibold text-white">{s}</p>
        </motion.div>
      ))}
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "lattice-feature-grid",
    name: "Lattice Feature Grid",
    description: "Four-up feature grid with scroll reveals and glass tiles.",
    categorySlug: "feature-sections",
    tags: ["marketing"],
    premium: false,
    trendingScore: 90,
    createdAt: "2026-03-12",
    animationKinds: ["scroll"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewFeatureGrid,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function LatticeFeatures({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((it, i) => (
        <motion.div key={it.title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5">
          <p className="text-sm font-semibold text-white">{it.title}</p>
          <p className="mt-2 text-xs text-zinc-400">{it.body}</p>
        </motion.div>
      ))}
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "motion-faq-disclosure",
    name: "Motion FAQ Disclosure",
    description: "Lightweight FAQ with directional affordance and animated answers.",
    categorySlug: "faq-sections",
    tags: ["support"],
    premium: false,
    trendingScore: 66,
    createdAt: "2026-01-12",
    animationKinds: ["layout"],
    dependencies: ["framer-motion", "react"],
    Preview: Previews.PreviewFaq,
    reactSource: `"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function MotionFaq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <button key={it.q} type="button" onClick={() => setOpen(i)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">{it.q}</p>
            <motion.span animate={{ rotate: open === i ? 90 : 0 }} className="text-xs text-zinc-400">▸</motion.span>
          </div>
          {open === i ? <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-xs text-zinc-400">{it.a}</motion.p> : null}
        </button>
      ))}
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "nebula-cta-glow",
    name: "Nebula CTA Glow",
    description: "Pulsing dual nebula glow behind a high-contrast CTA.",
    categorySlug: "cta-sections",
    tags: ["conversion"],
    premium: false,
    trendingScore: 93,
    createdAt: "2026-04-08",
    animationKinds: ["gradient", "hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCtaGlow,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function NebulaCta() {
  return (
    <div className="relative flex items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 px-10 py-16">
      <motion.div className="absolute size-40 rounded-full bg-cyan-400/25 blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.65, 0.35] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.button whileHover={{ scale: 1.03 }} className="relative rounded-full bg-white px-6 py-2 text-sm font-semibold text-zinc-950">Start building</motion.button>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "editorial-blog-rail",
    name: "Editorial Blog Rail",
    description: "Featured article plus compact secondary headlines for content hubs.",
    categorySlug: "blog-components",
    tags: ["content"],
    premium: false,
    trendingScore: 58,
    createdAt: "2026-02-26",
    animationKinds: ["scroll"],
    dependencies: [],
    Preview: Previews.PreviewBlogRail,
    reactSource: `export function EditorialRail() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs text-cyan-200/80">Featured</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Designing scroll choreography</h2>
      </article>
      <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-black/30 p-4" />
      ))}</div>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "split-contact-glass",
    name: "Split Contact Glass",
    description: "Marketing narrative paired with a compact contact capture form.",
    categorySlug: "contact-sections",
    tags: ["lead"],
    premium: false,
    trendingScore: 64,
    createdAt: "2026-03-02",
    animationKinds: ["hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewContactSplit,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function SplitContact() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-fuchsia-500/10 p-6">
        <p className="text-sm font-semibold text-white">Talk with us</p>
      </div>
      <motion.form whileTap={{ scale: 0.995 }} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        {/* fields */}
      </motion.form>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "svg-noise-shader",
    name: "SVG Noise Shader",
    description: "FeTurbulence-driven noise field for textured sci-fi surfaces.",
    categorySlug: "shaders",
    tags: ["texture"],
    premium: true,
    trendingScore: 77,
    createdAt: "2026-04-22",
    animationKinds: ["gradient", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewShaderNoise,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function SvgNoise() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950">
      <motion.div aria-hidden className="absolute inset-0 opacity-40 mix-blend-screen" style={{ backgroundImage: "url(\\\"data:image/svg+xml,...feTurbulence...\\\")" }} animate={{ x: [0, -20, 0], y: [0, 10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tracing-spotlight-panel",
    name: "Tracing Spotlight Panel",
    description: "Cursor-traced highlight for feature callouts and pricing tiers.",
    categorySlug: "motion-effects",
    tags: ["pointer"],
    premium: true,
    trendingScore: 107,
    createdAt: "2026-05-06",
    animationKinds: ["hover", "gradient"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewSpotlightPanel,
    reactSource: `"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export function TracingSpotlight() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const bg = useMotionTemplate\`radial-gradient(240px circle at \${x}px \${y}px, rgba(244,114,182,.35), transparent 60%)\`;
  return (
    <div onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - r.left); y.set(e.clientY - r.top); }} className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-8">
      <motion.div className="absolute inset-0" style={{ backgroundImage: bg }} />
      <div className="relative text-white">Spotlight content</div>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "forge-ai-command-bar",
    name: "Forge AI Command Bar",
    description: "Command surface for AI copilots with motion layout container.",
    categorySlug: "ai-components",
    tags: ["copilot"],
    premium: true,
    trendingScore: 118,
    createdAt: "2026-05-09",
    animationKinds: ["layout", "spring"],
    dependencies: ["framer-motion", "react"],
    Preview: Previews.PreviewAiBar,
    reactSource: `"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function AiCommandBar() {
  const [value, setValue] = useState("");
  return (
    <motion.div layout className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <input value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Describe the UI you need…" />
    </motion.div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "gooey-search-input",
    name: "Gooey Search Input",
    registryCliName: "gooey-input",
    resourceLinks: [
      { label: "Live demo", href: "/demos/gooey-input" },
    ],
    description:
      "Expandable pill search with a detached icon bubble merged through an SVG goo filter and spring layout.",
    categorySlug: "motion-effects",
    tags: ["search", "svg", "spring", "forms"],
    premium: false,
    trendingScore: 112,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "placeholder", type: "string", defaultValue: "\"Type to search...\"", description: "Input placeholder text." },
      { name: "collapsedWidth", type: "number", defaultValue: "115", description: "Width (px) when collapsed." },
      { name: "expandedWidth", type: "number", defaultValue: "200", description: "Width (px) when expanded." },
      { name: "expandedOffset", type: "number", defaultValue: "56", description: "Left offset (px) applied when expanded." },
      { name: "gooeyBlur", type: "number", defaultValue: "5", description: "SVG blur strength for gooey merge effect." },
      { name: "value", type: "string", description: "Controlled value." },
      { name: "defaultValue", type: "string", defaultValue: "\"\"", description: "Initial value for uncontrolled mode." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called when value changes." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when expanded/collapsed state changes." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables interactions and input." },
    ],
    Preview: Previews.PreviewGooeySearch,
    reactSource: `"use client";

import { GooeyInput } from "@/components/gooey-input";

export function CatalogSearch() {
  return (
    <GooeyInput
      placeholder="Search…"
      collapsedWidth={115}
      expandedWidth={200}
      expandedOffset={56}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "terminal",
    name: "Interactive Terminal",
    registryCliName: "terminal",
    resourceLinks: [
      { label: "Live demo", href: "/demos/terminal" },
      { label: "Download sound sprite (sound.ogg)", href: "/sounds/sound.ogg" },
      { label: "Sprite timing map (config.json)", href: "/sounds/config.json" },
    ],
    description:
      "macOS-style terminal window with typewriter commands, cursor blink, output sequencing, and optional sound.",
    categorySlug: "motion-effects",
    tags: ["terminal", "cli", "typewriter", "sound", "shell"],
    premium: false,
    trendingScore: 110,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "commands", type: "TerminalCommand[]", description: "Command script typed and executed in sequence." },
      { name: "promptSymbol", type: "string", defaultValue: "\"➜\"", description: "Prompt symbol shown before each command." },
      { name: "username", type: "string", defaultValue: "\"user\"", description: "Username displayed in prompt/header." },
      { name: "hostname", type: "string", defaultValue: "\"nexus\"", description: "Hostname displayed in prompt/header." },
      { name: "typingSpeed", type: "number", defaultValue: "28", description: "Base typing speed in ms/character." },
      { name: "typingJitter", type: "number", defaultValue: "28", description: "Random typing cadence variation (ms)." },
      { name: "startupDelay", type: "number", defaultValue: "450", description: "Delay before script starts (ms)." },
      { name: "delayBetweenCommands", type: "number", defaultValue: "850", description: "Pause between commands (ms)." },
      { name: "autoStart", type: "boolean", defaultValue: "true", description: "Auto-run when component enters viewport." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Repeats the full script forever." },
      { name: "loopDelay", type: "number", defaultValue: "1400", description: "Pause between loops (ms)." },
      { name: "showCursor", type: "boolean", defaultValue: "true", description: "Displays blinking cursor during typing." },
      { name: "enableSound", type: "boolean", defaultValue: "true", description: "Enables keyboard and enter sounds." },
      { name: "showSoundToggle", type: "boolean", defaultValue: "true", description: "Renders sound toggle control in header." },
      { name: "showControls", type: "boolean", defaultValue: "true", description: "Renders pause/resume/replay controls." },
      { name: "theme", type: "\"carbon\" | \"midnight\" | \"paper\"", defaultValue: "\"carbon\"", description: "Terminal visual theme." },
      { name: "fillHeight", type: "boolean", defaultValue: "false", description: "Makes body scroll inside fixed parent height." },
      { name: "className", type: "string", description: "Optional class names for layout/styling." },
    ],
    Preview: Previews.PreviewTerminal,
    reactSource: `"use client";

import { Terminal } from "@/components/terminal";

export function TerminalExample() {
  return (
    <Terminal
      fillHeight
      className="h-[420px]"
      username="tushar"
      hostname="Nexus-Macbook"
      theme="carbon"
      commands={[
        { input: "npm install", runDelayMs: 900, output: ["added packages", { text: "done", tone: "success" }] },
        { input: "pnpm dev", runDelayMs: 650, output: [{ text: "ready - http://localhost:3000", tone: "success" }] },
        { input: "git push origin main", runDelayMs: 700, output: [{ text: "main -> main", tone: "success" }] },
        { input: "deploy --prod", runDelayMs: 800, output: [{ text: "live on nexus-ui.com", tone: "success" }] },
        { input: "npx shadcn@latest add @next-ui/gooey-input", runDelayMs: 600, output: [{ text: "✔ component added", tone: "success" }] },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "squiggly-text",
    name: "RippleLine squiggly text",
    registryCliName: "squiggly-text",
    resourceLinks: [
      { label: "Live demo", href: "/demos/squiggly-text" },
      { label: "SVG filters (MDN)", href: "https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence" },
    ],
    description:
      "Hero-grade headline with an animated wave underline, turbulence + Gaussian blur + displacement, optional glyph micro-warp, and reduced-motion fallbacks.",
    categorySlug: "motion-effects",
    tags: ["typography", "svg", "motion", "hero", "underline", "filters"],
    premium: false,
    trendingScore: 108,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Custom content for the squiggly text wrapper." },
      { name: "text", type: "string", description: "Convenience text content (when children not provided)." },
      { name: "steps", type: "number", defaultValue: "5", description: "Number of turbulence/displacement frames." },
      { name: "stepDuration", type: "number", defaultValue: "80", description: "Duration per frame in ms." },
      { name: "scale", type: "number | readonly [number, number]", defaultValue: "[6, 8]", description: "Displacement intensity per frame." },
      { name: "baseFrequency", type: "number", defaultValue: "0.02", description: "Turbulence base frequency." },
      { name: "numOctaves", type: "number", defaultValue: "3", description: "Number of turbulence octaves." },
      { name: "as", type: "\"span\" | \"div\"", defaultValue: "\"span\"", description: "Root tag for SquigglyText." },
      { name: "className", type: "string", description: "Root wrapper class names." },
      { name: "textClassName", type: "string", description: "Class names applied to animated text node." },
    ],
    Preview: Previews.PreviewSquigglyText,
    reactSource: `"use client";

import { SquigglyDrinksHeadline, SquigglyText } from "@/components/squiggly-text";

export function HeroLine() {
  return (
    <SquigglyText as="div" steps={5} stepDuration={80} scale={[6, 8]} baseFrequency={0.02} numOctaves={3}>
      <span className="block">How many drinks</span>
      <span className="block">are too many drinks?</span>
    </SquigglyText>
  );
}

export function DrinksDemo() {
  return <SquigglyDrinksHeadline />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "floating-dock",
    name: "Nexus floating dock",
    registryCliName: "floating-dock",
    resourceLinks: [
      { label: "Live demo", href: "/demos/floating-dock" },
      { label: "Magnified dock pattern (Build UI)", href: "https://buildui.com/recipes/magnified-dock" },
    ],
    description:
      "Bottom-centered macOS-style dock with pointer-driven magnification, neighbor scaling, glass pill chrome, tooltips, and a touch-friendly expandable mobile menu.",
    categorySlug: "navbars",
    tags: ["navigation", "motion", "dock", "glass", "tooltip"],
    premium: false,
    trendingScore: 105,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "items", type: "FloatingDockItem[]", description: "Dock entries: title, icon, and href." },
      { name: "desktopClassName", type: "string", description: "Extra class names for desktop dock wrapper." },
      { name: "mobileClassName", type: "string", description: "Extra class names for mobile dock wrapper." },
    ],
    Preview: Previews.PreviewFloatingDock,
    reactSource: `"use client";

import { FloatingDock } from "@/components/floating-dock";
import { Home, LayoutGrid } from "lucide-react";

const items = [
  { title: "Home", icon: <Home />, href: "/" },
  { title: "Components", icon: <LayoutGrid />, href: "/components" },
];

export function NavbarDock() {
  return <FloatingDock items={items} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "stateful-button",
    name: "Stateful message button",
    registryCliName: "stateful-button",
    resourceLinks: [
      { label: "Live demo", href: "/demos/stateful-button" },
      { label: "Live demo", href: "/demos/stateful-button" },
    ],
    description:
      "Animated async button with idle → loading → success transitions, built-in click guarding, and smooth icon/text motion.",
    categorySlug: "motion-effects",
    tags: ["button", "forms", "async", "loading", "success"],
    premium: false,
    trendingScore: 104,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Idle button label/content." },
      { name: "loadingText", type: "string", defaultValue: "\"Loading...\"", description: "Label shown in loading phase." },
      { name: "successText", type: "string", defaultValue: "\"Success\"", description: "Label shown in success phase." },
      { name: "errorText", type: "string", defaultValue: "\"Something went wrong\"", description: "Label shown in error phase." },
      { name: "onClick", type: "() => Promise<void> | void", description: "Async/sync action invoked on click." },
      { name: "resetDelay", type: "number", defaultValue: "1800", description: "Auto-reset delay after success/error (ms)." },
      { name: "showSuccess", type: "boolean", defaultValue: "true", description: "If false, returns to idle after action completes." },
      { name: "variant", type: "\"default\" | \"outline\" | \"ghost\" | \"destructive\"", defaultValue: "\"default\"", description: "Visual style variant." },
      { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"", description: "Button size preset." },
      { name: "icon", type: "React.ReactNode", description: "Optional icon shown in idle state." },
      { name: "successIcon", type: "React.ReactNode", description: "Optional icon shown in success state." },
      { name: "errorIcon", type: "React.ReactNode", description: "Optional icon shown in error state." },
      { name: "disabled", type: "boolean", description: "Disables interaction (in addition to loading lock)." },
      { name: "className", type: "string", description: "Optional class names for custom styling." },
    ],
    Preview: Previews.PreviewStatefulButton,
    reactSource: `"use client";

import { CheckCircle2 } from "lucide-react";
import { StatefulButton } from "@/components/stateful-button";

async function sendMessage() {
  await new Promise<void>((resolve) => setTimeout(resolve, 1300));
}

export function MessageButton() {
  return (
    <StatefulButton
      onClick={sendMessage}
      loadingText="Send message"
      successText="Send message"
      successIcon={<CheckCircle2 className="size-4" />}
      className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 font-medium text-white ring-offset-2 transition duration-200 hover:ring-2 hover:ring-green-500 dark:ring-offset-black"
    >
      Send message
    </StatefulButton>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "sparkles",
    name: "Sparkles field",
    registryCliName: "sparkles",
    resourceLinks: [
      { label: "Live demo", href: "/demos/sparkles" },
      { label: "Live demo", href: "/demos/sparkles" },
    ],
    description:
      "Configurable animated particle field for hero highlights, card backgrounds, and decorative UI layers with optional pointer interaction.",
    categorySlug: "motion-effects",
    tags: ["particles", "sparkles", "background", "hero", "decorative"],
    premium: false,
    trendingScore: 103,
    createdAt: "2026-05-14",
    animationKinds: ["gradient", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "count", type: "number", defaultValue: "36", description: "Base number of particles before density scaling." },
      { name: "color", type: "string", defaultValue: "\"#e5f4ff\"", description: "Particle and glow color." },
      { name: "minSize", type: "number", defaultValue: "0.9", description: "Minimum particle size in pixels." },
      { name: "maxSize", type: "number", defaultValue: "2.8", description: "Maximum particle size in pixels." },
      { name: "speed", type: "number", defaultValue: "1", description: "Overall animation speed multiplier." },
      { name: "opacity", type: "number", defaultValue: "0.9", description: "Global opacity multiplier for particles." },
      { name: "className", type: "string", description: "Optional class names for layout/positioning." },
      { name: "background", type: "boolean", defaultValue: "false", description: "If true, mounts as a full-layer absolute background." },
      { name: "density", type: "\"low\" | \"medium\" | \"high\"", defaultValue: "\"medium\"", description: "Density preset that scales particle count." },
      { name: "direction", type: "\"up\" | \"down\" | \"random\"", defaultValue: "\"random\"", description: "Primary movement direction for particle drift." },
      { name: "enableGlow", type: "boolean", defaultValue: "true", description: "Adds soft bloom/glow to each particle." },
      { name: "interactive", type: "boolean", defaultValue: "false", description: "Enables pointer glow, hover sparkles, and click bursts." },
    ],
    Preview: Previews.PreviewSparkles,
    detailPreviews: [Previews.PreviewSparklesLine, Previews.PreviewSparklesStarfield],
    reactExamples: [
      {
        title: "Code 1 — First Component",
        code: `"use client";

import { Sparkles } from "@/components/sparkles";

export function SparklesLineHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8">
      <div className="relative z-[2] mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="text-5xl font-semibold tracking-tight text-white">NEXUS-UI</h2>
        <div className="relative mx-auto w-fit">
          <div className="h-px w-72 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-full h-16 w-[19rem] -translate-x-1/2 -mt-px overflow-hidden">
            <Sparkles
              className="h-full w-full"
              count={240}
              density="high"
              color="#a8d7ff"
              minSize={0.55}
              maxSize={1.45}
              speed={1.15}
              opacity={0.95}
              direction="down"
              enableGlow
            />
          </div>
        </div>
      </div>
    </section>
  );
}`,
      },
      {
        title: "Code 2 — Second Component",
        code: `"use client";

import { Sparkles } from "@/components/sparkles";

export function SparklesStarfieldCard() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8">
      <Sparkles
        background
        count={130}
        density="high"
        color="#e6f3ff"
        minSize={0.8}
        maxSize={2.4}
        speed={0.95}
        opacity={1}
        direction="random"
        enableGlow
      />
      <div className="relative text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-white">Build great products</h2>
      </div>
    </section>
  );
}`,
      },
    ],
    reactSource: `"use client";

import { Sparkles } from "@/components/sparkles";

export function SparklesLineHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8">
      <div className="relative z-[2] mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="text-5xl font-semibold tracking-tight text-white">NEXUS-UI</h2>
        <div className="relative mx-auto w-fit">
          <div className="h-px w-72 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-full h-16 w-[19rem] -translate-x-1/2 -mt-px overflow-hidden">
            <Sparkles
              className="h-full w-full"
              count={240}
              density="high"
              color="#a8d7ff"
              minSize={0.55}
              maxSize={1.45}
              speed={1.15}
              opacity={0.95}
              direction="down"
              enableGlow
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function SparklesStarfieldCard() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8">
      <Sparkles
        background
        count={130}
        density="high"
        color="#e6f3ff"
        minSize={0.8}
        maxSize={2.4}
        speed={0.95}
        opacity={1}
        direction="random"
        enableGlow
      />
      <div className="relative text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-white">Build great products</h2>
      </div>
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "text-generate-effect",
    name: "Text Generate Effect",
    registryCliName: "text-generate-effect",
    resourceLinks: [
      { label: "Live demo", href: "/demos/text-generate-effect" },
      { label: "Live demo", href: "/demos/text-generate-effect" },
    ],
    description:
      "Animated text reveal that fades words, characters, or lines into view with optional blur and upward motion.",
    categorySlug: "motion-effects",
    tags: ["typography", "hero", "stagger", "reveal", "motion"],
    premium: false,
    trendingScore: 102,
    createdAt: "2026-05-14",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", description: "Text content to animate." },
      { name: "mode", type: "\"word\" | \"character\" | \"line\"", defaultValue: "\"word\"", description: "Animation segmentation mode." },
      { name: "delay", type: "number", defaultValue: "0", description: "Initial delay before first segment appears." },
      { name: "duration", type: "number", defaultValue: "0.48", description: "Per-segment animation duration in seconds." },
      { name: "stagger", type: "number", defaultValue: "0.06", description: "Delay between segment animations in seconds." },
      { name: "blur", type: "boolean", defaultValue: "true", description: "Applies blur-to-clear transition." },
      { name: "once", type: "boolean", defaultValue: "true", description: "With viewport trigger, animate only once." },
      { name: "className", type: "string", description: "Optional class names for text wrapper." },
      { name: "as", type: "\"p\" | \"h1\" | \"h2\" | \"span\" | \"div\"", defaultValue: "\"p\"", description: "Semantic element used as root." },
      { name: "lift", type: "boolean", defaultValue: "true", description: "Adds subtle upward motion while revealing." },
      { name: "trigger", type: "\"mount\" | \"viewport\"", defaultValue: "\"mount\"", description: "Animation trigger strategy." },
      { name: "replayKey", type: "string | number", description: "Changing this value replays the reveal sequence." },
    ],
    Preview: Previews.PreviewTextGenerateEffect,
    reactSource: `"use client";

import { TextGenerateEffect } from "@/components/text-generate-effect";

export function HeroTextReveal() {
  return (
    <TextGenerateEffect
      as="h2"
      text="Ship product stories with motion-first typography that reveals ideas with clarity, rhythm, and cinematic polish."
      mode="word"
      className="text-4xl font-semibold tracking-tight sm:text-5xl"
      duration={0.4}
      stagger={0.07}
      blur
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "background-gradient",
    name: "Background Gradient",
    registryCliName: "background-gradient",
    resourceLinks: [{ label: "Live demo", href: "/demos/background-gradient" }],
    description:
      "Animated gradient wrapper with soft glow and blur for cards, buttons, and hero sections.",
    categorySlug: "background-effects",
    tags: ["gradient", "glow", "wrapper", "interactive", "background"],
    premium: false,
    trendingScore: 101,
    createdAt: "2026-05-14",
    animationKinds: ["gradient", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Content rendered above the animated gradient layers." },
      { name: "className", type: "string", description: "Class names for the outer animated wrapper." },
      { name: "containerClassName", type: "string", description: "Class names for the inner content container." },
      { name: "surfaceClassName", type: "string", description: "Optional class names for the inner surface layer (inside gradient shell)." },
      { name: "colors", type: "string[]", defaultValue: "[\"#22d3ee\", \"#818cf8\", \"#a855f7\", \"#ec4899\"]", description: "Gradient palette used for animated layers." },
      { name: "animationSpeed", type: "number", defaultValue: "1", description: "Speed multiplier for looping gradient motion." },
      { name: "blur", type: "number", defaultValue: "24", description: "Blur intensity in pixels for glow softness." },
      { name: "borderRadius", type: "string", defaultValue: "\"1rem\"", description: "Wrapper border radius (e.g. \"1rem\", \"24px\")." },
      { name: "as", type: "\"div\" | \"button\" | \"section\"", defaultValue: "\"div\"", description: "Semantic root element variant." },
      { name: "interactive", type: "boolean", defaultValue: "true", description: "Enables hover boost and cursor-follow glow." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables press interaction when used as button." },
    ],
    Preview: Previews.PreviewBackgroundGradient,
    reactSource: `"use client";

import { BackgroundGradient } from "@/components/background-gradient";

export function GradientCard() {
  return (
    <BackgroundGradient
      as="section"
      className="w-full max-w-xl"
      containerClassName="rounded-[inherit] p-6"
      colors={["#22d3ee", "#818cf8", "#a855f7", "#ec4899"]}
      animationSpeed={1}
      blur={24}
      interactive
    >
      <h3 className="text-2xl font-semibold tracking-tight">Animated gradient card</h3>
      <p className="mt-2 text-sm text-muted-foreground">Use this wrapper behind any content.</p>
    </BackgroundGradient>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "typewriter-effect",
    name: "Typewriter Effect",
    registryCliName: "typewriter-effect",
    resourceLinks: [
      { label: "Live demo", href: "/demos/typewriter-effect" },
      { label: "Live demo", href: "/demos/typewriter-effect" },
    ],
    description:
      "Character-by-character typewriter text animation with blinking cursor, optional deleting, looping, and semantic heading support.",
    categorySlug: "motion-effects",
    tags: ["typing", "cursor", "hero", "loop", "text"],
    premium: false,
    trendingScore: 104,
    createdAt: "2026-05-14",
    animationKinds: ["layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string | string[]", description: "Single text or rotating text list to type." },
      { name: "typingSpeed", type: "number", defaultValue: "65", description: "Delay in ms between typed characters." },
      { name: "deletingSpeed", type: "number", defaultValue: "42", description: "Delay in ms between deleted characters." },
      { name: "delay", type: "number", defaultValue: "0", description: "Initial delay in ms before typing starts." },
      { name: "pauseDuration", type: "number", defaultValue: "1200", description: "Pause in ms after a full phrase is typed." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Loops phrases continuously after completion." },
      { name: "showCursor", type: "boolean", defaultValue: "true", description: "Shows blinking typewriter cursor." },
      { name: "cursorClassName", type: "string", description: "Optional class names for cursor styling." },
      { name: "className", type: "string", description: "Optional class names for text wrapper." },
      { name: "as", type: "\"h1\" | \"h2\" | \"p\" | \"span\" | \"div\"", defaultValue: "\"span\"", description: "Semantic element used as root." },
      { name: "onComplete", type: "() => void", description: "Callback fired when one full phrase set completes." },
    ],
    Preview: Previews.PreviewTypewriterEffect,
    reactSource: `"use client";

import { TypewriterEffect } from "@/components/typewriter-effect";

export function HeroTypewriterHeading() {
  return (
    <TypewriterEffect
      as="h1"
      text="Build premium SaaS surfaces with cinematic motion."
      typingSpeed={45}
      pauseDuration={1500}
      className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
    />
  );
}`,
    reactExamples: [
      {
        title: "Hero heading example",
        code: `"use client";

import { TypewriterEffect } from "@/components/typewriter-effect";

export function HeroTypewriterHeading() {
  return (
    <TypewriterEffect
      as="h1"
      text="Build premium SaaS surfaces with cinematic motion."
      typingSpeed={45}
      pauseDuration={1500}
      className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
    />
  );
}`,
      },
      {
        title: "Multiple rotating words example",
        code: `"use client";

import { TypewriterEffect } from "@/components/typewriter-effect";

export function RotatingTypewriterWords() {
  return (
    <TypewriterEffect
      as="h2"
      text={["Ship faster.", "Polish every interaction.", "Convert visitors into customers."]}
      typingSpeed={52}
      deletingSpeed={36}
      pauseDuration={1200}
      loop
      className="text-2xl font-medium tracking-tight text-muted-foreground sm:text-3xl"
      cursorClassName="bg-primary"
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "text-reveal-card",
    name: "Text Reveal Card",
    registryCliName: "text-reveal-card",
    resourceLinks: [
      { label: "Live demo", href: "/demos/text-reveal-card" },
      { label: "Live demo", href: "/demos/text-reveal-card" },
    ],
    description:
      "Interactive premium card with mouse-follow spotlight and bottom reveal content for features, case studies, and portfolio sections.",
    categorySlug: "cards",
    tags: ["card", "reveal", "hover", "spotlight", "portfolio"],
    premium: false,
    trendingScore: 105,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "gradient", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", description: "Main card heading displayed in the content area." },
      { name: "description", type: "string", description: "Default bottom content shown when revealContent is not provided." },
      { name: "icon", type: "React.ReactNode", description: "Optional icon shown next to the title." },
      { name: "image", type: "string", description: "Optional top image URL rendered as card media." },
      { name: "children", type: "React.ReactNode", description: "Optional custom overlay/content rendered inside the media area." },
      { name: "revealContent", type: "React.ReactNode", description: "Custom content rendered in the reveal section at the bottom." },
      { name: "className", type: "string", description: "Optional class names for card wrapper styling." },
      { name: "revealClassName", type: "string", description: "Optional class names for the reveal content container." },
      { name: "intensity", type: "number", defaultValue: "1", description: "Controls spotlight/reveal intensity. Clamped between 0.5 and 2.2." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables interactive reveal and hover elevation." },
    ],
    Preview: Previews.PreviewTextRevealCard,
    reactSource: `"use client";

import { Sparkles } from "lucide-react";
import { TextRevealCard } from "@/components/text-reveal-card";

export function FeatureRevealCard() {
  return (
    <TextRevealCard
      title="Feature Signal Card"
      description="Reveal launch-ready messaging as users scrub across the card."
      icon={<Sparkles className="size-4 text-primary" />}
      image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
      intensity={1.1}
      className="max-w-md"
    />
  );
}`,
    reactExamples: [
      {
        title: "Feature card example",
        code: `"use client";

import { Rocket } from "lucide-react";
import { TextRevealCard } from "@/components/text-reveal-card";

export function FeatureRevealCard() {
  return (
    <TextRevealCard
      title="Feature Signal Card"
      description="Progressively reveal polished copy while preserving baseline readability."
      icon={<Rocket className="size-4 text-primary" />}
      image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
      intensity={1.05}
      className="max-w-md"
    />
  );
}`,
      },
      {
        title: "Portfolio card example",
        code: `"use client";

import { BriefcaseBusiness } from "lucide-react";
import { TextRevealCard } from "@/components/text-reveal-card";

export function PortfolioRevealCard() {
  return (
    <TextRevealCard
      title="Portfolio Proof Card"
      description="Show outcomes progressively without overloading the initial view."
      icon={<BriefcaseBusiness className="size-4 text-primary" />}
      image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
      revealContent={
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Workspace analytics relaunch</p>
          <p className="text-sm text-muted-foreground">+31% activation after simplifying onboarding copy and interaction cues.</p>
        </div>
      }
      className="max-w-md"
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "glowing-effect-cards",
    name: "Glowing Effect Cards",
    registryCliName: "glowing-effect-cards",
    resourceLinks: [{ label: "Live demo", href: "/demos/glowing-effect-cards" }],
    description:
      "Cursor-reactive glowing border cards with a responsive 2-1-2 layout for premium SaaS sections and dashboards.",
    categorySlug: "cards",
    tags: ["glow", "cards", "cursor", "interactive", "layout"],
    premium: false,
    trendingScore: 111,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "gradient", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Content rendered inside `GlowingEffect`." },
      { name: "className", type: "string", description: "Class names for `GlowingEffect` or `GlowingCard` wrapper." },
      { name: "glowColor", type: "string", defaultValue: "\"hsl(var(--primary) / 0.9)\"", description: "Glow color used by `GlowingEffect`." },
      { name: "borderRadius", type: "string", defaultValue: "\"1rem\"", description: "Border radius applied to the glowing container." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables pointer-reactive glow behavior." },
      { name: "intensity", type: "number", defaultValue: "1", description: "Glow spread/intensity multiplier." },
      { name: "blur", type: "number", defaultValue: "18", description: "Ambient glow blur amount in pixels." },
      { name: "title", type: "string", description: "`GlowingCard` heading text." },
      { name: "description", type: "string", description: "`GlowingCard` supporting copy." },
      { name: "icon", type: "React.ReactNode", description: "Optional icon for `GlowingCard`." },
      { name: "tall", type: "boolean", defaultValue: "false", description: "Makes `GlowingCard` span a tall middle-column presentation." },
    ],
    Preview: Previews.PreviewGlowingEffectCards,
    reactSource: `"use client";

import { GlowingCardsLayout } from "@/components/glowing-effect-cards";

export function CursorGlowCardsSection() {
  return <GlowingCardsLayout className="max-w-6xl" />;
}`,
    reactExamples: [
      {
        title: "2-1-2 layout example",
        code: `"use client";

import { GlowingCardsLayout } from "@/components/glowing-effect-cards";

export function CursorGlowCardsSection() {
  return <GlowingCardsLayout className="max-w-6xl" />;
}`,
      },
      {
        title: "Single glowing card example",
        code: `"use client";

import { Sparkles } from "lucide-react";
import { GlowingCard } from "@/components/glowing-effect-cards";

export function FeatureGlowCard() {
  return (
    <GlowingCard
      title="Cursor-reactive border"
      description="Glow follows mouse movement and fades smoothly on leave."
      icon={<Sparkles className="size-4" />}
      cta="Open details"
      className="max-w-md"
    />
  );
}`,
      },
      {
        title: "Custom effect wrapper",
        code: `"use client";

import { GlowingEffect } from "@/components/glowing-effect-cards";

export function CustomGlowContainer() {
  return (
    <GlowingEffect glowColor="#7dd3fc" intensity={1.2} blur={22} className="rounded-2xl">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Custom glow theme</h3>
        <p className="mt-2 text-sm text-muted-foreground">Use on any container, not just cards.</p>
      </div>
    </GlowingEffect>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "infinite-moving-cards",
    name: "Infinite Moving Cards",
    registryCliName: "infinite-moving-cards",
    resourceLinks: [{ label: "Live demo", href: "/demos/infinite-moving-cards" }],
    description:
      "Customizable infinite marquee of cards with seamless looping, direction controls, hover pause, and optional custom rendering.",
    categorySlug: "motion-effects",
    tags: ["carousel", "marquee", "testimonials", "logos", "cards"],
    premium: false,
    trendingScore: 109,
    createdAt: "2026-05-14",
    animationKinds: ["layout", "hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "InfiniteMovingCardItem[]", description: "Card data array used to render the moving list." },
      { name: "direction", type: "\"left\" | \"right\"", defaultValue: "\"left\"", description: "Scroll direction of the marquee track." },
      { name: "speed", type: "\"slow\" | \"normal\" | \"fast\"", defaultValue: "\"normal\"", description: "Velocity preset for card movement." },
      { name: "pauseOnHover", type: "boolean", defaultValue: "true", description: "Pauses track animation while hovered." },
      { name: "className", type: "string", description: "Class names for the root wrapper." },
      { name: "cardClassName", type: "string", description: "Class names applied to each card container." },
      { name: "gap", type: "number", defaultValue: "16", description: "Spacing in pixels between cards." },
      { name: "loop", type: "boolean", defaultValue: "true", description: "Enables seamless infinite looping via duplicated items." },
      { name: "showGradientMask", type: "boolean", defaultValue: "true", description: "Shows edge fade masks for premium marquee framing." },
      { name: "renderItem", type: "(item, index) => React.ReactNode", description: "Custom renderer for complete card UI control." },
    ],
    Preview: Previews.PreviewInfiniteMovingCards,
    reactSource: `"use client";

import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

const testimonials = [
  {
    title: "Launch velocity increased",
    description: "We shipped our redesign in half the usual time.",
    name: "Ariana Shaw",
    role: "Product Lead",
    rating: 5,
    tags: ["SaaS"],
  },
  {
    title: "No visual jump",
    description: "The loop feels smooth and polished on every screen size.",
    name: "Marcus Lee",
    role: "Frontend Engineer",
    rating: 5,
    tags: ["Motion"],
  },
];

export function TestimonialsRail() {
  return <InfiniteMovingCards items={testimonials} direction="left" speed="normal" pauseOnHover />;
}`,
    reactExamples: [
      {
        title: "Testimonials example",
        code: `"use client";

import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

const testimonials = [
  { title: "Launch velocity increased", description: "Shipped in half the time.", name: "Ariana", role: "Product Lead", rating: 5, tags: ["SaaS"] },
  { title: "Production-ready defaults", description: "Smooth, readable, responsive.", name: "Marcus", role: "Frontend Engineer", rating: 5, tags: ["React"] },
  { title: "No visual jump", description: "Seamless loop even on large screens.", name: "Lena", role: "Design Manager", rating: 4, tags: ["UX"] },
];

export function TestimonialsRail() {
  return <InfiniteMovingCards items={testimonials} direction="left" speed="normal" pauseOnHover />;
}`,
      },
      {
        title: "Logo/cards example",
        code: `"use client";

import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

const tools = [
  { id: "1", title: "Nexus", tags: ["UI"] },
  { id: "2", title: "Orbit", tags: ["Analytics"] },
  { id: "3", title: "Flux", tags: ["Ops"] },
  { id: "4", title: "Pulse", tags: ["Growth"] },
];

export function ToolsRail() {
  return (
    <InfiniteMovingCards
      items={tools}
      direction="right"
      speed="fast"
      cardClassName="min-w-[180px] max-w-[180px]"
      renderItem={(item) => (
        <div className="flex h-[110px] w-[180px] flex-col items-center justify-center rounded-2xl border border-border/70 bg-card">
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-[11px] text-muted-foreground">{item.tags?.[0]}</p>
        </div>
      )}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "meteors",
    name: "Meteor Effect",
    registryCliName: "meteors",
    resourceLinks: [{ label: "Live demo", href: "/demos/meteors" }],
    description:
      "Animated diagonal meteor beams with glow heads and trailing streaks, designed as a reusable background layer for cards and hero sections.",
    categorySlug: "background-effects",
    tags: ["meteors", "background", "hero", "glow", "motion"],
    premium: false,
    trendingScore: 106,
    createdAt: "2026-05-14",
    animationKinds: ["gradient", "hover", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "number", type: "number", defaultValue: "18", description: "Base number of meteor beams before intensity scaling." },
      { name: "className", type: "string", description: "Class names for the root wrapper." },
      { name: "meteorClassName", type: "string", description: "Class names applied to each meteor beam element." },
      { name: "minDelay", type: "number", defaultValue: "0.12", description: "Minimum start delay between meteor loops (seconds)." },
      { name: "maxDelay", type: "number", defaultValue: "2.4", description: "Maximum start delay between meteor loops (seconds)." },
      { name: "minDuration", type: "number", defaultValue: "3.2", description: "Minimum meteor travel duration (seconds)." },
      { name: "maxDuration", type: "number", defaultValue: "7.2", description: "Maximum meteor travel duration (seconds)." },
      { name: "angle", type: "number", defaultValue: "215", description: "Travel direction angle in degrees." },
      { name: "glow", type: "boolean", defaultValue: "true", description: "Adds glow bloom around meteor heads." },
      { name: "color", type: "string", defaultValue: "\"hsl(var(--primary) / 0.95)\"", description: "Beam/head color value." },
      { name: "intensity", type: "\"low\" | \"medium\" | \"high\"", defaultValue: "\"medium\"", description: "Meteor density multiplier preset." },
      { name: "hoverOnly", type: "boolean", defaultValue: "false", description: "Runs animation only while hovering the container." },
      { name: "children", type: "React.ReactNode", description: "Foreground content rendered above the meteor layer." },
    ],
    Preview: Previews.PreviewMeteors,
    reactSource: `"use client";

import { Meteors } from "@/components/meteors";

export function HeroMeteors() {
  return (
    <Meteors
      number={26}
      minDuration={2.8}
      maxDuration={5.8}
      minDelay={0.06}
      maxDelay={1.8}
      angle={212}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050911] px-8 py-16 text-white"
      intensity="high"
      glow
    >
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Launch cinematic product surfaces</h2>
      </div>
    </Meteors>
  );
}`,
    reactExamples: [
      {
        title: "Card background example",
        code: `"use client";

import { Meteors } from "@/components/meteors";

export function PricingMeteorCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#050911] p-6 text-white">
      <Meteors number={18} minDuration={3} maxDuration={6} angle={218} className="absolute inset-0" />
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">Pro plan</p>
        <h3 className="mt-2 text-2xl font-semibold">$49/mo</h3>
      </div>
    </div>
  );
}`,
      },
      {
        title: "Hero background example",
        code: `"use client";

import { Meteors } from "@/components/meteors";

export function HeroMeteors() {
  return (
    <Meteors
      number={30}
      minDelay={0.05}
      maxDelay={1.8}
      minDuration={2.8}
      maxDuration={5.8}
      angle={212}
      intensity="high"
      glow
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#030712] px-8 py-16 text-white"
    >
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Build launch pages with subtle motion depth
        </h2>
      </div>
    </Meteors>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "background-boxes",
    name: "Background Boxes",
    registryCliName: "background-boxes",
    resourceLinks: [{ label: "Live demo", href: "/demos/background-boxes" }],
    description:
      "Interactive full-width box grid background with cursor-follow highlight, optional glow, and smooth ripple transitions.",
    categorySlug: "background-effects",
    tags: ["grid", "hover", "background", "hero", "interactive"],
    premium: false,
    trendingScore: 103,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Foreground content rendered above the grid layer." },
      { name: "rows", type: "number", defaultValue: "10", description: "Number of grid rows." },
      { name: "columns", type: "number", description: "Fixed number of columns. If omitted, columns adapt to container width." },
      { name: "boxSize", type: "number", defaultValue: "44", description: "Target box size used for responsive column calculation." },
      { name: "className", type: "string", description: "Class names for the root wrapper." },
      { name: "boxClassName", type: "string", description: "Class names applied to each grid cell." },
      { name: "gridClassName", type: "string", description: "Class names applied to the grid layer (useful for perspective transforms)." },
      { name: "highlightColor", type: "string", defaultValue: "\"#22d3ee\"", description: "Background color used for hovered/nearby highlight boxes." },
      { name: "defaultColor", type: "string", defaultValue: "\"transparent\"", description: "Default cell background color when inactive." },
      { name: "borderColor", type: "string", defaultValue: "\"hsl(var(--border) / 0.45)\"", description: "Border color for each box." },
      { name: "enableGlow", type: "boolean", defaultValue: "true", description: "Adds glow overlay to highlighted cells." },
      { name: "interactive", type: "boolean", defaultValue: "true", description: "Enables cursor-follow highlight and ripple behavior." },
      { name: "neighborRipple", type: "boolean", defaultValue: "false", description: "Enables nearby-box ripple around hovered cell." },
      { name: "animatePulse", type: "boolean", defaultValue: "false", description: "Subtle idle pulse animation when not hovered." },
    ],
    Preview: Previews.PreviewBackgroundBoxes,
    reactSource: `"use client";

import { BackgroundBoxes } from "@/components/background-boxes";

export function HeroBackgroundBoxes() {
  return (
    <BackgroundBoxes
      rows={11}
      boxSize={42}
      highlightColor="hsl(var(--primary) / 0.85)"
      className="rounded-3xl border border-border/60 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="mx-auto flex min-h-[340px] max-w-3xl flex-col items-center justify-center px-6 py-10 text-center">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Premium interactive grid background
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Use as hero, section, or card background with subtle cursor-follow highlights.
        </p>
      </div>
    </BackgroundBoxes>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "encrypted-text",
    name: "Encrypted Text",
    registryCliName: "encrypted-text",
    resourceLinks: [{ label: "Live demo", href: "/demos/encrypted-text" }],
    description:
      "Characters shuffle through gibberish before locking into the final string — a futuristic cyber decoding reveal for hero headings, buttons, badges, and nav links.",
    categorySlug: "motion-effects",
    tags: ["animation", "text", "cyber", "reveal", "typewriter", "hacker", "decode"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "scroll"],
    dependencies: ["framer-motion"],
    previewShell: "plain",
    props: [
      { name: "text", type: "string", description: "The final string that gets revealed." },
      { name: "trigger", type: '"load" | "hover" | "viewport" | "click"', defaultValue: '"load"', description: "What event starts the animation." },
      { name: "speed", type: "number", defaultValue: "50", description: "Milliseconds between each character locking in." },
      { name: "shuffleSpeed", type: "number", defaultValue: "35", description: "Milliseconds between gibberish shuffle ticks." },
      { name: "iterations", type: "number", defaultValue: "8", description: "Shuffle cycles that run before the first character locks." },
      { name: "revealDelay", type: "number", defaultValue: "0", description: "Milliseconds before the animation begins." },
      { name: "characters", type: "string", description: "Character set used for the gibberish phase." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Replay the animation after completion." },
      { name: "loopDelay", type: "number", defaultValue: "2000", description: "Milliseconds between loop cycles." },
      { name: "as", type: '"span" | "p" | "h1" | "h2" | "h3" | "div"', defaultValue: '"span"', description: "Rendered HTML element." },
      { name: "onComplete", type: "() => void", description: "Callback fired when every character has locked in." },
      { name: "className", type: "string", description: "Additional Tailwind classes merged onto the root element." },
    ],
    Preview: Previews.PreviewEncryptedText,
    reactSource: `"use client";

import { EncryptedText } from "@/components/encrypted-text";

/* Load trigger — plays once on mount */
export function HeroHeading() {
  return (
    <EncryptedText
      text="INITIALIZING SYSTEM"
      trigger="load"
      speed={55}
      shuffleSpeed={30}
      iterations={10}
      className="text-5xl font-bold tracking-[0.12em] text-foreground"
    />
  );
}

/* Hover trigger — replays on each mouse-enter */
export function HoverButton() {
  return (
    <button className="rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary">
      <EncryptedText text="Get started" trigger="hover" speed={35} shuffleSpeed={20} iterations={4} />
    </button>
  );
}

/* Looping badge */
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      <EncryptedText text="ONLINE" trigger="load" loop loopDelay={3000} speed={80} iterations={3} />
    </span>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "mac-keyboard",
    name: "Mac Keyboard",
    registryCliName: "mac-keyboard",
    resourceLinks: [{ label: "Live demo", href: "/demos/keyboard" }],
    description:
      "Fully interactive Mac-style keyboard with Web Audio synthesised click sounds, Framer Motion keycap animations, and real-time physical keyboard highlighting.",
    categorySlug: "motion-effects",
    tags: ["keyboard", "interactive", "sound", "animation", "mac", "input", "audio"],
    premium: false,
    trendingScore: 95,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    previewShell: "plain",
    props: [
      { name: "layout",          type: '"mac" | "compact"',               defaultValue: '"mac"',         description: "Full layout or compact (no Fn row)." },
      { name: "theme",           type: '"dark" | "light" | "auto"',       defaultValue: '"auto"',        description: "Visual theme; auto tracks the document dark class." },
      { name: "enableSound",     type: "boolean",                         defaultValue: "true",          description: "Toggle synthesised click sounds." },
      { name: "soundType",       type: '"mechanical" | "soft" | "clicky"', defaultValue: '"mechanical"', description: "Timbre of the synthesised key sound." },
      { name: "volume",          type: "number",                          defaultValue: "0.6",           description: "Master volume (0 – 1)." },
      { name: "showFunctionRow", type: "boolean",                         defaultValue: "true",          description: "Show or hide the Esc + F-key row." },
      { name: "activeKeys",      type: "string[]",                        defaultValue: "[]",            description: "KeyboardEvent.code values to highlight as pressed." },
      { name: "onKeyPress",      type: "(key: KeyDef) => void",           description: "Fires when a virtual key is clicked." },
      { name: "className",       type: "string",                          description: "Extra classes on the keyboard body." },
      { name: "keyClassName",    type: "string",                          description: "Extra classes on every keycap." },
    ],
    Preview: Previews.PreviewKeyboard,
    previewSections: [
      {
        Preview: Previews.PreviewKeyboardWithSoundDetail,
        reactSource: `"use client";
import { MacKeyboard, usePhysicalKeyboard } from "@/components/keyboard";

export function KeyboardWithSound() {
  const active = usePhysicalKeyboard();

  return (
    <MacKeyboard
      layout="mac"
      theme="auto"
      enableSound={true}
      soundType="mechanical"
      volume={0.65}
      activeKeys={active}
      showFunctionRow={true}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewKeyboardSilentDetail,
        reactSource: `"use client";
import { MacKeyboard, usePhysicalKeyboard } from "@/components/keyboard";

export function KeyboardSilent() {
  const active = usePhysicalKeyboard();

  return (
    <MacKeyboard
      layout="mac"
      theme="auto"
      enableSound={false}
      activeKeys={active}
      showFunctionRow={true}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "images-badge",
    name: "Images Badge",
    registryCliName: "images-badge",
    description:
      "Stacked avatar/image pill that fans open on hover — ideal for team badges, social proof, avatar groups, and template galleries.",
    categorySlug: "motion-effects",
    tags: ["avatar", "badge", "social-proof", "hover", "stack", "team", "animation"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    previewShell: "plain",
    props: [
      { name: "images",         type: "BadgeImage[]",         description: "Array of { src, alt } objects to display." },
      { name: "maxVisible",     type: "number",               defaultValue: "3",       description: "Images shown in the collapsed state." },
      { name: "revealCount",    type: "number",               defaultValue: "2",       description: "Extra images revealed on hover." },
      { name: "label",          type: "string",               description: "Optional text label after the stack." },
      { name: "size",           type: '"sm" | "md" | "lg"',                  defaultValue: '"md"',       description: "Controls image diameter and pill height." },
      { name: "shape",          type: '"circle" | "rounded" | "square"',   defaultValue: '"circle"',   description: "Clipping shape applied to each image." },
      { name: "direction",      type: '"left" | "right"',                  defaultValue: '"right"',    description: "Direction the stack fans out toward on hover." },
      { name: "className",      type: "string",               description: "Extra classes on the pill container." },
      { name: "imageClassName", type: "string",               description: "Extra classes on every image wrapper." },
      { name: "onClick",        type: "() => void",           description: "Makes the badge interactive (button role + keyboard)." },
    ],
    Preview: Previews.PreviewImagesBadge,
    previewSections: [
      {
        Preview: Previews.PreviewImagesBadgeDefault,
        reactSource: `"use client";
import { ImagesBadge } from "@/components/images-badge";

const TEAM = [
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4", alt: "Felix" },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede", alt: "Aneka" },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Milo&backgroundColor=d1d4f9",  alt: "Milo"  },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&backgroundColor=ffd5dc",   alt: "Zoe"   },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kai&backgroundColor=ffdfbf",   alt: "Kai"   },
];

export function DefaultBadge() {
  return (
    <ImagesBadge
      images={TEAM}
      maxVisible={3}
      revealCount={2}
      label="Trusted by our team"
      size="md"
      direction="right"
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewImagesBadgeLarge,
        reactSource: `"use client";
import { ImagesBadge } from "@/components/images-badge";

export function LargeBadge() {
  return (
    <ImagesBadge
      images={TEAM}           // 7 images
      maxVisible={4}
      revealCount={3}
      label="12,000+ developers"
      size="lg"
      direction="right"
      onClick={() => window.location.href = "/community"}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewImagesBadgeCompact,
        reactSource: `"use client";
import { ImagesBadge } from "@/components/images-badge";

export function CompactBadge() {
  return (
    <div className="flex items-center gap-3">
      <ImagesBadge
        images={TEAM}
        maxVisible={2}
        revealCount={2}
        size="sm"
      />
      <span className="text-sm text-muted-foreground">
        Felix, Aneka + 3 others liked this
      </span>
    </div>
  );
}`,
      },
      {
        Preview: Previews.PreviewImagesBadgeWide,
        reactSource: `"use client";
import { ImagesBadge } from "@/components/images-badge";

const TEMPLATES = [
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=alpha&backgroundColor=1e293b",   alt: "Dashboard"  },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=beta&backgroundColor=0f172a",    alt: "Landing"    },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=gamma&backgroundColor=172554",   alt: "Portfolio"  },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=delta&backgroundColor=1c1917",   alt: "SaaS"       },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=epsilon&backgroundColor=14532d", alt: "Store"      },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=zeta&backgroundColor=450a0a",    alt: "Blog"       },
];

export function WideSpreadBadge() {
  return (
    <ImagesBadge
      images={TEMPLATES}
      maxVisible={2}
      revealCount={4}
      label="6 templates included"
      size="md"
      direction="left"
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "dot-grid-hero",
    name: "Interactive Dot Grid Hero",
    registryCliName: "dot-grid-hero",
    description:
      "Cinematic hero section with a Canvas-rendered dot grid that reacts to cursor proximity — dots scale, brighten, and return to rest with a smooth radial glow spotlight.",
    categorySlug: "hero-sections",
    tags: ["hero", "canvas", "interactive", "particles", "cursor", "spotlight", "animation", "background"],
    premium: false,
    trendingScore: 97,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "gradient"],
    dependencies: ["framer-motion"],
    previewShell: "plain",
    props: [
      { name: "title",             type: "string",   defaultValue: '"Build interfaces\\nthat ship."', description: "Hero heading. Use \\n for line breaks." },
      { name: "subtitle",          type: "string",   description: "Supporting paragraph below the title." },
      { name: "primaryCTA",        type: "CTAButton", description: "{ label, href?, onClick? } — main action button." },
      { name: "secondaryCTA",      type: "CTAButton", description: "{ label, href?, onClick? } — ghost action button." },
      { name: "dotSize",           type: "number",   defaultValue: "1.2",       description: "Base dot radius in px." },
      { name: "dotGap",            type: "number",   defaultValue: "22",        description: "Gap between dot centres in px." },
      { name: "glowColor",         type: "string",   defaultValue: '"#6366f1"', description: "Cursor spotlight colour (hex)." },
      { name: "interactionRadius", type: "number",   defaultValue: "130",       description: "Radius in px where dots react to the cursor." },
      { name: "dotColor",          type: "string",   defaultValue: '"#334155"', description: "Resting dot colour (hex)." },
      { name: "activeDotColor",    type: "string",   defaultValue: '"#e2e8f0"', description: "Fully-activated dot colour (hex)." },
      { name: "className",         type: "string",   description: "Extra classes on the section element." },
    ],
    Preview: Previews.PreviewDotGridHero,
    previewSections: [
      {
        Preview: Previews.PreviewDotGridHeroDefault,
        reactSource: `"use client";
import { DotGridHero } from "@/components/dot-grid-hero";

export function DefaultHero() {
  return (
    <DotGridHero
      title={"Build interfaces\\nthat ship."}
      subtitle="A motion-native component library for React.
Animated, accessible, and production-ready."
      primaryCTA={{ label: "Get started",         href: "/components" }}
      secondaryCTA={{ label: "Browse components", href: "/components" }}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewDotGridHeroDense,
        reactSource: `"use client";
import { DotGridHero } from "@/components/dot-grid-hero";

export function DenseHero() {
  return (
    <DotGridHero
      title={"Design systems\\nmade simple."}
      subtitle="Everything you need to build fast,
beautiful products at scale."
      primaryCTA={{ label: "Start for free", href: "#" }}
      secondaryCTA={{ label: "View docs",    href: "#" }}
      dotGap={14}
      dotSize={1.0}
      glowColor="#06b6d4"
      activeDotColor="#cffafe"
      interactionRadius={150}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewDotGridHeroAmber,
        reactSource: `"use client";
import { DotGridHero } from "@/components/dot-grid-hero";

export function AmberHero() {
  return (
    <DotGridHero
      title={"Ship 10× faster\\nwith AI."}
      subtitle="AI-powered tooling that writes, tests,
and deploys your code automatically."
      primaryCTA={{ label: "Try it free",  href: "#" }}
      secondaryCTA={{ label: "Watch demo", href: "#" }}
      dotGap={26}
      dotSize={1.4}
      glowColor="#f59e0b"
      activeDotColor="#fef3c7"
      dotColor="#292524"
      interactionRadius={200}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewDotGridHeroRose,
        reactSource: `"use client";
import { DotGridHero } from "@/components/dot-grid-hero";

export function RoseHero() {
  return (
    <DotGridHero
      title={"Beautiful UX\\nstarts here."}
      subtitle="Craft interfaces your users will love.
Premium components, zero compromise."
      primaryCTA={{ label: "Explore now",  href: "#" }}
      secondaryCTA={{ label: "See pricing", href: "#" }}
      dotGap={30}
      dotSize={2.0}
      glowColor="#f43f5e"
      activeDotColor="#ffe4e6"
      dotColor="#3f1f27"
      interactionRadius={160}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "starfield-hero",
    name: "Interactive Starfield Hero",
    registryCliName: "starfield-hero",
    description:
      "Dark hero section with a cursor-reactive starfield. Hundreds of glowing particles stretch, brighten, and rotate toward the cursor — built on Canvas + requestAnimationFrame at 60 fps.",
    categorySlug: "hero-sections",
    tags: ["hero", "canvas", "interactive", "particles", "cursor", "starfield", "animation", "dark", "background"],
    premium: false,
    trendingScore: 98,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    previewShell: "plain",
    props: [
      { name: "title",             type: "string",    defaultValue: '"Ship faster.\\nBuild better."', description: "Hero heading — use \\n for line breaks." },
      { name: "subtitle",          type: "string",    description: "Supporting paragraph below the title." },
      { name: "primaryCTA",        type: "CTAConfig", description: "{ label, href?, onClick? } — main action button." },
      { name: "secondaryCTA",      type: "CTAConfig", description: "{ label, href?, onClick? } — ghost action button." },
      { name: "particleCount",     type: "number",    defaultValue: "300",       description: "Total number of particles." },
      { name: "interactionRadius", type: "number",    defaultValue: "140",       description: "Cursor influence radius in px." },
      { name: "particleColor",     type: "string",    defaultValue: '"#60a5fa"', description: "Base particle colour (hex)." },
      { name: "activeColor",       type: "string",    defaultValue: '"#ffffff"', description: "Particle colour at full activation (hex)." },
      { name: "speed",             type: "number",    defaultValue: "0.5",       description: "Return speed: 0.1 (dreamlike) → 1.0 (snappy)." },
      { name: "children",          type: "ReactNode", description: "Override default hero content entirely." },
      { name: "className",         type: "string",    description: "Extra classes on the section element." },
    ],
    Preview: Previews.PreviewStarfieldHero,
    previewSections: [
      {
        Preview: Previews.PreviewStarfieldHeroDefault,
        reactSource: `"use client";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function DefaultHero() {
  return (
    <InteractiveStarfieldHero
      title={"Ship faster.\\nBuild better."}
      subtitle="A motion-native component library for React — animated, accessible, and production-ready."
      primaryCTA={{ label: "Get started",      href: "/components" }}
      secondaryCTA={{ label: "View components", href: "/components" }}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewStarfieldHeroDeepSpace,
        reactSource: `"use client";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function DeepSpaceHero() {
  return (
    <InteractiveStarfieldHero
      title={"Design systems\\nmade simple."}
      subtitle="Everything you need to build beautiful products at scale."
      primaryCTA={{ label: "Start for free", href: "#" }}
      secondaryCTA={{ label: "View docs",    href: "#" }}
      particleCount={400}
      particleColor="#a78bfa"
      activeColor="#f0abfc"
      interactionRadius={180}
      speed={0.4}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewStarfieldHeroOcean,
        reactSource: `"use client";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function OceanNightHero() {
  return (
    <InteractiveStarfieldHero
      title={"Ship 10× faster\\nwith AI."}
      subtitle="AI-powered tooling that writes, tests, and deploys your code automatically."
      primaryCTA={{ label: "Try it free",  href: "#" }}
      secondaryCTA={{ label: "Watch demo", href: "#" }}
      particleColor="#22d3ee"
      activeColor="#ecfeff"
      interactionRadius={120}
      speed={0.8}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewStarfieldHeroEmber,
        reactSource: `"use client";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function EmberStormHero() {
  return (
    <InteractiveStarfieldHero
      title={"Beautiful UX\\nstarts here."}
      subtitle="Craft interfaces your users will love. Premium components, zero compromise."
      primaryCTA={{ label: "Explore now",  href: "#" }}
      secondaryCTA={{ label: "See pricing", href: "#" }}
      particleCount={180}
      particleColor="#f59e0b"
      activeColor="#fef9c3"
      interactionRadius={160}
      speed={0.15}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "compare",
    name: "Before / After Compare",
    registryCliName: "compare",
    description:
      "Drag a vertical handle to compare two images side-by-side. Supports mouse and touch, optional labels, custom start position, and any aspect ratio.",
    categorySlug: "motion-effects",
    tags: ["compare", "slider", "before-after", "image", "interactive", "drag", "cursor"],
    premium: false,
    trendingScore: 92,
    createdAt: "2026-05-14",
    animationKinds: ["hover"],
    dependencies: ["lucide-react"],
    previewShell: "plain",
    props: [
      { name: "beforeImage",     type: "string", description: "src URL for the before (left) image." },
      { name: "afterImage",      type: "string", description: "src URL for the after (right) image." },
      { name: "beforeLabel",     type: "string", description: "Optional text label on the left side." },
      { name: "afterLabel",      type: "string", description: "Optional text label on the right side." },
      { name: "initialPosition", type: "number", defaultValue: "50",  description: "Starting slider position as 0–100%." },
      { name: "className",       type: "string", description: "Extra Tailwind classes — set aspect ratio here." },
    ],
    Preview: Previews.PreviewCompare,
    previewSections: [
      {
        Preview: Previews.PreviewCompareDefault,
        reactSource: `"use client";
import { Compare } from "@/components/compare";

export function CompareDemo() {
  return (
    <Compare
      beforeImage="/images/before.jpg"
      afterImage="/images/after.jpg"
      beforeLabel="Before"
      afterLabel="After"
      className="aspect-video w-full"
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "expandable-cards",
    name: "Expandable Cards",
    registryCliName: "expandable-cards",
    description:
      "Responsive card grid where clicking a card smoothly expands it into a full-detail overlay with image, description, and a CTA button.",
    categorySlug: "cards",
    tags: ["cards", "grid", "expandable", "modal", "interactive", "framer-motion", "animation"],
    premium: false,
    trendingScore: 94,
    createdAt: "2026-05-14",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    previewShell: "plain",
    props: [
      { name: "cards",     type: "CardItem[]", description: "Array of card data objects." },
      { name: "className", type: "string",     description: "Extra classes on the grid container." },
    ],
    Preview: Previews.PreviewExpandableCards,
    previewSections: [
      {
        Preview: Previews.PreviewExpandableCards,
        reactSource: `"use client";
import { ExpandableCards } from "@/components/expandable-cards";
import type { CardItem } from "@/components/expandable-cards";

const cards: CardItem[] = [
  {
    id: "1",
    title: "Motion Design System",
    description: "Animation primitives built for React and Tailwind CSS.",
    fullDescription: "Full description shown when expanded...",
    image: "/images/card-1.jpg",
    category: "Design",
    ctaText: "Explore",
    ctaLink: "/components",
  },
];

export default function Page() {
  return <ExpandableCards cards={cards} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
];

export function getLibraryComponent(slug: string) {
  return libraryComponents.find((c) => c.slug === slug) ?? null;
}

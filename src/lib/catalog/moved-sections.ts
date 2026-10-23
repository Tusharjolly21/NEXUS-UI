/**
 * Components that are really full page sections (a hero, a footer, a pricing table…), shown on the
 * Blocks pages instead of the components library. Each keeps its own install name, files, preview
 * and Free/Pro tier; the old /components/<slug> URLs redirect to the section (next.config.mjs).
 *
 * Plain data only (no previews), so the block pages, the registry API and scripts/build-registry.mjs
 * (which reads this file's text with the same entry shape as library-components.ts) can all use it.
 */

export type MovedSection = {
  slug: string;
  name: string;
  /** Block page the section lives on. */
  block: string;
  description: string;
  premium: boolean;
  registryCliName: string;
  dependencies: string[];
  /** Component export name, for the usage snippet and Customize. */
  component: string;
  /** Preview export in @/registry/component-previews (the wall tile). */
  preview: string;
  /** Repo path of the main source file, read on the server only when the visitor has access. */
  source: string;
  props: Array<{ name: string; type: string; description: string; defaultValue?: string }>;
  reactSource: string;
  tailwindSource: string;
};

export const movedSections: MovedSection[] = [
  {
    slug: "cinematic-logo-cloud",
    name: "Cinematic Logo Cloud",
    block: "block-logo-clouds",
    description: "Social proof with a cinematic entrance: each logo blurs into view in turn, then a soft spotlight follows the pointer and the logos it passes resolve from grey into crisp ink and lift. The marquee variants drift on their own, ease off under the pointer, and can be dragged and flung.",
    premium: false,
    registryCliName: "cinematic-logo-cloud",
    dependencies: ["framer-motion"],
    component: "CinematicLogoCloud",
    preview: "PreviewCinematicLogoCloudRedesign",
    source: "src/components/cinematic-logo-cloud/cinematic-logo-cloud.tsx",
    props: [
      {"name": "clients", "type": "LogoCloudClient[]", "description": "Brands: { name, logo?, src?, text?, className?, nameClassName?, invertDark? }. logo is any ReactNode, src an image URL you host; with neither, a drawn monogram is used. slug is still accepted but no longer fetched from a CDN.", "defaultValue": "DEFAULT_LOGO_CLIENTS"},
      {"name": "variant", "type": "\"grid\" | \"marquee\" | \"marquee-named\"", "description": "grid: blur-in and spotlight. marquee: drifting pills of marks. marquee-named: marks with names.", "defaultValue": "\"grid\""},
      {"name": "eyebrow", "type": "string", "description": "Small caps label above the logos; empty string hides it.", "defaultValue": "\"Trusted by teams building the future of AI.\""},
      {"name": "description", "type": "string", "description": "Optional line under the eyebrow."},
      {"name": "speed", "type": "number", "description": "Marquee drift in px per second.", "defaultValue": "40"},
      {"name": "autoplay", "type": "boolean", "description": "Grid only: sweeps the spotlight across the logos until someone points at them.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the section."}
    ],
    reactSource: `// src/app/page.tsx

import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";

const clients = [
  // With no logo or src, a monogram is drawn from the name. Add src: "/logos/acme.svg" for your own image.
  { name: "Acme" },
  { name: "Globex" },
  { name: "Initech" },
  { name: "Umbrella", src: "/logos/umbrella.svg", invertDark: true },
  { name: "Hooli", text: true, className: "font-black tracking-tight" },
];

export default function Page() {
  return (
    <CinematicLogoCloud
      clients={clients}
      eyebrow="Trusted by teams building what's next"
      description="From first prototype to production."
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "step-flow",
    name: "Step Flow",
    block: "block-features",
    description: "A process section with numbered steps beside a deck of cards. Picking a step by hover, click or arrow keys slides the highlight to it on a spring and deals its card to the front while the old card tucks under the back of the deck; with autoplay a progress bar fills under the active step.",
    premium: false,
    registryCliName: "step-flow",
    dependencies: ["framer-motion"],
    component: "StepFlow",
    preview: "PreviewStepFlowRedesign",
    source: "src/components/step-flow/step-flow.tsx",
    props: [
      {"name": "steps", "type": "StepFlowItem[]", "description": "Steps: title, optional serial, description, image (+ imageAlt) and accent. Without an image the card is drawn in the accent."},
      {"name": "defaultStep", "type": "number", "description": "Step selected on first render.", "defaultValue": "0"},
      {"name": "onStepChange", "type": "(index: number) => void", "description": "Called with the index when the selected step changes."},
      {"name": "highlightColor", "type": "string", "description": "Background of the sliding highlight; defaults to the system grey."},
      {"name": "autoplay", "type": "boolean", "description": "Advances through the steps with a progress bar until someone touches the component.", "defaultValue": "false"},
      {"name": "autoPlay", "type": "boolean", "description": "Older name for autoplay.", "defaultValue": "false"},
      {"name": "autoPlayInterval", "type": "number", "description": "Milliseconds per step while autoplaying (min 1200).", "defaultValue": "3200"},
      {"name": "className", "type": "string", "description": "Extra classes for the section."},
      {"name": "textClassName", "type": "string", "description": "Extra classes for the step list column."},
      {"name": "imageClassName", "type": "string", "description": "Extra classes for the card deck column."}
    ],
    reactSource: `// src/app/page.tsx

import { StepFlow, type StepFlowItem } from "@/components/step-flow";

const steps: StepFlowItem[] = [
  { serial: "01", title: "Audit the idea", description: "Collect the messy notes, user goals and brand cues before a single section is built." },
  { serial: "02", title: "Sketch the system", description: "Turn the direction into reusable layout rules, component states and rhythm." },
  { serial: "03", title: "Layer the motion", description: "Add transitions that guide attention without making the page feel busy.", accent: "#ff375f" },
  // Pass an image to show a photo on the card instead of the drawn art.
  { serial: "04", title: "Ship the page", description: "Package a polished, responsive page your users can copy into production.", image: "/images/ship.jpg", imageAlt: "The finished landing page" },
];

export default function Page() {
  return (
    <StepFlow
      steps={steps}
      className="mx-auto max-w-5xl"
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "hero-aurora-spotlight",
    name: "Aurora Hero Spotlight",
    block: "block-hero",
    description: "A launch hero on a slow aurora with a spotlight that trails the pointer and ribbons of light drifting against it. The glass product card underneath rises in with an overshoot, counts up its numbers and tilts toward the pointer while a glare slides across it.",
    premium: true,
    registryCliName: "hero-aurora-spotlight",
    dependencies: ["framer-motion"],
    component: "HeroAurora",
    preview: "PreviewHeroAuroraSpotlightRedesign",
    source: "src/components/hero-aurora-spotlight/hero-aurora-spotlight.tsx",
    props: [
      {"name": "eyebrow", "type": "string", "description": "Pill text above the headline.", "defaultValue": "\"Introducing Aurora 2.0\""},
      {"name": "title", "type": "ReactNode", "description": "Headline."},
      {"name": "subtitle", "type": "string", "description": "Supporting line."},
      {"name": "primary", "type": "{ label: string; href: string }", "description": "Primary call to action."},
      {"name": "secondary", "type": "{ label: string; href: string }", "description": "Secondary call to action."},
      {"name": "spotlight", "type": "string", "description": "Colour of the light that follows the pointer.", "defaultValue": "\"rgba(100,210,255,0.22)\""},
      {"name": "autoplay", "type": "boolean", "description": "Moves a pretend pointer across the hero until someone moves over it.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the section."}
    ],
    reactSource: `// src/app/page.tsx

import { HeroAurora } from "@/components/hero-aurora-spotlight";

export default function Page() {
  return (
    <HeroAurora
      eyebrow="Now with live analytics"
      title="See every launch land."
      subtitle="Realtime dashboards for teams that ship weekly. Set up in five minutes."
      primary={{ label: "Start free", href: "/signup" }}
      secondary={{ label: "Watch the demo", href: "/demo" }}
      spotlight="rgba(191,90,242,0.22)"
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "bento-signal-grid",
    name: "Signal Bento Grid",
    block: "block-why-choose-us",
    description: "A service health bento: a latency line that scrolls live, 30 days of uptime bars, a request counter and edge-region health. Point at the chart and a sprung cursor rides the line reading the value under it; the uptime bars spring up in view and explain any day on hover or with the arrow keys.",
    premium: true,
    registryCliName: "bento-signal-grid",
    dependencies: ["framer-motion"],
    component: "BentoSignals",
    preview: "PreviewBentoSignalGridRedesign",
    source: "src/components/bento-signal-grid/bento-signal-grid.tsx",
    props: [
      {"name": "latency", "type": "number", "description": "Latency in ms the live chart hovers around.", "defaultValue": "42"},
      {"name": "uptime", "type": "string", "description": "Uptime shown on the uptime tile.", "defaultValue": "\"99.98%\""},
      {"name": "days", "type": "(\"ok\" | \"degraded\" | \"down\")[]", "description": "Daily status for the uptime bars, oldest first."},
      {"name": "requests", "type": "number", "description": "Requests served; rolls up in view, then ticks while live.", "defaultValue": "12480331"},
      {"name": "regions", "type": "{ name: string; ms: number; status?: \"ok\" | \"degraded\" }[]", "description": "Edge regions and their latency."},
      {"name": "live", "type": "boolean", "description": "Keep the chart scrolling and the counters ticking.", "defaultValue": "true"},
      {"name": "autoplay", "type": "boolean", "description": "Sweeps the chart cursor back and forth until someone points at the grid.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the grid."}
    ],
    reactSource: `// src/app/page.tsx

import { BentoSignals } from "@/components/bento-signal-grid";

export default function Page() {
  return (
    <BentoSignals
      latency={38}
      uptime="99.99%"
      requests={8_204_119}
      regions={[
        { name: "Dublin", ms: 16 },
        { name: "Oregon", ms: 29 },
        { name: "Tokyo", ms: 54, status: "degraded" },
        { name: "Sydney", ms: 47 },
      ]}
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "float-glass-navbar",
    name: "Float Glass Navbar",
    block: "block-navigation",
    description: "A floating glass navigation bar: a soft lens slides under the link you point at, thinning as it travels and stretching as it lands, then glides back to the active link. Once the page scrolls it tucks itself into a compact pill, and when the links no longer fit they fold into a springy menu.",
    premium: false,
    registryCliName: "float-glass-navbar",
    dependencies: ["framer-motion"],
    component: "FloatGlassNavbar",
    preview: "PreviewFloatGlassNavbarRedesign",
    source: "src/components/float-glass-navbar/float-glass-navbar.tsx",
    props: [
      {"name": "brand", "type": "string", "description": "Wordmark next to the logo. It folds away when the bar condenses.", "defaultValue": "\"Nexus\""},
      {"name": "logo", "type": "ReactNode", "description": "Your logo. Defaults to a drawn mark."},
      {"name": "links", "type": "{ label: string; href: string }[]", "description": "Navigation links.", "defaultValue": "DEFAULT_NAV_LINKS"},
      {"name": "activeHref", "type": "string", "description": "Controlled active link."},
      {"name": "defaultActiveHref", "type": "string", "description": "Active link when uncontrolled. Defaults to the first link."},
      {"name": "cta", "type": "{ label: string; href?: string; onClick?: () => void } | null", "description": "Call-to-action pill on the right. null hides it.", "defaultValue": "{ label: \"Get started\" }"},
      {"name": "onNavigate", "type": "(href: string) => void", "description": "Called when a link is clicked. When set, the browser's own navigation is prevented so you can route yourself."},
      {"name": "condensed", "type": "boolean", "description": "Force the compact pill. Leave undefined to condense after scrolling past condenseAt."},
      {"name": "scrollContainerRef", "type": "RefObject<HTMLElement | null>", "description": "Scroll container to watch instead of the window."},
      {"name": "condenseAt", "type": "number", "description": "Scroll distance in px after which the bar condenses.", "defaultValue": "24"},
      {"name": "position", "type": "\"sticky\" | \"fixed\" | \"static\"", "description": "How the bar is pinned.", "defaultValue": "\"sticky\""},
      {"name": "autoplay", "type": "boolean", "description": "Tours the links and breathes between wide and compact until someone points at it.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the wrapper."}
    ],
    reactSource: `// src/app/page.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { FloatGlassNavbar } from "@/components/float-glass-navbar";

const links = [
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
];

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <FloatGlassNavbar
      brand="Acme"
      links={links}
      activeHref={pathname}
      onNavigate={(href) => router.push(href)}
      cta={{ label: "Sign up", onClick: () => router.push("/signup") }}
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "orbit-footer",
    name: "Orbit Footer",
    block: "block-footer",
    description: "A complete site footer with brand, a newsletter signup, link columns with badges, a live status pill and social links. Under it a giant ghost wordmark rises from behind the legal bar, and its letters lift and ink in like a wave following the pointer.",
    premium: false,
    registryCliName: "orbit-footer",
    dependencies: ["framer-motion"],
    component: "OrbitFooter",
    preview: "PreviewOrbitFooterRedesign",
    source: "src/components/orbit-footer/orbit-footer.tsx",
    props: [
      {"name": "brand", "type": "string", "description": "Wordmark shown top-left and as the giant ghost word.", "defaultValue": "\"Orbit\""},
      {"name": "tagline", "type": "string", "description": "Line under the brand."},
      {"name": "columns", "type": "{ title: string; links: { label: string; href: string; badge?: string }[] }[]", "description": "Link columns."},
      {"name": "status", "type": "string | null", "description": "Status pill text; null hides it.", "defaultValue": "\"All systems normal\""},
      {"name": "statusHref", "type": "string", "description": "Where the status pill links.", "defaultValue": "\"#\""},
      {"name": "onSubscribe", "type": "(email: string) => Promise<void> | void", "description": "Called with a validated email. A promise shows the pending state, a throw shows the error state. Without it the form simulates success locally."},
      {"name": "showNewsletter", "type": "boolean", "description": "Show the newsletter form.", "defaultValue": "true"},
      {"name": "showWordmark", "type": "boolean", "description": "Draw the giant ghost wordmark.", "defaultValue": "true"},
      {"name": "socials", "type": "{ label: string; href: string; icon: ReactNode }[]", "description": "Icon links next to the status pill.", "defaultValue": "X and GitHub"},
      {"name": "year", "type": "number", "description": "Year in the copyright line; omitted when not given."},
      {"name": "legal", "type": "string", "description": "Text after the copyright sign. Defaults to the brand."},
      {"name": "autoplay", "type": "boolean", "description": "Sweeps a wave through the wordmark until someone points at the footer.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the footer."}
    ],
    reactSource: `// src/app/page.tsx
"use client";

import { OrbitFooter } from "@/components/orbit-footer";

async function addToNewsletter(email: string) {
  // Call your email provider here.
  console.log("subscribe", email);
}

export default function Page() {
  return (
    <OrbitFooter
      brand="Orbit"
      tagline="Interfaces that move, shipped as code you own."
      status="All systems normal"
      statusHref="/status"
      year={2026}
      legal="Orbit Labs"
      onSubscribe={addToNewsletter}
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "toggle-pricing-pro",
    name: "Toggle Pricing",
    block: "block-pricing-section",
    description: "Pricing cards with a monthly and yearly switch. The knob squashes and stretches with its own speed as it slides, the saving badge pops in, and every price rolls digit by digit to its new figure with a small overshoot.",
    premium: false,
    registryCliName: "toggle-pricing-pro",
    dependencies: ["framer-motion"],
    component: "PricingToggle",
    preview: "PreviewTogglePricingProRedesign",
    source: "src/components/toggle-pricing-pro/toggle-pricing-pro.tsx",
    props: [
      {"name": "plans", "type": "PricingPlan[]", "description": "Plans: id, name, monthly and annual per-month prices, optional description, features (up to 4), cta and featured. Defaults to three sample plans."},
      {"name": "defaultBilling", "type": "\"monthly\" | \"annual\"", "description": "Billing period shown first.", "defaultValue": "\"annual\""},
      {"name": "onBillingChange", "type": "(billing: \"monthly\" | \"annual\") => void", "description": "Called when the user flips the switch."},
      {"name": "onSelect", "type": "(planId: string, billing: \"monthly\" | \"annual\") => void", "description": "Called when a plan's button is pressed."},
      {"name": "currency", "type": "string", "description": "Currency symbol before the price.", "defaultValue": "\"$\""},
      {"name": "savingsLabel", "type": "string", "description": "Badge next to Yearly; defaults to the best saving across plans, e.g. \"Save 25%\"."},
      {"name": "autoplay", "type": "boolean", "description": "Flips the billing period every 2.6s until someone touches the component.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes for the wrapper."}
    ],
    reactSource: `// src/app/page.tsx

import { PricingToggle, type PricingPlan } from "@/components/toggle-pricing-pro";

const plans: PricingPlan[] = [
  { id: "hobby", name: "Hobby", monthly: 0, annual: 0, description: "Free forever.", features: ["1 project", "Community support"] },
  { id: "team", name: "Team", monthly: 24, annual: 19, description: "For small teams.", features: ["Unlimited projects", "Shared workspaces", "Priority support"], featured: true, cta: "Start free trial" },
  { id: "business", name: "Business", monthly: 79, annual: 64, description: "For whole companies.", features: ["SSO and SCIM", "Audit logs", "99.99% SLA"] },
];

export default function Page() {
  return (
    <PricingToggle
      plans={plans}
      defaultBilling="annual"
      currency="$"
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "split-signup-convert",
    name: "Split Signup Convert",
    block: "block-signup",
    description: "A two-panel signup: a lit value panel with the pitch and benefits, and a short form with Google and GitHub buttons, an email that confirms itself, and a password whose four-segment strength meter pops each segment in. As the form fills, the benefits on the left tick themselves off and a progress line grows under them.",
    premium: false,
    registryCliName: "split-signup-convert",
    dependencies: ["framer-motion"],
    component: "SplitSignup",
    preview: "PreviewSplitSignupConvertRedesign",
    source: "src/components/split-signup-convert/split-signup-convert.tsx",
    props: [
      {"name": "headline", "type": "string", "description": "Headline on the value panel."},
      {"name": "subhead", "type": "string", "description": "Line under the headline (hidden on narrow two-column layouts)."},
      {"name": "benefits", "type": "string[]", "description": "Benefits that tick off as the form fills. Three fit best."},
      {"name": "badge", "type": "string", "description": "Pill above the headline; empty string hides it.", "defaultValue": "\"Free forever plan\""},
      {"name": "proof", "type": "string", "description": "Social proof line with avatars; empty string hides it.", "defaultValue": "\"Joined by 12,000 teams this year\""},
      {"name": "submitLabel", "type": "string", "description": "Submit button label.", "defaultValue": "\"Create workspace\""},
      {"name": "onSubmit", "type": "(values: { email: string; password: string }) => Promise<void> | void", "description": "Called after local validation. A promise shows the pending state; throw an Error to show its message. Without it the form simulates success."},
      {"name": "showSso", "type": "boolean", "description": "Show the Google and GitHub buttons.", "defaultValue": "true"},
      {"name": "onSso", "type": "(provider: \"google\" | \"github\") => void", "description": "Called by the SSO buttons."},
      {"name": "onSignIn", "type": "() => void", "description": "Shows an Already have an account? link when set."},
      {"name": "autoplay", "type": "boolean", "description": "Types a demo signup on a loop until someone touches the form.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the root."}
    ],
    reactSource: `// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { SplitSignup } from "@/components/split-signup-convert";

async function createAccount(email: string, password: string) {
  // Call your auth provider here and throw on failure.
  console.log("create", email, password.length);
}

export default function Page() {
  const router = useRouter();
  return (
    <SplitSignup
      headline="Ship interfaces your team is proud of"
      benefits={["Every component, live and editable", "One-line installs", "Light and dark"]}
      onSubmit={({ email, password }) => createAccount(email, password)}
      onSignIn={() => router.push("/login")}
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "workbench-sidebar",
    name: "Workbench Sidebar",
    block: "block-sidebar",
    description: "A product sidebar with a workspace switcher, a search that filters the list as you type, a highlight that springs between rows, projects, a usage meter and the signed-in user. Collapsing springs it down to an icon rail while the labels trail after the width one row at a time.",
    premium: false,
    registryCliName: "workbench-sidebar",
    dependencies: ["framer-motion", "lucide-react"],
    component: "WorkbenchSidebar",
    preview: "PreviewWorkbenchSidebarRedesign",
    source: "src/components/workbench-sidebar/workbench-sidebar.tsx",
    props: [
      {"name": "workspace", "type": "{ name: string; plan?: string; color?: string }", "description": "Workspace shown in the switcher. color is any CSS background for its badge."},
      {"name": "workspaces", "type": "{ name: string; plan?: string; color?: string }[]", "description": "Workspaces listed in the switcher menu."},
      {"name": "onWorkspaceChange", "type": "(workspace) => void", "description": "Called with the workspace picked from the switcher."},
      {"name": "items", "type": "{ id: string; label: string; icon: LucideIcon; count?: number }[]", "description": "Main navigation. count shows a badge (a dot on the rail)."},
      {"name": "projects", "type": "{ id: string; label: string; color: string }[]", "description": "Projects list."},
      {"name": "onNewProject", "type": "() => void", "description": "Called by the + next to Projects."},
      {"name": "user", "type": "{ name: string; email: string }", "description": "Signed-in user."},
      {"name": "usage", "type": "number | null", "description": "Usage meter value 0-1; null hides the card. Turns orange from 0.9.", "defaultValue": "0.68"},
      {"name": "usageLabel", "type": "string", "description": "Meter caption.", "defaultValue": "\"Builds this month\""},
      {"name": "usageNote", "type": "string", "description": "Line under the meter.", "defaultValue": "\"Resets in 9 days\""},
      {"name": "activeId", "type": "string", "description": "Controlled active item or project."},
      {"name": "defaultActiveId", "type": "string", "description": "Initial active item when uncontrolled.", "defaultValue": "\"overview\""},
      {"name": "onNavigate", "type": "(id: string) => void", "description": "Called when an item or project is chosen."},
      {"name": "defaultCollapsed", "type": "boolean", "description": "Start as an icon rail.", "defaultValue": "false"},
      {"name": "onCollapsedChange", "type": "(collapsed: boolean) => void", "description": "Called when the sidebar folds or unfolds."},
      {"name": "autoplay", "type": "boolean", "description": "Walks through rows, a search and a collapse until someone touches it.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the aside."}
    ],
    reactSource: `// src/app/page.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { WorkbenchSidebar } from "@/components/workbench-sidebar";

export default function Page() {
  const router = useRouter();
  const active = usePathname().split("/")[1] || "overview";
  return (
    <div className="h-dvh p-2">
      <WorkbenchSidebar
        workspace={{ name: "Northwind", plan: "Pro plan" }}
        user={{ name: "Ada Park", email: "ada@northwind.co" }}
        usage={0.68}
        activeId={active}
        onNavigate={(id) => router.push(\`/\${id}\`)}
        onNewProject={() => router.push("/projects/new")}
      />
    </div>
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "lattice-feature-grid",
    name: "Lattice Feature Grid",
    block: "block-features",
    description: "A feature grid drawn on a hairline lattice. The hairlines catch a soft blue light that follows the pointer, and the tile under it plays its small illustration: colour swatches fan out, a spring ball lands and settles, a focus ring hops between buttons and a search result climbs to first place.",
    premium: false,
    registryCliName: "lattice-feature-grid",
    dependencies: ["framer-motion"],
    component: "LatticeFeatures",
    preview: "PreviewLatticeFeatureGridRedesign",
    source: "src/components/lattice-feature-grid/lattice-feature-grid.tsx",
    props: [
      {"name": "items", "type": "{ title: string; body: string; icon?: ComponentType<{ className?: string }>; visual?: ReactNode | ComponentType<{ active: boolean }> }[]", "description": "Feature tiles. A visual given as a component receives { active } while its tile is lit. Defaults to four illustrated tiles."},
      {"name": "eyebrow", "type": "string", "description": "Small label above the heading.", "defaultValue": "\"Why teams switch\""},
      {"name": "heading", "type": "string", "description": "Section heading; an empty string hides the header.", "defaultValue": "\"Everything a design system should have done for you\""},
      {"name": "autoplay", "type": "boolean", "description": "Wanders the light over the lattice and plays each tile in turn until someone points at it.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the section."}
    ],
    reactSource: `// src/app/page.tsx
"use client"; // icons and visuals are passed as components, which a server page cannot hand to a client component

import { Lock, Zap } from "lucide-react";
import { LatticeFeatures, type LatticeVisualProps } from "@/components/lattice-feature-grid";
import { motion } from "framer-motion";

// A visual can be a component: it receives { active } while its tile is lit.
function PreviewBars({ active }: LatticeVisualProps) {
  return (
    <div className="flex h-12 items-end gap-1">
      {[30, 55, 40, 80].map((h, i) => (
        <motion.span
          key={i}
          className="w-5 rounded-md bg-[#0071e3]/30"
          animate={{ height: active ? \`\${h}%\` : "20%" }}
          transition={{ type: "spring", stiffness: 300, damping: 16, delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <LatticeFeatures
      eyebrow="Platform"
      heading="Built for teams that ship every day"
      items={[
        { title: "Instant previews", body: "Every branch gets a URL in seconds.", icon: Zap, visual: PreviewBars },
        { title: "Secure by default", body: "SSO, audit logs and scoped tokens out of the box.", icon: Lock },
      ]}
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "motion-faq-disclosure",
    name: "Motion FAQ Disclosure",
    block: "block-faq-folder-card",
    description: "A two-column FAQ with a heading and support card on one side and an accessible accordion on the other. Opening a question lifts it out of the list into a raised card with a slight overshoot, spins its plus into a minus and unfolds the answer a sentence at a time.",
    premium: false,
    registryCliName: "motion-faq-disclosure",
    dependencies: ["framer-motion"],
    component: "MotionFaq",
    preview: "PreviewMotionFaqDisclosureRedesign",
    source: "src/components/motion-faq-disclosure/motion-faq-disclosure.tsx",
    props: [
      {"name": "items", "type": "{ q: string; a: string }[]", "description": "Questions and answers."},
      {"name": "heading", "type": "string", "description": "Heading on the left.", "defaultValue": "\"Questions, answered\""},
      {"name": "intro", "type": "string", "description": "Line under the heading."},
      {"name": "defaultOpen", "type": "number", "description": "Index open on first render; -1 for none.", "defaultValue": "0"},
      {"name": "multiple", "type": "boolean", "description": "Allow several answers open at once.", "defaultValue": "false"},
      {"name": "contact", "type": "{ label: string; href: string } | null", "description": "Support card; null hides it."},
      {"name": "onToggle", "type": "(index: number, open: boolean) => void", "description": "Called when a question opens or closes."},
      {"name": "autoplay", "type": "boolean", "description": "Opens each question in turn until someone touches the list.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the section."}
    ],
    reactSource: `// src/app/page.tsx

import { MotionFaq } from "@/components/motion-faq-disclosure";

export default function Page() {
  return (
    <MotionFaq
      heading="Questions, answered"
      intro="Everything people ask before they sign up."
      contact={{ label: "Talk to a human", href: "/contact" }}
      items={[
        { q: "Can I use this commercially?", a: "Yes. Personal and client work are both fine." },
        { q: "Does it work with the App Router?", a: "Every component is a typed client component built for it. Drop it into a server page and it hydrates on its own." },
        { q: "How do updates arrive?", a: "Run the install command again. You review the change like any other diff." },
      ]}
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "nebula-cta-glow",
    name: "Nebula CTA Glow",
    block: "block-cta",
    description: "A call-to-action on a twinkling night sky. Two nebulae drift after the pointer on lazy springs, gather around the button and brighten as you near it while the button leans toward you, and pressing it blooms a ring of light outward.",
    premium: true,
    registryCliName: "nebula-cta-glow",
    dependencies: ["framer-motion"],
    component: "NebulaCtaGlow",
    preview: "PreviewNebulaCtaGlowRedesign",
    source: "src/components/nebula-cta-glow/nebula-cta-glow.tsx",
    props: [
      {"name": "eyebrow", "type": "string", "description": "Small caps line above the title; empty string hides it.", "defaultValue": "\"Ready when you are\""},
      {"name": "title", "type": "string", "description": "Headline.", "defaultValue": "\"Start building faster\""},
      {"name": "description", "type": "string", "description": "Line under the headline; empty string hides it."},
      {"name": "primaryAction", "type": "{ label: string; href?: string; onClick?: () => void } | null", "description": "The bright button. Without href the click is handled by onClick only. null hides it.", "defaultValue": "{ label: \"Start building\" }"},
      {"name": "secondaryAction", "type": "{ label: string; href?: string; onClick?: () => void } | null", "description": "Quiet text link beside it. null hides it.", "defaultValue": "{ label: \"Browse components\" }"},
      {"name": "colors", "type": "[string, string]", "description": "The two nebula colours (hex, so the halo can add alpha).", "defaultValue": "[\"#0a84ff\", \"#bf5af2\"]"},
      {"name": "stars", "type": "number", "description": "Stars in the seeded canvas starfield (max 600).", "defaultValue": "140"},
      {"name": "autoplay", "type": "boolean", "description": "Drifts an invisible pointer around the button and presses it now and then until someone points at the card.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the card."}
    ],
    reactSource: `// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { NebulaCtaGlow } from "@/components/nebula-cta-glow";

export default function Page() {
  const router = useRouter();
  return (
    <NebulaCtaGlow
      eyebrow="Launch week"
      title="Ship your next idea tonight"
      description="Free while in beta. No card required."
      primaryAction={{ label: "Create a project", onClick: () => router.push("/new") }}
      secondaryAction={{ label: "Read the docs", href: "/docs" }}
      colors={["#0a84ff", "#ff375f"]}
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "editorial-blog-rail",
    name: "Editorial Blog Rail",
    block: "block-blog-content-sections",
    description: "A magazine-style blog rail: a featured story with generated cover art beside a numbered list of recent posts. Pointing at or focusing a post turns the featured slot into its preview: the cover blooms into that post's colours, the title and excerpt slide in, and the lines on the cover drift with the pointer.",
    premium: false,
    registryCliName: "editorial-blog-rail",
    dependencies: ["framer-motion"],
    component: "EditorialRail",
    preview: "PreviewEditorialBlogRailRedesign",
    source: "src/components/editorial-blog-rail/editorial-blog-rail.tsx",
    props: [
      {"name": "heading", "type": "string", "description": "Section heading.", "defaultValue": "\"From the journal\""},
      {"name": "allHref", "type": "string", "description": "Link for View all.", "defaultValue": "\"#\""},
      {"name": "featured", "type": "EditorialPost", "description": "The featured story (title, category, date, readTime, excerpt, author, cover colours, href)."},
      {"name": "posts", "type": "EditorialPost[]", "description": "Stories in the numbered rail; each can carry its own excerpt, author and cover colours for its preview."},
      {"name": "autoplay", "type": "boolean", "description": "Previews each story in the featured slot in turn until someone points at the rail.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the section."}
    ],
    reactSource: `// src/app/page.tsx

import { EditorialRail } from "@/components/editorial-blog-rail";

export default function Page() {
  return (
    <EditorialRail
      heading="From the journal"
      allHref="/blog"
      featured={{
        title: "Designing scroll choreography that people actually feel",
        category: "Guide",
        date: "Oct 14",
        readTime: "12 min read",
        excerpt: "How we stage scroll-linked motion so it explains the product.",
        author: { name: "Mara Okafor" },
        cover: ["#0071e3", "#bf5af2"],
        href: "/blog/scroll-choreography",
      }}
      posts={[
        { title: "Springs, not curves", category: "Craft", date: "Oct 09", readTime: "7 min", href: "/blog/springs", cover: ["#ff9f0a", "#ff375f"] },
        { title: "Shipping a design system in six weeks", category: "Case study", date: "Oct 02", readTime: "9 min", href: "/blog/six-weeks" },
        { title: "The quiet power of a 1px hairline", category: "Details", date: "Sep 26", readTime: "4 min", href: "/blog/hairlines" },
      ]}
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "split-contact-glass",
    name: "Split Contact Glass",
    block: "block-contact-page",
    description: "A contact section in two panes: a glass panel with the team's local time on a springy analog clock, a one-tap copyable email and the reply time, and a form with name, email, topic chips and a message whose count ring fills as you type. Sending launches the paper plane off the button and swaps the form for a thank-you.",
    premium: false,
    registryCliName: "split-contact-glass",
    dependencies: ["framer-motion"],
    component: "SplitContact",
    preview: "PreviewSplitContactGlassRedesign",
    source: "src/components/split-contact-glass/split-contact-glass.tsx",
    props: [
      {"name": "heading", "type": "string", "description": "Heading on the glass panel.", "defaultValue": "\"Let's build something good\""},
      {"name": "intro", "type": "string", "description": "Line under the heading; empty string hides it."},
      {"name": "email", "type": "string", "description": "Contact email; the card copies it to the clipboard.", "defaultValue": "\"hello@studio.dev\""},
      {"name": "location", "type": "string", "description": "Shown above the local time.", "defaultValue": "\"Lisbon, Portugal\""},
      {"name": "timeZone", "type": "string", "description": "IANA zone for the live clock (read on the client only).", "defaultValue": "\"Europe/Lisbon\""},
      {"name": "replyTime", "type": "string", "description": "Response-time note.", "defaultValue": "\"Replies within a day\""},
      {"name": "topics", "type": "string[]", "description": "Topic chips; the first is selected by default."},
      {"name": "onSubmit", "type": "(values: { name: string; email: string; topic: string; message: string }) => Promise<void> | void", "description": "Called after local validation. A promise shows the sending state; throw an Error to show its message. Without it the form simulates a send."},
      {"name": "maxLength", "type": "number", "description": "Message character limit; the ring turns orange past 90%.", "defaultValue": "500"},
      {"name": "autoplay", "type": "boolean", "description": "Fills in and sends a demo message on a loop until someone touches the form.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the section."}
    ],
    reactSource: `// src/app/page.tsx
"use client";

import { SplitContact, type SplitContactValues } from "@/components/split-contact-glass";

async function sendToInbox(values: SplitContactValues) {
  // Forward the message to your CRM or email service here. Throw an Error to show its message.
  console.log("new message", values);
}

export default function Page() {
  return (
    <SplitContact
      email="hello@studio.dev"
      location="Lisbon, Portugal"
      timeZone="Europe/Lisbon"
      topics={["Custom work", "Partnership", "Support"]}
      onSubmit={sendToInbox}
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "dot-grid-hero",
    name: "Interactive Dot Grid Hero",
    block: "block-hero",
    description: "A hero over a field of coloured dashes that behave like iron filings round a magnet: near the pointer they swing to point at it, grow and get pushed aside, then wobble back to their own heading. Click anywhere and a ripple rolls out, kicking and spinning the dashes it passes.",
    premium: true,
    registryCliName: "dot-grid-hero",
    dependencies: ["framer-motion"],
    component: "DotGridHero",
    preview: "PreviewDotGridHeroRedesign",
    source: "src/components/dot-grid-hero/dot-grid-hero.tsx",
    props: [
      {"name": "title", "type": "string", "description": "Hero heading. Use \\n for line breaks.", "defaultValue": "\"Build interfaces\\nthat ship.\""},
      {"name": "subtitle", "type": "string", "description": "Supporting paragraph under the heading."},
      {"name": "primaryCTA", "type": "CTAButton", "description": "{ label, href?, onClick? }: the filled pill."},
      {"name": "secondaryCTA", "type": "CTAButton", "description": "{ label, href?, onClick? }: the text link with a chevron."},
      {"name": "dotGap", "type": "number", "description": "Average spacing between dashes in px.", "defaultValue": "44"},
      {"name": "interactionRadius", "type": "number", "description": "Radius in px where dashes turn and get pushed.", "defaultValue": "140"},
      {"name": "repulsionStrength", "type": "number", "description": "How hard the pointer pushes dashes away.", "defaultValue": "5"},
      {"name": "springK", "type": "number", "description": "Spring pulling dashes back to their spot, per frame.", "defaultValue": "0.06"},
      {"name": "damping", "type": "number", "description": "Velocity kept per frame, 0 to 1. Lower settles faster.", "defaultValue": "0.82"},
      {"name": "colors", "type": "string[]", "description": "Dash colours.", "defaultValue": "6 system colours"},
      {"name": "background", "type": "string", "description": "Hero background. Defaults to white, or black in dark mode."},
      {"name": "textColor", "type": "string", "description": "Heading colour. Defaults to the theme's text colour."},
      {"name": "hint", "type": "string", "description": "Caption at the bottom edge. Pass an empty string to hide it.", "defaultValue": "\"Move to steer the field. Click to send a ripple.\""},
      {"name": "autoplay", "type": "boolean", "description": "Sweeps a pretend pointer through the field and sends a ripple every few seconds until someone moves over it.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes on the section."}
    ],
    reactSource: `// src/app/page.tsx

import { DotGridHero } from "@/components/dot-grid-hero";

export default function Page() {
  return (
    <DotGridHero
      title={"Design systems\\nthat move."}
      subtitle="Components, blocks and templates with motion built in."
      primaryCTA={{ label: "Get started", href: "/docs" }}
      secondaryCTA={{ label: "Browse components", href: "/components" }}
      colors={["#0a84ff", "#5e5ce6", "#64d2ff"]}
      dotGap={40}
      className="min-h-[620px]"
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "starfield-hero",
    name: "Interactive Starfield Hero",
    block: "block-hero",
    description: "A hero set in a deep 3D starfield drawn on canvas: stars drift toward you, the vanishing point leans toward the pointer and stars near it brighten. Press and hold anywhere, or the Warp button, to jump to warp; on release the field brakes past a standstill, recoils a touch and settles.",
    premium: true,
    registryCliName: "starfield-hero",
    dependencies: ["framer-motion"],
    component: "InteractiveStarfieldHero",
    preview: "PreviewStarfieldHeroRedesign",
    source: "src/components/starfield-hero/starfield-hero.tsx",
    props: [
      {"name": "title", "type": "string", "description": "Heading. Use \\n for a line break; the second line is dimmed.", "defaultValue": "\"Ship faster.\\nBuild better.\""},
      {"name": "subtitle", "type": "string", "description": "Supporting paragraph under the heading."},
      {"name": "primaryCTA", "type": "CTAConfig", "description": "{ label, href?, onClick? }: the white pill."},
      {"name": "secondaryCTA", "type": "CTAConfig", "description": "{ label, href?, onClick? }: the glass pill."},
      {"name": "particleCount", "type": "number", "description": "Number of stars.", "defaultValue": "300"},
      {"name": "interactionRadius", "type": "number", "description": "Stars within this many px of the pointer brighten toward activeColor.", "defaultValue": "140"},
      {"name": "particleColor", "type": "string", "description": "Resting star colour. Any CSS colour.", "defaultValue": "\"#9fc6ff\""},
      {"name": "activeColor", "type": "string", "description": "Star colour near the pointer and at full warp.", "defaultValue": "\"#ffffff\""},
      {"name": "speed", "type": "number", "description": "How snappy the warp and steering feel: 0.1 (dreamlike) to 1 (snappy).", "defaultValue": "0.5"},
      {"name": "warpLabel", "type": "string", "description": "Label of the hold-to-warp button. Pass an empty string to hide it.", "defaultValue": "\"Hold to warp\""},
      {"name": "autoplay", "type": "boolean", "description": "Jumps to warp every few seconds until someone touches the hero.", "defaultValue": "false"},
      {"name": "children", "type": "ReactNode", "description": "Replaces the default hero content."},
      {"name": "className", "type": "string", "description": "Extra classes on the section."}
    ],
    reactSource: `// src/app/page.tsx

import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export default function Page() {
  return (
    <InteractiveStarfieldHero
      title={"Launch day.\\nEvery day."}
      subtitle="Release notes, changelogs and status pages that look as good as your product."
      primaryCTA={{ label: "Start free", href: "/signup" }}
      secondaryCTA={{ label: "See examples", href: "/examples" }}
      particleColor="#a5b4fc"
      particleCount={420}
      speed={0.6}
      className="min-h-[640px]"
    />
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "shooting-stars-grid",
    name: "Shooting Stars Grid",
    block: "block-hero",
    description: "A hero grid where shooting stars run along the lines, sometimes turning a corner at a node and lighting each node they cross. Move over it and a spotlight follows the pointer while the stars turn toward you at every node; it adapts to light and dark mode.",
    premium: true,
    registryCliName: "shooting-stars-grid",
    dependencies: ["framer-motion"],
    component: "ShootingStarsGrid",
    preview: "PreviewShootingStarsGridRedesign",
    source: "src/components/shooting-stars-grid/shooting-stars-grid.tsx",
    props: [
      {"name": "children", "type": "ReactNode", "description": "Content over the grid. Defaults to a short hero."},
      {"name": "starCount", "type": "number", "description": "Twinkling background stars.", "defaultValue": "48"},
      {"name": "shootingStarCount", "type": "number", "description": "Shooting stars running at once.", "defaultValue": "6"},
      {"name": "gridSize", "type": "number", "description": "Grid cell size in px.", "defaultValue": "44"},
      {"name": "speed", "type": "\"slow\" | \"normal\" | \"fast\" | number", "description": "Preset, or a duration multiplier where higher is slower.", "defaultValue": "\"normal\""},
      {"name": "glow", "type": "boolean", "description": "Glow round the heads, the lit nodes and the pointer spotlight.", "defaultValue": "true"},
      {"name": "className", "type": "string", "description": "Extra classes on the section."},
      {"name": "contentClassName", "type": "string", "description": "Classes for the content wrapper."},
      {"name": "showGrid", "type": "boolean", "description": "Draw the grid lines.", "defaultValue": "true"},
      {"name": "showStaticStars", "type": "boolean", "description": "Draw the twinkling stars.", "defaultValue": "true"},
      {"name": "reducedMotionFallback", "type": "boolean", "description": "With reduced motion, draw one still frame instead of animating.", "defaultValue": "true"},
      {"name": "interactive", "type": "boolean", "description": "Spotlight under the pointer; stars steer toward it.", "defaultValue": "true"},
      {"name": "autoplay", "type": "boolean", "description": "Steers the stars round a pretend pointer until someone moves over the grid.", "defaultValue": "false"}
    ],
    reactSource: `// src/app/page.tsx

import { ShootingStarsGrid } from "@/components/shooting-stars-grid";

export default function Page() {
  return (
    <ShootingStarsGrid shootingStarCount={7} gridSize={48} className="min-h-[560px]">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-5xl font-semibold tracking-[-0.045em]">Ship the launch page tonight.</h1>
        <p className="mt-4 text-[15px] text-[#6e6e73] dark:text-[#a1a1a6]">Templates, blocks and components that already move.</p>
      </div>
    </ShootingStarsGrid>
  );
}`,
    tailwindSource: "",
  },
  {
    slug: "animated-bento-grid",
    name: "Animated Bento Grid",
    block: "block-why-choose-us",
    description: "A grid of stat tiles whose digits roll in like odometers when the grid scrolls into view. Hovering or focusing a tile lifts it and spins its digits a full turn before they land with a small overshoot; tiles come plain, frosted glass, with a border that lights under the pointer, or with a spotlight.",
    premium: true,
    registryCliName: "animated-bento-grid",
    dependencies: ["framer-motion"],
    component: "AnimatedBentoGrid",
    preview: "PreviewAnimatedBentoGridRedesign",
    source: "src/components/animated-bento-grid/animated-bento-grid.tsx",
    props: [
      {"name": "items", "type": "BentoItem[]", "description": "Tiles: id, label, value (digits roll), optional icon, accent, span (\"1x1\" | \"2x1\" | \"1x2\" | \"2x2\") and trend { value, label }. Defaults to five sample stats."},
      {"name": "variant", "type": "\"default\" | \"glass\" | \"gradient-border\" | \"spotlight\"", "description": "Surface treatment for every tile.", "defaultValue": "\"default\""},
      {"name": "columns", "type": "2 | 3 | 4", "description": "Columns at full width; narrow containers drop to two.", "defaultValue": "3"},
      {"name": "animated", "type": "boolean", "description": "Roll the numbers in on scroll and spin them on hover.", "defaultValue": "true"},
      {"name": "staggerDelay", "type": "number", "description": "Extra delay before the first tile, in seconds.", "defaultValue": "0"},
      {"name": "autoplay", "type": "boolean", "description": "Lifts and spins each tile in turn until someone touches the grid.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes for the grid."},
      {"name": "itemClassName", "type": "string", "description": "Extra classes for every tile wrapper."}
    ],
    reactSource: `// src/app/page.tsx

import { AnimatedBentoGrid, type BentoItem } from "@/components/animated-bento-grid";

const items: BentoItem[] = [
  { id: "mrr", label: "Monthly revenue", value: "$84,210", span: "2x1", trend: { value: 12.4, label: "vs last month" } },
  { id: "churn", label: "Churn", value: "1.8%", accent: "#ff3b30", trend: { value: -0.3, label: "MoM" } },
  { id: "seats", label: "Active seats", value: "3,214", accent: "#bf5af2" },
  { id: "nps", label: "NPS", value: "72", span: "2x1", accent: "#30d158", trend: { value: 4, label: "this quarter" } },
];

export default function Page() {
  return <AnimatedBentoGrid items={items} columns={3} variant="spotlight" />;
}`,
    tailwindSource: "",
  },
  {
    slug: "bento-grid-skeleton",
    name: "Bento Grid Skeleton",
    block: "block-why-choose-us",
    description: "A bento of loading cards, each with a small placeholder scene: a chat thread, a bar chart, a team, a workflow, a calendar or code. One band of light sweeps the whole grid at once instead of each card separately, and pointing at a card plays its scene: bubbles pop in, bars regrow, faces fan out, steps connect, the free slot hops and lines type out.",
    premium: true,
    registryCliName: "bento-grid-skeleton",
    dependencies: ["framer-motion"],
    component: "BentoGridSkeleton",
    preview: "PreviewBentoGridSkeletonRedesign",
    source: "src/components/bento-grid-skeleton/bento-grid-skeleton.tsx",
    props: [
      {"name": "cards", "type": "BentoSkeletonCard[]", "description": "Cards: id, title, description, optional tag, span (\"1x1\" | \"2x1\" | \"1x2\" | \"2x2\") and skeletonType (\"chat\" | \"dashboard\" | \"avatar\" | \"workflow\" | \"calendar\" | \"code\"). Defaults to one of each."},
      {"name": "animated", "type": "boolean", "description": "Run the shimmer and the scene loops.", "defaultValue": "true"},
      {"name": "autoplay", "type": "boolean", "description": "Plays each card's scene in turn until someone points at the grid.", "defaultValue": "false"},
      {"name": "className", "type": "string", "description": "Extra classes for the grid wrapper."}
    ],
    reactSource: `// src/app/page.tsx
"use client"; // it keeps loading state, so this page runs in the browser

import { useEffect, useState } from "react";
import { BentoGridSkeleton, type BentoSkeletonCard } from "@/components/bento-grid-skeleton";

const cards: BentoSkeletonCard[] = [
  { id: "inbox", title: "Inbox", description: "Conversations stream in while the thread loads.", tag: "Live", span: "2x1", skeletonType: "chat" },
  { id: "stats", title: "This week", description: "Charts settle before the numbers arrive.", tag: "Stats", skeletonType: "dashboard" },
  { id: "deploys", title: "Deploy pipeline", description: "Each step lights up as it connects.", tag: "CI", skeletonType: "workflow" },
  { id: "diff", title: "Latest diff", description: "Lines type themselves out.", tag: "Code", span: "2x1", skeletonType: "code" },
];

export default function Page() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 2500); // swap for your own loading state
    return () => window.clearTimeout(id);
  }, []);

  return ready ? <p>Your real content goes here.</p> : <BentoGridSkeleton cards={cards} />;
}`,
    tailwindSource: "",
  },
  {
    slug: "scrolling-testimonials",
    name: "Scrolling Testimonials",
    block: "block-social-proof",
    description: "A wall of testimonials scrolling in columns at different speeds, faded at the top and bottom. Hover and the wall glides to a stop while the card under the pointer stays lit; wheel or drag over it and the columns take the push, lean with the speed and coast back to cruising.",
    premium: true,
    registryCliName: "scrolling-testimonials",
    dependencies: ["framer-motion"],
    component: "ScrollingTestimonials",
    preview: "PreviewScrollingTestimonialsRedesign",
    source: "src/components/scrolling-testimonials/scrolling-testimonials.tsx",
    props: [
      {"name": "testimonials", "type": "Testimonial[]", "description": "Cards: { id, quote, name, role, company?, avatar?, rating? }.", "defaultValue": "DEFAULT_SCROLLING_TESTIMONIALS"},
      {"name": "columns", "type": "1 | 2 | 3", "description": "Number of columns. Narrow containers drop to fewer.", "defaultValue": "3"},
      {"name": "speed", "type": "number", "description": "Time in ms for the first column to scroll through once. Lower is faster.", "defaultValue": "32000"},
      {"name": "columnSpeeds", "type": "number[]", "description": "Per-column loop times in ms; overrides speed for each index given."},
      {"name": "reverseColumns", "type": "boolean[]", "description": "Per-column direction; true scrolls that column downward.", "defaultValue": "[false, true, false]"},
      {"name": "pauseOnHover", "type": "boolean", "description": "Ease the wall to a stop while the pointer is over it.", "defaultValue": "true"},
      {"name": "height", "type": "number", "description": "Height of the moving wall in px.", "defaultValue": "420"},
      {"name": "showHeader", "type": "boolean", "description": "Show the badge, title and subtitle above the wall.", "defaultValue": "true"},
      {"name": "badge / title / subtitle", "type": "string", "description": "Header text."},
      {"name": "showStars", "type": "boolean", "description": "Draw each card's rating as stars.", "defaultValue": "true"},
      {"name": "fadeMask", "type": "boolean", "description": "Fade the wall out at its top and bottom edges.", "defaultValue": "true"},
      {"name": "autoplay", "type": "boolean", "description": "Flings the wall up and down every few seconds until someone touches it.", "defaultValue": "false"},
      {"name": "cardBackground / borderColor / textColor / mutedTextColor / backgroundColor", "type": "string", "description": "Optional colour overrides; by default it follows light and dark mode."}
    ],
    reactSource: `// src/app/page.tsx

import { ScrollingTestimonials } from "@/components/scrolling-testimonials";

const reviews = [
  { id: "1", quote: "Shipped the marketing site in a weekend.", name: "Lena Moritz", role: "Design lead", company: "Halcyon", rating: 5 },
  { id: "2", quote: "Our designers stopped writing animation specs.", name: "Kwame Asante", role: "Staff engineer", company: "Ferrous", rating: 5 },
  { id: "3", quote: "Pricing page conversion went up 18%.", name: "Ines Duarte", role: "Growth", company: "Ledgerly", rating: 5 },
  { id: "4", quote: "Two sprints saved on dark mode alone.", name: "Marcus Bell", role: "Founder", company: "Papertrail Co", rating: 5 },
  { id: "5", quote: "The first UI kit I actually kept.", name: "Theo Laurent", role: "Frontend lead", company: "Quarry", rating: 5 },
  { id: "6", quote: "Clients keep asking how we built it.", name: "Nadia Petrova", role: "Studio owner", company: "Fieldhouse", rating: 4 },
];

export default function Page() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <ScrollingTestimonials testimonials={reviews} title="Loved by product teams" height={520} speed={28000} />
    </section>
  );
}`,
    tailwindSource: "",
  },
];

export function getMovedSection(slug: string) {
  return movedSections.find((s) => s.slug === slug) ?? null;
}

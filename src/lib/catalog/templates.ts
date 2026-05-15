export type TemplateDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type TemplateCategory =
  | "SaaS"
  | "AI Startup"
  | "Portfolio"
  | "Dashboard"
  | "Agency"
  | "Productivity"
  | "Developer Portfolio"
  | "Startup Landing Pages"
  | "AI Tools"
  | "Creator Websites";

export type MarketplaceTemplate = {
  slug: string;
  title: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  difficulty: TemplateDifficulty;
  premium: boolean;
  trendingScore: number;
  createdAt: string;
  techStack: string[];
  pages: string[];
  sections: string[];
  features: string[];
  pageLabels: string[];
};

export const templates: MarketplaceTemplate[] = [
  {
    slug: "saas-launch-aurora",
    title: "Aurora SaaS Launch",
    description: "Hero, social proof, bento metrics, and pricing toggle tuned for B2B launches.",
    category: "SaaS",
    tags: ["launch", "b2b", "metrics"],
    difficulty: "Intermediate",
    premium: true,
    trendingScore: 120,
    createdAt: "2026-04-30",
    techStack: ["Next.js", "Tailwind", "Framer Motion", "Supabase"],
    pages: ["/", "/pricing", "/changelog", "/login"],
    sections: ["Hero", "Logo cloud", "Bento", "Testimonials", "Pricing", "FAQ", "CTA"],
    pageLabels: ["Landing", "Pricing", "Changelog", "Login"],
    features: [
      "Animated hero with particle physics",
      "Social proof logo carousel",
      "Bento metrics grid with motion",
      "Pricing toggle (monthly / annual)",
      "Testimonial scroll rail",
      "SEO-optimised metadata",
      "Dark mode + light mode",
      "Fully responsive layout",
    ],
  },
  {
    slug: "ai-startup-forge",
    title: "Forge AI Startup",
    description: "Copilot-forward narrative with prompt rail, model trust, and motion FAQ.",
    category: "AI Startup",
    tags: ["ai", "copilot", "launch"],
    difficulty: "Advanced",
    premium: true,
    trendingScore: 132,
    createdAt: "2026-05-08",
    techStack: ["Next.js", "MDX", "Motion", "Stripe"],
    pages: ["/", "/product", "/security", "/signup"],
    sections: ["Hero", "AI demo", "Integrations", "Security", "Pricing", "FAQ"],
    pageLabels: ["Home", "Product", "Security", "Sign Up"],
    features: [
      "Prompt rail interactive demo",
      "Model trust + security section",
      "Stripe payment integration",
      "MDX-powered docs pages",
      "Motion FAQ accordion",
      "Integrations grid",
      "Type-safe with TypeScript",
      "Edge-ready deployment",
    ],
  },
  {
    slug: "dev-portfolio-vector",
    title: "Vector Dev Portfolio",
    description: "Case-study grid with editorial blog rail and crisp typography rhythm.",
    category: "Developer Portfolio",
    tags: ["personal", "case-study"],
    difficulty: "Beginner",
    premium: false,
    trendingScore: 94,
    createdAt: "2026-03-20",
    techStack: ["Next.js", "Tailwind", "MDX"],
    pages: ["/", "/work", "/writing", "/contact"],
    sections: ["Hero", "Selected work", "Stack", "Writing", "Contact"],
    pageLabels: ["Home", "Work", "Writing", "Contact"],
    features: [
      "Case-study project grid",
      "MDX-powered blog with syntax highlighting",
      "Tech stack showcase",
      "Contact form with validation",
      "Clean typographic hierarchy",
      "Smooth page transitions",
      "Accessible by default",
      "Zero external UI library dependencies",
    ],
  },
  {
    slug: "agency-studio-deck",
    title: "Studio Deck Agency",
    description: "Layered glass hero, services bento, and magnetic CTAs for creative shops.",
    category: "Agency",
    tags: ["creative", "pitch"],
    difficulty: "Intermediate",
    premium: true,
    trendingScore: 88,
    createdAt: "2026-04-02",
    techStack: ["Next.js", "Motion", "Sanity-ready"],
    pages: ["/", "/work", "/services", "/contact"],
    sections: ["Hero", "Services", "Case studies", "Process", "CTA"],
    pageLabels: ["Home", "Work", "Services", "Contact"],
    features: [
      "Layered glassmorphism hero",
      "Services bento grid",
      "Magnetic CTA hover effects",
      "Case studies with hover reveal",
      "Sanity CMS-ready schema",
      "Process step timeline",
      "Fluid scroll choreography",
      "Custom cursor effects",
    ],
  },
  {
    slug: "dashboard-aurora-analytics",
    title: "Aurora Analytics Dashboard",
    description: "App shell with KPI strip, charts placeholders, and responsive sidebar.",
    category: "Dashboard",
    tags: ["app", "analytics"],
    difficulty: "Advanced",
    premium: true,
    trendingScore: 101,
    createdAt: "2026-04-18",
    techStack: ["Next.js", "Supabase", "Tailwind"],
    pages: ["/app", "/app/reports", "/app/settings"],
    sections: ["Sidebar", "KPIs", "Charts", "Table", "Filters"],
    pageLabels: ["Dashboard", "Reports", "Settings"],
    features: [
      "Responsive collapsible sidebar",
      "KPI strip with delta indicators",
      "Chart placeholder slots",
      "Filterable data table",
      "Supabase auth integration",
      "Role-based access patterns",
      "Real-time update hooks",
      "Mobile-responsive app shell",
    ],
  },
  {
    slug: "productivity-orbit-suite",
    title: "Orbit Productivity Suite",
    description: "Dense but calm workspace marketing page with feature triage columns.",
    category: "Productivity",
    tags: ["workspace", "collab"],
    difficulty: "Intermediate",
    premium: false,
    trendingScore: 76,
    createdAt: "2026-02-28",
    techStack: ["Next.js", "Tailwind"],
    pages: ["/", "/product", "/pricing"],
    sections: ["Hero", "Feature columns", "Integrations", "Pricing"],
    pageLabels: ["Home", "Product", "Pricing"],
    features: [
      "Feature triage column layout",
      "Integrations grid",
      "Clean pricing section",
      "Calm, high-density typography",
      "Mobile-first responsive",
      "Zero motion-sickness design",
      "Accessible colour contrast",
      "Fast initial load",
    ],
  },
  {
    slug: "simplistic-saas-template",
    title: "Simplistic AI SaaS",
    description: "Deploy AI agents that work while you sleep. Features an immersive app layout dashboard, custom logo track, asymmetrical feature bento, multi-device matrix, and interactive hooks.",
    category: "SaaS",
    tags: ["saas", "ai", "agents", "autonomous", "bento", "mockup"],
    difficulty: "Intermediate",
    premium: true,
    trendingScore: 150,
    createdAt: "2026-05-15",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS v4", "Framer Motion", "Lucide Icons"],
    pages: ["/", "/pricing", "/resources", "/login"],
    sections: [
      "Navigation Bar",
      "AI Agent Hero",
      "Client Trust Array",
      "Asymmetrical Feature Bento",
      "Deployment Strip",
      "Customer Testimonials",
      "Device Capabilities Matrix",
      "Tiered Pricing",
      "FAQ Accordion",
      "CTA Pre-Footer",
    ],
    pageLabels: ["Hero", "Pricing", "Resources", "Login"],
    features: [
      "AI agent hero with live motion effects",
      "Asymmetrical bento feature grid",
      "Multi-device capability matrix",
      "Logo marquee trust strip",
      "Tiered pricing with toggle",
      "FAQ accordion with spring physics",
      "Tailwind CSS v4 design tokens",
      "Framer Motion microinteractions",
      "TypeScript strict mode",
      "Fully responsive on all viewports",
    ],
  },
  {
    slug: "orbit-ai-page",
    title: "Orbit AI Developer Tool",
    description: "A futuristic, minimal, dark-mode-first landing page tailored for AI coding agents and advanced developer platforms.",
    category: "AI Tools",
    tags: ["ai", "agents", "developer", "futuristic", "dark-mode", "terminal"],
    difficulty: "Advanced",
    premium: true,
    trendingScore: 185,
    createdAt: "2026-05-15",
    techStack: ["Next.js", "Tailwind CSS", "Framer Motion", "Lucide Icons"],
    pages: ["/", "/docs", "/pricing", "/features"],
    sections: [
      "Transparent Navbar",
      "Typewriter Hero",
      "Workspace Mockup",
      "Agent Workflow Steps",
      "Feature Grid",
      "Split Showcase",
      "CTA Gradient Section",
      "Minimal Footer",
    ],
    pageLabels: ["Hero", "Features", "Showcase", "CTA"],
    features: [
      "Dark-mode-first futuristic aesthetic",
      "Framer motion workspace 3D mockup",
      "Typewriter headline effects",
      "Agent workflow indicator animations",
      "Bento feature grid",
      "Responsive container queries",
    ],
  },
];

export function getTemplate(slug: string) {
  return templates.find((t) => t.slug === slug) ?? null;
}

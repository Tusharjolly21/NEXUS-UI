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
    techStack: ["Next.js", "Tailwind CSS v4", "Framer Motion", "Lucide Icons"],
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
  },
];

export function getTemplate(slug: string) {
  return templates.find((t) => t.slug === slug) ?? null;
}

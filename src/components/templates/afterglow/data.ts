export const BRAND = { name: "Afterglow" };

export const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const HERO = {
  badge: "Release diffs for every deploy",
  title: ["See what every release", "actually changed."],
  body: "Afterglow lines up each deploy with the metrics that moved after it, so you know within minutes whether a change helped, hurt, or did nothing at all.",
  primary: "Start free",
  secondary: "Book a demo",
  note: "Free for one project. No card needed.",
};

export const CUSTOMER_NAMES = [
  "Arcwell",
  "Basalt",
  "Corvid",
  "Driftline",
  "Emberly",
  "Fieldnote",
  "Glasshouse",
  "Kestrel",
  "Lumora",
  "Oakhaven",
];

export const STEPS = [
  {
    title: "Connect your repo",
    body: "One command adds a deploy hook and the tracking snippet. Nothing to tag by hand.",
  },
  {
    title: "Ship the way you already do",
    body: "Every merge to main becomes a marker on your charts, with the pull requests that went into it.",
  },
  {
    title: "Read what changed",
    body: "Within minutes you get a plain summary: which metrics moved, by how much, and how sure we are.",
  },
];

export const INSTALL_COMMAND = "npx afterglow init";

export const PRODUCT = {
  title: "Everything after the deploy button",
  body: "Charts tell you something moved. Afterglow tells you which release moved it.",
  diff: {
    title: "Release diffs",
    body: "Drag across any release to compare the days before and after it, on any metric you track.",
  },
  alerts: {
    title: "Alerts that know what shipped",
    body: "When a number drops, the alert names the release behind it and offers the rollback.",
  },
  funnels: {
    title: "Funnels by release",
    body: "Compare a funnel across two versions side by side and see the step that broke.",
  },
  replays: {
    title: "Replays, filtered by change",
    body: "Watch sessions that hit the code you just changed, not a random sample.",
  },
  stack: {
    title: "Fits the tools you have",
    body: "Deploy hooks for every major host, alerts in your team chat, issues straight to your tracker.",
  },
};

export const TRAIL = {
  title: "Every release leaves a trail.",
  body: "Afterglow follows each change from the commit to the customer, and back to the number on your dashboard.",
  stats: [
    { value: "4 min", label: "from deploy to first read" },
    { value: "92%", label: "of regressions caught before support hears" },
    { value: "38", label: "metrics tracked per release by default" },
  ],
};

export const TESTIMONIALS = {
  title: "Teams that stopped guessing",
  items: [
    {
      name: "Maya Chen",
      role: "Head of product, Lumora",
      quote:
        "We used to argue for a week about whether a launch worked. Now the answer is waiting before standup.",
      mark: "waiting before standup",
      hue: 28,
    },
    {
      name: "Daniel Okafor",
      role: "CTO, Fieldnote",
      quote:
        "The first alert caught a broken checkout eleven minutes after deploy. It named the pull request.",
      mark: "named the pull request",
      hue: 18,
    },
    {
      name: "Sofia Marquez",
      role: "Founder, Parcel and Pine",
      quote: "Signups went up after the new onboarding and we could finally prove it was the onboarding.",
      metric: { value: "+14%", label: "signups after one release" },
      hue: 36,
    },
    {
      name: "Arjun Mehta",
      role: "Staff engineer, Quillstack",
      quote: "Setup took one command and one coffee. We had markers on our charts the same afternoon.",
      mark: "one command",
      hue: 22,
    },
    {
      name: "Lena Fischer",
      role: "Growth lead, Tidewater",
      quote: "Funnels by release is the feature I did not know I needed. The broken step jumps out.",
      mark: "jumps out",
      hue: 30,
    },
    {
      name: "Kenji Watanabe",
      role: "Product designer, Orbitly",
      quote: "I watch replays of people using the exact screen I changed. It has made me a better designer.",
      hue: 14,
    },
    {
      name: "Amara Nwosu",
      role: "PM, Cobalt Labs",
      quote: "Our release notes now come with numbers. Leadership reads them now.",
      hue: 40,
    },
    {
      name: "Lucas Moreau",
      role: "Engineering lead, Glasshouse",
      quote: "Rollbacks went from a debate to a button.",
      metric: { value: "6x", label: "faster to roll back a bad release" },
      hue: 24,
    },
    {
      name: "Priya Nair",
      role: "Solo founder",
      quote: "I ship alone. Afterglow is the teammate who tells me when I broke something.",
      mark: "when I broke something",
      hue: 32,
    },
    {
      name: "Noah Bennett",
      role: "EM, Driftline",
      quote: "Confidence scores stopped us celebrating noise. Half our wins were not wins.",
      hue: 20,
    },
    {
      name: "Elif Yilmaz",
      role: "Founder, Kiln",
      quote: "The weekly summary is the only analytics email anyone on my team opens.",
      mark: "anyone on my team opens",
      hue: 34,
    },
    {
      name: "Marcus Hale",
      role: "VP engineering, Ledgerly",
      quote: "It answers one question really well, and it is the question we ask most.",
      hue: 26,
    },
  ],
};

export const PRICING = {
  title: "Priced per project, not per seat",
  body: "Invite the whole team on every plan. Pay for the projects you track.",
  plans: [
    {
      name: "Hobby",
      blurb: "For side projects and trying it out",
      monthly: 0,
      annual: 0,
      cta: "Start free",
      features: ["1 project", "30 days of history", "Release markers and diffs", "Email alerts"],
    },
    {
      name: "Team",
      blurb: "For product teams shipping every week",
      monthly: 29,
      annual: 24,
      cta: "Start 14-day trial",
      featured: true,
      features: [
        "5 projects",
        "1 year of history",
        "Funnels by release",
        "Chat and issue tracker alerts",
        "Session replays, 5,000 a month",
      ],
    },
    {
      name: "Scale",
      blurb: "For many teams and many deploys a day",
      monthly: 99,
      annual: 82,
      cta: "Start 14-day trial",
      features: [
        "Unlimited projects",
        "3 years of history",
        "Custom metrics and events",
        "Rollback from alerts",
        "Session replays, 50,000 a month",
        "SSO",
      ],
    },
  ],
  enterprise: {
    title: "Enterprise",
    body: "Self-hosting, data residency, audit logs and a named engineer.",
    cta: "Talk to us",
  },
};

export const FAQ = {
  title: "Questions, answered",
  body: "Anything else, write to us and a person replies within a working day.",
  items: [
    {
      q: "How does Afterglow know when I release?",
      a: "The init command adds a small deploy hook to your CI. Every successful deploy sends us the commit range, so each marker on your charts lists the pull requests that went into it.",
    },
    {
      q: "Do I need to replace my current analytics?",
      a: "No. You can keep your current tool and send its events to us, or use our snippet. Most teams run both for a month and then decide.",
    },
    {
      q: "How do you decide a change is real and not noise?",
      a: "We compare the same hours and weekdays before and after a release and show a confidence score. Below 80% we say the change is unclear rather than call it a win.",
    },
    {
      q: "What happens to my data?",
      a: "Events are stored in the region you choose. We never sell data or use it to train models, and you can export or delete everything at any time.",
    },
    {
      q: "Can I invite my whole team?",
      a: "Yes, seats are free on every plan. You pay for projects, so designers, support and leadership can all read the results.",
    },
    {
      q: "Can I cancel any time?",
      a: "Yes. Plans are monthly or yearly and you can downgrade to Hobby whenever you like. Your history stays readable for 30 days after.",
    },
  ],
};

export const CTA = {
  title: "Know what your last release did.",
  body: "Connect a project in two minutes and see your next deploy line up with the numbers.",
  primary: "Start free",
  secondary: "Book a demo",
};

export const FOOTER = {
  blurb: "Release analytics for teams who ship every week.",
  columns: [
    { title: "Product", links: ["Release diffs", "Alerts", "Funnels", "Replays", "Changelog"] },
    { title: "Company", links: ["About", "Customers", "Careers", "Contact"] },
    { title: "Resources", links: ["Docs", "Guides", "API", "Status"] },
    { title: "Legal", links: ["Terms", "Privacy", "Security"] },
  ],
  copyright: "© 2026 Afterglow Inc.",
};

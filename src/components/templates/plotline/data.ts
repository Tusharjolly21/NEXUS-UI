import type { IconName } from "./ui";

/** [label, section id] */
export const NAV_LINKS: [label: string, section: string][] = [
  ["Product", "product"],
  ["Pricing", "pricing"],
  ["Customers", "customers"],
  ["Changelog", "changelog"],
  ["Contact", "contact"],
];

/** The months the timeline mock spans: [name, days] */
export const MONTHS: [name: string, days: number][] = [
  ["October", 31],
  ["November", 30],
  ["December", 31],
];

/** pixels per day on the timeline */
export const DAY_WIDTH = 7;

/** "today" on the timeline, as days from Oct 1 (Nov 12) */
export const TODAY = 42;

/** width of the row titles to the left of the timeline track */
export const TRACK_LEFT = 178;

/** Turns a day offset from Oct 1 into a date like "Nov 4". */
export function dayLabel(offset: number) {
  const day = Math.round(offset);
  if (day < 31) {
    return `Oct ${day + 1}`;
  } else if (day < 61) {
    return `Nov ${day - 30}`;
  } else {
    return `Dec ${day - 60}`;
  }
}

/**
 * A project on the timeline: title, start and end as days from Oct 1, and its kind. `drag` marks the bar you can
 * drag; `linked` bars follow it (each a little later, on a softer spring).
 */
export type TimelineRow = {
  t: string;
  s: number;
  e: number;
  kind: "done" | "live" | "next" | "pin";
  who?: "Maya" | "Theo";
  pct?: number;
  drag?: boolean;
  linked?: boolean;
};

export const TIMELINE_ROWS: TimelineRow[] = [
  {
    t: "Customer interviews",
    s: 0,
    e: 21,
    kind: "done",
  },
  {
    t: "Pricing page copy",
    s: 13,
    e: 38,
    kind: "done",
  },
  {
    t: "New onboarding flow",
    s: 25,
    e: 51,
    kind: "live",
    who: "Maya",
    pct: 68,
    drag: true,
  },
  {
    t: "Billing migration",
    s: 34,
    e: 58,
    kind: "live",
    who: "Theo",
    pct: 41,
    linked: true,
  },
  {
    t: "Help center refresh",
    s: 48,
    e: 65,
    kind: "next",
    linked: true,
  },
  {
    t: "Launch week",
    s: 69,
    e: 69,
    kind: "pin",
    linked: true,
  },
  {
    t: "Retro and next quarter",
    s: 76,
    e: 76,
    kind: "pin",
  },
];

export const WEEKLY_UPDATE =
  "Onboarding is 68% done and on track for Nov 21. Billing slipped three days after the tax change; Theo has a fix in review.";

export const VIEWS = ["Timeline", "Board", "List", "Updates"] as const;
export type View = (typeof VIEWS)[number];

export const LOGOS: [name: string, icon: IconName][] = [
  ["Kettlebrook", "ph:circle"],
  ["Larchway", "ph:triangle"],
  ["Quillmere", "ph:hexagon"],
  ["Brightloom", "ph:sun"],
  ["Veltra", "ph:diamond"],
  ["Oakhaven", "ph:cloud"],
  ["Ferncastle", "ph:circle-dashed"],
];

export const FAQS: [question: string, answer: string][] = [
  [
    "Is the free plan really free?",
    "Yes. Up to 10 members, unlimited requests and one roadmap, for as long as you like. No card needed.",
  ],
  [
    "Do guests count as paid members?",
    "No. Guests can view and comment on anything you share with them, free on every plan.",
  ],
  [
    "Can we import from our current tool?",
    "Yes. Import from spreadsheets, issue trackers and most roadmap tools in a few minutes, with owners and dates intact.",
  ],
  [
    "Where is our data stored?",
    "In the EU or the US, your choice, encrypted at rest and in transit. Business and Enterprise plans can request data residency.",
  ],
  [
    "Can we change plans later?",
    "Any time. Upgrades take effect immediately and downgrades at the end of your billing period.",
  ],
  [
    "Do you offer discounts?",
    "Yes, for non-profits, education and early-stage startups. Write to us and tell us about your team.",
  ],
];

/** [date, version, label, title, body] */
export const CHANGELOG: [
  date: string,
  version: string,
  label: "New" | "Improved",
  title: string,
  body: string,
][] = [
  [
    "Sep 22, 2026",
    "3.0",
    "New",
    "Weekly updates that write themselves",
    "Plotline now drafts a Friday update from the week's progress, blockers and shipped work. Review it, change a line, send it.",
  ],
  [
    "Sep 15, 2026",
    "2.14",
    "New",
    "Timeline dependencies",
    "Link two projects and moving one date shifts everything downstream, with a clear note to every owner affected.",
  ],
  [
    "Sep 8, 2026",
    "2.13",
    "Improved",
    "A request inbox for support teams",
    "Forward tickets from your help desk and Plotline groups duplicates, counts votes and links them to the roadmap.",
  ],
  [
    "Aug 28, 2026",
    "2.12",
    "Improved",
    "Search that keeps up with you",
    "Results arrive in under 80 ms, and search understands filters like owner:maya or due:next week.",
  ],
];

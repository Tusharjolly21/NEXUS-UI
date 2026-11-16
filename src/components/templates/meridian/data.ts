import { MONTHS, MONTHS_SHORT, TODAY, WEEKDAYS_SHORT, addDays, formatDayDate, formatShortDate } from "./dates";
import { COLORS, formatMoney, formatNumber, seededRandom, sum } from "./theme";
import type { Board, CalEvent, Customer, FinanceRange, Notification, Range, SeriesPoint, Task } from "./types";

export const ME = {
  name: "Priya Raman",
  first: "Priya",
  role: "Head of Operations",
  email: "priya@fieldnote.app",
};

export const HOME_RANGES: Range[] = ["Week", "Month", "Year"];

const DAILY_REVENUE = (() => {
  const rand = seededRandom(7);
  const current: number[] = [];
  const previous: number[] = [];
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const day = addDays(TODAY, -daysAgo);
    const weekend = day.getDay() === 0 || day.getDay() === 6 ? 0.66 : 1;
    const growth = 1 + (29 - daysAgo) * 0.006;
    current.push(weekend * growth * (0.86 + rand() * 0.28) * (daysAgo === 9 ? 1.35 : 1));
    previous.push(weekend * (0.84 + rand() * 0.26));
  }
  const scaleCurrent = 184320 / current.reduce((acc, value) => acc + value, 0);
  const scalePrevious = 173560 / previous.reduce((acc, value) => acc + value, 0);
  return current.map((value, index): SeriesPoint => {
    const day = addDays(TODAY, index - 29);
    return {
      l: formatShortDate(day),
      long: formatDayDate(day),
      v: Math.round(value * scaleCurrent),
      p: Math.round(previous[index] * scalePrevious),
    };
  });
})();

const MONTHLY_REVENUE = [
  128400, 131900, 130700, 133500, 138400, 143800, 149900, 154300, 160100, 167e3, 174600, 180500,
].map((value, i) => {
  const month = (10 + i) % 12;
  const year = i < 2 ? 2025 : 2026;
  return {
    l: MONTHS_SHORT[month],
    long: `${MONTHS[month]} ${year}`,
    v: value,
    p: Math.round(value * (0.71 + ((i * 37) % 9) / 100)),
  };
});

export const REVENUE_BY_RANGE: Record<Range, SeriesPoint[]> = {
  Week: DAILY_REVENUE.slice(-7),
  Month: DAILY_REVENUE,
  Year: MONTHLY_REVENUE,
};

export const KPIS = [
  {
    key: "rev",
    title: "Revenue",
    icon: "ph:chart-line-up",
    fmt: formatMoney,
    value: {
      Week: sum(REVENUE_BY_RANGE.Week.map((point) => point.v)),
      Month: sum(REVENUE_BY_RANGE.Month.map((point) => point.v)),
      Year: sum(REVENUE_BY_RANGE.Year.map((point) => point.v)),
    },
    delta: {
      Week: 4.8,
      Month: 6.2,
      Year: 38.4,
    },
    spark: {
      Week: REVENUE_BY_RANGE.Week.map((point) => point.v),
      Month: REVENUE_BY_RANGE.Month.map((point) => point.v),
      Year: REVENUE_BY_RANGE.Year.map((point) => point.v),
    },
    note: {
      Week: "vs. previous 7 days",
      Month: "vs. previous 30 days",
      Year: "vs. previous 12 months",
    },
  },
  {
    key: "new",
    title: "New customers",
    icon: "ph:user-plus",
    fmt: formatNumber,
    value: {
      Week: 41,
      Month: 168,
      Year: 1904,
    },
    delta: {
      Week: 12.4,
      Month: 8.4,
      Year: 22.1,
    },
    spark: {
      Week: [4, 7, 6, 8, 5, 2, 9],
      Month: [3, 5, 6, 4, 7, 6, 2, 1, 6, 8, 7, 5, 6, 3, 2, 7, 6, 8, 5, 7, 3, 2, 6, 7, 5, 8, 6, 2, 4, 9],
      Year: [118, 124, 109, 131, 140, 152, 147, 160, 171, 178, 186, 188],
    },
    note: {
      Week: "41 paid conversions",
      Month: "from 1,312 trials",
      Year: "best year so far",
    },
  },
  {
    key: "act",
    title: "Activation rate",
    icon: "ph:lightning",
    fmt: (value: number) => `${value.toFixed(1)}%`,
    value: {
      Week: 61.2,
      Month: 58.7,
      Year: 54.9,
    },
    delta: {
      Week: 2.1,
      Month: 3.4,
      Year: 6.8,
    },
    spark: {
      Week: [58, 60, 59, 62, 61, 63, 61],
      Month: [
        52, 54, 53, 55, 56, 55, 57, 58, 57, 59, 58, 60, 59, 61, 60, 58, 59, 60, 62, 61, 60, 59, 61, 62, 60, 61, 63, 62,
        61, 61,
      ],
      Year: [47, 48, 50, 49, 51, 52, 54, 55, 56, 57, 58, 59],
    },
    note: {
      Week: "first file shared in 24h",
      Month: "first file shared in 24h",
      Year: "first file shared in 24h",
    },
  },
  {
    key: "churn",
    title: "Gross churn",
    icon: "ph:sign-out",
    fmt: (value: number) => `${value.toFixed(1)}%`,
    invert: true,
    value: {
      Week: 0.4,
      Month: 1.6,
      Year: 17.2,
    },
    delta: {
      Week: -0.8,
      Month: -0.3,
      Year: -4.1,
    },
    spark: {
      Week: [6, 5, 7, 4, 5, 3, 4],
      Month: [
        2.1, 2, 1.9, 2.2, 2, 1.8, 1.9, 1.7, 1.8, 1.6, 1.7, 1.5, 1.6, 1.7, 1.6, 1.5, 1.6, 1.4, 1.5, 1.6, 1.5, 1.4, 1.6,
        1.5, 1.6, 1.5, 1.4, 1.6, 1.5, 1.6,
      ],
      Year: [2.1, 2, 1.9, 1.9, 1.8, 1.7, 1.7, 1.6, 1.6, 1.5, 1.6, 1.4],
    },
    note: {
      Week: "3 accounts cancelled",
      Month: "11 accounts cancelled",
      Year: "down from 21.3%",
    },
  },
];

export const NET_CASH: Record<Range, SeriesPoint[]> = {
  Week: [420, 880, -160, 1240, 690, 310, 950].map((value, i) => {
    const day = addDays(TODAY, i - 6);
    return {
      l: WEEKDAYS_SHORT[day.getDay()],
      long: formatDayDate(day),
      v: value,
      p: 0,
    };
  }),
  Month: [1640, 2380, -420, 2310].map((value, i) => {
    const day = addDays(TODAY, -27 + i * 7);
    return {
      l: formatShortDate(day),
      long: `Week of ${formatShortDate(day)}`,
      v: value,
      p: 0,
    };
  }),
  Year: [4200, 3600, -1200, 2800, 4900, 5400, 6100, 4400, 5800, 6900, 7600, 5900].map((value, i) => ({
    l: MONTHLY_REVENUE[i].l,
    long: MONTHLY_REVENUE[i].long,
    v: value,
    p: 0,
  })),
};

export const SHIPPING_ACTIVITY = (() => {
  const rand = seededRandom(42);
  const start = addDays(TODAY, -((TODAY.getDay() + 6) % 7) - 25 * 7);
  const days = [];
  for (let index = 0; index < 26 * 7; index++) {
    const day = addDays(start, index);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const future = day > TODAY;
    const base = weekend
      ? rand() < 0.72
        ? 0
        : 1 + Math.floor(rand() * 3)
      : rand() < 0.05
        ? 0
        : Math.floor(1 + Math.pow(rand(), 1.5) * 12 + (rand() < 0.08 ? 5 : 0));
    const holiday = day.getMonth() === 7 && day.getDate() > 10 && day.getDate() < 18;
    days.push({
      d: day,
      v: future ? 0 : holiday ? (weekend ? 0 : 1) : base,
      future,
    });
  }
  let streak = 0;
  let best = 0;
  for (const entry of days) {
    if (entry.future) {
      break;
    }
    const weekend = entry.d.getDay() === 0 || entry.d.getDay() === 6;
    if (entry.v > 0 && !weekend) {
      best++;
      streak = Math.max(streak, best);
    } else {
      if (!weekend) {
        best = 0;
      }
    }
  }
  const total = sum(days.map((entry) => entry.v));
  return {
    days,
    total,
    best: streak,
    releases: 46,
    cycle: 2.4,
  };
})();

export const TEAM = [
  {
    name: "Ines Duarte",
    role: "Product Designer",
    team: "Design",
    start: new Date(2026, 9, 6),
    buddy: "Mei Tanaka",
  },
  {
    name: "Kofi Mensah",
    role: "Backend Engineer",
    team: "Platform",
    start: new Date(2026, 9, 13),
    buddy: "Lucas Ferreira",
  },
  {
    name: "Tara Lindqvist",
    role: "Support Lead",
    team: "Customer",
    start: new Date(2026, 9, 20),
    buddy: "Sofia Marin",
  },
  {
    name: "Daniel Cho",
    role: "iOS Engineer",
    team: "Mobile",
    start: new Date(2026, 9, 27),
    buddy: "Amara Nwosu",
  },
  {
    name: "Maya Feld",
    role: "Growth Marketer",
    team: "Growth",
    start: new Date(2026, 10, 2),
    buddy: "Jonah Weiss",
  },
  {
    name: "Oskar Halvorsen",
    role: "Data Analyst",
    team: "Operations",
    start: new Date(2026, 10, 3),
    buddy: "Priya Raman",
  },
  {
    name: "Leila Haddad",
    role: "Design Engineer",
    team: "Design",
    start: new Date(2026, 10, 9),
    buddy: "Mei Tanaka",
  },
  {
    name: "Ben Adeyemi",
    role: "Account Executive",
    team: "Sales",
    start: new Date(2026, 10, 10),
    buddy: "Sofia Marin",
  },
  {
    name: "Nadia Petrova",
    role: "Security Engineer",
    team: "Platform",
    start: new Date(2026, 10, 16),
    buddy: "Amara Nwosu",
  },
];

export const PLANS = ["Starter", "Team", "Business", "Enterprise"];

/** Monthly price per seat. */
const PLAN_PRICES: Record<string, number> = {
  Starter: 12,
  Team: 24,
  Business: 38,
  Enterprise: 52,
};

export const STATUSES = ["Active", "Trial", "Past due", "Churned"];

export const STATUS_COLORS: Record<string, string> = {
  Active: COLORS.good,
  Trial: COLORS.accent,
  "Past due": COLORS.warn,
  Churned: COLORS.neutral,
};

export const STARTER_CUSTOMERS: Customer[] = (() => {
  const names = [
    "Northwind Studio",
    "Halcyon Labs",
    "Juniper & Co",
    "Copperline",
    "Lumen Collective",
    "Basalt Works",
    "Fable Interactive",
    "Orchard Press",
    "Kestrel Design",
    "Tidewater Agency",
    "Marrow Type Foundry",
    "Quill & Ink",
    "Saltbox Studio",
    "Emberly",
    "Larch Architecture",
    "Wren Digital",
    "Driftwood Games",
    "Cobalt Health",
    "Paper Moon Books",
    "Hollow Oak",
    "Bright Acre Farms",
    "Ninefold",
    "Vale Motion",
    "Oxbow Outfitters",
    "Fieldstone Realty",
    "Meadowlark Media",
    "Granite Bay Bank",
    "Little Harbor",
    "Mosaic Learning",
    "Redline Bikes",
    "Sundial Coffee",
    "Twin Pines Clinic",
    "Atlas Freight",
    "Brisk Robotics",
    "Cinder Records",
    "Dovetail Furniture",
    "Elm Street Dental",
    "Foxglove Botanics",
    "Gale Sailing",
    "Heron Ventures",
    "Indigo Print",
    "Jetty Surf Co",
    "Keel Analytics",
    "Loam Ceramics",
    "Moss & Stone",
    "Nimbus Weather",
    "Opal Optics",
    "Pike Legal",
  ];
  const owners = [
    "Lena",
    "Marco",
    "Aisha",
    "Tom",
    "Yuki",
    "Grace",
    "Omar",
    "Elena",
    "Sam",
    "Chloe",
    "Ravi",
    "Hannah",
    "Diego",
    "Freya",
    "Kenji",
    "Zara",
    "Leo",
    "Ivy",
    "Mateo",
    "Nora",
    "Felix",
    "Anika",
    "Hugo",
    "Clara",
  ];
  const regions = [
    "Park",
    "Rossi",
    "Khan",
    "Becker",
    "Sato",
    "Liu",
    "Haddad",
    "Novak",
    "Reid",
    "Martin",
    "Iyer",
    "Schmidt",
    "Vargas",
    "Olsen",
    "Ito",
    "Malik",
    "Fischer",
    "Quinn",
    "Duarte",
    "Berg",
    "Ahmed",
    "Costa",
    "Moreau",
    "Walsh",
  ];
  const rand = seededRandom(11);
  return names.map((name, index) => {
    const plan = index % 9 === 0 ? "Enterprise" : index % 4 === 0 ? "Business" : index % 3 === 0 ? "Starter" : "Team";
    const seats =
      plan === "Starter"
        ? 2 + Math.floor(rand() * 5)
        : plan === "Team"
          ? 6 + Math.floor(rand() * 22)
          : plan === "Business"
            ? 22 + Math.floor(rand() * 60)
            : 110 + Math.floor(rand() * 280);
    const status = [5, 17, 29, 38, 44, 13].includes(index)
      ? "Trial"
      : [8, 23, 35, 41].includes(index)
        ? "Past due"
        : [11, 26, 33, 47].includes(index)
          ? "Churned"
          : "Active";
    const owner = owners[(index * 7) % owners.length];
    const region = regions[(index * 5 + 3) % regions.length];
    const domain = name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z]+/g, "");
    const activeMinutes =
      status === "Churned"
        ? 60 * 24 * (12 + Math.floor(rand() * 40))
        : Math.floor(Math.pow(rand(), 2.4) * 60 * 24 * 9) + 2;
    // one account is pinned to Enterprise for the demo
    const overrides =
      index === 1
        ? {
            plan: "Enterprise",
            seats: 212,
            active: 12,
          }
        : {};
    return {
      id: `C-${(1040 + index * 13).toString()}`,
      name,
      contact: `${owner} ${region}`,
      email: `${owner.toLowerCase()}@${domain}.${["com", "co", "studio", "io"][index % 4]}`,
      plan,
      seats,
      status,
      active: activeMinutes,
      joined: addDays(TODAY, -Math.floor(20 + rand() * 900)),
      hue: index,
      ...overrides,
    };
  });
})();

export const monthlyRevenue = (customer: Customer) =>
  customer.status === "Trial" || customer.status === "Churned" ? 0 : customer.seats * PLAN_PRICES[customer.plan];

export const formatAgo = (minutes: number) =>
  minutes < 60
    ? `${minutes}m ago`
    : minutes < 60 * 24
      ? `${Math.floor(minutes / 60)}h ago`
      : `${Math.floor(minutes / 1440)}d ago`;

export const COLUMNS = [
  {
    id: "backlog",
    title: "Backlog",
    icon: "ph:circle-dashed",
  },
  {
    id: "progress",
    title: "In progress",
    icon: "ph:circle-half",
  },
  {
    id: "review",
    title: "In review",
    icon: "ph:eye",
  },
  {
    id: "done",
    title: "Done",
    icon: "ph:check-circle",
  },
];

export const TEAM_COLORS: Record<string, string> = {
  Engineering: COLORS.s1,
  Growth: COLORS.s2,
  Design: COLORS.s3,
  Ops: COLORS.s4,
};

/** Builds a task from a compact row: checklist items as [text, done], comments as [who, text, when]. */
const task = (
  id: string,
  title: string,
  tag: string,
  prio: string,
  who: string[],
  dueInDays: number,
  desc: string,
  list: [string, boolean][],
  comments: [string, string, string][],
  hours: number[],
): Task => ({
  id,
  title,
  tag,
  prio,
  who,
  due: addDays(TODAY, dueInDays),
  desc,
  list: list.map(([text, done]) => ({
    t: text,
    done,
  })),
  comments: comments.map(([who, text, when], i) => ({
    id: `${id}-c${i}`,
    who,
    text,
    when,
  })),
  hours,
});

export const STARTER_TASKS: Task[] = [
  task(
    "FN-412",
    "Variable fonts in SVG and PDF export",
    "Engineering",
    "High",
    ["Lucas Ferreira", "Leila Haddad"],
    5,
    "Exports currently flatten variable axes to the default instance. Keep the axis values and embed the instance so files match the canvas.",
    [
      ["Map axis values to named instances", true],
      ["Embed subset for PDF", true],
      ["SVG: outline fallback toggle", false],
      ["Regression suite on 40 sample files", false],
    ],
    [
      ["Leila Haddad", "Outline fallback should default to off, designers expect live text.", "2h ago"],
      ["Lucas Ferreira", "Agreed. PDF subset is in, file sizes went down 18%.", "48m ago"],
    ],
    [2.5, 4, 3, 5.5, 4, 0, 1.5],
  ),
  task(
    "FN-405",
    "Onboarding checklist v2",
    "Growth",
    "High",
    ["Maya Feld", "Ines Duarte"],
    9,
    "Replace the five-step modal with an inline checklist that tracks the first shared file. Activation target is 62%.",
    [
      ["Copy for each step", true],
      ["Empty states", false],
      ["Event tracking", false],
    ],
    [["Maya Feld", "Variant B lifted first-share by 4.1 points in the test cohort.", "Yesterday"]],
    [1, 2, 3.5, 2, 4, 0, 0],
  ),
  task(
    "FN-398",
    "Nested mask import from SVG",
    "Engineering",
    "Medium",
    ["Kofi Mensah"],
    12,
    "Masks inside groups that are themselves masked import as solid shapes.",
    [
      ["Repro file from support", true],
      ["Parser fix", false],
    ],
    [["Tara Lindqvist", "Three tickets this week mention this, all from print studios.", "3h ago"]],
    [0, 1.5, 2, 3, 0, 0, 0],
  ),
  task(
    "FN-421",
    "Pricing page copy for Team plan",
    "Growth",
    "Medium",
    ["Maya Feld"],
    15,
    "Explain seat-based pricing with one worked example. Remove the comparison table rows nobody reads.",
    [
      ["Draft", true],
      ["Review with sales", false],
    ],
    [],
    [0, 0, 1, 2, 1.5, 0, 0],
  ),
  task(
    "FN-377",
    "SOC 2 evidence collection",
    "Ops",
    "Urgent",
    ["Priya Raman", "Nadia Petrova"],
    3,
    "Auditor fieldwork starts on the 20th. Collect access reviews, vendor list and the incident runbook.",
    [
      ["Quarterly access review", true],
      ["Vendor inventory", true],
      ["Incident runbook sign-off", false],
      ["Background check records", false],
      ["Policy acknowledgements", false],
    ],
    [["Nadia Petrova", "Runbook is drafted, needs Jonah's sign-off.", "1h ago"]],
    [3, 2, 4, 3.5, 5, 0, 0],
  ),
  task(
    "FN-433",
    "Comments panel design review",
    "Design",
    "Medium",
    ["Mei Tanaka", "Ines Duarte", "Leila Haddad"],
    2,
    "Final review of the threaded comments panel before it goes to engineering.",
    [
      ["Hover states", true],
      ["Mobile sheet", true],
      ["Resolved thread style", false],
    ],
    [["Mei Tanaka", "Can we try resolved threads at 60% instead of hiding them?", "20m ago"]],
    [1, 2, 2, 3, 2.5, 0, 0],
  ),
  task(
    "FN-389",
    "Cold start of the renderer",
    "Engineering",
    "High",
    ["Amara Nwosu", "Kofi Mensah"],
    6,
    "Large files take 3.8s to first paint. Stream the scene graph and paint the viewport first.",
    [
      ["Trace on 5 large files", true],
      ["Viewport-first paint", true],
      ["Lazy-load off-screen artboards", false],
    ],
    [["Amara Nwosu", "Down to 1.9s on the 120MB test file.", "4h ago"]],
    [4, 5, 3, 6, 4.5, 1, 0],
  ),
  task(
    "FN-366",
    "Billing webhooks migration",
    "Engineering",
    "Medium",
    ["Lucas Ferreira"],
    -1,
    "Move webhook handling to the queue so retries are idempotent.",
    [
      ["Queue consumer", true],
      ["Idempotency keys", true],
      ["Backfill", true],
    ],
    [["Lucas Ferreira", "Running in shadow mode since Monday, zero diffs.", "2d ago"]],
    [3, 2, 1, 2, 1, 0, 0],
  ),
  task(
    "FN-440",
    "Churn interviews with 8 accounts",
    "Growth",
    "Low",
    ["Sofia Marin", "Ben Adeyemi"],
    18,
    "Talk to recently churned Team accounts. Focus on the switch moment.",
    [
      ["Shortlist accounts", true],
      ["Book calls", false],
      ["Synthesis", false],
    ],
    [],
    [0, 1, 0, 1, 0, 0, 0],
  ),
  task(
    "FN-358",
    "Release notes for 4.12",
    "Ops",
    "Low",
    ["Jonah Weiss"],
    -3,
    "Write and schedule release notes for 4.12.",
    [
      ["Draft", true],
      ["Screens", true],
    ],
    [],
    [1, 1, 0, 0, 0, 0, 0],
  ),
  task(
    "FN-447",
    "Dark mode for embeds",
    "Design",
    "Low",
    ["Leila Haddad"],
    21,
    "Embedded files should follow the host page's color scheme.",
    [["Token audit", false]],
    [],
    [0, 0, 0, 0, 1, 0, 0],
  ),
  task(
    "FN-372",
    "Seat limits on Team plan",
    "Engineering",
    "Medium",
    ["Daniel Cho", "Lucas Ferreira"],
    8,
    "Enforce the 25-seat cap with a soft warning at 22.",
    [
      ["Server check", true],
      ["Upgrade prompt", false],
    ],
    [["Ben Adeyemi", "Sales wants the prompt to offer a call, not just checkout.", "5h ago"]],
    [0, 2, 2, 1.5, 3, 0, 0],
  ),
  task(
    "FN-351",
    "Support macros refresh",
    "Ops",
    "Low",
    ["Tara Lindqvist"],
    -5,
    "Rewrite the 20 most-used support macros in the new tone.",
    [
      ["Top 20 list", true],
      ["Rewrite", true],
    ],
    [],
    [2, 2, 1, 0, 0, 0, 0],
  ),
];

export const STARTER_BOARD: Board = {
  backlog: ["FN-440", "FN-447", "FN-421"],
  progress: ["FN-377", "FN-412", "FN-389", "FN-405"],
  review: ["FN-433", "FN-398", "FN-372"],
  done: ["FN-366", "FN-358", "FN-351"],
};

export const FINANCE_RANGES: FinanceRange[] = ["Month", "Quarter", "Year"];

export const INCOME_SOURCES = ["Subscriptions", "Enterprise", "Services", "Marketplace"];

export const SPEND_CATEGORIES = ["Payroll", "Infrastructure", "Marketing", "Tools", "Office"];

export const SPEND_COLORS: Record<string, string> = {
  Payroll: COLORS.s1,
  Infrastructure: COLORS.s2,
  Marketing: COLORS.s3,
  Tools: COLORS.s4,
  Office: COLORS.neutral,
};

/** A period's money: income by source, spend and budget by category, the balance over time and the changes. */
type CashFlow = {
  src: number[];
  use: number[];
  budget: number[];
  balance: number[];
  dIn: number;
  dOut: number;
  dBal: number;
};

export const CASH_FLOW: Record<FinanceRange, CashFlow> = {
  Month: {
    src: [164800, 31600, 9800, 6200],
    use: [96400, 21300, 14800, 8600, 7800],
    budget: [1e5, 26e3, 22e3, 15e3, 9e3],
    balance: [1201, 1210, 1198, 1222, 1236, 1229, 1247, 1258, 1251, 1270, 1284.56],
    dIn: 6.2,
    dOut: 3.1,
    dBal: 5.2,
  },
  Quarter: {
    src: [478200, 88400, 31200, 17100],
    use: [284100, 61900, 47300, 25200, 23400],
    budget: [3e5, 78e3, 6e4, 45e3, 27e3],
    balance: [1104, 1131, 1150, 1142, 1176, 1190, 1213, 1236, 1240, 1262, 1284.56],
    dIn: 14.8,
    dOut: 7.9,
    dBal: 16.3,
  },
  Year: {
    src: [1684e3, 302500, 118600, 61400],
    use: [1071e3, 236800, 182400, 98600, 89200],
    budget: [115e4, 3e5, 22e4, 16e4, 1e5],
    balance: [702, 761, 790, 842, 880, 931, 978, 1032, 1101, 1176, 1284.56],
    dIn: 41.2,
    dOut: 22.4,
    dBal: 82.9,
  },
};

export const TRANSACTIONS = (
  [
    ["Halcyon Labs", "Enterprise", "in", 21840, 0, "ph:buildings", "Wire"],
    ["Payroll, November first half", "Payroll", "out", -48200, 0, "ph:users", "ACH"],
    ["Card payouts", "Subscriptions", "in", 38410, -1, "ph:credit-card", "Payout"],
    ["Cloud compute", "Infrastructure", "out", -9620, -1, "ph:cloud", "Card ending 4417"],
    ["Plugin marketplace payout", "Marketplace", "in", 2180, -2, "ph:storefront", "Payout"],
    ["Conference booth, Design Week", "Marketing", "out", -6400, -3, "ph:megaphone-simple", "Card ending 4417"],
    ["Card payouts", "Subscriptions", "in", 36920, -4, "ph:credit-card", "Payout"],
    ["Granite Bay Bank onboarding", "Services", "in", 4800, -5, "ph:briefcase", "Invoice 2291"],
    ["Studio rent", "Office", "out", -7800, -6, "ph:buildings", "ACH"],
    ["Design and analytics tools", "Tools", "out", -3140, -6, "ph:plugs", "Card ending 9012"],
    ["Search ads", "Marketing", "out", -4280, -7, "ph:megaphone-simple", "Card ending 4417"],
    ["Card payouts", "Subscriptions", "in", 35760, -8, "ph:credit-card", "Payout"],
    ["Object storage", "Infrastructure", "out", -4210, -9, "ph:cloud", "Card ending 4417"],
    ["Mosaic Learning", "Enterprise", "in", 9760, -10, "ph:buildings", "Wire"],
    ["Error tracking and logs", "Tools", "out", -1820, -11, "ph:plugs", "Card ending 9012"],
    ["Team offsite deposit", "Office", "out", -2400, -12, "ph:coffee", "Card ending 9012"],
  ] as [string, string, string, number, number, string, string][]
).map(([label, category, kind, amount, daysAgo, icon, method], index) => ({
  id: `t${index}`,
  who: label,
  cat: category,
  kind,
  amt: amount,
  date: addDays(TODAY, daysAgo),
  icon,
  method,
}));

export const EVENT_COLORS: Record<string, string> = {
  Meeting: COLORS.s1,
  Launch: COLORS.s2,
  Review: COLORS.s3,
  Away: COLORS.s4,
};

const EVENT_SEEDS: [number, number, number, string, string, string, string[], string?][] = [
  [2026, 10, 3, "Quarterly planning", "Meeting", "10:00", ["Jonah Weiss", "Priya Raman", "Amara Nwosu"], "Main room"],
  [2026, 10, 6, "Ines, 1-month check-in", "Meeting", "14:00", ["Ines Duarte", "Mei Tanaka"]],
  [2026, 10, 9, "Leila and Ben start", "Meeting", "09:00", ["Leila Haddad", "Ben Adeyemi"]],
  [2026, 10, 12, "Pricing page review", "Review", "16:00", ["Maya Feld", "Jonah Weiss"]],
  [2026, 10, 13, "Investor update draft", "Review", "11:00", ["Jonah Weiss", "Priya Raman"]],
  [2026, 10, 13, "Comments panel crit", "Review", "15:30", ["Mei Tanaka", "Ines Duarte", "Leila Haddad"]],
  [2026, 10, 16, "SOC 2 kickoff with auditor", "Meeting", "13:00", ["Priya Raman", "Nadia Petrova"], "Video call"],
  [2026, 10, 18, "Release 4.12", "Launch", "10:00", ["Lucas Ferreira", "Amara Nwosu"]],
  [2026, 10, 19, "Lucas out", "Away", "All day", ["Lucas Ferreira"]],
  [2026, 10, 20, "Lucas out", "Away", "All day", ["Lucas Ferreira"]],
  [2026, 10, 20, "Board meeting", "Meeting", "09:30", ["Jonah Weiss", "Priya Raman"], "Main room"],
  [2026, 10, 24, "Onboarding v2 launch", "Launch", "11:00", ["Maya Feld", "Ines Duarte"]],
  [2026, 10, 26, "Office closed", "Away", "All day", []],
  [2026, 10, 27, "Office closed", "Away", "All day", []],
  [2026, 10, 30, "Payroll run", "Review", "12:00", ["Priya Raman"]],
  [2026, 9, 14, "Release 4.11", "Launch", "10:00", ["Lucas Ferreira"]],
  [2026, 9, 22, "Offsite, day one", "Away", "All day", []],
  [2026, 9, 23, "Offsite, day two", "Away", "All day", []],
  [2026, 9, 30, "Payroll run", "Review", "12:00", ["Priya Raman"]],
  [2026, 11, 3, "Holiday party planning", "Meeting", "15:00", ["Sofia Marin"]],
  [2026, 11, 9, "Release 4.13", "Launch", "10:00", ["Lucas Ferreira", "Kofi Mensah"]],
  [2026, 11, 18, "Year-end review", "Review", "10:00", ["Jonah Weiss", "Priya Raman"]],
  [2026, 11, 23, "Winter break", "Away", "All day", []],
];

/** The month's events: the weekly meetings, plus the one-off events that fall in it. */
export function eventsForMonth(year: number, month: number) {
  const events: CalEvent[] = [];
  const days = new Date(year, month + 1, 0).getDate();
  for (let date = 1; date <= days; date++) {
    const day = new Date(year, month, date);
    const weekday = day.getDay();
    if (weekday === 1) {
      events.push({
        id: `r-ops-${year}-${month}-${date}`,
        title: "Ops sync",
        kind: "Meeting",
        date: day,
        time: "09:30",
        who: ["Priya Raman", "Sofia Marin", "Oskar Halvorsen"],
      });
    }
    if (weekday === 2) {
      events.push({
        id: `r-crit-${year}-${month}-${date}`,
        title: "Design crit",
        kind: "Review",
        date: day,
        time: "10:00",
        who: ["Mei Tanaka", "Ines Duarte"],
      });
    }
    if (weekday === 4 && date % 2 === 0) {
      events.push({
        id: `r-gr-${year}-${month}-${date}`,
        title: "Growth review",
        kind: "Meeting",
        date: day,
        time: "15:00",
        who: ["Maya Feld", "Jonah Weiss"],
      });
    }
  }
  EVENT_SEEDS.forEach(([eventYear, eventMonth, date, title, kind, time, people, place], index) => {
    if (eventYear === year && eventMonth === month) {
      events.push({
        id: `s${index}`,
        title,
        kind,
        date: new Date(eventYear, eventMonth, date),
        time,
        who: people,
        place,
      });
    }
  });
  return events;
}

export const STARTER_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    icon: "ph:arrow-up-right",
    title: "Halcyon Labs moved to Enterprise",
    body: "212 seats, $11,024 MRR",
    when: "12m ago",
    unread: true,
  },
  {
    id: "n2",
    icon: "ph:warning-circle",
    title: "Payment failed for Kestrel Design",
    body: "Card declined, retry scheduled for Monday",
    when: "1h ago",
    unread: true,
  },
  {
    id: "n3",
    icon: "ph:chat-circle",
    title: "Mei commented on FN-433",
    body: "Can we try resolved threads at 60%...",
    when: "20m ago",
    unread: true,
  },
  {
    id: "n4",
    icon: "ph:git-merge",
    title: "Release 4.12 branch cut",
    body: "38 pull requests, ships Wednesday",
    when: "Yesterday",
    unread: false,
  },
  {
    id: "n5",
    icon: "ph:user-plus",
    title: "Ben Adeyemi joined the workspace",
    body: "Sales, buddy: Sofia Marin",
    when: "3d ago",
    unread: false,
  },
];

export const RANGE_LABELS: Record<Range, string> = {
  Week: "Last 7 days",
  Month: "Last 30 days",
  Year: "Last 12 months",
};

export const NET_TOTALS: Record<Range, number[]> = {
  Week: [6120, 1450, -3240],
  Month: [9860, 3140, -7090],
  Year: [88200, 21600, -53400],
};

export const TEAM_PAGE = 3;

export const PRIORITIES: Record<string, { icon: string; color: string }> = {
  Urgent: {
    icon: "ph:warning-circle",
    color: "var(--bad-ink)",
  },
  High: {
    icon: "ph:flag",
    color: "var(--ink)",
  },
  Medium: {
    icon: "ph:flag",
    color: "var(--soft)",
  },
  Low: {
    icon: "ph:flag",
    color: "var(--faint)",
  },
};

export const RANGE_PHRASES: Record<string, string> = {
  Month: "this month",
  Quarter: "this quarter",
  Year: "this year",
};

export const EVENT_KINDS = ["Meeting", "Launch", "Review", "Away"];

export const NAV = [
  {
    id: "home",
    label: "Home",
    icon: "ph:house",
  },
  {
    id: "board",
    label: "Board",
    icon: "ph:kanban",
  },
  {
    id: "finance",
    label: "Finance",
    icon: "ph:wallet",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: "ph:calendar-blank",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: "ph:megaphone",
    soon: true,
  },
  {
    id: "automations",
    label: "Automations",
    icon: "ph:lightning",
    soon: true,
  },
];

export const PAGE_TITLES: Record<string, string> = {
  home: "Home",
  board: "Board",
  finance: "Finance",
  calendar: "Calendar",
  marketing: "Marketing",
  automations: "Automations",
  settings: "Settings",
  support: "Support",
};

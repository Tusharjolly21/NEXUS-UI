import { hashString } from "./theme";
import type { Agent, DirectoryAgent, Thread, Msg } from "./types";

export const ME = "Ines Carvalho";

export const STARTER_AGENTS: Agent[] = [
  {
    id: "mochi",
    name: "Mochi",
    role: "Landing page designer",
    desc: "Turns a launch brief into a page layout with sizes, spacing and a clear first action.",
    shape: "blob",
    color: "#8C7CFF",
    eyes: "dot",
    lang: "English (US)",
    notify: true,
    voice: "Wren",
    speed: 1,
  },
  {
    id: "quill",
    name: "Quill",
    role: "Copy reviewer",
    desc: "Edits headlines, emails and UI text. Sends before/after with every change explained.",
    shape: "flower",
    color: "#FF6B8B",
    eyes: "sparkle",
    lang: "English (UK)",
    notify: true,
    voice: "Fable",
    speed: 1,
  },
  {
    id: "sprout",
    name: "Sprout",
    role: "Growth marketer",
    desc: "Designs experiments, sizes them and tells you which number to watch.",
    shape: "star",
    color: "#FFC94D",
    eyes: "happy",
    lang: "English (US)",
    notify: true,
    voice: "Pippin",
    speed: 1.25,
  },
  {
    id: "scout",
    name: "Scout",
    role: "SEO researcher",
    desc: "Finds the search terms worth owning and the pages that should rank for them.",
    shape: "diamond",
    color: "#5AA9FF",
    eyes: "focused",
    lang: "English (US)",
    notify: false,
    voice: "Harbor",
    speed: 1,
  },
  {
    id: "bastion",
    name: "Bastion",
    role: "Security reviewer",
    desc: "Reviews flows and code for leaks and abuse. Says plainly what is blocking.",
    shape: "shield",
    color: "#A3ADBF",
    eyes: "flat",
    lang: "English (US)",
    notify: true,
    voice: "Basalt",
    speed: 0.75,
  },
  {
    id: "cirrus",
    name: "Cirrus",
    role: "Cloud engineer",
    desc: "Keeps queues fast and bills small. Answers with config you can paste.",
    shape: "cloud",
    color: "#45D3C7",
    eyes: "sleepy",
    lang: "English (US)",
    notify: false,
    voice: "Harbor",
    speed: 1,
  },
  {
    id: "pip",
    name: "Pip",
    role: "Data analyst",
    desc: "Answers product questions with numbers, the query behind them and the caveats.",
    shape: "squircle",
    color: "#6EDC8C",
    eyes: "glasses",
    lang: "English (US)",
    notify: true,
    voice: "Wren",
    speed: 1,
  },
  {
    id: "juno",
    name: "Juno",
    role: "Launch planner",
    desc: "Keeps the launch on track: owners, dates, and the one thing that could slip.",
    shape: "heart",
    color: "#FF8A65",
    eyes: "wink",
    lang: "English (US)",
    notify: true,
    voice: "Fable",
    speed: 1,
  },
];

export const AGENT_DIRECTORY: DirectoryAgent[] = [
  {
    id: "echo",
    name: "Echo",
    role: "Support triage",
    desc: "Reads every ticket, tags it, drafts a reply and flags the angry ones first.",
    shape: "drop",
    color: "#D77BF5",
    eyes: "bean",
    by: "Juniper Labs",
    installs: "12.4k",
  },
  {
    id: "ledger",
    name: "Ledger",
    role: "Finance ops",
    desc: "Reconciles payouts against bank statements and flags anything that doesn't match.",
    shape: "squircle",
    color: "#D9B98C",
    eyes: "glasses",
    by: "Tallyhouse",
    installs: "8.1k",
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "User researcher",
    desc: "Synthesises interview notes into themes, quotes and the decisions they point to.",
    shape: "flower",
    color: "#6EDC8C",
    eyes: "bean",
    by: "Fieldnote",
    installs: "5.7k",
  },
  {
    id: "fern",
    name: "Fern",
    role: "Accessibility auditor",
    desc: "Checks contrast, focus order and screen-reader labels, with fixes as code.",
    shape: "blob",
    color: "#45D3C7",
    eyes: "wide",
    by: "Juniper Labs",
    installs: "9.9k",
  },
  {
    id: "tempo",
    name: "Tempo",
    role: "Release notes writer",
    desc: "Turns merged pull requests into release notes people actually read.",
    shape: "heart",
    color: "#FFC94D",
    eyes: "happy",
    by: "Changelog Co.",
    installs: "3.2k",
  },
  {
    id: "bolt",
    name: "Bolt",
    role: "QA tester",
    desc: "Writes test plans from a spec and walks through edge cases before you ship.",
    shape: "diamond",
    color: "#FF8A65",
    eyes: "surprised",
    by: "Testbench",
    installs: "6.6k",
  },
];

export const PLUGINS = [
  {
    id: "docs",
    name: "Docs",
    icon: "ph:file-text",
    desc: "Read and write team documents.",
  },
  {
    id: "sheets",
    name: "Sheets",
    icon: "ph:table",
    desc: "Query and update spreadsheets.",
  },
  {
    id: "slides",
    name: "Slides",
    icon: "ph:presentation-chart",
    desc: "Draft decks from a conversation.",
  },
  {
    id: "code",
    name: "Code",
    icon: "ph:code",
    desc: "Run snippets in a sandbox.",
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: "ph:calendar-blank",
    desc: "Find time and book meetings.",
  },
  {
    id: "tickets",
    name: "Tickets",
    icon: "ph:ticket",
    desc: "Create and triage issues.",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "ph:chart-line-up",
    desc: "Pull product metrics into chat.",
  },
  {
    id: "files",
    name: "Files",
    icon: "ph:folder-simple",
    desc: "Search the shared drive.",
  },
];

export const MODELS = [
  {
    id: "loom-pro",
    name: "Loom 4 Pro",
    desc: "Best for long, careful work",
    icon: "ph:sparkle",
  },
  {
    id: "loom",
    name: "Loom 4",
    desc: "Balanced speed and depth",
    icon: "ph:circle-half",
  },
  {
    id: "loom-swift",
    name: "Loom 4 Swift",
    desc: "Fast answers, lighter tasks",
    icon: "ph:lightning",
  },
  {
    id: "tern",
    name: "Tern Reasoner",
    desc: "Thinks step by step on hard problems",
    icon: "ph:brain",
  },
];

export const EFFORT_LEVELS = ["Low", "Medium", "High", "Max"];

export const MODES = [
  {
    id: "auto",
    name: "Auto",
    desc: "Agents act on their own and tell you after",
    icon: "ph:lightning-a",
  },
  {
    id: "ask",
    name: "Ask first",
    desc: "Agents ask before editing files or sending",
    icon: "ph:hand-palm",
  },
  {
    id: "plan",
    name: "Plan only",
    desc: "Agents propose a plan, nothing runs",
    icon: "ph:list-checks",
  },
  {
    id: "bypass",
    name: "Bypass",
    desc: "Skip every check. Only for sandboxes",
    icon: "ph:warning",
  },
];

export const VOICES = [
  {
    id: "Wren",
    note: "Warm, mid pitch",
  },
  {
    id: "Fable",
    note: "Bright, quick",
  },
  {
    id: "Harbor",
    note: "Low, steady",
  },
  {
    id: "Pippin",
    note: "Light, upbeat",
  },
  {
    id: "Basalt",
    note: "Deep, measured",
  },
];

export const LANGUAGES = ["English (US)", "English (UK)", "Español", "Português", "Deutsch", "Français"];

export const TEAM = [
  {
    name: "Ines Carvalho",
    role: "Head of Product",
    tag: "Owner",
  },
  {
    name: "Theo Lindqvist",
    role: "Engineering lead",
    tag: "Admin",
  },
  {
    name: "Amara Osei",
    role: "Product designer",
    tag: "Member",
  },
  {
    name: "Kenji Watanabe",
    role: "Growth",
    tag: "Member",
  },
  {
    name: "Lucia Ferrante",
    role: "Support lead",
    tag: "Member",
  },
];

const HOUR = 36e5;

const message = (from: string, text: string, hoursAgo: number): Msg => ({
  id: `h${hashString(from + text)
    .toString(36)
    .slice(2, 9)}`,
  from,
  text,
  at: Date.now() - hoursAgo * HOUR,
});

export const STARTER_THREADS: Thread[] = [
  {
    id: "g-launch",
    kind: "group",
    agents: ["juno", "mochi", "quill"],
    title: "Launch week",
    busy: [],
    queue: [],
    unread: 0,
    msgs: [
      message("me", "Are we ready to put the payouts page in front of the 5% beta cohort tomorrow?", 3.2),
      message(
        "mochi",
        `Design is ready. One open question for @Quill: the hero says "in minutes" but the receipt animation finishes in 4 seconds. Feels like we're underselling.`,
        3.15,
      ),
      message(
        "quill",
        `@Mochi I'd rather undersell. "Minutes" is true for 98% of payouts; "4 seconds" is only true on the happy path. Keep the animation, keep the headline.`,
        3.1,
      ),
      message(
        "juno",
        `Agreed. Shipping to 5% tomorrow at 10:00.

- @Mochi owns the page
- @Quill owns the FAQ
- I'll watch support tickets for the first two hours`,
        3.05,
      ),
    ],
  },
  {
    id: "d-mochi",
    kind: "dm",
    agents: ["mochi"],
    busy: [],
    queue: [],
    unread: 0,
    msgs: [
      message("me", "Can you sketch the hero for the Instant Payouts page? Theo wants it live before Thursday.", 26),
      message(
        "mochi",
        `Sketched three directions. My pick is **B, the receipt**:

- Left: headline, one-line promise, a single CTA. Headline at 56px, under 11 words.
- Right: a payout receipt that ticks from \`Pending\` to \`Paid\` in 4 seconds.
- Below the fold: the fee in plain numbers, then three FAQs.

The receipt does the explaining, so the copy can stay short.`,
        25.9,
      ),
      message("me", "Love B. What happens on mobile?", 1.4),
      message(
        "mochi",
        "Stack it: headline, CTA, then the receipt at 88% width so the next section peeks in. Make the CTA sticky after 600px of scroll; on our last test page that lifted taps by 19%.",
        1.38,
      ),
    ],
  },
  {
    id: "d-quill",
    kind: "dm",
    agents: ["quill"],
    busy: [],
    queue: [],
    unread: 2,
    msgs: [
      message("me", "Quill, can you review the payout email before it goes to legal?", 5),
      message(
        "quill",
        `Three edits, each small:

1. Subject: **Your money, minutes after they pay** instead of "Introducing Instant Payouts". Nobody opens an introduction.
2. Cut "seamlessly". If it works, the reader will notice.
3. Put the fee in the first paragraph: \`1% per payout, capped at $10\`. Hiding it makes it look bigger.`,
        4.9,
      ),
      message("me", 'Legal wants us to add "eligible accounts only".', 2.2),
      message(
        "quill",
        `Fair. Put it after the fee, not in the subject: "Available on eligible US accounts, which is most of them." Honest, and it doesn't read like a trap.`,
        2.15,
      ),
    ],
  },
  {
    id: "d-sprout",
    kind: "dm",
    agents: ["sprout"],
    busy: [],
    queue: [],
    unread: 1,
    msgs: [
      message(
        "sprout",
        "Referral test results are in. **Give $20, get $20** beat the control by 14% on invites sent, but only 3% on invites accepted. I'd run it one more week before calling it.",
        6,
      ),
      message("me", "OK. Hold it for a week.", 5.5),
      message(
        "sprout",
        "Done, it ends next Friday. I'll post the readout with a confidence interval, not just the lift.",
        5.4,
      ),
    ],
  },
  {
    id: "d-scout",
    kind: "dm",
    agents: ["scout"],
    busy: [],
    queue: [],
    unread: 0,
    msgs: [
      message("me", "Which keywords should the payouts page target?", 30),
      message(
        "scout",
        "Primary: **get paid faster freelancer**, 2.9k searches a month, difficulty 31. Secondaries:\n\n- `instant payout invoice`: 880/mo, low difficulty, high intent\n- `how long do invoice payments take`: 1.6k/mo, good for the FAQ\n- `freelance payment app`: 4.4k/mo, crowded, skip for now\n\nTitle tag draft: `Instant Payouts: Get Paid in Minutes | Juniper` (52 characters).",
        29.9,
      ),
    ],
  },
  {
    id: "d-bastion",
    kind: "dm",
    agents: ["bastion"],
    busy: [],
    queue: [],
    unread: 0,
    msgs: [
      message("me", "Anything blocking on the payouts webhook?", 28),
      message(
        "bastion",
        `One blocker, two nits.

**Blocking:** the handler trusts \`payout.status\` from the body before verifying the signature. Verify first, then parse.

\`\`\`ts
const sig = req.headers["juniper-signature"];
if (!verify(rawBody, sig, secret, { toleranceSec: 300 })) {
  return res.status(400).end();
}
const event = JSON.parse(rawBody);
\`\`\`

**Nits:** log the event id, not the payload (it carries bank details), and make the handler idempotent on \`event.id\`.`,
        27.9,
      ),
      message("me", "Fixed in #482.", 8),
      message("bastion", "Checked. Signature first, idempotency key kept for 72 hours. Unblocked.", 7.9),
    ],
  },
  {
    id: "d-cirrus",
    kind: "dm",
    agents: ["cirrus"],
    busy: [],
    queue: [],
    unread: 0,
    msgs: [
      message(
        "cirrus",
        "Heads-up: payout queue p95 went from 1.2s to 6.8s at 14:05 when the batch export started. They share a worker pool.",
        20,
      ),
      message("me", "Can we split them?", 19.6),
      message(
        "cirrus",
        `Yes. Payouts get their own queue and the export is capped at 4 workers.

\`\`\`yaml
queues:
  payouts:
    workers: { min: 2, max: 12, per_backlog: 50 }
  exports:
    workers: { min: 1, max: 4 }
\`\`\`

Expected p95 back under 1.5s. Cost: about $38 a month more.`,
        19.5,
      ),
    ],
  },
  {
    id: "d-pip",
    kind: "dm",
    agents: ["pip"],
    busy: [],
    queue: [],
    unread: 0,
    msgs: [
      message("me", "How's activation looking this week?", 47),
      message(
        "pip",
        "Week-one activation is **41.8%**, down from 44.2%. The drop sits in one step: connecting a bank account fell from 78% to 71%, almost all on mobile Safari. It started Tuesday, the day the bank-link redesign shipped.",
        46.9,
      ),
    ],
  },
  {
    id: "d-juno",
    kind: "dm",
    agents: ["juno"],
    busy: [],
    queue: [],
    unread: 0,
    msgs: [
      message(
        "juno",
        `Launch checklist for Thursday: 8 of 12 done.

- Pricing page copy (Quill): done
- Webhook fix (Theo): done
- Hero build (Amara): in review
- Support macros (Lucia): not started

The one I'd worry about is support macros. Want me to nudge Lucia?`,
        9,
      ),
      message("me", "Yes please.", 8.8),
      message(
        "juno",
        "Done. She'll have drafts by Wednesday noon, and I put 30 minutes on your calendar Wednesday at 15:00 to review them.",
        8.7,
      ),
    ],
  },
];

export const SAMPLE_FILES = [
  {
    name: "launch-brief.pdf",
    size: "2.1 MB",
    icon: "ph:file-pdf",
  },
  {
    name: "payouts-funnel.csv",
    size: "184 KB",
    icon: "ph:file-csv",
  },
  {
    name: "hero-v3.png",
    size: "1.4 MB",
    icon: "ph:file-image",
  },
];

export const PLUGIN_CATEGORIES = [
  {
    id: "market",
    label: "Marketplace",
    icon: "ph:storefront",
  },
  {
    id: "plugins",
    label: "Plugins",
    icon: "ph:puzzle-piece",
  },
  {
    id: "models",
    label: "Models",
    icon: "ph:cpu",
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: "ph:sliders-horizontal",
  },
  {
    id: "members",
    label: "Members",
    icon: "ph:users",
  },
] as const;

/** The settings sheet's tabs. */
export type SettingsTab = (typeof PLUGIN_CATEGORIES)[number]["id"];

export const NEW_AGENT_NAMES = ["Nova", "Olive", "Ziggy", "Basil", "Marlo", "Kit"];

/**
 * Everything Wharf says lives here: the chains on the hero map, the tokens in the checkout demo, the four rails,
 * the volume chart, the security points and the FAQ. Wharf, its customers and every figure are invented sample
 * content; replace them with your own.
 */
import type { ComponentType } from "react";
import { AcceptArt, GasArt, ReconcileArt, RouteArt } from "./rail-art";
import { AuditArt, KeysArt, UptimeArt } from "./security";
import type { IconName } from "./ui";
/** An illustration that wakes up while its card is hot (pointed at) and once it is on screen. */
export type ArtProps = { hot: boolean; on: boolean };

/** [label, id of the section it scrolls to] */
export const NAV_LINKS: [label: string, section: string][] = [
  ["Product", "how"],
  ["Rails", "rails"],
  ["Developers", "developers"],
  ["Customers", "customers"],
  ["Security", "security"],
];
/** A chain on the hero map: where its cloud of dots sits (0 to 1 of the map), how big it is and how much it ripples. */
export type Chain = { id: string; name: string; x: number; y: number; rx: number; ry: number; amp: number; src?: boolean };

export const CHAINS: Chain[] = [
  {
    id: "eth",
    name: "ETH",
    x: 0.13,
    y: 0.5,
    rx: 0.065,
    ry: 0.035,
    amp: 26,
    src: true,
  },
  {
    id: "arb",
    name: "ARB",
    x: 0.33,
    y: 0.3,
    rx: 0.085,
    ry: 0.05,
    amp: 40,
    src: true,
  },
  {
    id: "base",
    name: "BASE",
    x: 0.8,
    y: 0.21,
    rx: 0.07,
    ry: 0.04,
    amp: 32,
    src: true,
  },
  {
    id: "op",
    name: "OP",
    x: 0.91,
    y: 0.47,
    rx: 0.05,
    ry: 0.03,
    amp: 22,
    src: true,
  },
  {
    id: "sol",
    name: "SOL",
    x: 0.09,
    y: 0.22,
    rx: 0.055,
    ry: 0.03,
    amp: 22,
    src: true,
  },
  {
    id: "tre",
    name: "TREASURY",
    x: 0.62,
    y: 0.79,
    rx: 0.3,
    ry: 0.15,
    amp: 120,
  },
];
/** [from, through]: the routes the hero demo sends money along, into the treasury */
export const CORRIDORS: [from: string, hop: string][] = [
  ["base", "arb"],
  ["eth", "arb"],
  ["op", "base"],
  ["sol", "eth"],
];
export const CORRIDOR_AMOUNTS: number[] = [48210, 12650.5, 250000, 3120.75];
export type Token = { bal: number; usd: number; col: string; gas: string };

/** The tokens the checkout demo can pay with: wallet balance, price in USD, colour and the gas it would cost. */
export const TOKENS: Record<string, Token> = {
  USDT: {
    bal: 1204,
    usd: 1,
    col: "#26A17B",
    gas: "0.0021 ETH",
  },
  ETH: {
    bal: 1.84,
    usd: 3120,
    col: "#5B6BDB",
    gas: "0.0018 ETH",
  },
  SOL: {
    bal: 42.5,
    usd: 168.4,
    col: "#9A5CF5",
    gas: "0.00004 SOL",
  },
};
export const HOW_STEPS: [title: string, body: string][] = [
  ["Accept", "Take whatever the wallet holds."],
  ["Route", "Find the cheapest path across 30 chains."],
  ["Sponsor", "Cover the gas so no payment fails."],
  ["Settle", "Land stablecoins, reconciled to the block."],
];
/** [amount, token, USDC out] for the Settle illustration */
export const SWAP_ROWS: [amount: string, token: string, out: string][] = [
  ["250.00", "USDT", "249.70"],
  ["0.0800", "ETH", "249.31"],
  ["1.4800", "SOL", "248.92"],
  ["310.00", "ARB", "249.05"],
  ["2,410.0", "POL", "249.66"],
];
/** [date, from, amount, status]: 0 matched straight away, 2 needed a retry (the Ledger illustration) */
export const LEDGER_IN: [date: string, from: string, amount: string, status: number][] = [
  ["09·21", "Northwind", "1,204.00", 0],
  ["09·21", "Kiln Pay", "88.10", 0],
  ["09·22", "Brightwater", "3,400.00", 0],
  ["09·22", "Retry · gas", "612.35", 2],
  ["09·23", "Sorrel", "61.75", 0],
  ["09·23", "Tessellate", "912.40", 0],
  ["09·23", "Corvid", "40.00", 0],
];
export const LEDGER_OUT: [date: string, to: string, amount: string][] = [
  ["09·24", "Payout · Base", "1,050.00"],
  ["09·24", "Fee", "44.20"],
  ["09·25", "Payout · OP", "480.00"],
  ["09·25", "Payout · Arb", "2,318.60"],
  ["09·26", "Refund 2811", "97.00"],
  ["09·26", "Payout · Base", "730.15"],
  ["09·27", "Order 2841", "250.00"],
];
export type Rail = { n: string; d: string; Art: ComponentType<ArtProps> };

export const RAILS: Rail[] = [
  {
    n: "Settle API",
    d: "Any token in, stablecoins out.",
    Art: AcceptArt,
  },
  {
    n: "Route API",
    d: "One quote across 30 chains.",
    Art: RouteArt,
  },
  {
    n: "Sponsor API",
    d: "Gasless payments, paid for per app.",
    Art: GasArt,
  },
  {
    n: "Ledger",
    d: "Revenue, failures and payouts in one view.",
    Art: ReconcileArt,
  },
];
export const CUSTOMER_LOGOS: [name: string, icon: IconName][] = [
  ["Brightwater", "ph:waves"],
  ["Kiln Pay", "ph:lightning"],
  ["Tessellate", "ph:squares-four"],
  ["Corvid Exchange", "ph:chart-line-up"],
  ["Sorrel Finance", "ph:feather"],
  ["Northwind Treasury", "ph:compass"],
];
export const VOLUME = [
  564, 645, 694, 782, 875, 1040, 1140, 1250, 1340, 1440, 1590, 1760, 1910, 2100, 2210, 2400, 2570, 2820, 3000, 3230,
  3410, 3650, 3920, 4200,
];
export const MONTHS = [
  "Oct 2024",
  "Nov 2024",
  "Dec 2024",
  "Jan 2025",
  "Feb 2025",
  "Mar 2025",
  "Apr 2025",
  "May 2025",
  "Jun 2025",
  "Jul 2025",
  "Aug 2025",
  "Sep 2025",
  "Oct 2025",
  "Nov 2025",
  "Dec 2025",
  "Jan 2026",
  "Feb 2026",
  "Mar 2026",
  "Apr 2026",
  "May 2026",
  "Jun 2026",
  "Jul 2026",
  "Aug 2026",
  "Sep 2026",
];
/** 4200 (millions) to "$4.2B"; under a billion stays in millions */
export const formatVolume = (millions: number) =>
  millions >= 1000
    ? `$${(millions / 1000).toFixed(millions % 1000 === 0 ? 0 : 2).replace(/0$/, "")}B`
    : `$${millions}M`;
export type SecurityPoint = { n: string; d: string; l: string; Art: ComponentType<{ hot: boolean }> };

export const SECURITY_POINTS: SecurityPoint[] = [
  {
    n: "Audited",
    d: "Three independent audits. Reports are public.",
    l: "Read the reports",
    Art: AuditArt,
  },
  {
    n: "Always on",
    d: "99.99% uptime, trailing twelve months.",
    l: "Status page",
    Art: UptimeArt,
  },
  {
    n: "Your keys",
    d: "Non-custodial by default. You hold the keys.",
    l: "How custody works",
    Art: KeysArt,
  },
];
export const FAQS: [question: string, answer: string][] = [
  [
    "How fast can we go live?",
    "Most teams settle a first sandbox payment the same afternoon. Sandbox quotes match mainnet, so going live is a key swap, not a rewrite.",
  ],
  [
    "Which chains and tokens are supported?",
    "Thirty chains today, including every major EVM network and Solana, with any token that has on-chain liquidity. The list grows every month.",
  ],
  [
    "How does gas sponsorship work?",
    "You set a budget per app. Wharf pays the gas on each transfer and bills you monthly at cost, with a per-transfer line in the ledger.",
  ],
  [
    "What does Wharf cost?",
    "A flat 0.12% per settled transfer, with volume pricing above $10M a month. No setup fees, no minimums.",
  ],
  ["Is Wharf custodial?", "No. Funds move from your users' wallets to yours. Wharf never holds the money or the keys."],
];

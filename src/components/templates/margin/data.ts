import type { IconName } from "./icons";
import { LEDGERLY_SCREENSHOT, OVERLAP_SCREENSHOT, QUIET_SCREENSHOT, TIDAL_SCREENSHOT } from "./screenshots";

/**
 * Everything the page says, in one place. Replace these values with your own; the sections read them and
 * nothing else. The person, studio and products are invented.
 */

export const PROFILE = {
  name: "Mira Kale",
  initials: "MK",
  role: "Design engineer",
  company: "Northlight",
  city: "Bengaluru",
  /** IANA time zone used for the live local clock in the header and the "Now" card. */
  timeZone: "Asia/Kolkata",
  /** Shown as "@handle" over the contribution graph. */
  handle: "mirakale",
  email: "hello@mirakale.studio",
  /** Set in the banner at the top of the page. */
  quote: "Make the first click feel like the hundredth.",
  copyright: "© 2026 Mira Kale.",
  madeIn: "Made in Bengaluru",
  shippedDate: "November 4, 2026",
} as const;

export type StackItem = { icon: IconName; name: string; color: string };

export type Experience = {
  company: string;
  role: string;
  kind: string;
  location: string;
  period: string;
  duration: string;
  current: boolean;
  logo: { icon: IconName; color: string };
  summary: string;
  highlights: { icon: IconName; title: string; text: string }[];
  stack: StackItem[];
};

const FIGMA: StackItem = { icon: "si:figma", name: "Figma", color: "#f24e1e" };
const REACT: StackItem = { icon: "si:react", name: "React", color: "#58c4dc" };
const SWIFT: StackItem = { icon: "si:swift", name: "Swift", color: "#f05138" };

export const EXPERIENCE: Experience[] = [
  {
    company: "Northlight",
    role: "Founder",
    kind: "Studio",
    location: "Bengaluru",
    period: "2024 – Present",
    duration: "2 yrs",
    current: true,
    logo: { icon: "ph:lighthouse-duotone", color: "#0d9488" },
    summary: "A two-person studio that designs and builds first versions for early-stage teams.",
    highlights: [
      { icon: "ph:rocket-launch", title: "14 launches", text: "From first sketch to App Store or production." },
      { icon: "ph:users-three", title: "Seed to Series A", text: "Teams of three to thirty, mostly founders." },
      { icon: "ph:lightning", title: "Six-week cycles", text: "One product, one shipped version, then a handover." },
    ],
    stack: [SWIFT, REACT, FIGMA],
  },
  {
    company: "Kitebook",
    role: "Senior design engineer",
    kind: "Full-time",
    location: "Bengaluru",
    period: "2021 – 2024",
    duration: "3 yrs",
    current: false,
    logo: { icon: "ph:book-open-duotone", color: "#ea580c" },
    summary: "Owned the design system across web and iOS for a team of forty.",
    highlights: [
      { icon: "ph:squares-four", title: "60 components", text: "Each shipped with a motion spec and a11y notes." },
      { icon: "ph:bug-beetle", title: "A third fewer UI bugs", text: "Reaching production, after visual tests in CI." },
      { icon: "ph:eye", title: "Weekly review", text: "Ran the design and code review for five squads." },
    ],
    stack: [REACT, { icon: "si:typescript", name: "TypeScript", color: "#3178c6" }, SWIFT, FIGMA],
  },
  {
    company: "Meridian",
    role: "Design intern",
    kind: "Internship",
    location: "Pune",
    period: "Jun 2020 – Jan 2021",
    duration: "8 mos",
    current: false,
    logo: { icon: "ph:compass-duotone", color: "#3b82f6" },
    summary: "Prototyped offline maps for the hiking app redesign.",
    highlights: [
      { icon: "ph:chats-circle", title: "40 interviews", text: "Ran on a prototype I built in Framer." },
      { icon: "ph:download-simple", title: "Offline downloads", text: "Designed the flow that shipped in v4." },
    ],
    stack: [FIGMA, { icon: "si:framer", name: "Framer", color: "#0099ff" }],
  },
];

export type Project = {
  name: string;
  summary: string;
  screenshot: string;
  /** Pale background shown behind the screenshot on hover. */
  tint: string;
  /** Deeper shade of the same hue, blended into the hover background. */
  ink: string;
  tags: string[];
};

export const PROJECTS: Project[] = [
  {
    name: "Tidal",
    summary: "Wind, tide and swell for small-boat sailors, readable with wet hands.",
    screenshot: TIDAL_SCREENSHOT,
    tint: "#e6f0fb",
    ink: "#0071e3",
    tags: ["SwiftUI", "Charts", "WeatherKit", "Offline", "Haptics"],
  },
  {
    name: "Ledgerly",
    summary: "Send an invoice in under a minute and know the day it gets paid.",
    screenshot: LEDGERLY_SCREENSHOT,
    tint: "#e6f3e9",
    ink: "#248a3d",
    tags: ["Next.js", "Stripe", "PDF", "Postgres"],
  },
  {
    name: "Overlap",
    summary: "Finds the hours that work for a team spread across three time zones.",
    screenshot: OVERLAP_SCREENSHOT,
    tint: "#f1e8fb",
    ink: "#8e44d8",
    tags: ["React", "Temporal", "Calendar API", "Edge"],
  },
  {
    name: "Quiet",
    summary: "A focus timer that lives in the Mac menu bar and stays out of the way.",
    screenshot: QUIET_SCREENSHOT,
    tint: "#ecebfd",
    ink: "#5e5ce6",
    tags: ["SwiftUI", "AppKit", "Focus API", "Widgets"],
  },
];

export const WRITING = [
  { title: "Springs, not durations: describing how heavy things are", minutes: 6 },
  { title: "The empty state is the onboarding nobody designed", minutes: 4 },
  { title: "What a menu bar app taught me about restraint", minutes: 7 },
];

export const NOW_ITEMS: { icon: IconName; label: string; text: string }[] = [
  { icon: "ph:hammer", label: "Building", text: "Quiet 2.0, with sessions that sync to iPhone" },
  { icon: "ph:lightbulb", label: "Learning", text: "Metal shaders, slowly" },
  { icon: "ph:book-open", label: "Reading", text: "The Elements of Typographic Style" },
];

/** Tools in the scrolling strip. A colour of `var(--fg)` follows the page's text colour in both themes. */
export const STACK: StackItem[] = [
  FIGMA,
  { icon: "si:framer", name: "Framer", color: "#0099ff" },
  REACT,
  { icon: "si:nextdotjs", name: "Next.js", color: "var(--fg)" },
  { icon: "si:typescript", name: "TypeScript", color: "#3178c6" },
  { icon: "si:tailwindcss", name: "Tailwind", color: "#38bdf8" },
  SWIFT,
  { icon: "si:nodedotjs", name: "Node.js", color: "#5fa04e" },
  { icon: "si:postgresql", name: "Postgres", color: "#4169e1" },
  { icon: "si:supabase", name: "Supabase", color: "#3ecf8e" },
  { icon: "si:redis", name: "Redis", color: "#ff4438" },
  { icon: "si:docker", name: "Docker", color: "#1d63ed" },
  { icon: "si:git", name: "Git", color: "#f05032" },
  { icon: "si:vercel", name: "Vercel", color: "var(--fg)" },
  { icon: "si:linear", name: "Linear", color: "#5e6ad2" },
];

export const SHIPPED = [
  {
    title: "Ledgerly: reminders that sound like you",
    date: "Oct 2026",
    text: "Follow-ups now go out in your own words, on a schedule you set.",
  },
  {
    title: "Tidal: offline tide tables for 1,400 harbours",
    date: "Aug 2026",
    text: "Precomputed a year of tides into 3 MB so the app works at sea.",
  },
  {
    title: "Overlap: one link that books the shared hour",
    date: "Jun 2026",
    text: "Guests pick a slot in their own time zone; nobody does the maths.",
  },
];

/** Replace `#` with your real profile and resume URLs. */
export const LINKS: { label: string; icon: IconName; href: string }[] = [
  { label: "GitHub", icon: "ph:github-logo", href: "https://github.com" },
  { label: "LinkedIn", icon: "ph:linkedin-logo", href: "https://linkedin.com" },
  { label: "Resume", icon: "ph:paperclip", href: "#" },
];

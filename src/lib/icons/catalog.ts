import type { SoundName } from "@/lib/ui-sounds";

/**
 * The animated icon catalog: one entry per icon file in src/components/nx-icons/icons.
 * The slug is the file name; `component` is the exported React component.
 */

export type IconCategory = "loaders" | "interface" | "communication" | "commerce" | "devices";

export type IconMeta = {
  slug: string;
  /** The exported component, e.g. BellIcon. */
  component: string;
  /** Display name, e.g. Bell. */
  title: string;
  category: IconCategory;
  /** loop: plays on its own, forever. hover: plays while the pointer is over it. */
  kind: "loop" | "hover";
  /** The colour of its accent details when the Spark look is on. */
  accent: string;
  /** The interface sound that suits it, played when it is triggered (none for loaders). */
  sound?: SoundName;
  /** An icon driven by a state prop lists its states here. */
  states?: string[];
  tags: string[];
  description: string;
  createdAt: string;
  premium?: boolean;
};

export const ICON_CATEGORIES: { slug: IconCategory; label: string; blurb: string }[] = [
  { slug: "loaders", label: "Loaders", blurb: "Spinners, dots and waiting indicators that loop on their own." },
  { slug: "interface", label: "Interface", blurb: "Everyday controls: search, copy, settings, check and more." },
  { slug: "communication", label: "Communication", blurb: "Mail, alerts, likes and sharing." },
  { slug: "commerce", label: "Commerce", blurb: "Carts, coins and deliveries." },
  { slug: "devices", label: "Devices", blurb: "Batteries, cameras and hardware." },
];

export const ICONS: IconMeta[] = [
  { slug: "arc-spinner", component: "ArcSpinnerIcon", title: "Arc Spinner", category: "loaders", kind: "loop", accent: "#0a84ff", tags: ["spinner", "loading", "circle", "progress", "material"], description: "A ring with an arc that grows and shrinks as it turns, the classic loading spinner.", createdAt: "2026-10-31" },
  { slug: "tick-spinner", component: "TickSpinnerIcon", title: "Tick Spinner", category: "loaders", kind: "loop", accent: "#0a84ff", tags: ["spinner", "loading", "activity", "ios", "ticks"], description: "Eight ticks that light up in turn and fade behind, like the activity indicator on a phone. The leading tick takes the accent colour.", createdAt: "2026-10-31" },
  { slug: "wave-dots", component: "WaveDotsIcon", title: "Wave Dots", category: "loaders", kind: "loop", accent: "#ff375f", tags: ["dots", "loading", "typing", "wave", "bounce"], description: "Three dots that bounce one after another in a rolling wave, the middle one in the accent colour.", createdAt: "2026-10-31" },
  { slug: "pulse-dots", component: "PulseDotsIcon", title: "Pulse Dots", category: "loaders", kind: "loop", accent: "#bf5af2", tags: ["dots", "loading", "pulse", "fade"], description: "Three dots that swell and fade in sequence.", createdAt: "2026-10-31" },
  { slug: "ripple", component: "RippleIcon", title: "Ripple", category: "loaders", kind: "loop", accent: "#0a84ff", tags: ["ripple", "loading", "pulse", "circles", "radar", "fade circles"], description: "Rings that spread out from a dot and fade, one after the other.", createdAt: "2026-10-31" },
  { slug: "orbit", component: "OrbitIcon", title: "Orbit", category: "loaders", kind: "loop", accent: "#ff9f0a", tags: ["orbit", "loading", "circle", "planet", "satellite"], description: "A small dot that circles a ring around a beating centre.", createdAt: "2026-10-31" },
  { slug: "bouncing-ball", component: "BouncingBallIcon", title: "Bouncing Ball", category: "loaders", kind: "loop", accent: "#ff375f", tags: ["ball", "loading", "bounce", "physics", "squash"], description: "A ball that falls, squashes on the ground and bounces back, with a shadow that follows.", createdAt: "2026-10-31" },
  { slug: "hourglass", component: "HourglassIcon", title: "Hourglass", category: "loaders", kind: "loop", accent: "#ff9f0a", tags: ["hourglass", "loading", "time", "wait", "sand", "timer"], description: "An hourglass whose sand runs down, then flips over and starts again.", createdAt: "2026-10-31" },
  { slug: "clock", component: "ClockIcon", title: "Clock", category: "loaders", kind: "loop", accent: "#ff3b30", tags: ["clock", "time", "loading", "watch", "hands", "timer"], description: "A clock face whose hands sweep round at different speeds, the minute hand in the accent colour.", createdAt: "2026-10-31" },
  { slug: "wifi-scan", component: "WifiScanIcon", title: "Wi-Fi Scan", category: "loaders", kind: "loop", accent: "#30d158", tags: ["wifi", "wireless", "signal", "scanning", "connecting", "network", "loading"], description: "Wi-Fi arcs that light up from the dot outward, as if searching for a network.", createdAt: "2026-10-31" },
  { slug: "bell", component: "BellIcon", title: "Bell", category: "communication", kind: "hover", accent: "#ff3b30", sound: "ping", tags: ["bell", "notification", "alert", "ring", "swing", "reminder", "badge"], description: "A bell that winds up, swings and rings, while a notification badge pops onto it.", createdAt: "2026-10-31" },
  { slug: "heart", component: "HeartIcon", title: "Heart", category: "communication", kind: "hover", accent: "#ff375f", sound: "pop", tags: ["heart", "like", "favorite", "love", "beat", "pulse", "hearts"], description: "A heart that beats and fills in, while three little hearts float away from it.", createdAt: "2026-10-31" },
  { slug: "search", component: "SearchIcon", title: "Search", category: "interface", kind: "hover", accent: "#0a84ff", sound: "tick", tags: ["search", "magnifier", "find", "lens", "zoom"], description: "A magnifying glass that tilts as it looks, with a glint that sweeps across the lens.", createdAt: "2026-10-31" },
  { slug: "mail", component: "MailIcon", title: "Mail", category: "communication", kind: "hover", accent: "#0a84ff", sound: "chime", tags: ["mail", "email", "envelope", "message", "inbox", "letter"], description: "An envelope whose flap opens to show the letter inside.", createdAt: "2026-10-31" },
  { slug: "home", component: "HomeIcon", title: "Home", category: "interface", kind: "hover", accent: "#ff9f0a", sound: "knock", tags: ["home", "house", "building", "door", "homepage", "windows"], description: "A house that hops, opens its door and switches its windows on.", createdAt: "2026-10-31" },
  { slug: "download", component: "DownloadIcon", title: "Download", category: "interface", kind: "hover", accent: "#30d158", sound: "drop", tags: ["download", "arrow", "save", "import", "tray", "get"], description: "An arrow that drops into a tray, which lights up as it lands, then comes back for the next file.", createdAt: "2026-10-31" },
  { slug: "share", component: "ShareIcon", title: "Share", category: "communication", kind: "hover", accent: "#0a84ff", sound: "whoosh", tags: ["share", "send", "export", "upload", "arrow", "forward"], description: "An arrow that lifts out of a box, ready to be sent somewhere.", createdAt: "2026-10-31" },
  { slug: "check-circle", component: "CheckCircleIcon", title: "Check Circle", category: "interface", kind: "hover", accent: "#30d158", sound: "success", tags: ["check", "tick", "done", "success", "confirm", "complete"], description: "A circled tick that pops, draws itself in and sends out a ring.", createdAt: "2026-10-31" },
  { slug: "copy", component: "CopyIcon", title: "Copy", category: "interface", kind: "hover", accent: "#30d158", sound: "tap", tags: ["copy", "duplicate", "clipboard", "clone", "paste"], description: "A second sheet that slides out from behind and ticks to say it is copied.", createdAt: "2026-10-31" },
  { slug: "settings", component: "SettingsIcon", title: "Settings", category: "interface", kind: "hover", accent: "#bf5af2", sound: "step", tags: ["settings", "gear", "cog", "preferences", "options", "config", "gears"], description: "Two gears that mesh and turn against each other, the small one in the accent colour.", createdAt: "2026-10-31" },
  { slug: "trash", component: "TrashIcon", title: "Trash", category: "interface", kind: "hover", accent: "#ff3b30", sound: "knock", tags: ["trash", "delete", "bin", "remove", "garbage", "discard", "paper"], description: "A bin whose lid opens, catches a crumpled paper and closes again.", createdAt: "2026-10-31" },
  { slug: "shopping-cart", component: "ShoppingCartIcon", title: "Shopping Cart", category: "commerce", kind: "hover", accent: "#ff9f0a", sound: "pop", tags: ["cart", "shopping", "basket", "ecommerce", "buy", "store"], description: "A cart that rolls forward as an item drops in.", createdAt: "2026-10-31" },
  { slug: "battery", component: "BatteryIcon", title: "Battery", category: "devices", kind: "hover", accent: "#30d158", sound: "charge", tags: ["battery", "charging", "power", "charge", "energy", "level"], description: "A battery whose bars fill one by one, as if charging.", createdAt: "2026-10-31" },
  { slug: "camera", component: "CameraIcon", title: "Camera", category: "devices", kind: "hover", accent: "#ff9f0a", sound: "tick", tags: ["camera", "photo", "picture", "shutter", "snapshot", "capture", "flash"], description: "A camera whose lens snaps shut and open, followed by a burst of flash.", createdAt: "2026-10-31" },
  { slug: "coin", component: "CoinIcon", title: "Coin", category: "commerce", kind: "hover", accent: "#ffd60a", sound: "paid", tags: ["coin", "money", "currency", "dollar", "payment", "flip", "price", "sparkle"], description: "A coin that flips over twice and lands with a sparkle.", createdAt: "2026-10-31" },
  { slug: "truck", component: "TruckIcon", title: "Truck", category: "commerce", kind: "hover", accent: "#0a84ff", sound: "whoosh", tags: ["truck", "delivery", "shipping", "van", "transport", "logistics", "fast"], description: "A delivery truck that rattles along, with speed lines streaming behind it.", createdAt: "2026-10-31" },
  { slug: "send", component: "SendIcon", title: "Send", category: "communication", kind: "hover", accent: "#0a84ff", sound: "whoosh", tags: ["send", "paper plane", "message", "submit", "fly", "plane", "deliver"], description: "A paper plane that takes off, leaves a trail and flies back in for the next message.", createdAt: "2026-10-31" },
  { slug: "status", component: "StatusIcon", title: "Status", category: "interface", kind: "hover", accent: "#30d158", sound: "success", states: ["idle", "loading", "success", "error"], tags: ["status", "loading", "success", "error", "state", "progress", "morph", "validation"], description: "One icon for the whole journey: a ring that spins while loading, closes into a tick on success, or crosses out and shakes on error.", createdAt: "2026-10-31" },
];

export function getIcon(slug: string) {
  return ICONS.find((i) => i.slug === slug) ?? null;
}

export function getCategory(slug: string) {
  return ICON_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

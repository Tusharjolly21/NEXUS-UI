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
  { slug: "arc-spinner", component: "ArcSpinnerIcon", title: "Arc Spinner", category: "loaders", kind: "loop", tags: ["spinner", "loading", "circle", "progress", "material"], description: "A ring with an arc that grows and shrinks as it turns, the classic loading spinner.", createdAt: "2026-10-31" },
  { slug: "tick-spinner", component: "TickSpinnerIcon", title: "Tick Spinner", category: "loaders", kind: "loop", tags: ["spinner", "loading", "activity", "ios", "ticks"], description: "Eight ticks that light up in turn and fade behind, like the activity indicator on a phone.", createdAt: "2026-10-31" },
  { slug: "wave-dots", component: "WaveDotsIcon", title: "Wave Dots", category: "loaders", kind: "loop", tags: ["dots", "loading", "typing", "wave", "bounce"], description: "Three dots that bounce one after another in a rolling wave.", createdAt: "2026-10-31" },
  { slug: "pulse-dots", component: "PulseDotsIcon", title: "Pulse Dots", category: "loaders", kind: "loop", tags: ["dots", "loading", "pulse", "fade"], description: "Three dots that swell and fade in sequence.", createdAt: "2026-10-31" },
  { slug: "ripple", component: "RippleIcon", title: "Ripple", category: "loaders", kind: "loop", tags: ["ripple", "loading", "pulse", "circles", "radar", "fade circles"], description: "Rings that spread out from a dot and fade, one after the other.", createdAt: "2026-10-31" },
  { slug: "orbit", component: "OrbitIcon", title: "Orbit", category: "loaders", kind: "loop", tags: ["orbit", "loading", "circle", "planet", "satellite"], description: "A small dot that circles a ring around a beating centre.", createdAt: "2026-10-31" },
  { slug: "bouncing-ball", component: "BouncingBallIcon", title: "Bouncing Ball", category: "loaders", kind: "loop", tags: ["ball", "loading", "bounce", "physics", "squash"], description: "A ball that falls, squashes on the ground and bounces back, with a shadow that follows.", createdAt: "2026-10-31" },
  { slug: "hourglass", component: "HourglassIcon", title: "Hourglass", category: "loaders", kind: "loop", tags: ["hourglass", "loading", "time", "wait", "sand", "timer"], description: "An hourglass whose sand runs down, then flips over and starts again.", createdAt: "2026-10-31" },
  { slug: "clock", component: "ClockIcon", title: "Clock", category: "loaders", kind: "loop", tags: ["clock", "time", "loading", "watch", "hands", "timer"], description: "A clock face whose hands sweep round at different speeds.", createdAt: "2026-10-31" },
  { slug: "wifi-scan", component: "WifiScanIcon", title: "Wi-Fi Scan", category: "loaders", kind: "loop", tags: ["wifi", "wireless", "signal", "scanning", "connecting", "network", "loading"], description: "Wi-Fi arcs that light up from the dot outward, as if searching for a network.", createdAt: "2026-10-31" },
  { slug: "bell", component: "BellIcon", title: "Bell", category: "communication", kind: "hover", tags: ["bell", "notification", "alert", "ring", "swing", "reminder"], description: "A bell that swings back and forth, settling like it just rang.", createdAt: "2026-10-31" },
  { slug: "heart", component: "HeartIcon", title: "Heart", category: "communication", kind: "hover", tags: ["heart", "like", "favorite", "love", "beat", "pulse"], description: "A heart that beats and fills in, for likes and favourites.", createdAt: "2026-10-31" },
  { slug: "search", component: "SearchIcon", title: "Search", category: "interface", kind: "hover", tags: ["search", "magnifier", "find", "lens", "zoom"], description: "A magnifying glass that tilts as it looks, with a glint on the lens.", createdAt: "2026-10-31" },
  { slug: "mail", component: "MailIcon", title: "Mail", category: "communication", kind: "hover", tags: ["mail", "email", "envelope", "message", "inbox", "letter"], description: "An envelope whose flap opens to show the letter inside.", createdAt: "2026-10-31" },
  { slug: "home", component: "HomeIcon", title: "Home", category: "interface", kind: "hover", tags: ["home", "house", "building", "door", "homepage"], description: "A house that hops and opens its door.", createdAt: "2026-10-31" },
  { slug: "download", component: "DownloadIcon", title: "Download", category: "interface", kind: "hover", tags: ["download", "arrow", "save", "import", "tray", "get"], description: "An arrow that drops into a tray and comes back for the next file.", createdAt: "2026-10-31" },
  { slug: "share", component: "ShareIcon", title: "Share", category: "communication", kind: "hover", tags: ["share", "send", "export", "upload", "arrow", "forward"], description: "An arrow that lifts out of a box, ready to be sent somewhere.", createdAt: "2026-10-31" },
  { slug: "check-circle", component: "CheckCircleIcon", title: "Check Circle", category: "interface", kind: "hover", tags: ["check", "tick", "done", "success", "confirm", "complete"], description: "A circled tick that pops and draws itself in.", createdAt: "2026-10-31" },
  { slug: "copy", component: "CopyIcon", title: "Copy", category: "interface", kind: "hover", tags: ["copy", "duplicate", "clipboard", "clone", "paste"], description: "A second sheet that slides out from behind and ticks to say it is copied.", createdAt: "2026-10-31" },
  { slug: "settings", component: "SettingsIcon", title: "Settings", category: "interface", kind: "hover", tags: ["settings", "gear", "cog", "preferences", "options", "config"], description: "A gear that turns a quarter and settles with a spring.", createdAt: "2026-10-31" },
  { slug: "trash", component: "TrashIcon", title: "Trash", category: "interface", kind: "hover", tags: ["trash", "delete", "bin", "remove", "garbage", "discard"], description: "A bin whose lid flips open.", createdAt: "2026-10-31" },
  { slug: "shopping-cart", component: "ShoppingCartIcon", title: "Shopping Cart", category: "commerce", kind: "hover", tags: ["cart", "shopping", "basket", "ecommerce", "buy", "store"], description: "A cart that rolls forward as an item drops in.", createdAt: "2026-10-31" },
  { slug: "battery", component: "BatteryIcon", title: "Battery", category: "devices", kind: "hover", tags: ["battery", "charging", "power", "charge", "energy", "level"], description: "A battery whose bars fill one by one, as if charging.", createdAt: "2026-10-31" },
  { slug: "camera", component: "CameraIcon", title: "Camera", category: "devices", kind: "hover", tags: ["camera", "photo", "picture", "shutter", "snapshot", "capture"], description: "A camera whose lens snaps shut and open, with a flash.", createdAt: "2026-10-31" },
  { slug: "coin", component: "CoinIcon", title: "Coin", category: "commerce", kind: "hover", tags: ["coin", "money", "currency", "dollar", "payment", "flip", "price"], description: "A coin that flips over twice and lands.", createdAt: "2026-10-31" },
  { slug: "truck", component: "TruckIcon", title: "Truck", category: "commerce", kind: "hover", tags: ["truck", "delivery", "shipping", "van", "transport", "logistics", "fast"], description: "A delivery truck that rattles along, with speed lines streaming behind it.", createdAt: "2026-10-31" },
];

export function getIcon(slug: string) {
  return ICONS.find((i) => i.slug === slug) ?? null;
}

export function getCategory(slug: string) {
  return ICON_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

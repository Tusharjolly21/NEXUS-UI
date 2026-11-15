import type { Transition } from "framer-motion";

export const FONT_SANS = "'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";

export const COLORS = {
  bg: "#0C0C0E",
  side: "#0F0F12",
  panel: "#121215",
  raise: "#19191D",
  raise2: "#212126",
  line: "rgba(255,255,255,.07)",
  line2: "rgba(255,255,255,.11)",
  line3: "rgba(255,255,255,.16)",
  ink: "#EDEDEF",
  text: "#A9A9B2",
  soft: "#80808A",
  faint: "#4A4A53",
  acc: "#D4F26A",
  accInk: "#141905",
  accSoft: "rgba(212,242,106,.12)",
  danger: "#FF8080",
  ok: "#7DDB9A",
};

export const SPRING: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.7,
};

export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
};

/** Inter and Geist Mono, self-hosted (both under the SIL Open Font License). */
export const FONT_CSS = `
@font-face{font-family:"Inter Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/huddle/inter-latin.woff2") format("woff2")}
@font-face{font-family:"Geist Mono Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/huddle/geist-mono-latin.woff2") format("woff2")}
`;

export const BASE_CSS = `
.hd{font-family:${FONT_SANS};color:${COLORS.ink};-webkit-font-smoothing:antialiased;font-feature-settings:"cv11","ss01"}
.hd ::selection{background:${COLORS.acc};color:${COLORS.accInk}}
:where(.hd :focus-visible){outline:2px solid ${COLORS.acc};outline-offset:2px}
.hd button{cursor:pointer}
.hd textarea,.hd input{font-family:inherit}
.hd .hd-scroll{scrollbar-width:thin;scrollbar-color:#2A2A30 transparent}
.hd .hd-scroll::-webkit-scrollbar{width:10px}.hd .hd-scroll::-webkit-scrollbar-thumb{background:#2A2A30;border-radius:10px;border:3px solid transparent;background-clip:padding-box}
.hd .hd-noscroll::-webkit-scrollbar{display:none}.hd .hd-noscroll{scrollbar-width:none}
@keyframes hd-blink{0%,92%,100%{transform:scaleY(1)}94%{transform:scaleY(.08)}96%{transform:scaleY(1)}}
.hd .hd-blink{transform-box:fill-box;transform-origin:center;animation:hd-blink var(--bl,5.4s) infinite;animation-delay:var(--bd,0s)}
@keyframes hd-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.hd .hd-bob{animation:hd-bob 1.15s cubic-bezier(.45,0,.55,1) infinite}
@keyframes hd-talk{0%,100%{transform:scale(1,1)}30%{transform:scale(1.05,.94)}60%{transform:scale(.97,1.04)}}
.hd .hd-talk{transform-box:fill-box;transform-origin:50% 100%;animation:hd-talk .5s ease-in-out infinite}
@keyframes hd-caret{0%,100%{opacity:.25}50%{opacity:1}}
.hd .hd-caret{animation:hd-caret .9s ease-in-out infinite}
@keyframes hd-shimmer{0%{background-position:150% 0}100%{background-position:-50% 0}}
.hd .hd-shimmer{background:linear-gradient(90deg,${COLORS.soft} 30%,${COLORS.ink} 50%,${COLORS.soft} 70%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:hd-shimmer 1.6s linear infinite}
@keyframes hd-dot{0%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}
.hd .hd-dot{animation:hd-dot 1.1s ease-in-out infinite}
@keyframes hd-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.hd .hd-shake{animation:hd-shake .38s ease}
@media (prefers-reduced-motion: reduce){.hd .hd-blink,.hd .hd-bob,.hd .hd-talk,.hd .hd-caret,.hd .hd-shimmer,.hd .hd-dot,.hd .hd-shake{animation:none!important}.hd .hd-shimmer{color:${COLORS.soft}}}
`;

export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export const hashString = (text: string) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const hexToRgb = (hex: string) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

const rgbToHex = (rgb: number[]) =>
  "#" +
  rgb
    .map((channel) =>
      Math.round(Math.max(0, Math.min(255, channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

export const shade = (hex: string, amount: number) => {
  const rgb = hexToRgb(hex);
  return rgbToHex(rgb.map((channel) => (amount > 0 ? channel + (255 - channel) * amount : channel * (1 + amount))));
};

export const tint = (hex: string) => shade(hex, 0.38);

export const uid = () => Math.random().toString(36).slice(2, 10);

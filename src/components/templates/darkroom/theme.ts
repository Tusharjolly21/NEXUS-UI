import type { Transition } from "framer-motion";

export const FONT_SANS = "'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";

export const COLORS = {
  bg: "var(--bg)",
  panel: "var(--panel)",
  raise: "var(--raise)",
  raise2: "var(--raise2)",
  line: "var(--line)",
  line2: "var(--line2)",
  ink: "var(--ink)",
  text: "var(--text)",
  soft: "var(--soft)",
  faint: "var(--faint)",
  acc: "var(--acc)",
  accInk: "var(--acc-ink)",
  accSoft: "var(--acc-soft)",
};

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.8,
};

export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
};

/** Self-hosted fonts (Inter and Geist Mono, both OFL), so the template makes no third-party requests. */
export const FONT_CSS = `
@font-face{font-family:"Inter Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/darkroom/inter-latin.woff2") format("woff2")}
@font-face{font-family:"Geist Mono Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/darkroom/geist-mono-latin.woff2") format("woff2")}
`;

export const BASE_CSS = `
.dr{--bg:#0C0B0A;--panel:#121110;--raise:#1A1816;--raise2:#24211E;--line:rgba(255,240,225,.07);--line2:rgba(255,240,225,.12);--ink:#F3EFE9;--text:#B8B0A7;--soft:#8F877F;--faint:#4B4540;--acc:#FF6B3D;--acc-ink:#1C0B04;--acc-soft:rgba(255,107,61,.13);--shadow:0 1px 0 rgba(255,255,255,.04) inset,0 12px 32px -12px rgba(0,0,0,.6);--tip-bg:#F3EFE9;--tip-ink:#141210;color-scheme:dark}
.dr[data-theme=light]{--bg:#F6F3EE;--panel:#FFFFFF;--raise:#F0ECE6;--raise2:#E7E2DA;--line:rgba(40,28,16,.08);--line2:rgba(40,28,16,.14);--ink:#1B1815;--text:#4F4943;--soft:#6B645D;--faint:#B9B1A7;--acc:#C73F17;--acc-ink:#FFF6F1;--acc-soft:rgba(199,63,23,.1);--shadow:0 1px 0 rgba(255,255,255,.8) inset,0 12px 32px -14px rgba(60,40,20,.28);--tip-bg:#1B1815;--tip-ink:#F6F3EE;color-scheme:light}
.dr ::selection{background:var(--acc);color:var(--acc-ink)}
.dr :focus-visible{outline:2px solid var(--acc);outline-offset:2px;border-radius:9px}
.dr textarea:focus-visible,.dr input:focus-visible{outline:none}
.dr button{cursor:pointer}.dr button:disabled{cursor:default}
.dr .noscroll::-webkit-scrollbar{display:none}.dr .noscroll{scrollbar-width:none}
.dr .thin::-webkit-scrollbar{width:10px;height:10px}.dr .thin::-webkit-scrollbar-thumb{background:var(--line2);border-radius:10px;border:3px solid transparent;background-clip:padding-box}.dr .thin{scrollbar-width:thin;scrollbar-color:var(--line2) transparent}
.dr .hov:hover{background:var(--raise)}
.dr [data-tip]{position:relative}
.dr [data-tip]:hover::after,.dr [data-tip]:focus-visible::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);white-space:nowrap;padding:5px 8px;border-radius:7px;background:var(--tip-bg);color:var(--tip-ink);font:500 11.5px/1.2 ${FONT_SANS};letter-spacing:0;pointer-events:none;z-index:80;animation:dr-tip .18s ease-out}
.dr [data-tip-side=bottom]:hover::after,.dr [data-tip-side=bottom]:focus-visible::after{bottom:auto;top:calc(100% + 8px)}
@keyframes dr-tip{from{opacity:0;transform:translate(-50%,3px)}}
@keyframes dr-spin{to{transform:rotate(360deg)}}
.dr .spin{animation:dr-spin .9s linear infinite}
@keyframes dr-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.dr .shimmer{background:linear-gradient(90deg,var(--soft) 0%,var(--ink) 45%,var(--soft) 90%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dr-shimmer 2.4s linear infinite}
@keyframes dr-breathe{0%,100%{opacity:.35}50%{opacity:.8}}
.dr .breathe{animation:dr-breathe 2.2s ease-in-out infinite}
@keyframes dr-wave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@media (prefers-reduced-motion: reduce){.dr .spin,.dr .shimmer,.dr .breathe,.dr .wave{animation:none!important}}
`;

export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export const formatAgo = (from: number, to: number) => {
  const minutes = Math.max(0, Math.round((to - from) / 6e4));
  if (minutes < 1) {
    return "now";
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : days < 7 ? `${days}d` : `${Math.round(days / 7)}w`;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export function hashString(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 1540483477);
  return (hash ^ (hash >>> 15)) >>> 0;
}

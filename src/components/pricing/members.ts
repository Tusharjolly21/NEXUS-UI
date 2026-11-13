import { RAINBOW_HUES } from "@/components/site/rainbow-word";

/**
 * People who bought All-Access (the lifetime plan) and agreed to be shown by name. Newest first.
 * Keep it to real buyers who said yes. Shown as a small stack under the Pro and All-Access buttons
 * (MemberStack) and, once there are enough names, as the full row on /pricing (MembersRow).
 *
 * `face` (0 to 4) picks the hand-drawn avatar in MemberStack (/public/avatars/face-<n>.svg); give each new person
 * the next unused one so it stays theirs when newer names are added in front. Leave it out and the position in
 * the list decides.
 * `code` is the two-letter country code. Its flag is a file at /public/flags/<code>.svg; to add a country,
 * copy `3x2/<CODE>.svg` from the MIT-licensed `country-flag-icons` package (licence kept beside the flags).
 */
export const MEMBERS: { name: string; country: string; code: string; face?: number }[] = [
  { name: "Han Wang", country: "Ireland", code: "ie", face: 2 },
  { name: "GoCellar GoWinery", country: "Australia", code: "au", face: 1 },
  { name: "Jon Massey", country: "United Kingdom", code: "gb", face: 0 },
];

/** Up to two initials for a disc. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
}

/** The disc's background: a spectrum hue, darkened a little toward the bottom. */
export function discBackground(i: number) {
  const hue = RAINBOW_HUES[(i * 2) % RAINBOW_HUES.length];
  return `linear-gradient(140deg, ${hue}, color-mix(in oklab, ${hue} 62%, #000))`;
}

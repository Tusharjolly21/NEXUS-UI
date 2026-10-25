import type { ProSoundCategory } from "@/lib/ui-sounds-pro";

/**
 * Names, labels and sets of the Pro sounds, kept apart from their recipes so the page can list
 * them without loading the recipes. `scripts/scan-sound-usage.mjs` fails the build if this list and
 * `PRO_SOUNDS` in `ui-sounds-pro.ts` ever disagree.
 */
export const PRO_SOUND_META: { name: string; label: string; category: ProSoundCategory }[] = [
  { name: "glass-tap", label: "Glass tap", category: "Glass" },
  { name: "glass-chime", label: "Glass chime", category: "Glass" },
  { name: "glass-ping", label: "Glass ping", category: "Glass" },
  { name: "glass-open", label: "Glass open", category: "Glass" },
  { name: "glass-close", label: "Glass close", category: "Glass" },
  { name: "glass-clink", label: "Clink", category: "Glass" },
  { name: "paper-flip", label: "Page flip", category: "Paper and wood" },
  { name: "paper-crumple", label: "Crumple", category: "Paper and wood" },
  { name: "paper-tear", label: "Tear", category: "Paper and wood" },
  { name: "wood-tap", label: "Wood tap", category: "Paper and wood" },
  { name: "wood-block", label: "Wood block", category: "Paper and wood" },
  { name: "wood-drop", label: "Wood drop", category: "Paper and wood" },
  { name: "coin", label: "Coin", category: "Arcade" },
  { name: "power-up", label: "Power up", category: "Arcade" },
  { name: "blip", label: "Blip", category: "Arcade" },
  { name: "laser", label: "Laser", category: "Arcade" },
  { name: "level-up", label: "Level up", category: "Arcade" },
  { name: "game-over", label: "Game over", category: "Arcade" },
  { name: "riser", label: "Riser", category: "Studio" },
  { name: "impact", label: "Impact", category: "Studio" },
  { name: "sparkle", label: "Sparkle", category: "Studio" },
  { name: "confetti-pop", label: "Confetti pop", category: "Studio" },
  { name: "fanfare", label: "Fanfare", category: "Studio" },
  { name: "swell", label: "Swell", category: "Studio" },
  { name: "scan-sweep", label: "Scan sweep", category: "Devices" },
  { name: "card-insert", label: "Card insert", category: "Devices" },
  { name: "access-granted", label: "Access granted", category: "Devices" },
  { name: "access-denied", label: "Access denied", category: "Devices" },
  { name: "relay-click", label: "Relay click", category: "Devices" },
  { name: "bloop", label: "Bloop", category: "Devices" },
  { name: "crumble", label: "Crumble", category: "Devices" },
  { name: "pour", label: "Pour", category: "Devices" },
];

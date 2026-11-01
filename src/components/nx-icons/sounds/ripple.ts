import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.0;

/** A water-drop plip for each ring, with a faint shimmer as it spreads out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.9].forEach((at, i) => {
    blip(c, o, 900 - i * 120, t(at), 0.1, 0.12, 460);
    swish(c, o, t(at + 0.05), t(0.7), 3600, 1400, 0.02);
  });
}

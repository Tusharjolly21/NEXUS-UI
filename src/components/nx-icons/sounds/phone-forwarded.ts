import { plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.15;

/** A gentle sway, a whoosh as the arrow runs off to the right, then four plucks hopping up D, G, B and D as it loops back in from the left. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 280, t(0.02), 0.04, 0.2, 340, "triangle");
  swish(c, o, t(0.1), t(0.32), 700, 3600, 0.045);
  [N.D5, N.G5, N.B5, N.D6].forEach((f, i) => plink(c, o, f, t(0.5 + i * 0.1), 0.06, 0.15));
}

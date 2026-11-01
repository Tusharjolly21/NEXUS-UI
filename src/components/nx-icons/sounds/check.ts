import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.26;

/** A rising pentatonic arpeggio as the tick is drawn, a bright pop as it lands, and a shimmer of air as the ring blooms. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.D6, N.G6, N.B6].forEach((f, i) => plink(c, o, f, t(0.07 + i * 0.09), 0.08, 0.1));
  ding(c, o, N.C7, t(0.34), 0.09, 0.55);
  swish(c, o, t(0.3), t(0.4), 2400, 5200, 0.025);
}

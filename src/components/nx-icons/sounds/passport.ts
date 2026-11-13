import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft whoosh while the crest star turns, then a rubber stamp thumps and a scratch writes the line back in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.9), 700, 1700, 0.02); // 0.00-0.90 the crest star turns
  thud(c, o, t(0.68), 140, 0.2, 0.13); // 0.70 the stamp line is wiped and re-struck
  swish(c, o, t(0.72), t(0.33), 1800, 3400, 0.03); // 0.72-1.05 the line is written
  tick(c, o, t(1.05), 0.1, 2800); // 1.05 the line is complete
}

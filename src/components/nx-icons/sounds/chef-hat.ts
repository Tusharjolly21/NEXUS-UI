import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.1;

/** A soft cloth press as the hat squashes, a spring tick and rising swish as it hops, a fluffy pomf as the crown puffs up, then a thud and cloth squash as it lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 900, 420, 0.04); // 0.00-0.18 the hat squashes down
  tick(c, o, t(0.18), 0.05, 1400); // 0.18 the pleats let go and the hat springs up
  swish(c, o, t(0.18), t(0.27), 350, 1300, 0.07); // 0.18-0.45 the hop rises
  blip(c, o, 180, t(0.46), 0.09, 0.12, 330); // 0.46 the crown puffs up with a soft pomf
  puff(c, o, t(0.47), 0.1, 2600, 0.05, "bandpass"); // 0.495 the crown is at its fullest
  swish(c, o, t(0.5), t(0.22), 1300, 400, 0.05); // 0.50-0.72 the hat falls back down
  thud(c, o, t(0.72), 120, 0.2, 0.12); // 0.72 it lands on the counter
  puff(c, o, t(0.72), 0.1, 700, 0.05, "lowpass"); // 0.72 the cloth squashes
}

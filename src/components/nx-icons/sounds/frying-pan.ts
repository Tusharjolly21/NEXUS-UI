import { ding, blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.35;

/** A metal flick as the pan jerks up, a soft whoop while the egg flies, a hollow pan clank as it lands and a sizzle that crackles and fades. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 700, 1800, 0.03); // 0.00-0.18 the pan flicks up
  blip(c, o, 520, t(0.176), 0.05, 0.3, 880); // 0.18-0.48 the egg whoops upward
  swish(c, o, t(0.3), t(0.5), 1200, 600, 0.02); // 0.30-0.80 the egg turns over in the air
  ding(c, o, 470, t(0.81), 0.08, 0.35); // 0.81 the egg lands: a hollow clank of the pan
  thud(c, o, t(0.81), 150, 0.1, 0.1); // 0.81 the egg lands with weight
  puff(c, o, t(0.82), 0.3, 7000, 0.06, "highpass"); // 0.82 the sizzle begins
  puff(c, o, t(0.95), 0.25, 6000, 0.04, "highpass"); // 0.95 the sizzle crackles on
  tick(c, o, t(1.05), 0.05, 4200); // 1.05 a fat pop
  puff(c, o, t(1.1), 0.2, 5500, 0.025, "highpass"); // 1.10 the sizzle dies down
}

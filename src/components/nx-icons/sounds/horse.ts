import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.87;

/** Two soft nods: a warm snort as the head reaches the bottom of each dip, a low nicker as it lifts, and a dry hair rustle that follows the mane strands rippling down the neck. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.32), 1600, 3000, 0.06); // 0.04-0.36 the mane strands ripple out, one after another
  puff(c, o, t(0.19), 0.1, 1100, 0.12, "lowpass"); // 0.19-0.29 a snort as the head reaches the bottom of the first nod (0.225)
  blip(c, o, 190, t(0.26), 0.04, 0.2, 255, "sawtooth"); // 0.26-0.46 a soft nicker as the head lifts
  swish(c, o, t(0.4), t(0.3), 3000, 1800, 0.05); // 0.40-0.70 the mane falls back and ripples again
  puff(c, o, t(0.64), 0.1, 1000, 0.1, "lowpass"); // 0.64-0.74 a smaller snort at the bottom of the second nod (0.675)
  swish(c, o, t(0.65), t(0.25), 1800, 2800, 0.04); // 0.65-0.90 the last ripple settles
}

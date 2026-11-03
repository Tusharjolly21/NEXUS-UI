import { ding, plink, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.71;

/** A soft squeeze and a gurgling slide down as the bulb is pressed, a thin whistle as the drop falls, a round plip and a ring when it lands, then a rising suction as the tube fills with a final bright note. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.1, 900, 0.06, "lowpass");
  blip(c, o, 300, t(0.04), 0.07, 0.18, 200);
  swish(c, o, t(0.24), t(0.28), 2400, 800, 0.025);
  blip(c, o, 900, t(0.54), 0.1, 0.1, 300);
  ding(c, o, N.A5, t(0.56), 0.05, 0.3);
  blip(c, o, 200, t(0.6), 0.05, 0.3, 620, "triangle");
  swish(c, o, t(0.58), t(0.32), 400, 1800, 0.025);
  plink(c, o, N.E7, t(0.9), 0.05, 0.16);
}

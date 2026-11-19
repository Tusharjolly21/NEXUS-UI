import { ding, blip, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.43;

/** A papery peel as the heart seal lifts with a rising whistle, a sweet chime as it beats in the air, and a soft paper tap as it presses back on the flap. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.08, 3800, 0.04); // 0.00 the seal peels off the flap
  blip(c, o, 700, t(0.02), 0.03, 0.26, 1150); // 0.02-0.29 the heart rises
  ding(c, o, 1660, t(0.418), 0.05, 0.4); // 0.42 the heart beats in the air
  tick(c, o, t(0.722), 0.07, 3000); // 0.72 the heart presses back onto the flap
  puff(c, o, t(0.722), 0.05, 1500, 0.03); // 0.72 the paper gives a little
  thud(c, o, t(0.798), 160, 0.05, 0.08); // 0.80 the envelope bounces
}

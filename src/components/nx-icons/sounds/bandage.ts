import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A dull press and a little paper tick as the bandage sticks down, then a bright pop as the four pad dots swell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.16), 900, 400, 0.015); // 0.00-0.16 the bandage presses down
  thud(c, o, t(0.18), 190, 0.09, 0.07); // 0.18 the bandage hits the skin
  tick(c, o, t(0.18), 0.09, 2800); // 0.18 the adhesive grips
  puff(c, o, t(0.39), 0.06, 3600, 0.025, "highpass"); // 0.39 it springs back, paper rustle
  blip(c, o, 1250, t(0.45), 0.05, 0.08, 1700, "triangle"); // 0.45 the pad dots swell
}

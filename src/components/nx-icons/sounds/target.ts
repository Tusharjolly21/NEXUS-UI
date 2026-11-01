import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.52;

/** A dart whistling through the air, a wooden thwack, a twang as it quivers, and a bright ding for the bullseye. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.28), 3400, 900, 0.06);
  thud(c, o, t(0.3), 140, 0.28, 0.1);
  tick(c, o, t(0.3), 0.16, 1800);
  blip(c, o, 300, t(0.31), 0.06, 0.4, 190, "triangle");
  swish(c, o, t(0.32), t(0.35), 2000, 5000, 0.015);
  ding(c, o, N.G7, t(0.42), 0.07, 0.6);
}

import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.46;

/** A crisp wooden clack as the chopsticks snap shut on the rice ball, a light whoosh as it is lifted and a soft tock when it is set back down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.3), 0.09, 3100); // 0.30 the sticks clack shut on the rice ball
  blip(c, o, 1480, t(0.3), 0.06, 0.04, 1350, "triangle"); // 0.30 the dry ring of the wood
  swish(c, o, t(0.3), t(0.22), 700, 1600, 0.02); // 0.30-0.52 the rice ball is lifted
  swish(c, o, t(0.64), t(0.2), 1400, 700, 0.015); // 0.64-0.84 it is lowered
  thud(c, o, t(0.84), 230, 0.07, 0.07); // 0.84 the rice ball is set down softly
}

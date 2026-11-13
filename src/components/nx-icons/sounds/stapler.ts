import { ding, blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A short swish as the arm swings down, a hard metal clack with a small ring where it lands, a fine crunch as the staple folds, then a spring twang as the arm lifts and a soft stop at the top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), t(0.24), 500, 2000, 0.035); // 0.03-0.27 the arm swings down, faster and faster
  thud(c, o, t(0.27), 150, 0.16, 0.1); // 0.27 the arm lands on the paper
  tick(c, o, t(0.27), 0.16, 3200); // 0.27 clack of the anvil
  ding(c, o, 3100, t(0.272), 0.025, 0.12); // 0.27 short metal ring
  tick(c, o, t(0.31), 0.1, 6200); // 0.31 the staple legs fold over (squash ends 0.306)
  tick(c, o, t(0.405), 0.07, 2300); // 0.41 the spring lets go of the arm
  blip(c, o, 260, t(0.41), 0.035, 0.42, 640, "triangle"); // 0.41-0.9 spring twang as the arm lifts and the staple returns
  tick(c, o, t(0.88), 0.045, 2700); // 0.88 the arm reaches its open stop
}

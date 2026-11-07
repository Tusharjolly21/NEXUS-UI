import { ding, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.11;

/** A faint rustle as the fingertip comes down, a small glassy tap where it touches the screen, then a soft widening ripple that fades away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 600, 250, 0.015); // 0.02-0.24 the fingertip comes down
  tick(c, o, t(0.25), 0.12, 4800); // 0.25 the fingertip taps the glass
  thud(c, o, t(0.25), 260, 0.1, 0.07); // 0.25 the finger pad lands
  ding(c, o, 2700, t(0.25), 0.05, 0.22); // 0.25 the glass answers the tap
  swish(c, o, t(0.26), t(0.45), 500, 2800, 0.022); // 0.26-0.71 the ripple spreads and fades
  swish(c, o, t(0.28), t(0.2), 700, 350, 0.012); // 0.28-0.48 the fingertip lifts away
}

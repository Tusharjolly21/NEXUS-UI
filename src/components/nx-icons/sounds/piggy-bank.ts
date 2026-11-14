import { ding, blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.15;

/** A coin ticking into the back slot, a ring as it sinks behind the floor of the notch, clinks inside the hollow ceramic, a rubbery boing as the pig squashes, and a sparkle when a new coin pops back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), t(0.14), 3000, 5200, 0.02); // 0.10-0.25 the coin drops edge-on
  tick(c, o, t(0.249), 0.1, 4200); // 0.25 the coin edge enters the slot notch
  ding(c, o, 3300, t(0.249), 0.05, 0.25); // 0.25 a small metal ring as it enters
  ding(c, o, 2700, t(0.323), 0.06, 0.35); // 0.32 the coin meets the floor of the slot and sinks behind it
  tick(c, o, t(0.434), 0.08, 3400); // 0.43 the coin is gone and clinks on the inner wall
  ding(c, o, 2300, t(0.434), 0.04, 0.3); // 0.43 ceramic ring
  ding(c, o, 3000, t(0.485), 0.04, 0.3); // 0.485 a second clink inside
  thud(c, o, t(0.53), 120, 0.14, 0.12); // 0.53 the body is at its flattest
  blip(c, o, 190, t(0.53), 0.07, 0.2, 330, "triangle"); // 0.53-0.68 the body springs back up with a boing
  blip(c, o, 700, t(0.78), 0.05, 0.12, 1500); // 0.76-0.92 a fresh coin pops into view
  ding(c, o, 3900, t(0.92), 0.05, 0.4); // 0.92 the fresh coin reaches full size and glints
}

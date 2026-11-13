import { ding, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A faint sweep of air with a fine click each time the blue arm crosses a scale mark, quick on the way open, a firmer click where it turns round at the far end and again at thirty degrees, then a soft ping as it settles at sixty. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.4), 900, 2600, 0.02); // 0.00-0.40 the arm swings open to 150 degrees
  [0.107, 0.157, 0.2, 0.243, 0.293].forEach((at, i) => tick(c, o, t(at), 0.05, 3000 + i * 250)); // 0.11-0.29 the arm passes the marks at 75, 90, 105, 120 and 135 degrees
  tick(c, o, t(0.4), 0.11, 2200); // 0.40 the arm turns round at 150 degrees
  swish(c, o, t(0.4), t(0.35), 2600, 800, 0.02); // 0.40-0.75 the arm swings back to 30 degrees
  [0.481, 0.517, 0.547, 0.576, 0.604, 0.633, 0.669].forEach((at, i) => tick(c, o, t(at), 0.05, 4200 - i * 250)); // 0.48-0.67 it passes the marks on the way back
  tick(c, o, t(0.75), 0.11, 1900); // 0.75 the arm turns round at 30 degrees
  swish(c, o, t(0.75), t(0.25), 800, 1800, 0.015); // 0.75-1.00 the arm returns to 60 degrees
  tick(c, o, t(0.875), 0.05, 2800); // 0.875 the arm passes the 45 degree mark
  ding(c, o, 1560, t(1.0), 0.05, 0.3); // 1.00 the arm settles at 60 degrees: a soft ping
}

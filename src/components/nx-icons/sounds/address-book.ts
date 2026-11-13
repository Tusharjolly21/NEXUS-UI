import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three bright flicks as the index tabs are thumbed out and snap back, each a little higher than the last, then two soft bubbly pops as the contact portrait swells and relaxes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.15), 1600, 3400, 0.02); // 0.00-0.15 first tab flicks out
  tick(c, o, t(0.3), 0.1, 3200); // 0.30 first tab snaps back
  swish(c, o, t(0.11), t(0.15), 1800, 3600, 0.02); // 0.11-0.26 second tab flicks out
  tick(c, o, t(0.41), 0.1, 3600); // 0.41 second tab snaps back
  swish(c, o, t(0.22), t(0.15), 2000, 3800, 0.02); // 0.22-0.37 third tab flicks out
  tick(c, o, t(0.52), 0.1, 4000); // 0.52 third tab snaps back
  blip(c, o, 480, t(0.4), 0.05, 0.14, 820, "sine"); // 0.47 the portrait is at its largest
  blip(c, o, 700, t(0.59), 0.03, 0.1, 520, "sine"); // 0.63 the portrait dips smaller
}

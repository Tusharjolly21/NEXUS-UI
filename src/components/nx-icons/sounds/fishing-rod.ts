import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A thin line-tension zing as the rod flexes, a bubbly bloop each time the bobber dives and pops back, and a reel click at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 3000, 5000, 0.02); // 0.00-0.225 the line tightens, rod bends
  blip(c, o, 520, t(0.22), 0.1, 0.14, 230); // 0.225 the bobber is dragged under
  blip(c, o, 280, t(0.44), 0.09, 0.14, 620); // 0.45 it pops back up
  blip(c, o, 450, t(0.66), 0.05, 0.1, 260); // 0.675 smaller dip
  tick(c, o, t(0.9), 0.1, 4000); // 0.90 reel click as it settles
}

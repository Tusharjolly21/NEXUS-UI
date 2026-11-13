import { ding, blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two radar pings that rise in pitch as the beacon sends out signal arcs, with a soft blip each time the glass band dims. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, 2300, t(0.06), 0.07, 0.35); // 0.05 first set of arcs leaves the beacon
  blip(c, o, 520, t(0.22), 0.05, 0.08); // 0.225 the glass band dims
  ding(c, o, 3100, t(0.31), 0.05, 0.3); // 0.30 second set of arcs
  blip(c, o, 520, t(0.67), 0.04, 0.08); // 0.675 the glass band dims again
  tick(c, o, t(0.9), 0.05, 4200); // 0.90 band is back to full
}

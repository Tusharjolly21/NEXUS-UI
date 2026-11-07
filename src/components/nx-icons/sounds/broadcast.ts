import { ding, blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.4;

/** A soft throbbing carrier as the centre dot swells (peaks 0.22 and 0.68), and sonar pings as the signal arcs pulse outward: two bright pings for the inner pair at 0.25 and 0.31, two lower ones for the outer pair at 0.53 and 0.59. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.02-0.22 the centre dot swells
  blip(c, o, 170, t(0.02), 0.08, 0.22, 330, "triangle");
  // 0.25 / 0.31 inner arcs flash and pulse out
  ding(c, o, 1400, t(0.25), 0.07, 0.35);
  ding(c, o, 1480, t(0.31), 0.05, 0.3);
  // 0.45-0.68 the centre dot swells a second time
  blip(c, o, 200, t(0.46), 0.06, 0.2, 320, "triangle");
  // 0.53 / 0.59 outer arcs flash and pulse out
  ding(c, o, 880, t(0.53), 0.055, 0.4);
  ding(c, o, 930, t(0.59), 0.04, 0.35);
}

import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.99;

/** A backwards whip swish as the arrow draws, a tick as the head flicks, and a soft sent-note. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 3200, 900, 0.045);
  tick(c, o, t(0.3), 0.1, 3600);
  blip(c, o, N.G5, t(0.32), 0.07, 0.12);
  blip(c, o, N.D6, t(0.42), 0.06, 0.2);
}

import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.29;

/** A quick air swish as the mic boom swings out and back, tiny plastic ticks where it reverses, then two soft bass thumps as the ear cups swell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 900, 2200, 0.035); // 0.00-0.20 the boom swings out
  swish(c, o, t(0.2), t(0.2), 2400, 1000, 0.03); // 0.20-0.40 it swings back
  swish(c, o, t(0.4), t(0.2), 1000, 1900, 0.02); // 0.40-0.60 it overshoots a little
  tick(c, o, t(0.2), 0.05, 2600); // 0.20 the boom reaches its far end
  tick(c, o, t(0.4), 0.04, 2300); // 0.40 the boom turns again
  thud(c, o, t(0.65), 95, 0.16, 0.18); // 0.65 the ear cups swell
  thud(c, o, t(0.95), 80, 0.14, 0.2); // 0.95 the second swell
  blip(c, o, 230, t(0.65), 0.03, 0.12, 190); // 0.65 the cup body rings
}

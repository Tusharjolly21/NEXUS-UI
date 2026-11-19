import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.54;

/** A watery whoosh with a rising bubble as the octopus jets up, a soft low bloop as it splays its tentacles, and one small bubble as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.29), 300, 900, 0.05); // 0.00-0.29 the octopus jets upward, tentacles pulled in
  blip(c, o, 260, t(0.02), 0.09, 0.22, 620); // 0.02 a bubble rises with the jet
  blip(c, o, 420, t(0.29), 0.08, 0.2, 180); // 0.29 the tentacles splay out: a soft low bloop
  swish(c, o, t(0.31), t(0.3), 700, 260, 0.03); // 0.31-0.61 it drifts back down through the water
  blip(c, o, 700, t(0.62), 0.04, 0.08, 1050); // 0.62 one small bubble as the tentacles settle
}

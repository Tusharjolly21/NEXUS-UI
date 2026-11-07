import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.51;

/** A smooth twisting whoosh that climbs for the first half turn and falls for the second, with a tiny wooden pip each time a rung of the helix turns edge-on and flips: top, middle, bottom, then again on the way back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.03-0.5 the helix twists one way
  swish(c, o, t(0.03), t(0.47), 350, 1700, 0.04);
  // 0.5-0.98 it twists back
  swish(c, o, t(0.5), t(0.48), 1700, 380, 0.055);
  // each rung shrinks to a point and flips over
  [[0.243, 3400, 1400], [0.326, 2700, 1050], [0.398, 2100, 780], [0.6, 3400, 1400], [0.674, 2700, 1050], [0.757, 2100, 780]].forEach(([at, tf, bf]) => {
    tick(c, o, t(at), 0.11, tf);
    blip(c, o, bf, t(at), 0.05, 0.05, bf * 0.8, "triangle");
  });
}

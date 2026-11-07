import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.87;

/** A foamy hiss that swells and fades twice with the foam, bubbles blooping as they rise, and a hollow stoneware clunk each time the mug rocks, getting softer. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.45), 3500, 6500, 0.04); // 0.0-0.45 the foam swells up and settles, fizz
  swish(c, o, t(0.45), t(0.45), 3000, 5500, 0.025); // 0.45-0.9 the second smaller swell
  [[0.14, 900], [0.26, 1300], [0.38, 1000]].forEach(([at, f]) => blip(c, o, f, t(at), 0.035, 0.05, f * 1.6)); // 0.14 0.26 0.38 a bubble rises into view
  [[0.225, 0.22], [0.45, 0.14], [0.675, 0.08]].forEach(([at, g]) => {
    thud(c, o, t(at), 150, g, 0.12); // 0.22 0.45 0.68 the mug rocks over and clunks
    blip(c, o, 320, t(at), g * 0.4, 0.06, 250);
  });
}

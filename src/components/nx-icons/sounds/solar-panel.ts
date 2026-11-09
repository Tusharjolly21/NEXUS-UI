import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A warm swell as the sun's rays pulse out twice, with a glassy chime for each diagonal of cells as they light up in a rising run. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.2), 1200, 3200, 0.025); // 0.05-0.25 the rays pulse out
  swish(c, o, t(0.42), t(0.2), 1200, 3000, 0.02); // 0.42-0.62 the rays pulse out again
  [[0.325, 1245], [0.425, 1480], [0.525, 1760], [0.625, 2093], [0.725, 2489]].forEach(([at, f]) => ding(c, o, f, t(at), 0.05, 0.3)); // 0.33 0.43 0.53 0.63 0.73 each diagonal of cells is at its brightest
  blip(c, o, 110, t(0.3), 0.04, 0.5, 170); // 0.30-0.80 the panel hums as it gathers light
}

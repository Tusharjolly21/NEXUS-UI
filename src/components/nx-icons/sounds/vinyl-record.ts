import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.17;

/** A turntable motor hum and a soft whoosh that rise and fall with the spin-up of the disc, with dusty vinyl pops ticking at the pace of the spinning grooves and four stronger pops as the grooves flicker. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.03-0.45 the disc spins up (slow start, fastest around 0.4)
  swish(c, o, t(0.03), t(0.42), 180, 1500, 0.08);
  blip(c, o, 70, t(0.04), 0.09, 0.5, 150, "triangle");
  // 0.45-0.93 the spin eases back to rest
  swish(c, o, t(0.45), t(0.48), 1500, 350, 0.07);
  blip(c, o, 150, t(0.46), 0.07, 0.45, 80, "triangle");
  // dust pops at equal angles of the turning disc: sparse at first, dense at full speed, sparse as it stops
  [[0.166, 0.04, 5200], [0.221, 0.13, 3200], [0.258, 0.05, 6400], [0.287, 0.04, 4700], [0.311, 0.06, 5800], [0.332, 0.14, 2800], [0.351, 0.05, 6900], [0.37, 0.04, 4300], [0.388, 0.06, 5600], [0.406, 0.05, 6200], [0.426, 0.04, 4900], [0.446, 0.06, 7000], [0.469, 0.05, 5300], [0.495, 0.04, 6100], [0.524, 0.06, 4600], [0.56, 0.05, 6600], [0.604, 0.14, 3000], [0.661, 0.04, 5400], [0.746, 0.13, 3400]].forEach(([at, g, f]) => {
    tick(c, o, t(at), g, f);
    if (g > 0.1) thud(c, o, t(at), 170, 0.05, 0.04); // 0.22 0.33 0.6 0.74 a groove ring flickers: a bigger pop
  });
}

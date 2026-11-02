import { plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.04;

/** Four soft pings falling in pitch, three for the fading arcs and one for the dot, then a low drop and a dry tick as the connection is cut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.04, N.A6], [0.15, N.G6], [0.26, N.D6], [0.36, N.B5]].forEach(([at, f]) => plink(c, o, f, t(at), 0.06, 0.12));
  swish(c, o, t(0.1), t(0.4), 3600, 500, 0.035);
  blip(c, o, 260, t(0.5), 0.07, 0.2, 90, "triangle");
  tick(c, o, t(0.56), 0.08, 3000);
}

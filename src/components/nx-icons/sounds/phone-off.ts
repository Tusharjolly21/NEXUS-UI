import { blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.22;

/** A hard falling swish as the slash is struck, a dry click, then a low muted buzz that stutters five times while the two halves shudder, ending on a dull thud. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), t(0.22), 3800, 600, 0.06);
  tick(c, o, t(0.3), 0.14, 3000);
  [0.3, 0.37, 0.44, 0.51, 0.58].forEach((at) => blip(c, o, 120, t(at), 0.045, 0.06, undefined, "triangle"));
  blip(c, o, N.D5, t(0.32), 0.04, 0.4, N.G4, "triangle");
  thud(c, o, t(0.82), 90, 0.18, 0.12);
}

import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.84;

/** A short hum as the hexagon dips and turns, six little triangle wave notes running up and round for the six corners, and a low bloom of bell as the inner hexagon opens. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 500, 1500, 0.025);
  [N.E4, N.A4, N.C5, N.E5, N.A5, N.C6].forEach((f, i) => blip(c, o, f, t(0.2 + i * 0.09), 0.055, 0.12, f * 1.04, "triangle"));
  ding(c, o, N.G4, t(0.1), 0.05, 0.6);
}

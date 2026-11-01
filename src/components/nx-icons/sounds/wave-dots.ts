import { blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.76;

/** Three soft notes climbing C, E, G as each dot hops in the wave. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.C6, N.E6, N.G6].forEach((f, i) => blip(c, o, f, t(0.27 + i * 0.12), 0.09, 0.14));
}

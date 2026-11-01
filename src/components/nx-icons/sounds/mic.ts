import { blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.02;

/** A beep as recording starts, a few voice-like blips as the bars bounce, and a lower beep as it stops. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.G6, t(0.06), 0.1, 0.1);
  [0.3, 0.5, 0.68, 0.9, 1.04].forEach((at, i) => blip(c, o, [300, 380, 330, 420, 360][i], t(at), 0.06, 0.12, [380, 300, 400, 330, 300][i], "triangle"));
  blip(c, o, N.C6, t(1.3), 0.08, 0.14, N.G5);
}

import { blip, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.17;

/** Deep speaker thumps as the cone pumps, a swelling hum, and a pair of bright notes with every wave. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.12, 0.42, 0.72].forEach((at) => thud(c, o, t(at), 85, 0.14, 0.14));
  blip(c, o, 220, t(0.08), 0.06, 0.55, 740, "triangle");
  [0.35, 0.85].forEach((at) => blip(c, o, N.C6, t(at), 0.05, 0.2));
  [0.55, 1.05].forEach((at) => blip(c, o, N.G6, t(at), 0.05, 0.2));
}

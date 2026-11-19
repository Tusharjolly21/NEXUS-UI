import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.61;

/** A smooth stony grind that swells as the cube turns fastest and fades as it slows, ending in a soft solid knock when it comes to rest. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.9), 260, 820, 0.06); // 0.00-0.90 the cube turns a quarter turn, fastest at 0.45
  blip(c, o, 88, t(0.05), 0.05, 0.8, 128, "sawtooth"); // 0.05-0.85 a low grinding hum under the turn
  thud(c, o, t(0.9), 178, 0.08, 0.08); // 0.90 the cube stops square again
}

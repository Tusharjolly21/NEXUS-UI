import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A crisp pump click as the cap is pressed, a fine hissing spray that swells and fades, and a softer click as the cap springs back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.16), 0.12, 3000); // 0.16 the cap bottoms out
  puff(c, o, t(0.16), 0.65, 6500, 0.07, "highpass"); // 0.16-0.80 the mist sprays out of the nozzle
  swish(c, o, t(0.15), t(0.5), 4500, 8000, 0.03); // 0.15-0.65 the mist spreads and thins
  tick(c, o, t(0.56), 0.07, 2000); // 0.56 the cap springs back up
}

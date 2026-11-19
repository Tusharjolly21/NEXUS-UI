import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.23;

/** A plastic click as the canister is pressed, a fine hissing spray of mist, and a lighter click as it springs back up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.12), 0.12, 3500); // 0.12 the canister is pressed down
  thud(c, o, t(0.12), 200, 0.06, 0.05); // 0.12 the press bottoms out
  swish(c, o, t(0.14), t(0.5), 5200, 3800, 0.07); // 0.14-0.64 the mist sprays out of the mouthpiece
  tick(c, o, t(0.45), 0.08, 2800); // 0.45 the canister springs back up
}

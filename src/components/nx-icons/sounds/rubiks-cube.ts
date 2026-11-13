import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.71;

/** A plastic puzzle cube turning: a whirr that peaks mid-turn with three quick ratchet clicks as the layers pass, and a firm snap as the cube locks into its new position. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.9), 1800, 2800, 0.03); // 0.00-0.90 the cube turns, fastest in the middle
  tick(c, o, t(0.312), 0.09, 3000); // 0.31 layer clicks a notch
  tick(c, o, t(0.45), 0.09, 3400); // 0.45 clicks a notch
  tick(c, o, t(0.589), 0.09, 3800); // 0.59 clicks a notch
  tick(c, o, t(0.895), 0.13, 2600); // 0.90 cube snaps into place
  thud(c, o, t(0.895), 150, 0.08, 0.05); // 0.90 plastic knock of the lock
}

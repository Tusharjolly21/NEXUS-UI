import { blip, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.48;

/** A slow gooey stretch as the honey drip lengthens, a sticky plip when the drop lets go and a soft blop as it falls away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 230, t(0.0), 0.05, 0.42, 150); // 0.00-0.40 the drip stretches slowly down the jar
  puff(c, o, t(0.05), 0.3, 500, 0.02, "lowpass"); // 0.05-0.35 a sticky ooze under it
  blip(c, o, 880, t(0.48), 0.06, 0.06, 1320); // 0.48 the drop lets go of the drip
  blip(c, o, 420, t(0.75), 0.05, 0.08, 310); // 0.75 the drop lands and starts to fade
}

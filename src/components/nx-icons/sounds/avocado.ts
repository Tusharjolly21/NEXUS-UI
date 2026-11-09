import { blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A wet rising pop as the stone pushes up, a squelchy low thud when it drops back into its hollow, and one smaller bounce. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 180, t(0.0), 0.12, 0.2, 640); // 0.00 to 0.24 the stone pops up with a glide
  thud(c, o, t(0.44), 85, 0.24, 0.2); // 0.44 the stone squelches back into the hollow
  puff(c, o, t(0.44), 0.08, 900, 0.05, "lowpass"); // 0.44 wet flesh squishes
  blip(c, o, 420, t(0.5), 0.05, 0.1, 250); // 0.50 stone sinks into the flesh
  thud(c, o, t(0.76), 110, 0.07, 0.08); // 0.76 final little settle
}

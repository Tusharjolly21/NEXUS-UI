import { blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three digital ticks that rise in pitch as the port lights blink in turn, then two bright pings for the signal arcs. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 1180, t(0.1), 0.04, 0.05, 1320, "square"); // 0.10 the first light is mostly dimmed
  blip(c, o, 1480, t(0.26), 0.04, 0.05, 1660, "square"); // 0.26 the second light is mostly dimmed
  blip(c, o, 1760, t(0.42), 0.04, 0.05, 1980, "square"); // 0.42 the third light is mostly dimmed
  blip(c, o, 2300, t(0.725), 0.05, 0.12, 3200); // 0.73 the inner signal arc dips and pulses back
  blip(c, o, 3000, t(0.875), 0.045, 0.14, 4000); // 0.88 the outer arc pulses
}

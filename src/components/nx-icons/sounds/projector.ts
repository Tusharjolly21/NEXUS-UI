import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.85;

/** A relay click as the beam cuts out, a lens motor whining down then up while a bright air sweep follows the beam back across the screen, a tick as the screen lights up, and two flicker ticks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.05), 0.1, 1300); // 0.05 relay click: the beam cuts out
  thud(c, o, t(0.06), 150, 0.08, 0.05); // 0.06 the click's body
  blip(c, o, 1100, t(0.08), 0.03, 0.14, 560, "sawtooth"); // 0.08-0.22 the lens motor whines down as the lens closes
  swish(c, o, t(0.2), t(0.3), 600, 3400, 0.04); // 0.20-0.50 the beam sweeps back on across the screen
  blip(c, o, 560, t(0.22), 0.03, 0.18, 1000, "sawtooth"); // 0.22-0.40 the lens motor whines up as the lens opens
  tick(c, o, t(0.5), 0.1, 3600); // 0.50 the beam reaches the screen and the screen lights up
  tick(c, o, t(0.6), 0.06, 2600); // 0.60 the beam flickers down
  tick(c, o, t(0.7), 0.06, 3000); // 0.70 and steadies again
}

import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two pen clicks: a sharp down click with a bright snap as the button bottoms out and a lighter click as it springs back, then the same pair again when the tip is drawn in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.16), 0.17, 2400); // 0.16 the button bottoms out: click one
  blip(c, o, 1700, t(0.16), 0.04, 0.03, 900, "square"); // 0.16 body of the click
  tick(c, o, t(0.2), 0.06, 5200); // 0.20 the tip seats at full length
  tick(c, o, t(0.24), 0.1, 3600); // 0.24 the button springs back up
  tick(c, o, t(0.76), 0.15, 2100); // 0.76 the button bottoms out again: click two
  blip(c, o, 1500, t(0.76), 0.04, 0.03, 800, "square"); // 0.76 body of the click
  tick(c, o, t(0.8), 0.05, 4800); // 0.80 the tip is back inside
  tick(c, o, t(0.84), 0.08, 3300); // 0.84 the button springs back up
}

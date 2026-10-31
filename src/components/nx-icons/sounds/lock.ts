import { ding, plink, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.02;

/** A key turning with a click, the shackle springing open with a boing, and a bright note for unlocked. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.14, 2600);
  thud(c, o, t(0.05), 180, 0.12, 0.05);
  tick(c, o, t(0.11), 0.2, 3600);
  blip(c, o, 300, t(0.11), 0.08, 0.06, 150, "triangle");
  blip(c, o, 420, t(0.14), 0.06, 0.28, 620, "triangle");
  plink(c, o, N.C6, t(0.24), 0.09);
  ding(c, o, N.G6, t(0.3), 0.06, 0.5);
}

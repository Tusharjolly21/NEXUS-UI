import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.13;

/** Two dry bony clacks as the jaw snaps shut on the teeth, with a faint slide as it opens and a low hollow moan that swells with each eye-glow. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.16), 700, 1500, 0.03); // 0.04 the jaw drops open
  blip(c, o, 200, t(0.08), 0.06, 0.2, 300, "triangle"); // 0.08 eyes flare to full glow
  tick(c, o, t(0.4), 0.16, 2500); // 0.40 the jaw snaps shut
  tick(c, o, t(0.412), 0.1, 4200); // 0.41 the teeth rattle
  thud(c, o, t(0.4), 320, 0.09, 0.05); // 0.40 bone knock
  blip(c, o, 190, t(0.38), 0.06, 0.2, 290, "triangle"); // 0.38 the eyes flare again
  swish(c, o, t(0.43), t(0.16), 700, 1500, 0.03); // 0.43 the jaw opens again
  blip(c, o, 210, t(0.68), 0.06, 0.2, 310, "triangle"); // 0.68 the third glow
  tick(c, o, t(0.8), 0.17, 2900); // 0.80 the jaw snaps shut the second time
  tick(c, o, t(0.812), 0.1, 4800); // 0.81 the teeth rattle
  thud(c, o, t(0.8), 300, 0.09, 0.05); // 0.80 bone knock
}

import { blip, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.59;

/** A beat on the speaker: deep kicks on one and three, snare cracks on two and four, and hi-hat ticks between. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.1, 0.5].forEach((at) => {
    blip(c, o, 150, t(at), 0.12, 0.22, 48);
    thud(c, o, t(at), 62, 0.26, 0.24);
  });
  [0.3, 0.7].forEach((at) => {
    puff(c, o, t(at), 0.09, 1800, 0.08, "bandpass");
    tick(c, o, t(at), 0.08, 3000);
  });
  [0.2, 0.4, 0.6, 0.8].forEach((at) => tick(c, o, t(at), 0.06, 6500));
}

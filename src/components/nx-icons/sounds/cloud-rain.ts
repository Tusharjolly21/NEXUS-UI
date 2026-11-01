import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 2.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.01;

/** Distant thunder rumbling, with a tiny rain-tap for every drop that falls. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0), 0.9, 160, 0.05, "lowpass");
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < 3; i++) {
      const at = 0.5 + i * 0.18 + pass * 0.55;
      tick(c, o, t(at), 0.07, 5200 + i * 700);
      blip(c, o, 1800 + i * 260, t(at), 0.025, 0.04, 1200);
    }
  }
}

import { ding, blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.51;

/** A plastic scrape as the card slides out, a longer scrape as it slides back, a small metal latch ring as it seats and a bright chirp as the chip flashes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.2, 2400, 0.05, "bandpass"); // 0.00-0.22 the card scrapes out of the tray
  puff(c, o, t(0.22), 0.4, 1800, 0.045, "bandpass"); // 0.22-0.63 it scrapes back in
  ding(c, o, 2950, t(0.63), 0.07, 0.12); // 0.63 the tray latches
  tick(c, o, t(0.63), 0.11, 4200); // 0.63 the card reaches its stop
  blip(c, o, 3400, t(0.7), 0.04, 0.06, 3900); // 0.70 the chip flashes
}

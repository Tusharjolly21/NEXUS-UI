import { blip, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.6;

/** Seven felt-hammer piano notes, each struck the instant its key goes down: white keys on C, E, G and C an octave up, and the black keys between them on E flat, F sharp and B flat. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  const key = (f: number, at: number, d: number) => {
    blip(c, o, f, t(at), 0.11, d);
    blip(c, o, f * 2, t(at), 0.035, d * 0.5);
    blip(c, o, f * 3, t(at), 0.015, d * 0.2);
    thud(c, o, t(at), 120, 0.07, 0.04); // the felt hammer
  };
  key(261.63, 0.03, 0.4); // 0.03 white key 1 goes down
  key(311.13, 0.16, 0.35); // 0.16 black key 1 dips
  key(329.63, 0.23, 0.4); // 0.23 white key 2
  key(369.99, 0.36, 0.35); // 0.36 black key 2
  key(392, 0.43, 0.4); // 0.43 white key 3
  key(466.16, 0.56, 0.35); // 0.56 black key 3
  key(523.25, 0.63, 0.5); // 0.63 white key 4, the last, rings out
}

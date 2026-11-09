import { blip, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.78;

/** A two-tone siren that wails up as the light flashes on the left (0.225), down as it flashes on the right (0.45) and up again on the left (0.675), under a low engine rumble that surges as the van lunges forward and four small shudder knocks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.11 shudder knock
  thud(c, o, t(0.11), 78, 0.07, 0.07);
  // 0.20-0.40 siren wails up, the light flashes on the left at 0.225
  blip(c, o, 640, t(0.2), 0.055, 0.2, 980, "triangle");
  // 0.18-0.55 the van lunges forward, engine surges
  blip(c, o, 85, t(0.18), 0.05, 0.38, 150, "sawtooth");
  // 0.34 shudder knock
  thud(c, o, t(0.34), 78, 0.07, 0.07);
  // 0.43-0.63 siren wails down, the light flashes on the right at 0.45
  blip(c, o, 980, t(0.43), 0.055, 0.2, 640, "triangle");
  // 0.56 shudder knock
  thud(c, o, t(0.56), 78, 0.07, 0.07);
  // 0.65-0.85 siren wails up again, the light flashes on the left at 0.675
  blip(c, o, 640, t(0.65), 0.05, 0.2, 980, "triangle");
  // 0.79 last shudder knock as the van settles
  thud(c, o, t(0.79), 78, 0.06, 0.07);
}

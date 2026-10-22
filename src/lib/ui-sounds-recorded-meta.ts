export type RecordedSoundCategory = "Recorded";

/**
 * Names and labels of the recorded Pro sounds, kept apart from the player so the page can list them
 * without loading it. `scripts/scan-sound-usage.mjs` fails the build if this list and the names in
 * `ui-sounds-recorded.ts` ever disagree. `length` is in seconds.
 */
export const RECORDED_SOUND_META: { name: string; label: string; category: RecordedSoundCategory; length: number }[] = [
  { name: "typing", label: "Typing", category: "Recorded", length: 3.1 },
  { name: "camera", label: "Camera", category: "Recorded", length: 0.6 },
  { name: "message", label: "Message", category: "Recorded", length: 0.55 },
  { name: "notification", label: "Notification", category: "Recorded", length: 1.05 },
  { name: "screenshot", label: "Screenshot", category: "Recorded", length: 0.55 },
];

# Terminal audio (Aceternity sprite)

The `Terminal` component plays the same keyboard sprite as [Aceternity’s Terminal](https://ui.aceternity.com/components/terminal): one OGG file plus a JSON map of millisecond offsets.

## Files

| File | Purpose |
|------|---------|
| `sound.ogg` | Audio sprite (not committed by default). **You must add this file** for the real Aceternity sounds. |
| `sprite-config.json` | Timing map (`defines`: char code → `[offsetMs, durationMs]`). Shipped in-repo; can be refreshed from their `config.json`. |

## Download `sound.ogg`

1. Download: [https://ui.aceternity.com/sounds/sound.ogg](https://ui.aceternity.com/sounds/sound.ogg)
2. Save as **`public/sounds/sound.ogg`** in this project (or any path you pass as `soundSpriteUrl` on `Terminal`).

Or from the repo root:

```bash
npm run sounds:fetch
```

That script also refreshes `sprite-config.json` from [https://ui.aceternity.com/sounds/config.json](https://ui.aceternity.com/sounds/config.json).

## Copying the component

If you copy the Terminal module into another app, include **`terminal.tsx`** and **`terminal-sprite-audio.ts`** (from `src/components/terminal/` in this repo), plus **`public/sounds/sound.ogg`** and **`public/sounds/sprite-config.json`** (or your own URLs via `soundSpriteUrl` / `soundSpriteConfigUrl`). Without `sound.ogg`, the terminal falls back to a short synthetic click so the UI still works.

## Attribution

Audio asset and timing originate from Aceternity UI; use according to their license and terms when redistributing.

## Key clicks for the keyboards (`keys.ogg`)

`MacKeyboard` and `LitKeyboard` play `keys.ogg`: a compact sprite (about 200 KB, 18 s) cut from `sound.ogg`, one Cherry MX Black slice per key, each trimmed so it starts on the click's attack. The slice table lives in code (`src/components/key-sound/key-sound-slices.ts`), so no JSON is fetched. If you install the keyboards into another app, copy `keys.ogg` to `public/sounds/` (or pass `soundSrc`); without it they fall back to a synthesised click. Same origin and attribution as `sound.ogg` above.

## The typing sound (`src/lib/typing-sound.ts`)

Every component that types text (the typewriters, the terminal, the chat and login demos, the password and OTP fields, and more) plays one key click per character from `sound.ogg` and `sprite-config.json`, in the same frame the character lands, and a Backspace click for each one deleted. `lib/typing-sound.ts` installs with those components and has no other files; without the two sound files a short synthesised click plays instead.

- `useTypedText(visibleText, enabled)` is the one-line way to wire a typing animation: pass the text that is on screen.
- `useTypingSound()` gives `type(char)` and `backspace()` for anything else, and `playTypingSound(char, { auto: false })` plays one for a key a visitor pressed.
- `useTypingSoundEnabled()` is the on/off switch as React state, remembered in this browser; `TypingSoundSwitch` (src/components/site/sound-switch.tsx) is the button on the component pages and the gallery pop-up. Turning it on also turns site sound on; turning it off silences typing only.
- Components take `enableSound={false}` (or `muted`) to stay silent. Self-playing demos stay quiet until the visitor has used the page and inside `<AutoplaySound allow={false}>`.

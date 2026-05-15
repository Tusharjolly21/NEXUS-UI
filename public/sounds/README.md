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

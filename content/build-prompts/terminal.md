Build a macOS-style terminal window that types a script of commands with human timing, shows a spinner while each one "runs" and prints its output line by line. Then the prompt is yours: click in and type `help`, `ls`, `echo` or any scripted command, with history, Tab completion, Ctrl+C and Ctrl+L. The block caret stretches with typing speed and squashes back when typing stops. Three themes: Carbon, Midnight and Paper. Optional key-click sound.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useVelocity`, `useTransform`, `useSpring`, `useReducedMotion`), Web Audio, and a `cn` class-merge helper.
- Files: `components/terminal/terminal.tsx` (named export `Terminal`, types `TerminalTheme`, `TerminalTone`, `TerminalLine`, `TerminalOutput`, `TerminalCommand`, `TerminalProps`) and `components/terminal/sprite-audio.ts` (`createTerminalSpriteSfx`).

## API

`TerminalCommand = { input: string; output?: TerminalOutput; runDelayMs?: number }`; `TerminalOutput = Array<string | { text: string; tone?: TerminalTone }>` (strings are muted); `TerminalTone = "muted" | "success" | "warning" | "error" | "info"`. Lines are `input`, `output` (with tone), `spinner` or `progress` (label + 0–100 bar).

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `commands` | `TerminalCommand[]` | 3-command demo | Script typed in order; re-runnable by typing. |
| `promptSymbol` | `string` | `"➜"` | Prompt glyph. |
| `username` / `hostname` | `string` | `"you"` / `"nexus"` | Title bar, prompt, `whoami`, `pwd`. |
| `typingSpeed` / `typingJitter` | `number` | `34` / `30` | Ms per char + random extra. |
| `startupDelay` | `number` | `450` | Ms before the script. |
| `delayBetweenCommands` | `number` | `750` | Ms after each command. |
| `autoStart` | `boolean` | `true` | Run once when 30% visible. |
| `loop` / `loopDelay` | `boolean` / `number` | `false` / `1600` | Repeat forever, pause between. |
| `autoplay` | `boolean` | `false` | Loop until the visitor clicks or types, then hand over. |
| `interactive` | `boolean` | `true` | Accept typing. |
| `onCommand` | `(input) => TerminalOutput \| void` | – | Custom answers; nothing → built-ins. |
| `showCursor` | `boolean` | `true` | Caret. |
| `enableSound` | `boolean` | `false` | Key clicks (initial state of the toggle). |
| `soundSpriteUrl` / `soundSpriteConfigUrl` | `string` | – / `"/sounds/sprite-config.json"` | OGG sprite + JSON `{ defines: { charCode: [offsetMs, durMs] } }`. Nothing is fetched without a URL. |
| `simpleSoundUrl` | `string` | – | One file played per key instead. |
| `showSoundToggle` / `showControls` | `boolean` | `true` / `true` | Title-bar buttons. |
| `theme` | `"carbon" \| "midnight" \| "paper"` | `"carbon"` | Window style. |
| `fillHeight` | `boolean` | `false` | Fill a fixed-height flex parent instead of a 300px body. |
| `hint` | `string` | `"Click in and type help."` | Line under the window; `""` hides. |
| `className` | `string` | `""` | Root classes. |

Default script: `npm create nexus@latest` (700ms; info "Scaffolding project in ./my-app", success "Done. 214 packages installed in 2.1s"); `cd my-app && npm run dev` (500ms; "  ready in 412 ms", info "  Local: http://localhost:3000"); `git push origin main` (650ms; "Enumerating objects: 42, done.", success "main -> main").

## Layout and look

- Root fades in from `opacity 0, y 16, scale 0.98`, spring 220/24. Window radius 22, `overflow: hidden`.
- Title bar 44px, padding 0 16px: three 12px traffic lights `#ff5f57`, `#febc2e`, `#28c840` (gap 8, inset 0.5px dark ring); centred title "{username}@{hostname}: ~" 12px medium, truncated, inset 96px each side; right: 28px round icon buttons (14px icons, stroke 1.6) for pause/resume/replay and sound on/off.
- Body: padding 16 (20 from `sm`), monospace 13px, leading 1.6, hidden scrollbar, auto-scrolls to the bottom (rAF) on every change, `cursor: text`, 300px tall unless `fillHeight`.
- Prompt: `{symbol} {hostname} ~` then 1ch gap. Input text is tokenised: first word and the word after `&&`, `||`, `|`, `>` = command; `-x`/`--x` flags; quoted strings; paths starting `~`, `./`, `../`, `/`; `$VAR`; operators.
- Carbon: frame `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.06), 0 30px 60px -30px rgba(0,0,0,.6)`; bar `#2c2c2e` at 70% with a white 6% bottom border; title/buttons `#a1a1a6` (hover white 10% bg, `#f5f5f7`); body `#f5f5f7`; prompt `#30d158`; host `#64d2ff`; dim `#8e8e93`; caret `#f5f5f7`. Tokens: cmd `#64d2ff`, flag `#da8fff`, path `#30d158`, string `#ffd60a`, operator `#a1a1a6`, var `#ff9f0a`, text `#f5f5f7`. Tones: muted `#a1a1a6`, success `#30d158`, warning `#ffd60a`, error `#ff6961`, info `#64d2ff`.
- Midnight: frame `linear-gradient(180deg, #0f1630, #090d1d)`, ring `rgba(120,150,255,.14)`, drop `rgba(10,20,80,.7)`; bar white 3% with white 7% border; title `#a3acd9`; body `#eef1ff`; prompt `#bf5af2`; caret `#64d2ff`; cmd `#7aa2ff`; muted `#a3acd9`; dim `#8a93bd`; rest as Carbon.
- Paper (light, turns Carbon-like under `.dark`): frame white, `0 0 0 1px rgba(0,0,0,.06), 0 30px 60px -34px rgba(0,0,0,.35)`; bar `#f5f5f7` with black 6% border; title `#6e6e73`; body `#1d1d1f`; prompt `#248a3d`; host `#0071e3`; caret `#1d1d1f`; cmd `#0071e3`, flag `#8e3fbf`, path `#248a3d`, string `#a05a00`, var `#c93400`; tones muted `#6e6e73`, success `#248a3d`, warning `#a05a00`, error `#d70015`, info `#0060c7`.
- Hint: 12px below, centred, 13px `#86868b` (dark `#a1a1a6`).

## Motion

- Typing: per character, wait `typingSpeed + random·typingJitter`, plus 22ms after a space or 12ms after `-` or `/`; 160ms pause before "Enter". Then the line commits, a spinner line ("running", 12px ring with transparent top, rotating 0.8s linear) shows for `runDelayMs`, and output lines appear one by one 90–200ms apart.
- New input lines enter from `opacity 0.4, y 3`; output lines from `opacity 0, x −6`; both spring 520/34. Progress bars spring their width (120/20).
- Caret: 0.6em × 1.2em, radius 2, nudged down 0.22em. A motion value tracks the live text length; `stretch = 1 + min(|velocity|, 70)/70` → `useSpring(stiffness 420, damping 18)`; `scaleX = s`, `scaleY = 1/√s`, origin bottom-left. Blink: opacity `[1,1,0,0]`, times `[0,.5,.5,1]`, 1.06s, infinite, 0.5s delay, restarting on each keystroke. When the prompt is ready but unfocused the caret is hollow (1px border, 60% opacity).
- All waits use an abortable sleep tied to an `AbortController`; pausing polls every 120ms.

## Interaction and states

- Phases: idle, running, paused, ready, done. The live prompt line shows the typed (script) or draft (visitor) text except while output is printing or when done.
- First pointer down anywhere (except the title bar), focus or key in the hidden input "takes over": abort the demo, drop spinners, commit the half-typed line with `^C`, phase ready. Clicking the body focuses a 1px invisible input.
- Enter runs: `onCommand` result first; else a matching scripted command re-runs its output; else built-ins: `help` (lists commands + info line "Or type any command from the script to run it again."), `clear`, `replay` (restart script), `ls` ("app  components  lib  public  package.json  README.md"), `pwd` (`/Users/{username}`), `whoami`, `echo …`, `date`, `history` (numbered, padded to 4); otherwise error "command not found: {name}". Empty input just prints a prompt.
- Up/Down walk history; Tab completes the first command or built-in starting with the draft; Ctrl+C cancels (prints `draft^C`); Ctrl+L clears.
- Title buttons: Pause/Resume while running/paused, otherwise Replay. Sound toggles a master gain to 0/1 immediately.
- Sound: sprite slices by char code (lowercase falls back to uppercase, then space or "A"; Enter uses 13 or 10) at volume 0.4 / 0.52. Fallback synth: triangle oscillator 245–305Hz (Enter 165Hz), gain ramps to 0.08 (Enter 0.12) in 2ms and decays over 40ms (80ms). No sound under reduced motion.
- Reduced motion: commands appear fully typed, no spinner delay, lines don't animate, no entrance.

## Autoplay demo

With `autoplay`, the script starts on scroll-in and loops (pause `loopDelay`) until the first click or key, then hands over the prompt.

## Accessibility

- Output is a `role="log"`, `aria-live="polite"` labelled "Terminal output"; the live typing line is `aria-hidden`. The hidden input is labelled "Terminal command" with autocomplete, autocapitalise and spellcheck off. Buttons labelled Pause / Resume / Replay script and "Mute key sounds" / "Play key sounds" (`aria-pressed`), with focus rings.

## Acceptance checklist

- On scroll-in the script types with uneven, human rhythm, shows a spinner, then prints coloured output.
- The caret visibly widens during fast typing and settles back; it blinks only when idle.
- Clicking in mid-typing prints `^C` and gives a ready prompt; `help`, `ls`, `echo hi`, history and Tab work.
- Typing a scripted command re-runs its output.
- Pause, resume and replay work from the title bar.
- All three themes match their colours; Paper follows dark mode.
- Sound plays only when toggled on and stops instantly when muted.

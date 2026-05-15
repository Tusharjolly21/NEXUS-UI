export type KeyKind = "normal" | "modifier" | "space" | "enter" | "delete" | "fn" | "nav";
export type SoundVariant = "normal" | "space" | "enter" | "delete" | "modifier";

export interface KeyDef {
  id: string;
  label: string;
  sub?: string;       // shift-layer label shown smaller
  code: string;       // KeyboardEvent.code
  char: string;       // character to insert
  width: number;      // flex units
  kind: KeyKind;
  sound: SoundVariant;
  groupGap?: boolean; // add extra gap before this key (fn row groups)
}

type Row = KeyDef[];

const k = (
  id: string,
  label: string,
  sub: string | undefined,
  code: string,
  char: string,
  width: number,
  kind: KeyKind = "normal",
  sound: SoundVariant = "normal",
  groupGap = false,
): KeyDef => ({ id, label, sub, code, char, width, kind, sound, groupGap });

// Every row except fn sums to 15 flex-units so rows stay aligned.
export const MAC_ROWS: Row[] = [
  // ── Function row ─────────────────────────────────────────────
  // Esc=1.5u + 12 F-keys=1u each + 3 inter-group gaps → fills naturally via flex
  [
    k("Escape", "esc", undefined, "Escape", "", 1.5, "modifier", "modifier"),
    k("F1",  "F1",  undefined, "F1",  "", 1, "fn", "modifier", true),
    k("F2",  "F2",  undefined, "F2",  "", 1, "fn", "modifier"),
    k("F3",  "F3",  undefined, "F3",  "", 1, "fn", "modifier"),
    k("F4",  "F4",  undefined, "F4",  "", 1, "fn", "modifier"),
    k("F5",  "F5",  undefined, "F5",  "", 1, "fn", "modifier", true),
    k("F6",  "F6",  undefined, "F6",  "", 1, "fn", "modifier"),
    k("F7",  "F7",  undefined, "F7",  "", 1, "fn", "modifier"),
    k("F8",  "F8",  undefined, "F8",  "", 1, "fn", "modifier"),
    k("F9",  "F9",  undefined, "F9",  "", 1, "fn", "modifier", true),
    k("F10", "F10", undefined, "F10", "", 1, "fn", "modifier"),
    k("F11", "F11", undefined, "F11", "", 1, "fn", "modifier"),
    k("F12", "F12", undefined, "F12", "", 1, "fn", "modifier"),
  ],

  // ── Number row (15u) ─────────────────────────────────────────
  [
    k("Backquote",   "`",  "~",  "Backquote",   "`",  1),
    k("Digit1",      "1",  "!",  "Digit1",      "1",  1),
    k("Digit2",      "2",  "@",  "Digit2",      "2",  1),
    k("Digit3",      "3",  "#",  "Digit3",      "3",  1),
    k("Digit4",      "4",  "$",  "Digit4",      "4",  1),
    k("Digit5",      "5",  "%",  "Digit5",      "5",  1),
    k("Digit6",      "6",  "^",  "Digit6",      "6",  1),
    k("Digit7",      "7",  "&",  "Digit7",      "7",  1),
    k("Digit8",      "8",  "*",  "Digit8",      "8",  1),
    k("Digit9",      "9",  "(",  "Digit9",      "9",  1),
    k("Digit0",      "0",  ")",  "Digit0",      "0",  1),
    k("Minus",       "-",  "_",  "Minus",       "-",  1),
    k("Equal",       "=",  "+",  "Equal",       "=",  1),
    k("Backspace",   "⌫",  undefined, "Backspace", "", 2, "delete", "delete"),
  ],

  // ── QWERTY row (15u) ─────────────────────────────────────────
  [
    k("Tab",          "⇥",  undefined, "Tab",          "\t", 1.5, "modifier", "modifier"),
    k("KeyQ",         "Q",  undefined, "KeyQ",         "q",  1),
    k("KeyW",         "W",  undefined, "KeyW",         "w",  1),
    k("KeyE",         "E",  undefined, "KeyE",         "e",  1),
    k("KeyR",         "R",  undefined, "KeyR",         "r",  1),
    k("KeyT",         "T",  undefined, "KeyT",         "t",  1),
    k("KeyY",         "Y",  undefined, "KeyY",         "y",  1),
    k("KeyU",         "U",  undefined, "KeyU",         "u",  1),
    k("KeyI",         "I",  undefined, "KeyI",         "i",  1),
    k("KeyO",         "O",  undefined, "KeyO",         "o",  1),
    k("KeyP",         "P",  undefined, "KeyP",         "p",  1),
    k("BracketLeft",  "[",  "{",  "BracketLeft",  "[",  1),
    k("BracketRight", "]",  "}",  "BracketRight", "]",  1),
    k("Backslash",    "\\", "|",  "Backslash",    "\\", 1.5, "modifier", "modifier"),
  ],

  // ── ASDF row (15u) ───────────────────────────────────────────
  [
    k("CapsLock", "caps",   undefined, "CapsLock", "",   1.75, "modifier", "modifier"),
    k("KeyA",     "A",      undefined, "KeyA",     "a",  1),
    k("KeyS",     "S",      undefined, "KeyS",     "s",  1),
    k("KeyD",     "D",      undefined, "KeyD",     "d",  1),
    k("KeyF",     "F",      undefined, "KeyF",     "f",  1),
    k("KeyG",     "G",      undefined, "KeyG",     "g",  1),
    k("KeyH",     "H",      undefined, "KeyH",     "h",  1),
    k("KeyJ",     "J",      undefined, "KeyJ",     "j",  1),
    k("KeyK",     "K",      undefined, "KeyK",     "k",  1),
    k("KeyL",     "L",      undefined, "KeyL",     "l",  1),
    k("Semicolon",";" ,     ":",  "Semicolon",";" , 1),
    k("Quote",    "'",      "\"", "Quote",    "'",  1),
    k("Enter",    "return", undefined, "Enter",    "\n", 2.25, "enter", "enter"),
  ],

  // ── ZXCV row (15u) ───────────────────────────────────────────
  [
    k("ShiftLeft",  "⇧", undefined, "ShiftLeft",  "",  2.25, "modifier", "modifier"),
    k("KeyZ",       "Z", undefined, "KeyZ",       "z", 1),
    k("KeyX",       "X", undefined, "KeyX",       "x", 1),
    k("KeyC",       "C", undefined, "KeyC",       "c", 1),
    k("KeyV",       "V", undefined, "KeyV",       "v", 1),
    k("KeyB",       "B", undefined, "KeyB",       "b", 1),
    k("KeyN",       "N", undefined, "KeyN",       "n", 1),
    k("KeyM",       "M", undefined, "KeyM",       "m", 1),
    k("Comma",      ",", "<",  "Comma",      ",", 1),
    k("Period",     ".", ">",  "Period",     ".", 1),
    k("Slash",      "/", "?",  "Slash",      "/", 1),
    k("ShiftRight", "⇧", undefined, "ShiftRight", "",  2.75, "modifier", "modifier"),
  ],

  // ── Bottom row (15u) ─────────────────────────────────────────
  [
    k("Fn",          "fn",      undefined, "Fn",          "", 1,    "modifier", "modifier"),
    k("ControlLeft", "control", undefined, "ControlLeft", "", 1.5,  "modifier", "modifier"),
    k("AltLeft",     "option",  undefined, "AltLeft",     "", 1.5,  "modifier", "modifier"),
    k("MetaLeft",    "⌘",       undefined, "MetaLeft",    "", 1.75, "modifier", "modifier"),
    k("Space",       "",        undefined, "Space",       " ", 5,   "space",    "space"),
    k("MetaRight",   "⌘",       undefined, "MetaRight",   "", 1.75, "modifier", "modifier"),
    k("AltRight",    "option",  undefined, "AltRight",    "", 1.5,  "modifier", "modifier"),
    k("ArrowLeft",   "←",       undefined, "ArrowLeft",   "", 1,    "nav",      "modifier"),
    k("ArrowRight",  "→",       undefined, "ArrowRight",  "", 1,    "nav",      "modifier"),
  ],
];

export const COMPACT_ROWS: Row[] = MAC_ROWS.slice(1);

// Maps alternate code names browsers emit for the same physical key
export const CODE_ALIASES: Record<string, string> = {
  OSLeft:  "MetaLeft",
  OSRight: "MetaRight",
};

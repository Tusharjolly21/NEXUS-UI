/** Re-export shim: some bundlers resolve `@/components/terminal` to this file before the directory. */
export type { TerminalTheme, TerminalLine, TerminalCommand, TerminalProps } from "./terminal/terminal";
export { Terminal } from "./terminal/terminal";
export { TerminalDemo } from "./terminal/demo";

# Build prompt: Huddle — AI agent team workspace app

Build **Huddle**, a full-screen workspace app for an invented product where a team of AI agents lives in the sidebar like colleagues. Each agent is a small character the user designs, shown as a glossy 3D figure that watches the pointer. People talk to one agent in a direct message or pull several into a huddle where they answer in turn. The feel is a calm, near-black studio with one lime accent and characters that feel alive. Everything is a working mock: no network calls, no real model.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string (selection, focus rings, thin scrollbars, a blink, a shimmer, a caret) under an `.hd` wrapper.
- Framer Motion 12 for all interface motion; `three` with `@react-three/fiber` for the 3D figure only. No other UI or animation libraries.
- Fonts self-hosted from `/public/fonts/huddle`: Inter (variable) for everything, Geist Mono (variable) for code, keys and figures. Keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings; avatars are DiceBear Notionists SVGs inlined as data URLs.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Building blocks

- **AgentFace**: an SVG character from a body shape (blob, star, flower, shield, cloud, heart, diamond, squircle, drop), a colour and a pair of eyes (dot, bean, wide, happy, sleepy, wink, sparkle, focused), with moods (idle, thinking, listening, talking) and blinking. Deterministic for an agent id.
- **Agent3D**: the same shape extruded into a soft, glossy figure in a react-three-fiber canvas, with the face as a texture. It turns to follow the pointer and does a squash-and-stretch hop whenever the shape, colour or eyes change.
- **Message**: a reply bubble with a streaming caret, reactions, retry and copy, code blocks and attachments; agent mentions render as chips.
- **Composer**: a growing textarea with @mention autocomplete, attachments, a goal field, a plugins menu, a model menu with effort levels and a permission mode menu (Auto, Ask first, Plan only, Bypass). Enter sends, Shift Enter makes a new line.
- **Sheet**: a dialog that slides up on phones and centres on wide screens, with focus moving in and Escape to close.

## Screens

1. **Sidebar.** Workspace switcher, search across agents and huddles, a list of agents with their faces, unread dots and last lines, a huddles list, New agent, Start a huddle and Browse marketplace, plus help, shortcuts, a support chat and the profile menu. On phones it is a drawer.
2. **Direct message.** A thread with one agent: replies stream in with a caret and a thinking state, with reactions, retry and copy on each, and a header with the agent's face (click to edit), Start a huddle, Voice mode and Edit agent.
3. **Huddle.** Two to four agents on one question: they hand it to each other, mention each other and stream replies in turn, with a row of faces that light up while speaking.
4. **Agent editor.** A panel beside the chat with the 3D figure on top, then shape, expression, colour, name, label, description, voice with playback speed, language and notifications. Every change makes the figure hop. New agent opens it on a fresh character with a ready-made name.
5. **Huddle setup.** Pick two to four agents and a topic, preview the circle of faces, then start.
6. **Voice mode.** A full-panel overlay with a canvas orb in the agent's colours that swells with a simulated voice, a level meter, the words typing in as they are heard, Cancel and Send now. It says plainly that no microphone is used.
7. **Settings.** A large sheet with tabs: a marketplace of agents to add, plugins with on and off switches, models with a default and effort, workspace name and switches, and members with roles.

## Look

- Page `#0C0C0E`, sidebar `#0F0F12`, panels `#121215`, raised `#19191D` and `#212126`, hairlines at 7 to 16% white.
- Ink `#EDEDEF`, text `#A9A9B2`, soft `#80808A`, faint `#4A4A53`; accent lime `#D4F26A` with ink `#141905`; danger `#FF8080`.
- Agent colours are a set of saturated pastels used for faces, orbs and small highlights.
- Inter at 13 to 15px for the interface, 22 to 28px with tight tracking for headings; radii 10 to 18px.

## Motion

- Springs for menus, sheets, the active row pill and the hop; layout animations when messages arrive.
- The figure's pointer follow, the voice orb and the level meter run in requestAnimationFrame loops that stop when hidden.
- Replies stream character by character with natural pauses after punctuation.
- With reduced motion, replies appear whole, the figure stays still and the voice demo finishes at once.

## Content

Huddle, Ines Carvalho and every agent, person, figure and message are invented sample content. Keep agents, plugins, models, modes, voices, members and reply scripts as arrays in a data file so a reader can swap in their own.

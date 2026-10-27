/**
 * video-prompt.ts — SERVER ONLY
 *
 * Builds the "build prompt" for a video: short instructions plus the video's real files, so a coding
 * agent gets this exact video and not a look-alike. It is made on request from the files that ship
 * with the video (content/videos), so the prompt can never drift from the source.
 *
 * It has four parts:
 *   1. What to create and what the video needs (images, soundtrack, recordings).
 *   2. "Make it yours": how to change the words, colours, timing and shape.
 *   3. The shot list the video was made from (the plain-words brief), which is also the map for edits.
 *   4. The files themselves.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { FORMATS, isHyperframes, type VideoEntry } from "@/lib/catalog/videos";
import { videoDefaults } from "@/lib/catalog/video-defaults";

const SITE = "https://www.nexus-ui.com";

/** Recorded clips a video plays besides its code: file name -> where it is published. */
const RECORDINGS: Record<string, string[]> = {
  "will-return": ["will-return-16x9.mp4", "will-return-9x16.mp4"],
};

async function read(rel: string): Promise<string> {
  return readFile(path.join(process.cwd(), "content", "videos", rel), "utf8");
}

const fence = (lang: string, code: string) => "```" + lang + "\n" + code.trimEnd() + "\n```";

/** `./assets/...` images the source imports, in order of first use. */
export function sourceAssets(source: string): string[] {
  const out: string[] = [];
  for (const m of source.matchAll(/from\s+"\.\/assets\/([^"]+)"/g)) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

/** Packages the source imports besides React, e.g. a font. */
function sourcePackages(source: string): string[] {
  const out: string[] = [];
  for (const m of source.matchAll(/^import[^"\n]*from\s+"([^".][^"]*)"/gm)) {
    const name = m[1].startsWith("@") ? m[1].split("/").slice(0, 2).join("/") : m[1].split("/")[0];
    if (name !== "react" && !out.includes(name)) out.push(name);
  }
  return out;
}

/** Nexus UI components a video shows inside itself (imported from the site's own folders) -> their install names. */
const SITE_COMPONENT: Record<string, string> = { keyboard: "mac-keyboard" };
function sourceSiteComponents(source: string): string[] {
  const out: string[] = [];
  for (const m of source.matchAll(/from\s+"\.\.\/components\/(?:nexus\/)?([^"]+)"/g)) {
    const slug = SITE_COMPONENT[m[1]] ?? m[1];
    if (!out.includes(slug)) out.push(slug);
  }
  return out;
}

function componentName(source: string, fallback: string): string {
  return source.match(/export interface (\w+)Props\b/)?.[1] ?? fallback;
}

const seconds = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, "")}s`;

function fieldLines(video: VideoEntry, values: Record<string, string>): string {
  return video.fields
    .map((f) => {
      const v = values[f.key] ?? video.defaults[f.key] ?? "";
      if (f.type === "text") return `- \`${f.key}\` (${f.label}, up to ${f.max ?? 40} characters): "${v}"`;
      if (f.type === "color") return `- \`${f.key}\` (${f.label}, a hex colour): ${v}`;
      return `- \`${f.key}\` (${f.label}, ${f.min} to ${f.max}): ${v}`;
    })
    .join("\n");
}

/**
 * The prompt for a HyperFrames video: what it is, how to render it, how to change it, the shot list
 * and the real index.html. There is no kit, frame page or render script, because HyperFrames brings
 * its own CLI.
 */
async function buildHyperframesPrompt(video: VideoEntry): Promise<string> {
  const slug = video.slug;
  const [html, brief] = await Promise.all([read(`${slug}/index.html`), read(`${slug}/prompt.md`)]);
  const shape = FORMATS[video.formats[0]];
  const header = [
    `# ${video.title}`,
    "",
    `Add the "${video.title}" video from Nexus UI to my project as a HyperFrames composition, and render it to MP4 exactly like the original.`,
    "",
    video.blurb,
    "",
    `HyperFrames (https://github.com/heygen-com/hyperframes, Apache-2.0) turns an HTML file into a video: it opens the page in headless Chrome, sets the clock to each frame, and encodes the frames with FFmpeg. The animation is a paused GSAP timeline, so the same file always gives the same frames. This one is ${shape.label} (${shape.w}×${shape.h}), ${seconds(video.duration)} long, 30 fps, with no sound.`,
    "",
    "Please:",
    "",
    "1. Make sure Node.js 22 or newer and FFmpeg are installed. Nothing else needs installing: the CLI runs with `npx hyperframes`.",
    "2. Make a folder for the video and save the file below in it as `index.html`, exactly as it is. Add a `hyperframes.json` next to it only if your setup asks for one (`npx hyperframes init` makes a starter project you can copy `index.html` into).",
    "3. Run `npx hyperframes check` and fix anything it reports as an error. Warnings about the layout of the timeline are fine to leave.",
    "4. Run `npx hyperframes preview` to watch it in the browser, then `npx hyperframes render -q delivery -o " + slug + ".mp4` for the final file (`-q draft` is quicker while you edit).",
    "",
    "Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain how the timing is built. The only thing to adapt is where the file lives.",
    "",
    "## Make it yours",
    "",
    `Check that the original plays and renders first. Then change only what you want, in plain words, for example: "change the headline to my product's name", "swap the blue for my brand colour", "make it ten seconds", or "make it 1:1".`,
    "",
    "- **Words and colours** are in the HTML and in the CSS variables at the top of the `<style>` block (`:root`). Change them there.",
    `- **Timing.** Every scene is a block with \`data-start\` and \`data-duration\` (seconds), and its animation is a GSAP tween on the timeline at the bottom of the file. Move a scene by changing both its \`data-start\` and the times of its tweens, and keep the root \`data-duration\` at least as long as the last scene. Keep every animation on the paused GSAP timeline registered as \`window.__timelines["${slug}"]\`: anything that runs on its own clock (CSS animations, \`setInterval\`, \`Math.random\`) will not match when HyperFrames renders frame by frame.`,
    `- **Shape.** The page is ${shape.w}×${shape.h}. For another shape, change \`data-width\` and \`data-height\` on the root element, the \`width\`/\`height\` of \`html, body\` and \`#root\` in the CSS, and the \`viewport\` meta tag, then check each scene in it.`,
    "- **Fonts.** The file asks for Inter and falls back to the system font. If your machine does not have Inter, install it or link a font in the `<head>`: the renderer only uses fonts the page can load.",
    "",
    "## The shot list",
    "",
    "This is the plain-words brief the video was made from. It is the map of the file: use it to find the part you want to change.",
    "",
    brief.trim(),
    "",
    "## index.html",
    "",
    fence("html", html),
  ].join("\n");
  return `${header}\n`;
}

export async function buildVideoPrompt(video: VideoEntry): Promise<string> {
  if (isHyperframes(video)) return buildHyperframesPrompt(video);
  const slug = video.slug;
  const [source, brief, kit, parts, frame, render] = await Promise.all([
    read(`${slug}/source.tsx`),
    read(`${slug}/prompt.md`),
    read("kit.ts"),
    video.parts ? read("parts.tsx") : Promise.resolve(""),
    read("frame.tsx"),
    read("render.mjs"),
  ]);

  const Comp = componentName(source, "Video");
  const values = videoDefaults(slug);
  const first = video.fields.find((f) => f.type === "text");
  const shapes = video.formats.map((f) => `${FORMATS[f].label} (${FORMATS[f].w}×${FORMATS[f].h}, ${FORMATS[f].where})`).join(", ");
  const assets = sourceAssets(source);
  const packages = sourcePackages(source);
  const siteComponents = sourceSiteComponents(source);
  const clips = RECORDINGS[slug] ?? [];
  const otherShape = (["1:1", "9:16", "16:9", "4:5"] as const).find((f) => !video.formats.includes(f)) ?? video.formats[0];
  const beat = video.bpm > 0 ? 60 / video.bpm : 0;
  const fileList = [`${slug}.tsx`, "kit.ts", ...(video.parts ? ["parts.tsx"] : []), "frame.tsx", "render.mjs"];

  const steps: string[] = [
    `Create the files below at sensible paths for this project, keeping each file's name (the video file is called \`${slug}.tsx\`). They import each other with relative paths, so keep them together: ${fileList.map((f) => `\`${f}\``).join(", ")}.`,
    packages.length
      ? `It needs React and ${packages.map((p) => `\`${p}\``).join(", ")} (use this project's package manager). Everything is drawn with plain inline styles, so there is no Tailwind or CSS file to set up. ${packages.some((p) => p.startsWith("@fontsource")) ? `If your bundler does not turn the font import into a URL, use ${SITE}/videos/assets/plus-jakarta-sans.woff2 instead.` : ""}`.trim()
      : siteComponents.length
        ? "It needs React. The video itself is drawn with plain inline styles; the Nexus UI components listed next bring their own packages."
        : "It needs only React. It is drawn with plain inline styles, so there is no Tailwind, CSS file or animation library to set up.",
  ];
  if (siteComponents.length) {
    steps.push(
      `This video shows real Nexus UI components inside it. The file imports them from \`../components/nexus/<name>\` (and \`../components/keyboard\`), so install each one with the Nexus UI CLI (Pro components need your Nexus API key, set up once as described at ${SITE}/docs/cli), then change those import paths to wherever they land in this project:\n${siteComponents.map((c) => `   - \`npx shadcn@latest add @nexus-labs/${c}\``).join("\n")}`,
    );
  }
  if (assets.length) {
    steps.push(
      `The video imports ${assets.length} image${assets.length === 1 ? "" : "s"} from \`./assets/\`. Download each into an \`assets/\` folder next to \`${slug}.tsx\`, keeping the sub-folders, and import them the way your project handles images:\n${assets.map((a) => `   - ${SITE}/videos/assets/${a}`).join("\n")}`,
    );
  }
  if (clips.length) {
    steps.push(
      `The video plays these recorded clips (the live site, recorded frame by frame). Download them into the same folder as \`${slug}.tsx\`, or change the \`src\` in the file to wherever you serve them:\n${clips.map((c) => `   - ${SITE}/videos/files/${c}`).join("\n")}`,
    );
  }
  if (!video.silent) {
    steps.push(
      `The picture is cut to its soundtrack. Download ${SITE}/videos/audio/${slug}.mp3, keep it next to the video, and play it from 0 while \`t\` runs. render.mjs can add it to the MP4 with \`--audio\`.`,
    );
  }
  steps.push(
    `Show it: the component is a pure function of time. Make a small page that renders \`<${Comp} t={t} w={W} h={H} />\` inside a box of W×H pixels scaled to fit, and moves \`t\` from 0 to ${seconds(video.duration)} with requestAnimationFrame (and a slider to scrub). Nothing inside the component runs a timer, so scrubbing and rendering give the same frames.`,
    `To export an MP4, \`frame.tsx\` is the page the render script captures: set it up as a route (it already imports this video) and run \`render.mjs\` as its header describes.`,
  );

  const tweak = [
    "## Make it yours",
    "",
    `Copy the files as they are first and check the video plays like the original. Then change only what you want, and ask your agent in plain words, for example: "make it ${seconds(Math.max(5, Math.round(video.duration * 0.75)))}", "use #ff5500 as the accent colour", "write the words for my product, ${first ? `my ${first.label.toLowerCase()} is …` : "here they are …"}" or "also make a ${FORMATS[otherShape].label} version". Ask it to keep the video a pure function of \`t\` (no timers, no Date.now, no Math.random without a fixed seed).`,
    "",
    ...(video.fields.length
      ? [
          "**Words, numbers and colours** are props, so you never need to edit the animation. Pass any of these to the component; the values shown are what this video starts with:",
          "",
          fieldLines(video, values),
          "",
        ]
      : []),
    `**Timing.** It runs ${seconds(video.duration)}${video.loop ? " and is a seamless loop (frame 0 equals the last frame; keep it that way)" : ""}. The picture cuts at ${video.cuts.map(seconds).join(", ")}${beat ? `, which are beats of the soundtrack (${video.bpm} BPM, one beat is ${beat.toFixed(3)}s)` : ""}. To change the length or the cuts, edit \`duration\` and \`cuts\` in the file's \`meta\` and the time ranges inside the component. If you swap the soundtrack, retime the cuts to its beats.`,
    "",
    `**Shape.** It is made for ${shapes}. It lays itself out for the \`w\` and \`h\` you give it, so another shape is just a different size; check every shot in it.`,
    "",
    "**Anything else.** The shot list below says what happens second by second, and the code is organised the same way. Name the shot you want changed (\"in the 4.5 to 7.5 second part, …\") and ask for just that change.",
  ];

  const header = [
    `# ${video.title}`,
    "",
    `Add the "${video.title}" video from Nexus UI to my project, and make it play exactly like the original.`,
    "",
    video.blurb,
    "",
    `It is a React component that draws one frame for any time \`t\` (in seconds): \`<${Comp} t={3.2} w={${FORMATS[video.formats[0]].w}} h={${FORMATS[video.formats[0]].h}} />\`. It runs ${seconds(video.duration)}, in ${shapes}.`,
    "",
    "Please:",
    "",
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths.",
    "",
    ...tweak,
    "",
    "## The shot list",
    "",
    "This is the plain-words brief the video was made from. It is the map of the file: use it to find the part you want to change.",
    "",
    brief.trim(),
  ].join("\n");

  // frame.tsx imports a sample video; point it at this one.
  const frameFile = frame.replace(/import LaunchReel from "\.\/launch-reel";/, `import ${Comp} from "./${slug}";`).replace(/<LaunchReel\b/g, `<${Comp}`);

  const files = [
    `--- ${slug}.tsx ---\n\n${fence("tsx", source)}`,
    `--- kit.ts ---\n\n${fence("ts", kit)}`,
    ...(video.parts ? [`--- parts.tsx ---\n\n${fence("tsx", parts)}`] : []),
    `--- frame.tsx ---\n\n${fence("tsx", frameFile)}`,
    `--- render.mjs ---\n\n${fence("js", render)}`,
  ];

  return `${header}\n\n${files.join("\n\n")}\n`;
}

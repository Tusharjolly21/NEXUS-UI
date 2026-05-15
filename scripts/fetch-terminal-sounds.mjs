/**
 * Fetches Aceternity Terminal sprite audio + timing config into public/sounds/.
 * @see https://ui.aceternity.com/components/terminal
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const soundsDir = join(__dirname, "..", "public", "sounds");

const SOUND_URL = "https://ui.aceternity.com/sounds/sound.ogg";
const CONFIG_URL = "https://ui.aceternity.com/sounds/config.json";

async function main() {
  await mkdir(soundsDir, { recursive: true });

  const oggRes = await fetch(SOUND_URL);
  if (!oggRes.ok) throw new Error(`GET sound.ogg failed: ${oggRes.status} ${oggRes.statusText}`);
  const oggBuf = Buffer.from(await oggRes.arrayBuffer());
  await writeFile(join(soundsDir, "sound.ogg"), oggBuf);

  const cfgRes = await fetch(CONFIG_URL);
  if (!cfgRes.ok) throw new Error(`GET config.json failed: ${cfgRes.status} ${cfgRes.statusText}`);
  const cfgText = await cfgRes.text();
  await writeFile(join(soundsDir, "sprite-config.json"), `${cfgText.trimEnd()}\n`);

  console.log("Wrote public/sounds/sound.ogg and public/sounds/sprite-config.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

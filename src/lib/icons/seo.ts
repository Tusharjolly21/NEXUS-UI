import type { IconMeta } from "./catalog";

/** Google shows about 155-160 characters of a description; past that it cuts the sentence off. */
const MAX = 160;

/**
 * The meta description of an icon's page. It says what the icon does, then, truthfully, whether its code is free:
 * a Pro icon can be previewed and played by anyone, but its code and sound need Pro, so it must never be called
 * "free". The longest tail that still fits in 160 characters is used, so no sentence is cut off in the results.
 */
export function iconMetaDescription(icon: Pick<IconMeta, "title" | "description" | "premium">): string {
  const name = icon.title.toLowerCase();
  const tails = icon.premium
    ? [
        ` Animated ${name} icon for React, with its own sound. Preview it free; the code is in Pro.`,
        ` Animated ${name} icon for React. Preview it free; the code is in Pro.`,
        ` Animated ${name} icon for React. Code in Pro.`,
        ` Animated React icon. Code in Pro.`,
        ` Code in Pro.`,
      ]
    : [
        ` Free animated ${name} icon for React, with its own sound. Copy the code.`,
        ` Free animated ${name} icon for React, with its own sound.`,
        ` Free animated ${name} icon for React.`,
        ` Free animated React icon.`,
        ` Free React icon.`,
      ];
  const fit = tails.find((t) => icon.description.length + t.length <= MAX) ?? tails[tails.length - 1];
  return `${icon.description}${fit}`;
}

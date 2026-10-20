/**
 * Questions people ask about a component, shown on its page and sent to search engines as
 * FAQPage structured data. Every answer has to be true of the shipped component.
 */
export type ComponentFaqItem = { q: string; a: string };

export const COMPONENT_FAQ: Record<string, ComponentFaqItem[]> = {};

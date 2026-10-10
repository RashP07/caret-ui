import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Caret's token names, taught to tailwind-merge so a caller's class can
 * override a component default (`w-auto` beats `w-full`) without
 * mistaking `text-h1` for a color or `bg-pattern` for a background color.
 */
const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "title", "body", "control", "small", "caption", "code", "input-touch"],
      "font-weight": ["control", "heading"],
      radius: ["inline", "button", "control", "card", "dialog", "pill"],
      shadow: ["float", "modal"],
      ease: ["out", "spring", "spring-soft", "gooey"],
    },
    classGroups: {
      "border-w": ["border-stroke", "border-stroke-bold"],
      "bg-image": ["bg-pattern"],
      duration: ["duration-instant", "duration-quick", "duration-settle"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}

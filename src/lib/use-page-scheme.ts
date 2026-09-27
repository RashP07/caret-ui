import { useSyncExternalStore } from "react";

const resolve = (): "light" | "dark" => {
  const mode = document.documentElement.getAttribute("data-mode");
  if (mode === "light" || mode === "dark") return mode;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/** The page's resolved mode, following both `data-mode` on <html> and the OS. */
export function usePageScheme(): "light" | "dark" {
  return useSyncExternalStore(
    (onChange) => {
      const mo = new MutationObserver(onChange);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
      const mql = matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", onChange);
      return () => {
        mo.disconnect();
        mql.removeEventListener("change", onChange);
      };
    },
    resolve,
    () => "light",
  );
}

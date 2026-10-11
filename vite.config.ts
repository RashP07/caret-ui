import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { llmsTxtPlugin } from "./scripts/llms-txt.ts";

export default defineConfig({
  plugins: [
    // File-based routes in src/routes, bundled with the app: splitting each route into its
    // own chunk made the shell render first and the page arrive later, shifting the layout.
    tanstackRouter({ target: "react", autoCodeSplitting: false }),
    react(),
    tailwindcss(),
    // /llms.txt, /llms-full.txt and /agents.md, generated from the docs registry and DESIGN.md.
    llmsTxtPlugin(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});

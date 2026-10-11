import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import type { Plugin } from "vite";
import { agentsMd } from "../src/docs/agents-guide.ts";

/*
 * llms.txt for coding agents (https://llmstxt.org), built from the docs registry so it can't drift:
 *
 *   /llms.txt       every page, grouped as in the sidebar, with its one-line description and exports
 *   /llms-full.txt  the same index, then DESIGN.md: every rule an agent needs to build with Caret
 *   /agents.md      the AGENTS.md from the Agents guide page, to drop into a repo
 *
 * The registry imports React modules, so it's read as text. Each page is one line there, which
 * keeps the parse simple. Links are absolute when SITE_URL is set at build time, relative otherwise.
 */

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

const PREFIX: Record<string, string> = { doc: "docs", foundation: "foundations", component: "components", template: "templates" };

interface Page {
  slug: string;
  title: string;
  kind: string;
  group: string;
  description: string;
  imports: string[];
}

function readPages(): { pages: Page[]; blurbs: Map<string, string> } {
  const src = readFileSync(root("src/docs/registry.ts"), "utf8");
  const pages: Page[] = [];
  for (const line of src.split("\n")) {
    if (!line.trimStart().startsWith("{ slug: ")) continue;
    const field = (k: string) => line.match(new RegExp(`\\b${k}: "((?:[^"\\\\]|\\\\.)*)"`))?.[1] ?? "";
    const imports = line.match(/imports: \[([^\]]*)\]/)?.[1].match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) ?? [];
    pages.push({ slug: field("slug"), title: field("title"), kind: field("kind"), group: field("group"), description: field("description"), imports });
  }
  const blurbs = new Map<string, string>();
  const block = src.match(/GROUP_BLURBS[^{]*\{([\s\S]*?)\n\};/)?.[1] ?? "";
  for (const m of block.matchAll(/^\s*"?([\w ]+?)"?: "(.*)",$/gm)) blurbs.set(m[1], m[2]);
  return { pages, blurbs };
}

function llmsTxt(origin: string): string {
  const { pages, blurbs } = readPages();
  const groups = [...new Set(pages.map((p) => p.group))];
  const out = [
    "# Caret",
    "",
    "> React components for agent apps: the chat, run traces and diffs, and every form and menu around them. Built on Base UI and Tailwind CSS v4, and copied into your repo as source you own.",
    "",
    `Every component works in eight themes, light and dark. Rules for coding agents, ready to drop into a repo as AGENTS.md: ${origin}/agents.md. The full design rules (tokens, composition, accessibility, motion) follow this index in ${origin}/llms-full.txt.`,
  ];
  for (const g of groups) {
    out.push("", `## ${g}`, "");
    if (blurbs.has(g)) out.push(`${blurbs.get(g)}`, "");
    for (const p of pages.filter((x) => x.group === g)) {
      const exports = p.imports.length ? ` Exports: ${p.imports.map((i) => `\`${i}\``).join(", ")}.` : "";
      out.push(`- [${p.title}](${origin}/${PREFIX[p.kind]}/${p.slug}): ${p.description}${exports}`);
    }
  }
  return out.join("\n") + "\n";
}

function files(origin: string): Record<string, string> {
  const index = llmsTxt(origin);
  return {
    "llms.txt": index,
    "llms-full.txt": `${index}\n---\n\n${readFileSync(root("DESIGN.md"), "utf8")}`,
    "agents.md": agentsMd(origin),
  };
}

export function llmsTxtPlugin(): Plugin {
  const origin = (process.env.SITE_URL ?? "").replace(/\/$/, "");
  return {
    name: "caret-llms-txt",
    // Dev: generated on every request, so edits to the registry or DESIGN.md show up at once.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split("?")[0].replace(/^\//, "") ?? "";
        const body = files(origin)[name];
        if (body === undefined) return next();
        res.setHeader("Content-Type", `${name.endsWith(".md") ? "text/markdown" : "text/plain"}; charset=utf-8`);
        res.end(body);
      });
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(files(origin))) this.emitFile({ type: "asset", fileName, source });
    },
  };
}

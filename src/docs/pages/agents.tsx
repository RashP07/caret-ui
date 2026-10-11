import { Hint } from "@/components";
import { agentsMd } from "../agents-guide";
import { PageHeading, Section, SheetCode } from "../spec";

const MISTAKES: [string, string][] = [
  ["A new button inside a screen", "Agents reach for a styled div. Point them at the component table; a screen's classes do layout only."],
  ["Raw colors and radii", "#64748b and rounded-lg look close enough and drift on the first theme change. Every value has a token."],
  ["Shadows on resting cards", "Only floating things cast a shadow. A card on the page is a hairline."],
  ["Hand-drawn icons", "An inline SVG never matches the set. Icons come from Phosphor, at 12, 14, 16 or 20."],
  ["States left for later", "Hover, focus, disabled, loading and invalid ship with the component, or it isn't done."],
];

/** Agents guide: llms.txt, the AGENTS.md to drop into a repo, and what agents get wrong. */
export default function Agents() {
  const origin = location.origin;
  return (
    <Section
      id="agents"
      title="Agents guide"
      lede="Caret is meant to be built with a coding agent beside you. Give the agent the docs as plain text, put the rules in your repo, and it composes screens from the parts you already have instead of inventing new ones."
    >
      <PageHeading>1. Point your agent at the docs</PageHeading>
      <p className="m-0 mb-3 max-w-[64ch] text-body text-pretty text-ink-2">
        <a className="link" href="/llms.txt">llms.txt</a> lists every page with its one-line description and exports.{" "}
        <a className="link" href="/llms-full.txt">llms-full.txt</a> adds every rule: tokens, composition, accessibility and
        motion. Both are generated from the docs on each build, so they never fall behind.
      </p>
      <SheetCode lang="SH" name="terminal" lines={[`curl ${origin}/llms.txt`, `curl ${origin}/llms-full.txt`]} />

      <PageHeading>2. Put the rules in your repo</PageHeading>
      <p className="m-0 mb-3 max-w-[64ch] text-body text-pretty text-ink-2">
        Save this as <code>AGENTS.md</code> at the root of your app (or paste it into <code>CLAUDE.md</code>). Agents read it
        before they touch the UI. It's also served raw at <a className="link" href="/agents.md">/agents.md</a>.
      </p>
      <SheetCode lang="MD" name="AGENTS.md" lines={agentsMd(origin).trimEnd().split("\n")} />

      <PageHeading>3. Ask for compositions</PageHeading>
      <p className="m-0 mb-3 max-w-[64ch] text-body text-pretty text-ink-2">
        Name the parts in the request. An agent told which components to use builds the screen; one told what it should
        look like builds new components.
      </p>
      <SheetCode
        lang="TXT"
        name="prompt"
        lines={[
          "Build a run history screen from @/components:",
          "a Table of runs (status Badge, duration numeric, started time),",
          "a Drawer with KeyValue and a Timeline for the selected run,",
          "and a Callout when the last run failed. Layout classes only.",
        ]}
      />

      <PageHeading>What agents get wrong</PageHeading>
      <dl className="m-0 grid max-w-[64ch] gap-4">
        {MISTAKES.map(([t, d]) => (
          <div key={t}>
            <dt className="text-control font-control text-ink">{t}</dt>
            <dd className="m-0 mt-0.5 text-body text-pretty text-ink-2">{d}</dd>
          </div>
        ))}
      </dl>
      <Hint className="mt-6">
        <span>
          Every rule lives in <code>DESIGN.md</code>, the source of truth for this repo. llms-full.txt carries all of it.
        </span>
      </Hint>
    </Section>
  );
}

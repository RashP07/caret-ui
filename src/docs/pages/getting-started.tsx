import { Kbd } from "@/components";
import { Link } from "@tanstack/react-router";
import { CardText, CardTitle } from "@/components";
import { PageHeading, Section } from "../spec";

const PRINCIPLES: [string, string][] = [
  ["State is visible", "Every control shows what it's doing: pressed, loading, selected, invalid, live. The docs do too: every specimen carries a live readout, like an editor status bar."],
  ["Tokens are typed, not guessed", "Colors, spacing, radii, motion and elevation are named values. A design decision you can't reference by name will drift."],
  ["One proportion, finished", "Controls are 36px, tuned until they feel right and work fully with a keyboard. A smaller size exists only where dense chrome needs it, never as an ad hoc height."],
];

const BELIEFS: [string, string][] = [
  ["Hairlines first", "Separate things with --line. Shadows are only for things that float: menus, tooltips, dialogs."],
  ["The accent is a selection", "The accent marks where attention is: the caret, live activity, the current item. Never a large fill."],
  ["Motion answers you", "Nothing animates for its own sake, keyboard actions never animate, and exits are faster than entrances."],
  ["The keyboard ships with it", "Every component arrives with its keyboard story, its focus behaviour and its accessible name."],
];

/** Getting started: what Caret is for, and the principles every part follows. */
export default function GettingStarted() {
  return (
    <Section
      id="getting-started"
      title="Getting started"
      lede="Caret is a library of beautiful React components with accessibility and motion built in. You get copy-in React components on Base UI, eight themes in light and dark, measured contrast, and a keyboard path for every control."
    >
      <PageHeading>Three principles</PageHeading>
      <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-1">
        {PRINCIPLES.map(([t, d]) => (
          <div key={t} className="rounded-card border border-(--rule) bg-surface p-5">
            <CardTitle>{t}</CardTitle>
            <CardText className="mt-1.5">{d}</CardText>
          </div>
        ))}
      </div>

      <PageHeading>What follows from them</PageHeading>
      <dl className="m-0 grid grid-cols-[180px_1fr] gap-x-6 gap-y-4 text-body max-[600px]:grid-cols-1 max-[600px]:gap-y-1">
        {BELIEFS.map(([t, d]) => (
          <div key={t} className="contents">
            <dt className="font-heading text-ink">{t}</dt>
            <dd className="m-0 text-ink-2 max-[600px]:mb-3">{d}</dd>
          </div>
        ))}
      </dl>

      <PageHeading>The composition rule</PageHeading>
      <p className="m-0 max-w-[64ch] text-body text-pretty text-ink-2">
        Templates and screens are compositions of existing components. They do not invent new ones: a template's own
        classes do layout only. If nothing fits, the component is added to the system first, with its own page, states,
        keyboard behaviour, every theme in light and dark, and a readout. The{" "}
        <Link to="/templates/$slug" params={{ slug: "agent-workspace" }} className="link">
          agent workspace
        </Link>{" "}
        is built this way.
      </p>

      <PageHeading>Where to go next</PageHeading>
      <p className="m-0 max-w-[64ch] text-body text-pretty text-ink-2">
        Set it up in{" "}
        <Link to="/docs/$slug" params={{ slug: "installation" }} className="link">
          Installation
        </Link>
        , read the tokens starting with{" "}
        <Link to="/foundations/$slug" params={{ slug: "color" }} className="link">
          Color
        </Link>
        , or open{" "}
        <Link to="/components" className="link">
          every component
        </Link>
        . Press <Kbd keys="⌘K" /> anywhere to search.
      </p>
    </Section>
  );
}

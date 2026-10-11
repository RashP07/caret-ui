# Contributing to Caret

Thanks for helping. Caret is small on purpose: every component has one proportion, works fully
from the keyboard, and holds its contrast in every theme. Contributions that keep it that way are
very welcome.

**Read [DESIGN.md](DESIGN.md) first.** It is the source of truth for the rules below, and a pull
request that disagrees with it needs to change it too.

## Setup

You need Node 22.6 or later (the token script runs TypeScript directly) and pnpm 10.

```sh
pnpm install
pnpm dev          # the docs site, with every component live
pnpm build        # typecheck and production build; must pass
pnpm tokens       # regenerate src/styles/tokens.css from the theme solver
```

## Ways to help

- **Report a bug.** Open an issue with what you did, what you expected, what happened, and the
  theme, mode and browser. A screenshot or a short recording helps most.
- **Fix something.** Small fixes (a focus ring, a contrast pair, a keyboard path, a typo) can go
  straight to a pull request.
- **Propose a component or a variant.** Open an issue first and describe the need, not the look.
  Caret adds a component only when no existing one fits (DESIGN.md §2), and a variant only when
  dense UI needs it, never for taste (§1).

## Rules every change follows

These are the ones reviews catch most often. The full checklist is in DESIGN.md §8.

- **Compose, don't invent.** Templates and docs pages are built from existing components; their own
  classes only do layout. If nothing fits, add the component to the system first.
- **Tokens, not values.** No hard-coded colors, radii, durations or shadows. If a role is missing,
  add it to the solver in `scripts/themes/gen.mjs` and run `pnpm tokens`. Never edit
  `tokens.css` by hand.
- **Whole pixels.** Strokes are 1px or 2px, icons are 10, 12, 14, 16 or 20px, and anything centered
  is even in an even box.
- **State is visible.** Hover, pressed, focus, selected, disabled, loading and invalid all show,
  never by color alone.
- **Keyboard first.** Every control is reachable and operable by keyboard with the right ARIA
  state. Icon-only controls get a `label`.
- **Motion and sound answer the person.** Nothing animates or plays for its own sake, keyboard
  changes don't animate, and reduced motion is respected.
- **Icons are Phosphor**, and behaviour comes from a Base UI primitive when one exists.

## Adding a component

1. Build it in `src/components/` and export it from `src/components/index.ts`.
2. Write its docs section (`Section` plus a `Spec` with a live state readout) in the right
   `src/docs/*-sections.tsx`.
3. Add one entry to `src/docs/registry.ts` and a preview in `src/docs/thumbs.tsx`. The route,
   sidebar, search, breadcrumbs and prev/next follow automatically.
4. Add it to the composition table in DESIGN.md §2 and give it a rule in §5.

## Before you open a pull request

- `pnpm build` passes, and `pnpm tokens` passes if you touched colors.
- You checked the change in at least two themes, in light and dark, at phone width, with only the
  keyboard, and with reduced motion on.
- DESIGN.md is updated if a rule, token or component changed.

## Commits and pull requests

- Write commit subjects in plain sentence case, saying what changed: "Keep the focus border when a
  focused field is hovered". No prefixes like `feat:`.
- Keep a pull request to one change, and say in its description what changed, why, and how you
  checked it. Screenshots for anything visual.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).

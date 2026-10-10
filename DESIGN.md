# DESIGN.md — Caret

Caret is a design system for tools where people and agents build software together.
This file is the source of truth for its philosophy and rules. **Read it before you add,
change, or compose anything.** When the code and this file disagree, fix one of them. Don't
leave them out of sync.

Implementation: React + Vite + Tailwind CSS v4, on [Base UI](https://base-ui.com) primitives
(`src/`, see §9). The original single-file prototype, `caret-design-system.html`, is kept as the
visual reference.

---

## 1. Philosophy

Three principles. Every decision should trace back to at least one of them.

1. **State is visible.** Every control shows what it's doing: pressed, loading, selected,
   invalid, live. The docs do this too: each specimen carries a live state readout, like an
   editor status bar. If a component can't explain its state, it isn't done.
2. **Tokens are typed, not guessed.** Colors, spacing, radii, motion and elevation are named
   values. A design decision you can't reference by name will drift. Never hard-code a value
   that a token exists for.
3. **One proportion, finished.** Each component has one proportion (controls are 36px tall),
   tuned until it feels right and works fully with a keyboard. A smaller size exists only where
   dense chrome needs it (`Button size="sm"`, `Select density="compact" / "xs"`). Don't add
   variants for taste or override heights ad hoc.

Supporting beliefs:

- **Hairlines first, shadows only for things that float.** Cards at rest have no shadow.
- **The accent works like a text selection.** It marks where attention is (the caret, live
  activity, the current item). It's never a large decorative fill.
- **Motion only answers something you did.** Nothing animates for its own sake.
- **The keyboard story ships with the component.** Not later.
- **Drafting-sheet aesthetic.** Dot-grid canvases, registration marks,
  a file-tree sidebar, mono token names. It should feel like a precise working surface, not
  a marketing page.

---

## 2. The composition rule (read this twice)

> **Templates and screens are compositions of existing components. They do not invent new
> ones.**

A template's own classes may only do **layout**: grid, flex, gap, padding, width, overflow,
visibility and positioning. It may not define new buttons, rows, tabs, pills, cards or
radii. The documented exceptions are the template frame (`rounded-dialog`, `shadow-float`),
`--e-modal` on slide-over panels at small widths, and `border-line` rules between regions.

Before you write any new class, map the need to an existing component:

| Need | Use (React, `@/components`) | Prototype class |
|---|---|---|
| Any clickable action | `<Button variant="primary / secondary / ghost / accent / danger">` (`size="sm"`: a 28px row for toasts, table rows, dense toolbars), `<IconButton label icon>` | `.btn`, `.btn-icon` |
| A switcher / picker / "chip" that changes a value | `<Select label hint error name required readOnly>`, part of the Field system like `Input` (`density="compact"` / `"xs"` inside dense UI) | `.select` (`.compact`, `.xs`) |
| A row in a list you navigate (threads, files, settings nav) | `<NavItem>` (+ `meta`, `trail`, `current`, `live`, `path`) | `.nav-item` |
| Nested rows | `<Threads>` around `<NavItem>`s | `.threads` |
| Section label inside a list | `<MenuLabel>` | `.menu-label` |
| Switching views | `<Tabs>` / `<TabList>` / `<Tab count>` / `<TabPanel>` (ink bar built in) | `.tabs`, `.tab-ink` |
| Compact 2–4 way switch | `<Seg>` | `.seg` |
| A container holding one thing and its actions | `<Card>` + `CardBody / CardHead / CardIcon / CardTitle / CardSub / CardText / CardFoot` | `.card` |
| Records to scan, sort and select (deployments, runs, invoices) | `<Table density stickyHeader caption>` + `TableHeader / TableBody / TableFooter / TableRow selected / TableHead sort onSort align / TableCell numeric truncate`; `<TableEmpty>`, `<TableSkeleton>` | — |
| Empty state | `<Card empty>` | `.card.empty` |
| Status / count / date pill | `<Badge tone="neutral / ok / live / danger / warning / info" solid dot>` | `.badge` |
| Code or a diff | `<Code>`, `<Diff>`, `<Lang>`, `<Diffstat>` | `.code`, `.diffstat` |
| Text entry | `<Field label hint error>` + `<Input lead affix trail valid>` | `.field` + `.control` |
| Helper / empty text | `<Hint>` | `.hint` |
| Breadcrumbs | `<Crumbs items>` (last item is current) | `.crumbs` |
| Chat | `MsgUser`, `MsgAgent`, `Trace`, `MsgActions`, `Composer`, `ComposerFoot`, `ContextMeter`, `Avatar`, `StreamCaret` | `.msg-*`, `.trace`, `.composer`, `.ctx` |
| Label for an icon-only control | `<IconButton label>` (required: it is both the accessible name and the tooltip); `<Button tip tipKbd>` for a tooltip on a labelled button; `<Tooltip label>` for anything else | `data-tip` |
| A row of icon actions | `<Toolbar>` + `<ToolbarButton render={<IconButton/>}>` | `.toolbar` |
| A decision that can't wait | `<AlertDialog>`; destructive confirm: `<DestructiveDialog>` | `dialog.dlg` |
| A dismissible focused task (settings, a form) | `<Dialog trigger title description footer size="sm / md / lg">` + `<DialogClose>` | — |
| Room for detail or filters without a new page | `<Drawer side="right" / "bottom">` + `<DrawerClose>` | — |
| A list of actions behind a button | `<Menu trigger>` + `MenuItem (icon, kbd, danger) / MenuCheckboxItem / MenuRadioGroup + MenuRadioItem / MenuGroup / MenuSeparator / MenuSubmenu` | — |
| The same actions at the pointer (a shortcut, never the only path) | `<ContextMenu area>` filled with Menu parts | — |
| App-chrome menus | `<Menubar>` + `<MenubarMenu label>` filled with Menu parts | — |
| Details or a quick action anchored to a button; infotip behind a help icon | `<Popover trigger title description>` (+ `openOnHover`), `<PopoverClose>` | — |
| A link that previews its destination | `<PreviewCard href preview>` (fill with Card parts) | — |
| A theme's colors (pickers, theme cards) | `<ThemeSwatch theme form="dots" / "strip">` | `.chips` |
| A setting that applies the moment it flips | `<SwitchChoice label description>` (bare: `<Switch>`) | — |
| A value where rough position matters (budget, window) | `<Slider>` (array value = range) | — |
| A bounded number with steps | `<NumberField min max step unit>` | — |
| A one-time / verification code | `<OTPField length groupAt>` | — |
| Pick one or several from many (type to filter) | `<Combobox>`, `<MultiCombobox>` | — |
| Free text with suggestions | `<Autocomplete suggestions>` | — |
| A form with submit-time validation | `<Form>` + `<Field name validate>` + `<FormActions>` | — |
| A button that stays pressed / a set of them | `<Toggle label icon>`, `<ToggleGroup multiple framed>` | — |
| A stack of questions or settings groups | `<Accordion>` + `<AccordionItem value title meta>` | — |
| Hide detail until asked for, one trigger | `<Collapsible>` + `<CollapsibleTrigger meta>` + `<CollapsiblePanel>` | — |
| A rule between regions of one thing | `<Separator>` (`orientation="vertical"`, `dashed`) | — |
| A fixed-height region that scrolls | `<ScrollArea aria-label>` | — |
| Work with an end (deploy, index, tests) | `<Progress label value>` (`value={null}` = indeterminate, `tone="danger"`) | — |
| A level within a known range (quota, storage) | `<Meter label value threshold valueText>` | — |
| Site navigation with sections of links | `<NavigationMenu>` + `<NavigationMenuGroup links>` + `<NavigationMenuLink>` | — |
| Confirmation feedback, or a way back | `toast("Agent deleted", { action: { label: "Undo", onClick } })`; options `tone`, `description`, `action`, `timeout` (returns an id; `dismissToast(id)` closes it early) | `toast()` |
| Find anything, run a command (⌘K) | `<CommandPalette groups>` (opens with no animation) | — |
| One choice among a few / independent on-off | `<RadioGroup>` + `<RadioChoice>` / `<RadioCard>` (`picture`, or `media` for a live preview); `<CheckboxGroup>` + `<CheckboxChoice parent>` | `.choice`, `.rcard`, `.cb` |

Controls fill their container (`w-full`); none carries a default max width. **Width belongs to
the layout**: constrain the wrapper, or pass `className="max-w-80"` to the control.

If nothing fits, **add the component to the system first**: its own section, specimen,
states, keyboard behaviour, all themes and a state readout. Only then use it in a
template. Never create a one-off inside a template.

**Known failure mode (it happened):** the first agent-workspace template grew its own
workspace button, panel tabs, file rows, chip buttons, plan box and preview card, each with
its own radius (6/7/8/9/12/14/18px). All of these had to be replaced by existing components.
Don't repeat it.

---

## 3. Tokens

Every theme defines the same names, each holding a light and a dark value (`light-dark()`).
Tokens are named by **role**, never by color. `src/styles/tokens.css` is generated by
`npm run tokens` (`scripts/themes/gen.mjs`), which solves each value against the grounds it
can sit on and fails if any pairing drops below its target. Retune through the solver, never
by hand.

### Color

| Token | Role | Guarantee (every theme, both modes) |
|---|---|---|
| `--page` / `--surface` / `--sunken` | Page ground / cards, controls, popups / wells, tracks | — |
| `--hover` | Pointer over a row or control | — |
| `--pressed` | Pressed, toggled on, popup open, `aria-pressed` | stronger than hover |
| `--selected` | The current or selected row (always with a second cue) | — |
| `--ink` | Text, primary actions | ≥ 7:1 on every ground and state |
| `--ink-2` | Secondary text | ≥ 7:1, APCA Lc ≥ 60 |
| `--ink-3` | Hints, meta, placeholders | ≥ 4.5:1 on page, surface, sunken, hover, pressed, selected; Lc ≥ 45 |
| `--ink-disabled` | Disabled text | ≥ 3:1 |
| `--on-ink`, `--btn-primary*` | Primary button face and text | ≥ 7:1 |
| `--line` / `--line-strong` | Decorative hairlines / strong dividers, ledges | **not** control boundaries |
| `--border-control` | Edges of inputs, selects, checkboxes, radios, switches, OTP cells | ≥ 3:1 (WCAG 1.4.11) |
| `--accent` / `--on-accent` | Brand fill and its text (small doses) | text ≥ 4.5:1 |
| `--accent-strong` | Indicators: current marks, live dot, active tab | ≥ 3:1 |
| `--accent-soft` | Selection, highlights | — |
| `--focus` | Focus ring | ≥ 3:1 |
| `--caret` | Text caret | ≥ 3:1 |
| `--link` / `--link-hover` | Links in running text (`link` utility: color + underline) | ≥ 4.5:1 |
| `--danger` `--success` `--warning` `--info` | Status text and icons | ≥ 4.5:1, also on their soft fill |
| `--{status}-soft` | Status tint | — |
| `--{status}-line` | Status borders (invalid fields, alert edges) | ≥ 3:1 |
| `--{status}-solid` / `--on-{status}` | Solid fills (destructive button, solid badge) and their text | ≥ 4.5:1 |
| `--chart-1` … `--chart-6` | Categorical data | ≥ 3:1 vs surface |
| `--scrim` | Modal backdrop | — |

The Contrast theme raises every text target to 7:1 (secondary ink 10:1) and control borders to ink.

Rules:
- **No hard-coded colors in components** (`#fff`, `rgba()`, raw hex, `color-mix` recipes that
  assume a light ground). If a role is missing, add a token to the solver.
- One state vocabulary: `hover` for pointer-over, `pressed` for on/open/pressed, `selected`
  for current (plus an `accent-strong` mark or weight change: never color alone).
- Disabled uses `ink-disabled` and `sunken`, never stacked opacity, and never moves.

Core pairings: `ink/on-ink` (primary), `accent/on-accent` (attention, small),
`surface/ink-2` (everything else, the quiet majority).

Syntax colors come from tokens (`.tk-k/.tk-s/.tk-f/.tk-n/.tk-c`), so code reads correctly in
every theme. Never hard-code syntax colors.

### Typography

- **Schibsted Grotesk**: interface and display. Three weights: 400 (`font-normal`) for
  reading, 550 (`font-control`) for controls and labels, 620 (`font-heading`) for headings.
  Tracking gets more negative as the size grows.
- **JetBrains Mono**: only where the content is literally code (keys, token names, paths, logs,
  diffs), via `mono`.
  Counts, times and percentages use the UI font with `tabular-nums`.
- Sizes are in rem, so they follow the reader's default font size. **Nothing that carries
  information goes below `caption` (12px).** Editable controls use 16px below `sm`
  (`text-input-touch`) so iOS doesn't zoom on focus.

| Step | Size / line-height / tracking | Use |
|---|---|---|
| display | `clamp(2.75rem,7vw,4.75rem)` / .98 / −4.5% | hero |
| h1 | 2.5rem / 1.1 / −3.5% | page title |
| h2 | 1.75rem / 1.1 / −3% | section title |
| title | 1.125rem (18) / 1.3 / −1.5% | dialog, drawer, card group titles |
| body | .9375rem (15) / 1.55 | reading text, chat |
| control | .875rem (14) / 1.4 | buttons, inputs, menu items |
| small | .8125rem (13) / 1.45 | labels, hints, descriptions |
| caption | .75rem (12) / 1.4 | meta, counts, kbd, badges |
| code | .78125rem (12.5) / 1.7, mono | code blocks |

### Space

4px base: `--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 · `--s-6` 32 ·
`--s-7` 48 · `--s-8` 64 · `--s-9` 96.

### Radius: by hierarchy, never one-size

**The more something floats above the page, the softer its corners.**

| Token | Value | Use |
|---|---|---|
| `--r-inline` | 4px | kbd, tags, inline code, `.lang`, checkbox box, switch track |
| `--r-button` | 4px | buttons, and anything that behaves like a button: nav items, menu options, segmented labels, trace toggle, tab tops |
| `--r-control` | 8px | inputs, select triggers, dropdown menus, segmented container, avatar, card icon |
| `--r-card` | 12px | cards, panels, code blocks, message bubbles |
| `--r-dialog` | 16px | modals, the outer frame of a full app template |
| `--r-pill` | 999px | badges, counts, context meter |

Rules:
- **Every `border-radius` uses one of these tokens.** The only exceptions are ≤3px
  decorative marks (indicator bars, meter bars) and `50%` circles.
- **Nested corners are concentric: outer radius = inner radius + padding.** A segmented
  container (8px) with a 4px inset holds 4px segments; a 16px frame with 4px padding holds
  12px cards.
- Pick by role, not by what "looks nice". A clickable row is a button-shaped thing, so it gets
  `--r-button`. A container is a card.
- Menus inherit their trigger's radius (`--r-control`).
- Asymmetric shapes compose tokens (e.g. the user bubble uses
  `--r-card --r-card --r-inline --r-card`).

### Elevation

- `--e-float`: menus, popovers, toasts, floating panels. One soft drop under their own border.
- `--e-modal`: dialogs, slide-over panels on small screens.
- Nothing else gets a shadow. Separate things with hairlines (`--line`) first.
- Hairline: every edge is one thin line, drawn once. State changes that line's color; it never
  stacks a second line, a glow or an offset ring; no ring or shadow spills outside the box; and
  nothing draws an inner shadow (wells are a tinted ground, not a recess).

### Motion

Durations are tokens, and every one scales with `--motion-scale` (1 in production;
`setMotionScale(5)` from `src/lib/motion.ts` stretches CSS and Motion timings 5× for reviewing
frame by frame).

| Token | Value | For |
|---|---|---|
| `--d-instant` | 90ms | hover, press, color changes |
| `--d-quick` | 160ms | menus, tooltips, small travel, chevrons; most exits |
| `--d-settle` | 260ms | things that arrive: dialogs, panels, indicators |

Each curve has one job. Pick by what the element is doing, never by feel:

| Token / utility | Curve | Job |
|---|---|---|
| `--ease-out` · `ease-out` | `cubic-bezier(.23,1,.32,1)` | entering and exiting: starts fast, so the UI answers at once |
| `--ease-in-out` · `ease-in-out` | `cubic-bezier(.77,0,.175,1)` | moving across the screen: tab ink, nav highlight, pills |
| `--ease-drawer` · `ease-drawer` | `cubic-bezier(.32,.72,0,1)` | sheets sliding in from an edge |
| `--ease-hover` · `ease-hover` | `ease` | hover and color changes |
| `--ease-spring` · `ease-spring` | `cubic-bezier(.34,1.4,.5,1)` | small arrivals with a little life: ticks, radio dots |
| `linear` | — | constant motion only: spinners, indeterminate stripes |

Springs (`motion/react`, from `src/lib/motion.ts`) are for things that glide between places and
can be interrupted mid-flight: `settle` (260ms visual, bounce .12) for tab ink and pills,
`glide` (160ms, no bounce) for a highlight following you through a list (nav, files), `snap`
(160ms, bounce .2) for the switch thumb, `instant` (no motion) for changes that shouldn't
animate. Never `ease-in` on UI: it delays the first frame, the one you're watching.

**Decide before you animate.** How often will someone see it?

| Frequency | Decision |
|---|---|
| 100+ times a day (shortcuts, palette toggles) | No animation. Ever. |
| Tens of times a day (hover, list navigation, scroll-spy) | Barely any: color only, or snap |
| Occasional (dialogs, drawers, menus, toasts) | A real entrance, under 300ms |
| Rare or first-visit (onboarding, the docs hero) | Room for delight |

Rules that follow from it:

- **Never animate keyboard-initiated actions.** A tab changed by arrow keys, a menu opened with
  Enter, a highlight moved by scroll-spy: all snap. The same change made with the pointer may glide.
- **Exits are faster than entrances.** Arriving can take `--d-quick`/`--d-settle`; leaving takes
  `--d-instant`. Closing is the system answering, and it should feel immediate.
- **UI motion stays under 300ms.** Drawers may reach ~300ms; nothing else should.
- **Only `transform` and `opacity` for anything frequent.** No `left`/`width`/`height` on
  indicators or bars (`scaleX` for bars). Height is allowed only where Base UI requires it
  (accordion, collapsible), at `--d-settle` or less.
- **Nothing grows from nothing.** Entrances start at `scale(.9)` or more, with opacity.
- **Popovers grow from their trigger** (`transform-origin: var(--transform-origin)`). Modals stay
  centred.
- **State morphs crossfade with a little blur** (`blur(2px)`, `scale(.9)` → 1): Send ↔ Stop,
  Copy → Copied, label → spinner. Blur hides the moment two states overlap.
- **Indicators that move between items are one shared element** (`layoutId`), not a per-item
  fade: nav highlight, tab ink, segmented pill. You see where you came from.
- **Stagger things that arrive together** by 30–60ms, transform + opacity, never blocking input.
- **Reduced motion is gentler, not none.** Movement snaps (transforms, sizes, positions); fades and
  color changes stay, so state still reads. `MotionConfig reducedMotion="user"` and the global rule
  in `index.css` handle it. Don't bypass them.

---

## 4. Themes

Eight themes, each with a **light and a dark variant**. A theme is a palette; the mode picks
its variant. Components never contain theme-specific overrides.

| Theme | Character |
|---|---|
| Neutral | Default. Warm grey paper, graphite ink, amber accent |
| Zinc | Pure grey, monochrome: the ink is the accent |
| Stone | Warm grey, quiet taupe accent |
| Slate | Cool blue-grey, blue accent; familiar product UI |
| Indigo | Cool grey, indigo accent; modern product tools |
| Teal | Cool neutral, muted teal accent |
| Sand | Warm sand, brown ink, terracotta accent; long sessions |
| Contrast | Black and white, 1.5px strokes, 3px focus ring, AAA text everywhere |

- `data-theme="neutral|zinc|stone|slate|indigo|teal|sand|contrast"` picks the palette; `data-mode="light|dark"` picks
  the variant. With no `data-mode` the page follows the OS. Both **scope to any element**
  (`<ThemeScope theme mode>`), and because `color-scheme` inherits, a scope with a theme but
  no mode follows the mode around it. Read tokens at the element; never cache colors in JS.
  Anything that portals spreads `usePortalTheme()` on its Base UI `Portal`, so popups carry
  the scope (theme and mode) with them.
- **Primary color** is a third, independent choice: `data-accent="blue|indigo|violet|pink|red|orange|amber|green|teal"`
  replaces the theme's accent, indicator, focus and primary button beneath it, in every theme
  but Contrast (which keeps its AAA ink and yellow). Omit it, or set `data-accent="default"` on
  a scope, to keep the theme's own. The presets are solved in `scripts/themes/gen.mjs` against
  every theme's grounds in both modes. `<AccentPicker>` is the control; the page setting is
  `usePageTheme().accent`.
- Per-theme materials are tokens too (`--stroke`, `--focus-width`, `--btn-*`), so a scoped
  theme gets its own materials.
- **One engine** (`src/lib/palette.ts`) turns a theme spec into every token: brand hue, vibrancy
  (a share of the hue's maximum chroma, so every hue is equally vivid), neutral tint, contrast
  (standard or high), radius, and whether primary buttons are ink or brand. It runs in Node
  for the presets (`npm run tokens` writes `tokens.css` and fails on any broken pairing) and in
  the browser for the **theme builder** (Foundations → Theme builder), so a custom theme
  carries the presets' guarantees. The builder previews light and dark side by side, lists
  every promised pairing with its measured ratio, applies the result as `data-theme="custom"`,
  and exports it as CSS or a shareable link.
- **Harmony rules** on top of contrast: status hues keep their meaning but move up to their
  range's edge to stay 35° clear of the brand (a red brand pushes danger to crimson), links
  stay blue when the brand reads as a warning or error, yellows carry dark text on their fill
  while every other hue gets a deep fill with white text, greys lean toward the brand, and
  chart hues are spaced 60° around it at one vividness.
- A new preset is a spec in `PRESETS` (palette.ts). Then check it with every component.

---

## 5. Component rules

**Motion.** Every component follows §3: it animates only what the person did, with the curve that
matches the job, and snaps when the keyboard did it. Pressables confirm the press (buttons travel
onto their ledge; small controls scale to .98). Wide targets (nav rows, table rows, cards, full-width
triggers) never shrink on press; they change fill (`--pressed`) instead. In a choice row (checkbox,
radio, switch) the press squeezes the control itself to .94; the row and its text never move. Moving
indicators are shared elements. Review new motion at 5× (`setMotionScale(5)`) before you ship it.

**Layout and touch.** Controls are `w-full` of their container; width belongs to the layout. Every
target is at least 24×24 (WCAG 2.5.8). On coarse pointers (the `touch:` variant, `@media (pointer:
coarse)`) primary controls reach 44px, either by growing (`touch:min-h-11`) or with a pseudo-element
hit area that leaves the layout alone (Button, Checkbox, Radio, Switch). Rows of actions wrap
(`flex-wrap`), and button labels truncate rather than overflow.

**Button.** 36px (a 34px face on a 2px ledge, so it lines up with 36px inputs), one text weight,
and an optional `kbd` hint so the fastest path is printed on the control. Tactile: when pressed,
the face drops 2px and the ledge shrinks to 0, so the bottom edge never moves. Keyboard presses
(`Enter`/`Space`) and shortcuts show the pressed state too (the `pressed` prop). Loading
(`aria-busy`) keeps the width. Disabled goes to a sunken face with `--ink-disabled` text and stays
up: it never drops onto its ledge. `size="sm"` is a 28px row (toast actions, table rows, dense
toolbars) with the same ledge and states. Icon-only buttons are `<IconButton label>`: the label is
both the accessible name and the tooltip. Ghost buttons have no ledge.

**Input.** The label always sits above and stays visible. The hint explains the rule *before* it's broken;
the error says exactly what to change. At rest the field is a tinted well. On focus it sits flush
and its one border line turns the focus color. No glow. The text caret is `--caret`, set once on `body`. Editable text is 16px
below `sm` (`text-input-touch`) so iOS doesn't zoom on focus.

**Select.** A real listbox: arrows, Enter, Escape, Home/End and type-ahead. It lives in the Field
system, like `Input`: `label`, `hint`, `error` (replaces the hint and marks it invalid), `invalid`,
`name` (form submit and `<Form errors>` key), `required` and `readOnly`, all wired by Base UI's
Field. `className` lands on the field root. The trigger truncates a long value and carries it as a
`title`. Options may carry a `description` and a `meta` so nobody has to guess what "Balanced" means.
The selected tick sits at the trailing edge (label · meta · tick), never in an empty leading
column; the same goes for Combobox and for checkbox/radio marks in menus.

**Card.** Holds one thing and its actions. A dashed footer rule separates *what it is* from
*what you can do with it*. No shadow at rest. It lifts only when it's openable (`<Card link>`), and
never shrinks on press.

**Radio / Checkbox.** A list form for compact choices, and a card form (`RadioCard`) when a picture
helps. A card's `media` is a full-bleed live preview built from real components and made `inert`:
it's looked at, never tabbed into (the theme cards are this). A parent checkbox goes indeterminate; clicking it settles all its children. The tick springs in.

**Tooltip.** 400ms hover delay; after the first one, neighbours open without waiting. Shows on
keyboard focus. Includes the shortcut when one exists. In a row of controls (`TooltipGroup`;
Toolbar adds one itself) there is one shared tooltip: moving to a neighbour glides it across,
resizes it and crossfades the label with a 2px blur. Keyboard moves snap.

**Tabs.** The ink bar slides so you can see where you came from. Arrow keys move and select;
Home and End jump to the ends. `<Seg>` is the compact sibling.

**Dialog.** Two kinds, one look. `Dialog` is for a focused task you can walk away from: Escape,
the backdrop and the close button all dismiss it, and focus starts on the first field. `AlertDialog`
is only for decisions that can't wait; focus starts on the safe action. A destructive dialog lists
exactly what will be lost and requires typing the name to unlock the confirm button. Both trap
focus and return it to where it came from. The close button comes last in DOM order, so it never
takes initial focus. `size` picks the width: `sm` 400px, `md` 480px (default), `lg` 640px, each
capped at the viewport less 32px. The header (title, description, close) and the footer stay put;
only the body scrolls, so a long form never pushes its actions out of view. The footer wraps.

**Toast.** `toast(message, { tone, description, action, timeout })`. The default tone is
`neutral`, with no mark: most toasts just say what happened. `success`, `danger`, `warning` and
`info` add a solid disc with a distinct glyph; `success` marks an outcome worth confirming
("Settings saved", "Device verified").
`danger` is announced assertively; the rest politely. For anything reversible, prefer an **Undo**
action to a confirmation dialog: `toast("Agent deleted", { action: { label: "Undo", onClick: restore } })`.
The action is a `Button size="sm"` and closes the toast. Toasts stay 2.4s, 4s with a description,
6s with an action or for `danger`; `timeout: 0` waits for dismissal.

**Badge.** A status, count or date. Tones `neutral`, `ok`, `live` (pulsing `--accent-strong` dot),
`danger`, `warning`, `info`, soft by default; `solid` fills with `--{status}-solid` and its
`--on-{status}` text. It grows with its text (no fixed height) and truncates only when it alone
outgrows its container; pass `title` when that can happen.

**Drawer.** Modal like a dialog (focus trapped, returned on close) and swipeable back toward its
edge. `--e-modal`, with `--r-dialog` only on the corners facing the page. `bottom` shows a drag
handle and is the phone-friendly form.

**Theme swatch.** A theme's colors read live from its own tokens (each swatch is a `ThemeScope`), so
it can't drift from the theme it names. `dots` for pickers, `strip` for cards, `pair` for the light
and dark grounds side by side. Pass `mode` to show one variant; without it the swatch follows the
mode around it. Never hard-code a swatch color.

**Kbd.** Every shortcut prints through `<Kbd keys="⇧⌘Z" />`: one cap per key, from any spelling
("⌘K", "⌘ K" and "⇧⌘Z" all parse), tinted from `currentColor` so it suits any surface (buttons,
tooltips, menu rows, running text) without overrides. Screen readers hear key names ("Shift
Command Z"). Buttons, IconButton tips, tooltips, menus and the command palette all use it; never
hand-style a `<kbd>`. `size="sm"` for dense rows.

**Menu.** A list of actions (values belong in Select). Arrows move, Enter/Space runs, Escape closes
and returns focus, type-ahead jumps, → / ← open and close submenus. Every item prints its shortcut.
Checkbox and radio items keep the menu open. Destructive items name their object and sit last, below
a rule. Popup `--r-control` + `--e-float`; rows `--r-button`.

**Context menu.** The Menu at the pointer (right-click, long-press). A shortcut, never the only path:
every action is also reachable somewhere visible.

**Menubar.** One tab stop; ← / → walk menus and carry the open menu along. It's one shared menu:
moving between triggers glides the popup to the new trigger, resizes it, and slides the content
across (keyboard moves snap). Triggers are dense
(30px, like a compact Select) because a menubar lives in chrome.

**Popover.** A floating panel that may hold actions. Opens on click; `openOnHover` only for
infotips. Focus goes to the panel on open; Escape or an outside click closes and returns focus.
`--r-card` + `--e-float` with a hairline arrow.

**Preview card.** Stays a real link (Enter follows it). The card waits 500ms and is never the only
way to see the content.

**Switch.** For settings that take effect immediately, with no Save button. The checkbox's sibling,
never a pill: a squared track (`--r-inline`, 1.5px stroke) with a square thumb. On, the track fills
with ink and the thumb springs across. The whole row is the target; Space toggles. If a change
needs confirming, use a checkbox in a form.

**Slider.** The value is always printed beside the label, as large as the label, in ink with
`tabular-nums`. 4px sunken track, ink indicator,
36px hit area. Arrows step, Shift+Arrow / PageUp/Down step large, Home/End jump. Two thumbs make a
range, each labelled.

**Number field.** A 36px well (UI font, `tabular-nums`) with − and + at its ends (tooltips with keys). Arrows step,
Shift+Arrow steps large, dragging the label scrubs. Typed values snap to the step and clamp on blur.

**OTP field.** One mono cell per character, each a small tinted well, split into groups. Typing
advances, Backspace steps back, paste fills every cell. The focus ring goes around the whole code.

**Combobox.** A dropdown you can type into, with the menu look (description + meta). Escape closes,
then clears. The empty text says what to try next. In the multiple form each pick is a chip
(`--r-inline`); Backspace at the start of the input removes the last one.

**Autocomplete.** Free text is the value; suggestions only offer to finish it. Escape keeps your
text. Use a combobox when the value must be one of the options.

**Form.** Validation waits for submit, then re-checks each field as it changes. An invalid submit is
blocked and focus moves to the first invalid field. `validate` returns a sentence, never a code.
Server errors come back through `errors`, keyed by field name. `FormActions` sits right-aligned under
a dashed rule, primary last.

**Toggle.** A ghost button that stays pressed: a `--pressed` face with an inset `--line-strong`
hairline and ink text, carried by `aria-pressed`, so on never reads as hover.
Icon-only toggles need a `label` (name + tooltip). A group is one tab stop with arrow keys; a
single-choice group clears when you press the active toggle.

**Accordion.** One hairline panel (`--r-card`), rows divided by `--line`. Each header is a button in
the Tab order (Base UI follows current ARIA guidance: no arrow roving). The caret turns and the panel
grows from `--accordion-panel-height` over `--d-settle`. `multiple` lets several stay open.

**Nav item.** A row you navigate to. The current row gets `--selected`, ink text in
`font-heading` and, inside `Threads`, an `--accent-strong` mark: never color alone. `aria-current`
carries it for assistive tech. Rows change fill on press instead of shrinking and draw their ring
inside (`-outline-offset-2`). `path` truncates the directory, never the file name. `live` adds a
pulsing dot and an accessible "running".

**Table.** Records to scan, sort and select, in a hairline card that scrolls either way (it becomes
a labelled, focusable region only when it overflows). `density` is `default` (40px rows) or
`compact` (32px); rows reach 44px on touch. `stickyHeader` keeps the header while the body
scrolls. `TableHead` with `onSort` becomes a button and sets `aria-sort` only on the sorted column.
`numeric` cells align to the end with `tabular-nums`; `truncate` cells show everything when there's
room and truncate (with a `title`) only when there isn't. A `selected` row gets `--selected` plus an
`--accent-strong` bar on its start edge. `TableEmpty` says what's missing and what to do; while
loading, render `TableSkeleton` and set `aria-busy` on the table.

**Collapsible.** One trigger, one panel, for detail only some people need. The trigger says what's
inside and how much ("Environment variables 3"). 36px, button-shaped.

**Separator.** Hairlines before shadows. Announced as a boundary; vertical separators stretch to their
row; the dashed form separates what a thing is from what you can do with it.

**Scroll area.** Native scrolling with thin token bars (thumb `--line-strong`, `--ink-3` while
scrolling). Bars stay visible while there is overflow. `fade` softens the top and bottom edges for
long lists whose edge isn't otherwise marked (the docs sidebar). Give it an `aria-label` so it's a
focusable, keyboard-scrollable region.

**Progress.** Only for work that finishes. Label above, value beside it in `tabular-nums`, as large
as the label. Unknown totals show a sliding
stripe, never a fake percentage (reduced motion stills it). Complete turns `--success`; a failing run
uses `tone="danger"` and the hint says what went wrong.

**Meter.** A level, not progress. A tick marks the threshold (85% by default); at or above it the bar
and value turn `--danger`, the same rule as the context meter. `valueText` prints real units.

**Navigation menu.** 36px button-shaped top-level links; a trigger opens a floating `--r-card` +
`--e-float` panel of link cards that say where they go. Arrow keys move along the top row; Escape
closes and returns focus. The panel resizes as you move between sections.

**Chat.** The trace shows what the agent did before answering, and it collapses once the
answer is done ("Worked for 41s"). The reply streams with the accent caret as the write head. The
composer's Send becomes Stop while busy (Esc stops). The context meter turns danger-colored at ≥85%.

**Focus.** One plain ring on `:focus-visible`: `--focus-width` (2px; 3px in Contrast) of
`--focus`, drawn *inside* the border box (`outline-offset: calc(-1 * var(--focus-width))`), from
the base styles. On a bordered control it covers the border, so it reads as that one line
thickened in the focus color: no gap, nothing over neighbours, nothing a clipping parent can cut. Keyboard focus shows it; a pointer
click on a button doesn't. When the focused element is hidden or inset (a checkbox in its row,
a slider's input), mark the visible wrapper `data-focus-target` and the
element it stands in for `data-focus-proxy`: the wrapper wears the ring and the proxy's own outline
is hidden. Put `data-focus-proxy` only on that one element; every other focusable inside the
wrapper (Send, Clear, steppers, chip remove) keeps its own ring. Invalid fields ring in `--danger`.
**Buttons** use the same outline: it sits inside the face, so the ledge below doesn't matter and
it never overlaps a neighbour in a toolbar or group. **Text fields** (inputs, combobox and number
wells, OTP cells, the field Select and the chat composer) use the same ring through the
`field-focus` utility, which also turns the border underneath the focus color so no seam shows.
They show it on click too (`:focus` / `focus-within`), since focus there means you're about to
type; the Select shows it on `:focus-visible` and while open. Invalid fields set `--field-focus`
to `--danger`. Don't remove the outline without replacing it.

---

## 6. Accessibility baseline (non-negotiable)

- Every interactive element is reachable and operable by keyboard, with the correct ARIA
  role and state (`aria-selected`, `aria-expanded`, `aria-pressed`, `aria-current`,
  `aria-invalid`, `aria-busy`).
- Every icon-only control has an accessible name (`<IconButton label>`).
- Contrast is measured, not eyeballed: `npm run tokens` fails if any pairing drops below its
  target, in every theme and both modes. Text ≥ 4.5:1 (`--ink` and `--ink-2`
  ≥ 7:1); control boundaries (`--border-control`), focus, caret, indicators and chart colors
  ≥ 3:1 (WCAG 1.4.11); disabled text ≥ 3:1. Contrast raises all text to 7:1 (AAA).
- Never lower a guaranteed pairing with `opacity`; pick the token that holds the role.
- Nothing that carries information is smaller than 12px (`text-caption`): shortcuts, counts,
  timestamps, badges, kbd. Sizes are in rem, so they follow the reader's font size.
- Targets are at least 24×24 (WCAG 2.5.8), and primary controls reach 44px on touch.
- State never rides on color alone: selected rows add a mark or a weight, errors add text.
- Motion respects `prefers-reduced-motion`.
- Layouts work down to phone width with no horizontal page scroll.

---

## 7. Voice

Plain, specific, calm. Say what happens, not what the feature is called.

- ✅ "Lowercase letters, numbers and dashes. This becomes part of the URL."
- ✅ "You stopped this run. Nothing was changed."
- ❌ "Invalid input." / "Something went wrong!"

Buttons are verbs ("Deploy agent", "Keep agent", "Delete agent"). Destructive copy names
the object.

- **Capitalization.** Sentence case for labels, titles, headings, menu items and buttons
  ("Open the workspace", not "Open The Workspace"). Status strings are capitalized words:
  "Working", "Running", "Failed".
- **Plurals.** Never "1 files". Pick the form with `Intl.PluralRules` (`one` / `other`), not
  `n === 1`, so other locales come for free.
- **Relative time.** Format with `Intl.RelativeTimeFormat` ("34 minutes ago", "yesterday");
  never concatenate a number with "ago".
- **Abbreviations.** A compact "34m" or "2h" is for sighted scanning; pair it with the full form
  for assistive tech ("34 minutes ago" as the accessible text or `title`).
- **Errors** say what happened and what to do next, in that order: "Unable to copy. Select the
  text and copy it manually."

---

## 8. Checklist before you ship anything

- [ ] Built only from existing components, and the template CSS is layout only
- [ ] Every radius is a token, chosen by hierarchy
- [ ] Every color, space, duration and shadow is a token
- [ ] Controls are 36px (`sm` only in dense chrome); no ad hoc heights, no default max widths
- [ ] Shadows only on floating things
- [ ] Accent used only for attention, in small doses
- [ ] Every state is visible (hover, pressed, focus, selected, disabled, loading, invalid)
- [ ] Full keyboard path; icon-only controls labelled; targets ≥ 24px, 44px on touch
- [ ] Nothing that carries information below 12px; plurals and relative times from `Intl`
- [ ] Checked in every theme, light and dark, including one scoped theme
- [ ] Works at phone width and with reduced motion
- [ ] New component? It has its own documented section and a state readout, and it came *before* the template that uses it
- [ ] Built on a Base UI primitive when one exists; icons are Phosphor
- [ ] Motion: justified by how often it's seen, right curve for the job, under 300ms, exit faster than enter
- [ ] Keyboard-initiated changes don't animate; moving indicators are shared (`layoutId`)
- [ ] Only `transform`/`opacity` on frequent motion; reviewed at 5× (`setMotionScale(5)`)

---

## 9. Implementation

**Stack.** React 19, Vite, Tailwind CSS v4, `@base-ui/react` for behaviour and accessibility,
`@phosphor-icons/react` for icons, `motion` for shared-layout motion, and TanStack Router
(file-based, auto code-split) for the docs. Run `pnpm dev`; `pnpm build` typechecks and bundles;
`npm run tokens` regenerates `tokens.css` from the theme solver.

```
scripts/themes/          the theme solver (gen.mjs): hues, grounds, accents in; tokens.css out (npm run tokens)
src/
  styles/tokens.css      GENERATED, every theme × mode: colors, elevation, pattern, materials; don't edit
  styles/index.css       Tailwind @theme mapping, base, keyframes, token utilities
  styles/components.css  the few things utilities can't say (line counters, meter ring, scroll fades)
  components/            the system: one file per component family, exported from index.ts
  components/table.tsx   Table and its parts (density, sticky header, sort, empty, skeleton)
  templates/             compositions only (agent-workspace.tsx)
  routes/                TanStack Router file routes (routeTree.gen.ts is generated — don't edit)
  docs/registry.ts       every docs page: slug, title, group, one-line description, body, exports
  docs/shell/            the docs frame: sidebar, top bar, On this page, page view, home, index, search
  docs/*-sections.tsx    page bodies (specimens + readouts), one file per group
  docs/pages/            prose pages (Getting started, Installation)
  lib/                   cn(), theme + ThemeScope, motion tokens, media-query hooks
```

**The docs.** Structured like a product's docs, not one long page:

| Route | What |
|---|---|
| `/` | Landing: the hero, featured components, how it's organised, the template |
| `/components` | Every page as a card with a live, inert preview (`docs/thumbs.tsx`), grouped |
| `/components/$slug`, `/foundations/$slug`, `/docs/$slug`, `/templates/$slug` | One page each |

Every page is the registry entry's body rendered in **page mode** (`PageModeContext`): the
section's title becomes the H1, each `Spec` becomes an H2 anchor that "On this page" lists, and the
shell appends Usage (the exports, and the Base UI part underneath) and Previous / Next. Quick
Search (⌘K, /) is the system `CommandPalette`, fed from the registry. The theme chooser is a
side panel, not a drawer: docked beside the page (the page makes room, "On this page" steps aside),
no backdrop, no focus trap, so you can keep reading while you try themes. Phones get a slide-over.
Where there's no room for the "On this page" column (below 1240px, or while the theme panel is
docked), the same headings sit in a disclosure at the top of the page.

**Adding a page:** build the component in `components/`, write its section (Section + Spec with a
readout) in the right `docs/*-sections.tsx`, add one entry to `docs/registry.ts` (and a preview in
`docs/thumbs.tsx`). The route, sidebar, index card, search entry, breadcrumbs and prev/next follow.

**Tokens in Tailwind.** `@theme inline` maps tokens to utilities, and the inline mode matters:
utilities emit `var(--token)` at the element, so scoped themes work. Tailwind's default
palette, radii, shadows and type scale are cleared, so only Caret values exist.

| Token | Utility |
|---|---|
| `--page` … `--scrim` | `bg-page`, `text-ink-2`, `border-line-strong`, `fill-accent`, … |
| `--r-inline` … `--r-pill` | `rounded-inline`, `rounded-button`, `rounded-control`, `rounded-card`, `rounded-dialog`, `rounded-pill` |
| `--e-float`, `--e-modal` | `shadow-float`, `shadow-modal` |
| `--d-instant`, `--d-quick`, `--d-settle` | `duration-instant`, `duration-quick`, `duration-settle` |
| `--ease-out`, `--ease-in-out`, `--ease-drawer`, `--ease-hover`, `--ease-spring` | `ease-out`, `ease-in-out`, `ease-drawer`, `ease-hover`, `ease-spring` |
| `--motion-scale` | multiplies every `--d-*` (timing review via `setMotionScale`) |
| `--s-1` … `--s-9` | Tailwind's 4px spacing: `p-1` = 4, `p-2` = 8, `p-3` = 12, `p-4` = 16, `p-6` = 24, `p-8` = 32, `p-12` = 48, `p-16` = 64, `p-24` = 96 |
| type steps | `text-display`, `text-h1`, `text-h2`, `text-title`, `text-body`, `text-control`, `text-small`, `text-caption`, `text-code`, `text-input-touch` |
| weights | `font-normal` (400), `font-control` (550), `font-heading` (620) |
| `--border-control` | `border-border-control` (the edge of any control whose boundary identifies it) |
| `--link` | `link` (color, underline, hover) |
| coarse pointer | `touch:` variant (`@media (pointer: coarse)`) |
| `--pattern` | `bg-pattern` |
| `--stroke` | `border-stroke` (hairline that thickens in Contrast) |
| JetBrains Mono | `mono` |

`cn()` is `clsx` + `tailwind-merge` taught these names, so a caller's `className` overrides a
component default cleanly.

**Base UI primitives.** Button → `Button`; Select → `Select`; Tabs → `Tabs` (the ink bar is
`Tabs.Indicator`); Tooltip → `Tooltip` (provider delay 400ms, warm window 500ms); Dialog →
`AlertDialog`; Toast → `Toast` with a global manager; Checkbox → `Checkbox` + `CheckboxGroup`
(`parent`); Radio / Seg → `RadioGroup` + `Radio`; Field / Input → `Field` + `Input`; Trace →
`Collapsible`; votes → `ToggleGroup` + `Toggle`; Toolbar → `Toolbar`; ContextMeter → `Meter`;
Avatar → `Avatar`; NavItem → `useRender`. Dialog → `Dialog`, AlertDialog / DestructiveDialog →
`AlertDialog`; Drawer → `Drawer`; Menu / ContextMenu / Menubar → `Menu`, `ContextMenu`, `Menubar`;
Popover → `Popover`; PreviewCard → `PreviewCard`; Switch → `Switch`; Slider → `Slider`; NumberField
→ `NumberField`; OTPField → `OTPField`; Combobox / MultiCombobox → `Combobox`; Autocomplete →
`Autocomplete`; Form → `Form` (+ `Field.Error`); Toggle / ToggleGroup → `Toggle`, `ToggleGroup`;
Accordion → `Accordion`; Collapsible → `Collapsible`; Separator → `Separator`; ScrollArea →
`ScrollArea`; Progress → `Progress`; Meter → `Meter`; NavigationMenu → `NavigationMenu`. Every Base UI
component now has a Caret counterpart. Table has no Base UI primitive: it's a native `<table>` in a
`ScrollArea`.

**Field validation.** `Field` and `Select` only force `invalid` when you pass `error` or `invalid`; otherwise
Base UI validation (`validate`, `required`, Form `errors`) drives it, and `Field.Error` replaces the
hint while an error shows. Style Base UI state through its data attributes
(`data-checked`, `data-highlighted`, `data-popup-open`, `data-starting-style`, …).

**Radius corrections from the prototype.** A few prototype values were off-token and now map
by role: swatches, radio cards and toasts use `--r-card`; the dialog icon well uses
`--r-control`; sidebar tree rows and choice rows use `--r-button`; the checkbox box uses
`--r-inline`. The 32px theme-picker trigger is now the standard 36px.


/*
 * The AGENTS.md a team drops into its own repo. One source for two readers: the Agents guide
 * page shows it with a copy button, and the build serves it raw at /agents.md (scripts/llms-txt.ts).
 * Plain TS with no React, so the Vite config can import it too.
 */

/** `origin` prefixes the docs links: the page passes location.origin, the build SITE_URL (or ""). */
export function agentsMd(origin: string): string {
  return `# UI rules: Caret

This app's interface is built with Caret: React 19, Tailwind CSS v4 and Base UI, with Phosphor
icons and Motion. The components are source in \`src/components\`, imported from \`@/components\`.

- Docs index: ${origin}/llms.txt
- Every rule in full: ${origin}/llms-full.txt

## Compose, don't invent

- Build screens only from \`@/components\`. Before writing a class, find the component that fits:
  Button, IconButton, Select, Combobox, Field + Input, Textarea, SwitchChoice, CheckboxChoice,
  RadioGroup, Card, Table, KeyValue, Badge, Tabs, Dialog, Drawer, Menu, Popover, Tooltip, toast,
  Callout, Progress, Meter, Messages, Trace, Composer, Timeline, LogStream, CommandPalette.
- A screen's own classes do layout only: grid, flex, gap, padding, width, overflow, position.
  No new buttons, rows, tabs, pills or cards inside a screen.
- If nothing fits, add the component to \`src/components\` first, with every state and the
  keyboard path, then use it.

## Tokens, never raw values

- Color by role: \`bg-page\`, \`bg-surface\`, \`bg-sunken\`, \`text-ink\`, \`text-ink-2\`, \`text-ink-3\`,
  \`border-line\`, \`border-line-strong\`, \`bg-accent\`, and status tokens like \`text-danger\` or
  \`bg-success-soft\`. Never hex, rgb or Tailwind palette colors (\`gray-500\`, \`blue-600\`).
- Type: \`text-display\`, \`text-h1\`, \`text-h2\`, \`text-title\`, \`text-subtitle\`, \`text-body\`,
  \`text-control\`, \`text-small\`, \`text-caption\`, \`text-code\`. Weights: \`font-normal\`,
  \`font-control\`, \`font-heading\`.
- Radius by how far a thing floats: \`rounded-inline\` / \`rounded-button\` (4px), \`rounded-control\`
  (8px), \`rounded-card\` (12px), \`rounded-dialog\` (16px), \`rounded-pill\`. Nested corners are
  concentric: outer = inner + padding.
- Motion: \`duration-instant\`, \`duration-quick\`, \`duration-settle\`; \`ease-out\` to enter and exit,
  \`ease-in-out\` to move, \`ease-drawer\` for sheets. Only transform and opacity on frequent motion.

## The look

- Hairlines first. Shadows only on things that float (menus, popovers, toasts, dialogs); a
  resting card has none.
- The accent marks attention (the caret, live activity, the current item). Never a large fill.
- Controls are 36px tall. \`size="sm"\` only in dense chrome. No ad hoc heights, no default max
  widths: constrain the wrapper instead.
- Whole pixels only. Strokes 1px or 2px; icons 10, 12, 14, 16 or 20.
- Icons come from \`@phosphor-icons/react\`. Never draw your own SVG icons.

## Before you finish

- Every state is visible: hover, pressed, focus, selected, disabled, loading, invalid.
- Full keyboard path; icon-only controls use \`<IconButton label>\`.
- Check light and dark (\`data-mode\`), and at phone width.
`;
}

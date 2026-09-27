import type { ComponentType } from "react";
import * as chatMod from "./chat-section";
import * as paletteMod from "./command-palette-section";
import * as componentMod from "./component-sections";
import * as contextMod from "./context-sections";
import * as foundationsMod from "./foundations";
import * as inputMod from "./input-sections";
import * as overlayMod from "./overlay-sections";
import * as structureMod from "./structure-sections";
import * as tableMod from "./table-section";
import * as builderMod from "./theme-builder";

/*
 * The docs registry: one list drives the sidebar, breadcrumbs, prev/next,
 * the components index, Quick Search and each page's "Usage" block.
 * Order here is reading order.
 */

export type PageKind = "doc" | "foundation" | "component" | "template";

/** Resolves a page's body component. */
type Body = () => ComponentType;

export interface DocPage {
  slug: string;
  title: string;
  /** One line, in the docs' voice. Shown on index cards, search and prev/next. */
  description: string;
  kind: PageKind;
  group: GroupName;
  /** The page body, resolved at render time. */
  load: Body;
  /** Public exports shown in the page's Usage block. */
  imports?: string[];
  /** The Base UI part it's built on (docs slug on base-ui.com). */
  baseUi?: string;
  /** A working surface, not a read: the page takes the whole content area, with no "On this page". */
  full?: boolean;
}

export type GroupName =
  | "Getting started"
  | "Foundations"
  | "Actions"
  | "Inputs"
  | "Overlays"
  | "Structure"
  | "Feedback"
  | "Agents"
  | "Templates";

export const GROUP_BLURBS: Record<GroupName, string> = {
  "Getting started": "What Caret is, and how to set it up.",
  Foundations: "The tokens everything else is built on.",
  Actions: "Things you press.",
  Inputs: "Things you type into, pick from and toggle.",
  Overlays: "Things that float above the page, and when they may.",
  Structure: "Containers and the rules between them.",
  Feedback: "How far along, how full, and what just happened.",
  Agents: "The pieces an agent interface needs.",
  Templates: "Full working surfaces, composed only from the parts above.",
};

// Page bodies are bundled with the app, not fetched per page: the first render is the whole
// page, so nothing arrives later and pushes the layout around. Lookups run at render time
// (not at module init), because some section modules import this registry back.
type Mod = Record<string, unknown>;
const pick = (mod: Mod, name: string): Body => () => mod[name] as ComponentType;
const pageMods = import.meta.glob<Mod>("./pages/*.tsx", { eager: true });
const docs = (name: string): Body => () => pageMods[`./pages/${name}.tsx`].default as ComponentType;
const foundations = (name: string) => pick(foundationsMod, name);
const ctx = (name: string) => pick(contextMod, name);
const comp = (name: string) => pick(componentMod, name);
const inputs = (name: string) => pick(inputMod, name);
const overlays = (name: string) => pick(overlayMod, name);
const structure = (name: string) => pick(structureMod, name);
const chat = (name: string) => pick(chatMod, name);
const palette = pick(paletteMod, "CommandPaletteSection");
const table = pick(tableMod, "TableSection");
const builder = pick(builderMod, "ThemeBuilderSection");

export const PAGES: DocPage[] = [
  // Getting started
  { slug: "getting-started", title: "Getting started", kind: "doc", group: "Getting started", load: docs("getting-started"), description: "What Caret is for, and the three principles every part of it follows." },
  { slug: "installation", title: "Installation", kind: "doc", group: "Getting started", load: docs("installation"), description: "Tokens, Tailwind v4, Base UI and the four providers at the root." },

  // Foundations
  { slug: "color", title: "Color", kind: "foundation", group: "Foundations", load: ctx("ColorPage"), description: "Role-named tokens, measured for contrast in every theme and mode." },
  { slug: "themes", title: "Themes", kind: "foundation", group: "Foundations", load: ctx("ThemesPage"), description: "Eight themes, each light and dark, that scope to any element." },
  { slug: "theme-builder", title: "Theme builder", kind: "foundation", group: "Foundations", load: builder, full: true, description: "Pick a brand color and tune it; contrast and harmony stay solved." },
  { slug: "typography", title: "Typography", kind: "foundation", group: "Foundations", load: foundations("TypeSection"), description: "Schibsted Grotesk for the interface, JetBrains Mono for code." },
  { slug: "space", title: "Space & radius", kind: "foundation", group: "Foundations", load: foundations("SpaceSection"), description: "A 4px base, and radius by how far a thing floats." },
  { slug: "motion", title: "Motion", kind: "foundation", group: "Foundations", load: foundations("MotionSection"), description: "Three durations, five curves, springs for things that glide." },
  { slug: "focus", title: "Focus", kind: "foundation", group: "Foundations", load: ctx("FocusPage"), description: "One plain ring for keyboard focus, drawn on what you can see." },

  // Actions
  { slug: "button", title: "Button", kind: "component", group: "Actions", load: comp("ButtonSection"), imports: ["Button", "IconButton", "ButtonGroup"], baseUi: "button", description: "36px keys on a 2px ledge, with the shortcut printed on the face." },
  { slug: "toggle", title: "Toggle", kind: "component", group: "Actions", load: structure("ToggleSection"), imports: ["Toggle", "ToggleGroup"], baseUi: "toggle-group", description: "A button that stays pressed; a group shares one sliding face." },
  { slug: "kbd", title: "Kbd", kind: "component", group: "Actions", load: structure("KbdSection"), imports: ["Kbd"], description: "A shortcut, printed the same way everywhere." },

  // Inputs
  { slug: "input", title: "Input", kind: "component", group: "Inputs", load: ctx("InputPage"), imports: ["Field", "Input"], baseUi: "field", description: "A recessed well with the label above and the rule below." },
  { slug: "select", title: "Select", kind: "component", group: "Inputs", load: comp("DropdownSection"), imports: ["Select"], baseUi: "select", description: "A real listbox, with descriptions so no one has to guess." },
  { slug: "combobox", title: "Combobox", kind: "component", group: "Inputs", load: inputs("ComboboxSection"), imports: ["Combobox", "MultiCombobox"], baseUi: "combobox", description: "A select you can type into, single or with chips." },
  { slug: "autocomplete", title: "Autocomplete", kind: "component", group: "Inputs", load: inputs("AutocompleteSection"), imports: ["Autocomplete"], baseUi: "autocomplete", description: "Free text; the suggestions only offer to finish it." },
  { slug: "radio", title: "Radio", kind: "component", group: "Inputs", load: comp("RadioSection"), imports: ["RadioGroup", "RadioChoice", "RadioCard", "ChoiceList", "Seg"], baseUi: "radio-group", description: "One of a few: a compact list, or cards when a picture helps." },
  { slug: "checkbox", title: "Checkbox", kind: "component", group: "Inputs", load: comp("CheckboxSection"), imports: ["CheckboxChoice", "Checkbox"], baseUi: "checkbox", description: "Independent on/off, with a parent that goes indeterminate." },
  { slug: "switch", title: "Switch", kind: "component", group: "Inputs", load: inputs("SwitchSection"), imports: ["Switch", "SwitchChoice"], baseUi: "switch", description: "For settings that take effect the moment they flip." },
  { slug: "slider", title: "Slider", kind: "component", group: "Inputs", load: inputs("SliderSection"), imports: ["Slider"], baseUi: "slider", description: "A value where the rough position matters; ranges too." },
  { slug: "number-field", title: "Number field", kind: "component", group: "Inputs", load: inputs("NumberFieldSection"), imports: ["NumberField"], baseUi: "number-field", description: "A bounded number with steps, and a label you can scrub." },
  { slug: "otp-field", title: "OTP field", kind: "component", group: "Inputs", load: inputs("OtpFieldSection"), imports: ["OTPField"], baseUi: "otp-field", description: "One cell per character; paste fills them all." },
  { slug: "form", title: "Form", kind: "component", group: "Inputs", load: inputs("FormSection"), imports: ["Form", "FormActions", "Field"], baseUi: "form", description: "Validation that waits for submit, then says what to change." },

  // Overlays
  { slug: "command-palette", title: "Command palette", kind: "component", group: "Overlays", load: palette, imports: ["CommandPalette"], baseUi: "autocomplete", description: "Type to find anything; it opens instantly, every time." },
  { slug: "tooltip", title: "Tooltip", kind: "component", group: "Overlays", load: comp("TooltipSection"), imports: ["Tooltip", "TooltipGroup", "Toolbar", "ToolbarButton"], baseUi: "tooltip", description: "Short labels with their shortcut; one tooltip glides along a row." },
  { slug: "popover", title: "Popover", kind: "component", group: "Overlays", load: overlays("PopoverSection"), imports: ["Popover", "PopoverClose"], baseUi: "popover", description: "A floating panel that can hold actions, tied to its button." },
  { slug: "preview-card", title: "Preview card", kind: "component", group: "Overlays", load: overlays("PreviewCardSection"), imports: ["PreviewCard"], baseUi: "preview-card", description: "A link that shows where it goes before you follow it." },
  { slug: "menu", title: "Menu", kind: "component", group: "Overlays", load: overlays("MenuSection"), imports: ["Menu", "MenuItem", "MenuCheckboxItem", "MenuRadioGroup", "MenuRadioItem", "MenuGroup", "MenuSeparator", "MenuSubmenu"], baseUi: "menu", description: "A list of actions, each printing its shortcut." },
  { slug: "context-menu", title: "Context menu", kind: "component", group: "Overlays", load: overlays("ContextMenuSection"), imports: ["ContextMenu"], baseUi: "context-menu", description: "The same actions at the pointer; never the only path." },
  { slug: "menubar", title: "Menubar", kind: "component", group: "Overlays", load: overlays("MenubarSection"), imports: ["Menubar", "MenubarMenu"], baseUi: "menubar", description: "One shared menu that glides between File, Edit and View." },
  { slug: "dialog", title: "Dialog", kind: "component", group: "Overlays", load: comp("DialogSection"), imports: ["Dialog", "AlertDialog", "DestructiveDialog"], baseUi: "dialog", description: "Tasks you can walk away from, and decisions that can't wait." },
  { slug: "drawer", title: "Drawer", kind: "component", group: "Overlays", load: overlays("DrawerSection"), imports: ["Drawer", "DrawerClose"], baseUi: "drawer", description: "Room for detail without a new page; swipe it away." },

  // Structure
  { slug: "card", title: "Card", kind: "component", group: "Structure", load: comp("CardSection"), imports: ["Card", "CardBody", "CardHead", "CardIcon", "CardTitle", "CardSub", "CardText", "CardFoot"], description: "One thing and its actions; no shadow until it's openable." },
  { slug: "table", title: "Table", kind: "component", group: "Structure", load: table, imports: ["Table", "TableHeader", "TableBody", "TableFooter", "TableRow", "TableHead", "TableCell", "TableEmpty", "TableSkeleton"], description: "Rows to scan, sort and select; numbers line up on the end edge." },
  { slug: "tabs", title: "Tabs", kind: "component", group: "Structure", load: comp("TabsSection"), imports: ["Tabs", "TabList", "Tab", "TabPanel"], baseUi: "tabs", description: "Views of the same thing; the ink slides from where you were." },
  { slug: "accordion", title: "Accordion", kind: "component", group: "Structure", load: structure("AccordionSection"), imports: ["Accordion", "AccordionItem"], baseUi: "accordion", description: "A stack of questions or settings in one hairline panel." },
  { slug: "collapsible", title: "Collapsible", kind: "component", group: "Structure", load: structure("CollapsibleSection"), imports: ["Collapsible", "CollapsibleTrigger", "CollapsiblePanel"], baseUi: "collapsible", description: "Detail only some people need, one trigger away." },
  { slug: "separator", title: "Separator", kind: "component", group: "Structure", load: structure("SeparatorSection"), imports: ["Separator"], baseUi: "separator", description: "Hairlines before shadows, announced as a boundary." },
  { slug: "scroll-area", title: "Scroll area", kind: "component", group: "Structure", load: structure("ScrollAreaSection"), imports: ["ScrollArea"], baseUi: "scroll-area", description: "Native scrolling with thin bars drawn in line tokens." },
  { slug: "navigation-menu", title: "Navigation menu", kind: "component", group: "Structure", load: structure("NavigationMenuSection"), imports: ["NavigationMenu", "NavigationMenuGroup", "NavigationMenuLink"], baseUi: "navigation-menu", description: "Site navigation with panels of link cards." },

  // Feedback
  { slug: "progress", title: "Progress", kind: "component", group: "Feedback", load: structure("ProgressSection"), imports: ["Progress"], baseUi: "progress", description: "Work with an end: never a fake percentage." },
  { slug: "meter", title: "Meter", kind: "component", group: "Feedback", load: structure("MeterSection"), imports: ["Meter"], baseUi: "meter", description: "A level in a known range; danger past the threshold." },
  { slug: "toast", title: "Toast", kind: "component", group: "Feedback", load: overlays("ToastSection"), imports: ["toast", "dismissToast", "ToastProvider"], baseUi: "toast", description: "What just happened, in one line; Undo when it can be undone." },

  // Agents
  { slug: "chat", title: "Chat", kind: "component", group: "Agents", load: chat("ChatSection"), imports: ["Messages", "MsgUser", "MsgAgent", "Trace", "MsgActions", "Composer", "ComposerFoot", "ContextMeter", "Avatar", "Code", "Diff"], baseUi: "collapsible", description: "Messages, the trace, code, the composer and the context meter." },

  // Templates
  { slug: "agent-workspace", title: "Agent workspace", kind: "template", group: "Templates", load: chat("WorkspaceSection"), description: "Threads, conversation and changes, composed only from Caret parts." },
];

export const GROUPS: { name: GroupName; pages: DocPage[] }[] = (
  ["Getting started", "Foundations", "Actions", "Inputs", "Overlays", "Structure", "Feedback", "Agents", "Templates"] as GroupName[]
).map((name) => ({ name, pages: PAGES.filter((p) => p.group === name) }));

/** The URL for a page. */
export function hrefOf(p: DocPage): string {
  switch (p.kind) {
    case "doc":
      return `/docs/${p.slug}`;
    case "foundation":
      return `/foundations/${p.slug}`;
    case "component":
      return `/components/${p.slug}`;
    case "template":
      return `/templates/${p.slug}`;
  }
}

export function findPage(kind: PageKind, slug: string): DocPage | undefined {
  return PAGES.find((p) => p.kind === kind && p.slug === slug);
}

/** Previous and next page in reading order. */
export function neighbours(p: DocPage): { prev?: DocPage; next?: DocPage } {
  const i = PAGES.indexOf(p);
  return { prev: PAGES[i - 1], next: PAGES[i + 1] };
}

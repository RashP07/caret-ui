import {
  ChatsIcon,
  CommandIcon,
  CpuIcon,
  GearIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button, CommandPalette, Hint, Kbd, toast, type CommandGroup } from "@/components";
import { Section, Spec, type Pairs } from "./spec";

export function CommandPaletteSection() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  // Actions confirm with a toast; navigation doesn't need one.
  const run = (label: string, message?: string) => () => {
    setLast(label);
    if (message) toast(message);
  };
  const modeLabel = dark ? "Switch to light mode" : "Switch to dark mode";

  const groups: CommandGroup[] = [
    {
      label: "Runs",
      items: [
        { value: "start", label: "Start run", description: "Run lunch-picker now, outside its schedule.", meta: "⌘ ↵", icon: <PlayIcon />, keywords: ["go", "execute"], onSelect: run("Start run", "Run started") },
        { value: "pause", label: "Pause after this step", description: "Finish the current step, then wait for you.", meta: "⌘ .", icon: <PauseIcon />, onSelect: run("Pause after this step", "Run will pause after this step") },
        { value: "stop", label: "Stop run", description: "Stop now. Nothing is changed.", icon: <StopIcon />, keywords: ["cancel", "abort"], onSelect: run("Stop run", "Run stopped. Nothing was changed.") },
      ],
    },
    {
      label: "Agent",
      items: [
        { value: "model", label: "Switch model", description: "Quick, Balanced or Thorough, for the next run.", meta: "Balanced", icon: <CpuIcon />, keywords: ["quick", "thorough"], onSelect: run("Switch model", "Model set to Thorough") },
        { value: "thread", label: "Open thread", description: "Jump to a conversation by name.", meta: "5", icon: <ChatsIcon />, keywords: ["conversation", "chat"], onSelect: run("Open thread") },
      ],
    },
    {
      label: "Workspace",
      items: [
        {
          value: "mode",
          label: modeLabel,
          description: "For this workspace. Your system setting stays as it is.",
          icon: dark ? <SunIcon /> : <MoonIcon />,
          keywords: ["dark", "light", "theme", "appearance"],
          onSelect: () => {
            setDark((d) => !d);
            run(modeLabel, dark ? "Switched to light mode" : "Switched to dark mode")();
          },
        },
        { value: "settings", label: "Open settings", description: "Agent, schedule and tools.", meta: "⌘ ,", icon: <GearIcon />, keywords: ["preferences"], onSelect: run("Open settings") },
      ],
    },
  ];

  const state: Pairs = [
    ["open", String(open)],
    ["query", `"${query}"`],
    ["last", last ? `"${last}"` : "none"],
  ];

  return (
    <Section
      id="command-palette"
      title="Command palette"
      lede="Use a command palette to find and run anything by typing. It's opened hundreds of times a day, so it has no entrance or exit animation. Every word typed must match the name, description or keywords."
    >
      <Spec name="grouped commands, descriptions, shortcuts" state={state} layout="stack" canvasClassName="gap-4">
        <Button variant="secondary" icon={<CommandIcon />} onClick={() => setOpen(true)}>
          Open palette
        </Button>
        <Hint className="justify-center text-center">
          <span>
            In these docs, <Kbd keys="⌘K" /> or <Kbd keys="/" /> opens the docs' own palette.
          </span>
        </Hint>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          onQueryChange={setQuery}
          groups={groups}
          placeholder="Search commands"
          label="Agent commands"
          emptyText="No command matches. Try “run”, “model” or “dark”."
          footer="lunch-picker · Balanced"
        />
      </Spec>
    </Section>
  );
}

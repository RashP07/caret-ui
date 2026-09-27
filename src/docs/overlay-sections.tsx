import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  CaretDownIcon,
  CopyIcon,
  DotsThreeIcon,
  DownloadSimpleIcon,
  FileIcon,
  FolderOpenIcon,
  FunnelIcon,
  GitBranchIcon,
  LinkIcon,
  PencilSimpleIcon,
  QuestionIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  CardBody,
  CardHead,
  CardIcon,
  CardSub,
  CardText,
  CardTitle,
  CheckboxChoice,
  ChoiceList,
  ContextMenu,
  Diffstat,
  Drawer,
  DrawerClose,
  Hint,
  IconButton,
  Menu,
  Menubar,
  MenubarMenu,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  NavItem,
  Popover,
  PopoverClose,
  PreviewCard,
  RadioChoice,
  RadioGroup,
  toast,
  Trace,
  type ToastOptions,
  type ToastTone,
} from "@/components";
import { Section, Spec, type Pairs } from "./spec";

/* =========================================================
   Menu
   ========================================================= */

export function MenuSection() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("none");
  const [timestamps, setTimestamps] = useState(true);
  const [wrap, setWrap] = useState(false);
  const [level, setLevel] = useState("warnings");

  const act = (label: string) => () => setLast(`"${label}"`);
  const state: Pairs = [
    ["open", String(open)],
    ["last", last],
    ["timestamps", String(timestamps)],
    ["wrap", String(wrap)],
    ["level", `"${level}"`],
  ];

  return (
    <Section
      id="menu"
      title="Menu"
      lede="Use a menu for a list of actions; a select is a list of values. Every item prints its shortcut, so next time you can skip the menu. Destructive items name what they destroy and sit last, below a rule."
    >
      <Spec name="actions, shortcuts, toggles, radio set, submenu, danger" state={state} canvasClassName="min-h-[220px]">
        <Menu
          onOpenChange={setOpen}
          trigger={
            <Button variant="secondary">
              <span className="inline-flex items-center gap-1.5">
                Run actions
                <CaretDownIcon size={14} className="-mr-1 text-ink-3" />
              </span>
            </Button>
          }
        >
          <MenuGroup label="This run">
            <MenuItem icon={<ArrowClockwiseIcon />} kbd="⌘ R" onClick={act("Re-run")}>
              Re-run
            </MenuItem>
            <MenuItem icon={<LinkIcon />} kbd="⌘ L" onClick={act("Copy link")}>
              Copy link
            </MenuItem>
            <MenuSubmenu icon={<GitBranchIcon />} label="Branch from here">
              <MenuItem onClick={act("New branch")}>New branch</MenuItem>
              <MenuItem onClick={act("feat/theme-toggle")}>feat/theme-toggle</MenuItem>
              <MenuItem onClick={act("release/0.2")}>release/0.2</MenuItem>
            </MenuSubmenu>
            <MenuItem icon={<DownloadSimpleIcon />} disabled>
              Export trace
            </MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup label="Log view">
            <MenuCheckboxItem checked={timestamps} onCheckedChange={setTimestamps}>
              Show timestamps
            </MenuCheckboxItem>
            <MenuCheckboxItem checked={wrap} onCheckedChange={setWrap} kbd="⌥ Z">
              Wrap long lines
            </MenuCheckboxItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup label="Log level">
            <MenuRadioGroup value={level} onValueChange={(v) => setLevel(v as string)}>
              <MenuRadioItem value="errors">Errors only</MenuRadioItem>
              <MenuRadioItem value="warnings">Warnings and errors</MenuRadioItem>
              <MenuRadioItem value="everything">Everything</MenuRadioItem>
            </MenuRadioGroup>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem icon={<TrashIcon />} danger onClick={act("Delete run")}>
            Delete run
          </MenuItem>
        </Menu>

        <Menu
          align="end"
          onOpenChange={setOpen}
          trigger={<IconButton variant="secondary" label="More actions" icon={<DotsThreeIcon weight="bold" />} />}
        >
          <MenuItem icon={<PencilSimpleIcon />} kbd="F2" onClick={act("Rename agent")}>
            Rename agent
          </MenuItem>
          <MenuItem icon={<CopyIcon />} kbd="⌘ D" onClick={act("Duplicate agent")}>
            Duplicate agent
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon={<TrashIcon />} danger onClick={act("Delete agent")}>
            Delete agent
          </MenuItem>
        </Menu>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Context menu
   ========================================================= */

const CM_FILES = ["src/components/theme-toggle.tsx", "src/styles/tokens.css", "src/app/layout.tsx"];

export function ContextMenuSection() {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [last, setLast] = useState("none");
  const act = (label: string) => () => setLast(`"${label}"`);
  const name = target?.split("/").pop() ?? "file";

  return (
    <Section
      id="context-menu"
      title="Context menu"
      lede="Use a context menu as a shortcut to actions at the pointer: right-click, or long-press on touch. It's never the only path; every action in it also lives somewhere visible, like a row's own menu."
    >
      <Spec
        name="right-click a file"
        state={[["open", String(open)], ["target", target ? `"${name}"` : "null"], ["last", last]]}
      >
        <ContextMenu
          onOpenChange={setOpen}
          className="w-full max-w-[380px] rounded-card border border-dashed border-line-strong bg-surface p-2"
          area={
            <div className="flex flex-col gap-px">
              <Hint className="px-2 pt-1 pb-2">Right-click (or long-press) a file.</Hint>
              {CM_FILES.map((f) => (
                <NavItem key={f} icon={<FileIcon />} path={f} current={target === f} onContextMenu={() => setTarget(f)} />
              ))}
            </div>
          }
        >
          <MenuItem icon={<FolderOpenIcon />} kbd="↵" onClick={act(`Open ${name}`)}>
            Open {name}
          </MenuItem>
          <MenuItem icon={<CopyIcon />} kbd="⇧ ⌘ C" onClick={act("Copy path")}>
            Copy path
          </MenuItem>
          <MenuItem icon={<PencilSimpleIcon />} kbd="F2" onClick={act("Rename")}>
            Rename…
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon={<ArrowClockwiseIcon />} danger onClick={act(`Discard changes to ${name}`)}>
            Discard changes to {name}
          </MenuItem>
        </ContextMenu>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Menubar
   ========================================================= */

export function MenubarSection() {
  const [last, setLast] = useState("none");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [panel, setPanel] = useState(true);
  const act = (label: string) => () => setLast(`"${label}"`);
  const track = (menu: string) => (o: boolean) => setOpenMenu((cur) => (o ? menu : cur === menu ? null : cur));

  return (
    <Section
      id="menubar"
      title="Menubar"
      lede="Use a menubar for the menus of an app's chrome. It's one tab stop: ← and → walk between menus, and once one is open it follows you, so browsing the whole bar takes one hand."
    >
      <Spec name="file, edit, view, run" state={[["open", openMenu ? `"${openMenu}"` : "null"], ["last", last]]} canvasClassName="items-start min-h-[220px]">
        <Menubar aria-label="Workspace">
          <MenubarMenu label="File" onOpenChange={track("File")}>
            <MenuItem kbd="⌘ N" onClick={act("New thread")}>New thread</MenuItem>
            <MenuItem kbd="⌘ O" onClick={act("Open project…")}>Open project…</MenuItem>
            <MenuSubmenu label="Open recent">
              <MenuItem onClick={act("agent-console")}>agent-console</MenuItem>
              <MenuItem onClick={act("caret-ui")}>caret-ui</MenuItem>
              <MenuItem onClick={act("billing-service")}>billing-service</MenuItem>
            </MenuSubmenu>
            <MenuSeparator />
            <MenuItem kbd="⌘ W" onClick={act("Close thread")}>Close thread</MenuItem>
          </MenubarMenu>
          <MenubarMenu label="Edit" onOpenChange={track("Edit")}>
            <MenuItem kbd="⌘ Z" onClick={act("Undo")}>Undo</MenuItem>
            <MenuItem kbd="⇧ ⌘ Z" onClick={act("Redo")}>Redo</MenuItem>
            <MenuSeparator />
            <MenuItem kbd="⌘ F" onClick={act("Find in thread")}>Find in thread</MenuItem>
          </MenubarMenu>
          <MenubarMenu label="View" onOpenChange={track("View")}>
            <MenuCheckboxItem checked={panel} onCheckedChange={setPanel} kbd="⌘ \">
              Changes panel
            </MenuCheckboxItem>
            <MenuItem kbd="⌘ +" onClick={act("Zoom in")}>Zoom in</MenuItem>
            <MenuItem kbd="⌘ −" onClick={act("Zoom out")}>Zoom out</MenuItem>
          </MenubarMenu>
          <MenubarMenu label="Run" onOpenChange={track("Run")}>
            <MenuItem kbd="⌘ ↵" onClick={act("Start run")}>Start run</MenuItem>
            <MenuItem kbd="⌘ ." onClick={act("Pause after this step")}>Pause after this step</MenuItem>
            <MenuSeparator />
            <MenuItem danger onClick={act("Stop run")}>Stop run</MenuItem>
          </MenubarMenu>
        </Menubar>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Popover
   ========================================================= */

export function PopoverSection() {
  const [open, setOpen] = useState<string | null>(null);
  const track = (name: string) => (o: boolean) => setOpen((cur) => (o ? name : cur === name ? null : cur));

  return (
    <Section
      id="popover"
      title="Popover"
      lede="Use a popover for a little detail or a quick action tied to a button. Unlike a tooltip it can hold actions and opens on click, so touch and keyboard work too. Escape returns focus to the button."
    >
      <Spec name="details with an action, hover infotip" state={[["open", open ? `"${open}"` : "null"]]} canvasClassName="min-h-[240px]">
        <Popover
          onOpenChange={track("Next run")}
          trigger={<Button variant="secondary">Next run</Button>}
          title="Weekdays at 11:30"
          description="lunch-picker runs next in 2 hours. It reads the votes, picks a place, and posts to #office."
        >
          <div className="flex items-center gap-2">
            <Badge tone="ok" dot>
              Healthy
            </Badge>
            <div className="flex-1" />
            <PopoverClose
              render={
                <Button variant="primary" onClick={() => toast("Run started")}>
                  Run now
                </Button>
              }
            />
          </div>
        </Popover>

        <Popover
          openOnHover
          hideClose
          width={280}
          onOpenChange={track("Billed time")}
          trigger={<IconButton variant="secondary" label="What counts as billed time?" icon={<QuestionIcon />} />}
          title="What counts as billed time"
          description="Only the time the agent spends working: model calls and tool calls. Time spent waiting for you, or asleep between runs, is free."
        />
      </Spec>
    </Section>
  );
}

/* =========================================================
   Preview card
   ========================================================= */

export function PreviewCardSection() {
  const [open, setOpen] = useState<string | null>(null);
  const track = (name: string) => (o: boolean) => setOpen((cur) => (o ? name : cur === name ? null : cur));

  return (
    <Section
      id="preview-card"
      title="Preview card"
      lede="Use a preview card to show where a link goes before anyone follows it. The link stays a real link, and the card is a bonus, never the only way to the content. It waits half a second."
    >
      <Spec name="run link, person link" state={[["open", open ? `"${open}"` : "null"]]} canvasClassName="min-h-[220px]">
        <p className="m-0 max-w-[46ch] text-body leading-[1.7] text-ink-2">
          The flaky test was fixed in{" "}
          <PreviewCard
            href="#preview-card"
            onOpenChange={track("run #482")}
            preview={
              <CardBody className="p-4">
                <CardHead className="mb-2">
                  <CardIcon>
                    <GitBranchIcon />
                  </CardIcon>
                  <div className="min-w-0">
                    <CardTitle>Run #482</CardTitle>
                    <CardSub>feat/theme-toggle · 41s</CardSub>
                  </div>
                </CardHead>
                <CardText>Retried menu-lookup with a longer timeout; all 128 tests pass.</CardText>
                <div className="mt-3 flex items-center gap-2">
                  <Badge tone="ok" dot>
                    Passed
                  </Badge>
                  <Diffstat added={12} removed={3} />
                </div>
              </CardBody>
            }
          >
            run #482
          </PreviewCard>
          , reviewed by{" "}
          <PreviewCard
            href="#preview-card"
            width={260}
            onOpenChange={track("@priya")}
            preview={
              <CardBody className="flex items-center gap-3 p-4">
                <Avatar initials="PR" round />
                <div className="min-w-0">
                  <CardTitle>Priya Raman</CardTitle>
                  <CardSub>owner · studio team</CardSub>
                </div>
              </CardBody>
            }
          >
            @priya
          </PreviewCard>{" "}
          this morning.
        </p>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Drawer
   ========================================================= */

const DETAIL_STEPS = [
  { label: "Read tokens.css and layout.tsx", time: "0:04" },
  { label: "Added dark tokens under data-theme", time: "0:11" },
  { label: "Created theme-toggle.tsx", time: "0:19" },
  { label: "Ran lint, no problems", time: "0:31" },
];

export function DrawerSection() {
  const [open, setOpen] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [mine, setMine] = useState(false);
  const [applied, setApplied] = useState('"all"');
  const track = (name: string) => (o: boolean) => setOpen((cur) => (o ? name : cur === name ? null : cur));

  return (
    <Section
      id="drawer"
      title="Drawer"
      lede="Use a drawer for work that needs room but not a new page: run details, filters, settings. It's modal like a dialog, and it swipes back toward its edge. On phones, the bottom sheet sits under your thumb."
    >
      <Spec name="side sheet, bottom sheet" state={[["open", open ? `"${open}"` : "null"], ["filter", applied]]}>
        <Drawer
          onOpenChange={track("right")}
          trigger={<Button variant="secondary">Run details</Button>}
          title="Run #482"
          description="feat/theme-toggle, started by you 4 minutes ago."
          footer={
            <>
              <DrawerClose render={<Button variant="secondary">Close</Button>} />
              <DrawerClose
                render={
                  <Button variant="primary" icon={<ArrowClockwiseIcon />} onClick={() => toast("Run restarted")}>
                    Re-run
                  </Button>
                }
              />
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <dl className="m-0 grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-control [&_dd]:m-0 [&_dt]:text-ink-3">
              <dt>Status</dt>
              <dd>
                <Badge tone="ok" dot>
                  Passed
                </Badge>
              </dd>
              <dt>Duration</dt>
              <dd className="tabular-nums">41s</dd>
              <dt>Changes</dt>
              <dd>
                <Diffstat added={39} removed={6} />
              </dd>
            </dl>
            <Trace steps={DETAIL_STEPS} summary="Worked for 41s" defaultOpen />
          </div>
        </Drawer>

        <Drawer
          side="bottom"
          onOpenChange={track("bottom")}
          trigger={
            <Button variant="secondary" icon={<FunnelIcon />}>
              Filter runs
            </Button>
          }
          title="Filter runs"
          description="Only matching runs show in the list."
          footer={
            <DrawerClose
              render={
                <Button variant="primary" onClick={() => setApplied(`"${status}"${mine ? ', mine' : ""}`)}>
                  Show runs
                </Button>
              }
            />
          }
        >
          <div className="flex flex-col gap-4">
            <ChoiceList legend="Status">
              <RadioGroup value={status} onValueChange={(v) => setStatus(v as string)}>
                <RadioChoice value="all" label="All runs" />
                <RadioChoice value="failed" label="Failed" description="Stopped with an error or a failing check." />
                <RadioChoice value="running" label="Running now" />
              </RadioGroup>
            </ChoiceList>
            <CheckboxChoice label="Only runs I started" checked={mine} onCheckedChange={setMine} />
          </div>
        </Drawer>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Toast
   ========================================================= */

const TONES: [ToastTone, string, string, ToastOptions["description"]?][] = [
  ["neutral", "Copy link", "Link copied"],
  ["success", "Deploy", "Deployed lunch-picker", "Live at /agents/lunch-picker."],
  ["info", "Start quiet hours", "Quiet hours started", "Scheduled runs wait until 06:00."],
  ["warning", "Spend $96", "80% of this month's budget used", "lunch-picker pauses at $120."],
  ["danger", "Run", "Run failed", "menu-lookup timed out 3 times."],
];

const THREADS = ["theme toggle", "select refactor", "flaky menu test"];

export function ToastSection() {
  const [last, setLast] = useState<Pairs>([["last", "none"]]);
  const [threads, setThreads] = useState<string[]>(THREADS);
  const [undo, setUndo] = useState<Pairs>([["archived", "none"]]);

  function archive(name: string) {
    setThreads((t) => t.filter((n) => n !== name));
    setUndo([["archived", `"${name}"`], ["undoFor", "6s"]]);
    toast(`Archived ${name}`, {
      action: {
        label: "Undo",
        onClick: () => {
          setThreads((t) => THREADS.filter((n) => n === name || t.includes(n)));
          setUndo([["restored", `"${name}"`]]);
        },
      },
    });
  }

  return (
    <Section
      id="toast"
      title="Toast"
      lede="Use a toast to confirm what just happened, in one line, without taking focus. It leaves on its own; offer Undo when the change can be undone, rather than asking first. Navigation needs no toast."
    >
      <div className="grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
        <Spec name="tones, description" state={last}>
          {TONES.map(([tone, label, message, description]) => (
            <Button
              key={tone}
              variant="secondary"
              onClick={() => {
                toast(message, { tone, description });
                setLast([["tone", tone], ["message", `"${message}"`]]);
              }}
            >
              {label}
            </Button>
          ))}
        </Spec>
        <Spec name="undo action" state={[...undo, ["threads", String(threads.length)]]}>
          <div className="flex w-full max-w-[300px] flex-col gap-px">
            {threads.map((name) => (
              <div key={name} className="flex min-h-9 items-center gap-2 rounded-control pl-2.5 text-control hover:bg-hover">
                <span className="min-w-0 flex-1 truncate">{name}</span>
                <IconButton label={`Archive ${name}`} icon={<ArchiveIcon />} onClick={() => archive(name)} />
              </div>
            ))}
            {threads.length === 0 && <Hint className="px-2.5 py-2">Every thread is archived. Use Undo to bring one back.</Hint>}
          </div>
        </Spec>
      </div>
    </Section>
  );
}

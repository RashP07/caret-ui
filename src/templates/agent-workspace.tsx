import {
  ArrowsInIcon,
  ArrowsOutIcon,
  ArrowUUpLeftIcon,
  DotsThreeIcon,
  ExportIcon,
  FileIcon,
  FolderIcon,
  GearIcon,
  GitBranchIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  MoonIcon,
  PlusIcon,
  QuestionIcon,
  RobotIcon,
  SidebarSimpleIcon,
  SlidersHorizontalIcon,
  SunIcon,
  TerminalIcon,
  XIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  AlertDialog,
  AlertDialogClose,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFoot,
  CardHead,
  CardIcon,
  CardSub,
  CardText,
  CardTitle,
  Composer,
  ComposerFoot,
  Consequences,
  ContextMeter,
  Crumbs,
  Diff,
  Diffstat,
  diffStatOf,
  Hint,
  IconButton,
  Input,
  Kbd,
  MenuLabel,
  Messages,
  MsgActions,
  MsgAgent,
  MsgUser,
  NavGroup,
  NavItem,
  Select,
  Seg,
  StreamCaret,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Threads,
  toast,
  TooltipGroup,
  Trace,
  type TraceStep,
  type Vote,
} from "@/components";
import { cn } from "@/lib/cn";
import { MODE_INFO, ThemeScope, type ResolvedMode } from "@/lib/theme";
import { usePageScheme } from "@/lib/use-page-scheme";
import { SeedConversation } from "./seed-conversation";
import {
  ago,
  BRANCHES,
  DIRS,
  FILES,
  MODEL_GROUPS,
  MODES,
  PROJECTS,
  REPLY,
  RUN_STEPS,
  WORKSPACES,
} from "./workspace-data";

/*
 * Template: agent workspace. Threads on the left, the conversation in the
 * middle, the agent's changes on the right.
 *
 * Layout only. Every piece inside is an existing Caret component: Select,
 * Input, NavItem, Threads, MenuLabel, Seg, Card, Crumbs, Tabs, Diff, Composer,
 * Badge, Trace, MsgActions. The classes in this file are grid, flex, gap,
 * padding, width, overflow, visibility and positioning — nothing else.
 *
 * It lays out by its own width, not the viewport's, so it works inside a docs
 * column or a split pane: below 1180px the changes panel becomes a slide-over,
 * below 860px the sidebar does too. Its height is the host's: give it one
 * (e.g. `className="h-[780px]"`), or place it in a sized box.
 */

type Run = {
  id: number;
  kind: "run";
  steps: TraceStep[];
  live: boolean;
  open: boolean;
  summary: string;
  reply: string;
  streaming: boolean;
  stopped: boolean;
  vote: Vote;
};
type Msg =
  | { id: number; kind: "seed" }
  | { id: number; kind: "user"; text: string }
  | { id: number; kind: "note"; minutes: number }
  | { id: number; kind: "empty" }
  | Run;

let nextId = 1;
const uid = () => nextId++;

const SIDE = "260px";
/** The changes panel, docked or as a slide-over. */
const PANEL = "448px";

const files = (n: number) => `${n} ${new Intl.PluralRules("en").select(n) === "one" ? "file" : "files"}`;

/** The element's own width, measured before paint. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => setWidth(e.borderBoxSize[0]?.inlineSize ?? e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export function AgentWorkspace({ className }: { className?: string }) {
  /* ---------- layout: by the template's own width ---------- */
  const [rootRef, width] = useWidth<HTMLDivElement>();
  const narrow = width !== null && width <= 860;
  const mid = width !== null && width <= 1180;
  const [sideHidden, setSideHidden] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [panelHidden, setPanelHidden] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [full, setFull] = useState(false);

  const sideInGrid = !narrow && !sideHidden;
  const sideVisible = narrow ? sideOpen : !sideHidden;
  const panelInGrid = !mid && !panelHidden;
  const panelVisible = mid ? panelOpen : !panelHidden;

  const toggleSide = () => (narrow ? setSideOpen((o) => !o) : setSideHidden((h) => !h));
  const togglePanel = () => (mid ? setPanelOpen((o) => !o) : setPanelHidden((h) => !h));
  const closePanel = () => (mid ? setPanelOpen(false) : setPanelHidden(true));

  /* ---------- scoped mode: the theme follows the page ---------- */
  const [scopeMode, setScopeMode] = useState<ResolvedMode | undefined>();
  const pageScheme = usePageScheme();
  const segMode = scopeMode ?? pageScheme;

  /* ---------- sidebar ---------- */
  const [workspace, setWorkspace] = useState("PR");
  const [query, setQuery] = useState("");
  const [thread, setThread] = useState<string | null>("theme toggle");
  const searchRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const tree = PROJECTS.map((p) => {
    const threads = (p.threads ?? []).filter((t) => !q || t.name.includes(q));
    const show = !q || p.name.includes(q) || threads.length > 0;
    return { ...p, threads, show };
  });
  const anyMatch = tree.some((p) => p.show);

  /* ---------- conversation ---------- */
  const [msgs, setMsgs] = useState<Msg[]>([{ id: uid(), kind: "seed" }]);
  const [busy, setBusy] = useState(false);
  const [ctx, setCtx] = useState(57);
  const [model, setModel] = useState("Balanced");
  const [branch, setBranch] = useState("main");
  const [dir, setDir] = useState("agent-console");
  const [mode, setMode] = useState("Agent");
  const bodyRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const scrollDown = () => requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }));
  const nearBottom = () => {
    const b = bodyRef.current;
    return !b || b.scrollHeight - b.scrollTop - b.clientHeight < 80;
  };

  useEffect(() => void scrollDown(), []);
  useEffect(() => () => stopRef.current?.(), []);

  function openThread(name: string, minutes: number) {
    stopRef.current?.();
    setThread(name);
    setMsgs(name === "theme toggle" ? [{ id: uid(), kind: "seed" }] : [{ id: uid(), kind: "note", minutes }]);
    scrollDown();
  }

  function newThread() {
    stopRef.current?.();
    setThread(null);
    setMsgs([{ id: uid(), kind: "empty" }]);
    taRef.current?.focus();
  }

  function updateRun(id: number, patch: (r: Run) => Partial<Run>) {
    setMsgs((all) => all.map((m) => (m.id === id && m.kind === "run" ? { ...m, ...patch(m) } : m)));
  }

  // The run: send → trace streams → reply streams with the caret as write head.
  function send(text: string) {
    const runId = uid();
    setMsgs((all) => [
      ...all.filter((m) => m.kind !== "empty"),
      { id: uid(), kind: "user", text },
      { id: runId, kind: "run", steps: [], live: true, open: true, summary: "", reply: "", streaming: false, stopped: false, vote: null },
    ]);
    setBusy(true);
    scrollDown();

    const t0 = Date.now();
    const timers: number[] = [];
    let stream = 0;
    let step = 0;
    const secs = () => Math.max(1, Math.round((Date.now() - t0) / 1000));
    const settle = (steps: TraceStep[]) =>
      steps.map((s) => (s.state === "now" ? { ...s, state: "done" as const, time: `0:0${Math.min(9, secs())}` } : s));

    function finish(stopped: boolean) {
      timers.forEach(clearTimeout);
      clearInterval(stream);
      stopRef.current = null;
      updateRun(runId, (r) => ({
        live: false,
        open: false,
        streaming: false,
        stopped,
        steps: stopped ? r.steps.filter((s) => s.state !== "now") : settle(r.steps),
        summary: stopped ? `Stopped after ${secs()}s` : `Worked for ${secs()}s`,
      }));
      if (!stopped) setCtx((c) => Math.min(100, c + 4));
      setBusy(false);
      scrollDown();
    }

    function nextStep() {
      if (step >= RUN_STEPS.length) {
        updateRun(runId, (r) => ({ steps: settle(r.steps), streaming: true }));
        let i = 0;
        stream = window.setInterval(() => {
          i += 2 + Math.floor(Math.random() * 3);
          const keep = nearBottom();
          updateRun(runId, () => ({ reply: REPLY.slice(0, i) }));
          if (keep) scrollDown();
          if (i >= REPLY.length) finish(false);
        }, 22);
        return;
      }
      const label = RUN_STEPS[step++];
      updateRun(runId, (r) => ({ steps: [...settle(r.steps), { label, state: "now" }] }));
      scrollDown();
      timers.push(window.setTimeout(nextStep, 700 + Math.random() * 500));
    }

    stopRef.current = () => finish(true);
    timers.push(window.setTimeout(nextStep, 250));
  }

  /* ---------- changes panel ---------- */
  const [panelTab, setPanelTab] = useState("changes");
  const [fileIdx, setFileIdx] = useState(0);
  const filesRef = useRef<HTMLElement>(null);
  const [preview, setPreview] = useState<ResolvedMode>("light");
  const [discarded, setDiscarded] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const changed = discarded ? [] : FILES;
  const total = changed.reduce(
    (acc, f) => {
      const s = diffStatOf(f.lines);
      return { added: acc.added + s.added, removed: acc.removed + s.removed };
    },
    { added: 0, removed: 0 },
  );
  const file = changed[fileIdx];

  function discard() {
    setConfirmDiscard(false);
    setDiscarded(true);
    toast(`Discarded changes to ${files(FILES.length)}`, {
      action: { label: "Undo", onClick: () => setDiscarded(false) },
    });
  }

  function pickFile(i: number) {
    setFileIdx(i);
    requestAnimationFrame(() => (filesRef.current?.querySelector("[aria-current='true']") as HTMLElement | null)?.focus());
  }

  /* ---------- keyboard ---------- */
  function onAppKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (narrow) setSideOpen(true);
      else setSideHidden(false);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
    if (mod && e.key === "\\") {
      e.preventDefault();
      toggleSide();
    }
  }

  useEffect(() => {
    if (!full) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || busy) return;
      if (document.querySelector("[data-popup-open]")) return;
      setFull(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [full, busy]);

  const modelPicker = (
    <Select label="Model" hideLabel density="compact" value={model} onValueChange={setModel} groups={MODEL_GROUPS} side="top" align="end" menuWidth={260} />
  );

  return (
    <ThemeScope
      ref={rootRef}
      mode={scopeMode}
      aria-label="Agent workspace"
      role="region"
      onKeyDown={onAppKeyDown}
      className={cn(
        // The outer frame of a full app template. Concentric: the 12px cards sit 8px in.
        "relative grid h-full min-h-0 grid-cols-[var(--side)_minmax(0,1fr)_var(--panel)] overflow-hidden rounded-[calc(var(--r-card)+8px)] border border-line bg-page p-2 text-ink shadow-float",
        "transition-[grid-template-columns] duration-settle ease-out",
        className,
        full && "fixed inset-0 z-[85] h-auto rounded-none border-0 pt-[calc(8px+env(safe-area-inset-top,0px))] pb-[calc(8px+env(safe-area-inset-bottom,0px))]",
      )}
      style={{ "--side": sideInGrid ? SIDE : "0px", "--panel": panelInGrid ? PANEL : "0px", "--panel-w": PANEL } as React.CSSProperties}
    >
      {/* ---------- sidebar ---------- */}
      <aside
        aria-label="Workspace"
        className={cn(
          "flex min-w-0 flex-col gap-3 overflow-hidden pt-1.5 pr-3 pb-1 pl-1",
          !sideVisible && "invisible",
          !narrow && "col-start-1 row-start-1",
          // phones: a slide-over panel, --e-modal (DESIGN.md §3)
          narrow && "absolute top-2 bottom-2 left-2 z-[6] w-[260px] rounded-card border border-line bg-page p-2 shadow-modal",
        )}
      >
        <div className="flex items-center gap-1">
          <Select
            className="min-w-0 flex-1"
            triggerClassName="h-9"
            label="Workspace"
            hideLabel
            density="compact"
            value={workspace}
            onValueChange={setWorkspace}
            groups={WORKSPACES}
            menuWidth={220}
            lead={<Avatar small initials={workspace} />}
          />
          <IconButton label={narrow ? "Close sidebar" : "Hide sidebar"} kbd="⌘ \" icon={<SidebarSimpleIcon />} onClick={toggleSide} />
        </div>

        <Input
          ref={searchRef}
          aria-label="Search threads"
          placeholder="Search threads"
          autoComplete="off"
          value={query}
          onValueChange={(v: string) => setQuery(v)}
          lead={<MagnifyingGlassIcon />}
          trail={<Kbd keys="⌘K" />}
        />

        <nav aria-label="Primary" className="flex flex-col gap-px">
          <NavItem icon={<PlusIcon />} onClick={newThread}>
            New thread
          </NavItem>
          <NavItem icon={<RobotIcon />}>Automations</NavItem>
          <NavItem icon={<SlidersHorizontalIcon />}>Customize</NavItem>
        </nav>

        <motion.div layoutScroll className="-mx-1 flex min-h-0 flex-1 flex-col gap-px overflow-y-auto px-1">
          <NavGroup>
          <MenuLabel>Projects</MenuLabel>
          {tree.map((p) =>
            p.show ? (
              <div key={p.name} className="flex flex-col gap-px">
                <NavItem icon={<FolderIcon />}>{p.name}</NavItem>
                {p.threads.length > 0 && (
                  <Threads>
                    {p.threads.map((t) => {
                      const when = ago(t.minutes);
                      return (
                        <NavItem
                          key={t.name}
                          // "34m" reads as meters: the short form is for the eye, the long one for screen readers.
                          meta={
                            <>
                              <span aria-hidden>{when.short}</span>
                              <span className="sr-only-caret">{when.long}</span>
                            </>
                          }
                          live={t.live}
                          current={thread === t.name}
                          onClick={() => openThread(t.name, t.minutes)}
                        >
                          {t.name}
                        </NavItem>
                      );
                    })}
                  </Threads>
                )}
              </div>
            ) : null,
          )}
          {!anyMatch && (
            <div className="flex flex-col items-start gap-1.5 px-2 py-1.5">
              <Hint className="break-all">No threads match “{query.trim()}”.</Hint>
              <Button
                variant="ghost"
                className="-ml-2"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                Clear search
              </Button>
            </div>
          )}
          </NavGroup>
        </motion.div>

        <div className="flex flex-col gap-px border-t border-line pt-2">
          <Seg
            className="mb-1.5 ml-1 self-start"
            aria-label="Template mode"
            value={segMode}
            onValueChange={setScopeMode}
            options={[
              { value: "light", label: "Light", icon: <SunIcon size={15} />, iconOnly: true },
              { value: "dark", label: "Dark", icon: <MoonIcon size={15} />, iconOnly: true },
            ]}
          />
          <NavItem icon={<QuestionIcon />}>Help</NavItem>
          <NavItem icon={<GearIcon />}>Settings</NavItem>
          <Card className="mt-1.5">
            <CardHead className="m-0 items-center gap-2 p-3">
              <Avatar tone="soft" initials="S" />
              <div className="min-w-0">
                <CardTitle className="truncate">Pro plan</CardTitle>
                <CardSub>studio team</CardSub>
              </div>
              <Button variant="secondary" className="ml-auto">
                Upgrade
              </Button>
            </CardHead>
          </Card>
        </div>
      </aside>

      {/* ---------- conversation ---------- */}
      <Card aria-label="Conversation" className="col-start-2 row-start-1 min-h-0 overflow-hidden">
        <header className="flex h-13 flex-none items-center gap-1 border-b border-line pr-2 pl-3">
          {/* One shared tooltip for the header's icon row. */}
          <TooltipGroup side="bottom">
          {(narrow || sideHidden) && <IconButton label="Show sidebar" icon={<SidebarSimpleIcon />} onClick={toggleSide} />}
          <Crumbs icon={<FolderIcon size={15} />} items={["agent-console", thread ?? "New thread"]} />
          <div className="flex-1" />
          <IconButton label="Share thread" icon={<ExportIcon />} />
          <IconButton label="More thread actions" icon={<DotsThreeIcon weight="bold" />} />
          <IconButton
            label={full ? "Exit full screen" : "Full screen"}
            kbd={full ? "Esc" : undefined}
            icon={full ? <ArrowsInIcon /> : <ArrowsOutIcon />}
            onClick={() => {
              setFull((f) => !f);
              scrollDown();
            }}
          />
          <IconButton
            label={panelVisible ? "Hide changes panel" : "Show changes panel"}
            icon={<SidebarSimpleIcon className="-scale-x-100" />}
            onClick={togglePanel}
          />
          </TooltipGroup>
        </header>

        <div ref={bodyRef} className={cn("min-h-0 flex-1 overflow-y-auto px-6 pt-8 pb-6", narrow && "px-3 pt-6")}>
          {/* Keyed by thread: opening a thread remounts the column, so its messages stagger in. */}
          <Messages key={thread ?? "new"} className="mx-auto max-w-[760px]">
            {msgs.map((m) => {
              switch (m.kind) {
                case "seed":
                  return <SeedConversation key={m.id} />;
                case "user":
                  return <MsgUser key={m.id}>{m.text}</MsgUser>;
                case "note":
                  return (
                    <div key={m.id} className="flex flex-col gap-6">
                      <Badge className="self-center">Last active {ago(m.minutes).long}</Badge>
                      <Card empty>
                        <CardIcon>
                          <RobotIcon />
                        </CardIcon>
                        <CardTitle>Pick up where you left off</CardTitle>
                        <CardText>Send a message to continue this thread.</CardText>
                      </Card>
                    </div>
                  );
                case "empty":
                  return (
                    <Card key={m.id} empty className="mt-[12%]">
                      <CardIcon>
                        <RobotIcon />
                      </CardIcon>
                      <CardTitle>What should we build?</CardTitle>
                      <CardText>The agent can read this project, edit files, and run commands.</CardText>
                    </Card>
                  );
                case "run":
                  return (
                    <MsgAgent key={m.id}>
                      <Trace
                        steps={m.steps}
                        live={m.live}
                        summary={m.summary}
                        open={m.open}
                        onOpenChange={(open) => updateRun(m.id, () => ({ open }))}
                      />
                      {(m.streaming || m.reply) && (
                        <p>
                          {m.reply}
                          {m.streaming && <StreamCaret />}
                        </p>
                      )}
                      {m.stopped && <Hint>You stopped this run. Nothing was changed.</Hint>}
                      {!m.live && !m.stopped && (
                        <MsgActions vote={m.vote} onVote={(vote) => updateRun(m.id, () => ({ vote }))} copyText={() => m.reply} />
                      )}
                    </MsgAgent>
                  );
              }
            })}
          </Messages>
        </div>

        <div className={cn("flex-none px-4 pb-3", narrow && "px-2 pb-2")}>
          <div className="mx-auto max-w-[760px]">
            <Composer
              textareaRef={taRef}
              busy={busy}
              onSend={send}
              onStop={() => stopRef.current?.()}
              tools={<IconButton label="Attach files" icon={<PlusIcon />} />}
              controls={
                <>
                  {modelPicker}
                  <IconButton label="Dictate" kbd="⌥ Space" icon={<MicrophoneIcon />} />
                </>
              }
            />
            <ComposerFoot>
              <Select label="Branch" hideLabel density="xs" value={branch} onValueChange={setBranch} groups={BRANCHES} side="top" menuWidth={220} lead={<GitBranchIcon size={14} />} />
              <Select label="Working directory" hideLabel density="xs" value={dir} onValueChange={setDir} groups={DIRS} side="top" menuWidth={220} lead={<FolderIcon size={14} />} />
              <div className="flex-1" />
              <Select label="Mode" hideLabel density="xs" value={mode} onValueChange={setMode} groups={MODES} side="top" align="end" menuWidth={260} />
              <ContextMeter value={ctx} />
            </ComposerFoot>
          </div>
        </div>
      </Card>

      {/* ---------- changes panel ---------- */}
      <div
        className={cn(
          "flex min-h-0 min-w-0 overflow-hidden pl-2",
          !panelVisible && "invisible",
          !mid && "col-start-3 row-start-1",
          // below 1180px of its own width: a slide-over panel, --e-modal (DESIGN.md §3)
          mid && "absolute top-2 right-2 bottom-2 z-[5] w-[min(var(--panel-w),calc(100%-16px))] pl-0 [&>*]:shadow-modal",
        )}
      >
        <Card aria-label="Changes panel" className="min-h-0 w-full min-w-0 overflow-hidden">
          <Tabs value={panelTab} onValueChange={(v) => setPanelTab(v as string)} className="flex min-h-0 max-w-none flex-1 flex-col">
            <div className="flex h-13 flex-none items-end gap-1 border-b border-line pr-2 pl-3">
              <TabList aria-label="Changes panel views" flush className="min-w-0 flex-1">
                <Tab value="changes" count={changed.length}>
                  Changes
                </Tab>
                <Tab value="preview">Preview</Tab>
              </TabList>
              <div className="flex self-center">
                <TooltipGroup side="bottom">
                  <IconButton label="Open terminal" kbd="⌃ `" icon={<TerminalIcon />} />
                  <IconButton label="Hide changes panel" icon={<XIcon />} onClick={closePanel} />
                </TooltipGroup>
              </div>
            </div>

            {/* 8px in from the 12px card: the 4px rows and diff are concentric with it. */}
            <TabPanel value="changes" className="flex min-h-0 flex-1 flex-col gap-2 p-2 data-hidden:hidden">
              {changed.length === 0 ? (
                <Card empty className="flex-1">
                  <CardTitle>No changes</CardTitle>
                  <CardText>Files the agent edits show up here.</CardText>
                </Card>
              ) : (
                <>
                  <div className="flex flex-none items-center gap-2.5 pl-2">
                    <Hint>{files(changed.length)} changed</Hint>
                    <Diffstat {...total} />
                    <AlertDialog
                      open={confirmDiscard}
                      onOpenChange={setConfirmDiscard}
                      trigger={<IconButton className="ml-auto" label="Discard all changes" icon={<ArrowUUpLeftIcon />} />}
                      icon={<ArrowUUpLeftIcon size={18} />}
                      title="Discard all changes?"
                      description="The agent's edits to these files are reverted. You can undo this right after."
                      footer={
                        <>
                          <AlertDialogClose render={<Button variant="secondary">Keep changes</Button>} />
                          <Button variant="danger" onClick={discard}>
                            Discard changes
                          </Button>
                        </>
                      }
                    >
                      <Consequences items={changed.map((f) => <span className="mono min-w-0 truncate" title={f.path}>{f.path}</span>)} />
                    </AlertDialog>
                  </div>
                  <nav
                    ref={filesRef}
                    aria-label="Changed files"
                    className="flex flex-none flex-col gap-px"
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                      e.preventDefault();
                      pickFile((fileIdx + (e.key === "ArrowDown" ? 1 : -1) + changed.length) % changed.length);
                    }}
                  >
                    <NavGroup>
                      {changed.map((f, i) => (
                        <NavItem
                          key={f.path}
                          icon={<FileIcon />}
                          path={f.path}
                          current={i === fileIdx}
                          meta={<Diffstat {...diffStatOf(f.lines)} />}
                          trail={f.status && <Badge>{f.status}</Badge>}
                          onClick={() => pickFile(i)}
                        />
                      ))}
                    </NavGroup>
                  </nav>
                  <Diff key={file.path} className="flex-1 rounded-button" lang={file.lang} path={file.path} lines={file.lines} hunk={file.hunk} />
                </>
              )}
            </TabPanel>

            <TabPanel value="preview" className="flex min-h-0 flex-1 flex-col p-0 data-hidden:hidden">
              <div className="grid flex-1 place-items-center bg-page bg-pattern p-6">
                <div className="flex w-[min(300px,100%)] flex-col gap-3">
                  <ThemeScope mode={preview} className="flex">
                    <Card className="w-full">
                      <CardBody>
                        <CardHead>
                          <CardIcon>{preview === "dark" ? <MoonIcon /> : <SunIcon />}</CardIcon>
                          <div>
                            <CardTitle>Appearance</CardTitle>
                            <CardSub>caret-mode</CardSub>
                          </div>
                        </CardHead>
                        <CardText>This is the ThemeToggle from the diff, switching the mode of its own scope.</CardText>
                      </CardBody>
                      <CardFoot>
                        <Badge>{MODE_INFO[preview].label}</Badge>
                        <div className="flex-1" />
                        <IconButton
                          variant="secondary"
                          label={preview === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                          icon={preview === "dark" ? <SunIcon /> : <MoonIcon />}
                          onClick={() => setPreview((p) => (p === "dark" ? "light" : "dark"))}
                        />
                      </CardFoot>
                    </Card>
                  </ThemeScope>
                  <Hint className="justify-center">Preview of theme-toggle.tsx</Hint>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </Card>
      </div>
    </ThemeScope>
  );
}

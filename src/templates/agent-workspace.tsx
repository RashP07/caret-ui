import {
  ArrowUUpLeftIcon,
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
  SunIcon,
  XIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
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
import { ago, BRANCHES, DIRS, FILES, MODEL_GROUPS, MODES, PROJECTS, REPLY, RUN_STEPS, WORKSPACES } from "./workspace-data";

/*
 * Template: agent workspace. Threads on the left, the conversation in the middle, the agent's
 * changes on the right: three flush columns split by single hairlines, like the docs shell. One
 * 44px header row runs across all three, so their bottom lines read as one line. No cards inside
 * cards, no gutters: the columns are the structure.
 *
 * Layout only. Every piece inside is an existing Caret component (Select, Input, NavItem, Threads,
 * Seg, Tabs, Diff, Composer, Trace, MsgActions, AlertDialog…); the classes here are grid, flex,
 * gap, padding, size, borders between columns, overflow and position.
 *
 * It lays out by its own width, not the viewport's, so it works in a docs column or a split pane:
 * under 1180px the changes panel slides over the conversation, under 860px the sidebar does too,
 * each as the same flush column with --e-modal. Its height is the host's: give it one
 * (`className="h-[780px]"`) or put it in a sized box.
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

const SIDE = 248;
const PANEL = 420;
/** Every column's header: 44px, border-box, so the three bottom lines are one. */
const HEAD = "flex h-11 flex-none items-center gap-1 border-b border-line";

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

/** A quiet centred message for an empty conversation or panel. */
function Empty({ icon, title, children }: { icon?: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 text-center">
      {icon && <CardIcon className="mb-1.5">{icon}</CardIcon>}
      <CardTitle>{title}</CardTitle>
      <CardText className="max-w-[34ch]">{children}</CardText>
    </div>
  );
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

  const sideDocked = !narrow && !sideHidden;
  const sideVisible = narrow ? sideOpen : !sideHidden;
  const panelDocked = !mid && !panelHidden;
  const panelVisible = mid ? panelOpen : !panelHidden;

  const toggleSide = () => (narrow ? setSideOpen((o) => !o) : setSideHidden((h) => !h));
  const togglePanel = () => (mid ? setPanelOpen((o) => !o) : setPanelHidden((h) => !h));
  const closePanel = () => (mid ? setPanelOpen(false) : setPanelHidden(true));

  /* ---------- scoped mode: follows the page until you pick ---------- */
  const [scopeMode, setScopeMode] = useState<ResolvedMode | undefined>();
  const pageScheme = usePageScheme();

  /* ---------- sidebar ---------- */
  const [workspace, setWorkspace] = useState("PR");
  const [query, setQuery] = useState("");
  const [thread, setThread] = useState<string | null>("theme toggle");
  const searchRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const tree = PROJECTS.map((p) => {
    const threads = (p.threads ?? []).filter((t) => !q || t.name.includes(q));
    return { ...p, threads, show: !q || p.name.includes(q) || threads.length > 0 };
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
    if (narrow) setSideOpen(false);
    scrollDown();
  }

  function newThread() {
    stopRef.current?.();
    setThread(null);
    setMsgs([{ id: uid(), kind: "empty" }]);
    if (narrow) setSideOpen(false);
    taRef.current?.focus();
  }

  function updateRun(id: number, patch: (r: Run) => Partial<Run>) {
    setMsgs((all) => all.map((m) => (m.id === id && m.kind === "run" ? { ...m, ...patch(m) } : m)));
  }

  // The run: send → the trace streams → the reply streams with the caret as its write head.
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
    toast(`Discarded changes to ${files(FILES.length)}`, { action: { label: "Undo", onClick: () => setDiscarded(false) } });
  }

  function pickFile(i: number) {
    setFileIdx(i);
    requestAnimationFrame(() => (filesRef.current?.querySelector("[aria-current='true']") as HTMLElement | null)?.focus());
  }

  /* ---------- keyboard: ⌘K searches threads, ⌘\ toggles the sidebar ---------- */
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

  return (
    <ThemeScope
      ref={rootRef}
      mode={scopeMode}
      aria-label="Agent workspace"
      role="region"
      onKeyDown={onAppKeyDown}
      className={cn(
        "relative grid h-full min-h-0 grid-cols-[var(--side)_minmax(0,1fr)_var(--panel)] overflow-hidden border border-line bg-page text-ink",
        "transition-[grid-template-columns] duration-settle ease-drawer",
        className,
      )}
      style={{ "--side": sideDocked ? `${SIDE}px` : "0px", "--panel": panelDocked ? `${PANEL}px` : "0px" } as React.CSSProperties}
    >
      {/* ---------- sidebar ---------- */}
      <aside
        aria-label="Threads"
        style={narrow ? { width: SIDE + 12 } : undefined}
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-hidden bg-surface",
          !sideVisible && "invisible",
          narrow ? "absolute inset-y-0 left-0 z-[6] border-r border-line shadow-modal" : "col-start-1 row-start-1 border-r border-line",
        )}
      >
        <div className={cn(HEAD, "ps-1.5 pe-1.5")}>
          <Select
            className="min-w-0 flex-1"
            label="Workspace"
            hideLabel
            density="compact"
            value={workspace}
            onValueChange={setWorkspace}
            groups={WORKSPACES}
            menuWidth={220}
            lead={<Avatar small tone="soft" initials={workspace} />}
          />
          <IconButton size="sm" label={narrow ? "Close sidebar" : "Hide sidebar"} kbd="⌘ \" icon={<SidebarSimpleIcon />} onClick={toggleSide} />
        </div>

        <div className="flex flex-none flex-col gap-2 p-2">
          <Input
            ref={searchRef}
            aria-label="Search threads"
            placeholder="Search threads"
            autoComplete="off"
            value={query}
            onValueChange={(v: string) => setQuery(v)}
            lead={<MagnifyingGlassIcon />}
            trail={<Kbd keys="⌘K" size="sm" />}
          />
          <nav aria-label="Primary" className="flex flex-col gap-px">
            <NavItem icon={<PlusIcon />} onClick={newThread}>
              New thread
            </NavItem>
            <NavItem icon={<RobotIcon />}>Automations</NavItem>
          </nav>
        </div>

        <motion.div layoutScroll className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto overscroll-contain px-2 pb-2">
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
                  size="sm"
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

        <div className="flex flex-none items-center gap-0.5 border-t border-line p-1.5">
          <Seg
            aria-label="Template mode"
            value={scopeMode ?? pageScheme}
            onValueChange={setScopeMode}
            options={[
              { value: "light", label: MODE_INFO.light.label, icon: <SunIcon size={14} />, iconOnly: true },
              { value: "dark", label: MODE_INFO.dark.label, icon: <MoonIcon size={14} />, iconOnly: true },
            ]}
          />
          <div className="flex-1" />
          <TooltipGroup>
            <IconButton size="sm" label="Help" icon={<QuestionIcon />} />
            <IconButton size="sm" label="Settings" icon={<GearIcon />} />
          </TooltipGroup>
        </div>
      </aside>

      {/* ---------- conversation ---------- */}
      <section aria-label="Conversation" className="col-start-2 row-start-1 flex min-h-0 min-w-0 flex-col">
        <header className={cn(HEAD, "ps-2 pe-1.5")}>
          <TooltipGroup side="bottom">
            {!sideDocked && <IconButton size="sm" label="Show sidebar" kbd="⌘ \" icon={<SidebarSimpleIcon />} onClick={toggleSide} />}
            <h2 className="m-0 flex min-w-0 items-center gap-1.5 ps-1.5 text-control font-control">
              <span className="truncate">{thread ?? "New thread"}</span>
              {busy && (
                <Badge tone="live" dot className="flex-none">
                  Working
                </Badge>
              )}
            </h2>
            <div className="flex-1" />
            {/* Pressed while the panel shows; the stat says what's waiting before you open it. */}
            <Button size="sm" variant="ghost" aria-pressed={panelVisible} onClick={togglePanel} className="flex-none">
              <span className="inline-flex items-center gap-2">
                Changes
                {changed.length > 0 && <Diffstat {...total} />}
              </span>
            </Button>
          </TooltipGroup>
        </header>

        <div ref={bodyRef} className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-6 pb-4", narrow && "px-3 pt-4")}>
          {/* Keyed by thread: opening a thread remounts the column, so its messages stagger in. */}
          <Messages key={thread ?? "new"} className="mx-auto min-h-full max-w-[720px]">
            {msgs.map((m) => {
              switch (m.kind) {
                case "seed":
                  return <SeedConversation key={m.id} />;
                case "user":
                  return <MsgUser key={m.id}>{m.text}</MsgUser>;
                case "note":
                  return (
                    <div key={m.id} className="my-auto">
                      <Empty icon={<RobotIcon />} title="Pick up where you left off">
                        Last active {ago(m.minutes).long}. Send a message to continue this thread.
                      </Empty>
                    </div>
                  );
                case "empty":
                  return (
                    <div key={m.id} className="my-auto">
                      <Empty icon={<RobotIcon />} title="What should we build?">
                        The agent can read this project, edit files and run commands.
                      </Empty>
                    </div>
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

        <div className={cn("flex-none px-6 pb-4", narrow && "px-3 pb-3")}>
          <div className="mx-auto max-w-[720px]">
            <Composer
              textareaRef={taRef}
              busy={busy}
              onSend={send}
              onStop={() => stopRef.current?.()}
              tools={<IconButton size="sm" label="Attach files" icon={<PlusIcon />} />}
              controls={
                <>
                  <Select label="Model" hideLabel density="xs" value={model} onValueChange={setModel} groups={MODEL_GROUPS} side="top" align="end" menuWidth={260} />
                  <IconButton size="sm" label="Dictate" kbd="⌥ Space" icon={<MicrophoneIcon />} />
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
      </section>

      {/* ---------- changes panel ---------- */}
      <aside
        aria-label="Changes"
        style={mid ? { width: `min(${PANEL}px, 100%)` } : undefined}
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-hidden bg-surface",
          !panelVisible && "invisible",
          mid ? "absolute inset-y-0 right-0 z-[5] border-l border-line shadow-modal" : "col-start-3 row-start-1 border-l border-line",
        )}
      >
        <Tabs value={panelTab} onValueChange={(v) => setPanelTab(v as string)} className="flex min-h-0 max-w-none flex-1 flex-col">
          <div className={cn(HEAD, "ps-2 pe-1.5")}>
            <TabList aria-label="Panel views" variant="subtle" className="min-w-0 flex-1">
              <Tab value="changes" count={changed.length}>
                Changes
              </Tab>
              <Tab value="preview">Preview</Tab>
            </TabList>
            <IconButton size="sm" className="flex-none" label="Close panel" icon={<XIcon />} onClick={closePanel} />
          </div>

          <TabPanel value="changes" className="flex min-h-0 flex-1 flex-col p-0 data-hidden:hidden">
            {changed.length === 0 ? (
              <div className="grid flex-1 place-items-center">
                <Empty title="No changes">Files the agent edits show up here.</Empty>
              </div>
            ) : (
              <>
                <div className="flex h-10 flex-none items-center gap-2.5 border-b border-line ps-3 pe-1.5">
                  <Hint>{files(changed.length)} changed</Hint>
                  <Diffstat {...total} />
                  <AlertDialog
                    open={confirmDiscard}
                    onOpenChange={setConfirmDiscard}
                    trigger={<IconButton size="sm" className="ml-auto" label="Discard all changes" icon={<ArrowUUpLeftIcon />} />}
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
                  className="flex flex-none flex-col gap-px border-b border-line p-1.5"
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
                {/* Flush: the panel is its frame. */}
                <Diff key={file.path} className="flex-1 rounded-none border-0" lang={file.lang} path={file.path} lines={file.lines} hunk={file.hunk} />
              </>
            )}
          </TabPanel>

          <TabPanel value="preview" className="flex min-h-0 flex-1 flex-col p-0 data-hidden:hidden">
            <div className="grid flex-1 place-items-center bg-page p-6">
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
                      <CardText>The ThemeToggle from the diff, switching the mode of its own scope.</CardText>
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
      </aside>
    </ThemeScope>
  );
}

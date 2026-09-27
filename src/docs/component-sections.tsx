import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  CheckIcon,
  DatabaseIcon,
  GearIcon,
  GitBranchIcon,
  LightningIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PlugIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useRef, useState, type RefObject } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFoot,
  CardHead,
  CardIcon,
  CardSub,
  CardText,
  CardTitle,
  CheckboxChoice,
  ChoiceList,
  DestructiveDialog,
  Dialog,
  DialogClose,
  Field,
  Hint,
  IconButton,
  Input,
  Kbd,
  RadioCard,
  RadioChoice,
  RadioGroup,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  toast,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  Tooltip,
  type ButtonVariant,
} from "@/components";
import { Section, Spec, type Pairs } from "./spec";

/* =========================================================
   Button
   ========================================================= */

export function ButtonSection() {
  const [last, setLast] = useState<Pairs>([["last", "none"]]);
  const [deploy, setDeploy] = useState<"idle" | "running" | "done">("idle");
  const [deployState, setDeployState] = useState<Pairs>([["state", "idle"]]);

  const variants: [ButtonVariant, string, React.ReactNode?, string?][] = [
    ["primary", "Deploy agent", undefined, "⌘↵"],
    ["secondary", "Open logs"],
    ["ghost", "Cancel"],
    ["accent", "Approve", <CheckIcon key="i" />],
    ["danger", "Delete", <TrashIcon key="i" />],
  ];

  function run() {
    if (deploy === "running") return;
    setDeploy("running");
    setDeployState([["state", "running"], ["aria-busy", "true"]]);
    setTimeout(() => {
      setDeploy("done");
      setDeployState([["state", "done"], ["took", "1.4s"]]);
      setTimeout(() => {
        setDeploy("idle");
        setDeployState([["state", "idle"]]);
      }, 1600);
    }, 1400);
  }

  return (
    <Section
      id="button"
      title="Button"
      lede="Use a button to start an action. Each prints its fastest shortcut on the face and stands on a 2px ledge; pressed, the face drops onto it like a key. Loading keeps the width, so nothing jumps."
    >
      <Spec name="primary, secondary, ghost, accent, danger" state={last}>
        {variants.map(([v, label, icon, kbd]) => (
          <Button
            key={v}
            variant={v}
            icon={icon}
            kbd={kbd}
            onPointerDown={() => setLast([["pressed", `"${label}"`], ["ledge", "0px"], ["travel", "2px"]])}
            onClick={() => setLast([["last", `"${label}"`], ["variant", v]])}
          >
            {label}
          </Button>
        ))}
      </Spec>
      <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
        <Spec name="loading, disabled" state={deployState}>
          <Button
            variant="primary"
            className="min-w-[132px]"
            loading={deploy === "running"}
            icon={deploy === "done" ? <CheckIcon /> : <PlayIcon />}
            onClick={run}
          >
            {deploy === "done" ? "Done" : "Run now"}
          </Button>
          <Button variant="secondary" disabled>
            Retry
          </Button>
        </Spec>
        <Spec name="group, icon-only, small" state={[["icon-only", "requires label"], ["sm", "28px"]]}>
          <ButtonGroup aria-label="Run controls">
            <Button variant="secondary">Run once</Button>
            <IconButton variant="secondary" label="More run options" icon={<CaretDownIcon />} />
          </ButtonGroup>
          <IconButton variant="secondary" label="Add tool" kbd="A" icon={<PlusIcon />} />
          <Button variant="secondary" size="sm" icon={<ArrowCounterClockwiseIcon />}>
            Undo
          </Button>
        </Spec>
      </div>
    </Section>
  );
}

/* =========================================================
   Input
   ========================================================= */

function validateName(v: string) {
  if (!v) return "Give the agent a name.";
  if (/[A-Z]/.test(v)) return "Use lowercase letters only.";
  if (/\s/.test(v)) return "Replace spaces with dashes.";
  if (!/^[a-z0-9-]+$/.test(v)) return "Use only lowercase letters, numbers and dashes.";
  if (/^-|-$/.test(v)) return "Start and end with a letter or number.";
  return "";
}

export function InputSection({ searchRef }: { searchRef: RefObject<HTMLInputElement | null> }) {
  const [name, setName] = useState("lunch-picker");
  const [state, setState] = useState<Pairs>([["value", '"lunch-picker"'], ["valid", "true"]]);
  const error = validateName(name);

  return (
    <Section
      id="input"
      title="Input"
      lede="Use an input for free text. Labels sit above and stay visible; hints state the rule before you break it, and errors say what to change. At rest it's a recessed well; focus lifts it flush, with an ink border."
    >
      <Spec name="text, affix, icon + key, disabled" state={state} layout="left" canvasClassName="gap-8">
        <Field
          className="max-w-[340px]"
          label="Agent name"
          count={`${name.length}/32`}
          hint="Lowercase letters, numbers and dashes. This becomes part of the URL."
          error={error || undefined}
        >
          <Input
            value={name}
            maxLength={32}
            autoComplete="off"
            spellCheck={false}
            valid={!error}
            aria-invalid={!!error}
            onValueChange={(v: string) => {
              setName(v);
              setState([["value", `"${v}"`], ["valid", String(!validateName(v))]]);
            }}
          />
        </Field>
        <Field className="max-w-[340px]" label="Webhook" optional hint="We'll send a request here after every run.">
          <Input
            affix="https://"
            placeholder="hooks.example.com/agent"
            autoComplete="off"
            spellCheck={false}
            onValueChange={(v: string) => setState([["webhook", `"https://${v}"`]])}
          />
        </Field>
        <Field className="max-w-[340px]" label="Search runs">
          <Input
            ref={searchRef}
            lead={<MagnifyingGlassIcon />}
            trail={<Kbd keys="/" />}
            placeholder="Filter by name or status"
            autoComplete="off"
            onValueChange={(v: string) => setState([["query", `"${v}"`]])}
          />
        </Field>
        <Field className="max-w-[340px]" label="Region" hint="Set by your workspace plan." disabled>
          <Input defaultValue="Chosen automatically" />
        </Field>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Select
   ========================================================= */

export function DropdownSection() {
  const [model, setModel] = useState("Balanced");
  const [retry, setRetry] = useState("Retry 3 times");
  const [channel, setChannel] = useState("#office-archive");
  const archived = channel === "#office-archive";
  // Which select the readout follows, and whether its menu is open.
  const [active, setActive] = useState<{ which: "model" | "retry" | "channel"; open: boolean }>({ which: "model", open: false });
  const state: Pairs =
    active.which === "model"
      ? [["model", `"${model}"`], ["open", String(active.open)]]
      : active.which === "retry"
        ? [["onFailure", `"${retry}"`], ["open", String(active.open)]]
        : [["postTo", `"${channel}"`], ["invalid", String(archived)], ["open", String(active.open)]];

  return (
    <Section
      id="select"
      title="Select"
      lede={`Use a select to pick one value from a known list. Arrows move, Enter picks, Escape backs out, and typing jumps to a match. Options can carry a description, so no one guesses what "Balanced" means.`}
    >
      <Spec name="listbox with descriptions, simple, error" state={state} layout="left" canvasClassName="min-h-[220px]">
        <Select
          className="max-w-80"
          label="Model"
          hint="You can change this per run."
          value={model}
          showMeta
          onValueChange={setModel}
          onOpenChange={(open) => setActive({ which: "model", open })}
          groups={[
            {
              label: "Speed and depth",
              options: [
                { value: "Quick", label: "Quick", description: "Short replies, lowest cost. Good for triage.", meta: "fast" },
                { value: "Balanced", label: "Balanced", description: "Plans before acting. The default for most agents.", meta: "mid" },
                { value: "Thorough", label: "Thorough", description: "Reads widely and double-checks. Slower.", meta: "deep" },
              ],
            },
            { options: [{ value: "BYO", label: "Your own endpoint", description: "Route calls through a provider you configure.", meta: "byo" }] },
          ]}
        />
        <Select
          className="max-w-[240px]"
          label="On failure"
          value={retry}
          onValueChange={setRetry}
          onOpenChange={(open) => setActive({ which: "retry", open })}
          groups={[
            {
              options: [
                { value: "Stop and notify me", label: "Stop and notify me" },
                { value: "Retry 3 times", label: "Retry 3 times" },
                { value: "Retry until it works", label: "Retry until it works" },
              ],
            },
          ]}
        />
        <Select
          className="max-w-[240px]"
          label="Post results to"
          name="channel"
          value={channel}
          error={archived ? "#office-archive is archived. Pick another channel." : undefined}
          onValueChange={setChannel}
          onOpenChange={(open) => setActive({ which: "channel", open })}
          groups={[
            {
              options: [
                { value: "#office", label: "#office" },
                { value: "#office-archive", label: "#office-archive" },
                { value: "#lunch-crew", label: "#lunch-crew" },
              ],
            },
          ]}
        />
      </Spec>
    </Section>
  );
}

/* =========================================================
   Card
   ========================================================= */

export function CardSection() {
  const rows: [string, number, number, string][] = [
    ["Model calls", 18, 62, "1.8h"],
    ["Tools", 9, 40, "0.9h"],
    ["Awaiting you", 1, 88, "0.1h"],
  ];
  return (
    <Section
      id="card"
      title="Card"
      lede="Use a card to hold one thing and its actions. A dashed rule separates what it is from what you can do with it. No shadow at rest; only a card you can open lifts."
    >
      <div className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-1">
        <Card link aria-label="lunch-picker agent">
          <CardBody>
            <CardHead>
              <CardIcon>
                <LightningIcon />
              </CardIcon>
              <div>
                <CardTitle>lunch-picker</CardTitle>
                <CardSub>3 tools · 2 schedules</CardSub>
              </div>
            </CardHead>
            <CardText>Collects votes each morning and announces the office lunch order at 11:30.</CardText>
          </CardBody>
          <CardFoot>
            <Badge tone="ok" dot>
              Healthy
            </Badge>
            <div className="flex-1" />
            <IconButton label="Settings" icon={<GearIcon />} />
          </CardFoot>
        </Card>

        <Card>
          <CardBody>
            <CardHead>
              <CardIcon>
                <DatabaseIcon />
              </CardIcon>
              <div>
                <CardTitle>Time billed this week</CardTitle>
                <CardSub>you pay for active time only</CardSub>
              </div>
            </CardHead>
            <div aria-label="Active versus waiting time" className="mt-4 flex flex-col gap-2.5">
              {rows.map(([n, billed, waiting, h]) => (
                <div key={n} className="grid grid-cols-[78px_1fr_52px] items-center gap-2.5 text-caption text-ink-3">
                  <span>{n}</span>
                  <span className="flex h-2 overflow-hidden rounded-[2px] bg-sunken">
                    <b className="block h-full bg-ink" style={{ width: `${billed}%` }} />
                    <s
                      className="block h-full bg-[repeating-linear-gradient(-45deg,var(--line-strong)_0_2px,transparent_2px_5px)] no-underline"
                      style={{ width: `${waiting}%` }}
                    />
                  </span>
                  <span className="text-right text-ink-2 tabular-nums">{h}</span>
                </div>
              ))}
            </div>
          </CardBody>
          <CardFoot>
            <Hint className="text-caption">Solid is billed, hatched is waiting.</Hint>
          </CardFoot>
        </Card>

        <Card empty>
          <CardIcon>
            <PlugIcon />
          </CardIcon>
          <CardTitle>No tools connected</CardTitle>
          <CardText>Give this agent a way to act, like a browser, a database, or your inbox.</CardText>
          <Button variant="secondary" icon={<PlusIcon />}>
            Connect a tool
          </Button>
        </Card>
      </div>
    </Section>
  );
}

/* =========================================================
   Radio
   ========================================================= */

const diagram = (children: React.ReactNode) => (
  <svg viewBox="0 0 120 44" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-11 w-full">
    {children}
  </svg>
);

export function RadioSection() {
  const [sched, setSched] = useState("Every hour");
  const [place, setPlace] = useState("Near the user");
  return (
    <Section
      id="radio"
      title="Radio"
      lede="Use radios for one choice among a few. The list is compact; cards suit choices a picture explains better. Arrow keys move between options."
    >
      <Spec
        name="list, cards"
        state={[["schedule", `"${sched}"`], ["place", `"${place}"`]]}
        canvasClassName="items-start gap-12"
      >
        <ChoiceList legend="Run schedule">
          <RadioGroup value={sched} onValueChange={(v) => setSched(v as string)}>
            <RadioChoice value="On demand" label="On demand" description="Only when you or another agent starts it." />
            <RadioChoice value="Every hour" label="Every hour" description="On the hour, around the clock." />
            <RadioChoice value="Weekdays at 11:30" label="Weekdays at 11:30" description="In the workspace time zone." />
            <RadioChoice value="On new email" label="When an email arrives" description="Connect an inbox to enable." disabled />
          </RadioGroup>
        </ChoiceList>
        <ChoiceList legend="Where it runs" className="min-w-[min(100%,460px)] flex-1">
          <RadioGroup value={place} onValueChange={(v) => setPlace(v as string)} className="grid w-full grid-cols-3 gap-3 max-[860px]:grid-cols-1">
            <RadioCard
              value="Near the user"
              label="Near the user"
              description="Lowest latency for chat and voice."
              picture={diagram(
                <>
                  <circle cx="20" cy="22" r="6" />
                  <circle className="hi" cx="46" cy="22" r="6" />
                  <circle cx="100" cy="22" r="4" strokeDasharray="2 2" />
                  <path d="M26 22h14" />
                </>,
              )}
            />
            <RadioCard
              value="Pinned region"
              label="Pinned region"
              description="Stays in one place for compliance."
              picture={diagram(
                <>
                  <circle cx="20" cy="22" r="6" />
                  <circle className="hi" cx="100" cy="22" r="6" />
                  <path d="M26 22h68" strokeDasharray="3 3" />
                </>,
              )}
            />
            <RadioCard
              value="Next to the data"
              label="Next to the data"
              description="Beside the database it reads most."
              picture={diagram(
                <>
                  <rect x="88" y="14" width="18" height="16" rx="3" />
                  <circle className="hi" cx="80" cy="22" r="6" />
                  <circle cx="20" cy="22" r="6" />
                  <path d="M26 22h48" />
                </>,
              )}
            />
          </RadioGroup>
        </ChoiceList>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Checkbox
   ========================================================= */

export function CheckboxSection() {
  const [agreed, setAgreed] = useState(false);
  const [tried, setTried] = useState(false);
  const agreeError = tried && !agreed ? "Agree to the data processing terms to continue." : undefined;
  return (
    <Section
      id="checkbox"
      title="Checkbox"
      lede="Use checkboxes for independent on/off choices, each with a label you can click. When a choice is required, say what to do in the error, not just that something is missing."
    >
      <Spec name="states" state={[["states", "unchecked, checked, disabled, disabled checked"]]}>
        <ChoiceList legend="Notifications" className="w-full max-w-[360px]">
          <CheckboxChoice label="Email me when a run fails" description="Sent to the workspace owner." />
          <CheckboxChoice label="Post run summaries to Slack" description="In #agent-runs." defaultChecked />
          <CheckboxChoice label="Text me for failed deploys" description="Needs a verified phone number." disabled />
          <CheckboxChoice label="Weekly usage report" description="Required on your plan." defaultChecked disabled />
        </ChoiceList>
      </Spec>
      <Spec name="required, with an error" state={[["agreed", String(agreed)], ["error", agreeError ? "shown" : "none"]]}>
        <div className="flex w-full max-w-[360px] flex-col gap-3">
          <CheckboxChoice
            label="I agree to the data processing terms"
            description="Run inputs are stored for 30 days to debug failures."
            checked={agreed}
            onCheckedChange={(c) => setAgreed(c)}
            error={agreeError}
          />
          <div className="px-2">
            <Button variant="primary" onClick={() => setTried(true)}>
              Continue
            </Button>
          </div>
        </div>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Tooltip
   ========================================================= */

export function TooltipSection() {
  const [open, setOpen] = useState<Pairs>([["open", "null"]]);
  const track = (label: string, kbd?: string) => (o: boolean) =>
    setOpen(o ? [["open", `"${label}"`], ...(kbd ? ([["keys", kbd]] as Pairs) : [])] : [["open", "null"]]);

  const tools: [string, React.ReactNode, string?, string?][] = [
    ["Undo", <ArrowCounterClockwiseIcon key="u" />, "⌘ Z"],
    ["Redo", <ArrowClockwiseIcon key="r" />, "⇧ ⌘ Z"],
    ["Copy link", <LinkIcon key="l" />, "⌘ L", "Copy link to this run"],
    ["Branch", <GitBranchIcon key="b" />, undefined, "Try this from a new branch"],
    ["Settings", <GearIcon key="g" />, "⌘ ,"],
  ];

  return (
    <Section
      id="tooltip"
      title="Tooltip"
      lede="Use a tooltip to name a control that has no room for a label, with its shortcut. The first waits 400ms; neighbours then open instantly, so scanning a toolbar is fast. Keyboard focus shows them too."
    >
      <Spec name="icon labels with keys, inline definition" state={open} canvasClassName="gap-12">
        <Toolbar aria-label="Editor actions">
          {tools.map(([label, icon, kbd, tip], i) => (
            <span key={label} className="contents">
              {i === 2 && <ToolbarSeparator />}
              <ToolbarButton
                render={<IconButton label={label} tip={tip} kbd={kbd} icon={icon} onTipOpenChange={track(tip ?? label, kbd)} />}
              />
            </span>
          ))}
        </Toolbar>
        <p className="m-0 max-w-[34ch] text-control text-ink-2">
          Agents stay asleep between messages and resume with their{" "}
          <Tooltip
            label="State that survives restarts and redeploys, stored beside the agent."
            onOpenChange={track("State that survives restarts and redeploys, stored beside the agent.")}
          >
            <span tabIndex={0} className="cursor-help rounded-[2px] border-b border-dashed border-ink-3">
              durable state
            </span>
          </Tooltip>{" "}
          intact.
        </p>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Tabs
   ========================================================= */

const TAB_LABELS: Record<string, string> = { overview: "Overview", logs: "Logs", changes: "Changes", settings: "Settings" };

export function TabsSection() {
  const [tab, setTab] = useState("overview");
  const idx = Object.keys(TAB_LABELS).indexOf(tab);
  return (
    <Section
      id="tabs"
      title="Tabs"
      lede="Use tabs to switch between views of the same thing. The ink bar slides to the new tab, so you see where you came from. Arrows move and select; Home and End jump to the ends."
    >
      <Spec
        name="underline tabs with counts"
        state={[["selected", `"${TAB_LABELS[tab]}"`], ["index", String(idx)]]}
        trackMotion
        layout="left"
        canvasClassName="min-h-[260px]"
      >
        <Tabs className="max-w-[620px]" value={tab} onValueChange={(v) => setTab(v as string)}>
          <TabList aria-label="Run details">
            <Tab value="overview">Overview</Tab>
            <Tab value="logs" count={128}>
              Logs
            </Tab>
            <Tab value="changes" count={3}>
              Changes
            </Tab>
            <Tab value="settings">Settings</Tab>
          </TabList>
          <TabPanel value="overview">
            <dl className="m-0 grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 text-control [&_dd]:m-0 [&_dd]:text-ink [&_dt]:text-ink-3">
              <dt>Started</dt>
              <dd>Today, 11:30</dd>
              <dt>Duration</dt>
              <dd className="tabular-nums">2m 41s</dd>
              <dt>Billed time</dt>
              <dd className="tabular-nums">184ms</dd>
              <dt>Result</dt>
              <dd>Posted the lunch order to #office</dd>
            </dl>
          </TabPanel>
          <TabPanel value="logs">
            <pre className="mono m-0 overflow-x-auto rounded-control border border-line bg-sunken px-3 py-2 text-code leading-[1.9] text-ink-2">
              <span className="text-ink-3">11:30:00</span>  schedule fired  chooseLunch{"\n"}
              <span className="text-ink-3">11:30:01</span>  read 9 votes from state{"\n"}
              <span className="text-ink-3">11:30:02</span>  <span className="text-danger">tool timeout</span>  menu-lookup (retrying 1/3){"\n"}
              <span className="text-ink-3">11:30:04</span>  <span className="text-success">ok</span>  winner: "Dosa Corner"
            </pre>
          </TabPanel>
          <TabPanel value="changes">
            Three fields changed in state: <code className="text-code">todaysVotes</code>, <code className="text-code">todaysRuling</code>, and{" "}
            <code className="text-code">lastRunAt</code>.
          </TabPanel>
          <TabPanel value="settings">
            Settings for this run are inherited from the agent. Change them on the agent page to affect future runs.
          </TabPanel>
        </Tabs>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Dialog
   ========================================================= */

export function DialogSection() {
  const [state, setState] = useState<Pairs>([["open", "false"], ["confirmed", "false"]]);
  const confirmed = useRef(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [agentName, setAgentName] = useState("lunch-picker");
  const [saved, setSaved] = useState("lunch-picker");
  return (
    <Section
      id="dialog"
      title="Dialog"
      lede="Use a dialog for a focused task you can walk away from; Escape, the backdrop and the close button dismiss it. Use an alert dialog for a decision that can't wait. Both trap focus and return it."
    >
      <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
        <Spec name="dialog: a dismissible task" state={[["open", String(settingsOpen)], ["name", `"${saved}"`]]}>
          <Dialog
            size="sm"
            open={settingsOpen}
            onOpenChange={(open) => {
              setSettingsOpen(open);
              if (open) setAgentName(saved);
            }}
            trigger={
              <Button variant="secondary" icon={<GearIcon />}>
                Agent settings…
              </Button>
            }
            title="Agent settings"
            description="Changes apply from the next run."
            footer={
              <>
                <DialogClose render={<Button variant="secondary">Cancel</Button>} />
                <Button
                  variant="primary"
                  type="submit"
                  form="agent-settings"
                  disabled={!agentName.trim()}
                >
                  Save changes
                </Button>
              </>
            }
          >
            <form
              id="agent-settings"
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!agentName.trim()) return;
                setSaved(agentName.trim());
                setSettingsOpen(false);
                toast("Settings saved", { tone: "success" });
              }}
            >
              <Field label="Agent name" hint="Lowercase letters, numbers and dashes.">
                <Input value={agentName} onValueChange={(v: string) => setAgentName(v)} autoComplete="off" spellCheck={false} />
              </Field>
              <CheckboxChoice label="Notify me when a run fails" defaultChecked />
            </form>
          </Dialog>
        </Spec>
        <Spec name="alert dialog: destructive confirm" state={state}>
          <DestructiveDialog
            trigger={
              <Button variant="danger" icon={<TrashIcon />}>
                Delete lunch-picker…
              </Button>
            }
            name="lunch-picker"
            title="Delete lunch-picker?"
            description="This permanently removes the agent and everything it remembers. It can't be undone."
            consequences={["All stored state, including 212 past votes", "2 scheduled runs", "The public URL /agents/lunch-picker"]}
            confirmLabel="Delete lunch-picker"
            cancelLabel="Keep agent"
            onOpenChange={(open) => {
              if (open) confirmed.current = false;
              setState([["open", String(open)], ["confirmed", String(confirmed.current)]]);
            }}
            onTyped={(typed) =>
              setState([["open", "true"], ["typed", `"${typed}"`], ["unlocked", String(typed === "lunch-picker")]])
            }
            onConfirm={() => {
              confirmed.current = true;
              setState([["open", "false"], ["confirmed", "true"]]);
              toast("lunch-picker deleted", {
                action: {
                  label: "Undo",
                  onClick: () => {
                    setState([["open", "false"], ["confirmed", "true"], ["restored", "true"]]);
                    toast("lunch-picker restored", { tone: "success" });
                  },
                },
              });
            }}
          />
        </Spec>
      </div>
    </Section>
  );
}

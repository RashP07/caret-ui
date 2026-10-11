import {
  ChartBarIcon,
  CpuIcon,
  GearSixIcon,
  KeyIcon,
  PlusIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardFoot,
  CardText,
  CardTitle,
  CheckboxChoice,
  ChoiceList,
  Crumbs,
  DestructiveDialog,
  Dialog,
  DialogClose,
  Field,
  Form,
  FormActions,
  Input,
  KeyValue,
  KeyValueItem,
  Meter,
  MenuLabel,
  NavGroup,
  NavItem,
  NumberField,
  RadioCard,
  RadioGroup,
  Select,
  Slider,
  SwitchChoice,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  toast,
} from "@/components";
import { cn } from "@/lib/cn";
import { ThemeScope } from "@/lib/theme";
import {
  BRANCHES,
  COST_BY_AGENT,
  KEYS,
  newSecret,
  plural,
  relative,
  SCOPE_LABEL,
  SCOPES,
  SECTIONS,
  TIMEZONES,
  TOOLS,
  type ApiKey,
  type Section,
} from "./settings-data";

/*
 * Template: workspace settings. A section list on the left, the section on the right: two flush
 * columns split by one hairline, under one 44px header row, like the agent workspace. Under 760px
 * (its own width, not the viewport's) the list folds into a Select in the header.
 *
 * Layout only. Every piece is an existing Caret component: NavItem, Form, Field, Input, Textarea,
 * Select, SwitchChoice, RadioCard, Slider, NumberField, CheckboxChoice, Table, Dialog,
 * DestructiveDialog, Meter, Callout, KeyValue, Card. The classes here are grid, flex, gap,
 * padding, width, overflow and the rules between regions.
 *
 * Two kinds of setting, kept apart on purpose: fields that are saved together sit in a Form with a
 * Save button; switches apply the moment they flip and say so with a toast.
 */

const SIDE = 232;
/** Every column's header: 44px, border-box, so the bottom lines are one. */
const HEAD = "flex h-11 flex-none items-center gap-1 border-b border-line";

const ICONS: Record<Section, ReactNode> = {
  general: <GearSixIcon />,
  models: <CpuIcon />,
  keys: <KeyIcon />,
  usage: <ChartBarIcon />,
  danger: <WarningIcon />,
};

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

/** A section's title and what it covers. */
function SectionHead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className="flex flex-col gap-1">
      <h2 className="m-0 text-title font-heading">{title}</h2>
      <p className="m-0 text-small text-ink-2">{children}</p>
    </header>
  );
}

export function Settings({ className }: { className?: string }) {
  const [rootRef, width] = useWidth<HTMLDivElement>();
  const narrow = width !== null && width <= 760;
  const [section, setSection] = useState<Section>("general");
  const bodyRef = useRef<HTMLDivElement>(null);
  const label = SECTIONS.find((s) => s.value === section)!.label;

  function go(next: Section) {
    setSection(next);
    bodyRef.current?.scrollTo({ top: 0 });
  }

  return (
    <ThemeScope
      ref={rootRef}
      role="region"
      aria-label="Workspace settings"
      className={cn(
        "relative grid h-full min-h-0 overflow-hidden border border-line bg-page text-ink",
        narrow ? "grid-cols-[minmax(0,1fr)]" : "grid-cols-[var(--side)_minmax(0,1fr)]",
        className,
      )}
      style={{ "--side": `${SIDE}px` } as React.CSSProperties}
    >
      {/* ---------- section list ---------- */}
      {!narrow && (
        <aside aria-label="Settings sections" className="flex min-h-0 min-w-0 flex-col border-r border-line bg-surface">
          <div className={cn(HEAD, "ps-3.5 pe-1.5")}>
            <span className="truncate text-control font-control">Settings</span>
          </div>
          <nav aria-label="Settings" className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto p-2">
            <NavGroup>
              <MenuLabel>acme-agents</MenuLabel>
              {SECTIONS.map((s) => (
                <NavItem key={s.value} icon={ICONS[s.value]} current={section === s.value} onClick={() => go(s.value)}>
                  {s.label}
                </NavItem>
              ))}
            </NavGroup>
          </nav>
        </aside>
      )}

      {/* ---------- the section ---------- */}
      <section aria-label={label} className="flex min-h-0 min-w-0 flex-col">
        <header className={cn(HEAD, "ps-3.5 pe-1.5")}>
          {narrow ? (
            <Select
              className="min-w-0 max-w-60 flex-1"
              label="Settings section"
              hideLabel
              density="compact"
              value={section}
              onValueChange={go}
              groups={[{ options: SECTIONS }]}
              lead={<span className="flex text-ink-3 [&_svg]:size-3.5">{ICONS[section]}</span>}
            />
          ) : (
            <Crumbs items={["acme-agents", "Settings", label]} hideOnSmall={[0]} />
          )}
        </header>
        <div ref={bodyRef} className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pt-8 pb-12", narrow && "px-4 pt-5 pb-8")}>
          {/* Keyed by section: each opens at its own top with fresh dialogs. */}
          <div key={section} className="mx-auto flex w-full max-w-[720px] flex-col gap-8">
            {section === "general" && <General />}
            {section === "models" && <Models />}
            {section === "keys" && <Keys />}
            {section === "usage" && <Usage />}
            {section === "danger" && <Danger />}
          </div>
        </div>
      </section>
    </ThemeScope>
  );
}

/* =========================================================
   General
   ========================================================= */

function validateName(value: unknown) {
  const v = String(value ?? "").trim();
  if (!v) return "Give the workspace a name.";
  if (v.length < 3) return "Use at least 3 characters.";
  return null;
}

function validateSlug(value: unknown) {
  const v = String(value ?? "");
  if (!v) return "Pick a URL. It's where people find this workspace.";
  if (!/^[a-z0-9-]+$/.test(v)) return "Use lowercase letters, numbers and dashes only.";
  return null;
}

const SAVED = {
  name: "Acme agents",
  slug: "acme-agents",
  instructions:
    "You work on Acme's internal tools. Keep changes small, write a test for every fix, and open a pull request instead of pushing to main.",
  branch: "main",
  zone: "Europe/London",
};

function General() {
  const [saved, setSaved] = useState(SAVED);
  const [name, setName] = useState(saved.name);
  const [slug, setSlug] = useState(saved.slug);
  const [instructions, setInstructions] = useState(saved.instructions);
  const [branch, setBranch] = useState(saved.branch);
  const [zone, setZone] = useState(saved.zone);
  const dirty =
    name !== saved.name || slug !== saved.slug || instructions !== saved.instructions || branch !== saved.branch || zone !== saved.zone;

  function revert() {
    setName(saved.name);
    setSlug(saved.slug);
    setInstructions(saved.instructions);
    setBranch(saved.branch);
    setZone(saved.zone);
  }
  const [askShell, setAskShell] = useState(true);
  const [mailFailures, setMailFailures] = useState(true);
  const [digest, setDigest] = useState(false);

  const flip = (set: (on: boolean) => void, what: string) => (on: boolean) => {
    set(on);
    toast(on ? `${what} on` : `${what} off`);
  };

  return (
    <>
      <SectionHead title="General">The workspace's name, where it lives, and what every agent reads before it starts.</SectionHead>

      <KeyValue>
        <KeyValueItem label="Workspace ID" mono copy="ws_01hz3k8q2v" copyLabel="Copy workspace ID">
          ws_01hz3k8q2v
        </KeyValueItem>
        <KeyValueItem label="Region">Frankfurt (eu-central)</KeyValueItem>
        <KeyValueItem label="Created">{new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(2026, 2, 14))}</KeyValueItem>
      </KeyValue>

      <Form
        onFormSubmit={() => {
          setSaved({ name, slug, instructions, branch, zone });
          toast("Settings saved", { tone: "success" });
        }}
      >
        <Field name="name" label="Workspace name" count={`${name.length}/32`} hint="Shown in the sidebar and on invites." validate={validateName}>
          <Input value={name} maxLength={32} autoComplete="off" onValueChange={(v: string) => setName(v)} />
        </Field>
        <Field name="slug" label="URL" hint="Lowercase letters, numbers and dashes. Old links redirect for 30 days." validate={validateSlug}>
          <Input affix="caret.app/" value={slug} autoComplete="off" spellCheck={false} onValueChange={(v: string) => setSlug(v)} />
        </Field>
        <Field
          name="instructions"
          label="Default instructions"
          optional
          count={`${instructions.length.toLocaleString("en-US")}/2,000`}
          hint="Every agent reads this first, before its own instructions and your message."
        >
          <Textarea rows={4} maxRows={10} maxLength={2000} value={instructions} onValueChange={setInstructions} />
        </Field>
        <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
          <Select name="branch" label="Default branch" hint="Agents branch from here." value={branch} onValueChange={setBranch} groups={BRANCHES} />
          <Select name="zone" label="Time zone" hint="For schedules and reports." value={zone} onValueChange={setZone} groups={TIMEZONES} showMeta />
        </div>
        <FormActions>
          <Button variant="ghost" type="button" disabled={!dirty} onClick={revert}>
            Discard changes
          </Button>
          <Button variant="primary" type="submit" disabled={!dirty}>
            Save changes
          </Button>
        </FormActions>
      </Form>

      {/* Switches apply as they flip: outside the form, no Save. */}
      <ChoiceList legend="Notifications and safety">
        <SwitchChoice
          label="Ask before shell commands"
          description="Agents pause and wait for you before running a command outside the sandbox."
          checked={askShell}
          onCheckedChange={flip(setAskShell, "Ask before shell commands")}
        />
        <SwitchChoice
          label="Email me when a run fails"
          description="Sent to the workspace owner, once per run."
          checked={mailFailures}
          onCheckedChange={flip(setMailFailures, "Failure emails")}
        />
        <SwitchChoice
          label="Weekly digest"
          description="Runs, cost and the slowest agents, every Monday."
          checked={digest}
          onCheckedChange={flip(setDigest, "Weekly digest")}
        />
      </ChoiceList>
    </>
  );
}

/* =========================================================
   Models
   ========================================================= */

function Models() {
  const [model, setModel] = useState("balanced");
  const [creativity, setCreativity] = useState(0.4);
  const [maxTokens, setMaxTokens] = useState<number | null>(64000);
  const [tools, setTools] = useState<string[]>(["shell", "edit"]);

  return (
    <>
      <SectionHead title="Models">Which model agents use by default, and what they may do on their own.</SectionHead>

      <Callout tone="info" title="Changes apply from the next run">
        Runs already in progress keep the settings they started with.
      </Callout>

      <RadioGroup aria-label="Default model" value={model} onValueChange={(v) => setModel(v as string)} className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
        <RadioCard value="quick" label="Quick" description="Short answers, lowest cost. Good for triage and lookups." meta={<Badge>$</Badge>} />
        <RadioCard value="balanced" label="Balanced" description="Plans before acting. The right default for most agents." meta={<Badge>$$</Badge>} />
        <RadioCard value="thorough" label="Thorough" description="Reads more of the codebase first. Slower, for hard changes." meta={<Badge>$$$</Badge>} />
      </RadioGroup>

      <div className="grid grid-cols-2 items-start gap-6 max-[560px]:grid-cols-1">
        <Slider
          label="Creativity"
          hint="Lower keeps answers predictable; higher tries more ideas."
          value={creativity}
          onValueChange={setCreativity}
          min={0}
          max={1}
          step={0.1}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        <NumberField
          label="Token limit per run"
          hint="The run stops and asks before it goes over."
          unit="tokens"
          value={maxTokens}
          onValueChange={setMaxTokens}
          min={4000}
          max={200000}
          step={4000}
          largeStep={20000}
        />
      </div>

      <ChoiceList legend="Agents may, without asking">
        {TOOLS.map((t) => (
          <CheckboxChoice
            key={t.value}
            label={t.label}
            description={t.description}
            checked={tools.includes(t.value)}
            onCheckedChange={(on) => setTools((all) => (on ? [...all, t.value] : all.filter((v) => v !== t.value)))}
          />
        ))}
      </ChoiceList>

      <FormActions>
        <Button variant="primary" onClick={() => toast("Model settings saved", { tone: "success", description: "They apply from the next run." })}>
          Save model settings
        </Button>
      </FormActions>
    </>
  );
}

/* =========================================================
   API keys
   ========================================================= */

function Keys() {
  const [keys, setKeys] = useState<ApiKey[]>(KEYS);
  const [creating, setCreating] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [scope, setScope] = useState("run");
  const [fresh, setFresh] = useState<{ name: string; secret: string } | null>(null);
  const [expiring, setExpiring] = useState(true);

  function create(name: string, scopeValue: string) {
    const secret = newSecret();
    setKeys((all) => [{ id: secret, name, prefix: secret.slice(0, 13), scope: scopeValue, created: 0, lastUsed: null }, ...all]);
    setFresh({ name, secret });
  }

  function revoke(k: ApiKey) {
    const at = keys.indexOf(k);
    setKeys((all) => all.filter((x) => x.id !== k.id));
    if (fresh?.name === k.name) setFresh(null);
    toast(`Revoked ${k.name}`, {
      action: { label: "Undo", onClick: () => setKeys((all) => [...all.slice(0, at), k, ...all.slice(at)]) },
    });
  }

  function rotate() {
    const old = keys.find((k) => k.name === "ci-runner");
    if (old) setKeys((all) => all.filter((k) => k.id !== old.id));
    create("ci-runner", old?.scope ?? "run");
    setExpiring(false);
  }

  const createDialog = (
    <Dialog
      size="sm"
      open={creating}
      onOpenChange={(o) => {
        setCreating(o);
        if (o) {
          setKeyName("");
          setScope("run");
        }
      }}
      trigger={
        <Button variant="secondary" icon={<PlusIcon />}>
          Create key
        </Button>
      }
      title="Create an API key"
      description="You'll see the key once, right after you create it."
      footer={
        <>
          <DialogClose render={<Button variant="secondary">Cancel</Button>} />
          <Button variant="primary" type="submit" form="create-key">
            Create key
          </Button>
        </>
      }
    >
      <Form
        id="create-key"
        onFormSubmit={() => {
          create(keyName.trim(), scope);
          setCreating(false);
        }}
      >
        <Field
          name="keyName"
          label="Name"
          hint="Say where it's used, so you know what breaks if you revoke it."
          validate={(v) => {
            const s = String(v ?? "").trim();
            if (!s) return "Give the key a name.";
            if (keys.some((k) => k.name === s)) return `A key named ${s} already exists. Pick another name.`;
            return null;
          }}
        >
          <Input autoComplete="off" spellCheck={false} placeholder="ci-runner" value={keyName} onValueChange={(v: string) => setKeyName(v)} />
        </Field>
        <Select label="Access" value={scope} onValueChange={setScope} groups={SCOPES} />
      </Form>
    </Dialog>
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHead title="API keys">Keys let scripts and CI start agents and read their runs.</SectionHead>
        {createDialog}
      </div>

      {expiring && (
        <Callout
          tone="warning"
          title="ci-runner expires in 3 days"
          action={
            <Button size="sm" variant="secondary" onClick={rotate}>
              Rotate key
            </Button>
          }
        >
          Rotating makes a new key and revokes the old one. Update your CI secrets right after.
        </Callout>
      )}

      {fresh && (
        <Callout tone="success" title={`Copy the key for ${fresh.name} now`} onDismiss={() => setFresh(null)}>
          <span className="block">It won't be shown again. If you lose it, revoke it and create another.</span>
          <KeyValue layout="stack" className="mt-1">
            <KeyValueItem label="Secret key" mono copy={fresh.secret} copyLabel={`Copy key for ${fresh.name}`}>
              {fresh.secret}
            </KeyValueItem>
          </KeyValue>
        </Callout>
      )}

      <Table aria-label="API keys" caption={plural(keys.length, "key", "keys")} hideCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Access</TableHead>
            <TableHead align="end">Last used</TableHead>
            <TableHead align="end">
              <span className="sr-only-caret">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.length === 0 ? (
            <TableEmpty
              colSpan={5}
              icon={<KeyIcon />}
              title="No API keys"
              description="Create one to start agents from a script or CI."
              action={
                <Button variant="secondary" icon={<PlusIcon />} onClick={() => setCreating(true)}>
                  Create key
                </Button>
              }
            />
          ) : (
            keys.map((k) => (
              <TableRow key={k.id}>
                <TableCell truncate className="min-w-28 font-control">
                  {k.name}
                </TableCell>
                <TableCell className="mono text-ink-2">{k.prefix}…</TableCell>
                <TableCell>
                  <Badge tone={k.scope === "admin" ? "warning" : "neutral"}>{SCOPE_LABEL[k.scope]}</Badge>
                </TableCell>
                <TableCell numeric className="text-ink-3">
                  {k.lastUsed == null ? "Never" : relative(k.lastUsed)}
                </TableCell>
                <TableCell align="end">
                  <DestructiveDialog
                    trigger={
                      <Button size="sm" variant="ghost" icon={<TrashIcon />}>
                        Revoke
                      </Button>
                    }
                    name={k.name}
                    title={`Revoke ${k.name}?`}
                    description="Anything using this key stops working at once."
                    consequences={[
                      "Requests with this key are refused",
                      k.lastUsed == null ? "It has never been used" : `It was last used ${relative(k.lastUsed)}`,
                    ]}
                    confirmLabel="Revoke key"
                    cancelLabel="Keep key"
                    onConfirm={() => revoke(k)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}

/* =========================================================
   Usage
   ========================================================= */

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function Usage() {
  const calls = 4420;
  const limit = 5000;
  const hot = calls / limit >= 0.85;
  const total = COST_BY_AGENT.reduce((a, r) => ({ runs: a.runs + r.runs, calls: a.calls + r.calls, cost: a.cost + r.cost }), { runs: 0, calls: 0, cost: 0 });

  return (
    <>
      <SectionHead title="Usage">This month so far. Limits reset on the 1st.</SectionHead>

      {hot && (
        <Callout
          tone="danger"
          title={`${Math.round((calls / limit) * 100)}% of this month's model calls used`}
          action={
            <Button size="sm" variant="secondary" onClick={() => toast("Limit raised to 10,000 calls", { tone: "success" })}>
              Raise limit
            </Button>
          }
        >
          New runs pause at {limit.toLocaleString("en-US")} calls until the 1st. Runs in progress finish.
        </Callout>
      )}

      <div className="grid grid-cols-2 gap-6 max-[560px]:grid-cols-1">
        <Meter
          label="Model calls"
          value={calls}
          max={limit}
          valueText={(v) => `${v.toLocaleString("en-US")} / ${limit.toLocaleString("en-US")}`}
          hint="Resets on the 1st."
          hotHint="Nearly out."
        />
        <Meter label="Run storage" value={38} max={100} valueText={(v) => `${v} / 100 MB`} hint="Logs older than 30 days are pruned first." />
      </div>

      <Table aria-label="Cost by agent" caption="Cost by agent, this month" hideCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead align="end">Runs</TableHead>
            <TableHead align="end">Model calls</TableHead>
            <TableHead align="end">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {COST_BY_AGENT.map((r) => (
            <TableRow key={r.name}>
              <TableCell truncate className="mono min-w-32">
                {r.name}
              </TableCell>
              <TableCell numeric>{r.runs.toLocaleString("en-US")}</TableCell>
              <TableCell numeric>{r.calls.toLocaleString("en-US")}</TableCell>
              <TableCell numeric>{money.format(r.cost)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-control">Total</TableCell>
            <TableCell numeric>{total.runs.toLocaleString("en-US")}</TableCell>
            <TableCell numeric>{total.calls.toLocaleString("en-US")}</TableCell>
            <TableCell numeric className="font-control">
              {money.format(total.cost)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}

/* =========================================================
   Danger zone
   ========================================================= */

function Danger() {
  const [deleted, setDeleted] = useState(false);

  if (deleted)
    return (
      <Card empty>
        <CardTitle>acme-agents is scheduled for deletion</CardTitle>
        <CardText>Everything is removed in 30 days. Until then, the owner can restore it from the account page.</CardText>
        <Button variant="secondary" onClick={() => setDeleted(false)}>
          Restore workspace
        </Button>
      </Card>
    );

  return (
    <>
      <SectionHead title="Danger zone">Changes here affect everyone in the workspace, and some can't be undone.</SectionHead>

      <Card>
        <CardBody>
          <CardTitle>Export workspace data</CardTitle>
          <CardText className="mt-1">Agents, instructions, run history and logs, as one archive. We email a link when it's ready.</CardText>
        </CardBody>
        <CardFoot>
          <div className="flex-1" />
          <Button variant="secondary" onClick={() => toast("Export started", { description: "We'll email a link when it's ready." })}>
            Export data
          </Button>
        </CardFoot>
      </Card>

      <Card>
        <CardBody>
          <CardTitle>Delete this workspace</CardTitle>
          <CardText className="mt-1">Stops every agent and removes the workspace for all members after 30 days.</CardText>
        </CardBody>
        <CardFoot>
          <div className="flex-1" />
          <DestructiveDialog
            trigger={
              <Button variant="danger" icon={<TrashIcon />}>
                Delete workspace
              </Button>
            }
            name="acme-agents"
            title="Delete acme-agents?"
            description="Every agent stops now. The workspace is removed for all members in 30 days."
            consequences={[`${plural(3, "agent", "agents")} and their schedules`, `${plural(538, "run", "runs")} and their logs`, `${plural(KEYS.length, "API key", "API keys")}`]}
            confirmLabel="Delete workspace"
            cancelLabel="Keep workspace"
            onConfirm={() => {
              setDeleted(true);
              toast("Deleted acme-agents", { tone: "danger", description: "You can restore it for 30 days." });
            }}
          />
        </CardFoot>
      </Card>
    </>
  );
}

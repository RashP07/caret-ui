import { GitBranchIcon, TerminalIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import {
  Autocomplete,
  Button,
  Combobox,
  Field,
  Form,
  FormActions,
  Input,
  MultiCombobox,
  NumberField,
  OTPField,
  Slider,
  SwitchChoice,
  toast,
  type SelectOption,
} from "@/components";
import { Section, Spec, type Pairs } from "./spec";

/* =========================================================
   Switch
   ========================================================= */

const SETTINGS = [
  ["runOnPush", "Run on every push", "Starts a run when main changes. Takes effect now."],
  ["postResults", "Post results to #office", "One message per run, threaded under the first."],
  ["openPRs", "Let the agent open pull requests", "It never merges; you review every change."],
] as const;

export function SwitchSection() {
  const [on, setOn] = useState<Record<string, boolean>>({ runOnPush: true, postResults: false, openPRs: true });
  const [last, setLast] = useState<string | null>(null);
  const state: Pairs = last
    ? [[last, String(on[last])], ["applied", "immediately"]]
    : Object.entries(on).map(([k, v]) => [k, String(v)]);

  return (
    <Section
      id="switch"
      title="Switch"
      lede="Use a switch for a setting that takes effect the moment it flips, with no Save button. The whole row is the target. If a change needs confirming, use a checkbox in a form instead."
    >
      <Spec name="settings rows, disabled" state={state} trackMotion>
        <div className="flex w-full max-w-[440px] flex-col gap-0.5">
          {SETTINGS.map(([key, label, description]) => (
            <SwitchChoice
              key={key}
              label={label}
              description={description}
              checked={on[key]}
              onCheckedChange={(c) => {
                setOn((s) => ({ ...s, [key]: c }));
                setLast(key);
              }}
            />
          ))}
          <SwitchChoice
            label="Merge when checks pass"
            description="Turn on branch protection for main to enable this."
            disabled
          />
        </div>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Slider
   ========================================================= */

const usd = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;
const EFFORT = ["Low", "Medium", "High"];
const hour = (h: number) => `${String(h).padStart(2, "0")}:00`;

export function SliderSection() {
  const [budget, setBudget] = useState(120);
  const [quiet, setQuiet] = useState<number[]>([22, 30]);
  const [creativity, setCreativity] = useState(70);
  const [volume, setVolume] = useState(62);
  const [effort, setEffort] = useState(1);
  const [committed, setCommitted] = useState<string | null>(null);
  const state: Pairs = [
    ["budget", `$${budget}`],
    ["quietHours", `${hour(quiet[0] % 24)}–${hour(quiet[1] % 24)}`],
    ["creativity", String(creativity)],
    ["volume", `${volume}%`],
    ["reasoning", EFFORT[effort]],
    ...(committed ? ([["committed", committed]] as Pairs) : []),
  ];

  return (
    <Section
      id="slider"
      title="Slider"
      lede="Use a slider when the rough position matters more than the exact number. The value is still printed beside the label. Arrows step, Shift+Arrow takes large steps; two thumbs make a range. The fill variant suits settings where the amount itself is the point; the scrubber puts its label and value inside the bar for one compact row."
    >
      <Spec name="single, range, disabled" state={state} layout="left" canvasClassName="gap-8 [&>*]:max-w-[340px]">
        <Slider
          label="Monthly budget"
          hint="The agent pauses at this amount. You'll get an email at 80%."
          value={budget}
          onValueChange={setBudget}
          onValueCommitted={(v) => setCommitted(`budget $${v}`)}
          min={0}
          max={500}
          step={5}
          largeStep={50}
          format={usd}
        />
        <Slider
          label="Quiet hours"
          hint="No scheduled runs start in this window. Times are in the workspace time zone."
          value={quiet}
          onValueChange={setQuiet}
          onValueCommitted={(v) => setCommitted(`quiet ${hour(v[0] % 24)}–${hour(v[1] % 24)}`)}
          min={12}
          max={36}
          step={1}
          largeStep={3}
          thumbLabels={["Quiet hours start", "Quiet hours end"]}
          renderValue={(_, v) => `${hour(v[0] % 24)} – ${hour(v[1] % 24)}`}
        />
        <Slider
          label="Parallel tool calls"
          hint="Fixed at 4 on your plan."
          value={4}
          onValueChange={() => {}}
          min={1}
          max={8}
          disabled
        />
      </Spec>
      <Spec name="scrubber variant: label and value inside the bar" state={state} layout="left" canvasClassName="gap-8 [&>*]:max-w-[340px]">
        <Slider
          variant="scrubber"
          label="Volume"
          value={volume}
          onValueChange={setVolume}
          onValueCommitted={(v) => setCommitted(`volume ${v}%`)}
          renderValue={(f) => `${f[0]}%`}
        />
        <Slider
          variant="scrubber"
          label="Reasoning"
          value={effort}
          onValueChange={setEffort}
          onValueCommitted={(v) => setCommitted(`reasoning ${EFFORT[v]}`)}
          min={0}
          max={EFFORT.length - 1}
          renderValue={(_, v) => EFFORT[v[0]]}
        />
        <Slider variant="scrubber" label="Parallel tool calls" hint="Fixed at 4 on your plan." value={4} onValueChange={() => {}} min={1} max={8} disabled />
      </Spec>
      <Spec name="fill variant: label and value above the bar" state={state} layout="left" canvasClassName="gap-8 [&>*]:max-w-[340px]">
        <Slider
          variant="fill"
          label="Creativity"
          hint="Higher values let the agent try less obvious approaches."
          value={creativity}
          onValueChange={setCreativity}
          onValueCommitted={(v) => setCommitted(`creativity ${v}`)}
          min={0}
          max={100}
          step={5}
          largeStep={20}
        />
        <Slider variant="fill" label="Parallel tool calls" hint="Fixed at 4 on your plan." value={4} onValueChange={() => {}} min={1} max={8} disabled />
      </Spec>
    </Section>
  );
}

/* =========================================================
   Number field
   ========================================================= */

const PLAN_LIMIT = 4;

export function NumberFieldSection() {
  const [retries, setRetries] = useState<number | null>(3);
  const [timeout, setTimeoutMin] = useState<number | null>(15);
  const [concurrent, setConcurrent] = useState<number | null>(6);
  const over = (concurrent ?? 0) > PLAN_LIMIT;

  return (
    <Section
      id="number-field"
      title="Number field"
      lede="Use a number field for a bounded number people adjust in steps. Arrows step and you can drag the label to scrub. Out-of-range values clamp on blur, so it never holds a number it won't accept."
    >
      <Spec
        name="stepper, unit format, over the limit"
        state={[
          ["retries", String(retries)],
          ["timeout", `${timeout}m`],
          ["concurrent", String(concurrent)],
          ["valid", String(!over)],
        ]}
        layout="left"
        canvasClassName="gap-8 [&>*]:max-w-[220px]"
      >
        <NumberField
          label="Retries"
          hint="0 to 10. Each retry waits twice as long."
          value={retries}
          onValueChange={setRetries}
          min={0}
          max={10}
        />
        <NumberField
          label="Timeout"
          hint="Stops the run after this long."
          value={timeout}
          onValueChange={setTimeoutMin}
          min={5}
          max={120}
          step={5}
          largeStep={30}
          unit="minutes"
          format={{ style: "unit", unit: "minute", unitDisplay: "short" }}
        />
        <NumberField
          label="Concurrent runs"
          hint={`Your plan allows up to ${PLAN_LIMIT}.`}
          error={over ? `Your plan allows up to ${PLAN_LIMIT}. Set ${PLAN_LIMIT} or fewer, or upgrade.` : undefined}
          value={concurrent}
          onValueChange={setConcurrent}
          min={1}
          max={16}
        />
      </Spec>
    </Section>
  );
}

/* =========================================================
   OTP field
   ========================================================= */

const CODE = "482913";

export function OtpFieldSection() {
  const [code, setCode] = useState("");
  const [checked, setChecked] = useState<"idle" | "verified" | "wrong">("idle");

  return (
    <Section
      id="otp-field"
      title="OTP field"
      lede="Use an OTP field for a short one-time code. There's one cell per character; typing advances and Backspace steps back. Paste the whole code and every cell fills at once."
    >
      <Spec
        name="numeric, paste, mismatch"
        state={[
          ["value", `"${code}"`],
          ["complete", String(code.length === CODE.length)],
          ["verified", checked === "idle" ? "pending" : String(checked === "verified")],
        ]}
        layout="stack"
        canvasClassName="gap-4"
      >
        <OTPField
          label="Verification code"
          hint="We sent a 6-digit code to priya@studio.dev. It expires in 10 minutes."
          error={checked === "wrong" ? "That code doesn't match. Check the newest email, or send a new code." : undefined}
          value={code}
          onValueChange={(v) => {
            setCode(v);
            if (checked !== "idle") setChecked("idle");
          }}
          onValueComplete={(v) => {
            const ok = v === CODE;
            setChecked(ok ? "verified" : "wrong");
            if (ok) toast("Device verified", { tone: "success" });
          }}
        />
        <p className="m-0 text-small text-ink-3">
          Try <code className="text-code text-ink-2">{CODE}</code>, or any other six digits to see the error.
        </p>
      </Spec>
    </Section>
  );
}

/* =========================================================
   Combobox
   ========================================================= */

const REPOS: SelectOption[] = [
  { value: "studio/agent-console", label: "studio/agent-console", description: "TypeScript · updated 2h ago", meta: "private" },
  { value: "studio/caret-ui", label: "studio/caret-ui", description: "TypeScript · updated today", meta: "private" },
  { value: "studio/docs-site", label: "studio/docs-site", description: "MDX · updated 3d ago", meta: "public" },
  { value: "studio/billing-service", label: "studio/billing-service", description: "Rust · updated 5d ago", meta: "private" },
  { value: "studio/lunch-picker", label: "studio/lunch-picker", description: "TypeScript · updated 3w ago", meta: "public" },
  { value: "priya/dotfiles", label: "priya/dotfiles", description: "Shell · updated 2mo ago", meta: "public" },
];

const TOOLS: SelectOption[] = [
  { value: "browser", label: "Headless browser", meta: "web" },
  { value: "vectors", label: "Vector search", meta: "data" },
  { value: "sql", label: "SQL database", meta: "data" },
  { value: "email", label: "Send email", meta: "comms" },
  { value: "slack", label: "Slack", meta: "comms" },
  { value: "github", label: "GitHub", meta: "code" },
  { value: "shell", label: "Shell", meta: "code" },
  { value: "calendar", label: "Calendar", meta: "comms" },
];

export function ComboboxSection() {
  const [repo, setRepo] = useState<string | null>("studio/agent-console");
  const [tools, setTools] = useState<string[]>(["browser", "github"]);
  const [open, setOpen] = useState(false);

  return (
    <Section
      id="combobox"
      title="Combobox"
      lede="Use a combobox when a select has too many options to scan: type to filter. In the multiple form each pick becomes a chip, and Backspace at the start of the input removes the last one."
    >
      <Spec
        name="single with descriptions, multiple with chips"
        state={[["repo", repo ? `"${repo}"` : "null"], ["tools", JSON.stringify(tools)], ["open", String(open)]]}
        canvasClassName="items-start min-h-[220px] gap-8 [&>*]:max-w-[340px]"
      >
        <Combobox
          label="Repository"
          hint="The agent reads and writes only this repository."
          placeholder="Search repositories"
          emptyText="No repository matches. Check the owner, or connect another account."
          options={REPOS}
          value={repo}
          onValueChange={setRepo}
          onOpenChange={setOpen}
        />
        <MultiCombobox
          label="Tools"
          hint="Add only what this agent needs."
          placeholder="Add a tool"
          emptyText="No tool by that name. Browse all tools in Settings."
          options={TOOLS}
          value={tools}
          onValueChange={setTools}
          onOpenChange={setOpen}
        />
      </Spec>
    </Section>
  );
}

/* =========================================================
   Autocomplete
   ========================================================= */

const BRANCHES = ["main", "feat/theme-toggle", "feat/menu-keyboard", "fix/dialog-focus", "release/0.2", "release/0.1"];
const COMMANDS = [
  { value: "pnpm test", description: "Unit tests", meta: "12s" },
  { value: "pnpm test --watch", description: "Re-run on change" },
  { value: "pnpm lint", description: "ESLint + typecheck", meta: "8s" },
  { value: "pnpm build", description: "Production build", meta: "18s" },
  { value: "pnpm dev", description: "Start the dev server" },
];

export function AutocompleteSection() {
  const [branch, setBranch] = useState("feat/");
  const [command, setCommand] = useState("");
  const isNew = !!branch && !BRANCHES.includes(branch);

  return (
    <Section
      id="autocomplete"
      title="Autocomplete"
      lede="Use an autocomplete for free text that has common answers. Whatever you type is the value; the list only offers to finish it. When the value must be one of the options, use a combobox."
    >
      <Spec
        name="suggestions, completes on arrow keys"
        state={[["branch", `"${branch}"`], ["new", String(isNew)], ["command", `"${command}"`]]}
        canvasClassName="items-start min-h-[220px] gap-8 [&>*]:max-w-[340px]"
      >
        <Autocomplete
          label="Branch"
          hint={isNew ? `Creates ${branch || "a new branch"} from main.` : "Pick a branch, or type a new name to create one."}
          placeholder="e.g. feat/search"
          lead={<GitBranchIcon />}
          value={branch}
          onValueChange={setBranch}
          suggestions={BRANCHES}
        />
        <Autocomplete
          label="Command"
          hint="Runs in the agent's sandbox, from the repository root."
          placeholder="pnpm test"
          lead={<TerminalIcon />}
          mode="both"
          emptyText="No saved command starts like that. It will run as typed."
          value={command}
          onValueChange={setCommand}
          suggestions={COMMANDS}
        />
      </Spec>
    </Section>
  );
}

/* =========================================================
   Form
   ========================================================= */

function validateName(value: unknown) {
  const v = String(value ?? "");
  if (!v) return "Give the run a name.";
  if (v.length < 3) return "Use at least 3 characters.";
  if (!/^[a-z0-9-]+$/.test(v)) return "Use lowercase letters, numbers and dashes only.";
  return null;
}

function validateCron(value: unknown) {
  const v = String(value ?? "").trim();
  if (!v) return "Add a schedule, like 0 9 * * 1-5 for 9:00 on weekdays.";
  if (v.split(/\s+/).length !== 5) return "Use five fields: minute, hour, day, month, weekday.";
  return null;
}

export function FormSection() {
  const [status, setStatus] = useState<Pairs>([["status", "idle"]]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [minutes, setMinutes] = useState<number | null>(30);
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  return (
    <Section
      id="form"
      title="Form"
      lede="Use a form when fields are submitted together. Validation waits for submit, then moves focus to the first invalid field and re-checks each one as you fix it. Server errors land under their fields too."
    >
      <Spec name="submit-time validation, server error, focus first invalid" state={status}>
        <Form
          ref={formRef}
          className="max-w-[420px]"
          errors={errors}
          onFormSubmit={(values) => {
            submitted.current = true;
            if (values.name === "nightly-build") {
              setErrors({ name: "A run named nightly-build already exists. Pick another name." });
              setStatus([["status", "rejected"], ["server", "name taken"]]);
              return;
            }
            setErrors({});
            setStatus([["status", "scheduled"], ["name", `"${values.name}"`], ["cron", `"${values.cron}"`]]);
            toast(`Scheduled ${values.name}`, { tone: "success" });
          }}
        >
          <Field name="name" label="Run name" hint="At least 3 characters: lowercase letters, numbers and dashes." validate={validateName}>
            <Input autoComplete="off" spellCheck={false} placeholder="nightly-report" />
          </Field>
          <Field name="cron" label="Schedule" hint="Cron syntax, in the workspace time zone." validate={validateCron}>
            <Input autoComplete="off" spellCheck={false} placeholder="0 9 * * 1-5" className="[&_input]:mono" />
          </Field>
          <NumberField
            name="maxMinutes"
            label="Stop after"
            unit="minutes"
            value={minutes}
            onValueChange={setMinutes}
            min={5}
            max={120}
            step={5}
            format={{ style: "unit", unit: "minute", unitDisplay: "short" }}
          />
          <FormActions>
            <Button variant="ghost" type="reset" onClick={() => setStatus([["status", "idle"]])}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              kbd="↵"
              onClick={() => {
                submitted.current = false;
                setTimeout(() => {
                  if (submitted.current) return;
                  const invalid = formRef.current?.querySelectorAll("[data-invalid][class*='group/field']").length ?? 0;
                  if (invalid) setStatus([["status", "blocked"], ["invalid", String(invalid)], ["focused", "first invalid"]]);
                }, 0);
              }}
            >
              Schedule run
            </Button>
          </FormActions>
        </Form>
      </Spec>
    </Section>
  );
}

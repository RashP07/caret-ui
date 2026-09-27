import { MicrophoneIcon, PlusIcon, RobotIcon } from "@phosphor-icons/react";
import { useContext, useState } from "react";
import {
  Avatar,
  Badge,
  Composer,
  ContextMeter,
  Diffstat,
  IconButton,
  Messages,
  NavGroup,
  NavItem,
  Select,
  Threads,
  toast,
} from "@/components";
import { AgentWorkspace } from "@/templates/agent-workspace";
import { SeedConversation } from "@/templates/seed-conversation";
import { MODEL_GROUPS, STEPS } from "@/templates/workspace-data";
import { PageModeContext, Section, Spec, type Pairs } from "./spec";

export function ChatSection() {
  const [chat, setChat] = useState<Pairs>([["trace", "collapsed"]]);
  const [composer, setComposer] = useState<Pairs>([["chars", "0"], ["canSend", "false"]]);
  const [model, setModel] = useState("Balanced");
  const [ctx, setCtx] = useState(24);
  const [thread, setThread] = useState("theme toggle");

  return (
    <Section
      id="chat"
      title="Chat"
      lede="Use these parts to build an agent interface. The trace shows what the agent did before it answered; code takes its syntax colors from tokens, so it reads in every theme and mode. Send becomes Stop while the agent works."
    >
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start gap-4 max-[1180px]:grid-cols-1">
        <Spec name="message, trace, code block, actions" state={chat} layout="block" canvasClassName="px-6 py-8">
          <Messages>
            <SeedConversation
              onTraceChange={(open) => setChat([["trace", open ? "expanded" : "collapsed"], ["steps", String(STEPS.length)]])}
              onVote={(v) => setChat([["feedback", v ?? "none"]])}
            />
          </Messages>
        </Spec>
        <div className="flex flex-col gap-4">
          <Spec name="composer" state={composer} layout="stack" className="m-0" canvasClassName="min-h-0 px-6 py-8">
            <Composer
              className="w-full"
              onChange={(t) => setComposer([["chars", String(t.length)], ["canSend", String(!!t.trim())]])}
              onSend={(t) => {
                toast("Sent");
                setComposer([["sent", `"${t.slice(0, 40)}"`]]);
              }}
              tools={<IconButton label="Attach files" icon={<PlusIcon />} />}
              controls={
                <>
                  <Select label="Model" hideLabel density="compact" value={model} onValueChange={setModel} groups={MODEL_GROUPS} side="top" align="end" menuWidth={260} />
                  <IconButton label="Dictate" kbd="⌥ Space" icon={<MicrophoneIcon />} />
                </>
              }
            />
          </Spec>
          <Spec
            name="avatar, meter, status, threads"
            state={[["context", `${ctx}%`], ...(ctx !== 24 ? ([["hot", String(ctx >= 85)]] as Pairs) : [])]}
            className="m-0"
            layout="stack"
            canvasClassName="min-h-0 px-6 py-8"
          >
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Avatar initials="PR" />
              <Avatar initials="A" tone="soft" round />
              <ContextMeter value={ctx} hotText="Older messages will be summarized." onClick={() => setCtx((c) => ({ 24: 57, 57: 91, 91: 24 })[c] ?? 24)} />
              <Diffstat added={156} removed={23} />
              <Badge tone="live" dot>
                Working
              </Badge>
              <Badge tone="ok" dot>
                Build passed
              </Badge>
              <Badge tone="warning" dot>
                Waiting for you
              </Badge>
            </div>
            <div className="w-full max-w-[260px]">
              <NavGroup>
                <NavItem icon={<RobotIcon />}>Automations</NavItem>
                <Threads>
                  <NavItem live current={thread === "theme toggle"} meta="now" onClick={() => setThread("theme toggle")}>
                    theme toggle
                  </NavItem>
                  <NavItem current={thread === "select refactor"} meta="18h" onClick={() => setThread("select refactor")}>
                    select refactor
                  </NavItem>
                </Threads>
              </NavGroup>
            </div>
          </Spec>
        </div>
      </div>
    </Section>
  );
}

export function WorkspaceSection() {
  // As its own page the template has the full width; in a long page it bleeds past the text column.
  const page = useContext(PageModeContext);
  return (
    <Section
      id="workspace"
      title="Agent workspace"
      lede="A full working surface built only from Caret parts: threads, the conversation, and the agent's changes. Send a message to watch a run, or pick a file to read its diff. The sun and moon switch only this template's mode."
    >
      {/* Bleed wider than the text column, up to 1400px. Margin, not transform, so full screen can use position: fixed. */}
      <div className={page ? "w-full" : "ml-[calc((100%-var(--w))/2)] w-(--w) [--w:min(1400px,calc(100vw-252px-72px))] max-[860px]:[--w:calc(100vw-32px)]"}>
        <AgentWorkspace className="h-[780px] max-[860px]:h-[720px]" />
      </div>
    </Section>
  );
}

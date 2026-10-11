import { useContext, type ReactNode } from "react";
import { RunDetail } from "@/templates/run-detail";
import { Settings } from "@/templates/settings";
import { PageModeContext, Section } from "./spec";

/** As its own page a template has the full width; in a long page it bleeds past the text column. */
function Bleed({ children }: { children: ReactNode }) {
  const page = useContext(PageModeContext);
  return (
    <div className={page ? "w-full" : "ml-[calc((100%-var(--w))/2)] w-(--w) [--w:min(1400px,calc(100vw-252px-72px))] max-[860px]:[--w:calc(100vw-32px)]"}>
      {children}
    </div>
  );
}

export function SettingsSection() {
  return (
    <Section
      id="settings"
      title="Settings"
      lede="A workspace's settings, built only from Caret parts: a form that saves, switches that apply at once, API keys you create and revoke, usage against its limits and a danger zone. Narrow it and the section list becomes a picker."
    >
      <Bleed>
        <Settings className="h-[780px] max-[860px]:h-[720px]" />
      </Bleed>
    </Section>
  );
}

export function RunDetailSection() {
  return (
    <Section
      id="run-detail"
      title="Run detail"
      lede="One agent run, from clone to deploy: its steps on a timeline, its output as it arrives, the files it changed and its properties beside them. It starts running when it opens; cancel it, or run it again."
    >
      <Bleed>
        <RunDetail className="h-[780px] max-[860px]:h-[720px]" />
      </Bleed>
    </Section>
  );
}

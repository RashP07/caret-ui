import { useState } from "react";
import { Badge, Checks, Code, diffStatOf, MsgActions, MsgAgent, MsgUser, Trace, type Vote } from "@/components";
import { FILES, STEPS, USER_1 } from "./workspace-data";

const REPLY_TEXT =
  "Done. Every color token now holds its light and dark value in light-dark(), and the new toggle sets data-mode on the root element from one place and remembers the choice.";

/** The finished run both the chat specimen and the workspace open with. Composition only. */
export function SeedConversation({
  onTraceChange,
  onVote,
}: {
  onTraceChange?: (open: boolean) => void;
  onVote?: (vote: Vote) => void;
}) {
  const [vote, setVote] = useState<Vote>(null);
  const file = FILES[0];
  return (
    <>
      <MsgUser>{USER_1}</MsgUser>
      <MsgAgent>
        <Trace steps={STEPS} summary="Worked for 41s" onOpenChange={onTraceChange} />
        <p>
          Done. Every color token now holds its light and dark value in <code>light-dark()</code>, and the new toggle
          sets <code>data-mode</code> on the root element from one place and remembers the choice:
        </p>
        <Code
          lang={file.lang}
          name={file.path.split("/").pop()!}
          lines={file.lines.slice(14, 20).map((l) => l[1])}
          start={14}
          stat={diffStatOf(file.lines)}
        />
        <Checks>
          <Badge tone="ok" dot>
            Lint passed
          </Badge>
          <Badge tone="ok" dot>
            Build passed in 18s
          </Badge>
        </Checks>
        <MsgActions
          vote={vote}
          onVote={(v) => {
            setVote(v);
            onVote?.(v);
          }}
          copyText={() => REPLY_TEXT}
        />
      </MsgAgent>
    </>
  );
}

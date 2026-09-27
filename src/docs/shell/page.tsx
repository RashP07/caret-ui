import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Card, CardBody, CardText, CardTitle, Code, Hint } from "@/components";
import { cn } from "@/lib/cn";
import { neighbours, type DocPage } from "../registry";
import { PageHeading, PageModeContext } from "../spec";
import { pageLink } from "./links";

function importLines(names: string[]): string[] {
  if (names.join(", ").length <= 48) return [`import { ${names.join(", ")} } from "@/components";`];
  return ["import {", ...names.map((n) => `  ${n},`), '} from "@/components";'];
}

/** How to use it: the import, and the Base UI part underneath. */
function Usage({ page }: { page: DocPage }) {
  if (!page.imports) return null;
  return (
    <section>
      <PageHeading>Usage</PageHeading>
      <Code lang="TSX" name={`${page.slug}.tsx`} lines={importLines(page.imports)} />
      {page.baseUi && (
        <Hint className="mt-3">
          <span>
            Built on Base UI's{" "}
            <a href={`https://base-ui.com/react/components/${page.baseUi}`} target="_blank" rel="noreferrer" className="link">
              {page.baseUi.replace(/-/g, " ")}
            </a>
            , so keyboard, focus and ARIA come from the primitive. Caret adds the look, the states and the motion.
          </span>
        </Hint>
      )}
    </section>
  );
}

function NeighbourCard({ page, dir }: { page: DocPage; dir: "prev" | "next" }) {
  return (
    <Link {...pageLink(page)} className={cn("block no-underline", dir === "next" && "col-start-2 max-[600px]:col-start-1")}>
      <Card link tabIndex={-1} className="h-full">
        <CardBody className={cn("flex flex-col gap-1.5", dir === "next" && "items-end text-right")}>
          <Hint className="items-center">
            {dir === "prev" && <ArrowLeftIcon size={14} aria-hidden />}
            {dir === "prev" ? "Previous" : "Next"}
            {dir === "next" && <ArrowRightIcon size={14} aria-hidden />}
          </Hint>
          <CardTitle>{page.title}</CardTitle>
          <CardText>{page.description}</CardText>
        </CardBody>
      </Card>
    </Link>
  );
}

function PrevNext({ page }: { page: DocPage }) {
  const { prev, next } = neighbours(page);
  return (
    <nav aria-label="More pages" className="mt-16 grid grid-cols-2 gap-4 border-t border-line pt-8 max-[600px]:grid-cols-1">
      {prev && <NeighbourCard page={prev} dir="prev" />}
      {next && <NeighbourCard page={next} dir="next" />}
    </nav>
  );
}

/** A registry page, rendered as a routed page: body (in page mode), usage, prev/next. */
export function DocPageView({ page }: { page: DocPage }) {
  const Body = page.load();
  useEffect(() => {
    document.title = `${page.title} — Caret`;
  }, [page]);
  return (
    <>
      <PageModeContext.Provider value={true}>
        <Body />
      </PageModeContext.Provider>
      <Usage page={page} />
      <PrevNext page={page} />
    </>
  );
}

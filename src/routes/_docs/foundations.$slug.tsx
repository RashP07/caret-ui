import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "@/docs/shell/not-found";
import { DocPageView } from "@/docs/shell/page";
import { findPage } from "@/docs/registry";

export const Route = createFileRoute("/_docs/foundations/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  const page = findPage("foundation", slug);
  return page ? <DocPageView key={slug} page={page} /> : <NotFound />;
}

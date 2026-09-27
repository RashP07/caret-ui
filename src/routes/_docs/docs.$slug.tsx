import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "@/docs/shell/not-found";
import { DocPageView } from "@/docs/shell/page";
import { findPage } from "@/docs/registry";

export const Route = createFileRoute("/_docs/docs/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  const page = findPage("doc", slug);
  return page ? <DocPageView key={slug} page={page} /> : <NotFound />;
}

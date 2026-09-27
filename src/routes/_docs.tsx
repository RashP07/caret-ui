import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DocsLayout } from "@/docs/shell/layout";

/** Pathless layout: every docs page shares the sidebar, top bar and "On this page". */
export const Route = createFileRoute("/_docs")({
  component: () => (
    <DocsLayout>
      <Outlet />
    </DocsLayout>
  ),
});

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { DocsRoot } from "@/docs/shell/root";
import { NotFound } from "@/docs/shell/not-found";

export const Route = createRootRoute({
  component: () => (
    <DocsRoot>
      <Outlet />
    </DocsRoot>
  ),
  notFoundComponent: NotFound,
});

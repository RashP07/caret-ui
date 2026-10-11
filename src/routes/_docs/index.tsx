import { createFileRoute } from "@tanstack/react-router";
import { ShowcasePage } from "@/docs/shell/showcase-page";

/** The home page lives in the docs frame: the sidebar is the way in, the page shows the parts. */
export const Route = createFileRoute("/_docs/")({ component: ShowcasePage });

import { createFileRoute } from "@tanstack/react-router";
import { ComponentsIndex } from "@/docs/shell/components-index";

export const Route = createFileRoute("/_docs/components/")({ component: ComponentsIndex });

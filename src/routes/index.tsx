import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/docs/shell/home";

export const Route = createFileRoute("/")({ component: Home });

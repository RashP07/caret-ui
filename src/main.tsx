import { IconContext } from "@phosphor-icons/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider, TooltipProvider } from "@/components";
import { initAnalytics } from "@/lib/analytics";
import { settle } from "@/lib/motion";
import { routeTree } from "./routeTree.gen";
import "@/styles/index.css";

initAnalytics();

const router = createRouter({
  routeTree,
  // Hovering a link starts loading its page chunk, so navigation feels instant.
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* reducedMotion="user": layout animations become instant when the OS asks for less motion. */}
    <MotionConfig reducedMotion="user" transition={settle}>
      {/* Phosphor at 16px, regular weight: matches the 1.3–1.6px strokes of the drafting set. */}
      <IconContext.Provider value={{ size: 16, weight: "regular" }}>
        <TooltipProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </TooltipProvider>
      </IconContext.Provider>
    </MotionConfig>
  </StrictMode>,
);

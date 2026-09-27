import { Code, Hint } from "@/components";
import { PageHeading, Section } from "../spec";

/** Installation: the stack, the tokens, the providers. */
export default function Installation() {
  return (
    <Section
      id="installation"
      title="Installation"
      lede="Caret is source you own: React 19, Tailwind CSS v4 and Base UI, with Phosphor icons and Motion. Copy the tokens and components into your app, mount four providers at the root, and every component works in every theme, light and dark."
    >
      <PageHeading>1. Install the stack</PageHeading>
      <Code
        lang="SH"
        name="terminal"
        lines={[
          "pnpm add react react-dom @base-ui/react @phosphor-icons/react motion clsx tailwind-merge",
          "pnpm add -D tailwindcss @tailwindcss/vite",
        ]}
      />

      <PageHeading>2. Add the tokens</PageHeading>
      <p className="m-0 mb-3 max-w-[64ch] text-body text-pretty text-ink-2">
        Copy <code>src/styles</code>. <code>tokens.css</code> holds every theme as a complete set of the same names;{" "}
        <code>index.css</code> maps them into Tailwind with <code>@theme inline</code>, so utilities read the token at the
        element and a scoped <code>data-theme</code> just works. <code>tokens.css</code> is generated: retune a theme in{" "}
        <code>scripts/themes/</code> and run <code>npm run tokens</code>, which fails if any pairing drops below its
        contrast target.
      </p>
      <Code lang="CSS" name="src/styles/index.css" lines={['@import "tailwindcss";', '@import "./tokens.css";', '@import "./components.css";']} />

      <PageHeading>3. Mount the providers</PageHeading>
      <Code
        lang="TSX"
        name="src/main.tsx"
        lines={[
          'import { IconContext } from "@phosphor-icons/react";',
          'import { MotionConfig } from "motion/react";',
          'import { ToastProvider, TooltipProvider } from "@/components";',
          'import { settle } from "@/lib/motion";',
          "",
          "<MotionConfig reducedMotion=\"user\" transition={settle}>",
          '  <IconContext.Provider value={{ size: 16, weight: "regular" }}>',
          "    <TooltipProvider>",
          "      <ToastProvider>",
          "        <App />",
          "      </ToastProvider>",
          "    </TooltipProvider>",
          "  </IconContext.Provider>",
          "</MotionConfig>",
        ]}
      />
      <Hint className="mt-3">
        Keyboard focus is a plain <code>:focus-visible</code> ring from the base styles; if the focused element is hidden
        or inset, mark the visible box around it <code>data-focus-target</code>. Wrap the app root in{" "}
        <code>isolation: isolate</code> so Base UI popups always stack above it.
      </Hint>

      <PageHeading>4. Use a component</PageHeading>
      <Code
        lang="TSX"
        name="deploy.tsx"
        lines={[
          'import { Button } from "@/components";',
          'import { RocketLaunchIcon } from "@phosphor-icons/react";',
          "",
          "export function Deploy() {",
          '  return <Button variant="primary" icon={<RocketLaunchIcon />} kbd="⌘↵">Deploy agent</Button>;',
          "}",
        ]}
      />

      <PageHeading>5. Pick a theme</PageHeading>
      <p className="m-0 mb-3 max-w-[64ch] text-body text-pretty text-ink-2">
        <code>data-theme</code> picks the palette (neutral, zinc, stone, slate, indigo, teal, sand, contrast) and <code>data-mode</code> picks
        light or dark. Leave <code>data-mode</code> off to follow the OS. Both work on <code>html</code> for the page, or on
        any element to scope one part of it.
      </p>
      <Code
        lang="HTML"
        name="index.html"
        lines={['<html data-theme="slate">', '  <aside data-mode="dark">…</aside>', '  <section data-theme="contrast" data-mode="light">…</section>', "</html>"]}
      />
    </Section>
  );
}

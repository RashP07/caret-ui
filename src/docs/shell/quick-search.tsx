import { BookOpenIcon, CubeIcon, PaletteIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { CommandPalette, type CommandGroup } from "@/components";
import { GROUPS, type DocPage } from "../registry";
import { pageLink } from "./links";

const ICON: Record<DocPage["kind"], React.ReactNode> = {
  doc: <BookOpenIcon />,
  foundation: <PaletteIcon />,
  component: <CubeIcon />,
  template: <SquaresFourIcon />,
};

/** Quick Search (⌘K, /): every docs page, from the registry, in the system CommandPalette. */
export function QuickSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const groups: CommandGroup[] = GROUPS.map((g) => ({
    label: g.name,
    items: g.pages.map((p) => ({
      value: `${p.kind}/${p.slug}`,
      label: p.title,
      description: p.description,
      icon: ICON[p.kind],
      keywords: [p.slug, p.group, ...(p.imports ?? [])],
      onSelect: () => navigate(pageLink(p)),
    })),
  }));
  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      groups={groups}
      label="Search the docs"
      placeholder="Search components, tokens and guides"
      emptyText="Nothing by that name. Try a component (select), a token (radius) or an export (MenuItem)."
      footer="Caret docs"
    />
  );
}
